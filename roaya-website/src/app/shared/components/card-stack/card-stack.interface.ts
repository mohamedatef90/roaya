/**
 * Interface for stacking card data
 * Based on ineo-sense.com card-over-card scroll effect
 */
export interface StackCard {
  /** Unique identifier for the card */
  id: string;

  /** Main title displayed on the card */
  title: string;

  /** Optional subtitle or category */
  subtitle?: string;

  /** Description text */
  description: string;

  /** Background color for the card (hex, rgb, or CSS variable) */
  backgroundColor?: string;

  /** Text color for the card content */
  textColor?: string;

  /** Optional icon (SVG path or icon name) */
  icon?: string;

  /** Optional image URL */
  image?: string;

  /** Optional link for CTA */
  link?: string;

  /** Optional link text */
  linkText?: string;

  /** Optional list of features/points */
  features?: string[];

  /** Optional custom CSS class */
  customClass?: string;

  /** Optional gradient preset name (e.g., 'primary-to-secondary', 'accent-to-primary') */
  gradient?: string;
}

/**
 * Configuration options for the card stack component
 */
export interface CardStackConfig {
  /** Enable/disable stacking animation (default: true) */
  enableStacking?: boolean;

  /** Scale factor for stacked cards (default: 0.05) */
  scaleFactor?: number;

  /** Vertical offset between stacked cards in pixels (default: 20) */
  stackOffset?: number;

  /** Animation duration in seconds (default: 0.8) */
  animationDuration?: number;

  /** Scroll trigger start position (default: 'top 80%') */
  triggerStart?: string;

  /** Scroll trigger end position (default: 'bottom 20%') */
  triggerEnd?: string;

  /** Enable scrub animation tied to scroll (default: true) */
  enableScrub?: boolean;

  /** Scrub smoothness (0-2, default: 1) */
  scrubSmoothness?: number;

  /** Enable parallax effect on cards (default: false) */
  enableParallax?: boolean;

  /** Parallax intensity (default: 50) */
  parallaxIntensity?: number;

  /** Enable opacity fade on scroll (default: true) */
  enableOpacityFade?: boolean;

  /** Minimum opacity for faded cards (default: 0.3) */
  minOpacity?: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CARD_STACK_CONFIG: CardStackConfig = {
  enableStacking: true,
  scaleFactor: 0.05,
  stackOffset: 20,
  animationDuration: 0.8,
  triggerStart: 'top 80%',
  triggerEnd: 'bottom 20%',
  enableScrub: true,
  scrubSmoothness: 1,
  enableParallax: false,
  parallaxIntensity: 50,
  enableOpacityFade: true,
  minOpacity: 0.3
};
