# Roaya IT - Comprehensive Design System

> **Version:** 1.0.0
> **Last Updated:** 2026-01-19
> **Status:** Production-Ready Reference
> **Purpose:** Single source of truth for all design patterns, tokens, and components used in the Roaya IT website

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Glassmorphism System](#5-glassmorphism-system)
6. [Animation Library](#6-animation-library)
7. [3D Elements](#7-3d-elements)
8. [Component Patterns](#8-component-patterns)
9. [Icon System](#9-icon-system)
10. [Button Variants](#10-button-variants)
11. [Form Styling](#11-form-styling)
12. [Responsive Breakpoints](#12-responsive-breakpoints)
13. [Accessibility Guidelines](#13-accessibility-guidelines)
14. [RTL Support](#14-rtl-support)
15. [Quick Reference](#15-quick-reference)

---

## 1. Design Philosophy

### Modern Tech Aesthetic

The Roaya IT website combines **trendy visual effects** with **professional corporate design** to create a unique identity that positions the company as both innovative and trustworthy.

**Core Design Principles:**
- **Depth & Dimension:** Using glassmorphism, 3D transforms, and layered shadows
- **Motion & Delight:** Smooth GSAP animations that enhance, not distract
- **Clarity & Accessibility:** Beautiful design that serves all users
- **Performance First:** Optimized animations with reduced motion support
- **Bilingual Excellence:** Equal visual quality in English and Arabic (RTL)

**Brand Personality:**
- **Professional:** Enterprise-grade IT services
- **Innovative:** Cutting-edge technology solutions
- **Trustworthy:** Security and transparency first
- **Egyptian:** Local expertise with global standards

---

## 2. Color System

### 2.1 Brand Colors (Core Palette)

```css
/* Primary Navy - Main brand color */
--color-primary-50: #f0f4f8;
--color-primary-100: #d9e2ec;
--color-primary-200: #bcccdc;
--color-primary-300: #9fb3c8;
--color-primary-400: #829ab1;
--color-primary-500: #3D5A80;  /* Brand Primary */
--color-primary-600: #334d6e;
--color-primary-700: #2a3f5f;
--color-primary-800: #203047;
--color-primary-900: #192532;
--color-primary-950: #0f1a28;

/* Secondary Teal - Interactive elements */
--color-secondary-50: #f0fafb;
--color-secondary-100: #d9f2f5;
--color-secondary-200: #b3e5eb;
--color-secondary-300: #8dd8e0;
--color-secondary-400: #71c7d1;
--color-secondary-500: #5DB7C2;  /* Brand Secondary */
--color-secondary-600: #4a9ca6;
--color-secondary-700: #3c7f87;
--color-secondary-800: #2e6169;
--color-secondary-900: #1f424a;
--color-secondary-950: #142d32;

/* Accent Purple - Highlights and special elements */
--color-accent-50: #f5f2f9;
--color-accent-100: #e8e0f1;
--color-accent-200: #d1c1e3;
--color-accent-300: #b9a2d5;
--color-accent-400: #9278bc;
--color-accent-500: #6B4C9A;  /* Brand Accent */
--color-accent-600: #5a3f82;
--color-accent-700: #49336a;
--color-accent-800: #382652;
--color-accent-900: #271a3a;
--color-accent-950: #1a1127;
```

### 2.2 Text Colors (WCAG AA Compliant)

#### Light Mode
```css
--color-text-primary: #1e293b;     /* Headings (9.68:1 contrast) */
--color-text-secondary: #475569;   /* Body text (7.24:1 contrast) */
--color-text-tertiary: #64748b;    /* Muted text (4.93:1 contrast) */

/* Tailwind Classes */
.text-slate-800   /* Primary text */
.text-slate-600   /* Secondary text */
.text-slate-500   /* Tertiary text */
```

#### Dark Mode
```css
--color-text-primary: #f1f5f9;     /* Almost white (12.63:1 contrast) */
--color-text-secondary: #cbd5e1;   /* Light gray (9.21:1 contrast) */
--color-text-tertiary: #94a3b8;    /* Muted (5.87:1 contrast) */

/* Tailwind Dark Mode Classes */
.dark:text-slate-100  /* Primary */
.dark:text-slate-300  /* Secondary */
.dark:text-slate-400  /* Tertiary */
```

### 2.3 Background Colors

#### Light Mode
```css
--color-background: #ffffff;           /* Page background */
--color-surface: #f8fafc;              /* Card background (slate-50) */
--color-surface-elevated: #ffffff;     /* Elevated cards */
--color-border: #e2e8f0;               /* Borders (slate-200) */
```

#### Dark Mode
```css
--color-background: #0f172a;           /* Page background (slate-900) */
--color-surface: #1e293b;              /* Card background (slate-800) */
--color-surface-elevated: #334155;     /* Elevated cards (slate-700) */
--color-border: #334155;               /* Borders (slate-700) */
```

### 2.4 Gradient Definitions

```css
/* Primary Gradient - CTAs, hero sections */
--gradient-primary: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);

/* Accent Gradient - Special sections */
--gradient-accent: linear-gradient(135deg, #6B4C9A 0%, #5DB7C2 100%);

/* Multi-Color Gradient - Hero/large CTAs */
--gradient-multi: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 50%, #6B4C9A 100%);

/* Tailwind Gradient Classes */
.bg-gradient-to-r from-primary-500 to-secondary-500     /* Horizontal */
.bg-gradient-to-br from-primary-500 to-secondary-500    /* Diagonal */
.bg-gradient-to-r from-secondary-400 to-accent-400      /* Hero subtitle */

/* Gradient Text */
.bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent
```

### 2.5 Glow Effects

```scss
/* Secondary Glow (Teal) */
.glow-secondary {
  box-shadow: 0 0 20px rgba(93, 183, 194, 0.3);
}

/* Accent Glow (Purple) */
.glow-accent {
  box-shadow: 0 0 20px rgba(107, 76, 154, 0.3);
}

/* Primary Glow (Navy) */
.glow-primary {
  box-shadow: 0 0 20px rgba(61, 90, 128, 0.3);
}
```

### 2.6 Semantic Colors

```css
--color-success: #22c55e;   /* Green 500 */
--color-warning: #f59e0b;   /* Amber 500 */
--color-error: #ef4444;     /* Red 500 */
--color-info: #3b82f6;      /* Blue 500 */
```

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary Font (English) */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Arabic Font */
--font-arabic: 'Tajawal', system-ui, -apple-system, sans-serif;

/* Google Fonts Imports */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

/* RTL Automatic Switching */
body { font-family: 'Inter', system-ui, sans-serif; }
html[dir="rtl"] body { font-family: 'Tajawal', system-ui, sans-serif; }
```

### 3.2 Heading Sizes (Responsive)

| Level | Mobile | Desktop | Tailwind Classes |
|-------|--------|---------|------------------|
| H1 | 36px | 72px | `text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold` |
| H2 | 30px | 60px | `text-3xl md:text-4xl lg:text-5xl font-bold` |
| H3 | 24px | 48px | `text-2xl md:text-3xl font-bold` |
| H4 | 20px | 36px | `text-xl md:text-2xl font-semibold` |
| H5 | 18px | 24px | `text-lg md:text-xl font-semibold` |
| H6 | 16px | 20px | `text-base md:text-lg font-semibold` |

### 3.3 Body Text Sizes

| Type | Size | Tailwind | Usage |
|------|------|----------|-------|
| Lead | 18-24px | `text-lg md:text-xl` | Hero descriptions |
| Body Large | 18px | `text-lg` | Emphasized paragraphs |
| Body Regular | 16px | `text-base` | Default body text |
| Body Small | 14px | `text-sm` | Secondary text |
| Caption | 12px | `text-xs` | Labels, footnotes |

### 3.4 Font Weights

```css
.font-light     { font-weight: 300; }  /* Decorative text */
.font-normal    { font-weight: 400; }  /* Body text */
.font-medium    { font-weight: 500; }  /* Badges, labels */
.font-semibold  { font-weight: 600; }  /* Subheadings, buttons */
.font-bold      { font-weight: 700; }  /* Headings H2-H6 */
.font-extrabold { font-weight: 800; }  /* H1, hero titles */
```

### 3.5 Letter Spacing

```css
/* Headings - Tighter */
h1 { letter-spacing: -0.02em; }
h2 { letter-spacing: -0.01em; }

/* Small text - Wider */
.text-sm { letter-spacing: 0.01em; }
```

---

## 4. Spacing & Layout

### 4.1 Container Widths

```css
/* Custom Container Class */
.container-custom {
  max-width: 80rem;  /* 1280px (7xl) */
  margin: 0 auto;
  padding: 0 1rem;  /* 16px */
}

/* Responsive Padding */
@media (min-width: 640px) { padding: 0 1.5rem; }  /* 24px */
@media (min-width: 1024px) { padding: 0 2rem; }   /* 32px */

/* Tailwind: .max-w-7xl .mx-auto .px-4 sm:px-6 lg:px-8 */
```

### 4.2 Section Padding

```html
<!-- Standard Section -->
<section class="py-16 lg:py-20">  <!-- 64px mobile, 80px desktop -->

<!-- Hero Section -->
<section class="py-16 lg:py-24">  <!-- 64px mobile, 96px desktop -->
```

### 4.3 Card Padding

```html
<!-- Standard Cards -->
<div class="p-6">         <!-- 24px all sides -->
<div class="p-8">         <!-- 32px larger cards -->
<div class="p-6 lg:p-8">  <!-- Responsive -->
```

### 4.4 Grid Gaps

```html
<!-- 2-column grid (tablet) -->
<div class="grid md:grid-cols-2 gap-6">

<!-- 3-column grid (desktop) -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 4-column grid (large desktop) -->
<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### 4.5 Border Radius Values

| Size | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Small | 8px | `rounded-lg` | Small elements |
| Medium | 12px | `rounded-xl` | Buttons, badges |
| Large | 16px | `rounded-2xl` | Cards, containers |
| XL | 24px | `rounded-3xl` | Large containers |
| Full | 9999px | `rounded-full` | Circular elements |

---

## 5. Glassmorphism System

### 5.1 Philosophy

Glassmorphism creates **depth and hierarchy** through layered transparency, backdrop blur, and subtle borders.

**Key Characteristics:**
1. Semi-transparent backgrounds (opacity: 0.5-0.8)
2. Backdrop blur filters (10px-40px)
3. Subtle borders with transparency
4. Layered shadows for depth
5. Gradient backgrounds visible through glass

### 5.2 Glass Variants

#### Light Glass
```css
.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Tailwind */
.bg-white/50 dark:bg-primary-900/30 backdrop-blur-md border border-white/30
```

#### Medium Glass (Default)
```css
.glass-medium {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* Tailwind */
.bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40
```

#### Strong Glass
```css
.glass-strong {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Tailwind */
.bg-white/80 dark:bg-primary-900/60 backdrop-blur-2xl border border-white/60
```

### 5.3 Standard Glass Card Pattern

```html
<!-- Glass Card Container with Glow Effect -->
<div class="feature-card group relative">
  <!-- Glow Effect on Hover -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <!-- Glass Card Content -->
  <div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 flex-1 flex flex-col">
    <!-- Content here -->
  </div>
</div>
```

### 5.4 Backdrop Blur Values

| Level | Pixels | Tailwind Class | Usage |
|-------|--------|----------------|-------|
| None | 0px | `backdrop-blur-none` | No blur |
| Small | 4px | `backdrop-blur-sm` | Minimal frosting |
| Medium | 12px | `backdrop-blur-md` | Light glass |
| Large | 16px | `backdrop-blur-lg` | Medium glass |
| XL | 24px | `backdrop-blur-xl` | Default glass |
| 2XL | 40px | `backdrop-blur-2xl` | Strong glass |

---

## 6. Animation Library

### 6.1 GSAP Setup

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
this.prefersReducedMotion.set(
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

// Cleanup in ngOnDestroy
ngOnDestroy(): void {
  this.scrollTriggers.forEach(trigger => trigger.kill());
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
```

### 6.2 Scroll-Triggered Animations

#### Fade In on Scroll
```typescript
const trigger = ScrollTrigger.create({
  trigger: '.content-section',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.content-section', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out'
    });
  },
  once: true
});
```

#### Stagger Animation (Cards)
```typescript
const trigger = ScrollTrigger.create({
  trigger: '.card-container',
  start: 'top 80%',
  onEnter: () => {
    gsap.from('.card-item', {
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

### 6.3 Parallax Effects

```typescript
// Basic Parallax
gsap.to('.parallax-slow', {
  y: 100,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  }
});
```

### 6.4 Floating Animations (CSS)

```scss
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.float-element {
  animation: float 3s ease-in-out infinite;
}
```

### 6.5 Magnetic Hover Effect

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
  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)'
  });
}
```

### 6.6 Hero Timeline Sequence

```typescript
const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTimeline
  .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
  .from('.hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
  .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
  .from('.hero-cta', { opacity: 0, scale: 0.9, duration: 0.6 }, '-=0.3');
```

### 6.7 Transition Timings

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);

/* Tailwind Classes */
.duration-150  /* Fast */
.duration-200  /* Base */
.duration-300  /* Slow */
.duration-500  /* Glow effects */
.duration-700  /* Shine effects */
```

---

## 7. 3D Elements

### 7.1 Floating Geometric Shapes

```html
<!-- 3D Square with Rotation -->
<div class="hero-3d-element float-element absolute top-20 right-[15%] rtl:left-[15%] rtl:right-auto w-20 h-20 md:w-28 md:h-28">
  <div class="w-full h-full bg-gradient-to-br from-secondary-400/40 to-secondary-600/40
              backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl">
  </div>
</div>
```

**Shape Variations:**
- **Circle:** `rounded-full`
- **Square with rotation:** `rounded-2xl rotate-12`
- **Rectangle:** `rounded-xl -rotate-6`

**Positioning Grid:**
```
Top-Right:    top-20 right-[15%]
Bottom-Left:  bottom-32 left-[10%]
Top-Left:     top-1/3 left-[5%]
Center-Right: top-1/2 right-[5%]
```

### 7.2 Perspective Effects

```html
<div class="group perspective-1000">
  <div class="relative transform-gpu transition-transform duration-500
              group-hover:rotate-x-2 group-hover:-rotate-y-2">
    <!-- Content with 3D hover effect -->
  </div>
</div>
```

---

## 8. Component Patterns

### 8.1 Section Header Pattern

```html
<div class="text-center max-w-3xl mx-auto mb-16">
  <!-- Badge -->
  <span class="inline-block px-4 py-2 rounded-full bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 text-primary-600 dark:text-secondary-400 text-sm font-semibold mb-4 shadow-lg">
    {{ 'section.badge' | translate }}
  </span>

  <!-- Title -->
  <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
    {{ 'section.title' | translate }}
  </h2>

  <!-- Subtitle -->
  <p class="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
    {{ 'section.subtitle' | translate }}
  </p>
</div>
```

### 8.2 Hero Section Pattern

```html
<section class="hero-section relative min-h-[70vh] flex items-center overflow-hidden
                bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">

  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Gradient Orbs -->
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

      <!-- Title -->
      <h1 class="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-white">
        {{ 'hero.title' | translate }}
      </h1>

      <!-- Description -->
      <p class="hero-description text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
        {{ 'hero.description' | translate }}
      </p>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
    </svg>
  </div>
</section>
```

### 8.3 Glass Info Card Pattern

```html
<div class="group relative">
  <!-- Glow Effect on Hover -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-secondary-600
              opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl">
  </div>

  <!-- Glass Card -->
  <div class="relative flex items-start gap-4 p-4
              bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl
              border border-white/60 dark:border-primary-700/40
              shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

    <!-- Icon with Gradient -->
    <div class="relative flex-shrink-0">
      <div class="absolute inset-0 bg-gradient-to-br from-secondary-500 to-secondary-600
                  rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300">
      </div>
      <div class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600
                  flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <ng-icon name="iconName" size="24" class="text-white"></ng-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-foreground mb-1
                 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
        {{ title | translate }}
      </h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ value }}
      </p>
    </div>
  </div>
</div>
```

### 8.4 Feature Card Pattern

```html
<div class="feature-card group relative">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500
              opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl
              border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl
              transition-all duration-300 group-hover:-translate-y-1 flex-1 flex flex-col">

    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500
                flex items-center justify-center text-white mb-5
                group-hover:scale-110 transition-transform shadow-lg">
      <ng-icon [name]="icon" size="28"></ng-icon>
    </div>

    <h3 class="text-xl font-semibold mb-3 group-hover:text-primary-600
               dark:group-hover:text-secondary-400 transition-colors">
      {{ title | translate }}
    </h3>

    <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed flex-grow">
      {{ description | translate }}
    </p>
  </div>
</div>
```

### 8.5 Stats Card Pattern

```html
<div class="stat-card group">
  <!-- Glow Effect -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-accent-500
              opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <!-- Card Content -->
  <div class="relative text-center p-6 bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl
              rounded-xl border border-white/60 dark:border-primary-700/40
              shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
    <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500
                bg-clip-text text-transparent tabular-nums">
      {{ stat.value }}{{ stat.suffix }}
    </div>
    <div class="text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
      {{ stat.label | translate }}
    </div>
  </div>
</div>
```

### 8.6 CTA Section Pattern

```html
<section class="py-20 lg:py-28 bg-background overflow-hidden">
  <div class="container-custom">
    <div class="relative">
      <!-- Background Glow -->
      <div class="absolute -inset-4 bg-gradient-to-r from-primary-600/30 via-secondary-500/30 to-accent-500/30
                  rounded-[2rem] blur-3xl"></div>

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

        <div class="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <!-- Content -->
          <div class="text-white">
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {{ 'cta.title' | translate }}
            </h2>
            <p class="text-lg md:text-xl text-white/80 mb-8">
              {{ 'cta.description' | translate }}
            </p>
            <div class="flex flex-wrap gap-4">
              <a href="/contact" class="inline-flex items-center gap-2 px-6 py-3.5
                                        bg-white text-primary-700 rounded-xl font-semibold">
                {{ 'cta.button' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 9. Icon System

### 9.1 Icon Container Sizes

| Size | Container | Icon Size | Usage |
|------|-----------|-----------|-------|
| Small | 40px (w-10) | 20px | Process steps |
| Medium | 48px (w-12) | 24px | Standard cards |
| Large | 56px (w-14) | 28px | Feature cards |
| XL | 64px (w-16) | 32px | Hero elements |

### 9.2 Icon Background Patterns

#### Pattern 1: Gradient Background (Primary)
```html
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500
            flex items-center justify-center text-white mb-5
            group-hover:scale-110 transition-transform shadow-lg">
  <ng-icon [name]="icon" size="28"></ng-icon>
</div>
```

#### Pattern 2: Subtle Background (Secondary)
```html
<div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800/50
            flex items-center justify-center text-primary-600 dark:text-secondary-400">
  <ng-icon [name]="icon" size="24"></ng-icon>
</div>
```

#### Pattern 3: Ultra-Subtle Background (Tertiary)
```html
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10
            flex items-center justify-center text-primary-600 dark:text-secondary-400
            mb-4 group-hover:scale-110 transition-transform">
  <ng-icon [name]="icon" size="28"></ng-icon>
</div>
```

### 9.3 Icon Color Combinations

```css
/* Light Mode */
.text-primary-600       /* On light backgrounds */
.text-secondary-500     /* Accent icons */
.text-white             /* On gradient backgrounds */

/* Dark Mode */
.dark:text-secondary-400   /* Primary icon color */
.dark:text-primary-400     /* Alternative */

/* Complete Pattern */
.text-primary-600 dark:text-secondary-400
```

### 9.4 Icon Library (Lucide Preferred)

**Standard Icons:**
- `lucideMail` - Email
- `lucidePhone` - Phone
- `lucideMapPin` - Location
- `lucideShield` - Security
- `lucideCheckCircle2` - Success/Check
- `lucideArrowRight` - Arrow
- `lucideClock` - Time
- `lucideUser` - User

---

## 10. Button Variants

### 10.1 Primary Button (Gradient with Shine)

```html
<a routerLink="/contact"
   class="group relative inline-flex items-center gap-2 px-8 py-4
          bg-gradient-to-r from-primary-500 to-secondary-500 text-white
          rounded-xl font-semibold shadow-lg hover:shadow-xl
          transition-all overflow-hidden">

  <!-- Shine Effect -->
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full
              transition-transform duration-700
              bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

  <span class="relative">{{ 'cta.text' | translate }}</span>

  <svg class="relative w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180"
       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

### 10.2 Secondary Button (Outline Glass)

```html
<button class="inline-flex items-center gap-2 px-6 py-3
               bg-white/10 backdrop-blur-sm text-white border border-white/30
               rounded-xl font-semibold hover:bg-white/20 transition-colors">
  {{ 'cta.secondary' | translate }}
</button>
```

### 10.3 Ghost Button

```html
<button class="inline-flex items-center gap-2 px-6 py-3
               text-primary-600 dark:text-secondary-400
               hover:bg-primary-50 dark:hover:bg-primary-900/30
               rounded-xl font-semibold transition-colors">
  Learn More
</button>
```

### 10.4 Social Media Button

```html
<a href="#" aria-label="LinkedIn"
   class="group relative w-12 h-12 rounded-xl
          bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl
          border border-white/60 dark:border-primary-700/40
          flex items-center justify-center
          text-neutral-600 dark:text-neutral-400 hover:text-white
          transition-colors overflow-hidden">

  <!-- Gradient Overlay on Hover -->
  <div class="absolute inset-0 bg-gradient-to-br from-[#0077B5] to-[#005885]
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

  <svg class="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <!-- Icon path -->
  </svg>
</a>
```

**Social Platform Colors:**
- LinkedIn: `from-[#0077B5] to-[#005885]`
- Twitter/X: `from-neutral-900 to-neutral-700`
- Facebook: `from-[#1877F2] to-[#0d65d9]`
- WhatsApp: `from-[#25D366] to-[#128C7E]`

---

## 11. Form Styling

### 11.1 Glass Input with Glow

```html
<div class="group">
  <label class="block text-sm font-medium mb-2 text-foreground
                group-focus-within:text-primary-600 dark:group-focus-within:text-secondary-400
                transition-colors">
    {{ 'form.name' | translate }} <span class="text-red-500">*</span>
  </label>

  <div class="relative">
    <input type="text"
           class="w-full px-4 py-3.5 rounded-xl
                  bg-white/50 dark:bg-primary-900/30
                  border-2 border-neutral-200 dark:border-primary-700
                  focus:border-secondary-500 dark:focus:border-secondary-400
                  hover:border-neutral-300 dark:hover:border-primary-600
                  focus:ring-0 outline-none transition-all duration-300
                  placeholder:text-neutral-400"
           placeholder="Enter your name" />

    <!-- Focus Glow -->
    <div class="absolute inset-0 rounded-xl
                bg-gradient-to-r from-secondary-500/20 to-accent-500/20
                opacity-0 group-focus-within:opacity-100
                -z-10 blur transition-opacity duration-300">
    </div>
  </div>

  <!-- Error Message -->
  <p class="mt-2 text-sm text-red-500 flex items-center gap-1" *ngIf="showError">
    <svg class="w-4 h-4" fill="currentColor"><!-- Error icon --></svg>
    {{ 'validation.required' | translate }}
  </p>
</div>
```

### 11.2 Textarea

```html
<textarea class="w-full px-4 py-3.5 rounded-xl min-h-[150px] resize-y
                 bg-white/50 dark:bg-primary-900/30
                 border-2 border-neutral-200 dark:border-primary-700
                 focus:border-secondary-500 dark:focus:border-secondary-400
                 focus:ring-0 outline-none transition-all duration-300
                 placeholder:text-neutral-400">
</textarea>
```

---

## 12. Responsive Breakpoints

### 12.1 Tailwind Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| xs | 320px | Extra small devices |
| sm | 480px | Small devices |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large desktops |
| 3xl | 1920px | Ultra-wide screens |

### 12.2 Common Responsive Patterns

```html
<!-- Typography Scaling -->
<h1 class="text-4xl md:text-5xl lg:text-6xl">

<!-- Grid Columns -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Padding -->
<section class="py-16 lg:py-20">

<!-- Flex Direction -->
<div class="flex flex-col sm:flex-row gap-4">

<!-- Hidden/Visible -->
<div class="hidden lg:block">  <!-- Desktop only -->
<div class="lg:hidden">        <!-- Mobile only -->
```

### 12.3 Mobile Optimizations

```scss
@media (max-width: 768px) {
  /* Hide complex backgrounds for performance */
  .parallax-slow,
  .parallax-fast {
    display: none;
  }

  /* Scale down decorative elements */
  .float-element {
    transform: scale(0.7);
  }
}
```

---

## 13. Accessibility Guidelines

### 13.1 Reduced Motion Support

```typescript
// Check preference
this.prefersReducedMotion.set(
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

if (!this.prefersReducedMotion()) {
  this.initAnimations();
}
```

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
}
```

### 13.2 Focus Visible States

```css
input:focus-visible,
textarea:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-secondary-500);
  outline-offset: 2px;
}

/* Tailwind */
.focus-visible:outline-none .focus-visible:ring-2 .focus-visible:ring-secondary-500 .focus-visible:ring-offset-2
```

### 13.3 High Contrast Mode

```scss
@media (prefers-contrast: high) {
  .glass-card,
  .backdrop-blur-xl {
    backdrop-filter: none;
    background: var(--color-background);
    border: 2px solid var(--color-border);
  }
}
```

### 13.4 ARIA Labels

```html
<!-- Icon-only buttons -->
<button aria-label="Close menu">
  <svg>...</svg>
</button>

<!-- Required fields -->
<label for="name">
  Name <span class="text-red-500" aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />

<!-- Screen reader only text -->
<span class="sr-only">Opens in new window</span>
```

### 13.5 Color Contrast (WCAG AA)

| Element | Ratio | Status |
|---------|-------|--------|
| Primary Navy on White | 6.8:1 | Pass AA |
| Secondary Teal on White | 3.2:1 | Large text only |
| Accent Purple on White | 7.1:1 | Pass AA |

---

## 14. RTL Support

### 14.1 Layout Mirroring

```html
<html dir="rtl">
  <!-- All flex/grid layouts automatically reverse -->
</html>
```

### 14.2 Manual RTL Adjustments

```html
<!-- Positioning -->
<div class="right-0 rtl:left-0 rtl:right-auto">

<!-- Padding/Margin -->
<div class="pl-4 rtl:pr-4 rtl:pl-0">

<!-- Arrow Icons -->
<svg class="rtl:rotate-180">
  <!-- Arrow automatically flips in RTL -->
</svg>
```

### 14.3 Animation Direction

```typescript
const isRTL = document.documentElement.dir === 'rtl';
const direction = isRTL ? -1 : 1;

gsap.from('.card', {
  x: 30 * direction, // Slides from right in LTR, left in RTL
  opacity: 0
});
```

---

## 15. Quick Reference

### 15.1 Glass Card (Copy-Paste Ready)

```html
<div class="feature-card group relative">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>
  <div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 flex-1 flex flex-col">
    <!-- Content -->
  </div>
</div>
```

### 15.2 Primary CTA Button (Copy-Paste Ready)

```html
<a routerLink="/contact" class="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all overflow-hidden">
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  <span class="relative">Get Started</span>
  <svg class="relative w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

### 15.3 Implementation Checklist

- [ ] Use `text-neutral-600 dark:text-neutral-400` for ALL body text
- [ ] Use `.bg-background` for section backgrounds
- [ ] Use `.bg-white/70 dark:bg-primary-900/50` for glass cards
- [ ] Include glow effect div for card hover states
- [ ] Use `.bg-gradient-to-br from-primary-500 to-secondary-500` for icon containers
- [ ] Add `.rtl:rotate-180` to all arrow icons
- [ ] Use `.group-hover:` for interactive states
- [ ] Include `.transition-all duration-300` for smooth animations
- [ ] Test in both light and dark mode
- [ ] Verify text contrast meets WCAG AA standards
- [ ] Check reduced motion preference support

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-19 | Initial consolidated design system - combined ui-design-system.md, DESIGN_SYSTEM_TOKENS.md, animation-patterns.md, glassmorphism-guide.md, and component-library.md | Product Orchestrator |

---

**Reference Implementation:** `/src/app/features/contact/` (Contact Page serves as the golden standard)

**Design Files Location:** `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/`

---

*"The best design system is the one that gets used."*
