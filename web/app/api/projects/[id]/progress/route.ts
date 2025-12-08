/**
 * Project Progress API Endpoint
 * 
 * 클라이언트가 자신의 프로젝트 진행사항을 조회할 수 있는 API
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: projectId } = await Promise.resolve(params);

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

    // 프로젝트 소유권 확인
    const adminClient = getAdminClient();
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, milestones, current_milestone_index, manager_id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('[Project Progress API] Failed to load project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 프로젝트 소유자 확인
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Not your project' },
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
      manager_id: project.manager_id,
    });
  } catch (error) {
    console.error('[Project Progress API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
