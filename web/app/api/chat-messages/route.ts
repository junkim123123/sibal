/**
 * Chat Messages API Endpoint
 * 
 * 채팅 메시지 저장 및 중요 파일 업로드 시 이메일 알림
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendImportantDocumentEmail, sendNewMessageEmail } from '@/lib/email/sender';

// 중요 문서 타입 정의
const IMPORTANT_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * POST /api/chat-messages
 * 새 채팅 메시지를 저장합니다.
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
    const { session_id, sender_id, role, content, file_url, file_type, file_name } = body;

    // 입력 검증
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'session_id is required' },
        { status: 400 }
      );
    }

    if (!role || !['user', 'manager'].includes(role)) {
      return NextResponse.json(
        { ok: false, error: 'role must be "user" or "manager"' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'content is required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 세션 및 프로젝트 정보 확인
    const { data: session, error: sessionError } = await adminClient
      .from('chat_sessions')
      .select(`
        id,
        project_id,
        user_id,
        manager_id,
        projects!inner(
          id,
          name,
          user_id,
          profiles!projects_user_id_fkey(email)
        )
      `)
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { ok: false, error: 'Chat session not found' },
        { status: 404 }
      );
    }

    // 권한 확인 (사용자 또는 매니저)
    const isUser = session.user_id === user.id;
    const isManager = session.manager_id === user.id;

    if (!isUser && !isManager) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 메시지 저장
    const { data: message, error: messageError } = await adminClient
      .from('chat_messages')
      .insert({
        session_id,
        sender_id: sender_id || user.id,
        role,
        content: content.trim(),
        file_url: file_url || null,
        file_type: file_type || null,
        file_name: file_name || null,
      })
      .select()
      .single();

    if (messageError) {
      console.error('[Chat Messages API] Failed to create message:', messageError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    const project = session.projects;
    const userEmail = project?.profiles?.email;

    // 매니저가 클라이언트에게 메시지를 보낸 경우
    if (role === 'manager' && userEmail) {
      // 중요 파일 업로드 시 이메일 알림 발송
      if (file_url && file_type && IMPORTANT_DOCUMENT_TYPES.includes(file_type)) {
        try {
          // 파일 타입을 사용자 친화적인 이름으로 변환
          const documentTypeMap: Record<string, string> = {
            'application/pdf': 'PDF Document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
            'application/msword': 'Word Document',
            'application/vnd.ms-excel': 'Excel Document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Document',
          };

          const documentType = documentTypeMap[file_type] || file_name || 'Document';

          await sendImportantDocumentEmail(
            project.id,
            userEmail,
            project.name,
            documentType
          );
        } catch (emailError) {
          console.error('[Chat Messages API] Failed to send important document email:', emailError);
        }
      } else {
        // 일반 메시지 알림 (파일이 아닌 경우)
        try {
          // 매니저 정보 조회
          const { data: managerProfile } = await adminClient
            .from('profiles')
            .select('name, email')
            .eq('id', user.id)
            .single();

          const managerName = managerProfile?.name || managerProfile?.email?.split('@')[0] || 'Your Manager';

          await sendNewMessageEmail(
            project.id,
            userEmail,
            project.name,
            managerName,
            content.trim()
          );
        } catch (emailError) {
          console.error('[Chat Messages API] Failed to send new message email:', emailError);
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: message.id,
          role: message.role,
          content: message.content,
          file_url: message.file_url,
          file_type: message.file_type,
          file_name: message.file_name,
          created_at: message.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Chat Messages API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

