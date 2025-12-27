import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShield,
  lucideShieldCheck,
  lucideShieldAlert,
  lucideAlertOctagon,
  lucideAlertTriangle,
  lucideUserX,
  lucideDatabase,
  lucideBell,
  lucideServerCrash,
  lucideMailWarning,
  lucideScale,
  lucideZap,
  lucideClipboardCheck,
  lucideSearch,
  lucideFileText,
  lucideGauge,
  lucideGitBranch,
  lucideClock,
  lucideRefreshCw,
  lucideCpu,
  lucideHardDrive,
  lucideFileSearch,
  lucideNetwork,
  lucideRocket,
  lucideAward,
  lucideTarget,
  lucideCheckCircle2,
  lucideGlobe,
  lucideMail,
  lucideUsers,
  lucideActivity,
  lucideBrain,
  lucideSparkles,
  lucideInfo
} from '@ng-icons/lucide';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Incident Response & Digital Forensics Sub-Page
 * Route: /services/security/incident-response
 * Parent: Security Service (/services/security)
 */
@Component({
  selector: 'app-incident-response',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './incident-response.component.html',
  styleUrl: './incident-response.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideShield,
      lucideShieldCheck,
      lucideShieldAlert,
      lucideAlertOctagon,
      lucideAlertTriangle,
      lucideUserX,
      lucideDatabase,
      lucideBell,
      lucideServerCrash,
      lucideMailWarning,
      lucideScale,
      lucideZap,
      lucideClipboardCheck,
      lucideSearch,
      lucideFileText,
      lucideGauge,
      lucideGitBranch,
      lucideClock,
      lucideRefreshCw,
      lucideCpu,
      lucideHardDrive,
      lucideFileSearch,
      lucideNetwork,
      lucideRocket,
      lucideAward,
      lucideTarget,
      lucideCheckCircle2,
      lucideGlobe,
      lucideMail,
      lucideUsers,
      lucideActivity,
      lucideBrain,
      lucideSparkles,
      lucideInfo
    })
  ]
})
export class IncidentResponseComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private scrollTriggers: ScrollTrigger[] = [];
  private prefersReducedMotion = false;
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // When to Call - 7 common triggers
  readonly triggers = [
    { key: 'ransomware', icon: 'lucideAlertOctagon' },
    { key: 'accountActivity', icon: 'lucideUserX' },
    { key: 'dataExposure', icon: 'lucideDatabase' },
    { key: 'highSeverityAlerts', icon: 'lucideBell' },
    { key: 'compromisedSystem', icon: 'lucideServerCrash' },
    { key: 'thirdPartyNotif', icon: 'lucideMailWarning' },
    { key: 'defensibleForensics', icon: 'lucideScale' }
  ];

  // Engagement Options - 2 options (accordion)
  readonly engagementOptions = [
    { id: 'onDemand', badge: 'Immediate Response', color: 'red', icon: 'lucideZap' },
    { id: 'retainer', badge: 'Priority Access', color: 'blue', icon: 'lucideShieldCheck' }
  ];

  activeEngagement: string | null = null;

  toggleEngagement(id: string): void {
    this.activeEngagement = this.activeEngagement === id ? null : id;
  }

  // How We Respond - 4-step NIST process
  readonly responseSteps = [
    { number: 1, key: 'prepare', icon: 'lucideClipboardCheck' },
    { number: 2, key: 'detectAnalyze', icon: 'lucideSearch' },
    { number: 3, key: 'containEradicateRecover', icon: 'lucideShield' },
    { number: 4, key: 'postIncident', icon: 'lucideFileText' }
  ];

  // AI-Assisted Capabilities - 4 capabilities
  readonly aiCapabilities = [
    { key: 'fasterScoping', icon: 'lucideGauge' },
    { key: 'evidenceCorrelation', icon: 'lucideGitBranch' },
    { key: 'timelineReconstruction', icon: 'lucideClock' },
    { key: 'repeatableContainment', icon: 'lucideRefreshCw' }
  ];

  // Digital Forensics Capabilities - 5 types with tools
  readonly forensicsTypes = [
    { key: 'memory', icon: 'lucideCpu', tools: ['Volatility', 'FTK Imager'] },
    { key: 'disk', icon: 'lucideHardDrive', tools: ['Autopsy', 'Sleuth Kit', 'EnCase'] },
    { key: 'log', icon: 'lucideFileSearch', tools: ['Chainsaw', 'Velociraptor'] },
    { key: 'network', icon: 'lucideNetwork', tools: ['Wireshark', 'Zeek'] },
    { key: 'rapidTriage', icon: 'lucideRocket', tools: ['KAPE', "Eric Zimmerman's tools"] }
  ];

  // Integration Partners with logo paths
  readonly integrationPartners = [
    { key: 'paloAlto', logo: '/assets/images/logos/partners/security/palo-alto.svg' },
    { key: 'splunk', logo: '/assets/images/logos/partners/security/splunk.svg' },
    { key: 'elastic', logo: '/assets/images/logos/partners/security/elastic.svg' },
    { key: 'f5', logo: '/assets/images/logos/partners/security/f5.svg' },
    { key: 'crowdstrike', logo: '/assets/images/logos/partners/security/crowdstrike.svg' },
    { key: 'fortiguard', logo: '/assets/images/logos/partners/security/fortinet.svg' },
    { key: 'kaspersky', logo: '/assets/images/logos/partners/security/kaspersky.svg' },
    { key: 'nessus', logo: '/assets/images/logos/partners/security/nessus.svg' }
  ];

  // Standards Alignment - 5 frameworks
  readonly standards = [
    { key: 'nistCsf', icon: 'lucideShieldCheck' },
    { key: 'iso27001', icon: 'lucideAward' },
    { key: 'mitreAttack', icon: 'lucideTarget' },
    { key: 'cisControls', icon: 'lucideCheckCircle2' },
    { key: 'globalRegulations', icon: 'lucideGlobe' }
  ];

  // Why Roaya - 5 differentiators
  readonly differentiators = [
    { key: 'availability24x7', icon: 'lucideClock' },
    { key: 'forensicsFirst', icon: 'lucideSearch' },
    { key: 'humanLedAiAccelerated', icon: 'lucideActivity' },
    { key: 'dataProtection', icon: 'lucideShieldCheck' },
    { key: 'actionableOutcomes', icon: 'lucideTarget' }
  ];

  // Stats for animated counters
  readonly stats = [
    { key: 'responseTime', numericValue: 1, suffix: 'hr', icon: 'lucideClock' },
    { key: 'incidents', numericValue: 200, suffix: '+', icon: 'lucideShield' },
    { key: 'nistAligned', numericValue: 100, suffix: '%', icon: 'lucideCheckCircle2' }
  ];

  animatedStats: { [key: string]: string } = {
    responseTime: '0',
    incidents: '0',
    nistAligned: '0'
  };

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Incident Response & Digital Forensics - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: '24/7 Incident Response and Digital Forensics services in Egypt. NIST SP 800-61 aligned methodology. Rapid containment, forensic investigation, and expert-led recovery.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'incident response Egypt, digital forensics, NIST SP 800-61, cyber incident, ransomware response, forensic investigation, IR retainer, 24/7 incident response, DFIR services, memory forensics, network forensics'
    });

    // Open Graph tags
    this.meta.updateTag({
      property: 'og:title',
      content: 'Incident Response & Digital Forensics - Roaya IT'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'When every minute counts, we bring clarity. 24/7 incident response with NIST-aligned methodology and AI-assisted forensic analysis.'
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize animations
    this.initStaggerAnimations();
    this.initStatsCounterAnimation();
  }

  ngOnDestroy(): void {
    // Clean up all ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];
  }

  /**
   * Initialize stagger reveal animations for sections
   */
  private initStaggerAnimations(): void {
    if (this.prefersReducedMotion) return;

    // Animate trigger cards (When to Call)
    const triggers = gsap.utils.toArray('.trigger-card') as HTMLElement[];
    if (triggers.length > 0) {
      gsap.set(triggers, { opacity: 0, y: 40 });
      const trigger = ScrollTrigger.create({
        trigger: '.triggers-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.to(triggers, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate engagement cards
    const engagements = gsap.utils.toArray('.engagement-card') as HTMLElement[];
    if (engagements.length > 0) {
      gsap.set(engagements, { opacity: 0, x: -30 });
      const trigger = ScrollTrigger.create({
        trigger: '.engagement-section',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(engagements, {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate response steps with timeline connector
    const steps = gsap.utils.toArray('.response-step') as HTMLElement[];
    if (steps.length > 0) {
      gsap.set(steps, { opacity: 0, scale: 0.9 });
      const trigger = ScrollTrigger.create({
        trigger: '.process-section',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(steps, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: 'back.out(1.4)'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate AI capabilities
    const aiCards = gsap.utils.toArray('.ai-card') as HTMLElement[];
    if (aiCards.length > 0) {
      gsap.set(aiCards, { opacity: 0, x: 20 });
      const trigger = ScrollTrigger.create({
        trigger: '.ai-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.to(aiCards, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate forensics cards
    const forensicsCards = gsap.utils.toArray('.forensics-card') as HTMLElement[];
    if (forensicsCards.length > 0) {
      gsap.set(forensicsCards, { opacity: 0, y: 30 });
      const trigger = ScrollTrigger.create({
        trigger: '.forensics-section',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(forensicsCards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate standards cards
    const standardsCards = gsap.utils.toArray('.standards-card') as HTMLElement[];
    if (standardsCards.length > 0) {
      gsap.set(standardsCards, { opacity: 0, y: 30 });
      const trigger = ScrollTrigger.create({
        trigger: '.standards-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.to(standardsCards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }

    // Animate Why Roaya cards
    const whyCards = gsap.utils.toArray('.why-card') as HTMLElement[];
    if (whyCards.length > 0) {
      gsap.set(whyCards, { opacity: 0, y: 40 });
      const trigger = ScrollTrigger.create({
        trigger: '.whyroaya-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.to(whyCards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    }
  }

  /**
   * Initialize animated counter for stats
   */
  private initStatsCounterAnimation(): void {
    if (this.prefersReducedMotion) {
      // Set final values immediately for reduced motion
      this.stats.forEach(stat => {
        this.animatedStats[stat.key] = stat.numericValue.toString();
      });
      this.cdr.detectChanges();
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 80%',
      onEnter: () => {
        this.stats.forEach(stat => {
          const obj = { value: 0 };
          gsap.to(obj, {
            value: stat.numericValue,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              this.animatedStats[stat.key] = Math.round(obj.value).toString();
              this.cdr.detectChanges();
            }
          });
        });
      },
      once: true
    });
    this.scrollTriggers.push(trigger);
  }
}
