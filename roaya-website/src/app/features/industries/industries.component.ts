import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface Industry {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg: string;
  solutions: string[];
  stats?: {
    clients: number;
    projects: number;
  };
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  industry: string;
  results: string[];
}

@Component({
  selector: 'app-industries',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './industries.component.html',
  styleUrl: './industries.component.scss'
})
export class IndustriesComponent {
  industries: Industry[] = [
    {
      id: 'finance',
      title: 'industries.finance.title',
      description: 'industries.finance.description',
      icon: '🏦',
      iconSvg: '/assets/images/icons/industries/finance.svg',
      solutions: [
        'industries.banking.solutions.security',
        'industries.banking.solutions.compliance',
        'industries.banking.solutions.cloud',
        'industries.banking.solutions.disaster'
      ],
      stats: { clients: 25, projects: 80 }
    },
    {
      id: 'healthcare',
      title: 'industries.healthcare.title',
      description: 'industries.healthcare.description',
      icon: '🏥',
      iconSvg: '/assets/images/icons/industries/healthcare.svg',
      solutions: [
        'industries.healthcare.solutions.hipaa',
        'industries.healthcare.solutions.ehr',
        'industries.healthcare.solutions.telemedicine',
        'industries.healthcare.solutions.backup'
      ],
      stats: { clients: 18, projects: 45 }
    },
    {
      id: 'manufacturing',
      title: 'industries.manufacturing.title',
      description: 'industries.manufacturing.description',
      icon: '🏭',
      iconSvg: '/assets/images/icons/industries/manufacturing.svg',
      solutions: [
        'industries.manufacturing.solutions.erp',
        'industries.manufacturing.solutions.iot',
        'industries.manufacturing.solutions.automation',
        'industries.manufacturing.solutions.analytics'
      ],
      stats: { clients: 32, projects: 95 }
    },
    {
      id: 'retail',
      title: 'industries.retail.title',
      description: 'industries.retail.description',
      icon: '🛒',
      iconSvg: '/assets/images/icons/industries/retail.svg',
      solutions: [
        'industries.retail.solutions.ecommerce',
        'industries.retail.solutions.pos',
        'industries.retail.solutions.inventory',
        'industries.retail.solutions.crm'
      ],
      stats: { clients: 40, projects: 120 }
    },
    {
      id: 'education',
      title: 'industries.education.title',
      description: 'industries.education.description',
      icon: '🎓',
      iconSvg: '/assets/images/icons/industries/education.svg',
      solutions: [
        'industries.education.solutions.lms',
        'industries.education.solutions.virtual',
        'industries.education.solutions.security',
        'industries.education.solutions.collaboration'
      ],
      stats: { clients: 15, projects: 35 }
    },
    {
      id: 'government',
      title: 'industries.government.title',
      description: 'industries.government.description',
      icon: '🏛️',
      iconSvg: '/assets/images/icons/industries/government.svg',
      solutions: [
        'industries.government.solutions.digital',
        'industries.government.solutions.security',
        'industries.government.solutions.infrastructure',
        'industries.government.solutions.compliance'
      ],
      stats: { clients: 10, projects: 28 }
    }
  ];

  caseStudies: CaseStudy[] = [
    {
      id: 'bank-modernization',
      title: 'industries.caseStudies.bank.title',
      description: 'industries.caseStudies.bank.description',
      industry: 'industries.banking.title',
      results: [
        'industries.caseStudies.bank.results.uptime',
        'industries.caseStudies.bank.results.cost',
        'industries.caseStudies.bank.results.deployment'
      ]
    },
    {
      id: 'hospital-security',
      title: 'industries.caseStudies.hospital.title',
      description: 'industries.caseStudies.hospital.description',
      industry: 'industries.healthcare.title',
      results: [
        'industries.caseStudies.hospital.results.compliance',
        'industries.caseStudies.hospital.results.incidents',
        'industries.caseStudies.hospital.results.recovery'
      ]
    }
  ];
}
