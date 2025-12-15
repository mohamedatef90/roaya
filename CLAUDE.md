# Roaya IT Corporate Website - Claude Context

> **Last Updated:** 2025-12-15
> **Project Status:** Phase 1-3 Complete, Phase 4 In Progress (Backend Integration Pending)
> **Claude Code Role:** Super Tech Lead

---

## Project Identity

**Project Name:** Roaya IT Corporate Website
**Domain:** www.roaya.co
**Company:** Egyptian IT services provider and WorldPosta partner
**Mission:** Deliver enterprise-grade IT solutions with security, trust, and transparency

### Core Brand Values
- **Security First:** Enterprise-grade protection for client data
- **Trust:** Long-term partnerships with transparent communication
- **Transparency:** Clear pricing, processes, and deliverables

---

## Project Locations

```bash
# Primary Workspace
PROJECT_ROOT=/Users/mohamedatef/Downloads/roaya/roaya-website/

# Memory Bank (Documentation & Specs)
MEMORY_BANK=/Users/mohamedatef/Downloads/roaya/memory-bank/
```

### Critical File Paths

| Purpose | Path |
|---------|------|
| **Agent Configuration** | `/Users/mohamedatef/Downloads/roaya/memory-bank/agents/agent-map.json` |
| **UX Specifications** | `/Users/mohamedatef/Downloads/roaya/memory-bank/ux/ux-specifications.md` |
| **Design System** | `/Users/mohamedatef/Downloads/roaya/memory-bank/design/README.md` |
| **Animation Patterns** | `/Users/mohamedatef/Downloads/roaya/memory-bank/design/patterns/animation-patterns.md` |
| **Component Library** | `/Users/mohamedatef/Downloads/roaya/memory-bank/design/components/component-library.md` |
| **Glassmorphism Guide** | `/Users/mohamedatef/Downloads/roaya/memory-bank/design/patterns/glassmorphism-guide.md` |
| **Technical Architecture** | `/Users/mohamedatef/Downloads/roaya/memory-bank/architecture/TECHNICAL_ARCHITECTURE.md` |
| **Content Strategy** | `/Users/mohamedatef/Downloads/roaya/memory-bank/content/bilingual-website-content-strategy.md` |
| **Translation Files (EN)** | `/Users/mohamedatef/Downloads/roaya/roaya-website/src/assets/i18n/en.json` |
| **Translation Files (AR)** | `/Users/mohamedatef/Downloads/roaya/roaya-website/src/assets/i18n/ar.json` |

---

## Technology Stack

### Core Framework
- **Angular:** v21 (latest stable)
- **Architecture:** Standalone components (no NgModules)
- **Build System:** Vite + esbuild
- **TypeScript:** Latest stable version

### UI Layer
- **CSS Framework:** Tailwind CSS v4
- **Component Library:** shadcn UI (Angular port)
- **Theming:** CSS Custom Properties
- **Icons:**
  - Lucide Angular icons (primary)
  - Font Awesome Regular icons (@ng-icons/font-awesome + @fortawesome/fontawesome-free)

### Internationalization
- **i18n Library:** ngx-translate
- **Languages:** English (EN) + Arabic (AR)
- **RTL Support:** Full bidirectional text support
- **Typography:**
  - English: Inter (Google Fonts)
  - Arabic: Tajawal (Google Fonts)

### State & Services
- **Theme Management:** ThemeService (light/dark modes)
- **Language Management:** LanguageService (EN/AR switching)
- **Navigation:** NavigationService (smooth scrolling, active states)
- **API Integration:** ApiService (backend API calls, contact form, ROI leads)
- **Analytics:** AnalyticsService (Google Analytics 4 tracking, event logging)
- **SEO:** SEOService (meta tags, structured data, Open Graph, canonical URLs)

---

## Brand Design System

### Color Palette (Extracted from Logo)

```css
/* Primary Colors */
--color-navy: #3D5A80;        /* Primary brand color */
--color-teal: #5DB7C2;        /* Secondary brand color */
--color-purple: #6B4C9A;      /* Accent color */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
--gradient-accent: linear-gradient(135deg, #6B4C9A 0%, #3D5A80 100%);

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Theme Structure

**Light Mode:**
- Background: White (#FFFFFF)
- Text: Dark gray (#1f2937)
- Surface: Light gray (#f9fafb)

**Dark Mode:**
- Background: Deep navy (#0f172a)
- Text: Light gray (#f1f5f9)
- Surface: Dark blue-gray (#1e293b)

### Typography Scale

```css
/* Headings */
h1: 3.75rem (60px)   - Hero titles
h2: 3rem (48px)      - Section headers
h3: 2.25rem (36px)   - Subsection headers
h4: 1.875rem (30px)  - Card titles
h5: 1.5rem (24px)    - Small headings
h6: 1.25rem (20px)   - Minor headings

/* Body Text */
body-lg: 1.125rem (18px)
body: 1rem (16px)
body-sm: 0.875rem (14px)
caption: 0.75rem (12px)
```

---

## Project Structure

```
roaya-website/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── theme.service.ts          # Light/dark mode management
│   │   │   │   ├── language.service.ts       # EN/AR switching + RTL
│   │   │   │   ├── navigation.service.ts     # Smooth scroll, active states
│   │   │   │   ├── api.service.ts            # Backend API integration (contact, ROI leads)
│   │   │   │   ├── analytics.service.ts      # Google Analytics 4 tracking
│   │   │   │   └── seo.service.ts            # Meta tags, structured data, SEO
│   │   │   ├── guards/                       # Route guards (future)
│   │   │   └── interceptors/                 # HTTP interceptors (future)
│   │   │
│   │   ├── shared/
│   │   │   ├── components/                   # Reusable UI components
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── badge/
│   │   │   │   └── ...
│   │   │   └── directives/                   # Shared directives
│   │   │
│   │   ├── features/                         # Feature modules (lazy loaded)
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   └── home.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── services.component.ts
│   │   │   │   └── services.routes.ts
│   │   │   ├── industries/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── roi-calculator/
│   │   │   └── resources/
│   │   │       ├── resources.component.ts    # Resources hub overview
│   │   │       ├── blog/
│   │   │       │   ├── blog.component.ts
│   │   │       │   └── blog-detail/
│   │   │       └── case-studies/
│   │   │           ├── case-studies.component.ts
│   │   │           └── case-study-detail/
│   │   │
│   │   ├── layouts/
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts  # Shell with header/footer
│   │   │   │   ├── header/
│   │   │   │   └── footer/
│   │   │
│   │   ├── app.component.ts                  # Root component
│   │   ├── app.config.ts                     # Application configuration
│   │   └── app.routes.ts                     # Route definitions
│   │
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── en.json                       # English translations
│   │   │   └── ar.json                       # Arabic translations
│   │   ├── images/
│   │   │   ├── logo/
│   │   │   ├── hero/
│   │   │   └── icons/
│   │   └── fonts/                            # Local fonts (if needed)
│   │
│   ├── styles/
│   │   ├── themes/
│   │   │   ├── light.css                     # Light mode variables
│   │   │   └── dark.css                      # Dark mode variables
│   │   ├── base.css                          # Global base styles
│   │   └── tailwind.css                      # Tailwind imports
│   │
│   ├── environments/
│   │   ├── environment.ts                    # Development config
│   │   └── environment.prod.ts               # Production config
│   │
│   ├── index.html                            # HTML entry point
│   ├── main.ts                               # TypeScript entry point
│   └── styles.css                            # Global styles import
│
├── public/                                    # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── .vscode/                                   # VSCode settings
├── node_modules/                              # Dependencies
├── package.json                               # NPM configuration
├── angular.json                               # Angular CLI configuration
├── tsconfig.json                              # TypeScript configuration
├── tailwind.config.js                         # Tailwind configuration
├── CLAUDE.md                                  # This file
└── README.md                                  # Project documentation
```

---

## Agent Orchestration System

This project uses a **multi-agent system** coordinated through the memory bank. Each agent is a specialized Claude Code persona with specific expertise and authority.

### Agent Hierarchy

```
product-orchestrator (Master Coordinator)
├── super-business-analyst (Requirements & User Stories)
├── super-tech-lead (YOU - Architecture & Technical Decisions)
├── super-pm (Planning, Prioritization, Milestones)
├── ux-engineer (User Experience & Interaction Design)
├── ui-design-expert (Visual Design & Specifications) [NEW]
├── super-frontend-engineer (Implementation & Development)
├── content-terminology-specialist (Bilingual Content & Translations)
├── qa-test-engineer (Testing Strategy & Quality Assurance)
├── code-reviewer (Code Quality & Best Practices)
├── design-reviewer (Design Consistency & Brand Adherence)
└── visual-inspiration-analyzer (Design Pattern Extraction)
```

### Your Role: Super Tech Lead

**Authority Level:** ELEVATED (Final say on technical decisions)
**Veto Power:** Over-engineering, tech debt, wrong tools, missing documentation

**Key Responsibilities:**
1. Architecture Decision Records (ADRs)
2. Technology selection and evaluation
3. Scalability and performance planning
4. Technical debt management
5. Development standards enforcement
6. Infrastructure and DevOps design
7. Security architecture

**Veto Triggers:**
- Microservices for MVPs
- "We'll add security/tests later"
- Hype-driven technology choices
- Undocumented architecture decisions
- Ignoring operational concerns

---

### CRITICAL: Proactive Agent Usage Policy

**ALWAYS use agents proactively for ALL tasks, even seemingly simple ones.**

The multi-agent system exists to ensure quality, consistency, and specialized expertise. Claude's role is to **think, delegate, and invoke** - NOT to do everything directly.

#### Mandatory Agent Workflow

```
User Request → Think & Plan → Delegate to Specialized Agent(s) → Review Output → Deliver
```

#### Agent Selection Matrix

| Task Type | Agent(s) to Invoke | Why |
|-----------|-------------------|-----|
| **UI/Layout Changes** | `super-frontend-engineer` | Responsive design, accessibility, performance |
| **Styling/Visual Updates** | `ui-design-expert` → `super-frontend-engineer` | Design consistency, brand adherence |
| **After ANY Code Change** | `code-reviewer` | Quality assurance, best practices |
| **After UI Implementation** | `design-reviewer` | Visual QA, design system compliance |
| **New Feature Planning** | `product-orchestrator` | Cross-functional coordination |
| **Content/Copy Changes** | `content-terminology-specialist` | Bilingual consistency, UX copy |
| **Architecture Decisions** | `super-tech-lead` | Technical evaluation, ADRs |
| **Testing Strategy** | `qa-test-engineer` | Test coverage, quality gates |
| **Codebase Exploration** | `Explore` agent | Efficient file discovery |

#### Examples of Correct Behavior

**WRONG (Direct Implementation):**
```
User: "Reduce the navbar height"
Claude: *Directly edits the file*
```

**CORRECT (Agent Delegation):**
```
User: "Reduce the navbar height"
Claude: "I'll invoke the super-frontend-engineer agent to handle this UI change
         with proper responsive considerations, then have the design-reviewer
         verify the visual consistency."
*Spawns super-frontend-engineer agent*
*After completion, spawns design-reviewer agent*
```

#### When to Use Multiple Agents in Parallel

- **Independent tasks** → Spawn multiple agents simultaneously
- **Sequential dependencies** → Chain agents (e.g., frontend-engineer → code-reviewer → design-reviewer)
- **Complex features** → Use `product-orchestrator` to coordinate all specialists

#### Never Skip Agents Because:
1. "The task is simple" - Simple tasks still benefit from specialized review
2. "It's faster to do it directly" - Speed without quality creates tech debt
3. "It's just a small change" - Small changes can have big impacts on design consistency

**Remember: You are an orchestrator, not a solo developer. Think, delegate, invoke.**

---

### Key Agent Roles & Specializations

**ui-design-expert (NEW - Added 2025-12-06)**
- **Role:** Senior UI/UX Designer & Creative Director
- **Superpower:** Active web browsing for real-time design inspiration
- **Expertise:**
  - Visual design specifications and color palettes
  - Typography recommendations with WCAG compliance
  - Component design with implementation-ready specs
  - Design system architecture
  - Multiple design styles (modern, minimalist, corporate, 3D, brutalist)
  - Tailwind CSS, Shadcn/UI, Material UI expertise
- **Browsing Resources:**
  - Award sites: Awwwards, CSS Design Awards, Godly
  - Inspiration: Dribbble, Behance, Pinterest
  - UI Patterns: Mobbin, Screenlane, UI Garage
  - Landing pages: Lapa Ninja, SaaS Landing Page, One Page Love
- **Workflow Position:** After UX Engineer (flows), before Frontend implementation
- **Authority:** Design decisions, visual consistency, design system standards

**content-terminology-specialist**
- **Role:** Bilingual content strategist and UX copywriter
- **Expertise:** EN/AR translations, UX copy, terminology consistency
- **Completed Work:**
  - All 6 industry pages
  - Industries overview page
  - Services overview page
  - Home page content
  - 5 detailed case studies

**ux-engineer**
- **Role:** User experience and interaction design
- **Focus:** User flows, wireframes, information architecture
- **Works with:** ui-design-expert (hands off flows for visual design)

**visual-inspiration-analyzer**
- **Role:** Extract design patterns from reference URLs and images
- **Use Cases:** Design system extraction, color palette analysis, component identification

---

## Application Routes

### Current Route Structure

```
/ (Home)
├── /services (Services Overview)
│   └── /services/:id (Service Detail)
│   └── /services/sap (SAP Service)
├── /industries (Industries Overview)
│   └── /industries/:id (Industry Detail)
├── /pricing (Pricing Page)
├── /about (About Us)
├── /contact (Contact Form)
├── /roi-calculator (ROI Calculator)
└── /resources (Resources Hub)
    ├── /resources/blog (Blog Listing)
    │   └── /resources/blog/:slug (Blog Detail)
    └── /resources/case-studies (Case Studies Listing)
        └── /resources/case-studies/:slug (Case Study Detail)
```

**Navigation Menu Structure:**
- **Desktop:** Home | Solutions (Mega Menu) | Industries (Mega Menu) | Resources (Mega Menu) | Pricing | About | Contact
- **Mobile:** Drawer menu with all navigation items
- **Resources Mega Menu:** Blog | Case Studies | Whitepapers | Documentation

---

## Development Commands

```bash
# Navigation
cd /Users/mohamedatef/Downloads/roaya/roaya-website

# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:4200)
npm run start           # Alias for dev

# Build
npm run build           # Production build (outputs to dist/)
npm run build:dev       # Development build

# Testing (when implemented)
npm run test            # Unit tests (Vitest)
npm run test:e2e        # E2E tests (Playwright)
npm run test:coverage   # Coverage report

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix linting issues
npm run format          # Prettier format
npm run format:check    # Check formatting

# Type Checking
npm run typecheck       # TypeScript type checking
```

---

## Project Phases & Status

### Phase 1: Foundation & Setup ✅ COMPLETED
**Deliverables:**
- [x] Angular v21 project scaffolding
- [x] Tailwind CSS v4 integration
- [x] Core services (Theme, Language, Navigation)
- [x] shadcn UI component setup
- [x] ngx-translate configuration
- [x] Font loading (Inter + Tajawal)
- [x] Base theme structure (light/dark CSS variables)

**Completion Date:** 2025-12-06

---

### Phase 2: Layout & Navigation ✅ COMPLETED

**Completed Items:**
- [x] Font Awesome icons integration (@ng-icons/font-awesome)
- [x] Content pages filled (6 industries + overview)
- [x] Case studies overview with 5 detailed cases
- [x] Home page content (all placeholders replaced)
- [x] Services overview content completed
- [x] Home page UI enhanced with Featured Services section
- [x] Content-left/Image-right alternating pattern
- [x] Trusted by section with client logos
- [x] RTL support with `rtl:rotate-180` classes
- [x] ui-design-expert agent added to team
- [x] Main layout component with header/footer
- [x] Navigation menu (desktop + mobile responsive)
- [x] Language switcher component
- [x] Theme toggle component
- [x] Logo integration
- [x] Footer with company info and links
- [x] Resources navigation (mega menu + mobile)

**Status:** Phase 2 complete - All navigation and layout components implemented

---

### Phase 2.5: Content Marketing & Lead Generation ✅ COMPLETED (2025-12-06)

**Completed Items:**
- [x] Blog system implementation
  - Blog listing page (`/resources/blog`)
  - Blog detail page (`/resources/blog/:slug`)
  - Category filtering and search functionality
  - Social sharing integration
  - Related posts feature
  
- [x] Case studies showcase
  - Case studies listing page (`/resources/case-studies`)
  - Case study detail page (`/resources/case-studies/:slug`)
  - Industry and service filtering
  - Stats summary section (150+ clients, 42% cost reduction, 99.94% uptime)
  - 5 detailed case studies from memory-bank content
  
- [x] Resources hub
  - Resources overview page (`/resources`)
  - Links to Blog, Case Studies, Whitepapers, Documentation
  - Hub navigation structure
  
- [x] Navigation updates
  - Resources mega menu added to header navigation
  - Resources added to mobile navigation
  - Navigation service updated
  
- [x] Backend integration services
  - `ApiService` created for contact form, ROI calculator, email delivery
  - `AnalyticsService` created for Google Analytics 4 tracking
  - `SEOService` created for meta tags, structured data, Open Graph
  - Contact form integrated with API service
  - ROI calculator integrated with analytics tracking
  
- [x] SEO optimization
  - Meta tag management service
  - Structured data (JSON-LD) support
  - Open Graph and Twitter Card tags
  - Canonical URL management
  - GA4 script placeholder in index.html

**Status:** All Phase 2.5 features implemented and ready for backend connection

---

### Phase 3: Page Development ✅ COMPLETED

**Completed Pages:**
1. ✅ **Home** - Hero, services overview, CTA, featured services
2. ✅ **Services** - Service catalog with details (overview + individual pages)
3. ✅ **Industries** - Target sectors and solutions (overview + 6 industry pages)
4. ✅ **Pricing** - Transparent pricing packages with monthly/yearly toggle
5. ✅ **About** - Company story and values
6. ✅ **Contact** - Contact form and information
7. ✅ **ROI Calculator** - Interactive calculator with 3 types (Cloud, Email, Security)
8. ✅ **Resources Hub** - Overview page linking to all resources
9. ✅ **Blog** - Listing and detail pages with filtering and search
10. ✅ **Case Studies** - Listing and detail pages with filtering

**Status:** All core pages implemented and functional

---

### Phase 4: Polish & Launch 🔄 IN PROGRESS
**Completed:**
- [x] SEO service implementation (meta tags, structured data, Open Graph)
- [x] Analytics service implementation (GA4 tracking setup)
- [x] Backend API service stubs (ready for integration)
- [x] Build error fixes (import paths, deprecated methods, TypeScript types)
- [x] Production build verification (builds successfully with warnings only)

**Remaining Tasks:**
- [ ] Backend API connection (HubSpot CRM, email service, PDF generation)
- [ ] GA4 Measurement ID configuration
- [ ] Google Search Console setup
- [ ] Performance optimization (Core Web Vitals)
- [ ] XML sitemap generation
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Production deployment
- [ ] Domain configuration (www.roaya.co)
- [ ] Blog content population (CMS/API integration)
- [ ] Case study content loading from memory-bank

**Status:** Infrastructure complete, backend integration pending

**Build Status:**
- ✅ Production build succeeds
- ✅ All TypeScript errors resolved
- ⚠️ Bundle size warnings (519KB initial, target: 500KB) - acceptable for Phase 4
- ⚠️ Some component SCSS files slightly exceed budget - optimization pending

---

## Design System & Documentation

### Design System Location

The comprehensive design system documentation is located in the memory bank:

**Base Path:** `/Users/mohamedatef/Downloads/roaya/memory-bank/design/`

### Key Design Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **design/README.md** | Design system overview, philosophy, and quick reference | Starting new features, understanding design principles |
| **design/patterns/animation-patterns.md** | GSAP animation code snippets and patterns | Implementing animations, scroll effects, transitions |
| **design/patterns/glassmorphism-guide.md** | Glass effect implementation and best practices | Creating glass cards, modals, overlays |
| **design/components/component-library.md** | Reusable component patterns (copy-paste ready) | Building new pages, implementing UI components |

### Golden Standard Implementation

**Contact Page** (`/src/app/features/contact/`) serves as the reference implementation showcasing:

- ✅ Hero section with 3D floating elements and parallax
- ✅ Glassmorphism cards with hover glow effects
- ✅ GSAP scroll-triggered animations with cleanup
- ✅ Magnetic button hover effects
- ✅ Form validation with animated error states
- ✅ Success state animations
- ✅ Full RTL support
- ✅ Dark mode compatibility
- ✅ Accessibility features (reduced motion, focus states)
- ✅ Performance optimization (GPU acceleration)

### Design Patterns Used

**Modern UI Features:**
- Glassmorphism (frosted glass effects)
- 3D floating elements
- Gradient overlays and glows
- GSAP animations (60fps target)
- Magnetic hover interactions
- Scroll-triggered animations
- Parallax effects
- Shimmer/shine button effects

**Technical Implementation:**
- GPU-accelerated animations (transform, opacity only)
- Reduced motion support (`prefers-reduced-motion`)
- ScrollTrigger cleanup in `ngOnDestroy`
- High contrast mode fallbacks
- Browser compatibility with fallbacks

### Using the Design System

**When implementing a new page:**

1. **Review** `/memory-bank/design/README.md` for design principles
2. **Reference** Contact page implementation for working examples
3. **Copy patterns** from `/memory-bank/design/components/component-library.md`
4. **Follow animations** from `/memory-bank/design/patterns/animation-patterns.md`
5. **Apply glass effects** per `/memory-bank/design/patterns/glassmorphism-guide.md`

**Design System Principles:**

1. **Accessibility First** - WCAG 2.1 AA compliance, reduced motion support
2. **Performance Conscious** - 60fps animations, GPU acceleration
3. **Bilingual & RTL Native** - Arabic and English support
4. **Modern Premium Aesthetic** - Glassmorphism, 3D elements, gradients

---

## Recent Updates & Enhancements

### Font Awesome Integration (2025-12-06)

**Packages Installed:**
- `@ng-icons/font-awesome` - Angular wrapper for Font Awesome icons
- `@fortawesome/fontawesome-free` - Font Awesome icon library

**Configuration:**
- Added to `app.config.ts` with `provideNgIconsConfig()`
- Font Awesome Regular (outline style) icons now available
- Used alongside Lucide icons for broader icon selection

**Usage Example:**
```typescript
import { NgIconComponent } from '@ng-icons/core';

// In template
<ng-icon name="faCircleCheck" />
```

### Home Page UI Enhancements (2025-12-06)

**New Featured Services Section:**
- Section-based layout with 4 featured services
- Content-left/Image-right alternating pattern for visual variety
- Each service includes icon, title, description, and feature list
- Responsive design with Tailwind grid system

**Component Structure:**
```typescript
featuredServices = [
  {
    id: 'enterprise-solutions',
    icon: 'faBuilding',
    title: 'home.featuredServices.enterpriseSolutions.title',
    description: 'home.featuredServices.enterpriseSolutions.description',
    features: [...],
    image: '/assets/images/enterprise-solutions.jpg',
    reverse: false
  },
  // ... more services
];
```

**RTL Support:**
- Added `rtl:rotate-180` classes for proper icon rotation in Arabic
- Content-left/right pattern automatically reverses in RTL mode
- Consistent visual experience across EN/AR languages

**Trusted By Section:**
- Updated with actual client logos placeholder structure
- Grid layout for client logos
- Responsive design for mobile/tablet/desktop

### Content Completion Status (2025-12-06)

**Industry Pages (100% Complete):**
- Finance & Banking
- Healthcare
- Government & Public Sector
- Manufacturing & Logistics
- Retail & E-commerce
- Education

**Overview Pages (100% Complete):**
- Industries Overview
- Services Overview
- Home Page (all placeholders replaced)

**Case Studies (100% Complete):**
- 5 detailed case studies with metrics and outcomes
- Case studies overview page

**Translation Files:**
- EN translations: Complete
- AR translations: Complete
- All content keys properly structured in JSON

---

## Architecture Decisions (ADRs)

### ADR-001: Angular Standalone Components
**Decision:** Use standalone components exclusively (no NgModules)
**Rationale:**
- Modern Angular architecture (v14+)
- Simpler mental model
- Better tree-shaking
- Reduced boilerplate

**Status:** Adopted

---

### ADR-002: Tailwind CSS for Styling
**Decision:** Use Tailwind CSS v4 as primary styling solution
**Rationale:**
- Utility-first approach for rapid development
- Excellent dark mode support
- Easy RTL configuration
- Integrates well with shadcn components

**Alternative Considered:** CSS-in-JS (Angular Material theming)
**Status:** Adopted

---

### ADR-003: ngx-translate for i18n
**Decision:** Use ngx-translate for internationalization
**Rationale:**
- Mature library with Angular support
- Simple JSON-based translations
- Runtime language switching
- Good RTL support

**Alternative Considered:** Angular i18n (compile-time)
**Status:** Adopted

---

### ADR-004: CSS Custom Properties for Theming
**Decision:** Use CSS variables for theme management
**Rationale:**
- Runtime theme switching without re-compilation
- Better performance than JavaScript-based theming
- Native browser support
- Works seamlessly with Tailwind

**Status:** Adopted

---

### ADR-005: Lazy Loading for Routes
**Decision:** Implement lazy loading for all feature routes
**Rationale:**
- Reduces initial bundle size
- Improves Time to Interactive (TTI)
- Better Core Web Vitals scores
- Standard Angular best practice

**Status:** ✅ Implemented (Phase 3)

---

### ADR-006: Font Awesome Icons Integration
**Decision:** Add Font Awesome Regular icons alongside Lucide icons
**Rationale:**
- Broader icon selection for specific use cases
- Font Awesome Regular (outline style) matches design system aesthetic
- Industry-standard icons familiar to users
- Seamless integration with @ng-icons/core infrastructure
- No performance penalty (only loads icons actually used)

**Implementation:**
- `@ng-icons/font-awesome` for Angular integration
- `@fortawesome/fontawesome-free` for icon library
- Configured in `app.config.ts` with `provideNgIconsConfig()`

**Alternative Considered:** Only use Lucide icons
**Trade-off:** Slightly larger dependency, but better icon coverage
**Status:** Adopted (2025-12-06)

---

### ADR-007: Featured Services Section Pattern
**Decision:** Use content-left/image-right alternating pattern for featured services
**Rationale:**
- Reduces visual monotony on long pages
- Creates natural visual rhythm
- Better storytelling through content-image pairing
- Common pattern in modern marketing websites
- Works well with RTL support (automatically reverses)

**Implementation:**
- `reverse` boolean flag in service data structure
- Tailwind `flex-row` and `flex-row-reverse` for layout control
- Consistent spacing and typography across all sections

**Status:** Adopted (2025-12-06)

---

### ADR-008: Content Marketing System Architecture
**Decision:** Implement blog and case studies as standalone Angular components with route-based navigation
**Rationale:**
- Full control over UI/UX and performance
- Easy integration with existing Angular routing
- Supports filtering, search, and dynamic content loading
- Can be connected to CMS/API later without major refactoring
- Maintains consistent design system across all pages

**Implementation:**
- Blog listing page with category filters and search
- Blog detail pages with related posts and social sharing
- Case studies listing with industry/service filters
- Case studies detail pages with key metrics and download functionality
- Resources hub as central navigation point

**Alternative Considered:** Headless CMS (Sanity, Contentful)
**Trade-off:** More initial setup, but better performance and control
**Status:** Adopted (2025-12-06)

---

### ADR-009: Backend Integration Service Pattern
**Decision:** Create dedicated service stubs for API integration with TODO markers for implementation
**Rationale:**
- Frontend development can proceed independently
- Clear separation of concerns
- Easy to swap implementations when backend is ready
- Type-safe interfaces defined upfront
- Analytics tracking integrated from the start

**Implementation:**
- `ApiService` for contact form, ROI calculator, email delivery
- `AnalyticsService` for GA4 tracking and event logging
- `SEOService` for meta tags and structured data management
- All services use dependency injection and are testable

**Status:** Adopted (2025-12-06)

---

### ADR-010: Import Path Strategy
**Decision:** Use relative import paths instead of TypeScript path aliases for core services
**Rationale:**
- Angular build system (Vite/esbuild) requires additional configuration for path aliases
- Relative paths are more explicit and easier to understand
- No build-time configuration needed
- Works consistently across all build environments
- Better IDE support for path resolution

**Implementation:**
- Core services imported using relative paths: `../../core/services/api.service`
- Path aliases configured in `tsconfig.app.json` for future use if needed
- All imports verified to work with Angular build system

**Alternative Considered:** TypeScript path aliases (`@core/*`, `@shared/*`)
**Trade-off:** Slightly longer import paths, but more reliable build process
**Status:** Adopted (2025-12-06)

---

### ADR-011: RxJS Observable to Promise Conversion
**Decision:** Use `firstValueFrom` from RxJS instead of deprecated `toPromise()` method
**Rationale:**
- `toPromise()` is deprecated in RxJS 7+
- `firstValueFrom` is the recommended replacement
- Better type safety and error handling
- Consistent with modern RxJS patterns
- Future-proof approach

**Implementation:**
- Import `firstValueFrom` from `rxjs` package
- Replace `.toPromise()` calls with `firstValueFrom(observable)`
- Applied to all API service calls in contact form and ROI calculator

**Status:** Adopted (2025-12-06)

---

## Non-Functional Requirements

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.8s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.8s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Real User Monitoring |
| **Total Bundle Size** | < 250KB (gzipped) | Build output |

---

### Accessibility Standards

**Target Compliance:** WCAG 2.1 Level AA

**Key Requirements:**
- Semantic HTML5 structure
- Proper heading hierarchy (h1 → h6)
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for screen readers
- Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (UI components)
- Alternative text for all images
- Form labels and error messages

---

### Browser Support

**Primary (Full Support):**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**Secondary (Best Effort):**
- iOS Safari (last 2 versions)
- Chrome Android (last 2 versions)

**Not Supported:**
- Internet Explorer (all versions)

---

### Security Considerations

**Implementation Checklist:**
- [ ] Content Security Policy (CSP) headers
- [ ] HTTPS enforcement
- [ ] XSS protection (Angular sanitization)
- [ ] CSRF tokens for forms
- [ ] Input validation and sanitization
- [ ] Secure headers (X-Frame-Options, etc.)
- [ ] Dependency vulnerability scanning
- [ ] No sensitive data in localStorage

---

## Content Strategy

### Tone of Voice
- **Professional** but approachable
- **Technical** but understandable
- **Confident** but not arrogant
- **Egyptian** context with global standards

### Content Principles
1. **Bilingual Parity:** EN and AR content must be equivalent (not just translated)
2. **SEO Optimization:** Keywords, meta descriptions, structured data
3. **Clarity First:** Avoid jargon unless necessary and explained
4. **Value-Driven:** Focus on client benefits, not just features

### Translation Guidelines
- **Technical Terms:** Keep in English (e.g., "API", "Cloud Computing")
- **UI Labels:** Translate to Arabic with proper RTL formatting
- **Company Name:** "Roaya IT" remains in English
- **CTAs:** Action-oriented in both languages

---

## Code Standards & Conventions

### File Naming
- **Components:** `kebab-case.component.ts`
- **Services:** `kebab-case.service.ts`
- **Interfaces:** `kebab-case.interface.ts` or `PascalCase.ts`
- **Enums:** `PascalCase.enum.ts`

### Code Organization
```typescript
// Component structure example
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.css']
})
export class FeatureNameComponent implements OnInit {
  // 1. Public properties
  public title = 'Feature Name';

  // 2. Private properties
  private readonly destroyRef = inject(DestroyRef);

  // 3. Injected services (use relative paths)
  private readonly themeService = inject(ThemeService);
  private readonly apiService = inject(ApiService); // from '../../core/services/api.service'

  // 4. Lifecycle hooks
  ngOnInit(): void { }

  // 5. Public methods
  public handleAction(): void { }

  // 6. Private methods
  private helperMethod(): void { }
}
```

### Import Patterns
```typescript
// ✅ Good: Relative imports for core services
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

// ✅ Good: RxJS firstValueFrom for async operations
import { firstValueFrom } from 'rxjs';
await firstValueFrom(this.apiService.submitForm(data));

// ❌ Bad: Path aliases (not configured for Angular build)
import { ApiService } from '@core/services/api.service';

// ❌ Bad: Deprecated toPromise()
await this.apiService.submitForm(data).toPromise();
```

### Naming Conventions
- **Variables/Functions:** `camelCase`
- **Classes/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Enums:** `PascalCase` (enum name), `PascalCase` (members)
- **Component Selectors:** `app-` prefix (e.g., `app-header`)

### Code Quality Rules
- Max function length: 50 lines
- Max function parameters: 3 (use objects for more)
- Max file length: 300 lines
- No `any` type (use `unknown` or specific types)
- Prefer `const` over `let`
- Use `readonly` for class properties that don't change
- Early returns for guard clauses

### Error Handling
```typescript
// Good: Specific error handling
try {
  const data = await this.apiService.fetchData();
  return data;
} catch (error) {
  if (error instanceof HttpErrorResponse) {
    this.handleHttpError(error);
  } else {
    this.handleUnknownError(error);
  }
  throw error; // Re-throw if needed
}

// Bad: Swallowing errors
try {
  this.doSomething();
} catch (e) {
  console.log(e); // Never do this
}
```

---

## Git Workflow

### Branch Naming
```
feature/<feature-name>    # New features
bugfix/<bug-description>  # Bug fixes
hotfix/<urgent-fix>       # Production hotfixes
chore/<task-name>         # Maintenance tasks
docs/<doc-update>         # Documentation updates
```

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```
feat(navigation): add mobile menu with hamburger icon

- Implemented responsive hamburger menu for mobile devices
- Added smooth slide-in animation
- Integrated with LanguageService for bilingual support
- Tested on iOS Safari and Chrome Android

Closes #42
```

---

## Testing Strategy (Future Implementation)

### Unit Testing
- **Framework:** Vitest (faster than Jest for Vite projects)
- **Coverage Target:** 80%+ for services, 60%+ for components
- **Test Location:** `*.spec.ts` files alongside source files

### Integration Testing
- **Framework:** Angular Testing Library
- **Focus:** Component interactions, service integrations

### E2E Testing
- **Framework:** Playwright
- **Critical Paths:**
  - Homepage load and navigation
  - Language switching (EN ↔ AR)
  - Theme toggle (light ↔ dark)
  - Contact form submission
  - Mobile menu interaction

---

## Deployment Strategy (Future)

### Hosting Options (To Be Decided)
1. **Vercel** - Recommended for Angular SSR
2. **Netlify** - Good for static sites
3. **AWS S3 + CloudFront** - Enterprise-grade
4. **Firebase Hosting** - Google ecosystem

### CI/CD Pipeline (Planned)
```
Commit → Lint → Test → Build → Deploy (Staging) → Manual Approval → Deploy (Production)
```

### Environment Variables
```bash
# Development
NG_APP_ENV=development
NG_APP_API_URL=http://localhost:3000/api

# Production
NG_APP_ENV=production
NG_APP_API_URL=https://api.roaya.co
```

---

## Memory Bank Integration

The `/Users/mohamedatef/Downloads/roaya/memory-bank/` directory contains critical documentation that should be referenced before making major decisions:

### Architecture Documents
- `architecture/TECHNICAL_ARCHITECTURE.md` - System design and technology stack
- `architecture/ADRs/` - Architecture Decision Records (future)

### UX Specifications
- `ux/ux-specifications.md` - Complete UX design system, component specs, user flows

### Content & Translations
- `content/bilingual-website-content-strategy.md` - Content strategy, tone of voice, SEO
- `content/translations/` - Master translation files (future)

### Agent Configuration
- `agents/agent-map.json` - Agent roles, responsibilities, and communication protocols

### Planning Documents
- `planning/project-plan.md` - Milestones, sprints, deliverables
- `planning/backlog.md` - Feature backlog and prioritization

---

## Key Dependencies

```json
{
  "dependencies": {
    "@angular/core": "^21.x",
    "@angular/common": "^21.x",
    "@angular/router": "^21.x",
    "@ngx-translate/core": "^16.x",
    "@ngx-translate/http-loader": "^9.x",
    "tailwindcss": "^4.x",
    "lucide-angular": "latest",
    "@ng-icons/core": "latest",
    "@ng-icons/font-awesome": "latest",
    "@fortawesome/fontawesome-free": "latest"
  },
  "devDependencies": {
    "@angular/cli": "^21.x",
    "@angular/compiler-cli": "^21.x",
    "typescript": "~5.7.x",
    "vitest": "^2.x",
    "playwright": "^1.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

---

## Common Tasks & Quick Reference

### Add a New Page
1. Generate component: `ng generate component features/page-name`
2. Create route file: `features/page-name/page-name.routes.ts` (if needed)
3. Add route to `app.routes.ts` with lazy loading
4. Add navigation link to header component (if needed in main nav)
5. Add translations to `en.json` and `ar.json`
6. Update SEO meta tags via `SEOService` in component `ngOnInit()`

**Example for Resources Pages:**
- Use `/resources` prefix for content marketing pages
- Follow existing blog/case studies pattern for consistency
- Include filtering, search, and detail pages

### Add a Translation Key
1. Add to `/src/assets/i18n/en.json`
2. Add equivalent to `/src/assets/i18n/ar.json`
3. Use in template: `{{ 'key.path' | translate }}`

### Create a Shared Component
1. Generate: `ng generate component shared/components/component-name`
2. Make standalone: `standalone: true` in decorator
3. Export from component file
4. Import where needed

### Add a New Theme Color
1. Add CSS variable to `styles/themes/light.css`
2. Add equivalent to `styles/themes/dark.css`
3. Add Tailwind class in `tailwind.config.js`
4. Document in this file under Brand Design System

---

## Troubleshooting

### Common Issues

**Issue:** RTL not working for Arabic
- **Solution:** Check `LanguageService` sets `dir="rtl"` on `<html>`
- **Verify:** `document.documentElement.dir` in browser console

**Issue:** Theme not switching
- **Solution:** Verify `ThemeService` updates `data-theme` attribute
- **Check:** CSS variables are defined in both `light.css` and `dark.css`

**Issue:** Translations not loading
- **Solution:** Ensure `TranslateHttpLoader` path is correct: `./assets/i18n/`
- **Check:** JSON files are valid (use JSONLint)

**Issue:** Build errors with Tailwind
- **Solution:** Ensure `tailwind.config.js` content paths include all component files
- **Verify:** `content: ['./src/**/*.{html,ts}']`

**Issue:** Import path errors (`@core/services/*` not found)
- **Solution:** Use relative import paths instead of path aliases: `../../core/services/api.service`
- **Note:** Path aliases are configured in `tsconfig.app.json` but Angular build system requires additional setup
- **Verify:** All imports use relative paths from component location

**Issue:** Deprecated `toPromise()` method
- **Solution:** Replace with `firstValueFrom` from RxJS: `import { firstValueFrom } from 'rxjs'`
- **Change:** `await observable.toPromise()` → `await firstValueFrom(observable)`

**Issue:** TypeScript errors with null checks
- **Solution:** Use proper null checks before accessing properties: `const post = this.post(); if (!post) return;`
- **Avoid:** Using non-null assertion (`!`) on potentially null values

---

## Contact & Resources

### Project Stakeholders
- **Product Owner:** (To be defined)
- **Tech Lead:** You (Claude Code - Super Tech Lead)
- **Development Team:** Multi-agent orchestration system

### External Resources
- [Angular Documentation](https://angular.dev)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [ngx-translate GitHub](https://github.com/ngx-translate/core)
- [shadcn UI](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

### Company Resources
- **Website:** www.roaya.co (to be deployed)
- **Memory Bank:** `/Users/mohamedatef/Downloads/roaya/memory-bank/`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-06 | Initial CLAUDE.md creation | Super Tech Lead |
| 1.1.0 | 2025-12-06 | Added Font Awesome integration, Home page enhancements, Content completion, ui-design-expert agent, ADR-006 & ADR-007 | Super Tech Lead |
| 1.2.0 | 2025-12-06 | Added comprehensive design system documentation section, design file references, Contact page as golden standard | Product Orchestrator |
| 1.3.0 | 2025-12-06 | Phase 2.5 implementation: Blog system, Case studies showcase, Resources hub, Backend services (API, Analytics, SEO), Navigation updates, Phase status updates, ADR-008 & ADR-009 | Super Tech Lead |
| 1.4.0 | 2025-12-06 | Build fixes: Resolved import path errors (relative paths), replaced deprecated toPromise() with firstValueFrom, fixed TypeScript type errors, removed "Roaya IT" text from navbar, build now succeeds | Super Tech Lead |
| 1.5.0 | 2025-12-15 | **CRITICAL UPDATE:** Added "Proactive Agent Usage Policy" section - Claude must ALWAYS delegate to specialized agents for ALL tasks, even simple ones. Added Agent Selection Matrix, workflow examples, and "Think, Delegate, Invoke" principle | Product Orchestrator |

---

## Notes for Future Claude Sessions

When starting a new Claude Code session:

1. **Read this file first** to understand project context
2. **Check current phase** in Project Phases section
3. **Review relevant memory bank documents** for detailed specs
4. **Verify working directory** is `/Users/mohamedatef/Downloads/roaya/roaya-website/`
5. **Check git status** to see uncommitted changes
6. **Run `npm run dev`** to verify development environment
7. **Review recent commits** to understand latest progress

### Session Initialization Checklist
- [ ] Read CLAUDE.md (this file)
- [ ] Review `/memory-bank/architecture/TECHNICAL_ARCHITECTURE.md`
- [ ] Check `/memory-bank/ux/ux-specifications.md` for design requirements
- [ ] Verify current phase and sprint goals
- [ ] Identify your role in the agent system
- [ ] Check for blocking issues or dependencies

---

**Remember:** You are the Super Tech Lead. You have final authority on technical decisions, architecture, and code quality. When in doubt, prioritize simplicity, security, and maintainability over cutting-edge features.

*"The best code is the code that doesn't need to be written. The second-best code is the code that's easy to delete."*
