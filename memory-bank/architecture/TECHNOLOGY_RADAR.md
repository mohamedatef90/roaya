# Roaya IT Website - Technology Radar

**Purpose:** Track technology choices, emerging tools, and architectural decisions

**Last Updated:** 2025-12-05

**Categories:**
- **ADOPT** - Production-ready, high confidence, use by default
- **TRIAL** - Worth pursuing in controlled projects, gather experience
- **ASSESS** - Exploring viability, not yet in active projects
- **HOLD** - Proceed with caution, phasing out, or not recommended

---

## Frameworks & Languages

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Angular 21** | ADOPT | Official framework choice, standalone components, excellent TypeScript support | Current version, all new development |
| **TypeScript 5.x** | ADOPT | Type safety, excellent tooling, Angular's default | Required for Angular |
| **React** | HOLD | Not aligned with current stack | Consider for micro-frontends if needed |
| **Vue** | HOLD | Not aligned with current stack | - |
| **Svelte** | ASSESS | Interesting compilation approach | Monitor for future projects |

---

## UI Libraries & Component Systems

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Tailwind CSS 3.x** | ADOPT | Utility-first, small bundle, excellent DX | Primary styling approach |
| **shadcn-angular** | ADOPT | Customizable, accessible, Tailwind-based | UI component library |
| **Angular Material** | HOLD | Too opinionated, heavy bundle | Not using for this project |
| **PrimeNG** | HOLD | Feature-rich but heavy | Overkill for website |
| **CSS Modules** | ASSESS | Scoped styles without CSS-in-JS | May use for specific components |
| **Radix UI** | ASSESS | Unstyled primitives, excellent a11y | React-focused, watching Angular ports |

---

## State Management

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Angular Signals** | ADOPT | Native, performant, Angular's future | Primary state management |
| **RxJS** | ADOPT | Async operations, Angular's reactive foundation | For streams and async logic |
| **NgRx** | HOLD | Overkill for website complexity | Consider for future apps |
| **Akita** | HOLD | Good library but adds dependency | Signals sufficient for now |
| **Elf** | ASSESS | Lightweight alternative to NgRx | Monitor for complex state needs |

---

## Internationalization

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **@angular/localize** | ADOPT | Official Angular solution, compile-time, SSR support | Chosen approach |
| **ngx-translate** | HOLD | Runtime overhead, SSR complexity | Not suitable for SSR |
| **Transloco** | ASSESS | Modern, better than ngx-translate | Consider if runtime i18n needed |
| **i18next** | HOLD | Framework-agnostic but not Angular-optimized | - |

---

## Animation Libraries

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Angular Animations** | ADOPT | Native, declarative, good for simple animations | Route transitions, basic UI |
| **GSAP 3** | ADOPT | Best-in-class, scroll animations, complex timelines | Complex animations |
| **Framer Motion** | HOLD | React-specific | Not applicable |
| **Lottie** | TRIAL | JSON-based animations, designer-friendly | For marketing animations |
| **Motion One** | ASSESS | Modern, performant, Web Animations API | Alternative to GSAP if needed |

---

## Build Tools & Bundlers

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **esbuild (Angular CLI)** | ADOPT | Fast builds, Angular 21 default | Built into Angular CLI |
| **Webpack** | HOLD | Slower than esbuild | Angular CLI abstracts this |
| **Vite** | ASSESS | Extremely fast, growing ecosystem | Not yet Angular-ready |
| **Turbopack** | ASSESS | Next-gen bundler from Vercel | Monitor maturity |

---

## Testing

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Jasmine** | ADOPT | Angular default, mature | Unit tests |
| **Karma** | ADOPT | Angular default test runner | Unit test runner |
| **Playwright** | ADOPT | Modern, reliable, cross-browser | E2E testing |
| **Jest** | ASSESS | Faster than Jasmine | Consider for future |
| **Vitest** | ASSESS | Fast, Vite-native | Monitor Angular support |
| **Cypress** | HOLD | Slower than Playwright | Not chosen |
| **Testing Library** | TRIAL | Better testing practices | Angular Testing Library |

---

## Server-Side Rendering

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Angular Universal** | ADOPT | Official SSR solution | Current approach |
| **Analog.js** | ASSESS | Full-stack Angular meta-framework | Interesting for future |
| **Scully** | HOLD | Static site generator, less maintained | Not needed |

---

## Deployment & Hosting

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Vercel** | ADOPT | Excellent DX, edge functions, CDN | Primary deployment |
| **Netlify** | ADOPT | Alternative to Vercel | Backup option |
| **AWS Amplify** | TRIAL | Full AWS integration | If AWS ecosystem needed |
| **Firebase Hosting** | HOLD | Less feature-rich than Vercel | - |
| **Cloudflare Pages** | ASSESS | Fast, good pricing | Consider for cost optimization |

---

## Performance & Optimization

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Sharp** | ADOPT | Image optimization, best performance | Build-time image processing |
| **Partytown** | TRIAL | Offload scripts to web workers | For third-party scripts |
| **Workbox** | ASSESS | Service worker toolkit | For PWA if needed |
| **ImageOptim** | ADOPT | Image compression | Design/content workflow |

---

## Fonts

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Google Fonts** | HOLD | Privacy concerns, performance overhead | Self-host instead |
| **Self-hosted Fonts** | ADOPT | Performance, privacy, control | Current approach |
| **Fontsource** | TRIAL | npm-based font distribution | Easier updates |
| **Variable Fonts** | ADOPT | Single file, multiple weights | Inter (English) |

---

## CSS Approaches

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Tailwind CSS** | ADOPT | Utility-first, primary approach | Main styling method |
| **CSS Custom Properties** | ADOPT | Theming, runtime changes | Theme system |
| **PostCSS** | ADOPT | CSS processing | Built into Angular CLI |
| **Sass/SCSS** | HOLD | Not needed with Tailwind | Available if needed |
| **CSS-in-JS** | HOLD | Not Angular's approach | Runtime overhead |
| **Panda CSS** | ASSESS | Type-safe CSS-in-JS alternative | Monitor development |

---

## Developer Tools

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **ESLint** | ADOPT | Code quality, standards | Configured |
| **Prettier** | ADOPT | Code formatting | Configured |
| **Husky** | ADOPT | Git hooks | Pre-commit checks |
| **lint-staged** | ADOPT | Lint only staged files | Performance |
| **Conventional Commits** | ADOPT | Commit message standards | Team standard |
| **Commitizen** | TRIAL | Interactive commit messages | Consider for consistency |

---

## Monitoring & Analytics

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Google Analytics 4** | ADOPT | Standard analytics | Basic tracking |
| **Sentry** | TRIAL | Error tracking, performance monitoring | For production monitoring |
| **LogRocket** | ASSESS | Session replay, debugging | If detailed insights needed |
| **Hotjar** | ASSESS | User behavior, heatmaps | Marketing team preference |
| **Plausible** | ASSESS | Privacy-focused analytics | GDPR-friendly alternative |

---

## API & Backend (Future)

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **REST API** | ADOPT | Standard, simple | When backend needed |
| **GraphQL** | ASSESS | Flexible queries | If complex data requirements |
| **tRPC** | ASSESS | Type-safe RPC | If full-stack TypeScript |
| **Supabase** | TRIAL | Backend-as-a-service | Quick backend setup |
| **Firebase** | HOLD | Vendor lock-in concerns | - |

---

## Content Management (Future)

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Strapi** | ASSESS | Open-source, headless CMS | If CMS needed |
| **Sanity.io** | ASSESS | Modern, flexible | Alternative to Strapi |
| **Contentful** | HOLD | Expensive for small teams | - |
| **WordPress (Headless)** | HOLD | Legacy, heavy | - |
| **Markdown/MDX** | TRIAL | File-based content | For blog if needed |

---

## Security

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Helmet.js** | ADOPT | Security headers | For SSR server |
| **OWASP ZAP** | TRIAL | Security testing | Periodic audits |
| **Snyk** | TRIAL | Dependency vulnerability scanning | CI/CD integration |
| **npm audit** | ADOPT | Built-in vulnerability check | Regular use |

---

## Design Tools Integration

| Technology | Status | Rationale | Notes |
|-----------|--------|-----------|-------|
| **Figma** | ADOPT | Design source of truth | Design team tool |
| **Storybook** | ASSESS | Component documentation | Consider if team grows |
| **Chromatic** | ASSESS | Visual regression testing | With Storybook |

---

## Emerging Technologies (Watch List)

| Technology | Status | Rationale | Interest Level |
|-----------|--------|-----------|---------------|
| **Qwik** | ASSESS | Resumability, instant load | High - Future framework |
| **Astro** | ASSESS | Content-focused, islands architecture | Medium - Static generation |
| **Solid.js** | ASSESS | Fine-grained reactivity | Medium - Performance |
| **Bun** | ASSESS | Fast JavaScript runtime | Low - Node.js mature |
| **Deno** | ASSESS | Secure runtime | Low - Node.js sufficient |

---

## Technology Decision Process

### When to ADOPT a Technology

- Proven in production by multiple teams
- Active maintenance and community
- Fits performance budget
- Team has expertise or short learning curve
- Solves clear problem better than alternatives
- Good documentation

### When to TRIAL a Technology

- Promising but limited production use
- Evaluating for specific use case
- Team willing to invest learning time
- Can be isolated (easy to remove if fails)
- Has clear success criteria

### When to ASSESS a Technology

- Emerging but not yet mature
- Gathering information
- Monitoring development
- No immediate need
- Requires significant investment

### When to HOLD a Technology

- Better alternatives exist
- Doesn't fit architecture
- Phasing out
- Performance/security concerns
- High technical debt

---

## Quarterly Review Schedule

### Q1 2025 (Current)
- Review Angular 21 features
- Evaluate Signals maturity
- Assess Analog.js for future projects

### Q2 2025
- Review animation libraries usage
- Evaluate CMS needs
- Assess monitoring tools effectiveness

### Q3 2025
- Review bundle size trends
- Evaluate new testing tools
- Assess design tool integration

### Q4 2025
- Annual technology stack review
- Plan for Angular 22
- Evaluate emerging frameworks

---

## Technology Debt Register

| Technology | Issue | Impact | Plan |
|-----------|-------|--------|------|
| None currently | - | - | - |

*Update as technical debt is identified*

---

## Decision Matrix Template

When evaluating new technology:

| Criteria | Weight | Score (1-10) | Weighted |
|----------|--------|--------------|----------|
| Solves problem | 25% | ? | ? |
| Performance impact | 20% | ? | ? |
| Team expertise | 15% | ? | ? |
| Community support | 15% | ? | ? |
| Documentation | 10% | ? | ? |
| Cost | 10% | ? | ? |
| Security | 5% | ? | ? |
| **TOTAL** | 100% | - | **?** |

Score > 7.5: Strong candidate for ADOPT/TRIAL
Score 5-7.5: Consider for ASSESS
Score < 5: HOLD

---

## References

- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)
- [State of JS Survey](https://stateofjs.com)
- [Angular Blog](https://blog.angular.io)
- [Web.dev](https://web.dev)

---

**Document Owner:** Tech Lead
**Review Frequency:** Quarterly
**Next Review:** 2025-03-05
