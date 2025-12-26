import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShield,
  lucideActivity,
  lucideEye,
  lucideZap,
  lucideUsers,
  lucideAward,
  lucideClock,
  lucideTrendingUp,
  lucideBell,
  lucideCheckCircle2,
  lucideDatabase,
  lucideRefreshCw,
  lucideFileText,
  lucideBarChart,
  lucideServer,
  lucideCloud,
  lucideNetwork,
  lucideTarget,
  lucideSearch,
  lucideLock,
  lucideShieldCheck,
  lucideAlertTriangle,
  lucideMail
} from '@ng-icons/lucide';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SOC Solutions Sub-Page
 * Route: /services/security/soc-solutions
 * Parent: Security Service (/services/security)
 */
@Component({
  selector: 'app-soc-solutions',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './soc-solutions.component.html',
  styleUrl: './soc-solutions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideShield,
      lucideActivity,
      lucideEye,
      lucideZap,
      lucideUsers,
      lucideAward,
      lucideClock,
      lucideTrendingUp,
      lucideBell,
      lucideCheckCircle2,
      lucideDatabase,
      lucideRefreshCw,
      lucideFileText,
      lucideBarChart,
      lucideServer,
      lucideCloud,
      lucideNetwork,
      lucideTarget,
      lucideSearch,
      lucideLock,
      lucideShieldCheck,
      lucideAlertTriangle,
      lucideMail
    })
  ]
})
export class SocSolutionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private scrollTriggers: ScrollTrigger[] = [];
  private prefersReducedMotion = false;
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // What You Get - 5 outcomes
  readonly outcomes = [
    { key: 'continuousMonitoring', icon: 'lucideClock' },
    { key: 'fasterDetection', icon: 'lucideZap' },
    { key: 'reducedNoise', icon: 'lucideBarChart' },
    { key: 'expertRemediation', icon: 'lucideUsers' },
    { key: 'complianceSupport', icon: 'lucideAward' }
  ];

  // How It Works - 6-step workflow
  readonly workflowSteps = [
    { number: 1, key: 'step1', icon: 'lucideDatabase' },
    { number: 2, key: 'step2', icon: 'lucideActivity' },
    { number: 3, key: 'step3', icon: 'lucideBarChart' },
    { number: 4, key: 'step4', icon: 'lucideSearch' },
    { number: 5, key: 'step5', icon: 'lucideShieldCheck' },
    { number: 6, key: 'step6', icon: 'lucideFileText' }
  ];

  // SOC Packages - 5 tiers
  readonly packages = [
    { id: 'essential', badge: 'Foundational', color: 'blue' },
    { id: 'advanced', badge: 'Enhanced Visibility', color: 'cyan' },
    { id: 'mdr', badge: 'Active Containment', color: 'purple' },
    { id: 'xdr', badge: 'Unified Coverage', color: 'gradient' },
    { id: 'threatHunting', badge: 'Proactive', color: 'amber' }
  ];

  activePackage: string | null = null;

  togglePackage(id: string): void {
    this.activePackage = this.activePackage === id ? null : id;
  }

  // Integration Partners with logo paths
  readonly integrationPartners = [
    { key: 'paloAlto', logo: '/assets/images/logos/partners/security/palo-alto.svg' },
    { key: 'ibm', logo: '/assets/images/logos/partners/security/ibm-qradar.svg' },
    { key: 'splunk', logo: '/assets/images/logos/partners/security/splunk.svg' },
    { key: 'elastic', logo: '/assets/images/logos/partners/security/elastic.svg' },
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
    { key: 'nistSp800', icon: 'lucideFileText' }
  ];

  // Why Roaya - 5 differentiators
  readonly differentiators = [
    { key: 'provenExpertise' },
    { key: 'aiEnhanced' },
    { key: 'dataProtection' },
    { key: 'customizedDelivery' },
    { key: 'continuousImprovement' }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('24/7 Security Operations Center (SOC) Services - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: '24/7 Security Operations Center (SOC) services in Egypt. Managed SOC with AI-assisted detection, threat hunting, and incident response. NIST CSF and ISO 27001 aligned.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'SOC Egypt, Security Operations Center, managed SOC, 24/7 monitoring, threat detection, incident response, SIEM, XDR, MDR, NIST CSF, ISO 27001, MITRE ATT&CK, cybersecurity monitoring Egypt'
    });

    // Open Graph tags
    this.meta.updateTag({
      property: 'og:title',
      content: '24/7 Security Operations Center (SOC) Services - Roaya IT'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Managed SOC services with 24/7 monitoring, AI-assisted detection, and expert-led incident response. Stop chasing alerts. Focus on real risks.'
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

    // Animate outcomes cards
    const outcomes = gsap.utils.toArray('.outcome-card') as HTMLElement[];
    if (outcomes.length > 0) {
      gsap.set(outcomes, { opacity: 0, y: 40 });
      const trigger = ScrollTrigger.create({
        trigger: '.outcomes-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.to(outcomes, {
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

    // Animate workflow steps with timeline connector
    const steps = gsap.utils.toArray('.workflow-step') as HTMLElement[];
    if (steps.length > 0) {
      gsap.set(steps, { opacity: 0, scale: 0.9 });
      const trigger = ScrollTrigger.create({
        trigger: '.workflow-section',
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

    // Animate package cards
    const packages = gsap.utils.toArray('.package-card') as HTMLElement[];
    if (packages.length > 0) {
      gsap.set(packages, { opacity: 0, x: -30 });
      const trigger = ScrollTrigger.create({
        trigger: '.packages-section',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(packages, {
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
  }
}
