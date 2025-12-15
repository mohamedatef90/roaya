import { Component, OnInit, signal, inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SEOService } from '../../../core/services/seo.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface CookieType {
  name: string;
  purpose: string;
  duration: string;
  type: 'essential' | 'analytics' | 'marketing' | 'preferences';
}

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss'
})
export class CookiesComponent implements OnInit, AfterViewInit {
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  private readonly seoService = inject(SEOService);
  private readonly analytics = inject(AnalyticsService);
  private readonly platformId = inject(PLATFORM_ID);

  lastUpdated = '2025-12-15';
  activeSection = signal<string>('what-are-cookies');
  showBackToTop = signal(false);

  tableOfContents: TableOfContentsItem[] = [
    { id: 'what-are-cookies', title: 'legal.cookies.toc.whatAreCookies', level: 1 },
    { id: 'how-we-use-cookies', title: 'legal.cookies.toc.howWeUseCookies', level: 1 },
    { id: 'types-of-cookies', title: 'legal.cookies.toc.typesOfCookies', level: 1 },
    { id: 'essential-cookies', title: 'legal.cookies.toc.essentialCookies', level: 2 },
    { id: 'analytics-cookies', title: 'legal.cookies.toc.analyticsCookies', level: 2 },
    { id: 'marketing-cookies', title: 'legal.cookies.toc.marketingCookies', level: 2 },
    { id: 'preference-cookies', title: 'legal.cookies.toc.preferenceCookies', level: 2 },
    { id: 'cookie-list', title: 'legal.cookies.toc.cookieList', level: 1 },
    { id: 'managing-cookies', title: 'legal.cookies.toc.managingCookies', level: 1 },
    { id: 'third-party-cookies', title: 'legal.cookies.toc.thirdPartyCookies', level: 1 },
    { id: 'updates', title: 'legal.cookies.toc.updates', level: 1 },
    { id: 'contact', title: 'legal.cookies.toc.contact', level: 1 }
  ];

  cookiesList: CookieType[] = [
    {
      name: 'theme_preference',
      purpose: 'legal.cookies.list.theme.purpose',
      duration: '1 year',
      type: 'preferences'
    },
    {
      name: 'language_preference',
      purpose: 'legal.cookies.list.language.purpose',
      duration: '1 year',
      type: 'preferences'
    },
    {
      name: '_ga',
      purpose: 'legal.cookies.list.ga.purpose',
      duration: '2 years',
      type: 'analytics'
    },
    {
      name: '_ga_*',
      purpose: 'legal.cookies.list.gaProperty.purpose',
      duration: '2 years',
      type: 'analytics'
    },
    {
      name: 'session_id',
      purpose: 'legal.cookies.list.session.purpose',
      duration: 'Session',
      type: 'essential'
    }
  ];

  ngOnInit(): void {
    this.analytics.trackPageView('/cookies');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    this.showBackToTop.set(window.scrollY > 500);

    const sections = this.tableOfContents.map(item => item.id);
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          this.activeSection.set(sectionId);
          break;
        }
      }
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      this.activeSection.set(sectionId);
      this.analytics.trackEvent('toc_click', { section: sectionId, page: 'cookies' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.analytics.trackEvent('back_to_top', { page: 'cookies' });
  }

  printPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
      this.analytics.trackEvent('print_page', { page: 'cookies' });
    }
  }

  getCookieTypeColor(type: CookieType['type']): string {
    const colors = {
      essential: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      analytics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      marketing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      preferences: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[type];
  }

  getCookieTypeLabel(type: CookieType['type']): string {
    return `legal.cookies.types.${type}.label`;
  }
}
