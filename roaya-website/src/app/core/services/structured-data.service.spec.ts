import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { StructuredDataService } from './structured-data.service';

describe('StructuredDataService', () => {
  let service: StructuredDataService;
  let router: Router;

  const scriptEl = () =>
    document.getElementById('roaya-structured-data') as HTMLScriptElement | null;

  const graph = (): any[] => {
    const el = scriptEl();
    if (!el) {
      return [];
    }
    return JSON.parse(el.text)['@graph'];
  };

  const nodesOfType = (type: string) => graph().filter(node => node['@type'] === type);

  const EXCLUDED_TERMS = [
    'ISO',
    'iso27001',
    '$1.50',
    'CloudSpace',
    'price',
    'Offer',
    'aggregateRating',
    'review',
  ];

  // Every shape the graph can take: root, leaf, nested leaf, service page,
  // and the label-less case-study leaf.
  const SWEPT_ROUTES = [
    '/',
    '/about',
    '/pricing',
    '/services/worldposta',
    '/services/security/penetration-testing',
    '/resources/case-studies/bank-cloud-migration',
    '/ar',
    '/ar/about',
    '/ar/services/worldposta',
  ];

  beforeEach(() => {
    document.getElementById('roaya-structured-data')?.remove();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    service = TestBed.inject(StructuredDataService);
    router = TestBed.inject(Router);
  });

  it('is emitted immediately on service construction (SSR first response)', () => {
    expect(scriptEl()).not.toBeNull();
    expect(scriptEl()?.type).toBe('application/ld+json');
  });

  it('every emitted script is valid, parseable JSON', () => {
    expect(() => JSON.parse(scriptEl()!.text)).not.toThrow();
    expect(JSON.parse(scriptEl()!.text)['@context']).toBe('https://schema.org');
  });

  describe('home route (/)', () => {
    it('emits Organization and WebSite with only approved fields', () => {
      const org = nodesOfType('Organization')[0];
      const site = nodesOfType('WebSite')[0];

      expect(org).toEqual({
        '@type': 'Organization',
        '@id': 'https://roaya.co/#organization',
        name: 'Roaya IT',
        url: 'https://roaya.co/',
        foundingDate: '2018',
      });
      expect(site).toEqual({
        '@type': 'WebSite',
        '@id': 'https://roaya.co/#website',
        name: 'Roaya IT',
        url: 'https://roaya.co/',
        inLanguage: 'en',
      });
    });

    it('emits no Service node, and no single-item BreadcrumbList', () => {
      expect(nodesOfType('Service').length).toBe(0);
      // Home is its own only ancestor; a one-item trail is dropped rather
      // than emitted as a degenerate BreadcrumbList.
      expect(nodesOfType('BreadcrumbList').length).toBe(0);
    });

    it('emits a WebPage node bound to the site and organization', () => {
      const page = nodesOfType('WebPage')[0];
      expect(page['@id']).toBe('https://roaya.co/#webpage');
      expect(page.url).toBe('https://roaya.co/');
      expect(page.isPartOf).toEqual({ '@id': 'https://roaya.co/#website' });
      expect(page.about).toEqual({ '@id': 'https://roaya.co/#organization' });
    });

    it('carries no description on WebPage (prose stays out of structured data)', () => {
      expect(nodesOfType('WebPage')[0].description).toBeUndefined();
    });
  });

  describe('/about route', () => {
    it('emits a Home > About BreadcrumbList with canonical URLs', async () => {
      await router.navigateByUrl('/about');

      const breadcrumb = nodesOfType('BreadcrumbList')[0];
      expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2]);
      expect(breadcrumb.itemListElement.map((item: any) => item.item)).toEqual([
        'https://roaya.co/',
        'https://roaya.co/about',
      ]);
    });

    it('repeats site-wide Organization/WebSite so @id references resolve on the page', async () => {
      await router.navigateByUrl('/about');

      expect(nodesOfType('Organization').length).toBe(1);
      expect(nodesOfType('WebSite').length).toBe(1);
      expect(nodesOfType('Service').length).toBe(0);
    });

    it('links its WebPage to its own BreadcrumbList', async () => {
      await router.navigateByUrl('/about');

      expect(nodesOfType('WebPage')[0].breadcrumb).toEqual({
        '@id': 'https://roaya.co/about#breadcrumb',
      });
    });
  });

  describe('/services/worldposta route (CloudEdge/Posta)', () => {
    it('emits Service nodes for CloudEdge and Posta with approved descriptions', async () => {
      await router.navigateByUrl('/services/worldposta');

      const services = nodesOfType('Service');
      expect(services.length).toBe(2);

      const cloudEdge = services.find(node => node.name === 'CloudEdge');
      expect(cloudEdge).toBeTruthy();
      expect(cloudEdge.description).toContain('Welcome to CloudEdge by WorldPosta');
      expect(cloudEdge.url).toBe('https://roaya.co/services/worldposta');
      expect(cloudEdge.provider).toEqual({ '@id': 'https://roaya.co/#organization' });

      const posta = services.find(node => node.name === 'Posta');
      expect(posta).toBeTruthy();
      expect(posta.description).toContain('Enterprise-grade email hosting');
    });

    it('does not emit CloudSpace as a Service', async () => {
      await router.navigateByUrl('/services/worldposta');

      const names = nodesOfType('Service').map(node => node.name);
      expect(names).not.toContain('CloudSpace');
    });

    it('emits a Home > Solutions > WorldPosta BreadcrumbList', async () => {
      await router.navigateByUrl('/services/worldposta');

      const breadcrumb = nodesOfType('BreadcrumbList')[0];
      expect(breadcrumb.itemListElement.map((item: any) => item.item)).toEqual([
        'https://roaya.co/',
        'https://roaya.co/services',
        'https://roaya.co/services/worldposta',
      ]);
    });

    it('gives every node a deterministic @id derived from the canonical URL', async () => {
      await router.navigateByUrl('/services/worldposta');

      const ids = graph().map(node => node['@id']);
      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach(id => expect(id.startsWith('https://roaya.co/')).toBe(true));
    });
  });

  describe('coverage beyond the hand-curated entity map', () => {
    it('covers a route that has registry metadata but no entity-map entry', async () => {
      await router.navigateByUrl('/pricing');

      expect(nodesOfType('WebPage')[0].url).toBe('https://roaya.co/pricing');
      expect(nodesOfType('BreadcrumbList')[0].itemListElement.length).toBe(2);
    });

    it('builds a three-level trail for a nested service page', async () => {
      await router.navigateByUrl('/services/security/penetration-testing');

      expect(nodesOfType('BreadcrumbList')[0].itemListElement.map((item: any) => item.item)).toEqual([
        'https://roaya.co/',
        'https://roaya.co/services',
        'https://roaya.co/services/security',
        'https://roaya.co/services/security/penetration-testing',
      ]);
    });

    it('ends a case-study trail at the listing page, with no WebPage node', async () => {
      await router.navigateByUrl('/resources/case-studies/bank-cloud-migration');

      // The leaf has no label that is not also a registry-blocked metric
      // claim, so the trail stops one level up instead of inventing one.
      expect(nodesOfType('BreadcrumbList')[0].itemListElement.map((item: any) => item.item)).toEqual([
        'https://roaya.co/',
        'https://roaya.co/resources',
        'https://roaya.co/resources/case-studies',
      ]);
      expect(nodesOfType('WebPage').length).toBe(0);
    });

    it('emits no structured data at all on an unknown/404 route', async () => {
      await router.navigateByUrl('/this-route-does-not-exist');

      expect(scriptEl()).toBeNull();
    });
  });

  describe('Arabic locale (/ar)', () => {
    it('describes the Arabic page, never linking back into the English tree', async () => {
      await router.navigateByUrl('/ar/about');

      const page = nodesOfType('WebPage')[0];
      expect(page['@id']).toBe('https://roaya.co/ar/about#webpage');
      expect(page.url).toBe('https://roaya.co/ar/about');

      const trail = nodesOfType('BreadcrumbList')[0].itemListElement.map((item: any) => item.item);
      expect(trail).toEqual(['https://roaya.co/ar', 'https://roaya.co/ar/about']);
    });

    it('keeps site-wide Organization/WebSite @ids locale-independent', async () => {
      await router.navigateByUrl('/ar/about');

      expect(nodesOfType('Organization')[0]['@id']).toBe('https://roaya.co/#organization');
      expect(nodesOfType('WebPage')[0].isPartOf).toEqual({ '@id': 'https://roaya.co/#website' });
    });

    it('resolves the same registry entry as the English mirror', async () => {
      await router.navigateByUrl('/ar/pricing');

      expect(nodesOfType('WebPage').length).toBe(1);
      expect(nodesOfType('BreadcrumbList')[0].itemListElement.length).toBe(2);
    });

    it('emits nothing on an unknown Arabic path', async () => {
      await router.navigateByUrl('/ar/no-such-page');

      expect(scriptEl()).toBeNull();
    });
  });

  describe('evidence gates', () => {
    it('excludes hard-excluded terms (ISO, pricing, CloudSpace, ratings/reviews) from every route', async () => {
      for (const url of SWEPT_ROUTES) {
        await router.navigateByUrl(url);
        const raw = scriptEl()?.text ?? '';
        for (const term of EXCLUDED_TERMS) {
          expect(raw).not.toContain(term);
        }
      }
    });

    it('never emits invented fields (address, phone, sameAs, logo, ratings, legalName)', async () => {
      for (const url of SWEPT_ROUTES) {
        await router.navigateByUrl(url);
        const raw = scriptEl()?.text ?? '';
        for (const field of ['address', 'telephone', 'sameAs', 'logo', 'aggregateRating', 'legalName', 'faqPage']) {
          expect(raw).not.toContain(field);
        }
      }
    });
  });

  describe('navigation cleanliness', () => {
    it('keeps a single script element across navigations', async () => {
      await router.navigateByUrl('/about');
      await router.navigateByUrl('/services/worldposta');
      await router.navigateByUrl('/');

      expect(document.querySelectorAll('#roaya-structured-data').length).toBe(1);
    });
  });
});
