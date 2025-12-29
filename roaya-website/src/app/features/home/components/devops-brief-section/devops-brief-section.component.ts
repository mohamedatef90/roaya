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
  lucideCloud,
  lucideServer,
  lucideEye,
  lucideZap,
  lucideArrowRight,
  lucideUsers,
  lucideClock,
  lucideGitBranch,
  lucideContainer,
  lucideRocket,
  lucideCheckCircle
} from '@ng-icons/lucide';

/**
 * DevOps Brief Section Component
 *
 * Pipeline/automation themed section with flowing particles.
 * Features deployment visualizations and container graphics.
 */
@Component({
  selector: 'app-devops-brief-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './devops-brief-section.component.html',
  styleUrl: './devops-brief-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideCloud,
      lucideServer,
      lucideEye,
      lucideZap,
      lucideArrowRight,
      lucideUsers,
      lucideClock,
      lucideGitBranch,
      lucideContainer,
      lucideRocket,
      lucideCheckCircle
    })
  ]
})
export class DevopsBriefSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sectionElement') sectionElement!: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private animations: gsap.core.Tween[] = [];

  prefersReducedMotion = signal(false);

  // Pipeline stages for visualization
  pipelineStages = [
    { icon: 'lucideGitBranch', label: 'Code', status: 'complete' },
    { icon: 'lucideContainer', label: 'Build', status: 'complete' },
    { icon: 'lucideCheckCircle', label: 'Test', status: 'complete' },
    { icon: 'lucideRocket', label: 'Deploy', status: 'active' }
  ];

  // Highlights configuration
  highlights = [
    {
      icon: 'lucideGitBranch',
      titleKey: 'home.serviceBriefs.devops.highlights.cicd.title',
      descriptionKey: 'home.serviceBriefs.devops.highlights.cicd.description'
    },
    {
      icon: 'lucideContainer',
      titleKey: 'home.serviceBriefs.devops.highlights.kubernetes.title',
      descriptionKey: 'home.serviceBriefs.devops.highlights.kubernetes.description'
    },
    {
      icon: 'lucideEye',
      titleKey: 'home.serviceBriefs.devops.highlights.observability.title',
      descriptionKey: 'home.serviceBriefs.devops.highlights.observability.description'
    },
    {
      icon: 'lucideServer',
      titleKey: 'home.serviceBriefs.devops.highlights.infrastructure.title',
      descriptionKey: 'home.serviceBriefs.devops.highlights.infrastructure.description'
    }
  ];

  // Stats configuration
  stats = [
    { value: '10x', labelKey: 'home.serviceBriefs.devops.stats.deployments', icon: 'lucideRocket' },
    { value: '99.9%', labelKey: 'home.serviceBriefs.devops.stats.uptime', icon: 'lucideServer' }
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
    const pipelineStages = section.querySelectorAll('.pipeline-stage');
    const pipelineConnectors = section.querySelectorAll('.pipeline-connector');
    const content = section.querySelector('.devops-content');
    const highlights = section.querySelectorAll('.devops-highlight');
    const stats = section.querySelectorAll('.devops-stat');

    // Set initial hidden state
    gsap.set(pipelineStages, { opacity: 0, scale: 0.5 });
    gsap.set(pipelineConnectors, { scaleX: 0 });
    gsap.set(content, { opacity: 0, x: -50 });
    gsap.set(highlights, { opacity: 0, x: -30 });
    gsap.set(stats, { opacity: 0, y: 20 });

    // Animation function
    const playAnimation = () => {
      // Animate pipeline stages sequentially
      gsap.to(pipelineStages, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      });

      // Animate pipeline connectors
      gsap.to(pipelineConnectors, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 0.3
      });

      // Animate content
      gsap.to(content, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.5
      });

      // Stagger highlights with horizontal flow
      gsap.to(highlights, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.7
      });

      // Animate stats
      gsap.to(stats, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 1
      });

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
    const statValues = section.querySelectorAll('.devops-stat-value');

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
          delay: 1.2,
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
