import {
  Component,
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
  lucideEye,
  lucideZap,
  lucideLock,
  lucideArrowRight,
  lucideUsers,
  lucideClock
} from '@ng-icons/lucide';

/**
 * Security Brief Section Component
 *
 * Unique security-themed section with radar/shield visuals.
 * Features concentric shield animations and radar sweep effects.
 */
@Component({
  selector: 'app-security-brief-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './security-brief-section.component.html',
  styleUrl: './security-brief-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideShield,
      lucideEye,
      lucideZap,
      lucideLock,
      lucideArrowRight,
      lucideUsers,
      lucideClock
    })
  ]
})
export class SecurityBriefSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sectionElement') sectionElement!: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private animations: gsap.core.Tween[] = [];

  prefersReducedMotion = signal(false);

  // Security highlights configuration
  highlights = [
    {
      icon: 'lucideShield',
      titleKey: 'home.serviceBriefs.security.highlights.soc.title',
      descriptionKey: 'home.serviceBriefs.security.highlights.soc.description'
    },
    {
      icon: 'lucideEye',
      titleKey: 'home.serviceBriefs.security.highlights.threatIntel.title',
      descriptionKey: 'home.serviceBriefs.security.highlights.threatIntel.description'
    },
    {
      icon: 'lucideZap',
      titleKey: 'home.serviceBriefs.security.highlights.response.title',
      descriptionKey: 'home.serviceBriefs.security.highlights.response.description'
    },
    {
      icon: 'lucideLock',
      titleKey: 'home.serviceBriefs.security.highlights.compliance.title',
      descriptionKey: 'home.serviceBriefs.security.highlights.compliance.description'
    }
  ];

  // Stats configuration
  stats = [
    { value: '24/7', labelKey: 'home.serviceBriefs.security.stats.coverage', icon: 'lucideClock' },
    { value: '99.9%', labelKey: 'home.serviceBriefs.security.stats.detection', icon: 'lucideShield' }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    if (!this.prefersReducedMotion()) {
      // Use requestAnimationFrame for reliable DOM state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.initAnimations();
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initAnimations(): void {
    const section = this.sectionElement?.nativeElement;
    if (!section) return;

    // Get all animatable elements
    const content = section.querySelector('.security-content');
    const hero = section.querySelector('.security-hero');
    const highlights = section.querySelectorAll('.security-highlight');
    const stats = section.querySelectorAll('.security-stat');

    // Set initial hidden state
    gsap.set(content, { opacity: 0, x: -50 });
    gsap.set(hero, { opacity: 0, scale: 0.8 });
    gsap.set(highlights, { opacity: 0, y: 30 });
    gsap.set(stats, { opacity: 0, scale: 0.9 });

    // Animation function
    const playAnimation = () => {
      // Animate main content
      gsap.to(content, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Animate shield hero
      gsap.to(hero, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out(1.7)',
        delay: 0.3
      });

      // Stagger highlights
      gsap.to(highlights, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.5
      });

      // Animate stats
      gsap.to(stats, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 0.7
      });

      // Counter animation for stats
      this.animateStatCounters(section);
    };

    // Check if section is already in viewport
    const rect = section.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      // Section already visible - play immediately
      playAnimation();
    } else {
      // Use ScrollTrigger for sections below viewport
      const sectionTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        onEnter: playAnimation,
        once: true
      });

      this.scrollTriggers.push(sectionTrigger);

      // Fallback: if ScrollTrigger doesn't fire within 2 seconds, show content anyway
      setTimeout(() => {
        if (highlights.length > 0 && window.getComputedStyle(highlights[0] as Element).opacity === '0') {
          playAnimation();
        }
      }, 2000);
    }
  }

  private animateStatCounters(section: HTMLElement): void {
    const statValues = section.querySelectorAll('.security-stat-value');

    statValues.forEach((element) => {
      const targetText = element.textContent?.trim() || '';
      const numericMatch = targetText.match(/[\d,]+\.?\d*/);

      if (numericMatch) {
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

  private cleanup(): void {
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.animations.forEach(anim => anim.kill());
    this.scrollTriggers = [];
    this.animations = [];
  }

  trackByIndex(index: number): number {
    return index;
  }
}
