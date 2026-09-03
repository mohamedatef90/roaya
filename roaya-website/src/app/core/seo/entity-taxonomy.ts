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

// Approved fact (product-owner decision 2026-09-01, resolving the
// 2018-vs-2012 ambiguity in favor of the LinkedIn company record — see
// docs/decisions/2026-09-01-claim-approvals.md); mirrors
// src/assets/i18n/en.json "about.story.p1" ("Founded in 2012, ...").
export const ORGANIZATION_FOUNDING_DATE = '2012';

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
 * `/resources/case-studies/:slug` is absent from this map because the slugs
 * are dynamic: StructuredDataService appends the case-study leaf itself,
 * using the study's translated hero.title. Those titles were registry-blocked
 * metric claims until the product-owner approval of 2026-09-01
 * (docs/decisions/2026-09-01-claim-approvals.md); the leaf, WebPage, and
 * Article nodes for case studies are emitted only because that approval
 * stands — re-blocking a case study must remove its emission again.
 */
export const BREADCRUMB_LABEL_KEYS: Readonly<Record<string, string>> = {
  '/': 'common.home',
  '/services': 'common.services',
  '/services/automation': 'services.automation.title',
  '/services/aws': 'services.aws.title',
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
  // Note: pentest-v2 is now a redirect to penetration-testing, not a separate page.
  '/services/worldposta': 'services.worldposta.title',
  '/industries': 'common.industries',
  '/industries/finance': 'industries.finance.title',
  '/industries/healthcare': 'industries.healthcare.title',
  '/industries/government': 'industries.government.title',
  '/industries/manufacturing': 'industries.manufacturing.title',
  '/industries/retail': 'industries.retail.title',
  '/industries/education': 'industries.education.title',
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

/**
 * Service pages -> the i18n keys that page already renders (P1.2, "align
 * structured data with visible facts", 2026-09-02 reconciliation).
 *
 * Before this map only `/services/worldposta` emitted a `Service` node, so an
 * assistant asked "does Roaya run SOC services in Egypt?" had to infer the
 * answer from prose. Every commercial service page now declares what it sells
 * in machine-readable form.
 *
 * The rules that keep this honest:
 *   - `nameKey` is the canonical label the site already uses for that service
 *     everywhere (nav, services index, breadcrumb). A name is a label, not a
 *     claim.
 *   - `descriptionKey` is present ONLY where that exact string is rendered in
 *     the page's own `<main>`, verified against the built server output. Pages
 *     whose body copy is hard-coded in their component rather than i18n get a
 *     Service node with no description rather than a borrowed one. Never point
 *     it at a meta description: schema must not assert more than the page shows.
 *   - Both keys must resolve, non-empty, in en.json AND ar.json — enforced by
 *     the `json-ld-exclusion-gates` check, so the Arabic graph is Arabic.
 *
 * Adding a page here requires nothing but its label; adding a description
 * requires putting that sentence on the page first.
 */
export interface ServiceEntityKeys {
  /** Key holding the service's canonical short name. */
  nameKey: string;
  /** Key holding a summary sentence this page renders in <main>. */
  descriptionKey?: string;
}

export const SERVICE_ENTITY_KEYS: Readonly<Record<string, ServiceEntityKeys>> = {
  '/services/cloud': { nameKey: 'services.cloud.title' },
  '/services/security': {
    nameKey: 'services.security.title',
    descriptionKey: 'services.security.page.threats.paragraph1'
  },
  '/services/security/penetration-testing': {
    nameKey: 'services.security.page.penetrationTesting.title',
    descriptionKey: 'services.security.page.penetrationTesting.hero.subtitle'
  },
  '/services/security/soc-solutions': {
    nameKey: 'services.security.page.socSolutions.title',
    descriptionKey: 'services.security.page.socSolutions.hero.subtitle'
  },
  '/services/security/incident-response': {
    nameKey: 'services.security.page.incidentResponse.title',
    descriptionKey: 'services.security.page.incidentResponse.hero.subtitle'
  },
  '/services/email': { nameKey: 'services.email.title' },
  '/services/managed': { nameKey: 'services.managed.title' },
  '/services/backup': { nameKey: 'services.backup.title' },
  '/services/consulting': { nameKey: 'services.consulting.title' },
  '/services/sap': { nameKey: 'services.sap.title' },
  '/services/devops': {
    nameKey: 'services.devops.title',
    descriptionKey: 'services.devops.page.hero.subtitle'
  },
  '/services/automation': { nameKey: 'services.automation.title' },
  '/services/ai': {
    nameKey: 'services.ai.title',
    descriptionKey: 'services.ai.page.solution.description'
  },
  '/services/aws': {
    nameKey: 'services.aws.title',
    descriptionKey: 'services.aws.hero.lead'
  }
};

/**
 * Pages with a visible FAQ -> the question/answer key pairs they render.
 *
 * `FAQPage` is emitted only from question and answer text the page already
 * shows. Both accordions keep their answers in the served HTML (collapsed by
 * CSS, not removed), so the schema and the page say the same thing — which is
 * the whole condition for publishing it.
 *
 * These answers repeat whatever the visible copy claims. When a claim in one
 * of them changes, the schema follows automatically; it can never be used to
 * state something the page does not.
 */
export const FAQ_ENTITY_KEYS: Readonly<Record<string, readonly { questionKey: string; answerKey: string }[]>> = {
  '/': [
    { questionKey: 'home.faq.q1.question', answerKey: 'home.faq.q1.answer' },
    { questionKey: 'home.faq.q2.question', answerKey: 'home.faq.q2.answer' },
    { questionKey: 'home.faq.q3.question', answerKey: 'home.faq.q3.answer' },
    { questionKey: 'home.faq.q4.question', answerKey: 'home.faq.q4.answer' }
  ],
  '/services/aws': [
    { questionKey: 'services.aws.faq.tier.q', answerKey: 'services.aws.faq.tier.a' },
    { questionKey: 'services.aws.faq.residency.q', answerKey: 'services.aws.faq.residency.a' },
    { questionKey: 'services.aws.faq.map.q', answerKey: 'services.aws.faq.map.a' },
    { questionKey: 'services.aws.faq.timeline.q', answerKey: 'services.aws.faq.timeline.a' },
    { questionKey: 'services.aws.faq.pricing.q', answerKey: 'services.aws.faq.pricing.a' },
    { questionKey: 'services.aws.faq.arabic.q', answerKey: 'services.aws.faq.arabic.a' }
  ]
};

/**
 * Contact details, exactly as the Contact page renders them.
 *
 * The action plan's P3 asks for ContactPoint and address markup on Contact.
 * Every value below is already visible at /contact — the address block, the
 * phone link and the email link — so the graph repeats the page rather than
 * adding to it. Nothing here is inferred: no geo coordinates, no opening hours
 * beyond the ones the page states, no second location.
 *
 * The published hours are the Contact page's own
 * "Sunday - Thursday: 9:00 AM - 6:00 PM". They are NOT emitted as an
 * openingHours claim, because the rest of the site advertises 24/7 support and
 * the two have not been reconciled (pending decision 1). Publishing either one
 * as structured fact would take a side in an open question.
 */
export const CONTACT_DETAILS = {
  /** Rendered at /contact as the email link. */
  email: 'info@roaya.co',
  /** Rendered at /contact as the phone link. */
  telephone: '+201096274996',
  /** i18n key for the street address the page shows, resolved per locale. */
  addressKey: 'contact.info.address.value',
  addressLocality: 'Cairo',
  addressCountry: 'EG'
} as const;

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
//     only (name, url, foundingDate 2012), so StructuredDataService now emits
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
