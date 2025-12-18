import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Industry Detail Interface
 * Defines the structure for industry-specific content
 */
interface IndustryDetail {
  id: string;
  titleKey: string;
  headlineKey: string;
  descriptionKey: string;
  complianceKey: string[];
  icon: string;
  iconSvg: string;
  gradient: string;
  services: {
    iconPath: string;
    titleKey: string;
    descriptionKey: string;
  }[];
  useCases: {
    titleKey: string;
    descriptionKey: string;
    metricsKey: string[];
  }[];
}

/**
 * Industry Detail Component
 *
 * Displays comprehensive information about a specific industry:
 * - Hero section with industry context
 * - Compliance requirements
 * - Recommended services
 * - Use cases and case study teasers
 * - Call-to-action section
 *
 * @route /industries/:industryId
 */
@Component({
  selector: 'app-industry-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './industry-detail.component.html',
  styleUrls: ['./industry-detail.component.scss']
})
export class IndustryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // Reactive state using signals
  industryId = signal<string>('');
  industryData = signal<IndustryDetail | null>(null);

  // Computed property for checking if data is loaded
  isLoaded = computed(() => this.industryData() !== null);

  /**
   * Industry data mapping
   * Maps industry IDs to their complete data structure
   */
  private readonly industriesData: Record<string, IndustryDetail> = {
    finance: {
      id: 'finance',
      titleKey: 'industries.finance.title',
      headlineKey: 'industries.finance.headline',
      descriptionKey: 'industries.finance.description',
      complianceKey: [
        'industries.finance.compliance.0',
        'industries.finance.compliance.1',
        'industries.finance.compliance.2',
        'industries.finance.compliance.3'
      ],
      icon: '🏦',
      iconSvg: '/assets/images/icons/industries/finance.svg',
      gradient: 'from-blue-600 to-indigo-700',
      services: [
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        },
        {
          iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
          titleKey: 'services.cloud.title',
          descriptionKey: 'services.cloud.description'
        },
        {
          iconPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
          titleKey: 'services.backup.title',
          descriptionKey: 'services.backup.description'
        }
      ],
      useCases: [
        {
          titleKey: 'industries.caseStudies.bank.title',
          descriptionKey: 'industries.caseStudies.bank.description',
          metricsKey: [
            'industries.caseStudies.bank.results.uptime',
            'industries.caseStudies.bank.results.cost',
            'industries.caseStudies.bank.results.deployment'
          ]
        }
      ]
    },
    healthcare: {
      id: 'healthcare',
      titleKey: 'industries.healthcare.title',
      headlineKey: 'industries.healthcare.headline',
      descriptionKey: 'industries.healthcare.description',
      complianceKey: [
        'industries.healthcare.compliance.0',
        'industries.healthcare.compliance.1',
        'industries.healthcare.compliance.2'
      ],
      icon: '🏥',
      iconSvg: '/assets/images/icons/industries/healthcare.svg',
      gradient: 'from-green-600 to-teal-700',
      services: [
        {
          iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
          titleKey: 'services.email.title',
          descriptionKey: 'services.email.description'
        },
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        },
        {
          iconPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
          titleKey: 'services.backup.title',
          descriptionKey: 'services.backup.description'
        }
      ],
      useCases: [
        {
          titleKey: 'industries.caseStudies.hospital.title',
          descriptionKey: 'industries.caseStudies.hospital.description',
          metricsKey: [
            'industries.caseStudies.hospital.results.compliance',
            'industries.caseStudies.hospital.results.incidents',
            'industries.caseStudies.hospital.results.recovery'
          ]
        }
      ]
    },
    government: {
      id: 'government',
      titleKey: 'industries.government.title',
      headlineKey: 'industries.government.headline',
      descriptionKey: 'industries.government.description',
      complianceKey: [
        'industries.government.compliance.0',
        'industries.government.compliance.1',
        'industries.government.compliance.2'
      ],
      icon: '🏛️',
      iconSvg: '/assets/images/icons/industries/government.svg',
      gradient: 'from-purple-600 to-indigo-700',
      services: [
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        },
        {
          iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
          titleKey: 'services.cloud.title',
          descriptionKey: 'services.cloud.description'
        },
        {
          iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          titleKey: 'services.managed.title',
          descriptionKey: 'services.managed.description'
        }
      ],
      useCases: []
    },
    manufacturing: {
      id: 'manufacturing',
      titleKey: 'industries.manufacturing.title',
      headlineKey: 'industries.manufacturing.headline',
      descriptionKey: 'industries.manufacturing.description',
      complianceKey: [
        'industries.manufacturing.compliance.0',
        'industries.manufacturing.compliance.1',
        'industries.manufacturing.compliance.2'
      ],
      icon: '🏭',
      iconSvg: '/assets/images/icons/industries/manufacturing.svg',
      gradient: 'from-orange-600 to-red-700',
      services: [
        {
          iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
          titleKey: 'services.cloud.title',
          descriptionKey: 'services.cloud.description'
        },
        {
          iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          titleKey: 'services.managed.title',
          descriptionKey: 'services.managed.description'
        },
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        }
      ],
      useCases: []
    },
    retail: {
      id: 'retail',
      titleKey: 'industries.retail.title',
      headlineKey: 'industries.retail.headline',
      descriptionKey: 'industries.retail.description',
      complianceKey: [
        'industries.retail.compliance.0',
        'industries.retail.compliance.1',
        'industries.retail.compliance.2'
      ],
      icon: '🛒',
      iconSvg: '/assets/images/icons/industries/retail.svg',
      gradient: 'from-teal-500 to-emerald-600',
      services: [
        {
          iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
          titleKey: 'services.cloud.title',
          descriptionKey: 'services.cloud.description'
        },
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        },
        {
          iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
          titleKey: 'services.email.title',
          descriptionKey: 'services.email.description'
        }
      ],
      useCases: []
    },
    education: {
      id: 'education',
      titleKey: 'industries.education.title',
      headlineKey: 'industries.education.headline',
      descriptionKey: 'industries.education.description',
      complianceKey: [
        'industries.education.compliance.0',
        'industries.education.compliance.1',
        'industries.education.compliance.2'
      ],
      icon: '🎓',
      iconSvg: '/assets/images/icons/industries/education.svg',
      gradient: 'from-cyan-600 to-blue-700',
      services: [
        {
          iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
          titleKey: 'services.cloud.title',
          descriptionKey: 'services.cloud.description'
        },
        {
          iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
          titleKey: 'services.email.title',
          descriptionKey: 'services.email.description'
        },
        {
          iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          titleKey: 'services.security.title',
          descriptionKey: 'services.security.description'
        }
      ],
      useCases: []
    }
  };

  ngOnInit(): void {
    // Get industry ID from route parameter with proper cleanup to prevent memory leak
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          const id = params['id'];
          this.industryId.set(id);

          // Load industry data
          const data = this.industriesData[id];
          if (data) {
            this.industryData.set(data);
          } else {
            // Industry not found - could redirect or show error
            console.warn(`Industry with ID "${id}" not found`);
            this.industryData.set(null);
          }
        },
        error: (error) => {
          console.error('Error loading industry:', error);
          this.industryData.set(null);
        }
      });
  }

  /**
   * Scroll to top of page smoothly
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
