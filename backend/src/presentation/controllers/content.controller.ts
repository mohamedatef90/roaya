import { Request, Response, NextFunction } from 'express';
import { contentService } from '../../application/services/content.service.js';
import { packageService } from '../../application/services/package.service.js';
import { teamService } from '../../application/services/team.service.js';
import { testimonialService } from '../../application/services/testimonial.service.js';
import { logger } from '../../shared/utils/logger.js';
import { z } from 'zod';
import { ContentType, ContentStatus, PackageType } from '@prisma/client';

// ===========================================
// CONTENT VALIDATORS
// ===========================================

const contentQuerySchema = z.object({
  type: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const createContentSchema = z.object({
  type: z.nativeEnum(ContentType),
  titleEn: z.string().min(1).max(500),
  titleAr: z.string().min(1).max(500),
  slugEn: z.string().min(1).max(500),
  slugAr: z.string().min(1).max(500),
  excerptEn: z.string().optional(),
  excerptAr: z.string().optional(),
  contentEn: z.string().min(1),
  contentAr: z.string().min(1),
  featuredImage: z.string().min(1).refine(
    (val) => /^(https?:\/\/|\/|data:)/.test(val),
    { message: 'Must be a valid URL or asset path starting with /' }
  ).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitleEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescEn: z.string().optional(),
  metaDescAr: z.string().optional(),
});

const updateContentSchema = createContentSchema.partial().extend({
  status: z.nativeEnum(ContentStatus).optional(),
});

// ===========================================
// PACKAGE VALIDATORS
// ===========================================

const createPackageSchema = z.object({
  nameEn: z.string().min(1).max(200),
  nameAr: z.string().min(1).max(200),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: z.nativeEnum(PackageType).optional(),
  priceMonthly: z.number().min(0).optional(),
  priceYearly: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  featuresEn: z.array(z.string()),
  featuresAr: z.array(z.string()),
  isFeatured: z.boolean().optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  ctaTextEn: z.string().optional(),
  ctaTextAr: z.string().optional(),
  ctaLink: z.string().optional(),
});

// ===========================================
// TEAM VALIDATORS
// ===========================================

const createTeamMemberSchema = z.object({
  nameEn: z.string().min(1).max(200),
  nameAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  titleAr: z.string().min(1).max(200),
  bioEn: z.string().optional(),
  bioAr: z.string().optional(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().optional(),
  photoUrl: z.string().min(1).refine(
    (val) => /^(https?:\/\/|\/|data:)/.test(val),
    { message: 'Must be a valid URL or asset path starting with /' }
  ).optional(),
  department: z.string().optional(),
});

// ===========================================
// TESTIMONIAL VALIDATORS
// ===========================================

const createTestimonialSchema = z.object({
  quoteEn: z.string().min(1),
  quoteAr: z.string().min(1),
  authorName: z.string().min(1).max(200),
  authorTitleEn: z.string().min(1).max(200),
  authorTitleAr: z.string().min(1).max(200),
  authorCompany: z.string().optional(),
  authorPhoto: z.string().min(1).refine(
    (val) => /^(https?:\/\/|\/|data:)/.test(val),
    { message: 'Must be a valid URL or asset path starting with /' }
  ).optional(),
  rating: z.number().min(1).max(5).optional(),
  service: z.string().optional(),
  industry: z.string().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});

// ===========================================
// CONTENT CONTROLLER
// ===========================================

export class ContentController {
  // --- CONTENT ITEMS ---

  async getContents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = contentQuerySchema.parse(req.query);
      const { contents, meta } = await contentService.getContents(
        { type: query.type, status: query.status, category: query.category, search: query.search },
        query.page,
        query.limit
      );

      res.json({ success: true, data: contents, meta });
    } catch (error) {
      next(error);
    }
  }

  async getContentById(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.getContentById(req.params.id!);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async createContent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createContentSchema.parse(req.body);
      const content = await contentService.createContent({
        ...data,
        authorId: (req as any).user.id,
      });
      res.status(201).json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateContentSchema.parse(req.body);
      const content = await contentService.updateContent(req.params.id!, data);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async deleteContent(req: Request, res: Response, next: NextFunction) {
    try {
      await contentService.deleteContent(req.params.id!);
      res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async publishContent(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.publishContent(req.params.id!);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async unpublishContent(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.unpublishContent(req.params.id!);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  // --- PACKAGES ---

  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const packages = await packageService.getPackages(includeInactive);
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  async getPackageById(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await packageService.getPackageById(req.params.id!);
      res.json({ success: true, data: pkg });
    } catch (error) {
      next(error);
    }
  }

  async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPackageSchema.parse(req.body);
      const pkg = await packageService.createPackage(data);
      res.status(201).json({ success: true, data: pkg });
    } catch (error) {
      next(error);
    }
  }

  async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPackageSchema.partial().parse(req.body);
      const pkg = await packageService.updatePackage(req.params.id!, data);
      res.json({ success: true, data: pkg });
    } catch (error) {
      next(error);
    }
  }

  async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      await packageService.deletePackage(req.params.id!);
      res.json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async reorderPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = reorderSchema.parse(req.body);
      await packageService.reorderPackages(orderedIds);
      res.json({ success: true, message: 'Packages reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  // --- TEAM ---

  async getTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const department = req.query.department as string | undefined;
      const members = await teamService.getTeamMembers(includeInactive, department);
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await teamService.getTeamMemberById(req.params.id!);
      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async createTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamMemberSchema.parse(req.body);
      const member = await teamService.createTeamMember(data);
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async updateTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamMemberSchema.partial().parse(req.body);
      const member = await teamService.updateTeamMember(req.params.id!, data);
      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async deleteTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      await teamService.deleteTeamMember(req.params.id!);
      res.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async reorderTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = reorderSchema.parse(req.body);
      await teamService.reorderTeamMembers(orderedIds);
      res.json({ success: true, message: 'Team members reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await teamService.getDepartments();
      res.json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  }

  // --- TESTIMONIALS ---

  async getTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const featuredOnly = req.query.featured === 'true';
      const service = req.query.service as string | undefined;
      const industry = req.query.industry as string | undefined;

      const testimonials = await testimonialService.getTestimonials(
        includeInactive,
        featuredOnly,
        service,
        industry
      );
      res.json({ success: true, data: testimonials });
    } catch (error) {
      next(error);
    }
  }

  async getTestimonialById(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonial = await testimonialService.getTestimonialById(req.params.id!);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      next(error);
    }
  }

  async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTestimonialSchema.parse(req.body);
      const testimonial = await testimonialService.createTestimonial(data);
      res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
      next(error);
    }
  }

  async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTestimonialSchema.partial().parse(req.body);
      const testimonial = await testimonialService.updateTestimonial(req.params.id!, data);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      next(error);
    }
  }

  async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      await testimonialService.deleteTestimonial(req.params.id!);
      res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async reorderTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = reorderSchema.parse(req.body);
      await testimonialService.reorderTestimonials(orderedIds);
      res.json({ success: true, message: 'Testimonials reordered successfully' });
    } catch (error) {
      next(error);
    }
  }

  async toggleTestimonialFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonial = await testimonialService.toggleFeatured(req.params.id!);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      next(error);
    }
  }
}

export const contentController = new ContentController();
