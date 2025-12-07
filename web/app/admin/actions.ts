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

/**
 * Lemon Squeezy 매출 통계 조회
 * 
 * Lemon Squeezy API를 호출하여 결제 완료된 주문 목록과 통계를 가져옵니다.
 */
export async function getSalesStats() {
  try {
    // 권한 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        totalOrderCount: 0, 
        recentOrders: [] 
      };
    }

    // 슈퍼 어드민 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return { 
        totalOrderCount: 0, 
        recentOrders: [] 
      };
    }

    // 환경 변수 확인
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      console.error('[Sales Stats] Missing Lemon Squeezy credentials:', {
        hasApiKey: !!apiKey,
        hasStoreId: !!storeId,
      });
      return { 
        totalOrderCount: 0, 
        recentOrders: [] 
      };
    }

    // API 호출
    const url = new URL('https://api.lemonsqueezy.com/v1/orders');
    url.searchParams.append('filter[store_id]', storeId);
    url.searchParams.append('filter[status]', 'paid');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
      },
      next: {
        revalidate: 60, // 60초 캐싱
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sales Stats] API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return { 
        totalOrderCount: 0, 
        recentOrders: [] 
      };
    }

    const data = await response.json();

    // 총 주문 수 (meta.page.total)
    const totalOrderCount = data.meta?.page?.total || 0;

    // 최근 주문 목록 매핑
    const recentOrders = (data.data || []).map((order: any) => ({
      id: order.id,
      email: order.attributes?.user_email || order.attributes?.email || 'N/A',
      amount: order.attributes?.total_formatted || 
              `$${(order.attributes?.total || 0).toFixed(2)}`,
      date: order.attributes?.created_at || new Date().toISOString(),
      status: order.attributes?.status || 'paid',
    }));

    return {
      totalOrderCount,
      recentOrders,
    };
  } catch (error) {
    console.error('[Sales Stats] Unexpected error:', error);
    return { 
      totalOrderCount: 0, 
      recentOrders: [] 
    };
  }
}

