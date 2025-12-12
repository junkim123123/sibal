/**
 * Manager Milestones API Endpoint
 * 
 * 매니저가 할당된 프로젝트의 마일스톤 정보를 제공합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: 'Missing project_id' },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
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

    // 통합 Admin 권한
    const isManager = profile?.is_manager === true;
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isManager && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 프로젝트 마일스톤 정보 로드
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('milestones, current_milestone_index, manager_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('[Manager Milestones API] Failed to load project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 매니저가 할당되었는지 확인
        // 통합 Admin 권한
        if (project.manager_id !== user.id && !hasAdminRole) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not assigned to this project' },
        { status: 403 }
      );
    }

    // 기본 마일스톤 정의
    const DEFAULT_MILESTONES = [
      { title: 'Sourcing Started', status: 'completed', date: null, index: 0 },
      { title: 'Supplier Verified', status: 'pending', date: null, index: 1 },
      { title: 'Samples Ordered', status: 'pending', date: null, index: 2 },
      { title: 'QC Inspection', status: 'pending', date: null, index: 3 },
      { title: 'Shipping Arranged', status: 'pending', date: null, index: 4 },
      { title: 'Final Delivery', status: 'pending', date: null, index: 5 },
    ];

    const milestones = (project.milestones && Array.isArray(project.milestones))
      ? project.milestones
      : DEFAULT_MILESTONES;

    return NextResponse.json({
      ok: true,
      milestones,
      current_milestone_index: project.current_milestone_index || 0,
    });
  } catch (error) {
    console.error('[Manager Milestones API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
