import { z } from 'zod';
import { LeadStatus, LeadSource, LeadPriority } from '@prisma/client';

// Create lead schema (for public form submission)
export const createLeadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .optional()
    .transform((v) => v || undefined),
  company: z
    .string()
    .max(255, 'Company must be less than 255 characters')
    .optional()
    .transform((v) => v || undefined),
  jobTitle: z
    .string()
    .max(100, 'Job title must be less than 100 characters')
    .optional()
    .transform((v) => v || undefined),
  website: z
    .string()
    .url('Invalid website URL')
    .max(255, 'Website must be less than 255 characters')
    .optional()
    .transform((v) => v || undefined),
  source: z.nativeEnum(LeadSource),
  message: z
    .string()
    .max(5000, 'Message must be less than 5000 characters')
    .optional()
    .transform((v) => v || undefined),
  formData: z.record(z.unknown()).optional(),
  estimatedValue: z
    .number()
    .positive('Estimated value must be positive')
    .optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

// Update lead schema (for admin updates)
export const updateLeadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100)
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100)
    .trim()
    .optional(),
  email: z.string().email('Invalid email format').max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  website: z.string().url('Invalid website URL').max(255).optional().nullable(),
  status: z.nativeEnum(LeadStatus).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
  nextFollowUpAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .optional()
    .nullable(),
});

// Lead filters schema
export const leadFiltersSchema = z.object({
  status: z
    .union([z.nativeEnum(LeadStatus), z.array(z.nativeEnum(LeadStatus))])
    .optional(),
  source: z
    .union([z.nativeEnum(LeadSource), z.array(z.nativeEnum(LeadSource))])
    .optional(),
  priority: z
    .union([z.nativeEnum(LeadPriority), z.array(z.nativeEnum(LeadPriority))])
    .optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .optional(),
  tags: z.array(z.string().uuid()).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'status', 'priority'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Lead ID param schema
export const leadIdSchema = z.object({
  id: z.string().uuid('Invalid lead ID'),
});

// Add note schema
export const addNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note must be less than 10000 characters'),
  isPrivate: z.boolean().default(false),
});

// Add tag schema
export const addTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
});

// Update note schema
export const updateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note must be less than 10000 characters'),
  isPrivate: z.boolean().optional(),
});

// Note ID param schema
export const noteIdSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
});

// Activity types enum
export const ActivityTypeEnum = z.enum([
  'NOTE',
  'EMAIL_SENT',
  'EMAIL_RECEIVED',
  'CALL',
  'MEETING',
  'STATUS_CHANGE',
  'ASSIGNMENT_CHANGE',
  'FOLLOW_UP',
]);

// Create activity schema (for manual activities)
export const createActivitySchema = z.object({
  type: ActivityTypeEnum,
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  metadata: z.record(z.unknown()).optional(),
});

// Activity query schema
export const activityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: ActivityTypeEnum.optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFiltersInput = z.infer<typeof leadFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
