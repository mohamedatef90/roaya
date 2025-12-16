# Roaya IT Corporate Website

> **Status:** Phase 4 In Progress (Backend Integration Pending)
> **Domain:** www.roaya.co

---

## Project Identity

**Company:** Egyptian IT services provider and WorldPosta partner
**Mission:** Deliver enterprise-grade IT solutions with security, trust, and transparency

**Core Brand Values:**
- **Security First:** Enterprise-grade protection for client data
- **Trust:** Long-term partnerships with transparent communication
- **Transparency:** Clear pricing, processes, and deliverables

---

## Project Location

```bash
PROJECT_ROOT=/Users/roaya/Roaya-files/Development/roaya/
MEMORY_BANK=/Users/roaya/Roaya-files/Development/roaya/memory-bank/
```

---

## Technology Stack

### Core Framework
- **Angular:** v21 (Standalone components, no NgModules)
- **Build System:** Vite + esbuild
- **TypeScript:** Latest stable

### UI Layer
- **CSS Framework:** Tailwind CSS v4
- **Component Library:** shadcn UI (Angular port)
- **Icons:** Lucide Angular (primary) + Font Awesome Regular

### Internationalization
- **i18n Library:** ngx-translate
- **Languages:** English (EN) + Arabic (AR) with full RTL support
- **Typography:** Inter (EN) + Tajawal (AR)

### Core Services
- **ThemeService:** Light/dark mode management
- **LanguageService:** EN/AR switching + RTL
- **NavigationService:** Smooth scrolling, active states
- **ApiService:** Backend API integration
- **AnalyticsService:** Google Analytics 4 tracking
- **SEOService:** Meta tags, structured data, Open Graph

---

## Brand Design System

### Color Palette

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

**Light Mode:** Background #FFFFFF, Text #1f2937, Surface #f9fafb
**Dark Mode:** Background #0f172a, Text #f1f5f9, Surface #1e293b

### Typography Scale

```css
h1: 3.75rem (60px)   - Hero titles
h2: 3rem (48px)      - Section headers
h3: 2.25rem (36px)   - Subsection headers
h4: 1.875rem (30px)  - Card titles
body: 1rem (16px)    - Default text
body-sm: 0.875rem    - Small text
```

---

## Application Routes

```
/ (Home)
├── /services (Services Overview)
│   └── /services/:id (Service Detail)
├── /industries (Industries Overview)
│   └── /industries/:id (Industry Detail)
├── /pricing (Pricing Page)
├── /about (About Us)
├── /contact (Contact Form)
├── /roi-calculator (ROI Calculator)
└── /resources (Resources Hub)
    ├── /resources/blog (Blog Listing)
    │   └── /resources/blog/:slug (Blog Detail)
    └── /resources/case-studies (Case Studies)
        └── /resources/case-studies/:slug (Case Study Detail)
```

---

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:4200)
npm run build            # Production build
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
```

---

## Current Phase: Phase 4 (Polish & Launch)

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

---

## Agent System

This project uses a multi-agent system for specialized tasks:

```
product-orchestrator (Master Coordinator)
├── super-business-analyst (Requirements & User Stories)
├── super-tech-lead (Architecture & Technical Decisions)
├── super-pm (Planning, Prioritization, Milestones)
├── ux-engineer (User Experience & Interaction Design)
├── ui-design-expert (Visual Design & Specifications)
├── super-frontend-engineer (Implementation & Development)
├── content-terminology-specialist (Bilingual Content & Translations)
├── qa-test-engineer (Testing Strategy & Quality Assurance)
├── code-reviewer (Code Quality & Best Practices)
├── design-reviewer (Design Consistency & Brand Adherence)
└── visual-inspiration-analyzer (Design Pattern Extraction)
```

**Usage:** Delegate to specialized agents for tasks matching their expertise.

---

## Key Architecture Decisions

### ADR-001: Angular Standalone Components
**Decision:** Use standalone components exclusively (no NgModules)
**Rationale:** Modern Angular architecture, simpler mental model, better tree-shaking
**Status:** Adopted

### ADR-002: Tailwind CSS for Styling
**Decision:** Use Tailwind CSS v4 as primary styling solution
**Rationale:** Utility-first approach, excellent dark mode support, easy RTL configuration
**Status:** Adopted

### ADR-003: ngx-translate for i18n
**Decision:** Use ngx-translate for internationalization
**Rationale:** Mature library, JSON-based translations, runtime language switching, RTL support
**Status:** Adopted

---

## Design Reference

**Golden Standard:** Contact page (`/src/app/features/contact/`) showcases all design patterns:
- Glassmorphism cards with hover glow effects
- GSAP scroll-triggered animations
- Full RTL support and dark mode compatibility
- Accessibility features (reduced motion, focus states)

**Design Documentation:** `/memory-bank/design/`
- `README.md` - Design system overview
- `patterns/animation-patterns.md` - GSAP animation snippets
- `patterns/glassmorphism-guide.md` - Glass effect implementation
- `components/component-library.md` - Reusable component patterns

---

## Code Standards

### File Naming
- Components: `kebab-case.component.ts`
- Services: `kebab-case.service.ts`
- Interfaces: `kebab-case.interface.ts`

### Import Patterns
```typescript
// Use relative imports for core services
import { ApiService } from '../../core/services/api.service';

// Use firstValueFrom for async operations (not deprecated toPromise)
import { firstValueFrom } from 'rxjs';
await firstValueFrom(this.apiService.submitForm(data));
```

### Code Quality Rules
- Max function length: 50 lines
- Max function parameters: 3 (use objects for more)
- Max file length: 300 lines
- No `any` type (use `unknown` or specific types)
- Prefer `const` over `let`
- Use `readonly` for immutable class properties
- Early returns for guard clauses

### Component Structure
```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './feature-name.component.html'
})
export class FeatureNameComponent implements OnInit {
  // 1. Public properties
  // 2. Private properties
  // 3. Injected services
  // 4. Lifecycle hooks
  // 5. Public methods
  // 6. Private methods
}
```

---

## Common Tasks

### Add a New Page
1. Generate: `ng generate component features/page-name`
2. Add route to `app.routes.ts` with lazy loading
3. Add translations to `en.json` and `ar.json`
4. Update SEO via `SEOService` in `ngOnInit()`

### Add a Translation Key
1. Add to `/src/assets/i18n/en.json`
2. Add to `/src/assets/i18n/ar.json`
3. Use: `{{ 'key.path' | translate }}`

### Create a Shared Component
1. Generate: `ng generate component shared/components/component-name`
2. Set `standalone: true` in decorator
3. Import where needed

---

## Troubleshooting

**RTL not working for Arabic:**
- Check `LanguageService` sets `dir="rtl"` on `<html>`
- Verify: `document.documentElement.dir` in console

**Theme not switching:**
- Verify `ThemeService` updates `data-theme` attribute
- Check CSS variables in both `light.css` and `dark.css`

**Translations not loading:**
- Ensure `TranslateHttpLoader` path: `./assets/i18n/`
- Check JSON files are valid

**Import path errors:**
- Use relative imports: `../../core/services/api.service`
- Avoid path aliases (`@core/*`) without proper build config
