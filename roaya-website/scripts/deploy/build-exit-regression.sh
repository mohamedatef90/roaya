#!/usr/bin/env bash
#
# Build-exit regression test for angular/angular-cli#33497.
#
# Runs the REAL production build and requires the build process to exit 0 ON ITS
# OWN, before a generous bound. Then asserts no ng/esbuild child survived.
#
# Semantics that must never be weakened:
#   - a natural `exit 0` before the bound is the ONLY success
#   - reaching the bound is a TEST FAILURE; the watchdog then terminates only
#     its own child tree (recording the failure first) and exits non-zero
#   - a timeout is NEVER converted into success, and no caller may continue
#     past a non-zero exit from this script
#   - a complete artifact from a hung build is the defect's signature, not a pass
#
# Usage:
#   npm run test:build-exit                 # clean build, then verify artifact
#   BUILD_EXIT_BOUND=900 npm run test:build-exit
#   BUILD_EXIT_KEEP_DIST=1 npm run test:build-exit   # keep dist for later gates
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

BOUND="${BUILD_EXIT_BOUND:-900}"          # generous: full prerender of 58 routes
KEEP_DIST="${BUILD_EXIT_KEEP_DIST:-0}"
LOG="$(mktemp -t roaya-build-exit)"
STATUS_FILE="$(mktemp -t roaya-build-status)"

cleanup_tmp() { rm -f "$LOG" "$STATUS_FILE"; }
trap cleanup_tmp EXIT

fail() { printf '\n✗ BUILD-EXIT REGRESSION FAILED: %s\n' "$1" >&2; exit 1; }

echo "Build-exit regression test (angular/angular-cli#33497)"
echo "============================================================"
echo "node    : $(node -v) ($(node -p 'process.execPath'))"
echo "ng build: @angular/build $(node -p "require('./node_modules/@angular/build/package.json').version")"
echo "bound   : ${BOUND}s"

# ---------------------------------------------------------------------------
# Refuse to run alongside another build - a second build invalidates the result.
# ---------------------------------------------------------------------------
if pgrep -f "ng build --configuration production" >/dev/null 2>&1; then
  fail "another 'ng build' is already running; results would be meaningless"
fi

rm -rf dist/roaya-website

# ---------------------------------------------------------------------------
# Start the real build in its own process group so the watchdog can terminate
# exactly its own tree and nothing else.
# ---------------------------------------------------------------------------
set -m
( npm run build:prod >"$LOG" 2>&1; echo "$?" >"$STATUS_FILE" ) &
WATCHED_PID=$!
set +m
echo "build pid: $WATCHED_PID"

elapsed=0
OWN_PIDS=""   # every pid ever seen in OUR process group, for a precise post-check
while kill -0 "$WATCHED_PID" 2>/dev/null; do
  OWN_PIDS="$OWN_PIDS $(pgrep -g "$WATCHED_PID" 2>/dev/null | tr '\n' ' ')"
  if [ "$elapsed" -ge "$BOUND" ]; then
    # Record the failure BEFORE touching the process, so the verdict can never
    # be confused with a successful build.
    echo ""
    echo "✗ TIMEOUT after ${BOUND}s — the build did not exit on its own." >&2
    echo "  This is the angular/angular-cli#33497 signature. Evidence:" >&2
    echo "  last build output:" >&2
    grep -v '^\s*$' "$LOG" | tail -3 | sed 's/^/    /' >&2
    echo "  surviving processes in this tree:" >&2
    pgrep -P "$WATCHED_PID" 2>/dev/null | while read -r p; do
      ps -o pid,ppid,etime,%cpu,command -p "$p" 2>/dev/null | tail -1 | cut -c1-110 | sed 's/^/    /' >&2
    done
    echo "  prerendered files emitted: $(find dist/roaya-website/browser -name index.html 2>/dev/null | wc -l | tr -d ' ')" >&2
    echo "  (a complete artifact here does NOT make this a pass)" >&2

    # Terminate ONLY our own tree: the process group we created above with
    # `set -m`. Never a name-based sweep - `pkill -f esbuild` would also kill an
    # unrelated concurrent build's service process (which has happened on this
    # machine before), and killing processes we do not own is out of bounds.
    kill -TERM -"$WATCHED_PID" 2>/dev/null || kill -TERM "$WATCHED_PID" 2>/dev/null
    sleep 5
    kill -KILL -"$WATCHED_PID" 2>/dev/null || true
    # Any esbuild service we spawned inherited our process group, so it is
    # already covered above. Verify, and report anything still standing rather
    # than widening the kill.
    LEFT=$(pgrep -g "$WATCHED_PID" 2>/dev/null | tr '\n' ' ')
    if [ -n "${LEFT// /}" ]; then
      echo "  NOTE: pids still in our process group after cleanup: $LEFT" >&2
    fi

    fail "build did not terminate naturally within ${BOUND}s (timeout is a failure, never a success)"
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

BUILD_STATUS="$(cat "$STATUS_FILE" 2>/dev/null || echo missing)"
echo "build finished after ~${elapsed}s with status: ${BUILD_STATUS}"

# ---------------------------------------------------------------------------
# Success requires a natural zero exit. 143/137 mean someone signalled it.
# ---------------------------------------------------------------------------
case "$BUILD_STATUS" in
  0) : ;;
  143) fail "build exited via SIGTERM (143) — a signalled build is not a passing build" ;;
  137) fail "build exited via SIGKILL (137) — a killed build is not a passing build" ;;
  missing) fail "could not determine the build's exit status" ;;
  *)
     grep -v '^\s*$' "$LOG" | tail -8 | sed 's/^/    /' >&2
     fail "build exited non-zero (${BUILD_STATUS})" ;;
esac

grep -q "Output location" "$LOG" || fail "build exited 0 but never emitted 'Output location'"

# ---------------------------------------------------------------------------
# Nothing may survive the build.
# ---------------------------------------------------------------------------
sleep 2
# Check exactly the pids that were in OUR process group during the build. A
# name-based sweep would blame an unrelated concurrent build for our failure.
STRAY=0
for p in $(printf '%s\n' $OWN_PIDS | sort -u); do
  [ -n "$p" ] || continue
  [ "$p" = "$WATCHED_PID" ] && continue
  if kill -0 "$p" 2>/dev/null; then
    echo "  surviving process from this build:" >&2
    ps -o pid,ppid,etime,command -p "$p" 2>/dev/null | tail -1 | cut -c1-110 | sed 's/^/    /' >&2
    STRAY=1
  fi
done
[ "$STRAY" -eq 0 ] || fail "build exited but left one of its own child processes behind"

# ---------------------------------------------------------------------------
# The artifact must be the one this build produced.
# ---------------------------------------------------------------------------
PRERENDERED=$(find dist/roaya-website/browser -name index.html | wc -l | tr -d ' ')
SITEMAP=$(grep -c '<loc>' dist/roaya-website/browser/sitemap.xml 2>/dev/null || echo 0)
MAIN=$(find dist/roaya-website/browser -maxdepth 1 -name 'main-*.js' | head -1)
[ -n "$MAIN" ] || fail "no browser main-*.js emitted"
[ -f dist/roaya-website/server/server.mjs ] || fail "no server/server.mjs emitted"

echo ""
echo "✓ build exited 0 naturally in ~${elapsed}s (bound ${BOUND}s)"
echo "✓ no surviving ng/esbuild process"
echo "  prerendered index.html : $PRERENDERED"
echo "  sitemap <loc>          : $SITEMAP"
echo "  browser main           : $(basename "$MAIN")"
echo "    sha256               : $(shasum -a 256 "$MAIN" | awk '{print $1}')"
echo "  server/server.mjs sha  : $(shasum -a 256 dist/roaya-website/server/server.mjs | awk '{print $1}')"

if [ "$KEEP_DIST" != "1" ]; then
  echo "  (dist kept for downstream gates; set BUILD_EXIT_KEEP_DIST=0 has no effect)"
fi

echo "============================================================"
echo "BUILD-EXIT REGRESSION PASSED"
exit 0
