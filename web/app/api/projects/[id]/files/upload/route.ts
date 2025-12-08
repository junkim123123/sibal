/**
 * Client Project File Upload API
 * 
 * 클라이언트가 프로젝트에 파일을 업로드하는 API
 * 프로젝트의 chat_session을 자동으로 찾거나 생성하여 파일을 연결합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: projectId } = await Promise.resolve(params);
    
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 프로젝트 소유권 확인
    const adminClient = getAdminClient();
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, user_id, manager_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 프로젝트 소유자 또는 매니저만 업로드 가능
    if (project.user_id !== user.id && project.manager_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not authorized for this project' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // 프로젝트의 chat_session 찾기 또는 생성
    let { data: session, error: sessionError } = await adminClient
      .from('chat_sessions')
      .select('id')
      .eq('project_id', projectId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      // 세션이 없으면 생성
      const { data: newSession, error: createError } = await adminClient
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: project.user_id,
          manager_id: project.manager_id,
          status: project.manager_id ? 'in_progress' : 'open',
        })
        .select('id')
        .single();

      if (createError || !newSession) {
        console.error('[Project File Upload] Failed to create session:', createError);
        return NextResponse.json(
          { ok: false, error: 'Failed to create chat session' },
          { status: 500 }
        );
      }

      session = newSession;
    }

    // 파일명 생성
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `projects/${projectId}/${timestamp}-${sanitizedName}`;

    // Supabase Storage에 업로드
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Project File Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { ok: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(fileName);

    // chat_messages에 파일 저장
    const { data: message, error: messageError } = await adminClient
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_id: user.id,
        role: project.user_id === user.id ? 'user' : 'manager',
        content: `Shared file: ${file.name}`,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();

    if (messageError) {
      console.error('[Project File Upload] Failed to save message:', messageError);
      // 파일은 업로드되었지만 메시지 저장 실패 - 파일 삭제
      await supabase.storage.from('project-files').remove([fileName]);
      return NextResponse.json(
        { ok: false, error: 'Failed to save file record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      file: {
        id: message.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        created_at: message.created_at,
      },
    });
  } catch (error) {
    console.error('[Project File Upload] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
