import { Request, Response, NextFunction } from 'express';
import { contentService } from '../../application/services/content.service.js';
import { packageService } from '../../application/services/package.service.js';
import { teamService } from '../../application/services/team.service.js';
import { testimonialService } from '../../application/services/testimonial.service.js';
import { z } from 'zod';
import { ContentType } from '@prisma/client';

const publicContentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  tag: z.string().optional(),
});

export class PublicContentController {
  /**
   * GET /content/blog — List published blog posts
   */
  async getBlogPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = publicContentQuerySchema.parse(req.query);
      const { contents, meta } = await contentService.getPublishedContents(
        ContentType.BLOG_POST,
        { category: query.category, search: query.search, tag: query.tag },
        query.page,
        query.limit
      );

      res.json({ success: true, data: contents, meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/blog/:slug — Get single published blog post by slug
   */
  async getBlogPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params['slug'] as string;
      const lang = (req.query['lang'] as 'en' | 'ar') || 'en';
      const content = await contentService.getContentBySlug(slug, lang, ContentType.BLOG_POST);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/case-studies — List published case studies
   */
  async getCaseStudies(req: Request, res: Response, next: NextFunction) {
    try {
      const query = publicContentQuerySchema.parse(req.query);
      const { contents, meta } = await contentService.getPublishedContents(
        ContentType.CASE_STUDY,
        { category: query.category, search: query.search, tag: query.tag },
        query.page,
        query.limit
      );

      res.json({ success: true, data: contents, meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/case-studies/:slug — Get single published case study by slug
   */
  async getCaseStudyBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params['slug'] as string;
      const lang = (req.query['lang'] as 'en' | 'ar') || 'en';
      const content = await contentService.getContentBySlug(slug, lang, ContentType.CASE_STUDY);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/packages — List active service packages (sorted by order)
   */
  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const packages = await packageService.getPackages(false); // false = active only
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/team — List active team members (sorted by order)
   */
  async getTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const department = req.query.department as string | undefined;
      const members = await teamService.getTeamMembers(false, department); // false = active only
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /content/testimonials — List active testimonials (optionally featured only)
   */
  async getTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const featuredOnly = req.query.featured === 'true';
      const service = req.query.service as string | undefined;
      const industry = req.query.industry as string | undefined;
      const testimonials = await testimonialService.getTestimonials(false, featuredOnly, service, industry); // false = active only
      res.json({ success: true, data: testimonials });
    } catch (error) {
      next(error);
    }
  }
}

export const publicContentController = new PublicContentController();
