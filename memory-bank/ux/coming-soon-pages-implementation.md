# Coming Soon Pages Implementation Report

> **Created:** 2025-01-03
> **Updated:** 2025-01-03
> **Status:** Implemented with Light/Dark Theme Support
> **Routes:** `/resources/whitepapers`, `/resources/documentation`

---

## Overview

Implemented "Coming Soon" pages for Whitepapers and Documentation sections of the Resources hub with a modern tech/futuristic visual design. **Supports both light and dark themes** following the same pattern as the home page.

---

## Design Concept: Tech Vanguard

### Visual Direction
- **Style:** Futuristic Tech Command Center
- **Aesthetic:** Dark glassmorphism with circuit patterns, scanning lines, particle effects, and glowing elements
- **Mood:** Sophisticated, cutting-edge, anticipatory, premium

### Key Visual Elements
1. **Gradient Orbs** - 3 floating radial gradients for depth (purple, teal, navy) - adapts to theme
2. **Circuit Grid** - SVG pattern with animated scanning line - adapts to theme
3. **Particle Effects** - 40 floating dots with GSAP drift animations - adapts to theme
4. **Glassmorphism Card** - Central content card with blur and glow effects - adapts to theme
5. **Corner Dots** - Pulsing glow indicators at card corners
6. **Gradient Text** - Animated gradient headline (consistent across themes)

---

## Color Palette

### Light Mode
```css
--cs-bg-start: #f8fafc;           /* Light gray background */
--cs-bg-mid: #e2e8f0;
--cs-bg-end: #cbd5e1;
--cs-glass-bg: rgba(255, 255, 255, 0.85);
--cs-glass-border: rgba(61, 90, 128, 0.2);
--cs-text-primary: #1f2937;
--cs-text-secondary: #4b5563;
--cs-orb-purple: rgba(107, 76, 154, 0.15);
--cs-orb-teal: rgba(93, 183, 194, 0.12);
```

### Dark Mode
```css
--cs-bg-start: #0f1a28;           /* Deep navy background */
--cs-bg-mid: #192532;
--cs-bg-end: #203047;
--cs-glass-bg: rgba(32, 48, 71, 0.8);
--cs-glass-border: rgba(93, 183, 194, 0.15);
--cs-text-primary: #ffffff;
--cs-text-secondary: #d1d5db;
--cs-orb-purple: rgba(107, 76, 154, 0.35);
--cs-orb-teal: rgba(93, 183, 194, 0.25);
```

### Gradient Text (Both Themes)
```css
background: linear-gradient(135deg, #5DB7C2 0%, #6B4C9A 50%, #5DB7C2 100%);
```

---

## Files Created

### Component Files
| File | Purpose |
|------|---------|
| `src/app/features/resources/coming-soon/coming-soon.component.ts` | Shared Coming Soon component with animations |
| `src/app/features/resources/coming-soon/coming-soon.component.html` | Template with glassmorphism card and form |
| `src/app/features/resources/coming-soon/coming-soon.component.scss` | Styles with animations and RTL support |
| `src/app/features/resources/whitepapers/whitepapers.component.ts` | Wrapper for whitepapers page |
| `src/app/features/resources/documentation/documentation.component.ts` | Wrapper for documentation page |

### Updated Files
| File | Changes |
|------|---------|
| `src/app/app.routes.ts` | Added routes for `/resources/whitepapers` and `/resources/documentation` |
| `src/assets/i18n/en.json` | Added `resources.whitepapers.comingSoon.*` and `resources.documentation.comingSoon.*` |
| `src/assets/i18n/ar.json` | Added Arabic translations for both coming soon pages |

---

## Component Architecture

```
ComingSoonComponent (shared)
├── Input: type = 'whitepapers' | 'documentation'
├── Features:
│   ├── GSAP particle animations
│   ├── Scanning line effect
│   ├── Email subscription form
│   ├── Success/error states
│   ├── Analytics tracking
│   └── SEO meta tags
│
├── WhitepapersComponent (wrapper)
│   └── <app-coming-soon type="whitepapers" />
│
└── DocumentationComponent (wrapper)
    └── <app-coming-soon type="documentation" />
```

---

## Translation Keys

### English (en.json)
```
resources.whitepapers.comingSoon.meta.title
resources.whitepapers.comingSoon.meta.description
resources.whitepapers.comingSoon.hero.badge
resources.whitepapers.comingSoon.hero.title
resources.whitepapers.comingSoon.hero.subtitle
resources.whitepapers.comingSoon.description
resources.whitepapers.comingSoon.subscription.label
resources.whitepapers.comingSoon.subscription.emailPlaceholder
resources.whitepapers.comingSoon.subscription.submitButton
resources.whitepapers.comingSoon.subscription.submitting
resources.whitepapers.comingSoon.subscription.success.title
resources.whitepapers.comingSoon.subscription.success.description
resources.whitepapers.comingSoon.subscription.error.title
resources.whitepapers.comingSoon.subscription.error.description
resources.whitepapers.comingSoon.launch.hint
```

Same structure for `resources.documentation.comingSoon.*`

---

## Features

### Animations (GSAP-powered)
- **Particle drift** - 40 particles with random movement
- **Scanning line** - Vertical sweep animation
- **Card fade-in** - Entrance animation
- **Corner dots stagger** - Sequential pulse entrance
- **Gradient text animation** - Color shift effect
- **Success checkmark** - Scale-up animation

### Accessibility (WCAG 2.1 AA)
- Reduced motion support (`prefers-reduced-motion`)
- Semantic HTML structure
- ARIA labels on decorative elements
- Keyboard-accessible form
- High contrast text on dark background

### RTL Support
- Gradient orbs repositioned
- Arrow icon rotation
- Text alignment

### Responsive Breakpoints
- Mobile: 375px - 639px (reduced padding, smaller headline)
- Tablet: 640px - 1023px (medium sizing)
- Desktop: 1024px+ (full experience)

---

## Email Subscription Flow

1. User enters email address
2. Submitting state shows "Subscribing..."
3. Analytics event tracked
4. **TODO:** Connect to backend API
5. Success message with checkmark animation
6. Error state if subscription fails

---

## Routes Configuration

```typescript
{
  path: 'resources/whitepapers',
  loadComponent: () => import('./features/resources/whitepapers/whitepapers.component').then(m => m.WhitepapersComponent),
  title: 'Whitepapers Coming Soon - Roaya IT'
},
{
  path: 'resources/documentation',
  loadComponent: () => import('./features/resources/documentation/documentation.component').then(m => m.DocumentationComponent),
  title: 'Documentation Coming Soon - Roaya IT'
}
```

---

## Build Status

- **Build:** Successful
- **Errors:** None
- **Warnings:** Bundle size (expected, unrelated to this feature)

---

## Next Steps

1. [ ] Connect email subscription to backend API (HubSpot or custom)
2. [ ] Add Google Analytics 4 event tracking for subscriptions
3. [ ] Create actual Whitepapers content when ready
4. [ ] Create Documentation portal when ready
5. [ ] Update launch timeline hints as dates approach

---

## Design References

**Inspiration Sources:**
- Dark Glassmorphism trends 2025-2026
- Awwwards Coming Soon examples
- Particle.js animation patterns
- GSAP scroll-triggered animations

**Design Patterns:**
- Glassmorphism card with backdrop-filter
- Animated gradient text
- Floating gradient orbs for depth
- Circuit grid pattern for tech aesthetic
- Pulsing corner dots for visual interest

---

## Theme Implementation Pattern

Following the home page pattern:

### CSS Custom Properties
```scss
// Light mode defaults
:host {
  --cs-bg-start: #f8fafc;
  --cs-glass-bg: rgba(255, 255, 255, 0.85);
  // ...
}

// Dark mode overrides
:host-context(.dark) {
  --cs-bg-start: #0f1a28;
  --cs-glass-bg: rgba(32, 48, 71, 0.8);
  // ...
}
```

### Tailwind Dark Mode Classes
```html
<div class="text-teal-600 dark:text-teal-400">
<div class="bg-teal-500 dark:bg-teal-400">
<div class="opacity-30 dark:opacity-20">
```

### Theme-Aware Particles
Particles detect theme on initialization and use appropriate colors:
- Dark mode: Teal particles (`rgba(93, 183, 194, opacity)`)
- Light mode: Navy particles (`rgba(61, 90, 128, opacity)`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-03 | Initial implementation with tech visuals, EN/AR translations, GSAP animations |
| 1.1.0 | 2025-01-03 | Added light/dark theme support using CSS custom properties and `:host-context(.dark)` pattern |
