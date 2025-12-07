/**
 * Nodemailer Email Client
 * 
 * Google SMTP를 사용한 이메일 발송 클라이언트
 */

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

/**
 * Nodemailer Transporter를 초기화하고 반환합니다.
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error(
      'GMAIL_USER and GMAIL_APP_PASSWORD must be set in your .env.local file. ' +
      'Please follow the guide to create a Google App Password.'
    );
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  return transporter;
}

/**
 * 이메일 발송 함수
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;

  if (!gmailUser) {
    throw new Error('GMAIL_USER is not set');
  }

  const mailOptions = {
    from: `"NexSupply Manager" <${gmailUser}>`,
    to,
    subject,
    html,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}

/**
 * 발신자 이메일 주소를 반환합니다.
 */
export function getFromEmail(): string {
  const gmailUser = process.env.GMAIL_USER;
  if (!gmailUser) {
    throw new Error('GMAIL_USER is not set');
  }
  return gmailUser;
}
