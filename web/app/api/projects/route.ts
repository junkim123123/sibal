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
    
    const { data: projects, error: projectsError } = await adminClient
      .from('projects')
      .select('id, name, status, initial_risk_score, total_landed_cost, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('[Projects API] Failed to fetch projects:', projectsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        projects: projects || [],
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

