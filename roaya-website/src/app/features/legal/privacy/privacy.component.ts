import { Component, OnInit, signal, inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SEOService } from '../../../core/services/seo.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent implements OnInit, AfterViewInit {
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  private readonly seoService = inject(SEOService);
  private readonly analytics = inject(AnalyticsService);
  private readonly platformId = inject(PLATFORM_ID);

  lastUpdated = '2025-12-15';
  activeSection = signal<string>('introduction');
  showBackToTop = signal(false);

  tableOfContents: TableOfContentsItem[] = [
    { id: 'introduction', title: 'legal.privacy.toc.introduction', level: 1 },
    { id: 'information-we-collect', title: 'legal.privacy.toc.informationWeCollect', level: 1 },
    { id: 'personal-information', title: 'legal.privacy.toc.personalInformation', level: 2 },
    { id: 'usage-data', title: 'legal.privacy.toc.usageData', level: 2 },
    { id: 'how-we-use-information', title: 'legal.privacy.toc.howWeUseInformation', level: 1 },
    { id: 'data-sharing', title: 'legal.privacy.toc.dataSharing', level: 1 },
    { id: 'data-security', title: 'legal.privacy.toc.dataSecurity', level: 1 },
    { id: 'your-rights', title: 'legal.privacy.toc.yourRights', level: 1 },
    { id: 'cookies', title: 'legal.privacy.toc.cookies', level: 1 },
    { id: 'third-party-services', title: 'legal.privacy.toc.thirdPartyServices', level: 1 },
    { id: 'data-retention', title: 'legal.privacy.toc.dataRetention', level: 1 },
    { id: 'childrens-privacy', title: 'legal.privacy.toc.childrensPrivacy', level: 1 },
    { id: 'international-transfers', title: 'legal.privacy.toc.internationalTransfers', level: 1 },
    { id: 'changes-to-policy', title: 'legal.privacy.toc.changesToPolicy', level: 1 },
    { id: 'contact-us', title: 'legal.privacy.toc.contactUs', level: 1 }
  ];

  ngOnInit(): void {
    // Track page view
    this.analytics.trackPageView('/privacy');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Setup scroll listener for active section highlighting
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    // Show/hide back to top button
    this.showBackToTop.set(window.scrollY > 500);

    // Update active section based on scroll position
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
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      this.activeSection.set(sectionId);
      this.analytics.trackEvent('toc_click', { section: sectionId, page: 'privacy' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.analytics.trackEvent('back_to_top', { page: 'privacy' });
  }

  printPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
      this.analytics.trackEvent('print_page', { page: 'privacy' });
    }
  }
}
