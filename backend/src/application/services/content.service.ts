import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { ContentType, ContentStatus, Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';
import { calculatePagination, getPaginationSkip } from '../../shared/utils/helpers.js';
import { PaginationMeta } from '../../shared/types/index.js';

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  search?: string;
}

export interface CreateContentDTO {
  type: ContentType;
  titleEn: string;
  titleAr: string;
  slugEn: string;
  slugAr: string;
  excerptEn?: string;
  excerptAr?: string;
  contentEn: string;
  contentAr: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  authorId: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescEn?: string;
  metaDescAr?: string;
}

export interface UpdateContentDTO extends Partial<CreateContentDTO> {
  status?: ContentStatus;
}

export class ContentService {
  /**
   * Get paginated content items
   */
  async getContents(
    filters: ContentFilters = {},
    page = 1,
    limit = 10
  ): Promise<{ contents: Prisma.ContentItemGetPayload<{}>[], meta: PaginationMeta }> {
    logger.info('Fetching content items', { filters, page, limit });

    const where: Prisma.ContentItemWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { titleEn: { contains: filters.search, mode: 'insensitive' } },
        { titleAr: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [total, contents] = await Promise.all([
      prisma.contentItem.count({ where }),
      prisma.contentItem.findMany({
        where,
        skip: getPaginationSkip({ page, limit }),
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      contents,
      meta: calculatePagination(total, { page, limit }),
    };
  }

  /**
   * Get published content items (public, no auth required)
   */
  async getPublishedContents(
    type: ContentType,
    filters: { category?: string; search?: string; tag?: string } = {},
    page = 1,
    limit = 10
  ): Promise<{ contents: Prisma.ContentItemGetPayload<{}>[], meta: PaginationMeta }> {
    const where: Prisma.ContentItemWhereInput = {
      type,
      status: ContentStatus.PUBLISHED,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { titleEn: { contains: filters.search, mode: 'insensitive' } },
        { titleAr: { contains: filters.search, mode: 'insensitive' } },
        { excerptEn: { contains: filters.search, mode: 'insensitive' } },
        { excerptAr: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    const skip = (page - 1) * limit;

    const [total, contents] = await Promise.all([
      prisma.contentItem.count({ where }),
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      contents,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get content by ID
   */
  async getContentById(id: string) {
    const content = await prisma.contentItem.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundError('Content not found');
    }

    return content;
  }

  /**
   * Get content by slug (for public view)
   */
  async getContentBySlug(slug: string, lang: 'en' | 'ar' = 'en') {
    const where: Prisma.ContentItemWhereInput = lang === 'en'
      ? { slugEn: slug, status: ContentStatus.PUBLISHED }
      : { slugAr: slug, status: ContentStatus.PUBLISHED };

    const content = await prisma.contentItem.findFirst({ where });

    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // Increment view count
    await prisma.contentItem.update({
      where: { id: content.id },
      data: { viewCount: { increment: 1 } },
    });

    return content;
  }

  /**
   * Create new content
   */
  async createContent(data: CreateContentDTO) {
    logger.info('Creating new content', { type: data.type, titleEn: data.titleEn });

    const content = await prisma.contentItem.create({
      data: {
        type: data.type,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        slugEn: data.slugEn,
        slugAr: data.slugAr,
        excerptEn: data.excerptEn,
        excerptAr: data.excerptAr,
        contentEn: data.contentEn,
        contentAr: data.contentAr,
        featuredImage: data.featuredImage,
        category: data.category,
        tags: data.tags || [],
        authorId: data.authorId,
        metaTitleEn: data.metaTitleEn,
        metaTitleAr: data.metaTitleAr,
        metaDescEn: data.metaDescEn,
        metaDescAr: data.metaDescAr,
      },
    });

    logger.info('Content created successfully', { contentId: content.id });
    return content;
  }

  /**
   * Update content
   */
  async updateContent(id: string, data: UpdateContentDTO) {
    logger.info('Updating content', { id });

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Content not found');
    }

    const content = await prisma.contentItem.update({
      where: { id },
      data,
    });

    return content;
  }

  /**
   * Delete content
   */
  async deleteContent(id: string) {
    logger.info('Deleting content', { id });

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Content not found');
    }

    await prisma.contentItem.delete({ where: { id } });
  }

  /**
   * Publish content
   */
  async publishContent(id: string) {
    logger.info('Publishing content', { id });

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Content not found');
    }

    const content = await prisma.contentItem.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return content;
  }

  /**
   * Unpublish content
   */
  async unpublishContent(id: string) {
    logger.info('Unpublishing content', { id });

    const content = await prisma.contentItem.update({
      where: { id },
      data: {
        status: ContentStatus.DRAFT,
        publishedAt: null,
      },
    });

    return content;
  }
}

export const contentService = new ContentService();
