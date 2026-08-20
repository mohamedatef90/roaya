import { z } from 'zod';
import { DocAccessLevel } from '@prisma/client';

// Category schemas
export const createCategorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(255),
  nameAr: z.string().min(1, 'Arabic name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parentId: z.string().uuid('Invalid parent category ID').optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  nameEn: z.string().min(1).max(255).optional(),
  nameAr: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  parentId: z.string().uuid('Invalid parent category ID').nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string().uuid('Invalid category ID')).min(1, 'At least one category ID is required'),
});

export const categoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

// Page schemas
export const createPageSchema = z.object({
  titleEn: z.string().min(1, 'English title is required').max(500),
  titleAr: z.string().min(1, 'Arabic title is required').max(500),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  contentEn: z.string().min(1, 'English content is required'),
  contentAr: z.string().min(1, 'Arabic content is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  accessLevel: z.nativeEnum(DocAccessLevel).default(DocAccessLevel.PUBLIC),
  isPublished: z.boolean().default(false),
  version: z.string().max(20).default('1.0'),
  displayOrder: z.number().int().min(0).default(0),
});

export const updatePageSchema = z.object({
  titleEn: z.string().min(1).max(500).optional(),
  titleAr: z.string().min(1).max(500).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  contentEn: z.string().min(1).optional(),
  contentAr: z.string().min(1).optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  accessLevel: z.nativeEnum(DocAccessLevel).optional(),
  isPublished: z.boolean().optional(),
  version: z.string().max(20).optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const pageIdSchema = z.object({
  id: z.string().uuid('Invalid page ID'),
});

export const pageSlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const pageFiltersSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  isPublished: z.string().optional(),
  accessLevel: z.nativeEnum(DocAccessLevel).optional(),
  search: z.string().max(255).optional(),
  includePages: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageFiltersInput = z.infer<typeof pageFiltersSchema>;
