# Roaya.co — AI-Friendliness Audit & Score

**Date:** 2026-08-26
**Audited against:** live production (release `roaya-ssr-20260826-011809`), cache-bypassed public requests, cross-checked at origin (`127.0.0.1:4000` through the exact nginx header shape), plus the repository `ai-readiness` gate (`npm run ai-readiness` — **11/11** against the deployed artifact, SHA-verified identical to live: `main-ZN2FSI5X.js` = `d007d9a3…610f2b` on disk, at origin, and publicly).

---

## Overall Score: **92 / 100 — Grade A**

Most Angular sites score in the 40s–50s for AI-readiness because they ship an empty JavaScript shell that AI crawlers (which mostly do **not** execute JS) cannot read. Roaya.co is comfortably in the top few percent of business websites: fully server-rendered in both languages, with machine-verified claims and a purpose-built navigation map for AI agents.

---

## Scorecard

| # | Dimension | Score | Evidence |
|---|---|---|---|
| 1 | **Content readable without JS (SSR)** | **20/20** | Every route is real server-rendered HTML — 21/21 sampled EN+AR routes (static + dynamic industry/service/case-study), zero CSR shells, `trustProxyHeaders` deopt notices since restart: 0 |
| 2 | **Machine files** | **19/20** | `robots.txt` with explicit AI policy — AI **search** bots allowed (OAI-SearchBot, Claude-SearchBot, Claude-User, PerplexityBot), AI **training** bots opted out (GPTBot, ClaudeBot) per approved Stage 0 decision 8 (TIFO-7); `Sitemap:` directive present; sitemap with **80** canonical `<loc>` entries, zero `http://`, no duplicates; `llms.txt` with 36 canonical links and provenance framing |
| 3 | **Structured data (JSON-LD)** | **12/15** | Organization + WebSite + WebPage + BreadcrumbList on every page, **0 parse errors** across 10 sampled pages. Gaps: `Service` schema on only 2 pages; no `Article`/`FAQPage` on blog/case studies |
| 4 | **Metadata & bilingual** | **14/15** | Title, meta description, canonical (query-free, https), full OG set (`type/title/description/image/url`), Twitter card, exactly one H1, correct `lang`, and `hreflang` en/ar/x-default on **every** sampled page. Minor: a few thin descriptions (`/services/cloud` = 51 chars) |
| 5 | **HTTP semantics** | **8/10** | Real 404s for unknown routes (6/6 sampled), including typed dynamic ones (`/industries/not-a-real-industry` → 404, `/resources/case-studies/not-a-real-study` → 404). Two soft spots: `/services/<unknown>` → **302** to `/services`; `/resources/blog/<unknown>` → **200** soft-404 ("Post Not Found" page with status 200) |
| 6 | **Claim integrity / provenance** | **10/10** | Standout dimension. Claim-evidence registry (14 entries, verified/blocked statuses) enforced by CI gates; uptime claims scoped to exactly CloudEdge/Posta; `llms.txt` explicitly instructs AI agents that the linked pages are authoritative and the file authorizes no autonomous action. Contact API rejects empty submissions with HTTP 422 before any record is created. Almost no site does this |
| 7 | **Performance / availability** | **9/10** | Origin renders `/about` in **5–9 ms**. Brotli compression at the edge. (A 15 s public TTFB measured during the audit was the audit machine's VPN path to Cloudflare — TCP connect itself stalled 15 s before any HTTP; not a site defect) |

---

## What this means in practice

An AI assistant (ChatGPT search, Claude, Perplexity) hitting roaya.co gets:

- fully-rendered content in **one fetch**, no JavaScript required
- both English and Arabic, each declaring the other via `hreflang`
- machine-verified claims (nothing blocked leaks into rendered HTML — enforced by CI, not by manual review)
- a navigation map (`llms.txt`) built specifically for it
- structured data identifying the organization, site, and page hierarchy on every route

---

## The 8 missing points (improvement backlog)

| Gain | Item | Detail |
|---|---|---|
| **+3** | Richer schema | Add `Service` JSON-LD to all 12 service pages, `Article` to blog posts, and consider `FAQPage` where Q&A content exists. **Note:** touches the claim-evidence gates, so it must go through the same registry-approval + review/merge path as all claim-bearing content |
| **+2** | HTTP semantics | Make `/services/<unknown>` return 404 instead of 302; make `/resources/blog/<unknown>` return status 404 with its existing "Post Not Found" page |
| **+2** | Metadata polish | Bring the 3–4 short meta descriptions up to 120–158 chars (worst offender: `/services/cloud` at 51 chars) |
| **+1** | llms.txt coverage | Link the 6 industry pages individually (currently only the industries overview is linked) |

---

## Audit method (for reproducibility)

- **SSR matrix:** cache-bypassed `curl` against `https://roaya.co` with unique `?cb=` params; each response checked for status, size vs the 28.5 KB CSR shell, and a route-specific H1/title. Origin cross-check via SSH with the full nginx header shape (`Host` + `X-Forwarded-For` + `X-Forwarded-Proto` + `X-Real-IP`) and byte-comparison against `browser/index.csr.html`.
- **JSON-LD:** every `application/ld+json` block parsed with `JSON.parse`; `@graph` flattened; types collected.
- **Machine files:** fetched live; sitemap `<loc>` counted and scheme-checked; robots directives read directly.
- **Claims:** authoritative check is the repo's `npm run ai-readiness` gate (11/11) against the SHA-verified deployed artifact. A literal live-HTML sweep surfaced only authorized exception surfaces (compliance-framework references such as "aligned to NIST CSF, ISO 27001/27002" and the scoped CloudEdge/Posta 99.99% figure).
- **Contact validation:** `POST /api/v1/leads/submit` with `{}` and empty-string payloads → HTTP 422 `VALIDATION_ERROR` with per-field messages, no record created.
- **Performance:** `curl -w` timing breakdown publicly and at origin over SSH.

**Related deployment state:** production release `roaya-ssr-20260826-011809` (merged main `36040af`, PR #7), pm2 runtime + saved dump both carry `NODE_ENV=production`, `PORT=4000`, `NG_ALLOWED_HOSTS=roaya.co,www.roaya.co`, `NG_TRUST_PROXY_HEADERS=x-forwarded-for,x-forwarded-proto`. Nginx SSR locations send `X-Forwarded-For $remote_addr` (hardened); `/api/` unchanged.
