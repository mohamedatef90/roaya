## Vercel → nginx behavior mapping (TIFO-18)

Every behavior in `roaya-website/vercel.json` (Stage 1.1 / TIFO-8 host-hygiene
work) mapped to its nginx equivalent in
`roaya-website/deploy/nginx/roaya-website.conf`.

| `vercel.json` rule | nginx equivalent | Notes |
|---|---|---|
| `redirects`: host `www.roaya.co` → `https://roaya.co/:path`, `permanent: true` | `server { server_name __WWW_SERVER_NAME__; return 301 https://__SERVER_NAME__$request_uri; }` (443 block) | 301, path + query preserved via `$request_uri`. |
| Implicit HTTPS enforcement (Vercel terminates TLS and force-upgrades) | `server { listen 80; return 301 https://$host$request_uri; }` | Not present in `vercel.json` directly but required to reproduce Vercel's platform-level HTTPS behavior on self-hosted infra. |
| `headers` on `/(.*)`: `Strict-Transport-Security: max-age=31536000; includeSubDomains` | `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;` on every location in the primary `server` block | Identical value. |
| `headers` on `/(.*)`: `X-Content-Type-Options: nosniff` | `add_header X-Content-Type-Options "nosniff" always;` | Identical value. |
| `headers` on `/(.*)`: `Referrer-Policy: strict-origin-when-cross-origin` | `add_header Referrer-Policy "strict-origin-when-cross-origin" always;` | Identical value. |
| `headers` on `/(.*)`: `Permissions-Policy: camera=(), microphone=(), geolocation=()` | `add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;` | Identical value. |
| `headers` on `/robots.txt`: `Content-Type: text/plain; charset=utf-8` | `location = /robots.txt { default_type "text/plain; charset=utf-8"; ... }` | Served as a static file from the browser build output, never proxied. |
| `headers` on `/sitemap.xml`: `Content-Type: application/xml; charset=utf-8` | `location = /sitemap.xml { default_type "application/xml; charset=utf-8"; ... }` | Same. |
| `headers` on `/llms.txt`: `Content-Type: text/plain; charset=utf-8` | `location = /llms.txt { default_type "text/plain; charset=utf-8"; ... }` | Same. |
| No CSP header (explicit Stage 1.1 decision) | No `Content-Security-Policy` header added | Out of scope, matches upstream decision — do not add one here without a separate decision. |
| Implicit: everything else served by the Vercel Node/Angular SSR runtime | `location / { proxy_pass http://roaya_ssr; ... }` proxying to `dist/roaya-website/server/server.mjs` | Preserves per-route SSR HTML, JSON-LD, bilingual metadata, and the real 404 status. No static-only SPA fallback (`try_files ... /index.html`) is configured — that would break SSR. |
| Implicit: static asset caching by the Vercel CDN | `location ~* \.(js\|css\|...)$ { expires 1y; add_header Cache-Control "public, max-age=31536000, immutable"; }` | Angular's production build emits content-hashed filenames, so long-lived immutable caching is safe. |

No `vercel.json` rule is left unmapped.
