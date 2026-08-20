import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { EmailTemplateCategory, Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';
import { emailService } from './email.service.js';

export interface EmailTemplateFilters {
  category?: EmailTemplateCategory;
  isActive?: boolean;
}

export interface CreateEmailTemplateDTO {
  name: string;
  category: EmailTemplateCategory;
  subjectEn: string;
  subjectAr: string;
  contentHtmlEn: string;
  contentHtmlAr: string;
  contentTextEn?: string;
  contentTextAr?: string;
  variables?: string[];
}

export interface UpdateEmailTemplateDTO extends Partial<CreateEmailTemplateDTO> {
  isActive?: boolean;
}

export class EmailTemplateService {
  /**
   * Get email templates with filters
   */
  async getTemplates(filters: EmailTemplateFilters = {}) {
    logger.info('Fetching email templates', { filters });

    const where: Prisma.EmailTemplateWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return templates;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError('Email template not found');
    }

    return template;
  }

  /**
   * Get template by name (for use in email sending)
   */
  async getTemplateByName(name: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      throw new NotFoundError(`Email template '${name}' not found`);
    }

    if (!template.isActive) {
      throw new NotFoundError(`Email template '${name}' is inactive`);
    }

    return template;
  }

  /**
   * Create new email template
   */
  async createTemplate(data: CreateEmailTemplateDTO) {
    logger.info('Creating new email template', { name: data.name, category: data.category });

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        subjectEn: data.subjectEn,
        subjectAr: data.subjectAr,
        contentHtmlEn: data.contentHtmlEn,
        contentHtmlAr: data.contentHtmlAr,
        contentTextEn: data.contentTextEn,
        contentTextAr: data.contentTextAr,
        variables: data.variables || [],
      },
    });

    logger.info('Email template created successfully', { templateId: template.id });
    return template;
  }

  /**
   * Update email template
   */
  async updateTemplate(id: string, data: UpdateEmailTemplateDTO) {
    logger.info('Updating email template', { id });

    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Email template not found');
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data,
    });

    return template;
  }

  /**
   * Delete email template
   */
  async deleteTemplate(id: string) {
    logger.info('Deleting email template', { id });

    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Email template not found');
    }

    await prisma.emailTemplate.delete({ where: { id } });
  }

  /**
   * Send test email using template
   */
  async sendTestEmail(id: string, recipientEmail: string, language: 'en' | 'ar' = 'en') {
    logger.info('Sending test email', { templateId: id, recipientEmail, language });

    const template = await this.getTemplateById(id);

    // Create sample data for variables
    const sampleData: Record<string, string> = {};
    template.variables.forEach((variable) => {
      sampleData[variable] = `[${variable}]`;
    });

    // Add common defaults
    sampleData['firstName'] = 'John';
    sampleData['lastName'] = 'Doe';
    sampleData['email'] = recipientEmail;
    sampleData['companyName'] = 'Acme Corp';
    sampleData['adminUrl'] = 'https://app.roaya.ai/admin';
    sampleData['bookingUrl'] = 'https://roaya.ai/contact';

    // Select language-specific content
    const subject = language === 'en' ? template.subjectEn : template.subjectAr;
    const html = language === 'en' ? template.contentHtmlEn : template.contentHtmlAr;
    const text = language === 'en' ? template.contentTextEn : template.contentTextAr;

    // Interpolate variables
    const interpolatedSubject = this.interpolateTemplate(subject, sampleData);
    const interpolatedHtml = this.interpolateTemplate(html, sampleData);
    const interpolatedText = text ? this.interpolateTemplate(text, sampleData) : undefined;

    // Send test email
    const success = await emailService.sendEmail({
      to: recipientEmail,
      subject: `[TEST] ${interpolatedSubject}`,
      html: interpolatedHtml,
      text: interpolatedText || '',
    });

    if (!success) {
      throw new Error('Failed to send test email');
    }

    logger.info('Test email sent successfully', { templateId: id, recipientEmail });
    return { success: true, message: 'Test email sent successfully' };
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, data: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Toggle template active status
   */
  async toggleActive(id: string) {
    const template = await this.getTemplateById(id);

    return prisma.emailTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });
  }
}

export const emailTemplateService = new EmailTemplateService();
