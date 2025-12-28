import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideGitBranch,
  lucideCloud,
  lucideServer,
  lucideActivity,
  lucideShield,
  lucideRocket,
  lucideRefreshCw,
  lucideCheckCircle2,
  lucideTarget,
  lucideCpu,
  lucideBarChart,
  lucideUsers,
  lucideAward,
  lucideClock,
  lucideZap,
  lucideFileText,
  lucideLayers,
  lucideGitMerge,
  lucideTerminal,
  lucideMail,
  lucideEye,
  lucideSettings,
  lucideCode,
  lucideDatabase,
  lucideBox,
  lucideGlobe,
  lucidePlay,
  lucideArrowRight
} from '@ng-icons/lucide';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * DevOps Service Standalone Component
 * Dedicated component for DevOps Services & CI/CD Solutions
 * Route: /services/devops
 */
@Component({
  selector: 'app-devops',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './devops.component.html',
  styleUrl: './devops.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideGitBranch,
      lucideCloud,
      lucideServer,
      lucideActivity,
      lucideShield,
      lucideRocket,
      lucideRefreshCw,
      lucideCheckCircle2,
      lucideTarget,
      lucideCpu,
      lucideBarChart,
      lucideUsers,
      lucideAward,
      lucideClock,
      lucideZap,
      lucideFileText,
      lucideLayers,
      lucideGitMerge,
      lucideTerminal,
      lucideMail,
      lucideEye,
      lucideSettings,
      lucideCode,
      lucideDatabase,
      lucideBox,
      lucideGlobe,
      lucidePlay,
      lucideArrowRight
    })
  ]
})
export class DevopsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/devops.svg';

  // Statistics - 4 key metrics from content
  readonly statistics = [
    { key: 'deployments', icon: 'lucideRocket' },
    { key: 'uptime', icon: 'lucideActivity' },
    { key: 'recovery', icon: 'lucideRefreshCw' },
    { key: 'leadTime', icon: 'lucideClock' }
  ];

  // Problem items - "DevOps fails not because..."
  readonly problemItems = [
    { key: 'fragilePipelines', icon: 'lucideGitBranch' },
    { key: 'growingComplexity', icon: 'lucideLayers' },
    { key: 'deploymentRisk', icon: 'lucideShield' },
    { key: 'lackVisibility', icon: 'lucideBarChart' }
  ];

  // Production support items
  readonly productionSupport = [
    'continuousReleases',
    'highAvailability',
    'regulatedEnvironments',
    'hybridMultiCloud',
    'enterpriseGovernance'
  ];

  // Strategic outcomes
  readonly strategicOutcomes = [
    'releaseFrequency',
    'standardizeDelivery',
    'eliminateManual',
    'improveUptime',
    'embedSecurity',
    'provideMeasurable'
  ];

  // Enterprise expertise
  readonly enterpriseExpertise = [
    { key: 'github', icon: 'lucideGitBranch' },
    { key: 'azure', icon: 'lucideCloud' },
    { key: 'kubernetes', icon: 'lucideBox' },
    { key: 'hybrid', icon: 'lucideGlobe' },
    { key: 'multiEnv', icon: 'lucideServer' }
  ];

  // AI Automation capabilities
  readonly aiAutomation = [
    { key: 'intelligentDelivery', icon: 'lucideRocket', items: 3 },
    { key: 'qualityEnforcement', icon: 'lucideCheckCircle2', items: 3 },
    { key: 'operationalExcellence', icon: 'lucideAward', items: 3 }
  ];

  // Service Offerings - 4 main categories
  readonly serviceOfferings = [
    {
      id: 'cicd',
      icon: 'lucideGitMerge',
      features: ['automatedPipelines', 'releaseGating', 'blueGreenCanary', 'auditApprovals', 'devSecOps', 'rollback']
    },
    {
      id: 'cloudKubernetes',
      icon: 'lucideCloud',
      features: ['terraform', 'ansible', 'k8sDesign', 'helm', 'secretsManagement', 'costOptimization']
    },
    {
      id: 'gitops',
      icon: 'lucideGitBranch',
      features: ['argocd', 'gitSync', 'controlledDeployments', 'instantRollback']
    },
    {
      id: 'observability',
      icon: 'lucideActivity',
      features: ['logsMetricsTraces', 'businessAlerting', 'slos', 'incidentRunbooks', 'postIncident']
    }
  ];

  // Automation benefits
  readonly automationBenefits = [
    'repeatableStandards',
    'reduceHumanError',
    'improveAuditability',
    'enableRollback',
    'supportCompliance'
  ];

  // Business outcomes
  readonly businessOutcomes = [
    'fasterSaferReleases',
    'improvedUptime',
    'reducedMTTR',
    'deliveryVisibility',
    'standardizedGovernance',
    'strongerSecurity',
    'controlledCost'
  ];

  // How We Work - 4 steps
  readonly methodologySteps = [
    { number: 1, key: 'assessment', icon: 'lucideTarget' },
    { number: 2, key: 'implementation', icon: 'lucideTerminal' },
    { number: 3, key: 'documentation', icon: 'lucideFileText' },
    { number: 4, key: 'improvement', icon: 'lucideRefreshCw' }
  ];

  // Best Practices/Frameworks
  readonly frameworks = [
    { key: 'dora' },
    { key: 'sre' },
    { key: 'itil' },
    { key: 'cis' },
    { key: 'nist' }
  ];

  // Why Organizations Trust Us - differentiators
  readonly differentiators = [
    { key: 'disciplinedExecution' },
    { key: 'enterpriseReliability' },
    { key: 'aiAssisted' },
    { key: 'repeatableStandards' },
    { key: 'clearGovernance' },
    { key: 'vendorAgnostic' }
  ];

  // Tool Ecosystems with brand colors and logos
  readonly toolEcosystems = [
    {
      id: 'aws',
      icon: 'lucideCloud',
      color: '#FF9900',
      tools: [
        { name: 'Amazon EKS', logo: 'eks' },
        { name: 'Amazon ECS', logo: 'ecs' },
        { name: 'CloudFormation', logo: 'cloudformation' },
        { name: 'CloudWatch', logo: 'cloudwatch' },
        { name: 'IAM/KMS', logo: 'iam' }
      ]
    },
    {
      id: 'azure',
      icon: 'lucideCloud',
      color: '#0078D4',
      tools: [
        { name: 'AKS', logo: 'aks' },
        { name: 'Azure DevOps', logo: 'azuredevops' },
        { name: 'Azure Monitor', logo: 'monitor' },
        { name: 'Key Vault', logo: 'keyvault' }
      ]
    },
    {
      id: 'gcp',
      icon: 'lucideCloud',
      color: '#4285F4',
      tools: [
        { name: 'GKE', logo: 'gke' },
        { name: 'Cloud Build', logo: 'cloudbuild' },
        { name: 'Cloud Operations', logo: 'stackdriver' },
        { name: 'Secret Manager', logo: 'secretmanager' }
      ]
    },
    {
      id: 'cicdTools',
      icon: 'lucideGitMerge',
      color: '#F05032',
      tools: [
        { name: 'Jenkins', logo: 'jenkins' },
        { name: 'GitHub Actions', logo: 'github' },
        { name: 'GitLab CI', logo: 'gitlab' },
        { name: 'Argo CD', logo: 'argocd' },
        { name: 'Flux', logo: 'flux' },
        { name: 'CircleCI', logo: 'circleci' }
      ]
    },
    {
      id: 'infrastructure',
      icon: 'lucideServer',
      color: '#7B42BC',
      tools: [
        { name: 'Terraform', logo: 'terraform' },
        { name: 'Ansible', logo: 'ansible' },
        { name: 'Kubernetes', logo: 'kubernetes' },
        { name: 'Docker', logo: 'docker' },
        { name: 'Helm', logo: 'helm' },
        { name: 'Pulumi', logo: 'pulumi' }
      ]
    },
    {
      id: 'observability',
      icon: 'lucideActivity',
      color: '#E6522C',
      tools: [
        { name: 'Prometheus', logo: 'prometheus' },
        { name: 'Grafana', logo: 'grafana' },
        { name: 'Elastic Stack', logo: 'elastic' },
        { name: 'Datadog', logo: 'datadog' },
        { name: 'OpenTelemetry', logo: 'opentelemetry' },
        { name: 'Splunk', logo: 'splunk' }
      ]
    }
  ];

  // Active tooling category for tabs
  activeToolCategory = 'all';

  // Related services
  readonly relatedServices = [
    { id: 'cloud', route: '/services/cloud', iconSvg: '/assets/images/icons/services/cloud.svg' },
    { id: 'security', route: '/services/security', iconSvg: '/assets/images/icons/services/security.svg' },
    { id: 'automation', route: '/services/automation', iconSvg: '/assets/images/icons/services/automation.svg' }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('DevOps Services - CI/CD, Kubernetes, GitOps | Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Enterprise DevOps services for continuous, reliable delivery. CI/CD pipelines, Kubernetes platform engineering, GitOps, and SRE observability. Deploy safely and predictably at scale.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'DevOps Services, CI/CD Pipelines, Kubernetes, GitOps, Argo CD, Terraform, Infrastructure as Code, SRE, Platform Engineering, GitHub Actions, Azure DevOps, AWS EKS, GKE'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'DevOps Services - CI/CD, Kubernetes, GitOps | Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise DevOps for continuous, reliable delivery. Deploy safely and predictably at scale.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Hero parallax
        gsap.to('.hero-parallax-bg', {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });

        // Hero content parallax
        gsap.to('.hero-parallax-content', {
          yPercent: -20,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: '80% top',
            scrub: true
          }
        });

        // Statistics cards stagger reveal
        gsap.fromTo('.stat-parallax',
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.stats-section',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Section cards reveal
        gsap.utils.toArray('.card-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: i * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Methodology steps
        gsap.fromTo('.step-parallax',
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            duration: 0.5,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.methodology-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // CTA section zoom
        gsap.fromTo('.cta-parallax',
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.cta-section',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  }
}
