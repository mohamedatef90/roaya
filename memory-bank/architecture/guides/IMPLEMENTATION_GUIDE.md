# Roaya IT Website - Implementation Guide

**Purpose:** Step-by-step guide for developers implementing the technical architecture

**Target Audience:** Frontend developers working on the Roaya IT website

**Prerequisites:**
- Node.js 20+
- Angular CLI 21+
- Basic understanding of Angular, TypeScript, Tailwind CSS

---

## Table of Contents

1. [Initial Project Setup](#1-initial-project-setup)
2. [Core Infrastructure Setup](#2-core-infrastructure-setup)
3. [Theming Implementation](#3-theming-implementation)
4. [Internationalization Setup](#4-internationalization-setup)
5. [Component Development Workflow](#5-component-development-workflow)
6. [Performance Optimization Checklist](#6-performance-optimization-checklist)
7. [Testing Guidelines](#7-testing-guidelines)
8. [Deployment Checklist](#8-deployment-checklist)

---

## 1. Initial Project Setup

### Step 1.1: Create Angular Project

```bash
# Create new Angular 21 project with standalone components
ng new roaya-website \
  --routing \
  --style=css \
  --standalone \
  --skip-git=false \
  --package-manager=npm

cd roaya-website
```

### Step 1.2: Install Dependencies

```bash
# Core dependencies
npm install \
  @angular/localize \
  @angular/ssr \
  tailwindcss \
  postcss \
  autoprefixer \
  gsap

# Development dependencies
npm install -D \
  @playwright/test \
  @types/node \
  prettier \
  eslint
```

### Step 1.3: Initialize Tailwind CSS

```bash
npx tailwindcss init
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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

### Step 1.4: Project Structure Setup

```bash
# Create core directories
mkdir -p src/app/{core,shared,features,layouts}
mkdir -p src/app/core/{services,models,guards,interceptors}
mkdir -p src/app/shared/{components,directives,pipes}
mkdir -p src/app/shared/components/{ui,layout,common}
mkdir -p src/styles
mkdir -p src/assets/{images,icons,fonts,i18n,data}
```

---

## 2. Core Infrastructure Setup

### Step 2.1: Create Base Component

```bash
ng generate class shared/components/base/base.component --type=directive
```

```typescript
// src/app/shared/components/base/base.component.ts
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

### Step 2.2: Create Theme Service

```bash
ng generate service core/services/theme
```

```typescript
// src/app/core/services/theme.service.ts
import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  public theme = signal<Theme>(this.getInitialTheme());
  public effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => {
      this.applyTheme(this.theme());
    });

    if (isPlatformBrowser(this.platformId)) {
      this.watchSystemTheme();
    }
  }

  private getInitialTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('roaya-theme') as Theme;
      if (stored) return stored;
    }
    return 'system';
  }

  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('roaya-theme', theme);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = this.document.documentElement;
    const effectiveTheme = theme === 'system' ? this.getSystemTheme() : theme;
    root.setAttribute('data-theme', effectiveTheme);
    this.effectiveTheme.set(effectiveTheme);
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (isPlatformBrowser(this.platformId) && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }

  private watchSystemTheme(): void {
    if (window.matchMedia) {
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

### Step 2.3: Create Language Service

```bash
ng generate service core/services/language
```

```typescript
// src/app/core/services/language.service.ts
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
    this.document.body.classList.remove('ltr', 'rtl');
    this.document.body.classList.add(dir);
  }

  public switchLanguage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const newLang: Language = this.language() === 'en' ? 'ar' : 'en';
    const currentPath = window.location.pathname;
    const newPath = newLang === 'ar'
      ? `/ar${currentPath}`
      : currentPath.replace(/^\/ar/, '');

    window.location.href = newPath;
  }
}
```

---

## 3. Theming Implementation

### Step 3.1: Create Theme CSS Variables

Create `src/styles/_variables.css`:
```css
:root {
  /* Color Primitives */
  --color-primary-50: 240 100% 97%;
  --color-primary-100: 240 100% 95%;
  --color-primary-500: 240 100% 60%;
  --color-primary-600: 240 100% 50%;
  --color-primary-700: 240 90% 45%;

  /* Semantic Tokens - Light Mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --primary: var(--color-primary-600);
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: var(--color-primary-600);

  --radius: 0.5rem;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --primary: var(--color-primary-500);
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: var(--color-primary-500);
}
```

### Step 3.2: Import Styles

Update `src/styles.css`:
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@import './styles/_variables.css';

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### Step 3.3: Create Theme Toggle Component

```bash
ng generate component shared/components/common/theme-toggle --standalone
```

```typescript
// src/app/shared/components/common/theme-toggle/theme-toggle.component.ts
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
        <!-- Moon icon for dark mode -->
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      } @else {
        <!-- Sun icon for light mode -->
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

## 4. Internationalization Setup

### Step 4.1: Configure Angular i18n

Update `angular.json`:
```json
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
              "localize": true
            },
            "development": {
              "localize": false
            },
            "ar": {
              "localize": ["ar"]
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

### Step 4.2: Add i18n to Components

Example component with translations:
```html
<!-- features/home/home.component.html -->
<section class="hero">
  <h1 i18n="Home page hero title@@homeHeroTitle">
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

### Step 4.3: Extract and Translate

```bash
# Extract messages
ng extract-i18n --output-path src/assets/i18n

# This creates: src/assets/i18n/messages.xlf

# Copy and rename for Arabic
cp src/assets/i18n/messages.xlf src/assets/i18n/messages.ar.xlf

# Translate content in messages.ar.xlf
```

Example `messages.ar.xlf`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="ar">
  <file original="ng.template" datatype="plaintext">
    <body>
      <trans-unit id="homeHeroTitle" datatype="html">
        <source>Welcome to Roaya IT</source>
        <target>مرحبا بكم في رؤيا لتقنية المعلومات</target>
      </trans-unit>
    </body>
  </file>
</xliff>
```

### Step 4.4: Serve in Different Locales

```bash
# English (default)
ng serve

# Arabic
ng serve --configuration=ar
```

---

## 5. Component Development Workflow

### Step 5.1: Create a New Page Component

```bash
# Generate page component
ng generate component features/about --standalone

# Generate sub-components if needed
ng generate component features/about/components/team-section --standalone
```

### Step 5.2: Component Template

```typescript
// features/about/about.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base/base.component';
import { TeamSectionComponent } from './components/team-section/team-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    TeamSectionComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent extends BaseComponent implements OnInit {
  // Signal-based state
  public loading = signal(true);
  public data = signal<any>(null);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Load data logic
    this.loading.set(false);
  }
}
```

### Step 5.3: Add to Routes

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
  // ... more routes
];
```

### Step 5.4: Presentational Component Pattern

```typescript
// features/about/components/team-member-card/team-member-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

@Component({
  selector: 'app-team-member-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card group hover:shadow-lg transition-shadow">
      <img
        [src]="member.image"
        [alt]="member.name"
        class="w-full h-48 object-cover rounded-t-lg"
        loading="lazy"
      />

      <div class="p-4">
        <h3 class="text-lg font-semibold" i18n>{{ member.name }}</h3>
        <p class="text-sm text-muted-foreground" i18n>{{ member.role }}</p>
        <p class="mt-2 text-sm" i18n>{{ member.bio }}</p>
      </div>

      <button
        (click)="onViewProfile()"
        class="btn btn-ghost w-full"
        i18n="View profile button"
      >
        View Profile
      </button>
    </article>
  `,
  styleUrl: './team-member-card.component.css'
})
export class TeamMemberCardComponent {
  @Input({ required: true }) member!: TeamMember;
  @Output() viewProfile = new EventEmitter<TeamMember>();

  onViewProfile(): void {
    this.viewProfile.emit(this.member);
  }
}
```

---

## 6. Performance Optimization Checklist

### Image Optimization

1. **Convert images to WebP/AVIF**
```bash
# Using sharp-cli
npm install -g sharp-cli

# Convert images
sharp -i original.jpg -o optimized.webp --webp
sharp -i original.jpg -o optimized.avif --avif
```

2. **Lazy load images**
```html
<img
  src="/assets/images/placeholder.svg"
  [attr.data-src]="/assets/images/hero.webp"
  alt="Hero"
  loading="lazy"
  width="1200"
  height="600"
/>
```

3. **Use picture element for responsive images**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Font Optimization

1. **Preload critical fonts** (in `index.html`):
```html
<link rel="preload" href="/assets/fonts/inter/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
```

2. **Use font-display: swap**:
```css
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/assets/fonts/inter/Inter-Variable.woff2') format('woff2');
}
```

### Code Splitting

1. **Lazy load routes** (already done in routing)

2. **Use @defer for heavy components**:
```html
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <div class="skeleton h-64"></div>
}
```

### Bundle Analysis

```bash
# Build with stats
npm run build:stats

# Analyze
npm run analyze
```

---

## 7. Testing Guidelines

### Unit Tests

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

  it('should toggle theme', () => {
    service.setTheme('light');
    expect(service.effectiveTheme()).toBe('light');

    service.toggleTheme();
    expect(service.effectiveTheme()).toBe('dark');
  });
});
```

### Component Tests

```typescript
// team-member-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamMemberCardComponent } from './team-member-card.component';

describe('TeamMemberCardComponent', () => {
  let component: TeamMemberCardComponent;
  let fixture: ComponentFixture<TeamMemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMemberCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamMemberCardComponent);
    component = fixture.componentInstance;

    component.member = {
      id: '1',
      name: 'John Doe',
      role: 'CEO',
      image: '/assets/images/team/john.jpg',
      bio: 'Founder of Roaya IT'
    };

    fixture.detectChanges();
  });

  it('should display member name', () => {
    const name = fixture.nativeElement.querySelector('h3');
    expect(name.textContent).toContain('John Doe');
  });

  it('should emit viewProfile event', () => {
    spyOn(component.viewProfile, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.viewProfile.emit).toHaveBeenCalledWith(component.member);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display hero', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();

    const heading = page.locator('h1');
    await expect(heading).toContainText('Welcome');
  });

  test('should switch theme', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await themeToggle.click();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});
```

---

## 8. Deployment Checklist

### Pre-Deployment

- [ ] Run full test suite: `npm test`
- [ ] Run E2E tests: `npm run e2e`
- [ ] Build production bundle: `npm run build:prod`
- [ ] Analyze bundle size: `npm run analyze`
- [ ] Check bundle budget: Initial < 200KB
- [ ] Run Lighthouse audit: Score 90+
- [ ] Test both locales: EN and AR
- [ ] Verify SEO meta tags
- [ ] Test on mobile devices
- [ ] Verify accessibility (WCAG 2.1 AA)

### Build Commands

```bash
# Development build
npm run build

# Production build (all locales)
npm run build:prod

# SSR build
npm run build:ssr

# Serve SSR locally
npm run serve:ssr
```

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Environment Variables** (in Vercel dashboard)
- `NODE_ENV=production`
- `PORT=3000`

### Post-Deployment

- [ ] Verify production URLs work
- [ ] Test both EN and AR routes
- [ ] Check Google Analytics tracking
- [ ] Monitor Core Web Vitals
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN caching
- [ ] Set up monitoring alerts

---

## Quick Reference: Common Commands

```bash
# Development
npm run dev              # Start dev server (English)
npm run dev:ar           # Start dev server (Arabic)

# Building
npm run build            # Build for development
npm run build:prod       # Build for production
npm run build:ssr        # Build with SSR

# Testing
npm test                 # Unit tests
npm run test:watch       # Unit tests (watch mode)
npm run e2e              # E2E tests
npm run lint             # Lint code

# i18n
ng extract-i18n --output-path src/assets/i18n  # Extract translations

# Analysis
npm run analyze          # Bundle analysis
```

---

## Troubleshooting

### Issue: Theme not applying
**Solution:** Ensure `data-theme` attribute is on `<html>` element and CSS variables are loaded

### Issue: RTL not working
**Solution:** Check `dir` attribute on `<html>` and verify Arabic font is loaded

### Issue: i18n not working
**Solution:** Run `ng extract-i18n` and ensure translation files exist

### Issue: Large bundle size
**Solution:** Run `npm run analyze` to identify large dependencies, use lazy loading

---

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [GSAP Documentation](https://greensock.com/docs/)
- [Playwright Testing](https://playwright.dev)
- [Web.dev Performance](https://web.dev/performance/)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-05
**Maintained By:** Tech Lead
