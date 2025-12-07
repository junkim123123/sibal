/**
 * Chat Sessions API Endpoint
 * 
 * 채팅 세션 생성 및 조회를 위한 API 엔드포인트
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/chat-sessions
 * 새로운 채팅 세션을 생성합니다.
 */
export async function POST(req: Request) {
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

    const body = await req.json();
    const { project_id } = body;

    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'project_id is required' },
        { status: 400 }
      );
    }

    // 프로젝트 소유권 확인
    const adminClient = getAdminClient();
    
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, user_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 기존 세션이 있는지 확인
    const { data: existingSession } = await adminClient
      .from('chat_sessions')
      .select('id, status')
      .eq('project_id', project_id)
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress'])
      .single();

    if (existingSession) {
      // 기존 세션이 있으면 반환
      return NextResponse.json(
        {
          ok: true,
          session: existingSession,
          is_new: false,
        },
        { status: 200 }
      );
    }

    // 새 채팅 세션 생성
    const { data: session, error: sessionError } = await adminClient
      .from('chat_sessions')
      .insert({
        project_id: project_id,
        user_id: user.id,
        status: 'open',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[Chat Sessions API] Failed to create session:', sessionError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create chat session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        session: session,
        is_new: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Chat Sessions API] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat-sessions
 * 사용자의 채팅 세션 목록을 조회합니다.
 */
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

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    const adminClient = getAdminClient();

    let query = adminClient
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: sessions, error: sessionsError } = await query.order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('[Chat Sessions API] Failed to fetch sessions:', sessionsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch chat sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        sessions: sessions || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Chat Sessions API] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

