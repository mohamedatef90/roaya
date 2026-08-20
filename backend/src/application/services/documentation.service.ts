import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { NotFoundError, ConflictError, ValidationError } from '../../domain/exceptions/index.js';
import { DocAccessLevel, Prisma } from '@prisma/client';

interface CreateCategoryDTO {
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateCategoryDTO {
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface CreatePageDTO {
  titleEn: string;
  titleAr: string;
  slug: string;
  contentEn: string;
  contentAr: string;
  categoryId: string;
  accessLevel?: DocAccessLevel;
  isPublished?: boolean;
  version?: string;
  displayOrder?: number;
}

interface UpdatePageDTO {
  titleEn?: string;
  titleAr?: string;
  slug?: string;
  contentEn?: string;
  contentAr?: string;
  categoryId?: string;
  accessLevel?: DocAccessLevel;
  isPublished?: boolean;
  version?: string;
  displayOrder?: number;
}

interface PageFilters {
  categoryId?: string;
  isPublished?: boolean;
  accessLevel?: DocAccessLevel;
  search?: string;
}

export class DocumentationService {
  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================

  async getCategories(includePages = false) {
    const categories = await prisma.docCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            pages: includePages
              ? {
                  where: { isPublished: true },
                  orderBy: { displayOrder: 'asc' },
                  select: {
                    id: true,
                    titleEn: true,
                    titleAr: true,
                    slug: true,
                    accessLevel: true,
                    viewCount: true,
                  },
                }
              : false,
          },
        },
        pages: includePages
          ? {
              where: { isPublished: true },
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                titleEn: true,
                titleAr: true,
                slug: true,
                accessLevel: true,
                viewCount: true,
              },
            }
          : false,
      },
    });

    // Build hierarchical tree (root categories only)
    const tree = categories.filter((cat) => !cat.parentId);

    logger.info('Retrieved category tree', { count: tree.length });
    return tree;
  }

  async getCategoryById(id: string) {
    const category = await prisma.docCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        pages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    return category;
  }

  async createCategory(data: CreateCategoryDTO) {
    // Check slug uniqueness
    const existing = await prisma.docCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictError(`Category with slug '${data.slug}' already exists`);
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await prisma.docCategory.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundError(`Parent category with id ${data.parentId} not found`);
      }
    }

    const category = await prisma.docCategory.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        slug: data.slug,
        parentId: data.parentId,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      },
      include: {
        parent: true,
      },
    });

    logger.info('Category created', { categoryId: category.id, slug: category.slug });
    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryDTO) {
    const existing = await this.getCategoryById(id);

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const conflicting = await prisma.docCategory.findUnique({
        where: { slug: data.slug },
      });

      if (conflicting) {
        throw new ConflictError(`Category with slug '${data.slug}' already exists`);
      }
    }

    // Prevent setting self as parent
    if (data.parentId === id) {
      throw new ValidationError('Cannot set category as its own parent');
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await prisma.docCategory.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundError(`Parent category with id ${data.parentId} not found`);
      }

      // Check for circular reference
      await this.checkCircularReference(id, data.parentId);
    }

    const category = await prisma.docCategory.update({
      where: { id },
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        slug: data.slug,
        parentId: data.parentId === null ? null : data.parentId,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    logger.info('Category updated', { categoryId: id });
    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);

    // Check if category has pages
    if (category.pages.length > 0) {
      throw new ConflictError(
        `Cannot delete category with ${category.pages.length} pages. Please move or delete pages first.`
      );
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new ConflictError(
        `Cannot delete category with ${category.children.length} sub-categories. Please move or delete sub-categories first.`
      );
    }

    await prisma.docCategory.delete({ where: { id } });
    logger.info('Category deleted', { categoryId: id });
  }

  async reorderCategories(orderedIds: string[]) {
    // Validate all IDs exist
    const categories = await prisma.docCategory.findMany({
      where: { id: { in: orderedIds } },
    });

    if (categories.length !== orderedIds.length) {
      throw new ValidationError('Some category IDs are invalid');
    }

    // Update display order
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.docCategory.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    logger.info('Categories reordered', { count: orderedIds.length });
  }

  // ============================================
  // PAGE MANAGEMENT
  // ============================================

  async getPages(filters: PageFilters) {
    const where: Prisma.DocPageWhereInput = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    if (filters.accessLevel) {
      where.accessLevel = filters.accessLevel;
    }

    if (filters.search) {
      where.OR = [
        { titleEn: { contains: filters.search, mode: 'insensitive' } },
        { titleAr: { contains: filters.search, mode: 'insensitive' } },
        { contentEn: { contains: filters.search, mode: 'insensitive' } },
        { contentAr: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const pages = await prisma.docPage.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });

    logger.info('Retrieved pages', { count: pages.length, filters });
    return pages;
  }

  async getPageById(id: string) {
    const page = await prisma.docPage.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
            parentId: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError(`Page with id ${id} not found`);
    }

    return page;
  }

  async getPageBySlug(slug: string) {
    const page = await prisma.docPage.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
            parentId: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError(`Page with slug '${slug}' not found`);
    }

    // Only return published pages for public access
    if (!page.isPublished) {
      throw new NotFoundError(`Page with slug '${slug}' not found`);
    }

    // Increment view count
    await prisma.docPage.update({
      where: { id: page.id },
      data: { viewCount: { increment: 1 } },
    });

    return page;
  }

  async createPage(data: CreatePageDTO) {
    // Check slug uniqueness
    const existing = await prisma.docPage.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictError(`Page with slug '${data.slug}' already exists`);
    }

    // Validate category exists
    const category = await prisma.docCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError(`Category with id ${data.categoryId} not found`);
    }

    const page = await prisma.docPage.create({
      data: {
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        slug: data.slug,
        contentEn: data.contentEn,
        contentAr: data.contentAr,
        categoryId: data.categoryId,
        accessLevel: data.accessLevel ?? DocAccessLevel.PUBLIC,
        isPublished: data.isPublished ?? false,
        version: data.version ?? '1.0',
        displayOrder: data.displayOrder ?? 0,
      },
      include: {
        category: true,
      },
    });

    logger.info('Page created', { pageId: page.id, slug: page.slug });
    return page;
  }

  async updatePage(id: string, data: UpdatePageDTO) {
    const existing = await this.getPageById(id);

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const conflicting = await prisma.docPage.findUnique({
        where: { slug: data.slug },
      });

      if (conflicting) {
        throw new ConflictError(`Page with slug '${data.slug}' already exists`);
      }
    }

    // Validate category if changing
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await prisma.docCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundError(`Category with id ${data.categoryId} not found`);
      }
    }

    const page = await prisma.docPage.update({
      where: { id },
      data: {
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        slug: data.slug,
        contentEn: data.contentEn,
        contentAr: data.contentAr,
        categoryId: data.categoryId,
        accessLevel: data.accessLevel,
        isPublished: data.isPublished,
        version: data.version,
        displayOrder: data.displayOrder,
      },
      include: {
        category: true,
      },
    });

    logger.info('Page updated', { pageId: id });
    return page;
  }

  async deletePage(id: string) {
    await this.getPageById(id);
    await prisma.docPage.delete({ where: { id } });
    logger.info('Page deleted', { pageId: id });
  }

  async duplicatePage(id: string) {
    const original = await this.getPageById(id);

    // Generate unique slug
    let newSlug = `${original.slug}-copy`;
    let counter = 1;

    while (await prisma.docPage.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copy-${counter}`;
      counter++;
    }

    const duplicate = await prisma.docPage.create({
      data: {
        titleEn: `${original.titleEn} (Copy)`,
        titleAr: `${original.titleAr} (نسخة)`,
        slug: newSlug,
        contentEn: original.contentEn,
        contentAr: original.contentAr,
        categoryId: original.categoryId,
        accessLevel: original.accessLevel,
        isPublished: false, // Always create as draft
        version: '1.0',
        displayOrder: original.displayOrder + 1,
      },
      include: {
        category: true,
      },
    });

    logger.info('Page duplicated', { originalId: id, duplicateId: duplicate.id });
    return duplicate;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async checkCircularReference(categoryId: string, newParentId: string): Promise<void> {
    let currentId: string | null = newParentId;

    while (currentId) {
      if (currentId === categoryId) {
        throw new ValidationError('Circular reference detected in category hierarchy');
      }

      const parent: { parentId: string | null } | null = await prisma.docCategory.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parent?.parentId ?? null;
    }
  }
}

export const documentationService = new DocumentationService();
