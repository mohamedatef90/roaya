import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faCircleCheck,
  faBuilding,
  faEnvelope,
  faSquareCheck,
  faCircle,
  faClock,
  faLightbulb,
  faCalendarDays,
  faHardDrive
} from '@ng-icons/font-awesome/regular';
import {
  faSolidShieldHalved,
  faSolidBoxArchive,
  faSolidCloud,
  faSolidGlobe,
  faSolidCode
} from '@ng-icons/font-awesome/solid';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * WorldPosta Services Standalone Component
 * Comprehensive WorldPosta cloud services including Posta, CloudEdge, and CloudSpace
 * Route: /services/worldposta
 */
@Component({
  selector: 'app-worldposta',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './worldposta.component.html',
  styleUrl: './worldposta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faEnvelope,
      faSquareCheck,
      faCircle,
      faClock,
      faLightbulb,
      faCalendarDays,
      faHardDrive,
      faCode: faSolidCode,
      faShieldHalved: faSolidShieldHalved,
      faBoxArchive: faSolidBoxArchive,
      faCloud: faSolidCloud,
      faGlobe: faSolidGlobe
    })
  ]
})
export class WorldpostaComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // WorldPosta logo path
  readonly logoPath = '/assets/images/logos/partners/worldposta.png';
  readonly wpIconPath = '/assets/images/logos/partners/WP-icon.png';

  // Statistics - Key performance metrics
  readonly statistics = [
    {
      value: '99.95%',
      label: 'Platform Uptime',
      description: 'Enterprise-grade reliability guaranteed'
    },
    {
      value: '$1.50',
      label: 'Starting Price',
      description: 'Per user/month for business email'
    },
    {
      value: '50GB+',
      label: 'Storage Per User',
      description: 'Expandable cloud storage included'
    }
  ];

  // WorldPosta Products - 3 main products
  readonly products = [
    {
      id: 'posta',
      name: 'Posta',
      tagline: 'Professional Business Email',
      icon: 'faEnvelope',
      logo: '/assets/images/worldposta/Posta.png',
      description: 'Enterprise-grade email hosting with advanced security, collaboration tools, and full Microsoft Outlook compatibility.',
      features: [
        'Custom domain email (@yourcompany.com)',
        'Microsoft Outlook & mobile app support',
        '99.95% uptime SLA',
        'Advanced spam & malware protection',
        'Email archiving & compliance',
        'Shared calendars & contacts'
      ],
      color: 'worldposta-green'
    },
    {
      id: 'cloudedge',
      name: 'CloudEdge',
      tagline: 'Secure Cloud Storage',
      icon: 'faCloud',
      logo: '/assets/images/worldposta/CloudEdge.png',
      description: 'Enterprise cloud storage with file sync, sharing, and collaboration features for teams of any size.',
      features: [
        'Secure file storage & sync',
        'Team collaboration tools',
        'File versioning & recovery',
        'Advanced sharing controls',
        'Mobile & desktop apps',
        'Integration with productivity tools'
      ],
      color: 'worldposta-blue'
    },
    {
      id: 'cloudspace',
      name: 'CloudSpace',
      tagline: 'No-Code App Builder',
      icon: 'faCode',
      logo: '/assets/images/worldposta/CloudSpace.png',
      description: 'Build custom business applications without coding. Create forms, workflows, and automate processes.',
      features: [
        'Drag-and-drop app builder',
        'Custom forms & workflows',
        'Database management',
        'API integrations',
        'Team collaboration',
        'Mobile-responsive apps'
      ],
      color: 'worldposta-purple'
    }
  ];

  // Advanced Products - Infrastructure & Security
  readonly advancedProducts = [
    {
      id: 'vdc',
      name: 'Virtual Data Centre',
      nameKey: 'services.worldposta.vdc.name',
      tagline: 'services.worldposta.vdc.tagline',
      icon: 'faHardDrive',
      description: 'services.worldposta.vdc.description',
      features: [
        'services.worldposta.vdc.feature1',
        'services.worldposta.vdc.feature2',
        'services.worldposta.vdc.feature3',
        'services.worldposta.vdc.feature4'
      ],
      specs: [
        { label: 'Servers', value: 'Dell R750' },
        { label: 'Storage', value: '2TB-10TB Flash' },
        { label: 'Network', value: 'Up to 100Gbps' }
      ],
      image: '/assets/images/worldposta/headers/vdc.png',
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      color: 'blue'
    },
    {
      id: 'cloud-firewall',
      name: 'Cloud Firewall',
      nameKey: 'services.worldposta.cloudFirewall.name',
      tagline: 'services.worldposta.cloudFirewall.tagline',
      icon: 'faShieldHalved',
      description: 'services.worldposta.cloudFirewall.description',
      features: [
        'services.worldposta.cloudFirewall.feature1',
        'services.worldposta.cloudFirewall.feature2',
        'services.worldposta.cloudFirewall.feature3',
        'services.worldposta.cloudFirewall.feature4'
      ],
      specs: [
        { label: 'Architecture', value: 'Zero Trust' },
        { label: 'Technology', value: 'NSX Powered' },
        { label: 'Throughput', value: 'Up to 100Gbps' }
      ],
      image: '/assets/images/worldposta/headers/cloud-firewall.png',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      color: 'emerald'
    },
    {
      id: 'gpu-instances',
      name: 'GPU Instances',
      nameKey: 'services.worldposta.gpuInstances.name',
      tagline: 'services.worldposta.gpuInstances.tagline',
      icon: 'faHardDrive',
      description: 'services.worldposta.gpuInstances.description',
      features: [
        'services.worldposta.gpuInstances.feature1',
        'services.worldposta.gpuInstances.feature2',
        'services.worldposta.gpuInstances.feature3',
        'services.worldposta.gpuInstances.feature4'
      ],
      specs: [
        { label: 'GPU', value: 'NVIDIA H100' },
        { label: 'RAM', value: 'Up to 1.5TB' },
        { label: 'Storage', value: '4TB NetApp' }
      ],
      image: '/assets/images/worldposta/headers/gpu-instances.png',
      gradient: 'from-purple-500 via-violet-600 to-fuchsia-700',
      color: 'purple',
      badge: 'AI Ready'
    },
    {
      id: 'posta-hybrid',
      name: 'Posta Hybrid',
      nameKey: 'services.worldposta.postaHybrid.name',
      tagline: 'services.worldposta.postaHybrid.tagline',
      icon: 'faEnvelope',
      description: 'services.worldposta.postaHybrid.description',
      features: [
        'services.worldposta.postaHybrid.feature1',
        'services.worldposta.postaHybrid.feature2',
        'services.worldposta.postaHybrid.feature3',
        'services.worldposta.postaHybrid.feature4'
      ],
      specs: [
        { label: 'Deployment', value: 'Hybrid' },
        { label: 'Migration', value: 'Zero Downtime' },
        { label: 'Compliance', value: 'Enterprise' }
      ],
      image: '/assets/images/worldposta/headers/posta-hybrid.png',
      gradient: 'from-worldposta-green via-worldposta-green-dark to-worldposta-navy',
      color: 'worldposta-green'
    }
  ];

  // Key Benefits
  readonly benefits = [
    {
      icon: 'faShieldHalved',
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, advanced threat protection, and compliance-ready infrastructure'
    },
    {
      icon: 'faGlobe',
      title: 'Global Infrastructure',
      description: 'Worldwide data centers with Egyptian hosting options for data sovereignty'
    },
    {
      icon: 'faCircleCheck',
      title: '99.95% Uptime SLA',
      description: 'Guaranteed availability with redundant systems and 24/7 monitoring'
    },
    {
      icon: 'faClock',
      title: '24/7 Expert Support',
      description: 'Arabic and English support with rapid response times'
    },
    {
      icon: 'faLightbulb',
      title: 'Easy Migration',
      description: 'Seamless transition from any email or storage platform with zero data loss'
    },
    {
      icon: 'faBuilding',
      title: 'Scalable Plans',
      description: 'From startups to enterprises, plans that grow with your business'
    }
  ];

  // Industries Served
  readonly industries = [
    { id: 'finance', name: 'Finance & Banking', icon: 'faBuilding' },
    { id: 'healthcare', name: 'Healthcare', icon: 'faBuilding' },
    { id: 'government', name: 'Government', icon: 'faBuilding' },
    { id: 'manufacturing', name: 'Manufacturing', icon: 'faBuilding' },
    { id: 'retail', name: 'Retail & E-commerce', icon: 'faBuilding' },
    { id: 'education', name: 'Education', icon: 'faBuilding' }
  ];

  // Pricing tiers
  readonly pricingTiers = [
    {
      name: 'Starter',
      price: '$1.50',
      period: 'user/month',
      description: 'Essential email for small teams',
      features: [
        '10GB mailbox storage',
        'Custom domain email',
        'Webmail access',
        'Basic spam protection',
        'Email support'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Business',
      price: '$4.50',
      period: 'user/month',
      description: 'Complete productivity suite',
      features: [
        '50GB mailbox + 100GB cloud storage',
        'Posta + CloudEdge',
        'Advanced security features',
        'Shared calendars & contacts',
        'Priority support'
      ],
      cta: 'Contact Sales',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'Tailored for large organizations',
      features: [
        'Unlimited storage',
        'All WorldPosta products',
        'Dedicated infrastructure',
        'Custom SLA agreements',
        'Dedicated account manager'
      ],
      cta: 'Request Quote'
    }
  ];

  // Why Roaya for WorldPosta
  readonly differentiators = [
    {
      title: 'Official WorldPosta Partner',
      description: 'Certified partner with direct access to WorldPosta infrastructure and priority support',
      highlight: 'Certified Partner'
    },
    {
      title: 'Egyptian Data Center Options',
      description: 'Host your data locally to meet Egyptian data residency requirements',
      highlight: 'Local Hosting'
    },
    {
      title: 'Bilingual Support',
      description: 'Arabic and English support team available during Egyptian business hours',
      highlight: 'AR/EN Support'
    },
    {
      title: 'Implementation Experts',
      description: 'Experienced team for migration, training, and ongoing optimization',
      highlight: 'Full Service'
    }
  ];

  // Related services
  readonly relatedServices = [
    {
      id: 'email',
      title: 'Email Solutions',
      description: 'Comprehensive email services and security',
      route: '/services/email',
      iconSvg: '/assets/images/icons/services/email.svg'
    },
    {
      id: 'cloud',
      title: 'Cloud Solutions',
      description: 'Enterprise cloud infrastructure',
      route: '/services/cloud',
      iconSvg: '/assets/images/icons/services/cloud.svg'
    },
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Advanced security and compliance',
      route: '/services/security',
      iconSvg: '/assets/images/icons/services/security.svg'
    }
  ];

  ngOnInit(): void {
    // Set page title
    this.title.setTitle('WorldPosta Cloud Services - Business Email, Storage & Apps | Roaya IT');

    // Set meta tags for SEO
    this.meta.updateTag({
      name: 'description',
      content: 'Official WorldPosta partner in Egypt. Enterprise email, cloud storage, and no-code apps. Starting at $1.50/user/month with 99.95% uptime guarantee.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'WorldPosta, Business Email, Cloud Storage, CloudEdge, CloudSpace, Posta, Egypt Email, Enterprise Email, Cloud Services'
    });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'WorldPosta Cloud Services - Roaya IT' });
    this.meta.updateTag({ property: 'og:description', content: 'Enterprise email, cloud storage, and no-code apps. Official WorldPosta partner in Egypt.' });
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

        // Hero content parallax - moves up slightly faster
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

        // Statistics cards stagger reveal with parallax
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

        // Product cards parallax with depth effect
        gsap.utils.toArray('.product-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 80 + (i * 20), opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Advanced product cards - staggered reveal with scale
        gsap.utils.toArray('.advanced-product-card').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            {
              y: 100,
              opacity: 0,
              scale: 0.9,
              rotateX: 10
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotateX: 0,
              duration: 0.9,
              delay: i * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.advanced-products-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Benefits section - bento grid animation
        const benefitCards = gsap.utils.toArray('.benefit-parallax');

        // First card (large featured) - scale and fade
        if (benefitCards[0]) {
          gsap.fromTo(benefitCards[0],
            { scale: 0.9, opacity: 0, y: 50 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.benefits-section',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        // Remaining cards - stagger from different directions
        benefitCards.slice(1).forEach((card: any, i: number) => {
          const isEven = i % 2 === 0;
          gsap.fromTo(card,
            {
              x: isEven ? -30 : 30,
              y: 40,
              opacity: 0,
              scale: 0.95
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: 0.1 * i,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Industries section - chips float up with stagger
        gsap.fromTo('.industry-parallax',
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '.industries-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Differentiators - slide in with rotation
        gsap.utils.toArray('.diff-parallax').forEach((card: any, i: number) => {
          gsap.fromTo(card,
            { y: 60, opacity: 0, rotate: i % 2 === 0 ? -2 : 2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        // Know About section - logo and content
        gsap.fromTo('.know-about-logo',
          { scale: 0.8, opacity: 0, rotate: -10 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.8,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: '.know-about-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo('.know-about-content',
          { x: 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.know-about-section',
              start: 'top 80%',
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

        // Floating elements continuous animation
        gsap.to('.float-element', {
          y: -15,
          duration: 2,
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
}
