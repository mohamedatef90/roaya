import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { CaseStudy } from '../case-studies.component';

@Component({
  selector: 'app-case-study-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './case-study-detail.component.html',
  styleUrl: './case-study-detail.component.scss'
})
export class CaseStudyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly analytics = inject(AnalyticsService);

  caseStudy = signal<CaseStudy | null>(null);
  relatedCaseStudies = signal<CaseStudy[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    if (slug) {
      this.loadCaseStudy(slug);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadCaseStudy(slug: string): void {
    // TODO: Load from API/CMS
    // For now, simulate loading and load from memory-bank content structure
    this.isLoading.set(true);
    
    setTimeout(() => {
      // TODO: Replace with API call
      // Placeholder - case study will be loaded from API
      this.isLoading.set(false);
      
      // When case study is loaded from API, uncomment:
      // if (caseStudy) {
      //   this.analytics.trackContentEngagement('case_study', caseStudy.id, 'view');
      //   this.loadRelatedCaseStudies(caseStudy.industry, caseStudy.id);
      // }
    }, 500);
  }

  private loadRelatedCaseStudies(industry: string, excludeId: string): void {
    // TODO: Load related case studies from API
    this.relatedCaseStudies.set([]);
  }

  downloadCaseStudy(): void {
    const caseStudy = this.caseStudy();
    if (!caseStudy) return;
    
    // TODO: Generate PDF or download existing PDF
    this.analytics.trackContentEngagement('case_study', caseStudy.id, 'download');
  }

  shareCaseStudy(platform: string): void {
    const caseStudy = this.caseStudy();
    if (!caseStudy) return;

    const url = window.location.href;
    const title = caseStudy.title;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      this.analytics.trackContentEngagement('case_study', caseStudy.id, 'share');
    }
  }
}
