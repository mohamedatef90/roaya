# Roaya Website — Design Style Inventory (Every Page, Every Section)

> **Generated:** 2026-09-14 — read from the source, not from prior docs.
> **Scope:** public site (`src/app/features`, `src/app/layouts`, `src/app/shared`) + admin shell.
> **Companion docs:** `design/system/ROAYA-BRAND-DESIGN-GUIDE.md` (brand rules),
> `design/patterns/*` (animation, glassmorphism), `design/components/component-library.md`.

---

## 1. How styling is layered

Load order matters — this is the actual order in `angular.json > styles`:

| # | File | Holds |
|---|---|---|
| 1 | `src/styles/tokens.css` | **Theme-agnostic**: radii, spacing, type scale, transitions, z-index, container widths, brand ramps (50→950) |
| 2 | `src/styles/themes/light.css` | **Colour only** for `:root, [data-theme="light"]` |
| 3 | `src/styles/themes/dark.css` | **Colour only** for `[data-theme="dark"]` |
| 4 | `src/styles.scss` | Base reset, typography, global utilities; imports `styles/theme.scss` (PrimeNG + admin skin) |
| 5 | Component SCSS | Per-page bespoke themes, scoped by `:host` |

**The governing rule** (stated in `tokens.css`): *components consume semantic tokens only — never hardcode a light- or dark-mode colour inside a component.* Section 10 records where that rule is broken.

Theme is switched by `data-theme` on `<html>`, set **inline in `index.html` before first paint** (no flash), then owned by `ThemeService`. Direction is `dir="ltr|rtl"` on `<html>`, owned by `LanguageService`.

---

## 2. The brand core

### 2.1 Colour

Three brand hues, each a full 50→950 ramp mirrored between CSS custom properties and Tailwind:

| Role | Hex | Name |
|---|---|---|
| Primary | `#3D5A80` | Roaya Navy |
| Secondary | `#5DB7C2` | Roaya Teal |
| Accent | `#6B4C9A` | Roaya Purple |

Gradients: `--gradient-primary` = navy→teal 135°; `--gradient-accent` = purple→teal 135°.

**Surfaces**

| Token | Light | Dark |
|---|---|---|
| `--color-background` | `#FFFFFF` | `#0F1B2A` |
| `--color-surface` | `#F8FAFC` | `#1A2332` |
| `--color-surface-elevated` | `#FFFFFF` | `#253449` |
| `--color-border` | `#DBE3EC` | `#374A61` |
| `--color-text-primary` | `#1E293B` (14.6:1) | `#F1F5F9` (15.8:1) |

**The `-on-surface` family is the most important detail in the palette.** Brand and semantic colours are tuned for *fills* — teal is only 2.33:1 as text on white. A parallel set (`--color-secondary-on-surface: #2F6B73`, `--color-success-on-surface: #047857`, etc.) exists for text, icons and thin strokes, and every one clears 4.5:1 in both themes. Fill token for fills, `-on-surface` token for text. Never the other way round.

Also themed rather than left to the UA: text selection, caret, scrollbar thumb, and `color-scheme`.

### 2.2 Typography

- **English:** Inter. **Arabic:** Tajawal. Both Google Fonts; the `font-arabic` utility swaps the stack.
- Scale runs `xs` 12px → `9xl` 128px. Display sizes (`5xl`+) drop to `1.16` line-height; body sizes keep generous leading.
- Weights 300–800; headings typically 600–800.
- **Per-route fonts:** the AI page loads Space Grotesk inside its own lazy stylesheet rather than globally, deliberately, so one page's display face doesn't block first paint site-wide.

### 2.3 Geometry, elevation, motion

- **Radii:** `xs` 6 → `sm` 8 → `md` 12 → **`lg` 16 (standard card)** → `xl` 20 (featured) → `2xl` 24 (hero) → pill.
- **Shadows are theme-driven.** Tailwind's `shadow-*` scale is remapped onto `--shadow-*` tokens, because stock Tailwind shadows are fixed black at light-mode alpha and were invisible on the `#0F1B2A` dark ground across 250+ elements. Each is two-layer: a tight contact shadow plus a wider ambient one. Named elevations `soft` / `medium` / `hard` / `brand` sit alongside.
- **Motion:** `fast` 150ms, `base` 200ms, `slow` 300ms, `slower` 500ms — all `cubic-bezier(.4,0,.2,1)`. Theme transitions animate presentation properties only, never layout.
- **Z-index:** a single documented scale, dropdown 100 → tooltip 700.

### 2.4 Breakpoints

Unusually granular, and deliberately so — the config calls 1280–1536 "the critical zone":

`xs` 375 · `sm` 430 · `md` 768 · `lg` 1024 · `laptop` 1280 · `laptop-md` 1366 · `laptop-lg` 1440 · `laptop-xl` 1536 · `desktop` 1600 · `desktop-lg` 1920 · `desktop-xl` 2560

Container padding scales with them, 1rem → 6rem.

---

## 3. The section grammar

Almost every page is assembled from the same vocabulary. Learn these ten and you can read any template.

| Block | Visual signature |
|---|---|
| **Hero** | Full-bleed gradient or dark ground, white text, decorative background layer, badge → H1 → lead → CTA pair |
| **Stats strip** | `py-12 md:py-16`, `-mt-1` so it tucks under the hero, 3–4 animated counters |
| **Section header** | Centred: pill badge → H2 → muted subtitle, `max-w-3xl mx-auto` |
| **Glow card** | Card plus an absolutely-positioned blurred gradient sibling that fades in on hover (`opacity-0 group-hover:opacity-100`) |
| **Glass card** | `backdrop-blur` + translucent surface + hairline border; used over imagery and dark grounds |
| **Bento grid** | Mixed-span tiles (SAP, WorldPosta) |
| **Tabbed panel** | Category tabs swapping a content pane (Security, Pen Testing) |
| **Process timeline** | Horizontal with connector arrows on desktop, vertical rail on mobile |
| **Logo wall** | Greyscale→colour on hover, tooltip above, dark-mode CSS filters |
| **Final CTA** | `bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900`, white text, twin buttons |

**Vertical rhythm.** Service pages use `py-16 md:py-24`. Marketing pages (home, about, pricing, industries, resources) use a flat `py-20`. Stats strips use `py-12`.

**Alternation.** Consecutive sections alternate `bg-background` → `bg-surface`, with `bg-gradient-to-b from-background via-surface to-background` used as a soft third beat to avoid a hard banding rhythm.

---

## 4. Hero taxonomy

Five distinct tiers, in descending order of production value:

| Tier | Pages | Treatment |
|---|---|---|
| **1 — Cinematic** | Home | Full-screen, animated mesh gradient, gradient orbs, hero image under gradient, dark overlay for contrast, noise/grain layer, word-by-word headline animation, scroll-down indicator |
| **2 — Bespoke themed** | AI, AWS, DevOps, SOC, Incident Response, Pentest v2, WorldPosta | Near-black grounds with a page-specific palette and animated backdrop (see §6) |
| **3 — Deep brand gradient** | 7 standard service pages, Contact, Service Detail | `from-primary-900 via-primary-800 to-accent-900`, white text, `min-h-[60–70vh]` |
| **4 — Bright brand gradient** | Industries, Pricing, About, Resources, Case Studies, Blog Detail | `from-primary-600 via-primary-500 to-secondary-500`, `py-16`/`py-20`, no min-height |
| **5 — Soft tint** | Blog listing, Privacy/Terms/Cookies | `from-primary-50 to-secondary-50` (dark: neutral-900), dark text |

---

## 5. Page-by-page inventory

### 5.1 Home — `features/home/` (1,514 lines HTML, 1,722 SCSS)

The only page organised as an explicit **conversion narrative**, with the phases written into the template as comment banners:

**Phase 1 — Awareness**
1. Cinematic hero (tier 1)
2. **Stats** — glassmorphism cards, glow-on-hover, SSR renders the final figure
3. **Why Roaya** — split screen, background image + overlay, 2×2 glass feature grid; light mode reuses the hero's gradient ramp, dark mode a deep neutral wash

**Phase 2 — Trust**
4. **Sectors We Serve** — logo grid on `bg-muted/30`, hover tooltip placed above the tile to avoid layout shift
5. **Trusted By** — client logo grid on `bg-background`, trust indicators row
6. **How It Works** — process cards with step numbers, icons, duration badges, connector arrows; vertical timeline on mobile
7. **Service briefs** — three themed sub-components (§6.1)
8. **AWS Partnership** — "migration corridor" backdrop, orbital rings and floating motes, credential orb, proof points

**Phase 3 — Exploration**
9. **Industries preview** — glow cards on `bg-surface`
10. **Featured Services** — the `<app-card-stack>` **stacking-cards** effect, GSAP-pinned
11. **View-all CTA** — deliberately overlaps the pinned stack to mask its end
12. **Case Studies preview** — industry tag, metric badge, glow card; `z-20` plus an opaque fill so the pinned stack scrolls beneath it

**Phase 4 — Conversion**
13. **ROI Calculator preview** — three calculator-type cards plus a stats row
14. **Get Custom Quote** — features grid and CTA

**Phase 5 — Reassurance**
15. **Security & Certifications** — badge grid with glow, guarantees row
16. **Local Expertise + WorldPosta** — two-column, stats row (uptime figures pinned to the claim registry)
17. **Testimonials** — auto-advancing carousel with a visible **pause button**, quote icon, metric badge, avatar, stars, arrows, dot nav and an "X of Y" counter
18. **FAQ** — left header/CTA, right accordion

**Phase 6 — Action**
19. **Final CTA** — background pattern, floating 3D elements, shine-effect button

### 5.2 The standard service template

**`/services/cloud`, `/email`, `/backup`, `/managed`, `/consulting`, `/automation`** are the same nine sections in the same order — near byte-identical templates (~420 lines) and identical 356-line stylesheets:

1. Hero (tier 3) → 2. Stats `-mt-1` → 3. **Service Categories — "Bold Minimalism"** → 4. Key Benefits (gradient beat) → 5. Industries Served (`bg-surface`) → 6. Differentiators → 7. Pricing Teaser → 8. Related Services → 9. Final CTA

Only deviation: **`/services/automation`** swaps section 3 for an **F-pattern / Z-pattern** alternating layout.

**`/services/:id`** (dynamic Service Detail) is a 7-section reduction of the same template — no stats strip, no differentiators.

### 5.3 Bespoke service pages

| Page | Sections | Character |
|---|---|---|
| **`/services/aws`** | credentials → why → regions (`--sunk` variant) → support → questions → buyer facts → CTA | Its own `--anr-*` token layer over near-black `#070d18`; electric blue = structure, cyan = healthy, violet = ambient only. Uses `--aws-dir: 1/-1` to flip every directional animation in RTL. **5,627 lines of SCSS** |
| **`/services/ai`** | 14 `journey-section`s: entry → transformation → solution → strategic → enterprise → agentic → constellations → governance → outcomes → milestones → frameworks → whyus → destination → related | **3D space-journey**, off-palette by design: `--space-void #000`, nebula cyan/purple/blue/green, danger reds for the problem act, portal transitions, layered glows. Space Grotesk display face. **6,918 lines of SCSS** — the most elaborate page on the site |
| **`/services/devops`** | 16 sections | Alternates the corporate palette with **two GitHub-dark panels** (`#0d1117`) for the production-conditions dashboard and the tooling terminal |
| **`/services/sap`** | 9 sections | Standard skeleton, but categories become a **Bento Grid** |
| **`/services/worldposta`** | 10 sections | Carries **WorldPosta's** brand colours in the hero; two Bento grids (products, benefits); a "Know About WorldPosta" partner block |

### 5.4 Security cluster

All four share a **command-centre aesthetic**: `#0f172a` ground, status colours (green = active, amber = warning, red = critical, cyan = accent), scanning-line pseudo-elements.

| Page | Sections | Accent |
|---|---|---|
| **`/services/security`** (overview) | 12 — hero, stats, threats, outcomes, **tabbed solutions**, partners, frameworks, why-roaya, industries, hidden pricing teaser, related, CTA | Standard palette with dark accents |
| **`/services/security/penetration-testing`** | 12 — including approach split-layout, tabbed services, process timeline, **12 service categories**, reporting, standards | Flat `bg-primary-900` hero plus grid overlay; why-roaya matches the hero so the CTA gradient continues without a seam |
| **`/services/security/soc-solutions`** | 9 — intro, outcomes, workflow timeline, **packages**, integrations, standards, why-roaya, CTA | `--soc-status-active: #10b981` (green = watching) |
| **`/services/security/incident-response`** | 12 — triggers, engagement options, **NIST process timeline**, AI-assisted, forensics, integrations, standards | `--ir-status-active: #ef4444` and `--ir-gradient-emergency` red→orange |
| **`/services/security/pentest-v2`** | 9 — environment, provide, **AI neural-network hub**, outcomes, operate, frameworks, differentiators | `--pentest-gradient-ai` cyan→blue |

### 5.5 Marketing and content pages

| Page | Sections |
|---|---|
| **`/services`** | Hero (tier 4) → services grid → why-choose → CTA |
| **`/industries`** | Hero (teal-led gradient — the only one that leads with secondary) → grid → why-expertise → case studies → CTA |
| **`/industries/:id`** | Industry-context hero → compliance requirements → recommended services → use cases → why-roaya → CTA |
| **`/pricing`** | Hero → **packages (dynamic from admin)** → lead-capture form → trust badges → FAQ → CTA |
| **`/about`** | Hero → stats bar → our story → values → **team (dynamic)** → timeline → mission & vision → partnership → CTA |
| **`/contact`** | Hero with 3D floating elements → **glassmorphism contact section** → map with 3D card effect → CTA. Documented as the **golden-standard** implementation: GSAP scroll triggers with `ngOnDestroy` cleanup, magnetic buttons, animated form-error states, success animation |
| **`/roi-calculator`** | Hero → calculator and lead capture → what-you'll-receive → social proof (solid gradient band) → CTA |
| **`/resources`** | Hero → 4-card resources grid → CTA |
| **`/resources/blog`** | Soft-tint hero → featured posts → content grid with filters and search → newsletter → CTA |
| **`/resources/blog/:slug`** | Article hero, reading-progress bar, table of contents, author card, related posts |
| **`/resources/case-studies`** | Hero → stats band → filters → grid → CTA |
| **`/resources/case-studies/:slug`** | 11 sections: hero → overview → challenge → solution → **results (solid brand gradient)** → testimonial → timeline → services delivered → actions → related → CTA |
| **`/privacy` `/terms` `/cookies`** | Soft-tint hero → sticky TOC plus 13 anchored `scroll-mt-24` content blocks |
| **`/resources/whitepapers` `/documentation`** | Coming-soon placeholder |

---

## 6. Themed sub-components

### 6.1 Home service briefs — three deliberately different visual worlds

| Component | Theme | Technique |
|---|---|---|
| `security-brief-section` | Protection and monitoring | Inline-SVG **hexagonal grid** (blue in light, cyan in dark), 500px animated **radar sweep** |
| `pentest-brief-section` | Hacking and discovery | **Matrix rain** in pure CSS gradients, terminal panel, scan lines, green hacker palette. Uses `Fira Code`/`Consolas` fallbacks rather than loading JetBrains Mono — a webfont for a decorative panel would have added tens of KB to the **homepage** |
| `devops-brief-section` | Automation and pipelines | Animated `stroke-dasharray` **flow lines**, container and deployment motifs, teal/violet |

### 6.2 `card-stack`

Scroll-pinned stacking cards, with its own `card-sm/md/lg/xl/active` shadow scale in the Tailwind config. Drives the home Featured Services section.

### 6.3 `service-brief-section` (shared)

Configurable alternating content/visual brief block, driven by an interface — the generic counterpart to the three bespoke home briefs.

---

## 7. Shared UI kit — `shared/components/ui/`

A shadcn-style kit organised by role:

- **primitives:** alert, badge, card, input, label, separator, skeleton, spinner
- **form:** checkbox, date-picker, form-field, input-number, multi-select, password-input, select, textarea
- **data:** avatar, chip, data-table, inplace-edit, pagination, tag, timeline
- **feedback:** confirm-dialog, dialog, sheet, toast, tooltip
- **navigation:** dropdown-menu, mobile-nav, sidebar, tabs

Plus site-level shared components: `author-card`, `button`, `card-stack`, `consent-banner`, `image-upload`, `init-loader`, `language-selector`, `loading-spinner`, `mega-menu`, `newsletter-signup`, `reading-progress`, `scroll-indicator`, `service-brief-section`, `service-facts`, `table-of-contents`, `theme-toggle`.

**Directives:** `animate-on-scroll`, `scroll-fade-in`, `auto-translate`.

**Global utility classes** (in `styles.scss`): `.container-custom`, `.cinematic-ramp`, `.glass`, `.modern-card`, `.text-gradient`, `.skeleton`, `.hover-lift` / `.hover-scale` / `.hover-glow`, `.animate-fade-in-{up,down,left,right}`, `.animate-float`, `.animate-shimmer`, `.animate-pulse-glow`, `.stagger-children` (6 steps), `.ms-auto` / `.me-auto` for logical RTL spacing.

---

## 8. Layout chrome

**Header** — fixed sticky, `80px` default shrinking to `64px` scrolled (`--header-height` tokens). The logo doubles as the only Home link. Three mega menus (Solutions, Industries, Resources) with an expandable nested Cybersecurity branch. Theme toggle and language selector, desktop-only, plus a CTA button.

**Mobile nav** — full-screen floating card sliding from the top, with its own header (logo and close), collapsible service and industry trees including two levels of nesting, CTA, and a footer row carrying the theme and language controls.

**Footer** — `site-footer` with logo, description, trust chips (Security First, Certified), and Solutions / Company / Resources / Legal columns, all driven by `--footer-*` custom properties.

**Overlays** — `init-loader` enterprise intro that cross-fades into the page, right-edge scroll-progress line, GDPR consent banner. Fixed overlays sit **outside** the GSAP ScrollSmoother wrapper, since a transformed ancestor breaks `position: fixed`.

---

## 9. Admin panel

A separate design language, intentionally. Lives in `styles/theme.scss`: PrimeNG components (`p-card`, `p-datatable`, `p-button`, `p-dropdown`, `p-dialog`, `p-toast`, `p-calendar`, `p-sidebar`, `p-menu`) restyled onto shadcn-flavoured semantic tokens, plus `.admin-layout`, `.glass`, `.modern-card`, and `badge-success|warning|error|info`. Dense, utilitarian, no glassmorphism theatre.

> `src/styles/admin-theme.scss` is **dead** — an earlier draft, imported by nothing. Its own header says so. Do not edit it expecting a change.

---

## 10. Where the system drifts

Findings from reading the templates, not from the docs:

1. **92 raw `bg-gray-*` usages** across 17 public templates — `managed`, `automation`, `service-detail`, `industry-detail`, `sap`, `worldposta`, the security cluster and others use `bg-gray-50 dark:bg-gray-900` where their siblings use `bg-surface`. This is exactly the rule `tokens.css` states, broken. Cosmetically close today; it means those sections will not follow a future palette change.
2. **Hardcoded hex in templates** — `bg-[#5DB7C2]` ×3 (that is the teal token, spelled literally), `bg-[#0d1117]` ×2 and `bg-[#010409]` (GitHub dark, intentional for the DevOps terminal panels), plus brand hexes for the Facebook and LinkedIn icons (legitimate).
3. **The two biggest stylesheets total 12,545 lines** — AI (6,918) and AWS (5,627), more SCSS than the rest of the public site combined. Both are bespoke by intent, but neither can inherit a design-system change.
4. **`DESIGN-SYSTEM.md` does not exist.** `CLAUDE.md` names it as the consolidated design-system reference at the project root; there is no such file. The real sources are `styles/tokens.css`, the two theme files, and `design/system/ROAYA-BRAND-DESIGN-GUIDE.md`.
5. **A hidden section ships in the DOM** — `/services/security` carries a pricing teaser inside `class="hidden ..."`. It is markup, translations and images downloaded on every visit for something no one sees.
6. **Six service pages are byte-identical templates.** Cloud, email, backup, managed, consulting and automation differ only in content bindings and one layout variant. Any fix to that layout has to be made six times, and `managed` has already drifted from the other five.
