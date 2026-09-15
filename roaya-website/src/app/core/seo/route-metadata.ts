/**
 * Route-specific, bilingual SSR metadata registry (Stage 3.2, TIFO-14).
 *
 * Maps every canonical, static public route (mirrors `src/app/app.routes.ts`
 * and `public/sitemap.xml`) to the existing, already-approved ngx-translate
 * keys that back its `<title>` / meta description / Open Graph / Twitter
 * card tags. `SEOService` resolves these keys through `TranslateService`
 * at render time, so the exact same string that is already visible on the
 * page (or a faithful excerpt of it) becomes the route's metadata — no new
 * copy is authored here.
 *
 * Corrective note (QA_BLOCKED follow-up): the first version of this
 * registry deliberately excluded the 15 dedicated `services/*` sub-pages
 * because their components set title/description/OG tags directly via
 * Angular's `Meta`/`Title` services, which would have raced with this
 * registry. That correction is now the other way round: those 15
 * components' direct `Meta`/`Title` calls have been REMOVED (their
 * `ngOnInit` no longer touches SEO tags at all — visible page copy and all
 * other functionality is unchanged), so `SEOService` is the single writer
 * for every route below, and all 15 are now registered using the same
 * approved hero-copy translation keys those components used to hardcode
 * in English only (`services.<name>.title/description` for the flat
 * sub-pages, `services.security.page.<name>.hero.title/subtitle*` for the
 * security sub-pages, `services.worldposta.heroTitle/heroDescription`).
 *
 * Fallback strategy (documented, not silent):
 * - A route with NO entry here keeps the SEOService's generic site-wide
 *   defaults. That is intentional for two remaining categories of route,
 *   not a gap:
 *     1. Routes that already resolve their own page-specific metadata via
 *        `SEOService.updateSEO()` (dynamic detail/content pages):
 *        `resources/blog/:slug` (blog-detail.component.ts),
 *        `resources/case-studies/:slug` (case-study-detail.component.ts),
 *        `resources/whitepapers` and `resources/documentation`
 *        (coming-soon.component.ts). Adding a registry entry for these
 *        paths would create a race with the component's own call and is
 *        deliberately omitted. The two coming-soon placeholders are also
 *        listed in `NOINDEX_ROUTES` below (2026-09-02 AI-readiness
 *        reconciliation): the component emits `robots: noindex, follow`
 *        and they are excluded from `public/sitemap.xml` and
 *        `public/llms.txt` until real content ships.
 *     2. Parameterized fallback routes `services/:id` and `industries/:id`
 *        are not canonical: `public/sitemap.xml` lists only the dedicated
 *        static service/industry pages, never the generic `:id` fallback.
 *        Neither component currently calls `SEOService.updateSEO()`, so
 *        these two keep the generic site-wide defaults; that is out of the
 *        canonical-route scope this registry covers, not a gap in it.
 * - The `**` (not-found) route is intentionally NOT registered here: it is
 *   marked `noindex` by `NotFoundComponent` instead of being given
 *   route-specific, indexable metadata (it also returns a real HTTP 404 —
 *   see `app.routes.server.ts`).
 * - No route in the current inventory lacks safe source copy; if a future
 *   route is added without an existing approved title/description
 *   translation, add it to `PENDING_ROUTE_METADATA_GAPS` below instead of
 *   inventing text, and flag it for content sign-off.
 *
 * EN/AR and SSR scope (updated Stage 3.4 - the constraint below is gone):
 * this registry is keyed by LOCALE-INDEPENDENT paths. `/about` and
 * `/ar/about` both resolve the entry for `/about`, through whichever language
 * the URL declares.
 *
 * Until Stage 3.4 the app had no locale-prefixed routes and no server-side
 * language selection: every path was prerendered once and `LanguageService`
 * read the language from `localStorage`/`navigator.language` (both
 * browser-only), so the raw first HTTP response was ALWAYS English and Arabic
 * existed only after hydration - invisible to every crawler and AI agent.
 * English is now served unprefixed and Arabic under `/ar`, each prerendered
 * in its own language, with `hreflang` alternates tying the pair together.
 * The keys here did not change, which is why adding a locale did not touch a
 * single entry below.
 */

export interface RouteMetadataEntry {
  /** ngx-translate key resolving to the route's page/hero title. */
  readonly titleKey: string;
  /** ngx-translate key resolving to the route's page/hero description. */
  readonly descriptionKey: string;
  /** Open Graph type; defaults to 'website' when omitted. */
  readonly ogType?: 'website' | 'article';
}

/**
 * Canonical path (no trailing slash, root is '/') -> metadata source keys.
 * Keys are validated to exist, non-empty, in both `src/assets/i18n/en.json`
 * and `src/assets/i18n/ar.json`.
 */
export const ROUTE_METADATA: Readonly<Record<string, RouteMetadataEntry>> = {
  '/': {
    // The <title> is deliberately shorter than the <h1>. With the " - Roaya IT"
    // suffix the h1 phrasing runs to 77 characters in English and 88 in Arabic,
    // past where result pages truncate — which would cut both "in Egypt" and
    // the brand. The h1 keeps the full portfolio phrasing for readers and for
    // assistants extracting the page's subject.
    titleKey: 'home.hero.metaTitle',
    descriptionKey: 'home.hero.description'
  },
  '/services': {
    titleKey: 'services.page.title',
    descriptionKey: 'services.page.description'
  },
  '/services/automation': {
    titleKey: 'services.automation.title',
    descriptionKey: 'services.automation.description'
  },
  '/services/aws': {
    titleKey: 'services.aws.title',
    descriptionKey: 'services.aws.description'
  },
  '/services/backup': {
    titleKey: 'services.backup.title',
    descriptionKey: 'services.backup.description'
  },
  '/services/cloud': {
    titleKey: 'services.cloud.title',
    descriptionKey: 'services.cloud.description'
  },
  '/services/consulting': {
    titleKey: 'services.consulting.title',
    descriptionKey: 'services.consulting.description'
  },
  '/services/ai': {
    titleKey: 'services.ai.title',
    descriptionKey: 'services.ai.description'
  },
  '/services/devops': {
    titleKey: 'services.devops.title',
    descriptionKey: 'services.devops.description'
  },
  '/services/email': {
    titleKey: 'services.email.title',
    descriptionKey: 'services.email.description'
  },
  '/services/enterprise-software': {
    titleKey: 'services.enterpriseSoftware.title',
    descriptionKey: 'services.enterpriseSoftware.description'
  },
  '/services/managed': {
    titleKey: 'services.managed.title',
    descriptionKey: 'services.managed.description'
  },
  '/services/sap': {
    titleKey: 'services.sap.title',
    descriptionKey: 'services.sap.description'
  },
  '/services/security': {
    titleKey: 'services.security.title',
    descriptionKey: 'services.security.description'
  },
  '/services/security/penetration-testing': {
    titleKey: 'services.security.page.penetrationTesting.hero.title',
    // The hero subtitle is a paragraph; as a description it was cut mid-sentence.
    descriptionKey: 'services.security.page.penetrationTesting.metaDescription'
  },
  '/services/security/soc-solutions': {
    // The hero title is the page's tagline ("Stop Chasing Alerts…"), which never
    // names the service. A result listing or an assistant asked what this page
    // is needs the service, so the <title> uses a dedicated key while the <h1>
    // keeps the tagline.
    titleKey: 'services.security.page.socSolutions.metaTitle',
    descriptionKey: 'services.security.page.socSolutions.metaDescription'
  },
  '/services/security/incident-response': {
    titleKey: 'services.security.page.incidentResponse.hero.title',
    descriptionKey: 'services.security.page.incidentResponse.hero.subtitle'
  },
  // Note: pentest-v2 is now a redirect to penetration-testing, not a separate page.
  '/services/worldposta': {
    titleKey: 'services.worldposta.heroTitle',
    descriptionKey: 'services.worldposta.heroDescription'
  },
  '/industries': {
    titleKey: 'industries.page.title',
    descriptionKey: 'industries.page.description'
  },
  '/industries/finance': {
    titleKey: 'industries.finance.title',
    descriptionKey: 'industries.finance.description'
  },
  '/industries/healthcare': {
    titleKey: 'industries.healthcare.title',
    descriptionKey: 'industries.healthcare.description'
  },
  '/industries/government': {
    titleKey: 'industries.government.title',
    descriptionKey: 'industries.government.description'
  },
  '/industries/manufacturing': {
    titleKey: 'industries.manufacturing.title',
    descriptionKey: 'industries.manufacturing.description'
  },
  '/industries/retail': {
    titleKey: 'industries.retail.title',
    descriptionKey: 'industries.retail.description'
  },
  '/industries/education': {
    titleKey: 'industries.education.title',
    descriptionKey: 'industries.education.description'
  },
  '/pricing': {
    titleKey: 'pricing.page.title',
    descriptionKey: 'pricing.page.description'
  },
  '/about': {
    titleKey: 'about.page.title',
    descriptionKey: 'about.page.description'
  },
  '/contact': {
    titleKey: 'contact.page.title',
    descriptionKey: 'contact.page.description'
  },
  '/roi-calculator': {
    titleKey: 'roiCalculator.title',
    descriptionKey: 'roiCalculator.subtitle'
  },
  '/resources': {
    titleKey: 'resources.title',
    descriptionKey: 'resources.description'
  },
  '/resources/blog': {
    titleKey: 'blog.title',
    descriptionKey: 'blog.description'
  },
  '/resources/case-studies': {
    titleKey: 'caseStudies.title',
    descriptionKey: 'caseStudies.description'
  },
  // Legal pages pointed their descriptionKey at body copy — a 300-character
  // legal paragraph truncated mid-sentence, which is what search results and
  // assistants were quoting. Each now has a written description.
  '/privacy': {
    titleKey: 'legal.privacy.title',
    descriptionKey: 'legal.privacy.metaDescription'
  },
  '/terms': {
    titleKey: 'legal.terms.title',
    descriptionKey: 'legal.terms.metaDescription'
  },
  '/cookies': {
    titleKey: 'legal.cookies.title',
    descriptionKey: 'legal.cookies.metaDescription'
  }
};

/**
 * Routes known to lack a safe, non-generic, already-approved translation
 * key to source a route-specific description from. Empty today — every
 * canonical static route above has real source copy. Keep this list (and
 * check it) so a future route added without approved copy is flagged here
 * instead of silently inventing text or silently falling back to the
 * generic site-wide description.
 */
export const PENDING_ROUTE_METADATA_GAPS: readonly string[] = [];

/**
 * Locale-independent paths that stay reachable for humans but are excluded
 * from indexing and from the discovery files (2026-09-02 AI-readiness
 * reconciliation, action plan P0.4 "no placeholder page is indexable").
 *
 * Each listed route renders `<meta name="robots" content="noindex, follow">`
 * (coming-soon.component.ts) and is deliberately absent from
 * `public/sitemap.xml` and `public/llms.txt` in both locales; the
 * canonical-metadata-coverage gate reads this list so a prerendered route
 * missing from the sitemap is only accepted when it appears here.
 *
 * To re-index a route once real content ships: remove its path from this
 * list, drop the noindex tag from its component, and add it back to
 * sitemap.xml (EN + AR) and llms.txt. One string literal per line so the
 * gate's regex extraction stays reliable.
 */
export const NOINDEX_ROUTES: readonly string[] = [
  '/resources/whitepapers',
  '/resources/documentation'
];
