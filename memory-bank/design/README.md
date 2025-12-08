# Design System Documentation

> **Version:** 1.0.0
> **Last Updated:** 2025-12-06
> **Owner:** UI Design Expert + UX Engineer

## Overview

This directory contains comprehensive design documentation for the Roaya IT corporate website. The design system combines modern UI trends (glassmorphism, 3D effects, GSAP animations) with enterprise-grade accessibility and performance standards.

## Design Philosophy

### Core Principles

1. **Modern Premium Aesthetic**
   - Glassmorphism effects for depth and sophistication
   - 3D floating elements for visual interest
   - Smooth GSAP animations for professional polish
   - Gradient overlays and glow effects

2. **Accessibility First**
   - WCAG 2.1 AA compliance
   - Reduced motion support for accessibility
   - High contrast mode compatibility
   - Keyboard navigation and focus states

3. **Performance Conscious**
   - Hardware-accelerated animations (GPU)
   - Lazy loading for heavy assets
   - Conditional animations based on device capability
   - Optimized bundle size

4. **Bilingual & RTL Native**
   - Arabic (RTL) and English (LTR) support
   - Mirrored layouts for RTL
   - Font pairing: Inter (EN) + Tajawal (AR)

## Documentation Structure

```
design/
├── README.md                           # This file - design system overview
├── patterns/
│   ├── animation-patterns.md           # GSAP animation code snippets
│   ├── glassmorphism-guide.md         # Glass effects implementation
│   └── 3d-effects.md                   # 3D transforms and perspective
├── components/
│   ├── component-library.md            # Reusable component patterns
│   ├── form-patterns.md                # Form inputs and validation UI
│   └── button-patterns.md              # Button variants and states
└── styles/
    ├── color-palette.md                # Brand colors and usage
    ├── typography.md                   # Font scales and hierarchy
    └── spacing-grid.md                 # Layout spacing system
```

## Quick Reference

### Essential Files

| Document | Purpose | Use When |
|----------|---------|----------|
| `patterns/animation-patterns.md` | GSAP animation code snippets | Implementing page transitions, scroll effects, micro-interactions |
| `patterns/glassmorphism-guide.md` | Glass effect implementation | Creating cards, modals, overlays with glass effect |
| `components/component-library.md` | Reusable UI patterns | Building new pages with consistent components |
| `components/form-patterns.md` | Form design patterns | Creating contact forms, sign-up flows, inputs |
| `styles/color-palette.md` | Brand color system | Choosing colors for new features |

### Implementation Reference

The **Contact Page** (`/src/app/features/contact/`) serves as the **golden standard** implementation showcasing:
- Hero section with 3D floating elements
- Glassmorphism cards with hover effects
- GSAP scroll-triggered animations
- Magnetic button hover effects
- Parallax background elements
- Form validation with error states
- Success animations
- RTL support
- Accessibility features

## Design Tokens

### Color System

```scss
// Primary Colors (from Roaya logo)
--color-navy: #3D5A80;        // Primary brand color
--color-teal: #5DB7C2;        // Secondary brand color
--color-purple: #6B4C9A;      // Accent color

// Gradients
--gradient-primary: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
--gradient-accent: linear-gradient(135deg, #6B4C9A 0%, #3D5A80 100%);
--gradient-hero: linear-gradient(to bottom right, #3D5A80, #6B4C9A);

// Semantic Colors
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Typography Scale

```css
/* Headings */
--text-7xl: 4.5rem (72px)    /* Hero titles */
--text-6xl: 3.75rem (60px)   /* Page titles */
--text-5xl: 3rem (48px)      /* Section headers */
--text-4xl: 2.25rem (36px)   /* Subsection headers */
--text-3xl: 1.875rem (30px)  /* Card titles */
--text-2xl: 1.5rem (24px)    /* Small headings */

/* Body */
--text-xl: 1.25rem (20px)    /* Large body */
--text-lg: 1.125rem (18px)   /* Body large */
--text-base: 1rem (16px)     /* Body default */
--text-sm: 0.875rem (14px)   /* Small text */
--text-xs: 0.75rem (12px)    /* Caption */
```

### Spacing System (Tailwind)

```
4px   - space-1
8px   - space-2
12px  - space-3
16px  - space-4
20px  - space-5
24px  - space-6
32px  - space-8
40px  - space-10
48px  - space-12
64px  - space-16
80px  - space-20
96px  - space-24
```

## Animation Philosophy

### Performance Budget

- **Target:** 60fps for all animations
- **GPU Acceleration:** Use `transform` and `opacity` only
- **Avoid:** Animating `width`, `height`, `top`, `left`, `margin`, `padding`
- **Duration Sweet Spot:** 200-600ms for micro-interactions, 600-1200ms for page transitions

### GSAP Best Practices

1. **Timeline Organization:** Group related animations in timelines
2. **Stagger Effects:** Use for card grids and lists (0.1-0.2s delay)
3. **ScrollTrigger Cleanup:** Always kill triggers in `ngOnDestroy`
4. **Reduced Motion:** Respect `prefers-reduced-motion: reduce`

## Glassmorphism Guidelines

### Standard Glass Card

```scss
background: rgba(255, 255, 255, 0.7);        // Light mode
background: rgba(30, 41, 59, 0.5);           // Dark mode
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.6);  // Light mode
border: 1px solid rgba(71, 85, 105, 0.4);    // Dark mode
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### When to Use Glass Effects

✅ **Good For:**
- Hero sections with background images/gradients
- Modal overlays
- Card components over complex backgrounds
- Navigation bars with transparency
- Floating UI elements

❌ **Avoid:**
- Over solid backgrounds (wastes GPU resources)
- Small UI elements (hard to see blur effect)
- When accessibility/contrast is already challenging

## Component Anatomy

### Recommended Component Structure

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent implements AfterViewInit, OnDestroy {
  // ViewChild references for animations
  @ViewChild('section') section!: ElementRef;

  // Signals for reactive state
  isLoading = signal(false);

  // Animation cleanup
  private scrollTriggers: ScrollTrigger[] = [];

  ngAfterViewInit(): void {
    // Check reduced motion preference
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    // Clean up ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initAnimations(): void {
    gsap.registerPlugin(ScrollTrigger);
    // Animation code here...
  }
}
```

## Accessibility Checklist

### Must-Have for Every Component

- [ ] Semantic HTML5 elements (`<section>`, `<article>`, `<nav>`)
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] ARIA labels for icon-only buttons
- [ ] Focus indicators on all interactive elements (2px outline, 2px offset)
- [ ] Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- [ ] Keyboard navigation support (Tab, Enter, Escape)
- [ ] `prefers-reduced-motion` support (disable animations if set)
- [ ] Alt text for decorative images (`alt=""`) and meaningful images
- [ ] Form labels and error messages connected with `aria-describedby`
- [ ] Loading states announced to screen readers (`aria-live="polite"`)

## RTL (Right-to-Left) Support

### Key Patterns

```html
<!-- Icons that need flipping in RTL -->
<svg class="rtl:rotate-180">...</svg>

<!-- Positioning that needs mirroring -->
<div class="right-0 rtl:left-0 rtl:right-auto">...</div>

<!-- Directional margins/padding -->
<div class="ml-4 rtl:mr-4 rtl:ml-0">...</div>
```

### Tailwind RTL Classes

```css
rtl:rotate-180      /* Flip arrows, icons */
rtl:flex-row-reverse /* Reverse flex direction */
rtl:text-right      /* Text alignment */
rtl:left-0          /* Positioning */
rtl:mr-4            /* Margin/padding swap */
```

## Dark Mode Strategy

### CSS Variable Approach

```scss
// Light mode (default)
:root {
  --color-background: #FFFFFF;
  --color-foreground: #1f2937;
  --color-surface: #f9fafb;
}

// Dark mode
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-foreground: #f1f5f9;
  --color-surface: #1e293b;
}
```

### Testing Dark Mode

1. Toggle theme using ThemeService
2. Check contrast ratios in both modes
3. Verify glassmorphism still visible
4. Test all interactive states (hover, focus, active)

## Browser Support

### Primary Support (Full Features)

- Chrome/Edge 100+ (last 2 versions)
- Firefox 100+ (last 2 versions)
- Safari 15+ (last 2 versions)

### Graceful Degradation

- No `backdrop-filter` support → Fallback to solid backgrounds
- No CSS Grid → Fallback to Flexbox
- No GSAP → Static layout, no animations

### Polyfills & Fallbacks

```scss
// Backdrop filter fallback
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);

  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

## Performance Optimization

### Animation Performance

1. **Use GPU-accelerated properties:**
   ```scss
   transform: translateX(100px);  // ✅ GPU
   left: 100px;                   // ❌ CPU (reflow)
   ```

2. **Will-change hint:**
   ```scss
   .animated-element {
     will-change: transform, opacity;
   }
   ```

3. **Disable animations on mobile (optional):**
   ```scss
   @media (max-width: 768px) {
     .parallax-slow, .parallax-fast {
       display: none;
     }
   }
   ```

### Image Optimization

- Use WebP format with JPEG/PNG fallbacks
- Implement lazy loading (`loading="lazy"`)
- Serve responsive images with `srcset`
- Compress images (target: <200KB for hero images)

## Design System Governance

### Component Review Process

1. **Design Review:** UI Design Expert reviews mockups/prototypes
2. **UX Review:** UX Engineer validates user flows and accessibility
3. **Implementation:** Frontend Engineer builds component
4. **Code Review:** Code Reviewer checks implementation quality
5. **Design Validation:** Design Reviewer verifies visual fidelity
6. **Documentation:** Update this design system with new patterns

### When to Update Design Docs

- ✅ New reusable component created
- ✅ New animation pattern added
- ✅ Color palette or typography changes
- ✅ Accessibility pattern discovered
- ✅ Browser compatibility issue resolved

## Tools & Resources

### Design Inspiration

- **Awwwards:** Modern web design inspiration
- **Dribbble:** UI/UX design patterns
- **Mobbin:** Mobile-first UI patterns
- **Glassmorphism.com:** Glass effect generator

### Development Tools

- **GSAP Documentation:** https://greensock.com/docs/
- **Tailwind CSS Docs:** https://tailwindcss.com
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Chrome DevTools:** Lighthouse for performance audits

### Internal References

- **UX Specifications:** `/memory-bank/ux/ux-specifications.md`
- **Technical Architecture:** `/memory-bank/architecture/TECHNICAL_ARCHITECTURE.md`
- **CLAUDE.md:** `/roaya-website/CLAUDE.md`
- **Contact Page Implementation:** `/src/app/features/contact/`

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-06 | Initial design system documentation created | Product Orchestrator |

## Support & Questions

For design system questions or suggestions:
1. Review this documentation first
2. Check the Contact page implementation for reference
3. Consult UX Engineer or UI Design Expert agents
4. Propose changes via architecture decision records (ADRs)

---

**Remember:** Consistency is key. When in doubt, follow the Contact page implementation as the golden standard.
