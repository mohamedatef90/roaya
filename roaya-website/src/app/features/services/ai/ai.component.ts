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
  lucideNetwork,
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
      lucideNetwork,
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

  // AI Elements for parallax layers (replacing stars)
  aiChips: Array<{id: number, x: number, y: number, type: 'small' | 'medium' | 'processor', delay: number}> = [];
  neuralNodes: Array<{id: number, x: number, y: number, size: number, delay: number}> = [];
  dataParticles: Array<{id: number, x: number, y: number, speed: number, delay: number}> = [];

  // Connection nodes for AI processor visualization (portal section)
  processorNodes = [1, 2, 3, 4, 5, 6];

  // Neural branches for AI brain visualization (CTA section)
  neuralBranches = [1, 2, 3, 4, 5, 6, 7, 8];

  // Hero 3D ML Background - Neural Nodes
  heroNeuralNodes: Array<{id: number, x: number, y: number, z: number, size: number, delay: number, active: boolean}> = [
    { id: 1, x: 10, y: 20, z: 1, size: 8, delay: 0, active: true },
    { id: 2, x: 25, y: 15, z: 2, size: 12, delay: 0.5, active: false },
    { id: 3, x: 40, y: 30, z: 1.5, size: 10, delay: 1, active: true },
    { id: 4, x: 55, y: 10, z: 1, size: 6, delay: 1.5, active: false },
    { id: 5, x: 70, y: 25, z: 2, size: 14, delay: 2, active: true },
    { id: 6, x: 85, y: 18, z: 1, size: 8, delay: 2.5, active: false },
    { id: 7, x: 15, y: 60, z: 1.5, size: 10, delay: 0.3, active: true },
    { id: 8, x: 30, y: 70, z: 2, size: 12, delay: 0.8, active: false },
    { id: 9, x: 50, y: 55, z: 1, size: 16, delay: 1.3, active: true },
    { id: 10, x: 65, y: 65, z: 1.5, size: 8, delay: 1.8, active: false },
    { id: 11, x: 80, y: 50, z: 2, size: 10, delay: 2.3, active: true },
    { id: 12, x: 90, y: 75, z: 1, size: 6, delay: 2.8, active: false },
    { id: 13, x: 20, y: 85, z: 1.5, size: 12, delay: 0.6, active: true },
    { id: 14, x: 45, y: 80, z: 2, size: 8, delay: 1.1, active: false },
    { id: 15, x: 75, y: 88, z: 1, size: 10, delay: 1.6, active: true }
  ];

  // Hero 3D ML Background - Connection Lines
  heroConnections: Array<{id: number, x1: number, y1: number, x2: number, y2: number, delay: number}> = [
    { id: 1, x1: 10, y1: 20, x2: 25, y2: 15, delay: 0 },
    { id: 2, x1: 25, y1: 15, x2: 40, y2: 30, delay: 0.3 },
    { id: 3, x1: 40, y1: 30, x2: 55, y2: 10, delay: 0.6 },
    { id: 4, x1: 55, y1: 10, x2: 70, y2: 25, delay: 0.9 },
    { id: 5, x1: 70, y1: 25, x2: 85, y2: 18, delay: 1.2 },
    { id: 6, x1: 15, y1: 60, x2: 30, y2: 70, delay: 0.2 },
    { id: 7, x1: 30, y1: 70, x2: 50, y2: 55, delay: 0.5 },
    { id: 8, x1: 50, y1: 55, x2: 65, y2: 65, delay: 0.8 },
    { id: 9, x1: 65, y1: 65, x2: 80, y2: 50, delay: 1.1 },
    { id: 10, x1: 40, y1: 30, x2: 50, y2: 55, delay: 0.4 },
    { id: 11, x1: 70, y1: 25, x2: 65, y2: 65, delay: 0.7 },
    { id: 12, x1: 20, y1: 85, x2: 45, y2: 80, delay: 1.0 },
    { id: 13, x1: 45, y1: 80, x2: 75, y2: 88, delay: 1.3 },
    { id: 14, x1: 50, y1: 55, x2: 45, y2: 80, delay: 1.5 }
  ];

  // Hero 3D ML Background - Data Particles
  heroDataParticles: Array<{id: number, x: number, duration: number, delay: number, type: 'cyan' | 'purple' | 'white'}> = [
    { id: 1, x: 5, duration: 8, delay: 0, type: 'cyan' },
    { id: 2, x: 15, duration: 10, delay: 1, type: 'purple' },
    { id: 3, x: 25, duration: 7, delay: 2, type: 'white' },
    { id: 4, x: 35, duration: 9, delay: 0.5, type: 'cyan' },
    { id: 5, x: 45, duration: 11, delay: 1.5, type: 'purple' },
    { id: 6, x: 55, duration: 8, delay: 2.5, type: 'white' },
    { id: 7, x: 65, duration: 10, delay: 0.8, type: 'cyan' },
    { id: 8, x: 75, duration: 7, delay: 1.8, type: 'purple' },
    { id: 9, x: 85, duration: 9, delay: 2.8, type: 'white' },
    { id: 10, x: 95, duration: 11, delay: 0.3, type: 'cyan' }
  ];

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

  // Active milestone (desktop)
  activeMilestone = 1;

  // Expanded milestone for mobile accordion (null = all collapsed)
  expandedMilestone: number | null = 1;

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
    // Generate AI elements for parallax layers
    this.generateAIElements();

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

  private generateAIElements(): void {
    // Generate AI Chips (25 total - mix of types)
    const chipTypes: Array<'small' | 'medium' | 'processor'> = ['small', 'medium', 'processor'];
    for (let i = 0; i < 25; i++) {
      this.aiChips.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: chipTypes[Math.floor(Math.random() * 3)],
        delay: Math.random() * 8
      });
    }

    // Generate Neural Network Nodes (40 total)
    for (let i = 0; i < 40; i++) {
      this.neuralNodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 4, // 4-8px
        delay: Math.random() * 5
      });
    }

    // Generate Data Particles (30 total - subtle flowing dots)
    for (let i = 0; i < 30; i++) {
      this.dataParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 10 + 8, // 8-18s animation duration
        delay: Math.random() * 12
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize animations immediately
      this.initAllAnimations();
    }
  }

  /**
   * Initialize all GSAP animations
   */
  private initAllAnimations(): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);

      // Check for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Skip heavy animations on mobile devices to prevent scroll lag
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Only initialize essential section animations on mobile, skip parallax
        this.initMobileAnimations();
        return;
      }

      // Refresh ScrollTrigger after DOM is ready
      ScrollTrigger.refresh();

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

        // === 3D AI SKULL ROTATION ON SCROLL ===
        // Skull rotates in 3D as user scrolls through the page
        gsap.to('.ai-skull .skull-svg', {
          rotateY: 360,
          rotateX: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8
          }
        });

        // Skull orbits speed up slightly as user scrolls deeper
        gsap.to('.skull-orbit.orbit-1', {
          rotation: 720,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
          }
        });

        gsap.to('.skull-orbit.orbit-2', {
          rotation: -540,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2
          }
        });

        // === GLOBAL AI ELEMENTS PARALLAX ===
        // Creates depth perception as user scrolls through the journey
        // Neural nodes move slowest, AI chips move medium, data particles move fastest

        gsap.to('.neural-nodes-layer', {
          y: '25%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
          }
        });

        gsap.to('.ai-chips-layer', {
          y: '40%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8
          }
        });

        gsap.to('.data-particles-layer', {
          y: '60%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
          }
        });

        // === FLOATING 3D SHAPES PARALLAX ===
        // Each shape has different parallax speed for depth effect
        // Increased y values for more dramatic scroll spread
        gsap.to('.shape-1', {
          y: '450%',
          rotate: 90,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3
          }
        });

        gsap.to('.shape-2', {
          y: '600%',
          rotate: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
          }
        });

        gsap.to('.shape-3', {
          y: '350%',
          rotate: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4
          }
        });

        gsap.to('.shape-4', {
          y: '550%',
          rotate: -90,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6
          }
        });

        gsap.to('.shape-5', {
          y: '300%',
          rotate: 35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.35
          }
        });

        gsap.to('.shape-6', {
          y: '700%',
          rotate: -45,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7
          }
        });

        gsap.to('.shape-7', {
          y: '480%',
          rotate: 70,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.45
          }
        });

        gsap.to('.shape-8', {
          y: '280%',
          rotate: -55,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.55
          }
        });

        // Shapes 9-16: Additional parallax animations
        gsap.to('.shape-9', {
          y: '520%',
          rotate: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4
          }
        });

        gsap.to('.shape-10', {
          y: '650%',
          rotate: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6
          }
        });

        gsap.to('.shape-11', {
          y: '380%',
          rotate: 55,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.35
          }
        });

        gsap.to('.shape-12', {
          y: '580%',
          rotate: -75,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
          }
        });

        gsap.to('.shape-13', {
          y: '420%',
          rotate: 65,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.45
          }
        });

        gsap.to('.shape-14', {
          y: '500%',
          rotate: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.55
          }
        });

        gsap.to('.shape-15', {
          y: '750%',
          rotate: 100,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.65
          }
        });

        gsap.to('.shape-16', {
          y: '320%',
          rotate: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4
          }
        });

        // Edge shapes 17-24: Parallax animations
        gsap.to('.shape-17', {
          y: '550%',
          rotate: 85,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.45
          }
        });

        gsap.to('.shape-18', {
          y: '620%',
          rotate: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.55
          }
        });

        gsap.to('.shape-19', {
          y: '400%',
          rotate: 55,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4
          }
        });

        gsap.to('.shape-20', {
          y: '680%',
          rotate: -95,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6
          }
        });

        gsap.to('.shape-21', {
          y: '350%',
          rotate: 40,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.35
          }
        });

        gsap.to('.shape-22', {
          y: '480%',
          rotate: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
          }
        });

        gsap.to('.shape-23', {
          y: '280%',
          rotate: 75,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.45
          }
        });

        gsap.to('.shape-24', {
          y: '380%',
          rotate: -45,
          ease: 'none',
          scrollTrigger: {
            trigger: '.space-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5
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

        // === TRANSFORMATION SECTION - Problem → Solution ===
        // Unified scroll-driven cross-fade between problem and solution
        const transformationTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-transformation',
            start: 'top top',
            end: '+=200%', // Extended scroll for smooth transition
            scrub: 1,
            pin: true,
            onEnter: () => {
              this.ngZone.run(() => {
                this.currentSection = 'transformation';
                this.cdr.markForCheck();
              });
            }
          }
        });

        // Phase 1 (0-40%): Problem content visible
        // Phase 2 (40-70%): Cross-fade transition
        // Phase 3 (70-100%): Solution content visible

        transformationTl
          // Problem layer fades out and moves up
          .to('.problem-layer', {
            opacity: 0,
            y: -150,
            scale: 0.9,
            duration: 0.4
          }, 0.35)

          // Danger glow fades out
          .to('.danger-glow', {
            opacity: 0,
            duration: 0.3
          }, 0.35)

          // Void overlay fades out
          .to('.void-overlay', {
            opacity: 0,
            duration: 0.3
          }, 0.4)

          // Solution layer fades in
          .to('.solution-layer', {
            opacity: 1,
            duration: 0.3
          }, 0.45)

          // AI Processor container scales in
          .to('.solution-layer .ai-processor-container', {
            scale: 1,
            duration: 0.4,
            ease: 'back.out(1.2)'
          }, 0.45)

          // Data rings appear with stagger
          .fromTo('.solution-layer .data-ring',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, stagger: 0.08, duration: 0.3 }, 0.5)

          // Processor core appears
          .fromTo('.solution-layer .processor-core',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.25 }, 0.55)

          // Connection nodes appear
          .fromTo('.solution-layer .connection-node',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, stagger: 0.05, duration: 0.2 }, 0.6)

          // Processor glow fades in
          .to('.processor-glow', {
            opacity: 0.6,
            duration: 0.3
          }, 0.55)

          // Portal content (text) fades in
          .to('.solution-layer .portal-content', {
            opacity: 1,
            y: 0,
            duration: 0.3
          }, 0.65)

          // Portal text scales in beautifully
          .fromTo('.solution-layer .portal-text',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.25 }, 0.7);

        // Problem cards - Auto-animate on scroll into view (before transformation starts)
        gsap.utils.toArray('.journey-transformation .problem-card').forEach((card: any, index: number) => {
          gsap.fromTo(card,
            {
              opacity: 0,
              y: 80,
              scale: 0.85
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: index * 0.2,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.journey-transformation .problem-cards',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Stakeholder impact items animation
        gsap.utils.toArray('.journey-transformation .impact-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              delay: index * 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.journey-transformation .stakeholder-impact',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Root cause text animation
        gsap.fromTo('.journey-transformation .root-cause p',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.3,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.journey-transformation .root-cause',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

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
          .to('.solution-cards', { y: -100, opacity: 0 }, 1.8);

        // Solution cards - Auto-animate on scroll into view (not scrubbed)
        gsap.utils.toArray('.solution-card').forEach((card: any, index: number) => {
          gsap.fromTo(card,
            {
              opacity: 0,
              y: 100,
              scale: 0.8,
              rotateY: -20
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.9,
              delay: index * 0.15,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: '.solution-cards',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Production Bento Grid cards animation
        gsap.utils.toArray('.prod-card').forEach((card: any, index: number) => {
          gsap.fromTo(card,
            {
              opacity: 0,
              y: 30,
              scale: 0.95
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.production-bento-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Production intro text animation
        gsap.fromTo('.production-intro p',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.production-intro',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Approach & Vision text animation
        gsap.fromTo('.approach-text, .vision-text',
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.approach-text',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Solution promise animation
        gsap.fromTo('.solution-promise',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.solution-promise',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === STRATEGIC SECTION ===
        gsap.fromTo('.strategic-intro p',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.strategic-intro',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.utils.toArray('.maturity-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, y: 50, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.maturity-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.strategic-tagline',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.strategic-tagline',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === ENTERPRISE SECTION (Bento Grid) ===
        gsap.fromTo('.bento-card',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.bento-grid',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === AGENTIC SECTION ===
        gsap.fromTo('.agentic-intro p',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.agentic-intro',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.utils.toArray('.agentic-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.agentic-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.agentic-tagline',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.agentic-tagline',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === SERVICES/CONSTELLATIONS SECTION ===
        gsap.utils.toArray('.accordion-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              delay: index * 0.12,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.service-accordion',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // === GOVERNANCE SECTION ===
        gsap.fromTo('.governance-intro p',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.governance-intro',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.utils.toArray('.governance-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, y: 50, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.governance-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.governance-tagline',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.governance-tagline',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === OUTCOMES SECTION ===
        gsap.utils.toArray('.outcome-card').forEach((card: any, index: number) => {
          gsap.fromTo(card,
            { opacity: 0, y: 80, scale: 0.85, rotateY: -15 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.8,
              delay: index * 0.12,
              ease: 'back.out(1.3)',
              scrollTrigger: {
                trigger: '.outcomes-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.outcomes-tagline',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.outcomes-tagline',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === MILESTONES SECTION ===
        gsap.utils.toArray('.milestone-planet').forEach((planet: any, index: number) => {
          gsap.fromTo(planet,
            { opacity: 0, scale: 0, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.15,
              ease: 'back.out(1.5)',
              scrollTrigger: {
                trigger: '.orbital-path',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.milestone-detail',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.milestone-detail',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === FRAMEWORKS SECTION ===
        gsap.utils.toArray('.framework-badge').forEach((badge: any, index: number) => {
          gsap.fromTo(badge,
            { opacity: 0, scale: 0.8, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.5,
              delay: index * 0.08,
              ease: 'back.out(1.3)',
              scrollTrigger: {
                trigger: '.frameworks-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.frameworks-conclusion',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.frameworks-conclusion',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === WHY US SECTION ===
        gsap.utils.toArray('.whyus-item').forEach((item: any, index: number) => {
          gsap.fromTo(item,
            { opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: '.whyus-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        gsap.fromTo('.whyus-tagline p',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.whyus-tagline',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // === CTA/DESTINATION SECTION ===
        gsap.fromTo('.destination-title',
          { opacity: 0, y: 60, scale: 1.1 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.destination-content',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo('.destination-subtitle',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.destination-content',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo('.use-cases',
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.use-cases',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo('.destination-cta',
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: '.destination-cta',
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.utils.toArray('.trust-signals .signal').forEach((signal: any, index: number) => {
          gsap.fromTo(signal,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: index * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.trust-signals',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // === RELATED SERVICES SECTION ===
        gsap.utils.toArray('.related-link').forEach((link: any, index: number) => {
          gsap.fromTo(link,
            { opacity: 0, x: -40 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.related-links',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

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

        // === DESTINATION SECTION - AI Brain CTA ===
        const destinationTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.journey-destination',
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        });

        destinationTl
          .fromTo('.ai-brain-container',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0)
          .fromTo('.brain-core',
            { scale: 0 },
            { scale: 1, duration: 0.8 }, 0.2)
          .fromTo('.neural-branch',
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, stagger: 0.08, duration: 0.4 }, 0.4)
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

  /**
   * Lightweight animations for mobile devices
   * No parallax, no continuous scroll updates, no 3D transforms
   * Only simple fade-in reveals on scroll
   */
  private initMobileAnimations(): void {
    // Simple fade-in animations for sections - no parallax, no scrub
    const sections = [
      '.journey-entry',
      '.journey-solution',
      '.journey-strategic',
      '.journey-enterprise',
      '.journey-agentic',
      '.journey-constellations',
      '.journey-governance',
      '.journey-outcomes',
      '.journey-milestones',
      '.journey-frameworks',
      '.journey-whyus',
      '.journey-destination'
    ];

    sections.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            toggleActions: 'play none none none', // Only play once, no reverse
            once: true // Don't re-trigger
          }
        }
      );
    });

    // === MOBILE TRANSFORMATION SECTION ===
    // Simplified scroll-based transition without pinning
    // Problem fades out → Solution fades in
    const mobileTransformationTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.journey-transformation',
        start: 'top 60%',
        end: 'top 20%',
        scrub: 0.5, // Lightweight scrub for mobile
        onEnter: () => {
          this.ngZone.run(() => {
            this.currentSection = 'transformation';
            this.cdr.markForCheck();
          });
        }
      }
    });

    mobileTransformationTl
      // Fade out problem layer
      .to('.problem-layer', {
        opacity: 0,
        y: -50,
        duration: 0.5
      }, 0)
      // Fade in solution layer
      .to('.solution-layer', {
        opacity: 1,
        duration: 0.5
      }, 0.3)
      // Show processor core (no complex scale, just opacity)
      .to('.solution-layer .processor-core', {
        opacity: 1,
        duration: 0.4
      }, 0.4)
      // Show portal content
      .to('.solution-layer .portal-content', {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, 0.5);

    // Problem cards - simple fade in
    gsap.utils.toArray('.journey-transformation .problem-card').forEach((card: any, index: number) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.journey-transformation',
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Simple card reveals without stagger delays
    gsap.utils.toArray('.solution-card, .prod-card, .bento-card, .outcome-card').forEach((card: any) => {
      gsap.fromTo(card,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
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

  // Set active milestone (desktop)
  setActiveMilestone(milestone: number): void {
    this.activeMilestone = milestone;
  }

  // Toggle mobile accordion card
  toggleMobileCard(milestone: number): void {
    // Toggle: if already expanded, collapse it; otherwise expand this one
    this.expandedMilestone = this.expandedMilestone === milestone ? null : milestone;
    this.cdr.markForCheck();
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

  // Track AI elements by ID
  trackByAIElement(index: number, item: {id: number}): number {
    return item.id;
  }

  // Track simple number arrays
  trackByIndex(index: number, item: number): number {
    return index;
  }
}
