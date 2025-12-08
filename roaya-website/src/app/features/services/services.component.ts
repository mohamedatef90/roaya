import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationService } from '../../core/services/navigation.service';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg: string;
  route: string;
  features: string[];
  badge?: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
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
      iconSvg: '/assets/images/icons/services/cloud.svg',
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
      iconSvg: '/assets/images/icons/services/security.svg',
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
      iconSvg: '/assets/images/icons/services/email.svg',
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
      iconSvg: '/assets/images/icons/services/managed.svg',
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
      iconSvg: '/assets/images/icons/services/backup.svg',
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
      iconSvg: '/assets/images/icons/services/consulting.svg',
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
      iconSvg: '/assets/images/icons/services/sap.svg',
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
      iconSvg: '/assets/images/icons/services/automation.svg',
      route: '/services/automation',
      badge: 'New',
      features: [
        'services.automation.features.ai',
        'services.automation.features.workflow',
        'services.automation.features.integration',
        'services.automation.features.custom'
      ]
    }
  ];
}
