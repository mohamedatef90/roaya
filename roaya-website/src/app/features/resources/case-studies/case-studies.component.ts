import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ContentService, CaseStudy } from '../../../core/services/content.service';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
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
    this.contentService.getCaseStudies(1, 50).subscribe({
      next: (res) => {
        this.allCaseStudies.set(res.studies);
        this.filteredCaseStudies.set(res.studies);
      },
      error: () => {
        this.allCaseStudies.set([]);
        this.filteredCaseStudies.set([]);
      },
    });
  }

  filterByIndustry(industry: string): void {
    this.selectedIndustry.set(industry);
    this.applyFilters();
  }

  filterByService(service: string): void {
    this.selectedService.set(service);
    this.applyFilters();
  }

  private applyFilters(): void {
    const industry = this.selectedIndustry();
    const service = this.selectedService();

    let filtered = this.allCaseStudies();

    if (industry !== 'all') {
      filtered = filtered.filter(cs => cs.industry === industry);
    }

    if (service !== 'all') {
      filtered = filtered.filter(cs => cs.services.includes(service));
    }

    this.filteredCaseStudies.set(filtered);

    this.analytics.trackEvent('case_study_filter', { industry, service });
  }

  trackCaseStudyClick(caseStudyId: string): void {
    this.analytics.trackContentEngagement('case_study', caseStudyId, 'view');
  }
}
