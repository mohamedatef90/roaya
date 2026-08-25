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

### `NG_TRUST_PROXY_HEADERS` — REQUIRED, and exactly this value

```
NG_TRUST_PROXY_HEADERS=x-forwarded-for,x-forwarded-proto
```

> **Correction.** An earlier revision of this document declared this variable
> "intentionally unset", reasoning that it only governs `X-Forwarded-Host` /
> `-Prefix` for request-URL construction and that nginx sends neither. **That
> was wrong and it caused a production outage on 2026-08-25.** The reasoning was
> never tested with `X-Forwarded-For` present — which nginx sends on every
> request.
>
> The release deployed cleanly, passed its activation gate, and then served
> `browser/index.csr.html` (HTTP 200, empty shell) to every visitor: no
> prerendered HTML, no real 404s. It was rolled back.

`@angular/ssr` **deoptimizes to the CSR shell** when a request carries an
`X-Forwarded-*` header it does not trust. It does not error and does not change
the status code — it emits an informational log line and serves the shell:

```
Received "x-forwarded-for" header but "trustProxyHeaders" was not set up to allow it.
```

Measured on the deployed bundle, spare port, one variable at a time:

| Request shape | Result |
|---|---|
| A. `Host` only | real SSR (132,481 B) |
| B. `Host` + `X-Forwarded-Proto` | real SSR |
| **C. `Host` + `X-Forwarded-Proto` + `X-Forwarded-For` + `X-Real-IP`** | **CSR shell (28,563 B)** |
| D. `Host` + `X-Forwarded-Host` | real SSR |

C is exactly what nginx sends, so **every real request** hit the shell while a
`Host`-only probe reported success.

**Why this exact list, and nothing more:**

- **It replaces Angular's defaults, it is not unioned with them.** An explicit
  list *is* the trusted set, so it must name precisely the forwarded headers
  nginx sends to SSR: `X-Forwarded-For` and `X-Forwarded-Proto`.
- **Never `true` or a wildcard.** That trusts arbitrary client-supplied
  forwarding headers — a spoofing surface, and pointless when the real set is
  two headers.
- **`x-real-ip` is deliberately absent.** It is not an `X-Forwarded-*` header
  and this option does not govern it; nginx still sends it, the app ignores it.
- **`x-forwarded-host` / `-prefix` / `-port` are absent** because the active SSR
  locations do not send them. Adding one would widen trust for no benefit — and
  the proxy-header matrix asserts an untrusted extra header still deopts, which
  is what keeps this list honest.

If nginx ever starts sending another forwarded header to SSR, add it here **and**
to the activation gate in the same change, or SSR will silently serve shells.

### nginx must overwrite X-Forwarded-For for SSR

Because Angular now *trusts* `X-Forwarded-For`, a client-supplied chain must
never reach it. In both SSR locations (`location /` and `location @ssr`):

```
proxy_set_header X-Forwarded-For $remote_addr;    # overwrite, NOT append
```

`$proxy_add_x_forwarded_for` appends the inbound header and would forward
attacker-controlled values into a header the application trusts. The `/api/`
location is out of scope and keeps its existing behaviour.

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
2. send `Host: roaya.co`, a hostname the allowlist accepts, **plus the same
   forwarded headers nginx adds** (`X-Forwarded-For`, `X-Forwarded-Proto`,
   `X-Real-IP`). A `Host`-only probe tests a shape no visitor ever sends, and is
   exactly why the 2026-08-25 CSR-shell release passed its gate;
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

Guarded by `npm run test:deploy-runtime-config` (contract, nginx SSR headers,
gate shape) and `npm run test:proxy-headers` (the real A/B/C/D matrix against the
built server).

## Verifying on the host (read-only)

**`/proc/<pid>/environ` is NOT authoritative for this app.** `roaya-ssr` runs in
pm2 **cluster** mode, where the worker's environment is injected via
`cluster.fork()` rather than at exec, so these keys read as unset even when
correctly applied. Use pm2's own view, the saved dump, and a functional probe.

```
# effective env pm2 applied (authoritative), non-secret keys only
pm2 jlist | python3 -c "import sys,json;[print(k+'='+str(a['pm2_env'].get(k,'<UNSET>'))) for a in json.load(sys.stdin) if a['name']=='roaya-ssr' for k in ['NODE_ENV','PORT','NG_ALLOWED_HOSTS','NG_TRUST_PROXY_HEADERS']]"

# what survives a reboot / pm2 resurrect
python3 -c "import json,os;d=json.load(open(os.path.expanduser('~/.pm2/dump.pm2')));[print(k+'='+str((a.get('env') or {}).get(k,'<UNSET>'))) for a in d if a.get('name')=='roaya-ssr' for k in ['NODE_ENV','PORT','NG_ALLOWED_HOSTS','NG_TRUST_PROXY_HEADERS']]"

# does the origin render, or is it the CSR shell?
curl -s -o /tmp/probe.html -w '%{http_code} %{size_download}\n' --max-time 10 \
  -H 'Host: roaya.co' -H 'X-Forwarded-For: 127.0.0.1' \
  -H 'X-Forwarded-Proto: https' -H 'X-Real-IP: 127.0.0.1' \
  http://127.0.0.1:4000/about
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
