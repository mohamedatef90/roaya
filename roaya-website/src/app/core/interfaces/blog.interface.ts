/**
 * Blog System Interfaces
 * Roaya IT Corporate Website
 */

export type BlogCategory = 'cloud' | 'security' | 'sap' | 'industry' | 'updates';

export interface Author {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar: string;
  bio: string;
  bioAr: string;
  linkedin?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  author: Author;
  publishedDate: Date;
  updatedDate?: Date;
  category: BlogCategory;
  tags: string[];
  tagsAr: string[];
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageAltAr: string;
  readingTime: number;
  readingTimeAr: number;
  featured: boolean;
  metaTitle?: string;
  metaTitleAr?: string;
  metaDescription?: string;
  metaDescriptionAr?: string;
  keywords: string[];
  keywordsAr: string[];
}

export interface BlogCategoryItem {
  id: string;
  label: string;
  labelAr: string;
}

export interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
  source: 'blog' | 'footer' | 'popup';
}
