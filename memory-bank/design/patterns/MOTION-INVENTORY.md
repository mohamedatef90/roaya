# Roaya Website — Motion Inventory (What Actually Animates, Where)

> **Generated:** 2026-09-14 — read from source.
> **Companion:** `animation-patterns.md` is the *cookbook* (patterns to copy).
> This is the *inventory* (what exists today and where it lives).
> **Related:** `design/PAGE-DESIGN-INVENTORY.md`.

---

## 1. Headline numbers

| Measure | Count |
|---|---|
| `@keyframes` declarations | **226** |
| CSS `infinite` animations | **225** |
| GSAP tweens / triggers (`to`/`from`/`fromTo`/`set`/`timeline`/`ScrollTrigger.create`) | **~283** across 17 components |
| `ScrollTrigger.create` calls | 40 |
| Pinned scroll sections | 4 (3 on AI, 1 in card-stack) |
| Endless GSAP tweens (`repeat: -1`) | 6 |
| Angular `@angular/animations` usages | **0** |

---

## 2. The engine layer

### 2.1 GSAP ScrollSmoother — the global scroll engine

`core/services/scroll-smoother.service.ts` owns one app-wide instance, created by `MainLayoutComponent`:

| Option | Value | Reduced motion |
|---|---|---|
| `smooth` | `1.5` | `0` |
| `effects` | `true` | `false` |
| `smoothTouch` | `0.1` | `false` |
| `normalizeScroll` | `true` | unchanged — stops mobile address-bar show/hide disturbing scroll |
| `ignoreMobileResize` | `true` | unchanged — ignores the mobile keyboard |

Three details worth knowing:

- It **re-initialises at runtime** when the OS reduced-motion preference changes — it listens to the media query, not just its value at boot.
- On init it calls `scrollTop(0)` **unless the URL carries a hash**, because `history.scrollRestoration` is `manual` and a reload mid-page would otherwise land the visitor below the hero.
- Anything `position: fixed` must live **outside** `#smooth-content`. A transformed ancestor breaks fixed positioning, which is why the consent banner, scroll line and init loader sit outside the wrapper in `main-layout`.

### 2.2 The readiness handshake

Components do not animate until the smoother exists. The shared pattern:

```ts
this.scrollSmootherService.smootherReady$
  .pipe(filter(r => r), take(1))
  .subscribe(() => setTimeout(() => this.initAnimations(), 50));

// Fallback: if it is not ready within 500ms, init anyway
setTimeout(() => {
  if (!this.scrollSmootherService.isReady()) this.initAnimations();
}, 500);
```

Used by home, contact, AWS, card-stack, scroll-indicator. **See finding 3** — three of those five have no double-init guard.

### 2.3 Libraries

| Library | Status |
|---|---|
| **GSAP** (+ ScrollTrigger, ScrollSmoother) | The only motion library actually used. All 17 animated components. |
| `@angular/animations` | Dependency, **zero imports**. No Angular animation triggers anywhere. |
| `three` | Dependency + `@types/three`, **zero imports**. |
| `@tsparticles/angular`, `-engine`, `-slim` | Dependencies, **zero imports**. |
| `animejs` + `@types/animejs` | Dependency, **zero imports**. |
| `quill` | Dependency, **zero imports**. |
| `chart.js`, `heatmap.js`, `rrweb`, `rrweb-player` | Admin analytics only — charts, heatmaps, session replay. |

Everything visual on the public site is GSAP or hand-written CSS.

---

## 3. The five motion systems

### 3.1 Boot — the init loader

`shared/components/init-loader/` — an enterprise-style five-stage boot sequence (Connect → Secure → Optimize → Managed → Ready), driven by `requestAnimationFrame`, not CSS timing.

| Constant | Value | Meaning |
|---|---|---|
| `READY_GATE_MS` | 1600 | Sequence **holds at 85%** here until `LoadingService.contentReady()` — so "Ready" is never shown over an app still bootstrapping. Held time is excluded from elapsed. |
| `COMPLETE_MS` | 2200 | Exit cross-fade begins |
| `REDUCED_MOTION_MS` | 700 | Reduced-motion path: jump to the last stage, 100%, finish |

Ten keyframes: `canvas-out`, `stack-out`, `fade-out`, `fx-in`, `pulse-travel`, `node-breathe`, `led-blink`, `rise-in`, `node-ring`, `draw-check`. The connector line fill is computed from the **stage index**, not raw progress, so the line always lands exactly on the node lighting up.

### 3.2 Entrance — hero timelines and scroll reveals

**The home hero** is the most orchestrated moment on the site. A single `gsap.timeline` with nine `gsap.set` calls establishing initial state, then in order:

1. Badge entrance with blur
2. Headline container fade
3. **Word-by-word reveal** with 3D rotation (`rotateX: -20`, staggered)
4. Accent line entrance
5. Accent words stagger (0.05)
6. Description
7. CTA buttons with a bounce ease
8. Trust badges
9. Scroll indicator

Then two endless follow-ons: a subtle float on the badge and a glow pulse on the headline.

**Scroll reveals** are uniform across the site: `ScrollTrigger.create({ trigger, start: 'top 75%' | 'top 80%', once: true })` firing a `gsap.from` with `stagger: 0.1–0.15`. Home alone has triggers for feature cards, process steps, industries, certifications, guarantees, AWS proof items and orb rings, testimonials, case studies and FAQ items.

**The AWS page uses the cleanest convention on the site** — declarative `data-reveal` and `data-reveal-group` attributes collected with `gsap.utils.toArray`, so the template declares what animates and the component stays generic. It is the only page doing this; everywhere else selectors are hardcoded in TypeScript.

### 3.3 Ambient — 225 always-on animations

Infinite CSS animations, by file:

| File | Infinite animations |
|---|---|
| `services/ai` | **78** |
| `services/aws` | 29 |
| `home` | 16 |
| `security/pentest-v2` | 12 |
| `security/incident-response` | 11 |
| `security/security` | 10 |
| home `security-brief` | 7 |
| home `pentest-brief` | 6 |
| home `devops-brief` | 6 |
| `styles.scss` (global), `contact` | 4 each |
| everything else | 1–3 |

Plus 6 endless GSAP tweens (`repeat: -1`) on home, contact, security and WorldPosta.

Representative ambient effects: the home hero's gradient orbs and float elements; the security brief's 500px **radar sweep**; the pentest brief's **matrix rain** and scan lines; the devops brief's `stroke-dasharray` **flow lines**; the AI page's nebula flow, orbit spins, neuron blinks and particle drift; a news **marquee** with a separate RTL keyframe.

### 3.4 Interaction — hover and micro-interaction

Overwhelmingly Tailwind transitions rather than GSAP:

| Duration | Uses |
|---|---|
| `duration-300` | 281 |
| `duration-500` | 69 |
| `duration-200` | 8 |
| `duration-700` | 5 |

Top hover transforms: `group-hover:scale-*` (101), `group-hover:opacity-*` (78), `group-hover:-translate-y-*` (61 — the card lift), `group-hover:translate-x-*` (24 — arrow slide), `group-hover:rotate-*` (7).

GSAP handles the ones Tailwind cannot:

- **Magnetic buttons** — cursor-following translate on home and contact, returning on leave.
- **Mega menu** — `gsap.timeline` open at 0.35s with `back.out(1.2)` spring overshoot, close at 0.25s with `power2.in`; a separate width tween at 0.3s for the expanding panel.
- **Form states** on contact — focus glow, error shake, success icon bounce-in.

### 3.5 Scroll-linked — parallax, pins, progress

| Effect | Where | Mechanism |
|---|---|---|
| Hero parallax | Home, contact | Two layers, `.parallax-slow` / `.parallax-fast`, `scrub: 1` over the hero's height |
| **Card stack** | Home Featured Services | `pin: true`, `pinSpacing: true`, scroll distance computed per card; `onUpdate` drives scale / opacity / y per card inside a `requestAnimationFrame` |
| **Pinned journey** | AI page ×3 | `pin: true`, `scrub: 1`, `end: '+=100%'` and `'+=200%'`; `onEnter` updates a section signal through `ngZone.run` |
| Reading progress | Blog detail | Scroll-driven width on a `navy → teal` gradient bar, `transition-all duration-150` |
| Scroll indicator | Global | Right-edge progress line |
| Stats counters | Home + service pages | `ScrollTrigger` at `top 80%`, 2s count-up over 60 steps with ease-out cubic, landing exactly on the published figure |

The stats counter has a subtlety worth preserving: SSR renders the **final** value so crawlers read one figure, and the count-up only runs for a section the reader has not reached yet — otherwise a visible section would snap backwards to zero.

---

## 4. Per-page motion profile

| Page | GSAP calls | Keyframes | Infinite | Character |
|---|---|---|---|---|
| **services/ai** | 75 | 54 | 78 | Pinned scroll journey through 14 acts. Heaviest by a wide margin |
| **home** | 41 | 17 | 16 | Orchestrated hero timeline, card stack, 10+ scroll reveals |
| **security/pentest-v2** | 24 | 12 | 12 | Neural-network hub, status pulses |
| **security/incident-response** | 23 | 11 | 11 | Emergency scanning lines, NIST timeline |
| **security/security** | 15 | 9 | 10 | Tabbed solutions, partner wall |
| **services/worldposta** | 14 | 1 | 0 | Reveals only; the visual weight is static Bento |
| home `devops-brief` | 12 | 7 | 6 | Pipeline flow lines |
| `service-brief-section` (shared) | 11 | — | — | Generic alternating reveal |
| **contact** | 11 | 5 | 4 | Golden standard: 3D float, parallax, magnetic, form states |
| home `security-brief` | 10 | 8 | 7 | Radar sweep, hex grid |
| home `pentest-brief` | 10 | 8 | 6 | Matrix rain, terminal scan lines |
| `card-stack` (shared) | 9 | — | — | The pinned stacking effect |
| **security/soc-solutions** | 9 | 3 | 2 | Command-centre status blinks |
| **services/devops** | 6 | 4 | 3 | Terminal and dashboard panels |
| `mega-menu` (shared) | 5 | — | — | Spring open / fast close |
| **security/penetration-testing** | 5 | — | — | Animated counters, category filters |
| **services/aws** | 4 | 23 | 29 | Few GSAP calls, but declarative `data-reveal` plus a heavy ambient CSS layer |
| **init-loader** (shared) | — | 10 | 3 | rAF-driven boot sequence |
| Standard service pages ×6, SAP, pricing, about, industries, legal | 0 | 1–2 | 0–1 | Tailwind hover transitions and a single reveal keyframe |

---

## 5. Accessibility

**The global catch-all** lives in `styles.scss` and is the real safety net:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  .animate-float, .animate-float-delayed,
  .animate-shimmer, .animate-pulse-glow { animation: none !important; }
}
```

Because it targets `*` with `!important`, the handful of component stylesheets with no local guard are still covered.

> An identical block exists in `styles/base/_reset.scss` — but that file is **never imported** (see finding 5), so it does nothing. The `styles.scss` copy is the one that ships.

**23 TypeScript files** check `matchMedia('(prefers-reduced-motion: reduce)')` before creating GSAP work, including every animated page component, the card stack, the mega menu, the init loader and the reading progress bar. The ScrollSmoother service is the only one that also *reacts* to the preference changing mid-session.

---

## 6. RTL

Motion is direction-aware, handled three ways:

1. **Mirrored keyframes** — `radar-sweep-rtl`, `flow-dash-rtl`, `scan-border-top-rtl`, `marqueeRTL`, each selected by a `[dir='rtl']` block.
2. **A direction multiplier** — the AWS page sets `--aws-dir: 1`, flipped to `-1` under `[dir='rtl']`, which reverses every directional transform in that stylesheet from one declaration.
3. **Tailwind `rtl:` variants** — 116 × `rtl:rotate-180` (arrows and chevrons), plus `rtl:right-auto` / `rtl:left-auto` positioning and 14 × `rtl:group-hover:-translate-x-1`.

22 of the 27 directional hover translates have an RTL counterpart. **Five do not** (finding 9).

---

## 7. Findings

1. **225 always-on animations, none paused when off-screen or when the tab is hidden.** There is no `visibilitychange` listener and no IntersectionObserver gating ambient motion anywhere in the app. The AI page runs 78 infinite animations concurrently; a backgrounded tab keeps compositing all of them. Pausing on `document.hidden` is a few lines; pausing off-screen sections needs an observer per section.

2. **`effects: true` is enabled on ScrollSmoother with zero consumers.** No template uses `data-speed` or `data-lag`. The plugin's effects pass runs on every scroll for nothing, and all parallax is instead hand-built with `scrub` tweens. Either adopt `data-speed` (it is cheaper than the manual tweens) or set `effects: false`.

3. **Three components can initialise their animations twice.** `contact`, `services/aws` and `card-stack` use the ready-or-500ms-fallback pattern with **no double-init guard**. If ScrollSmoother becomes ready *after* 500ms — a slow device, a heavy page — the fallback runs first and the subscription then runs again. On `card-stack` that means a second `pin: true` ScrollTrigger over the same element. `home` has the guard (`animationsInitialized`); copy it to the other three.

4. **Keyframe and class-name collisions between Tailwind and `styles.scss`.** `fadeIn`, `fadeInUp`, `slideInRight`, `slideInLeft` and `scaleIn` are each declared twice — once in `tailwind.config.js > keyframes`, once in `styles.scss`. The class names `.animate-fade-in-up`, `.animate-fade-in`, `.animate-scale-in`, `.animate-slide-in-*` are likewise generated by Tailwind's `animation` extend *and* hand-written in `styles.scss` outside any `@layer`, so the hand-written ones win by source order. Pick one source.

5. **`styles/utilities/_helpers.scss` is never imported** — 361 lines carrying 5 more keyframes and a parallel set of `.animate-*`, `.glass` and `.shadow-*` utilities that never reach the build. Same for `base/_reset.scss`, `base/_typography.scss` and `base/_variables.scss`.

6. **Two scroll directives are entirely unused.** `AnimateOnScrollDirective` (IntersectionObserver, 8 animation types, stagger support, reduced-motion aware) and `ScrollFadeInDirective` (11-threshold progressive opacity) are imported by nothing. ~200 lines of dead code — and ironically the observer-gating that finding 1 asks for is already written here.

7. **Of the global animation utilities, only one is really used.** `animate-fade-in-up` appears 153 times; `animate-float` once, `animate-fade-in-down` once. `animate-shimmer`, `animate-pulse-glow`, `animate-scale-in`, `animate-slide-in-left/right` and `stagger-children` are declared globally and used in templates zero times.

8. **Non-composited properties are animated in places.** Inside keyframes: 17 × `box-shadow`, 15 × `background-position`, 8 × `filter` — all paint-heavy — plus 4 × `left`, 3 × `right` and 1 × `width`, which trigger layout. `will-change` appears on only 21 declarations against 226 keyframes.

9. **Five directional hover translates have no RTL counterpart**, so those arrows slide the wrong way in Arabic.

10. **Five unused animation libraries ship in `package.json`** — `three` (+types), `@tsparticles/angular`, `@tsparticles/engine`, `@tsparticles/slim`, `animejs` (+types) and `quill`. Tree-shaking keeps them out of the bundle, but they are install weight, audit surface and a misleading signal about how the site is built.
