## Production parity kit — self-hosted SSH deployment runbook (TIFO-18)

Production for the Roaya website is a self-hosted server reached over
VPN/SSH — **not Vercel**. This runbook reproduces the Stage 1.1 host-hygiene
behavior currently defined in `roaya-website/vercel.json` (see
[`vercel-nginx-mapping.md`](./vercel-nginx-mapping.md) for the exact mapping)
plus process supervision for the Angular SSR server and the backend API.

No agent runs any step in this runbook against the real production host. A
human with SSH access executes it.

### Fill these in before you start

| Placeholder | Meaning | Known value (repo evidence) |
|---|---|---|
| `__SERVER_NAME__` | Production apex domain | `roaya.co` (`roaya-website/CLAUDE.md` Production Environment table) |
| `__WWW_SERVER_NAME__` | www host to redirect from | `www.roaya.co` |
| `__SSL_CERT_PATH__` | TLS full-chain cert path | Not documented in-repo — confirm with whoever manages the host, e.g. `/etc/letsencrypt/live/roaya.co/fullchain.pem` |
| `__SSL_KEY_PATH__` | TLS private key path | Not documented in-repo, e.g. `/etc/letsencrypt/live/roaya.co/privkey.pem` |
| `__BROWSER_DIST_PATH__` | Absolute path to the built Angular browser output | `/var/www/roaya-website/dist/roaya-website/browser` — CLAUDE.md's existing deploy commands untar the browser build directly into `/var/www/roaya-website/` (no `dist/` nesting on the server); adjust to match whatever layout you actually deploy |
| `__WEBSITE_DEPLOY_PATH__` | Absolute path to the deployed `roaya-website/` checkout | `/var/www/roaya-website` (CLAUDE.md) |
| `__BACKEND_DEPLOY_PATH__` | Absolute path to the deployed `backend/` checkout | `/opt/roaya/backend` (CLAUDE.md) |
| `__SSR_UPSTREAM_HOST__` / `__SSR_UPSTREAM_PORT__` | Where nginx proxies SSR requests | `127.0.0.1` / `4000` — `4000` is `src/server.ts`'s own default; not documented as already deployed anywhere (see gap note below) |
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

### 1. Build

On the server (or in a CI runner that then ships the artifacts over
SSH/rsync — this repo does not include that pipeline):

```bash
# Website (Angular SSR)
cd __WEBSITE_DEPLOY_PATH__
npm ci
npm run build:prod
# Produces:
#   dist/roaya-website/browser/   — static assets + robots.txt/sitemap.xml/llms.txt
#   dist/roaya-website/server/server.mjs — SSR Node entry point

# Backend
cd __BACKEND_DEPLOY_PATH__
npm ci --omit=dev
npm run build
# Runs `prisma generate` then `tsc`, producing dist/index.js
```

Run `npm run verify:evidence` inside `roaya-website/` before shipping a build
— see step 5.

### 2. Copy artifacts to the server

Whatever transport you use (rsync, git pull + build on-box, CI artifact
upload), the server needs:

- The full `roaya-website/` checkout (or at minimum `dist/`, `package.json`,
  `package-lock.json`, and any runtime env file) at `__WEBSITE_DEPLOY_PATH__`.
- The full `backend/` checkout (or `dist/`, `package.json`,
  `package-lock.json`, `prisma/`) at `__BACKEND_DEPLOY_PATH__`.
- A populated `__BACKEND_DEPLOY_PATH__/.env` — copy `backend/.env.example`
  and fill in real values (`DATABASE_URL`, `REDIS_HOST`, `JWT_SECRET`,
  `SENDGRID_API_KEY`, `CORS_ORIGIN=https://__SERVER_NAME__`, etc.).
- An optional `__WEBSITE_DEPLOY_PATH__/.env.production` if the SSR app reads
  any runtime env vars (e.g. the backend API base URL).

### 3. Install nginx config

```bash
sudo cp roaya-website/deploy/nginx/roaya-website.conf /etc/nginx/sites-available/roaya-website.conf
# Replace every __PLACEHOLDER__ in the copied file with real values from the table above.
sudo ln -s /etc/nginx/sites-available/roaya-website.conf /etc/nginx/sites-enabled/roaya-website.conf
sudo nginx -t          # syntax check — must pass before reload
sudo systemctl reload nginx
```

TLS certificates: use Let's Encrypt via certbot rather than fabricating
certs. Typical flow (adjust for your nginx/certbot packaging):

```bash
sudo certbot --nginx -d __SERVER_NAME__ -d __WWW_SERVER_NAME__
```

certbot will rewrite the `ssl_certificate`/`ssl_certificate_key` lines and
set up auto-renewal; re-verify the config afterward with `nginx -t`.

### 4. Install process supervision

Pick **one** approach — systemd (preferred, native to most Linux distros) or
PM2 — per app. Do not run both for the same process.

**systemd (preferred):**

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
