/**
 * Admin Dispatch Projects API Endpoint
 * 
 * Dispatch Center에서 사용할 Unassigned Projects와 Managers 데이터를 제공합니다.
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

    if (profile?.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Unassigned Projects: 결제 완료(payment_status = 'paid')이고 매니저 미배정(manager_id IS NULL)인 프로젝트
    // Connect Agent 버튼을 누른 후 결제 완료된 모든 프로젝트를 super admin이 배정할 수 있도록 함
    const { data: projects, error: projectsError } = await adminClient
      .from('projects')
      .select(`
        id,
        name,
        user_id,
        status,
        payment_status,
        payment_date,
        created_at,
        profiles!projects_user_id_fkey(
          name,
          email
        )
      `)
      .eq('payment_status', 'paid')  // 결제 완료된 프로젝트만
      .is('manager_id', null)  // 매니저 미배정
      .order('payment_date', { ascending: false, nullsFirst: false });  // 최근 결제일순

    if (projectsError) {
      console.error('[Dispatch Projects API] Error loading projects:', projectsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load projects' },
        { status: 500 }
      );
    }

    const formattedProjects = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      user_id: p.user_id,
      user_name: p.profiles?.name || p.profiles?.email?.split('@')[0] || 'Unknown',
      user_email: p.profiles?.email || '',
      status: p.status,  // 프로젝트 상태 (saved, completed, in_progress 등)
      payment_status: p.payment_status,  // 결제 상태
      payment_date: p.payment_date,  // 결제 완료일
      created_at: p.created_at,
    }));

    // Manager Pool
    const { data: managerData, error: managersError } = await adminClient
      .from('profiles')
      .select('id, name, email, workload_score, availability_status, expertise')
      .eq('is_manager', true)
      .order('workload_score', { ascending: true });

    if (managersError) {
      console.error('[Dispatch Projects API] Error loading managers:', managersError);
      return NextResponse.json(
        { ok: false, error: 'Failed to load managers' },
        { status: 500 }
      );
    }

    const formattedManagers = (managerData || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.email?.split('@')[0] || 'Unknown',
      email: m.email,
      workload_score: m.workload_score || 0,
      availability_status: m.availability_status || 'available',
      expertise: m.expertise || null,
    }));

    console.log('[Dispatch Projects API] Loaded:', {
      projectsCount: formattedProjects.length,
      managersCount: formattedManagers.length,
    });

    return NextResponse.json({
      ok: true,
      projects: formattedProjects,
      managers: formattedManagers,
    });
  } catch (error) {
    console.error('[Dispatch Projects API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
