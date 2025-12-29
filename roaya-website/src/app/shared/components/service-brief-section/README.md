# ServiceBriefSection Component

A reusable Angular component for showcasing individual services on the home page with detailed information, highlights, stats, and CTAs.

## Features

- **GSAP Scroll Animations**: Smooth scroll-triggered animations for all elements
- **Responsive Design**: Mobile-first approach with breakpoints at sm, md, lg, xl
- **Glassmorphism UI**: Modern glass effect with backdrop blur and transparency
- **Dark Mode Support**: Automatic theme switching with proper contrast
- **RTL Support**: Full bidirectional text support for Arabic
- **Accessibility**: WCAG 2.1 AA compliant with reduced motion support
- **Performance**: OnPush change detection, trackBy functions, lazy loading
- **Stats Counter Animation**: Animated number counters from 0 to target value

## Usage

### Basic Example

```typescript
import { ServiceBriefSectionComponent } from '@shared/components/service-brief-section';
import type { ServiceBriefConfig } from '@shared/components/service-brief-section';

@Component({
  imports: [ServiceBriefSectionComponent]
})
export class HomeComponent {
  securityConfig: ServiceBriefConfig = {
    id: 'security-brief',
    badge: 'home.serviceBriefs.security.badge',
    gradient: 'from-accent-500/10 to-primary-600/10',
    iconPath: '/assets/images/icons/services/security.svg',
    title: 'home.serviceBriefs.security.title',
    subtitle: 'home.serviceBriefs.security.subtitle',
    description: 'home.serviceBriefs.security.description',
    highlights: [
      {
        icon: 'lucideShield',
        title: 'home.serviceBriefs.security.highlights.soc.title',
        description: 'home.serviceBriefs.security.highlights.soc.description'
      }
    ],
    stats: [
      {
        value: '99.9%',
        label: 'home.serviceBriefs.security.stats.uptime',
        icon: 'lucideServer'
      }
    ],
    primaryCta: {
      text: 'home.serviceBriefs.security.cta.primary',
      route: '/services/security',
      style: 'primary',
      icon: 'lucideArrowRight'
    },
    layoutStyle: 'default',
    reverse: false
  };
}
```

### Template

```html
<app-service-brief-section [config]="securityConfig" />
```

### Multiple Sections

```html
<!-- Render multiple service briefs -->
<section id="service-briefs">
  <app-service-brief-section
    *ngFor="let brief of serviceBriefs; trackBy: trackByServiceBrief"
    [config]="brief">
  </app-service-brief-section>
</section>
```

## Configuration

### ServiceBriefConfig Interface

```typescript
interface ServiceBriefConfig {
  id: string;                      // Unique identifier
  badge: string;                   // Translation key for badge
  gradient: string;                // Tailwind gradient classes
  iconPath?: string;               // Optional icon SVG path
  illustrationPath?: string;       // Optional illustration path
  title: string;                   // Translation key for title
  subtitle: string;                // Translation key for subtitle
  description: string;             // Translation key for description
  highlights: ServiceHighlight[];  // Array of highlight items
  stats?: ServiceStat[];           // Optional stats array
  primaryCta: ServiceCta;          // Primary CTA button
  secondaryCta?: ServiceCta;       // Optional secondary CTA
  layoutStyle: 'default' | 'stats-first' | 'visual-heavy';
  reverse?: boolean;               // Reverse layout (image on left)
}
```

### ServiceHighlight Interface

```typescript
interface ServiceHighlight {
  icon: string;        // Lucide icon name (e.g., 'lucideShield')
  title: string;       // Translation key
  description: string; // Translation key
}
```

### ServiceStat Interface

```typescript
interface ServiceStat {
  value: string;   // Stat value (e.g., '99.9%', '150+', '24/7')
  label: string;   // Translation key
  icon?: string;   // Optional Lucide icon name
}
```

### ServiceCta Interface

```typescript
interface ServiceCta {
  text: string;  // Translation key
  route: string; // Route path (e.g., '/services/security')
  style: 'primary' | 'secondary' | 'outline';
  icon?: string; // Optional Lucide icon name
}
```

## Layout Variants

### Default Layout

60% content / 40% visual split with stats and illustration on the right.

```typescript
layoutStyle: 'default',
reverse: false
```

### Reversed Layout

Same as default but with visual elements on the left.

```typescript
layoutStyle: 'default',
reverse: true
```

### Stats-First Layout

Stats displayed prominently before other visual elements.

```typescript
layoutStyle: 'stats-first'
```

### Visual-Heavy Layout

Larger visual elements with reduced content width.

```typescript
layoutStyle: 'visual-heavy'
```

## Gradient Options

Use Tailwind gradient classes with opacity modifiers:

```typescript
// Security (purple-to-navy)
gradient: 'from-accent-500/10 to-primary-600/10'

// Penetration Testing (navy-to-teal)
gradient: 'from-primary-600/10 to-secondary-500/10'

// DevOps (teal-to-navy)
gradient: 'from-secondary-500/10 to-primary-600/10'
```

## Icon Integration

The component uses Lucide icons. Make sure to import required icons in your component:

```typescript
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

@Component({
  providers: [
    provideIcons({
      lucideShield,
      lucideLock,
      // ... other icons
    })
  ]
})
```

## Translation Keys

The component expects translation keys in the following structure:

```json
{
  "home": {
    "serviceBriefs": {
      "security": {
        "badge": "Cybersecurity",
        "title": "Enterprise-Grade Cybersecurity",
        "subtitle": "Protect your business with 24/7 security monitoring",
        "description": "Our comprehensive cybersecurity solutions...",
        "highlights": {
          "soc": {
            "title": "24/7 SOC Monitoring",
            "description": "Round-the-clock security operations..."
          }
        },
        "stats": {
          "uptime": "Security Uptime",
          "monitoring": "SOC Coverage"
        },
        "cta": {
          "primary": "Explore Security Solutions",
          "secondary": "Request Security Assessment"
        }
      }
    }
  }
}
```

See `SERVICE_BRIEF_TRANSLATIONS.json` in the project root for complete examples.

## Animations

### Scroll-Triggered Animations

All animations are triggered when the section enters the viewport (80% from top):

- **Section fade-in**: 0.8s duration
- **Badge**: 0.6s with 0.2s delay
- **Title**: 0.7s with 0.3s delay
- **Subtitle**: 0.6s with 0.4s delay
- **Description**: 0.6s with 0.5s delay
- **Highlights**: Staggered 0.1s per item, starting at 0.6s delay
- **CTAs**: Staggered 0.1s per button, starting at 0.8s delay
- **Stats**: Scale animation with back ease, 0.7s delay
- **Stat counters**: 2s duration from 0 to target value
- **Illustration**: 1s duration with 0.5s delay

### Reduced Motion

All animations are disabled when user prefers reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

## Styling

### Glassmorphism Effect

```scss
bg-white/70 dark:bg-gray-800/70 backdrop-blur-md
border border-gray-200/50 dark:border-gray-700/50
```

### Hover Effects

- **Highlight cards**: Translate up 2px with shadow increase
- **CTA buttons**: Scale 1.05 with shimmer effect
- **Stats**: Translate up 4px and scale 1.02

### Dark Mode

Component automatically adapts to dark mode with proper contrast ratios.

## Accessibility

- ✅ Semantic HTML5 structure
- ✅ ARIA labels on decorative elements (`aria-hidden="true"`)
- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ Color contrast WCAG 2.1 AA compliant
- ✅ Screen reader compatible
- ✅ Reduced motion support

## Performance

- **OnPush Change Detection**: Optimizes Angular change detection cycles
- **TrackBy Functions**: Prevents unnecessary re-renders in ngFor loops
- **Lazy Loading**: Images use `loading="lazy"` attribute
- **GPU Acceleration**: Transform and opacity animations only
- **ScrollTrigger Cleanup**: All GSAP animations cleaned up in `ngOnDestroy`

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Android (last 2 versions)

## Files

```
service-brief-section/
├── service-brief-section.component.ts       # Component logic
├── service-brief-section.component.html     # Template
├── service-brief-section.component.scss     # Styles
├── service-brief-section.interfaces.ts      # TypeScript interfaces
├── index.ts                                 # Barrel export
└── README.md                                # This file
```

## Examples

See the home page implementation at:
- Component: `/src/app/features/home/home.component.ts`
- Template: `/src/app/features/home/home.component.html`
- Translations: `/SERVICE_BRIEF_TRANSLATIONS.json`

## License

Copyright © 2024 Roaya IT. All rights reserved.
