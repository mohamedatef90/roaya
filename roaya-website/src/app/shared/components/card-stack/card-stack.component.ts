import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { filter, take } from 'rxjs/operators';
import {
  StackCard,
  CardStackConfig,
  DEFAULT_CARD_STACK_CONFIG
} from './card-stack.interface';
import { ScrollSmootherService } from '../../../core/services/scroll-smoother.service';

/**
 * CardStackComponent - ineo-sense style card-over-card stacking scroll effect
 *
 * Creates a stacking cards animation where cards slide up over each other
 * as the user scrolls. Each card pins at the top while the next card
 * slides up from below to overlay it.
 *
 * Key Features:
 * - Sticky/pinned scrolling with cards stacking on top of each other
 * - Smooth GSAP ScrollTrigger animations
 * - Cards scale down slightly and fade as they get covered
 * - Full accessibility support with reduced motion
 * - RTL support for Arabic
 *
 * @example
 * ```html
 * <app-card-stack
 *   [cards]="expertiseCards"
 *   [config]="{ scaleFactor: 0.03, enableParallax: true }"
 *   sectionTitle="Our Expertise"
 *   sectionSubtitle="What we do best"
 * />
 * ```
 */
@Component({
  selector: 'app-card-stack',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './card-stack.component.html',
  styleUrl: './card-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardStackComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stackContainer') stackContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('stickyWrapper') stickyWrapper!: ElementRef<HTMLDivElement>;
  @ViewChildren('stackCard') stackCards!: QueryList<ElementRef<HTMLDivElement>>;

  /** Array of card data to display */
  @Input() cards: StackCard[] = [];

  /** Configuration options for the stacking effect */
  @Input() config: CardStackConfig = {};

  /** Optional section title */
  @Input() sectionTitle?: string;

  /** Optional section subtitle */
  @Input() sectionSubtitle?: string;

  /** Optional section badge text */
  @Input() sectionBadge?: string;

  /** Custom container class */
  @Input() containerClass = '';

  /** Enable dark variant styling */
  @Input() darkVariant = false;

  /** Card gradient variants for visual variety */
  @Input() useGradients = true;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollSmootherService = inject(ScrollSmootherService);
  private scrollTriggers: ScrollTrigger[] = [];
  private animations: gsap.core.Tween[] = [];
  private masterTimeline: gsap.core.Timeline | null = null;

  prefersReducedMotion = signal(false);
  mergedConfig = signal<CardStackConfig>(DEFAULT_CARD_STACK_CONFIG);
  activeCardIndex = signal(0);

  // Gradient presets for cards
  readonly cardGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Teal
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint-Pink
  ];

  // Solid color presets (ineo-sense style)
  readonly cardSolidColors = [
    'rgb(255, 255, 255)',      // White
    'rgb(216, 241, 238)',      // Mint surface
    'rgb(199, 235, 231)',      // Teal light
    'rgb(170, 225, 221)',      // Teal medium
    'rgb(245, 251, 250)',      // Background mint
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Register GSAP plugins (critical for browser environment)
    gsap.registerPlugin(ScrollTrigger);

    // Merge user config with defaults
    this.mergedConfig.set({
      ...DEFAULT_CARD_STACK_CONFIG,
      ...this.config
    });

    // Check for reduced motion preference
    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    // Initialize animations if user doesn't prefer reduced motion
    if (!this.prefersReducedMotion() && this.mergedConfig().enableStacking) {
      // Wait for ScrollSmoother to be ready before initializing stacking animation
      this.scrollSmootherService.smootherReady$
        .pipe(
          filter(ready => ready),
          take(1)
        )
        .subscribe(() => {
          // Delay initialization to ensure DOM is fully ready
          setTimeout(() => {
            this.initStackingAnimation();
          }, 100);
        });

      // Fallback: If ScrollSmoother isn't ready within 500ms, init anyway
      setTimeout(() => {
        if (!this.scrollSmootherService.isReady()) {
          this.initStackingAnimation();
        }
      }, 600);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Clean up all GSAP animations and ScrollTriggers
   */
  private cleanup(): void {
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.animations.forEach(anim => anim.kill());
    if (this.masterTimeline) {
      this.masterTimeline.kill();
    }
    this.scrollTriggers = [];
    this.animations = [];
    this.masterTimeline = null;
  }

  /**
   * Initialize the card stacking scroll animation
   * Creates a sticky/pinned effect where each card slides up
   * and overlays the previous card
   */
  private initStackingAnimation(): void {
    gsap.registerPlugin(ScrollTrigger);

    const container = this.stackContainer?.nativeElement;
    const stickyWrapper = this.stickyWrapper?.nativeElement;
    const cards = this.stackCards?.toArray().map(c => c.nativeElement);

    if (!container || !stickyWrapper || !cards || cards.length === 0) return;

    const config = this.mergedConfig();
    const totalCards = cards.length;

    // Calculate the total scroll distance needed
    // Each card needs enough scroll distance for its animation
    const scrollPerCard = window.innerHeight * 1.2; // 120vh per card for better pacing
    const totalScrollDistance = scrollPerCard * (totalCards - 1);

    // Set container height to accommodate all card animations
    gsap.set(container, {
      height: `${100 + (totalCards - 1) * 100}vh`
    });

    // Set initial state for all cards
    cards.forEach((card, index) => {
      gsap.set(card, {
        zIndex: index + 1, // First card has lowest z-index (cards slide OVER previous ones)
        transformOrigin: 'center top',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // All cards except first start below viewport
        y: index === 0 ? 0 : '100%',
        scale: 1,
        opacity: 1
      });

      // Add is-first and is-active class to first card immediately for visibility
      if (index === 0) {
        card.classList.add('is-first', 'is-active');
      }
    });

    // Create the main pinning ScrollTrigger for the sticky wrapper
    // Use stickyWrapper as trigger so pinning starts when cards reach top of viewport
    const mainTrigger = ScrollTrigger.create({
      trigger: stickyWrapper,
      start: 'top top',
      end: () => `+=${totalScrollDistance}`, // Pin for the calculated scroll distance
      pin: true, // Pin the trigger element itself
      pinSpacing: true,
      scrub: config.enableScrub ? config.scrubSmoothness : false,
      onUpdate: (self) => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          this.handleScrollProgress(self.progress, cards, config);
        });
      },
      onEnter: () => {
        cards[0]?.classList.add('is-active');
      },
      onLeave: () => {
        cards.forEach(card => card.classList.remove('is-active'));
      },
      onEnterBack: () => {
        // Determine which card should be active based on scroll position
        const activeIndex = Math.min(
          Math.floor(mainTrigger.progress * totalCards),
          totalCards - 1
        );
        cards[activeIndex]?.classList.add('is-active');
      },
      onLeaveBack: () => {
        cards.forEach(card => card.classList.remove('is-active'));
      }
    });

    this.scrollTriggers.push(mainTrigger);

    // Optional parallax effect on background elements
    if (config.enableParallax) {
      this.initParallaxEffect(container, config);
    }

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();
  }

  /**
   * Handle scroll progress to animate cards
   */
  private handleScrollProgress(
    progress: number,
    cards: HTMLElement[],
    config: CardStackConfig
  ): void {
    const totalCards = cards.length;
    // Fix: Use totalCards for proper progress distribution (0.25 for 4 cards)
    const progressPerCard = 1 / totalCards;

    cards.forEach((card, index) => {
      if (index === 0) {
        // First card behavior: scale down and fade as second card comes up
        const firstCardProgress = Math.min(progress / progressPerCard, 1);
        const scale = 1 - (firstCardProgress * (config.scaleFactor || 0.05));
        const opacity = config.enableOpacityFade
          ? 1 - (firstCardProgress * (1 - (config.minOpacity || 0.5)))
          : 1;
        const yOffset = -firstCardProgress * (config.stackOffset || 40);

        gsap.set(card, {
          scale: Math.max(scale, 0.9),
          opacity: Math.max(opacity, config.minOpacity || 0.5),
          y: yOffset,
          zIndex: totalCards // Keep first card on bottom when covered
        });

        // Update active state
        if (firstCardProgress < 0.5) {
          card.classList.add('is-active');
          this.activeCardIndex.set(0);
        } else {
          card.classList.remove('is-active');
        }
      } else {
        // Calculate this card's individual progress
        const cardStartProgress = (index - 1) * progressPerCard;
        const cardEndProgress = index * progressPerCard;

        if (progress <= cardStartProgress) {
          // Card hasn't started animating yet - keep it below
          gsap.set(card, {
            y: '100%',
            scale: 1,
            opacity: 1,
            zIndex: index + 1
          });
          card.classList.remove('is-active', 'is-stacked');
        } else if (progress >= cardEndProgress) {
          // Card has finished animating - it's now stacked
          // Check if this is the currently active card or if it's covered by a later card
          const isActiveCard = index === Math.floor(progress / progressPerCard);
          const isCovered = index < Math.floor(progress / progressPerCard);

          gsap.set(card, {
            y: 0,
            scale: 1,
            // FIX: Covered cards should fade to minOpacity, active card stays at 1
            opacity: isCovered && config.enableOpacityFade ? (config.minOpacity || 0.5) : 1,
            zIndex: totalCards + index
          });
          card.classList.add('is-stacked');

          // Update active state
          if (isActiveCard) {
            card.classList.add('is-active');
            this.activeCardIndex.set(index);
          } else {
            card.classList.remove('is-active');
          }
        } else {
          // Card is currently animating
          const cardProgress = (progress - cardStartProgress) / progressPerCard;

          // Slide up from 100% to 0%
          const yPercent = 100 - (cardProgress * 100);

          // Slight scale effect during slide
          const scale = 0.95 + (cardProgress * 0.05);

          // FIX: Keep card FULLY OPAQUE during slide-up animation
          const opacity = 1;

          gsap.set(card, {
            y: `${yPercent}%`,
            scale: scale,
            opacity: opacity,
            zIndex: totalCards + index
          });

          card.classList.add('is-active');
          card.classList.remove('is-stacked');
          this.activeCardIndex.set(index);

          // Scale down and fade the previous card AS THE NEW CARD SLIDES UP
          if (index > 0) {
            const prevCard = cards[index - 1];
            const prevScale = 1 - (cardProgress * (config.scaleFactor || 0.05));
            const prevOpacity = config.enableOpacityFade
              ? 1 - (cardProgress * (1 - (config.minOpacity || 0.5)))
              : 1;
            const prevYOffset = -cardProgress * (config.stackOffset || 40);

            gsap.set(prevCard, {
              scale: Math.max(prevScale, 0.9),
              opacity: Math.max(prevOpacity, config.minOpacity || 0.5),
              y: prevYOffset
            });
            prevCard.classList.remove('is-active');
          }
        }
      }
    });
  }

  /**
   * Initialize parallax effect for background elements
   */
  private initParallaxEffect(container: HTMLElement, config: CardStackConfig): void {
    const parallaxElements = container.querySelectorAll('.parallax-bg');

    parallaxElements.forEach(element => {
      const anim = gsap.to(element, {
        y: config.parallaxIntensity || 50,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      this.animations.push(anim);
    });
  }

  /**
   * Get background color/gradient for a card
   */
  // Named gradient presets matching the brand colors
  readonly namedGradients: Record<string, string> = {
    'primary-to-secondary': 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)',
    'secondary-to-primary': 'linear-gradient(135deg, #5DB7C2 0%, #3D5A80 100%)',
    'accent-to-primary': 'linear-gradient(135deg, #6B4C9A 0%, #3D5A80 100%)',
    'primary-to-accent': 'linear-gradient(135deg, #3D5A80 0%, #6B4C9A 100%)',
    'accent-to-secondary': 'linear-gradient(135deg, #6B4C9A 0%, #5DB7C2 100%)',
    'secondary-to-accent': 'linear-gradient(135deg, #5DB7C2 0%, #6B4C9A 100%)',
  };

  getCardBackground(card: StackCard, index: number): string {
    // Check for named gradient preset first
    if (card.gradient && this.namedGradients[card.gradient]) {
      return this.namedGradients[card.gradient];
    }

    if (card.backgroundColor) {
      return card.backgroundColor;
    }

    if (this.useGradients) {
      return this.cardGradients[index % this.cardGradients.length];
    }

    return this.cardSolidColors[index % this.cardSolidColors.length];
  }

  /**
   * Get text color for a card
   */
  getCardTextColor(card: StackCard): string {
    if (card.textColor) {
      return card.textColor;
    }

    // Use white text for gradient backgrounds (including named gradients), navy for solid
    if (card.gradient && this.namedGradients[card.gradient]) {
      return 'rgb(255, 255, 255)';
    }

    return this.useGradients ? 'rgb(255, 255, 255)' : 'rgb(2, 3, 71)';
  }

  /**
   * Check if card uses dark background (for icon styling)
   */
  isDarkBackground(card: StackCard, index: number): boolean {
    if (card.backgroundColor) {
      // Simple heuristic: check if it contains gradient keywords or dark colors
      return card.backgroundColor.includes('gradient') ||
             card.backgroundColor.includes('#6') ||
             card.backgroundColor.includes('#7') ||
             card.backgroundColor.includes('#8') ||
             card.backgroundColor.includes('#9');
    }
    return this.useGradients;
  }

  /**
   * Track cards by their ID for ngFor optimization
   */
  trackByCardId(index: number, card: StackCard): string {
    return card.id;
  }
}
