/**
 * Sample Feedback Types
 * 
 * Sample Feedback with Image Annotation 기능을 위한 TypeScript 타입 정의
 */

export type SampleFeedbackStatus = 'pending' | 'approved' | 'changes_requested';

/**
 * Sample Feedback (샘플 회차)
 */
export interface SampleFeedback {
  id: string;
  project_id: string;
  round_number: number;
  overall_status: SampleFeedbackStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Sample Annotation (이미지 위 마킹)
 */
export interface SampleAnnotation {
  id: string;
  feedback_id: string;
  image_url: string;
  position_x: number; // 0-100 (%)
  position_y: number; // 0-100 (%)
  comment: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Sample Feedback with Annotations (주석 포함 전체 피드백)
 */
export interface SampleFeedbackWithAnnotations extends SampleFeedback {
  annotations: SampleAnnotation[];
}

/**
 * Create Sample Feedback Input
 */
export interface CreateSampleFeedbackInput {
  project_id: string;
  round_number: number;
  overall_status?: SampleFeedbackStatus;
}

/**
 * Update Sample Feedback Input
 */
export interface UpdateSampleFeedbackInput {
  overall_status?: SampleFeedbackStatus;
}

/**
 * Create Sample Annotation Input
 */
export interface CreateSampleAnnotationInput {
  feedback_id: string;
  image_url: string;
  position_x: number; // 0-100 (%)
  position_y: number; // 0-100 (%)
  comment: string;
}

/**
 * Update Sample Annotation Input
 */
export interface UpdateSampleAnnotationInput {
  comment?: string;
  is_resolved?: boolean;
}
