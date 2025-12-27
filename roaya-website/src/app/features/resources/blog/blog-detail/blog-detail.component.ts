import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Meta, Title } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideUser,
  lucideCalendar,
  lucideClock,
  lucideShare2,
  lucideLink,
  lucideArrowRight,
  lucideChevronUp,
  lucideLinkedin,
  lucideTwitter,
  lucideFacebook,
  lucideExternalLink
} from '@ng-icons/lucide';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { BlogService } from '../../../../core/services/blog.service';
import { LanguageService } from '../../../../core/services/language.service';
import { BlogPost, TocItem } from '../../../../core/interfaces/blog.interface';
import { ReadingProgressComponent } from '../../../../shared/components/reading-progress/reading-progress.component';
import { TableOfContentsComponent } from '../../../../shared/components/table-of-contents/table-of-contents.component';
import { AuthorCardComponent } from '../../../../shared/components/author-card/author-card.component';
import { NewsletterSignupComponent } from '../../../../shared/components/newsletter-signup/newsletter-signup.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    NgIcon,
    ReadingProgressComponent,
    TableOfContentsComponent,
    AuthorCardComponent,
    NewsletterSignupComponent
  ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideUser,
      lucideCalendar,
      lucideClock,
      lucideShare2,
      lucideLink,
      lucideArrowRight,
      lucideChevronUp,
      lucideLinkedin,
      lucideTwitter,
      lucideFacebook,
      lucideExternalLink
    })
  ]
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly analytics = inject(AnalyticsService);
  private readonly blogService = inject(BlogService);
  private readonly languageService = inject(LanguageService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);

  // Constants for Sidebar
  readonly sidebarServices = [
    { id: 'cloud', title: 'services.cloud.title', route: '/services/cloud' },
    { id: 'security', title: 'services.security.title', route: '/services/security' },
    { id: 'sap', title: 'services.sap.title', route: '/services/sap' },
    { id: 'managed', title: 'services.managed.title', route: '/services/managed' }
  ];

  readonly socialLinks = [
    { id: 'linkedin', icon: 'lucideLinkedin', url: 'https://www.linkedin.com/company/19047659' },
    { id: 'twitter', icon: 'lucideTwitter', url: 'https://twitter.com' },
    { id: 'facebook', icon: 'lucideFacebook', url: 'https://www.facebook.com/RoayaIT' }
  ];

  // State
  post = signal<BlogPost | null>(null);
  relatedPosts = signal<BlogPost[]>([]);
  isLoading = signal(true);
  tocItems = signal<TocItem[]>([]);
  showScrollTop = signal(false);
  processedContent = signal<string>('');

  // Computed values
  currentTitle = computed(() => {
    const p = this.post();
    if (!p) return '';
    return this.languageService.getCurrentLanguage() === 'ar' ? p.titleAr : p.title;
  });

  currentExcerpt = computed(() => {
    const p = this.post();
    if (!p) return '';
    return this.languageService.getCurrentLanguage() === 'ar' ? p.excerptAr : p.excerpt;
  });

  currentContent = computed(() => {
    const p = this.post();
    if (!p) return '';
    return this.languageService.getCurrentLanguage() === 'ar' ? p.contentAr : p.content;
  });

  currentTags = computed(() => {
    const p = this.post();
    if (!p) return [];
    return this.languageService.getCurrentLanguage() === 'ar' ? p.tagsAr : p.tags;
  });

  currentReadingTime = computed(() => {
    const p = this.post();
    if (!p) return 0;
    return this.languageService.getCurrentLanguage() === 'ar' ? p.readingTimeAr : p.readingTime;
  });

  private scrollListener: (() => void) | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.loadPost(slug);
    } else {
      this.isLoading.set(false);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.initScrollListener();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    this.removeStructuredData();
  }

  private loadPost(slug: string): void {
    this.isLoading.set(true);

    this.blogService.getPostBySlug(slug).subscribe({
      next: (post) => {
        if (post) {
          this.post.set(post);
          this.processContent(post);
          this.loadRelatedPosts(post);
          this.updateSEO(post);
          this.analytics.trackContentEngagement('blog', post.id, 'view');
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private processContent(post: BlogPost): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const rawContent = isArabic ? post.contentAr : post.content;

    // Generate TOC from content
    const toc = this.blogService.generateToc(rawContent);
    this.tocItems.set(toc);

    // Convert markdown-style content to HTML with IDs for TOC
    const processed = this.convertToHtml(rawContent);
    this.processedContent.set(processed);
  }

  private convertToHtml(content: string): string {
    // Simple markdown to HTML conversion
    let html = content
      // Headers with IDs for TOC linking
      .replace(/^### (.+)$/gm, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h3 id="${id}" class="scroll-mt-28">${text}</h3>`;
      })
      .replace(/^## (.+)$/gm, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h2 id="${id}" class="scroll-mt-28">${text}</h2>`;
      })
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive list items
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap in paragraph tags
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p><br>/g, '<p>');
    html = html.replace(/<br><\/p>/g, '</p>');

    return html;
  }

  private loadRelatedPosts(post: BlogPost): void {
    this.blogService.getRelatedPosts(post, 3).subscribe({
      next: (posts) => {
        this.relatedPosts.set(posts);
        this.cdr.markForCheck();
      }
    });
  }

  private updateSEO(post: BlogPost): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const postTitle = isArabic ? post.titleAr : post.title;
    const metaTitle = isArabic ? post.metaTitleAr : post.metaTitle;
    const metaDescription = isArabic ? post.metaDescriptionAr : post.metaDescription;
    const excerpt = isArabic ? post.excerptAr : post.excerpt;

    // Set title
    this.title.setTitle(metaTitle || `${postTitle} | Roaya IT Blog`);

    // Set meta tags
    this.meta.updateTag({
      name: 'description',
      content: metaDescription || excerpt
    });

    this.meta.updateTag({
      name: 'keywords',
      content: (isArabic ? post.keywordsAr : post.keywords).join(', ')
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: postTitle });
    this.meta.updateTag({ property: 'og:description', content: excerpt });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:image', content: post.featuredImage });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: postTitle });
    this.meta.updateTag({ name: 'twitter:description', content: excerpt });
    this.meta.updateTag({ name: 'twitter:image', content: post.featuredImage });

    // Article specific
    this.meta.updateTag({
      property: 'article:published_time',
      content: new Date(post.publishedDate).toISOString()
    });
    this.meta.updateTag({ property: 'article:author', content: post.author.name });

    // Add JSON-LD structured data
    this.addStructuredData(post, isArabic);
  }

  private addStructuredData(post: BlogPost, isArabic: boolean): void {
    // Remove any existing structured data first
    this.removeStructuredData();

    const postTitle = isArabic ? post.titleAr : post.title;
    const excerpt = isArabic ? post.excerptAr : post.excerpt;
    const authorName = isArabic ? post.author.nameAr : post.author.name;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': postTitle,
      'description': excerpt,
      'image': post.featuredImage,
      'datePublished': new Date(post.publishedDate).toISOString(),
      'dateModified': post.updatedDate
        ? new Date(post.updatedDate).toISOString()
        : new Date(post.publishedDate).toISOString(),
      'author': {
        '@type': 'Person',
        'name': authorName,
        'jobTitle': isArabic ? post.author.roleAr : post.author.role,
        'url': post.author.linkedin || undefined
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Roaya IT',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://roaya.co/assets/images/logo.svg'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': isPlatformBrowser(this.platformId)
          ? window.location.href
          : `https://roaya.co/resources/blog/${post.slug}`
      },
      'keywords': (isArabic ? post.keywordsAr : post.keywords).join(', '),
      'articleSection': post.category,
      'wordCount': this.getWordCount(isArabic ? post.contentAr : post.content),
      'inLanguage': isArabic ? 'ar' : 'en'
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-article-structured-data';
    script.textContent = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  private removeStructuredData(): void {
    const existingScript = this.document.getElementById('blog-article-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
  }

  private getWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  private initScrollListener(): void {
    this.scrollListener = () => {
      this.showScrollTop.set(window.scrollY > 500);
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  sharePost(platform: string): void {
    const p = this.post();
    if (!p || !isPlatformBrowser(this.platformId)) return;

    const url = window.location.href;
    const postTitle = this.currentTitle();

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      this.analytics.trackContentEngagement('blog', p.id, 'share');
    }
  }

  copyLink(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    navigator.clipboard.writeText(window.location.href).then(() => {
      this.analytics.trackEvent('blog_copy_link', { postId: this.post()?.id });
    });
  }

  // Helper methods for localized content
  getRelatedPostTitle(relatedPost: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? relatedPost.titleAr : relatedPost.title;
  }

  getRelatedPostExcerpt(relatedPost: BlogPost): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? relatedPost.excerptAr : relatedPost.excerpt;
  }

  getAuthorName(): string {
    const p = this.post();
    if (!p) return '';
    return this.languageService.getCurrentLanguage() === 'ar' ? p.author.nameAr : p.author.name;
  }

  getFeaturedImageAlt(): string {
    const p = this.post();
    if (!p) return '';
    return this.languageService.getCurrentLanguage() === 'ar' ? p.featuredImageAltAr : p.featuredImageAlt;
  }
}
