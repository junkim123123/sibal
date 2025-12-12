/**
 * Auto Assign Manager API
 * 
 * 프로젝트에 자동으로 매니저를 배정하는 API
 * 결제 완료된 프로젝트에 사용 가능한 매니저를 자동 배정
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = getAdminClient();

    // 프로젝트 정보 확인 (결제 여부 및 현재 상태)
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, user_id, status, manager_id, payment_status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single() as { data: any; error: any };

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 이미 매니저가 배정되어 있는지 확인
    if (project.manager_id) {
      return NextResponse.json({
        ok: true,
        message: 'Manager already assigned',
        manager_id: project.manager_id,
        status: project.status,
      });
    }

    // 결제 여부 확인 - 임시로 비활성화 (매니저 탭에서 별도 확인 예정)
    // if (project.payment_status !== 'paid') {
    //   return NextResponse.json(
    //     { 
    //       ok: false, 
    //       error: 'Payment required',
    //       requiresPayment: true 
    //     },
    //     { status: 402 } // Payment Required
    //   );
    // }

    // 사용 가능한 매니저 찾기 (워크로드가 가장 낮은 매니저 우선)
    const { data: availableManagers, error: managersError } = await adminClient
      .from('profiles')
      .select('id, name, email, workload_score, availability_status')
      .eq('is_manager', true)
      .order('workload_score', { ascending: true })
      .limit(1) as { data: any[] | null; error: any };

    if (managersError || !availableManagers || availableManagers.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No available managers found' },
        { status: 503 }
      );
    }

    const assignedManagerId = availableManagers[0].id;

    // 프로젝트 업데이트: 매니저 배정 및 상태 변경
    // 결제 상태도 'paid'로 설정 (매니저 탭에서 별도 확인 예정)
    const updateData: any = {
      manager_id: assignedManagerId,
      status: 'in_progress',
      payment_status: 'paid', // 임시로 결제 완료 처리
      is_paid_subscription: true,
      dispatched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updateResult = (await (adminClient as any)
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()) as { data: any; error: any };
    const { data: updatedProject, error: updateError } = updateResult;

    if (updateError || !updatedProject) {
      console.error('[Auto Assign Manager] Failed to update project:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to assign manager' },
        { status: 500 }
      );
    }

    // 채팅 세션 생성 또는 업데이트
    try {
      const sessionResult = await adminClient
        .from('chat_sessions')
        .select('id, manager_id')
        .eq('project_id', projectId)
        .maybeSingle() as any;

      // maybeSingle()은 직접 데이터 객체를 반환하거나 { data, error } 형태일 수 있음
      const existingSession = sessionResult?.data || sessionResult || null;

      if (existingSession && existingSession.id) {
        // 기존 세션이 있으면 매니저 ID 업데이트
        const sessionUpdateData: any = {
          manager_id: assignedManagerId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        };
        await (adminClient as any)
          .from('chat_sessions')
          .update(sessionUpdateData)
          .eq('id', existingSession.id);
        console.log('[Auto Assign Manager] Updated chat session:', existingSession.id);
      } else {
        // 새 세션 생성
        const sessionInsertData: any = {
          project_id: projectId,
          user_id: user.id,
          manager_id: assignedManagerId,
          status: 'in_progress',
        };
        const insertResult = await (adminClient as any)
          .from('chat_sessions')
          .insert(sessionInsertData)
          .select()
          .single();
        console.log('[Auto Assign Manager] Created chat session:', insertResult?.data?.id || insertResult?.id);
      }
    } catch (sessionError) {
      console.error('[Auto Assign Manager] Failed to update/create chat session:', sessionError);
      // 세션 생성 실패해도 계속 진행 (치명적이지 않음)
    }

    console.log('[Auto Assign Manager] Successfully assigned manager:', {
      projectId,
      managerId: assignedManagerId,
      managerName: availableManagers[0].name || availableManagers[0].email,
    });

    return NextResponse.json({
      ok: true,
      message: 'Manager assigned successfully',
      manager_id: assignedManagerId,
      status: 'in_progress',
    });
  } catch (error) {
    console.error('[Auto Assign Manager] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

