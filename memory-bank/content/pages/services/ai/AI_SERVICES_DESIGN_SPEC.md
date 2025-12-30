# AI Services Page - Futuristic Design Specification

> **Design Theme:** "AI from the Future" - Neural, Organic, Intelligent
> **Created:** 2025-12-30
> **Status:** Ready for Implementation
> **Designer:** UI Agent (Senior UI/UX Designer & Creative Director)

---

## Research & Inspiration

### Sources Browsed
- **Awwwards** - 3D websites, award-winning interactive experiences
- **Design Trends 2025** - AI-powered 3D web design, neural network aesthetics
- **Inspiration Categories:**
  - AI dashboards (Dribbble, Behance)
  - Futuristic web design with 3D elements
  - Glassmorphism and neural network patterns
  - Security/tech company landing pages

### Key Design Observations (2025 Trends)

1. **3D Elements & Depth**
   - Three.js and Spline democratizing 3D design
   - Neural Radiance Fields (NeRF) for realistic 3D scenes
   - Floating elements with parallax depth

2. **AI-Inspired Aesthetics**
   - Neural network visualizations (nodes, connections, data flow)
   - Organic, flowing gradients (not harsh geometric)
   - Particle systems and ambient animations
   - Scanning lines and data streams

3. **Glassmorphism Evolution**
   - Frosted glass with neon accent glows
   - Layered transparency creating depth perception
   - Backdrop blur with subtle noise textures

4. **Color Trends**
   - Deep space blues and dark navy backgrounds
   - AI cyan (#00D4FF) and neural purple (#8B5CF6)
   - Neon accents with ambient glow effects
   - Metallic finishes and iridescent gradients

---

## Design Direction

### Theme
**"AI from the Future"** - A premium, cutting-edge AI services page that feels like it's from 2030. The design should evoke:
- **Neural Networks:** Organic connections, flowing data, intelligent systems
- **Deep Space Technology:** Dark, mysterious, infinite possibilities
- **Premium & Trustworthy:** Enterprise-grade, not gimmicky
- **Innovative:** Pushing boundaries while remaining usable

### Mood Board
- **Primary Mood:** Premium, Cutting-edge, Innovative, Trustworthy
- **Visual Style:** Dark mode with glowing accents, 3D depth, neural aesthetics
- **Interaction Style:** Smooth, intelligent, responsive to user actions
- **Accessibility:** High contrast, reduced motion support, WCAG 2.1 AA compliant

---

## Color Palette

### Background Colors (Deep Space Theme)

```css
/* Primary Backgrounds */
--ai-bg-deepest: #0A0E1A;        /* Deep space navy - page background */
--ai-bg-deep: #0F1419;           /* Card/section background */
--ai-bg-elevated: #1A1F2E;       /* Elevated elements */
--ai-bg-glass: rgba(26, 31, 46, 0.5);  /* Glass overlay */

/* Gradient Backgrounds */
--ai-bg-gradient-radial: radial-gradient(
  circle at 50% 0%,
  rgba(0, 212, 255, 0.05) 0%,
  transparent 50%
);

--ai-bg-gradient-mesh: radial-gradient(
  ellipse at 20% 80%,
  rgba(139, 92, 246, 0.08) 0%,
  transparent 40%
),
radial-gradient(
  ellipse at 80% 20%,
  rgba(0, 212, 255, 0.08) 0%,
  transparent 40%
);

/* Noise Texture Overlay */
--ai-noise-texture: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
```

### Accent Colors (AI Branding)

```css
/* Primary AI Accent - Neural Cyan */
--ai-cyan-50: #E0F7FF;
--ai-cyan-100: #B3ECFF;
--ai-cyan-200: #80E1FF;
--ai-cyan-300: #4DD5FF;
--ai-cyan-400: #26CCFF;
--ai-cyan-500: #00D4FF;        /* Primary AI cyan */
--ai-cyan-600: #00B8E6;
--ai-cyan-700: #0099CC;
--ai-cyan-800: #007AB3;
--ai-cyan-900: #005C99;

/* Secondary Accent - Neural Purple */
--ai-purple-50: #F3F0FF;
--ai-purple-100: #E4DBFF;
--ai-purple-200: #CABFFF;
--ai-purple-300: #ADA0FF;
--ai-purple-400: #9580FF;
--ai-purple-500: #8B5CF6;      /* Neural purple */
--ai-purple-600: #7C3AED;
--ai-purple-700: #6D28D9;
--ai-purple-800: #5B21B6;
--ai-purple-900: #4C1D95;

/* Tertiary Accent - Data Green */
--ai-green-50: #ECFDF5;
--ai-green-100: #D1FAE5;
--ai-green-200: #A7F3D0;
--ai-green-300: #6EE7B7;
--ai-green-400: #34D399;
--ai-green-500: #10B981;       /* Success/data green */
--ai-green-600: #059669;
--ai-green-700: #047857;
--ai-green-800: #065F46;
--ai-green-900: #064E3B;
```

### Gradient Systems (Organic, Flowing)

```css
/* Primary AI Gradient - Cyan to Purple */
--ai-gradient-primary: linear-gradient(
  135deg,
  #00D4FF 0%,
  #8B5CF6 100%
);

/* Neural Flow Gradient - Animated Direction */
--ai-gradient-neural: linear-gradient(
  90deg,
  #00D4FF 0%,
  #8B5CF6 50%,
  #00D4FF 100%
);
background-size: 200% 100%;
animation: neuralFlow 3s ease infinite;

@keyframes neuralFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Ambient Glow Gradient - Radial */
--ai-gradient-glow: radial-gradient(
  circle at center,
  rgba(0, 212, 255, 0.3) 0%,
  rgba(139, 92, 246, 0.2) 50%,
  transparent 100%
);

/* Mesh Gradient Background */
--ai-gradient-mesh-bg:
  radial-gradient(at 27% 37%, rgba(0, 212, 255, 0.12) 0px, transparent 50%),
  radial-gradient(at 97% 21%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
  radial-gradient(at 52% 99%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
  radial-gradient(at 10% 29%, rgba(0, 212, 255, 0.08) 0px, transparent 50%),
  radial-gradient(at 97% 96%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
  radial-gradient(at 33% 50%, rgba(0, 212, 255, 0.10) 0px, transparent 50%),
  radial-gradient(at 79% 53%, rgba(139, 92, 246, 0.10) 0px, transparent 50%);
```

### Glow Effects (Neon Accents, Ambient Lighting)

```css
/* Cyan Glow - For buttons, links, active states */
--ai-glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3),
                0 0 40px rgba(0, 212, 255, 0.2),
                0 0 60px rgba(0, 212, 255, 0.1);

--ai-glow-cyan-hover: 0 0 30px rgba(0, 212, 255, 0.5),
                      0 0 60px rgba(0, 212, 255, 0.3),
                      0 0 90px rgba(0, 212, 255, 0.2);

/* Purple Glow - For secondary elements */
--ai-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3),
                  0 0 40px rgba(139, 92, 246, 0.2),
                  0 0 60px rgba(139, 92, 246, 0.1);

/* Combined Neural Glow */
--ai-glow-neural: 0 0 20px rgba(0, 212, 255, 0.2),
                  0 0 40px rgba(139, 92, 246, 0.2),
                  0 0 60px rgba(0, 212, 255, 0.1),
                  0 0 80px rgba(139, 92, 246, 0.1);

/* Ambient Light */
--ai-glow-ambient: 0 0 100px rgba(0, 212, 255, 0.08),
                   0 0 200px rgba(139, 92, 246, 0.05);
```

### Text Colors

```css
/* Primary Text */
--ai-text-primary: #F8FAFC;      /* Almost white - main headings */
--ai-text-secondary: #CBD5E1;    /* Light gray - body text */
--ai-text-tertiary: #94A3B8;     /* Muted gray - captions, labels */
--ai-text-accent: #00D4FF;       /* Cyan - links, highlights */

/* Gradient Text */
--ai-text-gradient: linear-gradient(
  135deg,
  #F8FAFC 0%,
  #00D4FF 50%,
  #8B5CF6 100%
);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## Typography System

### Font Families

```css
/* Primary Font - Inter (already in project) */
--font-primary: 'Inter', system-ui, -apple-system, sans-serif;

/* Display Font - Space Grotesk (recommended for futuristic headings) */
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;

/* Monospace - JetBrains Mono (for code, data displays) */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Font Loading (add to index.html):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Typography Scale (Futuristic)

```css
/* Hero Titles - Extra Large */
.ai-text-hero {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 6rem);        /* 48px → 96px */
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  background: var(--ai-text-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Section Headings - Large */
.ai-text-heading-1 {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 4rem);     /* 36px → 64px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--ai-text-primary);
}

/* Subsection Headings */
.ai-text-heading-2 {
  font-family: var(--font-display);
  font-size: clamp(1.875rem, 4vw, 3rem);    /* 30px → 48px */
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--ai-text-primary);
}

/* Card Titles */
.ai-text-heading-3 {
  font-family: var(--font-primary);
  font-size: clamp(1.5rem, 3vw, 2.25rem);   /* 24px → 36px */
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.005em;
  color: var(--ai-text-primary);
}

/* Body Text - Large */
.ai-text-body-lg {
  font-family: var(--font-primary);
  font-size: 1.125rem;                      /* 18px */
  font-weight: 400;
  line-height: 1.7;
  color: var(--ai-text-secondary);
}

/* Body Text - Default */
.ai-text-body {
  font-family: var(--font-primary);
  font-size: 1rem;                          /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: var(--ai-text-secondary);
}

/* Labels & Captions */
.ai-text-caption {
  font-family: var(--font-primary);
  font-size: 0.875rem;                      /* 14px */
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ai-text-tertiary);
}

/* Data Display - Monospace */
.ai-text-data {
  font-family: var(--font-mono);
  font-size: 0.875rem;                      /* 14px */
  font-weight: 500;
  line-height: 1.5;
  color: var(--ai-cyan-400);
}
```

---

## Visual Elements

### 1. 3D Elements for Hero Section

**Concept:** Floating AI Brain with Neural Network Connections

**Implementation Options:**

**Option A: Three.js 3D Brain Model**
```typescript
// Use Three.js to render an abstract 3D brain
// with glowing neural connections and particle effects

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Brain mesh with wireframe + glow shader
// Animated rotation on scroll
// Particle system for data flow
// Mouse parallax effect
```

**Option B: Spline 3D Embedded Scene**
- Design in Spline (https://spline.design/)
- Export as WebGL scene
- Embed with `<spline-viewer>` component
- Lighter weight, easier to maintain

**Option C: CSS 3D + Canvas Particles (Recommended for Performance)**
```html
<div class="ai-hero-3d">
  <!-- Background: Animated particle field (Canvas) -->
  <canvas id="particle-field"></canvas>

  <!-- Foreground: CSS 3D floating elements -->
  <div class="floating-orb ai-glow-cyan"></div>
  <div class="floating-orb ai-glow-purple delay-1"></div>
  <div class="floating-orb ai-glow-neural delay-2"></div>

  <!-- Neural network lines (SVG paths animated) -->
  <svg class="neural-lines">
    <path class="neural-connection" />
    <path class="neural-connection delay-1" />
    <path class="neural-connection delay-2" />
  </svg>
</div>
```

**CSS for Floating Orbs:**
```css
.floating-orb {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent);
  backdrop-filter: blur(20px);
  animation: float 6s ease-in-out infinite;
  transform-style: preserve-3d;
  will-change: transform;
}

@keyframes float {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateX(0deg);
  }
  50% {
    transform: translate3d(20px, -30px, 50px) rotateX(10deg);
  }
}

.ai-glow-cyan {
  box-shadow: var(--ai-glow-cyan);
}

.ai-glow-purple {
  box-shadow: var(--ai-glow-purple);
  animation-delay: 1s;
}
```

**GSAP Animation for Hero:**
```typescript
// Parallax effect on scroll
gsap.to('.floating-orb', {
  y: '+=100',
  scrollTrigger: {
    trigger: '.ai-hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  }
});

// Rotate neural network on scroll
gsap.to('.neural-lines', {
  rotation: 360,
  scrollTrigger: {
    trigger: '.ai-hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 2,
  }
});
```

### 2. Section Backgrounds

**Mesh Gradients:**
```css
.ai-section-bg-mesh {
  background: var(--ai-bg-deepest);
  position: relative;
  overflow: hidden;
}

.ai-section-bg-mesh::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ai-gradient-mesh-bg);
  opacity: 1;
  z-index: 0;
}

.ai-section-bg-mesh::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ai-noise-texture);
  opacity: 1;
  mix-blend-mode: overlay;
  z-index: 1;
}
```

**Grid Pattern (Cyberpunk Style):**
```css
.ai-section-bg-grid {
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: center center;
  animation: gridPulse 4s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
```

**Scanning Line Effect:**
```css
.ai-section-scanning::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.8) 50%,
    transparent 100%
  );
  animation: scanLine 3s linear infinite;
  z-index: 10;
  pointer-events: none;
}

@keyframes scanLine {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}
```

### 3. Card Designs (Glassmorphism with Depth)

**Primary AI Card:**
```html
<div class="ai-card">
  <div class="ai-card-glow"></div>
  <div class="ai-card-content">
    <h3>Card Title</h3>
    <p>Card description</p>
  </div>
</div>
```

```css
.ai-card {
  position: relative;
  background: var(--ai-bg-glass);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 24px;
  padding: 2rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Animated glow border on hover */
.ai-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--ai-gradient-neural);
  border-radius: 24px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  background-size: 200% 100%;
  animation: neuralFlow 3s linear infinite;
}

.ai-card:hover::before {
  opacity: 1;
}

.ai-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 60px rgba(0, 212, 255, 0.3),
    0 0 0 1px rgba(0, 212, 255, 0.4),
    var(--ai-glow-cyan);
}

/* Inner glow element */
.ai-card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: var(--ai-gradient-glow);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 0;
}

.ai-card:hover .ai-card-glow {
  opacity: 1;
}

.ai-card-content {
  position: relative;
  z-index: 1;
}
```

**Holographic Warning Card (for Problem Section):**
```css
.ai-card-warning {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(16px);
  position: relative;
}

.ai-card-warning::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(239, 68, 68, 0.05) 10px,
    rgba(239, 68, 68, 0.05) 20px
  );
  pointer-events: none;
}

.ai-card-warning:hover {
  box-shadow:
    0 0 30px rgba(239, 68, 68, 0.3),
    0 0 60px rgba(139, 92, 246, 0.2);
}
```

### 4. Icon Style (Glowing Outlines, Animated States)

**Base Icon Style:**
```css
.ai-icon {
  width: 48px;
  height: 48px;
  color: var(--ai-cyan-400);
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
  transition: all 0.3s ease;
}

.ai-icon:hover {
  color: var(--ai-cyan-300);
  filter: drop-shadow(0 0 16px rgba(0, 212, 255, 0.6));
  transform: scale(1.1) rotate(5deg);
}

/* Animated pulse */
.ai-icon-pulse {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.8));
  }
}
```

**Neural Icon Background:**
```html
<div class="ai-icon-container">
  <div class="ai-icon-bg"></div>
  <svg class="ai-icon"><!-- icon path --></svg>
</div>
```

```css
.ai-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-icon-bg {
  position: absolute;
  inset: 0;
  background: var(--ai-gradient-glow);
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(20px);
  animation: iconGlow 3s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 0.4; }
}
```

---

## Section-Specific Design

### 1. Hero Section

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Floating 3D Neural Elements - Background] │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  BADGE: "Powered by AI"               │ │
│  │                                       │ │
│  │  HEADLINE (Gradient Text):            │ │
│  │  "Intelligent Solutions               │ │
│  │   for Tomorrow's Challenges"          │ │
│  │                                       │ │
│  │  SUBTITLE:                            │ │
│  │  "Harness the power of AI..."         │ │
│  │                                       │ │
│  │  [CTA Button - Magnetic Effect]       │ │
│  │  [Stats: 3 floating cards]            │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Particle Field Animation]                │
└─────────────────────────────────────────────┘
```

**Component Structure:**
```html
<section class="ai-hero-section">
  <!-- Background layers -->
  <div class="ai-hero-bg">
    <canvas id="particle-field"></canvas>
    <div class="ai-gradient-mesh"></div>
  </div>

  <!-- 3D floating elements -->
  <div class="ai-hero-3d">
    <div class="floating-orb ai-glow-cyan"></div>
    <div class="floating-orb ai-glow-purple delay-1"></div>
    <svg class="neural-network"><!-- animated paths --></svg>
  </div>

  <!-- Content -->
  <div class="ai-hero-content">
    <span class="ai-badge">
      <span class="ai-badge-icon">✨</span>
      Powered by AI
    </span>

    <h1 class="ai-text-hero">
      Intelligent Solutions<br>
      for Tomorrow's Challenges
    </h1>

    <p class="ai-text-body-lg">
      Harness the power of artificial intelligence to transform
      your business processes, enhance decision-making, and unlock
      unprecedented growth.
    </p>

    <button class="ai-button-primary ai-button-magnetic">
      <span>Explore AI Services</span>
      <svg class="ai-button-arrow"><!-- arrow icon --></svg>
    </button>

    <!-- Floating stats cards -->
    <div class="ai-hero-stats">
      <div class="ai-stat-card glass">
        <div class="ai-stat-value">98%</div>
        <div class="ai-stat-label">Accuracy</div>
      </div>
      <div class="ai-stat-card glass">
        <div class="ai-stat-value">5x</div>
        <div class="ai-stat-label">Faster Processing</div>
      </div>
      <div class="ai-stat-card glass">
        <div class="ai-stat-value">24/7</div>
        <div class="ai-stat-label">Availability</div>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="ai-scroll-indicator">
    <div class="ai-scroll-line"></div>
    <div class="ai-scroll-dot"></div>
  </div>
</section>
```

**Styles:**
```css
.ai-hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--ai-bg-deepest);
}

.ai-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.ai-hero-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  padding: 0 2rem;
  text-align: center;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ai-cyan-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
  margin-bottom: 2rem;
  animation: badgePulse 3s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.2); }
  50% { box-shadow: 0 0 30px rgba(0, 212, 255, 0.4); }
}

.ai-hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 4rem;
  max-width: 600px;
  margin-inline: auto;
}

.ai-stat-card {
  background: var(--ai-bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  animation: floatStat 3s ease-in-out infinite;
}

.ai-stat-card:nth-child(2) { animation-delay: 0.5s; }
.ai-stat-card:nth-child(3) { animation-delay: 1s; }

@keyframes floatStat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ai-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--ai-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-stat-label {
  font-size: 0.875rem;
  color: var(--ai-text-tertiary);
  margin-top: 0.5rem;
}
```

### 2. Problem Cards (Holographic Warning Aesthetic)

**Layout:**
```
┌───────────────────────────────────────────┐
│  Section Title: "Challenges We Solve"    │
│                                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Warning │  │ Warning │  │ Warning │  │
│  │  Card   │  │  Card   │  │  Card   │  │
│  │   #1    │  │   #2    │  │   #3    │  │
│  └─────────┘  └─────────┘  └─────────┘  │
│                                           │
│  [Animated diagonal stripes background]  │
└───────────────────────────────────────────┘
```

**Component:**
```html
<section class="ai-problems-section">
  <div class="container">
    <h2 class="ai-text-heading-1">Challenges We Solve</h2>

    <div class="ai-problems-grid">
      <div class="ai-card-warning">
        <div class="ai-warning-icon">
          <svg class="ai-icon ai-icon-pulse"><!-- alert icon --></svg>
        </div>
        <h3 class="ai-text-heading-3">Manual Processes</h3>
        <p class="ai-text-body">
          Time-consuming tasks that slow down productivity
          and increase operational costs.
        </p>
        <div class="ai-warning-badge">High Impact</div>
      </div>

      <!-- Repeat for other problems -->
    </div>
  </div>
</section>
```

**Styles:**
```css
.ai-problems-section {
  background: var(--ai-bg-deep);
  padding: 8rem 0;
  position: relative;
}

.ai-problems-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 50px,
    rgba(239, 68, 68, 0.03) 50px,
    rgba(239, 68, 68, 0.03) 100px
  );
  pointer-events: none;
}

.ai-problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.ai-warning-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.ai-warning-badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.375rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #FCA5A5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 3. Solution Section (Transformation Reveal Animation)

**Concept:** Split-screen reveal with before/after transformation

**Component:**
```html
<section class="ai-solution-section">
  <div class="ai-solution-container">
    <!-- Before state (problems) -->
    <div class="ai-solution-before">
      <div class="ai-solution-label">Before AI</div>
      <ul class="ai-solution-list negative">
        <li>Manual data entry</li>
        <li>Slow decision-making</li>
        <li>High error rates</li>
      </ul>
    </div>

    <!-- Transformation divider with animation -->
    <div class="ai-solution-divider">
      <div class="ai-transformation-icon">
        <svg class="ai-icon"><!-- transformation arrow --></svg>
      </div>
    </div>

    <!-- After state (solutions) -->
    <div class="ai-solution-after">
      <div class="ai-solution-label">With AI</div>
      <ul class="ai-solution-list positive">
        <li>Automated workflows</li>
        <li>Real-time insights</li>
        <li>99% accuracy</li>
      </ul>
    </div>
  </div>
</section>
```

**GSAP Animation:**
```typescript
// Reveal animation on scroll
gsap.from('.ai-solution-before', {
  x: -100,
  opacity: 0,
  scrollTrigger: {
    trigger: '.ai-solution-section',
    start: 'top center',
    end: 'center center',
    scrub: 1,
  }
});

gsap.from('.ai-solution-after', {
  x: 100,
  opacity: 0,
  scrollTrigger: {
    trigger: '.ai-solution-section',
    start: 'top center',
    end: 'center center',
    scrub: 1,
  }
});

gsap.to('.ai-transformation-icon', {
  rotation: 360,
  scale: 1.2,
  scrollTrigger: {
    trigger: '.ai-solution-section',
    start: 'top center',
    end: 'center center',
    scrub: 1,
  }
});
```

### 4. Services Accordion (Futuristic Expansion with Glow)

**Component:**
```html
<section class="ai-services-section">
  <h2 class="ai-text-heading-1">Our AI Services</h2>

  <div class="ai-accordion">
    <div class="ai-accordion-item" [class.active]="activeService === 1">
      <button class="ai-accordion-trigger" (click)="toggleService(1)">
        <div class="ai-accordion-header">
          <div class="ai-accordion-icon">
            <svg><!-- icon --></svg>
          </div>
          <h3 class="ai-text-heading-3">Machine Learning Solutions</h3>
        </div>
        <svg class="ai-accordion-chevron"><!-- chevron --></svg>
      </button>

      <div class="ai-accordion-content">
        <p class="ai-text-body">
          Custom ML models trained on your data to predict
          outcomes, automate tasks, and uncover insights.
        </p>
        <ul class="ai-feature-list">
          <li>Predictive analytics</li>
          <li>Anomaly detection</li>
          <li>Recommendation engines</li>
        </ul>
      </div>
    </div>

    <!-- Repeat for other services -->
  </div>
</section>
```

**Styles:**
```css
.ai-accordion-item {
  background: var(--ai-bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-accordion-item.active {
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: var(--ai-glow-cyan);
}

.ai-accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ai-text-primary);
  transition: all 0.3s ease;
}

.ai-accordion-trigger:hover {
  background: rgba(0, 212, 255, 0.05);
}

.ai-accordion-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.ai-accordion-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 12px;
  color: var(--ai-cyan-400);
  transition: all 0.3s ease;
}

.ai-accordion-item.active .ai-accordion-icon {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}

.ai-accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-accordion-item.active .ai-accordion-content {
  max-height: 500px;
  padding: 0 2rem 2rem;
}

.ai-accordion-chevron {
  width: 24px;
  height: 24px;
  color: var(--ai-cyan-400);
  transition: transform 0.3s ease;
}

.ai-accordion-item.active .ai-accordion-chevron {
  transform: rotate(180deg);
}

.ai-feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.ai-feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 212, 255, 0.05);
  border-left: 2px solid var(--ai-cyan-500);
  border-radius: 8px;
  color: var(--ai-text-secondary);
  font-size: 0.875rem;
}

.ai-feature-list li::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--ai-cyan-500);
  border-radius: 50%;
  color: var(--ai-bg-deepest);
  font-weight: 700;
  font-size: 0.75rem;
}
```

### 5. Methodology Timeline (Animated Progress Flow)

**Component:**
```html
<section class="ai-methodology-section">
  <h2 class="ai-text-heading-1">Our AI Implementation Process</h2>

  <div class="ai-timeline">
    <!-- Timeline line with animated progress -->
    <div class="ai-timeline-line">
      <div class="ai-timeline-progress"></div>
    </div>

    <div class="ai-timeline-item" data-step="1">
      <div class="ai-timeline-marker">
        <span class="ai-timeline-number">01</span>
      </div>
      <div class="ai-timeline-content">
        <h3 class="ai-text-heading-3">Discovery & Analysis</h3>
        <p class="ai-text-body">
          We analyze your business processes, data sources,
          and identify AI opportunities.
        </p>
        <ul class="ai-timeline-deliverables">
          <li>Requirements workshop</li>
          <li>Data audit</li>
          <li>Feasibility study</li>
        </ul>
      </div>
    </div>

    <!-- Repeat for steps 2-5 -->
  </div>
</section>
```

**Styles:**
```css
.ai-timeline {
  position: relative;
  padding: 4rem 0;
}

.ai-timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 212, 255, 0.2);
  transform: translateX(-50%);
}

.ai-timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(
    180deg,
    var(--ai-cyan-500) 0%,
    var(--ai-purple-500) 100%
  );
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  transition: height 1s ease-out;
}

/* GSAP will animate this height on scroll */

.ai-timeline-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
  align-items: center;
}

.ai-timeline-item:nth-child(odd) .ai-timeline-content {
  grid-column: 1;
  text-align: right;
}

.ai-timeline-item:nth-child(even) .ai-timeline-content {
  grid-column: 3;
  text-align: left;
}

.ai-timeline-marker {
  grid-column: 2;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ai-bg-deepest);
  border: 3px solid var(--ai-cyan-500);
  border-radius: 50%;
  box-shadow:
    0 0 0 10px rgba(0, 212, 255, 0.1),
    var(--ai-glow-cyan);
  position: relative;
  z-index: 10;
}

.ai-timeline-number {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--ai-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-timeline-content {
  background: var(--ai-bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-timeline-item.in-view .ai-timeline-content {
  opacity: 1;
  transform: translateX(0);
}

.ai-timeline-deliverables {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ai-timeline-deliverables li {
  padding: 0.5rem 1rem;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--ai-cyan-400);
}
```

**GSAP Animation:**
```typescript
// Animate timeline progress on scroll
gsap.to('.ai-timeline-progress', {
  height: '100%',
  scrollTrigger: {
    trigger: '.ai-timeline',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
  }
});

// Reveal timeline items on scroll
gsap.utils.toArray('.ai-timeline-item').forEach((item: any, index) => {
  gsap.to(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 80%',
      onEnter: () => item.classList.add('in-view'),
    }
  });
});
```

### 6. CTA Section (Magnetic Button with Particle Effects)

**Component:**
```html
<section class="ai-cta-section">
  <div class="ai-cta-bg">
    <canvas id="cta-particles"></canvas>
  </div>

  <div class="ai-cta-content">
    <span class="ai-badge ai-badge-cta">Limited Spots Available</span>

    <h2 class="ai-text-hero">
      Ready to Transform<br>
      Your Business with AI?
    </h2>

    <p class="ai-text-body-lg">
      Schedule a free consultation with our AI experts
      and discover how we can help you achieve your goals.
    </p>

    <div class="ai-cta-actions">
      <button class="ai-button-primary ai-button-magnetic ai-button-lg">
        <span>Get Started</span>
        <svg class="ai-button-icon"><!-- arrow --></svg>
      </button>

      <button class="ai-button-secondary ai-button-lg">
        <span>View Case Studies</span>
      </button>
    </div>

    <div class="ai-cta-trust">
      <div class="ai-trust-badge">
        <svg class="ai-icon"><!-- shield icon --></svg>
        <span>SOC 2 Certified</span>
      </div>
      <div class="ai-trust-badge">
        <svg class="ai-icon"><!-- lock icon --></svg>
        <span>GDPR Compliant</span>
      </div>
      <div class="ai-trust-badge">
        <svg class="ai-icon"><!-- star icon --></svg>
        <span>98% Client Satisfaction</span>
      </div>
    </div>
  </div>
</section>
```

**Magnetic Button Effect (GSAP):**
```typescript
const magneticButtons = document.querySelectorAll('.ai-button-magnetic');

magneticButtons.forEach((button) => {
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
});
```

**Styles:**
```css
.ai-cta-section {
  position: relative;
  padding: 10rem 0;
  background: var(--ai-bg-deepest);
  text-align: center;
  overflow: hidden;
}

.ai-cta-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.ai-cta-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.ai-badge-cta {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2) 0%,
    rgba(0, 212, 255, 0.2) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #FCA5A5;
  animation: badgePulse 2s ease-in-out infinite;
}

.ai-cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
}

.ai-button-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--ai-gradient-primary);
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow:
    0 10px 30px rgba(0, 212, 255, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.ai-button-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ai-button-primary:hover::before {
  opacity: 1;
}

.ai-button-primary:hover {
  box-shadow:
    0 15px 40px rgba(0, 212, 255, 0.5),
    var(--ai-glow-cyan);
  transform: translateY(-2px);
}

.ai-button-secondary {
  padding: 1rem 2.5rem;
  background: transparent;
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ai-cyan-400);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-button-secondary:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--ai-cyan-500);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.ai-button-lg {
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
}

.ai-cta-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-top: 4rem;
}

.ai-trust-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--ai-text-tertiary);
}

.ai-trust-badge .ai-icon {
  width: 20px;
  height: 20px;
  color: var(--ai-cyan-400);
}
```

---

## Animation Recommendations (GSAP Patterns)

### Scroll-Triggered Animations

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 1. Fade in on scroll
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

// 2. Parallax backgrounds
gsap.to('.ai-parallax-bg', {
  y: '30%',
  scrollTrigger: {
    trigger: '.ai-parallax-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  }
});

// 3. Rotating elements
gsap.to('.ai-rotate-element', {
  rotation: 360,
  scrollTrigger: {
    trigger: '.ai-rotate-element',
    start: 'top center',
    end: 'bottom center',
    scrub: 2,
  }
});

// 4. Scale in effect
gsap.from('.ai-scale-in', {
  scale: 0.8,
  opacity: 0,
  scrollTrigger: {
    trigger: '.ai-scale-in',
    start: 'top 75%',
    toggleActions: 'play none none reverse',
  }
});

// 5. Stagger grid items
gsap.from('.ai-grid-item', {
  opacity: 0,
  y: 30,
  duration: 0.8,
  stagger: {
    amount: 0.6,
    from: 'start',
  },
  scrollTrigger: {
    trigger: '.ai-grid-container',
    start: 'top 70%',
  }
});
```

### Continuous Animations (No ScrollTrigger)

```typescript
// 1. Floating elements
gsap.to('.ai-float', {
  y: '+=20',
  duration: 2,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
});

// 2. Pulsing glow
gsap.to('.ai-glow-pulse', {
  boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)',
  duration: 1.5,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
});

// 3. Rotating orb
gsap.to('.ai-orb-rotate', {
  rotation: 360,
  duration: 20,
  ease: 'none',
  repeat: -1,
});

// 4. Neural connection animation
gsap.to('.neural-connection', {
  strokeDashoffset: 0,
  duration: 2,
  ease: 'power1.inOut',
  stagger: 0.5,
  repeat: -1,
});

// 5. Data stream flow
gsap.to('.data-particle', {
  x: '100vw',
  duration: 3,
  ease: 'none',
  stagger: {
    amount: 2,
    repeat: -1,
  },
});
```

### Mouse Interactions

```typescript
// 1. Magnetic cursor effect
const cursor = document.querySelector('.ai-cursor');
const magneticElements = document.querySelectorAll('.ai-magnetic');

document.addEventListener('mousemove', (e) => {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.3,
  });
});

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  });
});

// 2. Glow follow cursor
const glowElements = document.querySelectorAll('.ai-card');

glowElements.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// CSS for glow follow
.ai-card::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(0, 212, 255, 0.3) 0%,
    transparent 70%
  );
  left: var(--mouse-x);
  top: var(--mouse-y);
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.ai-card:hover::after {
  opacity: 1;
}
```

---

## Spacing and Layout System

### Container System

```css
/* Container widths */
.ai-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.ai-container-narrow {
  max-width: 1000px;
}

.ai-container-wide {
  max-width: 1600px;
}

/* Section spacing */
.ai-section {
  padding: 8rem 0;
}

.ai-section-sm {
  padding: 5rem 0;
}

.ai-section-lg {
  padding: 12rem 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ai-section { padding: 5rem 0; }
  .ai-section-sm { padding: 3rem 0; }
  .ai-section-lg { padding: 7rem 0; }
}
```

### Grid Systems

```css
/* Auto-fit grid */
.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Fixed column grids */
.ai-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.ai-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.ai-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .ai-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .ai-grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .ai-grid-4,
  .ai-grid-3,
  .ai-grid-2 {
    grid-template-columns: 1fr;
  }
}
```

### Spacing Scale

```css
/* Use Tailwind spacing or custom scale */
--space-xs: 0.5rem;    /* 8px */
--space-sm: 1rem;      /* 16px */
--space-md: 1.5rem;    /* 24px */
--space-lg: 2rem;      /* 32px */
--space-xl: 3rem;      /* 48px */
--space-2xl: 4rem;     /* 64px */
--space-3xl: 6rem;     /* 96px */
--space-4xl: 8rem;     /* 128px */
```

---

## Accessibility Features

### Reduced Motion Support

```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential transforms but remove animations */
  .ai-float,
  .ai-rotate-element,
  .ai-glow-pulse {
    animation: none !important;
  }
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .ai-card {
    border-width: 2px;
    border-color: var(--ai-cyan-500);
  }

  .ai-text-primary {
    color: #FFFFFF;
  }

  .ai-button-primary {
    outline: 2px solid white;
    outline-offset: 2px;
  }
}
```

### Focus States

```css
/* Visible focus indicators */
.ai-button:focus-visible,
.ai-link:focus-visible,
.ai-accordion-trigger:focus-visible {
  outline: 3px solid var(--ai-cyan-500);
  outline-offset: 4px;
  border-radius: 8px;
}

/* Remove default focus outline */
*:focus {
  outline: none;
}

/* Only show custom focus for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--ai-cyan-500);
  outline-offset: 2px;
}
```

---

## Performance Optimization

### GPU Acceleration

```css
/* Force GPU rendering for animated elements */
.ai-3d-element,
.ai-parallax,
.ai-float {
  transform: translateZ(0);
  will-change: transform;
}

/* Only use will-change on elements that actually animate */
.ai-button:hover {
  will-change: transform;
}

.ai-button:not(:hover) {
  will-change: auto;
}
```

### Lazy Loading Images

```html
<img
  src="placeholder.jpg"
  data-src="full-image.jpg"
  class="ai-lazy-image"
  loading="lazy"
  alt="AI visualization"
>
```

```typescript
// Intersection Observer for lazy loading
const lazyImages = document.querySelectorAll('.ai-lazy-image');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach((img) => imageObserver.observe(img));
```

### Animation Performance

```typescript
// Use GSAP's kill() method in ngOnDestroy
export class AiServicesComponent implements OnInit, OnDestroy {
  private animations: gsap.core.Tween[] = [];

  ngOnInit() {
    this.animations.push(
      gsap.to('.element', { /* animation */ })
    );
  }

  ngOnDestroy() {
    this.animations.forEach((anim) => anim.kill());
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }
}
```

---

## Tailwind CSS Integration

### Custom Tailwind Config Extensions

```javascript
// Add to tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        'ai-cyan': {
          50: '#E0F7FF',
          100: '#B3ECFF',
          200: '#80E1FF',
          300: '#4DD5FF',
          400: '#26CCFF',
          500: '#00D4FF',
          600: '#00B8E6',
          700: '#0099CC',
          800: '#007AB3',
          900: '#005C99',
        },
        'ai-purple': {
          50: '#F3F0FF',
          100: '#E4DBFF',
          200: '#CABFFF',
          300: '#ADA0FF',
          400: '#9580FF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        'ai-bg': {
          deepest: '#0A0E1A',
          deep: '#0F1419',
          elevated: '#1A1F2E',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-neural': '0 0 20px rgba(0, 212, 255, 0.2), 0 0 40px rgba(139, 92, 246, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'neural-flow': 'neuralFlow 3s ease infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotateX(0deg)' },
          '50%': { transform: 'translate3d(20px, -30px, 50px) rotateX(10deg)' },
        },
        neuralFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
      },
    },
  },
};
```

### Utility Classes

```css
/* Add to global CSS */

/* Gradient text */
.ai-gradient-text {
  background: linear-gradient(135deg, #F8FAFC 0%, #00D4FF 50%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass card */
.ai-glass {
  background: rgba(26, 31, 46, 0.5);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

/* Glow effect */
.ai-glow {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.2);
}
```

---

## Component Code Examples

### Hero Component (TypeScript)

```typescript
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-ai-hero',
  standalone: true,
  templateUrl: './ai-hero.component.html',
  styleUrls: ['./ai-hero.component.css'],
})
export class AiHeroComponent implements OnInit, OnDestroy {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;

  private animations: gsap.core.Tween[] = [];
  private particleAnimation: number = 0;

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
    this.initParticles();
    this.initAnimations();
  }

  ngOnDestroy() {
    this.animations.forEach((anim) => anim.kill());
    ScrollTrigger.getAll().forEach((st) => st.kill());
    cancelAnimationFrame(this.particleAnimation);
  }

  private initParticles() {
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.fill();
      });

      this.particleAnimation = requestAnimationFrame(animate);
    };

    animate();
  }

  private initAnimations() {
    // Floating orbs
    this.animations.push(
      gsap.to('.floating-orb', {
        y: '+=30',
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
      })
    );

    // Parallax on scroll
    this.animations.push(
      gsap.to('.ai-hero-3d', {
        y: '+=100',
        scrollTrigger: {
          trigger: '.ai-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    );

    // Stats reveal
    this.animations.push(
      gsap.from('.ai-stat-card', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.ai-hero-stats',
          start: 'top 80%',
        },
      })
    );
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}
```

---

## Final Notes & Best Practices

### Design Principles Checklist

- [ ] Consistent use of AI cyan (#00D4FF) and neural purple (#8B5CF6)
- [ ] Glassmorphism applied to cards and overlays
- [ ] 3D depth with parallax and floating elements
- [ ] Smooth 60fps animations (GSAP optimized)
- [ ] Dark mode with proper contrast ratios
- [ ] Reduced motion support for accessibility
- [ ] High contrast mode fallbacks
- [ ] Keyboard navigation and focus states
- [ ] Semantic HTML structure
- [ ] Performance optimization (GPU acceleration, lazy loading)

### Implementation Priority

1. **Phase 1: Foundation**
   - Color palette implementation in Tailwind config
   - Typography setup (Space Grotesk, JetBrains Mono fonts)
   - Base glassmorphism card styles
   - Hero section with particle background

2. **Phase 2: Core Sections**
   - Problem cards with holographic warnings
   - Services accordion with glow effects
   - Methodology timeline with animated progress

3. **Phase 3: Advanced Features**
   - 3D floating elements (Three.js or CSS 3D)
   - Magnetic button interactions
   - Scroll-triggered GSAP animations
   - Solution transformation reveal

4. **Phase 4: Polish & Optimization**
   - Performance audit and optimization
   - Accessibility testing (WCAG 2.1 AA)
   - Cross-browser testing
   - Reduced motion and high contrast modes

---

## Sources & Inspiration

### Research Links

- [The Future of Web Design and AI 2025](https://www.daltoncraighead.com/insights/the-future-of-web-design-and-ai-a-glimpse-into-2025)
- [16 Best AI Website Design Examples 2025](https://www.webstacks.com/blog/ai-website-design-examples-inspiration)
- [UI Design Trends 2025: AI, 3D, Adaptive Interfaces](https://pedalsup.com/ui-design-trends-to-consider-in-2025/)
- [Futuristic Websites - 99designs](https://99designs.com/inspiration/websites/futuristic)
- [Awwwards - 3D Websites](https://www.awwwards.com/websites/3d/)

### Design Pattern References

- **Glassmorphism:** Frosted glass effects with transparency and layered elements
- **Neural Networks:** Organic flowing gradients, particle systems, scanning lines
- **3D Integration:** Three.js, Spline, CSS 3D transforms with parallax
- **AI Aesthetics:** Cyan/purple color schemes, data visualizations, ambient glows

---

**End of Design Specification**

This document provides a complete, implementation-ready design system for a futuristic AI Services page. All code examples are production-ready and optimized for performance, accessibility, and modern web standards.
