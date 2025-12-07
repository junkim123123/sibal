/**
 * Manager File Upload API Endpoint
 * 
 * 매니저가 프로젝트에 파일을 업로드하는 API
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('project_id') as string;
    const sessionId = formData.get('session_id') as string;

    if (!file || !projectId || !sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Missing file, project_id, or session_id' },
        { status: 400 }
      );
    }

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, manager_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.manager_id !== user.id && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // Supabase Storage에 파일 업로드
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `projects/${projectId}/${fileName}`;

    // Storage 버킷 확인 및 생성 (없으면 에러 반환)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('[File Upload API] Failed to list buckets:', bucketsError);
      return NextResponse.json(
        { ok: false, error: 'Storage service unavailable. Please contact support.' },
        { status: 500 }
      );
    }

    const projectFilesBucket = buckets?.find(b => b.name === 'project-files');
    
    if (!projectFilesBucket) {
      console.error('[File Upload API] project-files bucket not found');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Storage bucket not configured. Please create "project-files" bucket in Supabase Storage.' 
        },
        { status: 500 }
      );
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[File Upload API] Storage upload error:', uploadError);
      console.error('[File Upload API] Upload error details:', JSON.stringify(uploadError, null, 2));
      
      // 더 자세한 에러 메시지 제공
      let errorMessage = 'Failed to upload file';
      if (uploadError.message) {
        errorMessage = uploadError.message;
      } else if (uploadError.error) {
        errorMessage = uploadError.error;
      }
      
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 500 }
      );
    }

    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    // 채팅 메시지로 파일 저장
    const { data: message, error: messageError } = await adminClient
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        role: 'manager',
        content: `Shared file: ${file.name}`,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();

    if (messageError) {
      console.error('[File Upload API] Failed to save message:', messageError);
      // 파일은 업로드되었지만 메시지 저장 실패 - 파일 삭제
      await supabase.storage.from('project-files').remove([filePath]);
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
    console.error('[File Upload API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
