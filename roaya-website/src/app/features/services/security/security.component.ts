import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
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

  // Active tab for Concept 3 (Tabbed Interface)
  activeSolutionTab = 'soc';

  // Cybersecurity Outcomes - Key business outcomes (using translation keys)
  readonly outcomes = [
    { key: 'reducedRisk', icon: 'faCircle' },
    { key: 'fasterDetection', icon: 'faClock' },
    { key: 'rapidResponse', icon: 'faLightbulb' },
    { key: 'compliance', icon: 'faCircleCheck' },
    { key: 'resilience', icon: 'faSquareCheck' }
  ];

  // Solutions at a Glance - 3 main service areas (using translation keys)
  readonly solutions = [
    { id: 'soc', icon: 'faClock' },
    { id: 'pentest', icon: 'faSquareCheck' },
    { id: 'incidentResponse', icon: 'faLightbulb' }
  ];

  // Technology Partners - Best-in-class platforms (using translation keys)
  readonly technologyPartners = [
    { key: 'paloAlto', logo: '/assets/images/logos/partners/security/palo-alto.svg' },
    { key: 'splunk', logo: '/assets/images/logos/partners/security/splunk.svg' },
    { key: 'elastic', logo: '/assets/images/logos/partners/security/elastic.svg' },
    { key: 'crowdstrike', logo: '/assets/images/logos/partners/security/crowdstrike.svg' },
    { key: 'fortinet', logo: '/assets/images/logos/partners/security/fortinet.svg' },
    { key: 'kaspersky', logo: '/assets/images/logos/partners/security/kaspersky.svg' },
    { key: 'f5', logo: '/assets/images/logos/partners/security/f5.svg' },
    { key: 'nessus', logo: '/assets/images/logos/partners/security/nessus.svg' }
  ];

  // Global Frameworks - Aligned with recognized standards (using translation keys)
  readonly frameworks = [
    { key: 'nistCsf' },
    { key: 'nist80061' },
    { key: 'iso27001' },
    { key: 'mitreAttack' },
    { key: 'cis' }
  ];

  // Why Roaya - Differentiators (using translation keys)
  readonly differentiators = [
    { key: 'expertise' },
    { key: 'aiHuman' },
    { key: 'vendorAgnostic' },
    { key: 'outcomeFocused' }
  ];

  // Industries Served (using translation keys)
  readonly industries = [
    { id: 'finance', icon: 'faBuilding' },
    { id: 'healthcare', icon: 'faBuilding' },
    { id: 'telecom', icon: 'faBuilding' },
    { id: 'government', icon: 'faBuilding' },
    { id: 'manufacturing', icon: 'faBuilding' },
    { id: 'retail', icon: 'faBuilding' }
  ];

  // Pricing tiers (using translation keys)
  readonly pricingTiers = [
    { key: 'essential', features: [1, 2, 3, 4], popular: false, custom: false },
    { key: 'advanced', features: [1, 2, 3, 4, 5], popular: true, custom: false },
    { key: 'enterprise', features: [1, 2, 3, 4, 5], popular: false, custom: true }
  ];

  // Related services (using translation keys)
  readonly relatedServices = [
    { id: 'cloud', route: '/services/cloud', iconSvg: '/assets/images/icons/services/cloud.svg' },
    { id: 'managed', route: '/services/managed', iconSvg: '/assets/images/icons/services/managed.svg' },
    { id: 'backup', route: '/services/backup', iconSvg: '/assets/images/icons/services/backup.svg' }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Cybersecurity Services Built for Real-World Threats - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Protect, detect, and respond to cyber threats with enterprise-grade cybersecurity solutions in Egypt and MENA. 24/7 SOC monitoring, AI-accelerated threat detection, and NIST-aligned incident response.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Cybersecurity Egypt, MENA Cybersecurity, SOC Services, Penetration Testing, NIST Framework, ISO 27001, Incident Response, AI Threat Detection, Palo Alto Cortex XSIAM'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Cybersecurity Services Built for Real-World Threats - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise-grade cybersecurity with 24/7 SOC, AI-accelerated threat detection, and privacy-preserving infrastructure.' });
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
