import { TestBed } from '@angular/core/testing';
import { RESPONSE_INIT } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CaseStudyDetailComponent } from './case-study-detail.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SEOService } from '../../../../core/services/seo.service';

function setup(slug: string, responseInit: ResponseInit | null) {
  TestBed.configureTestingModule({
    imports: [CaseStudyDetailComponent, TranslateModule.forRoot()],
    providers: [
      provideRouter([]),
      { provide: RESPONSE_INIT, useValue: responseInit },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ slug }) } },
      },
      {
        provide: AnalyticsService,
        useValue: {
          trackPageView: () => undefined,
          trackContentEngagement: () => undefined,
        },
      },
      { provide: SEOService, useValue: { updateSEO: () => undefined } },
    ],
  });
  const fixture = TestBed.createComponent(CaseStudyDetailComponent);
  fixture.detectChanges();
  return fixture;
}

describe('CaseStudyDetailComponent', () => {
  it('resolves every registered slug without hitting the not-found state', () => {
    const responseInit: ResponseInit = {};
    const fixture = setup('bank-cloud-migration', responseInit);
    expect(fixture.componentInstance.notFound()).toBe(false);
    expect(fixture.componentInstance.caseStudyData()?.slug).toBe('bank-cloud-migration');
    expect(responseInit.status).toBeUndefined();
  });

  it('shows not-found and sets HTTP 404 for unknown slugs during SSR', () => {
    const responseInit: ResponseInit = {};
    const fixture = setup('national-bank-cloud-migration', responseInit);
    expect(fixture.componentInstance.notFound()).toBe(true);
    expect(responseInit.status).toBe(404);
  });

  it('still renders not-found in the browser where no response exists', () => {
    const fixture = setup('does-not-exist', null);
    expect(fixture.componentInstance.notFound()).toBe(true);
  });
});
