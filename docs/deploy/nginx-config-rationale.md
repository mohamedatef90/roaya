## nginx config rationale

Every non-obvious rule in `roaya-website/deploy/nginx/roaya-website.conf`, and
why it is there. Production is the self-hosted nginx origin behind Cloudflare —
there is no other deployment target, so this config is the single source of
truth for host-level behavior (redirects, security headers, content types,
caching, and what reaches the SSR process).

Values verified against the live host on 2026-08-24 are marked as such.

### Security headers

Applied with `always` so they are present on error responses too, and repeated
in each `location` block. The repetition is required, not sloppiness: nginx's
`add_header` does **not** inherit into a `location` that declares its own
`add_header`, so a block that sets one header would otherwise silently drop the
rest.

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000` (no `includeSubDomains`) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

HSTS is a one-way door: once a browser sees a one-year `max-age` it will refuse
plain HTTP for that host for a year, and it is cached client-side — **not
server-side reversible**.

`includeSubDomains` is therefore deliberately **omitted**. Verified 2026-08-24:

```
curl -sI https://api.roaya.co/api/v1/health   → connection fails (no TLS listener)
curl -sI http://api.roaya.co/api/v1/health    → HTTP/1.1 200 OK
```

`api.roaya.co` is HTTP-only. With `includeSubDomains`, every browser that
visited `roaya.co` would refuse plain HTTP to *every* `*.roaya.co` host for a
year, breaking any client that calls `http://api.roaya.co` — and no server
change could undo it. The website itself is unaffected (it uses the relative
`/api/v1` path), but `CLAUDE.md` documents `NG_APP_API_URL=https://api.roaya.co`
and other consumers can't be enumerated from this repo.

Add `includeSubDomains` only once every subdomain serves HTTPS. Omitting it
costs nothing for crawlers or AI agents.

**No `Content-Security-Policy` is set.** That remains a deliberate deferral —
adding one needs its own decision and testing pass, because a wrong CSP breaks
the page silently.

### Machine files: explicit content types

```
location = /robots.txt   default_type "text/plain; charset=utf-8"
location = /sitemap.xml  default_type "application/xml; charset=utf-8"
location = /llms.txt     default_type "text/plain; charset=utf-8"
```

Served as static files from the browser build output, never proxied. Without an
explicit `default_type`, nginx falls back to its `mime.types` mapping, which
yields a charset-less `text/plain` — and the charset is part of the contract
these files exist to satisfy.

These three rules are **enforced by the evidence suite**:
`validateNginxMachineFileContentTypes` in
`roaya-website/scripts/validate-llms-txt.mjs` parses this config and fails the
`llms-txt` check if any block is missing, loses its `default_type`, or has the
wrong value. The self-test proves each of those mutations is actually caught.
If you restructure these blocks, run `npm run verify:evidence`.

### Backend API

```
location ^~ /api/ { proxy_pass http://127.0.0.1:3001/api/; }
```

`environment.prod.ts` sets `apiUrl: '/api/v1'` — a *relative* path — so every
browser API call is same-origin and must be proxied to the backend. Mirrors the
live host config verified 2026-08-24. Omitting this block sends API traffic to
the SSR Node process, which answers with the app's own HTML, breaking the
contact form, logos, and testimonials.

`^~` matters: it stops the static-asset regex location from winning for any API
path ending in an asset-like extension. The backend serves no static files
today, but a future upload or image endpoint under `/api/` would otherwise be
routed to the browser dist root.

### SSR proxy — and what must NOT be here

```
location / { proxy_pass http://roaya_ssr; }
```

Everything not matched above goes to the Angular SSR Node server, preserving
per-route SSR HTML, JSON-LD, bilingual metadata, and the real 404 status code.

**Do not add `try_files $uri $uri/ /index.html`.** That SPA fallback is exactly
what the live config had, and it is why unknown routes returned `200` with a
stale static `index.html` — crawlers asking for `/robots.txt` were handed HTML.
It silently defeats the entire AI-readiness surface.

### Static asset caching

```
location ~* \.(js|css|mjs|map|woff2?|ttf|eot|otf|png|jpe?g|gif|svg|webp|avif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

Safe because Angular's production build emits content-hashed filenames. Note
`.json` is deliberately absent: `assets/i18n/{en,ar}.json` are **not**
content-hashed, so caching them for a year would pin stale translations in
every visitor's browser. They fall through to the SSR proxy and are served by
the app's own `express.static`.

### HTTP → HTTPS

```
server { listen 80; return 301 https://$host$request_uri; }
```

Matches live behavior.

### Open decision: `www` vs apex

The config includes a 301 `www.roaya.co` → `roaya.co`. This is **not** current
live behavior — the live host serves both hostnames identically from one
`server` block, which means duplicate content on two canonical hosts.

Choosing apex is consistent with the rest of the repo: `public/sitemap.xml`,
`public/llms.txt`, and the route metadata registry all emit `https://roaya.co`
URLs. Serving `www` without redirecting contradicts those canonical URLs.

The counter-consideration is that `roaya-website/CLAUDE.md` names
`www.roaya.co` as the project domain, and existing inbound links and search
rankings may point at `www`. A 301 preserves link equity, so the redirect is
the safer of the two, but **confirm the direction before installing** — it is a
canonical-URL decision, and reversing it later costs another round of
re-indexing.

### TLS

Cert paths point at the existing Sectigo commercial cert
(`/var/www/roaya-cert/`). See the TLS section of [`RUNBOOK.md`](./RUNBOOK.md) —
that cert **expired 2026-05-01** and Cloudflare is masking it. Do not run
`certbot` against this host without deciding to migrate off the paid cert
first.
