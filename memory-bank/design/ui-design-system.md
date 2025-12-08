# Roaya IT UI Design System Guide

> **Version:** 1.0.0
> **Last Updated:** 2025-12-06
> **Status:** Active - Contact Page Implementation Complete
> **Purpose:** Comprehensive documentation of modern UI patterns, animations, and design decisions for reuse across the entire website

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Glassmorphism System](#glassmorphism-system)
5. [Animation Library](#animation-library)
6. [3D Elements](#3d-elements)
7. [Component Patterns](#component-patterns)
8. [Micro-interactions](#micro-interactions)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Accessibility Guidelines](#accessibility-guidelines)
11. [RTL Support](#rtl-support)
12. [Code Examples](#code-examples)

---

## Design Philosophy

### Modern Tech Aesthetic

The Roaya IT website combines **trendy visual effects** with **professional corporate design** to create a unique identity that positions the company as both innovative and trustworthy.

**Core Design Principles:**
- **Depth & Dimension:** Using glassmorphism, 3D transforms, and layered shadows
- **Motion & Delight:** Smooth GSAP animations that enhance, not distract
- **Clarity & Accessibility:** Beautiful design that serves all users
- **Performance First:** Optimized animations with reduced motion support
- **Bilingual Excellence:** Equal visual quality in English and Arabic (RTL)

**Design Inspiration Sources:**
This design system draws from current 2025 trends identified through research:

- **Glassmorphism Best Practices:** Semi-transparent surfaces with soft blurs create premium, futuristic interfaces ([Glassmorphism Trends 2025](https://www.designstudiouiux.com/blog/what-is-glassmorphism-ui-trend/))
- **GSAP Scroll Animations:** Cinematic scroll experiences with parallax and 3D transforms ([GSAP Modern Websites](https://devsync.tn/blog/top-gsap-animations-modern-websites/))
- **Dark Mode Excellence:** Strategic use of contrast and glow effects for modern UX ([Dark Mode Trends 2025](https://designindc.com/blog/dark-mode-web-design-seo-ux-trends-for-2025/))

**Brand Personality:**
- **Professional:** Enterprise-grade IT services
- **Innovative:** Cutting-edge technology solutions
- **Trustworthy:** Security and transparency first
- **Egyptian:** Local expertise with global standards

---

## Color System

### Brand Colors

#### Primary Navy (#3D5A80)
**Usage:** Primary brand color, CTAs, headings, primary buttons

```css
/* Light Mode */
--color-primary: #3D5A80;
--color-primary-hover: #2F4A6F;
--color-primary-active: #263D5E;
--color-primary-light: #5A7699;
--color-primary-lighter: #8AA3BF;
--color-primary-lightest: #C4D1E0;

/* Dark Mode */
--color-primary: #4A6A94;
--color-primary-hover: #5A7AA4;
--color-primary-active: #6A8AB4;
```

**Tailwind Classes:**
```
bg-primary-500 text-primary-600 border-primary-500
from-primary-600 to-primary-700 (gradients)
```

#### Secondary Teal (#5DB7C2)
**Usage:** Accents, hover states, interactive elements, secondary buttons

```css
/* Light Mode */
--color-secondary: #5DB7C2;
--color-secondary-hover: #4DA7B2;
--color-secondary-active: #3D97A2;
--color-secondary-light: #7DC7D1;
--color-secondary-lighter: #A0D7DF;
--color-secondary-lightest: #D0EBF0;

/* Dark Mode */
--color-secondary: #6DC7D2;
--color-secondary-hover: #7DD7E2;
--color-secondary-active: #8DE7F2;
```

**Tailwind Classes:**
```
bg-secondary-500 text-secondary-400 border-secondary-500
from-secondary-500 to-secondary-600 (gradients)
```

#### Accent Purple (#6B4C9A)
**Usage:** Highlights, badges, special elements, tertiary CTAs

```css
/* Light Mode */
--color-accent: #6B4C9A;
--color-accent-hover: #5B3C8A;
--color-accent-active: #4B2C7A;
--color-accent-light: #856CAA;
--color-accent-lighter: #A68FBF;
--color-accent-lightest: #D3C7E0;

/* Dark Mode */
--color-accent: #7B5CAA;
--color-accent-hover: #8B6CBA;
--color-accent-active: #9B7CCA;
```

**Tailwind Classes:**
```
bg-accent-500 text-accent-600 border-accent-500
from-accent-500 to-accent-600 (gradients)
```

### Gradients

#### Primary Gradient
**Usage:** Primary CTAs, hero sections, feature cards

```css
background: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
```

**Tailwind Class:**
```html
<div class="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500">
```

#### Accent Gradient
**Usage:** Special sections, premium features, highlights

```css
background: linear-gradient(135deg, #6B4C9A 0%, #5DB7C2 100%);
```

**Tailwind Class:**
```html
<div class="bg-gradient-to-br from-accent-500 to-secondary-500">
```

#### Multi-Color Gradient (Hero/CTA)
**Usage:** Large hero sections, full-width CTAs

```css
background: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 50%, #6B4C9A 100%);
```

**Tailwind Class:**
```html
<div class="bg-gradient-to-br from-primary-600 via-secondary-500 to-accent-600">
```

### Glow Colors

**Usage:** Hover effects, focus states, card highlights

```scss
// Secondary Glow (Teal)
.glow-secondary {
  box-shadow: 0 0 20px rgba(93, 183, 194, 0.3);
}

// Accent Glow (Purple)
.glow-accent {
  box-shadow: 0 0 20px rgba(107, 76, 154, 0.3);
}

// Primary Glow (Navy)
.glow-primary {
  box-shadow: 0 0 20px rgba(61, 90, 128, 0.3);
}
```

**Tailwind Implementation:**
```html
<!-- Glow on hover -->
<div class="shadow-lg hover:shadow-secondary-500/50 transition-shadow">
```

### Semantic Colors

#### Success (Green)
```css
--color-success: #10B981; /* Light */
--color-success: #34D399; /* Dark */
```

#### Warning (Amber)
```css
--color-warning: #F59E0B; /* Light */
--color-warning: #FBBF24; /* Dark */
```

#### Error (Red)
```css
--color-error: #EF4444; /* Light */
--color-error: #F87171; /* Dark */
```

#### Info (Blue)
```css
--color-info: #3B82F6; /* Light */
--color-info: #60A5FA; /* Dark */
```

### Dark Mode Variants

**Color Adjustments for Dark Mode:**
- Increased luminosity for brand colors (+10-15%)
- Reduced opacity for backgrounds (90% → 60%)
- Enhanced glow effects (opacity +20%)
- Adjusted text contrast (WCAG AAA compliant)

**Dark Mode Background Palette:**
```css
--color-background: #0F1B2A; /* Deep navy */
--color-surface: #1A2332; /* Elevated surface */
--color-surface-hover: #243041; /* Hover state */
--color-overlay: rgba(0, 0, 0, 0.7); /* Modals/overlays */
```

---

## Typography

### Font Families

#### English: Inter
**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

**CSS Variable:**
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Characteristics:**
- Modern sans-serif with excellent readability
- Optimized for digital screens
- Wide range of weights (300-800)
- Tight letter-spacing for headings

#### Arabic: Tajawal
**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
```

**CSS Variable:**
```css
--font-family-arabic: 'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**RTL Application:**
```css
html[dir="rtl"] body {
  font-family: var(--font-family-arabic);
}
```

**Characteristics:**
- Clean Arabic font with modern aesthetics
- Excellent legibility for RTL text
- Matches Inter's visual weight
- Wide weight range for hierarchy

### Size Scale

**Fluid Typography System:**

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `xs` | 12px (0.75rem) | 1rem | Captions, badges, footnotes |
| `sm` | 14px (0.875rem) | 1.25rem | Small text, helper text |
| `base` | 16px (1rem) | 1.5rem | Body text, default |
| `lg` | 18px (1.125rem) | 1.75rem | Large body, card descriptions |
| `xl` | 20px (1.25rem) | 1.75rem | Subheadings, featured text |
| `2xl` | 24px (1.5rem) | 2rem | H5, small headlines |
| `3xl` | 30px (1.875rem) | 2.25rem | H4, section headers |
| `4xl` | 36px (2.25rem) | 2.5rem | H3, page titles |
| `5xl` | 48px (3rem) | 1.16 | H2, large headers |
| `6xl` | 60px (3.75rem) | 1.16 | H1, hero titles |
| `7xl` | 72px (4.5rem) | 1.16 | Display headlines |

**Tailwind Usage:**
```html
<h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold">Hero Title</h1>
<p class="text-base lg:text-lg text-neutral-600">Body content</p>
```

### Weight Usage

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Decorative text, subtle emphasis |
| Normal | 400 | Body text, paragraphs |
| Medium | 500 | Emphasized body, labels |
| Semibold | 600 | Subheadings, button text |
| Bold | 700 | Headings H2-H6 |
| Extrabold | 800 | H1, hero titles, impact text |

**CSS Variables:**
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

**Tailwind Classes:**
```html
<h1 class="font-extrabold">Main Heading</h1>
<h2 class="font-bold">Section Heading</h2>
<button class="font-semibold">Call to Action</button>
<p class="font-normal">Body text content</p>
```

### Letter Spacing

**Heading Adjustments:**
```css
h1 {
  letter-spacing: -0.02em; /* Tighter for large text */
}

h2 {
  letter-spacing: -0.01em; /* Slightly tight */
}

/* H3-H6: Default (0) */
```

**Body Text:**
```css
body {
  letter-spacing: 0; /* Default */
}

.text-sm {
  letter-spacing: 0.01em; /* Slightly wider for small text */
}
```

---

## Glassmorphism System

### Philosophy

Glassmorphism creates **depth and hierarchy** through layered transparency, backdrop blur, and subtle borders. It's applied to:
- Cards and panels
- Navigation elements
- Form containers
- Floating UI components
- Modals and overlays

**Key Characteristics:**
1. Semi-transparent backgrounds (opacity: 0.5-0.8)
2. Backdrop blur filters (10px-40px)
3. Subtle borders with transparency
4. Layered shadows for depth
5. Gradient backgrounds visible through glass

### Glass Variants

#### Light Glass
**Usage:** Subtle overlays, secondary cards, low-emphasis containers

**CSS:**
```css
.glass-light {
  background: rgba(255, 255, 255, 0.5); /* Light mode */
  background: rgba(30, 41, 59, 0.3); /* Dark mode */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
```

**Tailwind Classes:**
```html
<div class="bg-white/50 dark:bg-primary-900/30 backdrop-blur-md border border-white/30 dark:border-primary-700/30 shadow-md">
  Light glass card
</div>
```

#### Medium Glass (Default)
**Usage:** Primary cards, contact info cards, form containers

**CSS:**
```css
.glass-medium {
  background: rgba(255, 255, 255, 0.7); /* Light mode */
  background: rgba(30, 41, 59, 0.5); /* Dark mode */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

**Tailwind Classes:**
```html
<div class="bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 shadow-lg">
  Medium glass card
</div>
```

**Example from Contact Page:**
```html
<!-- Contact Info Card -->
<div class="relative flex items-start gap-4 p-4
            bg-white/70 dark:bg-primary-900/50
            backdrop-blur-xl
            rounded-xl
            border border-white/60 dark:border-primary-700/40
            shadow-lg hover:shadow-xl
            transition-all duration-300
            group-hover:-translate-y-1">
  <!-- Card content -->
</div>
```

#### Strong Glass
**Usage:** Main form container, featured sections, modals

**CSS:**
```css
.glass-strong {
  background: rgba(255, 255, 255, 0.8); /* Light mode */
  background: rgba(30, 41, 59, 0.6); /* Dark mode */
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

**Tailwind Classes:**
```html
<div class="bg-white/80 dark:bg-primary-900/60 backdrop-blur-2xl border border-white/60 dark:border-primary-700/40 shadow-2xl">
  Strong glass container
</div>
```

**Example from Contact Page (Form Container):**
```html
<div class="relative bg-white/80 dark:bg-primary-900/60
            backdrop-blur-2xl
            rounded-2xl
            border border-white/60 dark:border-primary-700/40
            p-6 md:p-8 lg:p-10
            shadow-2xl">
  <form><!-- Form content --></form>
</div>
```

### Backdrop Blur Values

| Blur Level | Pixels | Tailwind Class | Usage |
|------------|--------|----------------|-------|
| None | 0px | `backdrop-blur-none` | No blur effect |
| Small | 4px | `backdrop-blur-sm` | Minimal frosting |
| Medium | 12px | `backdrop-blur-md` | Light glass |
| Large | 16px | `backdrop-blur-lg` | Medium glass |
| XL | 24px | `backdrop-blur-xl` | Default glass |
| 2XL | 40px | `backdrop-blur-2xl` | Strong glass |
| 3XL | 64px | `backdrop-blur-3xl` | Maximum frosting |

### Border Styles

**Standard Glass Border:**
```css
border: 1px solid rgba(255, 255, 255, 0.6); /* Light mode */
border: 1px solid rgba(71, 85, 105, 0.4); /* Dark mode */
```

**Enhanced Border (with gradient):**
```css
border: 1px solid;
border-image: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.8),
  rgba(255, 255, 255, 0.2)
) 1;
```

### Glow Effects on Glass

**Hover Glow:**
```html
<!-- Glow background layer -->
<div class="absolute -inset-0.5
            bg-gradient-to-r from-secondary-500 to-accent-500
            opacity-0 group-hover:opacity-100
            blur transition-opacity duration-500
            rounded-2xl">
</div>

<!-- Glass card on top -->
<div class="relative bg-white/70 backdrop-blur-xl ...">
  Content
</div>
```

**Focus Glow (Form Inputs):**
```html
<div class="group">
  <input class="..." />
  <!-- Focus glow -->
  <div class="absolute inset-0 rounded-xl
              bg-gradient-to-r from-secondary-500/20 to-accent-500/20
              opacity-0 group-focus-within:opacity-100
              -z-10 blur transition-opacity duration-300">
  </div>
</div>
```

---

## Animation Library

### GSAP Setup and Configuration

**Installation:**
```bash
npm install gsap
```

**Import in Component:**
```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin
gsap.registerPlugin(ScrollTrigger);
```

**Basic Configuration:**
```typescript
ngAfterViewInit(): void {
  // Check for reduced motion preference
  this.prefersReducedMotion.set(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  if (!this.prefersReducedMotion()) {
    this.initAnimations();
  }
}

ngOnDestroy(): void {
  // Clean up all ScrollTriggers
  this.scrollTriggers.forEach(trigger => trigger.kill());
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
```

### Scroll-Triggered Animations

#### Fade In on Scroll
**Usage:** Revealing content as user scrolls

```typescript
const trigger = ScrollTrigger.create({
  trigger: '.content-section',
  start: 'top 80%', // When top of element hits 80% of viewport
  onEnter: () => {
    gsap.from('.content-section', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out'
    });
  },
  once: true // Only trigger once
});
```

**Tailwind Alternative (CSS only):**
```html
<div class="opacity-0 translate-y-10 transition-all duration-700 ease-out [&.visible]:opacity-100 [&.visible]:translate-y-0">
  Content appears on scroll
</div>
```

#### Stagger Animation (Multiple Items)
**Usage:** Cards, list items, feature grids

```typescript
const trigger = ScrollTrigger.create({
  trigger: '.card-container',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.card-item', {
      opacity: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.1, // 100ms delay between each item
      ease: 'power3.out'
    });
  },
  once: true
});
```

**Contact Page Example:**
```typescript
// Contact info cards stagger animation
const trigger1 = ScrollTrigger.create({
  trigger: '.contact-info-container',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.contact-info-card', {
      opacity: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  },
  once: true
});
```

### Parallax Effects

#### Basic Parallax
**Usage:** Background elements moving slower than scroll

```typescript
gsap.to('.parallax-slow', {
  y: 100,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1 // Smooth scrubbing (1 second lag)
  }
});
```

#### Multi-Speed Parallax
**Usage:** Creating depth with multiple layers

```typescript
// Slow layer (background)
gsap.to('.parallax-slow', {
  y: 100,
  scrollTrigger: {
    trigger: '.hero-section',
    scrub: 1
  }
});

// Fast layer (foreground)
gsap.to('.parallax-fast', {
  y: 200,
  scrollTrigger: {
    trigger: '.hero-section',
    scrub: 1
  }
});
```

**HTML Structure:**
```html
<section class="hero-section relative overflow-hidden">
  <!-- Slow parallax layer -->
  <div class="parallax-slow absolute top-0 right-0 w-[600px] h-[600px]
              bg-gradient-to-br from-secondary-500/30 to-transparent
              rounded-full blur-3xl">
  </div>

  <!-- Fast parallax layer -->
  <div class="parallax-fast absolute bottom-0 left-0 w-[500px] h-[500px]
              bg-gradient-to-tr from-accent-500/20 to-transparent
              rounded-full blur-3xl">
  </div>

  <!-- Content (no parallax) -->
  <div class="relative z-10">
    Hero content
  </div>
</section>
```

### Floating Animations

#### CSS Floating Animation
**Usage:** 3D geometric shapes, decorative elements

```scss
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.float-element {
  animation: float 3s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 1s;
  }
}
```

**HTML:**
```html
<div class="hero-3d-element float-element absolute top-20 right-[15%]">
  <div class="w-20 h-20 bg-gradient-to-br from-secondary-400/40 to-secondary-600/40
              backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl">
  </div>
</div>
```

#### GSAP Floating Animation
**Usage:** More complex, controlled floating

```typescript
gsap.to('.float-element', {
  y: -15,
  duration: 2,
  ease: 'power1.inOut',
  yoyo: true, // Reverse animation
  repeat: -1 // Infinite loop
});
```

### Magnetic Hover Effect

**Usage:** Interactive buttons, CTAs, social icons

```typescript
// Mouse move handler
onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
  if (this.prefersReducedMotion()) return;

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;

  gsap.to(element, {
    x: x * 0.2, // 20% of distance
    y: y * 0.2,
    duration: 0.3,
    ease: 'power2.out'
  });
}

// Mouse leave handler
onButtonMouseLeave(element: HTMLElement): void {
  if (this.prefersReducedMotion()) return;

  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)' // Bouncy elastic return
  });
}
```

**HTML:**
```html
<button
  #magneticBtn
  (mousemove)="onButtonMouseMove($event, magneticBtn)"
  (mouseleave)="onButtonMouseLeave(magneticBtn)"
  class="relative px-6 py-3 bg-primary-600 text-white rounded-xl">
  Magnetic Button
</button>
```

### Entrance Animations

#### Fade In
```typescript
gsap.from('.fade-in-element', {
  opacity: 0,
  duration: 0.6,
  ease: 'power3.out'
});
```

#### Slide Up
```typescript
gsap.from('.slide-up-element', {
  opacity: 0,
  y: 30,
  duration: 0.8,
  ease: 'power3.out'
});
```

#### Scale In
```typescript
gsap.from('.scale-in-element', {
  opacity: 0,
  scale: 0.8,
  duration: 0.6,
  ease: 'back.out(1.7)' // Bouncy scale
});
```

#### Timeline (Sequence)
**Usage:** Hero section with multiple elements

```typescript
const heroTimeline = gsap.timeline({
  defaults: { ease: 'power3.out' }
});

heroTimeline
  .from('.hero-badge', {
    opacity: 0,
    y: 20,
    duration: 0.6
  })
  .from('.hero-title', {
    opacity: 0,
    y: 30,
    duration: 0.8
  }, '-=0.3') // Start 0.3s before previous animation ends
  .from('.hero-description', {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, '-=0.4')
  .from('.hero-3d-element', {
    opacity: 0,
    scale: 0.8,
    rotation: -10,
    duration: 1
  }, '-=0.6');
```

### Loading/Spinner Animations

#### Spin Animation (CSS)
```scss
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

**Usage:**
```html
<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
```

#### Pulse Animation
```scss
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

**Usage (Status Indicator):**
```html
<span class="relative flex h-2.5 w-2.5">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
</span>
```

---

## 3D Elements

### Floating Geometric Shapes

**Design Pattern:** Decorative 3D shapes that float in the background, adding depth and visual interest

**HTML Structure:**
```html
<div class="hero-3d-element float-element absolute top-20 right-[15%] rtl:left-[15%] rtl:right-auto w-20 h-20 md:w-28 md:h-28">
  <div class="w-full h-full
              bg-gradient-to-br from-secondary-400/40 to-secondary-600/40
              backdrop-blur-sm
              rounded-2xl rotate-12
              border border-white/20
              shadow-2xl">
  </div>
</div>
```

**Variations:**

1. **Square with Rotation:**
```html
<div class="w-20 h-20 bg-gradient-to-br from-secondary-400/40 to-secondary-600/40
            backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl">
</div>
```

2. **Circle:**
```html
<div class="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5
            backdrop-blur-sm rounded-full border border-white/20 shadow-2xl">
</div>
```

3. **Rectangle with Negative Rotation:**
```html
<div class="w-24 h-16 bg-gradient-to-br from-accent-400/30 to-accent-600/30
            backdrop-blur-sm rounded-xl -rotate-6 border border-white/20 shadow-2xl">
</div>
```

**Positioning Grid:**
```
Top-Right:    top-20 right-[15%]
Bottom-Left:  bottom-32 left-[10%]
Top-Left:     top-1/3 left-[5%]
Center-Right: top-1/2 right-[5%]
```

### Perspective Effects

**3D Card Hover:**
```scss
.perspective-1000 {
  perspective: 1000px;
}

.group:hover .transform-3d {
  transform: rotateX(2deg) rotateY(-2deg);
}
```

**HTML:**
```html
<div class="group perspective-1000">
  <div class="transform-3d relative transform-gpu transition-transform duration-500
              group-hover:rotate-x-2 group-hover:-rotate-y-2">
    <!-- Card content -->
  </div>
</div>
```

**Map Section Example (Contact Page):**
```html
<div class="group perspective-1000">
  <div class="relative transform-gpu transition-transform duration-500
              group-hover:rotate-x-2 group-hover:-rotate-y-2">
    <!-- Glow Effect -->
    <div class="absolute -inset-4
                bg-gradient-to-r from-secondary-500/20 via-accent-500/20 to-primary-500/20
                rounded-3xl blur-2xl
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500">
    </div>

    <!-- Map Container -->
    <div class="relative aspect-[21/9] rounded-2xl overflow-hidden
                shadow-2xl border border-white/60 dark:border-primary-700/40">
      <img src="map.jpg" class="transition-transform duration-700 group-hover:scale-105" />
    </div>
  </div>
</div>
```

### Rotation Transforms

**Tailwind Rotation Classes:**
```
rotate-0    (0deg)
rotate-6    (6deg)
rotate-12   (12deg)
-rotate-6   (-6deg)
-rotate-12  (-12deg)
```

**3D Rotation:**
```css
transform: rotateX(2deg);  /* Tilt up/down */
transform: rotateY(-2deg); /* Tilt left/right */
transform: rotateZ(12deg); /* Traditional rotation */
```

**Combined Transform:**
```html
<div class="transform rotate-12 scale-110 hover:rotate-0 hover:scale-100
            transition-transform duration-500">
  Animated 3D element
</div>
```

---

## Component Patterns

### Hero Section Pattern

**Structure:**
- Full-height section (min-h-70vh)
- Gradient background with overlay
- Parallax background elements
- 3D floating shapes
- Badge + Title + Description
- Scroll indicator

**HTML Template:**
```html
<section class="hero-section relative min-h-[70vh] flex items-center overflow-hidden
                bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">

  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Gradient Orbs with Parallax -->
    <div class="parallax-slow absolute top-0 right-0 w-[600px] h-[600px]
                bg-gradient-to-br from-secondary-500/30 to-transparent
                rounded-full blur-3xl">
    </div>

    <!-- Grid Pattern Overlay -->
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
                background-size: 50px 50px;">
    </div>
  </div>

  <!-- 3D Floating Elements -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="hero-3d-element float-element absolute top-20 right-[15%] w-20 h-20">
      <div class="w-full h-full bg-gradient-to-br from-secondary-400/40 to-secondary-600/40
                  backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl">
      </div>
    </div>
  </div>

  <!-- Hero Content -->
  <div class="container-custom relative z-10 py-20 lg:py-28">
    <div class="max-w-3xl">
      <!-- Badge with Glow -->
      <div class="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-6
                  rounded-full bg-white/10 backdrop-blur-md
                  border border-white/20 shadow-lg shadow-secondary-500/10">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
        </span>
        <span class="text-sm font-medium text-white/90">{{ 'hero.badge' | translate }}</span>
      </div>

      <!-- Title with Gradient -->
      <h1 class="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
        <span class="text-white">{{ 'hero.title' | translate }}</span>
      </h1>

      <!-- Description -->
      <p class="hero-description text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
        {{ 'hero.description' | translate }}
      </p>
    </div>
  </div>

  <!-- Animated Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
    </svg>
  </div>
</section>
```

### Glass Card Pattern

**Info Card (Contact Info):**
```html
<div class="group relative">
  <!-- Glow Effect on Hover -->
  <div class="absolute -inset-0.5
              bg-gradient-to-r from-secondary-500 to-secondary-600
              opacity-0 group-hover:opacity-100
              blur transition-opacity duration-500
              rounded-2xl">
  </div>

  <!-- Glass Card -->
  <div class="relative flex items-start gap-4 p-4
              bg-white/70 dark:bg-primary-900/50
              backdrop-blur-xl
              rounded-xl
              border border-white/60 dark:border-primary-700/40
              shadow-lg hover:shadow-xl
              transition-all duration-300
              group-hover:-translate-y-1">

    <!-- Icon with Gradient -->
    <div class="relative flex-shrink-0">
      <div class="absolute inset-0
                  bg-gradient-to-br from-secondary-500 to-secondary-600
                  rounded-xl blur-md
                  opacity-50 group-hover:opacity-100
                  transition-opacity duration-300">
      </div>
      <div class="relative w-12 h-12 rounded-xl
                  bg-gradient-to-br from-secondary-500 to-secondary-600
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300">
        <svg class="w-6 h-6 text-white"><!-- Icon path --></svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-foreground mb-1
                 group-hover:text-primary-600 dark:group-hover:text-secondary-400
                 transition-colors">
        {{ title | translate }}
      </h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ value }}
      </p>
    </div>
  </div>
</div>
```

### Form Input Styling

**Glass Input with Glow:**
```html
<div class="group">
  <label class="block text-sm font-medium mb-2 text-foreground
                group-focus-within:text-primary-600 dark:group-focus-within:text-secondary-400
                transition-colors">
    {{ 'form.name' | translate }} <span class="text-red-500">*</span>
  </label>

  <div class="relative">
    <input
      type="text"
      class="w-full px-4 py-3.5 rounded-xl
             bg-white/50 dark:bg-primary-900/30
             border-2 border-neutral-200 dark:border-primary-700
             focus:border-secondary-500 dark:focus:border-secondary-400
             hover:border-neutral-300 dark:hover:border-primary-600
             focus:ring-0 outline-none
             transition-all duration-300
             placeholder:text-neutral-400"
      placeholder="Enter your name"
    />

    <!-- Focus Glow -->
    <div class="absolute inset-0 rounded-xl
                bg-gradient-to-r from-secondary-500/20 to-accent-500/20
                opacity-0 group-focus-within:opacity-100
                -z-10 blur transition-opacity duration-300">
    </div>
  </div>

  <!-- Error Message -->
  <p class="mt-2 text-sm text-red-500 flex items-center gap-1">
    <svg class="w-4 h-4" fill="currentColor"><!-- Error icon --></svg>
    {{ 'validation.required' | translate }}
  </p>
</div>
```

### Button Variants

#### Primary Button (Gradient)
```html
<button
  type="submit"
  #submitBtn
  (mousemove)="onButtonMouseMove($event, submitBtn)"
  (mouseleave)="onButtonMouseLeave(submitBtn)"
  class="group relative w-full overflow-hidden px-8 py-4
         bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500
         text-white rounded-xl font-semibold
         shadow-lg shadow-primary-500/30
         hover:shadow-primary-500/50
         disabled:opacity-60 disabled:cursor-not-allowed
         transition-all duration-300">

  <!-- Shine Effect -->
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full
              transition-transform duration-700
              bg-gradient-to-r from-transparent via-white/20 to-transparent">
  </div>

  <span class="relative flex items-center justify-center gap-2">
    {{ 'form.submit' | translate }}
    <svg class="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1
                rtl:rotate-180 transition-transform">
      <!-- Arrow icon -->
    </svg>
  </span>
</button>
```

#### Secondary Button (Outline Glass)
```html
<button class="inline-flex items-center gap-2 px-6 py-3
               bg-white/10 backdrop-blur-sm
               text-white border border-white/30
               rounded-xl font-semibold
               hover:bg-white/20 transition-colors">
  {{ 'cta.email' | translate }}
</button>
```

#### Ghost Button (Transparent)
```html
<button class="inline-flex items-center gap-2 px-6 py-3
               text-primary-600 dark:text-secondary-400
               hover:bg-primary-50 dark:hover:bg-primary-900/30
               rounded-xl font-semibold transition-colors">
  Learn More
</button>
```

### Social Media Buttons

**Glass Social Icon with Magnetic Hover:**
```html
<a
  href="#"
  #socialBtn
  (mousemove)="onButtonMouseMove($event, socialBtn)"
  (mouseleave)="onButtonMouseLeave(socialBtn)"
  class="group relative w-12 h-12 rounded-xl
         bg-white/70 dark:bg-primary-900/50
         backdrop-blur-xl
         border border-white/60 dark:border-primary-700/40
         flex items-center justify-center
         text-neutral-600 dark:text-neutral-400
         hover:text-white
         transition-colors overflow-hidden"
  aria-label="LinkedIn">

  <!-- Gradient Overlay on Hover -->
  <div class="absolute inset-0
              bg-gradient-to-br from-[#0077B5] to-[#005885]
              opacity-0 group-hover:opacity-100
              transition-opacity duration-300">
  </div>

  <!-- Icon -->
  <svg class="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <!-- LinkedIn icon path -->
  </svg>
</a>
```

**Social Platform Colors:**
- LinkedIn: `from-[#0077B5] to-[#005885]`
- Twitter/X: `from-neutral-900 to-neutral-700`
- Facebook: `from-[#1877F2] to-[#0d65d9]`
- WhatsApp: `from-[#25D366] to-[#128C7E]`

### Badge/Pill Components

**Status Badge (with pulse):**
```html
<div class="inline-flex items-center gap-2 px-4 py-2
            rounded-full bg-white/10 backdrop-blur-md
            border border-white/20 shadow-lg shadow-secondary-500/10">
  <span class="relative flex h-2.5 w-2.5">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
  </span>
  <span class="text-sm font-medium text-white/90">Available Now</span>
</div>
```

**Category Badge (small):**
```html
<span class="inline-block px-3 py-1 text-xs font-semibold
             text-secondary-600 dark:text-secondary-400
             bg-secondary-100 dark:bg-secondary-900/30
             rounded-full uppercase tracking-wider">
  {{ 'contact.info.badge' | translate }}
</span>
```

### CTA Section Pattern

**Full-Width Gradient CTA:**
```html
<section class="py-20 lg:py-28 bg-background overflow-hidden">
  <div class="container-custom">
    <div class="relative">
      <!-- Background Glow -->
      <div class="absolute -inset-4
                  bg-gradient-to-r from-primary-600/30 via-secondary-500/30 to-accent-500/30
                  rounded-[2rem] blur-3xl">
      </div>

      <!-- CTA Card -->
      <div class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-800
                  rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">

        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 100 100">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <!-- Floating Elements -->
        <div class="absolute top-10 right-10 w-20 h-20
                    bg-white/10 rounded-2xl rotate-12 blur-sm">
        </div>

        <div class="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <!-- Content -->
          <div class="text-white">
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {{ 'contact.cta.title' | translate }}
            </h2>
            <p class="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              {{ 'contact.cta.description' | translate }}
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-4">
              <a href="tel:+20212345678"
                 class="inline-flex items-center gap-2 px-6 py-3.5
                        bg-white text-primary-700 rounded-xl font-semibold
                        shadow-lg shadow-black/10">
                <svg class="w-5 h-5"><!-- Phone icon --></svg>
                <span>{{ 'contact.cta.call' | translate }}</span>
              </a>
            </div>
          </div>

          <!-- Badge -->
          <div class="flex justify-center md:justify-end">
            <div class="relative group">
              <!-- 24/7 Support Badge -->
              <div class="relative bg-white/10 backdrop-blur-xl
                          rounded-2xl p-8 border border-white/20 text-center">
                <div class="text-6xl font-bold text-white mb-2">24/7</div>
                <div class="text-xl font-medium text-white/80">
                  {{ 'contact.cta.support' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Micro-interactions

### Hover Effects

#### Lift on Hover
```html
<div class="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
  Card content
</div>
```

#### Scale on Hover
```html
<img class="transition-transform duration-700 group-hover:scale-105" src="image.jpg" />
```

#### Glow on Hover
```html
<div class="group relative">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-accent-500
              opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl">
  </div>
  <div class="relative bg-white/70 backdrop-blur-xl rounded-xl p-4">
    Content with glow on hover
  </div>
</div>
```

#### Icon Rotation on Hover
```html
<div class="group flex items-center gap-2">
  <span>Learn More</span>
  <svg class="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
    <!-- Arrow icon -->
  </svg>
</div>
```

### Focus States

**Input Focus:**
```html
<input class="border-2 border-neutral-200
              focus:border-secondary-500
              focus:ring-0 outline-none
              transition-all duration-300" />
```

**Button Focus Visible:**
```css
button:focus-visible {
  outline: 2px solid var(--color-secondary-500);
  outline-offset: 2px;
}
```

### Active States

**Button Active:**
```html
<button class="bg-primary-600 hover:bg-primary-500 active:bg-primary-700
               active:scale-95 transition-all">
  Click Me
</button>
```

**Card Active (Click):**
```html
<div class="active:scale-[0.98] transition-transform cursor-pointer">
  Clickable card
</div>
```

### Transition Timings

**Standard Timings:**
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);     /* Micro-interactions */
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);     /* Default */
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);     /* Large elements */
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);   /* Page transitions */
```

**Easing Functions:**
- `ease-out` - Fast start, slow end (element entering)
- `ease-in` - Slow start, fast end (element exiting)
- `ease-in-out` - Smooth both ends (general use)
- `cubic-bezier(0.4, 0, 0.2, 1)` - Custom Material Design curve

**Tailwind Classes:**
```html
<div class="transition-all duration-150">Fast transition</div>
<div class="transition-all duration-300">Slow transition</div>
<div class="transition-colors duration-200">Color transition only</div>
<div class="transition-transform duration-500 ease-out">Transform with easing</div>
```

---

## Responsive Breakpoints

### Tailwind Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Usage |
|------------|-----------|-----------------|-------|
| XS | 320px | `xs:` | Mobile portrait |
| SM | 480px | `sm:` | Mobile landscape |
| MD | 768px | `md:` | Tablet portrait |
| LG | 1024px | `lg:` | Tablet landscape / Small desktop |
| XL | 1280px | `xl:` | Desktop |
| 2XL | 1536px | `2xl:` | Large desktop |
| 3XL | 1920px | `3xl:` | Extra large screens |

### Mobile Optimizations (< 768px)

**Typography Scaling:**
```html
<h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
  Responsive Heading
</h1>
<p class="text-base md:text-lg">
  Responsive body text
</p>
```

**Hide Complex Backgrounds:**
```scss
@media (max-width: 768px) {
  .parallax-slow,
  .parallax-fast {
    display: none; // Performance optimization
  }

  .float-element {
    transform: scale(0.7); // Scale down decorative elements
  }
}
```

**Stack Layouts:**
```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <!-- Single column on mobile, two columns on desktop -->
</div>
```

**Touch-Friendly Sizing:**
```html
<button class="px-4 py-3 md:px-6 md:py-4">
  <!-- Larger touch targets on mobile -->
</button>
```

### Tablet Adjustments (768px - 1024px)

**Grid Layouts:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 1 col mobile, 2 col tablet, 3 col desktop -->
</div>
```

**Padding Adjustments:**
```html
<section class="py-12 md:py-16 lg:py-20">
  <!-- Progressive padding increase -->
</section>
```

### Desktop Enhancements (> 1024px)

**Max Width Containers:**
```html
<div class="container max-w-7xl mx-auto px-4 lg:px-8">
  <!-- Wider gutters on desktop -->
</div>
```

**Enhanced Animations:**
```typescript
// Enable complex animations only on desktop
if (window.innerWidth > 1024) {
  this.initComplexAnimations();
}
```

**Multi-Column Layouts:**
```html
<div class="grid lg:grid-cols-5 gap-8 lg:gap-12">
  <div class="lg:col-span-2">Sidebar</div>
  <div class="lg:col-span-3">Main content</div>
</div>
```

---

## Accessibility Guidelines

### Reduced Motion Support

**Respecting User Preferences:**
```typescript
// Check for reduced motion preference
this.prefersReducedMotion.set(
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

if (!this.prefersReducedMotion()) {
  this.initAnimations();
}
```

**CSS Implementation:**
```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .float-element,
  .animate-spin,
  .animate-ping,
  .animate-bounce {
    animation: none !important;
  }

  .parallax-slow,
  .parallax-fast {
    transform: none !important;
  }
}
```

### Focus Visible States

**Consistent Focus Indicators:**
```css
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-secondary-500);
  outline-offset: 2px;
}
```

**Tailwind Usage:**
```html
<button class="focus-visible:outline focus-visible:outline-2
               focus-visible:outline-secondary-500
               focus-visible:outline-offset-2
               rounded-xl">
  Accessible Button
</button>
```

### High Contrast Mode

**Disable Glass Effects:**
```scss
@media (prefers-contrast: high) {
  .glass-card,
  .backdrop-blur-xl,
  .backdrop-blur-md {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--color-background);
    border: 2px solid var(--color-border);
  }
}
```

### Screen Reader Considerations

**ARIA Labels:**
```html
<button aria-label="Close menu">
  <svg><!-- X icon --></svg>
</button>

<a href="#" aria-label="LinkedIn profile">
  <svg><!-- LinkedIn icon --></svg>
</a>
```

**Required Fields:**
```html
<label for="name">
  Name <span class="text-red-500" aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />
```

**Screen Reader Only Text:**
```html
<span class="sr-only">Opens in new window</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Error Messages:**
```html
<p class="mt-2 text-sm text-red-500" role="alert" aria-live="polite">
  {{ 'validation.required' | translate }}
</p>
```

### Color Contrast (WCAG Compliance)

**Contrast Ratios:**
- Normal text: ≥ 4.5:1 (AA), ≥ 7:1 (AAA)
- Large text: ≥ 3:1 (AA), ≥ 4.5:1 (AAA)
- UI components: ≥ 3:1

**Brand Colors on White:**
- Primary Navy (#3D5A80): 6.8:1 ✓ AA
- Secondary Teal (#5DB7C2): 3.2:1 ✓ Large text only
- Accent Purple (#6B4C9A): 7.1:1 ✓ AA

**Testing:**
- Use browser DevTools color contrast checker
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Keyboard navigation testing

---

## RTL Support

### Layout Mirroring

**Automatic Flipping:**
```html
<html dir="rtl">
  <!-- All flex/grid layouts automatically reverse -->
</html>
```

**Manual RTL Adjustments:**
```html
<!-- Left/Right positioning -->
<div class="right-0 rtl:left-0 rtl:right-auto">
  Positioned element
</div>

<!-- Padding/Margin -->
<div class="pl-4 rtl:pr-4 rtl:pl-0">
  Directional padding
</div>
```

### Animation Direction

**Arrow Icons:**
```html
<svg class="rtl:rotate-180">
  <!-- Arrow automatically flips in RTL -->
</svg>
```

**Slide Animations:**
```typescript
// Detect RTL
const isRTL = document.documentElement.dir === 'rtl';
const direction = isRTL ? -1 : 1;

gsap.from('.card', {
  x: 30 * direction, // Slides from right in LTR, left in RTL
  opacity: 0
});
```

### Icon Rotation

**Directional Icons (arrows, chevrons):**
```html
<svg class="w-5 h-5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
  <!-- Arrow icon -->
</svg>
```

**Non-Directional Icons (no rotation needed):**
```html
<svg class="w-6 h-6">
  <!-- Email, phone, check icons - no RTL adjustment -->
</svg>
```

### RTL-Specific Styles

**SCSS:**
```scss
[dir="rtl"] {
  .hero-3d-element {
    // Adjust floating elements for RTL
  }

  .magnetic-button {
    transform-origin: right; // Change transform origin
  }
}
```

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/rtl'),
  ],
}
```

---

## Code Examples

### Reusable Tailwind Class Combinations

#### Glass Card (Info)
```html
<div class="relative flex items-start gap-4 p-4
            bg-white/70 dark:bg-primary-900/50
            backdrop-blur-xl
            rounded-xl
            border border-white/60 dark:border-primary-700/40
            shadow-lg hover:shadow-xl
            transition-all duration-300
            hover:-translate-y-1">
</div>
```

#### Glass Form Container
```html
<div class="relative bg-white/80 dark:bg-primary-900/60
            backdrop-blur-2xl
            rounded-2xl
            border border-white/60 dark:border-primary-700/40
            p-6 md:p-8 lg:p-10
            shadow-2xl">
</div>
```

#### Gradient Button with Shine
```html
<button class="group relative overflow-hidden px-8 py-4
               bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500
               text-white rounded-xl font-semibold
               shadow-lg shadow-primary-500/30
               hover:shadow-primary-500/50
               transition-all duration-300">
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full
              transition-transform duration-700
              bg-gradient-to-r from-transparent via-white/20 to-transparent">
  </div>
  <span class="relative">Button Text</span>
</button>
```

#### Form Input with Glow
```html
<div class="group relative">
  <input class="w-full px-4 py-3.5 rounded-xl
                bg-white/50 dark:bg-primary-900/30
                border-2 border-neutral-200 dark:border-primary-700
                focus:border-secondary-500 dark:focus:border-secondary-400
                hover:border-neutral-300 dark:hover:border-primary-600
                focus:ring-0 outline-none
                transition-all duration-300" />

  <div class="absolute inset-0 rounded-xl
              bg-gradient-to-r from-secondary-500/20 to-accent-500/20
              opacity-0 group-focus-within:opacity-100
              -z-10 blur transition-opacity duration-300">
  </div>
</div>
```

### GSAP Animation Snippets

#### Scroll-Triggered Card Reveal
```typescript
const trigger = ScrollTrigger.create({
  trigger: '.card-container',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.card-item', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });
  },
  once: true
});
this.scrollTriggers.push(trigger);
```

#### Hero Timeline Sequence
```typescript
const heroTimeline = gsap.timeline({
  defaults: { ease: 'power3.out' }
});

heroTimeline
  .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
  .from('.hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
  .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
  .from('.hero-cta', { opacity: 0, scale: 0.9, duration: 0.6 }, '-=0.3');
```

#### Parallax Background
```typescript
gsap.to('.parallax-layer', {
  y: 150,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  }
});
```

#### Magnetic Button Hover
```typescript
onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
  if (this.prefersReducedMotion()) return;

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;

  gsap.to(element, {
    x: x * 0.2,
    y: y * 0.2,
    duration: 0.3,
    ease: 'power2.out'
  });
}

onButtonMouseLeave(element: HTMLElement): void {
  if (this.prefersReducedMotion()) return;

  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)'
  });
}
```

### Angular Component Patterns

#### Contact Component Structure
```typescript
import { Component, signal, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSection!: ElementRef;

  private readonly fb = inject(FormBuilder);
  private scrollTriggers: ScrollTrigger[] = [];

  prefersReducedMotion = signal(false);

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngAfterViewInit(): void {
    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    if (!this.prefersReducedMotion()) {
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initAnimations(): void {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
      .from('.hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
      .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');

    // Floating elements
    gsap.to('.float-element', {
      y: -15,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });
  }
}
```

---

## Research Sources & Inspiration

This design system is informed by current 2025 trends and best practices:

**Glassmorphism Trends:**
- [What is Glassmorphism? UI Design Trend 2025](https://www.designstudiouiux.com/blog/what-is-glassmorphism-ui-trend/)
- [Glassmorphism: The Transparent Trend Defining 2025 UI Design](https://www.atvoid.com/blog/what-is-glassmorphism-the-transparent-trend-defining-2025-ui-design)
- [10 Mind-Blowing Glassmorphism Examples of 2025](https://onyx8agency.com/blog/glassmorphism-inspiring-examples/)

**GSAP & Motion Design:**
- [GSAP Animations Modern Websites | Top Effects & Pro Guide 2025](https://devsync.tn/blog/top-gsap-animations-modern-websites/)
- [How to Build Cinematic 3D Scroll Experiences with GSAP | Codrops](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/)
- [Creating 3D Scroll-Driven Text Animations with CSS and GSAP | Codrops](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/)

**Dark Mode Best Practices:**
- [Dark Mode Web Design | SEO & UX Trends for 2025](https://designindc.com/blog/dark-mode-web-design-seo-ux-trends-for-2025/)
- [Dark Mode vs. Light Mode: Best Website Design for 2025](https://www.deeptechexpertise.com/blogpost/dark-mode-vs-light-mode:-which-website-design-works-best-in-2025)
- [Dark Mode Design Trends for 2025: Should Your Startup Adopt It?](https://altersquare.medium.com/dark-mode-design-trends-for-2025-should-your-startup-adopt-it-a7e7c8c961ab)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-06 | Initial design system documentation based on Contact Page implementation | UI Design Expert |

---

## Next Steps

**Planned Enhancements:**
1. Component library expansion (modals, tooltips, dropdowns)
2. Animation presets library (reusable GSAP configurations)
3. Accessibility testing results documentation
4. Performance benchmarks for animations
5. Storybook integration for component showcase

**Usage Across Site:**
This design system should be applied consistently to:
- Home page hero and sections
- Services page cards and CTAs
- Industries page feature highlights
- Pricing page comparison tables
- About page team cards
- All forms and interactive elements

---

**Remember:** This design system is a living document. As new patterns emerge and components are built, update this guide to maintain consistency and reusability across the entire Roaya IT website.
