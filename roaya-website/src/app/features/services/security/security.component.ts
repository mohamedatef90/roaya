import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Security (Cybersecurity) Service Standalone Component
 * Dedicated component for Cybersecurity Solutions & Threat Protection service
 * Route: /services/security
 */
@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
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
export class SecurityComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // Service icon path
  readonly iconPath = '/assets/images/icons/services/security.svg';

  // Active tab for Concept 3 (Tabbed Interface)
  activeSolutionTab = 'soc';

  // Cybersecurity Outcomes - Key business outcomes (using translation keys)
  readonly outcomes = [
    { key: 'reducedRisk', icon: 'faCircle' },
    { key: 'fasterDetection', icon: 'faClock' },
    { key: 'rapidResponse', icon: 'faLightbulb' },
    { key: 'compliance', icon: 'faCircleCheck' },
    { key: 'resilience', icon: 'faSquareCheck' }
  ];

  // Solutions at a Glance - 3 main service areas (using translation keys)
  readonly solutions = [
    { id: 'soc', icon: 'faClock', image: '/assets/images/services/security/soc.png' },
    { id: 'pentest', icon: 'faSquareCheck', image: '/assets/images/services/security/pentest.png' },
    { id: 'incidentResponse', icon: 'faLightbulb', image: '/assets/images/services/security/incident-response.png' }
  ];

  // Technology Partners - Best-in-class platforms (using translation keys)
  readonly technologyPartners = [
    { key: 'paloAlto', logo: '/assets/images/logos/partners/security/palo-alto.svg' },
    { key: 'splunk', logo: '/assets/images/logos/partners/security/splunk.svg' },
    { key: 'elastic', logo: '/assets/images/logos/partners/security/elastic.svg' },
    { key: 'crowdstrike', logo: '/assets/images/logos/partners/security/crowdstrike.svg' },
    { key: 'fortinet', logo: '/assets/images/logos/partners/security/fortinet.svg' },
    { key: 'kaspersky', logo: '/assets/images/logos/partners/security/kaspersky.svg' },
    { key: 'f5', logo: '/assets/images/logos/partners/security/f5.svg' },
    { key: 'nessus', logo: '/assets/images/logos/partners/security/nessus.svg' }
  ];

  // Global Frameworks - Aligned with recognized standards (using translation keys)
  readonly frameworks = [
    { key: 'nistCsf' },
    { key: 'nist80061' },
    { key: 'iso27001' },
    { key: 'mitreAttack' },
    { key: 'cis' }
  ];

  // Why Roaya - Differentiators (using translation keys)
  readonly differentiators = [
    { key: 'expertise' },
    { key: 'aiHuman' },
    { key: 'vendorAgnostic' },
    { key: 'outcomeFocused' }
  ];

  // Industries Served (using translation keys)
  readonly industries = [
    { id: 'finance', icon: 'faBuilding' },
    { id: 'healthcare', icon: 'faBuilding' },
    { id: 'telecom', icon: 'faBuilding' },
    { id: 'government', icon: 'faBuilding' },
    { id: 'manufacturing', icon: 'faBuilding' },
    { id: 'retail', icon: 'faBuilding' }
  ];

  // Pricing tiers (using translation keys)
  readonly pricingTiers = [
    { key: 'essential', features: [1, 2, 3, 4], popular: false, custom: false },
    { key: 'advanced', features: [1, 2, 3, 4, 5], popular: true, custom: false },
    { key: 'enterprise', features: [1, 2, 3, 4, 5], popular: false, custom: true }
  ];

  // Related services (using translation keys)
  readonly relatedServices = [
    { id: 'cloud', route: '/services/cloud', iconSvg: '/assets/images/icons/services/cloud.svg' },
    { id: 'managed', route: '/services/managed', iconSvg: '/assets/images/icons/services/managed.svg' },
    { id: 'backup', route: '/services/backup', iconSvg: '/assets/images/icons/services/backup.svg' }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('Cybersecurity Services Built for Real-World Threats - Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Protect, detect, and respond to cyber threats with enterprise-grade cybersecurity solutions in Egypt and MENA. 24/7 SOC monitoring, AI-accelerated threat detection, and NIST-aligned incident response.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'Cybersecurity Egypt, MENA Cybersecurity, SOC Services, Penetration Testing, NIST Framework, ISO 27001, Incident Response, AI Threat Detection, Palo Alto Cortex XSIAM'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Cybersecurity Services Built for Real-World Threats - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise-grade cybersecurity with 24/7 SOC, AI-accelerated threat detection, and privacy-preserving infrastructure.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Run outside Angular zone for better performance
      this.ngZone.runOutsideAngular(() => {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Hero parallax - background moves slower than content
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

        // Hero content parallax - moves up and fades as you scroll
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

        // Threats section - fade in with slide up
        gsap.fromTo('.threats-parallax',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.threats-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Outcomes cards - staggered reveal with scale
        gsap.utils.toArray('.outcome-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 80, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              delay: i * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.outcomes-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Solutions section header
        gsap.fromTo('.solutions-header',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.solutions-section',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Solutions tab buttons - stagger
        gsap.fromTo('.solution-tab',
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.5,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.solutions-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Solutions content - slide in
        gsap.fromTo('.solution-content',
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.solutions-section',
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Partners section - cards float up with stagger
        gsap.fromTo('.partner-parallax',
          { y: 40, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.partners-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Frameworks section - slide in with rotation
        gsap.utils.toArray('.framework-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 50, opacity: 0, rotate: i % 2 === 0 ? -2 : 2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Why Roaya section - cards with depth
        gsap.utils.toArray('.diff-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 60, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              delay: i * 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.whyroaya-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Industries section - chips float up
        gsap.fromTo('.industry-parallax',
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.06,
            duration: 0.4,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.industries-section',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Related services - cascade effect
        gsap.fromTo('.related-parallax',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.related-section',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Final CTA section - zoom in effect
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

        // Security shield glow - continuous floating animation
        gsap.to('.security-shield-glow', {
          y: -10,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clean up all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
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
