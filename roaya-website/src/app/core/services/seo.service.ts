import { DOCUMENT, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ROUTE_METADATA } from '../seo/route-metadata';

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
  private readonly translate = inject(TranslateService);

  private readonly defaultTitle = 'Roaya IT - Enterprise IT Solutions & Services';
  private readonly defaultDescription = 'Roaya IT provides enterprise-grade IT solutions including cloud infrastructure, cybersecurity, email services, and managed IT support in Egypt. Transparent pricing and proven results.';
  private readonly defaultKeywords = 'IT solutions Egypt, cloud hosting Egypt, cybersecurity Egypt, enterprise email hosting, SAP operations, managed IT services, digital transformation Egypt';
  // Fixed canonical origin: www and any other entry host normalize to this.
  private readonly baseUrl = 'https://roaya.co';
  // Brand suffix mirrors the existing static route titles in app.routes.ts
  // (e.g. "Services - Roaya IT"). The company name stays in English in both
  // locales per the approved bilingual content convention.
  private readonly brandSuffix = ' - Roaya IT';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDefaultTags();
    }
    this.setupCanonicalTags();
    this.setupRouteMetadata();
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
   * Route-specific registry metadata (Stage 3.2, TIFO-14).
   *
   * Applies on every completed navigation (including the initial one, so
   * the raw first HTTP response for a registered static route carries its
   * own title/description/OG/Twitter tags) and on every active-language
   * change (so a locale toggle without navigation never leaves
   * stale-language text in the tags).
   *
   * Deliberately does NOT also apply eagerly from `this.router.url` at
   * construction time the way `setupCanonicalTags` does: `SEOService` can
   * be constructed before the initial navigation has resolved (confirmed
   * via a prerendered-HTML check while developing this registry — the
   * eager read observed a stale `this.router.url` still pointing at the
   * default route), and a stale read here is one-sided. If the stale URL
   * matches a registry entry, its tags get applied to the wrong page; if
   * the correct URL later turns out to have no entry, `applyRouteMetadata`
   * is a no-op and never clears that wrong page's stale tags. Canonical
   * has no such asymmetry (it always recomputes on every event, registry
   * or not), so an eager read is harmless there; it is not here.
   * `NavigationEnd` reliably fires (and is received) for the route
   * actually being rendered before SSR serializes the response, so the
   * subscription alone is both correct and sufficient.
   */
  private setupRouteMetadata(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.applyRouteMetadata(event.urlAfterRedirects);
      });

    this.translate.onLangChange.subscribe(() => {
      this.applyRouteMetadata(this.router.url);
    });
  }

  /**
   * Resolve and apply the registry entry for `url`, if one exists.
   */
  private applyRouteMetadata(url: string): void {
    const path = this.normalizeRoutePath(url);
    const entry = ROUTE_METADATA[path];
    if (!entry) {
      return;
    }

    const title = `${this.translate.instant(entry.titleKey)}${this.brandSuffix}`;
    const description = this.truncateDescription(this.translate.instant(entry.descriptionKey));

    this.updateSEO({
      title,
      description,
      url: this.buildCanonicalUrl(path),
      type: entry.ogType || 'website'
    });
  }

  /**
   * Route path with query/hash stripped and trailing slash removed
   * (matching the `ROUTE_METADATA` keys), independent of `buildCanonicalUrl`
   * so a lookup miss never depends on the canonical origin.
   */
  private normalizeRoutePath(url: string): string {
    const cleanPath = url.split('#')[0].split('?')[0];
    const withLeadingSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    const normalized = withLeadingSlash.replace(/\/+$/, '');
    return normalized === '' ? '/' : normalized;
  }

  /**
   * Keep meta descriptions within the practical SERP display length.
   * Cuts at the last whole word at or before the limit and appends an
   * ellipsis, so long-form approved copy (e.g. legal section content)
   * becomes a faithful excerpt rather than a truncated word/claim.
   */
  private truncateDescription(text: string, maxLength = 160): string {
    if (text.length <= maxLength) {
      return text;
    }
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const safeCut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
    return `${safeCut}…`;
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
