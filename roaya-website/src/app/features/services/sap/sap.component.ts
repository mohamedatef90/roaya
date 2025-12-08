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
 * SAP Operations Standalone Component
 * Dedicated component for SAP Cloud Operations & Basis Management service
 * Route: /services/sap
 */
@Component({
  selector: 'app-sap',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './sap.component.html',
  styleUrl: './sap.component.scss',
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
export class SapComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/sap.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '99.95%',
      label: 'SAP System Uptime',
      description: 'Guaranteed availability with proactive monitoring'
    },
    {
      value: '24/7',
      label: 'SAP Expert Support',
      description: 'Round-the-clock certified specialists'
    },
    {
      value: '<15 min',
      label: 'Critical Issue Response',
      description: 'Rapid resolution for business-critical incidents'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'basis',
      icon: 'faCircleCheck',
      title: 'SAP Basis Administration',
      description: 'Complete SAP system management including installations, upgrades, transport management, and user administration',
      features: [
        'SAP system installations and upgrades',
        'Transport management (TMS configuration)',
        'User administration and authorization',
        'SAP kernel and patch management',
        'Database administration (HANA, Oracle, SQL Server)',
        'Client management and copy operations'
      ]
    },
    {
      id: 'monitoring',
      icon: 'faClock',
      title: 'Continuous Monitoring & 24/7 Support',
      description: 'Proactive system monitoring with expert support available around the clock to ensure business continuity',
      features: [
        '24/7 real-time system monitoring',
        'Automated alert management',
        'Incident management with SLA tracking',
        'Job monitoring and scheduling',
        'Interface monitoring (RFC, IDoc, Web Services)',
        'Critical ticket resolution within 15 minutes'
      ]
    },
    {
      id: 'performance',
      icon: 'faLightbulb',
      title: 'Performance Optimization & Scalability',
      description: 'System tuning and capacity planning to ensure optimal SAP performance as your business grows',
      features: [
        'Performance tuning and optimization',
        'HANA database optimization',
        'SQL query optimization',
        'Memory management and sizing',
        'Capacity planning and forecasting',
        'Workload analysis and balancing'
      ]
    },
    {
      id: 'security',
      icon: 'faSquareCheck',
      title: 'SAP Security & Compliance',
      description: 'Comprehensive security management and compliance monitoring to protect your SAP environment',
      features: [
        'Security patch management',
        'Authorization concept design',
        'Audit logging and compliance reporting',
        'SOD (Segregation of Duties) monitoring',
        'Vulnerability scanning and remediation',
        'GRC integration and support'
      ]
    },
    {
      id: 'disaster-recovery',
      icon: 'faCircle',
      title: 'Disaster Recovery & High Availability',
      description: 'Business continuity planning with backup strategies and high availability architectures',
      features: [
        'Backup and recovery procedures',
        'Disaster recovery planning and testing',
        'High availability configuration',
        'System replication (HANA SR)',
        'Cluster configuration and management',
        'Business continuity testing'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faCircleCheck',
      title: 'Reduce SAP TCO by 40%',
      description: 'Lower total cost of ownership through expert management, automation, and proactive optimization strategies'
    },
    {
      icon: 'faCircleCheck',
      title: 'Certified SAP Specialists',
      description: 'Access to SAP-certified Basis administrators, solution architects, and consultants with deep expertise'
    },
    {
      icon: 'faLightbulb',
      title: 'Proactive System Optimization',
      description: 'Continuous performance tuning, capacity planning, and resource optimization to prevent issues before they occur'
    },
    {
      icon: 'faSquareCheck',
      title: 'Enterprise-Grade Security',
      description: 'Comprehensive security management with compliance monitoring, patch management, and audit support'
    },
    {
      icon: 'faCircleCheck',
      title: 'Scalable Infrastructure',
      description: 'Flexible architecture that grows with your business, supporting expansion and transformation initiatives'
    },
    {
      icon: 'faClock',
      title: 'Guaranteed SLAs',
      description: '99.95% uptime guarantee with defined response times and resolution commitments for all critical issues'
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
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: 'faBuilding'
    },
    {
      id: 'retail',
      name: 'Retail & Distribution',
      icon: 'faBuilding'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: 'faBuilding'
    },
    {
      id: 'government',
      name: 'Government & Public Sector',
      icon: 'faBuilding'
    },
    {
      id: 'energy',
      name: 'Oil & Gas / Energy',
      icon: 'faBuilding'
    }
  ];

  // Differentiators - What makes us unique
  readonly differentiators = [
    {
      title: 'Egyptian SAP Expertise',
      description: 'Deep understanding of local business requirements with SAP best practices, combined with international standards and certifications',
      highlight: 'Local + Global'
    },
    {
      title: 'Cost-Effective Operations',
      description: 'Premium SAP services at competitive rates, optimized for the Egyptian and MENA market without compromising quality',
      highlight: 'Up to 50% savings'
    },
    {
      title: 'End-to-End SAP Lifecycle',
      description: 'Complete SAP operations support from initial setup through upgrades, migrations, and daily management',
      highlight: 'Full lifecycle'
    },
    {
      title: 'Integration Expertise',
      description: 'Seamless integration with cloud platforms, third-party systems, and legacy applications for hybrid environments',
      highlight: 'Hybrid ready'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'SAP Basis Support',
      price: 'Starting at 15,000',
      period: 'month',
      description: 'Essential SAP Basis administration and support',
      features: [
        'Business hours support (8x5)',
        'Monthly system health checks',
        'Patch management',
        'Basic monitoring'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Managed SAP Operations',
      price: 'Starting at 35,000',
      period: 'month',
      description: '24/7 comprehensive SAP operations',
      features: [
        '24/7 monitoring and support',
        'Proactive optimization',
        'Security management',
        'Performance tuning',
        'Disaster recovery planning'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise SAP Solution',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored SAP services for large enterprises',
      features: [
        'Dedicated SAP team',
        'Custom SLA agreements',
        'Strategic consulting',
        'Transformation support',
        'Priority escalation'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Hosting',
      description: 'Enterprise cloud infrastructure for SAP deployments',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Advanced security for your SAP environment',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    },
    {
      id: 'consulting',
      title: 'Cloud Migration',
      description: 'SAP migration to cloud platforms (AWS, Azure, GCP)',
      route: '/services/consulting',
      iconSvg: '/assets/images/icons/services/consulting.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('SAP Cloud Operations & Basis Management - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional SAP Cloud Operations and Basis Management services. 24/7 support, 99.95% uptime, certified SAP specialists. Reduce TCO by 40%.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'SAP Basis, SAP Operations, SAP HANA, SAP Support, SAP Management, SAP Cloud, Egypt SAP, SAP Monitoring'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'SAP Cloud Operations & Basis Management - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Professional SAP Operations with 24/7 support and 99.95% uptime guarantee' });
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
}
