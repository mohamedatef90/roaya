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

export interface BreadcrumbEntry {
  /** Visible label, mirrored from the page's own breadcrumb nav or the
   *  "common.*" nav keys in src/assets/i18n/en.json. */
  name: string;
  path: string;
}

export interface RouteEntityConfig {
  organizationAndWebsite?: boolean;
  serviceIds?: ApprovedServiceId[];
  breadcrumb?: BreadcrumbEntry[];
}

// Route path (as normalized by StructuredDataService) -> which approved
// nodes to emit. Scoped to the routes with unambiguous, already-approved,
// visibly-rendered facts; unlisted routes emit no JSON-LD.
export const ROUTE_ENTITY_MAP: Readonly<Record<string, RouteEntityConfig>> = {
  '/': {
    organizationAndWebsite: true
  },
  '/about': {
    // Mirrors src/assets/i18n/en.json "common.home" / "common.about".
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' }
    ]
  },
  '/services/worldposta': {
    serviceIds: ['cloudedge', 'posta'],
    // Mirrors the breadcrumb nav already rendered in
    // worldposta.component.html (Home > Solutions > WorldPosta), where
    // "Solutions" is src/assets/i18n/en.json "common.services".
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Solutions', path: '/services' },
      { name: 'WorldPosta', path: '/services/worldposta' }
    ]
  }
};
