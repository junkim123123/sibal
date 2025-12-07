/**
 * Email Templates
 * 
 * NexSupply 이메일 알림 템플릿
 * 
 * 간단한 HTML 템플릿 (React Email 대신 직접 HTML 생성)
 */

interface AnalysisCompletedEmailProps {
  projectName: string;
  riskScore: number;
  link: string;
}

export function AnalysisCompletedEmail({
  projectName,
  riskScore,
  link,
}: AnalysisCompletedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 48px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">NexSupply 분석 완료</h1>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 12px;">
      <strong>${projectName}</strong> 소싱 분석이 완료되었습니다.
    </p>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 20px;">
      리스크 점수: <strong>${riskScore}/100</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
    <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 5px; margin: 20px 0;">
      분석 결과 보기
    </a>
    <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin-top: 32px;">
      NexSupply - AI-Powered Sourcing Intelligence
    </p>
  </div>
</body>
</html>
  `.trim();
}

interface MilestoneUpdatedEmailProps {
  projectName: string;
  newStatus: string;
  link: string;
}

export function MilestoneUpdatedEmail({
  projectName,
  newStatus,
  link,
}: MilestoneUpdatedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 48px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">프로젝트 진행 상황 업데이트</h1>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 12px;">
      <strong>${projectName}</strong> 프로젝트의 진행 상황이 업데이트되었습니다.
    </p>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 20px;">
      현재 단계: <strong>${newStatus}</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
    <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 5px; margin: 20px 0;">
      프로젝트 확인하기
    </a>
    <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin-top: 32px;">
      NexSupply - AI-Powered Sourcing Intelligence
    </p>
  </div>
</body>
</html>
  `.trim();
}

interface ImportantDocumentEmailProps {
  projectName: string;
  documentType: string;
  link: string;
}

export function ImportantDocumentEmail({
  projectName,
  documentType,
  link,
}: ImportantDocumentEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 48px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">중요 문서 도착</h1>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 12px;">
      <strong>${projectName}</strong> 프로젝트에 새로운 문서가 업로드되었습니다.
    </p>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 20px;">
      문서 유형: <strong>${documentType}</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
    <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 5px; margin: 20px 0;">
      문서 확인하기
    </a>
    <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin-top: 32px;">
      NexSupply - AI-Powered Sourcing Intelligence
    </p>
  </div>
</body>
</html>
  `.trim();
}

interface NewMessageEmailProps {
  projectName: string;
  managerName: string;
  messagePreview: string;
  link: string;
}

export function NewMessageEmail({
  projectName,
  managerName,
  messagePreview,
  link,
}: NewMessageEmailProps): string {
  // 메시지 미리보기 제한 (100자)
  const preview = messagePreview.length > 100 
    ? messagePreview.substring(0, 100) + '...' 
    : messagePreview;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 48px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">New Message from Your Manager</h1>
    <p style="font-size: 16px; line-height: 26px; color: #4a4a4a; margin-bottom: 12px;">
      You have a new message from <strong>${managerName}</strong> regarding your project:
    </p>
    <p style="font-size: 16px; line-height: 26px; color: #1a1a1a; margin-bottom: 12px; font-weight: 600;">
      ${projectName}
    </p>
    <div style="background-color: #f6f9fc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="font-size: 14px; line-height: 22px; color: #4a4a4a; margin: 0; font-style: italic;">
        "${preview}"
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
    <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 5px; margin: 20px 0;">
      View Message
    </a>
    <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin-top: 32px;">
      NexSupply - AI-Powered Sourcing Intelligence
    </p>
  </div>
</body>
</html>
  `.trim();
}

