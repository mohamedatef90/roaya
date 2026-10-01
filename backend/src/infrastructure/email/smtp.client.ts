import nodemailer from 'nodemailer';
import { config } from '../../config/environment.js';
import { EmailMessage } from '../../shared/types/index.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export async function sendSmtpEmail(message: EmailMessage): Promise<void> {
  const smtp = config.email.smtp;
  if (!smtp.host || !smtp.user || !smtp.pass) {
    throw new Error('SMTP host, username and password are required');
  }
  transporter ??= nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
  const result = await transporter.sendMail({
    ...message,
    from: { address: config.email.fromEmail, name: config.email.fromName },
  });
  if (!result.accepted?.length || result.rejected?.length) {
    throw new Error('SMTP server rejected the notification recipient');
  }
}
