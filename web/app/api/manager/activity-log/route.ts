/**
 * Activity Log API
 * 
 * Manager Dashboard에서 활동 이벤트를 기록하는 API
 * WhatsApp 연결 시도, 콜백 요청 등을 로깅
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

// POST: 활동 로그 기록
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_id, activity_type, metadata } = body;

    if (!project_id || !activity_type) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: project_id, activity_type' },
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

    // 프로젝트 확인
    const adminClient = getAdminClient();
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, name, user_id, manager_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 활동 로그 기록을 위한 데이터 준비
    const activityData = {
      project_id,
      user_id: user.id,
      activity_type,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // consultation_notes 테이블에 시스템 메시지로 기록하거나
    // 별도의 activity_logs 테이블이 있다면 거기에 기록
    // 여기서는 consultation_notes에 시스템 메시지 형태로 기록
    if (activity_type === 'whatsapp_connect_clicked' || activity_type === 'callback_requested') {
      let messageContent = '';
      
      if (activity_type === 'whatsapp_connect_clicked') {
        const phone = metadata?.user_phone || 'Not provided';
        messageContent = `🔔 System: Client (${phone}) clicked WhatsApp Connect button for project "${project.name}".`;
      } else if (activity_type === 'callback_requested') {
        const phone = metadata?.user_phone || 'Not provided';
        messageContent = `📞 System: Client (${phone}) requested a callback for project "${project.name}".`;
      }

      // consultation_notes에 시스템 메시지 기록 (manager_id는 null로 설정)
      try {
        await adminClient
          .from('consultation_notes')
          .insert({
            project_id,
            manager_id: project.manager_id || user.id, // 시스템 메시지는 manager_id가 있으면 그것을 사용
            content: messageContent,
          });
      } catch (noteError) {
        console.error('[Activity Log API] Failed to save consultation note:', noteError);
        // 노트 저장 실패해도 활동 로그는 계속 진행
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    console.error('[Activity Log API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

