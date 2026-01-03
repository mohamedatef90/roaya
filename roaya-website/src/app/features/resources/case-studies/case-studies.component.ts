import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';

export interface CaseStudy {
  id: string;
  slug: string;
  /** Translation key prefix for full content (e.g., 'resources.caseStudies.banking') */
  translationPrefix: string;
  title: string;
  excerpt: string;
  content?: string;
  industry: string;
  services: string[];
  companySize: string;
  keyResults: {
    metric: string;
    value: string;
    description: string;
  }[];
  featuredImage?: string;
  logo?: string;
  publishedDate: Date;
  /** Project duration for display */
  duration?: string;
  /** Location/region of client */
  location?: string;
}

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './case-studies.component.html',
  styleUrl: './case-studies.component.scss'
})
export class CaseStudiesComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);

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
    // TODO: Load from API/CMS
    // For now, use placeholder data based on memory-bank content
    const caseStudies: CaseStudy[] = [
      {
        id: '1',
        slug: 'bank-cloud-migration',
        translationPrefix: 'resources.caseStudies.banking',
        title: 'Major Egyptian Bank Achieves 42% Cost Reduction with Zero-Downtime Cloud Migration',
        excerpt: 'One of Egypt\'s leading retail banks reduced infrastructure costs by 42% while achieving 99.94% uptime through phased cloud migration on Egypt-hosted infrastructure, fully compliant with CBE regulations.',
        industry: 'finance',
        services: ['cloud', 'migration', 'security'],
        companySize: '500+',
        duration: '8 months',
        location: 'Egypt',
        keyResults: [
          { metric: '42%', value: 'Cost Reduction', description: 'Annual infrastructure savings' },
          { metric: '99.94%', value: 'Uptime', description: 'Zero critical outages' },
          { metric: '60%', value: 'Faster Deployment', description: 'Time to launch new services' }
        ],
        publishedDate: new Date('2024-01-15')
      },
      {
        id: '2',
        slug: 'healthcare-soc-implementation',
        translationPrefix: 'resources.caseStudies.healthcare',
        title: 'Leading Hospital Network Achieves Zero Breaches with 24/7 SOC Implementation',
        excerpt: 'Egypt\'s fastest-growing private hospital network eliminated security threats with comprehensive Security Operations Center solution, achieving 85% faster threat detection and HIPAA-aligned security controls.',
        industry: 'healthcare',
        services: ['security'],
        companySize: '350',
        duration: '6 months',
        location: 'Greater Cairo',
        keyResults: [
          { metric: '0', value: 'Breaches', description: 'Zero security incidents in 18 months' },
          { metric: '85%', value: 'Faster Detection', description: 'Threat detection time improvement' },
          { metric: '24/7', value: 'Monitoring', description: 'Continuous SOC coverage' }
        ],
        publishedDate: new Date('2024-02-20')
      },
      {
        id: '3',
        slug: 'government-digital-transformation',
        translationPrefix: 'resources.caseStudies.government',
        title: 'Egyptian Government Agency Reduces Citizen Service Processing Time by 60%',
        excerpt: 'Major government agency transformed citizen services with cloud infrastructure and workflow automation, reducing processing times from 18-22 days to 7-8 days while ensuring 100% data sovereignty.',
        industry: 'government',
        services: ['cloud', 'automation', 'security'],
        companySize: '800+',
        duration: '8 months',
        location: 'Egypt',
        keyResults: [
          { metric: '60%', value: 'Faster Processing', description: 'Service delivery improvement' },
          { metric: '100%', value: 'Data Sovereignty', description: 'Egypt-hosted infrastructure' },
          { metric: '70%', value: 'Process Automation', description: 'Workflow digitization' }
        ],
        publishedDate: new Date('2024-03-10')
      },
      {
        id: '4',
        slug: 'manufacturing-sap-implementation',
        translationPrefix: 'resources.caseStudies.manufacturing',
        title: '35% Inventory Optimization Through SAP S/4HANA Implementation',
        excerpt: 'Leading Egyptian manufacturing company transformed operations with SAP S/4HANA, achieving 35% inventory optimization, 25% production efficiency improvement, and real-time operational visibility.',
        industry: 'manufacturing',
        services: ['sap', 'cloud'],
        companySize: '380',
        duration: '10 months',
        location: '10th of Ramadan City, Egypt',
        keyResults: [
          { metric: '35%', value: 'Inventory Optimization', description: 'Reduced carrying costs' },
          { metric: '25%', value: 'Production Efficiency', description: 'OEE improvement' },
          { metric: 'Real-Time', value: 'Visibility', description: 'Operational dashboards' }
        ],
        publishedDate: new Date('2024-04-05')
      },
      {
        id: '5',
        slug: 'ecommerce-auto-scaling',
        translationPrefix: 'resources.caseStudies.ecommerce',
        title: 'E-commerce Platform Handles 300% Traffic Surge with Zero Downtime',
        excerpt: 'Egypt\'s fastest-growing e-commerce platform scaled from 10K to 30K concurrent users during Black Friday with zero downtime, using auto-scaling cloud infrastructure and 40% cost optimization.',
        industry: 'retail',
        services: ['cloud', 'security'],
        companySize: '50-200',
        duration: '4 months',
        location: 'Egypt',
        keyResults: [
          { metric: '300%', value: 'Traffic Capacity', description: 'Scaling capability increase' },
          { metric: '99.99%', value: 'Uptime', description: 'During sales events' },
          { metric: '40%', value: 'Cost Savings', description: 'Pay-as-you-scale model' }
        ],
        publishedDate: new Date('2024-11-25')
      }
    ];

    this.allCaseStudies.set(caseStudies);
    this.filteredCaseStudies.set(caseStudies);
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
