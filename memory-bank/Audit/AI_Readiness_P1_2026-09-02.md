# AI Readiness — P1, first tranche (2 September 2026)

Follows `AI_Readiness_Reconciliation_2026-09-02.md`, which closed P0. This covers the P1
items that could be built without facts only the product owner can supply. Nothing here is
committed or deployed.

## Why these three, and not the rest of P1

P1 in `AI_Readiness_Action_Plan_2026-09-02.md` has six items. Three of them — the Service
Facts model, the performance budget, and the CI link-graph — are either blocked on the open
decisions or are separate bodies of work. The three below are the ones an AI system and an
agent actually consume, and none of them needed a decision:

| P1 item | Status |
|---|---|
| 2. Align structured data with visible facts | **Done** (Service + FAQPage) |
| 3. Unambiguous factual counters | Done in the P0 pass |
| 4. Deterministic forms for people and agents | **Done** (contact form) |
| 1. Service Facts model on every service page | **Model done**, 6 of 24 facts publishable — the rest need decisions 1, 2 and 5 |
| 5. Performance (LCP/TBT budgets) | **Fonts fixed and budget gated.** Lighthouse baseline still needs real hardware |
| 6. CI link-graph report | Not started. The locale-aware link pass (2026-09-01) covers the bilingual half |

## 1. Structured data: every service page now says what it sells

Before this, one page in the whole site — `/services/worldposta` — declared a `Service`.
An assistant asked "does Roaya run a SOC in Egypt?" had to infer the answer from prose.

**14 service routes** now emit a `Service` node in both locales: cloud, security (plus
penetration testing, SOC and incident response), email, managed IT, backup, consulting, SAP,
DevOps, automation, AI and AWS. Each carries the page's own `@id` and URL, the canonical
service name, `provider` pointing at the Organization node, and `areaServed: Egypt`.

**Two pages** emit a `FAQPage` from their visible questions and answers: the homepage (4)
and AWS (6).

What keeps it honest, in `entity-taxonomy.ts`:

- A **name** is the label the site already uses everywhere for that service. A label is not
  a claim.
- A **description** is emitted only where the page renders that exact sentence in its own
  `<main>`, verified against the built server output. Four pages qualify; the rest keep
  their body copy hard-coded in their components, so they get a named Service node with no
  description rather than a borrowed one. `description` is optional in the type for exactly
  this reason.
- Both keys must resolve in English and Arabic, so the Arabic graph is Arabic.

### The AWS FAQ was invisible to crawlers

The new gate refused the AWS `FAQPage` on its first run: the six answers were not in the
served HTML. The accordion removed them from the DOM with `@if` until a click, and a crawler
clicks nothing — so six answers the page exists to give reached no reader who did not use a
mouse, and the schema would have asserted content the page never showed.

Fixed at the page, not by dropping the schema: the answers now stay in the DOM and collapse
with CSS grid rows, matching the homepage accordion, with the animation disabled under
`prefers-reduced-motion`.

## 2. Forms: an agent can now tell what happened

The contact form already had conditional `aria-invalid`, `aria-describedby` and per-field
`role="alert"` messages — they only appear once a field is in error, which is why a scan of
the clean page finds none. What was missing:

| Added | Why |
|---|---|
| `autocomplete` on name, email, phone and company | Nothing told a browser or an agent what these fields hold |
| An error summary with `role="alert"`, listing every field that blocked the submit and why, each entry focusing its field | Five messages scattered beside inputs is not something a screen-reader user or an agent can act on. It appears only after a submit is refused |
| Focus moves to the first invalid field on a refused submit | Previously the only signal was red text, possibly below the fold |
| The submission reference on success | The API already returned an id and it was thrown away. An agent can now report a verifiable outcome instead of inferring success from a green tick |

## 3. Gates

`ssr-crawler-semantics` now also asserts, against the rendered HTML of the production build:

- every route declared in `SERVICE_ENTITY_KEYS` emits its `Service` node in both locales,
  with a translated name (not a raw i18n key) and a provider reference;
- an Arabic Service name that is identical to English fails, unless the string is plain
  Latin text — a product name may legitimately be untranslated, a sentence may not;
- every route declared in `FAQ_ENTITY_KEYS` emits a `FAQPage` whose every question and
  answer is non-empty **and present in that page's own HTML**.

That last rule is what caught the AWS accordion. Declaring a route in the taxonomy is not
the same as the node reaching the page: the graph is composed at render time from translated
keys, so a renamed key produces silence, not an error.

## 4. Two long-standing red tests fixed

`structured-data.service.spec.ts` had two failures, both reproduced unchanged at `HEAD` in a
scratch worktree, so neither was caused by this work:

- It expected `foundingDate: '2018'`. The code has said 2012 since the 2026-09-01 decision.
  The expectation now reads `ORGANIZATION_FOUNDING_DATE`, so it tests that the year is
  emitted while `company-facts-consistency` guards what the year is.
- It expected a case-study breadcrumb to stop at the listing page with no `WebPage` node.
  The 2026-09-01 approvals unblocked the leaf title, the 2026-09-02 pass emitted it, and
  `ssr-content-quality` now *requires* the trail to end at the page. The spec was left behind.

Six new tests cover the Service and FAQPage emission, including the no-description case and
the unknown-route case.

## Verification

| Check | Result |
|---|---|
| Production build | Pass |
| `npm run verify:evidence` | **15 of 15 gates pass** |
| Deploy gate simulations | Both pass |
| Frontend specs | 91 of 91 |
| Backend unit tests | 65 of 66 (the one failure is the pre-existing `lead.service` test) |

Observed on the built server: 14 service routes emit `Service` in both locales, the Arabic
SOC node carries an Arabic name and description, `/` and `/services/aws` emit `FAQPage` with
4 and 6 questions, the AWS answers are in the served HTML, and the contact form ships four
`autocomplete` tokens with the error summary correctly absent until a submit fails.

## 5. Performance (P1.5)

### What the numbers actually were

The "1.01 MB over a 750 kB budget" warning is a **raw-size** budget. Measured properly —
gzipped, following the module graph rather than only the files `index.html` names — the
initial payload is **253.4 kB across 19 files**. The first measurement attempt read only the
13 files `index.html` references and reported 133.7 kB; six more initial chunks arrive as
static imports one level down, so that under-counted by ~90 kB. The gate now walks the graph.

Checked and found already correct: GSAP, Three.js, Sentry, Quill and Chart.js are **all
lazy** — none is in the initial graph. Google Tag Manager and the Meta pixel both load
`async`. There is no eager icon set. No single dependency dominates the 253 kB; it is
Angular's framework, router, forms, http, i18n and hydration plus the app shell.

### The real finding: fonts

The build has `optimization.fonts` enabled, so Angular replaces the Google Fonts `<link>`
with inlined `@font-face` rules at build time. That changes the economics completely: a
requested family is not a lazy download, it is **bytes written into every HTML document**.

Production was requesting **four families / thirteen faces**, producing **57 `@font-face`
rules and 21 kB of inline CSS on every page**. Two of those families were used by lazy
routes only:

| Family | Used by | Action |
|---|---|---|
| Inter | Body text, everywhere | Kept on the critical path |
| Tajawal | Arabic body text | Kept on the critical path |
| Space Grotesk | The AI page's display headings, one route | Moved into that route's stylesheet, trimmed to the three weights it sets |
| JetBrains Mono | Two decorative terminal panels | Dropped to the `'Fira Code'/'Consolas'/monospace` fallbacks already declared |

JetBrains Mono was deliberately *not* re-imported for the homepage terminal panel: because
faces are inlined, pulling it in would put tens of kilobytes of `@font-face` into the most
important page of the site for a decorative element that renders correctly without it.

**Result: 27 faces / 9.9 kB per document, down from 57 / 21 kB** — 11.1 kB of CSS removed
from every page, plus two font files no longer fetched anywhere. Also removed: a
`rel="preload"` pointing at the Google Fonts URL, which inlining means nobody ever requests,
and two dead `@import url(...)` font requests in an unreferenced stylesheet that would have
added sixteen more faces to any build that ever wired the file in.

### The gate

`critical-path-budget` measures, from the build, what first paint waits for: initial gzipped
transfer (following the module graph), inlined `@font-face` bytes and families, blocking
cross-origin stylesheets, and synchronous third-party scripts.

The transfer budget is set at **260 kB — the measured 253.4 kB plus headroom**. That is a
ratchet, not a target: it is recorded so a regression fails the build, and raising it has to
be a deliberate line in a diff. Bringing the number down means splitting the app shell,
which is its own change with its own measurement.

**Still needed:** a Lighthouse LCP/TBT baseline under the agreed mobile profile. That needs
Chrome on the agreed hardware and cannot run in this environment; the plan's milestones stay
unmeasured until someone runs it and files the result as a release artifact.

## 6. Service Facts (P1.1)

Built the model and shipped the facts that exist — which is very few, and that is the point.

`src/app/core/seo/service-facts.ts` holds all eight fields the action plan asks for
(our role, platforms and regions, data residency, resilience, availability SLA, support,
delivery, commercial terms) for **all 14 service routes**. Each field is either:

- **published** — backed by a registry claim (`claimId`) or mirroring a sentence the page
  already renders (`valueKey`), or
- **pending** — naming the decision document that unblocks it.

**Coverage today: 6 published, 18 pending.** WorldPosta can prove three (exclusive MENA
partner; 99.99% availability, scope-locked to CloudEdge and Posta by the registry; Egyptian
data-centre options). AWS can prove three (partner tier, platform and regions, and its
deliberately conditional residency answer). Every other service can prove nothing yet.

### Pending facts are not rendered

`<app-service-facts>` renders published facts only, as a `<dl>`, and renders **nothing** for
a service with none. A public table reading "SLA: to be confirmed" tells a buyer less than
saying nothing and reads as immaturity. The gaps live in the model, where they are countable
and owned, not on the page. It is wired into the WorldPosta and AWS pages and verified in
both locales — the Arabic page renders Arabic values, not a fallback.

### The gate

`service-facts-integrity` enforces that a published fact cannot outrun its evidence: values
resolve in **both** locales, an availability figure carries a `claimId` that is still
`verified` in the registry, every pending fact names a decision document that exists, and
every service route with a `Service` node has a facts record — so adding a service page
cannot silently skip the model. Six self-tests cover each violation.

## Verification (both workstreams)

| Check | Result |
|---|---|
| Production build | Pass |
| `npm run verify:evidence` | **17 of 17 gates pass** |
| AI-readiness self-tests | Pass, every gate rejects its mutated input |
| Deploy gate simulations | Both pass |
| Frontend specs | 91 of 91 |
| Backend unit tests | 65 of 66 (pre-existing `lead.service` failure) |

## What P1 still needs

1. **Service Facts model** — blocked on decisions 1, 2 and 5 in
   `roaya-website/docs/decisions/2026-09-02-pending-decisions.md`. The structure can be built
   ahead of the facts, but the table would be mostly empty, which reads worse than no table.
2. **Performance** — the initial bundle is 1.01 MB against a 750 kB budget, and two component
   stylesheets exceed theirs. No Lighthouse baseline has been taken under an agreed profile.
3. **CI link-graph report** — three-click reachability from a hub for every commercial page.

Adjacent, not in P1: the Contact page has a visible address and phone but no `ContactPoint`
or `LocalBusiness` node (action plan P3).
