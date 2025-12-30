# AI Services Page - Quick Reference Guide

> **One-Page Visual Summary** - Copy this for quick implementation reference

---

## Color Palette (Copy-Paste Ready)

```css
/* Backgrounds */
--ai-bg-deepest: #0A0E1A;
--ai-bg-deep: #0F1419;
--ai-bg-elevated: #1A1F2E;
--ai-bg-glass: rgba(26, 31, 46, 0.5);

/* Accent Colors */
--ai-cyan-500: #00D4FF;      /* Primary AI accent */
--ai-purple-500: #8B5CF6;    /* Secondary accent */
--ai-green-500: #10B981;     /* Success/data */

/* Text */
--ai-text-primary: #F8FAFC;
--ai-text-secondary: #CBD5E1;
--ai-text-tertiary: #94A3B8;

/* Gradients */
--ai-gradient-primary: linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%);
--ai-gradient-neural: linear-gradient(90deg, #00D4FF 0%, #8B5CF6 50%, #00D4FF 100%);

/* Glows */
--ai-glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.2);
--ai-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2);
```

---

## Typography Classes

```html
<!-- Hero Title -->
<h1 class="text-6xl md:text-8xl font-bold leading-tight tracking-tight ai-gradient-text">
  Intelligent Solutions
</h1>

<!-- Section Heading -->
<h2 class="text-4xl md:text-6xl font-bold text-white">
  Our AI Services
</h2>

<!-- Card Title -->
<h3 class="text-2xl md:text-3xl font-semibold text-white">
  Machine Learning
</h3>

<!-- Body Text -->
<p class="text-lg text-gray-300 leading-relaxed">
  Description text goes here...
</p>

<!-- Caption/Label -->
<span class="text-sm uppercase tracking-wider text-gray-400 font-medium">
  Category Label
</span>
```

**Fonts to Load:**
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Component Patterns (Tailwind)

### Glass Card

```html
<div class="relative overflow-hidden rounded-3xl p-8
            bg-ai-bg-glass backdrop-blur-2xl
            border border-ai-cyan-500/20
            hover:border-ai-cyan-500/50
            transition-all duration-400
            hover:-translate-y-2 hover:scale-102
            shadow-lg hover:shadow-glow-cyan">

  <!-- Animated glow border (shows on hover) -->
  <div class="absolute inset-0 bg-gradient-to-r from-ai-cyan-500 to-ai-purple-500
              opacity-0 hover:opacity-100 transition-opacity duration-400 -z-10
              blur-xl"></div>

  <!-- Content -->
  <div class="relative z-10">
    <h3 class="text-2xl font-semibold text-white mb-4">Card Title</h3>
    <p class="text-gray-300">Card description goes here...</p>
  </div>
</div>
```

### Magnetic Button

```html
<button class="group relative inline-flex items-center gap-3
               px-8 py-4 rounded-full
               bg-gradient-to-r from-ai-cyan-500 to-ai-purple-500
               text-white font-semibold
               shadow-lg shadow-ai-cyan-500/30
               hover:shadow-xl hover:shadow-ai-cyan-500/50
               transition-all duration-300
               ai-button-magnetic">

  <!-- Shine effect on hover -->
  <span class="absolute inset-0 rounded-full
               bg-gradient-to-r from-white/20 to-transparent
               opacity-0 group-hover:opacity-100
               transition-opacity duration-300"></span>

  <span class="relative z-10">Get Started</span>

  <!-- Arrow icon -->
  <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
</button>
```

### Badge/Pill

```html
<span class="inline-flex items-center gap-2
             px-6 py-2 rounded-full
             bg-ai-cyan-500/10 border border-ai-cyan-500/30
             text-ai-cyan-400 text-sm font-semibold uppercase tracking-wide
             shadow-[0_0_20px_rgba(0,212,255,0.2)]
             animate-glow-pulse">
  ✨ Powered by AI
</span>
```

### Stat Card (Floating)

```html
<div class="glass-card rounded-2xl p-6 text-center
            animate-float">
  <div class="text-5xl font-bold ai-gradient-text mb-2">
    98%
  </div>
  <div class="text-sm text-gray-400">
    Accuracy Rate
  </div>
</div>
```

### Warning/Alert Card

```html
<div class="relative overflow-hidden rounded-3xl p-8
            bg-gradient-to-br from-red-500/10 to-purple-500/10
            backdrop-blur-md
            border border-red-500/30
            hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]
            transition-all duration-400">

  <!-- Diagonal stripes background -->
  <div class="absolute inset-0 opacity-50
              bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]"></div>

  <div class="relative z-10">
    <div class="w-14 h-14 mb-4 rounded-xl
                bg-red-500/20 flex items-center justify-center">
      <svg class="w-8 h-8 text-red-400 animate-pulse">
        <!-- Alert icon -->
      </svg>
    </div>
    <h3 class="text-2xl font-semibold text-white mb-3">Manual Processes</h3>
    <p class="text-gray-300 mb-4">Time-consuming tasks slow productivity...</p>
    <span class="inline-block px-4 py-2 rounded-full
                 bg-red-500/20 border border-red-500/40
                 text-red-300 text-xs font-semibold uppercase">
      High Impact
    </span>
  </div>
</div>
```

---

## Background Patterns

### Mesh Gradient Background

```html
<div class="relative min-h-screen overflow-hidden bg-ai-bg-deepest">
  <!-- Mesh gradient overlay -->
  <div class="absolute inset-0 opacity-100"
       style="background:
         radial-gradient(at 27% 37%, rgba(0, 212, 255, 0.12) 0px, transparent 50%),
         radial-gradient(at 97% 21%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
         radial-gradient(at 52% 99%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
         radial-gradient(at 10% 29%, rgba(0, 212, 255, 0.08) 0px, transparent 50%),
         radial-gradient(at 97% 96%, rgba(139, 92, 246, 0.08) 0px, transparent 50%);">
  </div>

  <!-- Noise texture overlay -->
  <div class="absolute inset-0 opacity-5 mix-blend-overlay"
       style="background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E');">
  </div>

  <!-- Content -->
  <div class="relative z-10">
    <!-- Your content here -->
  </div>
</div>
```

### Grid Pattern (Cyberpunk)

```html
<div class="relative"
     style="background-image:
       linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
       linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
       background-size: 50px 50px;
       background-position: center center;">
  <!-- Content -->
</div>
```

### Scanning Line Effect

```html
<div class="relative overflow-hidden">
  <!-- Scanning line -->
  <div class="absolute top-0 left-0 right-0 h-0.5 z-50
              bg-gradient-to-r from-transparent via-ai-cyan-500 to-transparent
              animate-scan-line pointer-events-none">
  </div>

  <!-- Content -->
</div>

<style>
@keyframes scan-line {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

.animate-scan-line {
  animation: scan-line 3s linear infinite;
}
</style>
```

---

## 3D Floating Elements (CSS Only)

```html
<div class="relative h-screen">
  <!-- Floating orb 1 (Cyan) -->
  <div class="absolute top-20 left-20
              w-48 h-48 rounded-full
              bg-gradient-radial from-ai-cyan-500/20 to-transparent
              backdrop-blur-3xl
              shadow-[0_0_60px_rgba(0,212,255,0.3)]
              animate-float"></div>

  <!-- Floating orb 2 (Purple) -->
  <div class="absolute top-40 right-32
              w-64 h-64 rounded-full
              bg-gradient-radial from-ai-purple-500/20 to-transparent
              backdrop-blur-3xl
              shadow-[0_0_80px_rgba(139,92,246,0.3)]
              animate-float"
       style="animation-delay: 1s;"></div>

  <!-- Floating orb 3 (Small cyan) -->
  <div class="absolute bottom-32 left-1/3
              w-32 h-32 rounded-full
              bg-gradient-radial from-ai-cyan-500/20 to-transparent
              backdrop-blur-2xl
              shadow-[0_0_40px_rgba(0,212,255,0.3)]
              animate-float"
       style="animation-delay: 2s;"></div>
</div>

<style>
@keyframes float {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateX(0deg);
  }
  50% {
    transform: translate3d(20px, -30px, 50px) rotateX(10deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
  transform-style: preserve-3d;
}
</style>
```

---

## Accordion Component (Tailwind + Alpine.js)

```html
<div class="space-y-4" x-data="{ activeService: null }">
  <!-- Accordion Item -->
  <div class="glass-card rounded-2xl overflow-hidden
              transition-all duration-400"
       :class="activeService === 1 ? 'border-ai-cyan-500/50 shadow-glow-cyan' : 'border-ai-cyan-500/20'">

    <!-- Trigger -->
    <button @click="activeService = activeService === 1 ? null : 1"
            class="w-full flex items-center justify-between p-6
                   hover:bg-ai-cyan-500/5 transition-colors">

      <div class="flex items-center gap-4">
        <!-- Icon -->
        <div class="w-12 h-12 rounded-xl
                    bg-ai-cyan-500/10 flex items-center justify-center
                    transition-all"
             :class="activeService === 1 ? 'shadow-[0_0_20px_rgba(0,212,255,0.4)]' : ''">
          <svg class="w-6 h-6 text-ai-cyan-400"><!-- icon --></svg>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-white">Machine Learning Solutions</h3>
      </div>

      <!-- Chevron -->
      <svg class="w-6 h-6 text-ai-cyan-400 transition-transform duration-300"
           :class="activeService === 1 ? 'rotate-180' : ''">
        <path d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Content (collapsible) -->
    <div x-show="activeService === 1"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 max-h-0"
         x-transition:enter-end="opacity-100 max-h-96"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 max-h-96"
         x-transition:leave-end="opacity-0 max-h-0"
         class="px-6 pb-6">

      <p class="text-gray-300 mb-4">
        Custom ML models trained on your data to predict outcomes,
        automate tasks, and uncover insights.
      </p>

      <!-- Feature list -->
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <li class="flex items-center gap-3 p-3 rounded-lg
                   bg-ai-cyan-500/5 border-l-2 border-ai-cyan-500">
          <span class="w-5 h-5 rounded-full bg-ai-cyan-500
                       flex items-center justify-center text-xs text-black font-bold">✓</span>
          <span class="text-sm text-gray-300">Predictive analytics</span>
        </li>
        <li class="flex items-center gap-3 p-3 rounded-lg
                   bg-ai-cyan-500/5 border-l-2 border-ai-cyan-500">
          <span class="w-5 h-5 rounded-full bg-ai-cyan-500
                       flex items-center justify-center text-xs text-black font-bold">✓</span>
          <span class="text-sm text-gray-300">Anomaly detection</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Repeat for more services... -->
</div>
```

---

## GSAP Animation Snippets

### Scroll-Triggered Fade In

```typescript
gsap.from('.ai-fade-in', {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.2,
  scrollTrigger: {
    trigger: '.ai-fade-in',
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  }
});
```

### Parallax Background

```typescript
gsap.to('.ai-parallax-bg', {
  y: '30%',
  scrollTrigger: {
    trigger: '.ai-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  }
});
```

### Timeline Progress Animation

```typescript
gsap.to('.ai-timeline-progress', {
  height: '100%',
  scrollTrigger: {
    trigger: '.ai-timeline',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
  }
});
```

### Magnetic Button Effect

```typescript
const button = document.querySelector('.ai-button-magnetic');

button.addEventListener('mousemove', (e) => {
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  gsap.to(button, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: 'power2.out',
  });
});

button.addEventListener('mouseleave', () => {
  gsap.to(button, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)',
  });
});
```

---

## Section Layout Templates

### Hero Section

```html
<section class="relative min-h-screen flex items-center justify-center
                overflow-hidden bg-ai-bg-deepest">

  <!-- Background: Mesh gradient + particles -->
  <div class="absolute inset-0">
    <canvas id="particle-field" class="w-full h-full"></canvas>
    <div class="absolute inset-0 mesh-gradient"></div>
  </div>

  <!-- 3D floating elements -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="floating-orb cyan"></div>
    <div class="floating-orb purple delay-1"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 max-w-6xl mx-auto px-8 text-center">
    <!-- Badge -->
    <span class="ai-badge mb-8">✨ Powered by AI</span>

    <!-- Hero title -->
    <h1 class="text-6xl md:text-8xl font-bold mb-6 ai-gradient-text">
      Intelligent Solutions<br>for Tomorrow's Challenges
    </h1>

    <!-- Subtitle -->
    <p class="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
      Harness the power of artificial intelligence to transform
      your business processes and unlock unprecedented growth.
    </p>

    <!-- CTA -->
    <button class="ai-button-primary ai-button-magnetic">
      Explore AI Services →
    </button>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
      <div class="ai-stat-card">
        <div class="text-5xl font-bold ai-gradient-text">98%</div>
        <div class="text-sm text-gray-400 mt-2">Accuracy</div>
      </div>
      <div class="ai-stat-card">
        <div class="text-5xl font-bold ai-gradient-text">5x</div>
        <div class="text-sm text-gray-400 mt-2">Faster</div>
      </div>
      <div class="ai-stat-card">
        <div class="text-5xl font-bold ai-gradient-text">24/7</div>
        <div class="text-sm text-gray-400 mt-2">Available</div>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
    <div class="w-px h-12 bg-gradient-to-b from-ai-cyan-500 to-transparent"></div>
    <div class="w-2 h-2 rounded-full bg-ai-cyan-500 animate-bounce"></div>
  </div>
</section>
```

### Problem Cards Section

```html
<section class="py-32 relative bg-ai-bg-deep overflow-hidden">
  <!-- Diagonal stripes background -->
  <div class="absolute inset-0 opacity-50
              bg-[repeating-linear-gradient(45deg,transparent,transparent_50px,rgba(239,68,68,0.03)_50px,rgba(239,68,68,0.03)_100px)]"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-8">
    <h2 class="text-5xl font-bold text-white text-center mb-16">
      Challenges We Solve
    </h2>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Warning card 1 -->
      <div class="ai-card-warning">
        <div class="warning-icon mb-4">⚠️</div>
        <h3 class="text-2xl font-semibold text-white mb-3">Manual Processes</h3>
        <p class="text-gray-300 mb-4">Time-consuming tasks that slow down productivity...</p>
        <span class="warning-badge">High Impact</span>
      </div>

      <!-- Warning card 2 -->
      <div class="ai-card-warning">
        <div class="warning-icon mb-4">📊</div>
        <h3 class="text-2xl font-semibold text-white mb-3">Data Overload</h3>
        <p class="text-gray-300 mb-4">Too much data, not enough insights...</p>
        <span class="warning-badge">Critical</span>
      </div>

      <!-- Warning card 3 -->
      <div class="ai-card-warning">
        <div class="warning-icon mb-4">🎯</div>
        <h3 class="text-2xl font-semibold text-white mb-3">Slow Decisions</h3>
        <p class="text-gray-300 mb-4">Delayed decision-making costs money...</p>
        <span class="warning-badge">Urgent</span>
      </div>
    </div>
  </div>
</section>
```

### CTA Section

```html
<section class="relative py-32 overflow-hidden bg-ai-bg-deepest">
  <!-- Particle background -->
  <canvas id="cta-particles" class="absolute inset-0"></canvas>

  <div class="relative z-10 max-w-4xl mx-auto px-8 text-center">
    <!-- Urgency badge -->
    <span class="inline-flex items-center gap-2 px-6 py-2 rounded-full
                 bg-gradient-to-r from-red-500/20 to-ai-cyan-500/20
                 border border-red-500/40 text-red-300 text-sm font-semibold
                 mb-8 animate-glow-pulse">
      🔥 Limited Spots Available
    </span>

    <!-- Hero text -->
    <h2 class="text-6xl font-bold mb-6 ai-gradient-text">
      Ready to Transform<br>Your Business with AI?
    </h2>

    <p class="text-xl text-gray-300 mb-10">
      Schedule a free consultation and discover how AI can help you achieve your goals.
    </p>

    <!-- CTA buttons -->
    <div class="flex flex-wrap gap-4 justify-center mb-12">
      <button class="ai-button-primary ai-button-magnetic ai-button-lg">
        Get Started →
      </button>
      <button class="ai-button-secondary ai-button-lg">
        View Case Studies
      </button>
    </div>

    <!-- Trust badges -->
    <div class="flex flex-wrap gap-8 justify-center text-sm text-gray-400">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-ai-cyan-400"><!-- shield icon --></svg>
        <span>SOC 2 Certified</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-ai-cyan-400"><!-- lock icon --></svg>
        <span>GDPR Compliant</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-ai-cyan-400"><!-- star icon --></svg>
        <span>98% Satisfaction</span>
      </div>
    </div>
  </div>
</section>
```

---

## Accessibility Checklist

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .ai-card {
    border-width: 2px;
    border-color: var(--ai-cyan-500);
  }

  .ai-button-primary {
    outline: 2px solid white;
    outline-offset: 2px;
  }
}

/* Focus states */
*:focus-visible {
  outline: 3px solid var(--ai-cyan-500);
  outline-offset: 4px;
}
```

---

## Performance Optimizations

```css
/* GPU acceleration for animated elements */
.ai-float,
.ai-parallax,
.floating-orb {
  transform: translateZ(0);
  will-change: transform;
}

/* Only apply will-change when hovering */
.ai-button:hover {
  will-change: transform;
}

.ai-button:not(:hover) {
  will-change: auto;
}
```

```html
<!-- Lazy load images -->
<img
  src="placeholder.jpg"
  data-src="full-image.jpg"
  loading="lazy"
  alt="AI visualization"
  class="ai-lazy-image"
>
```

---

## Final Implementation Checklist

- [ ] Install fonts: Space Grotesk, JetBrains Mono
- [ ] Add color palette to Tailwind config
- [ ] Create base glass card component
- [ ] Implement particle background (Canvas)
- [ ] Add 3D floating orbs with CSS animations
- [ ] Create magnetic button effect (GSAP)
- [ ] Implement accordion component (Alpine.js or Angular)
- [ ] Add scroll-triggered animations (GSAP + ScrollTrigger)
- [ ] Test reduced motion support
- [ ] Test high contrast mode
- [ ] Verify keyboard navigation
- [ ] Optimize performance (GPU acceleration, lazy loading)
- [ ] Test on mobile devices
- [ ] Cross-browser testing

---

**Quick Start:**
1. Copy color palette to `tailwind.config.js`
2. Load fonts in `index.html`
3. Use component patterns from this guide
4. Add GSAP animations for scroll effects
5. Test accessibility features

**Full Documentation:** See `AI_SERVICES_DESIGN_SPEC.md` for complete details.
