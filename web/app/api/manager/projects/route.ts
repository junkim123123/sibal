/**
 * Manager Projects API Endpoint
 * 
 * 매니저가 할당된 프로젝트 목록을 제공합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 매니저 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_manager, role')
      .eq('id', user.id)
      .single();

    if (!profile?.is_manager && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 매니저가 할당된 프로젝트들 로드
    const { data: projects, error: projectsError } = await adminClient
      .from('projects')
      .select(`
        id,
        name,
        status,
        user_id,
        created_at,
        updated_at,
        profiles!projects_user_id_fkey(
          name,
          email
        )
      `)
      .eq('manager_id', user.id)
      .in('status', ['active', 'in_progress'])
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('[Manager Projects API] Error loading projects:', projectsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load projects' },
        { status: 500 }
      );
    }

    // 각 프로젝트의 채팅 세션 및 읽지 않은 메시지 수 조회
    const projectsWithUnread = await Promise.all(
      (projects || []).map(async (project: any) => {
        // 채팅 세션 찾기
        const { data: session } = await adminClient
          .from('chat_sessions')
          .select('id')
          .eq('project_id', project.id)
          .eq('manager_id', user.id)
          .maybeSingle();

        let unreadCount = 0;
        let lastMessageAt: string | null = null;

        if (session) {
          // 읽지 않은 메시지 수
          const { count } = await adminClient
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          unreadCount = count || 0;

          // 최근 메시지 시간
          const { data: lastMessage } = await adminClient
            .from('chat_messages')
            .select('created_at')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          lastMessageAt = lastMessage?.created_at || null;
        }

        return {
          id: project.id,
          name: project.name,
          client_name: project.profiles?.name || project.profiles?.email || 'Client',
          client_email: project.profiles?.email || '',
          status: project.status,
          unread_count: unreadCount,
          last_message_at: lastMessageAt,
          created_at: project.created_at,
          updated_at: project.updated_at,
        };
      })
    );

    console.log('[Manager Projects API] Loaded projects for manager:', {
      managerId: user.id,
      count: projectsWithUnread.length,
    });

    return NextResponse.json({
      ok: true,
      projects: projectsWithUnread,
    });
  } catch (error) {
    console.error('[Manager Projects API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
