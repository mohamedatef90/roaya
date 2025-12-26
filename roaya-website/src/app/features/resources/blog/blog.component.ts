import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideClock,
  lucideUser,
  lucideArrowRight,
  lucideChevronDown,
  lucideFilter,
  lucideTrendingUp,
  lucideStar
} from '@ng-icons/lucide';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { BlogService } from '../../../core/services/blog.service';
import { LanguageService } from '../../../core/services/language.service';
import { BlogPost } from '../../../core/interfaces/blog.interface';
import { NewsletterSignupComponent } from '../../../shared/components/newsletter-signup/newsletter-signup.component';

type SortOption = 'latest' | 'popular' | 'featured';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon, NewsletterSignupComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
  providers: [
    provideIcons({
      lucideSearch,
      lucideClock,
      lucideUser,
      lucideArrowRight,
      lucideChevronDown,
      lucideFilter,
      lucideTrendingUp,
      lucideStar
    })
  ]
})
export class BlogComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly blogService = inject(BlogService);
  private readonly languageService = inject(LanguageService);

  // State
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  sortBy = signal<SortOption>('latest');
  displayCount = signal<number>(6);
  isLoading = signal<boolean>(true);

  // Data
  allPosts = signal<BlogPost[]>([]);
  featuredPosts = signal<BlogPost[]>([]);

  categories = [
    { id: 'all', label: 'blog.categories.all' },
    { id: 'cloud', label: 'blog.categories.cloud' },
    { id: 'security', label: 'blog.categories.security' },
    { id: 'sap', label: 'blog.categories.sap' },
    { id: 'industry', label: 'blog.categories.industry' },
    { id: 'updates', label: 'blog.categories.updates' }
  ];

  sortOptions: { id: SortOption; label: string; icon: string }[] = [
    { id: 'latest', label: 'blog.sort.latest', icon: 'lucideClock' },
    { id: 'featured', label: 'blog.sort.featured', icon: 'lucideStar' }
  ];

  // Computed filtered and sorted posts
  filteredPosts = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();
    const sort = this.sortBy();
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';

    let filtered = this.allPosts();

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(post => {
        const title = isArabic ? post.titleAr : post.title;
        const excerpt = isArabic ? post.excerptAr : post.excerpt;
        const tags = isArabic ? post.tagsAr : post.tags;

        return (
          title.toLowerCase().includes(query) ||
          excerpt.toLowerCase().includes(query) ||
          tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    // Sort
    if (sort === 'featured') {
      filtered = [...filtered].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      });
    } else {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      );
    }

    return filtered;
  });

  // Posts to display (with load more)
  displayedPosts = computed(() => {
    return this.filteredPosts().slice(0, this.displayCount());
  });

  // Check if there are more posts to load
  hasMorePosts = computed(() => {
    return this.filteredPosts().length > this.displayCount();
  });

  // Get remaining count
  remainingCount = computed(() => {
    return Math.max(0, this.filteredPosts().length - this.displayCount());
  });

  ngOnInit(): void {
    this.loadPosts();
    this.analytics.trackPageView('/resources/blog');
  }

  private loadPosts(): void {
    this.isLoading.set(true);

    this.blogService.getAllPosts().subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.blogService.getFeaturedPosts(3).subscribe({
      next: (posts) => {
        this.featuredPosts.set(posts);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.displayCount.set(6); // Reset pagination

    if (category !== 'all') {
      this.analytics.trackEvent('blog_filter', { category });
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.displayCount.set(6); // Reset pagination

    if (query.length >= 3) {
      this.analytics.trackEvent('blog_search', { query });
    }
  }

  onSortChange(sort: SortOption): void {
    this.sortBy.set(sort);
    this.analytics.trackEvent('blog_sort', { sort });
  }

  loadMore(): void {
    this.displayCount.update(count => count + 6);
    this.analytics.trackEvent('blog_load_more', {
      currentCount: this.displayCount()
    });
  }

  trackPostClick(postId: string): void {
    this.analytics.trackContentEngagement('blog', postId, 'view');
  }

  // Helper methods for localized content
  getPostTitle(post: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? post.titleAr : post.title;
  }

  getPostExcerpt(post: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? post.excerptAr : post.excerpt;
  }

  getPostReadingTime(post: BlogPost): number {
    return this.languageService.getCurrentLanguage() === 'ar' ? post.readingTimeAr : post.readingTime;
  }

  getAuthorName(post: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? post.author.nameAr : post.author.name;
  }

  getFeaturedImageAlt(post: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? post.featuredImageAltAr : post.featuredImageAlt;
  }
}
