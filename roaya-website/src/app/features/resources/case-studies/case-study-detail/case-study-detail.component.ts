import { Component, signal, OnInit, inject, computed, RESPONSE_INIT } from '@angular/core';
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
import { CASE_STUDY_MAP, CaseStudyRecord } from '../case-studies.data';

type CaseStudyData = CaseStudyRecord;

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
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  // Registered case studies live in ../case-studies.data.ts (single source)
  private readonly caseStudyMap: Readonly<Record<string, CaseStudyData>> = CASE_STUDY_MAP;

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
      this.markNotFound();
    }
  }

  // Unknown slugs render the not-found view and, during SSR, respond with a
  // real HTTP 404 so crawlers don't index broken case-study URLs as 200s.
  private markNotFound(): void {
    this.isLoading.set(false);
    this.notFound.set(true);
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
  }

  private loadCaseStudy(slug: string): void {
    this.isLoading.set(true);

    const caseStudy = this.caseStudyMap[slug];

    if (caseStudy) {
      this.caseStudyData.set(caseStudy);
      this.translationPrefix.set(caseStudy.translationKey);

      // Update SEO. Resolve the i18n keys first: updateSEO writes whatever
      // string it is given straight into <title>/<meta>, it does not translate.
      // Passing raw keys shipped `caseStudies.banking.meta.title` as the live
      // SSR title on every case-study page (found in production 2026-08-24).
      // translate.instant works during SSR because ServerTranslationLoader
      // provides the bundled JSON synchronously.
      this.seo.updateSEO({
        title: this.translate.instant(`${caseStudy.translationKey}.meta.title`),
        description: this.translate.instant(`${caseStudy.translationKey}.meta.description`)
      });

      // Track page view
      this.analytics.trackPageView(`/resources/case-studies/${slug}`);
      this.analytics.trackContentEngagement('case_study', slug, 'view');

      // Load related case studies
      this.loadRelatedCaseStudies(caseStudy.industry, slug);

      this.isLoading.set(false);
    } else {
      this.markNotFound();
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
