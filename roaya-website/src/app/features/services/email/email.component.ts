import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faCircleCheck,
  faBuilding,
  faEnvelope,
  faSquareCheck,
  faCircle,
  faClock,
  faLightbulb
} from '@ng-icons/font-awesome/regular';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Email Service Standalone Component
 * Dedicated component for Email & Collaboration Solutions (WorldPosta Partner)
 * Route: /services/email
 */
@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faEnvelope,
      faSquareCheck,
      faCircle,
      faClock,
      faLightbulb
    })
  ]
})
export class EmailComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/email.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '99.9%',
      label: 'Email Uptime',
      description: 'Guaranteed availability with enterprise-grade infrastructure'
    },
    {
      value: '50GB+',
      label: 'Mailbox Storage',
      description: 'Generous storage with expandable options'
    },
    {
      value: '<1 sec',
      label: 'Email Delivery',
      description: 'Lightning-fast email delivery worldwide'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'enterprise-email',
      icon: 'faEnvelope',
      title: 'Enterprise Email Hosting (WorldPosta)',
      description: 'Professional business email powered by WorldPosta with Egyptian data center options and full Microsoft Outlook compatibility',
      features: [
        'Custom domain email addresses (@yourcompany.com)',
        'Microsoft Outlook and mobile app support',
        'Egyptian data center hosting options',
        'Scalable mailbox plans (10GB to unlimited)',
        'ActiveSync for real-time email synchronization',
        'Shared mailboxes and distribution lists'
      ]
    },
    {
      id: 'email-security',
      icon: 'faShieldHalved',
      title: 'Email Security & Anti-spam',
      description: 'Advanced threat protection with multi-layered security to block spam, phishing, malware, and ransomware attacks',
      features: [
        '99.9% spam detection accuracy',
        'Real-time malware and virus scanning',
        'Phishing and ransomware protection',
        'Email encryption (TLS/SSL)',
        'Advanced Threat Protection (ATP)',
        'Quarantine management and reporting'
      ]
    },
    {
      id: 'email-archiving',
      icon: 'faBoxArchive',
      title: 'Email Archiving & Compliance',
      description: 'Long-term email archiving with e-discovery tools to meet legal and regulatory compliance requirements',
      features: [
        'Automated email archiving and retention',
        'Legal hold and e-discovery capabilities',
        'Tamper-proof email storage',
        'Regulatory compliance (GDPR, HIPAA, SOX)',
        'Advanced search and retrieval',
        'Audit trails and reporting'
      ]
    },
    {
      id: 'collaboration-tools',
      icon: 'faCalendarDays',
      title: 'Calendar & Collaboration Tools',
      description: 'Integrated calendar, contacts, tasks, and collaboration features to boost team productivity',
      features: [
        'Shared calendars and meeting scheduling',
        'Global address book and contact management',
        'Task management and reminders',
        'Real-time calendar availability',
        'Meeting room booking integration',
        'Mobile calendar synchronization'
      ]
    },
    {
      id: 'email-migration',
      icon: 'faCircle',
      title: 'Email Migration Services',
      description: 'Seamless migration from legacy email systems to WorldPosta with zero downtime and full data integrity',
      features: [
        'Zero-downtime migration strategy',
        'Support for all major email platforms',
        'Email, calendar, and contacts migration',
        'Data integrity verification',
        'User training and onboarding',
        'Post-migration support'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faCircleCheck',
      title: 'Professional Business Email',
      description: 'Build trust with custom domain email addresses that reflect your brand identity and professionalism'
    },
    {
      icon: 'faShieldHalved',
      title: 'Advanced Spam & Malware Protection',
      description: 'Enterprise-grade security with 99.9% spam detection, phishing protection, and real-time threat intelligence'
    },
    {
      icon: 'faBoxArchive',
      title: 'Legal Compliance & E-discovery',
      description: 'Meet regulatory requirements with automated archiving, legal hold, and tamper-proof email storage'
    },
    {
      icon: 'faCalendarDays',
      title: 'Seamless Calendar Integration',
      description: 'Integrated calendar, contacts, and tasks across all devices with real-time synchronization'
    },
    {
      icon: 'faCircleCheck',
      title: 'Mobile Access on All Devices',
      description: 'Full-featured mobile apps for iOS and Android with push notifications and offline access'
    },
    {
      icon: 'faBuilding',
      title: 'Data Sovereignty in Egypt',
      description: 'Egyptian data center hosting options to ensure compliance with local data residency requirements'
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
      title: 'Official WorldPosta Partner',
      description: 'Certified WorldPosta partner with direct access to enterprise-grade email infrastructure and priority technical support',
      highlight: 'Certified Partner'
    },
    {
      title: 'Egyptian Data Center Options',
      description: 'Host your email data in Egypt to meet local data residency requirements while maintaining global connectivity',
      highlight: 'Local hosting'
    },
    {
      title: 'Arabic Interface Support',
      description: 'Full Arabic language support with RTL interface for seamless user experience across bilingual organizations',
      highlight: 'Bilingual ready'
    },
    {
      title: 'Local Technical Support',
      description: 'Egyptian-based technical support team available during local business hours with Arabic and English language support',
      highlight: '24/7 local support'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Business',
      price: 'Starting at 50',
      period: 'user/month',
      description: 'Essential business email for small teams',
      features: [
        '10GB mailbox storage',
        'Custom domain email',
        'Webmail and mobile apps',
        'Basic spam protection',
        'Business hours support'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: 'Starting at 100',
      period: 'user/month',
      description: 'Advanced email with security and compliance',
      features: [
        '50GB mailbox storage',
        'Advanced spam & malware protection',
        'Email archiving and compliance',
        'Shared calendars and contacts',
        '24/7 priority support'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored email solution for large organizations',
      features: [
        'Unlimited mailbox storage',
        'Dedicated email infrastructure',
        'Advanced threat protection',
        'Custom SLA agreements',
        'Dedicated account manager'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Cloud hosting and infrastructure for email servers',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Advanced security for your communication infrastructure',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: 'Fully managed email operations and support',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Email & Collaboration Solutions (WorldPosta Partner) - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional business email powered by WorldPosta. 99.9% uptime, 50GB+ storage, advanced security. Egyptian data center options available.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Business Email, WorldPosta, Email Hosting, Email Security, Email Archiving, Egypt Email, Microsoft Outlook, Email Migration'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Email & Collaboration Solutions (WorldPosta Partner) - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Professional business email with 99.9% uptime and Egyptian data center options' });
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
