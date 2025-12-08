# Roaya IT Website - Technical Architecture Document

**Project:** Roaya IT Corporate Website
**Version:** 1.0
**Date:** 2025-12-05
**Tech Lead:** Super Tech Lead
**Framework:** Angular 21 (Standalone Components)

---

## Executive Summary

This document defines the technical architecture for Roaya IT's modern, bilingual corporate website. The architecture prioritizes performance, maintainability, and exceptional user experience through standalone components, modern theming, and comprehensive internationalization.

**Key Metrics Targets:**
- Lighthouse Performance: 95+
- First Contentful Paint (FCP): < 1.2s
- Time to Interactive (TTI): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Bundle Size (Initial): < 200KB gzipped

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Theming System](#3-theming-system)
4. [Internationalization (i18n)](#4-internationalization-i18n)
5. [Component Architecture](#5-component-architecture)
6. [State Management](#6-state-management)
7. [Performance Optimization](#7-performance-optimization)
8. [Animation Architecture](#8-animation-architecture)
9. [Build & Deployment](#9-build--deployment)
10. [Security Considerations](#10-security-considerations)
11. [Testing Strategy](#11-testing-strategy)
12. [Technical Risks & Mitigations](#12-technical-risks--mitigations)

---

## 1. System Architecture Overview

### 1.1 Architecture Type

**Decision:** Single Page Application (SPA) with Angular Universal SSR

**Rationale:**
- SEO requirements for corporate website
- Fast client-side navigation after initial load
- Rich interactive features
- Progressive enhancement capability

### 1.2 System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│  │  Users   │◄────►│ CDN/WAF  │◄────►│  Server  │         │
│  │ (EN/AR)  │      │Cloudflare│      │ Node.js  │         │
│  └──────────┘      └──────────┘      └────┬─────┘         │
│                                           │               │
│                    ┌──────────────────────┼──────┐         │
│                    │                      │      │         │
│              ┌─────▼─────┐         ┌─────▼──────▼───┐     │
│              │  Angular  │         │  API Gateway   │     │
│              │    App    │◄───────►│   (Future)     │     │
│              │   (SSR)   │         └────────────────┘     │
│              └───────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Angular 21 | Modern, TypeScript-first, standalone components, excellent i18n |
| **UI Components** | shadcn-angular | Customizable, accessible, Tailwind-based |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, theming support, small bundle |
| **Animations** | Angular Animations + GSAP | Native support + advanced capabilities |
| **i18n** | @angular/localize | Built-in, compile-time optimization, SSR support |
| **State** | RxJS + Signals | Reactive patterns, Angular 21 native signals |
| **SSR** | Angular Universal | SEO, performance, social sharing |
| **Build** | esbuild (Angular CLI) | Fast builds, tree-shaking, code splitting |
| **Deployment** | Vercel/Netlify | Edge functions, CDN, automatic SSL |
| **Monitoring** | Google Analytics 4 | User behavior, performance tracking |

---

## 2. Project Structure

### 2.1 Folder Organization

```
roaya-website/
├── src/
│   ├── app/
│   │   ├── core/                      # Singleton services, guards, interceptors
│   │   │   ├── services/
│   │   │   │   ├── theme.service.ts
│   │   │   │   ├── language.service.ts
│   │   │   │   └── seo.service.ts
│   │   │   ├── guards/
│   │   │   │   └── locale.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── locale.interceptor.ts
│   │   │   └── models/
│   │   │       └── theme.model.ts
│   │   │
│   │   ├── shared/                    # Shared components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn components
│   │   │   │   │   ├── button/
│   │   │   │   │   ├── card/
│   │   │   │   │   ├── dialog/
│   │   │   │   │   └── ...
│   │   │   │   ├── layout/
│   │   │   │   │   ├── header/
│   │   │   │   │   ├── footer/
│   │   │   │   │   └── navigation/
│   │   │   │   └── common/
│   │   │   │       ├── loader/
│   │   │   │       ├── error-boundary/
│   │   │   │       └── scroll-to-top/
│   │   │   ├── directives/
│   │   │   │   ├── lazy-load-image.directive.ts
│   │   │   │   ├── animate-on-scroll.directive.ts
│   │   │   │   └── rtl-support.directive.ts
│   │   │   └── pipes/
│   │   │       ├── safe-html.pipe.ts
│   │   │       └── truncate.pipe.ts
│   │   │
│   │   ├── features/                  # Feature pages (standalone components)
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   ├── home.component.css
│   │   │   │   └── components/       # Page-specific components
│   │   │   │       ├── hero-section/
│   │   │   │       ├── services-preview/
│   │   │   │       └── testimonials/
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── portfolio/
│   │   │   ├── contact/
│   │   │   └── blog/
│   │   │
│   │   ├── layouts/                   # Layout components
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts
│   │   │   │   ├── main-layout.component.html
│   │   │   │   └── main-layout.component.css
│   │   │   └── minimal-layout/
│   │   │
│   │   ├── app.config.ts             # App configuration
│   │   ├── app.routes.ts             # Route definitions
│   │   └── app.component.ts          # Root component
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── optimized/            # WebP, AVIF versions
│   │   │   └── placeholders/         # LQIP (Low Quality Image Placeholders)
│   │   ├── icons/
│   │   │   ├── svg/                  # Inline SVG icons
│   │   │   └── sprite.svg            # SVG sprite
│   │   ├── fonts/
│   │   │   ├── tajawal/             # Arabic font
│   │   │   └── inter/               # English font
│   │   ├── i18n/                    # Translation files
│   │   │   ├── messages.en.xlf
│   │   │   └── messages.ar.xlf
│   │   └── data/                    # Static JSON data
│   │
│   ├── styles/
│   │   ├── _variables.css           # CSS custom properties
│   │   ├── _themes.css              # Theme definitions
│   │   ├── _typography.css          # Font styles
│   │   ├── _animations.css          # Reusable animations
│   │   ├── _utilities.css           # Custom utilities
│   │   └── styles.css               # Global styles
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html
│   └── main.ts                       # Bootstrap file
│
├── angular.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### 2.2 Architecture Decision: Standalone Components

**Decision:** Use standalone components exclusively (no NgModules)

**Rationale:**
- Angular 21 default and future direction
- Simpler mental model
- Better tree-shaking
- Improved lazy loading
- Less boilerplate

**Implementation Example:**

```typescript
// features/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesPreviewComponent } from './components/services-preview/services-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    ServicesPreviewComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Component logic
}
```

---

## 3. Theming System

### 3.1 Architecture Decision: CSS Custom Properties + Tailwind

**Decision:** Hybrid approach using CSS Variables for theming with Tailwind CSS

**Rationale:**
- Runtime theme switching without full rebuild
- Seamless shadcn integration
- Performance (no class toggling overhead)
- Type-safe with Tailwind IntelliSense

### 3.2 Theme Structure

**Color Token System:**

```css
/* styles/_variables.css */
:root {
  /* Color Primitives */
  --color-primary-50: 240 100% 97%;
  --color-primary-100: 240 100% 95%;
  --color-primary-200: 240 100% 90%;
  --color-primary-300: 240 100% 80%;
  --color-primary-400: 240 100% 70%;
  --color-primary-500: 240 100% 60%;
  --color-primary-600: 240 100% 50%;
  --color-primary-700: 240 90% 45%;
  --color-primary-800: 240 80% 40%;
  --color-primary-900: 240 70% 35%;

  /* Semantic Tokens - Light Mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  --primary: var(--color-primary-600);
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: var(--color-primary-600);

  --radius: 0.5rem;
}

/* Dark Mode Theme */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --primary: var(--color-primary-500);
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: var(--color-primary-500);
}
```

### 3.3 Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### 3.4 Theme Service

```typescript
// core/services/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Signal-based theme state
  public theme = signal<Theme>(this.getInitialTheme());
  public effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // Effect to apply theme changes
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Listen to system theme changes
    this.watchSystemTheme();
  }

  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('roaya-theme') as Theme;
      if (stored) return stored;
    }
    return 'system';
  }

  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('roaya-theme', theme);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = this.document.documentElement;

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = this.getSystemTheme();
    } else {
      effectiveTheme = theme;
    }

    root.setAttribute('data-theme', effectiveTheme);
    this.effectiveTheme.set(effectiveTheme);
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }

  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  public toggleTheme(): void {
    const current = this.effectiveTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
}
```

### 3.5 Theme Toggle Component

```typescript
// shared/components/common/theme-toggle/theme-toggle.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      class="relative p-2 rounded-md hover:bg-accent transition-colors"
      [attr.aria-label]="'Toggle theme'"
    >
      @if (themeService.effectiveTheme() === 'light') {
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      } @else {
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      }
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ThemeToggleComponent {
  public themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

---

## 4. Internationalization (i18n)

### 4.1 Architecture Decision: @angular/localize

**Decision:** Use Angular's built-in `@angular/localize` with compile-time translation

**Rationale:**
- Best SSR support (compile separate builds per locale)
- No runtime translation overhead
- Type-safe with Angular templates
- Excellent build-time optimization
- Official Angular solution

**Alternatives Considered:**

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **@angular/localize** | SSR support, compile-time, official | Separate builds per locale | SELECTED |
| **ngx-translate** | Runtime switching, single build | Performance overhead, SSR complexity | Rejected |
| **Transloco** | Modern, SSR support | Smaller community | Considered for future |

### 4.2 Locale Configuration

```typescript
// app.config.ts
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: LOCALE_ID,
      useFactory: () => {
        // Detect locale from URL or browser
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          return pathname.startsWith('/ar') ? 'ar' : 'en';
        }
        return 'en';
      }
    }
  ]
};
```

### 4.3 Build Configuration for Multiple Locales

```json
// angular.json (excerpt)
{
  "projects": {
    "roaya-website": {
      "i18n": {
        "sourceLocale": "en",
        "locales": {
          "ar": {
            "translation": "src/assets/i18n/messages.ar.xlf",
            "baseHref": "/ar/"
          }
        }
      },
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "localize": true,
              "outputPath": "dist/roaya-website"
            },
            "development": {
              "localize": false
            }
          }
        },
        "serve": {
          "configurations": {
            "ar": {
              "browserTarget": "roaya-website:build:development,ar"
            }
          }
        }
      }
    }
  }
}
```

### 4.4 RTL/LTR Support

```typescript
// core/services/language.service.ts
import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  public language = signal<Language>('en');
  public direction = signal<'ltr' | 'rtl'>('ltr');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeLanguage();
    }

    // Apply direction changes
    effect(() => {
      this.applyDirection(this.direction());
    });
  }

  private initializeLanguage(): void {
    const pathname = window.location.pathname;
    const lang = pathname.startsWith('/ar') ? 'ar' : 'en';
    this.setLanguage(lang);
  }

  public setLanguage(lang: Language): void {
    this.language.set(lang);
    this.direction.set(lang === 'ar' ? 'rtl' : 'ltr');

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('roaya-language', lang);
    }
  }

  private applyDirection(dir: 'ltr' | 'rtl'): void {
    const html = this.document.documentElement;
    html.setAttribute('dir', dir);
    html.setAttribute('lang', this.language());

    // Update body class for CSS targeting
    this.document.body.classList.remove('ltr', 'rtl');
    this.document.body.classList.add(dir);
  }

  public switchLanguage(): void {
    const newLang: Language = this.language() === 'en' ? 'ar' : 'en';

    if (isPlatformBrowser(this.platformId)) {
      // Navigate to other locale
      const currentPath = window.location.pathname;
      const newPath = newLang === 'ar'
        ? `/ar${currentPath}`
        : currentPath.replace(/^\/ar/, '');

      window.location.href = newPath;
    }
  }
}
```

### 4.5 Font Loading Strategy

```css
/* styles/_typography.css */

/* Inter for English - Variable Font */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/assets/fonts/inter/Inter-Variable.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
                 U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
                 U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Tajawal for Arabic */
@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/assets/fonts/tajawal/Tajawal-Regular.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41,
                 U+FB50-FDFF, U+FE80-FEFC;
}

@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/assets/fonts/tajawal/Tajawal-Bold.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41,
                 U+FB50-FDFF, U+FE80-FEFC;
}

/* Font Application */
body {
  font-family: var(--font-family);
  font-feature-settings: var(--font-features);
}

:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-features: 'cv02', 'cv03', 'cv04', 'cv11';
}

body.rtl {
  --font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;
  --font-features: normal;
}

/* Preload Critical Fonts */
```

```html
<!-- index.html -->
<head>
  <!-- Preload fonts for better performance -->
  <link rel="preload" href="/assets/fonts/inter/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/tajawal/Tajawal-Regular.woff2" as="font" type="font/woff2" crossorigin>
</head>
```

### 4.6 Translation Workflow

```html
<!-- Example: features/home/home.component.html -->
<section class="hero">
  <h1 i18n="Home page main heading|Main hero heading@@homeHeroTitle">
    Welcome to Roaya IT
  </h1>

  <p i18n="Home page hero description@@homeHeroDescription">
    We deliver innovative IT solutions for modern businesses
  </p>

  <button i18n="Call to action button@@ctaButton">
    Get Started
  </button>
</section>
```

**Extract translations:**
```bash
# Extract messages to XLF files
ng extract-i18n --output-path src/assets/i18n
```

**Translation file structure:**
```xml
<!-- src/assets/i18n/messages.ar.xlf -->
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="ar">
  <file original="ng.template" datatype="plaintext">
    <body>
      <trans-unit id="homeHeroTitle" datatype="html">
        <source>Welcome to Roaya IT</source>
        <target>مرحبا بكم في رؤيا لتقنية المعلومات</target>
      </trans-unit>
      <trans-unit id="homeHeroDescription" datatype="html">
        <source>We deliver innovative IT solutions for modern businesses</source>
        <target>نقدم حلول تقنية مبتكرة للأعمال الحديثة</target>
      </trans-unit>
      <trans-unit id="ctaButton" datatype="html">
        <source>Get Started</source>
        <target>ابدأ الآن</target>
      </trans-unit>
    </body>
  </file>
</xliff>
```

---

## 5. Component Architecture

### 5.1 Component Classification

**1. Smart Components (Container)**
- Manage state and business logic
- Interact with services
- Pass data to presentational components
- Handle routing

**2. Presentational Components (UI)**
- Pure display logic
- Receive data via @Input()
- Emit events via @Output()
- No service dependencies (except theme/language)

**3. Layout Components**
- Structural components (header, footer, sidebar)
- Manage page structure
- Can be smart or presentational

### 5.2 Base Component Pattern

```typescript
// shared/components/base/base.component.ts
import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  protected destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 5.3 Smart Component Example

```typescript
// features/services/services.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/components/base/base.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { ServicesDataService } from '@core/services/services-data.service';
import { Service } from '@core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent extends BaseComponent implements OnInit {
  private servicesDataService = inject(ServicesDataService);

  // Signal-based state
  public services = signal<Service[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.servicesDataService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.services.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load services');
          this.loading.set(false);
        }
      });
  }
}
```

### 5.4 Presentational Component Example

```typescript
// features/services/components/service-card/service-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '@core/models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card group hover:shadow-lg transition-shadow duration-300">
      <div class="card-icon">
        <img [src]="service.icon" [alt]="service.title" loading="lazy" />
      </div>

      <h3 class="card-title" i18n>{{ service.title }}</h3>

      <p class="card-description" i18n>{{ service.description }}</p>

      <button
        (click)="onLearnMore()"
        class="btn btn-primary mt-4"
        i18n="Learn more button"
      >
        Learn More
      </button>
    </article>
  `,
  styleUrl: './service-card.component.css'
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
  @Output() learnMore = new EventEmitter<Service>();

  onLearnMore(): void {
    this.learnMore.emit(this.service);
  }
}
```

### 5.5 Lazy Loading Strategy

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent),
    title: 'Roaya IT - Home'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component')
      .then(m => m.AboutComponent),
    title: 'About Us - Roaya IT'
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services.component')
      .then(m => m.ServicesComponent),
    title: 'Our Services - Roaya IT'
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component')
      .then(m => m.PortfolioComponent),
    title: 'Portfolio - Roaya IT'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component')
      .then(m => m.ContactComponent),
    title: 'Contact Us - Roaya IT'
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes')
      .then(m => m.blogRoutes)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: '404 - Page Not Found'
  }
];
```

---

## 6. State Management

### 6.1 Architecture Decision: RxJS + Signals (No External Library)

**Decision:** Use Angular's native Signals with RxJS for state management

**Rationale:**
- Website has simple state requirements
- Signals are Angular 21's future
- No additional bundle size
- Excellent performance
- Native integration with change detection

**When to Consider NgRx/Akita:**
- Complex cross-component state sharing
- Time-travel debugging needed
- Large team requiring strict patterns

### 6.2 State Management Pattern

```typescript
// core/services/app-state.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface AppState {
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  navigationOpen: boolean;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // Private writable signals
  private _theme = signal<'light' | 'dark'>('light');
  private _language = signal<'en' | 'ar'>('en');
  private _navigationOpen = signal<boolean>(false);
  private _loading = signal<boolean>(false);

  // Public read-only signals
  public readonly theme = this._theme.asReadonly();
  public readonly language = this._language.asReadonly();
  public readonly navigationOpen = this._navigationOpen.asReadonly();
  public readonly loading = this._loading.asReadonly();

  // Computed signals
  public readonly isRTL = computed(() => this.language() === 'ar');
  public readonly isDark = computed(() => this.theme() === 'dark');

  // State updaters
  public setTheme(theme: 'light' | 'dark'): void {
    this._theme.set(theme);
  }

  public setLanguage(language: 'en' | 'ar'): void {
    this._language.set(language);
  }

  public toggleNavigation(): void {
    this._navigationOpen.update(state => !state);
  }

  public setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
```

### 6.3 Component State Pattern

```typescript
// Example: Component-level state
@Component({
  selector: 'app-portfolio',
  standalone: true,
  template: `...`
})
export class PortfolioComponent {
  // Local component state
  private selectedCategory = signal<string>('all');
  private projects = signal<Project[]>([]);

  // Computed derived state
  public filteredProjects = computed(() => {
    const category = this.selectedCategory();
    const allProjects = this.projects();

    if (category === 'all') return allProjects;

    return allProjects.filter(p => p.category === category);
  });

  public selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
```

---

## 7. Performance Optimization

### 7.1 Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.2s | 1.8s |
| Largest Contentful Paint | < 2.5s | 4.0s |
| Time to Interactive | < 2.5s | 3.8s |
| Total Blocking Time | < 200ms | 600ms |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| Initial JS Bundle | < 150KB | 200KB |
| Initial CSS Bundle | < 50KB | 75KB |
| Image Formats | WebP/AVIF | JPG fallback |

### 7.2 Code Splitting Strategy

```typescript
// Aggressive route-based splitting
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  // Each route loads independently
];

// Component-level splitting for heavy features
@Component({
  selector: 'app-home',
  template: `
    @defer (on viewport) {
      <app-testimonials-section />
    } @placeholder {
      <div class="skeleton h-64"></div>
    }
  `
})
export class HomeComponent {}
```

### 7.3 Image Optimization Strategy

```typescript
// shared/directives/lazy-load-image.directive.ts
import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoad!: string;
  @Input() placeholder = '/assets/images/placeholders/default.svg';

  private el = inject(ElementRef);

  ngOnInit(): void {
    const img = this.el.nativeElement as HTMLImageElement;

    // Set placeholder
    img.src = this.placeholder;

    // Observe for viewport entry
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before entering viewport
    });

    observer.observe(img);
  }

  private loadImage(img: HTMLImageElement): void {
    // Create a new image to load
    const tempImg = new Image();

    tempImg.onload = () => {
      img.src = this.appLazyLoad;
      img.classList.add('loaded');
    };

    tempImg.src = this.appLazyLoad;
  }
}
```

**Usage:**
```html
<img
  [appLazyLoad]="'/assets/images/optimized/hero.webp'"
  alt="Hero image"
  class="opacity-0 transition-opacity duration-300 loaded:opacity-100"
  width="1200"
  height="600"
/>
```

### 7.4 Font Loading Optimization

```html
<!-- index.html -->
<head>
  <!-- Preconnect to font origins -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload critical fonts -->
  <link rel="preload" as="font" type="font/woff2"
        href="/assets/fonts/inter/Inter-Variable.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2"
        href="/assets/fonts/tajawal/Tajawal-Regular.woff2" crossorigin>

  <!-- Use font-display: swap -->
  <style>
    @font-face {
      font-family: 'Inter';
      font-display: swap;
      /* ... */
    }
  </style>
</head>
```

### 7.5 Critical CSS Strategy

```json
// angular.json
{
  "projects": {
    "roaya-website": {
      "architect": {
        "build": {
          "options": {
            "optimization": {
              "styles": {
                "minify": true,
                "inlineCritical": true
              },
              "fonts": {
                "inline": true
              }
            }
          }
        }
      }
    }
  }
}
```

### 7.6 Preloading Strategy

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Preload all lazy routes after initial render
    )
  ]
};
```

**Custom Preloading Strategy:**
```typescript
// core/strategies/selective-preload.strategy.ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload routes marked with data: { preload: true }
    if (route.data?.['preload']) {
      // Delay preloading by 2 seconds to prioritize initial render
      return timer(2000).pipe(
        mergeMap(() => load())
      );
    }

    return of(null);
  }
}

// Usage in routes:
{
  path: 'about',
  loadComponent: () => import('./features/about/about.component'),
  data: { preload: true } // This route will be preloaded
}
```

### 7.7 Bundle Analysis

```json
// package.json
{
  "scripts": {
    "build:stats": "ng build --stats-json",
    "analyze": "webpack-bundle-analyzer dist/roaya-website/stats.json"
  }
}
```

---

## 8. Animation Architecture

### 8.1 Architecture Decision: Hybrid Approach

**Decision:** Use Angular Animations for route transitions + GSAP for complex animations

**Rationale:**
- Angular Animations: Simple, declarative, built-in
- GSAP: Advanced timelines, scroll-triggered effects, superior performance

### 8.2 Angular Animations for Routes

```typescript
// shared/animations/route.animations.ts
import { trigger, transition, style, query, group, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),

    query(':enter', [
      animate('400ms ease-out', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

export const slideInUp = trigger('slideInUp', [
  transition(':enter', [
    style({ transform: 'translateY(30px)', opacity: 0 }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);
```

**Usage:**
```typescript
@Component({
  selector: 'app-root',
  template: `
    <div [@routeAnimations]="outlet && outlet.activatedRouteData">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [routeAnimations]
})
export class AppComponent {}
```

### 8.3 GSAP for Scroll Animations

```typescript
// shared/directives/animate-on-scroll.directive.ts
import { Directive, ElementRef, Input, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() appAnimateOnScroll: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' = 'fadeIn';
  @Input() animationDelay = 0;
  @Input() animationDuration = 0.8;

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private scrollTrigger?: ScrollTrigger;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.el.nativeElement;
    const animation = this.getAnimation();

    gsap.set(element, animation.from);

    this.scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(element, {
          ...animation.to,
          duration: this.animationDuration,
          delay: this.animationDelay,
          ease: 'power3.out'
        });
      },
      once: true
    });
  }

  ngOnDestroy(): void {
    this.scrollTrigger?.kill();
  }

  private getAnimation() {
    const animations = {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideUp: {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0 }
      },
      slideLeft: {
        from: { opacity: 0, x: 50 },
        to: { opacity: 1, x: 0 }
      },
      slideRight: {
        from: { opacity: 0, x: -50 },
        to: { opacity: 1, x: 0 }
      },
      scaleIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      }
    };

    return animations[this.appAnimateOnScroll];
  }
}
```

**Usage:**
```html
<section appAnimateOnScroll="slideUp" [animationDelay]="0.2">
  <h2>Animated Section</h2>
</section>
```

### 8.4 Loading Animations

```typescript
// shared/components/common/loader/loader.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.fullscreen]="fullscreen">
      <div class="loader" [class]="size">
        <div class="spinner"></div>
        @if (message) {
          <p class="loader-message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;

      &.fullscreen {
        position: fixed;
        inset: 0;
        background: hsl(var(--background) / 0.8);
        backdrop-filter: blur(4px);
        z-index: 9999;
      }
    }

    .spinner {
      width: var(--size);
      height: var(--size);
      border: 3px solid hsl(var(--muted));
      border-top-color: hsl(var(--primary));
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loader.sm { --size: 24px; }
    .loader.md { --size: 40px; }
    .loader.lg { --size: 64px; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loader-message {
      margin-top: 1rem;
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }
  `]
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;
  @Input() fullscreen = false;
}
```

### 8.5 Page Transition Strategy

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from '@shared/animations/route.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div [@routeAnimations]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [routeAnimations]
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}

// In routes:
{
  path: 'about',
  component: AboutComponent,
  data: { animation: 'AboutPage' }
}
```

---

## 9. Build & Deployment

### 9.1 Architecture Decision: SSR with Angular Universal

**Decision:** Server-Side Rendering for all pages

**Rationale:**
- SEO critical for corporate website
- Better First Contentful Paint
- Social media preview cards
- Graceful degradation for JS-disabled browsers

### 9.2 SSR Configuration

```typescript
// app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

```typescript
// server.ts
import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y',
    setHeaders: (res, path) => {
      // Immutable caching for hashed files
      if (path.includes('.')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
```

### 9.3 Build Optimization

```json
// angular.json
{
  "projects": {
    "roaya-website": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/roaya-website",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": ["src/styles.css"],
            "scripts": [],
            "budgets": [
              {
                "type": "initial",
                "maximumWarning": "200kb",
                "maximumError": "300kb"
              },
              {
                "type": "anyComponentStyle",
                "maximumWarning": "6kb",
                "maximumError": "10kb"
              }
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "200kb",
                  "maximumError": "300kb"
                }
              ],
              "optimization": {
                "scripts": true,
                "styles": {
                  "minify": true,
                  "inlineCritical": true
                },
                "fonts": {
                  "inline": true
                }
              },
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### 9.4 Deployment Strategy (Vercel)

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|webp|avif|svg|woff|woff2|ttf|ico|json))",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

```json
// package.json (scripts)
{
  "scripts": {
    "dev": "ng serve",
    "dev:ar": "ng serve --configuration=ar",
    "build": "ng build",
    "build:ssr": "ng build && ng run roaya-website:server",
    "build:prod": "ng build --configuration=production && ng run roaya-website:server:production",
    "serve:ssr": "node dist/roaya-website/server/server.mjs",
    "prerender": "ng run roaya-website:prerender",
    "test": "ng test",
    "lint": "ng lint",
    "analyze": "ng build --stats-json && webpack-bundle-analyzer dist/roaya-website/browser/stats.json"
  }
}
```

### 9.5 Cache Strategy

```typescript
// HTTP Cache Headers Strategy
const cacheStrategy = {
  // HTML files - No cache (always fetch fresh)
  html: 'no-cache, no-store, must-revalidate',

  // Hashed assets (main.abc123.js) - Immutable
  hashedAssets: 'public, max-age=31536000, immutable',

  // Images - 1 week cache
  images: 'public, max-age=604800',

  // Fonts - 1 year cache
  fonts: 'public, max-age=31536000, immutable',

  // API responses (future) - 5 minutes with stale-while-revalidate
  api: 'public, max-age=300, stale-while-revalidate=600'
};
```

### 9.6 Pre-rendering Strategy

```typescript
// For static pages, pre-render at build time
{
  "scripts": {
    "prerender": "ng run roaya-website:prerender --routes-file routes.txt"
  }
}

// routes.txt
/
/about
/services
/portfolio
/contact
/ar
/ar/about
/ar/services
/ar/portfolio
/ar/contact
```

---

## 10. Security Considerations

### 10.1 Content Security Policy

```html
<!-- index.html -->
<head>
  <meta http-equiv="Content-Security-Policy"
        content="
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          font-src 'self' data:;
          connect-src 'self' https://www.google-analytics.com;
          frame-ancestors 'none';
          base-uri 'self';
          form-action 'self';
        "
  >
</head>
```

### 10.2 XSS Protection

```typescript
// Always sanitize user input
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({...})
export class ExampleComponent {
  constructor(private sanitizer: DomSanitizer) {}

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
  }
}
```

### 10.3 HTTPS & Security Headers

```typescript
// server.ts additions
import helmet from 'helmet';

server.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
      /\
     /E2E\       10% - End-to-End (Playwright)
    /------\
   /  Inte  \    20% - Integration (Component + Service)
  /----------\
 /   Unit     \  70% - Unit Tests (Jasmine + Karma)
/--------------\
```

### 11.2 Unit Testing Example

```typescript
// theme.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to system theme', () => {
    expect(service.theme()).toBe('system');
  });

  it('should set and persist theme', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('roaya-theme')).toBe('dark');
  });

  it('should toggle between light and dark', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.effectiveTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.effectiveTheme()).toBe('light');
  });
});
```

### 11.3 Component Testing Example

```typescript
// service-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceCardComponent } from './service-card.component';

describe('ServiceCardComponent', () => {
  let component: ServiceCardComponent;
  let fixture: ComponentFixture<ServiceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCardComponent);
    component = fixture.componentInstance;

    component.service = {
      id: '1',
      title: 'Web Development',
      description: 'Custom web solutions',
      icon: '/assets/icons/web.svg'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display service title', () => {
    const title = fixture.nativeElement.querySelector('.card-title');
    expect(title.textContent).toContain('Web Development');
  });

  it('should emit learnMore event when button clicked', () => {
    spyOn(component.learnMore, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.learnMore.emit).toHaveBeenCalledWith(component.service);
  });
});
```

### 11.4 E2E Testing Setup (Playwright)

```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();

    const heading = page.locator('h1');
    await expect(heading).toContainText('Welcome to Roaya IT');
  });

  test('should switch theme', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await themeToggle.click();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should navigate to services', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Our Services');
    await expect(page).toHaveURL('/services');
  });
});
```

---

## 12. Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **SSR Performance Issues** | Medium | High | Implement caching, optimize server resources, use CDN |
| **Bundle Size Exceeds Budget** | Medium | High | Regular bundle analysis, strict code review, lazy loading |
| **i18n Complexity** | Low | Medium | Use Angular's built-in localize, comprehensive testing |
| **GSAP License Costs** | Low | Low | Use free tier initially, budget for commercial license |
| **Browser Compatibility** | Low | Medium | Polyfills for older browsers, progressive enhancement |
| **Third-party Dependencies** | Medium | Medium | Regular audits, minimize dependencies, use tree-shakeable libraries |
| **Accessibility Issues** | Medium | High | WCAG 2.1 AA compliance, automated testing, manual audits |

---

## Appendix A: Technology Alternatives Considered

### UI Framework
- **Tailwind CSS** (SELECTED) - Utility-first, small bundle, customizable
- Bootstrap - Too opinionated, larger bundle
- Material Design - Angular Material heavy, design constraints

### State Management
- **Signals + RxJS** (SELECTED) - Native, simple, performant
- NgRx - Overkill for website complexity
- Akita - Good but adds dependency

### Animation
- **Angular Animations + GSAP** (SELECTED) - Best of both worlds
- Framer Motion - React-focused
- CSS-only - Limited capabilities

### i18n
- **@angular/localize** (SELECTED) - Official, SSR support
- ngx-translate - Runtime overhead
- Transloco - Newer, smaller community

---

## Appendix B: File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case.component.ts | `hero-section.component.ts` |
| Services | kebab-case.service.ts | `theme.service.ts` |
| Directives | kebab-case.directive.ts | `lazy-load-image.directive.ts` |
| Pipes | kebab-case.pipe.ts | `safe-html.pipe.ts` |
| Models | kebab-case.model.ts | `service.model.ts` |
| Guards | kebab-case.guard.ts | `auth.guard.ts` |
| Interceptors | kebab-case.interceptor.ts | `locale.interceptor.ts` |
| Routes | kebab-case.routes.ts | `blog.routes.ts` |

---

## Appendix C: Git Workflow

```
main (production)
  ↑
  └─ develop (integration)
       ↑
       ├─ feature/hero-section
       ├─ feature/theme-switcher
       ├─ bugfix/navigation-responsive
       └─ chore/update-dependencies
```

**Branch Naming:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Production hotfixes
- `chore/description` - Maintenance tasks

**Commit Convention:**
```
feat: Add dark mode toggle component
fix: Resolve RTL layout issue in navigation
chore: Update Angular to v21.1
docs: Update architecture documentation
style: Format code according to prettier
refactor: Simplify theme service logic
test: Add unit tests for language service
perf: Optimize image loading strategy
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | Super Tech Lead | Initial architecture document |

**Review Schedule:** Quarterly or upon major technology updates

**Approval:** Pending Product Owner & Development Team Review

---

*This is a living document. All architecture decisions should be updated here and communicated to the team.*
