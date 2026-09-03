import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  RESPONSE_INIT
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  lucideFacebook,
  lucideExternalLink
} from '@ng-icons/lucide';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { BlogService } from '../../../../core/services/blog.service';
import { LanguageService } from '../../../../core/services/language.service';
import { SEOService } from '../../../../core/services/seo.service';
import { LocalizeLinkPipe } from '../../../../core/i18n/localize-link.pipe';
import { Locale, splitLocale } from '../../../../core/i18n/locale-routing';
import {
  countContentWords,
  hasCompleteArabicVersion
} from '../../../../core/utils/arabic-content-completeness';
import { BlogPost, TocItem } from '../../../../core/interfaces/blog.interface';
import { ReadingProgressComponent } from '../../../../shared/components/reading-progress/reading-progress.component';
import { TableOfContentsComponent } from '../../../../shared/components/table-of-contents/table-of-contents.component';
import { AuthorCardComponent } from '../../../../shared/components/author-card/author-card.component';
import { NewsletterSignupComponent } from '../../../../shared/components/newsletter-signup/newsletter-signup.component';

/**
 * The page's render state. `notFound` and `unavailable` are deliberately
 * distinct: a real 404 (the backend answered, the slug does not exist) and a
 * failed/unreachable backend (503) must never share copy, title or status
 * (2026-09-02 AI-readiness reconciliation: all 20 live blog URLs were
 * serving HTTP 503 with "Post Not Found" copy, the route's static <title>
 * and the homepage og:url).
 */
export type BlogDetailLoadState = 'loading' | 'ready' | 'notFound' | 'unavailable';

/** Seconds a crawler should wait before retrying a 503 blog-detail render. */
const UNAVAILABLE_RETRY_AFTER_SECONDS = 120;

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
    NewsletterSignupComponent,
    LocalizeLinkPipe
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
      lucideFacebook,
      lucideExternalLink
    })
  ]
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);
  private readonly blogService = inject(BlogService);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly seo = inject(SEOService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  // Constants for Sidebar
  readonly sidebarServices = [
    { id: 'cloud', title: 'services.cloud.title', route: '/services/cloud' },
    { id: 'security', title: 'services.security.title', route: '/services/security' },
    { id: 'sap', title: 'services.sap.title', route: '/services/sap' },
    { id: 'managed', title: 'services.managed.title', route: '/services/managed' }
  ];

  readonly socialLinks = [
    { id: 'linkedin', icon: 'lucideLinkedin', url: 'https://www.linkedin.com/company/19047659' },
    { id: 'facebook', icon: 'lucideFacebook', url: 'https://www.facebook.com/RoayaIT' }
  ];

  // State
  loadState = signal<BlogDetailLoadState>('loading');
  post = signal<BlogPost | null>(null);
  relatedPosts = signal<BlogPost[]>([]);
  tocItems = signal<TocItem[]>([]);
  showScrollTop = signal(false);
  processedContent = signal<SafeHtml>('');

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
    // Subscribe to route parameter changes to handle navigation between blog posts
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      if (slug) {
        this.loadPost(slug);
        // Scroll to top when navigating to a new blog post
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        this.markNotFound();
        this.cdr.markForCheck();
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.initScrollListener();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    this.removeStructuredData();
    this.clearRobotsNoindex();
  }

  private loadPost(slug: string): void {
    this.loadState.set('loading');
    this.clearRobotsNoindex();

    this.blogService.getPostBySlug(slug).subscribe({
      next: (post) => {
        if (post) {
          this.post.set(post);
          this.processContent(post);
          this.loadRelatedPosts(post);
          this.updateSEO(post);
          this.analytics.trackContentEngagement('blog', post.id, 'view');
          this.loadState.set('ready');
        } else {
          // The backend answered 200 with no data: the slug does not exist.
          this.markNotFound();
        }
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        // The backend answers an unknown slug with HTTP 404, which HttpClient
        // delivers as an ERROR (any non-2xx lands here, not in `next`) — that
        // is a real 404 for crawlers. Anything else means the backend could
        // not be reached or failed: the post may well exist, so that must NOT
        // be a 404 (a crawler would deindex a real post over a transient
        // outage) — 503 tells crawlers to retry later.
        const status = (err as { status?: number } | null)?.status;
        if (status === 404) {
          this.markNotFound();
        } else {
          this.markUnavailable();
        }
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Real 404: the backend answered and the slug does not exist. During SSR
   * the response carries HTTP 404 so crawlers never index unknown blog URLs
   * as 200s, and the page's own <title>, description, canonical and og:url
   * say the same thing as the status.
   */
  private markNotFound(): void {
    this.resetPostState();
    this.loadState.set('notFound');
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
    this.applyErrorStateSEO('blog.detail.notFound.pageTitle', 'blog.detail.notFound.description');
    // A page that does not exist must not be indexed under any title.
    this.setRobotsNoindex();
  }

  /**
   * Robots tag lifecycle.
   *
   * `<meta name="robots">` is a document-level tag, not a component one: an
   * Angular route change replaces the component but leaves the tag in the
   * head. A noindex written for one article would therefore follow the reader
   * to every page they visit next in the same session, and the client-rendered
   * view of those pages would carry it. Every state that is not "a page that
   * must not be indexed" clears it, and so does destroy.
   */
  private setRobotsNoindex(content = 'noindex'): void {
    this.meta.updateTag({ name: 'robots', content });
  }

  private clearRobotsNoindex(): void {
    this.meta.removeTag("name='robots'");
  }

  /**
   * Backend unreachable or failed (anything but a 404). HTTP 503 with
   * Retry-After tells crawlers to come back, and the page says "temporarily
   * unavailable" — never "not found", because the URL is most likely valid.
   * No noindex for the same reason.
   */
  private markUnavailable(): void {
    this.resetPostState();
    this.loadState.set('unavailable');
    // The URL is most likely valid, so this state must never carry the 404
    // state's noindex — including on a client-side retry of the same route.
    this.clearRobotsNoindex();
    if (this.responseInit) {
      this.responseInit.status = 503;
      this.setResponseHeader('Retry-After', String(UNAVAILABLE_RETRY_AFTER_SECONDS));
    }
    this.applyErrorStateSEO('blog.detail.unavailable.pageTitle', 'blog.detail.unavailable.description');
  }

  /**
   * Error-state SEO: a specific <title>, a description, and canonical + og:url
   * equal to the page's OWN URL (never the homepage). No hreflang alternates:
   * a page that failed to render must not advertise translations of itself.
   * translate.instant works during SSR because ServerTranslationLoader
   * provides the bundled JSON synchronously (same pattern as case-study
   * detail).
   */
  private applyErrorStateSEO(titleKey: string, descriptionKey: string): void {
    this.seo.updateSEO({
      title: this.seo.brandTitle(this.translate.instant(titleKey)),
      description: this.translate.instant(descriptionKey),
      url: this.seo.buildCanonicalUrl(this.router.url),
      type: 'website'
    });
    this.seo.setAlternatesForLocales(splitLocale(this.router.url).path, []);
  }

  /**
   * Clear everything a previously rendered post left behind, so a client-side
   * navigation from a real post to a broken slug never shows or advertises
   * the old post.
   */
  private resetPostState(): void {
    this.post.set(null);
    this.relatedPosts.set([]);
    this.tocItems.set([]);
    this.processedContent.set('');
    this.removeStructuredData();
    this.meta.removeTag('property="article:published_time"');
    this.meta.removeTag('property="article:author"');
  }

  /**
   * Merge one header into RESPONSE_INIT. Angular's app engine hands the
   * component a `Headers` instance today, but `HeadersInit` also admits an
   * entries array or a plain record, so all three shapes (and none) are
   * handled without clobbering headers set elsewhere.
   */
  private setResponseHeader(name: string, value: string): void {
    if (!this.responseInit) return;

    const existing = this.responseInit.headers;
    if (typeof Headers !== 'undefined' && existing instanceof Headers) {
      existing.set(name, value);
      return;
    }

    const lowerName = name.toLowerCase();
    if (Array.isArray(existing)) {
      this.responseInit.headers = [
        ...existing.filter(([key]) => key.toLowerCase() !== lowerName),
        [name, value]
      ];
      return;
    }

    const merged: Record<string, string> = {};
    for (const [key, val] of Object.entries((existing ?? {}) as Record<string, string>)) {
      if (key.toLowerCase() !== lowerName) {
        merged[key] = val;
      }
    }
    merged[name] = value;
    this.responseInit.headers = merged;
  }

  private processContent(post: BlogPost): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const rawContent = isArabic ? post.contentAr : post.content;

    // Generate TOC from content
    const toc = this.blogService.generateToc(rawContent);
    this.tocItems.set(toc);

    // Convert markdown-style content to HTML with IDs for TOC
    // Use bypassSecurityTrustHtml to preserve id attributes on headings
    const processed = this.convertToHtml(rawContent);
    this.processedContent.set(this.sanitizer.bypassSecurityTrustHtml(processed));
  }

  private convertToHtml(content: string): string {
    // Helper function to generate clean IDs from text (supports Arabic and English)
    const generateId = (text: string): string => {
      // For TOC compatibility, we need the EXACT same ID generation as BlogService.generateToc()
      return text
        .toLowerCase()
        .trim()
        // First replace spaces and punctuation with dashes
        .replace(/[\s\u00A0]+/g, '-')  // Replace spaces (including non-breaking spaces)
        .replace(/[^\w\u0600-\u06FF-]+/g, '-')  // Replace non-word chars except Arabic and dashes
        // Clean up multiple dashes and leading/trailing dashes
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    console.log('[Blog Detail] Converting markdown to HTML...');

    // Simple markdown to HTML conversion
    let html = content
      // Headers with IDs for TOC linking (### H3)
      .replace(/^### (.+)$/gm, (_, text) => {
        const id = generateId(text);
        console.log(`[Blog Detail] Generated H3 ID: "${id}" for text: "${text}"`);
        return `<h3 id="${id}" class="scroll-mt-28">${text}</h3>`;
      })
      // Headers with IDs for TOC linking (## H2)
      .replace(/^## (.+)$/gm, (_, text) => {
        const id = generateId(text);
        console.log(`[Blog Detail] Generated H2 ID: "${id}" for text: "${text}"`);
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

    console.log('[Blog Detail] HTML conversion complete');
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
    // The page's own canonical URL (fixed origin + router path, locale prefix
    // included, query/hash stripped). Used for og:url and the JSON-LD
    // mainEntityOfPage so neither ever points at the homepage or, on /ar, at
    // the English URL.
    const ownUrl = this.seo.buildCanonicalUrl(this.router.url);

    // Set title
    this.title.setTitle(metaTitle || `${postTitle} | Roaya IT Blog`);

    // A post that loaded is indexable — undo a noindex left behind by an
    // earlier 404 render (client-side navigation from a broken slug).
    this.meta.removeTag('name="robots"');

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
    this.meta.updateTag({ property: 'og:url', content: ownUrl });
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

    // hreflang: advertise the Arabic version only when it is a complete
    // article (shared rule with the SSR sitemap). An incomplete Arabic page
    // advertises only itself — no English pairing, no x-default — so it is
    // never presented as the translation of the full English article
    // (2026-09-02 AI-readiness reconciliation).
    const arabicComplete = hasCompleteArabicVersion({
      titleAr: post.titleAr,
      contentAr: post.contentAr,
      contentEn: post.content
    });
    // A stub Arabic page renders 200 and is linked from the Arabic blog
    // listing, so dropping it from the sitemap and from hreflang is not
    // enough on its own — it would simply become an orphaned thin page that
    // crawlers can still index. `noindex, follow` keeps it reachable for
    // readers and keeps its links crawlable while removing it from the index,
    // the same treatment the coming-soon placeholders get. The English
    // article is unaffected and stays indexable.
    if (isArabic && !arabicComplete) {
      this.setRobotsNoindex('noindex, follow');
      this.seo.setAlternatesForLocales(splitLocale(this.router.url).path, []);
    } else {
      const availableLocales: Locale[] = arabicComplete ? ['en', 'ar'] : ['en'];
      this.seo.setAlternatesForLocales(splitLocale(this.router.url).path, availableLocales);
    }

    // Add JSON-LD structured data
    this.addStructuredData(post, isArabic, ownUrl);
  }

  private addStructuredData(post: BlogPost, isArabic: boolean, ownUrl: string): void {
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
      // Locale-aware: the /ar page identifies itself, not the English URL
      // (the previous hard-coded EN URL was wrong on every Arabic render).
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': ownUrl
      },
      'keywords': (isArabic ? post.keywordsAr : post.keywords).join(', '),
      'articleSection': post.category,
      'wordCount': countContentWords(isArabic ? post.contentAr : post.content),
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
