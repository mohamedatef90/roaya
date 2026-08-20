import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { PackageType, Prisma } from '@prisma/client';
import { NotFoundError } from '../../domain/exceptions/index.js';

export interface CreatePackageDTO {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type?: PackageType;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  featuresEn: string[];
  featuresAr: string[];
  isFeatured?: boolean;
  badge?: string;
  badgeColor?: string;
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaLink?: string;
}

export interface UpdatePackageDTO extends Partial<CreatePackageDTO> {
  isActive?: boolean;
  order?: number;
}

export class PackageService {
  /**
   * Get all packages
   */
  async getPackages(includeInactive = false) {
    logger.info('Fetching packages', { includeInactive });

    const where: Prisma.ServicePackageWhereInput = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.servicePackage.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get package by ID
   */
  async getPackageById(id: string) {
    const pkg = await prisma.servicePackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    return pkg;
  }

  /**
   * Create new package
   */
  async createPackage(data: CreatePackageDTO) {
    logger.info('Creating new package', { nameEn: data.nameEn });

    // Get the highest order value
    const maxOrder = await prisma.servicePackage.aggregate({
      _max: { order: true },
    });

    const pkg = await prisma.servicePackage.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        type: data.type || PackageType.SUBSCRIPTION,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        currency: data.currency || 'USD',
        featuresEn: data.featuresEn,
        featuresAr: data.featuresAr,
        isFeatured: data.isFeatured || false,
        badge: data.badge,
        badgeColor: data.badgeColor,
        ctaTextEn: data.ctaTextEn,
        ctaTextAr: data.ctaTextAr,
        ctaLink: data.ctaLink,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    logger.info('Package created successfully', { packageId: pkg.id });
    return pkg;
  }

  /**
   * Update package
   */
  async updatePackage(id: string, data: UpdatePackageDTO) {
    logger.info('Updating package', { id });

    const existing = await prisma.servicePackage.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Package not found');
    }

    const pkg = await prisma.servicePackage.update({
      where: { id },
      data,
    });

    return pkg;
  }

  /**
   * Delete package
   */
  async deletePackage(id: string) {
    logger.info('Deleting package', { id });

    const existing = await prisma.servicePackage.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Package not found');
    }

    await prisma.servicePackage.delete({ where: { id } });
  }

  /**
   * Reorder packages
   */
  async reorderPackages(orderedIds: string[]) {
    logger.info('Reordering packages', { count: orderedIds.length });

    const updates = orderedIds.map((id, index) =>
      prisma.servicePackage.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

export const packageService = new PackageService();
