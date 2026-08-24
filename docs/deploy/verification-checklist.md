## Post-deploy verification checklist (TIFO-18)

Run after deploying the nginx config + SSR/backend supervision from
[`RUNBOOK.md`](./RUNBOOK.md). Replace `roaya.co` if testing a staging host.
Every check should be run by the human doing the deploy, over their own
SSH/VPN session — no agent runs these against the production host.

### 0. Test the origin first, then purge Cloudflare, then test the edge

**Cloudflare sits in front of the origin** (`server: cloudflare` on live
responses). It is currently caching the old static build's `200` responses for
unknown routes, so running these checks against `https://roaya.co` immediately
after a deploy will show you the *pre-deploy* behavior and send you chasing a
problem that isn't there.

Order of operations:

```bash
# 1. Origin-direct, from an SSH session on the host — bypasses Cloudflare
curl -skI -H "Host: roaya.co" https://127.0.0.1/this-route-xyz | head -3
#    Expect 404 once SSR is live. (Pre-deploy this returns 200 + a
#    Last-Modified from the Feb 2026 static index.html.)

# 2. Only once the origin is correct, purge the Cloudflare cache
#    (dashboard: Caching -> Configuration -> Purge Everything)

# 3. Re-run every check below against https://roaya.co
```

Note `-k` in step 1 is required and expected: the origin cert expired
2026-05-01 (see the TLS section of the runbook). Fixing that is a separate
task — don't let it block this verification, but don't forget it either.

### 1. www → apex redirect (301)

```bash
curl -sI https://www.roaya.co/services | grep -Ei '^(HTTP|location):'
```
Expect: `HTTP/2 301` (or `HTTP/1.1 301`) and `location: https://roaya.co/services`.

### 2. HTTP → HTTPS redirect (301)

```bash
curl -sI http://roaya.co/ | grep -Ei '^(HTTP|location):'
```
Expect: `HTTP/1.1 301` and `location: https://roaya.co/`.

### 3. Security headers present on every response

```bash
curl -sI https://roaya.co/ | grep -Ei '^(strict-transport-security|x-content-type-options|referrer-policy|permissions-policy):'
```
Expect all four headers present with the exact values from
[`nginx-config-rationale.md`](./nginx-config-rationale.md):
- `strict-transport-security: max-age=31536000` (no `includeSubDomains` — see
  the HSTS note in `nginx-config-rationale.md`; api.roaya.co is HTTP-only)
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=()`

Repeat against `/robots.txt`, `/sitemap.xml`, and a 404 route (see #5, #6) —
headers must be present there too (`always` in the nginx config).

### 4. Content types for AI/crawler files

```bash
curl -sI https://roaya.co/robots.txt   | grep -i '^content-type:'   # expect: text/plain; charset=utf-8
curl -sI https://roaya.co/sitemap.xml  | grep -i '^content-type:'   # expect: application/xml; charset=utf-8
curl -sI https://roaya.co/llms.txt     | grep -i '^content-type:'   # expect: text/plain; charset=utf-8
```

### 5. Real 404 status for an unknown route

```bash
curl -sI https://roaya.co/this-route-does-not-exist-xyz | grep -Ei '^HTTP:'
```
Expect a real `HTTP/2 404` from the Angular SSR app (proxied through nginx),
not a static nginx 404 page and not a `200` (which would indicate a silent
SPA fallback swallowing the route).

### 6. SSR HTML present without JavaScript — representative EN/AR routes

The site's language is a client-side preference (`localStorage`, defaulting
to browser `Accept-Language`), not a URL prefix — there is no `/en/` or
`/ar/` path segment. Verify SSR output for the default (English) render on a
representative sample of routes, and confirm Arabic translations exist for
the same routes in `src/assets/i18n/ar.json` so bilingual parity is a content
guarantee even though it isn't URL-addressable:

```bash
for route in / /services /services/security /industries /pricing /about /contact; do
  echo "=== $route ==="
  curl -s "https://roaya.co$route" | grep -Eio '<title>.*</title>|application/ld\+json' | head -3
done
```

Expect for each route:
- A non-empty `<title>...</title>` specific to that page (not a generic
  shell title) — confirms SSR rendered the route server-side, not just
  `index.html`.
- An `application/ld+json` script tag **on the three routes that register
  one**. JSON-LD is deliberately scoped: `ROUTE_ENTITY_MAP` in
  `src/app/core/seo/entity-taxonomy.ts` registers exactly 3 routes (`/`,
  `/about`, `/services/worldposta`), and the `json-ld-exclusion-gates` check
  asserts that count. Do **not** treat a route without JSON-LD as a failed
  deploy — most routes are not supposed to have one. Verified against the
  built server on 2026-08-24.

### 7. Evidence suite still passes

```bash
cd roaya-website
npm run verify:evidence
```
Expect the suite to report **9/9** (or whatever the current total check
count is — do not silently accept a lower pass count than what `main`
reports before this deploy).

**This step is the load-bearing gate, not a formality.** A prerender failure
does not fail `ng build` — it exits 0 having emitted no route HTML, and the
resulting artifact answers *every* route with an Express 404
("Cannot GET /"). The `real-unknown-route-404` check boots the built server
and asserts a known route returns 200, so it catches exactly this.
`deploy/scripts/deploy-ssr.sh` runs it automatically and additionally
hard-fails if fewer than 30 prerendered `index.html` files were emitted.

### 8. Backend health check (if the backend is part of this deployment)

```bash
curl -s https://roaya.co/api/v1/health   # adjust path/host if the API is reverse-proxied under a different prefix
# or, from the server itself:
curl -s http://localhost:__SSR_UPSTREAM_PORT_OR_API_PORT__/api/v1/health
```
Expect a `200` with a JSON health payload (see `backend/src/index.ts`'s
logged health-check URL for the exact path in use).
