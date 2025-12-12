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
    console.log('[Assign Manager] Starting assignment:', { projectId, managerId });

    // 권한 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Assign Manager] Authentication failed:', authError);
      return { success: false, error: 'Unauthorized' };
    }

    console.log('[Assign Manager] User authenticated:', { userId: user.id, email: user.email });

    // 슈퍼 어드민 권한 확인
    const adminClient = getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Assign Manager] Failed to fetch profile:', profileError);
      return { success: false, error: 'Failed to verify permissions' };
    }

    // 통합 Admin 권한 확인
    const userEmail = user.email?.toLowerCase() || '';
    const isAdminEmail = userEmail === 'k.myungjun@nexsupply.net';
    const isAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'manager';

    if (!isAdminEmail && !isAdminRole) {
      console.error('[Assign Manager] Access denied:', {
        userId: user.id,
        email: userEmail,
        role: profile?.role,
      });
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    console.log('[Assign Manager] Permission verified:', {
      userId: user.id,
      email: userEmail,
      role: profile?.role,
      isSuperAdminEmail,
      isSuperAdminRole,
    });

    // 프로젝트 존재 및 현재 상태 확인
    const { data: existingProject, error: fetchError } = await adminClient
      .from('projects')
      .select('id, name, status, manager_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !existingProject) {
      console.error('[Assign Manager] Project not found:', fetchError);
      return { success: false, error: 'Project not found' };
    }

    console.log('[Assign Manager] Current project state:', {
      id: existingProject.id,
      name: existingProject.name,
      currentStatus: existingProject.status,
      currentManagerId: existingProject.manager_id,
    });

    // 매니저가 이미 할당되어 있는지 확인
    if (existingProject.manager_id && existingProject.manager_id !== managerId) {
      console.warn('[Assign Manager] Project already has a manager:', existingProject.manager_id);
      return { success: false, error: 'Project already has a manager assigned' };
    }

    // 프로젝트 업데이트
    const { data: updatedProject, error: updateError } = await adminClient
      .from('projects')
      .update({
        manager_id: managerId,
        status: 'in_progress',
        dispatched_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('[Assign Manager] Failed to update project:', updateError);
      console.error('[Assign Manager] Update error details:', JSON.stringify(updateError, null, 2));
      return { 
        success: false, 
        error: updateError.message || 'Failed to update project. Please check server logs.' 
      };
    }

    console.log('[Assign Manager] Project updated successfully:', {
      id: updatedProject?.id,
      manager_id: updatedProject?.manager_id,
      status: updatedProject?.status,
    });

    // 기존 채팅 세션이 있으면 manager_id 업데이트 (클라이언트가 이미 세션을 생성한 경우)
    try {
      const { data: existingSession } = await adminClient
        .from('chat_sessions')
        .select('id, manager_id')
        .eq('project_id', projectId)
        .in('status', ['open', 'in_progress'])
        .maybeSingle();

      if (existingSession && existingSession.manager_id !== managerId) {
        const { error: sessionUpdateError } = await adminClient
          .from('chat_sessions')
          .update({
            manager_id: managerId,
            status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSession.id);

        if (sessionUpdateError) {
          console.warn('[Assign Manager] Failed to update chat session manager_id:', sessionUpdateError);
        } else {
          console.log('[Assign Manager] Updated chat session manager_id:', existingSession.id);
        }
      }
    } catch (sessionError) {
      console.warn('[Assign Manager] Error updating chat session (non-critical):', sessionError);
      // 세션 업데이트 실패는 치명적이지 않으므로 계속 진행
    }

    // 매니저 워크로드 업데이트 (트리거가 자동으로 처리하지만, 명시적으로 업데이트)
    try {
      await updateManagerWorkload(managerId);
    } catch (workloadError) {
      console.warn('[Assign Manager] Failed to update manager workload (non-critical):', workloadError);
      // 워크로드 업데이트 실패는 치명적이지 않으므로 계속 진행
    }

    revalidatePath('/admin/dispatch');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('[Assign Manager] Unexpected error:', error);
    if (error instanceof Error) {
      console.error('[Assign Manager] Error stack:', error.stack);
    }
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
    
    const { count, error: countError } = await adminClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .in('status', ['active', 'in_progress']);

    if (countError) {
      console.error('[Update Manager Workload] Error counting projects:', countError);
      return;
    }

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ workload_score: count || 0 })
      .eq('id', managerId);

    if (updateError) {
      console.error('[Update Manager Workload] Error updating profile:', updateError);
    } else {
      console.log('[Update Manager Workload] Updated workload for manager:', managerId, 'to', count || 0);
    }
  } catch (error) {
    console.error('[Update Manager Workload] Unexpected error:', error);
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

    // 통합 Admin 권한
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'manager';
    if (!hasAdminRole) {
      return { success: false, error: 'Forbidden: Admin access required' };
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

    // 통합 Admin 권한
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'manager';
    if (!hasAdminRole) {
      return { 
        totalOrderCount: 0, 
        recentOrders: [] 
      };
    }

    // 환경 변수 확인
    // Lemon Squeezy API 키 확인 (두 가지 변수명 모두 지원)
    const apiKey = process.env.LEMONSQUEEZY_API_KEY || 
                    process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || 
                    process.env.LEMON_SQUEEZY_STORE_ID;

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

