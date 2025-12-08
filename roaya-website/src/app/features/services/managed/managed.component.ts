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
 * Managed IT Services Standalone Component
 * Dedicated component for Managed IT Services & Support service
 * Route: /services/managed
 */
@Component({
  selector: 'app-managed',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './managed.component.html',
  styleUrl: './managed.component.scss',
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
export class ManagedComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/managed.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '24/7',
      label: 'IT Support',
      description: 'Round-the-clock expert assistance available anytime'
    },
    {
      value: '99.9%',
      label: 'System Availability',
      description: 'Guaranteed uptime with proactive monitoring'
    },
    {
      value: '<30 min',
      label: 'Response Time',
      description: 'Rapid resolution for critical incidents'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'helpdesk',
      icon: 'faCircleCheck',
      title: 'Help Desk & End User Support',
      description: 'Comprehensive IT support for your team with multi-channel assistance and issue tracking',
      features: [
        '24/7 multi-channel support (phone, email, chat)',
        'Ticketing system with priority management',
        'Remote desktop assistance',
        'Software installation and troubleshooting',
        'User account management',
        'Password resets and access management'
      ]
    },
    {
      id: 'monitoring',
      icon: 'faClock',
      title: 'Infrastructure Monitoring & Management',
      description: 'Continuous monitoring of your IT infrastructure to detect and prevent issues before they impact business',
      features: [
        'Real-time system health monitoring',
        'Server and network performance tracking',
        'Automated alert management',
        'Capacity planning and forecasting',
        'Hardware health monitoring',
        'Cloud resource optimization'
      ]
    },
    {
      id: 'network',
      icon: 'faLightbulb',
      title: 'Network Administration',
      description: 'Expert management of your network infrastructure for optimal performance and security',
      features: [
        'Network configuration and optimization',
        'Firewall and security management',
        'VPN setup and administration',
        'Bandwidth monitoring and optimization',
        'DNS and DHCP management',
        'Network documentation and diagrams'
      ]
    },
    {
      id: 'patch',
      icon: 'faSquareCheck',
      title: 'Patch Management & Updates',
      description: 'Systematic approach to keeping your systems secure and up-to-date with the latest patches',
      features: [
        'Automated patch deployment',
        'Security update management',
        'Testing before production rollout',
        'Scheduled maintenance windows',
        'Rollback procedures for failed updates',
        'Compliance reporting for audits'
      ]
    },
    {
      id: 'asset',
      icon: 'faCircle',
      title: 'IT Asset Management',
      description: 'Complete lifecycle management of your IT assets from procurement to retirement',
      features: [
        'Hardware and software inventory',
        'License management and compliance',
        'Asset lifecycle tracking',
        'Procurement and vendor management',
        'Warranty and support tracking',
        'Asset disposal and data sanitization'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faCircleCheck',
      title: 'Focus on Core Business',
      description: 'Free your team from IT headaches and let them focus on strategic initiatives that drive growth'
    },
    {
      icon: 'faCircleCheck',
      title: 'Predictable Monthly Costs',
      description: 'Fixed monthly pricing eliminates surprise IT expenses and simplifies budgeting and financial planning'
    },
    {
      icon: 'faLightbulb',
      title: 'Access to Expert IT Team',
      description: 'Tap into a full team of IT specialists without the overhead of hiring and training full-time staff'
    },
    {
      icon: 'faSquareCheck',
      title: 'Proactive Issue Prevention',
      description: 'Prevent problems before they occur with continuous monitoring, maintenance, and optimization'
    },
    {
      icon: 'faCircleCheck',
      title: 'Reduced Downtime',
      description: 'Minimize business disruption with rapid issue resolution and 99.9% uptime guarantee'
    },
    {
      icon: 'faClock',
      title: 'Scalable Support Levels',
      description: 'Flexible service tiers that grow with your business, from essential support to enterprise-grade coverage'
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
      title: 'Egyptian Team in Your Timezone',
      description: 'Local team understands your business environment and is available during your working hours for real-time support',
      highlight: 'Local advantage'
    },
    {
      title: 'Proactive Monitoring Approach',
      description: 'We don\'t just react to problems - we prevent them with continuous monitoring and predictive analytics',
      highlight: 'Prevent not react'
    },
    {
      title: 'Transparent SLA Reporting',
      description: 'Clear, monthly reports showing response times, resolution rates, and uptime metrics with no hidden surprises',
      highlight: 'Full transparency'
    },
    {
      title: 'Dedicated Account Manager',
      description: 'Single point of contact who understands your business and coordinates all your IT support needs',
      highlight: 'Personal touch'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Essential',
      price: 'Starting at 3,000',
      period: 'month',
      description: 'Basic IT support for small businesses',
      features: [
        'Business hours support (8x5)',
        'Email and phone support',
        'Basic monitoring',
        'Monthly reporting'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: 'Starting at 8,000',
      period: 'month',
      description: 'Comprehensive IT management for growing companies',
      features: [
        '24/7 monitoring and support',
        'Proactive maintenance',
        'Patch management',
        'Network administration',
        'Dedicated account manager'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored IT services for large organizations',
      features: [
        'Dedicated IT team',
        'Custom SLA agreements',
        'Strategic IT consulting',
        'Priority escalation',
        'Quarterly business reviews'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Migrate and manage your infrastructure in the cloud',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Protect your business from cyber threats',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      description: 'Ensure business continuity with reliable backups',
      route: '/services/backup',
      iconSvg: '/assets/images/icons/services/backup.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Managed IT Services & Support - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional Managed IT Services with 24/7 support, 99.9% uptime, and predictable monthly costs. Focus on your business while we handle your IT.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Managed IT Services, IT Support, Help Desk, Network Management, IT Outsourcing, Egypt IT Services, 24/7 Support'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Managed IT Services & Support - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Professional Managed IT Services with 24/7 support and 99.9% uptime guarantee' });
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
