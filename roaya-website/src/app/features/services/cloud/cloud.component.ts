import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faCircleCheck,
  faBuilding,
  faEnvelope,
  faClock,
  faLightbulb,
  faSquareCheck,
  faCircle
} from '@ng-icons/font-awesome/regular';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Cloud Solutions Standalone Component
 * Dedicated component for Cloud Solutions & Infrastructure Management service
 * Route: /services/cloud
 */
@Component({
  selector: 'app-cloud',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './cloud.component.html',
  styleUrl: './cloud.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faEnvelope,
      faClock,
      faLightbulb,
      faSquareCheck,
      faCircle
    })
  ]
})
export class CloudComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/cloud.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '99.9%',
      label: 'Uptime Guarantee',
      description: 'Enterprise-grade availability with SLA-backed commitments'
    },
    {
      value: '40%',
      label: 'Cost Reduction',
      description: 'Average infrastructure cost savings for our clients'
    },
    {
      value: '24/7',
      label: 'Expert Support',
      description: 'Round-the-clock cloud operations and monitoring'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'multi-cloud',
      icon: 'faCircleCheck',
      title: 'Multi-Cloud Management',
      description: 'Unified management across AWS, Azure, and Google Cloud Platform with seamless integration and migration capabilities',
      features: [
        'AWS infrastructure design and management',
        'Microsoft Azure cloud services',
        'Google Cloud Platform integration',
        'Multi-cloud cost optimization',
        'Cloud vendor selection and strategy',
        'Cross-cloud workload migration'
      ]
    },
    {
      id: 'migration',
      icon: 'faClock',
      title: 'Cloud Migration Services',
      description: 'Seamless migration of workloads from on-premises to cloud with zero-downtime strategies and comprehensive testing',
      features: [
        'Migration assessment and planning',
        'Application modernization',
        'Database migration and optimization',
        'Zero-downtime migration strategies',
        'Legacy system cloud transformation',
        'Post-migration optimization and support'
      ]
    },
    {
      id: 'infrastructure-as-code',
      icon: 'faLightbulb',
      title: 'Infrastructure as Code',
      description: 'Automated infrastructure provisioning using Terraform, CloudFormation, and modern DevOps practices',
      features: [
        'Terraform infrastructure automation',
        'AWS CloudFormation templates',
        'Azure Resource Manager (ARM) templates',
        'GitOps workflows and CI/CD pipelines',
        'Infrastructure version control',
        'Automated testing and deployment'
      ]
    },
    {
      id: 'security-compliance',
      icon: 'faSquareCheck',
      title: 'Cloud Security & Compliance',
      description: 'Comprehensive security framework with compliance monitoring for Egyptian and international regulations',
      features: [
        'Cloud security architecture design',
        'Identity and Access Management (IAM)',
        'Encryption at rest and in transit',
        'Compliance monitoring (ISO, GDPR, SOC2)',
        'Security audit and penetration testing',
        'Incident response and disaster recovery'
      ]
    },
    {
      id: 'cost-optimization',
      icon: 'faCircle',
      title: 'Cost Optimization & FinOps',
      description: 'Continuous cost monitoring and optimization strategies to maximize cloud ROI and reduce wasteful spending',
      features: [
        'Cloud cost analysis and forecasting',
        'Resource rightsizing recommendations',
        'Reserved instances and savings plans',
        'Automated cost alerts and budgets',
        'FinOps best practices implementation',
        'Showback and chargeback reporting'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faCircleCheck',
      title: 'Reduce infrastructure costs by 40%',
      description: 'Optimize cloud spending through resource rightsizing, reserved instances, and automated cost management strategies'
    },
    {
      icon: 'faCircleCheck',
      title: 'Scale instantly based on demand',
      description: 'Auto-scaling infrastructure that grows and shrinks with your business needs, paying only for what you use'
    },
    {
      icon: 'faLightbulb',
      title: 'Enterprise-grade security',
      description: 'Multi-layered security with encryption, compliance monitoring, and 24/7 threat detection and response'
    },
    {
      icon: 'faSquareCheck',
      title: '24/7 monitoring and support',
      description: 'Proactive infrastructure monitoring with expert support team available around the clock for critical issues'
    },
    {
      icon: 'faCircleCheck',
      title: 'Multi-cloud flexibility',
      description: 'Avoid vendor lock-in with unified management across AWS, Azure, and Google Cloud platforms'
    },
    {
      icon: 'faClock',
      title: 'Zero capital expenditure',
      description: 'Eliminate upfront hardware costs and maintenance expenses with OpEx-based cloud infrastructure'
    }
  ];

  // Industries Served
  readonly industries = [
    {
      id: 'finance',
      name: 'Finance & Banking',
      icon: 'faBuilding'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: 'faBuilding'
    },
    {
      id: 'government',
      name: 'Government',
      icon: 'faBuilding'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: 'faBuilding'
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      icon: 'faBuilding'
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'faBuilding'
    }
  ];

  // Differentiators - What makes us unique
  readonly differentiators = [
    {
      title: 'Egyptian expertise with global standards',
      description: 'Deep understanding of local business requirements and regulations combined with international cloud best practices and certifications',
      highlight: 'Local + Global'
    },
    {
      title: 'Multi-cloud certified team',
      description: 'AWS, Azure, and Google Cloud certified professionals with extensive experience in hybrid and multi-cloud environments',
      highlight: 'Certified experts'
    },
    {
      title: 'Transparent pricing model',
      description: 'No hidden fees or surprise charges. Clear monthly pricing with detailed cost breakdowns and optimization recommendations',
      highlight: 'No surprises'
    },
    {
      title: 'Proactive optimization',
      description: 'Continuous cost and performance monitoring with automated recommendations to reduce spending and improve efficiency',
      highlight: 'Always optimizing'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Starter',
      price: 'Starting at 5,000',
      period: 'month',
      description: 'Essential cloud management for small businesses',
      features: [
        'Single cloud platform support',
        'Business hours support (8x5)',
        'Monthly cost optimization reports',
        'Basic monitoring and alerts'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: 'Starting at 15,000',
      period: 'month',
      description: 'Comprehensive multi-cloud management',
      features: [
        '24/7 monitoring and support',
        'Multi-cloud platform support',
        'Infrastructure as Code implementation',
        'Cost optimization and FinOps',
        'Security and compliance management'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored cloud solutions for large organizations',
      features: [
        'Dedicated cloud engineering team',
        'Custom SLA agreements',
        'Migration planning and execution',
        'Strategic cloud consulting',
        'Priority escalation and support'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Advanced security solutions for your cloud infrastructure',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: 'Comprehensive IT operations and infrastructure management',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      description: 'Disaster recovery and business continuity solutions',
      route: '/services/backup',
      iconSvg: '/assets/images/icons/services/backup.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Cloud Solutions & Infrastructure Management - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional Cloud Solutions and Infrastructure Management services. Multi-cloud support (AWS, Azure, GCP), 24/7 monitoring, 40% cost reduction, enterprise security.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Cloud Solutions, AWS, Azure, Google Cloud, Cloud Migration, Infrastructure as Code, Multi-Cloud Management, FinOps, Cloud Security, Egypt Cloud Services'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Cloud Solutions & Infrastructure Management - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Professional Cloud Solutions with multi-cloud support, 24/7 monitoring, and 40% cost reduction' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  /**
   * Navigate to contact page
   */
  scrollToContact(): void {
    // This will be handled by router navigation
  }

  /**
   * Navigate to pricing page
   */
  goToPricing(): void {
    // This will be handled by router navigation
  }

  /**
   * Get grid class for asymmetrical layout based on card index
   */
  getCardGridClass(index: number): string {
    const classes = [
      'grid-item-1', // Card 0: Large, spans 2 columns, 2 rows
      'grid-item-2', // Card 1: Medium, spans 1 column, 2 rows
      'grid-item-3', // Card 2: Medium, spans 1 column, 1 row
      'grid-item-4', // Card 3: Large, spans 2 columns, 1 row
      'grid-item-5'  // Card 4: Medium, spans 1 column, 2 rows
    ];
    return classes[index] || 'grid-item-1';
  }

  /**
   * Get layout direction class for card content
   */
  getCardLayoutClass(index: number): string {
    // Alternate between row and column layouts, with some variation
    const layouts = [
      'md:flex-row',      // Card 0: Row layout
      'md:flex-col',      // Card 1: Column layout
      'md:flex-row',      // Card 2: Row layout
      'md:flex-row',      // Card 3: Row layout
      'md:flex-col'       // Card 4: Column layout
    ];
    return layouts[index] || 'md:flex-row';
  }

  /**
   * Get features grid class based on card index
   */
  getFeaturesGridClass(index: number): string {
    // Vary the grid columns for visual interest
    const classes = [
      'grid-cols-1 md:grid-cols-2',           // Card 0: 2 columns
      'grid-cols-1',                          // Card 1: 1 column (narrow card)
      'grid-cols-1 md:grid-cols-2',           // Card 2: 2 columns
      'grid-cols-1 md:grid-cols-3',           // Card 3: 3 columns (wide card)
      'grid-cols-1'                           // Card 4: 1 column (narrow card)
    ];
    return classes[index] || 'grid-cols-1 md:grid-cols-2';
  }
}
