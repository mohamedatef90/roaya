# GSAP Animation Patterns

> **Reference Implementation:** `/src/app/features/contact/contact.component.ts`
> **Last Updated:** 2025-12-06

## Overview

This document contains reusable GSAP animation patterns extracted from the Contact page implementation. All patterns are production-tested, performance-optimized, and accessibility-aware.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Hero Entrance Animations](#hero-entrance-animations)
3. [Scroll-Triggered Animations](#scroll-triggered-animations)
4. [Floating Elements](#floating-elements)
5. [Parallax Effects](#parallax-effects)
6. [Magnetic Hover Effects](#magnetic-hover-effects)
7. [Form Animations](#form-animations)
8. [Stagger Animations](#stagger-animations)
9. [Success State Animations](#success-state-animations)
10. [Cleanup & Best Practices](#cleanup--best-practices)

---

## Setup & Configuration

### 1. Install GSAP

```bash
npm install gsap
```

### 2. Component Setup

```typescript
import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-feature',
  standalone: true,
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSection!: ElementRef;

  private scrollTriggers: ScrollTrigger[] = [];
  private prefersReducedMotion = false;

  ngAfterViewInit(): void {
    // Check reduced motion preference (ACCESSIBILITY)
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.prefersReducedMotion) {
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    // CRITICAL: Clean up all ScrollTriggers to prevent memory leaks
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initAnimations(): void {
    gsap.registerPlugin(ScrollTrigger);
    // Animation code here...
  }
}
```

### 3. Reduced Motion Support (REQUIRED)

Always respect user's motion preferences:

```typescript
ngAfterViewInit(): void {
  this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!this.prefersReducedMotion) {
    this.initAnimations();
  }
}
```

Corresponding SCSS:

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
}
```

---

## Hero Entrance Animations

### Pattern: Sequential Hero Animation

**Use Case:** Animate hero section elements in sequence (badge → title → description → CTA)

```typescript
private initHeroAnimation(): void {
  const heroTimeline = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  heroTimeline
    // Badge entrance (0.6s)
    .from('.hero-badge', {
      opacity: 0,
      y: 20,
      duration: 0.6
    })
    // Title entrance (0.8s, overlaps previous by 0.3s)
    .from('.hero-title', {
      opacity: 0,
      y: 30,
      duration: 0.8
    }, '-=0.3')
    // Description entrance (0.6s, overlaps by 0.4s)
    .from('.hero-description', {
      opacity: 0,
      y: 20,
      duration: 0.6
    }, '-=0.4')
    // 3D element entrance (1s, overlaps by 0.6s)
    .from('.hero-3d-element', {
      opacity: 0,
      scale: 0.8,
      rotation: -10,
      duration: 1
    }, '-=0.6');
}
```

**Key Concepts:**
- `defaults: { ease: 'power3.out' }` - Apply easing to all animations
- `'-=0.3'` - Start 0.3s before previous animation ends (overlap)
- `opacity: 0` to `opacity: 1` (implicit) - Fade in
- `y: 30` to `y: 0` (implicit) - Slide up from 30px below

### Pattern: Split Text Animation

**Use Case:** Animate text character by character or word by word

```typescript
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

private animateSplitText(): void {
  const split = new SplitText('.hero-title', { type: 'chars,words' });

  gsap.from(split.chars, {
    opacity: 0,
    y: 20,
    rotationX: -90,
    stagger: 0.02,
    duration: 0.6,
    ease: 'back.out(1.7)'
  });
}
```

**Note:** SplitText requires GSAP Club membership (paid plugin). For free alternative, use word/line splitting with CSS.

---

## Scroll-Triggered Animations

### Pattern: Fade In on Scroll

**Use Case:** Animate elements when they enter viewport

```typescript
private initScrollAnimations(): void {
  gsap.registerPlugin(ScrollTrigger);

  const trigger1 = ScrollTrigger.create({
    trigger: '.section-to-animate',
    start: 'top 80%',      // When top of element is 80% from top of viewport
    end: 'bottom 20%',     // Optional: when bottom is 20% from top
    onEnter: () => {
      gsap.from('.section-to-animate', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out'
      });
    },
    once: true  // Only trigger once (performance optimization)
  });

  // Store reference for cleanup
  this.scrollTriggers.push(trigger1);
}
```

**Parameters Explained:**
- `trigger: '.section-to-animate'` - Element to watch
- `start: 'top 80%'` - Trigger when element's top edge is 80% down the viewport
- `once: true` - Fire only once, then kill trigger (saves resources)

### Pattern: Scrub Animation (Parallax)

**Use Case:** Animation tied to scroll position (no easing, follows scroll 1:1)

```typescript
private initParallax(): void {
  gsap.to('.parallax-slow', {
    y: 100,
    ease: 'none',  // No easing - follows scroll exactly
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1  // 1 second lag for smoothness (0 = instant)
    }
  });

  gsap.to('.parallax-fast', {
    y: 200,
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

**Parallax Depth:**
- `y: 100` - Slow parallax (background layer)
- `y: 200` - Fast parallax (foreground layer)
- `scrub: 1` - 1 second lag (smooth), `scrub: true` would be instant

---

## Floating Elements

### Pattern: Continuous Floating Animation

**Use Case:** 3D elements that float up and down infinitely

```typescript
private initFloatingElements(): void {
  gsap.to('.float-element', {
    y: -15,
    duration: 2,
    ease: 'power1.inOut',
    yoyo: true,      // Reverse animation
    repeat: -1       // Infinite loop
  });
}
```

**Stagger Multiple Elements:**

```typescript
gsap.to('.float-element', {
  y: -15,
  duration: 2,
  ease: 'power1.inOut',
  yoyo: true,
  repeat: -1,
  stagger: {
    each: 0.5,      // 0.5s delay between each element
    from: 'start'   // Start from first element
  }
});
```

**CSS Alternative (for simple cases):**

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
}
```

---

## Parallax Effects

### Pattern: Multi-Layer Parallax

**Use Case:** Different scroll speeds for background elements

```typescript
private initParallaxLayers(): void {
  // Slow background layer
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

  // Medium speed layer
  gsap.to('.parallax-medium', {
    y: 150,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  // Fast foreground layer
  gsap.to('.parallax-fast', {
    y: 200,
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

**Performance Tip:** Disable parallax on mobile devices:

```typescript
if (window.innerWidth > 768) {
  this.initParallaxLayers();
}
```

---

## Magnetic Hover Effects

### Pattern: Magnetic Button

**Use Case:** Button follows mouse cursor on hover (subtle attraction effect)

```typescript
// In template:
<button
  #submitBtn
  (mousemove)="onButtonMouseMove($event, submitBtn)"
  (mouseleave)="onButtonMouseLeave(submitBtn)"
>
  Submit
</button>

// In component:
onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
  if (this.prefersReducedMotion) return;

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;

  gsap.to(element, {
    x: x * 0.2,  // 20% of cursor distance (subtle)
    y: y * 0.2,
    duration: 0.3,
    ease: 'power2.out'
  });
}

onButtonMouseLeave(element: HTMLElement): void {
  if (this.prefersReducedMotion) return;

  gsap.to(element, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)'  // Elastic bounce back
  });
}
```

**Key Parameters:**
- `x * 0.2` - Multiply by 0.2 for 20% magnetic strength (0.5 = 50%, 1 = 100%)
- `ease: 'elastic.out(1, 0.3)'` - Elastic bounce effect on mouse leave

---

## Form Animations

### Pattern: Input Focus Glow

**Use Case:** Animate focus state with glow effect

**HTML:**
```html
<div class="group">
  <label for="name">Name</label>
  <div class="relative">
    <input type="text" id="name" />
    <!-- Glow element (hidden by default) -->
    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-secondary-500/20 to-accent-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur transition-opacity duration-300"></div>
  </div>
</div>
```

**Pure CSS (no GSAP needed):**
```scss
.group {
  position: relative;

  input:focus + .glow-effect {
    opacity: 1;
  }
}

.glow-effect {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

### Pattern: Error Shake Animation

**Use Case:** Shake input field when validation fails

```typescript
private shakeInput(selector: string): void {
  gsap.to(selector, {
    x: -10,
    duration: 0.1,
    yoyo: true,
    repeat: 3,
    ease: 'power1.inOut'
  });
}

// Usage:
if (this.contactForm.get('email')?.invalid) {
  this.shakeInput('#email');
}
```

---

## Stagger Animations

### Pattern: Card Grid Stagger

**Use Case:** Animate multiple cards with cascading effect

```typescript
private animateCardGrid(): void {
  const trigger = ScrollTrigger.create({
    trigger: '.card-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.card-item', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,  // 0.1s delay between each card
        ease: 'power3.out'
      });
    },
    once: true
  });

  this.scrollTriggers.push(trigger);
}
```

**Advanced Stagger with Different Directions:**

```typescript
// Stagger from center outward
stagger: {
  each: 0.1,
  from: 'center',
  grid: 'auto',
  ease: 'power2.inOut'
}

// Stagger in random order
stagger: {
  each: 0.1,
  from: 'random'
}

// Stagger from specific index
stagger: {
  each: 0.1,
  from: 2  // Start from 3rd element (0-indexed)
}
```

---

## Success State Animations

### Pattern: Success Icon Bounce-In

**Use Case:** Animate success checkmark after form submission

```typescript
private animateSuccess(): void {
  gsap.from('.success-icon', {
    scale: 0,
    rotation: -180,
    duration: 0.6,
    ease: 'back.out(1.7)'  // Elastic overshoot (1.7 = strength)
  });
}
```

**Timeline with Text Fade:**

```typescript
private showSuccessMessage(): void {
  const tl = gsap.timeline();

  tl.from('.success-icon', {
    scale: 0,
    rotation: -180,
    duration: 0.6,
    ease: 'back.out(1.7)'
  })
  .from('.success-title', {
    opacity: 0,
    y: 20,
    duration: 0.4
  }, '-=0.3')
  .from('.success-description', {
    opacity: 0,
    y: 15,
    duration: 0.4
  }, '-=0.2');
}
```

---

## Cleanup & Best Practices

### 1. Always Clean Up ScrollTriggers

```typescript
ngOnDestroy(): void {
  // Clean up stored triggers
  this.scrollTriggers.forEach(trigger => trigger.kill());

  // Clean up any orphaned triggers
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
```

### 2. Performance Optimization

**Use GPU-Accelerated Properties Only:**

✅ **Good (GPU-accelerated):**
```typescript
gsap.to('.element', {
  x: 100,           // transform: translateX
  y: 50,            // transform: translateY
  scale: 1.5,       // transform: scale
  rotation: 45,     // transform: rotate
  opacity: 0.5
});
```

❌ **Bad (CPU-intensive, causes reflow):**
```typescript
gsap.to('.element', {
  width: '100px',   // Triggers layout reflow
  height: '50px',   // Triggers layout reflow
  left: '100px',    // Triggers layout reflow
  top: '50px'       // Triggers layout reflow
});
```

### 3. Will-Change Hint

For elements you know will animate frequently:

```scss
.animated-element {
  will-change: transform, opacity;
}

// Remove will-change after animation completes
.animated-element.animation-done {
  will-change: auto;
}
```

### 4. Timeline Reusability

```typescript
private mainTimeline!: gsap.core.Timeline;

ngAfterViewInit(): void {
  this.mainTimeline = gsap.timeline({ paused: true });
  // Add animations to timeline...
}

playAnimation(): void {
  this.mainTimeline.play();
}

reverseAnimation(): void {
  this.mainTimeline.reverse();
}

ngOnDestroy(): void {
  this.mainTimeline.kill();
}
```

### 5. Conditional Animations (Mobile vs Desktop)

```typescript
private initAnimations(): void {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Simplified animations for mobile
    this.initMobileAnimations();
  } else {
    // Full animations for desktop
    this.initDesktopAnimations();
  }
}
```

---

## Common Easing Functions

| Easing | Use Case |
|--------|----------|
| `power1.out` | Subtle, gentle easing |
| `power2.out` | Standard easing for most animations |
| `power3.out` | Stronger, more pronounced easing |
| `power4.out` | Very strong easing |
| `back.out(1.7)` | Elastic overshoot effect |
| `elastic.out(1, 0.3)` | Bouncy, spring-like effect |
| `bounce.out` | Bounce effect (like a ball) |
| `circ.out` | Circular easing (smooth curve) |
| `expo.out` | Exponential easing (dramatic) |
| `none` | Linear (for scrub/parallax) |

---

## Performance Benchmarks

### Target Performance Metrics

| Animation Type | Target FPS | Duration | Acceptable Drop |
|----------------|------------|----------|-----------------|
| Hero entrance | 60fps | 0.6-1.2s | 55fps |
| Scroll trigger | 60fps | 0.4-0.8s | 55fps |
| Hover effects | 60fps | 0.2-0.4s | 58fps |
| Parallax | 60fps | Continuous | 50fps |

### Profiling Animations

```typescript
// Enable GSAP's ticker for FPS monitoring
gsap.ticker.add(() => {
  console.log('FPS:', gsap.ticker.fps);
});
```

---

## Troubleshooting

### Issue: Animations don't fire

**Solution:** Ensure elements exist in DOM before animating:

```typescript
ngAfterViewInit(): void {
  // Wait for next render cycle
  setTimeout(() => {
    this.initAnimations();
  }, 0);
}
```

### Issue: ScrollTriggers not cleaning up

**Solution:** Use array to store all triggers:

```typescript
private scrollTriggers: ScrollTrigger[] = [];

const trigger = ScrollTrigger.create({...});
this.scrollTriggers.push(trigger);

ngOnDestroy(): void {
  this.scrollTriggers.forEach(t => t.kill());
  ScrollTrigger.getAll().forEach(t => t.kill());
}
```

### Issue: Animations lag on mobile

**Solution:** Disable complex animations on mobile:

```typescript
if (window.innerWidth < 768) {
  return; // Skip animations on mobile
}
```

---

## Reference Implementations

### Contact Page (`/src/app/features/contact/`)

- ✅ Hero sequential animation
- ✅ Scroll-triggered card stagger
- ✅ Parallax background elements
- ✅ Magnetic hover buttons
- ✅ Floating 3D elements
- ✅ Success state animation
- ✅ Cleanup in ngOnDestroy
- ✅ Reduced motion support

---

## Additional Resources

- **GSAP Docs:** https://greensock.com/docs/
- **ScrollTrigger Docs:** https://greensock.com/docs/v3/Plugins/ScrollTrigger
- **GSAP Ease Visualizer:** https://greensock.com/ease-visualizer/
- **CodePen Collection:** https://codepen.io/collection/nMgKxJ (GSAP examples)

---

**Last Updated:** 2025-12-06 | **Author:** Product Orchestrator
