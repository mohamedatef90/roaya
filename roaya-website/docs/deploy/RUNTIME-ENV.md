# SSR runtime environment contract

Applies to the Angular SSR server (`dist/roaya-website/server/server.mjs`,
`@angular/ssr` 21.2.21) running as the pm2 app `roaya-ssr` behind nginx.

## Required

```
NODE_ENV=production
PORT=4000
NG_ALLOWED_HOSTS=roaya.co,www.roaya.co
```

### `NG_ALLOWED_HOSTS` — required, and it fails open

`@angular/ssr` >= 21 validates the request `Host` header against this
allowlist. **When the hostname is not allowed, Angular does not return an
error.** It logs `Header "host" with value "..." is not allowed` and serves
`browser/index.csr.html` with **HTTP 200**. Every route becomes an empty
client-rendered shell: no prerendered HTML, no server-rendered detail pages,
no real 404s, and the AI-readiness work is defeated — while every health check
that only looks at the status code reports success.

Verified behaviour of the installed version:

- The allowlist is read from the `NG_ALLOWED_HOSTS` env var (comma-separated)
  unioned with the build manifest's list, which is empty for this project.
  Nothing in `src/`, `angular.json`, or `package.json` sets it.
- Matching compares the **hostname only** — do not put ports in the value.
- `*` matches everything (the engine warns that this is a security risk) and a
  leading `*.` acts as a suffix wildcard. Neither is used here.

Keep `localhost`, `127.0.0.1`, and `*` **out** of the production allowlist.
nginx sends `proxy_set_header Host $host`, so real traffic only ever presents
`roaya.co` or `www.roaya.co`. Loopback probes must send an accepted Host
header instead of widening the allowlist — see below.

### `NG_TRUST_PROXY_HEADERS` — intentionally unset

Do not set it. Its type is `boolean | readonly string[]` and it defaults to
`undefined` (proxy headers ignored). It only widens the trusted `X-Forwarded-*`
set used when constructing the request URL. It is unnecessary here because:

- the hostname check reads the `Host` header, which nginx already sets
  correctly;
- nginx never sets `X-Forwarded-Host` or `X-Forwarded-Prefix`, the headers this
  option governs;
- the app derives no absolute URL from the request — canonical origins are
  hardcoded constants.

Revisit only if nginx starts setting `X-Forwarded-Host`/`-Prefix`, or if the
app begins deriving absolute URLs from the incoming request.

## nginx must forward the real Host

`deploy/nginx/roaya-website.conf` must keep, in every location that proxies to
the SSR upstream:

```
proxy_set_header Host $host;
```

If that becomes a literal or an upstream name, the hostname reaching Angular
stops matching the allowlist and the whole site silently degrades to the CSR
shell.

## Health checks: HTTP 200 is not sufficient

Because the failure mode returns 200, any check that only asserts a status code
passes while the site is broken. A valid check must:

1. request the loopback upstream directly (never a public/Cloudflare URL — that
   tests the edge, not the release you just activated);
2. send `Host: roaya.co`, a hostname the allowlist accepts;
3. assert **rendered content** — the `/about` H1 text
   `Your Trusted Technology Partner in Egypt`;
4. reject a response byte-identical to `browser/index.csr.html`.

This is what the activation gate in `deploy/scripts/deploy-ssr.sh` does. Do not
replace the content assertion with a response-size threshold: the CSR shell is
~28 KB and a size floor is easy to satisfy accidentally.

## Persistence

Two independent places must carry the contract, because either one alone is
lost:

1. **`deploy/scripts/deploy-ssr.sh`** exports `NODE_ENV`, `PORT`, and
   `NG_ALLOWED_HOSTS` in the remote shell before `pm2 restart --update-env`.
   `--update-env` *replaces* the app environment with the calling shell's, so
   anything not exported there is stripped from the running process. This is
   exactly how `NODE_ENV` and `PORT` disappeared from the live process on
   2026-08-25 while still present in `~/.pm2/dump.pm2`.
2. **`pm2 save`**, run by the same script only after the activation gate
   passes, so a reboot or `pm2 resurrect` restores the app with the contract
   intact. A failed `pm2 save` is treated as a deployment failure.

`deploy/pm2/ecosystem.config.js` (`env_production`) and
`deploy/systemd/roaya-ssr.service` (`Environment=`) also declare the contract,
for whichever supervisor is in use.

Guarded by `npm run test:deploy-runtime-config`.

## Verifying on the host (read-only)

```
# does the running process actually have the allowlist?
tr '\0' '\n' < /proc/$(pgrep -f server.mjs | head -1)/environ | grep '^NG_ALLOWED_HOSTS='

# does the origin render, or is it the CSR shell?
curl -s -o /tmp/probe.html -w '%{http_code} %{size_download}\n' --max-time 10 \
  -H 'Host: roaya.co' http://127.0.0.1:4000/about
grep -c 'Your Trusted Technology Partner in Egypt' /tmp/probe.html   # must be >= 1
rm -f /tmp/probe.html
```

A ~28 KB response with a marker count of 0 means the CSR fallback is being
served.

## Build and template placeholders

The artifact is built with `npm ci && npm run build:prod`, producing
`dist/roaya-website/{browser,server}`. **Known defect:** `ng build` currently
emits a complete artifact and then fails to exit, so `deploy-ssr.sh` blocks at
its build step. That is unresolved and tracked separately; nothing in this
document works around it.

`deploy/pm2/ecosystem.config.js` and `deploy/systemd/roaya-ssr.service` are
templates. Substitute before use:

| Placeholder | Value on the current host |
|---|---|
| `__WEBSITE_DEPLOY_PATH__` | `/var/www/roaya-ssr/current` |
| `__SSR_PORT__` | `4000` |
| `__DEPLOY_USER__` / `__DEPLOY_GROUP__` | `roaya` / `roaya` |

`NG_ALLOWED_HOSTS` is deliberately a literal, not a placeholder — it must never
be left unsubstituted, because an unsubstituted value would be treated as a
hostname and match nothing.

## Post-deploy host verification

`deploy-ssr.sh` gates activation on the SSR content check above. Two things it
does **not** cover, because they are nginx's responsibility rather than the
Node server's, must be checked against the host after a deploy:

- **Machine-file content types** — `/robots.txt`, `/sitemap.xml`, `/llms.txt`
  must be reachable, byte-identical to `public/`, and served with the correct
  `Content-Type`. The config side is enforced automatically by the `llms-txt`
  evidence check, which parses `deploy/nginx/roaya-website.conf`; the served
  side needs a real request against the host.
- **Security headers and redirects** — `www` → apex, HSTS, and the
  `X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` set.

## Activation is not atomic

`deploy-ssr.sh` repoints `current` **before** pm2 restarts, so there is a
window — normally a few seconds — in which nginx serves static assets from the
**new** `browser/` directory while the still-running old process emits HTML
referencing the **old** hashed bundles, which are not present in the new
directory. Requests landing in that window can fetch a 404'd bundle.

If the restart or the SSR gate then fails, that mismatch **persists** until an
operator rolls back. This is why:

- the script captures the previous release target **before** the flip and
  prints exact, copy-pasteable rollback commands on every failure path;
- rollback is **manual and attended** in the current design — the script never
  rolls back on its own, and it says so explicitly when it exits;
- old releases are pruned **only after** the restart, the SSR gate, and
  `pm2 save` have all succeeded, so a rollback target always survives a failed
  deploy.

Do not describe this deployment as atomic or zero-downtime. It is neither.

## Manual rollback

There is no tested automated rollback helper in this repository, so
`deploy-ssr.sh` deliberately does not invent one. It fails loudly and leaves
the release in place. Releases are timestamped under
`/var/www/roaya-ssr/releases` (5 kept), so rollback is a symlink swap plus a
restart, with no rebuild:

```
ls -1dt /var/www/roaya-ssr/releases/*/          # pick the previous release
ln -sfn /var/www/roaya-ssr/releases/<previous> /var/www/roaya-ssr/current
NODE_ENV=production PORT=4000 NG_ALLOWED_HOSTS=roaya.co,www.roaya.co \
  pm2 restart roaya-ssr --update-env
pm2 save
```

Re-run the health check above afterwards.

## Supported deployment path

`./deploy/scripts/deploy-ssr.sh` is the only supported path. `DRY_RUN=1`
builds and gates without uploading.

Copying a browser build into the flat `/var/www/roaya-website` root is
**forbidden**. nginx serves `/var/www/roaya-ssr/current/browser` and proxies
dynamic routes to the SSR upstream; that legacy directory is referenced by
**zero** lines of the active nginx config. On 2026-08-25 a correct build was
copied there and production kept serving the previous release for hours with no
error anywhere. The directory still exists only because it holds
admin-uploaded `assets/images`, which `deploy-ssr.sh` carries forward into each
release — do not delete it.
