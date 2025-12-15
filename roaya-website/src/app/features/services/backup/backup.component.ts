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
import {
  faSolidShield
} from '@ng-icons/font-awesome/solid';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Backup & Recovery Standalone Component
 * Dedicated component for Backup & Disaster Recovery Solutions service
 * Route: /services/backup
 */
@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './backup.component.html',
  styleUrl: './backup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faEnvelope,
      faClock,
      faLightbulb,
      faSquareCheck,
      faCircle,
      faShield: faSolidShield
    })
  ]
})
export class BackupComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/backup.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '99.99%',
      label: 'Data Recovery Rate',
      description: 'Guaranteed successful recovery of protected data'
    },
    {
      value: '<4 Hour',
      label: 'RTO (Recovery Time Objective)',
      description: 'Maximum downtime for critical business systems'
    },
    {
      value: '15 min',
      label: 'RPO (Recovery Point Objective)',
      description: 'Minimal data loss with frequent backup intervals'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'cloud-backup',
      icon: 'faCircleCheck',
      title: 'Cloud Backup Solutions',
      description: 'Secure, scalable cloud-based backup infrastructure with automated scheduling and encryption',
      features: [
        'Automated daily, hourly, or continuous backup',
        'AES-256 encryption at rest and in transit',
        'Incremental and differential backup strategies',
        'Multi-cloud backup support (AWS, Azure, Google Cloud)',
        'Deduplication and compression for storage efficiency',
        'Retention policies and lifecycle management'
      ]
    },
    {
      id: 'disaster-recovery',
      icon: 'faShield',
      title: 'Disaster Recovery Planning',
      description: 'Comprehensive disaster recovery strategies to ensure business continuity during outages or data loss events',
      features: [
        'Disaster recovery plan (DRP) development',
        'Failover and failback procedures',
        'Hot, warm, and cold standby configurations',
        'Regular DR testing and validation',
        'Incident response playbooks',
        'RTO/RPO assessment and optimization'
      ]
    },
    {
      id: 'business-continuity',
      icon: 'faClock',
      title: 'Business Continuity Management',
      description: 'End-to-end business continuity planning to minimize operational disruption and ensure rapid recovery',
      features: [
        'Business impact analysis (BIA)',
        'Continuity plan documentation',
        'Critical system prioritization',
        'Alternative site configuration',
        'Employee training and awareness',
        'Annual continuity testing exercises'
      ]
    },
    {
      id: 'data-replication',
      icon: 'faCircle',
      title: 'Data Replication Services',
      description: 'Real-time and scheduled data replication to geographically distributed locations for redundancy',
      features: [
        'Synchronous and asynchronous replication',
        'Cross-region and cross-cloud replication',
        'Database replication (SQL, NoSQL)',
        'File-level and block-level replication',
        'Conflict resolution and consistency checks',
        'Geographic redundancy for compliance'
      ]
    },
    {
      id: 'monitoring-testing',
      icon: 'faLightbulb',
      title: 'Backup Monitoring & Testing',
      description: 'Proactive monitoring and regular testing to ensure backup integrity and recoverability',
      features: [
        '24/7 backup job monitoring and alerting',
        'Automated backup verification',
        'Quarterly recovery testing drills',
        'Backup performance analytics',
        'Compliance reporting and audit trails',
        'Backup failure detection and remediation'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faShield',
      title: 'Protect Critical Business Data',
      description: 'Safeguard your most important data assets with enterprise-grade backup solutions and military-grade encryption'
    },
    {
      icon: 'faClock',
      title: 'Minimize Downtime Costs',
      description: 'Reduce financial losses from system outages with rapid recovery capabilities and guaranteed RTO/RPO SLAs'
    },
    {
      icon: 'faSquareCheck',
      title: 'Meet Compliance Requirements',
      description: 'Satisfy regulatory and industry compliance standards with audit trails, retention policies, and data sovereignty'
    },
    {
      icon: 'faCircleCheck',
      title: 'Automated Backup Scheduling',
      description: 'Set-it-and-forget-it backup automation with continuous monitoring, alerting, and intelligent scheduling'
    },
    {
      icon: 'faLightbulb',
      title: 'Rapid Disaster Recovery',
      description: 'Restore operations quickly with tested recovery procedures, failover systems, and dedicated support teams'
    },
    {
      icon: 'faCircle',
      title: 'Geographic Redundancy',
      description: 'Distribute backups across multiple data centers and regions to protect against localized disasters and outages'
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
      title: 'Egyptian Data Centers Available',
      description: 'Host your backup data in Egypt for data sovereignty compliance and faster local recovery, combined with international disaster recovery options',
      highlight: 'Local + Global'
    },
    {
      title: 'Guaranteed RTO/RPO SLAs',
      description: 'Industry-leading service level agreements with financial penalties if we fail to meet recovery time and recovery point objectives',
      highlight: 'SLA-backed'
    },
    {
      title: 'Regular Recovery Testing',
      description: 'Quarterly disaster recovery drills and backup restoration tests to validate your recovery procedures before you need them',
      highlight: 'Tested quarterly'
    },
    {
      title: '24/7 Monitoring Team',
      description: 'Dedicated backup operations center monitoring all jobs, with immediate alerting and remediation for failed backups',
      highlight: 'Always watching'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Essential Backup',
      price: 'Starting at 2,000',
      period: 'month',
      description: 'Basic backup protection for small businesses',
      features: [
        'Up to 500GB cloud backup storage',
        'Daily automated backups',
        '30-day retention policy',
        'Email support (business hours)',
        'Basic encryption (AES-256)'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional DR',
      price: 'Starting at 6,000',
      period: 'month',
      description: 'Comprehensive disaster recovery solution',
      features: [
        'Up to 5TB cloud backup storage',
        'Hourly incremental backups',
        '90-day retention policy',
        'Disaster recovery planning',
        'Quarterly DR testing',
        '24/7 phone and email support',
        'Geographic replication'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise Solution',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored backup and recovery for large enterprises',
      features: [
        'Unlimited backup storage',
        'Continuous data protection (CDP)',
        'Custom retention policies',
        'Dedicated backup architect',
        'Monthly DR testing',
        'Priority 24/7 support with 15-min SLA',
        'Multi-region replication'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure for hosting backup and DR systems',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: 'Fully managed IT operations including proactive monitoring',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Advanced cybersecurity to protect backup data from threats',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Backup & Disaster Recovery Solutions - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Enterprise backup and disaster recovery solutions with 99.99% data recovery rate, <4 hour RTO, and 15-minute RPO. Protect your business data.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'backup solutions, disaster recovery, business continuity, data replication, cloud backup, DR planning, Egypt backup, data protection'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Backup & Disaster Recovery Solutions - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise backup and disaster recovery with guaranteed RTO/RPO SLAs' });
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
