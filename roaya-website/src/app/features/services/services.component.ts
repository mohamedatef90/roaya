import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCloud,
  faSolidShieldHalved,
  faSolidEnvelope,
  faSolidGears,
  faSolidHardDrive,
  faSolidLightbulb,
  faSolidRobot,
  faSolidMicrochip,
  faSolidEye,
  faSolidCrosshairs,
  faSolidUserShield,
  faSolidInfinity,
  faSolidGlobe
} from '@ng-icons/font-awesome/solid';
import { NavigationService } from '../../core/services/navigation.service';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  faIcon?: string;
  logoImage?: string;
  route: string;
  features: string[];
  badge?: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  providers: [
    provideIcons({
      faSolidCloud,
      faSolidShieldHalved,
      faSolidEnvelope,
      faSolidGears,
      faSolidHardDrive,
      faSolidLightbulb,
      faSolidRobot,
      faSolidMicrochip,
      faSolidEye,
      faSolidCrosshairs,
      faSolidUserShield,
      faSolidInfinity,
      faSolidGlobe
    })
  ]
})
export class ServicesComponent {
  readonly navigationService = inject(NavigationService);

  // Extended service details
  services: ServiceDetail[] = [
    {
      id: 'cloud',
      title: 'services.cloud.title',
      description: 'services.cloud.fullDescription',
      icon: '&#9729;',
      faIcon: 'faSolidCloud',
      route: '/services/cloud',
      badge: 'Popular',
      features: [
        'services.cloud.features.infrastructure',
        'services.cloud.features.migration',
        'services.cloud.features.optimization',
        'services.cloud.features.monitoring'
      ]
    },
    {
      id: 'security',
      title: 'services.security.title',
      description: 'services.security.fullDescription',
      icon: '&#128274;',
      faIcon: 'faSolidShieldHalved',
      route: '/services/security',
      features: [
        'services.security.features.soc',
        'services.security.features.assessment',
        'services.security.features.compliance',
        'services.security.features.response'
      ]
    },
    {
      id: 'email',
      title: 'services.email.title',
      description: 'services.email.fullDescription',
      icon: '&#9993;',
      faIcon: 'faSolidEnvelope',
      route: '/services/email',
      features: [
        'services.email.features.hosting',
        'services.email.features.security',
        'services.email.features.collaboration',
        'services.email.features.archiving'
      ]
    },
    {
      id: 'managed',
      title: 'services.managed.title',
      description: 'services.managed.fullDescription',
      icon: '&#9881;',
      faIcon: 'faSolidGears',
      route: '/services/managed',
      features: [
        'services.managed.features.monitoring',
        'services.managed.features.support',
        'services.managed.features.maintenance',
        'services.managed.features.reporting'
      ]
    },
    {
      id: 'backup',
      title: 'services.backup.title',
      description: 'services.backup.fullDescription',
      icon: '&#128190;',
      faIcon: 'faSolidHardDrive',
      route: '/services/backup',
      features: [
        'services.backup.features.cloud',
        'services.backup.features.recovery',
        'services.backup.features.replication',
        'services.backup.features.testing'
      ]
    },
    {
      id: 'consulting',
      title: 'services.consulting.title',
      description: 'services.consulting.fullDescription',
      icon: '&#128161;',
      faIcon: 'faSolidLightbulb',
      route: '/services/consulting',
      badge: 'New',
      features: [
        'services.consulting.features.strategy',
        'services.consulting.features.transformation',
        'services.consulting.features.architecture',
        'services.consulting.features.roadmap'
      ]
    },
    {
      id: 'sap',
      title: 'services.sap.title',
      description: 'services.sap.fullDescription',
      icon: '&#128200;',
      logoImage: '/assets/images/logos/partners/sap-logo-png_seeklogo-122607.png',
      route: '/services/sap',
      features: [
        'services.sap.features.basis',
        'services.sap.features.monitoring',
        'services.sap.features.performance',
        'services.sap.features.security'
      ]
    },
    {
      id: 'automation',
      title: 'services.automation.title',
      description: 'services.automation.fullDescription',
      icon: '&#9889;',
      faIcon: 'faSolidInfinity',
      route: '/services/automation',
      badge: 'New',
      features: [
        'services.automation.features.ai',
        'services.automation.features.workflow',
        'services.automation.features.integration',
        'services.automation.features.custom'
      ]
    },
    {
      id: 'ai',
      title: 'services.ai.title',
      description: 'services.ai.fullDescription',
      icon: '&#129302;',
      faIcon: 'faSolidRobot',
      route: '/services/ai',
      badge: 'New',
      features: [
        'services.ai.features.automation',
        'services.ai.features.agents',
        'services.ai.features.models',
        'services.ai.features.analytics'
      ]
    },
    {
      id: 'soc',
      title: 'services.security.page.socSolutions.title',
      description: 'services.security.page.socSolutions.hero.subtitle',
      icon: '&#128737;',
      faIcon: 'faSolidEye',
      route: '/services/security/soc-solutions',
      badge: 'Popular',
      features: [
        'services.security.page.solutions.soc.feature1',
        'services.security.page.solutions.soc.feature2',
        'services.security.page.solutions.soc.feature3',
        'services.security.page.solutions.soc.feature4'
      ]
    },
    {
      id: 'penetration-testing',
      title: 'services.security.page.penetrationTesting.title',
      description: 'services.security.page.penetrationTesting.hero.subtitle',
      icon: '&#128269;',
      faIcon: 'faSolidCrosshairs',
      route: '/services/security/penetration-testing',
      features: [
        'services.security.page.solutions.pentest.feature1',
        'services.security.page.solutions.pentest.feature2',
        'services.security.page.solutions.pentest.feature3',
        'services.security.page.solutions.pentest.feature4'
      ]
    },
    {
      id: 'incident-response',
      title: 'services.security.page.incidentResponse.title',
      description: 'services.security.page.incidentResponse.hero.subtitle',
      icon: '&#128680;',
      faIcon: 'faSolidUserShield',
      route: '/services/security/incident-response',
      features: [
        'services.security.page.solutions.incidentResponse.feature1',
        'services.security.page.solutions.incidentResponse.feature2',
        'services.security.page.solutions.incidentResponse.feature3',
        'services.security.page.solutions.incidentResponse.feature4'
      ]
    }
  ];
}
