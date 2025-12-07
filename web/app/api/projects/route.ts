/**
 * Projects API Endpoint
 * 
 * 프로젝트 생성 및 조회를 위한 API 엔드포인트
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/projects
 * 새 프로젝트를 생성합니다.
 */
export async function POST(req: Request) {
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

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // 프로필 확인 또는 생성
    const adminClient = getAdminClient();
    
    // 프로필 확인
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // 프로필이 없으면 생성
    if (!profile) {
      await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'free',
        });
    }

    // 프로젝트 생성
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        status: 'active',
      })
      .select()
      .single();

    if (projectError) {
      console.error('[Projects API] Failed to create project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          created_at: project.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Projects API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects
 * 사용자의 모든 프로젝트를 조회합니다.
 */
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

    // 프로젝트 목록 조회
    const adminClient = getAdminClient();
    
    console.log('[Projects API] Fetching projects for user:', user.id);
    
    const { data: projects, error: projectsError } = await adminClient
      .from('projects')
      .select('id, name, status, initial_risk_score, total_landed_cost, created_at, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('[Projects API] Failed to fetch projects:', projectsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch projects', details: projectsError },
        { status: 500 }
      );
    }

    // 디버깅: 프로젝트 상태별 통계
    const projectsByStatus = (projects || []).reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('[Projects API] Total projects found:', projects?.length || 0);
    console.log('[Projects API] Projects by status:', projectsByStatus);
    console.log('[Projects API] Projects with saved status:', projects?.filter((p: any) => p.status === 'saved').length || 0);
    
    // saved 상태 프로젝트 상세 로그
    const savedProjects = projects?.filter((p: any) => p.status === 'saved') || [];
    if (savedProjects.length > 0) {
      console.log('[Projects API] Saved projects details:', savedProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        user_id: p.user_id,
        created_at: p.created_at,
      })));
    } else {
      console.warn('[Projects API] No projects with saved status found for user:', user.id);
    }

    return NextResponse.json(
      {
        ok: true,
        projects: projects || [],
        debug: {
          total: projects?.length || 0,
          byStatus: projectsByStatus,
          userId: user.id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Projects API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

