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

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent implements OnInit, AfterViewInit {
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  private readonly seoService = inject(SEOService);
  private readonly analytics = inject(AnalyticsService);
  private readonly platformId = inject(PLATFORM_ID);

  lastUpdated = '2025-12-15';
  activeSection = signal<string>('acceptance');
  showBackToTop = signal(false);

  tableOfContents: TableOfContentsItem[] = [
    { id: 'acceptance', title: 'legal.terms.toc.acceptance', level: 1 },
    { id: 'description-of-services', title: 'legal.terms.toc.descriptionOfServices', level: 1 },
    { id: 'user-obligations', title: 'legal.terms.toc.userObligations', level: 1 },
    { id: 'acceptable-use', title: 'legal.terms.toc.acceptableUse', level: 2 },
    { id: 'prohibited-activities', title: 'legal.terms.toc.prohibitedActivities', level: 2 },
    { id: 'intellectual-property', title: 'legal.terms.toc.intellectualProperty', level: 1 },
    { id: 'service-fees', title: 'legal.terms.toc.serviceFees', level: 1 },
    { id: 'payment-terms', title: 'legal.terms.toc.paymentTerms', level: 2 },
    { id: 'refund-policy', title: 'legal.terms.toc.refundPolicy', level: 2 },
    { id: 'confidentiality', title: 'legal.terms.toc.confidentiality', level: 1 },
    { id: 'warranties', title: 'legal.terms.toc.warranties', level: 1 },
    { id: 'limitation-of-liability', title: 'legal.terms.toc.limitationOfLiability', level: 1 },
    { id: 'indemnification', title: 'legal.terms.toc.indemnification', level: 1 },
    { id: 'term-and-termination', title: 'legal.terms.toc.termAndTermination', level: 1 },
    { id: 'dispute-resolution', title: 'legal.terms.toc.disputeResolution', level: 1 },
    { id: 'governing-law', title: 'legal.terms.toc.governingLaw', level: 1 },
    { id: 'changes-to-terms', title: 'legal.terms.toc.changesToTerms', level: 1 },
    { id: 'contact', title: 'legal.terms.toc.contact', level: 1 }
  ];

  ngOnInit(): void {
    // Track page view
    this.analytics.trackPageView('/terms');
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
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      this.activeSection.set(sectionId);
      this.analytics.trackEvent('toc_click', { section: sectionId, page: 'terms' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.analytics.trackEvent('back_to_top', { page: 'terms' });
  }

  printPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
      this.analytics.trackEvent('print_page', { page: 'terms' });
    }
  }
}
