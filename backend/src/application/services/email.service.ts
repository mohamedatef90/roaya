import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';
import { prisma } from '../../config/database.js';
import { sendgridClient } from '../../infrastructure/email/sendgrid.client.js';
import { sendSmtpEmail } from '../../infrastructure/email/smtp.client.js';
import { renderFormNotification } from '../../infrastructure/email/form-notification.template.js';
import { EmailMessage, EmailTemplateData } from '../../shared/types/index.js';

export class EmailService {
  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      if (config.email.smtp.host) {
        await sendSmtpEmail(message);
      } else {
        if (!config.email.sendgridApiKey) throw new Error('Email delivery provider is not configured');
        await sendgridClient.send({
        to: message.to,
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName,
        },
        subject: message.subject,
        html: message.html,
        text: message.text,
        });
      }

      logger.info('Email sent successfully', { to: message.to, subject: message.subject });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, to: message.to });
      return false;
    }
  }

  async sendTemplatedEmail(
    templateName: string,
    to: string,
    data: EmailTemplateData,
    language: 'en' | 'ar' = 'en'
  ): Promise<boolean> {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template || !template.isActive) {
      logger.error('Email template not found or inactive', { templateName });
      return false;
    }

    // Select language-specific content
    const subject = language === 'en' ? template.subjectEn : template.subjectAr;
    const html = language === 'en' ? template.contentHtmlEn : template.contentHtmlAr;
    const text = language === 'en' ? template.contentTextEn : template.contentTextAr;

    const interpolatedSubject = this.interpolateTemplate(subject, data);
    const interpolatedHtml = this.interpolateTemplate(html, data);
    const interpolatedText = text ? this.interpolateTemplate(text, data) : undefined;

    return this.sendEmail({
      to,
      subject: interpolatedSubject,
      html: interpolatedHtml,
      text: interpolatedText || ''
    });
  }

  async sendLeadConfirmationEmail(lead: {
    email: string;
    firstName: string;
  }): Promise<boolean> {
    return this.sendTemplatedEmail('lead_confirmation', lead.email, {
      firstName: lead.firstName,
      email: lead.email,
    });
  }

  async sendAdminNewLeadNotification(lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    source: string;
    message?: string | null;
    id: string;
    formData?: unknown;
    createdAt?: Date | string;
  }): Promise<boolean> {
    const adminUrl = `${config.cors.origin}/admin/leads/${lead.id}`;
    
    const { html, text } = renderFormNotification(lead, adminUrl);
    return this.sendEmail({ to: config.email.adminEmail, subject: 'Roaya - New form submission', text, html });
  }

  async sendROICalculatorResults(lead: {
    email: string;
    firstName: string;
    estimatedValue?: number | null;
  }): Promise<boolean> {
    if (!lead.estimatedValue) {
      return false;
    }

    const bookingUrl = `${config.cors.origin}/contact?source=roi-calculator`;

    return this.sendTemplatedEmail('roi_calculator_results', lead.email, {
      firstName: lead.firstName,
      estimatedValue: lead.estimatedValue.toLocaleString(),
      bookingUrl,
    });
  }

  private interpolateTemplate(
    template: string,
    data: EmailTemplateData
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }
}

export const emailService = new EmailService();
