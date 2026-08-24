## Production parity kit — self-hosted SSH deployment runbook (TIFO-18)

Production for the Roaya website is a self-hosted server reached over VPN/SSH.
It is the only deployment target — all Vercel configuration has been removed
from this repo, and the nginx config in `roaya-website/deploy/nginx/` is now
the single source of truth for host-level behavior. See
[`nginx-config-rationale.md`](./nginx-config-rationale.md) for why each rule is
there.

This runbook covers that nginx config plus process supervision for the Angular
SSR server and the backend API.

No agent runs any step in this runbook against the real production host. A
human with SSH access executes it.

### Fill these in before you start

| Placeholder | Meaning | Known value (repo evidence) |
|---|---|---|
| `__SERVER_NAME__` | Production apex domain | `roaya.co` (`roaya-website/CLAUDE.md` Production Environment table) |
| `__WWW_SERVER_NAME__` | www host to redirect from | `www.roaya.co` |
| `__SSL_CERT_PATH__` | TLS full-chain cert path | **Verified on host 2026-08-24:** `/var/www/roaya-cert/www_roaya_co.crt` — a Sectigo commercial cert, `CN=www.roaya.co`, SANs `www.roaya.co` + `roaya.co`. **It expired 2026-05-01.** Not Let's Encrypt — see the TLS section below before touching it. |
| `__SSL_KEY_PATH__` | TLS private key path | **Verified on host:** `/var/www/roaya-cert/www.roaya.conopass.key` |
| `__BACKEND_PORT__` | Port the backend API listens on | **Verified on host:** `3001` (`node /opt/roaya/backend/dist/index.js` under PM2) |
| `__BROWSER_DIST_PATH__` | Absolute path to the built Angular browser output | `/var/www/roaya-ssr/current/browser` if you use `deploy/scripts/deploy-ssr.sh` (timestamped releases + a `current` symlink). The pre-existing `/var/www/roaya-website/` holds the old static-only build and the admin-uploaded images the script carries forward. |
| `__WEBSITE_DEPLOY_PATH__` | Absolute path to the deployed `roaya-website/` checkout | `/var/www/roaya-website` (CLAUDE.md) |
| `__BACKEND_DEPLOY_PATH__` | Absolute path to the deployed `backend/` checkout | `/opt/roaya/backend` (CLAUDE.md) |
| `__SSR_UPSTREAM_HOST__` / `__SSR_UPSTREAM_PORT__` | Where nginx proxies SSR requests | `127.0.0.1` / `4000` — `4000` is `src/server.ts`'s own default and is **confirmed free on the host** (only `:22`, `:80`, `:443`, `:3001`, `:5432`, `:6379`, `:5555`, `:33221` are listening as of 2026-08-24) |
| `__SSR_PORT__` | Port the SSR Node process listens on (must match the nginx upstream) | Same as above — pick a free port and keep both in sync |
| `__DEPLOY_USER__` / `__DEPLOY_GROUP__` | Unix user/group the services run as | `roaya` (CLAUDE.md SSH user) |

Never fill in secrets (DB passwords, JWT secrets, SendGrid keys, etc.) inside
committed config files — they belong only in `.env` files on the server,
outside version control.

**Confirmed gap between this kit and the current deploy process (2026-08-24).**
`roaya-website/CLAUDE.md` documents deploy commands that `tar`/`scp` only the
Angular **browser** build into `/var/www/roaya-website/`, with no reference to
the SSR **server** bundle or any nginx config in this repo. A human with SSH
access to the production host ran the two checks proposed above and confirmed
it live:

```
$ ps aux | grep -i "server.mjs|roaya-ssr"
# no matching process — only the grep command itself
$ curl -sI https://roaya.co/this-route-xyz
HTTP/2 200
server: cloudflare
last-modified: Sun, 08 Feb 2026 10:53:34 GMT
```

An unknown route returning `200` with a `last-modified` header from a static
file (not a fresh SSR response) confirms `roaya.co` is currently served as a
**static-only build with no SSR process running** — Cloudflare sits in front
of the origin, but the origin itself has no `server.mjs`/`roaya-ssr` process
to hit. This means the AI-friendly SSR output from TIFO-9 (per-route SSR HTML,
JSON-LD, bilingual metadata, real 404s) is **not live today**, regardless of
what's in `main`. Going live with this kit is therefore not just "add nginx +
supervision" — it's a real migration off static-only hosting: the existing
deploy flow must start shipping and supervising the SSR process (steps 2 and 4
below) and nginx must stop returning `200` for unknown routes. Until that
migration happens, treat every AI-readiness deliverable from TIFO-9 onward as
built-but-not-deployed.

**Full host survey (read-only SSH, 2026-08-24).** The gap is wider than the
above: the deployed build is from **2026-02-08**, so it predates every
AI-readiness ticket, not just the SSR ones.

| Finding | Evidence |
|---|---|
| Deployed build is ~6 months stale | `/var/www/roaya-website/index.html` mtime `2026-02-08 11:53:34` |
| `robots.txt`, `sitemap.xml`, `llms.txt` all absent from the webroot | `curl -sI` on the origin returns `200` with `Content-Type: text/html` for `/robots.txt` — the SPA fallback hands crawlers `index.html` |
| No SSR process | `ps` shows only `node /opt/roaya/backend/dist/index.js` (PM2, up 197d) |
| Origin returns `200` for unknown routes | live nginx has `try_files $uri $uri/ /index.html` |
| **`assets/i18n` has never been deployed** | server `en/ar.json` mtime `2026-02-08 09:51`, repo `2026-08-23`. `CLAUDE.md`'s deploy uses `--exclude='assets'` to protect the 12 admin-uploaded images in `assets/images`, and takes `assets/i18n` down with it |
| **TLS cert expired 2026-05-01** | Sectigo `CN=www.roaya.co`; Cloudflare terminates TLS at the edge and is evidently not validating the origin |
| Live nginx proxies the API | `location /api/ { proxy_pass http://127.0.0.1:3001/api/; }` — this block was **missing** from this kit until 2026-08-24 and is now included |
| Prisma Studio exposed | `node .../prisma studio` listening on `*:5555`, up 197d, no auth. Unrelated to this deploy — kill it regardless |
| Host runs Node **v20.20.0**, npm 10.8.2 | satisfies Angular 21's `^20.19.0`; note `package.json` declares `packageManager: npm@11.6.3` |
| Backend healthy | `{"status":"healthy","services":{"database":"up","redis":"up"}}` |

The i18n finding matters more once SSR is live, not less: `ServerTranslationLoader`
bundles the JSON into the server bundle at build time, while the browser fetches
`/assets/i18n/{lang}.json` at runtime. Ship a fresh SSR bundle over a stale
`assets/i18n` and the SSR HTML renders correct copy that hydration then
*overwrites* with six-month-old strings. `deploy/scripts/deploy-ssr.sh` fixes
this by shipping the build's own `assets/i18n` and copying only
`assets/images` forward.

### ⚠ A silently-broken build is the single biggest deploy risk

`ng build` **exits 0 when prerendering fails.** It emits no route HTML, and the
resulting artifact answers *every* route with an Express `404 Cannot GET /`.

This is not hypothetical — it happened on 2026-08-24 building this repo on
Node v25. `ThemeService`/`LanguageService` guarded browser storage with
`typeof localStorage === 'undefined'`, but Node 22+ ships an experimental
`localStorage` global that is *defined* and has no `getItem`. The guard passed
on the server, `.getItem` threw, all 30 prerenders died, and the build reported
success. Both services now use `isPlatformBrowser(PLATFORM_ID)` instead, which
is version-independent — but the failure mode is generic to any SSR-unsafe
code, so **always gate on the evidence suite** (step 5) rather than on the
build's exit code. A good build emits 30 `browser/**/index.html` files;
`deploy-ssr.sh` hard-fails below that.

### 1. Build and ship the website

Use the script — it encodes the gates that the manual commands in
`roaya-website/CLAUDE.md` lack:

```bash
cd roaya-website
DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh   # build + verify, upload nothing
./deploy/scripts/deploy-ssr.sh             # build, verify, ship, pm2 restart
```

It builds, runs `verify:evidence`, hard-fails if fewer than 30 prerendered
routes were emitted, ships `dist/roaya-website/` into a timestamped release
under `/var/www/roaya-ssr/releases/`, carries `assets/images` forward from the
old webroot, flips the `current` symlink, keeps the last 5 releases for
rollback, and restarts `pm2 roaya-ssr`.

The build produces:

```
dist/roaya-website/browser/                    static assets + robots.txt/sitemap.xml/llms.txt
dist/roaya-website/browser/**/index.html       30 prerendered routes
dist/roaya-website/server/server.mjs           SSR Node entry point (self-contained)
```

Build it on Node 20 or 22 LTS if you can. The `isBrowser` fix makes the build
version-independent, but the host runs Node v20.20.0 and matching it removes a
variable.

### 2. Backend (only if the backend is part of this deploy)

The backend is already deployed and healthy; touch it only if you have backend
changes to ship.

```bash
cd __BACKEND_DEPLOY_PATH__
npm ci --omit=dev
npm run build      # prisma generate + tsc -> dist/index.js
pm2 restart roaya-api
```

It needs a populated `__BACKEND_DEPLOY_PATH__/.env` (`DATABASE_URL`,
`REDIS_HOST`, `JWT_SECRET`, `SENDGRID_API_KEY`,
`CORS_ORIGIN=https://__SERVER_NAME__`, …). Postgres and Redis are already
running locally on the host and correctly bound to `127.0.0.1`.

### 3. Install nginx config

```bash
sudo cp roaya-website/deploy/nginx/roaya-website.conf /etc/nginx/sites-available/roaya-website.conf
# Replace every __PLACEHOLDER__ in the copied file with real values from the table above.
sudo ln -s /etc/nginx/sites-available/roaya-website.conf /etc/nginx/sites-enabled/roaya-website.conf
sudo nginx -t          # syntax check — must pass before reload
sudo systemctl reload nginx
```

#### TLS certificates — do NOT run certbot here

Earlier revisions of this runbook advised `certbot --nginx`. **That advice was
wrong for this host** and would clobber a paid certificate. The host uses a
Sectigo commercial cert, referenced by the live nginx config as:

```
ssl_certificate     /var/www/roaya-cert/www_roaya_co.crt;
ssl_certificate_key /var/www/roaya-cert/www.roaya.conopass.key;
```

`CN=www.roaya.co`, SANs cover `www.roaya.co` and `roaya.co`, valid
`2025-05-01` → **`2026-05-01`. It is expired.** Browsers do not surface this
because Cloudflare terminates TLS at the edge and is evidently configured
"Full" rather than "Full (strict)", so it accepts the stale origin cert.

Resolve this as its own task, before or independently of the SSR migration:

1. Decide with whoever owns the Sectigo account whether to renew, or to
   migrate the origin to Let's Encrypt (the config already has an
   `/.well-known/acme-challenge/` location rooted at `/var/www/letsencrypt`,
   so HTTP-01 would work).
2. If migrating to certbot, set Cloudflare to **Full (strict)** afterwards so
   an expired origin cert can't go unnoticed for four months again.
3. Keep the existing cert paths in the nginx config until the replacement is
   actually in place — swapping the paths before the files exist takes the
   site down at the origin.

Whichever route you take, re-verify with `sudo nginx -t` before reloading.

#### Decision needed: `www` or apex as canonical

The nginx config includes a 301 `www.roaya.co` → `roaya.co`. The **live**
config serves both hostnames identically with no redirect, which means
duplicate content on two canonical hosts.

Apex is the choice consistent with the rest of the repo — `public/sitemap.xml`,
`public/llms.txt`, and the route metadata registry all emit `https://roaya.co`
URLs. Against that, `roaya-website/CLAUDE.md` names `www.roaya.co` as the
project domain, and existing inbound links may point at `www` (a 301 preserves
their link equity, which is why the redirect is the safer of the two).

**Confirm the direction before installing.** Reversing a canonical host later
costs another round of re-indexing.

### 4. Install process supervision

Pick **one** approach per app. Do not run both for the same process.

**PM2 is the right choice on this host** — verified 2026-08-24: it already
runs a PM2 God daemon (v6.0.14) with `pm2-logrotate` installed, and the
backend has been supervised by it for 197 days. Adding the SSR app to the
existing PM2 setup means one supervisor to reason about, and
`deploy/scripts/deploy-ssr.sh` drives `pm2 restart roaya-ssr` directly.
The systemd units below remain as an alternative if you'd rather migrate
both apps off PM2 — but that's a separate change, not part of this deploy.

**PM2 (recommended for this host):**

```bash
# One-time registration (deploy-ssr.sh prints this if the app is missing):
pm2 start /var/www/roaya-ssr/current/server/server.mjs --name roaya-ssr \
  --cwd /var/www/roaya-ssr/current -i 1
pm2 save

# Thereafter, deploys are just:
#   ./deploy/scripts/deploy-ssr.sh
```

Note the SSR bundle is **self-contained** — Angular bundles express and all
runtime dependencies into `server.mjs`. Verified by running the built server
from a directory with no `node_modules`. No `npm ci` is needed on the host for
the website (the backend still needs its own deps).

**systemd (alternative):**

```bash
sudo cp roaya-website/deploy/systemd/roaya-ssr.service /etc/systemd/system/roaya-ssr.service
sudo cp backend/deploy/systemd/roaya-api.service /etc/systemd/system/roaya-api.service
# Replace every __PLACEHOLDER__ in both unit files.
sudo mkdir -p /var/log/roaya
sudo chown __DEPLOY_USER__:__DEPLOY_GROUP__ /var/log/roaya
sudo systemctl daemon-reload
sudo systemctl enable --now roaya-ssr.service
sudo systemctl enable --now roaya-api.service
sudo systemctl status roaya-ssr.service roaya-api.service
```

**PM2 (alternative):**

```bash
cd __BACKEND_DEPLOY_PATH__
pm2 start ecosystem.config.js --env production   # backend already ships its own ecosystem file

cd __WEBSITE_DEPLOY_PATH__
pm2 start deploy/pm2/ecosystem.config.js --env production
pm2 save
pm2 startup   # follow the printed command to enable boot-time startup
```

### 5. Verify locally before flipping traffic

```bash
cd __WEBSITE_DEPLOY_PATH__
npm run verify:evidence   # must report 9/9 — see docs/deploy/verification-checklist.md
```

Then run the full curl matrix in
[`verification-checklist.md`](./verification-checklist.md) against the live
host.

### Rollback

- **nginx config**: keep the previous `/etc/nginx/sites-available/roaya-website.conf`
  as `.bak` before overwriting; `sudo nginx -t && sudo systemctl reload nginx`
  with the `.bak` restored is the fastest revert.
- **SSR / backend process**: keep the previous `dist/` build directory
  (e.g. `dist.previous/`) before overwriting with a new build; point the
  systemd unit's `ExecStart` (or PM2 `script`) at it and
  `sudo systemctl restart roaya-ssr.service` / `pm2 restart roaya-ssr` to
  revert without a rebuild.
- **Database**: the backend uses Prisma migrations (`prisma migrate deploy`).
  Do not roll back a migration as part of an app rollback unless the schema
  change itself is the cause — coordinate separately.

### Dependency-risk note (open advisories — go-live with eyes open)

`npm audit --omit=dev` against the current `main` (`99e47207cd2545bbd367e72298694938eb22c52b`):

- **`roaya-website/` (Angular SSR frontend): 10 vulnerabilities — 1 critical, 6 high, 1 moderate, 2 low.**
  - Critical: `@angular/ssr` — SSRF and header injection via the request-handling pipeline, plus an open redirect via `X-Forwarded-Prefix` (multiple GHSAs).
  - High: `@angular/core`, `@angular/compiler`, `@angular/common`, `@angular/platform-server` — several Angular SSR/i18n XSS and SSRF advisories; `lodash-es` — code injection via `_.template` and prototype pollution; `path-to-regexp` — ReDoS.
- **`backend/`: 13 vulnerabilities — 4 high, 7 moderate, 2 low (no critical).**
  - High: `axios` (transitive) — a large set of SSRF/prototype-pollution/credential-leak advisories; `form-data` — CRLF injection; `path-to-regexp` — ReDoS; `ws` — uninitialized memory disclosure and memory-exhaustion DoS.

Most have non-breaking fixes via `npm audit fix`; the Angular packages,
`quill`, and `uuid`/`bullmq` require `npm audit fix --force` (breaking
version bumps) and are out of scope for this issue — no dependency upgrades
were made here. This is a decision input for whoever approves go-live, not a
blocker this issue resolves.
