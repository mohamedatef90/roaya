# Performance Optimization Checklist
**Quick Reference Guide for Roaya IT Website**

---

## When Adding New Images

### Above-the-Fold Images (Hero, Header)
```html
<img
  src="/path/to/image.png"
  alt="Descriptive alt text for SEO and accessibility"
  loading="eager"
  fetchpriority="high"
  width="XXX"
  height="YYY"
/>
```

### Below-the-Fold Images (Footer, Content)
```html
<img
  src="/path/to/image.png"
  alt="Descriptive alt text"
  loading="lazy"
  fetchpriority="low"
  width="XXX"
  height="YYY"
/>
```

### Critical Rules
- ✅ **ALWAYS** add `width` and `height` to prevent layout shift
- ✅ **ALWAYS** add descriptive `alt` text
- ✅ Use `loading="eager"` only for above-fold images
- ✅ Use `loading="lazy"` for everything else
- ✅ Use `fetchpriority="high"` sparingly (1-2 critical images max)

---

## When Adding External Resources

### Preconnect to External Domains
Add to `index.html` `<head>`:

```html
<!-- For critical third-party resources -->
<link rel="preconnect" href="https://example.com" crossorigin>
<link rel="dns-prefetch" href="https://example.com">
```

**Use for:**
- Google Fonts
- Analytics domains
- API endpoints (if fetched immediately)

**Don't use for:**
- Resources loaded much later
- Optional third-party scripts

---

## When Adding Fonts

### Google Fonts
Always use `&display=swap`:

```html
<link href="https://fonts.googleapis.com/css2?family=FontName:wght@400;700&display=swap" rel="stylesheet">
```

### Custom Fonts
Use `font-display: swap` in @font-face:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}
```

---

## When Adding Components

### Component Size Budgets
- **Component style:** < 4 KB (warning), < 8 KB (error)
- **Component bundle:** Aim for < 15 KB per lazy-loaded route

### Lazy Loading Routes
Always use lazy loading for routes:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  }
];
```

### Import Optimization
Only import what you need:

```typescript
// ❌ Bad - imports entire library
import * as _ from 'lodash';

// ✅ Good - imports specific function
import { debounce } from 'lodash-es';
```

---

## Performance Testing Commands

```bash
# Build with stats
npm run build

# Development server
npm run dev

# Check bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Run Lighthouse (if configured)
npm run lighthouse
```

---

## Core Web Vitals Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| **FCP** (First Contentful Paint) | < 1.8s | 🟢 Expected: 1.5-1.8s |
| **LCP** (Largest Contentful Paint) | < 2.5s | 🟢 Expected: 2.3-2.8s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 🟢 Expected: < 0.05 |
| **FID** (First Input Delay) | < 100ms | 🟢 Expected: < 50ms |
| **TTI** (Time to Interactive) | < 3.8s | 🟢 Expected: 3.2-3.5s |
| **TBT** (Total Blocking Time) | < 300ms | 🟢 Expected: 150-200ms |

---

## Common Issues & Fixes

### Issue: Layout Shift (Poor CLS)
**Cause:** Images without width/height
**Fix:**
```html
<!-- ❌ Bad -->
<img src="image.jpg" alt="...">

<!-- ✅ Good -->
<img src="image.jpg" alt="..." width="800" height="600">
```

### Issue: Slow Font Loading (FOIT)
**Cause:** Missing `font-display: swap`
**Fix:**
```css
/* Add to Google Fonts URL */
?family=Inter&display=swap

/* Or in @font-face */
font-display: swap;
```

### Issue: Large Bundle Size
**Cause:** Not using lazy loading
**Fix:**
```typescript
// Use lazy loading for routes
loadComponent: () => import('./component')
```

### Issue: Slow Initial Load
**Cause:** No preconnect to external resources
**Fix:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
```

---

## Quick Reference: Image Loading Strategy

```
Page Load
    ↓
[Header Logo]          → loading="eager" fetchpriority="high"
[Hero Image]           → loading="eager" fetchpriority="high"
    ↓
[Viewport]
    ↓
[Below-fold Images]    → loading="lazy" fetchpriority="low"
[Footer Images]        → loading="lazy" fetchpriority="low"
```

---

## Resource Priority Guide

### High Priority (fetchpriority="high")
- Logo in header (1 image max)
- Hero image (1 image max)
- Critical CSS

### Normal Priority (default)
- Main content images
- Navigation elements
- Critical JavaScript

### Low Priority (fetchpriority="low")
- Footer images
- Below-fold decorative images
- Non-critical fonts

---

## Bundle Budget Alerts

### Current Configuration
```json
{
  "type": "initial",
  "maximumWarning": "500kB",
  "maximumError": "1MB"
}
```

**Current Status:**
- Initial Bundle: 109 KB ✅ (78% under budget)
- Headroom: 391 KB before warning

### Per-Component Budget
```json
{
  "type": "anyComponentStyle",
  "maximumWarning": "4kB",
  "maximumError": "8kB"
}
```

---

## Before Deploying to Production

- [ ] Run `npm run build` successfully
- [ ] Check bundle sizes are under budget
- [ ] Verify all images have width/height
- [ ] Check that lazy loading is working
- [ ] Test on 3G throttled connection
- [ ] Verify no console errors
- [ ] Check accessibility with screen reader
- [ ] Test in Safari, Chrome, Firefox
- [ ] Verify mobile responsive design
- [ ] Check dark mode theme

---

## Useful DevTools Settings

### Performance Throttling
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Fast 3G" or "Slow 3G"
4. Test page load

### Layout Shift Testing
1. DevTools → Performance
2. Enable "Layout Shift Regions"
3. Record page load
4. Review CLS metric

### Coverage Analysis
1. DevTools → Coverage (Cmd+Shift+P → "Show Coverage")
2. Record page load
3. Review unused CSS/JS

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Font Loading](https://web.dev/font-best-practices/)
- [Angular Performance](https://angular.dev/best-practices/runtime-performance)

---

*Keep this checklist handy when developing new features!*
