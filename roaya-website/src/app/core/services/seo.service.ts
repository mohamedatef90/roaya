import { DOCUMENT, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * SEO Service
 * Handles meta tags, canonical URLs, and SEO optimization.
 * JSON-LD structured data is handled separately by StructuredDataService.
 */
@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private readonly defaultTitle = 'Roaya IT - Enterprise IT Solutions & Services';
  private readonly defaultDescription = 'Roaya IT provides enterprise-grade IT solutions including cloud infrastructure, cybersecurity, email services, and managed IT support in Egypt. Transparent pricing and proven results.';
  private readonly defaultKeywords = 'IT solutions Egypt, cloud hosting Egypt, cybersecurity Egypt, enterprise email hosting, SAP operations, managed IT services, digital transformation Egypt';
  // Fixed canonical origin: www and any other entry host normalize to this.
  private readonly baseUrl = 'https://roaya.co';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDefaultTags();
    }
    this.setupCanonicalTags();
  }

  /**
   * Initialize default meta tags
   */
  private initializeDefaultTags(): void {
    this.setTitle(this.defaultTitle);
    this.setDescription(this.defaultDescription);
    this.setKeywords(this.defaultKeywords);
    this.setImage('/assets/images/roaya-logo.png');
  }

  /**
   * Keep a self-referencing canonical in sync with the active route.
   *
   * The URL is always built from the fixed origin plus the router path
   * (never from the browser location), so www/non-www entry hosts and any
   * query parameters or hash fragments cannot leak into the canonical.
   * Runs on both server and browser: during SSR/prerender the initial
   * navigation has already completed when this service is constructed, so
   * the immediate call below emits the canonical in the first HTTP
   * response; the subscription keeps it updated on client-side navigation.
   */
  private setupCanonicalTags(): void {
    this.setCanonicalUrl(this.buildCanonicalUrl(this.router.url));

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.setCanonicalUrl(this.buildCanonicalUrl(event.urlAfterRedirects));
      });
  }

  /**
   * Build the canonical URL for a router path: fixed origin, query
   * parameters and hash excluded, no trailing slash except for the root
   * (matching sitemap.xml entries).
   */
  buildCanonicalUrl(path: string): string {
    const cleanPath = path.split('#')[0].split('?')[0];
    const withLeadingSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    const normalized = withLeadingSlash.replace(/\/+$/, '');
    return normalized === '' ? `${this.baseUrl}/` : `${this.baseUrl}${normalized}`;
  }

  /**
   * Update SEO data for a page
   */
  updateSEO(data: SEOData): void {
    // Title
    if (data.title) {
      this.setTitle(data.title);
    }

    // Description
    if (data.description) {
      this.setDescription(data.description);
    }

    // Keywords
    if (data.keywords) {
      this.setKeywords(data.keywords);
    }

    // Open Graph tags
    this.setOpenGraphTags({
      title: data.title || this.defaultTitle,
      description: data.description || this.defaultDescription,
      image: data.image || '/assets/images/roaya-logo.png',
      url: data.url || this.buildCanonicalUrl(this.router.url),
      type: data.type || 'website'
    });

    // Twitter Card tags
    this.setTwitterCardTags({
      title: data.title || this.defaultTitle,
      description: data.description || this.defaultDescription,
      image: data.image || '/assets/images/roaya-logo.png'
    });
  }

  /**
   * Set page title
   */
  private setTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
  }

  /**
   * Set meta description
   */
  private setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  /**
   * Set meta keywords
   */
  private setKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Set meta image
   */
  private setImage(image: string): void {
    const fullImageUrl = image.startsWith('http') ? image : `${this.baseUrl}${image}`;
    this.meta.updateTag({ property: 'og:image', content: fullImageUrl });
    this.meta.updateTag({ name: 'twitter:image', content: fullImageUrl });
  }

  /**
   * Set Open Graph tags
   */
  private setOpenGraphTags(data: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
  }): void {
    const fullImageUrl = data.image.startsWith('http') ? data.image : `${this.baseUrl}${data.image}`;
    const fullUrl = data.url.startsWith('http') ? data.url : `${this.baseUrl}${data.url}`;

    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: fullImageUrl });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:type', content: data.type });
    this.meta.updateTag({ property: 'og:site_name', content: 'Roaya IT' });
  }

  /**
   * Set Twitter Card tags
   */
  private setTwitterCardTags(data: {
    title: string;
    description: string;
    image: string;
  }): void {
    const fullImageUrl = data.image.startsWith('http') ? data.image : `${this.baseUrl}${data.image}`;

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: fullImageUrl });
  }

  /**
   * Set canonical URL (SSR-safe: uses the injected DOCUMENT, which is the
   * server-side document during SSR/prerender)
   */
  private setCanonicalUrl(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
