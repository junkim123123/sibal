/**
 * QC Report Server Actions
 * 
 * Interactive QC Report 기능을 위한 서버 액션
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import type {
  QCReport,
  QCReportItem,
  QCReportWithItems,
  CreateQCReportInput,
  UpdateQCReportInput,
  CreateQCReportItemInput,
  UpdateQCReportItemInput,
  ReviewQCReportInput,
} from '@/lib/types/qc';

/**
 * 현재 사용자가 매니저인지 확인
 */
async function checkIsManager(userId: string): Promise<boolean> {
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_manager, email')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  // @nexsupply.net 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
  const userEmail = profile.email?.toLowerCase() || '';
  const isNexsupplyDomain = userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net';

  return profile.is_manager === true || isNexsupplyDomain;
}

/**
 * 프로젝트에 대한 권한 확인
 */
async function checkProjectAccess(
  projectId: string,
  userId: string,
  requireManager: boolean = false
): Promise<{ hasAccess: boolean; isManager: boolean }> {
  const adminClient = getAdminClient();
  const { data: project } = await adminClient
    .from('projects')
    .select('user_id, manager_id')
    .eq('id', projectId)
    .single();

  if (!project) {
    return { hasAccess: false, isManager: false };
  }

  const isManager = await checkIsManager(userId);
  const isOwner = project.user_id === userId;
  const isAssignedManager = project.manager_id === userId;

  if (requireManager) {
    return {
      hasAccess: isManager && isAssignedManager,
      isManager: isManager && isAssignedManager,
    };
  }

  return {
    hasAccess: isOwner || (isManager && isAssignedManager),
    isManager: isManager && isAssignedManager,
  };
}

/**
 * QC 리포트 생성
 */
export async function createQCReport(
  input: CreateQCReportInput
): Promise<{ success: boolean; data?: QCReport; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(input.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // QC 리포트 생성
    const adminClient = getAdminClient();
    const { data: report, error: insertError } = await adminClient
      .from('qc_reports')
      .insert({
        project_id: input.project_id,
        title: input.title,
        total_quantity: input.total_quantity,
        passed_quantity: input.passed_quantity,
        defect_quantity: input.defect_quantity,
        manager_note: input.manager_note || null,
        inspection_date: input.inspection_date || null,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Create QC Report] Failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/projects/${input.project_id}/qc`);
    return { success: true, data: report as QCReport };
  } catch (error) {
    console.error('[Create QC Report] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 조회 (항목 포함)
 */
export async function getQCReport(
  reportId: string
): Promise<{ success: boolean; data?: QCReportWithItems; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 리포트 조회
    const adminClient = getAdminClient();
    const { data: report, error: reportError } = await adminClient
      .from('qc_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Report not found' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(report.project_id, user.id);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this report' };
    }

    // 항목 조회
    const { data: items, error: itemsError } = await adminClient
      .from('qc_report_items')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('[Get QC Report] Failed to fetch items:', itemsError);
      return { success: false, error: itemsError.message };
    }

    return {
      success: true,
      data: {
        ...(report as QCReport),
        items: (items || []) as QCReportItem[],
      },
    };
  } catch (error) {
    console.error('[Get QC Report] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 수정
 */
export async function updateQCReport(
  reportId: string,
  input: UpdateQCReportInput
): Promise<{ success: boolean; data?: QCReport; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 리포트 조회
    const adminClient = getAdminClient();
    const { data: report, error: reportError } = await adminClient
      .from('qc_reports')
      .select('project_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Report not found' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(report.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 리포트 수정
    const { data: updatedReport, error: updateError } = await adminClient
      .from('qc_reports')
      .update(input)
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('[Update QC Report] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${report.project_id}/qc/${reportId}`);
    return { success: true, data: updatedReport as QCReport };
  } catch (error) {
    console.error('[Update QC Report] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 발행 (published 상태로 변경)
 */
export async function publishQCReport(
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 리포트 조회
    const adminClient = getAdminClient();
    const { data: report, error: reportError } = await adminClient
      .from('qc_reports')
      .select('project_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Report not found' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(report.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 상태를 published로 변경
    const { error: updateError } = await adminClient
      .from('qc_reports')
      .update({ status: 'published' })
      .eq('id', reportId);

    if (updateError) {
      console.error('[Publish QC Report] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${report.project_id}/qc/${reportId}`);
    return { success: true };
  } catch (error) {
    console.error('[Publish QC Report] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 검토 (클라이언트 승인/거절)
 */
export async function reviewQCReport(
  input: ReviewQCReportInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 리포트 조회
    const adminClient = getAdminClient();
    const { data: report, error: reportError } = await adminClient
      .from('qc_reports')
      .select('project_id, status')
      .eq('id', input.report_id)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Report not found' };
    }

    // published 상태인지 확인
    if (report.status !== 'published') {
      return { success: false, error: 'Report must be published before review' };
    }

    // 프로젝트 소유자 확인 (클라이언트만 승인/거절 가능)
    const { hasAccess, isManager } = await checkProjectAccess(report.project_id, user.id);
    if (!hasAccess || isManager) {
      return { success: false, error: 'Forbidden: Only project owner can review reports' };
    }

    // 상태 업데이트
    const { error: updateError } = await adminClient
      .from('qc_reports')
      .update({
        status: input.status,
        client_feedback: input.client_feedback || null,
      })
      .eq('id', input.report_id);

    if (updateError) {
      console.error('[Review QC Report] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${report.project_id}/qc/${input.report_id}`);
    return { success: true };
  } catch (error) {
    console.error('[Review QC Report] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 항목 추가
 */
export async function createQCReportItem(
  input: CreateQCReportItemInput
): Promise<{ success: boolean; data?: QCReportItem; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 리포트 조회
    const adminClient = getAdminClient();
    const { data: report, error: reportError } = await adminClient
      .from('qc_reports')
      .select('project_id')
      .eq('id', input.report_id)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Report not found' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(report.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 항목 생성
    const { data: item, error: insertError } = await adminClient
      .from('qc_report_items')
      .insert({
        report_id: input.report_id,
        category: input.category,
        description: input.description,
        status: input.status,
        image_urls: input.image_urls || [],
        manager_comment: input.manager_comment || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Create QC Report Item] Failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/projects/${report.project_id}/qc/${input.report_id}`);
    return { success: true, data: item as QCReportItem };
  } catch (error) {
    console.error('[Create QC Report Item] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 항목 수정
 */
export async function updateQCReportItem(
  itemId: string,
  input: UpdateQCReportItemInput
): Promise<{ success: boolean; data?: QCReportItem; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 항목 조회
    const adminClient = getAdminClient();
    const { data: item, error: itemError } = await adminClient
      .from('qc_report_items')
      .select('report_id, qc_reports!inner(project_id)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Item not found' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const projectId = (item as any).qc_reports.project_id;
    const { hasAccess } = await checkProjectAccess(projectId, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 항목 수정
    const { data: updatedItem, error: updateError } = await adminClient
      .from('qc_report_items')
      .update(input)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      console.error('[Update QC Report Item] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${projectId}/qc/${item.report_id}`);
    return { success: true, data: updatedItem as QCReportItem };
  } catch (error) {
    console.error('[Update QC Report Item] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * QC 리포트 항목 삭제
 */
export async function deleteQCReportItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 항목 조회
    const adminClient = getAdminClient();
    const { data: item, error: itemError } = await adminClient
      .from('qc_report_items')
      .select('report_id, qc_reports!inner(project_id)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Item not found' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const projectId = (item as any).qc_reports.project_id;
    const { hasAccess } = await checkProjectAccess(projectId, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 항목 삭제
    const { error: deleteError } = await adminClient
      .from('qc_report_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('[Delete QC Report Item] Failed:', deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath(`/projects/${projectId}/qc/${item.report_id}`);
    return { success: true };
  } catch (error) {
    console.error('[Delete QC Report Item] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

