/**
 * Admin Dashboard Interfaces
 * Roaya IT - Lead Management System
 *
 * These types match the backend API responses from backend/src/shared/types/index.ts
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED',
}

export enum LeadSource {
  CONTACT_FORM = 'CONTACT_FORM',
  PRICING_PAGE = 'PRICING_PAGE',
  ROI_CALCULATOR = 'ROI_CALCULATOR',
  NEWSLETTER = 'NEWSLETTER',
  REFERRAL = 'REFERRAL',
  LINKEDIN = 'LINKEDIN',
  GOOGLE_ADS = 'GOOGLE_ADS',
  ORGANIC = 'ORGANIC',
  OTHER = 'OTHER',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_REP = 'SALES_REP',
  VIEWER = 'VIEWER',
}

export enum ActivityType {
  NOTE = 'NOTE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PRIORITY_CHANGE = 'PRIORITY_CHANGE',
  ASSIGNMENT = 'ASSIGNMENT',
  ASSIGNMENT_CHANGE = 'ASSIGNMENT_CHANGE',
  NOTE_ADDED = 'NOTE_ADDED',
  TAG_ADDED = 'TAG_ADDED',
  TAG_REMOVED = 'TAG_REMOVED',
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  CALL = 'CALL',
  CALL_MADE = 'CALL_MADE',
  MEETING = 'MEETING',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  FOLLOW_UP = 'FOLLOW_UP',
  OTHER = 'OTHER',
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
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

// ============================================================================
// LEAD TYPES
// ============================================================================

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  message?: string;
  formData?: Record<string, any>;
  estimatedValue?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  assignedToId?: string;
  assignedTo?: AdminUser;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
  notes?: LeadNote[];
  tags?: Tag[];
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  performedById?: string;
  performedBy?: AdminUser;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  isPrivate: boolean;
  createdById: string;
  createdBy?: AdminUser;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// ============================================================================
// LEAD FILTERS & QUERIES
// ============================================================================

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  priority?: LeadPriority | LeadPriority[];
  assignedToId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadQueryParams extends LeadFilters, PaginationQuery {}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  newLeadsThisMonth: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<LeadSource, number>;
  conversionRate: number;
  averageResponseTime?: number;
}

// ============================================================================
// ADMIN USER TYPES
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  assignedLeadsCount?: number;
}

export interface CurrentUser extends AdminUser {
  // Additional fields for the authenticated user if needed
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserQueryParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: AdminUser;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// FORM DTOs (Data Transfer Objects)
// ============================================================================

export interface UpdateLeadDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedToId?: string;
  nextFollowUpAt?: string;
}

export interface CreateNoteDto {
  content: string;
  isPrivate: boolean;
}

export interface UpdateNoteDto {
  content: string;
  isPrivate?: boolean;
}

export interface CreateTagDto {
  name: string;
  color: string;
}

export interface AddTagToLeadDto {
  tagId: string;
}

export interface CreateActivityDto {
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityQueryParams {
  page?: number;
  limit?: number;
  type?: ActivityType;
}

// ============================================================================
// TABLE & UI TYPES
// ============================================================================

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
  filters?: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SelectOption<T = any> {
  label: string;
  value: T;
  icon?: string;
  color?: string;
}

export interface StatusBadge {
  label: string;
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary';
}

export interface PriorityBadge {
  label: string;
  severity: 'success' | 'info' | 'warning' | 'danger';
  icon: string;
}

// ============================================================================
// HELPER FUNCTIONS/CONSTANTS
// ============================================================================

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.QUALIFIED]: 'Qualified',
  [LeadStatus.PROPOSAL]: 'Proposal',
  [LeadStatus.NEGOTIATION]: 'Negotiation',
  [LeadStatus.WON]: 'Won',
  [LeadStatus.LOST]: 'Lost',
  [LeadStatus.ARCHIVED]: 'Archived',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.CONTACT_FORM]: 'Contact Form',
  [LeadSource.PRICING_PAGE]: 'Pricing Page',
  [LeadSource.ROI_CALCULATOR]: 'ROI Calculator',
  [LeadSource.NEWSLETTER]: 'Newsletter',
  [LeadSource.REFERRAL]: 'Referral',
  [LeadSource.LINKEDIN]: 'LinkedIn',
  [LeadSource.GOOGLE_ADS]: 'Google Ads',
  [LeadSource.ORGANIC]: 'Organic',
  [LeadSource.OTHER]: 'Other',
};

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: 'Low',
  [LeadPriority.MEDIUM]: 'Medium',
  [LeadPriority.HIGH]: 'High',
  [LeadPriority.URGENT]: 'Urgent',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SALES_MANAGER]: 'Sales Manager',
  [UserRole.SALES_REP]: 'Sales Representative',
  [UserRole.VIEWER]: 'Viewer',
};
