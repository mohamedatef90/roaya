/**
 * Single source of truth for the approved entity/service facts used to
 * compose JSON-LD structured data (Stage 3.1, TIFO-13).
 *
 * Every value here must trace back to an approved Stage 0 fact and to the
 * exact visible copy it mirrors — do not add a field unless the
 * corresponding page already renders it. Hard exclusions (do not add):
 * ISO/certification claims, prices/Offer/`$1.50/user/month`, CloudSpace,
 * case-study/client metrics, ratings/reviews, invented address/phone/
 * sameAs/logo/legalName/dates.
 */

export const ORGANIZATION_NAME = 'Roaya IT';

// Approved Stage 0 fact; mirrors src/assets/i18n/en.json "about.story.p1"
// ("Founded in 2018, Roaya IT emerged from...").
export const ORGANIZATION_FOUNDING_DATE = '2018';

export type ApprovedServiceId = 'cloudedge' | 'posta';

export interface ApprovedService {
  id: ApprovedServiceId;
  name: string;
  description: string;
  path: string;
}

export const APPROVED_SERVICES: readonly ApprovedService[] = [
  {
    id: 'cloudedge',
    name: 'CloudEdge',
    // Verbatim approved English CloudEdge definition — mirrors
    // src/assets/i18n/en.json "services.worldposta.cloudedge.description".
    // ar.json carries the faithful Arabic counterpart for the same key.
    description:
      'Welcome to CloudEdge by WorldPosta, your all-in-one secure, scalable cloud hosting solution. Designed to handle mission-critical applications with ease, CloudEdge offers flexibility, robust security, and high performance perfect for businesses of all sizes.',
    path: '/services/worldposta'
  },
  {
    id: 'posta',
    name: 'Posta',
    // Mirrors the English copy already rendered by WorldpostaComponent
    // (worldposta.component.ts products[0].description) — that copy is
    // English-only in the component today (not sourced from i18n).
    description:
      'Enterprise-grade email hosting with advanced security, collaboration tools, and full Microsoft Outlook compatibility.',
    path: '/services/worldposta'
  }
];

/**
 * Canonical path -> the ngx-translate key holding that page's own short,
 * already-visible label (Stage 3.3 breadcrumb coverage).
 *
 * No new copy is authored here. Every key below is the exact key the visible
 * UI already renders for that destination:
 *   - Section roots use the `common.*` labels rendered by the header nav.
 *   - Service and resource leaves use the `title` key the mega-menu link for
 *     that same route already renders (main-layout.component.ts).
 *   - Legal leaves use the page's own visible `legal.*.title`.
 * Every key is asserted to resolve, non-empty, in BOTH en.json and ar.json by
 * the `json-ld-exclusion-gates` evidence check, so a breadcrumb can never
 * render a raw key or silently fall back to English on the Arabic site.
 *
 * `/resources/case-studies/:slug` is deliberately absent: those pages have no
 * short label that is not also a registry-blocked metric claim (every
 * case-study title carries its headline number, e.g. "42% Cost Reduction").
 * Their breadcrumb therefore ends at the listing page, which is a complete,
 * valid BreadcrumbList - not a partial one.
 */
export const BREADCRUMB_LABEL_KEYS: Readonly<Record<string, string>> = {
  '/': 'common.home',
  '/services': 'common.services',
  '/services/automation': 'services.automation.title',
  '/services/backup': 'services.backup.title',
  '/services/cloud': 'services.cloud.title',
  '/services/consulting': 'services.consulting.title',
  '/services/ai': 'services.ai.title',
  '/services/devops': 'services.devops.title',
  '/services/email': 'services.email.title',
  '/services/managed': 'services.managed.title',
  '/services/sap': 'services.sap.title',
  '/services/security': 'services.security.title',
  '/services/security/penetration-testing': 'services.security.page.penetrationTesting.title',
  '/services/security/soc-solutions': 'services.security.page.socSolutions.title',
  '/services/security/incident-response': 'services.security.page.incidentResponse.title',
  '/services/security/pentest-v2': 'services.security.page.pentestV2.title',
  '/services/worldposta': 'services.worldposta.title',
  '/industries': 'common.industries',
  '/pricing': 'common.pricing',
  '/about': 'common.about',
  '/contact': 'common.contact',
  '/roi-calculator': 'roiCalculator.title',
  '/resources': 'common.resources',
  '/resources/blog': 'resources.types.blog.title',
  '/resources/case-studies': 'resources.types.caseStudies.title',
  '/resources/whitepapers': 'resources.types.whitepapers.title',
  '/resources/documentation': 'resources.types.documentation.title',
  '/privacy': 'legal.privacy.title',
  '/terms': 'legal.terms.title',
  '/cookies': 'legal.cookies.title'
};

export interface RouteEntityConfig {
  /** Approved services to emit as `Service` nodes on this route. */
  serviceIds?: ApprovedServiceId[];
}

// Route path (as normalized by StructuredDataService) -> which approved
// *page-specific* nodes to emit.
//
// Scope note (Stage 3.3): this map used to also carry `organizationAndWebsite`
// and hand-written `breadcrumb` chains. Both moved out and neither is a
// dropped fact:
//   - Organization/WebSite are site-wide identity built from verified claims
//     only (name, url, foundingDate 2018), so StructuredDataService now emits
//     them on EVERY route instead of only on '/'. Repeating the same `@id` on
//     every page is how consumers resolve `provider`/`isPartOf` references.
//   - Breadcrumbs are derived from the URL hierarchy plus BREADCRUMB_LABEL_KEYS
//     above, which covers all 30 canonical paths instead of the 2 that were
//     hand-written here.
// What remains here is what cannot be derived: which approved Service facts
// belong to which page. Unlisted routes emit no Service node.
export const ROUTE_ENTITY_MAP: Readonly<Record<string, RouteEntityConfig>> = {
  '/services/worldposta': {
    serviceIds: ['cloudedge', 'posta']
  }
};
