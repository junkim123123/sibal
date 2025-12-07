/**
 * Submit Project API Endpoint
 * 
 * 결제 없이 즉시 프로젝트를 생성하고 채팅 내역을 저장합니다.
 * 프로젝트는 'active' 상태로 생성되어 대시보드 'Active Orders' 탭에 표시됩니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/projects/submit
 * 프로젝트를 생성하고 메시지를 저장합니다 (트랜잭션 성격)
 */
export async function POST(req: Request) {
  try {
    console.log('[Submit Project] Starting submit process...');
    
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Submit Project] Authentication failed:', authError);
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Submit Project] User authenticated:', user.id);

    const body = await req.json();
    const { name, answers, ai_analysis, messages } = body;

    console.log('[Submit Project] Request data:', {
      hasName: !!name,
      hasAnswers: !!answers,
      hasAiAnalysis: !!ai_analysis,
      hasMessages: !!messages,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
    });

    const adminClient = getAdminClient();

    // 프로젝트 이름 추출
    const productName = name || 
                       answers?.product_info?.split('-')[0]?.trim() || 
                       answers?.product_info?.split(',')[0]?.trim() ||
                       answers?.product_desc?.split(',')[0] || 
                       answers?.project_name || 
                       'New Sourcing Project';

    // AI 분석 결과에서 데이터 추출
    const totalLandedCost = ai_analysis?.financials?.estimated_landed_cost || null;
    const initialRiskScore = ai_analysis?.osint_risk_score || null;

    console.log('[Submit Project] Extracted data:', {
      productName,
      totalLandedCost,
      initialRiskScore,
    });

    // 1. 프로젝트 생성 (status: 'active'로 설정하여 Active Orders에 표시)
    const insertData: any = {
      user_id: user.id,
      name: productName,
      status: 'active', // Active Orders 탭에 표시되도록
    };

    // AI 분석 결과가 있으면 추가 데이터 포함
    if (totalLandedCost !== null) {
      insertData.total_landed_cost = totalLandedCost;
    }
    if (initialRiskScore !== null) {
      insertData.initial_risk_score = initialRiskScore;
    }

    console.log('[Submit Project] Creating new project with data:', insertData);

    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .insert(insertData)
      .select()
      .single();

    if (projectError) {
      console.error('[Submit Project] Failed to create project:', projectError);
      console.error('[Submit Project] Error details:', JSON.stringify(projectError, null, 2));
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Failed to create project',
          details: projectError,
        },
        { status: 500 }
      );
    }

    const finalProjectId = project.id;
    console.log('[Submit Project] Project created successfully:', finalProjectId);

    // 2. analysis_data 저장 (answers와 ai_analysis)
    if (answers || ai_analysis) {
      const analysisData: any = {};
      if (answers && Object.keys(answers).length > 0) {
        analysisData.answers = answers;
      }
      if (ai_analysis) {
        analysisData.ai_analysis = ai_analysis;
      }

      if (Object.keys(analysisData).length > 0) {
        try {
          const { error: updateAnalysisError } = await adminClient
            .from('projects')
            .update({ analysis_data: analysisData })
            .eq('id', finalProjectId)
            .eq('user_id', user.id);

          if (updateAnalysisError) {
            console.warn('[Submit Project] Failed to save analysis_data (non-critical):', updateAnalysisError);
          } else {
            console.log('[Submit Project] Analysis data saved successfully');
          }
        } catch (analysisError) {
          console.warn('[Submit Project] Failed to save analysis_data (non-critical):', analysisError);
        }
      }
    }

    // 3. 메시지 저장 (messages 배열이 제공된 경우)
    if (Array.isArray(messages) && messages.length > 0) {
      console.log('[Submit Project] Saving chat messages:', messages.length);
      
      try {
        // 메시지 데이터 준비
        const messagesToInsert = messages
          .filter((msg: any) => msg && msg.content && msg.role) // 유효한 메시지만 필터링
          .map((msg: any) => ({
            project_id: finalProjectId,
            role: msg.role === 'assistant' ? 'ai' : (msg.role === 'ai' ? 'ai' : 'user'), // role 정규화
            content: typeof msg.content === 'string' ? msg.content.trim() : JSON.stringify(msg.content),
            timestamp: msg.timestamp || new Date().toISOString(),
          }));

        if (messagesToInsert.length > 0) {
          console.log('[Submit Project] Inserting', messagesToInsert.length, 'messages');
          
          // 배치로 메시지 저장
          const { data: insertedMessages, error: messagesError } = await adminClient
            .from('messages')
            .insert(messagesToInsert)
            .select();

          if (messagesError) {
            console.error('[Submit Project] Failed to save messages:', messagesError);
            console.error('[Submit Project] Messages error details:', JSON.stringify(messagesError, null, 2));
            // 메시지 저장 실패는 치명적이지 않으므로 경고만 남김
            console.warn('[Submit Project] Continuing despite message save failure');
          } else {
            console.log('[Submit Project] Successfully saved messages:', insertedMessages?.length || 0);
          }
        } else {
          console.warn('[Submit Project] No valid messages to insert after filtering');
        }
      } catch (messageError) {
        console.error('[Submit Project] Error saving messages:', messageError);
        // 메시지 저장 실패는 치명적이지 않으므로 경고만 남김
        console.warn('[Submit Project] Continuing despite message save error');
      }
    } else if (answers && Object.keys(answers).length > 0) {
      // messages 배열이 없으면 answers를 요약 메시지로 저장 (하위 호환성)
      console.log('[Submit Project] No messages array provided, saving answers as summary message');
      const answersText = Object.entries(answers)
        .filter(([key, value]) => value && value !== 'skip' && value !== 'Skip')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      if (answersText) {
        try {
          await adminClient
            .from('messages')
            .insert({
              project_id: finalProjectId,
              role: 'user',
              content: `Product Analysis Request:\n${answersText}`,
            });
          console.log('[Submit Project] Saved answers as summary message');
        } catch (messageError) {
          console.warn('[Submit Project] Failed to save summary message (non-critical):', messageError);
        }
      }
    }

    // 저장된 프로젝트를 다시 조회하여 확인
    const { data: savedProject, error: verifyError } = await adminClient
      .from('projects')
      .select('id, name, status, user_id')
      .eq('id', finalProjectId)
      .eq('user_id', user.id)
      .single();

    if (verifyError || !savedProject) {
      console.error('[Submit Project] Failed to verify saved project:', verifyError);
      return NextResponse.json(
        { ok: false, error: 'Failed to verify saved project' },
        { status: 500 }
      );
    }

    console.log('[Submit Project] Verified saved project:', {
      id: savedProject.id,
      name: savedProject.name,
      status: savedProject.status,
      user_id: savedProject.user_id,
    });

    return NextResponse.json({
      ok: true,
      projectId: finalProjectId,
      project: {
        id: savedProject.id,
        name: savedProject.name,
        status: savedProject.status,
      },
    });
  } catch (error) {
    console.error('[Submit Project] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
