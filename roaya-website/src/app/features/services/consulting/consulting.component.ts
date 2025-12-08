import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faCircleCheck,
  faBuilding,
  faEnvelope,
  faLightbulb,
  faSquareCheck,
  faCircle,
  faClock
} from '@ng-icons/font-awesome/regular';
import { Meta, Title } from '@angular/platform-browser';

/**
 * IT Consulting & Digital Transformation Standalone Component
 * Dedicated component for IT Consulting service
 * Route: /services/consulting
 */
@Component({
  selector: 'app-consulting',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './consulting.component.html',
  styleUrl: './consulting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faEnvelope,
      faLightbulb,
      faSquareCheck,
      faCircle,
      faClock
    })
  ]
})
export class ConsultingComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/consulting.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '150+',
      label: 'Projects Delivered',
      description: 'Successful consulting engagements across industries'
    },
    {
      value: '95%',
      label: 'Client Satisfaction',
      description: 'Clients highly satisfied with outcomes and service'
    },
    {
      value: '20+',
      label: 'Years Combined Experience',
      description: 'Deep expertise in IT strategy and digital transformation'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'strategy',
      icon: 'faLightbulb',
      title: 'IT Strategy Development',
      description: 'Comprehensive IT strategy planning aligned with your business objectives and market opportunities',
      features: [
        'Technology roadmap creation',
        'IT infrastructure assessment',
        'Digital maturity evaluation',
        'Strategic alignment workshops',
        'Technology stack recommendations',
        'Budget planning and optimization'
      ]
    },
    {
      id: 'transformation',
      icon: 'faCircleCheck',
      title: 'Digital Transformation Roadmap',
      description: 'End-to-end digital transformation planning with clear milestones and measurable outcomes',
      features: [
        'Business process digitization',
        'Change management strategy',
        'Stakeholder engagement planning',
        'Technology adoption roadmap',
        'ROI modeling and tracking',
        'Risk mitigation planning'
      ]
    },
    {
      id: 'assessment',
      icon: 'faSquareCheck',
      title: 'Technology Assessment & Audit',
      description: 'Thorough evaluation of your current IT landscape with actionable recommendations',
      features: [
        'Infrastructure assessment',
        'Security and compliance audit',
        'Performance benchmarking',
        'Cost efficiency analysis',
        'Technology gap identification',
        'Vendor evaluation and selection'
      ]
    },
    {
      id: 'architecture',
      icon: 'faCircle',
      title: 'Enterprise Architecture Design',
      description: 'Design scalable, future-proof enterprise architecture that supports business growth',
      features: [
        'Application architecture design',
        'Data architecture planning',
        'Integration architecture',
        'Cloud architecture strategy',
        'Microservices design patterns',
        'API strategy and governance'
      ]
    },
    {
      id: 'governance',
      icon: 'faClock',
      title: 'IT Governance & Compliance',
      description: 'Establish robust IT governance frameworks to ensure compliance and operational excellence',
      features: [
        'ITIL framework implementation',
        'Compliance management (ISO 27001, GDPR)',
        'IT policy development',
        'Service management design',
        'Audit preparation and support',
        'Risk management frameworks'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faLightbulb',
      title: 'Expert Strategic Guidance',
      description: 'Access to senior consultants with deep industry expertise and proven track record in IT strategy and transformation'
    },
    {
      icon: 'faSquareCheck',
      title: 'Reduce Technology Risks',
      description: 'Identify and mitigate technology risks early through comprehensive assessments and proactive planning'
    },
    {
      icon: 'faCircleCheck',
      title: 'Optimize IT Investments',
      description: 'Maximize ROI on technology spending through data-driven decision making and strategic prioritization'
    },
    {
      icon: 'faCircleCheck',
      title: 'Accelerate Digital Transformation',
      description: 'Fast-track your digital transformation journey with clear roadmaps and expert implementation support'
    },
    {
      icon: 'faLightbulb',
      title: 'Improve Operational Efficiency',
      description: 'Streamline IT operations and business processes to reduce costs and improve service delivery'
    },
    {
      icon: 'faCircleCheck',
      title: 'Future-Proof Your Business',
      description: 'Build scalable architecture and adopt emerging technologies to stay competitive in a rapidly evolving market'
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
      title: 'Egyptian Market Expertise',
      description: 'Deep understanding of local business culture, regulations, and market dynamics combined with international best practices',
      highlight: 'Local + Global'
    },
    {
      title: 'Vendor-Agnostic Recommendations',
      description: 'Unbiased technology recommendations focused solely on your business needs, not vendor partnerships or commissions',
      highlight: 'Independent'
    },
    {
      title: 'Implementation Support Included',
      description: 'We don\'t just create strategy documents - we help you execute with hands-on implementation support and guidance',
      highlight: 'End-to-end'
    },
    {
      title: 'Knowledge Transfer Focus',
      description: 'Empower your team with skills and knowledge to maintain and evolve solutions independently after engagement',
      highlight: 'Skill building'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Assessment',
      price: 'Starting at 10,000',
      period: 'one-time',
      description: 'Technology assessment and audit',
      features: [
        'Current state assessment',
        'Technology gap analysis',
        'Recommendations report',
        'Executive presentation'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Strategy',
      price: 'Starting at 25,000',
      period: 'project',
      description: 'IT strategy and roadmap development',
      features: [
        'Comprehensive IT strategy',
        'Digital transformation roadmap',
        'Vendor evaluation support',
        'Implementation planning',
        '3 months advisory support'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Transformation',
      price: 'Custom',
      period: 'custom',
      description: 'End-to-end transformation consulting',
      features: [
        'Full transformation program',
        'Dedicated consultant team',
        'Change management support',
        'Implementation oversight',
        'Ongoing strategic advisory'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Cloud migration and optimization services',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'automation',
      title: 'Automation & AI',
      description: 'Process automation and artificial intelligence solutions',
      route: '/services/automation',
      iconSvg: '/assets/images/icons/services/automation.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: 'Comprehensive IT management and support',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('IT Consulting & Digital Transformation - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Expert IT consulting and digital transformation services. Strategic guidance, technology assessments, and implementation support. 150+ projects delivered, 95% client satisfaction.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'IT Consulting, Digital Transformation, IT Strategy, Technology Assessment, Enterprise Architecture, IT Governance, Egypt IT Consulting'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'IT Consulting & Digital Transformation - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Expert IT consulting services with 150+ projects delivered and 95% client satisfaction' });
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
