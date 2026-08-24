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
tar czf "$TARBALL" -C dist roaya-website
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
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail

# /var/www is owned by the deploy user (verified 2026-08-24), so no sudo is
# needed here — and using it would hang on a password prompt over a
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

ln -sfn "$RELEASE_DIR/releases/$STAMP" "$RELEASE_DIR/current"

# Keep the 5 most recent releases for rollback; drop the rest.
ls -1dt "$RELEASE_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf

rm -f "$REMOTE_TARBALL"

if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  echo "NOTE: pm2 app '$PM2_APP' not registered yet."
  echo "Register it once, then re-run this script:"
  echo "  pm2 start $RELEASE_DIR/current/server/server.mjs --name $PM2_APP \\"
  echo "    --cwd $RELEASE_DIR/current -i 1 --env production"
  echo "  pm2 save"
fi
pm2 describe "$PM2_APP" 2>/dev/null | grep -E 'status|uptime|restarts' || true
REMOTE

log "Deployed. Now run docs/deploy/verification-checklist.md against the host."
