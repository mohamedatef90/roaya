import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server routing configuration (SSR/prerender).
 *
 * - Static public routes are prerendered at build time (SSG) so the first
 *   HTTP response carries route-specific title, meta and body content.
 * - Parameterized public routes are server-rendered at request time.
 * - Admin and auth-gated routes are client-rendered only (excluded from the
 *   prerender/SSR indexing surface).
 * - The wildcard route returns a real HTTP 404 from the server layer.
 *
 * Every public route is listed TWICE: unprefixed (English) and under `ar/`
 * (Arabic). Both entries are written out literally instead of being derived
 * from a locale list, because the `route-metadata-coverage` evidence check
 * parses this file as text to reconcile it against sitemap.xml - a generated
 * array would read as zero prerendered routes and quietly disable that gate.
 * The same check asserts locale parity, so a route added to one locale and
 * not the other fails the build rather than shipping half-translated.
 */
export const serverRoutes: ServerRoute[] = [
  // Admin area: client-side rendering only (never prerendered/SSR'd)
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // Parameterized public routes: rendered on the server per request.
  // Listed per locale (see the header note) rather than generated, so the
  // AI-readiness check can still read this file statically.
  { path: 'services/:id', renderMode: RenderMode.Server },
  { path: 'ar/services/:id', renderMode: RenderMode.Server },
  { path: 'industries/:id', renderMode: RenderMode.Server },
  { path: 'ar/industries/:id', renderMode: RenderMode.Server },
  { path: 'resources/blog/:slug', renderMode: RenderMode.Server },
  { path: 'ar/resources/blog/:slug', renderMode: RenderMode.Server },
  { path: 'resources/case-studies/:slug', renderMode: RenderMode.Server },
  { path: 'ar/resources/case-studies/:slug', renderMode: RenderMode.Server },

  // Static public routes: prerendered at build time, once per locale.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'ar', renderMode: RenderMode.Prerender },
  { path: 'services', renderMode: RenderMode.Prerender },
  { path: 'ar/services', renderMode: RenderMode.Prerender },
  { path: 'services/automation', renderMode: RenderMode.Prerender },
  { path: 'ar/services/automation', renderMode: RenderMode.Prerender },
  { path: 'services/backup', renderMode: RenderMode.Prerender },
  { path: 'ar/services/backup', renderMode: RenderMode.Prerender },
  { path: 'services/cloud', renderMode: RenderMode.Prerender },
  { path: 'ar/services/cloud', renderMode: RenderMode.Prerender },
  { path: 'services/consulting', renderMode: RenderMode.Prerender },
  { path: 'ar/services/consulting', renderMode: RenderMode.Prerender },
  { path: 'services/ai', renderMode: RenderMode.Prerender },
  { path: 'ar/services/ai', renderMode: RenderMode.Prerender },
  { path: 'services/devops', renderMode: RenderMode.Prerender },
  { path: 'ar/services/devops', renderMode: RenderMode.Prerender },
  { path: 'services/email', renderMode: RenderMode.Prerender },
  { path: 'ar/services/email', renderMode: RenderMode.Prerender },
  { path: 'services/managed', renderMode: RenderMode.Prerender },
  { path: 'ar/services/managed', renderMode: RenderMode.Prerender },
  { path: 'services/sap', renderMode: RenderMode.Prerender },
  { path: 'ar/services/sap', renderMode: RenderMode.Prerender },
  { path: 'services/security', renderMode: RenderMode.Prerender },
  { path: 'ar/services/security', renderMode: RenderMode.Prerender },
  { path: 'services/security/penetration-testing', renderMode: RenderMode.Prerender },
  { path: 'ar/services/security/penetration-testing', renderMode: RenderMode.Prerender },
  { path: 'services/security/soc-solutions', renderMode: RenderMode.Prerender },
  { path: 'ar/services/security/soc-solutions', renderMode: RenderMode.Prerender },
  { path: 'services/security/incident-response', renderMode: RenderMode.Prerender },
  { path: 'ar/services/security/incident-response', renderMode: RenderMode.Prerender },
  { path: 'services/security/pentest-v2', renderMode: RenderMode.Prerender },
  { path: 'ar/services/security/pentest-v2', renderMode: RenderMode.Prerender },
  { path: 'services/worldposta', renderMode: RenderMode.Prerender },
  { path: 'ar/services/worldposta', renderMode: RenderMode.Prerender },
  { path: 'industries', renderMode: RenderMode.Prerender },
  { path: 'ar/industries', renderMode: RenderMode.Prerender },
  { path: 'pricing', renderMode: RenderMode.Prerender },
  { path: 'ar/pricing', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'ar/about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'ar/contact', renderMode: RenderMode.Prerender },
  { path: 'roi-calculator', renderMode: RenderMode.Prerender },
  { path: 'ar/roi-calculator', renderMode: RenderMode.Prerender },
  { path: 'resources', renderMode: RenderMode.Prerender },
  { path: 'ar/resources', renderMode: RenderMode.Prerender },
  { path: 'resources/blog', renderMode: RenderMode.Prerender },
  { path: 'ar/resources/blog', renderMode: RenderMode.Prerender },
  { path: 'resources/case-studies', renderMode: RenderMode.Prerender },
  { path: 'ar/resources/case-studies', renderMode: RenderMode.Prerender },
  { path: 'resources/whitepapers', renderMode: RenderMode.Prerender },
  { path: 'ar/resources/whitepapers', renderMode: RenderMode.Prerender },
  { path: 'resources/documentation', renderMode: RenderMode.Prerender },
  { path: 'ar/resources/documentation', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'ar/privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'ar/terms', renderMode: RenderMode.Prerender },
  { path: 'cookies', renderMode: RenderMode.Prerender },
  { path: 'ar/cookies', renderMode: RenderMode.Prerender },

  // Unknown URLs: server-rendered 404 page with a real 404 status code
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
