import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SEOService } from './seo.service';
import { ROUTE_METADATA } from '../seo/route-metadata';
import enTranslations from '../../../assets/i18n/en.json';
import arTranslations from '../../../assets/i18n/ar.json';

describe('SEOService', () => {
  let service: SEOService;
  let router: Router;
  let translate: TranslateService;

  const canonicalLinks = () => document.querySelectorAll('link[rel="canonical"]');
  const canonicalHref = () =>
    document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const metaContent = (selector: string) =>
    document.querySelector(selector)?.getAttribute('content');

  beforeEach(() => {
    document.querySelectorAll('link[rel="canonical"]').forEach(link => link.remove());
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, false);
    translate.setTranslation('ar', arTranslations, false);
    translate.use('en');
    service = TestBed.inject(SEOService);
    router = TestBed.inject(Router);
  });

  describe('buildCanonicalUrl', () => {
    it('builds from the fixed origin plus the route path', () => {
      expect(service.buildCanonicalUrl('/about')).toBe('https://roaya.co/about');
    });

    it('excludes query parameters', () => {
      expect(service.buildCanonicalUrl('/pricing?utm_source=google&utm_medium=cpc')).toBe(
        'https://roaya.co/pricing'
      );
    });

    it('excludes hash fragments', () => {
      expect(service.buildCanonicalUrl('/about#team')).toBe('https://roaya.co/about');
    });

    it('excludes query parameters and hash together', () => {
      expect(service.buildCanonicalUrl('/services/cloud?ref=nav#pricing')).toBe(
        'https://roaya.co/services/cloud'
      );
    });

    it('canonicalizes the root route with a trailing slash (matching sitemap.xml)', () => {
      expect(service.buildCanonicalUrl('/')).toBe('https://roaya.co/');
      expect(service.buildCanonicalUrl('/?utm_source=x')).toBe('https://roaya.co/');
    });

    it('strips trailing slashes on non-root routes', () => {
      expect(service.buildCanonicalUrl('/services/')).toBe('https://roaya.co/services');
    });

    it('normalizes a missing leading slash', () => {
      expect(service.buildCanonicalUrl('pricing')).toBe('https://roaya.co/pricing');
    });

    it('never derives the host from the browser location (www/non-www identical)', () => {
      // The origin is a fixed constant, so the canonical is byte-identical
      // whether the visitor entered via www.roaya.co, roaya.co, or any alias.
      const url = service.buildCanonicalUrl('/about?from=www');
      expect(url).toBe('https://roaya.co/about');
      expect(url).not.toContain('www.');
      expect(url.startsWith('https://roaya.co')).toBe(true);
      expect(url).not.toContain(window.location.host);
    });
  });

  describe('canonical <link> element', () => {
    it('is emitted immediately on service construction (SSR first response)', () => {
      expect(canonicalHref()).toBe('https://roaya.co/');
    });

    it('is self-referencing and query-free after navigation with query params', async () => {
      await router.navigateByUrl('/pricing?utm_source=google&gclid=abc123');
      expect(canonicalHref()).toBe('https://roaya.co/pricing');
    });

    it('updates on subsequent navigations and keeps a single element', async () => {
      await router.navigateByUrl('/about');
      expect(canonicalHref()).toBe('https://roaya.co/about');

      await router.navigateByUrl('/contact?ref=footer');
      expect(canonicalHref()).toBe('https://roaya.co/contact');
      expect(canonicalLinks().length).toBe(1);
    });
  });

  describe('route metadata registry (route matrix)', () => {
    const routePaths = Object.keys(ROUTE_METADATA);

    it('registers at least one route, so this matrix is not vacuous', () => {
      expect(routePaths.length).toBeGreaterThan(0);
    });

    for (const path of routePaths) {
      it(`sets non-empty, non-generic title/description/OG/Twitter/canonical tags for ${path}`, async () => {
        await router.navigateByUrl(path);

        const title = document.title;
        const description = metaContent('meta[name="description"]');
        const ogTitle = metaContent('meta[property="og:title"]');
        const ogDescription = metaContent('meta[property="og:description"]');
        const ogUrl = metaContent('meta[property="og:url"]');
        const ogType = metaContent('meta[property="og:type"]');
        const twitterTitle = metaContent('meta[name="twitter:title"]');
        const twitterDescription = metaContent('meta[name="twitter:description"]');
        const twitterCard = metaContent('meta[name="twitter:card"]');

        // Non-empty.
        for (const value of [
          title,
          description,
          ogTitle,
          ogDescription,
          ogUrl,
          twitterTitle,
          twitterDescription,
        ]) {
          expect(value).toBeTruthy();
        }

        // Route-specific, not the generic site-wide fallback.
        expect(title).not.toBe('Roaya IT - Enterprise IT Solutions & Services');
        expect(description).not.toBe(
          'Roaya IT provides enterprise-grade IT solutions including cloud infrastructure, cybersecurity, email services, and managed IT support in Egypt. Transparent pricing and proven results.'
        );

        // Canonical URL matches the route and is unchanged by this feature.
        expect(canonicalHref()).toBe(service.buildCanonicalUrl(path));
        expect(ogUrl).toBe(service.buildCanonicalUrl(path));

        // OG type is a valid, singular value.
        expect(['website', 'article']).toContain(ogType);

        // Twitter card is present and singular.
        expect(twitterCard).toBe('summary_large_image');

        // Internal consistency: title/OG/Twitter must all agree with each
        // other (this is exactly the class of bug found in QA_BLOCKED —
        // a route whose component set title/og/description directly while
        // SEOService's registry-driven Twitter tags disagreed with them).
        expect(ogTitle).toBe(title);
        expect(twitterTitle).toBe(title);
        expect(ogDescription).toBe(description);
        expect(twitterDescription).toBe(description);

        // Exactly one of each tag (no duplicate/conflicting tags).
        expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
        expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
        expect(document.querySelectorAll('meta[property="og:title"]').length).toBe(1);
        expect(document.querySelectorAll('meta[property="og:description"]').length).toBe(1);
        expect(document.querySelectorAll('meta[property="og:url"]').length).toBe(1);
        expect(document.querySelectorAll('meta[property="og:type"]').length).toBe(1);
        expect(document.querySelectorAll('meta[name="twitter:title"]').length).toBe(1);
        expect(document.querySelectorAll('meta[name="twitter:description"]').length).toBe(1);
        expect(document.querySelectorAll('meta[name="twitter:card"]').length).toBe(1);
      });
    }

    it("applies the target route's metadata once its (including the initial) navigation completes", async () => {
      // No eager apply from `this.router.url` at construction time (see
      // the comment on `setupRouteMetadata`): before any navigation
      // resolves, the registry has not touched anything, so only the
      // generic site-wide default (set by `initializeDefaultTags`) shows.
      expect(metaContent('meta[name="description"]')).toBe(
        "Roaya IT provides enterprise-grade IT solutions including cloud infrastructure, cybersecurity, email services, and managed IT support in Egypt. Transparent pricing and proven results."
      );

      // The same `NavigationEnd` this test drives explicitly is what SSR's
      // own initial navigation fires before serializing the response, so
      // this also stands in for "the raw first HTTP response is correct".
      await router.navigateByUrl('/');
      expect(document.title).toBe(`${enTranslations.home.hero.title} - Roaya IT`);
      expect(metaContent('meta[name="description"]')).toBe(enTranslations.home.hero.description);
    });

    it('does not fabricate route-specific metadata for an unregistered/unknown route (404 surface)', async () => {
      // The registry only ever *applies* metadata for its known paths; it
      // never invents an entry for an unmapped route. `NotFoundComponent`
      // is separately responsible for marking that page `noindex` and the
      // server layer for the real HTTP 404 (app.routes.server.ts) — neither
      // is this registry's concern, so metadata from whatever route was
      // active before is simply left untouched (no crash, no fabrication).
      await router.navigateByUrl('/about');
      const titleBeforeUnknownRoute = document.title;
      const descriptionBeforeUnknownRoute = metaContent('meta[name="description"]');

      await router.navigateByUrl('/this-route-does-not-exist');

      expect(document.title).toBe(titleBeforeUnknownRoute);
      expect(metaContent('meta[name="description"]')).toBe(descriptionBeforeUnknownRoute);
    });

    it('truncates long-form approved copy to a faithful excerpt instead of the full text', async () => {
      await router.navigateByUrl('/privacy');
      const description = metaContent('meta[name="description"]');
      const fullSource = enTranslations.legal.privacy.sections.introduction.content;

      expect(description!.length).toBeLessThanOrEqual(161); // 160 chars + ellipsis
      expect(fullSource.startsWith(description!.replace('…', '').trim())).toBe(true);
    });
  });

  describe('QA_BLOCKED regression: former direct Meta/Title writers no longer conflict', () => {
    // These 15 routes previously had their own component set title/description/
    // OG tags directly via Angular's Meta/Title services, bypassing SEOService.
    // That code has been removed; SEOService (via this registry) is now the
    // only writer. Assert each is present in the registry and, once navigated
    // to, is fully internally consistent (not just "some tags happen to be
    // non-empty" — the earlier bug left og/title correct while twitter was a
    // stale, unrelated route's content).
    const FORMER_DIRECT_WRITER_ROUTES = [
      '/services/automation',
      '/services/backup',
      '/services/cloud',
      '/services/consulting',
      '/services/ai',
      '/services/devops',
      '/services/email',
      '/services/managed',
      '/services/sap',
      '/services/security',
      '/services/security/penetration-testing',
      '/services/security/soc-solutions',
      '/services/security/incident-response',
      '/services/security/pentest-v2',
      '/services/worldposta',
    ];

    it('registers all 15 previously-conflicting service routes', () => {
      for (const path of FORMER_DIRECT_WRITER_ROUTES) {
        expect(ROUTE_METADATA[path]).toBeTruthy();
      }
      expect(FORMER_DIRECT_WRITER_ROUTES.length).toBe(15);
    });

    it('gives each former direct-writer route fully consistent, distinct tags', async () => {
      const seenTitles = new Set<string>();

      for (const path of FORMER_DIRECT_WRITER_ROUTES) {
        await router.navigateByUrl(path);

        const title = document.title;
        const description = metaContent('meta[name="description"]');
        const ogTitle = metaContent('meta[property="og:title"]');
        const ogUrl = metaContent('meta[property="og:url"]');
        const twitterTitle = metaContent('meta[name="twitter:title"]');
        const twitterDescription = metaContent('meta[name="twitter:description"]');

        // Single writer: OG and Twitter agree with the title/description
        // SEOService set, not a leftover from a direct component call.
        expect(ogTitle).toBe(title);
        expect(twitterTitle).toBe(title);
        expect(twitterDescription).toBe(description);
        expect(ogUrl).toBe(service.buildCanonicalUrl(path));

        // Distinct per route (catches cross-route contamination, the exact
        // shape of the original QA_BLOCKED defect).
        expect(seenTitles.has(title)).toBe(false);
        seenTitles.add(title);
      }

      expect(seenTitles.size).toBe(FORMER_DIRECT_WRITER_ROUTES.length);
    });

    it('sources title/description from the same approved copy the removed component code used to hardcode', async () => {
      await router.navigateByUrl('/services/security/soc-solutions');
      expect(document.title).toBe(
        `${enTranslations.services.security.page.socSolutions.hero.title} - Roaya IT`
      );
      // Source hero copy for this route is > 160 chars, so the description
      // is a faithful truncated excerpt of it (see the /privacy test above
      // for the same truncation behavior), not a byte-for-byte match.
      const socDescription = metaContent('meta[name="description"]')!;
      expect(
        enTranslations.services.security.page.socSolutions.hero.subtitle.startsWith(
          socDescription.replace('…', '').trim()
        )
      ).toBe(true);

      await router.navigateByUrl('/services/worldposta');
      expect(document.title).toBe(`${enTranslations.services.worldposta.heroTitle} - Roaya IT`);
      expect(metaContent('meta[name="description"]')).toBe(
        enTranslations.services.worldposta.heroDescription
      );
    });
  });

  describe('EN/AR parity for route metadata', () => {
    it('reflects Arabic copy after a language switch without navigation', async () => {
      await router.navigateByUrl('/services');
      expect(document.title).toBe(`${enTranslations.services.page.title} - Roaya IT`);

      await firstValueFrom(translate.use('ar'));

      expect(document.title).toBe(`${arTranslations.services.page.title} - Roaya IT`);
      expect(metaContent('meta[name="description"]')).toContain(
        arTranslations.services.page.description.slice(0, 20)
      );
      // No English leaking into the Arabic-rendered tags for this route.
      expect(document.title).not.toContain(enTranslations.services.page.title);
    });

    it('reflects English copy again after switching back, for every registered route', async () => {
      for (const path of Object.keys(ROUTE_METADATA)) {
        await router.navigateByUrl(path);
        await firstValueFrom(translate.use('ar'));
        const arabicTitle = document.title;

        await firstValueFrom(translate.use('en'));
        const englishTitle = document.title;

        expect(arabicTitle).not.toBe(englishTitle);
        expect(englishTitle).toContain(' - Roaya IT');
      }
    });
  });
});
