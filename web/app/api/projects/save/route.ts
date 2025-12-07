/**
 * Save Project API Endpoint
 * 
 * 프로젝트를 저장하고 대시보드로 리다이렉트하기 위한 API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/projects/save
 * 프로젝트를 저장합니다 (생성 또는 업데이트)
 */
export async function POST(req: Request) {
  try {
    console.log('[Save Project] Starting save process...');
    
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Save Project] Authentication failed:', authError);
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Save Project] User authenticated:', user.id);

    const body = await req.json();
    const { project_id, answers, ai_analysis, messages } = body;

    console.log('[Save Project] Request data:', {
      hasProjectId: !!project_id,
      hasAnswers: !!answers,
      hasAiAnalysis: !!ai_analysis,
      hasMessages: !!messages,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
    });

    const adminClient = getAdminClient();

    // 프로젝트 이름 추출
    const productName = answers?.product_info?.split('-')[0]?.trim() || 
                       answers?.product_info?.split(',')[0]?.trim() ||
                       answers?.product_desc?.split(',')[0] || 
                       answers?.project_name || 
                       'Saved Analysis';

    // AI 분석 결과에서 데이터 추출
    const totalLandedCost = ai_analysis?.financials?.estimated_landed_cost || null;
    const initialRiskScore = ai_analysis?.osint_risk_score || null;

    console.log('[Save Project] Extracted data:', {
      productName,
      totalLandedCost,
      initialRiskScore,
    });

    let finalProjectId = project_id;

    // 프로젝트가 없으면 생성 (Save Report 버튼을 누르면 saved 상태로 생성)
    if (!finalProjectId) {
      const insertData: any = {
        user_id: user.id,
        name: productName,
        status: 'saved', // Save Report 버튼을 누르면 saved 상태로 생성
      };

      // AI 분석 결과가 있으면 추가 데이터 포함
      if (totalLandedCost !== null) {
        insertData.total_landed_cost = totalLandedCost;
      }
      if (initialRiskScore !== null) {
        insertData.initial_risk_score = initialRiskScore;
      }

      console.log('[Save Project] Creating new project with data:', insertData);

      const { data: project, error: projectError } = await adminClient
        .from('projects')
        .insert(insertData)
        .select()
        .single();

      if (projectError) {
        console.error('[Save Project] Failed to create project:', projectError);
        console.error('[Save Project] Error details:', JSON.stringify(projectError, null, 2));
        return NextResponse.json(
          { 
            ok: false, 
            error: 'Failed to create project',
            details: projectError,
          },
          { status: 500 }
        );
      }

      console.log('[Save Project] Project created successfully:', project.id);
      finalProjectId = project.id;
    } else {
      // 프로젝트가 있으면 이름 업데이트 및 saved 상태로 변경
      const updateData: any = {
        name: productName,
        status: 'saved', // Save Report 버튼을 누르면 saved 상태로 변경
      };

      // AI 분석 결과가 있으면 추가 데이터 포함
      if (totalLandedCost !== null) {
        updateData.total_landed_cost = totalLandedCost;
      }
      if (initialRiskScore !== null) {
        updateData.initial_risk_score = initialRiskScore;
      }

      console.log('[Save Project] Updating project with data:', updateData);

      const { data: updatedProject, error: updateError } = await adminClient
        .from('projects')
        .update(updateData)
        .eq('id', finalProjectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Save Project] Failed to update project:', updateError);
        console.error('[Save Project] Update error details:', JSON.stringify(updateError, null, 2));
        
        // CHECK 제약조건 위반 에러인지 확인
        const errorMessage = updateError.message || JSON.stringify(updateError);
        if (errorMessage.includes('check constraint') || errorMessage.includes('projects_status_check')) {
          return NextResponse.json(
            { 
              ok: false, 
              error: 'Database constraint error: "saved" status is not allowed. Please run the migration to add "saved" status.',
              details: {
                error: updateError,
                migration_file: 'add_saved_status_to_projects.sql',
                hint: 'Run the SQL migration in Supabase SQL Editor to allow "saved" status',
              }
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { ok: false, error: 'Failed to update project status', details: updateError },
          { status: 500 }
        );
      }

      console.log('[Save Project] Project updated to saved status:', finalProjectId, updatedProject?.status);
      
      // 업데이트된 프로젝트 확인
      if (!updatedProject) {
        console.error('[Save Project] Project update returned no data');
        return NextResponse.json(
          { ok: false, error: 'Project update failed: No data returned' },
          { status: 500 }
        );
      }
      
      // 상태 확인
      if (updatedProject.status !== 'saved') {
        console.warn('[Save Project] Project status mismatch. Expected: saved, Got:', updatedProject.status);
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
      console.error('[Save Project] Failed to verify saved project:', verifyError);
      return NextResponse.json(
        { ok: false, error: 'Failed to verify saved project' },
        { status: 500 }
      );
    }

    console.log('[Save Project] Verified saved project:', {
      id: savedProject.id,
      name: savedProject.name,
      status: savedProject.status,
      user_id: savedProject.user_id,
    });

    // answers와 ai_analysis를 analysis_data JSONB 필드에 저장
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
            console.warn('[Save Project] Failed to save analysis_data (non-critical):', updateAnalysisError);
          } else {
            console.log('[Save Project] Analysis data saved successfully');
          }
        } catch (analysisError) {
          console.warn('[Save Project] Failed to save analysis_data (non-critical):', analysisError);
        }
      }
    }

    // 채팅 메시지 저장 (messages 배열이 제공된 경우)
    if (Array.isArray(messages) && messages.length > 0) {
      console.log('[Save Project] Saving chat messages:', messages.length);
      
      try {
        // 기존 메시지 확인 (중복 저장 방지)
        const { data: existingMessages } = await adminClient
          .from('messages')
          .select('id, content, role, timestamp')
          .eq('project_id', finalProjectId)
          .order('timestamp', { ascending: true });

        const existingContentSet = new Set(
          (existingMessages || []).map((msg: any) => `${msg.role}:${msg.content.substring(0, 100)}`)
        );

        // 메시지 데이터 준비 및 중복 필터링
        const messagesToInsert = messages
          .filter((msg: any) => {
            // 유효한 메시지만 필터링
            if (!msg || !msg.content || !msg.role) return false;
            
            // 중복 체크 (내용의 첫 100자로 비교)
            const contentKey = `${msg.role === 'assistant' ? 'ai' : msg.role}:${String(msg.content).substring(0, 100)}`;
            if (existingContentSet.has(contentKey)) {
              console.log('[Save Project] Skipping duplicate message:', contentKey);
              return false;
            }
            
            return true;
          })
          .map((msg: any) => ({
            project_id: finalProjectId,
            role: msg.role === 'assistant' ? 'ai' : (msg.role === 'ai' ? 'ai' : 'user'), // role 정규화
            content: typeof msg.content === 'string' ? msg.content.trim() : JSON.stringify(msg.content),
            timestamp: msg.timestamp || new Date().toISOString(),
          }));

        if (messagesToInsert.length > 0) {
          console.log('[Save Project] Inserting', messagesToInsert.length, 'new messages');
          
          // 배치로 메시지 저장
          const { data: insertedMessages, error: messagesError } = await adminClient
            .from('messages')
            .insert(messagesToInsert)
            .select();

          if (messagesError) {
            console.error('[Save Project] Failed to save messages:', messagesError);
            console.error('[Save Project] Messages error details:', JSON.stringify(messagesError, null, 2));
            // 메시지 저장 실패는 치명적이지 않으므로 경고만 남김
            console.warn('[Save Project] Continuing despite message save failure');
          } else {
            console.log('[Save Project] Successfully saved messages:', insertedMessages?.length || 0);
          }
        } else {
          console.log('[Save Project] No new messages to insert (all messages already exist)');
        }
      } catch (messageError) {
        console.error('[Save Project] Error saving messages:', messageError);
        // 메시지 저장 실패는 치명적이지 않으므로 경고만 남김
        console.warn('[Save Project] Continuing despite message save error');
      }
    } else if (answers && Object.keys(answers).length > 0) {
      // messages 배열이 없으면 answers를 요약 메시지로 저장 (하위 호환성)
      console.log('[Save Project] No messages array provided, saving answers as summary message');
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
              content: `Analysis Summary:\n${answersText}`,
            });
          console.log('[Save Project] Saved answers as summary message');
        } catch (messageError) {
          console.warn('[Save Project] Failed to save summary message (non-critical):', messageError);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      project_id: finalProjectId,
      project: {
        id: savedProject.id,
        name: savedProject.name,
        status: savedProject.status,
      },
    });
  } catch (error) {
    console.error('[Save Project] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
