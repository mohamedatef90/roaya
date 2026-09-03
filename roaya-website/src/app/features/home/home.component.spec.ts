import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import enTranslations from '../../../assets/i18n/en.json';
import arTranslations from '../../../assets/i18n/ar.json';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        // Simulate server platform for SSR tests
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, false);
    translate.setTranslation('ar', arTranslations, false);
    translate.use('en');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    // Single detectChanges for SSR - synchronous rendering
    fixture.detectChanges();
  });

  // 2026-09-02 AI-readiness reconciliation: each stat renders exactly ONE text
  // value in SSR HTML, equal to the final figure. The former sr-only/aria-hidden
  // span pair leaked "150+ 0+" to crawlers, which ignore CSS and aria.
  describe('SSR single-source stat counters', () => {
    it('renders exactly one value span per stat, carrying the final value', () => {
      const stats = component.stats();
      const valueSpans = fixture.nativeElement.querySelectorAll('[data-stat-value]');

      expect(valueSpans.length).toBe(stats.length);

      for (let i = 0; i < stats.length; i++) {
        const expectedValue = `${stats[i].value}${stats[i].suffix}`;
        const actualValue = valueSpans[i].textContent?.trim();
        expect(actualValue).toBe(expectedValue);
        expect(actualValue).not.toMatch(/^0(\+|%|\/7)?$/);
      }
    });

    it('does not render the legacy duplicate semantic/animated span pair', () => {
      expect(fixture.nativeElement.querySelectorAll('[data-stat-semantic]').length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('[data-stat-animated]').length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('[role="text"] .sr-only').length).toBe(0);
    });

    it('each stat container text is the final value alone (no "150+ 0+" duplication)', () => {
      const stats = component.stats();
      const containers = fixture.nativeElement.querySelectorAll('.stats-section [role="text"]');

      expect(containers.length).toBe(stats.length);

      for (let i = 0; i < stats.length; i++) {
        const expectedValue = `${stats[i].value}${stats[i].suffix}`;
        const text = (containers[i].textContent ?? '').replace(/\s+/g, ' ').trim();
        expect(text).toBe(expectedValue);
      }
    });

    it('stat containers expose the stable final value via aria-label', () => {
      const stats = component.stats();
      const containers = fixture.nativeElement.querySelectorAll('.stats-section [role="text"]');

      for (let i = 0; i < stats.length; i++) {
        expect(containers[i].getAttribute('aria-label')).toBe(`${stats[i].value}${stats[i].suffix}`);
      }
    });

    it('stats section contains the approved final values for SSR', () => {
      const statsSection = fixture.nativeElement.querySelector('.stats-section');
      expect(statsSection).toBeTruthy();

      // 14+ follows from the approved 2012 founding year (docs/decisions/2026-09-01-claim-approvals.md).
      const expectedValues = ['150+', '99.9%', '24/7', '14+'];
      const actualValues = Array.from(
        statsSection.querySelectorAll('[data-stat-value]') as NodeListOf<HTMLElement>
      ).map((el) => el.textContent?.trim());

      for (const expected of expectedValues) {
        expect(actualValues).toContain(expected);
      }
      expect(actualValues).not.toContain('10+');
    });

    it('renders no zeroed counter text anywhere in the stats section', () => {
      const statsSection = fixture.nativeElement.querySelector('.stats-section');
      const text = (statsSection.textContent ?? '').replace(/\s+/g, ' ');
      expect(text).not.toMatch(/\b0\+/);
      expect(text).not.toMatch(/\b0%/);
      expect(text).not.toMatch(/\b0\/7/);
    });
  });

  describe('Uptime consistency', () => {
    it('does not render the unapproved 99.95% figure anywhere on the homepage', () => {
      const text = fixture.nativeElement.textContent ?? '';
      expect(text).not.toContain('99.95');
    });
  });
});
