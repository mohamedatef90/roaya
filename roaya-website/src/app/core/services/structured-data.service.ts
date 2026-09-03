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
  ROUTE_ENTITY_MAP,
  SERVICE_ENTITY_KEYS,
  FAQ_ENTITY_KEYS,
  CONTACT_DETAILS
} from '../seo/entity-taxonomy';
import { ROUTE_METADATA } from '../seo/route-metadata';
import { Locale, splitLocale, withLocale } from '../i18n/locale-routing';
import { OrganizationNode, ServiceNode, StructuredDataGraph, StructuredDataNode } from '../seo/json-ld.types';
import { CASE_STUDY_MAP, CaseStudyRecord } from '../../features/resources/case-studies/case-studies.data';

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
   *   WebPage                  every route with approved registry metadata,
   *                            plus the case-study detail routes
   *   Article                  case-study detail routes (approved 2026-09-01)
   *   BreadcrumbList           every route with a resolvable ancestry
   *
   * Case-study nodes were deliberately withheld while the case-study claims
   * were registry-blocked; they are emitted since the product-owner approval
   * of 2026-09-01 (docs/decisions/2026-09-01-claim-approvals.md, mirrored in
   * scripts/claim-evidence/registry.json — all five case_study entries are
   * "verified"). If a case study is ever re-blocked, remove its emission here
   * in the same change.
   *
   * Still deliberately carries NO `description` on WebPage: a name + URL +
   * hierarchy is the whole value here; the prose is already in the HTML the
   * same crawler is reading.
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
    const caseStudy = this.caseStudyFor(path);
    const breadcrumb = this.buildBreadcrumb(path, url, locale, caseStudy);
    const serviceKeys = SERVICE_ENTITY_KEYS[path];
    const faqEntries = FAQ_ENTITY_KEYS[path] ?? [];
    if (!metadata && !breadcrumb && serviceIds.length === 0 && !caseStudy && !serviceKeys && faqEntries.length === 0) {
      return [];
    }

    const organization: OrganizationNode = {
      '@type': 'Organization',
      '@id': organizationId,
      name: ORGANIZATION_NAME,
      url: origin,
      foundingDate: ORGANIZATION_FOUNDING_DATE
    };
    if (path === '/contact') {
      // Reference, not duplication: the detail lives in the nodes below, which
      // exist only on the page that renders them.
      organization['address'] = { '@id': `${url}#address` };
      organization['contactPoint'] = { '@id': `${url}#contact` };
    }
    nodes.push(organization);
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

    // This page's own service. Name is the site's canonical label for it;
    // description is emitted only where the page renders that exact sentence
    // (see SERVICE_ENTITY_KEYS). `areaServed` mirrors the Egypt positioning
    // and the Cairo address the Contact page already shows.
    if (serviceKeys) {
      const service: ServiceNode = {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: this.translate.instant(serviceKeys.nameKey),
        url,
        provider: { '@id': organizationId },
        areaServed: { '@type': 'Country', name: 'Egypt' }
      };
      if (serviceKeys.descriptionKey) {
        service['description'] = this.translate.instant(serviceKeys.descriptionKey);
      }
      nodes.push(service);
    }

    // FAQ, built from the question/answer text the page already renders.
    if (faqEntries.length > 0) {
      nodes.push({
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: this.activeLanguage(),
        mainEntity: faqEntries.map(entry => ({
          '@type': 'Question',
          name: this.translate.instant(entry.questionKey),
          acceptedAnswer: {
            '@type': 'Answer',
            text: this.translate.instant(entry.answerKey)
          }
        }))
      });
    }

    // Contact details, on the page that shows them. Emitted only there: an
    // Organization-wide ContactPoint would attach a phone number to every page
    // of the site, including ones that never mention it.
    if (path === '/contact') {
      nodes.push({
        '@type': 'PostalAddress',
        '@id': `${url}#address`,
        streetAddress: this.translate.instant(CONTACT_DETAILS.addressKey),
        addressLocality: CONTACT_DETAILS.addressLocality,
        addressCountry: CONTACT_DETAILS.addressCountry
      });
      nodes.push({
        '@type': 'ContactPoint',
        '@id': `${url}#contact`,
        contactType: 'customer service',
        email: CONTACT_DETAILS.email,
        telephone: CONTACT_DETAILS.telephone,
        areaServed: CONTACT_DETAILS.addressCountry,
        // Both languages the site is published in, and the two the Contact
        // page's own copy names.
        availableLanguage: ['en', 'ar']
      });
    }

    if (breadcrumb) {
      nodes.push(breadcrumb);
    }

    if (metadata || caseStudy) {
      // A case study's page name is its rendered H1 (hero.title); registered
      // static routes keep using their registry title key.
      const pageName = metadata
        ? this.translate.instant(metadata.titleKey)
        : this.translate.instant(`${caseStudy!.translationKey}.hero.title`);
      const webPage: StructuredDataNode = {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: pageName,
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

    if (caseStudy) {
      // Approved 2026-09-01. No datePublished on purpose: the case studies
      // carry no verified publication date, and structured data must not
      // invent one.
      nodes.push({
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: this.translate.instant(`${caseStudy.translationKey}.hero.title`),
        url,
        inLanguage: this.activeLanguage(),
        mainEntityOfPage: { '@id': `${url}#webpage` },
        author: { '@id': organizationId },
        publisher: { '@id': organizationId }
      });
    }

    return nodes;
  }

  /**
   * The registered case study for a `/resources/case-studies/<slug>` path,
   * or null. Unknown slugs return null and keep the 404 free of structured
   * data, exactly like any other unknown route.
   */
  private caseStudyFor(path: string): CaseStudyRecord | null {
    const prefix = '/resources/case-studies/';
    if (!path.startsWith(prefix)) {
      return null;
    }
    const slug = path.slice(prefix.length);
    if (!slug || slug.includes('/')) {
      return null;
    }
    return CASE_STUDY_MAP[slug] ?? null;
  }

  /**
   * Ancestry-derived BreadcrumbList: every ancestor of `path` that carries a
   * visible label, then the page itself.
   *
   * A path whose own leaf has no label still gets the chain up to its parent,
   * which is a valid BreadcrumbList - not a partial one. Case-study detail
   * routes append their own leaf (the hero title) since the 2026-09-01
   * approval; their titles were previously blocked metric claims. Anything
   * shorter than Home + one level is dropped rather than emitted as a
   * single-item list.
   */
  private buildBreadcrumb(
    path: string,
    url: string,
    locale: Locale,
    caseStudy: CaseStudyRecord | null = null
  ): StructuredDataNode | null {
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

    if (caseStudy) {
      items.push({
        '@type': 'ListItem' as const,
        position: items.length + 1,
        name: this.translate.instant(`${caseStudy.translationKey}.hero.title`),
        item: url
      });
    }

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
