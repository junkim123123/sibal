/**
 * Milestone Update API
 * 
 * 매니저가 프로젝트 마일스톤을 업데이트하는 API
 * 마일스톤 업데이트 시 이메일 알림 발송
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendMilestoneUpdatedEmail } from '@/lib/email/sender';

export async function PATCH(req: Request) {
  try {
    // 매니저 인증 확인
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
      .select('is_manager')
      .eq('id', user.id)
      .single();

    if (!profile?.is_manager) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { project_id, milestone_index } = body;

    if (!project_id || typeof milestone_index !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'project_id and milestone_index are required' },
        { status: 400 }
      );
    }

    // 프로젝트 소유권 확인 (매니저가 할당된 프로젝트인지)
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, name, manager_id, milestones, user_id, profiles!projects_user_id_fkey(email)')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.manager_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // 마일스톤 업데이트
    const milestones = (project.milestones as any[]) || [];
    const updatedMilestones = [...milestones];

    // 이전 마일스톤들 완료 처리
    for (let i = 0; i <= milestone_index; i++) {
      if (updatedMilestones[i] && updatedMilestones[i].status === 'pending') {
        updatedMilestones[i] = {
          ...updatedMilestones[i],
          status: 'completed',
          date: new Date().toISOString(),
        };
      }
    }

    // 다음 마일스톤을 in_progress로 설정
    if (milestone_index < updatedMilestones.length - 1) {
      if (updatedMilestones[milestone_index + 1].status === 'pending') {
        updatedMilestones[milestone_index + 1] = {
          ...updatedMilestones[milestone_index + 1],
          status: 'in_progress',
        };
      }
    }

    // 마일스톤에 따른 프로젝트 상태 매핑
    const milestoneStatusMap: { [key: string]: string } = {
      'Sourcing Started': 'active',
      'Supplier Verified': 'in_progress',
      'Samples Ordered': 'in_progress',
      'QC Inspection': 'in_progress',
      'Shipping Arranged': 'in_progress',
      'Final Delivery': 'completed',
    };

    const currentMilestone = updatedMilestones[milestone_index];
    const projectStatus = milestoneStatusMap[currentMilestone?.title] || 'in_progress';

    // DB 업데이트 (마일스톤 + 프로젝트 상태)
    const { error: updateError } = await adminClient
      .from('projects')
      .update({
        milestones: updatedMilestones,
        current_milestone_index: milestone_index,
        status: projectStatus, // 마일스톤에 따라 프로젝트 상태 업데이트
        updated_at: new Date().toISOString(),
      })
      .eq('id', project_id);

    if (updateError) {
      console.error('[Milestone API] Failed to update milestone:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update milestone' },
        { status: 500 }
      );
    }

    // 시스템 메시지 전송 (채팅 세션에)
    try {
      const { data: session } = await adminClient
        .from('chat_sessions')
        .select('id')
        .eq('project_id', project_id)
        .maybeSingle();

      if (session) {
        await adminClient.from('chat_messages').insert({
          session_id: session.id,
          sender_id: user.id,
          role: 'manager',
          content: `System: Project status updated to '${updatedMilestones[milestone_index]?.title || 'Next Stage'}'.`,
        });
      }
    } catch (msgError) {
      console.error('[Milestone API] Failed to send system message:', msgError);
      // 시스템 메시지 실패해도 마일스톤 업데이트는 성공
    }

    // 이메일 알림 발송
    try {
      if (project.profiles?.email) {
        const milestoneTitle = updatedMilestones[milestone_index]?.title || 'Next Stage';
        await sendMilestoneUpdatedEmail(
          project_id,
          project.profiles.email,
          project.name,
          milestoneTitle
        );
      }
    } catch (emailError) {
      console.error('[Milestone API] Failed to send email notification:', emailError);
      // 이메일 실패해도 마일스톤 업데이트는 성공
    }

    return NextResponse.json(
      {
        ok: true,
        milestones: updatedMilestones,
        current_index: milestone_index,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Milestone API] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

