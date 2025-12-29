import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  lucideShield,
  lucideLock,
  lucideEye,
  lucideCheckCircle,
  lucideArrowRight,
  lucideServer,
  lucideCloud,
  lucideUsers,
  lucideGlobe,
  lucideClock,
  lucideZap
} from '@ng-icons/lucide';
import type { ServiceBriefConfig } from './service-brief-section.interfaces';

/**
 * ServiceBriefSection Component
 *
 * Reusable section component for showcasing individual services on the home page.
 * Features GSAP scroll animations, glassmorphism design, and full RTL/dark mode support.
 *
 * @example
 * ```html
 * <app-service-brief-section [config]="securityConfig" />
 * ```
 */
@Component({
  selector: 'app-service-brief-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './service-brief-section.component.html',
  styleUrl: './service-brief-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideShield,
      lucideLock,
      lucideEye,
      lucideCheckCircle,
      lucideArrowRight,
      lucideServer,
      lucideCloud,
      lucideUsers,
      lucideGlobe,
      lucideClock,
      lucideZap
    })
  ]
})
export class ServiceBriefSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sectionElement') sectionElement!: ElementRef<HTMLElement>;

  /** Service configuration object */
  @Input({ required: true }) config!: ServiceBriefConfig;

  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private animations: gsap.core.Tween[] = [];

  prefersReducedMotion = signal(false);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    // Check for reduced motion preference
    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    if (!this.prefersReducedMotion()) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.initAnimations();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Initialize GSAP scroll-triggered animations
   */
  private initAnimations(): void {
    const section = this.sectionElement?.nativeElement;
    if (!section) return;

    // Section fade-in animation
    const sectionTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        // Animate section container
        gsap.from(section.querySelector('.service-brief__container'), {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out'
        });

        // Animate badge
        gsap.from(section.querySelector('.service-brief__badge'), {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.2
        });

        // Animate title
        gsap.from(section.querySelector('.service-brief__title'), {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.3
        });

        // Animate subtitle
        gsap.from(section.querySelector('.service-brief__subtitle'), {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.4
        });

        // Animate description
        gsap.from(section.querySelector('.service-brief__description'), {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.5
        });

        // Stagger animation for highlights
        gsap.from(section.querySelectorAll('.service-brief__highlight'), {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.6
        });

        // Animate CTAs
        gsap.from(section.querySelectorAll('.service-brief__cta'), {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.8
        });

        // Animate stats (if present)
        const stats = section.querySelectorAll('.service-brief__stat');
        if (stats.length > 0) {
          gsap.from(stats, {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            delay: 0.7
          });

          // Animate stat values with counter effect
          this.animateStatCounters(section);
        }

        // Animate illustration (if present)
        const illustration = section.querySelector('.service-brief__illustration');
        if (illustration) {
          gsap.from(illustration, {
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: 'power3.out',
            delay: 0.5
          });
        }
      },
      once: true
    });

    this.scrollTriggers.push(sectionTrigger);
  }

  /**
   * Animate stat counters from 0 to target value
   * Supports formats: "500+", "99.9%", "1,000+", "24/7", "10x", "48h"
   */
  private animateStatCounters(section: HTMLElement): void {
    const statValues = section.querySelectorAll('.service-brief__stat-value');

    statValues.forEach((element) => {
      const targetText = element.textContent?.trim() || '';
      // Enhanced regex to support comma-separated numbers
      const numericMatch = targetText.match(/[\d,]+\.?\d*/);

      if (numericMatch) {
        // Remove commas for parsing
        const targetValue = parseFloat(numericMatch[0].replace(/,/g, ''));
        const suffix = targetText.replace(/[\d,]+\.?\d*/, '');

        const counter = { value: 0 };
        gsap.to(counter, {
          value: targetValue,
          duration: 2,
          ease: 'power2.out',
          delay: 0.8,
          onUpdate: () => {
            const currentValue = counter.value;
            const formattedValue = currentValue % 1 === 0
              ? Math.round(currentValue)
              : currentValue.toFixed(1);
            element.textContent = formattedValue + suffix;
          }
        });
      }
    });
  }

  /**
   * Clean up all GSAP animations and ScrollTriggers
   */
  private cleanup(): void {
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.animations.forEach(anim => anim.kill());
    this.scrollTriggers = [];
    this.animations = [];
  }

  /**
   * Track highlights by index for ngFor optimization
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Track stats by index for ngFor optimization
   */
  trackByStatIndex(index: number): number {
    return index;
  }
}
