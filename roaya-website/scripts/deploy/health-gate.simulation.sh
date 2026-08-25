#!/usr/bin/env bash
#
# Offline simulation of the SSR activation gate in deploy/scripts/deploy-ssr.sh.
#
# This does NOT re-implement the gate. It EXTRACTS the real block from the
# deploy script and executes it against synthetic responses with a stubbed
# `curl`, so the behaviour proven here is the behaviour that ships. No network,
# no SSH, no pm2, no production, no Angular build.
#
# Run: npm run test:deploy-health-gate
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/deploy/scripts/deploy-ssr.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSES=0
FAILURES=0

ok()   { printf '✓ %s\n' "$1"; PASSES=$((PASSES + 1)); }
bad()  { printf '✗ %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

# ---------------------------------------------------------------------------
# Extract the gate: from `sleep 3` through the `fi` that closes the
# `if [ "$HEALTH_FAIL" -ne 0 ]` branch.
# ---------------------------------------------------------------------------
GATE="$WORK/gate.sh"
awk '
  /^sleep 3$/           { on = 1 }
  on                    { print }
  /HEALTH_FAIL" -ne 0/  { seen = 1 }
  seen && /^fi$/        { exit }
' "$SCRIPT" > "$GATE"

if ! grep -q 'HEALTH_FAIL" -ne 0' "$GATE"; then
  echo "FATAL: could not extract the activation gate from $SCRIPT" >&2
  exit 1
fi
if ! grep -q 'grep -qF' "$GATE"; then
  echo "FATAL: extracted gate is missing the content assertion; extraction is wrong" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Fixtures: a CSR shell and a genuinely rendered page
# ---------------------------------------------------------------------------
RELEASE_DIR="$WORK/release"
mkdir -p "$RELEASE_DIR/current/browser"
CSR="$RELEASE_DIR/current/browser/index.csr.html"
printf '<!doctype html><html><body><app-root></app-root></body></html>' > "$CSR"
RENDERED="$WORK/rendered.html"
printf '<!doctype html><html><body><h1>Your Trusted Technology Partner in Egypt</h1></body></html>' > "$RENDERED"
OTHER="$WORK/other.html"
printf '<!doctype html><html><body><h1>Something else entirely</h1></body></html>' > "$OTHER"

# Stubbed curl: honours SIM_CODE / SIM_BODY / SIM_EXIT, writes to the -o target.
STUB="$WORK/bin"
mkdir -p "$STUB"
cat > "$STUB/curl" <<'STUBEOF'
#!/usr/bin/env bash
out=""
prev=""
for a in "$@"; do
  if [ "$prev" = "-o" ]; then out="$a"; fi
  prev="$a"
done
if [ -n "${SIM_BODY:-}" ] && [ -n "$out" ]; then cp "$SIM_BODY" "$out"; fi
printf '%s' "${SIM_CODE:-200}"
exit "${SIM_EXIT:-0}"
STUBEOF
chmod +x "$STUB/curl"

# ---------------------------------------------------------------------------
# Runner: execute the real gate with a given simulated response
# ---------------------------------------------------------------------------
run_gate() {
  # $1=code $2=body-file $3=curl-exit ; echoes "<exit> <captured stdout+stderr file>"
  local code="$1" body="$2" cexit="$3"
  local log="$WORK/log.$$"
  (
    export PATH="$STUB:$PATH"
    export SIM_CODE="$code" SIM_BODY="$body" SIM_EXIT="$cexit"
    RELEASE_DIR="$RELEASE_DIR"
    SSR_PORT=4000
    PM2_APP="roaya-ssr"
    SSR_HEALTH_HOST="roaya.co"
    SSR_HEALTH_MARKER="Your Trusted Technology Partner in Egypt"
    emit_rollback() { echo "(rollback commands would print here)"; }
    # shellcheck disable=SC1090
    source "$GATE"
  ) > "$log" 2>&1
  local rc=$?
  printf '%s %s' "$rc" "$log"
}

# Count temp files matching the gate's mktemp pattern before/after, to prove
# the response file is cleaned up. The gate traps EXIT inside the subshell.
tmp_count() { find "${TMPDIR:-/tmp}" -maxdepth 1 -name 'tmp.*' -newer "$GATE" 2>/dev/null | wc -l | tr -d ' '; }

echo "SSR activation gate — offline simulation"
echo "============================================================"

# 1. 200 + real marker + non-CSR body -> PASS
# A passing gate falls through silently: the "SSR healthy" echo lives after the
# closing `fi` and is therefore outside the extracted block. So a pass is
# exit 0 with no failure output.
read -r rc log <<<"$(run_gate 200 "$RENDERED" 0)"
if [ "$rc" -eq 0 ] && ! grep -q "activation gate FAILED" "$log"; then
  ok "200 + rendered marker + non-CSR body -> gate PASSES (falls through, exit 0)"
else
  bad "200 + rendered marker should pass (exit=$rc): $(tr '\n' ' ' < "$log" | cut -c1-140)"
fi

# 2. 200 + CSR shell -> FAIL
read -r rc log <<<"$(run_gate 200 "$CSR" 0)"
if [ "$rc" -ne 0 ] && grep -q "activation gate FAILED" "$log"; then
  ok "200 + CSR shell -> gate FAILS (exit $rc)"
else
  bad "200 + CSR shell must fail (exit=$rc)"
fi

# 3. 200 but body lacking the marker -> FAIL
read -r rc log <<<"$(run_gate 200 "$OTHER" 0)"
if [ "$rc" -ne 0 ] && grep -q "missing prerendered marker" "$log"; then
  ok "200 without the marker -> gate FAILS on content"
else
  bad "200 without the marker must fail on content (exit=$rc)"
fi

# 4. non-200 -> FAIL
read -r rc log <<<"$(run_gate 503 "$RENDERED" 0)"
if [ "$rc" -ne 0 ] && grep -q "status 503" "$log"; then
  ok "HTTP 503 -> gate FAILS and reports status 503"
else
  bad "non-200 must fail with its status (exit=$rc)"
fi

# 5. curl transport failure -> exactly 000, and FAIL
read -r rc log <<<"$(run_gate 000 "" 7)"
if [ "$rc" -ne 0 ] && grep -q "status 000 " "$log" && ! grep -q "000000" "$log"; then
  ok "curl transport failure -> reports exactly 000 (no '000000') and FAILS"
else
  bad "transport failure must report exactly 000: $(grep -o 'status [0-9]*' "$log" | head -1)"
fi

# 6. temp response file cleaned up on both paths
before=$(tmp_count)
read -r rc log <<<"$(run_gate 200 "$RENDERED" 0)"
read -r rc2 log2 <<<"$(run_gate 200 "$CSR" 0)"
after=$(tmp_count)
if [ "$after" -le "$before" ]; then
  ok "temporary response file cleaned up on success and failure paths"
else
  bad "temp response files leaked (before=$before after=$after)"
fi

echo "============================================================"
echo "$PASSES passed, $FAILURES failed."
[ "$FAILURES" -eq 0 ] || exit 1
exit 0
