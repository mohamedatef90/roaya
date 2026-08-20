import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { BlogPost, Author, TocItem } from '../interfaces/blog.interface';
import { LanguageService } from './language.service';
import { ContentService } from './content.service';

/**
 * Blog Service
 * Fetches blog posts from the backend API via ContentService.
 * Maintains the same public API as the original hardcoded version.
 */
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly languageService = inject(LanguageService);
  private readonly contentService = inject(ContentService);

  /**
   * Get all blog posts (sorted by published date desc)
   */
  getAllPosts(): Observable<BlogPost[]> {
    return this.contentService.getBlogPosts(1, 50).pipe(
      map((res) => res.posts)
    );
  }

  /**
   * Get a single post by slug
   */
  getPostBySlug(slug: string): Observable<BlogPost | undefined> {
    const lang = this.languageService.getCurrentLanguage() as 'en' | 'ar';
    return this.contentService.getBlogPostBySlug(slug, lang).pipe(
      map((post) => post ?? undefined)
    );
  }

  /**
   * Get posts by category
   */
  getPostsByCategory(category: string): Observable<BlogPost[]> {
    if (category === 'all') {
      return this.getAllPosts();
    }
    return this.contentService.getBlogPosts(1, 50, { category }).pipe(
      map((res) => res.posts)
    );
  }

  /**
   * Get featured posts
   */
  getFeaturedPosts(limit: number = 3): Observable<BlogPost[]> {
    // Fetch all posts and filter featured on client side
    // (backend doesn't have a dedicated featured filter)
    return this.getAllPosts().pipe(
      map((posts) => posts.filter((p) => p.featured).slice(0, limit))
    );
  }

  /**
   * Get related posts based on category and tags
   */
  getRelatedPosts(currentPost: BlogPost, limit: number = 3): Observable<BlogPost[]> {
    return this.contentService
      .getBlogPosts(1, 50, { category: currentPost.category })
      .pipe(
        map((res) => {
          const candidates = res.posts.filter((p) => p.id !== currentPost.id);
          // Score each candidate by similarity
          const scored = candidates.map((post) => {
            let score = 0;
            if (post.category === currentPost.category) score += 3;
            const matchingTags = post.tags.filter((tag) =>
              currentPost.tags.includes(tag)
            );
            score += matchingTags.length;
            if (post.author.id === currentPost.author.id) score += 1;
            return { post, score };
          });
          return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((item) => item.post);
        })
      );
  }

  /**
   * Search posts by query
   */
  searchPosts(query: string): Observable<BlogPost[]> {
    return this.contentService.getBlogPosts(1, 50, { search: query }).pipe(
      map((res) => res.posts)
    );
  }

  /**
   * Generate table of contents from content
   */
  generateToc(content: string): TocItem[] {
    const headingRegex = /^#{2,3}\s+(.+)$/gm;
    const toc: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[0].indexOf(' ');
      const text = match[1].trim();

      // Generate ID that supports both Arabic and English text
      // CRITICAL: This MUST match the generateId() function in blog-detail.component.ts
      const id = text
        .toLowerCase()
        .trim()
        .replace(/[\s\u00A0]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '');

      toc.push({ id, text, level });
    }

    return toc;
  }

  /**
   * Get author by ID
   * Returns undefined — authors are now embedded in post metadata.
   */
  getAuthorById(_authorId: string): Author | undefined {
    return undefined;
  }

  /**
   * Get all authors
   * Returns empty array — authors are now embedded in post metadata.
   */
  getAllAuthors(): Author[] {
    return [];
  }
}
