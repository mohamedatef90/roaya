#!/usr/bin/env bash
#
# Deploy the Angular SSR website to the self-hosted production server.
#
# Supersedes the browser-only `tar`/`scp` command in roaya-website/CLAUDE.md,
# which shipped ONLY dist/roaya-website/browser and excluded assets/ entirely.
# That had two consequences this script fixes:
#   1. The SSR server bundle was never shipped, so no SSR process could run.
#   2. assets/i18n/{en,ar}.json never reached production (the exclude existed
#      to protect admin-uploaded images in assets/images), so translation
#      changes were invisible on the live site.
#
# Usage:
#   ./deploy/scripts/deploy-ssr.sh            # build, verify, ship, restart
#   DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh  # build + verify only, no upload
#
# Requires: VPN connection to the host and ~/.ssh/roaya_server.
set -euo pipefail

SSH_HOST="${SSH_HOST:-roaya@10.1.2.2}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/roaya_server}"
SSH_OPTS=(-o ConnectTimeout=30 -i "$SSH_KEY")
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/roaya-website}"
RELEASE_DIR="${RELEASE_DIR:-/var/www/roaya-ssr}"
PM2_APP="${PM2_APP:-roaya-ssr}"
DRY_RUN="${DRY_RUN:-0}"
SSR_PORT="${SSR_PORT:-4000}"

# ---------------------------------------------------------------------------
# Explicit production runtime contract
# ---------------------------------------------------------------------------
# These are passed into the remote block as positional arguments and exported
# there before pm2 is touched. They are NOT inherited from the caller: the
# remote `pm2 restart --update-env` REPLACES the app environment with the
# calling shell's, and a non-interactive SSH shell carries none of these. That
# is how NODE_ENV and PORT were silently dropped from the live process on
# 2026-08-25 while still sitting in ~/.pm2/dump.pm2.
NODE_ENV_VALUE="production"

# REQUIRED by @angular/ssr >= 21. If the Host header hostname is not in this
# allowlist, Angular does NOT error - it serves browser/index.csr.html with
# HTTP 200. Every route silently becomes an empty client-rendered shell, which
# is why the health check below asserts content and not just status.
# Hostnames only; the check ignores the port. Keep localhost, 127.0.0.1 and
# '*' OUT of it - the loopback probe sends `Host: roaya.co` instead.
NG_ALLOWED_HOSTS_VALUE="roaya.co,www.roaya.co"

# REQUIRED, and NOT optional hardening. nginx forwards X-Forwarded-For and
# X-Forwarded-Proto to the SSR upstream. @angular/ssr silently deoptimizes to
# browser/index.csr.html - HTTP 200, empty shell, only an informational log
# line - when it receives an X-Forwarded-* header it does not trust. That is
# what took production down on 2026-08-25 while the old status-only gate and a
# Host-only probe both reported success.
# The explicit list REPLACES Angular's defaults, so it must name exactly the
# forwarded headers nginx sends. Never `true` or a wildcard: that trusts
# attacker-supplied forwarding headers. x-real-ip is intentionally absent - it
# is not an X-Forwarded-* header and this option does not govern it.
NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"

# Loopback activation gate. Must be a hostname present in the allowlist above,
# never a public Cloudflare URL - this gate must test the origin we just
# activated, not the edge.
SSR_HEALTH_HOST="${SSR_HEALTH_HOST:-roaya.co}"
# Stable prerendered text from /about. If this is absent the response is not
# server-rendered, whatever the status code says.
SSR_HEALTH_MARKER="Your Trusted Technology Partner in Egypt"

cd "$(dirname "$0")/../.."   # -> roaya-website/

log() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

# ---------------------------------------------------------------------------
# 1. Build
# ---------------------------------------------------------------------------
# The build MUST be gated on step 2 below. A prerender failure does NOT fail
# `ng build` — it exits 0 and silently emits no route HTML, which produces an
# artifact that answers every route with an Express 404. This bit us on
# 2026-08-24 building under Node 25 (see the isBrowser note in
# core/services/theme.service.ts).
log "Building production bundle (node $(node -v))"
npm run build:prod

# ---------------------------------------------------------------------------
# 2. Gate: the evidence suite must pass against the build we are about to ship
# ---------------------------------------------------------------------------
# This is the check that catches a silently-broken prerender: it boots the
# built server and asserts a known static route returns 200 and an unknown
# route returns a real 404.
log "Verifying evidence suite (must be 9/9)"
npm run verify:evidence

PRERENDERED=$(find dist/roaya-website/browser -name index.html | wc -l | tr -d ' ')
if [ "$PRERENDERED" -lt 30 ]; then
  echo "FATAL: only $PRERENDERED prerendered route(s) emitted, expected >= 30." >&2
  echo "The prerender step failed silently. Do not deploy this artifact." >&2
  exit 1
fi
log "Prerendered routes emitted: $PRERENDERED"

if [ "$DRY_RUN" = "1" ]; then
  log "DRY_RUN=1 — build verified, nothing uploaded."
  exit 0
fi

# ---------------------------------------------------------------------------
# 3. Package
# ---------------------------------------------------------------------------
# The server bundle is self-contained (Angular bundles express and all runtime
# deps into server.mjs), so no node_modules or package.json is needed on the
# host. Ship dist/roaya-website/ as-is.
log "Packaging"
TARBALL=/tmp/roaya-ssr-$(date +%Y%m%d-%H%M%S).tar.gz
# COPYFILE_DISABLE stops macOS tar from embedding ._* AppleDouble entries and
# xattr headers, which GNU tar on the host reports as pages of warnings.
COPYFILE_DISABLE=1 tar czf "$TARBALL" -C dist roaya-website
echo "  $TARBALL ($(du -h "$TARBALL" | cut -f1))"

# ---------------------------------------------------------------------------
# 4. Ship + activate
# ---------------------------------------------------------------------------
# Released into a timestamped directory with a `current` symlink so rollback
# is a symlink swap plus a pm2 restart, not a rebuild.
log "Uploading to $SSH_HOST"
scp "${SSH_OPTS[@]}" "$TARBALL" "$SSH_HOST:/tmp/"

REMOTE_TARBALL="/tmp/$(basename "$TARBALL")"
STAMP=$(basename "$TARBALL" .tar.gz)

log "Activating release on host"
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s -- \
  "$RELEASE_DIR" "$REMOTE_ROOT" "$STAMP" "$REMOTE_TARBALL" "$PM2_APP" "$SSR_PORT" \
  "$NODE_ENV_VALUE" "$NG_ALLOWED_HOSTS_VALUE" "$SSR_HEALTH_HOST" "$SSR_HEALTH_MARKER" \
  "$NG_TRUST_PROXY_HEADERS_VALUE" <<'REMOTE'
set -euo pipefail

RELEASE_DIR="$1"
REMOTE_ROOT="$2"
STAMP="$3"
REMOTE_TARBALL="$4"
PM2_APP="$5"
SSR_PORT="$6"
NODE_ENV_VALUE="$7"
NG_ALLOWED_HOSTS_VALUE="$8"
SSR_HEALTH_HOST="$9"
SSR_HEALTH_MARKER="${10}"
NG_TRUST_PROXY_HEADERS_VALUE="${11}"

# Validate the content marker BEFORE anything is flipped or restarted. An empty
# or whitespace-only marker would make the gate's assertion vacuous, because
# `grep -qF ""` matches every file including the CSR shell - the gate would
# then pass on exactly the failure it exists to catch.
if [ -z "${SSR_HEALTH_MARKER//[[:space:]]/}" ]; then
  echo "FATAL: SSR_HEALTH_MARKER is empty or whitespace-only." >&2
  echo "The activation gate would degrade to 'grep -qF \"\"', which matches the" >&2
  echo "CSR fallback shell and every other response. Refusing to activate." >&2
  echo "Nothing was changed on this host." >&2
  exit 1
fi

# /var/www is owned by the deploy user (verified 2026-08-24), so no sudo is
# needed here - and using it would hang on a password prompt over a
# non-interactive SSH session.
mkdir -p "$RELEASE_DIR/releases"

# Unpack the new release alongside the old ones.
mkdir -p "$RELEASE_DIR/releases/$STAMP"
tar xzf "$REMOTE_TARBALL" -C "$RELEASE_DIR/releases/$STAMP" --strip-components=1
find "$RELEASE_DIR/releases/$STAMP" -name '._*' -delete

# Carry over admin-uploaded images, which live only on the server and are not
# in the repo. This is why the old deploy excluded assets/ wholesale; here we
# copy images across and let the build's own assets/i18n win.
if [ -d "$REMOTE_ROOT/assets/images" ]; then
  mkdir -p "$RELEASE_DIR/releases/$STAMP/browser/assets/images"
  cp -Rn "$REMOTE_ROOT/assets/images/." \
         "$RELEASE_DIR/releases/$STAMP/browser/assets/images/" 2>/dev/null || true
fi

# ---------------------------------------------------------------------------
# Capture the rollback target BEFORE the flip
# ---------------------------------------------------------------------------
# Deployment is NOT atomic: `current` is repointed here, but the running
# process keeps serving the previous bundle until pm2 restarts below. During
# that window nginx serves static assets from the NEW browser/ dir while the
# old process still emits HTML referencing the OLD hashed bundles, which are
# absent from the new dir. If the restart or the health gate then fails, that
# mismatch persists until an operator rolls back - so capture the exact
# previous target now, while it is still knowable, and hand it back verbatim.
PREV_TARGET=$(readlink -f "$RELEASE_DIR/current" 2>/dev/null || true)

# Only present PREV_TARGET as a rollback target if it is actually safe to use:
# a real directory, inside this release tree, and not the release we are about
# to activate. Anything else is treated as "no previous release".
PREV_VALID=0
if [ -n "$PREV_TARGET" ]; then
  case "$PREV_TARGET" in
    "$RELEASE_DIR/releases/"*)
      if [ -d "$PREV_TARGET" ] && [ "$PREV_TARGET" != "$RELEASE_DIR/releases/$STAMP" ]; then
        PREV_VALID=1
      fi
      ;;
    *)
      # Out-of-tree or malformed: never printed, never executed.
      echo "NOTE: existing 'current' resolves outside $RELEASE_DIR/releases; it" >&2
      echo "will not be offered as a rollback target." >&2
      ;;
  esac
fi

# Emit copy-pasteable rollback commands. %q quotes for safe re-execution.
emit_rollback() {
  echo "" >&2
  echo "This deploy has EXITED. Rollback was NOT performed automatically." >&2
  if [ "$PREV_VALID" -eq 1 ]; then
    echo "Run these two commands on this host to roll back now:" >&2
    printf '  ln -sfn %q %q\n' "$PREV_TARGET" "$RELEASE_DIR/current" >&2
    printf '  NODE_ENV=%q PORT=%q NG_ALLOWED_HOSTS=%q NG_TRUST_PROXY_HEADERS=%q pm2 restart %q --update-env\n' \
      "$NODE_ENV_VALUE" "$SSR_PORT" "$NG_ALLOWED_HOSTS_VALUE" "$NG_TRUST_PROXY_HEADERS_VALUE" "$PM2_APP" >&2
    echo "Then re-verify:" >&2
    printf '  curl -s -o /tmp/probe.html -w %q --max-time 10 -H %q %q\n' \
      '%{http_code}\n' "Host: $SSR_HEALTH_HOST" "http://127.0.0.1:$SSR_PORT/about" >&2
    printf '  grep -c %q /tmp/probe.html && rm -f /tmp/probe.html\n' "$SSR_HEALTH_MARKER" >&2
  else
    echo "No previous release is available to roll back to: this appears to be" >&2
    echo "the first deployment into $RELEASE_DIR (or the prior 'current' was" >&2
    echo "missing/out-of-tree). Fix forward - there is nothing to restore." >&2
  fi
}

ln -sfn "$RELEASE_DIR/releases/$STAMP" "$RELEASE_DIR/current"

rm -f "$REMOTE_TARBALL"

# The pm2 CLI table-rendering commands (list/describe/restart) hang without a
# TTY on this host - observed 2026-08-24, wedging a deploy after the artifact
# was already live. The jlist subcommand emits plain JSON and is reliable;
# every pm2 call is wrapped in the timeout utility so a hang degrades to a
# warning instead of a hung deploy.
#
# NOTE: this heredoc delimiter is QUOTED on purpose. Everything below runs on
# the host; inputs arrive as positional parameters above. An unquoted
# delimiter makes the local shell expand $vars, $(cmd) AND backticks in these
# comments - which silently broke this block on 2026-08-24.
# Export the runtime contract BEFORE touching pm2. `--update-env` below reads
# the environment of this shell, so these three must exist here or the app is
# restarted without them. Values arrive as positional parameters; nothing is
# inherited from the caller and no other environment entry is printed.
export NODE_ENV="$NODE_ENV_VALUE"
export PORT="$SSR_PORT"
export NG_ALLOWED_HOSTS="$NG_ALLOWED_HOSTS_VALUE"
export NG_TRUST_PROXY_HEADERS="$NG_TRUST_PROXY_HEADERS_VALUE"

if timeout 30 pm2 jlist 2>/dev/null | grep -q "\"name\":\"$PM2_APP\""; then
  # No `|| true` here on purpose: a timed-out or failed restart must not be
  # reported as a successful one (it was, before 2026-08-25).
  if timeout 60 pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1; then
    echo "restarted pm2 app '$PM2_APP' (NODE_ENV, PORT, NG_ALLOWED_HOSTS applied)"
  else
    echo "FATAL: 'pm2 restart $PM2_APP --update-env' failed or timed out." >&2
    echo "The new release is on disk and 'current' points at it, but the" >&2
    echo "process was NOT restarted, so it is still serving the previous" >&2
    echo "bundle while nginx serves the new static assets. Inspect:" >&2
    echo "  pm2 logs $PM2_APP" >&2
    emit_rollback
    exit 1
  fi
else
  echo "FATAL: pm2 app '$PM2_APP' is not registered; nothing was started." >&2
  echo "Register it once, with the full runtime contract:" >&2
  echo "  cd $RELEASE_DIR/current && \\" >&2
  echo "    NODE_ENV=$NODE_ENV_VALUE PORT=$SSR_PORT \\" >&2
  echo "    NG_ALLOWED_HOSTS=$NG_ALLOWED_HOSTS_VALUE \\" >&2
  echo "    NG_TRUST_PROXY_HEADERS=$NG_TRUST_PROXY_HEADERS_VALUE \\" >&2
  echo "    pm2 start server/server.mjs --name $PM2_APP --cwd $RELEASE_DIR/current -i 1" >&2
  echo "  pm2 save" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Fail-closed SSR activation gate
# ---------------------------------------------------------------------------
# A plain 200 proves nothing: when NG_ALLOWED_HOSTS is missing or wrong,
# Angular answers 200 with browser/index.csr.html and every page is an empty
# shell. So this asserts rendered CONTENT, sends a Host the allowlist accepts,
# and refuses a response that is byte-identical to the CSR shell.
sleep 3
RESP_FILE=$(mktemp)
# Remove the response body on every exit path, success or failure.
trap 'rm -f "$RESP_FILE"' EXIT

# Explicit control flow, not `|| echo 000`: on a transport failure curl still
# writes its own "000" to stdout, and appending another would yield "000000".
# The probe MUST mirror the real nginx request shape. A Host-only probe passed
# on 2026-08-25 while every real request - which also carries X-Forwarded-For -
# was served the CSR shell, because @angular/ssr deoptimizes on an untrusted
# X-Forwarded-* header. Sending only Host tests a shape no visitor ever sends.
if CODE=$(curl -s -o "$RESP_FILE" -w '%{http_code}' --max-time 10 \
  -H "Host: $SSR_HEALTH_HOST" \
  -H "X-Forwarded-For: 127.0.0.1" \
  -H "X-Forwarded-Proto: https" \
  -H "X-Real-IP: 127.0.0.1" \
  "http://127.0.0.1:$SSR_PORT/about"); then
  :
else
  CODE="000"
fi
# Normalise anything unexpected (empty, or a concatenated multi-status) to 000.
case "$CODE" in
  [0-9][0-9][0-9]) : ;;
  *) CODE="000" ;;
esac

HEALTH_FAIL=0
FAIL_REASON=""

if [ "$CODE" != "200" ]; then
  HEALTH_FAIL=1
  FAIL_REASON="status $CODE (expected 200)"
fi

if ! grep -qF "$SSR_HEALTH_MARKER" "$RESP_FILE" 2>/dev/null; then
  HEALTH_FAIL=1
  FAIL_REASON="${FAIL_REASON:+$FAIL_REASON; }missing prerendered marker"
fi

CSR_SHELL="$RELEASE_DIR/current/browser/index.csr.html"
if [ -f "$CSR_SHELL" ] && cmp -s "$RESP_FILE" "$CSR_SHELL"; then
  HEALTH_FAIL=1
  FAIL_REASON="${FAIL_REASON:+$FAIL_REASON; }response is byte-identical to index.csr.html"
fi

# Angular reports an untrusted forwarded header as an informational log line,
# never an HTTP error, so the log is the only place this shows up early.
if timeout 20 pm2 logs "$PM2_APP" --lines 60 --nostream --raw 2>/dev/null \
   | grep -q 'trustProxyHeaders'; then
  HEALTH_FAIL=1
  FAIL_REASON="${FAIL_REASON:+$FAIL_REASON; }SSR logged an untrusted proxy-header deopt (trustProxyHeaders)"
fi

if [ "$HEALTH_FAIL" -ne 0 ]; then
  echo "FATAL: SSR activation gate FAILED on 127.0.0.1:$SSR_PORT/about" >&2
  echo "  reason: $FAIL_REASON" >&2
  echo "  Host header sent: $SSR_HEALTH_HOST" >&2
  echo "" >&2
  echo "This release may be serving the CLIENT-SIDE RENDERING FALLBACK." >&2
  echo "Angular returns HTTP 200 with an empty shell when the request Host is" >&2
  echo "not in NG_ALLOWED_HOSTS, so a 200 alone does not mean the site works." >&2
  echo "Check that the process really has the allowlist:" >&2
  echo "  tr '\\0' '\\n' < /proc/\$(pgrep -f server.mjs | head -1)/environ | grep '^NG_ALLOWED_HOSTS='" >&2
  echo "  pm2 logs $PM2_APP   # look for: Header \"host\" ... is not allowed" >&2
  echo "" >&2
  echo "'pm2 save' was NOT run, so a reboot/resurrect will not persist this state." >&2
  echo "No release was pruned, so every prior release is still on disk." >&2
  emit_rollback
  exit 1
fi

echo "SSR healthy on 127.0.0.1:$SSR_PORT (/about -> 200, rendered content verified)"

# Only persist once the release is proven good. Without this the exported
# variables live solely in the running process and vanish on reboot/resurrect.
if timeout 30 pm2 save >/dev/null 2>&1; then
  echo "pm2 save: runtime contract persisted for reboot/resurrect"

  # Prune ONLY here: after the restart succeeded, the SSR gate passed, and the
  # contract was persisted. Pruning earlier would delete rollback candidates
  # before the release they would roll back from was known to be good.
  # Keeps the 5 most recent releases.
  ls -1dt "$RELEASE_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf
  echo "pruned old releases (5 most recent retained)"
else
  echo "FATAL: 'pm2 save' failed or timed out. The release is live and healthy," >&2
  echo "but the runtime contract is NOT persisted: a reboot or 'pm2 resurrect'" >&2
  echo "would bring the app back WITHOUT NG_ALLOWED_HOSTS and serve the CSR" >&2
  echo "fallback on every route. Re-run 'pm2 save' on the host before leaving." >&2
  exit 1
fi
REMOTE

log "Deployed. Runtime contract: docs/deploy/RUNTIME-ENV.md (verification + rollback)."
