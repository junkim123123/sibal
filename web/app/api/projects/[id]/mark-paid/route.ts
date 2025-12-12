/**
 * Mark Project as Paid API
 * 
 * 프로젝트를 결제 완료 상태로 표시하는 API (결제 시뮬레이션)
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

    // 프로젝트 정보 확인
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, user_id, payment_status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single() as { data: any; error: any };

    if (projectError || !project) {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 결제 상태 업데이트
    const updateData: any = {
      payment_status: 'paid',
      is_paid_subscription: true,
      payment_date: new Date().toISOString(),
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
      console.error('[Mark Paid] Failed to update project:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    console.log('[Mark Paid] Successfully marked project as paid:', {
      projectId,
      payment_status: 'paid',
    });

    return NextResponse.json({
      ok: true,
      message: 'Payment status updated successfully',
      payment_status: 'paid',
    });
  } catch (error) {
    console.error('[Mark Paid] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

