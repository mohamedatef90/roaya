import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideDownload,
  lucideShare2,
  lucideBuilding2,
  lucideMapPin,
  lucideClock,
  lucideUsers,
  lucideCheckCircle2,
  lucideTarget,
  lucideLightbulb,
  lucideTrophy,
  lucideQuote,
  lucideCalendar,
  lucideChevronRight
} from '@ng-icons/lucide';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SEOService } from '../../../../core/services/seo.service';
import { CaseStudy } from '../case-studies.component';

interface CaseStudyData {
  slug: string;
  translationKey: string;
  industry: string;
  services: string[];
}

@Component({
  selector: 'app-case-study-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideDownload,
      lucideShare2,
      lucideBuilding2,
      lucideMapPin,
      lucideClock,
      lucideUsers,
      lucideCheckCircle2,
      lucideTarget,
      lucideLightbulb,
      lucideTrophy,
      lucideQuote,
      lucideCalendar,
      lucideChevronRight
    })
  ],
  templateUrl: './case-study-detail.component.html',
  styleUrl: './case-study-detail.component.scss'
})
export class CaseStudyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly analytics = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);
  private readonly seo = inject(SEOService);

  // Case study mapping: slug -> translation key and metadata
  private readonly caseStudyMap: Record<string, CaseStudyData> = {
    'bank-cloud-migration': {
      slug: 'bank-cloud-migration',
      translationKey: 'caseStudies.banking',
      industry: 'finance',
      services: ['cloud', 'migration', 'security']
    },
    'healthcare-soc-implementation': {
      slug: 'healthcare-soc-implementation',
      translationKey: 'caseStudies.healthcare',
      industry: 'healthcare',
      services: ['security']
    },
    'government-digital-transformation': {
      slug: 'government-digital-transformation',
      translationKey: 'caseStudies.government',
      industry: 'government',
      services: ['cloud', 'automation', 'security']
    },
    'manufacturing-sap-implementation': {
      slug: 'manufacturing-sap-implementation',
      translationKey: 'caseStudies.manufacturing',
      industry: 'manufacturing',
      services: ['sap', 'cloud']
    },
    'ecommerce-auto-scaling': {
      slug: 'ecommerce-auto-scaling',
      translationKey: 'caseStudies.ecommerce',
      industry: 'retail',
      services: ['cloud', 'security']
    }
  };

  caseStudyData = signal<CaseStudyData | null>(null);
  translationPrefix = signal<string>('');
  relatedCaseStudies = signal<CaseStudyData[]>([]);
  isLoading = signal(true);
  notFound = signal(false);

  // Challenge items as computed array
  challengeItems = computed(() => ['item1', 'item2', 'item3', 'item4']);

  // Solution items as computed array
  solutionItems = computed(() => ['item1', 'item2', 'item3', 'item4']);

  // Result metrics as computed array
  resultMetrics = computed(() => ['metric1', 'metric2', 'metric3', 'metric4']);

  // Timeline phases as computed array
  timelinePhases = computed(() => ['phase1', 'phase2', 'phase3', 'phase4', 'phase5']);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.loadCaseStudy(slug);
    } else {
      this.isLoading.set(false);
      this.notFound.set(true);
    }
  }

  private loadCaseStudy(slug: string): void {
    this.isLoading.set(true);

    const caseStudy = this.caseStudyMap[slug];

    if (caseStudy) {
      this.caseStudyData.set(caseStudy);
      this.translationPrefix.set(caseStudy.translationKey);

      // Update SEO
      this.seo.updateSEO({
        title: `${caseStudy.translationKey}.meta.title`,
        description: `${caseStudy.translationKey}.meta.description`
      });

      // Track page view
      this.analytics.trackPageView(`/resources/case-studies/${slug}`);
      this.analytics.trackContentEngagement('case_study', slug, 'view');

      // Load related case studies
      this.loadRelatedCaseStudies(caseStudy.industry, slug);

      this.isLoading.set(false);
    } else {
      this.isLoading.set(false);
      this.notFound.set(true);
    }
  }

  private loadRelatedCaseStudies(industry: string, excludeSlug: string): void {
    // Find case studies in the same industry or with similar services
    const related = Object.values(this.caseStudyMap)
      .filter(cs => cs.slug !== excludeSlug)
      .filter(cs => cs.industry === industry ||
        cs.services.some(s => this.caseStudyMap[excludeSlug]?.services.includes(s)))
      .slice(0, 2);

    this.relatedCaseStudies.set(related);
  }

  downloadCaseStudy(): void {
    const caseStudy = this.caseStudyData();
    if (!caseStudy) return;

    // TODO: Generate PDF or download existing PDF
    this.analytics.trackContentEngagement('case_study', caseStudy.slug, 'download');

    // For now, show alert
    alert('PDF download will be available soon!');
  }

  shareCaseStudy(platform: string): void {
    const caseStudy = this.caseStudyData();
    if (!caseStudy) return;

    const url = window.location.href;
    const title = this.translate.instant(`${caseStudy.translationKey}.hero.title`);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      this.analytics.trackContentEngagement('case_study', caseStudy.slug, 'share');
    }
  }

  getServiceTranslation(service: string): string {
    return `caseStudies.filters.${service}`;
  }
}
