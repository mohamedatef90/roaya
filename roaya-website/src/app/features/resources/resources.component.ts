import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';

export interface Resource {
  id: string;
  type: 'blog' | 'case_study' | 'whitepaper' | 'documentation';
  title: string;
  description: string;
  link: string;
  category?: string;
  downloadUrl?: string;
  icon: string;
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);

  resources: Resource[] = [
    {
      id: '1',
      type: 'blog',
      title: 'resources.types.blog.title',
      description: 'resources.types.blog.description',
      link: '/resources/blog',
      icon: '📝'
    },
    {
      id: '2',
      type: 'case_study',
      title: 'resources.types.caseStudies.title',
      description: 'resources.types.caseStudies.description',
      link: '/resources/case-studies',
      icon: '📊'
    },
    {
      id: '3',
      type: 'whitepaper',
      title: 'resources.types.whitepapers.title',
      description: 'resources.types.whitepapers.description',
      link: '/resources/whitepapers',
      icon: '📄'
    },
    {
      id: '4',
      type: 'documentation',
      title: 'resources.types.documentation.title',
      description: 'resources.types.documentation.description',
      link: '/resources/documentation',
      icon: '📚'
    }
  ];

  ngOnInit(): void {
    this.analytics.trackPageView('/resources');
  }

  trackResourceClick(resourceId: string, resourceType: string): void {
    this.analytics.trackContentEngagement(resourceType as any, resourceId, 'view');
  }
}
