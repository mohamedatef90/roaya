import { Component, signal, computed, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { filter, take } from 'rxjs/operators';
import { ScrollSmootherService } from '../../core/services/scroll-smoother.service';
import { LoadingService } from '../../core/services/loading.service';
// Font Awesome Regular (outline style) icons
import {
  faCircleCheck,
  faCreditCard,
  faFlag,
  faFileLines
} from '@ng-icons/font-awesome/regular';
// Lucide icons for new sections
import {
  lucidePhone,
  lucideFileText,
  lucideRocket,
  lucideHeadphones,
  lucideLandmark,
  lucideHeart,
  lucideBuilding2,
  lucideFactory,
  lucideShoppingCart,
  lucideGraduationCap,
  lucideShield,
  lucideAward,
  lucideCheckCircle,
  lucideGlobe,
  lucideLock,
  lucideEye,
  lucideChevronDown,
  lucideArrowRight,
  lucideQuote,
  lucideStar
} from '@ng-icons/lucide';
import { NavigationService } from '../../core/services/navigation.service';
import { CardStackComponent } from '../../shared/components/card-stack';
import type { StackCard } from '../../shared/components/card-stack';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  current: number;
}

interface ProcessStep {
  id: string;
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
  duration: string;
}

interface Industry {
  id: string;
  icon: string;
  name: string;
  description: string;
  clientCount: string;
  route: string;
}

interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  companyName: string;
  industry: string;
  rating: number;
  metric?: string;
  metricValue?: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface CaseStudyPreview {
  id: string;
  slug: string;
  title: string;
  company: string;
  industry: string;
  metric: string;
  metricValue: string;
  summary: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon, CardStackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [
    provideIcons({
      faCircleCheck,
      faCreditCard,
      faFlag,
      faFileLines,
      lucidePhone,
      lucideFileText,
      lucideRocket,
      lucideHeadphones,
      lucideLandmark,
      lucideHeart,
      lucideBuilding2,
      lucideFactory,
      lucideShoppingCart,
      lucideGraduationCap,
      lucideShield,
      lucideAward,
      lucideCheckCircle,
      lucideGlobe,
      lucideLock,
      lucideEye,
      lucideChevronDown,
      lucideArrowRight,
      lucideQuote,
      lucideStar
    })
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('statsSection') statsSection!: ElementRef;
  @ViewChild('servicesSection') servicesSection!: ElementRef;
  @ViewChild('introOverlay') introOverlay!: ElementRef;

  readonly navigationService = inject(NavigationService);
  private readonly scrollSmootherService = inject(ScrollSmootherService);
  private readonly loadingService = inject(LoadingService);
  private readonly translateService = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  private scrollTriggers: ScrollTrigger[] = [];
  prefersReducedMotion = signal(false);

  // Animation state (kept for GSAP scroll animations)
  heroAnimationsStarted = signal(true); // Auto-enabled since CSS handles intro

  // Stats with animated counters
  stats = signal<Stat[]>([
    { value: 150, suffix: '+', label: 'home.stats.clients', current: 0 },
    { value: 99.9, suffix: '%', label: 'home.stats.uptime', current: 0 },
    { value: 24, suffix: '/7', label: 'home.stats.support', current: 0 },
    { value: 10, suffix: '+', label: 'home.stats.experience', current: 0 }
  ]);

  // Trusted by logos - Real client logos
  trustedLogos = [
    {
      name: 'Misr Insurance',
      logo: '/assets/images/logos/clients/misr-logo.webp',
      nameAr: 'مصر للتأمين'
    },
    {
      name: 'Elsewedy Electric',
      logo: '/assets/images/logos/clients/Elsewedy-EMG-logo-01-e1528629466548.png',
      nameAr: 'السويدي إلكتريك'
    },
    {
      name: 'Dorra Group',
      logo: '/assets/images/logos/clients/Dorra-group-logo.png',
      nameAr: 'مجموعة درة'
    },
    {
      name: 'Cleopatra Group',
      logo: '/assets/images/logos/clients/logo-cleopatra.png',
      nameAr: 'مجموعة كليوباترا'
    },
    {
      name: '2B Computer',
      logo: '/assets/images/logos/clients/208-2086972_1-2b-computer-logo-2b-computer-logo-hd.png',
      nameAr: '2B كمبيوتر'
    },
    {
      name: 'Egyptian Banking Corporation',
      logo: '/assets/images/logos/clients/637187487380375480.jpg',
      nameAr: 'البنك المصري'
    }
  ];

  // Features/benefits - using Font Awesome Regular (outline) icons
  features = [
    {
      icon: 'faCircleCheck',
      title: 'home.features.security.title',
      description: 'home.features.security.description'
    },
    {
      icon: 'faCreditCard',
      title: 'home.features.pricing.title',
      description: 'home.features.pricing.description'
    },
    {
      icon: 'faFlag',
      title: 'home.features.local.title',
      description: 'home.features.local.description'
    },
    {
      icon: 'faFileLines',
      title: 'home.features.sla.title',
      description: 'home.features.sla.description'
    }
  ];

  // Featured services for section-based layout (top 4 services)
  featuredServices = [
    {
      id: 'cloud',
      badge: 'home.featuredServices.cloud.badge',
      title: 'services.cloud.title',
      description: 'services.cloud.fullDescription',
      features: [
        'services.cloud.features.infrastructure',
        'services.cloud.features.migration',
        'services.cloud.features.optimization'
      ],
      iconSvg: '/assets/images/icons/services/cloud.svg',
      illustrationSvg: '/assets/images/illustrations/cloud-illustration.svg',
      route: '/services/cloud',
      gradient: 'from-primary-500 to-secondary-500'
    },
    {
      id: 'security',
      badge: 'home.featuredServices.security.badge',
      title: 'services.security.title',
      description: 'services.security.fullDescription',
      features: [
        'services.security.features.soc',
        'services.security.features.assessment',
        'services.security.features.compliance'
      ],
      iconSvg: '/assets/images/icons/services/security.svg',
      illustrationSvg: '/assets/images/illustrations/security-illustration.svg',
      route: '/services/security',
      gradient: 'from-accent-500 to-primary-500'
    },
    {
      id: 'email',
      badge: 'home.featuredServices.email.badge',
      title: 'services.email.title',
      description: 'services.email.fullDescription',
      features: [
        'services.email.features.hosting',
        'services.email.features.security',
        'services.email.features.collaboration'
      ],
      iconSvg: '/assets/images/icons/services/email.svg',
      illustrationSvg: '/assets/images/illustrations/email-illustration.svg',
      route: '/services/email',
      gradient: 'from-secondary-500 to-primary-500'
    },
    {
      id: 'managed',
      badge: 'home.featuredServices.managed.badge',
      title: 'services.managed.title',
      description: 'services.managed.fullDescription',
      features: [
        'services.managed.features.monitoring',
        'services.managed.features.support',
        'services.managed.features.maintenance'
      ],
      iconSvg: '/assets/images/icons/services/managed.svg',
      illustrationSvg: '/assets/images/illustrations/managed-illustration.svg',
      route: '/services/managed',
      gradient: 'from-primary-600 to-accent-500'
    }
  ];

  // Services cards for ineo-sense style stacking effect
  servicesStackCards: StackCard[] = [
    {
      id: 'cloud-service',
      subtitle: 'home.featuredServices.cloud.badge',
      title: 'services.cloud.title',
      description: 'services.cloud.fullDescription',
      features: [
        'services.cloud.features.infrastructure',
        'services.cloud.features.migration',
        'services.cloud.features.optimization'
      ],
      link: '/services/cloud',
      linkText: 'common.learnMore',
      image: '/assets/images/icons/services/cloud.svg',
      gradient: 'primary-to-secondary'
    },
    {
      id: 'security-service',
      subtitle: 'home.featuredServices.security.badge',
      title: 'services.security.title',
      description: 'services.security.fullDescription',
      features: [
        'services.security.features.soc',
        'services.security.features.assessment',
        'services.security.features.compliance'
      ],
      link: '/services/security',
      linkText: 'common.learnMore',
      image: '/assets/images/icons/services/security.svg',
      gradient: 'accent-to-primary'
    },
    {
      id: 'email-service',
      subtitle: 'home.featuredServices.email.badge',
      title: 'services.email.title',
      description: 'services.email.fullDescription',
      features: [
        'services.email.features.hosting',
        'services.email.features.security',
        'services.email.features.collaboration'
      ],
      link: '/services/email',
      linkText: 'common.learnMore',
      image: '/assets/images/icons/services/email.svg',
      gradient: 'secondary-to-primary'
    },
    {
      id: 'managed-service',
      subtitle: 'home.featuredServices.managed.badge',
      title: 'services.managed.title',
      description: 'services.managed.fullDescription',
      features: [
        'services.managed.features.monitoring',
        'services.managed.features.support',
        'services.managed.features.maintenance'
      ],
      link: '/services/managed',
      linkText: 'common.learnMore',
      image: '/assets/images/icons/services/managed.svg',
      gradient: 'primary-to-accent'
    }
  ];

  // Expertise cards for ineo-sense style stacking effect
  expertiseCards: StackCard[] = [
    {
      id: 'cloud-expertise',
      subtitle: 'home.expertise.cloud.subtitle',
      title: 'home.expertise.cloud.title',
      description: 'home.expertise.cloud.description',
      features: [
        'home.expertise.cloud.feature1',
        'home.expertise.cloud.feature2',
        'home.expertise.cloud.feature3'
      ],
      link: '/services/cloud',
      linkText: 'home.expertise.learnMore',
      backgroundColor: 'rgb(255, 255, 255)',
      icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
    },
    {
      id: 'security-expertise',
      subtitle: 'home.expertise.security.subtitle',
      title: 'home.expertise.security.title',
      description: 'home.expertise.security.description',
      features: [
        'home.expertise.security.feature1',
        'home.expertise.security.feature2',
        'home.expertise.security.feature3'
      ],
      link: '/services/security',
      linkText: 'home.expertise.learnMore',
      backgroundColor: 'rgb(216, 241, 238)',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
      id: 'email-expertise',
      subtitle: 'home.expertise.email.subtitle',
      title: 'home.expertise.email.title',
      description: 'home.expertise.email.description',
      features: [
        'home.expertise.email.feature1',
        'home.expertise.email.feature2',
        'home.expertise.email.feature3'
      ],
      link: '/services/email',
      linkText: 'home.expertise.learnMore',
      backgroundColor: 'rgb(213, 240, 237)',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      id: 'managed-expertise',
      subtitle: 'home.expertise.managed.subtitle',
      title: 'home.expertise.managed.title',
      description: 'home.expertise.managed.description',
      features: [
        'home.expertise.managed.feature1',
        'home.expertise.managed.feature2',
        'home.expertise.managed.feature3'
      ],
      link: '/services/managed',
      linkText: 'home.expertise.learnMore',
      backgroundColor: 'rgb(199, 235, 231)',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  // How It Works - Process Steps
  processSteps: ProcessStep[] = [
    {
      id: 'discovery',
      stepNumber: 1,
      icon: 'lucidePhone',
      title: 'home.process.step1.title',
      description: 'home.process.step1.description',
      duration: 'home.process.step1.duration'
    },
    {
      id: 'proposal',
      stepNumber: 2,
      icon: 'lucideFileText',
      title: 'home.process.step2.title',
      description: 'home.process.step2.description',
      duration: 'home.process.step2.duration'
    },
    {
      id: 'implementation',
      stepNumber: 3,
      icon: 'lucideRocket',
      title: 'home.process.step3.title',
      description: 'home.process.step3.description',
      duration: 'home.process.step3.duration'
    },
    {
      id: 'support',
      stepNumber: 4,
      icon: 'lucideHeadphones',
      title: 'home.process.step4.title',
      description: 'home.process.step4.description',
      duration: 'home.process.step4.duration'
    }
  ];

  // Industries Preview
  industries: Industry[] = [
    {
      id: 'finance',
      icon: 'lucideLandmark',
      name: 'home.industries.finance.name',
      description: 'home.industries.finance.description',
      clientCount: 'home.industries.finance.clients',
      route: '/industries/finance'
    },
    {
      id: 'healthcare',
      icon: 'lucideHeart',
      name: 'home.industries.healthcare.name',
      description: 'home.industries.healthcare.description',
      clientCount: 'home.industries.healthcare.clients',
      route: '/industries/healthcare'
    },
    {
      id: 'government',
      icon: 'lucideBuilding2',
      name: 'home.industries.government.name',
      description: 'home.industries.government.description',
      clientCount: 'home.industries.government.clients',
      route: '/industries/government'
    },
    {
      id: 'manufacturing',
      icon: 'lucideFactory',
      name: 'home.industries.manufacturing.name',
      description: 'home.industries.manufacturing.description',
      clientCount: 'home.industries.manufacturing.clients',
      route: '/industries/manufacturing'
    },
    {
      id: 'retail',
      icon: 'lucideShoppingCart',
      name: 'home.industries.retail.name',
      description: 'home.industries.retail.description',
      clientCount: 'home.industries.retail.clients',
      route: '/industries/retail'
    },
    {
      id: 'education',
      icon: 'lucideGraduationCap',
      name: 'home.industries.education.name',
      description: 'home.industries.education.description',
      clientCount: 'home.industries.education.clients',
      route: '/industries/education'
    }
  ];

  // Testimonials
  testimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      quote: 'home.testimonials.testimonial1.quote',
      clientName: 'home.testimonials.testimonial1.name',
      clientTitle: 'home.testimonials.testimonial1.title',
      companyName: 'home.testimonials.testimonial1.company',
      industry: 'home.testimonials.testimonial1.industry',
      rating: 5,
      metric: 'home.testimonials.testimonial1.metric',
      metricValue: '87%'
    },
    {
      id: 'testimonial-2',
      quote: 'home.testimonials.testimonial2.quote',
      clientName: 'home.testimonials.testimonial2.name',
      clientTitle: 'home.testimonials.testimonial2.title',
      companyName: 'home.testimonials.testimonial2.company',
      industry: 'home.testimonials.testimonial2.industry',
      rating: 5,
      metric: 'home.testimonials.testimonial2.metric',
      metricValue: '99.98%'
    },
    {
      id: 'testimonial-3',
      quote: 'home.testimonials.testimonial3.quote',
      clientName: 'home.testimonials.testimonial3.name',
      clientTitle: 'home.testimonials.testimonial3.title',
      companyName: 'home.testimonials.testimonial3.company',
      industry: 'home.testimonials.testimonial3.industry',
      rating: 5,
      metric: 'home.testimonials.testimonial3.metric',
      metricValue: '42%'
    }
  ];

  // Security Certifications
  certifications: Certification[] = [
    {
      id: 'iso27001',
      name: 'home.security.certifications.iso27001.name',
      description: 'home.security.certifications.iso27001.description',
      icon: 'lucideShield'
    },
    {
      id: 'iso9001',
      name: 'home.security.certifications.iso9001.name',
      description: 'home.security.certifications.iso9001.description',
      icon: 'lucideAward'
    },
    {
      id: 'gdpr',
      name: 'home.security.certifications.gdpr.name',
      description: 'home.security.certifications.gdpr.description',
      icon: 'lucideGlobe'
    },
    {
      id: 'soc2',
      name: 'home.security.certifications.soc2.name',
      description: 'home.security.certifications.soc2.description',
      icon: 'lucideCheckCircle'
    }
  ];

  // Security Guarantees
  securityGuarantees = [
    {
      id: 'data-sovereignty',
      icon: 'lucideLock',
      title: 'home.security.guarantees.sovereignty.title',
      description: 'home.security.guarantees.sovereignty.description'
    },
    {
      id: 'encryption',
      icon: 'lucideShield',
      title: 'home.security.guarantees.encryption.title',
      description: 'home.security.guarantees.encryption.description'
    },
    {
      id: 'monitoring',
      icon: 'lucideEye',
      title: 'home.security.guarantees.monitoring.title',
      description: 'home.security.guarantees.monitoring.description'
    }
  ];

  // Case Studies Preview
  caseStudiesPreview: CaseStudyPreview[] = [
    {
      id: 'case-1',
      slug: 'national-bank-cloud-migration',
      title: 'home.caseStudies.case1.title',
      company: 'home.caseStudies.case1.company',
      industry: 'home.caseStudies.case1.industry',
      metric: 'home.caseStudies.case1.metric',
      metricValue: '42%',
      summary: 'home.caseStudies.case1.summary'
    },
    {
      id: 'case-2',
      slug: 'healthcare-network-security',
      title: 'home.caseStudies.case2.title',
      company: 'home.caseStudies.case2.company',
      industry: 'home.caseStudies.case2.industry',
      metric: 'home.caseStudies.case2.metric',
      metricValue: '99.99%',
      summary: 'home.caseStudies.case2.summary'
    },
    {
      id: 'case-3',
      slug: 'manufacturing-it-automation',
      title: 'home.caseStudies.case3.title',
      company: 'home.caseStudies.case3.company',
      industry: 'home.caseStudies.case3.industry',
      metric: 'home.caseStudies.case3.metric',
      metricValue: '60%',
      summary: 'home.caseStudies.case3.summary'
    }
  ];

  // FAQ Preview
  faqs = signal<FAQ[]>([
    {
      id: 'faq-1',
      question: 'home.faq.q1.question',
      answer: 'home.faq.q1.answer',
      isOpen: false
    },
    {
      id: 'faq-2',
      question: 'home.faq.q2.question',
      answer: 'home.faq.q2.answer',
      isOpen: false
    },
    {
      id: 'faq-3',
      question: 'home.faq.q3.question',
      answer: 'home.faq.q3.answer',
      isOpen: false
    },
    {
      id: 'faq-4',
      question: 'home.faq.q4.question',
      answer: 'home.faq.q4.answer',
      isOpen: false
    }
  ]);

  // Current testimonial index for carousel
  currentTestimonialIndex = signal(0);

  // Animation pause controls
  isMarqueePaused = signal(false);
  isTestimonialPaused = signal(false);

  private animationInterval: ReturnType<typeof setInterval> | null = null;
  private testimonialInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // Stats animation will be handled by GSAP in AfterViewInit
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check for reduced motion preference
    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    // Intro animation is now handled by pure CSS

    if (!this.prefersReducedMotion()) {
      // Wait for ScrollSmoother to be ready before initializing GSAP animations
      this.scrollSmootherService.smootherReady$
        .pipe(
          filter(ready => ready),
          take(1)
        )
        .subscribe(() => {
          // Small delay to ensure ScrollSmoother is fully initialized
          setTimeout(() => {
            this.initAnimations();
            this.startTestimonialAutoRotation();
          }, 50);
        });

      // Fallback: If ScrollSmoother isn't ready within 500ms, init anyway
      setTimeout(() => {
        if (!this.scrollSmootherService.isReady()) {
          this.initAnimations();
          this.startTestimonialAutoRotation();
        }
      }, 500);
    } else {
      // If reduced motion, set stats to final values
      this.stats.update(stats =>
        stats.map(stat => ({
          ...stat,
          current: stat.value
        }))
      );
    }
  }

  ngOnDestroy(): void {
    // Clean up all ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  // Toggle FAQ accordion
  toggleFaq(faqId: string): void {
    this.faqs.update(faqs =>
      faqs.map(faq => ({
        ...faq,
        isOpen: faq.id === faqId ? !faq.isOpen : false
      }))
    );
  }

  // Navigate testimonials
  nextTestimonial(): void {
    this.currentTestimonialIndex.update(index =>
      (index + 1) % this.testimonials.length
    );
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex.update(index =>
      index === 0 ? this.testimonials.length - 1 : index - 1
    );
  }

  goToTestimonial(index: number): void {
    this.currentTestimonialIndex.set(index);
  }

  // Start testimonial auto-rotation
  private startTestimonialAutoRotation(): void {
    this.testimonialInterval = setInterval(() => {
      this.nextTestimonial();
    }, 5000); // Change every 5 seconds
  }

  // Toggle marquee pause
  toggleMarqueePause(): void {
    this.isMarqueePaused.update(paused => !paused);
  }

  // Toggle testimonial pause
  toggleTestimonialPause(): void {
    this.isTestimonialPaused.update(paused => !paused);
    if (this.isTestimonialPaused()) {
      this.pauseTestimonialRotation();
    } else {
      this.resumeTestimonialRotation();
    }
  }

  // Pause testimonial rotation on hover
  pauseTestimonialRotation(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
      this.testimonialInterval = null;
    }
  }

  resumeTestimonialRotation(): void {
    if (!this.testimonialInterval && !this.prefersReducedMotion() && !this.isTestimonialPaused()) {
      this.startTestimonialAutoRotation();
    }
  }

  private initAnimations(): void {
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animations
    const heroTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    heroTimeline
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.3')
      .from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.4')
      .from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.3')
      .from('.hero-trust', {
        opacity: 0,
        y: 15,
        duration: 0.5
      }, '-=0.3')
      .from('.hero-visual', {
        opacity: 0,
        scale: 0.9,
        duration: 1
      }, '-=0.8');

    // Floating animation for 3D elements
    gsap.to('.float-element', {
      y: -15,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    // Parallax effect on hero background elements
    gsap.to('.parallax-slow', {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.parallax-fast', {
      y: 200,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Stats counter animation with scroll trigger
    const statsTrigger = ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 80%',
      onEnter: () => {
        this.animateStatsCounters();
      },
      once: true
    });
    this.scrollTriggers.push(statsTrigger);

    // Why Roaya feature cards stagger
    const featuresTrigger = ScrollTrigger.create({
      trigger: '.features-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.feature-card', {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        });
      },
      once: true
    });
    this.scrollTriggers.push(featuresTrigger);

    // Service sections stagger animation
    const servicesSections = document.querySelectorAll('.service-section');
    servicesSections.forEach((section, index) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        onEnter: () => {
          gsap.from(section.querySelector('.service-content'), {
            opacity: 0,
            x: index % 2 === 0 ? -40 : 0,
            duration: 0.8,
            ease: 'power3.out'
          });
          gsap.from(section.querySelector('.service-visual'), {
            opacity: 0,
            x: index % 2 === 0 ? 0 : 40,
            scale: 0.95,
            duration: 0.8,
            ease: 'power3.out'
          });
        },
        once: true
      });
      this.scrollTriggers.push(trigger);
    });

    // Process steps (How It Works) animation
    const processTrigger = ScrollTrigger.create({
      trigger: '.process-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.process-step', {
          opacity: 0,
          y: 50,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power3.out'
        });
        // Animate connecting lines
        gsap.from('.process-connector', {
          scaleX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 0.3
        });
      },
      once: true
    });
    this.scrollTriggers.push(processTrigger);

    // Industries grid animation
    const industriesTrigger = ScrollTrigger.create({
      trigger: '.industries-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.fromTo('.industry-card',
          {
            opacity: 0,
            y: 40,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: {
              each: 0.1,
              from: 'start',
              grid: [2, 3]
            },
            ease: 'power3.out'
          }
        );
      },
      once: true
    });
    this.scrollTriggers.push(industriesTrigger);

    // Security section animation
    const securityTrigger = ScrollTrigger.create({
      trigger: '.security-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.certification-badge', {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        });
        gsap.from('.security-guarantee', {
          opacity: 0,
          x: -30,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3
        });
      },
      once: true
    });
    this.scrollTriggers.push(securityTrigger);

    // Testimonials animation
    const testimonialsTrigger = ScrollTrigger.create({
      trigger: '.testimonials-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.testimonial-card', {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out'
        });
      },
      once: true
    });
    this.scrollTriggers.push(testimonialsTrigger);

    // Case studies animation
    const caseStudiesTrigger = ScrollTrigger.create({
      trigger: '.case-studies-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.fromTo('.case-study-card',
          {
            opacity: 0,
            y: 40
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out'
          }
        );
      },
      once: true
    });
    this.scrollTriggers.push(caseStudiesTrigger);

    // FAQ section animation
    const faqTrigger = ScrollTrigger.create({
      trigger: '.faq-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.faq-item', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out'
        });
      },
      once: true
    });
    this.scrollTriggers.push(faqTrigger);
  }

  private animateStatsCounters(): void {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    this.animationInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      this.stats.update(stats =>
        stats.map(stat => ({
          ...stat,
          current: Math.round(stat.value * easeOutProgress * 10) / 10
        }))
      );

      if (currentStep >= steps) {
        if (this.animationInterval) {
          clearInterval(this.animationInterval);
        }
      }
    }, stepDuration);
  }

  // Magnetic hover effect for buttons
  onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
    if (this.prefersReducedMotion()) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  onButtonMouseLeave(element: HTMLElement): void {
    if (this.prefersReducedMotion()) return;

    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  getServices() {
    return this.navigationService.getServiceItems();
  }

  // Scroll to next section (Stats) from hero
  scrollToNextSection(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      statsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
