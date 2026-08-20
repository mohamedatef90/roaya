import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';

export interface CreateTestimonialDTO {
  quoteEn: string;
  quoteAr: string;
  authorName: string;
  authorTitleEn: string;
  authorTitleAr: string;
  authorCompany?: string;
  authorPhoto?: string;
  rating?: number;
  service?: string;
  industry?: string;
}

export interface UpdateTestimonialDTO extends Partial<CreateTestimonialDTO> {
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
}

export class TestimonialService {
  /**
   * Get all testimonials
   */
  async getTestimonials(
    includeInactive = false,
    featuredOnly = false,
    service?: string,
    industry?: string
  ) {
    logger.info('Fetching testimonials', { includeInactive, featuredOnly, service, industry });

    const where: Prisma.TestimonialWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    if (service) {
      where.service = service;
    }

    if (industry) {
      where.industry = industry;
    }

    return prisma.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get testimonial by ID
   */
  async getTestimonialById(id: string) {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundError('Testimonial not found');
    }

    return testimonial;
  }

  /**
   * Create new testimonial
   */
  async createTestimonial(data: CreateTestimonialDTO) {
    logger.info('Creating new testimonial', { authorName: data.authorName });

    // Get the highest order value
    const maxOrder = await prisma.testimonial.aggregate({
      _max: { order: true },
    });

    const testimonial = await prisma.testimonial.create({
      data: {
        quoteEn: data.quoteEn,
        quoteAr: data.quoteAr,
        authorName: data.authorName,
        authorTitleEn: data.authorTitleEn,
        authorTitleAr: data.authorTitleAr,
        authorCompany: data.authorCompany,
        authorPhoto: data.authorPhoto,
        rating: data.rating || 5,
        service: data.service,
        industry: data.industry,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    logger.info('Testimonial created successfully', { testimonialId: testimonial.id });
    return testimonial;
  }

  /**
   * Update testimonial
   */
  async updateTestimonial(id: string, data: UpdateTestimonialDTO) {
    logger.info('Updating testimonial', { id });

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Testimonial not found');
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    return testimonial;
  }

  /**
   * Delete testimonial
   */
  async deleteTestimonial(id: string) {
    logger.info('Deleting testimonial', { id });

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Testimonial not found');
    }

    await prisma.testimonial.delete({ where: { id } });
  }

  /**
   * Reorder testimonials
   */
  async reorderTestimonials(orderedIds: string[]) {
    logger.info('Reordering testimonials', { count: orderedIds.length });

    const updates = orderedIds.map((id, index) =>
      prisma.testimonial.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      throw new NotFoundError('Testimonial not found');
    }

    return prisma.testimonial.update({
      where: { id },
      data: { isFeatured: !testimonial.isFeatured },
    });
  }
}

export const testimonialService = new TestimonialService();
