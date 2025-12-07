/**
 * Manager Project Detail API Endpoint
 * 
 * 매니저가 할당된 특정 프로젝트의 상세 정보를 제공합니다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

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

    if (!profile?.is_manager && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { ok: false, error: 'Forbidden: Manager access required' },
        { status: 403 }
      );
    }

    // 프로젝트 정보 로드 (클라이언트 정보 포함)
    const { data: projectData, error: projectError } = await adminClient
      .from('projects')
      .select(`
        id,
        name,
        user_id,
        status,
        total_landed_cost,
        created_at,
        manager_id,
        profiles!projects_user_id_fkey(
          name,
          email
        )
      `)
      .eq('id', projectId)
      .eq('manager_id', user.id)
      .single();

    if (projectError || !projectData) {
      console.error('[Manager Project API] Failed to load project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      project: {
        id: projectData.id,
        name: projectData.name,
        user_id: projectData.user_id,
        client_name: projectData.profiles?.name || projectData.profiles?.email || 'Client',
        client_email: projectData.profiles?.email || '',
        status: projectData.status,
        total_landed_cost: projectData.total_landed_cost,
        created_at: projectData.created_at,
      },
    });
  } catch (error) {
    console.error('[Manager Project API] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
