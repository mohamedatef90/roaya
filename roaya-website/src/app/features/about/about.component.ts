import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShield,
  lucideHandshake,
  lucideGem,
  lucideRocket,
  lucideTarget,
  lucideCircleCheck
} from '@ng-icons/lucide';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  providers: [
    provideIcons({
      lucideShield,
      lucideHandshake,
      lucideGem,
      lucideRocket,
      lucideTarget,
      lucideCircleCheck
    })
  ]
})
export class AboutComponent {
  values: Value[] = [
    {
      icon: 'lucideShield',
      title: 'about.values.security.title',
      description: 'about.values.security.description'
    },
    {
      icon: 'lucideHandshake',
      title: 'about.values.trust.title',
      description: 'about.values.trust.description'
    },
    {
      icon: 'lucideGem',
      title: 'about.values.transparency.title',
      description: 'about.values.transparency.description'
    },
    {
      icon: 'lucideRocket',
      title: 'about.values.innovation.title',
      description: 'about.values.innovation.description'
    }
  ];

  milestones: Milestone[] = [
    {
      year: '2018',
      title: 'about.milestones.founded.title',
      description: 'about.milestones.founded.description'
    },
    {
      year: '2019',
      title: 'about.milestones.partnership.title',
      description: 'about.milestones.partnership.description'
    },
    {
      year: '2021',
      title: 'about.milestones.expansion.title',
      description: 'about.milestones.expansion.description'
    },
    {
      year: '2023',
      title: 'about.milestones.certification.title',
      description: 'about.milestones.certification.description'
    },
    {
      year: '2024',
      title: 'about.milestones.growth.title',
      description: 'about.milestones.growth.description'
    }
  ];

  stats = [
    { value: '150+', label: 'about.stats.clients' },
    { value: '6+', label: 'about.stats.years' },
    { value: '50+', label: 'about.stats.team' },
    { value: '99.9%', label: 'about.stats.uptime' }
  ];
}
