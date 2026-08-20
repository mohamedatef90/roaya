import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationMeta } from '../interfaces/admin.interface';

// Enums
export enum ContentType {
  BLOG_POST = 'BLOG_POST',
  CASE_STUDY = 'CASE_STUDY',
  WHITEPAPER = 'WHITEPAPER',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PackageType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME',
  CUSTOM = 'CUSTOM',
}

// Interfaces
export interface ContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
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
  tags: string[];
  authorId: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescEn?: string;
  metaDescAr?: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  isActive: boolean;
  order: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: PackageType;
  priceMonthly?: number;
  priceYearly?: number;
  currency: string;
  featuresEn: string[];
  featuresAr: string[];
  isFeatured: boolean;
  badge?: string;
  badgeColor?: string;
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  isActive: boolean;
  order: number;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  bioEn?: string;
  bioAr?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  photoUrl?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  quoteEn: string;
  quoteAr: string;
  authorName: string;
  authorTitleEn: string;
  authorTitleAr: string;
  authorCompany?: string;
  authorPhoto?: string;
  rating: number;
  service?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContentAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  // =====================
  // CONTENT ITEMS
  // =====================

  getContents(filters: ContentFilters = {}): Observable<ApiResponse<ContentItem[]>> {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<ApiResponse<ContentItem[]>>(`${this.baseUrl}/content`, { params });
  }

  getContentById(id: string): Observable<ApiResponse<ContentItem>> {
    return this.http.get<ApiResponse<ContentItem>>(`${this.baseUrl}/content/${id}`);
  }

  createContent(data: Partial<ContentItem>): Observable<ApiResponse<ContentItem>> {
    return this.http.post<ApiResponse<ContentItem>>(`${this.baseUrl}/content`, data);
  }

  updateContent(id: string, data: Partial<ContentItem>): Observable<ApiResponse<ContentItem>> {
    return this.http.patch<ApiResponse<ContentItem>>(`${this.baseUrl}/content/${id}`, data);
  }

  deleteContent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/content/${id}`);
  }

  publishContent(id: string): Observable<ApiResponse<ContentItem>> {
    return this.http.post<ApiResponse<ContentItem>>(`${this.baseUrl}/content/${id}/publish`, {});
  }

  unpublishContent(id: string): Observable<ApiResponse<ContentItem>> {
    return this.http.post<ApiResponse<ContentItem>>(`${this.baseUrl}/content/${id}/unpublish`, {});
  }

  // =====================
  // PACKAGES
  // =====================

  getPackages(includeInactive = false): Observable<ApiResponse<ServicePackage[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<ServicePackage[]>>(`${this.baseUrl}/packages`, { params });
  }

  getPackageById(id: string): Observable<ApiResponse<ServicePackage>> {
    return this.http.get<ApiResponse<ServicePackage>>(`${this.baseUrl}/packages/${id}`);
  }

  createPackage(data: Partial<ServicePackage>): Observable<ApiResponse<ServicePackage>> {
    return this.http.post<ApiResponse<ServicePackage>>(`${this.baseUrl}/packages`, data);
  }

  updatePackage(id: string, data: Partial<ServicePackage>): Observable<ApiResponse<ServicePackage>> {
    return this.http.patch<ApiResponse<ServicePackage>>(`${this.baseUrl}/packages/${id}`, data);
  }

  deletePackage(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/packages/${id}`);
  }

  reorderPackages(orderedIds: string[]): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/packages/reorder`, { orderedIds });
  }

  // =====================
  // TEAM
  // =====================

  getTeamMembers(includeInactive = false, department?: string): Observable<ApiResponse<TeamMember[]>> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (department) params = params.set('department', department);
    return this.http.get<ApiResponse<TeamMember[]>>(`${this.baseUrl}/team`, { params });
  }

  getTeamMemberById(id: string): Observable<ApiResponse<TeamMember>> {
    return this.http.get<ApiResponse<TeamMember>>(`${this.baseUrl}/team/${id}`);
  }

  createTeamMember(data: Partial<TeamMember>): Observable<ApiResponse<TeamMember>> {
    return this.http.post<ApiResponse<TeamMember>>(`${this.baseUrl}/team`, data);
  }

  updateTeamMember(id: string, data: Partial<TeamMember>): Observable<ApiResponse<TeamMember>> {
    return this.http.patch<ApiResponse<TeamMember>>(`${this.baseUrl}/team/${id}`, data);
  }

  deleteTeamMember(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/team/${id}`);
  }

  reorderTeamMembers(orderedIds: string[]): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/team/reorder`, { orderedIds });
  }

  getDepartments(): Observable<ApiResponse<{ name: string; count: number }[]>> {
    return this.http.get<ApiResponse<{ name: string; count: number }[]>>(`${this.baseUrl}/team/departments`);
  }

  // =====================
  // TESTIMONIALS
  // =====================

  getTestimonials(
    includeInactive = false,
    featuredOnly = false,
    service?: string,
    industry?: string
  ): Observable<ApiResponse<Testimonial[]>> {
    let params = new HttpParams()
      .set('includeInactive', includeInactive.toString())
      .set('featured', featuredOnly.toString());
    if (service) params = params.set('service', service);
    if (industry) params = params.set('industry', industry);

    return this.http.get<ApiResponse<Testimonial[]>>(`${this.baseUrl}/testimonials`, { params });
  }

  getTestimonialById(id: string): Observable<ApiResponse<Testimonial>> {
    return this.http.get<ApiResponse<Testimonial>>(`${this.baseUrl}/testimonials/${id}`);
  }

  createTestimonial(data: Partial<Testimonial>): Observable<ApiResponse<Testimonial>> {
    return this.http.post<ApiResponse<Testimonial>>(`${this.baseUrl}/testimonials`, data);
  }

  updateTestimonial(id: string, data: Partial<Testimonial>): Observable<ApiResponse<Testimonial>> {
    return this.http.patch<ApiResponse<Testimonial>>(`${this.baseUrl}/testimonials/${id}`, data);
  }

  deleteTestimonial(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/testimonials/${id}`);
  }

  reorderTestimonials(orderedIds: string[]): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/testimonials/reorder`, { orderedIds });
  }

  toggleTestimonialFeatured(id: string): Observable<ApiResponse<Testimonial>> {
    return this.http.patch<ApiResponse<Testimonial>>(`${this.baseUrl}/testimonials/${id}/toggle-featured`, {});
  }
}
