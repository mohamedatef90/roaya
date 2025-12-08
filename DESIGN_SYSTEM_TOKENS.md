# Roaya IT - Complete Design System Tokens
**Extracted from Home Page Implementation**
**Version:** 1.0.0
**Last Updated:** 2025-12-07
**Status:** Production-Ready Reference

---

## Table of Contents
1. [Color System](#1-color-system)
2. [Typography Scale](#2-typography-scale)
3. [Spacing & Layout](#3-spacing--layout)
4. [Glassmorphism Card System](#4-glassmorphism-card-system)
5. [Icon Styling System](#5-icon-styling-system)
6. [Animation & Transitions](#6-animation--transitions)
7. [Component Patterns](#7-component-patterns)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Accessibility Features](#9-accessibility-features)

---

## 1. Color System

### 1.1 Brand Colors (Core Palette)

```css
/* Primary Navy */
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

/* Secondary Teal */
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

/* Accent Purple */
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

### 1.2 Text Colors (WCAG AA Compliant)

#### Light Mode
```css
/* PRIMARY TEXT COLORS - USE THESE FOR SERVICE PAGES */
--color-text-primary: #1e293b;     /* Headings, important text (9.68:1 contrast) */
--color-text-secondary: #475569;   /* Body text (7.24:1 contrast) */
--color-text-tertiary: #64748b;    /* Muted text, captions (4.93:1 contrast) */

/* TAILWIND CLASS EQUIVALENTS */
.text-slate-800   /* Equivalent to text-primary */
.text-slate-600   /* Equivalent to text-secondary */
.text-slate-500   /* Equivalent to text-tertiary */

/* LEGACY NEUTRAL COLORS (From _variables.scss) */
--color-text-primary: #0a0a0a;     /* Almost black */
--color-text-secondary: #525252;   /* Neutral 600 */
--color-text-tertiary: #737373;    /* Neutral 500 */
```

#### Dark Mode
```css
/* DARK MODE TEXT COLORS */
--color-text-primary: #f1f5f9;     /* Almost white (12.63:1 contrast) */
--color-text-secondary: #cbd5e1;   /* Light gray (9.21:1 contrast) */
--color-text-tertiary: #94a3b8;    /* Muted light gray (5.87:1 contrast) */

/* TAILWIND DARK MODE CLASSES */
.dark:text-slate-100  /* Dark mode primary */
.dark:text-slate-300  /* Dark mode secondary */
.dark:text-slate-400  /* Dark mode tertiary */
```

### 1.3 Background Colors

#### Light Mode
```css
--color-background: #ffffff;           /* Page background */
--color-surface: #f8fafc;              /* Card background (slate-50) */
--color-surface-elevated: #ffffff;     /* Elevated cards, modals */
--color-border: #e2e8f0;               /* Borders (slate-200) */
--color-border-light: #f1f5f9;         /* Subtle borders (slate-100) */

/* TAILWIND CLASSES */
.bg-white           /* Page background */
.bg-slate-50        /* Surface background */
.border-slate-200   /* Standard borders */
```

#### Dark Mode
```css
--color-background: #0f172a;           /* Page background (slate-900) */
--color-surface: #1e293b;              /* Card background (slate-800) */
--color-surface-elevated: #334155;     /* Elevated cards (slate-700) */
--color-border: #334155;               /* Borders (slate-700) */
--color-border-light: #1e293b;         /* Subtle borders (slate-800) */

/* TAILWIND DARK MODE CLASSES */
.dark:bg-slate-900     /* Page background */
.dark:bg-slate-800     /* Surface background */
.dark:border-slate-700 /* Standard borders */
```

### 1.4 Icon Colors

```css
/* ICON COLOR PATTERNS (From Home Page) */

/* Light Mode Icons */
.text-primary-600         /* Primary brand icons (#3D5A80) */
.dark:text-secondary-400  /* Dark mode icons (#71c7d1) */

/* Icon with Gradient Background Container */
.bg-gradient-to-br from-primary-500 to-secondary-500  /* Icon container gradient */
.text-white  /* Icon color on gradient */

/* Icon on Colored Background */
.bg-primary-100 dark:bg-primary-800/50  /* Icon background light/dark */
.text-primary-600 dark:text-secondary-400  /* Icon color light/dark */

/* SPECIFIC ICON IMPLEMENTATIONS */

/* Why Roaya Feature Cards - Icon Container */
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg">
  <ng-icon [name]="feature.icon" size="28"></ng-icon>
</div>

/* Process Steps - Icon Container */
<div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800/50 flex items-center justify-center text-primary-600 dark:text-secondary-400">
  <ng-icon [name]="step.icon" size="24"></ng-icon>
</div>

/* Industry Cards - Icon Container */
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center text-primary-600 dark:text-secondary-400 mb-4 group-hover:scale-110 transition-transform">
  <ng-icon [name]="industry.icon" size="28"></ng-icon>
</div>
```

### 1.5 Gradient Definitions

```css
/* PRIMARY GRADIENTS */
--gradient-primary: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
--gradient-accent: linear-gradient(135deg, #6B4C9A 0%, #5DB7C2 100%);

/* TAILWIND GRADIENT CLASSES */
.bg-gradient-to-r from-primary-500 to-secondary-500     /* Horizontal gradient */
.bg-gradient-to-br from-primary-500 to-secondary-500    /* Diagonal gradient */
.bg-gradient-to-r from-secondary-400 to-accent-400      /* Hero subtitle gradient */

/* GRADIENT TEXT */
.bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent

/* GLOW EFFECTS (Hover States) */
.absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl

/* HERO SECTION BACKGROUND */
.bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900
```

### 1.6 Semantic Colors

```css
/* Success, Warning, Error, Info */
--color-success: #22c55e;   /* Green 500 */
--color-warning: #f59e0b;   /* Amber 500 */
--color-error: #ef4444;     /* Red 500 */
--color-info: #3b82f6;      /* Blue 500 */

/* TAILWIND CLASSES */
.text-green-500
.text-amber-500
.text-red-500
.text-blue-500
```

---

## 2. Typography Scale

### 2.1 Font Families

```css
/* Primary Font (English) */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Arabic Font */
--font-arabic: 'Tajawal', system-ui, -apple-system, sans-serif;

/* GOOGLE FONTS IMPORTS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

/* RTL AUTOMATIC SWITCHING */
body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
html[dir="rtl"] body { font-family: 'Tajawal', system-ui, -apple-system, sans-serif; }
```

### 2.2 Heading Sizes (Responsive with clamp)

```css
/* H1 - Hero Titles */
h1 {
  font-size: clamp(2.25rem, 5vw, 4.5rem);  /* 36px - 72px */
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-4xl md:text-5xl lg:text-6xl font-bold */

/* H2 - Section Headers */
h2 {
  font-size: clamp(1.875rem, 4vw, 3.75rem);  /* 30px - 60px */
  letter-spacing: -0.01em;
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-3xl md:text-4xl lg:text-5xl font-bold */

/* H3 - Subsection Headers */
h3 {
  font-size: clamp(1.5rem, 3vw, 3rem);  /* 24px - 48px */
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-2xl md:text-3xl font-bold */

/* H4 - Card Titles */
h4 {
  font-size: clamp(1.25rem, 2.5vw, 2.25rem);  /* 20px - 36px */
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-xl md:text-2xl font-semibold */

/* H5 - Small Headings */
h5 {
  font-size: clamp(1.125rem, 2vw, 1.5rem);  /* 18px - 24px */
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-lg md:text-xl font-semibold */

/* H6 - Minor Headings */
h6 {
  font-size: clamp(1rem, 1.5vw, 1.25rem);  /* 16px - 20px */
  line-height: 1.2;
  font-weight: 700;
}
/* TAILWIND: text-base md:text-lg font-semibold */
```

### 2.3 Body Text Sizes

```css
/* Lead Text (Hero Descriptions) */
.lead {
  font-size: clamp(1.125rem, 2vw, 1.5rem);  /* 18px - 24px */
  line-height: 1.6;
  font-weight: 400;
}
/* TAILWIND: text-lg md:text-xl */

/* Body Large */
/* TAILWIND: text-lg (1.125rem / 18px) */

/* Body Regular */
/* TAILWIND: text-base (1rem / 16px) */

/* Body Small */
/* TAILWIND: text-sm (0.875rem / 14px) */

/* Caption */
/* TAILWIND: text-xs (0.75rem / 12px) */
```

### 2.4 Font Weights

```css
/* Available Weights */
.font-light     { font-weight: 300; }
.font-normal    { font-weight: 400; }
.font-medium    { font-weight: 500; }
.font-semibold  { font-weight: 600; }
.font-bold      { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black     { font-weight: 900; }

/* COMMON USAGE PATTERNS */
Headings: font-bold (700)
Subheadings: font-semibold (600)
Body: font-normal (400)
Badges/Labels: font-medium (500)
```

### 2.5 Line Heights

```css
/* Tight (Headings) */
.leading-tight { line-height: 1.2; }

/* Relaxed (Body Text) */
.leading-relaxed { line-height: 1.75; }

/* Loose (Large Body Text) */
.leading-loose { line-height: 2; }
```

---

## 3. Spacing & Layout

### 3.1 Container Widths

```css
/* Custom Container Class */
.container-custom {
  max-width: 80rem;  /* 1280px (7xl) */
  margin: 0 auto;
  padding: 0 1rem;  /* 16px */
}

/* RESPONSIVE PADDING */
@media (min-width: 640px) { padding: 0 1.5rem; }  /* 24px */
@media (min-width: 1024px) { padding: 0 2rem; }   /* 32px */

/* TAILWIND: .container-custom = .max-w-7xl .mx-auto .px-4 sm:px-6 lg:px-8 */
```

### 3.2 Section Padding

```css
/* Standard Section Vertical Padding */
.py-16  /* Mobile: 64px (4rem) */
.py-20  /* Desktop: 80px (5rem) */

/* COMMON PATTERN */
<section class="py-16 lg:py-20">  /* 64px mobile, 80px desktop */

/* Hero Section */
.py-16 lg:py-24  /* 64px mobile, 96px desktop */
```

### 3.3 Card Padding

```css
/* Glass Cards (Standard) */
.p-6    /* 24px all sides */
.p-8    /* 32px all sides (larger cards) */
.p-6 lg:p-8  /* Responsive: 24px mobile, 32px desktop */

/* EXAMPLE FROM HOME PAGE */
<div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40">
```

### 3.4 Grid Gaps

```css
/* Standard Grid Gap */
.gap-6   /* 24px gap between grid items */
.gap-8   /* 32px gap (larger screens) */

/* COMMON GRID PATTERNS */
/* 2-column grid (tablet) */
<div class="grid md:grid-cols-2 gap-6">

/* 3-column grid (desktop) */
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

/* 4-column grid (large desktop) */
<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### 3.5 Border Radius Values

```css
/* Border Radius Scale */
.rounded-lg    /* 8px - small elements */
.rounded-xl    /* 12px - buttons, badges */
.rounded-2xl   /* 16px - cards, containers */
.rounded-3xl   /* 24px - large containers */
.rounded-full  /* 9999px - circular elements */

/* USAGE PATTERNS */
Cards: .rounded-2xl
Buttons: .rounded-xl
Badges: .rounded-full
Icon Containers: .rounded-xl
```

---

## 4. Glassmorphism Card System

### 4.1 Standard Glass Card Pattern

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

### 4.2 Glass Effect Values

```css
/* LIGHT MODE GLASS */
background: rgba(255, 255, 255, 0.7);  /* bg-white/70 */
border: rgba(255, 255, 255, 0.6);      /* border-white/60 */
backdrop-filter: blur(20px);           /* backdrop-blur-xl */

/* DARK MODE GLASS */
background: rgba(30, 41, 59, 0.5);     /* dark:bg-primary-900/50 */
border: rgba(71, 85, 105, 0.4);        /* dark:border-primary-700/40 */
backdrop-filter: blur(20px);           /* backdrop-blur-xl */

/* TAILWIND CLASSES */
.bg-white/70 dark:bg-primary-900/50
.backdrop-blur-xl
.border border-white/60 dark:border-primary-700/40
```

### 4.3 Shadow Styles

```css
/* Shadow Scale */
.shadow-lg    /* Standard card shadow */
.shadow-xl    /* Elevated card shadow */
.shadow-2xl   /* Hero/modal shadow */

/* HOVER TRANSITIONS */
.shadow-lg hover:shadow-xl transition-all duration-300
```

### 4.4 Hover States

```css
/* Standard Card Hover */
.group-hover:-translate-y-1   /* Lift effect */
.group-hover:opacity-100      /* Show glow */
.group-hover:scale-110        /* Icon scale */

/* COMPLETE HOVER PATTERN */
transition-all duration-300 hover:shadow-xl hover:-translate-y-1
```

---

## 5. Icon Styling System

### 5.1 Icon Container Sizes

```css
/* Small Icons (Process Steps) */
.w-10 h-10  /* 40px container */
size="20"   /* Icon size */

/* Medium Icons (Standard Cards) */
.w-12 h-12  /* 48px container */
size="24"   /* Icon size */

/* Large Icons (Feature Cards) */
.w-14 h-14  /* 56px container */
size="28"   /* Icon size */

/* Extra Large Icons (Hero) */
.w-16 h-16  /* 64px container */
size="32"   /* Icon size */
```

### 5.2 Icon Background Patterns

#### Pattern 1: Gradient Background (Primary Feature)
```html
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg">
  <ng-icon [name]="icon" size="28"></ng-icon>
</div>
```

#### Pattern 2: Subtle Background (Secondary Feature)
```html
<div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800/50 flex items-center justify-center text-primary-600 dark:text-secondary-400">
  <ng-icon [name]="icon" size="24"></ng-icon>
</div>
```

#### Pattern 3: Ultra-Subtle Background (Tertiary)
```html
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center text-primary-600 dark:text-secondary-400 mb-4 group-hover:scale-110 transition-transform">
  <ng-icon [name]="icon" size="28"></ng-icon>
</div>
```

### 5.3 Icon Color Combinations

```css
/* Primary Icon Colors */
/* Light Mode */
.text-primary-600       /* #334d6e - on light backgrounds */
.text-secondary-500     /* #5DB7C2 - accent icons */
.text-white             /* on gradient backgrounds */

/* Dark Mode */
.dark:text-secondary-400   /* #71c7d1 - primary icon color */
.dark:text-primary-400     /* #829ab1 - alternative */

/* COMPLETE DARK MODE PATTERN */
.text-primary-600 dark:text-secondary-400
```

---

## 6. Animation & Transitions

### 6.1 Transition Durations

```css
/* CSS Variables */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* TAILWIND CLASSES */
.duration-150
.duration-200
.duration-300
.duration-500  /* Glow effects */
.duration-700  /* Shine effects */

/* COMMON PATTERN */
transition-all duration-300
```

### 6.2 Transform Animations

```css
/* Hover Lift */
.hover:-translate-y-1
.group-hover:-translate-y-1

/* Icon Scale */
.group-hover:scale-110

/* Arrow Slide */
.group-hover:translate-x-1  /* LTR */
.rtl:rotate-180             /* RTL support */
```

### 6.3 Opacity Transitions

```css
/* Glow Effect Reveal */
.opacity-0 group-hover:opacity-100

/* Fade In */
.opacity-0 animate-fade-in
```

### 6.4 Keyframe Animations

```css
/* Float Animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.float-element { animation: float 3s ease-in-out infinite; }

/* Ping Animation */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }

/* Bounce Animation */
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); }
  50% { transform: translateY(0); }
}
.animate-bounce { animation: bounce 1s infinite; }
```

### 6.5 Shine Effect (Button Hover)

```html
<!-- Shine Effect on CTA Buttons -->
<button class="group relative overflow-hidden">
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  <span class="relative">Button Text</span>
</button>
```

---

## 7. Component Patterns

### 7.1 Section Badge Pattern

```html
<span class="inline-block px-4 py-2 rounded-full bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 text-primary-600 dark:text-secondary-400 text-sm font-semibold mb-4 shadow-lg">
  {{ 'section.badge' | translate }}
</span>
```

### 7.2 Section Header Pattern

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

### 7.3 CTA Button Pattern (Primary)

```html
<a
  routerLink="/contact"
  class="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all overflow-hidden"
>
  <!-- Shine Effect -->
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

  <span class="relative">{{ 'cta.text' | translate }}</span>

  <svg class="relative w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

### 7.4 CTA Button Pattern (Secondary)

```html
<a
  routerLink="/pricing"
  class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all"
>
  {{ 'cta.secondary' | translate }}
</a>
```

### 7.5 Stats Card Pattern

```html
<div class="stat-card group">
  <!-- Glow Effect -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <!-- Card Content -->
  <div class="relative text-center p-6 bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
    <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent tabular-nums">
      {{ stat.value }}{{ stat.suffix }}
    </div>
    <div class="text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
      {{ stat.label | translate }}
    </div>
  </div>
</div>
```

### 7.6 Process Step Card Pattern

```html
<div class="process-step group relative flex">
  <!-- Glow Effect -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <!-- Card Content -->
  <div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 shadow-lg flex-1 flex flex-col">
    <!-- Step Number and Icon -->
    <div class="flex items-center justify-between gap-6 mb-4">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
        {{ step.number }}
      </div>
      <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800/50 flex items-center justify-center text-primary-600 dark:text-secondary-400">
        <ng-icon [name]="step.icon" size="24"></ng-icon>
      </div>
    </div>

    <!-- Content -->
    <h3 class="text-xl font-semibold mb-2 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
      {{ step.title | translate }}
    </h3>
    <p class="text-neutral-600 dark:text-neutral-400 mb-3 text-sm leading-relaxed flex-grow">
      {{ step.description | translate }}
    </p>

    <!-- Duration Badge -->
    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 text-xs font-medium mt-auto">
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ step.duration | translate }}
    </span>
  </div>
</div>
```

---

## 8. Responsive Breakpoints

### 8.1 Breakpoint System

```css
/* Tailwind Breakpoints */
xs:   320px   /* Extra small devices */
sm:   480px   /* Small devices */
md:   768px   /* Tablets */
lg:   1024px  /* Laptops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Large desktops */
3xl:  1920px  /* Ultra-wide screens */
```

### 8.2 Common Responsive Patterns

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

---

## 9. Accessibility Features

### 9.1 Focus States

```css
/* Focus Visible Ring */
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-secondary-500);
  outline-offset: 2px;
}

/* Tailwind Focus Ring */
.focus-visible:outline-none .focus-visible:ring-2 .focus-visible:ring-primary-500 .focus-visible:ring-offset-2
```

### 9.2 Reduced Motion Support

```css
/* Disable animations for users who prefer reduced motion */
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
  .animate-ping,
  .animate-bounce {
    animation: none !important;
  }
}
```

### 9.3 High Contrast Mode Support

```css
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

### 9.4 ARIA Labels (Required)

```html
<!-- Always include aria-label for icon-only buttons -->
<button aria-label="Close menu">
  <svg>...</svg>
</button>

<!-- Use aria-current for active navigation -->
<a [attr.aria-current]="isActive ? 'page' : null">

<!-- Screen reader only text -->
<span class="sr-only">{{ 'accessible.text' | translate }}</span>
```

---

## 10. RTL Support

### 10.1 RTL Icon Rotation

```html
<!-- Arrow icons must rotate 180deg in RTL -->
<svg class="w-5 h-5 rtl:rotate-180">
  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
</svg>
```

### 10.2 RTL Layout Classes

```css
/* Automatically handled by Tailwind */
.ms-auto  /* margin-inline-start: auto */
.me-auto  /* margin-inline-end: auto */
.ps-4     /* padding-inline-start */
.pe-4     /* padding-inline-end */

/* Manual RTL adjustments when needed */
.left-0 .rtl:right-0 .rtl:left-auto
```

---

## Quick Reference Guide for Service Pages

### Exact Tailwind Classes to Copy-Paste

#### Page Background
```html
<section class="py-20 bg-background">
```

#### Section Header
```html
<div class="text-center max-w-3xl mx-auto mb-16">
  <span class="inline-block px-4 py-2 rounded-full bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 text-primary-600 dark:text-secondary-400 text-sm font-semibold mb-4 shadow-lg">
    Badge Text
  </span>
  <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
    Section Title
  </h2>
  <p class="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
    Section subtitle or description
  </p>
</div>
```

#### Feature Card with Icon
```html
<div class="feature-card group relative">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <div class="relative p-6 rounded-2xl bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 flex-1 flex flex-col">
    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg">
      <ng-icon [name]="icon" size="28"></ng-icon>
    </div>
    <h3 class="text-xl font-semibold mb-3 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
      Card Title
    </h3>
    <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed flex-grow">
      Card description text
    </p>
  </div>
</div>
```

#### Primary CTA Button
```html
<a
  routerLink="/contact"
  class="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all overflow-hidden"
>
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  <span class="relative">Get Started</span>
  <svg class="relative w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

---

## Implementation Checklist for Service Pages

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

---

**End of Design System Tokens Document**
**For questions or clarifications, refer to:**
- `/src/app/features/home/home.component.html` (Reference implementation)
- `/src/styles.scss` (Global styles)
- `/tailwind.config.js` (Tailwind configuration)
