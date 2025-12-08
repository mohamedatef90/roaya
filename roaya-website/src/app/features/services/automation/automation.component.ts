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
 * Automation & AI Solutions Standalone Component
 * Dedicated component for IT Automation & AI Solutions service
 * Route: /services/automation
 */
@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './automation.component.html',
  styleUrl: './automation.component.scss',
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
export class AutomationComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/automation.svg';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '60%',
      label: 'Reduction in Manual Tasks',
      description: 'Eliminate repetitive work through intelligent automation'
    },
    {
      value: '5x',
      label: 'Faster Process Execution',
      description: 'Accelerate operations with AI-powered workflows'
    },
    {
      value: '90%',
      label: 'Error Reduction',
      description: 'Minimize human errors with automated validation'
    }
  ];

  // Service Categories - 5 main service areas
  readonly serviceCategories = [
    {
      id: 'chatbots',
      icon: 'faCircleCheck',
      title: 'AI-Powered Chatbots & Virtual Assistants',
      description: 'Intelligent conversational AI solutions that understand Arabic and English, providing 24/7 customer support and automated responses',
      features: [
        'Arabic-speaking AI chatbots with NLP',
        'Multi-channel support (web, mobile, WhatsApp)',
        'Intent recognition and sentiment analysis',
        'Integration with CRM and ticketing systems',
        'Custom training on your business data',
        'Human handoff for complex inquiries'
      ]
    },
    {
      id: 'rpa',
      icon: 'faClock',
      title: 'Workflow Automation (RPA)',
      description: 'Robotic Process Automation solutions that handle repetitive tasks, data entry, and cross-system workflows with zero errors',
      features: [
        'Process discovery and automation mapping',
        'Desktop and web automation',
        'Data extraction and validation',
        'Report generation and distribution',
        'Scheduled job execution',
        'Exception handling and notifications'
      ]
    },
    {
      id: 'integration',
      icon: 'faLightbulb',
      title: 'System Integration & APIs',
      description: 'Seamless integration between your business systems, enabling real-time data synchronization and automated workflows',
      features: [
        'RESTful API development and integration',
        'Legacy system modernization',
        'Real-time data synchronization',
        'Webhook and event-driven automation',
        'Third-party service integration',
        'API security and monitoring'
      ]
    },
    {
      id: 'custom-software',
      icon: 'faSquareCheck',
      title: 'Custom Software Development',
      description: 'Tailored software solutions built to automate your unique business processes and workflows',
      features: [
        'Custom web and mobile applications',
        'Business process automation tools',
        'Dashboard and reporting systems',
        'Workflow management platforms',
        'Document management systems',
        'Integration with existing systems'
      ]
    },
    {
      id: 'machine-learning',
      icon: 'faCircle',
      title: 'Machine Learning Solutions',
      description: 'Advanced AI models for predictive analytics, pattern recognition, and intelligent decision-making',
      features: [
        'Predictive maintenance and forecasting',
        'Anomaly detection and fraud prevention',
        'Natural Language Processing (NLP)',
        'Computer vision and image recognition',
        'Recommendation engines',
        'Custom ML model development and training'
      ]
    }
  ];

  // Key Benefits - 6 primary advantages
  readonly benefits = [
    {
      icon: 'faCircleCheck',
      title: 'Eliminate Repetitive Manual Tasks',
      description: 'Free your team from mundane, time-consuming work. Let automation handle data entry, report generation, and routine operations.'
    },
    {
      icon: 'faCircleCheck',
      title: 'Reduce Human Errors',
      description: 'Minimize costly mistakes with automated validation, data consistency checks, and intelligent error detection.'
    },
    {
      icon: 'faLightbulb',
      title: 'Scale Operations Efficiently',
      description: 'Handle growing workloads without proportional cost increases. Automation scales instantly to meet demand.'
    },
    {
      icon: 'faSquareCheck',
      title: 'Improve Employee Productivity',
      description: 'Empower your team to focus on high-value work by automating low-value tasks. Boost morale and efficiency.'
    },
    {
      icon: 'faCircleCheck',
      title: 'Enable Data-Driven Decisions',
      description: 'Gain real-time insights from automated data collection, analysis, and visualization. Make informed strategic decisions.'
    },
    {
      icon: 'faClock',
      title: 'Accelerate Time to Market',
      description: 'Speed up product launches, service delivery, and customer onboarding with automated workflows and approvals.'
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
      title: 'Arabic-Speaking AI Models',
      description: 'Specialized AI solutions trained on Arabic language and dialects, understanding local context and cultural nuances for superior user experience',
      highlight: 'Bilingual AI'
    },
    {
      title: 'Local Integration Expertise',
      description: 'Deep experience integrating with Egyptian and MENA-region systems, including government portals, local ERPs, and payment gateways',
      highlight: 'MENA-ready'
    },
    {
      title: 'Proven ROI Methodology',
      description: 'Structured approach to measure automation impact with clear KPIs, cost savings tracking, and continuous optimization strategies',
      highlight: 'Measurable results'
    },
    {
      title: 'Continuous Optimization',
      description: 'Ongoing monitoring, performance tuning, and AI model retraining to ensure automation solutions improve over time',
      highlight: 'Always improving'
    }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Starter Automation',
      price: 'Starting at 15,000',
      period: 'one-time setup',
      description: 'Quick-win automation projects',
      features: [
        '1-2 automated workflows',
        'Basic chatbot implementation',
        'Simple API integrations',
        '30 days post-launch support'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Growth Package',
      price: 'Starting at 30,000',
      period: 'project-based',
      description: 'Comprehensive automation suite',
      features: [
        '3-5 automated workflows',
        'Advanced AI chatbot with NLP',
        'System integration and APIs',
        'Custom dashboard and reporting',
        '90 days support and optimization'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise Solution',
      price: 'Custom',
      period: 'custom',
      description: 'End-to-end automation transformation',
      features: [
        'Unlimited workflows and integrations',
        'Custom ML models and AI solutions',
        'Dedicated automation team',
        'Strategic consulting and roadmap',
        'Ongoing support and optimization'
      ],
      cta: 'Request Quote'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'consulting',
      title: 'IT Consulting',
      description: 'Strategic technology consulting and digital transformation planning',
      route: '/services/consulting',
      iconSvg: '/assets/images/icons/services/consulting.svg'
    },
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure for your automation workloads',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'managed',
      title: 'Managed Services',
      description: '24/7 monitoring and support for your automation solutions',
      route: '/services/managed',
      iconSvg: '/assets/images/icons/services/managed.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('IT Automation & AI Solutions - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional IT Automation and AI Solutions. Arabic-speaking chatbots, RPA, workflow automation, and custom AI development. Reduce manual tasks by 60%.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'IT Automation, AI Solutions, RPA, Chatbots, Machine Learning, Workflow Automation, Arabic AI, Egypt Automation, Process Automation'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'IT Automation & AI Solutions - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Transform your business with intelligent automation and AI solutions. Reduce manual tasks by 60%.' });
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
