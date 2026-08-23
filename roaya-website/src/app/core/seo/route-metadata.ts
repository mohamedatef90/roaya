/**
 * Route-specific, bilingual SSR metadata registry (Stage 3.2, TIFO-14).
 *
 * Maps a canonical, static public route (mirrors `src/app/app.routes.ts`
 * and `public/sitemap.xml`) to the existing, already-approved ngx-translate
 * keys that back its `<title>` / meta description / Open Graph / Twitter
 * card tags. `SEOService` resolves these keys through `TranslateService`
 * at render time, so the exact same string that is already visible on the
 * page (or a faithful excerpt of it) becomes the route's metadata — no new
 * copy is authored here.
 *
 * Fallback strategy (documented, not silent):
 * - A route with NO entry here keeps whatever metadata it already has
 *   (either the SEOService generic site-wide defaults, or metadata the
 *   route's own component already sets directly). That is intentional for
 *   three categories of route, not a gap:
 *     1. Routes that already resolve their own page-specific metadata via
 *        `SEOService.updateSEO()` (dynamic detail/content pages):
 *        `resources/blog/:slug` (blog-detail.component.ts),
 *        `resources/case-studies/:slug` (case-study-detail.component.ts),
 *        `resources/whitepapers` and `resources/documentation`
 *        (coming-soon.component.ts). Adding a registry entry for these
 *        paths would create a race with the component's own call and is
 *        deliberately omitted.
 *     2. Routes whose component already sets its own title/description/OG
 *        tags DIRECTLY via Angular's `Meta`/`Title` services, bypassing
 *        `SEOService` entirely: every dedicated `services/*` sub-page
 *        (`services/ai`, `services/automation`, `services/backup`,
 *        `services/cloud`, `services/consulting`, `services/devops`,
 *        `services/email`, `services/managed`, `services/sap`,
 *        `services/security`, `services/security/penetration-testing`,
 *        `services/security/soc-solutions`,
 *        `services/security/incident-response`,
 *        `services/security/pentest-v2`, `services/worldposta`) and no
 *        others. This was verified per-route by grepping for direct
 *        `Meta`/`Title` injection — adding a registry entry for one of
 *        these would not be additive: the component's own `ngOnInit` call
 *        wins for `<title>`/`og:*`/`description` (it runs after this
 *        registry's application) while this registry's Twitter tags would
 *        be left standing alone, producing internally-conflicting tags on
 *        a single page. Confirmed via a build + raw-HTML check on
 *        `services/security/soc-solutions` while developing this registry;
 *        those 15 routes are excluded from `ROUTE_METADATA` for exactly
 *        this reason. Their existing metadata is hardcoded English-only
 *        (not bilingual) and predates this stage; making it bilingual
 *        would mean rewriting fifteen components' own SEO code, which is
 *        beyond a "route-specific metadata registry" change — flagged
 *        below in `PENDING_ROUTE_METADATA_GAPS` for separate follow-up.
 *     3. Parameterized fallback routes `services/:id` and `industries/:id`
 *        are not canonical: `public/sitemap.xml` lists only the dedicated
 *        static service/industry pages, never the generic `:id` fallback.
 *        Neither component currently calls `SEOService.updateSEO()`, so
 *        these two keep the generic site-wide defaults; that is out of the
 *        canonical-route scope this registry covers, not a gap in it.
 * - The `**` (not-found) route is intentionally NOT registered here: it is
 *   marked `noindex` by `NotFoundComponent` instead of being given
 *   route-specific, indexable metadata (it also returns a real HTTP 404 —
 *   see `app.routes.server.ts`).
 *
 * EN/AR and SSR scope (architectural constraint, not a Stage 3.2 gap):
 * the app has no locale-prefixed routes and no server-side Accept-Language
 * detection (`app.routes.server.ts` prerenders/serves every path once, and
 * `LanguageService` picks the active language from `localStorage`/
 * `navigator.language`, both browser-only). The raw first HTTP response is
 * therefore always in the default language (`en`); Arabic is applied by
 * `TranslateService.use('ar')` after client-side hydration, and this
 * registry's `onLangChange` re-application (see `SEOService`) is what keeps
 * title/description/OG/Twitter tags correct once that happens. Adding
 * locale-prefixed SSR routing is a routing-architecture change outside this
 * issue's scope.
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
 * Keys are validated (Stage 3.2 QA) to exist, non-empty, in both
 * `src/assets/i18n/en.json` and `src/assets/i18n/ar.json`.
 *
 * Limited to routes whose component does NOT already set its own SEO tags
 * directly (see the fallback-strategy note above) — every route listed
 * here previously had only the generic site-wide title/description.
 */
export const ROUTE_METADATA: Readonly<Record<string, RouteMetadataEntry>> = {
  '/': {
    titleKey: 'home.hero.title',
    descriptionKey: 'home.hero.description'
  },
  '/services': {
    titleKey: 'services.page.title',
    descriptionKey: 'services.page.description'
  },
  '/industries': {
    titleKey: 'industries.page.title',
    descriptionKey: 'industries.page.description'
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
  '/privacy': {
    titleKey: 'legal.privacy.title',
    descriptionKey: 'legal.privacy.sections.introduction.content'
  },
  '/terms': {
    titleKey: 'legal.terms.title',
    descriptionKey: 'legal.terms.sections.descriptionOfServices.content'
  },
  '/cookies': {
    titleKey: 'legal.cookies.title',
    descriptionKey: 'legal.cookies.sections.whatAreCookies.content'
  }
};

/**
 * Routes known to lack a safe, non-generic, already-approved translation
 * key to source a route-specific description from. Empty today — every
 * route in scope above has real source copy. Keep this list (and check it)
 * so a future route added without approved copy is flagged here instead of
 * silently inventing text or silently falling back to the generic
 * site-wide description.
 *
 * Separately: the 15 `services/*` routes excluded above (see fallback
 * strategy, category 2) already have their own hardcoded English-only SEO
 * tags. Making those bilingual/registry-driven is a real, tracked gap —
 * it requires editing each component's own `ngOnInit`, not this registry —
 * and is out of scope for this change; it is not listed here because it is
 * not a "missing source copy" problem, it is a "component owns its own SEO
 * code in English only" problem.
 */
export const PENDING_ROUTE_METADATA_GAPS: readonly string[] = [];
