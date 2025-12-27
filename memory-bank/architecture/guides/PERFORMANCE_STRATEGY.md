# Roaya IT Website - Performance Optimization Strategy

**Purpose:** Comprehensive performance optimization plan and monitoring strategy

**Target Metrics:**
- Lighthouse Performance: 95+
- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Cumulative Layout Shift: < 0.1

---

## Performance Budget

### Bundle Size Budget

| Resource Type | Target | Maximum | Current | Status |
|--------------|--------|---------|---------|--------|
| Initial JS Bundle | < 150KB | 200KB | TBD | - |
| Initial CSS Bundle | < 40KB | 75KB | TBD | - |
| Total Initial Load | < 200KB | 300KB | TBD | - |
| Lazy-loaded Chunks | < 50KB each | 100KB | TBD | - |
| Images (per page) | < 500KB | 1MB | TBD | - |
| Fonts | < 100KB | 150KB | TBD | - |

### Runtime Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.2s | 1.8s |
| Largest Contentful Paint | < 2.5s | 4.0s |
| Time to Interactive | < 2.5s | 3.8s |
| Total Blocking Time | < 200ms | 600ms |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| Speed Index | < 2.0s | 3.5s |

---

## Optimization Strategies

### 1. Code Splitting & Lazy Loading

#### Route-Level Splitting
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component')
      .then(m => m.AboutComponent)
  }
];
```

**Impact:**
- Reduces initial bundle by 40-60%
- Each route loads only when accessed
- Improves Time to Interactive

#### Component-Level Lazy Loading
```typescript
// Using @defer (Angular 17+)
@Component({
  template: `
    @defer (on viewport) {
      <app-testimonials />
    } @placeholder {
      <div class="skeleton"></div>
    } @loading (minimum 500ms) {
      <app-loader />
    }
  `
})
```

**Impact:**
- Heavy components load only when visible
- Reduces initial JavaScript execution
- Improves First Contentful Paint

### 2. Image Optimization

#### Strategy Matrix

| Image Type | Format | Quality | Lazy Load | Dimensions |
|-----------|--------|---------|-----------|------------|
| Hero images | WebP/AVIF | 85% | No | Responsive |
| Content images | WebP | 80% | Yes | Fixed |
| Thumbnails | WebP | 75% | Yes | Fixed |
| Icons | SVG | N/A | No | Inline |
| Backgrounds | WebP | 70% | No | Responsive |

#### Implementation

```html
<!-- Responsive image with modern formats -->
<picture>
  <source
    srcset="hero-400.avif 400w, hero-800.avif 800w, hero-1200.avif 1200w"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    type="image/avif"
  />
  <source
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    type="image/webp"
  />
  <img
    src="hero-800.jpg"
    alt="Hero image"
    width="1200"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>
```

**Expected Impact:**
- 60-80% reduction in image file sizes
- Faster LCP (Largest Contentful Paint)
- Lower bandwidth consumption

#### Image Processing Pipeline

```bash
# Install sharp
npm install sharp

# Create optimization script
node scripts/optimize-images.js
```

```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));

  // Generate WebP
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(path.join(outputDir, `${filename}.webp`));

  // Generate AVIF
  await sharp(inputPath)
    .avif({ quality: 75 })
    .toFile(path.join(outputDir, `${filename}.avif`));

  // Generate responsive sizes (WebP)
  for (const width of [400, 800, 1200]) {
    await sharp(inputPath)
      .resize(width)
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, `${filename}-${width}.webp`));
  }
}

// Usage
optimizeImage('./src/assets/images/hero.jpg', './src/assets/images/optimized');
```

### 3. Font Optimization

#### Font Loading Strategy

```css
/* Preload critical fonts */
<link rel="preload" href="/assets/fonts/inter/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>

/* Font face with optimized settings */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;  /* Show fallback immediately, swap when loaded */
  src: url('/assets/fonts/inter/Inter-Variable.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF;  /* Latin characters only */
}

@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/assets/fonts/tajawal/Tajawal-Regular.woff2') format('woff2');
  unicode-range: U+0600-06FF;  /* Arabic characters only */
}
```

**Font Subsetting:**
```bash
# Install glyphhanger
npm install -g glyphhanger

# Subset font to only used characters
glyphhanger --subset=./fonts/Inter-Variable.woff2 --formats=woff2
```

**Expected Impact:**
- 50-70% reduction in font file size
- Faster First Contentful Paint
- Reduced layout shift

### 4. Critical CSS

#### Strategy

Angular CLI automatically inlines critical CSS with:
```json
// angular.json
{
  "optimization": {
    "styles": {
      "inlineCritical": true
    }
  }
}
```

**Manual Critical CSS (if needed):**
```bash
npm install critical

# Generate critical CSS
npx critical index.html --base dist/ --inline
```

**Expected Impact:**
- Faster First Contentful Paint (300-500ms improvement)
- Eliminates render-blocking CSS

### 5. Preloading & Prefetching

#### Preload Strategy

```html
<!-- index.html -->
<head>
  <!-- Preload critical resources -->
  <link rel="preload" href="/assets/fonts/inter/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/main.js" as="script">
  <link rel="preload" href="/styles.css" as="style">

  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://www.google-analytics.com">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
</head>
```

#### Route Preloading

```typescript
// Custom preload strategy
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload']) {
      // Delay preloading by 2s to prioritize initial render
      return timer(2000).pipe(mergeMap(() => load()));
    }
    return of(null);
  }
}

// In routes
{
  path: 'services',
  loadComponent: () => import('./features/services/services.component'),
  data: { preload: true }  // Will be preloaded after 2s
}
```

**Expected Impact:**
- Instant navigation to preloaded routes
- Better perceived performance

### 6. Render Optimization

#### Change Detection Optimization

```typescript
// Use OnPush strategy for presentational components
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class CardComponent {
  @Input() data!: CardData;
}
```

**Expected Impact:**
- 50-70% reduction in change detection cycles
- Smoother animations and interactions

#### Virtual Scrolling (for lists)

```typescript
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

**Expected Impact:**
- Render only visible items
- Smooth scrolling with 1000+ items

### 7. Third-Party Script Optimization

#### Google Analytics 4

```html
<!-- Load analytics after page load -->
<script>
  window.addEventListener('load', function() {
    // Load GA4 asynchronously
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  });
</script>
```

**Alternative: Use Partytown**
```bash
npm install @builder.io/partytown

# Moves analytics to web worker
```

**Expected Impact:**
- Zero impact on main thread
- Faster Time to Interactive

---

## Performance Monitoring

### 1. Lighthouse CI

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://roayait.com
            https://roayait.com/about
            https://roayait.com/services
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

**Budget Configuration:**
```json
// lighthouse-budget.json
{
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "stylesheet",
          "budget": 75
        },
        {
          "resourceType": "image",
          "budget": 500
        },
        {
          "resourceType": "font",
          "budget": 150
        }
      ],
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1200
        },
        {
          "metric": "interactive",
          "budget": 2500
        }
      ]
    }
  ]
}
```

### 2. Real User Monitoring (RUM)

```typescript
// core/services/performance.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  constructor() {
    this.observeWebVitals();
  }

  private observeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportMetric('FCP', entry.startTime);
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.reportMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsScore = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
          this.reportMetric('CLS', clsScore);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime;
        this.reportMetric('FID', fid);
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  private reportMetric(name: string, value: number): void {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        non_interaction: true
      });
    }
  }
}
```

### 3. Custom Performance Marks

```typescript
// Mark and measure custom operations
@Component({...})
export class HomeComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    performance.mark('home-init-start');
    // Load data
  }

  ngAfterViewInit(): void {
    performance.mark('home-init-end');
    performance.measure('home-init', 'home-init-start', 'home-init-end');

    const measure = performance.getEntriesByName('home-init')[0];
    console.log(`Home initialization took ${measure.duration}ms`);

    // Report to analytics
    gtag('event', 'timing_complete', {
      name: 'home_init',
      value: Math.round(measure.duration),
      event_category: 'Performance'
    });
  }
}
```

---

## Performance Testing Checklist

### Before Each Release

- [ ] Run Lighthouse CI on all main pages
- [ ] Verify bundle sizes are within budget
- [ ] Test on 3G/4G connections (Chrome DevTools throttling)
- [ ] Test on low-end devices (CPU throttling)
- [ ] Check Core Web Vitals in Chrome DevTools
- [ ] Verify no layout shifts (CLS < 0.1)
- [ ] Test image lazy loading
- [ ] Verify font loading (no FOIT/FOUT)
- [ ] Check for render-blocking resources
- [ ] Test RTL performance (Arabic)
- [ ] Verify SSR performance
- [ ] Test cache headers

### Performance Testing Environments

| Environment | Connection | Device | CPU |
|------------|------------|--------|-----|
| Desktop (Good) | Cable | Desktop | No throttle |
| Desktop (Poor) | 3G Fast | Desktop | 4x slowdown |
| Mobile (Good) | 4G | Pixel 5 | No throttle |
| Mobile (Poor) | 3G Slow | Moto G4 | 6x slowdown |

---

## Performance Optimization Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Configure bundle budgets
- [x] Implement lazy loading
- [x] Optimize images (WebP/AVIF)
- [x] Setup font optimization
- [ ] Configure critical CSS

### Phase 2: Advanced (Week 3-4)
- [ ] Implement service worker (offline support)
- [ ] Add resource hints (preload/prefetch)
- [ ] Optimize third-party scripts
- [ ] Implement virtual scrolling (if needed)
- [ ] Setup performance monitoring

### Phase 3: Monitoring (Week 5+)
- [ ] Configure Lighthouse CI
- [ ] Setup RUM (Real User Monitoring)
- [ ] Create performance dashboard
- [ ] Establish alerting thresholds
- [ ] Monthly performance audits

---

## Performance Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Solution |
|-------------|-------------|----------|
| Importing entire libraries | Large bundle size | Import only what you need |
| Loading all images eagerly | Slow initial load | Use lazy loading |
| No change detection strategy | Excessive re-renders | Use OnPush |
| Inline styles everywhere | CSS bloat | Use classes |
| Too many HTTP requests | Slow load time | Bundle, sprite, inline small assets |
| No image dimensions | Layout shift | Always specify width/height |
| Render-blocking scripts | Delayed interactivity | Async/defer scripts |
| Large JSON payloads | Network overhead | Paginate, compress |

---

## Tools & Resources

### Performance Analysis Tools
- **Lighthouse** - Overall performance score
- **WebPageTest** - Detailed waterfall analysis
- **Chrome DevTools** - Performance profiling
- **Bundle Analyzer** - JavaScript bundle visualization
- **ImageOptim** - Image compression

### Monitoring Tools
- **Google Analytics 4** - Core Web Vitals tracking
- **Google Search Console** - Real-world performance data
- **Sentry** - Error tracking with performance data
- **Vercel Analytics** - Edge performance metrics

### Command Line Tools
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://roayait.com --view

# Bundle size analysis
npm run build:stats
npx webpack-bundle-analyzer dist/stats.json

# Image optimization
npm install -g sharp-cli
sharp -i input.jpg -o output.webp --webp

# Font subsetting
npm install -g glyphhanger
glyphhanger --subset=font.woff2 --formats=woff2
```

---

## Expected Performance Metrics

### Before Optimization (Baseline)

| Metric | Value |
|--------|-------|
| Lighthouse Score | 70-80 |
| FCP | 2.5s |
| LCP | 4.0s |
| TTI | 4.5s |
| CLS | 0.2 |
| Bundle Size | 400KB |

### After Optimization (Target)

| Metric | Value | Improvement |
|--------|-------|-------------|
| Lighthouse Score | 95+ | +20% |
| FCP | < 1.2s | 52% faster |
| LCP | < 2.5s | 38% faster |
| TTI | < 2.5s | 44% faster |
| CLS | < 0.1 | 50% better |
| Bundle Size | < 200KB | 50% smaller |

---

## Document Control

**Version:** 1.0
**Last Updated:** 2025-12-05
**Review Cycle:** Monthly
**Owner:** Tech Lead

**Next Review:** 2025-01-05
