import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ContentService, CaseStudy } from '../../../core/services/content.service';
import { LocalizeLinkPipe } from '../../../core/i18n/localize-link.pipe';
import { CASE_STUDIES } from './case-studies.data';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalizeLinkPipe],
  templateUrl: './case-studies.component.html',
  styleUrl: './case-studies.component.scss'
})
export class CaseStudiesComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly contentService = inject(ContentService);

  selectedIndustry = signal<string>('all');
  selectedService = signal<string>('all');

  industries = [
    { id: 'all', label: 'caseStudies.filters.all' },
    { id: 'finance', label: 'caseStudies.filters.finance' },
    { id: 'healthcare', label: 'caseStudies.filters.healthcare' },
    { id: 'government', label: 'caseStudies.filters.government' },
    { id: 'manufacturing', label: 'caseStudies.filters.manufacturing' },
    { id: 'retail', label: 'caseStudies.filters.retail' },
    { id: 'education', label: 'caseStudies.filters.education' }
  ];

  services = [
    { id: 'all', label: 'caseStudies.filters.all' },
    { id: 'cloud', label: 'caseStudies.filters.cloud' },
    { id: 'email', label: 'caseStudies.filters.email' },
    { id: 'security', label: 'caseStudies.filters.security' },
    { id: 'migration', label: 'caseStudies.filters.migration' },
    { id: 'sap', label: 'caseStudies.filters.sap' },
    { id: 'automation', label: 'caseStudies.filters.automation' }
  ];

  // TODO: Load from API/CMS
  allCaseStudies = signal<CaseStudy[]>([]);
  
  filteredCaseStudies = signal<CaseStudy[]>([]);

  // Stats
  totalClients = signal(150);
  averageCostReduction = signal(42);
  averageUptime = signal(99.94);

  ngOnInit(): void {
    this.loadCaseStudies();
    this.analytics.trackPageView('/resources/case-studies');
  }

  private loadCaseStudies(): void {
    // Registered studies render first (also during SSR/prerender, where the
    // content API is unavailable) so every detail page always has a crawlable
    // listing anchor. API results may enrich them but only registered slugs
    // are shown — anything else would link to a "Case Study Not Found" page.
    const staticStudies = this.buildRegisteredCaseStudies();
    this.setStudies(staticStudies);

    this.contentService.getCaseStudies(1, 50).subscribe({
      next: (res) => {
        const bySlug = new Map(staticStudies.map((s) => [s.slug, s]));
        for (const study of res.studies) {
          if (bySlug.has(study.slug)) {
            bySlug.set(study.slug, study);
          }
        }
        this.setStudies([...bySlug.values()]);
      },
      error: () => {
        // Keep the registered static list
      },
    });
  }

  private buildRegisteredCaseStudies(): CaseStudy[] {
    // title/excerpt hold translation keys; the template pipes them through
    // `translate`, which passes non-key strings (API values) through as-is.
    return CASE_STUDIES.map((record) => ({
      id: record.slug,
      slug: record.slug,
      title: `${record.translationKey}.hero.title`,
      excerpt: `${record.translationKey}.hero.subtitle`,
      industry: record.industry,
      services: [...record.services],
      companySize: '',
      keyResults: [],
      publishedDate: new Date('2025-12-05'),
    }));
  }

  private setStudies(studies: CaseStudy[]): void {
    this.allCaseStudies.set(studies);
    this.filteredCaseStudies.set(this.computeFiltered());
  }

  filterByIndustry(industry: string): void {
    this.selectedIndustry.set(industry);
    this.applyFilters();
  }

  filterByService(service: string): void {
    this.selectedService.set(service);
    this.applyFilters();
  }

  private computeFiltered(): CaseStudy[] {
    const industry = this.selectedIndustry();
    const service = this.selectedService();

    let filtered = this.allCaseStudies();

    if (industry !== 'all') {
      filtered = filtered.filter(cs => cs.industry === industry);
    }

    if (service !== 'all') {
      filtered = filtered.filter(cs => cs.services.includes(service));
    }

    return filtered;
  }

  private applyFilters(): void {
    this.filteredCaseStudies.set(this.computeFiltered());

    this.analytics.trackEvent('case_study_filter', {
      industry: this.selectedIndustry(),
      service: this.selectedService(),
    });
  }

  trackCaseStudyClick(caseStudyId: string): void {
    this.analytics.trackContentEngagement('case_study', caseStudyId, 'view');
  }
}
