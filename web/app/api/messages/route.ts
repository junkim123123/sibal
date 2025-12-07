/**
 * Messages API Endpoint
 * 
 * 채팅 메시지 저장 및 조회를 위한 API 엔드포인트
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/messages
 * 새 메시지를 저장합니다.
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
    const { project_id, role, content } = body;

    // 입력 검증
    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'project_id is required' },
        { status: 400 }
      );
    }

    if (!role || !['user', 'ai'].includes(role)) {
      return NextResponse.json(
        { ok: false, error: 'role must be "user" or "ai"' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'content is required' },
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

    // 메시지 저장
    const { data: message, error: messageError } = await adminClient
      .from('messages')
      .insert({
        project_id,
        role,
        content: content.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error('[Messages API] Failed to create message:', messageError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Messages API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages?project_id=...
 * 프로젝트의 모든 메시지를 조회합니다.
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

    // URL에서 project_id 추출
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get('project_id');

    if (!project_id) {
      return NextResponse.json(
        { ok: false, error: 'project_id query parameter is required' },
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

    // 메시지 목록 조회
    const { data: messages, error: messagesError } = await adminClient
      .from('messages')
      .select('id, role, content, timestamp')
      .eq('project_id', project_id)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('[Messages API] Failed to fetch messages:', messagesError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        messages: messages || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Messages API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

