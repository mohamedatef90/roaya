import { Request } from 'express';
import { LeadStatus, LeadSource, LeadPriority, UserRole } from '@prisma/client';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Pagination query
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Lead types
export interface CreateLeadDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  source: LeadSource;
  message?: string;
  formData?: Record<string, unknown>;
  estimatedValue?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UpdateLeadDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedToId?: string | null;
  nextFollowUpAt?: Date | null;
}

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  priority?: LeadPriority | LeadPriority[];
  assignedToId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// Extended Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// Email types
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined;
}

// Activity types
export interface CreateActivityDTO {
  leadId: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  performedById?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  newLeadsThisMonth: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<LeadSource, number>;
  conversionRate: number;
  averageResponseTime: number;
}

// Export enums for convenience
export { LeadStatus, LeadSource, LeadPriority, UserRole };
