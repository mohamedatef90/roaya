import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShield,
  lucideHandshake,
  lucideGem,
  lucideRocket,
  lucideTarget,
  lucideCircleCheck,
  lucideLinkedin,
  lucideMail
} from '@ng-icons/lucide';
import { ContentService, TeamMember as ApiTeamMember } from '../../core/services/content.service';
import { LocalizeLinkPipe } from '../../core/i18n/localize-link.pipe';

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
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon, LocalizeLinkPipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  providers: [
    provideIcons({
      lucideShield,
      lucideHandshake,
      lucideGem,
      lucideRocket,
      lucideTarget,
      lucideCircleCheck,
      lucideLinkedin,
      lucideMail
    })
  ]
})
export class AboutComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly translateService = inject(TranslateService);

  teamMembers = signal<ApiTeamMember[]>([]);
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
    // 14+ follows from the approved 2012 founding year (2026-09-01 decision).
    { value: '14+', label: 'about.stats.years' },
    { value: '50+', label: 'about.stats.team' },
    { value: '99.9%', label: 'about.stats.uptime' }
  ];

  ngOnInit(): void {
    this.contentService.getTeamMembers().subscribe(members => {
      this.teamMembers.set(members);
    });
  }

  get currentLang(): string {
    return this.translateService.currentLang || 'en';
  }
}
