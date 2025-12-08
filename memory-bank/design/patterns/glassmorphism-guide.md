# Glassmorphism Implementation Guide

> **Reference:** `/src/app/features/contact/contact.component.scss`
> **Last Updated:** 2025-12-06

## Overview

Glassmorphism (frosted glass effect) is a modern UI design trend that creates depth, transparency, and visual hierarchy. This guide covers production-ready implementation patterns with performance optimization, browser compatibility, and accessibility considerations.

---

## Table of Contents

1. [What is Glassmorphism](#what-is-glassmorphism)
2. [Core CSS Properties](#core-css-properties)
3. [Standard Glass Cards](#standard-glass-cards)
4. [Glass Variations](#glass-variations)
5. [Performance Optimization](#performance-optimization)
6. [Browser Compatibility](#browser-compatibility)
7. [Accessibility Concerns](#accessibility-concerns)
8. [When to Use (and Not Use)](#when-to-use-and-not-use)
9. [Troubleshooting](#troubleshooting)

---

## What is Glassmorphism

Glassmorphism creates a "frosted glass" effect through:
- **Semi-transparent background** (rgba with alpha < 1)
- **Backdrop blur** (blurs content behind the element)
- **Subtle border** (usually white/light with low opacity)
- **Light shadow** (for depth perception)

### Visual Anatomy
```
┌─────────────────────────────────┐
│  ╔═══════════════════════════╗  │ ← Subtle border (white/20%)
│  ║                           ║  │
│  ║     Blurred Background    ║  │ ← Backdrop blur (10-30px)
│  ║     + Semi-transparent    ║  │ ← Background rgba
│  ║     + Shadow              ║  │ ← Box shadow for depth
│  ║                           ║  │
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

---

## Core CSS Properties

### Essential Properties

```scss
.glass-element {
  /* Semi-transparent background */
  background: rgba(255, 255, 255, 0.7);  // Light mode (70% opacity)

  /* Backdrop blur (key property) */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);   // Safari support

  /* Border for definition */
  border: 1px solid rgba(255, 255, 255, 0.6);

  /* Shadow for depth */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Rounded corners (optional but common) */
  border-radius: 1rem;
}
```

### Dark Mode Variant

```scss
.dark .glass-element {
  background: rgba(30, 41, 59, 0.5);     // Dark mode (50% opacity)
  border: 1px solid rgba(71, 85, 105, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## Standard Glass Cards

### Pattern: Basic Glass Card

**Use Case:** General purpose glass card for content

```scss
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  }

  // Fallback for browsers without backdrop-filter
  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(255, 255, 255, 0.95);
  }
}

.dark .glass-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.4);
}
```

### Pattern: Ultra-Bright Glass (Hero Sections)

**Use Case:** Glass elements on dark backgrounds (hero sections, overlays)

```scss
.glass-hero {
  background: rgba(255, 255, 255, 0.1);  // More transparent
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

**HTML Example:**
```html
<div class="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
  <div class="glass-hero inline-flex items-center gap-2 px-4 py-2 rounded-full">
    <span class="text-sm font-medium text-white/90">Available 24/7</span>
  </div>
</div>
```

---

## Glass Variations

### 1. Heavy Glass (Strong Blur)

**Use Case:** Modals, popovers, overlays where you want to emphasize separation

```scss
.glass-heavy {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(30px);           // Stronger blur
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.15);
}
```

### 2. Light Glass (Subtle Blur)

**Use Case:** Subtle overlays, navigation bars, floating elements

```scss
.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);           // Lighter blur
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
```

### 3. Glass with Gradient Border

**Use Case:** Premium cards, featured content

```scss
.glass-gradient-border {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 1rem;

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(135deg, rgba(93, 183, 194, 0.5), rgba(107, 76, 154, 0.5));
    border-radius: inherit;
    z-index: -1;
  }
}
```

**Tailwind Utility Class:**
```html
<div class="relative">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl blur"></div>
  <div class="relative bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-primary-700/40">
    <!-- Content -->
  </div>
</div>
```

### 4. Glass with Glow on Hover

**Use Case:** Interactive cards, clickable elements

```scss
.glass-glow {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(93, 183, 194, 0.4), rgba(107, 76, 154, 0.4));
    border-radius: inherit;
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover::before {
    opacity: 1;
  }
}
```

---

## Performance Optimization

### 1. GPU Acceleration

Glassmorphism uses GPU-intensive `backdrop-filter`. Always enable GPU acceleration:

```scss
.glass-element {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  // Force GPU acceleration
  transform: translateZ(0);
  -webkit-transform: translateZ(0);

  // Alternatively
  will-change: backdrop-filter;
}
```

### 2. Limit Blur Area

Only apply glassmorphism to small areas, not full-page overlays:

```scss
// ❌ Bad: Full-page glass (very expensive)
.page-overlay {
  backdrop-filter: blur(20px);
  width: 100vw;
  height: 100vh;
}

// ✅ Good: Small glass cards
.card {
  backdrop-filter: blur(20px);
  width: 300px;
  height: 200px;
}
```

### 3. Reduce Blur on Mobile

Mobile devices have limited GPU power:

```scss
.glass-card {
  backdrop-filter: blur(20px);

  @media (max-width: 768px) {
    backdrop-filter: blur(10px);  // Reduce blur on mobile
  }
}
```

### 4. Disable on Low-End Devices

```typescript
const isLowEndDevice = navigator.hardwareConcurrency <= 4 && window.innerWidth < 768;

if (isLowEndDevice) {
  document.documentElement.classList.add('no-glass');
}
```

```scss
.no-glass .glass-card {
  backdrop-filter: none !important;
  background: rgba(255, 255, 255, 0.95);
}
```

---

## Browser Compatibility

### Support Matrix

| Browser | Backdrop Filter | Fallback Needed? |
|---------|-----------------|------------------|
| Chrome 76+ | ✅ Full Support | No |
| Firefox 103+ | ✅ Full Support | No |
| Safari 9+ | ✅ Full Support (with -webkit-) | No |
| Edge 79+ | ✅ Full Support | No |
| IE 11 | ❌ No Support | **Yes** |

### Fallback Strategy

Always provide a fallback for browsers without `backdrop-filter`:

```scss
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  // Fallback: Use higher opacity when backdrop-filter not supported
  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

### Feature Detection

```typescript
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(20px)') ||
                               CSS.supports('-webkit-backdrop-filter', 'blur(20px)');

if (!supportsBackdropFilter) {
  console.warn('Backdrop filter not supported, using fallback styles');
}
```

---

## Accessibility Concerns

### 1. Contrast Ratio

Glass effects reduce contrast. Always check:

```scss
// ❌ Bad: Low contrast text on glass
.glass-card {
  background: rgba(255, 255, 255, 0.3);  // Too transparent
  color: #999;  // Low contrast
}

// ✅ Good: High contrast text
.glass-card {
  background: rgba(255, 255, 255, 0.7);  // Higher opacity
  color: #1f2937;  // High contrast (WCAG AA)
}
```

**Test with:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Target: ≥ 4.5:1 for normal text, ≥ 3:1 for large text

### 2. High Contrast Mode

Disable glassmorphism in high contrast mode:

```scss
@media (prefers-contrast: high) {
  .glass-card {
    backdrop-filter: none !important;
    background: var(--color-background);
    border: 2px solid var(--color-border);
  }
}
```

### 3. Reduced Motion

Disable blur transitions for users with motion sensitivity:

```scss
@media (prefers-reduced-motion: reduce) {
  .glass-card {
    transition: none !important;
  }
}
```

---

## When to Use (and Not Use)

### ✅ Good Use Cases

1. **Hero Sections** - Badge overlays, call-out boxes
2. **Navigation Bars** - Transparent header that reveals background
3. **Modal Overlays** - Emphasize separation from main content
4. **Card Components** - Modern, premium aesthetic
5. **Floating Elements** - Tooltips, popovers, dropdowns
6. **Image Overlays** - Text over images with readability

### ❌ Avoid Using Glass For

1. **Solid Backgrounds** - No blur effect visible, wastes GPU
2. **Small UI Elements** - Icons, badges (hard to see blur)
3. **Low Contrast Situations** - Accessibility risk
4. **Data Tables** - Readability issues
5. **Text-Heavy Content** - Reduces legibility
6. **Full-Page Overlays** - Severe performance impact

---

## CSS Variable Approach

### Define Glass Variables

```scss
:root {
  --glass-bg-light: rgba(255, 255, 255, 0.7);
  --glass-border-light: rgba(255, 255, 255, 0.6);
  --glass-blur: 20px;
}

[data-theme="dark"] {
  --glass-bg-light: rgba(30, 41, 59, 0.5);
  --glass-border-light: rgba(71, 85, 105, 0.4);
}

.glass-card {
  background: var(--glass-bg-light);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-light);
}
```

---

## Tailwind CSS Utilities

### Custom Tailwind Classes

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      }
    }
  },
  plugins: []
}
```

### Usage

```html
<!-- Standard glass card -->
<div class="bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 rounded-xl shadow-lg">
  Content
</div>

<!-- Light glass -->
<div class="bg-white/50 backdrop-blur-md border border-white/40 rounded-lg">
  Content
</div>

<!-- Heavy glass -->
<div class="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-2xl">
  Content
</div>
```

---

## Troubleshooting

### Issue: Blur not visible

**Cause:** Solid background behind glass element

**Solution:** Ensure there's visual content (gradient, image, pattern) behind the glass

```html
<!-- ❌ Won't show blur -->
<div class="bg-white">
  <div class="backdrop-blur-xl">Glass card</div>
</div>

<!-- ✅ Shows blur -->
<div class="bg-gradient-to-br from-primary-900 to-accent-900">
  <div class="backdrop-blur-xl">Glass card</div>
</div>
```

### Issue: Performance lag

**Cause:** Too many glass elements or large blur areas

**Solutions:**
1. Reduce blur amount (20px → 10px)
2. Limit number of glass elements on page
3. Disable on mobile
4. Use `will-change: backdrop-filter` sparingly

### Issue: Border not visible

**Cause:** Border color blends with background

**Solution:** Increase border opacity or use contrasting color

```scss
// ❌ Invisible border
border: 1px solid rgba(255, 255, 255, 0.1);

// ✅ Visible border
border: 1px solid rgba(255, 255, 255, 0.6);
```

### Issue: Text hard to read

**Cause:** Low background opacity or insufficient blur

**Solution:** Increase background opacity or add text shadow

```scss
.glass-card {
  background: rgba(255, 255, 255, 0.8);  // Increase from 0.5

  h1, h2, h3, p {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

---

## Production Checklist

Before shipping glassmorphism:

- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Provide fallback for non-supporting browsers
- [ ] Check contrast ratios (WCAG AA: ≥ 4.5:1)
- [ ] Test in dark mode
- [ ] Test with `prefers-contrast: high`
- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Profile performance (target: 60fps)
- [ ] Reduce blur on mobile devices
- [ ] Ensure content behind glass is visible
- [ ] Test keyboard navigation
- [ ] Validate with Lighthouse accessibility audit

---

## Tools & Resources

- **Glassmorphism Generator:** https://glassmorphism.com/
- **CSS Glass Visualizer:** https://css.glass/
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Can I Use (backdrop-filter):** https://caniuse.com/css-backdrop-filter

---

## Examples from Contact Page

### Hero Badge
```html
<div class="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-secondary-500/10">
  <span class="relative flex h-2.5 w-2.5">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
  </span>
  <span class="text-sm font-medium text-white/90">Available 24/7</span>
</div>
```

### Contact Info Card
```html
<div class="relative flex items-start gap-4 p-4 bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
  <!-- Content -->
</div>
```

### Form Card
```html
<div class="relative bg-white/80 dark:bg-primary-900/60 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-primary-700/40 p-6 md:p-8 lg:p-10 shadow-2xl">
  <!-- Form content -->
</div>
```

---

**Last Updated:** 2025-12-06 | **Author:** Product Orchestrator
