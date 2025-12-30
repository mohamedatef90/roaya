# AI Services Page - Quick Start Implementation Guide

## Instant Copy-Paste Solutions

### 1. Color System (CSS Variables)

```css
/* /src/styles/ai-theme.css */
:root {
  /* Aurora Server Cloud Palette */
  --ai-primary: #14192b;
  --ai-secondary: #7e8bff;
  --ai-accent: #6fd4ff;
  --ai-highlight: #9bffe0;
  --ai-base: #e6fff9;

  /* Functional Colors */
  --ai-bg-dark: #0a0d1a;
  --ai-bg-card: rgba(255, 255, 255, 0.05);
  --ai-text-primary: #ffffff;
  --ai-text-secondary: rgba(255, 255, 255, 0.8);
  --ai-border: rgba(255, 255, 255, 0.1);

  /* Gradients */
  --ai-gradient-hero: linear-gradient(135deg, #14192b 0%, #0a0d1a 100%);
  --ai-gradient-accent: linear-gradient(90deg, #7e8bff 0%, #6fd4ff 100%);
  --ai-gradient-aurora: linear-gradient(180deg, rgba(159, 255, 224, 0.1) 0%, transparent 100%);
  --ai-gradient-neural: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%);
}
```

### 2. Typography Setup

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

:root {
  /* Font families */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  /* Fluid font sizes */
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.5rem);
  --text-xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --text-2xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --text-3xl: clamp(2.5rem, 2rem + 2.5vw, 4rem);
  --text-4xl: clamp(3rem, 2.5rem + 2.5vw, 5rem);
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: 1.2;
}

body, p {
  font-family: var(--font-body);
  line-height: 1.5;
}
```

### 3. Glassmorphic Card Component

```html
<!-- ai-service-card.component.html -->
<div class="ai-glass-card">
  <div class="ai-card-icon">
    <svg><!-- Your icon --></svg>
  </div>
  <h3 class="ai-card-title">Machine Learning</h3>
  <p class="ai-card-description">
    Advanced ML models tailored to your business needs
  </p>
  <button class="ai-glass-button">Learn More</button>
</div>
```

```css
/* ai-service-card.component.css */
.ai-glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 24px;
  border: 1px solid var(--ai-border);
  padding: 2.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  border-color: rgba(126, 139, 255, 0.3);
}

.ai-card-icon {
  width: 64px;
  height: 64px;
  background: var(--ai-gradient-accent);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.ai-glass-card:hover .ai-card-icon {
  transform: scale(1.1) rotate(5deg);
}

.ai-card-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--ai-text-primary);
}

.ai-card-description {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--ai-text-secondary);
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.ai-glass-button {
  background: rgba(126, 139, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(126, 139, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  color: #ffffff;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.ai-glass-button:hover {
  background: rgba(126, 139, 255, 0.3);
  border-color: rgba(126, 139, 255, 0.5);
  transform: scale(1.05);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ai-glass-card,
  .ai-card-icon,
  .ai-glass-button {
    transition: none;
    transform: none !important;
  }
}
```

### 4. Hero Section with Particle Background

```typescript
// ai-services-hero.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ai-services-hero',
  templateUrl: './ai-services-hero.component.html',
  styleUrls: ['./ai-services-hero.component.css']
})
export class AiServicesHeroComponent implements OnInit, OnDestroy {
  particlesOptions = {
    particles: {
      number: { value: 80 },
      color: { value: '#7e8bff' },
      links: {
        enable: true,
        color: '#6fd4ff',
        distance: 150,
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: false,
        straight: false,
        outModes: { default: 'bounce' }
      },
      size: {
        value: { min: 1, max: 3 }
      },
      opacity: {
        value: { min: 0.3, max: 0.8 }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        },
        onClick: {
          enable: true,
          mode: 'push'
        }
      },
      modes: {
        grab: {
          distance: 140,
          links: { opacity: 0.6 }
        },
        push: {
          quantity: 4
        }
      }
    },
    background: {
      color: 'transparent'
    }
  };

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
```

```html
<!-- ai-services-hero.component.html -->
<section class="ai-hero">
  <div class="ai-hero-particles">
    <!-- If using ng-particles -->
    <ng-particles
      [id]="'tsparticles'"
      [options]="particlesOptions"
    ></ng-particles>
  </div>

  <div class="ai-hero-content">
    <h1 class="ai-hero-title">
      <span class="ai-gradient-text">AI-Powered Services</span>
      <br>
      <span class="ai-subtitle">for the Future</span>
    </h1>
    <p class="ai-hero-description">
      Transform your business with cutting-edge artificial intelligence solutions
    </p>
    <div class="ai-hero-ctas">
      <button class="ai-cta-primary">Explore Solutions</button>
      <button class="ai-cta-secondary">Watch Demo</button>
    </div>
  </div>
</section>
```

```css
/* ai-services-hero.component.css */
.ai-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ai-gradient-hero);
  overflow: hidden;
}

.ai-hero-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ai-hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
}

.ai-hero-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.ai-gradient-text {
  background: var(--ai-gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.ai-subtitle {
  color: var(--ai-text-primary);
  display: block;
  margin-top: 0.5rem;
}

.ai-hero-description {
  font-size: var(--text-lg);
  color: var(--ai-text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.ai-hero-ctas {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.ai-cta-primary,
.ai-cta-secondary {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-cta-primary {
  background: var(--ai-gradient-accent);
  border: none;
  color: white;
}

.ai-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(126, 139, 255, 0.4);
}

.ai-cta-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ai-border);
  color: white;
  backdrop-filter: blur(8px);
}

.ai-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(126, 139, 255, 0.5);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .ai-hero-title {
    font-size: var(--text-2xl);
  }

  .ai-hero-description {
    font-size: var(--text-base);
  }

  .ai-hero-ctas {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-cta-primary,
  .ai-cta-secondary {
    width: 100%;
  }
}
```

### 5. Scroll Animation Service (Angular)

```typescript
// scroll-animation.service.ts
import { Injectable, NgZone } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({
  providedIn: 'root'
})
export class ScrollAnimationService {
  constructor(private ngZone: NgZone) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initFadeInAnimations(selector: string): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.utils.toArray(selector).forEach((element: any) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    });
  }

  initParallaxEffect(selector: string, distance: string = '-20%'): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.to(selector, {
        scrollTrigger: {
          trigger: selector,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: distance,
        ease: 'none'
      });
    });
  }

  initStaggerCards(selector: string): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.from(selector, {
        scrollTrigger: {
          trigger: selector,
          start: 'top 70%'
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }

  cleanup(): void {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }
}
```

### 6. Package Installation Commands

```bash
# Install animation libraries
npm install gsap
npm install three @types/three
npm install @tsparticles/angular @tsparticles/engine @tsparticles/slim

# Or using yarn
yarn add gsap
yarn add three @types/three
yarn add @tsparticles/angular @tsparticles/engine @tsparticles/slim
```

### 7. Module Setup (Angular)

```typescript
// app.module.ts or ai-services.module.ts
import { NgModule } from '@angular/core';
import { NgParticlesModule } from '@tsparticles/angular';

@NgModule({
  imports: [
    NgParticlesModule
  ],
  providers: [
    ScrollAnimationService
  ]
})
export class AiServicesModule { }
```

### 8. Simple Gradient Background Alternative (No Libraries)

```css
/* If you want to avoid heavy libraries, use pure CSS */
.ai-hero-gradient-bg {
  background: linear-gradient(135deg, #14192b 0%, #0a0d1a 100%);
  position: relative;
  overflow: hidden;
}

.ai-hero-gradient-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(126, 139, 255, 0.1) 0%, transparent 50%);
  animation: gradient-rotate 20s linear infinite;
}

@keyframes gradient-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-hero-gradient-bg::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(111, 212, 255, 0.08) 0%, transparent 50%);
  animation: gradient-rotate 30s linear infinite reverse;
}
```

### 9. Accessibility Template

```html
<!-- ai-services.component.html -->
<main id="ai-services-main">
  <!-- Skip link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Hero with proper semantics -->
  <section aria-labelledby="hero-heading" class="ai-hero">
    <h1 id="hero-heading" class="ai-hero-title">
      <span class="ai-gradient-text">AI-Powered Services</span>
    </h1>
    <!-- Content -->
  </section>

  <!-- Services section -->
  <section id="main-content" aria-labelledby="services-heading">
    <h2 id="services-heading">Our AI Services</h2>

    <div class="ai-services-grid" role="list">
      <div class="ai-glass-card" role="listitem">
        <div class="ai-card-icon" aria-hidden="true">
          <!-- Decorative icon -->
        </div>
        <h3 class="ai-card-title">Machine Learning</h3>
        <p class="ai-card-description">
          Advanced ML models tailored to your business needs
        </p>
        <button class="ai-glass-button" aria-label="Learn more about Machine Learning services">
          Learn More
        </button>
      </div>
    </div>
  </section>

  <!-- Loading state announcements -->
  <div role="status" aria-live="polite" class="sr-only">
    <span *ngIf="loading">Loading AI services...</span>
  </div>
</main>
```

```css
/* Accessibility styles */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--ai-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}

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

:focus-visible {
  outline: 3px solid var(--ai-accent);
  outline-offset: 2px;
}
```

### 10. Responsive Grid Layout

```css
/* ai-services-grid.css */
.ai-services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .ai-services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .ai-services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}

/* Large desktop: 4 columns (optional) */
@media (min-width: 1536px) {
  .ai-services-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Quick Implementation Checklist

- [ ] Install required packages (gsap, @tsparticles/angular)
- [ ] Copy color system CSS variables
- [ ] Import Google Fonts (Space Grotesk + Inter)
- [ ] Create glassmorphic card component
- [ ] Set up hero section with particles
- [ ] Add scroll animation service
- [ ] Implement responsive grid
- [ ] Add accessibility features
- [ ] Test reduced motion preferences
- [ ] Optimize for mobile

---

## Performance Tips

1. **Lazy load heavy libraries:**
```typescript
// Only load when needed
async loadThreeJs() {
  const THREE = await import('three');
  this.initHeroAnimation(THREE);
}
```

2. **Use CSS containment:**
```css
.ai-glass-card {
  contain: layout style paint;
}
```

3. **Optimize animations:**
```css
.animated-element {
  will-change: transform, opacity;
}

/* Remove will-change after animation */
.animated-element.animation-complete {
  will-change: auto;
}
```

4. **Reduce particle count on mobile:**
```typescript
get particleCount() {
  return window.innerWidth < 768 ? 40 : 80;
}
```

---

## Next Steps

1. Start with color system and typography
2. Build glassmorphic cards (no libraries needed)
3. Add simple CSS gradient hero first
4. Progressively enhance with particles
5. Add scroll animations last
6. Test accessibility thoroughly

**Remember**: Start simple, add complexity gradually, test on real devices!
