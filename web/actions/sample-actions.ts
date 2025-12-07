/**
 * Sample Feedback Server Actions
 * 
 * Sample Feedback with Image Annotation 기능을 위한 서버 액션
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import type {
  SampleFeedback,
  SampleAnnotation,
  SampleFeedbackWithAnnotations,
  CreateSampleFeedbackInput,
  UpdateSampleFeedbackInput,
  CreateSampleAnnotationInput,
  UpdateSampleAnnotationInput,
} from '@/lib/types/sample';

/**
 * 현재 사용자가 매니저인지 확인
 */
async function checkIsManager(userId: string): Promise<boolean> {
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_manager, email')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  // @nexsupply.net 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
  const userEmail = profile.email?.toLowerCase() || '';
  const isNexsupplyDomain = userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net';

  return profile.is_manager === true || isNexsupplyDomain;
}

/**
 * 프로젝트에 대한 권한 확인
 */
async function checkProjectAccess(
  projectId: string,
  userId: string,
  requireManager: boolean = false
): Promise<{ hasAccess: boolean; isManager: boolean }> {
  const adminClient = getAdminClient();
  const { data: project } = await adminClient
    .from('projects')
    .select('user_id, manager_id')
    .eq('id', projectId)
    .single();

  if (!project) {
    return { hasAccess: false, isManager: false };
  }

  const isManager = await checkIsManager(userId);
  const isOwner = project.user_id === userId;
  const isAssignedManager = project.manager_id === userId;

  if (requireManager) {
    return {
      hasAccess: isManager && isAssignedManager,
      isManager: isManager && isAssignedManager,
    };
  }

  return {
    hasAccess: isOwner || (isManager && isAssignedManager),
    isManager: isManager && isAssignedManager,
  };
}

/**
 * 샘플 피드백 생성
 */
export async function createSampleFeedback(
  input: CreateSampleFeedbackInput
): Promise<{ success: boolean; data?: SampleFeedback; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(input.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 샘플 피드백 생성
    const adminClient = getAdminClient();
    const { data: feedback, error: insertError } = await adminClient
      .from('sample_feedbacks')
      .insert({
        project_id: input.project_id,
        round_number: input.round_number,
        overall_status: input.overall_status || 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Create Sample Feedback] Failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/projects/${input.project_id}/samples`);
    return { success: true, data: feedback as SampleFeedback };
  } catch (error) {
    console.error('[Create Sample Feedback] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 샘플 피드백 조회 (주석 포함)
 */
export async function getSampleFeedback(
  feedbackId: string
): Promise<{ success: boolean; data?: SampleFeedbackWithAnnotations; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 피드백 조회
    const adminClient = getAdminClient();
    const { data: feedback, error: feedbackError } = await adminClient
      .from('sample_feedbacks')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return { success: false, error: 'Feedback not found' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(feedback.project_id, user.id);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this feedback' };
    }

    // 주석 조회
    const { data: annotations, error: annotationsError } = await adminClient
      .from('sample_annotations')
      .select('*')
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    if (annotationsError) {
      console.error('[Get Sample Feedback] Failed to fetch annotations:', annotationsError);
      return { success: false, error: annotationsError.message };
    }

    return {
      success: true,
      data: {
        ...(feedback as SampleFeedback),
        annotations: (annotations || []) as SampleAnnotation[],
      },
    };
  } catch (error) {
    console.error('[Get Sample Feedback] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 샘플 피드백 수정
 */
export async function updateSampleFeedback(
  feedbackId: string,
  input: UpdateSampleFeedbackInput
): Promise<{ success: boolean; data?: SampleFeedback; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 피드백 조회
    const adminClient = getAdminClient();
    const { data: feedback, error: feedbackError } = await adminClient
      .from('sample_feedbacks')
      .select('project_id')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return { success: false, error: 'Feedback not found' };
    }

    // 프로젝트 접근 권한 확인 (매니저 또는 소유자)
    const { hasAccess, isManager } = await checkProjectAccess(feedback.project_id, user.id);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 피드백 수정
    const { data: updatedFeedback, error: updateError } = await adminClient
      .from('sample_feedbacks')
      .update(input)
      .eq('id', feedbackId)
      .select()
      .single();

    if (updateError) {
      console.error('[Update Sample Feedback] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${feedback.project_id}/samples/${feedbackId}`);
    return { success: true, data: updatedFeedback as SampleFeedback };
  } catch (error) {
    console.error('[Update Sample Feedback] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 샘플 주석 생성
 */
export async function createSampleAnnotation(
  input: CreateSampleAnnotationInput
): Promise<{ success: boolean; data?: SampleAnnotation; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 피드백 조회
    const adminClient = getAdminClient();
    const { data: feedback, error: feedbackError } = await adminClient
      .from('sample_feedbacks')
      .select('project_id')
      .eq('id', input.feedback_id)
      .single();

    if (feedbackError || !feedback) {
      return { success: false, error: 'Feedback not found' };
    }

    // 프로젝트 소유자 확인 (클라이언트만 주석 생성 가능)
    const { hasAccess, isManager } = await checkProjectAccess(feedback.project_id, user.id);
    if (!hasAccess || isManager) {
      return { success: false, error: 'Forbidden: Only project owner can create annotations' };
    }

    // 좌표 유효성 검사
    if (input.position_x < 0 || input.position_x > 100 || input.position_y < 0 || input.position_y > 100) {
      return { success: false, error: 'Invalid position: coordinates must be between 0 and 100' };
    }

    // 주석 생성
    const { data: annotation, error: insertError } = await adminClient
      .from('sample_annotations')
      .insert({
        feedback_id: input.feedback_id,
        image_url: input.image_url,
        position_x: input.position_x,
        position_y: input.position_y,
        comment: input.comment,
        is_resolved: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Create Sample Annotation] Failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/projects/${feedback.project_id}/samples/${input.feedback_id}`);
    return { success: true, data: annotation as SampleAnnotation };
  } catch (error) {
    console.error('[Create Sample Annotation] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 샘플 주석 수정
 */
export async function updateSampleAnnotation(
  annotationId: string,
  input: UpdateSampleAnnotationInput
): Promise<{ success: boolean; data?: SampleAnnotation; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 주석 조회
    const adminClient = getAdminClient();
    const { data: annotation, error: annotationError } = await adminClient
      .from('sample_annotations')
      .select('feedback_id, sample_feedbacks!inner(project_id)')
      .eq('id', annotationId)
      .single();

    if (annotationError || !annotation) {
      return { success: false, error: 'Annotation not found' };
    }

    // 프로젝트 접근 권한 확인
    const projectId = (annotation as any).sample_feedbacks.project_id;
    const { hasAccess, isManager } = await checkProjectAccess(projectId, user.id);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 클라이언트는 comment만 수정 가능, 매니저는 is_resolved만 수정 가능
    const updateData: any = {};
    if (isManager) {
      if (input.is_resolved !== undefined) {
        updateData.is_resolved = input.is_resolved;
      }
    } else {
      if (input.comment !== undefined) {
        updateData.comment = input.comment;
      }
    }

    // 주석 수정
    const { data: updatedAnnotation, error: updateError } = await adminClient
      .from('sample_annotations')
      .update(updateData)
      .eq('id', annotationId)
      .select()
      .single();

    if (updateError) {
      console.error('[Update Sample Annotation] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/projects/${projectId}/samples/${annotation.feedback_id}`);
    return { success: true, data: updatedAnnotation as SampleAnnotation };
  } catch (error) {
    console.error('[Update Sample Annotation] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 샘플 주석 삭제
 */
export async function deleteSampleAnnotation(
  annotationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 주석 조회
    const adminClient = getAdminClient();
    const { data: annotation, error: annotationError } = await adminClient
      .from('sample_annotations')
      .select('feedback_id, sample_feedbacks!inner(project_id)')
      .eq('id', annotationId)
      .single();

    if (annotationError || !annotation) {
      return { success: false, error: 'Annotation not found' };
    }

    // 프로젝트 소유자 확인 (클라이언트만 삭제 가능)
    const projectId = (annotation as any).sample_feedbacks.project_id;
    const { hasAccess, isManager } = await checkProjectAccess(projectId, user.id);
    if (!hasAccess || isManager) {
      return { success: false, error: 'Forbidden: Only project owner can delete annotations' };
    }

    // 주석 삭제
    const { error: deleteError } = await adminClient
      .from('sample_annotations')
      .delete()
      .eq('id', annotationId);

    if (deleteError) {
      console.error('[Delete Sample Annotation] Failed:', deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath(`/projects/${projectId}/samples/${annotation.feedback_id}`);
    return { success: true };
  } catch (error) {
    console.error('[Delete Sample Annotation] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
