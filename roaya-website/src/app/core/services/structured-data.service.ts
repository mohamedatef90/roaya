import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SEOService } from './seo.service';
import {
  APPROVED_SERVICES,
  BREADCRUMB_LABEL_KEYS,
  ORGANIZATION_FOUNDING_DATE,
  ORGANIZATION_NAME,
  ROUTE_ENTITY_MAP
} from '../seo/entity-taxonomy';
import { ROUTE_METADATA } from '../seo/route-metadata';
import { Locale, splitLocale, withLocale } from '../i18n/locale-routing';
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
  private readonly translate = inject(TranslateService);

  constructor() {
    this.render(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.render(event.urlAfterRedirects));

    // Breadcrumb and WebPage names are translated copy, so a locale toggle
    // without navigation would otherwise leave the graph in the previous
    // language while the visible page is in the new one. Mirrors the same
    // onLangChange re-application SEOService does for title/description.
    this.translate.onLangChange.subscribe(() => this.render(this.router.url));
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
    const { locale, path } = splitLocale(this.normalizePath(rawPath));
    const nodes = this.buildNodes(path, locale);

    if (!nodes.length) {
      this.clear();
      return;
    }

    this.setGraph({ '@context': 'https://schema.org', '@graph': nodes });
  }

  /**
   * Compose the page's `@graph`:
   *   Organization + WebSite   site-wide identity, every route
   *   Service                  only where ROUTE_ENTITY_MAP approves it
   *   WebPage                  every route with approved registry metadata
   *   BreadcrumbList           every route with a resolvable ancestry
   *
   * Deliberately carries NO `description` on WebPage. The route's meta
   * description is approved for a meta tag, but on the case-study routes it
   * restates a registry-*blocked* metric claim ("42% cost reduction"), and
   * structured data is the one surface where those must not appear. A name +
   * URL + hierarchy is the whole value here anyway; the prose is already in
   * the HTML the same crawler is reading.
   */
  private buildNodes(path: string, locale: Locale): StructuredDataNode[] {
    const origin = this.seo.buildCanonicalUrl('/');
    const organizationId = `${origin}#organization`;
    const websiteId = `${origin}#website`;
    // Lookups are keyed by the locale-independent path; every emitted URL is
    // the locale's own, so the Arabic graph describes the Arabic page and
    // never links back into the English tree.
    const url = this.seo.buildCanonicalUrl(withLocale(path, locale));
    const nodes: StructuredDataNode[] = [];

    // Site-wide identity is emitted only alongside at least one page-specific
    // node. A route we cannot describe - an unknown path, i.e. the real 404 -
    // must stay free of structured data rather than assert "this is Roaya IT's
    // website" about a page that does not exist.
    const metadata = ROUTE_METADATA[path];
    const serviceIds = ROUTE_ENTITY_MAP[path]?.serviceIds ?? [];
    const breadcrumb = this.buildBreadcrumb(path, url, locale);
    if (!metadata && !breadcrumb && serviceIds.length === 0) {
      return [];
    }

    nodes.push({
      '@type': 'Organization',
      '@id': organizationId,
      name: ORGANIZATION_NAME,
      url: origin,
      foundingDate: ORGANIZATION_FOUNDING_DATE
    });
    nodes.push({
      '@type': 'WebSite',
      '@id': websiteId,
      name: ORGANIZATION_NAME,
      url: origin,
      inLanguage: this.activeLanguage()
    });

    for (const id of serviceIds) {
      const service = APPROVED_SERVICES.find(candidate => candidate.id === id);
      if (!service) {
        continue;
      }
      const serviceUrl = this.seo.buildCanonicalUrl(withLocale(service.path, locale));
      nodes.push({
        '@type': 'Service',
        '@id': `${serviceUrl}#service-${service.id}`,
        name: service.name,
        description: service.description,
        url: serviceUrl,
        provider: { '@id': organizationId }
      });
    }

    if (breadcrumb) {
      nodes.push(breadcrumb);
    }

    if (metadata) {
      const webPage: StructuredDataNode = {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: this.translate.instant(metadata.titleKey),
        url,
        inLanguage: this.activeLanguage(),
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId }
      };
      if (breadcrumb) {
        webPage['breadcrumb'] = { '@id': breadcrumb['@id'] };
      }
      nodes.push(webPage);
    }

    return nodes;
  }

  /**
   * Ancestry-derived BreadcrumbList: every ancestor of `path` that carries a
   * visible label, then the page itself.
   *
   * A path whose own leaf has no label (today: the case-study detail routes,
   * whose only short titles are blocked metric claims) still gets the chain
   * up to its parent, which is a valid BreadcrumbList - not a partial one.
   * Anything shorter than Home + one level is dropped rather than emitted as
   * a single-item list.
   */
  private buildBreadcrumb(path: string, url: string, locale: Locale): StructuredDataNode | null {
    const segments = path === '/' ? [] : path.slice(1).split('/');
    const paths = ['/', ...segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`)];

    const items = paths
      .map(ancestor => ({ path: ancestor, key: BREADCRUMB_LABEL_KEYS[ancestor] }))
      .filter((entry): entry is { path: string; key: string } => Boolean(entry.key))
      .map((entry, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        name: this.translate.instant(entry.key),
        item: this.seo.buildCanonicalUrl(withLocale(entry.path, locale))
      }));

    if (items.length < 2) {
      return null;
    }

    return {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: items
    };
  }

  /**
   * BCP-47 tag for the active locale, so `inLanguage` follows the language
   * toggle instead of asserting English on an Arabic render.
   */
  private activeLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang() || 'en';
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
