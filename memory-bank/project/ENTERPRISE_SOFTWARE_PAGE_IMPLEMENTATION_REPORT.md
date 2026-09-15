# Enterprise Software & Mobile Apps — Page Implementation Report

> **Date:** 2026-09-14
> **Route:** `/services/enterprise-software` (+ `/ar/services/enterprise-software`)
> **Status:** Built, prerendered in both locales, 19/19 AI-readiness gates pass.
> **Related:** `memory-bank/Audit/AI_Readiness_P2_P3_2026-09-03.md`,
> `roaya-website/docs/decisions/2026-09-02-pending-decisions.md`

---

## 1. What was asked, and the constraint that shaped it

The brief asked for a page presenting Roaya's enterprise/government software, mobile
app and automation capability, with a **large team of specialists**, **high security**,
**application support**, massive technical content, our animation style, and alignment
with the AI-readiness work.

The last requirement constrains the first. The claim-evidence registry holds 15 claims.
None of them covers team size, SLAs, response times or certifications, and
`iso-certification` is **blocked**. `published-claim-sweep` scans every built page and
translation asset for unregistered figures.

**Product-owner decision (2026-09-14): publish qualitative team language, no numbers.**

The page therefore proves depth by **naming the bench** — eleven engineering disciplines,
each described — rather than counting people. Nothing on the page is a governed claim.

---

## 2. Claim discipline applied

| Not published | Why | Where it would come from |
|---|---|---|
| Headcount / team size | No registry claim | Product-owner approval → new `verified` claim |
| SLA, uptime | `uptime-*` scoped to CloudEdge/Posta only | Pending decision 2 |
| Support response/resolution times | Contradicts published support wording | Pending decision 1 |
| ISO or any certification | `iso-certification` is **blocked** | Evidence on file |
| Client counts beyond 150+ | Only `clients-150-plus` is verified | — |

**How the support gap is handled honestly.** Rather than omit the topic, the page states:

> "Response and resolution commitments are agreed per engagement and written into the
> contract, rather than published here as a generic figure."

This is repeated in `llms.txt` so an assistant reading the machine summary cannot infer
a number that does not exist.

**Security standards are framed as practice, not certification.** The page says OWASP
ASVS / MASVS / Top 10 / CWE / NIST SSDF describe *how we engineer*, and adds explicitly:
"These describe our practice, not a certification we hold." The word ISO appears nowhere.

Confirmed with the product owner as genuinely in place, and therefore published:
secure SDLC with peer code review; SAST/DAST/dependency scanning in CI; OWASP ASVS and
MASVS alignment; penetration testing by Roaya's own offensive team before release.

---

## 3. Page structure — 12 sections, ~2,140 visible words (EN), ~2,130 (AR)

1. **Hero** — dark themed, with the six-stage delivery pipeline as the page's spine
2. **Capabilities** — four tabbed pillars: enterprise platforms, government digital
   services, mobile applications, automation & integration
3. **The bench** — 11 disciplines, the team story without a headcount
4. **Secure by default** — four phase gates (design / code / pipeline / release), each
   with four concrete practices, plus the standards block and a cross-link to
   `/services/security/penetration-testing`
5. **Delivery** — six phases, each naming the artefact it ends in
6. **Engineering depth** — six groups: architecture, integration, mobile, data, CI/CD,
   observability
7. **Public sector** — residency, accessibility, Arabic-first, auditability,
   interoperability, continuity
8. **Quality engineering** — six test layers
9. **Application support** — six elements + the contractual-commitments note, and the
   `<app-service-facts>` host
10. **FAQ** — seven buyer questions, answers CSS-collapsed (never removed) so the
    `FAQPage` node repeats text the served HTML actually carries
11. **Related services** — five onward links
12. **Closing CTA**

---

## 4. Registration chain

Adding a service route touches nine places. All were updated together:

| File | Change |
|---|---|
| `src/app/app.routes.ts` | Lazy route |
| `src/app/app.routes.server.ts` | Prerender, both locales |
| `src/app/core/seo/route-metadata.ts` | `ROUTE_METADATA` entry |
| `src/app/core/seo/entity-taxonomy.ts` | `BREADCRUMB_LABEL_KEYS`, `SERVICE_ENTITY_KEYS` (name + hero-lead description), `FAQ_ENTITY_KEYS` (7 pairs) |
| `src/app/core/seo/service-facts.ts` | Record added — all fields `pending`, each naming its decision |
| `public/sitemap.xml` | Two URLs with the full en/ar/x-default alternate set |
| `public/llms.txt` | Entry, including the "not a certification" and "no published response times" qualifiers |
| `src/assets/i18n/{en,ar}.json` | 258 keys each, full parity |
| Nav: mega menu, footer, services index | Three inbound links (link-graph requires reachability ≤ 3 clicks) |

`faSolidCode` was registered in both `mega-menu.component.ts` and `services.component.ts`.

---

## 5. Motion

Follows the **AWS convention**, the cleanest on the site: declarative `[data-reveal]`
items inside `[data-reveal-group]` sections, collected with `gsap.utils.toArray`. The
template declares what animates; the component stays generic.

Three deliberate improvements over the site's current motion baseline, taken from the
2026-09-14 motion audit:

1. **Double-init guard.** `initMotion()` is idempotent via `animationsInitialized`.
   `contact`, `services/aws` and `card-stack` use the same ready-or-500 ms-fallback
   pattern *without* a guard and can register their ScrollTriggers twice; this page
   cannot.
2. **One ambient animation, not dozens.** A single pipeline pulse. The AI page runs 78
   infinite animations; this page runs one.
3. **Reduced motion handled locally as well as globally.** The ambient pulse is removed
   outright (not merely shortened) and hover translates are disabled.

RTL uses the `--es-dir: 1 / -1` multiplier, so every directional transform reverses from
one declaration.

---

## 6. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm run build:prod` | Succeeds; both locales prerendered |
| `npm run ai-readiness` | **19/19 pass** |
| `npm run verify:evidence` | All validators and self-tests pass |
| Sitemap URLs | 78 → **80** |
| Service routes with facts records | 14 → **15** |
| Breadcrumb labels | 36 → **37** |
| Routes emitting FAQPage | 2 → **3** |
| `internal-link-graph` | No orphans, none deeper than three clicks |
| `page-metadata-quality` | 80 URLs, no duplicate title or description |
| EN title / description | 44 / 65 chars, 160 / 165 chars |
| AR title / description | 43 / 65 chars, 138 / 165 chars |
| i18n key parity | 258 = 258 |
| Rendered page | 1 `<h1>`, 12 sections, 0 empty, no raw translation keys in either locale |

---

## 7. Open items for the product owner

1. **Team-size figures.** If Roaya wants to publish "N engineers" or "N years of
   combined delivery", supply the numbers and they will be registered as `verified`
   claims with a decision document. Until then the page stays qualitative.
2. **Support commitments.** Pending decision 1 still blocks any published response or
   resolution time. The page says so explicitly rather than staying silent.
3. **Service facts.** All eight fields for this route are `pending`. When decisions
   1, 2 and 5 are settled, the facts table appears automatically inside the support
   section — no template change needed.
4. **Case-study evidence.** The page describes capability but cites no delivered
   system. A registered government or enterprise software case study would be the
   single strongest addition.
