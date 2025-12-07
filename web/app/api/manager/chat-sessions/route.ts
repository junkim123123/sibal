/**
 * Manager Chat Sessions API Endpoint
 * 
 * 매니저의 채팅 세션을 로드하거나 생성합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');
    const managerId = searchParams.get('manager_id');

    if (!projectId || !managerId) {
      return NextResponse.json(
        { ok: false, error: 'Missing project_id or manager_id' },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== managerId) {
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

    // 기존 세션 확인 (매니저가 할당된 세션)
    const { data: existingSession, error: sessionError } = await adminClient
      .from('chat_sessions')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('manager_id', managerId)
      .in('status', ['open', 'in_progress'])
      .maybeSingle();

    if (sessionError) {
      console.error('[Manager Chat Sessions API] Error loading session:', sessionError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load session' },
        { status: 500 }
      );
    }

    if (existingSession) {
      return NextResponse.json({
        ok: true,
        session: {
          id: existingSession.id,
          status: existingSession.status,
        },
      });
    }

    // 프로젝트 정보 가져오기 (user_id 필요)
    const { data: projectData, error: projectError } = await adminClient
      .from('projects')
      .select('user_id, manager_id')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      console.error('[Manager Chat Sessions API] Project not found:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 매니저가 할당되었는지 확인
    if (projectData.manager_id !== managerId) {
      return NextResponse.json(
        { ok: false, error: 'Manager not assigned to this project' },
        { status: 403 }
      );
    }

    // 세션이 없으면 생성 (매니저 ID 할당)
    const { data: newSession, error: createError } = await adminClient
      .from('chat_sessions')
      .insert({
        project_id: projectId,
        user_id: projectData.user_id,
        manager_id: managerId,
        status: 'in_progress',
      })
      .select()
      .single();

    if (createError || !newSession) {
      console.error('[Manager Chat Sessions API] Failed to create session:', createError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      session: {
        id: newSession.id,
        status: newSession.status,
      },
    });
  } catch (error) {
    console.error('[Manager Chat Sessions API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
