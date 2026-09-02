# AI Readiness Remediation — 2026-09-01

Engineering remediation for the P1/P2 findings in
`AI_Readiness_Audit_2026-09-01.md` and `Roaya-AI.md`. All changes are local to
the repo and verified; **not yet deployed** (`./deploy/scripts/deploy-ssr.sh`).

## Fixed in this change set

### P1 — Case-study pages served loading shells to crawlers
- **Root cause:** `seo.service.ts` `updateSEO()` fell back to
  `window.location.href` when no `url` was passed. `window` does not exist
  during SSR, the ReferenceError landed before `isLoading.set(false)`, and all
  ten case-study URLs (EN+AR) shipped ~730 chars of nav/footer only. The same
  crash hit the coming-soon pages, producing the 14 wrong `og:url`s.
- **Fix:** fallback is now `this.buildCanonicalUrl(this.router.url)`
  (server-safe). `case-study-detail.component.ts` additionally passes its
  canonical URL explicitly and `type: 'article'`.
- **Verified:** local prod server renders `bank-cloud-migration` with 4,151
  chars visible text, descriptive H1, `og:url` = canonical (was 738 chars, no
  H1, homepage og:url).

### P1 — Blog invisible in raw HTML
- **Root causes:** (a) `ssr-api.interceptor.ts` blocked all backend API calls
  during SSR; (b) blog listing was `RenderMode.Prerender`, baking the empty
  build-time state into static HTML; (c) post cards used `routerLink` on
  `<article>` elements, which renders no `href` — zero followable links even
  with content present.
- **Fixes:**
  - Interceptor now forwards **GET** API requests to `NG_SSR_API_ORIGIN`
    (loopback backend) when set at runtime; unset (build/CI) keeps the old
    deterministic blocking behavior. Non-GET always blocked.
  - `/resources/blog` + `/ar/resources/blog` moved from Prerender to
    `RenderMode.Server`.
  - Post titles are now real `<a [routerLink]>` anchors (SSR renders `href`).
  - `NG_SSR_API_ORIGIN=http://127.0.0.1:3001` threaded through the deploy
    runtime contract: deploy-ssr.sh (REMOTE_ARGS, EXPECTED_ARGC 11→12, exact
    value check, export before pm2 restart, rollback command), pm2 ecosystem,
    systemd unit, RUNTIME-ENV.md.
- **Verified end-to-end with a mock backend:** raw listing HTML in both
  locales carries the post title and `href="/resources/blog/<slug>"`.

### Robots training opt-out completed
`public/robots.txt` now disallows CCBot, Google-Extended, Applebot-Extended,
meta-externalagent, Bytespider in addition to GPTBot/ClaudeBot — implementing
the file's stated "AI training crawlers opted out" policy. Gate list updated.

### Gate expansion (audit's explicit ask)
New `ssr-content-quality` check in `scripts/ai-readiness/checks.mjs`: boots
the production server build and asserts, for every case-study URL in both
locales, HTTP 200 + non-empty H1 + ≥50 visible words + og:url = canonical;
blog listings must render an H1. This is the check that would have caught the
loading-shell regression. `canonical-metadata-coverage` now understands
documented server-rendered listings.

**Verification:** 12/12 ai-readiness gates pass; `verify:evidence` suite
passes; deploy guards pass (75/75 runtime-config, 33/33 ssh-argv — production
argv fixture updated to 12 args).

## Still open (not engineering, or deferred)

1. **P0 human decisions (unchanged):** founding year 2018 vs 2012; approval /
   qualification of quantitative claims; case-study claim registry approvals.
   Owners: leadership/marketing/legal.
2. **Blog detail URLs in sitemap + RSS feed:** requires a dynamic sitemap
   source (posts live in the DB). Deliberately deferred per audit guidance —
   add only once posts are publicly complete.
3. **Coming-soon pages (whitepapers/documentation EN+AR):** still indexable
   placeholders. Decision needed: publish substantive content, or
   noindex + remove from sitemap/llms.txt.
4. **WebPage/Article JSON-LD for case studies:** deliberately withheld while
   case-study claims are registry-blocked (structured data must not carry
   blocked metrics). Revisit after P0 approvals.
5. **AR listing pages link to unprefixed (EN) detail URLs** — pre-existing
   site-wide routerLink pattern (case studies identical). Worth a dedicated
   locale-aware link pass.
6. **Deploy + post-deploy verification:** run `./deploy/scripts/deploy-ssr.sh`
   (it now requires the 12-arg contract), then verify on the host that
   `pm2 env` shows `NG_SSR_API_ORIGIN` and that
   `curl -H "Host: roaya.co" http://127.0.0.1:4000/resources/blog` carries
   real posts.

---

## Addendum — P0 decisions applied + dynamic sitemap/RSS (same day, second pass)

Product-owner decisions received and applied (decision record:
`roaya-website/docs/decisions/2026-09-01-claim-approvals.md`):

1. **Founding year resolved to 2012** (LinkedIn record wins). Updated:
   entity-taxonomy.ts (`ORGANIZATION_FOUNDING_DATE`), en/ar `about.story.p1`,
   llms.txt, About stats (`6+` → `14+` years), human-gates doc marked resolved.
   Registry claim renamed `founded-2018` → `founded-2012`.
2. **Quantitative claims approved**; existing scope limits unchanged
   (99.99% uptime stays CloudEdge/Posta-only; iso/pricing/cloudspace stay blocked).
3. **All five case studies approved** — registry entries moved to `verified`
   with sourcePointer (hero.title i18n keys), decisionReference,
   clientApprovalReference and metricEvidencePointer citing the decision record.
   Registry selftests now run red-capability tests against a `blockedBaseline`
   fixture (pre-approval state) so the blocked-claim policy rules stay tested.

**Dynamic sitemap + RSS implemented** (audit follow-up item 2):

- `src/server.ts`: Express `GET /sitemap.xml` merges the static sitemap base
  with published blog-post URLs fetched from the backend via
  `NG_SSR_API_ORIGIN` (EN+AR entries, full hreflang triplets, lastmod;
  10-minute cache, 5s timeout, graceful static-only fallback).
  `GET /rss.xml` serves an RSS 2.0 blog feed (valid empty channel without
  backend). Both registered before express.static.
- nginx `location = /sitemap.xml` now proxies to the SSR upstream (same
  proxy-header contract as the other SSR locations); runtime-config guard
  updated to expect 3 SSR proxy locations.
- RSS discovery `<link rel="alternate" type="application/rss+xml">` added to
  index.html.
- Blog detail SSR now returns a **real 404** for a slug the backend says does
  not exist, and **503** when the backend is unreachable (so a transient
  outage never deindexes real posts).
- `ssr-content-quality` gate extended: `/sitemap.xml` must serve a complete
  `<urlset>` as application/xml and `/rss.xml` a complete `<rss>` document.

**Verification:** 12/12 ai-readiness gates, all selftests, 75/75 runtime-config,
33/33 ssh-argv. End-to-end with a mock backend: sitemap grew 82→84 locs with
correct blog entries, RSS carried the post item, unknown blog slug returned
HTTP 404, rendered pages carry `foundingDate: 2012`, "Founded in 2012", `14+`.

**Remaining open:** coming-soon whitepapers/documentation pages (publish vs
noindex decision); case-study WebPage/Article JSON-LD (now unblocked by the
approvals — optional enhancement); AR listings link to unprefixed EN detail
URLs (site-wide pattern); marketing to align external profiles with 2012.
Still NOT deployed — run `./deploy/scripts/deploy-ssr.sh` and copy the updated
nginx config to the host (the sitemap location change requires an nginx reload).

---

## Addendum 2 — case-study JSON-LD + locale-aware link pass (2026-09-02)

The two final audit follow-ups are done and verified:

**Case-study WebPage + Article JSON-LD** (unblocked by the 2026-09-01
approvals): `StructuredDataService` now emits, on every case-study detail
route in both locales, a named `WebPage` node, an `Article` node
(headline = hero title, author/publisher = Organization, no invented
datePublished), and a `BreadcrumbList` that terminates at the page itself
(hero-title leaf). New `ArticleNode` type in `json-ld.types.ts`;
entity-taxonomy comments updated to record that emission depends on the
approvals standing.

**Locale-aware link pass** (site-wide): before this, EVERY internal link on
every Arabic page pointed into the English tree (262 routerLinks across 43
files + programmatic navigations). New primitives:
- `localizeRouterCommands()` in `core/i18n/locale-routing.ts`
- `LocalizeLinkPipe` (`| localizeLink`) — templates
- `LanguageService.localizeCommands()` — programmatic `router.navigate`
Applied across all 43 files by an agent fan-out with per-file adversarial
verification; the verification also caught a cross-component leak (shared
`card-stack` rendered plain `[href]` anchors, fixed to
`[routerLink] | localizeLink`). Blog-detail also got RESPONSE_INIT handling
(404 unknown slug / 503 backend down).

**Gate expansion:** `ssr-content-quality` now additionally asserts, per
case-study URL, WebPage+Article JSON-LD with correct @ids and a
self-terminating breadcrumb; and that Arabic pages keep every internal
anchor under /ar (sampled routes).

**Verification (all on the production build):** 12/12 ai-readiness gates;
all selftests; 75/75 runtime-config; 33/33 ssh-argv; exhaustive sweep of all
41 /ar sitemap URLs found ZERO English-tree anchor leaks; EN pages unchanged
(no /ar hrefs, pipe is a no-op). Rendered Article node confirmed on
bank-cloud-migration.

**Known latent item:** `home.component.ts` `expertiseCards` array carries
absolute link values but is not rendered anywhere today; if it is ever
rendered through card-stack it is now safe (card-stack localizes), but the
dead data could be pruned.

**Deployment (unchanged):** commit, `./deploy/scripts/deploy-ssr.sh`, copy
`deploy/nginx/roaya-website.conf` to the host and reload nginx (sitemap
location now proxies to SSR).
