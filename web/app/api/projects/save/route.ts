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
    const { project_id, answers, ai_analysis } = body;

    console.log('[Save Project] Request data:', {
      hasProjectId: !!project_id,
      hasAnswers: !!answers,
      hasAiAnalysis: !!ai_analysis,
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

    // answers를 메시지로 저장 (선택적)
    if (answers && Object.keys(answers).length > 0) {
      // 주요 답변들을 하나의 메시지로 저장
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
        } catch (messageError) {
          // 메시지 저장 실패는 치명적이지 않으므로 로그만 남김
          console.warn('[Save Project] Failed to save message (non-critical):', messageError);
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
