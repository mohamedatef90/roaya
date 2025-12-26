import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShield,
  lucideBug,
  lucideSearch,
  lucideFileText,
  lucideClipboardCheck,
  lucideRefreshCw,
  lucideLock,
  lucideServer,
  lucideCloud,
  lucideNetwork,
  lucideWifi,
  lucideMail,
  lucideCheckCircle2,
  lucideTarget,
  lucideShieldCheck,
  lucideGlobe,
  lucideSmartphone,
  lucideUsers,
  lucideBuilding,
  lucideFingerprint,
  lucideCreditCard,
  lucideScale,
  lucideCpu,
  lucideWrench,
  lucideChevronDown,
  lucideShieldAlert,
  lucideFileWarning,
  lucideExternalLink
} from '@ng-icons/lucide';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Penetration Testing & Security Assessment Sub-Page
 * Route: /services/security/penetration-testing
 * Parent: Security Service (/services/security)
 */
@Component({
  selector: 'app-penetration-testing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './penetration-testing.component.html',
  styleUrl: './penetration-testing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideShield,
      lucideBug,
      lucideSearch,
      lucideFileText,
      lucideClipboardCheck,
      lucideRefreshCw,
      lucideLock,
      lucideServer,
      lucideCloud,
      lucideNetwork,
      lucideWifi,
      lucideMail,
      lucideCheckCircle2,
      lucideTarget,
      lucideShieldCheck,
      lucideGlobe,
      lucideSmartphone,
      lucideUsers,
      lucideBuilding,
      lucideFingerprint,
      lucideCreditCard,
      lucideScale,
      lucideCpu,
      lucideWrench,
      lucideChevronDown,
      lucideShieldAlert,
      lucideFileWarning,
      lucideExternalLink
    })
  ]
})
export class PenetrationTestingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private scrollTriggers: ScrollTrigger[] = [];
  private prefersReducedMotion = false;
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // Active tab for services overview
  activeServiceTab = 'assessment';

  // Stats - 3 key metrics with numeric values for animation
  readonly stats = [
    { key: 'assessments', numericValue: 500, suffix: '+', icon: 'lucideClipboardCheck', benchmark: '3x' },
    { key: 'detection', numericValue: 99.8, suffix: '%', icon: 'lucideBug', benchmark: '+15%' },
    { key: 'turnaround', numericValue: 48, suffix: 'hr', icon: 'lucideRefreshCw', benchmark: '2x' }
  ];

  // Animated stat display values
  animatedStats: { [key: string]: string } = {
    assessments: '0',
    detection: '0',
    turnaround: '0'
  };

  // What You Get - 6 outcomes
  readonly outcomes = [
    { key: 'validatedRisk', icon: 'lucideShield' },
    { key: 'prioritizedRemediation', icon: 'lucideClipboardCheck' },
    { key: 'attackPath', icon: 'lucideSearch' },
    { key: 'controlConfidence', icon: 'lucideLock' },
    { key: 'auditReady', icon: 'lucideFileText' },
    { key: 'optionalRetest', icon: 'lucideRefreshCw' }
  ];

  // Services Overview - Tabs (Assessment vs Pen Test)
  readonly services = [
    { id: 'assessment' },
    { id: 'pentest' }
  ];

  // How We Test - 4-step process
  readonly processSteps = [
    { number: 1, key: 'scope' },
    { number: 2, key: 'test' },
    { number: 3, key: 'prioritize' },
    { number: 4, key: 'report' }
  ];

  // Service categories for filtering
  readonly serviceCategories = ['all', 'network', 'application', 'advanced', 'compliance'];
  activeServiceCategory = 'all';

  // Comprehensive Penetration Testing Services - 12 categories with category and popularity
  readonly pentestServices = [
    { key: 'networkPentest', icon: 'lucideNetwork', number: 1, category: 'network', mostRequested: true },
    { key: 'webAppPentest', icon: 'lucideGlobe', number: 2, category: 'application', mostRequested: true },
    { key: 'mobilePentest', icon: 'lucideSmartphone', number: 3, category: 'application', mostRequested: false },
    { key: 'cloudPentest', icon: 'lucideCloud', number: 4, category: 'network', mostRequested: true },
    { key: 'redTeam', icon: 'lucideTarget', number: 5, category: 'advanced', mostRequested: false },
    { key: 'socialEngineering', icon: 'lucideUsers', number: 6, category: 'advanced', mostRequested: false },
    { key: 'physicalSecurity', icon: 'lucideBuilding', number: 7, category: 'advanced', mostRequested: false },
    { key: 'activeDirectory', icon: 'lucideFingerprint', number: 8, category: 'network', mostRequested: false },
    { key: 'paymentSystems', icon: 'lucideCreditCard', number: 9, category: 'compliance', mostRequested: false },
    { key: 'compliance', icon: 'lucideScale', number: 10, category: 'compliance', mostRequested: false },
    { key: 'iotOt', icon: 'lucideCpu', number: 11, category: 'advanced', mostRequested: false },
    { key: 'postExploitation', icon: 'lucideWrench', number: 12, category: 'advanced', mostRequested: false }
  ];

  // Get filtered services based on active category
  get filteredPentestServices() {
    if (this.activeServiceCategory === 'all') {
      return this.pentestServices;
    }
    return this.pentestServices.filter(s => s.category === this.activeServiceCategory);
  }

  // Track expanded service cards
  expandedServiceKey: string | null = null;

  toggleServiceExpand(key: string): void {
    this.expandedServiceKey = this.expandedServiceKey === key ? null : key;
  }

  // Reporting Components - 4 deliverables
  readonly reportingComponents = [
    { key: 'executiveSummary', icon: 'lucideFileText' },
    { key: 'technicalFindings', icon: 'lucideBug' },
    { key: 'remediationPlan', icon: 'lucideClipboardCheck' },
    { key: 'attackPathNarratives', icon: 'lucideSearch' }
  ];

  // Standards Alignment - 4 frameworks
  readonly standards = [
    { key: 'nistCsf' },
    { key: 'iso27001' },
    { key: 'mitreAttack' },
    { key: 'cisControls' }
  ];

  // Why Roaya - 5 differentiators
  readonly differentiators = [
    { key: 'outcomeLed' },
    { key: 'expertLed' },
    { key: 'aiAccelerated' },
    { key: 'secureHandling' },
    { key: 'crossDomain' }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Penetration Testing & Security Assessment Services - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Professional penetration testing and security assessments in Egypt. Expert-led validation with AI-accelerated analysis. Reduce real risk fast with NIST-aligned testing methodology.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'penetration testing Egypt, security assessment, vulnerability assessment, ethical hacking Egypt, penetration testing services, NIST CSF, ISO 27001, MITRE ATT&CK, web application pen testing, network security testing, cloud security assessment'
    });

    // Open Graph tags
    this.meta.updateTag({
      property: 'og:title',
      content: 'Penetration Testing & Security Assessment Services - Roaya IT'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Expert-led penetration testing and security assessments. Human-led, AI-accelerated analysis for faster, more accurate vulnerability detection.'
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
    this.initWhyItMattersAnimations();
    this.initStatsCounterAnimation();
  }

  ngOnDestroy(): void {
    // Clean up all ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];
  }

  /**
   * Initialize stagger reveal animation for "Why It Matters" section
   */
  private initWhyItMattersAnimations(): void {
    if (this.prefersReducedMotion) return;

    const elements = gsap.utils.toArray('.why-matters-item') as HTMLElement[];

    if (elements.length === 0) return;

    // Set initial state
    gsap.set(elements, { opacity: 0, y: 40 });

    const trigger = ScrollTrigger.create({
      trigger: '.why-pentest-matters-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.to(elements, {
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

  /**
   * Initialize animated counter for stats section
   */
  private initStatsCounterAnimation(): void {
    if (this.prefersReducedMotion) {
      // If reduced motion, just set final values
      this.stats.forEach(stat => {
        this.animatedStats[stat.key] = stat.numericValue.toString();
      });
      return;
    }

    const statElements = document.querySelectorAll('.stat-card');
    if (statElements.length === 0) return;

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
              // Format based on whether it's a decimal or integer
              if (stat.key === 'detection') {
                this.animatedStats[stat.key] = obj.value.toFixed(1);
              } else {
                this.animatedStats[stat.key] = Math.round(obj.value).toString();
              }
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
