import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AnimationType =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'scale-in'
  | 'slide-in-up'
  | 'slide-in-down';

/**
 * Animate On Scroll Directive
 * Applies CSS animation classes when element enters viewport
 *
 * Usage:
 * <div appAnimateOnScroll="fade-in-up" [animationDelay]="200"></div>
 * <div appAnimateOnScroll="scale-in" [animationThreshold]="0.3"></div>
 */
@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Animation type to apply */
  @Input('appAnimateOnScroll') animation: AnimationType = 'fade-in-up';

  /** Delay in milliseconds before animation starts */
  @Input() animationDelay = 0;

  /** Duration of animation in milliseconds */
  @Input() animationDuration = 600;

  /** Threshold (0-1) - how much of element must be visible to trigger */
  @Input() animationThreshold = 0.1;

  /** Whether to animate only once or every time element enters viewport */
  @Input() animateOnce = true;

  /** Optional stagger index for cascading animations */
  @Input() staggerIndex = 0;

  /** Stagger delay between items (ms) */
  @Input() staggerDelay = 100;

  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Skip animation, just show element
      this.el.nativeElement.style.opacity = '1';
      return;
    }

    this.setupElement();
    this.createObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private setupElement(): void {
    const el = this.el.nativeElement;

    // Set initial state (hidden)
    el.style.opacity = '0';
    el.style.transition = `opacity ${this.animationDuration}ms ease-out, transform ${this.animationDuration}ms ease-out`;

    // Apply initial transform based on animation type
    switch (this.animation) {
      case 'fade-in-up':
      case 'slide-in-up':
        el.style.transform = 'translateY(30px)';
        break;
      case 'fade-in-down':
      case 'slide-in-down':
        el.style.transform = 'translateY(-30px)';
        break;
      case 'fade-in-left':
        el.style.transform = 'translateX(30px)';
        break;
      case 'fade-in-right':
        el.style.transform = 'translateX(-30px)';
        break;
      case 'scale-in':
        el.style.transform = 'scale(0.95)';
        break;
      case 'fade-in':
      default:
        // Just opacity change
        break;
    }
  }

  private createObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: this.animationThreshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (this.animateOnce && this.hasAnimated) {
            return;
          }
          this.animate();
          this.hasAnimated = true;

          if (this.animateOnce) {
            this.disconnectObserver();
          }
        } else if (!this.animateOnce) {
          this.resetAnimation();
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private animate(): void {
    const el = this.el.nativeElement;
    const totalDelay = this.animationDelay + (this.staggerIndex * this.staggerDelay);

    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) translateX(0) scale(1)';
    }, totalDelay);
  }

  private resetAnimation(): void {
    this.setupElement();
    this.hasAnimated = false;
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
