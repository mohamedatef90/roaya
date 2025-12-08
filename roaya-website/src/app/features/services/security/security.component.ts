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
 * Security (Cybersecurity) Service Standalone Component
 * Dedicated component for Cybersecurity Solutions & Threat Protection service
 * Route: /services/security
 */
@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
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
export class SecurityComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/security.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '24/7',
      label: 'SOC Monitoring',
      description: 'Continuous threat detection and response'
    },
    {
      value: '99.9%',
      label: 'Threat Detection Rate',
      description: 'Advanced AI-powered security analytics'
    },
    {
      value: '<15 min',
      label: 'Incident Response',
      description: 'Rapid containment and remediation'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'soc',
      icon: 'faClock',
      title: 'Security Operations Center (SOC)',
      description: '24/7 security monitoring and threat detection with advanced SIEM integration and real-time incident response',
      features: [
        '24/7 continuous security monitoring',
        'SIEM integration (Splunk, QRadar, ELK)',
        'Real-time threat detection and alerting',
        'Automated incident response workflows',
        'Security event correlation and analysis',
        'Threat intelligence integration'
      ]
    },
    {
      id: 'vapt',
      icon: 'faSquareCheck',
      title: 'Vulnerability Assessment & Penetration Testing',
      description: 'Comprehensive security testing to identify and remediate vulnerabilities before attackers exploit them',
      features: [
        'Regular vulnerability scanning',
        'Penetration testing (web, mobile, network)',
        'Security code review and SAST/DAST',
        'Configuration and compliance audits',
        'Remediation planning and support',
        'Executive and technical reporting'
      ]
    },
    {
      id: 'compliance',
      icon: 'faCircleCheck',
      title: 'Compliance & Risk Management',
      description: 'Ensure regulatory compliance and manage security risks with comprehensive governance frameworks',
      features: [
        'Compliance assessments (GDPR, PCI-DSS, ISO 27001)',
        'Risk assessment and management',
        'Security policy development',
        'Audit preparation and support',
        'Third-party risk management',
        'Continuous compliance monitoring'
      ]
    },
    {
      id: 'iam',
      icon: 'faCircle',
      title: 'Identity & Access Management',
      description: 'Secure identity governance with role-based access control, multi-factor authentication, and privileged access management',
      features: [
        'Role-based access control (RBAC)',
        'Multi-factor authentication (MFA)',
        'Single sign-on (SSO) integration',
        'Privileged access management (PAM)',
        'Identity lifecycle management',
        'Access certification and review'
      ]
    },
    {
      id: 'incident-response',
      icon: 'faLightbulb',
      title: 'Incident Response & Recovery',
      description: 'Rapid incident response with forensic investigation, containment strategies, and business continuity planning',
      features: [
        'Incident response planning and drills',
        'Forensic investigation and analysis',
        'Malware analysis and reverse engineering',
        'Breach containment and eradication',
        'Recovery and business continuity',
        'Post-incident reporting and lessons learned'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faClock',
      title: '24/7 Threat Monitoring',
      description: 'Round-the-clock security operations center with expert analysts monitoring your infrastructure for threats'
    },
    {
      icon: 'faSquareCheck',
      title: 'Proactive Vulnerability Detection',
      description: 'Continuous scanning and penetration testing to identify security gaps before attackers can exploit them'
    },
    {
      icon: 'faCircleCheck',
      title: 'Regulatory Compliance',
      description: 'Meet GDPR, PCI-DSS, ISO 27001, and local regulations with comprehensive compliance management'
    },
    {
      icon: 'faLightbulb',
      title: 'Rapid Incident Response',
      description: 'Expert incident response team ready to contain and remediate security breaches within 15 minutes'
    },
    {
      icon: 'faCircleCheck',
      title: 'Security Awareness Training',
      description: 'Employee education programs to build a security-first culture and reduce human error risks'
    },
    {
      icon: 'faSquareCheck',
      title: 'Reduced Breach Risk by 80%',
      description: 'Comprehensive security measures that significantly reduce the likelihood and impact of cyber attacks'
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
      title: 'Egyptian SOC with Arabic Support',
      description: 'Local security operations center with bilingual support, understanding Egyptian market and regional threat landscape',
      highlight: 'Local expertise'
    },
    {
      title: 'Certified Security Experts',
      description: 'Team of certified professionals holding CISSP, CEH, CISM, and other industry-recognized security certifications',
      highlight: 'Elite team'
    },
    {
      title: 'Compliance-First Approach',
      description: 'Built-in compliance frameworks aligned with international standards and Egyptian regulatory requirements',
      highlight: 'Compliance ready'
    },
    {
      title: 'Threat Intelligence Integration',
      description: 'Real-time threat intelligence feeds integrated with global and regional security databases for proactive defense',
      highlight: 'AI-powered'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Essential Security',
      price: 'Starting at 8,000',
      period: 'month',
      description: 'Core security services for small businesses',
      features: [
        'Vulnerability scanning (monthly)',
        'Basic firewall management',
        'Security awareness training',
        'Business hours support (8x5)'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Advanced Security',
      price: 'Starting at 20,000',
      period: 'month',
      description: 'Comprehensive security for growing enterprises',
      features: [
        '24/7 SOC monitoring',
        'SIEM integration and alerting',
        'Quarterly penetration testing',
        'Incident response support',
        'Compliance management (GDPR, PCI-DSS)'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise Security',
      price: 'Custom',
      period: 'custom',
      description: 'Tailored security solutions for large organizations',
      features: [
        'Dedicated security team',
        'Custom SLA agreements',
        'Threat hunting services',
        'Zero Trust architecture design',
        'Executive security consulting'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Secure cloud infrastructure with built-in security controls',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: '24/7 managed IT services with security-first approach',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      description: 'Secure backup solutions with disaster recovery planning',
      route: '/services/backup',
      iconSvg: '/assets/images/icons/services/backup.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Cybersecurity Solutions & Threat Protection - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Enterprise cybersecurity solutions with 24/7 SOC monitoring, 99.9% threat detection, and rapid incident response. GDPR, PCI-DSS compliance services in Egypt.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Cybersecurity Egypt, SOC Services, Penetration Testing, GDPR Compliance, PCI-DSS, Incident Response, Threat Detection, Security Operations'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Cybersecurity Solutions & Threat Protection - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise cybersecurity with 24/7 SOC monitoring and 99.9% threat detection rate' });
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
