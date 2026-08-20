import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { LogoCategory, Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';

export interface LogoFilters {
  category?: LogoCategory;
  section?: string;
  isActive?: boolean;
}

export interface CreateLogoDTO {
  name: string;
  imageUrl: string;
  darkModeUrl?: string;
  category: LogoCategory;
  sections?: string[];
  websiteUrl?: string;
  altTextEn?: string;
  altTextAr?: string;
  displayOrder?: number;
}

export interface UpdateLogoDTO extends Partial<CreateLogoDTO> {
  isActive?: boolean;
}

export class LogoService {
  /**
   * Get logos with filters
   */
  async getLogos(filters: LogoFilters = {}) {
    logger.info('Fetching logos', { filters });

    const where: Prisma.LogoWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.section) {
      where.sections = {
        has: filters.section,
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const logos = await prisma.logo.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });

    return logos;
  }

  /**
   * Get logo by ID
   */
  async getLogoById(id: string) {
    const logo = await prisma.logo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundError('Logo not found');
    }

    return logo;
  }

  /**
   * Create new logo
   */
  async createLogo(data: CreateLogoDTO) {
    logger.info('Creating new logo', { name: data.name, category: data.category });

    const logo = await prisma.logo.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        darkModeUrl: data.darkModeUrl,
        category: data.category,
        sections: data.sections || [],
        websiteUrl: data.websiteUrl,
        altTextEn: data.altTextEn,
        altTextAr: data.altTextAr,
        displayOrder: data.displayOrder ?? 0,
      },
    });

    logger.info('Logo created successfully', { logoId: logo.id });
    return logo;
  }

  /**
   * Update logo
   */
  async updateLogo(id: string, data: UpdateLogoDTO) {
    logger.info('Updating logo', { id });

    const existing = await prisma.logo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Logo not found');
    }

    const logo = await prisma.logo.update({
      where: { id },
      data,
    });

    return logo;
  }

  /**
   * Delete logo
   */
  async deleteLogo(id: string) {
    logger.info('Deleting logo', { id });

    const existing = await prisma.logo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Logo not found');
    }

    await prisma.logo.delete({ where: { id } });
  }

  /**
   * Reorder logos
   */
  async reorderLogos(orderedIds: string[]) {
    logger.info('Reordering logos', { count: orderedIds.length });

    const updates = orderedIds.map((id, index) =>
      prisma.logo.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await prisma.$transaction(updates);
  }

  /**
   * Toggle logo active status
   */
  async toggleActive(id: string) {
    const logo = await this.getLogoById(id);

    return prisma.logo.update({
      where: { id },
      data: { isActive: !logo.isActive },
    });
  }
}

export const logoService = new LogoService();
