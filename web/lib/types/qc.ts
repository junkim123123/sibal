/**
 * QC Report Types
 * 
 * Interactive QC Report 기능을 위한 TypeScript 타입 정의
 */

export type QCReportStatus = 'draft' | 'published' | 'approved' | 'rejected';
export type QCItemStatus = 'pass' | 'fail' | 'warning';

/**
 * QC Report (검수 보고서)
 */
export interface QCReport {
  id: string;
  project_id: string;
  title: string;
  status: QCReportStatus;
  total_quantity: number;
  passed_quantity: number;
  defect_quantity: number;
  defect_rate: number;
  manager_note: string | null;
  client_feedback: string | null;
  inspection_date: string | null; // ISO date string
  created_at: string;
  updated_at: string;
}

/**
 * QC Report Item (검수 항목)
 */
export interface QCReportItem {
  id: string;
  report_id: string;
  category: string;
  description: string;
  status: QCItemStatus;
  image_urls: string[];
  manager_comment: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * QC Report with Items (항목 포함 전체 리포트)
 */
export interface QCReportWithItems extends QCReport {
  items: QCReportItem[];
}

/**
 * Create QC Report Input
 */
export interface CreateQCReportInput {
  project_id: string;
  title: string;
  total_quantity: number;
  passed_quantity: number;
  defect_quantity: number;
  manager_note?: string;
  inspection_date?: string;
}

/**
 * Update QC Report Input
 */
export interface UpdateQCReportInput {
  title?: string;
  total_quantity?: number;
  passed_quantity?: number;
  defect_quantity?: number;
  defect_rate?: number;
  manager_note?: string;
  inspection_date?: string;
}

/**
 * Create QC Report Item Input
 */
export interface CreateQCReportItemInput {
  report_id: string;
  category: string;
  description: string;
  status: QCItemStatus;
  image_urls?: string[];
  manager_comment?: string;
}

/**
 * Update QC Report Item Input
 */
export interface UpdateQCReportItemInput {
  category?: string;
  description?: string;
  status?: QCItemStatus;
  image_urls?: string[];
  manager_comment?: string;
}

/**
 * Review QC Report Input (클라이언트 승인/거절)
 */
export interface ReviewQCReportInput {
  report_id: string;
  status: 'approved' | 'rejected';
  client_feedback?: string;
}

