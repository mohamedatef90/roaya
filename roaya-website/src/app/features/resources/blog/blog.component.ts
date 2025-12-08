import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedDate: Date;
  category: string;
  tags: string[];
  featuredImage?: string;
  readingTime?: number;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);

  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  categories = [
    { id: 'all', label: 'blog.categories.all' },
    { id: 'cloud', label: 'blog.categories.cloud' },
    { id: 'security', label: 'blog.categories.security' },
    { id: 'sap', label: 'blog.categories.sap' },
    { id: 'industry', label: 'blog.categories.industry' },
    { id: 'updates', label: 'blog.categories.updates' }
  ];

  // TODO: Replace with actual blog posts from CMS/API
  allPosts = signal<BlogPost[]>([]);
  
  filteredPosts = signal<BlogPost[]>([]);

  ngOnInit(): void {
    // TODO: Load blog posts from API/CMS
    this.loadPosts();
    this.analytics.trackPageView('/resources/blog');
  }

  private loadPosts(): void {
    // Placeholder data - TODO: Replace with API call
    const posts: BlogPost[] = [
      // Will be populated from CMS/API
    ];
    
    this.allPosts.set(posts);
    this.filteredPosts.set(posts);
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  private applyFilters(): void {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = this.allPosts();

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    this.filteredPosts.set(filtered);

    // Track analytics
    if (category !== 'all') {
      this.analytics.trackEvent('blog_filter', { category });
    }
    if (query) {
      this.analytics.trackEvent('blog_search', { query });
    }
  }

  trackPostClick(postId: string): void {
    this.analytics.trackContentEngagement('blog', postId, 'view');
  }
}
