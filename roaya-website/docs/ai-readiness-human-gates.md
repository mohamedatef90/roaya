# AI-readiness human gates (TIFO-16)

This is a **checklist**, not proof. Checking a box here means a human
performed that step for a specific change; it is not verified or enforced by
`npm run ai-readiness` or any other script in this repo. Nothing in this
document should be read as evidence that any of these actions have already
happened for the current change — it exists so the required human review
points are explicit and cannot be silently skipped.

The automated layer (`scripts/claim-evidence/` + `scripts/ai-readiness/`,
see `npm run verify:evidence`) covers 13 evidence checks deterministically
verifiable from local source/build state (ids as they appear in
`scripts/ai-readiness/report.json`):

1. **robots-policy** — robots.txt policy, bot allow/deny decisions
2. **sitemap-validity** — sitemap.xml validity, canonical URLs, duplicates
3. **llms-txt** — llms.txt validator, MIME config, prohibited assertions
4. **canonical-metadata-coverage** — route registry vs sitemap reconciliation;
   since 2026-09-02 also `NOINDEX_ROUTES` (route-metadata.ts): a prerendered
   route may be absent from the sitemap only when listed there, a listed route
   must be absent from sitemap.xml and llms.txt, and every entry must still
   name a real route in both locales
5. **json-ld-exclusion-gates** — JSON-LD validity, hard-exclusion tokens
6. **pentest-v2-canonicalization** — Express 301 legacy redirects
7. **industry-route-integrity** — closed industry registry enforcement
8. **case-study-route-integrity** — case-study routing/404 integrity
9. **approved-factual-consistency** — claim-evidence registry + source pointers
10. **machine-files-in-build** — machine files in production build
11. **real-unknown-route-404** — real HTTP 404 via local SSR server
12. **ssr-content-quality** — raw SSR HTML of every case-study URL (H1,
    visible text, canonical = og:url, WebPage/Article JSON-LD), Arabic pages
    keep every link under `/ar`, blog listings render an H1, `/sitemap.xml`
    and `/rss.xml` serve complete XML — via local SSR server
13. **ssr-crawler-semantics** — what a crawler receives on the routes the
    2026-09-02 reconciliation changed, via local SSR server with no backend:
    homepage (`/`, `/ar`) renders one text value per stat (`150+`, `99.9%`,
    `24/7`, `14+` exactly once each, no zeroed count-up value, no `10+`, no
    `99.95`), no escaped `&lt;img` `<noscript>` markup, exactly one `<h1>`;
    an article URL with the backend unreachable answers **503 + Retry-After**
    with an unavailable-state `<h1>`/`<title>` (never "Post Not Found" /
    "المقال غير موجود", never the generic "Blog Post - Roaya IT") and a
    self-referencing canonical = og:url; every `NOINDEX_ROUTES` path in both
    locales serves 200 with `<meta name="robots" content="noindex, follow">`;
    `/`, `/about`, `/ar/about` carry no noindex

The three SSR checks boot the built server on fixed loopback ports (42417,
42418, 42419) with `NG_ALLOWED_HOSTS='*'` and **without** `NG_SSR_API_ORIGIN`,
so they exercise the no-backend render path deterministically.

The checks verify:
- **58 prerendered routes** emitted in the production build
- **JSON-LD coverage** — site-wide Organization/WebSite identity and URL-derived
  breadcrumbs are emitted on canonical routes; `ROUTE_ENTITY_MAP` has one
  page-specific Service mapping: `/services/worldposta`.
- **Express 301 redirects** for pentest-v2 canonicalization (both locales)
- **Closed industry registry** with RESPONSE_INIT 404 for unknown IDs
- **Deferred repository cleanup** — 11,683 tracked root `node_modules/**` files
  remain intentionally deferred. Removing tracked dependency artifacts is a broad,
  destructive VCS cleanup and must be planned separately so the deployment/build
  workflow can be verified from a clean checkout.
- **Residual production security gate** — `npm audit --omit=dev` reports one
  low-severity direct `quill@2.0.3` HTML-export XSS (`GHSA-v3m3-f69x-jf25`).
  `npm` marks the available remediation as a semver-major change; the **Roaya CMS
  owner** must validate editor/export compatibility and a named human security
  reviewer must approve the migration before the finding may be considered closed.

### 2026-09-02 reconciliation notes

- **Blog-detail SSR root cause.** Article URLs intermittently served HTTP 503
  with a false "Post Not Found" page. The backend's rate limiter
  (`backend/src/presentation/middleware/rate-limiter.ts`, 100 requests / 15 min
  per `req.ip`) was applied twice to public content routes and counted every
  server-side render — which reaches the backend on `http://127.0.0.1:3001`
  without `X-Forwarded-For` — in one shared loopback bucket, so a handful of
  crawler visits exhausted it for every visitor. On the resulting 429 the
  component correctly answered 503 but reused the not-found template, the
  generic `<title>`, and a homepage `og:url`. The backend fix is the real
  remedy; `ssr-crawler-semantics` locks in the honest 503 + `Retry-After`
  unavailable state so a future outage can never read as "gone" to a crawler.
  Unknown-slug 404 semantics are unchanged (they need a backend and are
  verified on the host, not locally).
- **Arabic article completeness rule.** `src/server.ts` emits
  `/ar/resources/blog/<slug>` in `/sitemap.xml` (and the article's
  `hreflang="ar"`) only when the Arabic body is complete per
  `src/app/core/utils/arabic-content-completeness.ts`; incomplete Arabic
  stubs are not advertised. The local checks cannot see this (no backend, so
  the local sitemap is the static file); it is covered on the host by the
  **sitemap integrity gate** below.
- **Sitemap integrity gate (post-deploy, host).**
  `npm run gate:sitemap-integrity` (`scripts/deploy/sitemap-integrity-gate.sh`)
  fetches the live `https://roaya.co/sitemap.xml`, requests every `<loc>`
  sequentially with a short timeout, and fails — listing every offender —
  if any URL answers non-200 or any article URL renders a "Post Not Found" /
  "المقال غير موجود" `<h1>` (or no `<h1>`). It is red-capable offline:
  `npm run test:sitemap-integrity-gate` runs the real script against a
  stubbed `curl`. It is a separate step from `deploy-ssr.sh` on purpose: the
  activation gate probes one prerendered route on the SSR upstream, while
  this one needs the public origin (nginx + backend) and must run after the
  backend is deployed.

The automated layer cannot and does not substitute for the gates below.

## 1. Per-case-study approval and metric evidence

Before any case study in `scripts/claim-evidence/registry.json` moves out of
`status: "blocked"`:

- [ ] A written, dated client-approval reference exists for the specific
      published copy (name usage, quotes, and figures) and is recorded in
      `clientApprovalReference`.
- [ ] A metric-evidence pointer (internal report, signed-off dataset, or
      equivalent) backs every number rendered on that case study's page and
      is recorded in `metricEvidencePointer`.
- [ ] Both fields are reviewed by whoever owns client relationships before
      the entry's `status` changes from `"blocked"`.
- [ ] `npm run validate:claims` is re-run after the edit and passes.

**2026-09-01:** All five current case studies were approved by the product
owner and moved to `status: "verified"` — see
`docs/decisions/2026-09-01-claim-approvals.md`. Both registry pointers cite
that decision record; replace them with written per-client approval documents
and metric-evidence files when those become available.

## 2. Blocked public surface exception policy

Blocked registry entries (`status: "blocked"`) are checked against the explicit
claim-to-public-surface policy in the validator, even when their `sourcePointer`
is `null`. Public blocked values/templates must be removed or qualified; a
documented exception is required only for a deliberately retained public pointer.

**Validator enforcement:** `scripts/claim-evidence/validate-registry.mjs`
rejects any blocked claim with a `sourcePointer` matching public surface
prefixes unless all three exception fields are present and valid:

- `exceptionOwner` — named human approving the temporary exception
- `exceptionExpiry` — future YYYY-MM-DD date when the exception expires
- `exceptionApproval` — reference (ticket, email, decision record) that names the
  exact policy token as `policy-token:<path#i18n.key>:<forbidden-value>`. This
  binds approval to one rendered value at one public key; it never changes the
  normal `sourcePointer` locator schema.

For a key-aware JSON policy rule, the validator parses the public source and
checks the resolved key only. Invalid JSON or an unresolved configured key fails
closed; it never falls back to a whole-file substring check. One approved token
does not authorize a sibling token at the same key or the same token at another
key.

**When to use exceptions vs. remediation:**

- **Remediate** (set `sourcePointer: null`): When blocked copy has been
  removed or qualified (e.g., "ISO Certification" → "Industry Standards")
- **Exception**: When blocked copy must remain temporarily visible with
  explicit human approval and an expiry date for follow-up

**Self-test coverage:** `npm run test:claims:selftest` includes red-capable
tests proving the validator correctly rejects:
- Blocked public-surface claims without exception fields
- Blocked public-surface claims with incomplete exceptions
- Blocked public-surface claims with expired exceptions

## 3. Push / PR / CI review

- [ ] Changes are pushed to a branch and opened as a PR (this issue's Agent
      Identity forbids the agent from doing this itself).
- [ ] At least one human reviewer approves the PR.
- [ ] CI (typecheck, unit tests, `npm run verify:evidence`, production build)
      is green on the PR's head commit — not just on a local machine.

## 4. Pre-merge verification against a local production build

There is no preview environment — the self-hosted nginx origin is the only
deployment target. So this gate runs against a real production build on the
reviewer's machine, which is a closer match to production than a preview host
would have been anyway (same artifact, same Node entry point).

```bash
cd roaya-website
DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh   # build + full evidence suite, ships nothing
PORT=4200 node dist/roaya-website/server/server.mjs
```

Then confirm:

- [ ] **Build gates passed** — `verify:evidence` reported 13/13 and the script
      did not abort on the prerendered-route count.
- [ ] **58 prerendered routes emitted** —
      `find dist/roaya-website/browser -name index.html | wc -l` returns 58.
      A lower number means prerendering failed silently; `ng build` exits 0
      when it does, so this count is the only cheap signal.
- [ ] **SSR runtime, not a static shell** — a sample of canonical routes
      returns HTTP 200 with real content in the first response, each with its
      own route-specific `<title>` (not a shared shell title).
- [ ] **JSON-LD where it is registered** — every canonical route receives the
      verified site-wide Organization/WebSite identity plus URL-derived
      breadcrumbs. `ROUTE_ENTITY_MAP` has exactly one page-specific Service
      mapping, `/services/worldposta`; other routes must not gain unregistered
      Service facts.
- [ ] **Canonical links** — each route has a correct self-referencing
      `<link rel="canonical">`.
- [ ] **Real 404** — an unregistered path returns HTTP 404, not a 200 with a
      client-side "not found" component.
- [ ] **Honest article 503** — with no backend reachable, an article URL
      returns HTTP 503 with a `Retry-After` header and an "unavailable"
      heading, not "Post Not Found"; the noindex placeholders
      (`/resources/whitepapers`, `/resources/documentation`, both locales)
      return 200 with `robots: noindex, follow`.
- [ ] **Machine files** — `/robots.txt`, `/sitemap.xml`, and `/llms.txt` are
      reachable and byte-identical to `public/`. Their **content types** and
      the security headers are nginx's responsibility, not the Node server's,
      so they are verified post-deploy against the host — see the
      post-deploy verification section of `docs/deploy/RUNTIME-ENV.md`. The config side of that
      guarantee is enforced automatically by the `llms-txt` check, which
      parses `deploy/nginx/roaya-website.conf`.

## 5. Production deployment / rollback approval

- [ ] A named human approves the production deployment after the Preview
      checks above pass.
- [ ] The rollback path (previous production deployment/alias) is identified
      and confirmed reachable *before* promoting, not after an incident.
- [ ] **Sitemap integrity gate passed on the host** — after both the backend
      and the SSR release are live, `npm run gate:sitemap-integrity` exits 0
      against `https://roaya.co/sitemap.xml` (every `<loc>` 200, every
      article URL a real `<h1>`). A failure lists the offending URLs; the
      release is not verified until it passes or the offending URLs are
      removed from the sitemap by the completeness rule.
- [ ] DNS/CDN/WAF configuration is unchanged, or any intended change is
      separately reviewed and approved (out of scope for any agent run under
      this issue's Agent Identity).

## 6. Ambiguous factual claims requiring human decision

The following facts have conflicting or ambiguous source evidence. Do **NOT**
change these values without explicit human verification of the correct answer.
The agent is instructed not to invent, remove, or modify these without explicit
human approval.

### Organization founding year

**Current value:** `2012` (in `src/app/core/seo/entity-taxonomy.ts`,
`src/assets/i18n/en.json` / `ar.json` "about.story.p1", and `public/llms.txt`)

**Resolution:** The 2018-vs-2012 ambiguity was resolved by the product owner
on 2026-09-01 in favor of **2012**, matching the LinkedIn company record —
see `docs/decisions/2026-09-01-claim-approvals.md`. The years-experience stat
on the About page was updated to `14+` accordingly. Marketing owns keeping
external profiles (LinkedIn, Google Business Profile, directories, partner
listings) consistent with 2012.

**Status:** ✓ Resolved by named human decision (2026-09-01).

### pentest-v2 redirect implementation

**Current implementation:** Express server-level 301 redirects in `src/server.ts`
for both `/services/security/pentest-v2` and `/ar/services/security/pentest-v2`,
with Angular client-side fallback (`redirectTo: 'services/security/penetration-testing'`).

**Verification:** The `pentest-v2-canonicalization` evidence check validates:
- Express 301 redirects exist for both locales
- pentest-v2 is removed from sitemap.xml
- pentest-v2 is not in route-metadata.ts or breadcrumbs
- Canonical penetration-testing route is prerendered

**Status:** ✓ Express 301 redirects implemented and verified by automated check.

---

None of the sections above are satisfied by running
`npm run verify:evidence` or by an agent posting a comment. They require a
named human to perform the action and record that they did.
