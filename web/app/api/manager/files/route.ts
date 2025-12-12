/**
 * Manager Files API Endpoint
 * 
 * 매니저가 할당된 프로젝트의 공유 파일 목록을 제공합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Missing session_id' },
        { status: 400 }
      );
    }

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

    // 통합 Admin 권한
    const isManager = profile?.is_manager === true;
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isManager && !isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 채팅 세션의 파일이 포함된 메시지 조회
    const { data: messages, error: messagesError } = await adminClient
      .from('chat_messages')
      .select(`
        id,
        file_url,
        file_name,
        file_type,
        created_at,
        sender_id,
        profiles!chat_messages_sender_id_fkey(
          name,
          email
        )
      `)
      .eq('session_id', sessionId)
      .not('file_url', 'is', null)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('[Manager Files API] Error loading files:', messagesError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load files' },
        { status: 500 }
      );
    }

    const files = (messages || []).map((msg: any) => ({
      id: msg.id,
      file_url: msg.file_url,
      file_name: msg.file_name || 'Untitled',
      file_type: msg.file_type || '',
      created_at: msg.created_at,
      sender_name: msg.profiles?.name || msg.profiles?.email || 'Unknown',
    }));

    return NextResponse.json({
      ok: true,
      files,
    });
  } catch (error) {
    console.error('[Manager Files API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
