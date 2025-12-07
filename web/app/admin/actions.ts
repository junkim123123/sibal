/**
 * Super Admin Server Actions
 * 
 * 매니저 할당, 유저 관리 등 슈퍼 어드민 액션
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * 프로젝트에 매니저 할당
 */
export async function assignManagerToProject(projectId: string, managerId: string) {
  try {
    // 권한 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 슈퍼 어드민 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Super admin access required' };
    }

    // 프로젝트 업데이트
    const { error: updateError } = await adminClient
      .from('projects')
      .update({
        manager_id: managerId,
        status: 'in_progress',
        dispatched_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('[Assign Manager] Failed to update project:', updateError);
      return { success: false, error: updateError.message };
    }

    // 매니저 워크로드 업데이트 (트리거가 자동으로 처리하지만, 명시적으로 업데이트)
    await updateManagerWorkload(managerId);

    revalidatePath('/admin/dispatch');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('[Assign Manager] Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 매니저 워크로드 업데이트
 */
async function updateManagerWorkload(managerId: string) {
  try {
    const adminClient = getAdminClient();
    
    const { count } = await adminClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .in('status', ['active', 'in_progress']);

    await adminClient
      .from('profiles')
      .update({ workload_score: count || 0 })
      .eq('id', managerId);
  } catch (error) {
    console.error('[Update Manager Workload] Error:', error);
  }
}

/**
 * 유저 밴 처리
 */
export async function banUser(userId: string, isBanned: boolean) {
  try {
    // 권한 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 슈퍼 어드민 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Super admin access required' };
    }

    // 유저 밴 상태 업데이트
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId);

    if (updateError) {
      console.error('[Ban User] Failed to update profile:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('[Ban User] Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

