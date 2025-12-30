import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBrain,
  lucideBot,
  lucideSparkles,
  lucideCpu,
  lucideActivity,
  lucideShield,
  lucideCheckCircle2,
  lucideTarget,
  lucideBarChart,
  lucideBarChart3,
  lucideUsers,
  lucideAward,
  lucideClock,
  lucideZap,
  lucideFileText,
  lucideLayers,
  lucideCode,
  lucideDatabase,
  lucideGlobe,
  lucideArrowRight,
  lucideArrowDown,
  lucideAlertTriangle,
  lucideXCircle,
  lucideEye,
  lucideLock,
  lucideRefreshCw,
  lucideTrendingUp,
  lucideLineChart,
  lucideGauge,
  lucideServer,
  lucideWrench,
  lucideClipboardCheck,
  lucidePlay,
  lucideRocket,
  lucideOrbit,
  lucideStar,
  lucideHeadphones,
  lucideMessageSquare,
  lucideChevronDown,
  lucideChevronUp,
  lucideShieldAlert,
  lucideSettings,
  lucideGitBranch,
  lucideScale,
  lucideCircleDot,
  lucideBuilding,
  lucideHandshake,
  lucideRocket as lucideRocketIcon,
  lucideBadgeCheck,
  lucideCog
} from '@ng-icons/lucide';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * AI Services - 3D Space Journey Experience
 * Cinematic dark design with Problem → Solution narrative
 * Immersive scroll-triggered space travel
 */
@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideBrain,
      lucideBot,
      lucideSparkles,
      lucideCpu,
      lucideActivity,
      lucideShield,
      lucideCheckCircle2,
      lucideTarget,
      lucideBarChart,
      lucideBarChart3,
      lucideUsers,
      lucideAward,
      lucideClock,
      lucideZap,
      lucideFileText,
      lucideLayers,
      lucideCode,
      lucideDatabase,
      lucideGlobe,
      lucideArrowRight,
      lucideArrowDown,
      lucideAlertTriangle,
      lucideXCircle,
      lucideEye,
      lucideLock,
      lucideRefreshCw,
      lucideTrendingUp,
      lucideLineChart,
      lucideGauge,
      lucideServer,
      lucideWrench,
      lucideClipboardCheck,
      lucidePlay,
      lucideRocket,
      lucideOrbit,
      lucideStar,
      lucideHeadphones,
      lucideMessageSquare,
      lucideChevronDown,
      lucideChevronUp,
      lucideShieldAlert,
      lucideSettings,
      lucideGitBranch,
      lucideScale,
      lucideCircleDot,
      lucideBuilding,
      lucideHandshake,
      lucideBadgeCheck,
      lucideCog
    })
  ]
})
export class AiComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  // Journey progress (0-100)
  journeyProgress = 0;

  // Current section for cinematic reveals
  currentSection = 'entry';

  // Stars for parallax layers (generated)
  starsLayer1: Array<{x: number, y: number, size: number, opacity: number}> = [];
  starsLayer2: Array<{x: number, y: number, size: number, opacity: number}> = [];
  starsLayer3: Array<{x: number, y: number, size: number, opacity: number}> = [];

  // Asteroids for problem section
  asteroids: Array<{x: number, y: number, size: number, rotation: number, delay: number}> = [];

  // Problem items - The Void (chaos without AI)
  readonly problemItems = [
    { key: 'disconnectedPrototypes', icon: 'lucideXCircle', danger: 'high' },
    { key: 'unpredictableBehavior', icon: 'lucideAlertTriangle', danger: 'medium' },
    { key: 'operationalRisk', icon: 'lucideShield', danger: 'high' }
  ];

  // Solution capabilities - The Galaxy
  readonly solutionCapabilities = [
    { key: 'stableAutomation', icon: 'lucideRefreshCw', glow: 'cyan' },
    { key: 'safeAgents', icon: 'lucideBot', glow: 'purple' },
    { key: 'betterAnalytics', icon: 'lucideBarChart', glow: 'blue' },
    { key: 'aiops', icon: 'lucideActivity', glow: 'green' },
    { key: 'controlledDeployment', icon: 'lucideServer', glow: 'orange' }
  ];

  // Service offerings as constellations
  readonly serviceConstellations = [
    {
      id: 'automation',
      icon: 'lucideZap',
      stars: 6,
      features: ['aiAssistedAutomation', 'documentUnderstanding', 'decisionSupport', 'exceptionHandling', 'governanceControls', 'automationObservability']
    },
    {
      id: 'agents',
      icon: 'lucideBot',
      stars: 6,
      features: ['useCaseDriven', 'integrationInternal', 'secureRetrieval', 'actionEnabled', 'evaluationTesting', 'governanceBehavior']
    },
    {
      id: 'customModels',
      icon: 'lucideBrain',
      stars: 5,
      features: ['customML', 'fineTuning', 'modelLifecycle', 'driftDetection', 'explainability']
    },
    {
      id: 'analytics',
      icon: 'lucideLineChart',
      stars: 5,
      features: ['predictiveAnalytics', 'anomalyDetection', 'kpiIntelligence', 'decisionModels', 'dashboards']
    },
    {
      id: 'aiops',
      icon: 'lucideActivity',
      stars: 5,
      features: ['eventCorrelation', 'infrastructureAnomaly', 'incidentTriage', 'reliabilityInsights', 'operationalFeedback']
    }
  ];

  // Active constellation
  activeConstellation = -1;

  // Journey milestones (methodology)
  readonly journeyMilestones = [
    { number: 1, key: 'assessment', icon: 'lucideTarget', planet: 'red' },
    { number: 2, key: 'design', icon: 'lucideCode', planet: 'orange' },
    { number: 3, key: 'build', icon: 'lucideWrench', planet: 'yellow' },
    { number: 4, key: 'validation', icon: 'lucideClipboardCheck', planet: 'green' },
    { number: 5, key: 'operate', icon: 'lucidePlay', planet: 'blue' }
  ];

  // Active milestone
  activeMilestone = 1;

  // Outcomes as destination rewards
  readonly destinationRewards = [
    { key: 'automationGains', icon: 'lucideZap' },
    { key: 'decisionQuality', icon: 'lucideBrain' },
    { key: 'operationalPerformance', icon: 'lucideTrendingUp' },
    { key: 'controlledAdoption', icon: 'lucideShield' },
    { key: 'visibilityBehavior', icon: 'lucideEye' },
    { key: 'scalableFoundations', icon: 'lucideLayers' }
  ];

  // Related services
  readonly relatedServices = [
    { id: 'automation', route: '/services/automation', icon: 'lucideZap' },
    { id: 'security', route: '/services/security', icon: 'lucideShield' },
    { id: 'devops', route: '/services/devops', icon: 'lucideCode' }
  ];

  // Strategic Operating System items - matches en.json services.ai.page.strategic.items
  readonly strategicItems = [
    { key: 'automateWork', icon: 'lucideZap' },
    { key: 'deployAgents', icon: 'lucideBot' },
    { key: 'buildModels', icon: 'lucideBrain' },
    { key: 'improveForecast', icon: 'lucideTrendingUp' },
    { key: 'embedSecurity', icon: 'lucideShield' },
    { key: 'provideTransparency', icon: 'lucideEye' }
  ];

  // Agentic Automation items - matches en.json services.ai.page.agentic.items
  readonly agenticItems = [
    { key: 'toolPermissions', icon: 'lucideLock' },
    { key: 'auditability', icon: 'lucideFileText' },
    { key: 'guardrails', icon: 'lucideShield' },
    { key: 'monitoring', icon: 'lucideActivity' },
    { key: 'humanInLoop', icon: 'lucideUsers' }
  ];

  // Governance/Risk items - matches en.json services.ai.page.risk.items
  readonly governanceItems = [
    { key: 'repeatableDeployment', icon: 'lucideRefreshCw' },
    { key: 'policyEnforcement', icon: 'lucideShield' },
    { key: 'auditableDecisions', icon: 'lucideFileText' },
    { key: 'secureData', icon: 'lucideLock' },
    { key: 'monitoredCapability', icon: 'lucideActivity' }
  ];

  // Framework items - matches en.json services.ai.page.frameworks.items
  readonly frameworkItems = [
    { key: 'nist', icon: 'lucideShield' },
    { key: 'iso', icon: 'lucideClipboardCheck' },
    { key: 'secureByDesign', icon: 'lucideLock' },
    { key: 'securityLifecycle', icon: 'lucideRefreshCw' }
  ];

  // Why Us items - matches en.json services.ai.page.trust.items
  readonly whyUsItems = [
    { key: 'disciplinedExecution', icon: 'lucideTarget' },
    { key: 'productionAccountability', icon: 'lucideServer' },
    { key: 'governanceFirst', icon: 'lucideShield' },
    { key: 'measurableOutcomes', icon: 'lucideBarChart' },
    { key: 'realIntegration', icon: 'lucideGitBranch' },
    { key: 'scalableFoundations', icon: 'lucideLayers' }
  ];

  // CTA responsibilities - matches en.json services.ai.page.cta.responsibilities
  readonly ctaUseCases = [
    'automatingWork',
    'deployingAgents',
    'improvingPerformance',
    'buildingModels',
    'scalingAdoption',
    'movingToImpact'
  ];

  ngOnInit(): void {
    // Generate stars for parallax layers
    this.generateStars();
    this.generateAsteroids();

    // Set page title
    this.title.setTitle('AI Services - Journey to Intelligent Operations | Roaya IT');

    // Set meta tags
    this.meta.updateTag({
      name: 'description',
      content: 'Embark on a journey to intelligent operations. Enterprise AI services with governance, security, and measurable outcomes.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'AI Services, Machine Learning, AI Agents, Enterprise AI, AI Automation, AI Governance, Intelligent Operations'
    });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: 'AI Services - Journey to Intelligent Operations | Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Embark on a journey from chaos to intelligent operations with enterprise AI.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  private generateStars(): void {
    // Layer 1 - distant small stars (most)
    for (let i = 0; i < 150; i++) {
      this.starsLayer1.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    // Layer 2 - medium stars
    for (let i = 0; i < 80; i++) {
      this.starsLayer2.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.4
      });
    }

    // Layer 3 - close bright stars (few)
    for (let i = 0; i < 30; i++) {
      this.starsLayer3.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.4 + 0.6
      });
    }
  }

  private generateAsteroids(): void {
    for (let i = 0; i < 15; i++) {
      this.asteroids.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 20,
        rotation: Math.random() * 360,
        delay: Math.random() * 5
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Journey progress tracker
        ScrollTrigger.create({
          trigger: '.space-journey',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            this.ngZone.run(() => {
              this.journeyProgress = Math.round(self.progress * 100);
              this.cdr.markForCheck();
            });
          }
        });

        // === GLOBAL STARFIELD PARALLAX ===
        // Creates depth perception as user scrolls through the journey
        // Layer 1 (distant stars) moves slowest, Layer 3 (close stars) moves fastest

        gsap.to('.stars-layer-1', {
          y: '30%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
          }
        });

        gsap.to('.stars-layer-2', {
          y: '50%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8
          }
        });

        gsap.to('.stars-layer-3', {
          y: '70%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
          }
        });

        // Subtle nebula parallax for sections with nebula glows
        gsap.utils.toArray('.nebula-glow, .nebula-glow.secondary').forEach((nebula: any) => {
          gsap.to(nebula, {
            y: '15%',
            ease: 'none',
            scrollTrigger: {
              trigger: nebula.closest('.journey-section'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5
            }
          });
        });

        // === ENTRY SECTION - Welcome to the Journey ===
        const entryTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-entry',
            start: 'top top',
            end: '+=100%',
            scrub: 1,
            pin: true
          }
        });

        entryTl
          .to('.entry-title', { scale: 0.8, opacity: 0, y: -100 }, 0)
          .to('.entry-subtitle', { opacity: 0, y: -50 }, 0.2)
          .to('.scroll-indicator', { opacity: 0 }, 0)
          .to('.entry-glow', { scale: 1.5, opacity: 0 }, 0);
        // Note: Star parallax is now handled globally for full-page effect

        // === PROBLEM SECTION - The Void ===
        const problemTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-problem',
            start: 'top top',
            end: '+=150%',
            scrub: 1,
            pin: true,
            onEnter: () => {
              this.ngZone.run(() => {
                this.currentSection = 'problem';
                this.cdr.markForCheck();
              });
            }
          }
        });

        // Asteroids float in
        problemTl
          .fromTo('.asteroid',
            { scale: 0, opacity: 0, rotation: -180 },
            { scale: 1, opacity: 1, rotation: 0, stagger: 0.1, duration: 1 }, 0)
          .fromTo('.problem-title',
            { opacity: 0, y: 100, scale: 1.2 },
            { opacity: 1, y: 0, scale: 1, duration: 1 }, 0.3)
          .fromTo('.problem-card',
            { opacity: 0, x: -100, rotateY: -45 },
            { opacity: 1, x: 0, rotateY: 0, stagger: 0.2, duration: 0.8 }, 0.6)
          .to('.void-overlay', { opacity: 0.3 }, 1)
          .to('.problem-content', { opacity: 0, y: -100 }, 2);

        // === PORTAL SECTION - The Wormhole Transition ===
        const portalTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-portal',
            start: 'top top',
            end: '+=200%',
            scrub: 1,
            pin: true,
            onEnter: () => {
              this.ngZone.run(() => {
                this.currentSection = 'portal';
                this.cdr.markForCheck();
              });
            }
          }
        });

        portalTl
          .fromTo('.portal-ring',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, stagger: 0.1, duration: 1 }, 0)
          .to('.portal-center', { scale: 50, opacity: 0, duration: 2 }, 0.5)
          .fromTo('.portal-text',
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.5 }, 0.3)
          .to('.portal-text', { opacity: 0, scale: 2 }, 1.5)
          .to('.portal-ring', { scale: 20, opacity: 0, stagger: 0.05 }, 1.5);

        // === SOLUTION SECTION - The Galaxy ===
        const solutionTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-solution',
            start: 'top top',
            end: '+=200%',
            scrub: 1,
            pin: true,
            onEnter: () => {
              this.ngZone.run(() => {
                this.currentSection = 'solution';
                this.cdr.markForCheck();
              });
            }
          }
        });

        solutionTl
          .fromTo('.nebula-glow',
            { opacity: 0, scale: 0.5 },
            { opacity: 0.6, scale: 1, duration: 1 }, 0)
          .fromTo('.solution-title',
            { opacity: 0, y: 100 },
            { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .fromTo('.solution-card',
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, stagger: 0.15, duration: 0.6 }, 0.4)
          .to('.solution-cards', { y: -100, opacity: 0 }, 1.8);

        // === CONSTELLATION SECTION - Services ===
        gsap.fromTo('.constellation-card',
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.5,
            scrollTrigger: {
              trigger: '.journey-constellations',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === MILESTONES SECTION - Journey Path ===
        gsap.fromTo('.milestone-planet',
          { opacity: 0, scale: 0, rotate: -180 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            stagger: 0.2,
            duration: 0.6,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: '.journey-milestones',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === DESTINATION SECTION - CTA ===
        const destinationTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-destination',
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        });

        destinationTl
          .fromTo('.destination-planet',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0)
          .fromTo('.destination-title',
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.6 }, 0.3)
          .fromTo('.destination-cta',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5 }, 0.5)
          .fromTo('.reward-card',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.3 }, 0.6);
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('*');
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  }

  // Toggle constellation details
  toggleConstellation(index: number): void {
    this.activeConstellation = this.activeConstellation === index ? -1 : index;
  }

  // Set active milestone
  setActiveMilestone(milestone: number): void {
    this.activeMilestone = milestone;
  }

  // Track by functions
  trackByKey(index: number, item: { key: string }): string {
    return item.key;
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }

  trackByNumber(index: number, item: { number: number }): number {
    return item.number;
  }

  trackByStar(index: number, star: {x: number, y: number}): string {
    return `${star.x}-${star.y}`;
  }
}
