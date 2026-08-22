import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SEOService } from './seo.service';

describe('SEOService', () => {
  let service: SEOService;
  let router: Router;

  const canonicalLinks = () => document.querySelectorAll('link[rel="canonical"]');
  const canonicalHref = () =>
    document.querySelector('link[rel="canonical"]')?.getAttribute('href');

  beforeEach(() => {
    document.querySelectorAll('link[rel="canonical"]').forEach(link => link.remove());
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
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
});
