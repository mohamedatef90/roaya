# Roaya.co — AI Readiness Reconciliation (2 September 2026)

**Purpose:** Reconcile the external second review (overall 71/100, homepage 50/100) with
`AI_Readiness_Action_Plan_2026-09-02.md` and with what production actually served on
2 September 2026. Every row below was verified against `https://roaya.co` raw HTML
(curl, crawler user agents) and the repository, not against the reviewer's text.

**Bottom line**

1. The reviewer's homepage section describes an **older version of the site**. None of the
   quoted phrases exist on the live homepage. Do not spend effort "removing" them.
2. The site nevertheless had **real P0 defects the reviewer did not see**, the largest being
   that every blog article URL intermittently serves HTTP 503 with a false "Post Not Found"
   page. Root cause found and fixed in this change set (backend rate limiter counting
   server-side renders).
3. The About page contradicted itself on the founding year (story: 2012, timeline: 2018).
   That is why the reviewer wrote "founded in 2018". Fixed.
4. Several review items are correct and are **content/policy decisions**, not engineering.
   They are collected in `roaya-website/docs/decisions/2026-09-02-pending-decisions.md`.

## 1. External review claims vs live production

| Review claim | Live status on 2026-09-02 | Disposition |
|---|---|---|
| Homepage opening statement duplicated verbatim | Not present. One `<h1>` ("IT Services That Deliver Results"). | Stale |
| "35 widely distributed data centers", "largest computing platform", "unlimited computing power", "real premium support" | None of these strings appear in the served HTML. | Stale |
| Grammar: "state of art", "We've exceled", "they worth this trust", "facilitator for you IT" | None appear. | Stale |
| Homepage does not reflect AWS, SOC, AI, incident response, SAP, backup, managed IT | Incorrect: sections for AWS partnership, SOC/security brief, pentest brief, DevOps brief, services card stack and industries are all server-rendered. | Stale |
| Homepage is generic and claim-heavy (H1, title, meta description) | Correct. Title "IT Services That Deliver Results - Roaya IT"; description "IT provider with transparent pricing and measurable results…"; subtitle "Guaranteed."; four different uptime figures on one page (99.9%, 99.95%, 99.99%, "Zero Downtime"). | Real → fixed (see §4) |
| About says founded 2018 | Story paragraph says "Founded in 2012" (decision of 2026-09-01) but milestone 1 said "2018 — Company Founded" on the same page. Homepage said "10+ Years Experience", About "14+". | Real → fixed |
| "150+ clients", "50+ team", "6+ years" | 150+ and 50+ present; years is 14+ on About. 50+ team is not yet in the claim registry. | Register (decision doc) |
| WorldPosta exclusive MENA partner "since 2019" | Present. Partnership claim is registered as verified; the 2019 date is an unverified timeline entry. | Decision needed |
| Services: 24/7, `<1hr` response, 99.9% SLA | Present. Also found a dead i18n key "24/7 Support - 15-Minute Response Guaranteed" (not rendered). | Dead key removed; SLA/support policy page needed |
| "Full compliance with Egyptian data regulations" | Present on About and homepage; also "Full Compliance / Meet all regulatory requirements" template on service detail pages and "Full compliance with NIST SP 800-61". | Real → reworded to scoped statements |
| Testimonials lack names/companies/permission | Present: "IT Director, Finance Sector" style attribution only. | Decision needed (permission) |
| No Support/SLA/Trust pages | `/support`, `/sla`, `/trust`, `/security`, `/data-residency` return 404. `/privacy`, `/terms`, `/cookies` exist. | Decision needed; template in decision doc |
| Add `Organization` JSON-LD to homepage (P3) | Already present (Organization + WebSite + WebPage on every page; BreadcrumbList on inner pages). `Service` nodes exist only for `/services/worldposta`; no `FAQPage`. | Partially done; P1 backlog |
| Define Roaya / WorldPosta / CloudEdge / CloudSpace relationship | CloudEdge defined and approved; CloudSpace remains blocked in the registry (no approved definition). | Decision needed |

## 2. Findings the external review missed (found in live verification)

### 2.1 P0 — Blog article URLs serve 503 with a false "Post Not Found" page

Evidence (UTC, 2026-09-02):

| Probe | Result |
|---|---|
| 20 sitemap blog URLs, first pass | 10 × 200 (EN), 10 × 404 (AR) |
| Same URLs ~3 minutes later | 7 × 200, 6 × 404, 7 × 503 |
| Same URLs sequentially, ~2 minutes later | 20 × 503, each in 0.5–1.3 s |
| Public API `GET /api/v1/content/blog` at the same time | 200, 10 posts, `ratelimit-policy: 100;w=900` |
| Two EN URLs at 08:40Z after an idle window | 200 with real article titles |

Root cause, verified in code:

- `backend/src/presentation/middleware/rate-limiter.ts` limits 100 requests per 15 minutes per
  `req.ip`. `backend/src/app.ts` applies it app-wide and
  `backend/src/presentation/routes/public-content.routes.ts` applied it a second time, so
  public content requests counted twice.
- Server-side rendering calls the backend on `http://127.0.0.1:3001` without
  `X-Forwarded-For`, so every render for every visitor and crawler shared the single
  loopback bucket. Public browser traffic arrives through nginx with `X-Forwarded-For`
  and keeps per-client buckets.
- On HTTP 429 the blog-detail component correctly answered 503, but the template reused the
  "Post Not Found" block, the `<title>` stayed at the generic "Blog Post - Roaya IT", and
  `og:url` pointed at the homepage.

### 2.2 P0 — All Arabic blog URLs were permanent 404s but were advertised

- `backend/src/application/services/content.service.ts` `getContentBySlug(slug, 'ar')` looked
  up `slugAr` only, while the site's Arabic URLs use the English slug under `/ar/`. Every post
  has a different Arabic slug, so every `/ar/resources/blog/<slug>` returned 404.
- The dynamic sitemap and every English article's `hreflang="ar"` still advertised them.
- The Arabic bodies in the database are 214–1,088 characters (stubs) against full-length
  English articles. They are not complete articles.

### 2.3 P1 — Contradictory counters, escaped markup, dead claims

- Homepage stats rendered a screen-reader value and an animated value: crawlers saw
  "150+ 0+", "99.9% 0%", "24/7 0/7", "10+ 0+" on `/` and `/ar`.
- The Meta pixel `<noscript><img …>` in `<head>` was serialised by the SSR DOM as escaped
  text, so `&lt;img height="1" … facebook.com/tr?…` was the first visible text on every page.
- Hard-coded `99.95%` in the homepage "local expertise" stats row; `99.99%` generalised to the
  healthcare and manufacturing industry cards (registry scope is CloudEdge/Posta only).
- Whitepapers and documentation "coming soon" pages were indexable and listed in
  `sitemap.xml` and `llms.txt`.

## 3. Internal action plan P0 status

| Plan item | Before this change set | After this change set |
|---|---|---|
| P0.1 Blog-detail SSR + sitemap integrity | Failing intermittently in production (see §2.1); AR URLs 404 (§2.2) | Root cause fixed in backend; honest 503 state with `Retry-After`; AR URLs resolve; sitemap/hreflang advertise Arabic only when the Arabic article is complete; deploy gate checks every sitemap URL |
| P0.2 Governed company-fact record | 2012 applied to story, JSON-LD, llms.txt, About stat; timeline still 2018; homepage 10+ | Timeline milestone → 2012; homepage → 14+. External profiles still owned by marketing |
| P0.3 High-risk claims | Registry covers 14 claims; homepage/services carried unregistered or out-of-scope figures | Out-of-scope uptime figures and "full compliance" / "guaranteed" wording scoped or removed (EN + AR); unregistered claims listed for decision |
| P0.4 Thin indexable placeholders | Indexable, in sitemap and llms.txt | `noindex, follow`, removed from sitemap and llms.txt, gate enforces it |

## 4. Changes made in this change set

Nothing is committed or deployed. 28 files modified, 8 added, 2 deleted.

### 4.1 Backend — the blog-503 root cause

| File | Change |
|---|---|
| `presentation/middleware/rate-limiter.ts` | New exported `isLoopbackIp` and `isTrustedLoopbackRead`; `apiRateLimiter` now skips GET and HEAD requests whose client IP **and** TCP peer are loopback. Server-side renders stop sharing one bucket. Writes, forms, logins and all non-loopback traffic are unchanged. The peer check stops a remote client spoofing `X-Forwarded-For: 127.0.0.1`. |
| `presentation/routes/public-content.routes.ts` | Removed the duplicate `router.use(apiRateLimiter)` that counted every public-content request twice, halving the effective allowance to 50 per 15 minutes. |
| `application/services/content.service.ts` | `getContentBySlug` now matches a published item on `slugEn` **or** `slugAr`, so `/ar/resources/blog/<english-slug>` resolves. English match wins a cross-column collision. View counting and 404 semantics unchanged. |
| `tests/unit/rate-limiter.test.ts`, `tests/unit/content.service.test.ts`, `tests/setup.ts` | 47 new unit tests, including an in-process Express reproduction of the nginx and trust-proxy topology. |

nginx for `roaya.co/api` was verified to set `X-Forwarded-For`, so public traffic keeps
per-client buckets.

### 4.2 Blog detail — honest states and language integrity

| File | Change |
|---|---|
| `blog-detail.component.ts` / `.html` | Four explicit states: loading, ready, not found, unavailable. A backend failure no longer renders "Post Not Found": it answers 503 with its own heading and title, `Retry-After: 120`, and canonical equal to `og:url` equal to the page's own URL. A genuine unknown slug still answers 404, now with a specific title and `noindex`. `Article` JSON-LD `mainEntityOfPage` is locale-aware. |
| `core/utils/arabic-content-completeness.ts` (new) | The rule that decides whether an Arabic article exists: non-empty Arabic title, at least 100 Arabic words, and at least half the English word count. |
| `server.ts` | The dynamic sitemap emits an Arabic blog URL and an `hreflang="ar"` alternate only when that rule passes. All ten current posts are Arabic stubs, so none is advertised. |
| `core/services/seo.service.ts` | New `setAlternatesForLocales`, so a page can declare which language versions actually exist instead of always claiming both. |
| `core/interceptors/ssr-api.interceptor.ts` | Server-side renders send `X-Roaya-SSR-Render: 1` so they are identifiable in backend logs. |

### 4.3 Homepage and About — one value per fact

| File | Change |
|---|---|
| `home.component.ts` / `.html` | Each statistic renders one value, equal to the final value, with the animation resetting to zero only in the browser. The duplicate screen-reader span is gone; the wrapper carries `aria-label`. Years experience 10 to 14, matching the 2012 founding decision. Hard-coded 99.95% to 99.9%. |
| `index.html` | The Meta pixel `<noscript>` moved from `<head>` to `<body>`. It is no longer serialised as escaped text at the top of every page. |
| `devops-brief-section.component.html` | Badge "Zero Downtime" to "Zero-downtime deployments" — a delivery practice, not an availability promise. |
| `about.component.ts` | Timeline milestone one: 2018 to 2012, ending the contradiction with the story paragraph on the same page. |

### 4.4 Copy governance (English and Arabic together)

- "Full compliance" wording replaced with scoped statements on the About partnership
  benefit, the homepage data-sovereignty card, the service-detail benefit template and the
  incident-response statistic ("Aligned to NIST SP 800-61").
- Uptime figures outside the approved CloudEdge and Posta scope removed from the healthcare
  card and the manufacturing industry description.
- "Guaranteed." removed from the hero subtitle and the security section title; "99.9% Uptime
  Guarantee" reworded to "99.9% uptime SLA".
- New homepage H1 and meta description naming the actual portfolio: "Managed Cloud,
  Cybersecurity, AI & Enterprise IT Services in Egypt". Description is 156 characters in
  English and 160 in Arabic.
- Certification badges qualified: "ISO 27001" became "ISO 27001 aligned", and likewise for
  ISO 9001, SOC 2 and GDPR. The registry blocks the certification claim; alignment is what
  the Services page already states.
- "Military-Grade Encryption" replaced with "Encryption in Transit and at Rest" on the
  homepage and with the named control on the backup service page.
- Unregistered 99.95% removed from the SAP page, and "Guaranteed SLAs" reworded to
  "Defined SLAs" with the service agreement named.
- The dead `home.newsBar` promotional keys were removed except one the registry validator
  points at.
- `src/assets/i18n/en.json.backup` and `ar.json.backup` deleted. These December 2025
  snapshots were tracked, shipped as assets and served at
  `https://roaya.co/assets/i18n/en.json.backup`, carrying "Egypt's first IT provider",
  "guaranteed ROI" and "15-Minute Response Guaranteed".

### 4.4b Claims found after the first pass

Three exposures surfaced only once the whole build was swept rather than page by page:

- `src/assets/i18n/en.json.backup` and `ar.json.backup` — deleted (see 4.4).
- `/services/sap` published 99.95% as a "Guaranteed SLA" — now 99.9% and "Defined SLAs".
- `/services/backup` published "military-grade encryption" — now names the control.

The last of these was found by the new `published-claim-sweep` gate on its first run, after
the other two had already been fixed by hand. That is the argument for the sweep: a
page-scoped assertion cannot catch a claim on a page nobody thought to assert on.

### 4.4c Founding year confirmed and locked (2026-09-02)

The product owner reconfirmed **2012**. All seven surfaces that state or derive the year now
agree — the JSON-LD constant, both `about.story.p1` translations, the About timeline's first
milestone, `llms.txt`, and the two years-experience figures (both `14+`). Verified as served:
`foundingDate` is `2012` on `/`, `/about` and `/ar/about`, and the string `2018` appears on
none of them.

A new gate, `company-facts-consistency`, reads the year from `ORGANIZATION_FOUNDING_DATE`
and fails when any surface disagrees, when the story paragraph names a second year, or when
a years figure is not the number of years actually elapsed. Five self-tests cover it,
including a replay of the exact 2018-vs-2012 bug. Decision record:
`roaya-website/docs/decisions/2026-09-02-founding-year-confirmation.md`.

Also removed: a dead `footer.copyright` key still reading "© 2024". Nothing rendered it (the
footer builds the year dynamically and already showed 2026), but it shipped in the public
translation asset, where a reader — human or machine — could quote it as the site's date.

### 4.5 Placeholders

Whitepapers and documentation render `noindex, follow` in both locales, and are removed from
`sitemap.xml` and `llms.txt`. `NOINDEX_ROUTES` in `route-metadata.ts` is the single switch:
delete a path from it to re-index that page.

### 4.6 Gates

| Gate | What it now blocks |
|---|---|
| `ssr-crawler-semantics` (new) | Duplicated or zeroed counters, a wrong years figure, "99.95" on the homepage, escaped `<noscript>` markup, more than one `<h1>`, an article URL that answers anything but 503 with `Retry-After` and its own heading when the backend is down, a placeholder without `noindex`, or a `noindex` on an indexable route. |
| `published-claim-sweep` (new) | Blocked figures and phrases anywhere in the built pages or shipped translation assets, plus any stale `.backup` or `.bak` file reaching the build. This is the gate that found the backup service page after the SAP page was fixed. |
| `canonical-metadata-coverage` (extended) | A `NOINDEX_ROUTES` path appearing in the sitemap or `llms.txt`. |
| `gate:sitemap-integrity` (new script) | Any sitemap URL that does not answer 200 in production, or any article URL rendering a not-found heading. Run it after deployment; `deploy-ssr.sh` and its argument contract are untouched. |

## 5. Verification

Everything below was run locally against the production build. Nothing was deployed.

| Check | Result |
|---|---|
| Frontend typecheck and production build | Pass, zero errors. Bundle-budget warnings only |
| `npm run verify:evidence` | **14 of 14 gates pass**, 0 failed, 0 skipped |
| AI-readiness selftests | Pass, every gate rejects its mutated input |
| `validate:claims`, `validate:llms-txt` | Pass, 14 claims and 33 links |
| Backend unit tests | 62 of 63 pass. The one failure is pre-existing and was reproduced unchanged at `HEAD` in a scratch worktree |
| Backend typecheck and build | Pass |
| Frontend specs | 61 tests pass |

Rendered-output probes against the built server, no JavaScript executed:

| Probe | Observed |
|---|---|
| `/` and `/ar` | One value per statistic, no "0+", "0%" or "0/7"; "14+" present; no "99.95"; no escaped `<noscript>`; one `<h1>`; title carries the new positioning |
| `/about`, `/ar/about` | "Founded in 2012" present; "2018" gone from both locales |
| Article URL, backend down | 503 with `Retry-After: 120`, its own heading in both languages, canonical equal to `og:url` |
| Article URL, unknown slug | 404 with a specific title, `noindex`, canonical equal to `og:url` |
| Article URL, mock backend | 200 with the real title; English page offers `en` and `x-default` only; Arabic page offers `ar` only |
| `/sitemap.xml` with mock backend | 88 URLs: 78 static plus 10 English articles, zero Arabic article URLs |
| Whitepapers and documentation, both locales | 200 with `noindex, follow`; `/` and `/about` carry no robots tag |
| `/services/sap`, `/services/backup`, `/ar/services/backup` | 99.9% only; no "military-grade" anywhere in the build |
| Built assets | Only `en.json` and `ar.json` ship; the backups are gone |

Not verifiable locally: the backend rate-limit and Arabic-slug fixes can only be confirmed
against production after deployment, and two client-side behaviours need a browser (the
hreflang override on language switch, and removal of the `noindex` tag when navigating away
from a placeholder page).

## 5.1 Adversarial review round

Three independent reviewers then read the whole diff — one for correctness and regressions,
one for claim governance, one for crawler semantics — under instruction to refute it. They
raised two blockers, eight majors and nine minors. Two of the blockers had already been
found and fixed independently (the publicly served translation backups, and the SAP page's
99.95%). Everything else below was fixed in this change set; nothing was deferred.

| Finding | Fix |
|---|---|
| **`noindex` leaked across routes.** The 404 path wrote `<meta name="robots" content="noindex">` and nothing removed it, so a reader who hit a missing article carried noindex into every page they visited next in that session. Two reviewers found this independently. | The tag now has a lifecycle: cleared on every load, on the 503 path, and on destroy. |
| **Thin Arabic articles became orphaned indexable pages.** Dropping them from the sitemap and hreflang left them 200, linked from the Arabic blog listing, and still indexable. | An Arabic page whose translation is a stub now renders `noindex, follow` and advertises no alternates — reachable for readers, out of the index. The English article is untouched. |
| **The Arabic completeness rule failed open.** With `contentEn` absent, any post with 100 Arabic words counted as complete, so a trimmed API payload would silently re-advertise every Arabic URL. | Absent (as opposed to empty) English content now returns false. Unknown is not complete. |
| **The counter animation could orphan an interval.** `initAnimations()` can run twice when ScrollSmoother becomes ready just after the 500 ms fallback fired; the second run overwrote the shared interval handle and the first kept counting past the real figures. | `initAnimations()` is idempotent, the interval is owned by the run that created it, and the animation lands exactly on the published figures. |
| **Counters visibly jumped backwards.** Because the server now renders the final value, an on-screen stats section showed the right number and then snapped to zero to count up — and a JavaScript-rendering crawler could snapshot mid-animation. | The count-up only runs for a stats section that is not already on screen when the page loads. If the reader can already see it, the final values stay. |
| **One article could answer at two URLs.** `getContentBySlug` matched either slug column with no content-type filter, so a case study resolved under the blog route as well. | The blog and case-study routes now scope the lookup to their own content type; three unit tests cover it. |
| **`ssr-crawler-semantics` could pass without running.** The checks that read rendered HTML skip themselves when `dist/` is absent, and a skip counted as green. | Skips now fail closed: `check.mjs` exits non-zero and says which checks did not run. `--allow-skips` is the deliberate opt-out. The deploy script builds first, so it is unaffected. Verified: with `dist/` removed the command reports 9 of 14 with 5 skipped and exits 1. |
| **The escaped-markup detector only matched `&lt;img`.** The same serialisation bug through any other head-level `<noscript>` child would go unseen. | It now matches any escaped tag and names the tag it found. |
| **The gate cited the claim registry as authority for 99.9%,** a figure the registry does not contain. | The message now cites this reconciliation and points at the pending decision, and says plainly that the figure is not yet registered. |
| **Homepage title too long.** 77 characters in English and 88 in Arabic once the brand suffix is appended — result pages would cut both "in Egypt" and the brand. | The `<title>` and the `<h1>` are now separate keys: the title is 62 characters in English and 50 in Arabic, while the `<h1>` keeps the full portfolio phrasing. The spec that pinned the homepage title now reads the key from the route registry so it cannot pin the wrong one again. |
| **Copy the first pass missed.** "99.99% uptime guarantee" generalised to WorldPosta overall; "achieving full compliance" in the homepage case-study preview; "Zero-Downtime Infrastructure" as a manufacturing headline; "lightning-fast response times". | Scoped to CloudEdge and Posta; "meeting the engagement's compliance objectives"; "High-Availability Infrastructure"; "defined response times". Arabic changed with each. |

Reviewer findings deliberately **not** acted on, with the reason:

- The homepage renders 99.9% as a site-wide figure that no registry entry covers. Correcting
  that is a product-owner decision, already open as decision 2; the gate message now states
  the gap rather than implying registry backing.
- No automated gate inspects a *successful* article render, because the gate environment has
  no backend. `npm run gate:sitemap-integrity` covers it against production after deployment.

### Re-verification after the review fixes

Full rebuild, then: **14 of 14 gates pass**, frontend specs 61 of 61, backend unit tests 65 of
66 (the one failure is the pre-existing `lead.service` test), both deploy-gate simulations
pass. Rendered probes confirm the English article offers `en` and `x-default` only with no
robots tag; the Arabic stub answers 200 with `noindex, follow` and no alternates; the 503
carries `Retry-After: 120` and no noindex; unknown slugs answer 404 with `noindex`; the
sitemap holds 88 URLs with zero Arabic article URLs.

## 6. Decisions still required

`roaya-website/docs/decisions/2026-09-02-pending-decisions.md` — support/SLA policy, the
authoritative availability figures, milestone years, testimonial permissions, Arabic article
completion, placeholder publish-vs-noindex, unregistered credential and count claims,
CloudSpace taxonomy, external profile alignment.

## 7. Deployment

Nothing in this change set has been committed or deployed. Both services need a release:

- Backend (`/opt/roaya/backend`, pm2 `roaya-api`): build and restart per `backend/README.md`.
  Until it is deployed, blog articles will keep failing after ~50 renders per 15 minutes.
- Frontend SSR: `roaya-website/deploy/scripts/deploy-ssr.sh` (12-argument contract unchanged).
  Deploy the backend first so the Arabic URLs resolve before the new sitemap rule is served.
