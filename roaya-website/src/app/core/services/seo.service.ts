import { Injectable, inject, PLATFORM_ID } from '@angular/core';
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
  structuredData?: any;
}

/**
 * SEO Service
 * Handles meta tags, structured data (JSON-LD), and SEO optimization
 */
@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly defaultTitle = 'Roaya IT - Enterprise IT Solutions & Services';
  private readonly defaultDescription = 'Roaya IT provides enterprise-grade IT solutions including cloud infrastructure, cybersecurity, email services, and managed IT support in Egypt. Transparent pricing and proven results.';
  private readonly defaultKeywords = 'IT solutions Egypt, cloud hosting Egypt, cybersecurity Egypt, enterprise email hosting, SAP operations, managed IT services, digital transformation Egypt';
  private readonly baseUrl = 'https://roaya.co'; // TODO: Update with actual domain

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDefaultTags();
      this.setupCanonicalTags();
    }
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
   * Set up canonical tags on route changes
   */
  private setupCanonicalTags(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setCanonicalUrl(window.location.href);
      });
  }

  /**
   * Update SEO data for a page
   */
  updateSEO(data: SEOData): void {
    if (!isPlatformBrowser(this.platformId)) return;

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
      url: data.url || window.location.href,
      type: data.type || 'website'
    });

    // Twitter Card tags
    this.setTwitterCardTags({
      title: data.title || this.defaultTitle,
      description: data.description || this.defaultDescription,
      image: data.image || '/assets/images/roaya-logo.png'
    });

    // Structured Data (JSON-LD)
    if (data.structuredData) {
      this.setStructuredData(data.structuredData);
    }
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
   * Set canonical URL
   */
  private setCanonicalUrl(url: string): void {
    // Remove existing canonical link
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  /**
   * Add structured data (JSON-LD) to page
   */
  private setStructuredData(data: any): void {
    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Get organization structured data
   */
  getOrganizationStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Roaya IT',
      url: this.baseUrl,
      logo: `${this.baseUrl}/assets/images/roaya-logo.png`,
      description: this.defaultDescription,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
        addressLocality: 'Cairo'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'info@roaya.co'
      },
      sameAs: [
        // TODO: Add social media URLs
      ]
    };
  }

  /**
   * Get website structured data
   */
  getWebSiteStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Roaya IT',
      url: this.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/resources/blog?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Get breadcrumb structured data
   */
  getBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`
      }))
    };
  }
}
