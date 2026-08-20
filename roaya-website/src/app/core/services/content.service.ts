import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BlogPost, Author, BlogCategory } from '../interfaces/blog.interface';

// ── Backend ContentItem shape ──────────────────────────────────────
interface ContentItemResponse {
  id: string;
  type: string;
  status: string;
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
  metadata?: Record<string, unknown>;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiListResponse {
  success: boolean;
  data: ContentItemResponse[];
  meta: PaginationMeta;
}

interface ApiDetailResponse {
  success: boolean;
  data: ContentItemResponse;
}

// ── Case Study interface (used by public website) ──────────────────
export interface CaseStudy {
  id: string;
  slug: string;
  translationPrefix?: string;
  title: string;
  excerpt: string;
  content?: string;
  industry: string;
  services: string[];
  companySize: string;
  keyResults: { metric: string; value: string; description: string }[];
  featuredImage?: string;
  logo?: string;
  publishedDate: Date;
  duration?: string;
  location?: string;
}

// ── Public data response shapes ───────────────────────────────────
interface ApiDataResponse<T> {
  success: boolean;
  data: T;
}

export interface ServicePackage {
  id: string;
  isActive: boolean;
  order: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: string;
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
}

// ── Default author fallback ────────────────────────────────────────
const defaultAuthor: Author = {
  id: 'roaya',
  name: 'Roaya IT',
  nameAr: 'رؤية لتكنولوجيا المعلومات',
  role: 'Editorial Team',
  roleAr: 'فريق التحرير',
  avatar: '/assets/images/logo/roaya-logo.png',
  bio: '',
  bioAr: '',
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ── Blog Posts ────────────────────────────────────────────────────

  getBlogPosts(
    page = 1,
    limit = 10,
    filters?: { category?: string; search?: string; tag?: string }
  ): Observable<{ posts: BlogPost[]; meta: PaginationMeta }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.tag) params = params.set('tag', filters.tag);

    return this.http
      .get<ApiListResponse>(`${this.apiUrl}/content/blog`, { params })
      .pipe(
        map((res) => ({
          posts: res.data.map((item) => this.mapToBlogPost(item)),
          meta: res.meta,
        }))
      );
  }

  getBlogPostBySlug(slug: string, lang: 'en' | 'ar' = 'en'): Observable<BlogPost | null> {
    return this.http
      .get<ApiDetailResponse>(`${this.apiUrl}/content/blog/${slug}`, {
        params: { lang },
      })
      .pipe(map((res) => (res.data ? this.mapToBlogPost(res.data) : null)));
  }

  // ── Case Studies ──────────────────────────────────────────────────

  getCaseStudies(
    page = 1,
    limit = 10,
    filters?: { category?: string; search?: string; tag?: string }
  ): Observable<{ studies: CaseStudy[]; meta: PaginationMeta }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.tag) params = params.set('tag', filters.tag);

    return this.http
      .get<ApiListResponse>(`${this.apiUrl}/content/case-studies`, { params })
      .pipe(
        map((res) => ({
          studies: res.data.map((item) => this.mapToCaseStudy(item)),
          meta: res.meta,
        }))
      );
  }

  getCaseStudyBySlug(slug: string, lang: 'en' | 'ar' = 'en'): Observable<CaseStudy | null> {
    return this.http
      .get<ApiDetailResponse>(`${this.apiUrl}/content/case-studies/${slug}`, {
        params: { lang },
      })
      .pipe(map((res) => (res.data ? this.mapToCaseStudy(res.data) : null)));
  }

  // ── Packages ─────────────────────────────────────────────────────

  getPackages(): Observable<ServicePackage[]> {
    return this.http
      .get<ApiDataResponse<ServicePackage[]>>(`${this.apiUrl}/content/packages`)
      .pipe(
        map((res) => res.data ?? [])
      );
  }

  // ── Team Members ────────────────────────────────────────────────

  getTeamMembers(department?: string): Observable<TeamMember[]> {
    let params = new HttpParams();
    if (department) params = params.set('department', department);

    return this.http
      .get<ApiDataResponse<TeamMember[]>>(`${this.apiUrl}/content/team`, { params })
      .pipe(
        map((res) => res.data ?? [])
      );
  }

  // ── Testimonials ────────────────────────────────────────────────

  getTestimonials(featured = false): Observable<Testimonial[]> {
    let params = new HttpParams();
    if (featured) params = params.set('featured', 'true');

    return this.http
      .get<ApiDataResponse<Testimonial[]>>(`${this.apiUrl}/content/testimonials`, { params })
      .pipe(
        map((res) => res.data ?? [])
      );
  }

  // ── Mappers ───────────────────────────────────────────────────────

  private mapToBlogPost(item: ContentItemResponse): BlogPost {
    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    const authorData = meta['author'] as Record<string, string> | undefined;

    const author: Author = authorData
      ? {
          id: authorData['id'] ?? item.authorId,
          name: authorData['name'] ?? 'Roaya IT',
          nameAr: authorData['nameAr'] ?? 'رؤية لتكنولوجيا المعلومات',
          role: authorData['role'] ?? '',
          roleAr: authorData['roleAr'] ?? '',
          avatar: authorData['avatar'] ?? '',
          bio: authorData['bio'] ?? '',
          bioAr: authorData['bioAr'] ?? '',
          linkedin: authorData['linkedin'],
        }
      : defaultAuthor;

    return {
      id: item.id,
      slug: item.slugEn,
      title: item.titleEn,
      titleAr: item.titleAr,
      excerpt: item.excerptEn ?? '',
      excerptAr: item.excerptAr ?? '',
      content: item.contentEn,
      contentAr: item.contentAr,
      author,
      publishedDate: item.publishedAt ? new Date(item.publishedAt) : new Date(item.createdAt),
      category: (item.category as BlogCategory) ?? 'updates',
      tags: item.tags ?? [],
      tagsAr: [],
      featuredImage: item.featuredImage ?? '',
      featuredImageAlt: item.titleEn,
      featuredImageAltAr: item.titleAr,
      readingTime: (meta['readingTime'] as number) ?? 5,
      readingTimeAr: ((meta['readingTime'] as number) ?? 5) + 2,
      featured: (meta['featured'] as boolean) ?? false,
      metaTitle: item.metaTitleEn,
      metaTitleAr: item.metaTitleAr,
      metaDescription: item.metaDescEn,
      metaDescriptionAr: item.metaDescAr,
      keywords: [],
      keywordsAr: [],
    };
  }

  private mapToCaseStudy(item: ContentItemResponse): CaseStudy {
    const meta = (item.metadata ?? {}) as Record<string, unknown>;

    return {
      id: item.id,
      slug: item.slugEn,
      title: item.titleEn,
      excerpt: item.excerptEn ?? '',
      content: item.contentEn,
      industry: (meta['industry'] as string) ?? item.category ?? '',
      services: (meta['services'] as string[]) ?? item.tags ?? [],
      companySize: (meta['companySize'] as string) ?? '',
      keyResults: (meta['keyResults'] as CaseStudy['keyResults']) ?? [],
      featuredImage: item.featuredImage ?? undefined,
      publishedDate: item.publishedAt ? new Date(item.publishedAt) : new Date(item.createdAt),
      duration: (meta['duration'] as string) ?? undefined,
      location: (meta['location'] as string) ?? undefined,
    };
  }
}
