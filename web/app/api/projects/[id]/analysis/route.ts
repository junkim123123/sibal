/**
 * Get Project Analysis Data API Endpoint
 * 
 * 저장된 프로젝트의 answers와 ai_analysis를 불러옵니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/projects/[id]/analysis
 * 프로젝트의 분석 데이터를 조회합니다.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Get Project Analysis] Starting...', { projectId: params.id });
    
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Get Project Analysis] Authentication failed:', authError);
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 프로젝트 조회 (analysis_data 포함)
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, name, status, user_id, analysis_data')
      .eq('id', projectId)
      .eq('user_id', user.id) // 사용자 본인의 프로젝트만 조회
      .single();

    if (projectError || !project) {
      console.error('[Get Project Analysis] Failed to fetch project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // analysis_data에서 answers와 ai_analysis 추출
    const analysisData = project.analysis_data || {};
    const answers = analysisData.answers || null;
    const aiAnalysis = analysisData.ai_analysis || null;

    console.log('[Get Project Analysis] Retrieved data:', {
      projectId: project.id,
      hasAnswers: !!answers,
      hasAiAnalysis: !!aiAnalysis,
      answersKeys: answers ? Object.keys(answers).length : 0,
    });

    return NextResponse.json({
      ok: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      answers: answers,
      ai_analysis: aiAnalysis,
    });
  } catch (error) {
    console.error('[Get Project Analysis] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
