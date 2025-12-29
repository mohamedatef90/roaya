/**
 * Service Brief Section Interfaces
 * Type definitions for service brief component configuration
 */

/**
 * Service highlight/feature item
 */
export interface ServiceHighlight {
  /** Lucide icon name (e.g., 'lucideShield', 'lucideCheckCircle') */
  icon: string;
  /** Translation key for highlight title */
  title: string;
  /** Translation key for highlight description */
  description: string;
}

/**
 * Service statistic/metric
 */
export interface ServiceStat {
  /** Stat value (e.g., '99.9%', '150+', '24/7') */
  value: string;
  /** Translation key for stat label */
  label: string;
  /** Optional Lucide icon name */
  icon?: string;
}

/**
 * Call-to-action button configuration
 */
export interface ServiceCta {
  /** Translation key for CTA text */
  text: string;
  /** Route path (e.g., '/services/security') */
  route: string;
  /** Button style variant */
  style: 'primary' | 'secondary' | 'outline';
  /** Optional Lucide icon name */
  icon?: string;
}

/**
 * Main service brief section configuration
 */
export interface ServiceBriefConfig {
  /** Unique identifier for the section */
  id: string;
  /** Translation key for badge text (e.g., 'home.security.badge') */
  badge: string;
  /** Tailwind gradient classes (e.g., 'from-accent-500/10 to-primary-600/10') */
  gradient: string;
  /** Optional icon path (SVG) */
  iconPath?: string;
  /** Optional illustration path (SVG/PNG) */
  illustrationPath?: string;
  /** Translation key for title */
  title: string;
  /** Translation key for subtitle */
  subtitle: string;
  /** Translation key for description */
  description: string;
  /** Array of highlight items */
  highlights: ServiceHighlight[];
  /** Optional stats array */
  stats?: ServiceStat[];
  /** Primary CTA button */
  primaryCta: ServiceCta;
  /** Optional secondary CTA button */
  secondaryCta?: ServiceCta;
  /** Layout style variant */
  layoutStyle: 'default' | 'stats-first' | 'visual-heavy';
  /** Reverse layout (image on left instead of right) */
  reverse?: boolean;
}
