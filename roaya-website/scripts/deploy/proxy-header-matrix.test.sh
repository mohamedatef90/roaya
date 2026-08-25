#!/usr/bin/env bash
#
# Proxy-header matrix integration test.
#
# Boots the BUILT SSR server on an unused local port with the production runtime
# contract and asserts that the real nginx request shape renders server-side
# instead of silently deoptimizing to the CSR shell.
#
# Why this exists: on 2026-08-25 a release passed its activation gate and then
# served browser/index.csr.html - HTTP 200, empty shell - to every visitor,
# because nginx sends X-Forwarded-For and @angular/ssr deoptimizes to CSR when a
# forwarded header is not trusted. The old gate sent only `Host`, a shape no
# real request ever has. This test locks the real shape in.
#
# Offline: loopback only, no production dependency, no external request.
# Teardown is by exact PID/process group - never a loose pgrep/pkill pattern.
#
# Run: npm run test:proxy-headers
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

SERVER="dist/roaya-website/server/server.mjs"
CSR_SHELL="dist/roaya-website/browser/index.csr.html"
MARKER="Your Trusted Technology Partner in Egypt"
TRUST="x-forwarded-for,x-forwarded-proto"
PORT="${PROXY_TEST_PORT:-4407}"

PASSES=0
FAILURES=0
SRV_PID=""
LOG="$(mktemp -t roaya-proxy-matrix)"
BODY="$(mktemp -t roaya-proxy-body)"

ok()  { printf '✓ %s\n' "$1"; PASSES=$((PASSES + 1)); }
bad() { printf '✗ %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

cleanup() {
  # Exact PID only. Never `pkill -f node` / `pgrep | tail`.
  if [ -n "$SRV_PID" ] && kill -0 "$SRV_PID" 2>/dev/null; then
    kill -TERM "$SRV_PID" 2>/dev/null
    for _ in 1 2 3 4 5; do kill -0 "$SRV_PID" 2>/dev/null || break; sleep 1; done
    kill -KILL "$SRV_PID" 2>/dev/null || true
  fi
  rm -f "$LOG" "$BODY"
}
trap cleanup EXIT

[ -f "$SERVER" ] || { echo "FATAL: $SERVER missing — build first" >&2; exit 1; }
[ -f "$CSR_SHELL" ] || { echo "FATAL: $CSR_SHELL missing — build first" >&2; exit 1; }
CSR_BYTES=$(wc -c < "$CSR_SHELL" | tr -d ' ')

if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "FATAL: port $PORT is already in use" >&2
  exit 1
fi

echo "Proxy-header matrix (real nginx shape vs CSR deopt)"
echo "============================================================"
echo "server    : $SERVER"
echo "port      : $PORT"
echo "csr shell : ${CSR_BYTES} bytes (a response of this size means SSR deopted)"
echo "trust     : NG_TRUST_PROXY_HEADERS=$TRUST"

NODE_ENV=production PORT="$PORT" NG_ALLOWED_HOSTS=localhost,127.0.0.1 \
  NG_TRUST_PROXY_HEADERS="$TRUST" node "$SERVER" >"$LOG" 2>&1 &
SRV_PID=$!

ready=0
for _ in $(seq 1 30); do
  if curl -s -o /dev/null --max-time 3 -H 'Host: localhost' "http://localhost:$PORT/about"; then ready=1; break; fi
  sleep 1
done
[ "$ready" -eq 1 ] || { echo "FATAL: server did not become ready (pid $SRV_PID)" >&2; tail -5 "$LOG" >&2; exit 1; }
echo "server pid: $SRV_PID (ready)"
echo

# probe <label> <path> <expected-code> <expect-ssr:yes|no> <marker> [curl args...]
# The marker is per-route on purpose: the /about H1 does not appear on other
# pages, so reusing it would fail a perfectly good server-rendered response.
probe() {
  local label="$1" path="$2" want_code="$3" want_ssr="$4" want_marker="$5"; shift 5
  local code bytes marker
  code=$(curl -s -o "$BODY" -w '%{http_code}' --max-time 15 -H 'Host: localhost' "$@" "http://localhost:$PORT$path")
  bytes=$(wc -c < "$BODY" | tr -d ' ')
  marker=$(grep -c "$want_marker" "$BODY" 2>/dev/null || true)
  local is_shell="no"
  cmp -s "$BODY" "$CSR_SHELL" && is_shell="yes"

  local why=""
  [ "$code" = "$want_code" ] || why="status $code (want $want_code)"
  if [ "$want_ssr" = "yes" ]; then
    [ "$is_shell" = "no" ] || why="${why:+$why; }response IS the CSR shell"
    [ "${marker:-0}" -ge 1 ] || why="${why:+$why; }missing SSR marker"
  else
    # For a 404 we require a real rendered not-found page, not the shell.
    [ "$is_shell" = "no" ] || why="${why:+$why; }404 served as the CSR shell"
  fi

  if [ -z "$why" ]; then
    ok "$(printf '%-46s code=%s bytes=%-7s marker=%s' "$label" "$code" "$bytes" "${marker:-0}")"
  else
    bad "$(printf '%-46s code=%s bytes=%-7s marker=%s :: %s' "$label" "$code" "$bytes" "${marker:-0}" "$why")"
  fi
}

# A. Host only — the old (insufficient) gate shape
probe "A. Host only" /about 200 yes "$MARKER"

# B. Host + X-Forwarded-Proto
probe "B. + X-Forwarded-Proto" /about 200 yes "$MARKER" \
  -H 'X-Forwarded-Proto: https'

# C. EXACT nginx shape — the one that broke production
probe "C. exact nginx shape (XFF+XFP+X-Real-IP)" /about 200 yes "$MARKER" \
  -H 'X-Forwarded-For: 127.0.0.1' -H 'X-Forwarded-Proto: https' -H 'X-Real-IP: 127.0.0.1'

# C2. A real dynamic SSR route through the exact nginx shape
probe "C2. dynamic route, exact nginx shape" /industries/finance 200 yes "Financial Services" \
  -H 'X-Forwarded-For: 127.0.0.1' -H 'X-Forwarded-Proto: https' -H 'X-Real-IP: 127.0.0.1'

# C3. Unknown route through the exact nginx shape must be a REAL 404
probe "C3. unknown route -> real 404, exact shape" /definitely-not-a-real-page 404 no "Page Not Found" \
  -H 'X-Forwarded-For: 127.0.0.1' -H 'X-Forwarded-Proto: https' -H 'X-Real-IP: 127.0.0.1'

# D. An untrusted forwarded header must NOT quietly count as healthy SSR.
# x-forwarded-prefix is deliberately absent from the trust list, so Angular is
# expected to deopt here. Asserting the deopt keeps the trust list honest: if
# this ever renders SSR, the list has been widened beyond what nginx sends.
{
  code=$(curl -s -o "$BODY" -w '%{http_code}' --max-time 15 -H 'Host: localhost' \
    -H 'X-Forwarded-For: 127.0.0.1' -H 'X-Forwarded-Proto: https' \
    -H 'X-Forwarded-Prefix: /x' "http://localhost:$PORT/about")
  bytes=$(wc -c < "$BODY" | tr -d ' ')
  if cmp -s "$BODY" "$CSR_SHELL"; then
    ok "$(printf '%-46s code=%s bytes=%-7s (untrusted header deopts, as designed)' "D. untrusted X-Forwarded-Prefix" "$code" "$bytes")"
  else
    bad "$(printf '%-46s code=%s bytes=%-7s :: untrusted header did NOT deopt — trust list may be too wide' "D. untrusted X-Forwarded-Prefix" "$code" "$bytes")"
  fi
}

# The trust list must silence the deopt notice for the headers nginx ACTUALLY
# sends. Probe D intentionally provokes a notice for x-forwarded-prefix, so only
# notices naming a trusted header are failures here.
if grep 'trustProxyHeaders' "$LOG" | grep -qE 'x-forwarded-for|x-forwarded-proto"'; then
  bad "server logged a deopt notice for a header that must be trusted:"
  grep 'trustProxyHeaders' "$LOG" | grep -E 'x-forwarded-for|x-forwarded-proto"' | tail -2 | sed 's/^/    /'
else
  ok "no deopt notice for x-forwarded-for / x-forwarded-proto (the nginx set)"
fi

echo
echo "============================================================"
echo "$PASSES passed, $FAILURES failed."
[ "$FAILURES" -eq 0 ] || exit 1
echo "PROXY-HEADER MATRIX PASSED"
exit 0
