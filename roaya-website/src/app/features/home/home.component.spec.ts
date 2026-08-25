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

  describe('SSR semantic stat counters', () => {
    it('renders stat values with sr-only semantic spans containing final values', () => {
      const statCards = fixture.nativeElement.querySelectorAll('[data-stat-semantic]');
      expect(statCards.length).toBeGreaterThan(0);

      for (const span of statCards) {
        const text = span.textContent?.trim();
        // Must NOT be empty or zero
        expect(text).toBeTruthy();
        expect(text).not.toBe('0');
        expect(text).not.toBe('0+');
        expect(text).not.toBe('0%');
        expect(text).not.toBe('0/7');
      }
    });

    it('renders animated stat spans as aria-hidden to avoid duplicate reading', () => {
      const animatedSpans = fixture.nativeElement.querySelectorAll('[data-stat-animated]');
      expect(animatedSpans.length).toBeGreaterThan(0);

      for (const span of animatedSpans) {
        expect(span.getAttribute('aria-hidden')).toBe('true');
      }
    });

    it('semantic stat values match component data (not animation current)', () => {
      const stats = component.stats();
      const semanticSpans = fixture.nativeElement.querySelectorAll('[data-stat-semantic]');

      expect(semanticSpans.length).toBe(stats.length);

      for (let i = 0; i < stats.length; i++) {
        const expectedValue = `${stats[i].value}${stats[i].suffix}`;
        const actualValue = semanticSpans[i].textContent?.trim();
        expect(actualValue).toBe(expectedValue);
      }
    });

    it('stats section contains the expected final values for SSR', () => {
      const statsSection = fixture.nativeElement.querySelector('.stats-section');
      expect(statsSection).toBeTruthy();

      // Check for specific expected stat values in semantic spans
      const expectedValues = ['150+', '99.9%', '24/7', '10+'];
      const semanticSpans = statsSection.querySelectorAll('[data-stat-semantic]');

      const actualValues = Array.from(semanticSpans as NodeListOf<HTMLElement>).map((el) =>
        el.textContent?.trim()
      );

      for (const expected of expectedValues) {
        expect(actualValues).toContain(expected);
      }
    });

    it('sr-only class is applied to semantic stat spans', () => {
      const semanticSpans = fixture.nativeElement.querySelectorAll('[data-stat-semantic]');
      expect(semanticSpans.length).toBeGreaterThan(0);

      for (const span of semanticSpans) {
        expect(span.classList.contains('sr-only')).toBe(true);
      }
    });

    it('stat container has role="text" for proper semantics', () => {
      const statContainers = fixture.nativeElement.querySelectorAll('[role="text"]');
      expect(statContainers.length).toBeGreaterThan(0);
    });
  });
});
