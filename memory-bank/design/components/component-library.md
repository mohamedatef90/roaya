# Component Library - Reusable Patterns

> **Reference Implementation:** `/src/app/features/contact/`
> **Last Updated:** 2025-12-06

## Overview

This document contains production-ready, copy-paste component patterns extracted from the Contact page. All patterns include TypeScript, HTML, and SCSS code with accessibility, RTL support, and dark mode.

---

## Table of Contents

1. [Hero Sections](#hero-sections)
2. [Glassmorphism Cards](#glassmorphism-cards)
3. [Form Components](#form-components)
4. [Buttons](#buttons)
5. [Contact Info Cards](#contact-info-cards)
6. [Success States](#success-states)
7. [Loading States](#loading-states)
8. [Error States](#error-states)
9. [Badges & Tags](#badges--tags)
10. [3D Floating Elements](#3d-floating-elements)

---

## Hero Sections

### Pattern: Hero with 3D Elements & Parallax

**Use Case:** Premium hero section with gradient background, floating 3D shapes, and animated text

#### HTML
```html
<section class="hero-section relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Gradient Orbs with Parallax -->
    <div class="parallax-slow absolute top-0 right-0 rtl:left-0 rtl:right-auto w-[600px] h-[600px] bg-gradient-to-br from-secondary-500/30 to-transparent rounded-full blur-3xl"></div>
    <div class="parallax-fast absolute bottom-0 left-0 rtl:right-0 rtl:left-auto w-[500px] h-[500px] bg-gradient-to-tr from-accent-500/20 to-transparent rounded-full blur-3xl"></div>

    <!-- Grid Pattern Overlay -->
    <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
  </div>

  <!-- 3D Floating Elements -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="hero-3d-element float-element absolute top-20 right-[15%] rtl:left-[15%] rtl:right-auto w-20 h-20 md:w-28 md:h-28">
      <div class="w-full h-full bg-gradient-to-br from-secondary-400/40 to-secondary-600/40 backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl"></div>
    </div>
    <div class="hero-3d-element float-element absolute bottom-32 left-[10%] rtl:right-[10%] rtl:left-auto w-16 h-16 md:w-24 md:h-24" style="animation-delay: 0.5s;">
      <div class="w-full h-full bg-gradient-to-br from-accent-400/30 to-accent-600/30 backdrop-blur-sm rounded-xl -rotate-6 border border-white/20 shadow-2xl"></div>
    </div>
  </div>

  <!-- Hero Content -->
  <div class="container-custom relative z-10 py-20 lg:py-28">
    <div class="max-w-3xl">
      <!-- Badge with Glow -->
      <div class="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-secondary-500/10">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
        </span>
        <span class="text-sm font-medium text-white/90">{{ 'hero.badge' | translate }}</span>
      </div>

      <!-- Title with Gradient -->
      <h1 class="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-white">
        {{ 'hero.title' | translate }}
      </h1>

      <!-- Description -->
      <p class="hero-description text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
        {{ 'hero.description' | translate }}
      </p>
    </div>
  </div>

  <!-- Animated Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <div class="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </div>
  </div>
</section>
```

#### TypeScript
```typescript
ngAfterViewInit(): void {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this.initHeroAnimation();
  }
}

private initHeroAnimation(): void {
  gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  heroTimeline
    .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
    .from('.hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
    .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero-3d-element', { opacity: 0, scale: 0.8, rotation: -10, duration: 1 }, '-=0.6');

  // Parallax effects
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
}
```

#### SCSS
```scss
.hero-section {
  min-height: 70vh;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(ellipse at center, rgba(93, 183, 194, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.float-element {
  animation: float 3s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.5s;
  }
}
```

---

## Glassmorphism Cards

### Pattern: Glass Card with Hover Glow

**Use Case:** Card components with glass effect and glowing border on hover

#### HTML
```html
<div class="group relative">
  <!-- Glow Effect on Hover -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"></div>

  <!-- Glass Card -->
  <div class="relative flex items-start gap-4 p-4 bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
    <!-- Icon with Gradient -->
    <div class="relative flex-shrink-0">
      <div class="absolute inset-0 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-foreground mb-1 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
        {{ card.title | translate }}
      </h3>
      <p class="text-sm md:text-base text-neutral-600 dark:text-neutral-400">
        {{ card.description | translate }}
      </p>
    </div>
  </div>
</div>
```

#### SCSS
```scss
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  }

  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(255, 255, 255, 0.95);
  }
}

.dark .glass-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.4);
}
```

---

## Form Components

### Pattern: Input with Focus Glow

**Use Case:** Modern form inputs with animated focus states

#### HTML
```html
<div class="group">
  <label for="email" class="block text-sm font-medium mb-2 text-foreground group-focus-within:text-primary-600 dark:group-focus-within:text-secondary-400 transition-colors">
    {{ 'form.email' | translate }} <span class="text-red-500" aria-hidden="true">*</span>
  </label>
  <div class="relative">
    <input
      type="email"
      id="email"
      formControlName="email"
      class="w-full px-4 py-3.5 rounded-xl bg-white/50 dark:bg-primary-900/30 border-2 focus:ring-0 outline-none transition-all duration-300 placeholder:text-neutral-400"
      [ngClass]="hasFieldError('email')
        ? 'border-red-400 focus:border-red-500'
        : 'border-neutral-200 dark:border-primary-700 focus:border-secondary-500 dark:focus:border-secondary-400 hover:border-neutral-300 dark:hover:border-primary-600'"
      [placeholder]="'form.emailPlaceholder' | translate"
      [attr.aria-describedby]="hasFieldError('email') ? 'email-error' : null"
    />
    <!-- Focus Glow -->
    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-secondary-500/20 to-accent-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur transition-opacity duration-300"></div>
  </div>
  <p *ngIf="hasFieldError('email')" id="email-error" class="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
    </svg>
    {{ getFieldError('email') | translate }}
  </p>
</div>
```

#### TypeScript
```typescript
hasFieldError(fieldName: string): boolean {
  const field = this.contactForm.get(fieldName);
  return field ? field.invalid && (field.dirty || field.touched) : false;
}

getFieldError(fieldName: string): string | null {
  const field = this.contactForm.get(fieldName);
  if (!field || !field.errors) return null;

  if (field.errors['required']) return 'validation.required';
  if (field.errors['email']) return 'validation.invalidEmail';
  if (field.errors['minlength']) return 'validation.minLength';
  return null;
}
```

### Pattern: Textarea with Character Count

#### HTML
```html
<div class="group">
  <label for="message" class="block text-sm font-medium mb-2 text-foreground">
    {{ 'form.message' | translate }} <span class="text-red-500">*</span>
  </label>
  <div class="relative">
    <textarea
      id="message"
      formControlName="message"
      rows="5"
      class="w-full px-4 py-3.5 rounded-xl bg-white/50 dark:bg-primary-900/30 border-2 border-neutral-200 dark:border-primary-700 focus:border-secondary-500 dark:focus:border-secondary-400 focus:ring-0 outline-none transition-all duration-300 resize-none placeholder:text-neutral-400"
      [placeholder]="'form.messagePlaceholder' | translate"
      maxlength="500"
    ></textarea>
    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-secondary-500/20 to-accent-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur transition-opacity duration-300"></div>
  </div>
  <div class="mt-1 text-sm text-neutral-500 dark:text-neutral-400 text-right rtl:text-left">
    {{ messageControl.value?.length || 0 }} / 500
  </div>
</div>
```

---

## Buttons

### Pattern: Primary Button with Magnetic Hover

**Use Case:** Call-to-action buttons with shine effect and magnetic hover

#### HTML
```html
<button
  type="submit"
  #submitBtn
  [disabled]="isSubmitting()"
  (mousemove)="onButtonMouseMove($event, submitBtn)"
  (mouseleave)="onButtonMouseLeave(submitBtn)"
  class="group relative w-full overflow-hidden px-8 py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-primary-500/30 transition-all duration-300"
>
  <!-- Shine Effect -->
  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

  <span *ngIf="!isSubmitting()" class="relative flex items-center justify-center gap-2">
    {{ 'form.submit' | translate }}
    <svg class="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
    </svg>
  </span>
  <span *ngIf="isSubmitting()" class="relative flex items-center justify-center gap-2">
    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {{ 'form.submitting' | translate }}
  </span>
</button>
```

#### TypeScript
```typescript
onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)'
  });
}
```

### Pattern: Secondary Button (Ghost)

#### HTML
```html
<button
  type="button"
  class="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold overflow-hidden hover:bg-white/20 transition-colors"
>
  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
  <span>{{ 'cta.email' | translate }}</span>
</button>
```

---

## Contact Info Cards

### Pattern: Icon + Content Card

**Use Case:** Display contact information with icons

#### HTML
```html
<div *ngFor="let info of contactInfo" class="contact-info-card group relative">
  <!-- Glow Effect on Hover -->
  <div class="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl"
       [ngClass]="info.iconBg"></div>

  <!-- Glass Card -->
  <div class="relative flex items-start gap-4 p-4 bg-white/70 dark:bg-primary-900/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-primary-700/40 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
    <!-- Icon with Gradient -->
    <div class="relative flex-shrink-0">
      <div class="absolute inset-0 bg-gradient-to-br rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"
           [ngClass]="info.iconBg"></div>
      <div class="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
           [ngClass]="info.iconBg">
        <svg class="w-6 h-6" [ngClass]="info.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path [attr.d]="info.icon"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-foreground mb-1 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
        {{ info.title | translate }}
      </h3>
      <a
        *ngIf="info.link; else plainText"
        [href]="info.link"
        class="text-sm md:text-base text-primary-600 dark:text-secondary-400 hover:underline transition-colors break-all"
      >
        {{ info.value }}
      </a>
      <ng-template #plainText>
        <p class="text-sm md:text-base text-neutral-600 dark:text-neutral-400">
          {{ info.value | translate }}
        </p>
      </ng-template>
    </div>
  </div>
</div>
```

#### TypeScript
```typescript
interface ContactInfo {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  link?: string;
}

contactInfo: ContactInfo[] = [
  {
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    iconBg: 'from-accent-500 to-accent-600',
    iconColor: 'text-white',
    title: 'contact.info.email.title',
    value: 'info@roaya.co',
    link: 'mailto:info@roaya.co'
  }
];
```

---

## Success States

### Pattern: Success Message with Animated Icon

**Use Case:** Display success message after form submission

#### HTML
```html
<div *ngIf="isSubmitted()" class="text-center py-12">
  <div class="success-icon w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
    <svg class="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <h3 class="text-2xl md:text-3xl font-bold text-foreground mb-3">
    {{ 'form.success.title' | translate }}
  </h3>
  <p class="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
    {{ 'form.success.description' | translate }}
  </p>
  <button
    (click)="isSubmitted.set(false)"
    class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl font-semibold shadow-lg shadow-secondary-500/30 hover:shadow-secondary-500/50 hover:scale-105 transition-all duration-300"
  >
    {{ 'form.success.button' | translate }}
  </button>
</div>
```

#### TypeScript
```typescript
isSubmitted = signal(false);

async onSubmit(): Promise<void> {
  if (this.contactForm.invalid || this.isSubmitting()) return;

  this.isSubmitting.set(true);

  try {
    await this.submitForm();
    this.isSubmitted.set(true);
    this.contactForm.reset();

    // Animate success state
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from('.success-icon', {
        scale: 0,
        rotation: -180,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });
    }
  } catch {
    this.hasError.set(true);
  } finally {
    this.isSubmitting.set(false);
  }
}
```

---

## Loading States

### Pattern: Spinner Button

**Use Case:** Show loading spinner in button during async operations

#### HTML
```html
<button [disabled]="isSubmitting()">
  <span *ngIf="!isSubmitting()">{{ 'submit' | translate }}</span>
  <span *ngIf="isSubmitting()" class="flex items-center justify-center gap-2">
    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {{ 'submitting' | translate }}
  </span>
</button>
```

---

## Error States

### Pattern: Error Alert Banner

**Use Case:** Display error messages with icon

#### HTML
```html
<div *ngIf="hasError()" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3" role="alert">
  <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
  </svg>
  {{ 'form.error' | translate }}
</div>
```

---

## Badges & Tags

### Pattern: Status Badge with Pulse

**Use Case:** Show real-time status or active states

#### HTML
```html
<div class="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-secondary-500/10">
  <span class="relative flex h-2.5 w-2.5">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
  </span>
  <span class="text-sm font-medium text-white/90">{{ 'status.available' | translate }}</span>
</div>
```

---

## 3D Floating Elements

### Pattern: Floating Geometric Shapes

**Use Case:** Background decorative elements

#### HTML
```html
<div class="absolute inset-0 pointer-events-none">
  <!-- Floating Square -->
  <div class="float-element absolute top-20 right-[15%] rtl:left-[15%] rtl:right-auto w-20 h-20 md:w-28 md:h-28">
    <div class="w-full h-full bg-gradient-to-br from-secondary-400/40 to-secondary-600/40 backdrop-blur-sm rounded-2xl rotate-12 border border-white/20 shadow-2xl"></div>
  </div>

  <!-- Floating Circle -->
  <div class="float-element absolute bottom-32 left-[10%] rtl:right-[10%] rtl:left-auto w-16 h-16 md:w-24 md:h-24" style="animation-delay: 0.5s;">
    <div class="w-full h-full bg-gradient-to-br from-accent-400/30 to-accent-600/30 backdrop-blur-sm rounded-full border border-white/20 shadow-2xl"></div>
  </div>
</div>
```

#### SCSS
```scss
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
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

@media (prefers-reduced-motion: reduce) {
  .float-element {
    animation: none !important;
  }
}
```

---

## Accessibility Checklist

For all components:

- [ ] Semantic HTML elements
- [ ] ARIA labels for icon-only buttons
- [ ] Focus indicators (2px outline, 2px offset)
- [ ] Keyboard navigation support
- [ ] Color contrast ≥ 4.5:1
- [ ] `prefers-reduced-motion` support
- [ ] Form labels connected to inputs
- [ ] Error messages announced (`role="alert"`)
- [ ] Loading states announced (`aria-live="polite"`)

---

## RTL Support Checklist

- [ ] Use `rtl:` Tailwind utilities for positioning
- [ ] Flip arrow icons with `rtl:rotate-180`
- [ ] Mirror layouts with `rtl:flex-row-reverse`
- [ ] Test in both LTR and RTL modes

---

**Last Updated:** 2025-12-06 | **Author:** Product Orchestrator
