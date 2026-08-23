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

    it('emits no Service or BreadcrumbList nodes', () => {
      expect(nodesOfType('Service').length).toBe(0);
      expect(nodesOfType('BreadcrumbList').length).toBe(0);
    });
  });

  describe('/about route', () => {
    it('emits a Home > About BreadcrumbList with canonical URLs', async () => {
      await router.navigateByUrl('/about');

      const breadcrumb = nodesOfType('BreadcrumbList')[0];
      expect(breadcrumb.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://roaya.co/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://roaya.co/about' },
      ]);
    });

    it('emits no Organization/WebSite/Service nodes (already emitted only on root)', async () => {
      await router.navigateByUrl('/about');

      expect(nodesOfType('Organization').length).toBe(0);
      expect(nodesOfType('WebSite').length).toBe(0);
      expect(nodesOfType('Service').length).toBe(0);
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

  describe('unrecognized routes', () => {
    it('emits no structured data on a route absent from the taxonomy', async () => {
      await router.navigateByUrl('/pricing');

      expect(scriptEl()).toBeNull();
    });

    it('emits no structured data on an unknown/404 route', async () => {
      await router.navigateByUrl('/this-route-does-not-exist');

      expect(scriptEl()).toBeNull();
    });
  });

  describe('evidence gates', () => {
    it('excludes hard-excluded terms (ISO, pricing, CloudSpace, ratings/reviews) from every route', async () => {
      for (const url of ['/', '/about', '/services/worldposta']) {
        await router.navigateByUrl(url);
        const raw = scriptEl()?.text ?? '';
        for (const term of EXCLUDED_TERMS) {
          expect(raw).not.toContain(term);
        }
      }
    });

    it('never emits invented fields (address, phone, sameAs, logo, ratings, legalName)', async () => {
      for (const url of ['/', '/about', '/services/worldposta']) {
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
