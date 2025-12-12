/**
 * Request Payment API
 * 
 * 매니저가 견적 준비 완료 후 고객에게 결제 요청을 보내는 API
 * 프로젝트 상태를 payment_pending로 변경하여 고객 대시보드에서 결제 모달 표시
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
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
      .select('is_manager, role')
      .eq('id', user.id)
      .single();

    const isManager = profile?.is_manager === true;
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';

    if (!isManager && !hasAdminRole) {
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

    // 프로젝트 소유권 확인
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, name, manager_id, status, payment_status, milestones')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.manager_id !== user.id && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // 프로젝트 상태를 payment_pending로 변경
    const { error: updateError } = await adminClient
      .from('projects')
      .update({
        payment_status: 'pending',
        status: 'payment_pending', // 결제 대기 상태
        updated_at: new Date().toISOString(),
      })
      .eq('id', project_id);

    if (updateError) {
      console.error('[Request Payment API] Failed to update project:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update project status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment request sent successfully',
    });
  } catch (error) {
    console.error('[Request Payment API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

