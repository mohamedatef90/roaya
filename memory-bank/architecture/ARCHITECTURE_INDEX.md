# Roaya IT Website - Architecture Documentation Index

**Project:** Roaya IT Corporate Website
**Tech Stack:** Angular 21, Standalone Components, Tailwind CSS, shadcn-angular
**Status:** Architecture Defined
**Version:** 1.0
**Date:** 2025-12-05

---

## Document Overview

This directory contains the complete technical architecture documentation for the Roaya IT website project. All documents are stored in `/Users/mohamedatef/Downloads/roaya/memory-bank/`.

---

## Core Architecture Documents

### 1. TECHNICAL_ARCHITECTURE.md (Primary Document)
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/TECHNICAL_ARCHITECTURE.md`

The comprehensive technical architecture document covering:
- System architecture overview (SPA with SSR)
- Complete project structure and folder organization
- Theming system (CSS custom properties + Tailwind)
- Internationalization strategy (@angular/localize)
- Component architecture patterns (smart vs presentational)
- State management (Signals + RxJS)
- Performance optimization strategies
- Animation architecture (Angular + GSAP)
- Build and deployment configuration (Vercel/Netlify)
- Security considerations
- Testing strategy (70% unit, 20% integration, 10% E2E)
- Technical risks and mitigations

**When to read:** Start here for complete architecture understanding

---

### 2. IMPLEMENTATION_GUIDE.md (Developer Guide)
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/IMPLEMENTATION_GUIDE.md`

Step-by-step implementation guide including:
- Initial project setup instructions
- Core infrastructure setup (services, components)
- Theming implementation with code examples
- i18n setup and workflow
- Component development patterns
- Performance optimization checklist
- Testing guidelines (unit, component, E2E)
- Deployment checklist
- Troubleshooting guide
- Quick reference commands

**When to read:** Before starting development, as a practical handbook

---

### 3. PERFORMANCE_STRATEGY.md (Performance Plan)
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/PERFORMANCE_STRATEGY.md`

Comprehensive performance optimization plan:
- Performance budgets (bundle size, runtime metrics)
- Code splitting and lazy loading strategies
- Image optimization (WebP/AVIF, lazy loading)
- Font optimization (subsetting, preloading)
- Critical CSS extraction
- Third-party script optimization
- Performance monitoring setup (Lighthouse CI, RUM)
- Custom performance marks
- Testing checklist
- Performance roadmap

**When to read:** When optimizing performance, setting up monitoring

---

### 4. TECHNOLOGY_RADAR.md (Tech Stack Status)
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/TECHNOLOGY_RADAR.md`

Technology adoption tracking:
- ADOPT: Angular 21, Tailwind, GSAP, Signals
- TRIAL: Lottie animations, Playwright
- ASSESS: Analog.js, Qwik, Astro
- HOLD: NgRx, React, Angular Material
- Decision process guidelines
- Quarterly review schedule
- Technology debt register
- Emerging technologies watch list

**When to read:** When evaluating new technologies, quarterly reviews

---

## Architecture Decision Records (ADRs)

### 5. ADR-001-STANDALONE-COMPONENTS.md
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/ADR-001-STANDALONE-COMPONENTS.md`

**Decision:** Use Angular Standalone Components exclusively (no NgModules)

**Key Points:**
- Angular's official future direction
- 15-20% smaller bundle sizes
- Simpler mental model
- Better tree-shaking
- Easier lazy loading

**Status:** Accepted
**Impact:** All components will be standalone, no NgModule files

---

### 6. ADR-002-I18N-STRATEGY.md
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/ADR-002-I18N-STRATEGY.md`

**Decision:** Use @angular/localize (compile-time translation)

**Key Points:**
- Zero runtime overhead
- Perfect SSR support
- SEO-friendly (separate builds per locale)
- Best performance (translations baked into bundles)
- URL structure: `/` (English) and `/ar/` (Arabic)

**Status:** Accepted
**Impact:** Separate builds per locale, cannot switch language without navigation

---

### 7. ADR-003-THEME-SYSTEM.md
**File:** `/Users/mohamedatef/Downloads/roaya/memory-bank/ADR-003-THEME-SYSTEM.md`

**Decision:** CSS Custom Properties with Tailwind for theming

**Key Points:**
- Runtime theme switching (< 5ms)
- Seamless shadcn integration
- 87% smaller CSS than class-based approach
- HSL color format for manipulation
- Light/Dark/System theme support

**Status:** Accepted
**Impact:** All colors defined as CSS variables, instant theme switching

---

## Quick Reference

### Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Angular 21 | Standalone components, signals, TypeScript-first |
| **Styling** | Tailwind CSS | Utility-first, small bundle (< 75KB) |
| **UI Components** | shadcn-angular | Accessible, customizable, Tailwind-based |
| **i18n** | @angular/localize | Compile-time, zero runtime cost |
| **State** | Signals + RxJS | Native, performant, Angular's future |
| **Animation** | Angular + GSAP | Simple transitions + advanced effects |
| **SSR** | Angular Universal | SEO, performance, social sharing |
| **Build** | esbuild (CLI) | Fast builds, tree-shaking |
| **Deployment** | Vercel/Netlify | Edge functions, CDN, automatic SSL |

---

### Performance Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| Lighthouse Performance | 95+ | 90 |
| First Contentful Paint | < 1.2s | 1.8s |
| Time to Interactive | < 2.5s | 3.8s |
| Initial JS Bundle | < 150KB | 200KB |
| Initial CSS Bundle | < 40KB | 75KB |
| Cumulative Layout Shift | < 0.1 | 0.25 |

---

### Project Structure Overview

```
roaya-website/
├── src/
│   ├── app/
│   │   ├── core/                    # Services, guards, models
│   │   ├── shared/                  # Shared components, directives
│   │   │   ├── components/
│   │   │   │   ├── ui/             # shadcn components
│   │   │   │   ├── layout/         # Header, footer
│   │   │   │   └── common/         # Loader, error
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/                # Page components (standalone)
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── portfolio/
│   │   │   └── contact/
│   │   └── layouts/                 # Layout wrappers
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── i18n/
│   └── styles/
├── angular.json
└── package.json
```

---

## Document Reading Order

### For Tech Lead / Architect
1. TECHNICAL_ARCHITECTURE.md (complete overview)
2. All ADRs (decision rationale)
3. TECHNOLOGY_RADAR.md (tech choices)
4. PERFORMANCE_STRATEGY.md (optimization plan)

### For Frontend Developer
1. IMPLEMENTATION_GUIDE.md (practical handbook)
2. TECHNICAL_ARCHITECTURE.md (sections 2, 3, 4, 5)
3. ADR-001, ADR-002, ADR-003 (key decisions)
4. PERFORMANCE_STRATEGY.md (optimization techniques)

### For DevOps Engineer
1. TECHNICAL_ARCHITECTURE.md (section 9: Build & Deployment)
2. PERFORMANCE_STRATEGY.md (monitoring setup)
3. IMPLEMENTATION_GUIDE.md (section 8: Deployment)

### For QA Engineer
1. TECHNICAL_ARCHITECTURE.md (section 11: Testing Strategy)
2. IMPLEMENTATION_GUIDE.md (section 7: Testing Guidelines)
3. PERFORMANCE_STRATEGY.md (performance testing)

---

## Key Architecture Decisions Summary

### 1. Standalone Components
- No NgModules, all components standalone
- Better tree-shaking, smaller bundles
- Simpler architecture

### 2. Compile-Time i18n
- @angular/localize with separate builds per locale
- Zero runtime overhead
- SEO-friendly URLs: `/` and `/ar/`

### 3. CSS Custom Properties for Theming
- Runtime theme switching
- shadcn integration
- < 5ms theme change

### 4. Signals for State Management
- Native Angular solution
- No external state library needed
- Excellent performance

### 5. SSR with Angular Universal
- Server-side rendering for all pages
- Better SEO and performance
- Social media preview support

### 6. Route-Based Code Splitting
- All pages lazy loaded
- Selective preloading strategy
- < 200KB initial bundle

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (English)
npm run dev:ar          # Start dev server (Arabic)

# Building
npm run build           # Development build
npm run build:prod      # Production build (all locales)
npm run build:ssr       # SSR build

# Testing
npm test                # Unit tests
npm run e2e             # E2E tests
npm run lint            # Lint code

# i18n
ng extract-i18n --output-path src/assets/i18n

# Analysis
npm run analyze         # Bundle size analysis
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Initialize project with Angular 21
- Setup Tailwind CSS and theme system
- Configure i18n
- Create project structure
- Setup core services

### Phase 2: Core Components (Week 3-4)
- Build shared UI components (shadcn)
- Implement layout components
- Setup SSR
- Configure deployment

### Phase 3: Features (Week 5-8)
- Develop all page components
- Implement animations
- Optimize assets
- Setup monitoring

### Phase 4: Polish & Launch (Week 9+)
- Performance optimization
- Comprehensive testing
- Production deployment
- Monitoring and iteration

---

## Performance Optimization Checklist

- [ ] Route-based lazy loading configured
- [ ] Images converted to WebP/AVIF
- [ ] Images lazy loaded with Intersection Observer
- [ ] Fonts optimized (variable fonts, preloading)
- [ ] Critical CSS inlined
- [ ] Bundle size within budget (< 200KB initial)
- [ ] Lighthouse score 95+
- [ ] Core Web Vitals optimized
- [ ] Third-party scripts loaded asynchronously
- [ ] Performance monitoring setup (RUM)

---

## Testing Strategy

### Unit Tests (70%)
- All services
- Pure functions and pipes
- Component logic (not templates)
- Run with: `npm test`

### Integration Tests (20%)
- Component + template + service integration
- User interactions
- Run with: `npm test`

### E2E Tests (10%)
- Critical user journeys
- Cross-browser testing
- Run with: `npm run e2e` (Playwright)

---

## Monitoring & Analytics

### Performance Monitoring
- Lighthouse CI (automated checks)
- Real User Monitoring (Web Vitals)
- Custom performance marks
- Bundle size tracking

### Analytics
- Google Analytics 4 (user behavior)
- Core Web Vitals (performance)
- Error tracking (Sentry - to be added)

---

## Security Measures

1. Content Security Policy (CSP)
2. HTTPS everywhere (automatic via Vercel)
3. Security headers (Helmet.js)
4. XSS protection (Angular sanitization)
5. Regular dependency audits (`npm audit`)
6. Input validation and sanitization

---

## Resources

### Documentation
- [Angular Docs](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [GSAP](https://greensock.com/docs/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org)
- [Playwright](https://playwright.dev)

### Learning
- [Web.dev](https://web.dev) - Performance
- [Patterns.dev](https://patterns.dev) - Design patterns

---

## Contact & Ownership

**Document Owner:** Tech Lead
**Review Frequency:** Weekly during development, monthly after launch
**Next Review:** 2025-12-12

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | Tech Lead | Initial architecture documentation |

---

**All Files Location:** `/Users/mohamedatef/Downloads/roaya/memory-bank/`

**Status:** Architecture Defined - Ready for Implementation
