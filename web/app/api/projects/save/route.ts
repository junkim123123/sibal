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
    const { project_id, answers } = body;

    const adminClient = getAdminClient();

    // 프로젝트 이름 추출
    const productName = answers?.product_info?.split('-')[0]?.trim() || 
                       answers?.product_info?.split(',')[0]?.trim() ||
                       answers?.product_desc?.split(',')[0] || 
                       answers?.project_name || 
                       'Saved Analysis';

    let finalProjectId = project_id;

    // 프로젝트가 없으면 생성 (Save Report 버튼을 누르면 saved 상태로 생성)
    if (!finalProjectId) {
      const { data: project, error: projectError } = await adminClient
        .from('projects')
        .insert({
          user_id: user.id,
          name: productName,
          status: 'saved', // Save Report 버튼을 누르면 saved 상태로 생성
        })
        .select()
        .single();

      if (projectError) {
        console.error('[Save Project] Failed to create project:', projectError);
        return NextResponse.json(
          { ok: false, error: 'Failed to create project' },
          { status: 500 }
        );
      }

      finalProjectId = project.id;
    } else {
      // 프로젝트가 있으면 이름 업데이트 및 saved 상태로 변경
      const { data: updatedProject, error: updateError } = await adminClient
        .from('projects')
        .update({
          name: productName,
          status: 'saved', // Save Report 버튼을 누르면 saved 상태로 변경
        })
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
    }

    // answers를 메시지로 저장 (선택적)
    if (answers && Object.keys(answers).length > 0) {
      // 주요 답변들을 하나의 메시지로 저장
      const answersText = Object.entries(answers)
        .filter(([key, value]) => value && value !== 'skip' && value !== 'Skip')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      if (answersText) {
        await adminClient
          .from('messages')
          .insert({
            project_id: finalProjectId,
            role: 'user',
            content: `Analysis Summary:\n${answersText}`,
          });
      }
    }

    return NextResponse.json({
      ok: true,
      project_id: finalProjectId,
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
