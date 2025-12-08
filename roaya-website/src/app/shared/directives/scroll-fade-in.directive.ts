import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Scroll Fade In Directive
 * Animates element opacity based on scroll position (progressive opacity)
 * Matches Oknoplast container animation behavior:
 * - Starts with opacity: 0
 * - Progressively fades in as it enters viewport
 * - Sets inline style="opacity: 1;" when fully visible
 */
@Directive({
  selector: '[appScrollFadeIn]',
  standalone: true
})
export class ScrollFadeInDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Set initial state - opacity 0 (invisible when off-screen)
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    // Smooth transition for opacity changes (matches Oknoplast)
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.6s ease-out');

    // Use Intersection Observer with multiple thresholds for progressive opacity
    // This matches Oknoplast's behavior: opacity updates smoothly as element scrolls into view
    // For hero section (top of page), use different rootMargin to trigger earlier
    const isHeroSection = this.el.nativeElement.closest('section#hero') !== null;
    const rootMargin = isHeroSection 
      ? '0px 0px -100px 0px' // Hero section: start fading earlier
      : '0px 0px -50px 0px'; // Other sections: standard margin
    
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: rootMargin,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // Multiple thresholds for smooth progression
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Calculate opacity based on intersection ratio (0.0 to 1.0)
        // This creates progressive fade-in effect like Oknoplast
        const ratio = entry.intersectionRatio;
        
        if (ratio > 0) {
          // Progressive opacity: starts at 0.2 when entering, reaches 1.0 when fully visible
          // Using min() to cap at 1.0, and multiplying by 1.3 for smoother fade-in
          const opacity = Math.min(1, Math.max(0.2, ratio * 1.3));
          this.renderer.setStyle(this.el.nativeElement, 'opacity', opacity.toString());
          
          // When fully visible (ratio >= 0.85), ensure opacity is 1.0
          if (ratio >= 0.85) {
            this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
          }
        } else {
          // Element is off-screen, keep it hidden
          this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
    
    // Check if element is already in viewport on load (for hero section)
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport && !this.observer) {
        // If already visible and observer hasn't been set up yet, set opacity to 1
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

