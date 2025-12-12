/**
 * Admin Stats API Endpoint
 * 
 * Super Admin Dashboard 통계 데이터를 제공합니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
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

    // Super Admin 권한 확인
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // 통합 Admin 권한
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'manager';
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Unassigned Projects (status = 'active' AND manager_id IS NULL)
    const { count: unassignedCount, error: unassignedError } = await adminClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('manager_id', null);

    if (unassignedError) {
      console.error('[Admin Stats API] Error counting unassigned projects:', unassignedError);
    }

    // Active Projects
    const { count: activeCount, error: activeError } = await adminClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'in_progress']);

    if (activeError) {
      console.error('[Admin Stats API] Error counting active projects:', activeError);
    }

    // Total Revenue (this month) - 계산 로직 필요
    // TODO: Lemon Squeezy API 연동 또는 payment 기록에서 계산
    const totalRevenue = 0; // Placeholder

    // Manager Utilization
    const { data: managers, error: managersError } = await adminClient
      .from('profiles')
      .select('id, availability_status, workload_score')
      .eq('is_manager', true);

    if (managersError) {
      console.error('[Admin Stats API] Error loading managers:', managersError);
    }

    const totalManagers = managers?.length || 0;
    const availableManagers = managers?.filter(m => m.availability_status === 'available').length || 0;

    // 디버깅: 실제 프로젝트 데이터 확인
    const { data: unassignedProjectsData, error: unassignedDataError } = await adminClient
      .from('projects')
      .select('id, name, status, manager_id, created_at')
      .eq('status', 'active')
      .is('manager_id', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (unassignedDataError) {
      console.error('[Admin Stats API] Error fetching unassigned projects:', unassignedDataError);
    } else {
      console.log('[Admin Stats API] Unassigned projects sample:', unassignedProjectsData);
      console.log('[Admin Stats API] Unassigned count:', unassignedCount);
    }

    return NextResponse.json({
      ok: true,
      stats: {
        unassignedProjects: unassignedCount || 0,
        activeProjects: activeCount || 0,
        totalRevenue,
        managerUtilization: {
          available: availableManagers,
          total: totalManagers,
        },
      },
      debug: {
        unassignedProjectsSample: unassignedProjectsData || [],
      },
    });
  } catch (error) {
    console.error('[Admin Stats API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
