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
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('[Get Project Analysis] Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { ok: false, error: 'Failed to initialize authentication', details: clientError instanceof Error ? clientError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('[Get Project Analysis] Authentication error:', {
        error: authError,
        message: authError.message,
        status: authError.status,
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Unauthorized',
          details: authError.message || 'Authentication failed. Please log in again.',
        },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('[Get Project Analysis] No user found in session');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Unauthorized',
          details: 'No authenticated user found. Please log in again.',
        },
        { status: 401 }
      );
    }

    console.log('[Get Project Analysis] User authenticated:', { userId: user.id, email: user.email });

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 프로젝트 조회 (analysis_data 포함)
    // 매니저도 접근 가능하도록 수정 (manager_id로도 확인)
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, name, status, user_id, manager_id, analysis_data')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('[Get Project Analysis] Failed to fetch project:', projectError);
      return NextResponse.json(
        { ok: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // 타입 안전성을 위한 타입 단언
    const projectData = project as {
      id: string;
      name: string;
      status: string;
      user_id: string;
      manager_id: string | null;
      analysis_data: any;
    };

    // 권한 확인: 프로젝트 소유자 또는 할당된 매니저
    const isOwner = projectData.user_id === user.id;
    const isManager = projectData.manager_id === user.id;

    if (!isOwner && !isManager) {
      console.error('[Get Project Analysis] Access denied:', { userId: user.id, projectUserId: projectData.user_id, projectManagerId: projectData.manager_id });
      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // analysis_data에서 answers와 ai_analysis 추출
    // JSONB 타입이므로 안전하게 파싱
    let analysisData: any = {};
    try {
      if (projectData.analysis_data) {
        // 이미 객체인 경우 그대로 사용, 문자열인 경우 파싱
        if (typeof projectData.analysis_data === 'string') {
          analysisData = JSON.parse(projectData.analysis_data);
        } else if (typeof projectData.analysis_data === 'object') {
          analysisData = projectData.analysis_data;
        }
      }
    } catch (parseError) {
      console.error('[Get Project Analysis] Failed to parse analysis_data:', parseError);
      console.error('[Get Project Analysis] Raw analysis_data:', projectData.analysis_data);
      analysisData = {};
    }
    
    const answers = (analysisData && typeof analysisData === 'object' && 'answers' in analysisData) 
      ? analysisData.answers 
      : null;
    const aiAnalysis = (analysisData && typeof analysisData === 'object' && 'ai_analysis' in analysisData)
      ? analysisData.ai_analysis
      : null;
    
    console.log('[Get Project Analysis] Parsed analysis_data:', {
      analysisDataType: typeof projectData.analysis_data,
      analysisDataKeys: analysisData ? Object.keys(analysisData) : [],
      hasAnswers: !!answers,
      hasAiAnalysis: !!aiAnalysis,
      answersType: answers ? typeof answers : 'null',
      aiAnalysisType: aiAnalysis ? typeof aiAnalysis : 'null',
    });

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
      projectId: projectData.id,
      hasAnswers: !!answers,
      hasAiAnalysis: !!aiAnalysis,
      answersKeys: answers ? Object.keys(answers).length : 0,
      messagesCount: messages.length,
      rawAnalysisDataType: typeof projectData.analysis_data,
      rawAnalysisDataIsNull: projectData.analysis_data === null,
    });

    return NextResponse.json({
      ok: true,
      project: {
        id: projectData.id,
        name: projectData.name,
        status: projectData.status,
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
