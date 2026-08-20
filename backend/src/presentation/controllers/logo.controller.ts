import { Request, Response, NextFunction } from 'express';
import { logoService } from '../../application/services/logo.service.js';
import { emailTemplateService } from '../../application/services/email-template.service.js';
import { logger } from '../../shared/utils/logger.js';
import { z } from 'zod';
import { LogoCategory, EmailTemplateCategory } from '@prisma/client';

// ===========================================
// LOGO VALIDATORS
// ===========================================

const logoQuerySchema = z.object({
  category: z.nativeEnum(LogoCategory).optional(),
  section: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

const imagePathOrUrl = z.string().min(1).refine(
  (val) => /^(https?:\/\/|\/|data:)/.test(val),
  { message: 'Must be a valid URL or asset path starting with /' }
);

const createLogoSchema = z.object({
  name: z.string().min(1).max(200),
  imageUrl: imagePathOrUrl,
  darkModeUrl: imagePathOrUrl.optional(),
  category: z.nativeEnum(LogoCategory),
  sections: z.array(z.string()).optional(),
  websiteUrl: z.string().url().optional(),
  altTextEn: z.string().optional(),
  altTextAr: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const updateLogoSchema = createLogoSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

// ===========================================
// EMAIL TEMPLATE VALIDATORS
// ===========================================

const emailTemplateQuerySchema = z.object({
  category: z.nativeEnum(EmailTemplateCategory).optional(),
  isActive: z.coerce.boolean().optional(),
});

const createEmailTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.nativeEnum(EmailTemplateCategory),
  subjectEn: z.string().min(1),
  subjectAr: z.string().min(1),
  contentHtmlEn: z.string().min(1),
  contentHtmlAr: z.string().min(1),
  contentTextEn: z.string().optional(),
  contentTextAr: z.string().optional(),
  variables: z.array(z.string()).optional(),
});

const updateEmailTemplateSchema = createEmailTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const sendTestEmailSchema = z.object({
  recipientEmail: z.string().email(),
  language: z.enum(['en', 'ar']).default('en'),
});

// ===========================================
// LOGO CONTROLLER
// ===========================================

export class LogoController {
  // --- LOGOS ---

  async getLogos(req: Request, res: Response, next: NextFunction) {
    try {
      const query = logoQuerySchema.parse(req.query);
      const logos = await logoService.getLogos({
        category: query.category,
        section: query.section,
        isActive: query.isActive,
      });

      res.json({ success: true, data: logos });
    } catch (error) {
      next(error);
    }
  }

  async getLogoById(req: Request, res: Response, next: NextFunction) {
    try {
      const logo = await logoService.getLogoById(req.params.id!);
      res.json({ success: true, data: logo });
    } catch (error) {
      next(error);
    }
  }

  async createLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createLogoSchema.parse(req.body);
      const logo = await logoService.createLogo({
        name: validated.name,
        imageUrl: validated.imageUrl,
        darkModeUrl: validated.darkModeUrl,
        category: validated.category,
        sections: validated.sections,
        websiteUrl: validated.websiteUrl,
        altTextEn: validated.altTextEn,
        altTextAr: validated.altTextAr,
        displayOrder: validated.displayOrder,
      });
      res.status(201).json({ success: true, data: logo });
    } catch (error) {
      next(error);
    }
  }

  async updateLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateLogoSchema.parse(req.body);
      const logo = await logoService.updateLogo(req.params.id!, data);
      res.json({ success: true, data: logo });
    } catch (error) {
      next(error);
    }
  }

  async deleteLogo(req: Request, res: Response, next: NextFunction) {
    try {
      await logoService.deleteLogo(req.params.id!);
      res.json({ success: true, message: 'Logo deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async reorderLogos(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = reorderSchema.parse(req.body);
      await logoService.reorderLogos(orderedIds);
      res.json({ success: true, message: 'Logos reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  async toggleLogoActive(req: Request, res: Response, next: NextFunction) {
    try {
      const logo = await logoService.toggleActive(req.params.id!);
      res.json({ success: true, data: logo });
    } catch (error) {
      next(error);
    }
  }

  // --- EMAIL TEMPLATES ---

  async getEmailTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const query = emailTemplateQuerySchema.parse(req.query);
      const templates = await emailTemplateService.getTemplates({
        category: query.category,
        isActive: query.isActive,
      });

      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  async getEmailTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await emailTemplateService.getTemplateById(req.params.id!);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async createEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createEmailTemplateSchema.parse(req.body);
      const template = await emailTemplateService.createTemplate({
        name: validated.name,
        category: validated.category,
        subjectEn: validated.subjectEn,
        subjectAr: validated.subjectAr,
        contentHtmlEn: validated.contentHtmlEn,
        contentHtmlAr: validated.contentHtmlAr,
        contentTextEn: validated.contentTextEn,
        contentTextAr: validated.contentTextAr,
        variables: validated.variables,
      });
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async updateEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateEmailTemplateSchema.parse(req.body);
      const template = await emailTemplateService.updateTemplate(req.params.id!, data);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      await emailTemplateService.deleteTemplate(req.params.id!);
      res.json({ success: true, message: 'Email template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async sendTestEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientEmail, language } = sendTestEmailSchema.parse(req.body);
      const result = await emailTemplateService.sendTestEmail(
        req.params.id!,
        recipientEmail,
        language
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleEmailTemplateActive(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await emailTemplateService.toggleActive(req.params.id!);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }
}

export const logoController = new LogoController();
