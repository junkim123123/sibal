/**
 * Email Sender Utility
 * 
 * 스마트 알림 시스템 - 중요한 비즈니스 이벤트에만 이메일 발송
 */

import { sendEmail } from './client';
import { 
  AnalysisCompletedEmail, 
  MilestoneUpdatedEmail, 
  ImportantDocumentEmail 
} from './templates';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * 알림 제어를 위한 Throttle 체크
 * 동일 프로젝트에 대해 1시간 이내 중복 알림 방지
 */
async function shouldSendNotification(projectId: string, notificationType: string): Promise<boolean> {
  try {
    const adminClient = getAdminClient();
    
    // 프로젝트의 마지막 알림 시간 확인
    const { data: project } = await adminClient
      .from('projects')
      .select('last_notification_sent_at, last_notification_type')
      .eq('id', projectId)
      .single();

    if (!project) return true;

    // 마지막 알림이 1시간 이내이고 같은 타입이면 스킵
    if (project.last_notification_sent_at) {
      const lastSent = new Date(project.last_notification_sent_at);
      const now = new Date();
      const hoursSinceLastNotification = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastNotification < 1 && project.last_notification_type === notificationType) {
        console.log(`[Email] Throttled: ${notificationType} for project ${projectId}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[Email] Error checking notification throttle:', error);
    return true; // 에러 시 발송 허용 (안전 장치)
  }
}

/**
 * 알림 발송 시간 업데이트
 */
async function updateNotificationTimestamp(projectId: string, notificationType: string) {
  try {
    const adminClient = getAdminClient();
    await adminClient
      .from('projects')
      .update({
        last_notification_sent_at: new Date().toISOString(),
        last_notification_type: notificationType,
      })
      .eq('id', projectId);
  } catch (error) {
    console.error('[Email] Failed to update notification timestamp:', error);
  }
}

/**
 * 분석 완료 알림 발송
 */
export async function sendAnalysisCompletedEmail(
  projectId: string,
  userEmail: string,
  projectName: string,
  riskScore: number
): Promise<boolean> {
  if (!userEmail) {
    console.log('[Email] No user email provided, skipping notification');
    return false;
  }

  // Throttle 체크
  if (!(await shouldSendNotification(projectId, 'analysis_completed'))) {
    return false;
  }

  try {
    // 결과 페이지 링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexsupply.net';
    const link = `${baseUrl}/results?project_id=${projectId}`;

    // 이메일 HTML 생성
    const emailHtml = AnalysisCompletedEmail({
      projectName,
      riskScore,
      link,
    });

    // 이메일 발송
    await sendEmail({
      to: userEmail,
      subject: `[NexSupply] ${projectName} 분석 완료`,
      html: emailHtml,
    });

    // 알림 시간 업데이트
    await updateNotificationTimestamp(projectId, 'analysis_completed');

    console.log(`[Email] Analysis completed email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending analysis completed email:', error);
    return false;
  }
}

/**
 * 마일스톤 업데이트 알림 발송
 */
export async function sendMilestoneUpdatedEmail(
  projectId: string,
  userEmail: string,
  projectName: string,
  newStatus: string
): Promise<boolean> {
  if (!userEmail) {
    console.log('[Email] No user email provided, skipping notification');
    return false;
  }

  // Throttle 체크
  if (!(await shouldSendNotification(projectId, 'milestone_updated'))) {
    return false;
  }

  try {
    // 프로젝트 페이지 링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexsupply.net';
    const link = `${baseUrl}/results?project_id=${projectId}`;

    // 이메일 HTML 생성
    const emailHtml = MilestoneUpdatedEmail({
      projectName,
      newStatus,
      link,
    });

    // 이메일 발송
    await sendEmail({
      to: userEmail,
      subject: `[NexSupply] ${projectName} 진행 상황 업데이트`,
      html: emailHtml,
    });

    // 알림 시간 업데이트
    await updateNotificationTimestamp(projectId, 'milestone_updated');

    console.log(`[Email] Milestone updated email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending milestone updated email:', error);
    return false;
  }
}

/**
 * 중요 문서 업로드 알림 발송
 */
export async function sendImportantDocumentEmail(
  projectId: string,
  userEmail: string,
  projectName: string,
  documentType: string
): Promise<boolean> {
  if (!userEmail) {
    console.log('[Email] No user email provided, skipping notification');
    return false;
  }

  // Throttle 체크
  if (!(await shouldSendNotification(projectId, 'important_document'))) {
    return false;
  }

  try {
    // 프로젝트 페이지 링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexsupply.net';
    const link = `${baseUrl}/results?project_id=${projectId}`;

    // 이메일 HTML 생성
    const emailHtml = ImportantDocumentEmail({
      projectName,
      documentType,
      link,
    });

    // 이메일 발송
    await sendEmail({
      to: userEmail,
      subject: `[NexSupply] ${projectName} 중요 문서 도착`,
      html: emailHtml,
    });

    // 알림 시간 업데이트
    await updateNotificationTimestamp(projectId, 'important_document');

    console.log(`[Email] Important document email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending important document email:', error);
    return false;
  }
}

