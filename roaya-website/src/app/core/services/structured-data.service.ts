import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SEOService } from './seo.service';
import {
  APPROVED_SERVICES,
  ORGANIZATION_FOUNDING_DATE,
  ORGANIZATION_NAME,
  ROUTE_ENTITY_MAP,
  RouteEntityConfig
} from '../seo/entity-taxonomy';
import { StructuredDataGraph, StructuredDataNode } from '../seo/json-ld.types';

const SCRIPT_ID = 'roaya-structured-data';

/**
 * Emits an SSR-first JSON-LD `@graph` for routes with approved, visible
 * structured-data facts (Stage 3.1 / TIFO-13).
 *
 * Mirrors SEOService's SSR-safe canonical-tag pattern: uses the injected
 * DOCUMENT (the server document during SSR/prerender) so the graph is
 * present in the raw first HTTP response, not only after client hydration.
 */
@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly seo = inject(SEOService);

  constructor() {
    this.render(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.render(event.urlAfterRedirects));
  }

  /**
   * Route path -> canonical lookup key: query/hash stripped, no trailing
   * slash except the root (matching SEOService.buildCanonicalUrl).
   */
  private normalizePath(path: string): string {
    const clean = path.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') {
      return '/';
    }
    return clean.replace(/\/+$/, '');
  }

  private render(rawPath: string): void {
    const config = ROUTE_ENTITY_MAP[this.normalizePath(rawPath)];
    const nodes = config ? this.buildNodes(config) : [];

    if (!nodes.length) {
      this.clear();
      return;
    }

    this.setGraph({ '@context': 'https://schema.org', '@graph': nodes });
  }

  private buildNodes(config: RouteEntityConfig): StructuredDataNode[] {
    const origin = this.seo.buildCanonicalUrl('/');
    const organizationId = `${origin}#organization`;
    const nodes: StructuredDataNode[] = [];

    if (config.organizationAndWebsite) {
      nodes.push({
        '@type': 'Organization',
        '@id': organizationId,
        name: ORGANIZATION_NAME,
        url: origin,
        foundingDate: ORGANIZATION_FOUNDING_DATE
      });
      nodes.push({
        '@type': 'WebSite',
        '@id': `${origin}#website`,
        name: ORGANIZATION_NAME,
        url: origin,
        inLanguage: 'en'
      });
    }

    for (const id of config.serviceIds ?? []) {
      const service = APPROVED_SERVICES.find(candidate => candidate.id === id);
      if (!service) {
        continue;
      }
      const url = this.seo.buildCanonicalUrl(service.path);
      nodes.push({
        '@type': 'Service',
        '@id': `${url}#service-${service.id}`,
        name: service.name,
        description: service.description,
        url,
        provider: { '@id': organizationId }
      });
    }

    if (config.breadcrumb?.length) {
      const lastPath = config.breadcrumb[config.breadcrumb.length - 1].path;
      nodes.push({
        '@type': 'BreadcrumbList',
        '@id': `${this.seo.buildCanonicalUrl(lastPath)}#breadcrumb`,
        itemListElement: config.breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: this.seo.buildCanonicalUrl(item.path)
        }))
      });
    }

    return nodes;
  }

  private setGraph(graph: StructuredDataGraph): void {
    let script = this.document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(graph);
  }

  private clear(): void {
    this.document.getElementById(SCRIPT_ID)?.remove();
  }
}
