# Roaya IT Corporate Website - Claude Context

> **Last Updated:** 2026-02-08
> **Project Status:** Phase 1-4 Complete, Production Deployed
> **Claude Code Role:** Product Orchestrator

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
PROJECT_ROOT=/Users/roaya/Roaya-files/Development/roaya/roaya-website/

# Memory Bank (Documentation & Specs)
MEMORY_BANK=/Users/roaya/Roaya-files/Development/roaya/memory-bank/
```

### Critical File Paths

| Purpose | Path |
|---------|------|
| **Design System (Consolidated)** | `/Users/roaya/Roaya-files/Development/roaya/roaya-website/DESIGN-SYSTEM.md` |
| **UX Specifications** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/ux/ux-specifications.md` |
| **Design System Overview** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/README.md` |
| **Animation Patterns** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/patterns/animation-patterns.md` |
| **Component Library** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/components/component-library.md` |
| **Glassmorphism Guide** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/patterns/glassmorphism-guide.md` |
| **Technical Architecture** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/architecture/TECHNICAL_ARCHITECTURE.md` |
| **Content Strategy** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/content/bilingual-website-content-strategy.md` |
| **Translation Files (EN)** | `/Users/roaya/Roaya-files/Development/roaya/roaya-website/src/assets/i18n/en.json` |
| **Translation Files (AR)** | `/Users/roaya/Roaya-files/Development/roaya/roaya-website/src/assets/i18n/ar.json` |
| **Backend Reports** | `/Users/roaya/Roaya-files/Development/roaya/memory-bank/backend-reports/` |
| **Backend Source** | `/Users/roaya/Roaya-files/Development/roaya/backend/` |

---

## Production Environment

### Server Details

| Component | Location |
|-----------|----------|
| **Server IP** | `10.1.2.2` |
| **SSH User** | `roaya` |
| **SSH Key** | `~/.ssh/roaya_server` |
| **SSR runtime env** | `NG_ALLOWED_HOSTS=roaya.co,www.roaya.co` (required — see `docs/deploy/RUNTIME-ENV.md`) |
| **Frontend Path (served)** | `/var/www/roaya-ssr/current/browser` — `current` symlinks to `/var/www/roaya-ssr/releases/<stamp>` |
| **Frontend Path (legacy)** | `/var/www/roaya-website/` — **NOT served by nginx.** Retained only as the source of admin-uploaded `assets/images`. Never deploy here. |
| **Backend Path** | `/opt/roaya/backend/` |
| **PM2 Process** | `roaya-api` |
| **Domain** | `roaya.co` |

### Backend Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥20.0.0 | Runtime |
| **Express** | ^4.21.0 | HTTP framework |
| **Prisma** | ^5.22.0 | ORM + PostgreSQL |
| **TypeScript** | ^5.6.2 | Language |
| **Zod** | ^3.23.8 | Validation |
| **JWT** | ^9.0.2 | Authentication |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **Winston** | ^3.15.0 | Logging |
| **BullMQ** | ^5.25.0 | Job queues |
| **SendGrid** | ^8.1.3 | Email |

### Backend API Structure

```
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/                  # Configuration
│   │   └── database.ts          # Prisma client
│   ├── application/
│   │   └── services/            # Business logic
│   │       ├── auth.service.ts
│   │       ├── user.service.ts
│   │       ├── lead.service.ts
│   │       └── ...
│   ├── presentation/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── lead.routes.ts
│   │   │   └── ...
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, validation, etc.
│   │   └── validators/          # Zod schemas
│   ├── domain/
│   │   └── exceptions/          # Custom errors
│   └── shared/
│       └── utils/               # Helpers, logger
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Main seed script
│   ├── seed-content.ts          # Blog/case studies
│   └── seed-logos.ts            # Partner/client logos
├── dist/                        # Compiled output
└── package.json
```

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
- **Logo Management:** LogoService (dynamic logos for Sectors We Serve & Trusted By sections)

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

### Your Role: Product Orchestrator

**Authority Level:** MASTER COORDINATOR (Orchestrates all specialist agents)
**Primary Function:** Strategic coordination across multiple domains for product development

**Key Responsibilities:**
1. Coordinate specialist agents (Business Analyst, Tech Lead, UX, Frontend, QA, etc.)
2. Synthesize requirements across business, UX, technical, and quality domains
3. Create unified, actionable implementation plans
4. Manage cross-functional feature development
5. Ensure security considerations are addressed (partner with Security Reviewer)
6. Balance scope, timeline, and quality trade-offs
7. Provide phased roadmaps for complex features

**When to Invoke Specialists:**
- **Super Business Analyst:** Requirements discovery, user stories, stakeholder alignment
- **Super Tech Lead:** Architecture decisions, technology selection, technical debt
- **Super PM:** Prioritization, milestones, sprint planning, scope management
- **UX Engineer:** User flows, wireframes, interaction design
- **UI Design Expert:** Visual design, color palettes, component specs
- **Super Frontend Engineer:** Implementation, responsive design, performance
- **Content Specialist:** EN/AR translations, terminology, UX copy
- **QA Test Engineer:** Test strategy, test cases, quality assurance
- **Code Reviewer:** Code quality review after implementation
- **Design Reviewer:** Visual QA, brand consistency check

**Workflow Pattern:**
1. Receive feature request → Analyze scope
2. Invoke Explore agent → Understand codebase context
3. Invoke Tech Lead → Get architecture recommendation
4. Invoke specialists in parallel where possible (UX + Content + Frontend)
5. Invoke QA + Design Reviewer for quality gates
6. Document in memory bank → Deliver to user

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
│   └── /services/worldposta (WorldPosta Email Service)
│   └── /services/security (Cybersecurity Overview)
│       ├── /services/security/penetration-testing (Penetration Testing)
│       └── /services/security/soc-solutions (SOC Solutions - 24/7 Monitoring)
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
- **Solutions Mega Menu:** Includes expandable Cybersecurity section with nested items (Penetration Testing, SOC Services, etc.)

---

## Development Commands

### Frontend (Angular)

```bash
# Navigation
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website

# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:4200)
npm run start           # Alias for dev

# Build
npm run build           # Production build (outputs to dist/)
npm run build:prod      # Production build (alias)
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

### Backend (Express/Prisma)

```bash
# Navigation
cd /Users/roaya/Roaya-files/Development/roaya/backend

# Development
npm install              # Install dependencies
npm run dev             # Start dev server with hot reload (tsx watch)

# Build
npm run build           # Build for production (prisma generate + tsc)
npm run start           # Run compiled code
npm run start:prod      # Run in production mode

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:migrate:prod  # Run migrations (production)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
npm run prisma:seed-content  # Seed blog/case studies
npm run prisma:seed-logos    # Seed partner/client logos
npm run db:reset         # Reset database

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E tests

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix linting issues
```

---

## Production Deployment

### Prerequisites

- **VPN Connection Required:** Connect to the company VPN to access the internal server at `10.1.2.2`
- SSH key installed at `~/.ssh/roaya_server`
- Both frontend and backend build successfully locally

### VPN Connection Verification

Before deploying, verify VPN connectivity:

```bash
# Test VPN connection
ping -c 3 10.1.2.2

# If ping fails, reconnect VPN and try again
# Expected output: 64 bytes from 10.1.2.2: icmp_seq=0 ttl=63 time=XXms

# Test SSH connection
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 "echo 'Connected'"
```

### Quick Deployment Commands

```bash
# QUICK FRONTEND DEPLOY — use the script, not a hand-rolled tar
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh   # build + gate, upload nothing
./deploy/scripts/deploy-ssr.sh             # build, gate, ship, restart SSR

# The old browser-only `tar --exclude='assets'` command that used to live here
# is GONE ON PURPOSE. It shipped dist/roaya-website/browser only, so:
#   1. the SSR server bundle never reached the host — no SSR could run, and
#      every unknown route answered 200 with a stale index.html;
#   2. `--exclude='assets'` (added to protect admin-uploaded images) also
#      excluded assets/i18n, so translation changes were invisible in
#      production for six months.
# deploy/scripts/deploy-ssr.sh ships the server bundle, carries assets/images
# forward, lets the build's own assets/i18n win, refuses to deploy a build
# with fewer than 30 prerendered routes, and keeps 5 releases for rollback.

# QUICK BACKEND DEPLOY (single command)
cd /Users/roaya/Roaya-files/Development/roaya/backend && \
npm run build && \
tar czf /tmp/roaya-backend.tar.gz dist prisma package.json package-lock.json && \
scp -o ConnectTimeout=30 -i ~/.ssh/roaya_server /tmp/roaya-backend.tar.gz roaya@10.1.2.2:/tmp/ && \
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && \
   tar xzf /tmp/roaya-backend.tar.gz && \
   npx prisma generate && \
   pm2 restart roaya-api && \
   rm /tmp/roaya-backend.tar.gz"
```

### Detailed Deployment Commands

> **FRONTEND: there is exactly one supported path — `./deploy/scripts/deploy-ssr.sh`.**
> The frontend commands that used to live in this section have been removed as
> **FORBIDDEN/LEGACY**. They copied a browser-only build into the flat
> `/var/www/roaya-website` root, which nginx no longer serves: it serves
> `/var/www/roaya-ssr/current/browser` and proxies dynamic routes to the SSR
> upstream, and the legacy directory appears in **zero** lines of the active
> nginx config.
>
> Why this is recorded rather than quietly deleted — three real incidents:
> 1. The browser-only tarball never shipped `server/server.mjs`, so no SSR
>    process could run and every unknown route answered 200 with a stale
>    `index.html`.
> 2. `--exclude='assets'` (added to protect admin-uploaded images) also excluded
>    `assets/i18n`, so translation changes were invisible in production for
>    roughly six months.
> 3. **2026-08-25:** a correct, fully validated build was copied into that flat
>    root. Production kept serving the previous release for hours, with no error
>    in any log, because nothing reads that directory.
>
> Do not delete `/var/www/roaya-website` — it holds admin-uploaded
> `assets/images`, which `deploy-ssr.sh` carries forward into each release.
>
> Runtime prerequisites (notably `NG_ALLOWED_HOSTS`, without which every route
> silently returns the client-rendered shell with HTTP 200):
> see `docs/deploy/RUNTIME-ENV.md`.

```bash
# ============================================
# FRONTEND DEPLOYMENT — supported path
# ============================================
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh   # build + gates, uploads nothing
./deploy/scripts/deploy-ssr.sh             # build, gate, ship, restart, verify, pm2 save

# ============================================
# BACKEND DEPLOYMENT
# ============================================

# 1. Build backend
cd /Users/roaya/Roaya-files/Development/roaya/backend
npm run build

# 2. Create tarball
tar czf /tmp/roaya-backend.tar.gz \
  -C /Users/roaya/Roaya-files/Development/roaya/backend \
  dist prisma package.json package-lock.json

# 3. Upload to server
scp -o ControlMaster=no -o ControlPath=none \
  -i ~/.ssh/roaya_server \
  /tmp/roaya-backend.tar.gz roaya@10.1.2.2:/tmp/

# 4. Deploy on server
ssh -o ControlMaster=no -o ControlPath=none \
  -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && \
   tar xzf /tmp/roaya-backend.tar.gz && \
   npx prisma generate && \
   pm2 restart roaya-api && \
   rm /tmp/roaya-backend.tar.gz"

# ============================================
# COMBINED DEPLOYMENT (both frontend + backend)
# ============================================
# Run the two supported paths in sequence. There is no combined tarball:
# the FORBIDDEN/LEGACY flat-root frontend upload that used to be here is gone
# for the reasons documented above.

# 1. Frontend (build, gate, ship, restart, verify, pm2 save)
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
./deploy/scripts/deploy-ssr.sh

# 2. Backend
cd /Users/roaya/Roaya-files/Development/roaya/backend && npm run build
tar czf /tmp/roaya-backend.tar.gz \
  -C /Users/roaya/Roaya-files/Development/roaya/backend \
  dist prisma package.json package-lock.json
scp -o ControlMaster=no -o ControlPath=none -i ~/.ssh/roaya_server \
  /tmp/roaya-backend.tar.gz roaya@10.1.2.2:/tmp/

# Deploy backend
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && \
   tar xzf /tmp/roaya-backend.tar.gz && \
   npx prisma generate && \
   pm2 restart roaya-api && \
   rm /tmp/roaya-backend.tar.gz"
```

### Database Schema Sync (Production)

When new Prisma models are added to `schema.prisma`, sync them to production:

```bash
# Push schema changes to production database (creates missing tables)
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && npx prisma db push --accept-data-loss"

# Restart API after schema changes
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 "pm2 restart roaya-api"

# Verify health
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "curl -s http://localhost:3001/api/v1/health"
```

**Note:** `--accept-data-loss` only affects tables being created (no existing data is lost). Use `prisma migrate deploy` for migrations that modify existing tables.

### Database Seeding (Production)

```bash
# Seed logos (partner + client) - run via SSH
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && npm run prisma:seed-logos"

# Seed content (blogs + case studies)
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && npm run prisma:seed-content"

# Run main seed (if needed)
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "cd /opt/roaya/backend && npm run prisma:seed"
```

### Useful Production Commands

```bash
# Check PM2 status
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 "pm2 status"

# View backend logs
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 "pm2 logs roaya-api --lines 50"

# Restart backend
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 "pm2 restart roaya-api"

# Check file timestamps (verify deployment)
# Frontend: check the ACTIVE release, not the legacy flat root
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 "readlink -f /var/www/roaya-ssr/current && ls -lt /var/www/roaya-ssr/current/browser/main-*.js | head -1"
ssh -i ~/.ssh/roaya_server roaya@10.1.2.2 "ls -lt /opt/roaya/backend/dist/index.js | head -1"
```

### SSH & VPN Notes

**VPN Required:** The production server (10.1.2.2) is on an internal network. You must be connected to the company VPN to access it.

**Common Issues:**
- **Connection timeout:** Reconnect VPN and verify with `ping 10.1.2.2`
- **Slow network:** Use `-o ConnectTimeout=30` for all SSH commands
- **SSH session drops:** Harmless if command completed; verify with file timestamps
- **Stale connections:** Use `pkill -f "ssh.*10.1.2.2"` to clear

**Verify Deployment:**
```bash
# Check frontend deployment timestamp
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "readlink -f /var/www/roaya-ssr/current && ls -lt /var/www/roaya-ssr/current/browser/main-*.js | head -1"

# Check backend is running
ssh -o ConnectTimeout=30 -i ~/.ssh/roaya_server roaya@10.1.2.2 \
  "curl -s http://localhost:3001/api/v1/health"
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
11. ✅ **SAP Services** - Bento grid layout with SAP solutions
12. ✅ **WorldPosta** - Dedicated email service page with WorldPosta partnership
13. ✅ **Cybersecurity Overview** - Security solutions overview page
14. ✅ **Penetration Testing** - Detailed pen testing services page
15. ✅ **SOC Solutions** - 24/7 Security Operations Center services page

**Status:** All core pages implemented and functional

---

### Phase 4: Polish & Launch ✅ COMPLETED

**Completed:**
- [x] SEO service implementation (meta tags, structured data, Open Graph)
- [x] Analytics service implementation (GA4 tracking setup)
- [x] Backend API integration (full Express backend with PostgreSQL)
- [x] Build error fixes (import paths, deprecated methods, TypeScript types)
- [x] Production build verification (builds successfully with warnings only)
- [x] Mega menu expandable sections (Cybersecurity with nested items)
- [x] Security service pages (Overview, Penetration Testing)
- [x] WorldPosta service page with dedicated assets
- [x] SAP services page with Bento Grid layout
- [x] Translation path structure standardization
- [x] Icon standardization (Lucide icons preferred over Font Awesome)
- [x] SOC Solutions page (`/services/security/soc-solutions`) with full EN/AR translations
- [x] Penetration Testing page enhancements (animated counters, category filters, accessibility)
- [x] Security partner logos integration (Palo Alto, IBM QRadar, Splunk, Elastic, CrowdStrike, Fortinet, Kaspersky, Nessus)
- [x] Dark mode logo support with CSS filters
- [x] Full admin panel with shadcn UI components
- [x] User management with password generator (meets complexity requirements)
- [x] Lead management system
- [x] Blog/Case Studies content management
- [x] Logo management (Sectors We Serve, Trusted By)
- [x] Website analytics dashboard
- [x] Production deployment to roaya.co
- [x] Database seeding (logos, blog posts, case studies)
- [x] Loading screen optimization (1.5s minimum, non-blocking texture loading)
- [x] Error toast suppression on public pages (admin-only toasts)

**Remaining Optional Tasks:**
- [ ] GA4 Measurement ID configuration (placeholder in environment.prod.ts)
- [ ] Google Search Console setup
- [ ] Sentry DSN configuration (placeholder in environment.prod.ts)
- [ ] HubSpot CRM integration
- [ ] Performance optimization (Core Web Vitals audit)

**Status:** Production deployed and operational

**Build Status:**
- ✅ Production build succeeds
- ✅ All TypeScript errors resolved
- ⚠️ Bundle size warnings (~895KB initial) - contains admin panel, acceptable
- ⚠️ Some component SCSS files slightly exceed budget - optimization pending

---

## Design System & Documentation

### Design System Location

The comprehensive design system documentation is located in the memory bank:

**Base Path:** `/Users/roaya/Roaya-files/Development/roaya/memory-bank/design/`

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

### Security Service Pages (2025-12-25)

**New Pages Implemented:**
- **Cybersecurity Overview** (`/services/security`)
  - Hero section with outcomes, solutions, partners
  - Technology partners showcase (Palo Alto, CrowdStrike, Splunk, etc.)
  - Global frameworks alignment (NIST CSF, ISO 27001, MITRE ATT&CK)
  - Why Roaya differentiators

- **Penetration Testing** (`/services/security/penetration-testing`)
  - Complete service page with all sections
  - Stats display (500+ assessments, 99.8% detection, 48h delivery)
  - What You Get (6 value propositions)
  - Services Overview with tabs (Assessments vs Pen Testing)
  - How We Test (4-step methodology)
  - What We Test (8 testing categories with tools)
  - Reporting deliverables
  - Standards alignment section
  - Why Roaya differentiators
  - CTA section

**Mega Menu Enhancements:**
- Expandable Cybersecurity section in Solutions mega menu
- Nested items show on hover
- Smooth width expansion animation
- Translation paths properly structured

**Translation Path Convention:**
```
services.security.page.penetrationTesting.hero.title
services.security.page.penetrationTesting.stats.assessments.value
services.security.page.penetrationTesting.whatYouGet.item1.title
```

---

### WorldPosta Service Page (2025-12-25)

**New Page:** `/services/worldposta`
- Dedicated page for WorldPosta email partnership
- Custom assets and imagery
- Integration with mega menu
- Full EN/AR translations

---

### SAP Services Page (2025-12-25)

**New Page:** `/services/sap`
- Bento Grid layout for SAP solutions
- Modern card-based design
- Updated images and assets
- Full EN/AR translations

---

### SOC Solutions Page (2025-12-26)

**New Page:** `/services/security/soc-solutions`
- 24/7 Security Operations Center services
- SOC command center aesthetic (scanning lines, status indicators, dark gradients)
- Full content sections:
  - Hero with status badge and dual CTA
  - What You Get (5 outcomes)
  - How It Works (6-step workflow with timeline)
  - SOC Packages (5 tiers: Essential, Advanced, MDR, XDR, Threat Hunting)
  - Threat Hunting & Integrations with partner logos
  - Standards Alignment (NIST CSF, ISO 27001, MITRE ATT&CK, CIS Controls, NIST SP 800-61)
  - Why Roaya differentiators
  - CTA section with urgency badge and trust signals
- Integration partner logos with dark mode support
- Full EN/AR translations
- GSAP scroll-triggered animations

---

### Penetration Testing Page Enhancements (2025-12-26)

**Enhancements to:** `/services/security/penetration-testing`
- **Animated Stats Counters:** GSAP-powered number animation with benchmarks
- **Category Filters:** Filter services by network, application, advanced, compliance
- **"Most Requested" Badges:** Highlight popular services
- **Accessibility Improvements:**
  - Improved dark mode contrast (glass card opacity increased to 0.85)
  - Added aria-labels to external links
  - Added aria-hidden to decorative icons
  - Consistent focus indicators (3px white outline on dark sections)
- **Trust Signals:** Certification badges (OSCP, PNPT, CEH, CISSP)
- **Enhanced CTA:** Urgency badge, trust reassurances

---

### Security Partner Logos (2025-12-26)

**Logo Assets Location:** `/src/assets/images/logos/partners/security/`

| Partner | File |
|---------|------|
| Palo Alto Networks | `palo-alto.svg` |
| IBM QRadar | `ibm-qradar.svg` |
| Splunk | `splunk.svg` |
| Elastic Security | `elastic.svg` |
| CrowdStrike | `crowdstrike.svg` |
| Fortinet/FortiGuard | `fortinet.svg` |
| Kaspersky | `kaspersky.svg` |
| Nessus | `nessus.svg` |
| F5 | `f5.svg` |

**Dark Mode Support:**
- SVG logos use `fill="currentColor"` for text color inheritance
- CSS filter applied: `dark:brightness-0 dark:invert` inverts logos for dark backgrounds

---

### Logo Management Admin Page (2026-01-28)

**Conversion from PrimeNG to Shadcn:**
The Logo Management admin page (`/admin/logos`) has been completely rewritten to use shadcn UI components instead of PrimeNG.

**Files Created/Modified:**
- **New:** `src/app/core/services/logo.service.ts` - Logo management service with reactive state
- **Modified:** `src/app/features/admin/logos/logos-list.component.ts` - Converted to shadcn
- **Modified:** `src/app/features/home/home.component.ts` - Now uses LogoService dynamically
- **Modified:** `src/app/features/home/home.component.html` - Updated to use signal syntax

**Logo Categories:**
| Category | Website Section | Description |
|----------|-----------------|-------------|
| `sector` | "Sectors We Serve" | Ministries, Banks, Universities |
| `client` | "Trusted By" | Client company logos |

**LogoService Features:**
- Reactive state using BehaviorSubject (changes propagate in real-time)
- CRUD operations: create, update, delete logos
- Order management with drag-drop support
- Toggle active/inactive status
- Fallback data when API unavailable
- Bilingual support (name + nameAr)

**Logo Interface:**
```typescript
interface Logo {
  id: string;
  name: string;           // English name
  nameAr: string;         // Arabic name
  logo: string;           // Image URL
  darkModeLogo?: string;  // Optional dark mode variant
  scale?: string;         // Optional scale class (e.g., 'scale-150')
  order: number;
  isActive: boolean;
}
```

**Admin Panel Features:**
- Two tabs: "Industry / Sectors" and "Clients"
- Drag-drop reordering
- Add/Edit/Delete logos
- Toggle visibility (active/inactive)
- Image upload with preview
- Scale options for small logos
- Dark mode variant support
- Info banners explaining each section

**Dynamic Website Integration:**
Changes made in the admin panel immediately reflect on the public website:
- Home page "Sectors We Serve" section uses `LogoService.sectorLogos$`
- Home page "Trusted By" section uses `LogoService.clientLogos$`
- Only active logos are displayed, sorted by order

---

### Admin Panel Structure (2026-02-08)

**Route:** `/admin/*`
**Layout:** `AdminLayoutComponent` with sidebar navigation

**Admin Modules:**

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | `LoginComponent` | JWT-based authentication |
| `/admin/dashboard` | `DashboardComponent` | Overview with stats |
| `/admin/leads` | `LeadsListComponent` | Lead management CRM |
| `/admin/leads/:id` | `LeadDetailComponent` | Lead details with activity timeline |
| `/admin/users` | `UsersListComponent` | User management (SUPER_ADMIN) |
| `/admin/users/new` | `UserFormComponent` | Create new user |
| `/admin/users/:id` | `UserDetailComponent` | User details |
| `/admin/users/:id/edit` | `UserFormComponent` | Edit user |
| `/admin/content/blog` | `BlogListComponent` | Blog post management |
| `/admin/content/case-studies` | `CaseStudiesListComponent` | Case study management |
| `/admin/logos` | `LogosListComponent` | Logo management (sectors/clients) |
| `/admin/analytics` | `AnalyticsComponent` | Lead analytics dashboard |
| `/admin/website-analytics` | `AnalyticsDashboardComponent` | Website visitor analytics |
| `/admin/website-analytics/heatmaps` | `HeatmapsComponent` | Click heatmaps |
| `/admin/website-analytics/recordings` | `RecordingsListComponent` | Session recordings |
| `/admin/team` | `TeamListComponent` | Team member management |
| `/admin/packages` | `PackagesListComponent` | Pricing packages |
| `/admin/testimonials` | `TestimonialsListComponent` | Testimonial management |
| `/admin/email-templates` | `TemplatesListComponent` | Email template editor |
| `/admin/documentation` | `DocsListComponent` | Documentation management |
| `/admin/settings` | `SettingsComponent` | System settings |

**User Roles:**
- `SUPER_ADMIN` - Full access, can create/edit/delete users
- `ADMIN` - Can manage leads, content, view analytics
- `MANAGER` - Can manage assigned leads
- `SALES` - Can view and update assigned leads
- `VIEWER` - Read-only access

**Password Requirements (aligned frontend + backend):**
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&#^_+-= etc.)
- Password generator creates 16-char passwords meeting all requirements

---

### shadcn UI Component Library (2026-02-08)

**Location:** `src/app/shared/components/ui/`

All admin panel components use shadcn UI (Angular port) for consistent styling.

**Primitives (`ui/primitives/`):**

| Component | Selector | Description |
|-----------|----------|-------------|
| `InputComponent` | `ui-input` | Text input with variants (default/error/success) |
| `CardComponent` | `ui-card` | Container card |
| `SpinnerComponent` | `ui-spinner` | Loading spinner |
| `LabelComponent` | `ui-label` | Form labels |
| `BadgeComponent` | `ui-badge` | Status badges |
| `ButtonComponent` | `ui-button` | Action buttons |
| `SkeletonComponent` | `ui-skeleton` | Loading placeholders |

**Form Components (`ui/form/`):**

| Component | Selector | Description |
|-----------|----------|-------------|
| `PasswordInputComponent` | `ui-password-input` | Password field with show/hide toggle |
| `SelectComponent` | `ui-select` | Dropdown select with keyboard nav |
| `CheckboxComponent` | `ui-checkbox` | Checkbox with custom styling |
| `TextareaComponent` | `ui-textarea` | Multi-line text input |

**Feedback Components (`ui/feedback/`):**

| Component | Selector | Description |
|-----------|----------|-------------|
| `DialogComponent` | `ui-dialog` | Modal dialogs |
| `ConfirmDialogComponent` | `ui-confirm-dialog` | Confirmation prompts |
| `ToastService` | Injectable | Toast notifications |

**Component Styling Pattern:**

All shadcn components use:
- `class-variance-authority (cva)` for variant styling
- `ControlValueAccessor` for Angular forms integration
- Tailwind CSS for styling
- CSS custom properties for theming
- Dark mode support via `dark:` prefix

**Example Usage:**
```typescript
import { InputComponent } from '../shared/components/ui/primitives/input/input.component';
import { SelectComponent } from '../shared/components/ui/form/select/select.component';
import { ToastService } from '../shared/components/ui/feedback/toast/toast.service';

// In template
<ui-input
  formControlName="email"
  [variant]="form.get('email')?.invalid ? 'error' : 'default'"
  placeholder="Enter email"
/>

// Toast notifications
this.toast.success('Operation completed', 'Success');
this.toast.error('Something went wrong', 'Error');
```

---

### User Form Enhancement (2026-02-08)

**File:** `src/app/features/admin/users/user-form.component.ts`

Completely rewritten from PrimeNG to shadcn UI with:

1. **Password Generator** - Creates 16-char passwords with:
   - Guaranteed uppercase, lowercase, digit, special character
   - Excludes ambiguous characters (I, l, O, 0, 1)
   - Fisher-Yates shuffle for randomization

2. **Password Strength Indicator**:
   - 4-segment color bar (red → orange → yellow → green)
   - Real-time requirement checklist with checkmarks
   - Computed signals for reactive updates

3. **Frontend Validation** aligned with backend:
   - `passwordComplexityValidator` custom Angular validator
   - Matches backend regex in `user.routes.ts`

---

### Reset Password Enhancement (2026-02-08)

**Backend Fix:** `backend/src/application/services/user.service.ts`

Previously used `crypto.randomBytes(8).toString('hex')` which only produced hex characters (0-9, a-f).

Now uses `generateStrongPassword()` method:
- Same algorithm as frontend password generator
- Uses `crypto.randomInt()` for cryptographic randomness
- Produces 16-char passwords meeting all complexity requirements
- Fisher-Yates shuffle for uniform distribution

---

### Form Field Styling Update (2026-02-08)

**Files:**
- `src/app/shared/components/ui/primitives/input/input.component.ts`
- `src/app/shared/components/ui/form/password-input/password-input.component.ts`

Changed from bordered to borderless style:
- `border` → `border-0`
- `bg-neutral-50` → `bg-neutral-100`
- `focus:border-*` → `focus:ring-2 focus:ring-*/50`

Now matches `ui-select` component styling for consistency.

---

### Admin Panel UI Fixes (2026-01-28)

**Dialog Z-Index Fix:**
- Admin sidebar had `z-index: 1000`, causing dialogs (z-50) to appear behind it
- Fixed by updating Dialog component z-index to `z-[1100]`
- Affected file: `src/app/shared/components/ui/feedback/dialog/dialog.component.ts`

**Dialog Overflow Fix:**
- Full-size dialog content was getting cut off
- Added `overflow-hidden` to dialog container
- Added `overflow-y-auto` to DialogContentComponent
- Max height set to `calc(100vh-12rem)` for scrollable content

**Table Responsiveness Fix:**
- Blog and Case Studies admin tables had column overflow issues
- Changed grid columns to use `minmax()` for flexible title column
- Reduced fixed column widths
- Added `overflow-x-auto` wrapper
- Affected files: `blog-list.component.ts`, `case-studies-list.component.ts`

**Dark Mode Accessibility Fix:**
- Blog detail page links had insufficient contrast in dark mode (~3.8:1)
- Updated link color from `#14b8a6` to `#2dd4bf` (teal-400) for 4.5:1+ ratio
- Affected file: `blog-detail.component.scss`

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

### ADR-012: Translation Path Structure Convention
**Decision:** Use nested `.page.` segment for service sub-pages in translation keys
**Rationale:**
- Consistent hierarchical organization of translation keys
- Clear distinction between service overview and service sub-pages
- Prevents key collisions between parent and child pages
- Easier navigation in JSON files

**Implementation:**
- Service overview: `services.security.page.hero.*`
- Service sub-page: `services.security.page.penetrationTesting.*`
- Mega menu items must match the page translation paths

**Example:**
```json
{
  "services": {
    "security": {
      "page": {
        "hero": { ... },
        "penetrationTesting": {
          "title": "Penetration Testing",
          "hero": { ... }
        }
      }
    }
  }
}
```

**Status:** Adopted (2025-12-25)

---

### ADR-013: Icon Library Standardization
**Decision:** Prefer Lucide icons over Font Awesome for new components
**Rationale:**
- Lucide is the primary icon library configured in the project
- Consistent icon style across all components
- Lucide icons are already properly imported in app.config.ts
- Font Awesome icons may cause "icon not found" warnings if not imported

**Implementation:**
- Use Lucide icon names: `lucideMail`, `lucideCheckCircle2`, `lucideShield`, etc.
- Only use Font Awesome when Lucide doesn't have a suitable alternative
- When replacing Font Awesome with Lucide:
  - `faEnvelopeRegular` → `lucideMail`
  - `faCircleCheck` → `lucideCheckCircle2`

**Status:** Adopted (2025-12-25)

---

### ADR-014: Mega Menu Expandable Sections
**Decision:** Implement expandable/collapsible sections in mega menu for services with sub-pages
**Rationale:**
- Better organization of complex service hierarchies
- Improved navigation UX for nested content
- Consistent with modern mega menu patterns
- Allows showing sub-services without leaving the menu

**Implementation:**
- Menu items can have `children` array for nested items
- `isExpanded` state tracks open/closed state
- Hover on parent expands nested menu
- Arrow icon indicates expandable items
- Nested items show title and description

**Example:**
```typescript
{
  title: 'navigation.solutions.security.title',
  icon: 'lucideShield',
  route: '/services/security',
  children: [
    {
      title: 'services.security.page.penetrationTesting.title',
      description: 'services.security.page.penetrationTesting.hero.subtitle',
      route: '/services/security/penetration-testing'
    }
  ]
}
```

**Status:** Adopted (2025-12-25)

---

### ADR-015: Dynamic Logo Management with Reactive Service
**Decision:** Implement logo management using a reactive service pattern with BehaviorSubject for real-time updates across admin and public website
**Rationale:**
- Changes in admin panel should immediately reflect on public website
- Centralized logo data management
- Consistent interface for both sector and client logos
- Fallback support when API is unavailable
- Easy to extend for additional logo categories

**Implementation:**
- `LogoService` with BehaviorSubject for `sectorLogos$` and `clientLogos$`
- Home component subscribes to observables and uses signals
- Admin panel CRUD operations update the shared state
- Initial data loaded from service (fallback if API fails)

**Alternative Considered:** Direct API calls in each component
**Trade-off:** More complex service, but better UX and data consistency
**Status:** Adopted (2026-01-28)

---

### ADR-016: Shadcn UI for Admin Panel Components
**Decision:** Convert admin panel components from PrimeNG to shadcn UI components
**Rationale:**
- Consistent styling with public website (both use Tailwind)
- Smaller bundle size (PrimeNG is heavy)
- Better dark mode support
- Unified component library across the application
- More control over component behavior and styling

**Implementation:**
- Use shadcn Dialog, Select, Skeleton, ConfirmDialog
- Tailwind CSS for all admin panel styling
- Lucide icons instead of PrimeNG icons
- CDK Drag-Drop retained for reordering functionality

**Status:** Adopted (2026-01-28)

---

### ADR-017: Borderless Form Input Styling
**Decision:** Use borderless inputs with background color instead of bordered inputs
**Rationale:**
- Cleaner, more modern appearance
- Consistent with shadcn UI design language
- Focus states use ring instead of border for better visibility
- Matches `ui-select` component styling

**Implementation:**
- Changed `border border-neutral-200` to `border-0 bg-neutral-100`
- Changed `focus:border-*` to `focus:ring-2 focus:ring-*/50`
- Applied to `InputComponent` and `PasswordInputComponent`

**Status:** Adopted (2026-02-08)

---

### ADR-018: Cryptographically Secure Password Generation
**Decision:** Use `crypto.randomInt()` and Fisher-Yates shuffle for password generation
**Rationale:**
- `Math.random()` is not cryptographically secure
- `crypto.randomInt()` provides uniform distribution
- Fisher-Yates shuffle ensures unbiased randomization
- Guarantees all character categories are represented

**Implementation:**
- Backend: `generateStrongPassword()` in `user.service.ts`
- Frontend: `generatePassword()` in `user-form.component.ts`
- Same algorithm in both locations for consistency
- Excludes ambiguous characters (I, l, O, 0, 1)

**Status:** Adopted (2026-02-08)

---

### ADR-019: Admin-Only Error Toasts
**Decision:** Only show error toast notifications on admin panel routes
**Rationale:**
- Public website visitors should not see backend error messages
- API failures (visitor tracking, content loading) are expected on slow connections
- Admin users need feedback for CRUD operations
- Better UX for public visitors

**Implementation:**
- `GlobalErrorHandler.handleHttpError()` checks `this.router.url?.startsWith('/admin')`
- `GlobalErrorHandler.handleClientError()` same check
- File: `src/app/core/services/error-handler.service.ts`

**Status:** Adopted (2026-02-08)

---

### ADR-020: Non-Blocking Asset Loading
**Decision:** Load external assets (textures, images) in background without blocking render
**Rationale:**
- Initial render should not wait for external CDN resources
- Better perceived performance
- Graceful fallback if resources fail to load
- Works with slow network connections

**Implementation:**
- Cosmic loader renders Earth with solid color immediately
- Three.js textures load in background via Promise
- `applyTextures()` swaps materials when ready
- Reduced minimum display time from 3s to 1.5s

**Status:** Adopted (2026-02-08)

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

## Deployment Strategy

### Hosting: settled — self-hosted, nothing else

Production is the **self-hosted server reached over VPN/SSH** (see the
Production Deployment section above for host details). This is not an open
question: all Vercel configuration was removed from the repo on 2026-08-24,
and `roaya-website/deploy/nginx/roaya-website.conf` is the single source of
truth for host-level behavior (redirects, security headers, machine-file
content types, caching, SSR proxying).

Do not reintroduce a PaaS target (Vercel/Netlify/Firebase) or a static-only
bucket setup without an explicit decision — the SSR process is load-bearing
for the AI-readiness work, and a static-only host silently defeats it.

Deploy with `./deploy/scripts/deploy-ssr.sh`; see
`docs/deploy/RUNTIME-ENV.md` for the runtime contract, activation ordering,
post-deploy host verification, and manual rollback.

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

The `/Users/roaya/Roaya-files/Development/roaya/memory-bank/` directory contains critical documentation that should be referenced before making major decisions:

### Architecture Documents
- `architecture/TECHNICAL_ARCHITECTURE.md` - System design and technology stack
- `architecture/ADRs/` - Architecture Decision Records (future)

### UX Specifications
- `ux/ux-specifications.md` - Complete UX design system, component specs, user flows

### Content & Translations
- `content/bilingual-website-content-strategy.md` - Content strategy, tone of voice, SEO
- `content/translations/` - Master translation files (future)

### Planning Documents
- `planning/project-plan.md` - Milestones, sprints, deliverables
- `planning/backlog.md` - Feature backlog and prioritization

### Backend Reports & Documentation
- `backend-reports/` - All backend implementation reports, API docs, security reports, and guides

**Backend Reports Index (27 files):**

| Report | Description |
|--------|-------------|
| `BACKEND_FULL_REFERENCE.md` | Comprehensive backend reference document |
| `BACKEND_README.md` | Backend project README |
| `README.md` | Backend reports overview |
| `IMPLEMENTATION_SUMMARY.md` | Full implementation technical overview |
| `IMPLEMENTATION_REPORT.md` | Implementation progress report |
| `CHANGES_SUMMARY.md` | Summary of all backend changes |
| `DATABASE_SCHEMA.md` | Prisma database schema documentation |
| `API_ACCESS.md` | API access and endpoint reference |
| `API_DOCUMENTATION_LOGOS_EMAIL_TEMPLATES.md` | Logos and email templates API docs |
| `DOCUMENTATION_API.md` | Documentation system API reference |
| `DOCUMENTATION_AND_ANALYTICS_IMPLEMENTATION_REPORT.md` | Docs & analytics implementation report |
| `WEBSITE_ANALYTICS_API.md` | Website analytics tracking API docs |
| `QUICK_START.md` | Quick start guide for backend API |
| `QUICK_START_GUIDE.md` | Quick start guide for docs & analytics APIs |
| `QUICKSTART_ADMIN.md` | Admin panel quick start guide |
| `LOCAL_TESTING_GUIDE.md` | Local development and testing guide |
| `NEW_DEVELOPER_GUIDE.md` | Onboarding guide for new developers |
| `ADMIN_DASHBOARD.md` | Admin dashboard documentation |
| `ADMIN_IMPLEMENTATION_SUMMARY.md` | Admin panel implementation summary |
| `SECURITY_IMPLEMENTATION.md` | Security features implementation details |
| `SECURITY_FIXES_SUMMARY.md` | Security fixes summary |
| `account-lockout-and-token-rotation-implementation.md` | Account lockout & token rotation feature |
| `security-and-feature-completion-report-2026-01-26.md` | Security & feature completion report |
| `logos-email-templates-implementation-report.md` | Logos & email templates implementation |
| `dynamic-content-integration-plan.md` | Dynamic content integration plan |
| `loading-screen-enhancement-2026-01-22.md` | Loading screen enhancement report |
| `scroll-fetch-error-investigation-2026-01-22.md` | Scroll/fetch error investigation |

---

## Reports Storage Rule

**All reports MUST be stored in the memory-bank directory.** Do not leave reports in the `backend/` folder or any other project source directory.

### Rule
- **Location:** All reports, implementation summaries, investigation logs, and documentation go in `/Users/roaya/Roaya-files/Development/roaya/memory-bank/`
- **Backend reports:** `/memory-bank/backend-reports/`
- **QA reports:** `/memory-bank/qa/reports/`
- **Design reports:** `/memory-bank/design/`
- **Project plans:** `/memory-bank/project/`
- **Research:** `/memory-bank/research/`

### Naming Convention
- Implementation reports: `FEATURE_NAME_IMPLEMENTATION_REPORT.md` or `feature-name-implementation-report.md`
- Investigation logs: `issue-description-YYYY-MM-DD.md`
- API documentation: `API_NAME_API.md`
- Security reports: `SECURITY_TOPIC.md`

### When Creating Reports
1. Write the report directly to the appropriate `memory-bank/` subdirectory
2. Never store reports in `backend/`, `roaya-website/`, or any source code directory
3. Update this CLAUDE.md if a new report category is added

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

**Issue:** Translation keys showing raw text instead of translated content
- **Solution:** Verify the translation path matches the JSON structure exactly
- **Common mistake:** Using `services.security.penetrationTesting.*` instead of `services.security.page.penetrationTesting.*`
- **Debug:** Check browser console for missing translation warnings
- **Verify:** Use `{{ 'key.path' | translate }}` in template and confirm key exists in both `en.json` and `ar.json`

**Issue:** Icons not rendering (showing empty or console warnings)
- **Solution:** Ensure icon is properly imported in `app.config.ts` under `provideNgIconsConfig()`
- **Prefer:** Lucide icons (`lucideMail`, `lucideShield`) over Font Awesome (`faEnvelopeRegular`)
- **Check:** Icon name matches exactly (case-sensitive)

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
- **Memory Bank:** `/Users/roaya/Roaya-files/Development/roaya/memory-bank/`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-06 | Initial CLAUDE.md creation | Super Tech Lead |
| 1.1.0 | 2025-12-06 | Added Font Awesome integration, Home page enhancements, Content completion, ui-design-expert agent, ADR-006 & ADR-007 | Super Tech Lead |
| 1.2.0 | 2025-12-06 | Added comprehensive design system documentation section, design file references, Contact page as golden standard | Product Orchestrator |
| 1.3.0 | 2025-12-06 | Phase 2.5 implementation: Blog system, Case studies showcase, Resources hub, Backend services (API, Analytics, SEO), Navigation updates, Phase status updates, ADR-008 & ADR-009 | Super Tech Lead |
| 1.4.0 | 2025-12-06 | Build fixes: Resolved import path errors (relative paths), replaced deprecated toPromise() with firstValueFrom, fixed TypeScript type errors, removed "Roaya IT" text from navbar, build now succeeds | Super Tech Lead |
| 1.5.0 | 2025-12-25 | Added SAP Services page with Bento Grid layout, WorldPosta service page, Cybersecurity Overview page, Penetration Testing page | Super Tech Lead |
| 1.6.0 | 2025-12-25 | Mega menu expandable sections for Cybersecurity services, translation path standardization (ADR-012), icon library standardization (ADR-013), mega menu pattern (ADR-014), scroll progress indicator | Super Tech Lead |
| 1.7.0 | 2025-12-26 | SOC Solutions page with full content and translations, Penetration Testing enhancements (animated counters, category filters, accessibility fixes), Security partner logos integration with dark mode support | Super Tech Lead |
| 1.8.0 | 2026-01-19 | Memory bank cleanup (removed obsolete archive logs, AI services fix summaries, duplicate security docs), updated all paths to new project location, removed outdated agent-map.json reference, added consolidated DESIGN-SYSTEM.md reference | Product Orchestrator |
| 1.9.0 | 2026-01-28 | Logo Management conversion from PrimeNG to shadcn, LogoService for dynamic website integration, Admin panel UI fixes (dialog z-index, overflow, table responsiveness), Dark mode accessibility improvements, ADR-015 & ADR-016 | Product Orchestrator |
| 2.0.0 | 2026-02-01 | Consolidated all backend reports into memory-bank/backend-reports (27 files), added Backend Reports Index to CLAUDE.md, established Reports Storage Rule (all reports must go in memory-bank), added report naming conventions and storage guidelines | Product Orchestrator |
| 2.1.0 | 2026-02-08 | Production deployment documentation (server details, deployment commands, SSH instructions), Admin panel structure documentation (all routes and modules), shadcn UI component library documentation, User form enhancement (password generator with strength indicator), Reset password enhancement (backend strong password generation matching frontend), Form field styling update (borderless inputs with focus rings), ADR-017 through ADR-020 (Borderless Form Input Styling, Cryptographically Secure Password Generation, Admin-Only Error Toasts, Non-Blocking Asset Loading) | Product Orchestrator |
| 2.2.0 | 2026-02-08 | Website Analytics fix (created missing PostgreSQL tables via prisma db push), Loading screen optimization (2s fixed duration, no content wait), VPN connection documentation added, Quick deployment commands added, Database schema sync documentation added, Seeding commands updated to use SSH | Product Orchestrator |

---

## Notes for Future Claude Sessions

When starting a new Claude Code session:

1. **Read this file first** to understand project context
2. **Check current phase** in Project Phases section
3. **Review relevant memory bank documents** for detailed specs
4. **Verify working directory** is `/Users/roaya/Roaya-files/Development/roaya/roaya-website/`
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
