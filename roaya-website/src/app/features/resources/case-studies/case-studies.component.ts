import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';

export interface CaseStudy {
  id: string;
  slug: string;
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
        slug: 'major-egyptian-bank-cost-reduction',
        title: 'Major Egyptian Bank Achieves 40% Cost Reduction with Zero-Downtime Cloud Migration',
        excerpt: 'One of Egypt\'s leading retail banks reduced infrastructure costs by 40% while achieving 99.97% uptime through phased cloud migration on Egypt-hosted infrastructure, fully compliant with CBE regulations.',
        industry: 'finance',
        services: ['cloud', 'migration', 'security'],
        companySize: '2500+',
        keyResults: [
          { metric: '40%', value: 'Cost Reduction', description: 'Annual infrastructure savings' },
          { metric: '99.97%', value: 'Uptime', description: 'Zero critical outages' },
          { metric: '100%', value: 'CBE Compliance', description: 'Full regulatory alignment' }
        ],
        publishedDate: new Date('2024-01-15')
      },
      {
        id: '2',
        slug: 'hospital-network-zero-breaches-soc',
        title: 'Leading Hospital Network Achieves Zero Breaches with 24/7 SOC Implementation',
        excerpt: 'Egypt\'s fastest-growing private hospital network eliminated security threats with comprehensive Security Operations Center solution, achieving 85% faster incident response and HIPAA-aligned security controls.',
        industry: 'healthcare',
        services: ['security'],
        companySize: '1200+',
        keyResults: [
          { metric: '0', value: 'Breaches', description: 'Zero security incidents' },
          { metric: '85%', value: 'Faster Response', description: 'Incident detection time' },
          { metric: '247', value: 'Threats Blocked', description: 'Automated prevention' }
        ],
        publishedDate: new Date('2024-02-20')
      },
      {
        id: '3',
        slug: 'government-agency-digital-transformation',
        title: 'Egyptian Government Agency Reduces Citizen Service Processing Time by 60%',
        excerpt: 'Major government agency transformed citizen services with cloud infrastructure and workflow automation, reducing processing times from 18-22 days to 7-8 days while ensuring 100% data sovereignty.',
        industry: 'government',
        services: ['cloud', 'automation', 'security'],
        companySize: '800+',
        keyResults: [
          { metric: '60%', value: 'Faster Processing', description: 'Time reduction' },
          { metric: '100%', value: 'Data Sovereignty', description: 'Egypt-hosted infrastructure' },
          { metric: '99.95%', value: 'Uptime', description: 'Infrastructure reliability' }
        ],
        publishedDate: new Date('2024-03-10')
      },
      {
        id: '4',
        slug: 'manufacturer-sap-optimization',
        title: 'Egyptian Manufacturer Saves 2.5M EGP Annually with SAP Optimization',
        excerpt: 'Leading manufacturing company achieved 99.99% SAP uptime and 2.5M EGP annual savings through cloud migration and 24/7 SAP Basis managed services, eliminating production delays.',
        industry: 'manufacturing',
        services: ['sap', 'cloud'],
        companySize: '650+',
        keyResults: [
          { metric: '99.99%', value: 'Uptime', description: 'SAP availability' },
          { metric: '2.5M EGP', value: 'Annual Savings', description: 'Cost reduction' },
          { metric: '0', value: 'Production Delays', description: 'Zero SAP outages' }
        ],
        publishedDate: new Date('2024-04-05')
      },
      {
        id: '5',
        slug: 'ecommerce-black-friday-success',
        title: 'E-commerce Platform Handles 300% Traffic Surge with Zero Downtime',
        excerpt: 'Egypt\'s fastest-growing e-commerce platform processed 47,500 orders during Black Friday 2024 with zero downtime, using auto-scaling cloud infrastructure and PCI DSS compliant payment processing.',
        industry: 'retail',
        services: ['cloud', 'security'],
        companySize: '280',
        keyResults: [
          { metric: '300%', value: 'Traffic Surge', description: 'Handled successfully' },
          { metric: '0', value: 'Downtime', description: 'Zero outages' },
          { metric: '99.98%', value: 'Uptime', description: 'Year-round reliability' }
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
