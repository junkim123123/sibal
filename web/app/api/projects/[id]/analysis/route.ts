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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 15+ 호환: params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const projectId = resolvedParams.id;
    
    console.log('[Get Project Analysis] Starting...', { projectId });
    
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

    // 메시지도 함께 불러오기 (채팅 내역)
    let messages: any[] = [];
    try {
      const { data: messagesData, error: messagesError } = await adminClient
        .from('messages')
        .select('id, role, content, timestamp')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });

      if (!messagesError && messagesData) {
        messages = messagesData.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        console.log('[Get Project Analysis] Loaded messages:', messages.length);
      } else if (messagesError) {
        console.warn('[Get Project Analysis] Failed to load messages (non-critical):', messagesError);
      }
    } catch (messagesError) {
      console.warn('[Get Project Analysis] Error loading messages (non-critical):', messagesError);
    }

    console.log('[Get Project Analysis] Retrieved data:', {
      projectId: project.id,
      hasAnswers: !!answers,
      hasAiAnalysis: !!aiAnalysis,
      answersKeys: answers ? Object.keys(answers).length : 0,
      messagesCount: messages.length,
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
      messages: messages.length > 0 ? messages : undefined,
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
