import { Component, OnInit, OnDestroy, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle2,
  lucideMail,
  lucideArrowLeft,
  lucideFileText,
  lucideBookOpen,
  lucideSparkles
} from '@ng-icons/lucide';
import gsap from 'gsap';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SEOService } from '../../../core/services/seo.service';

export type ComingSoonType = 'whitepapers' | 'documentation';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      lucideCheckCircle2,
      lucideMail,
      lucideArrowLeft,
      lucideFileText,
      lucideBookOpen,
      lucideSparkles
    })
  ],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  /** Type of coming soon page - determines translations and icon */
  type = input<ComingSoonType>('whitepapers');

  private readonly analytics = inject(AnalyticsService);
  private readonly seo = inject(SEOService);

  // State signals
  email = signal('');
  subscribed = signal(false);
  submitting = signal(false);
  error = signal(false);

  // Animation cleanup
  private particles: HTMLDivElement[] = [];
  private animationTimelines: gsap.core.Timeline[] = [];

  ngOnInit(): void {
    const pageType = this.type();

    // Track page view
    this.analytics.trackPageView(`/resources/${pageType}`);

    // Set SEO meta tags
    this.seo.updateSEO({
      title: `resources.${pageType}.comingSoon.meta.title`,
      description: `resources.${pageType}.comingSoon.meta.description`
    });

    // Initialize animations
    this.initParticles();
    this.initGSAPAnimations();
  }

  ngOnDestroy(): void {
    // Cleanup particles
    this.particles.forEach(p => p.remove());
    this.particles = [];

    // Kill GSAP animations
    this.animationTimelines.forEach(tl => tl.kill());
    this.animationTimelines = [];
  }

  get translationPrefix(): string {
    return `resources.${this.type()}.comingSoon`;
  }

  get iconName(): string {
    return this.type() === 'whitepapers' ? 'lucideFileText' : 'lucideBookOpen';
  }

  /**
   * Initialize particle effect (lightweight GSAP-based)
   */
  private initParticles(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const container = document.getElementById('particles-container');
    if (!container) return;

    // Get theme-aware particle color from CSS custom property
    const isDark = document.documentElement.classList.contains('dark');
    const particleColor = isDark
      ? 'rgba(93, 183, 194, OPACITY)'  // Teal for dark mode
      : 'rgba(61, 90, 128, OPACITY)';   // Navy for light mode

    // Create 40 particle dots
    for (let i = 0; i < 40; i++) {
      const opacity = Math.random() * 0.4 + 0.2;
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: ${particleColor.replace('OPACITY', opacity.toString())};
        border-radius: 50%;
        pointer-events: none;
        transition: background 0.3s ease;
      `;
      container.appendChild(particle);
      this.particles.push(particle);

      // Random initial position
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });

      // Animate particle drift
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(particle, {
        x: `+=${Math.random() * 150 - 75}`,
        y: `+=${Math.random() * 150 - 75}`,
        duration: Math.random() * 15 + 10,
        ease: 'none',
      });

      // Fade animation
      gsap.to(particle, {
        opacity: Math.random() * 0.4 + 0.2,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
      });

      this.animationTimelines.push(tl);
    }
  }

  /**
   * Initialize GSAP entrance animations
   */
  private initGSAPAnimations(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Fade in main card
    gsap.from('[data-animate="fade-in"]', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2,
    });

    // Corner dots stagger
    gsap.from('.corner-dot', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      delay: 0.6,
    });

    // Scanning line
    const scanLine = document.querySelector('.scan-line');
    if (scanLine) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(scanLine,
        { y: '-100%', opacity: 0 },
        { y: '100vh', opacity: 0.5, duration: 4, ease: 'none' }
      );
      this.animationTimelines.push(tl);
    }
  }

  /**
   * Handle email subscription
   */
  async handleSubscribe(): Promise<void> {
    const emailValue = this.email().trim();
    if (!emailValue || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(false);

    try {
      // Track subscription attempt
      this.analytics.trackEvent('coming_soon_subscribe', {
        type: this.type(),
        email: emailValue
      });

      // TODO: Connect to backend API for email subscription
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.subscribed.set(true);

      // Animate success
      gsap.from('.success-message', {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });

    } catch (err) {
      this.error.set(true);
      console.error('Subscription error:', err);
    } finally {
      this.submitting.set(false);
    }
  }
}
