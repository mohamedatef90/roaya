#!/usr/bin/env bash
#
# Offline simulation of scripts/deploy/sitemap-integrity-gate.sh.
#
# Runs the REAL gate script against synthetic responses served by a stubbed
# `curl` on PATH, so the behaviour proven here is the behaviour that runs
# against production. No network, no SSH, no build.
#
# The failing fixtures reproduce what production served on 2026-09-02:
# article URLs answering 503, article URLs answering 200 with the "Post Not
# Found" heading, and Arabic article URLs answering 404 (2026-09-02
# AI-readiness reconciliation).
#
# Run: npm run test:sitemap-integrity-gate
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GATE="$REPO_ROOT/scripts/deploy/sitemap-integrity-gate.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSES=0
FAILURES=0
ok()  { printf '✓ %s\n' "$1"; PASSES=$((PASSES + 1)); }
bad() { printf '✗ %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

[ -f "$GATE" ] || { echo "FATAL: $GATE missing" >&2; exit 1; }
bash -n "$GATE" || { echo "FATAL: $GATE does not parse" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Stubbed curl: looks the requested URL (last argument) up in $SIM_MAP, a file
# of "<url> <code> <body-file>" lines, writes the body to the -o target and
# prints the code. Unknown URLs answer 404. SIM_FAIL_URL simulates a transport
# failure (curl exit 7, prints 000) for one URL.
# ---------------------------------------------------------------------------
STUB="$WORK/bin"
mkdir -p "$STUB"
cat > "$STUB/curl" <<'STUBEOF'
#!/usr/bin/env bash
out=""
prev=""
url=""
for a in "$@"; do
  if [ "$prev" = "-o" ]; then out="$a"; fi
  prev="$a"
  url="$a"
done
if [ -n "${SIM_FAIL_URL:-}" ] && [ "$url" = "$SIM_FAIL_URL" ]; then
  printf '000'
  exit 7
fi
code=404
body=""
while read -r m_url m_code m_body; do
  if [ "$m_url" = "$url" ]; then code="$m_code"; body="$m_body"; break; fi
done < "$SIM_MAP"
if [ -n "$out" ]; then
  if [ -n "$body" ] && [ -f "$body" ]; then cp "$body" "$out"; else : > "$out"; fi
fi
printf '%s' "$code"
exit 0
STUBEOF
chmod +x "$STUB/curl"

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
ORIGIN="https://roaya.co"
F="$WORK/fixtures"
mkdir -p "$F"

sitemap_with() {
  # $@ = paths ; writes a sitemap file and prints its path
  local out="$WORK/sitemap-$RANDOM.xml" p
  {
    printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for p in "$@"; do
      printf '  <url>\n    <loc>%s</loc>\n    <lastmod>2026-09-02</lastmod>\n  </url>\n' "$p"
    done
    printf '</urlset>\n'
  } > "$out"
  printf '%s' "$out"
}

printf '<!doctype html><html><body><h1>Your Trusted Technology Partner in Egypt</h1></body></html>' > "$F/about.html"
printf '<!doctype html><html><body><h1 class="text-3xl">\n  Cloud Migration Guide\n</h1><p>real article</p></body></html>' > "$F/article-en.html"
printf '<!doctype html><html><body><h1 class="text-3xl">\n  دليل الانتقال إلى السحابة\n</h1><p>مقال</p></body></html>' > "$F/article-ar.html"
printf '<!doctype html><html><body><h1 class="text-3xl font-bold">\n    Post Not Found\n  </h1><p>The blog post you are looking for does not exist.</p></body></html>' > "$F/not-found-en.html"
printf '<!doctype html><html><body><h1 class="text-3xl">\n  المقال غير موجود\n</h1></body></html>' > "$F/not-found-ar.html"
printf '<!doctype html><html><body><h1>Service temporarily unavailable</h1></body></html>' > "$F/unavailable.html"
printf '<!doctype html><html><body><app-root></app-root></body></html>' > "$F/csr-shell.html"
printf '<?xml version="1.0"?><urlset><url><loc>https://roaya.co/</loc>' > "$F/truncated-sitemap.xml"

ABOUT="$ORIGIN/about"
EN_POST="$ORIGIN/resources/blog/cloud-migration-guide"
AR_POST="$ORIGIN/ar/resources/blog/cloud-migration-guide"
SITEMAP_URL="$ORIGIN/sitemap.xml"
HEALTHY_SITEMAP="$(sitemap_with "$ORIGIN/" "$ABOUT" "$EN_POST" "$AR_POST")"

# run_gate MAP_CONTENT [extra env assignments...] -> "<exit> <logfile>"
run_gate() {
  local map="$WORK/map.$RANDOM" log="$WORK/log.$RANDOM"
  printf '%s\n' "$1" > "$map"
  shift
  (
    export PATH="$STUB:$PATH"
    export SIM_MAP="$map"
    export SITEMAP_ORIGIN="$ORIGIN" GATE_MIN_LOCS=1 GATE_DELAY=0
    for kv in "$@"; do export "${kv?}"; done
    bash "$GATE"
  ) > "$log" 2>&1
  printf '%s %s' "$?" "$log"
}

echo "Sitemap integrity gate - offline simulation"
echo "============================================================"

# 1. Healthy: every loc 200, articles carry real H1s -> PASS
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/article-en.html
$AR_POST 200 $F/article-ar.html")"
if [ "$rc" -eq 0 ] && grep -q 'sitemap integrity OK: 4/4' "$log"; then
  ok "all locs 200 with real article H1s -> gate PASSES (exit 0)"
else
  bad "healthy sitemap should pass (exit=$rc): $(tr '\n' ' ' < "$log" | cut -c1-200)"
fi

# 2. Production 2026-09-02 shape A: article 200 with "Post Not Found" -> FAIL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/not-found-en.html
$AR_POST 200 $F/article-ar.html")"
if [ "$rc" -ne 0 ] && grep -q "gate FAILED - 1 of 4" "$log" && grep -q "$EN_POST: 200 but <h1> is the not-found heading" "$log"; then
  ok "article 200 with 'Post Not Found' <h1> -> gate FAILS and names the URL"
else
  bad "not-found heading must fail (exit=$rc): $(tr '\n' ' ' < "$log" | cut -c1-200)"
fi

# 3. Arabic not-found heading -> FAIL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/article-en.html
$AR_POST 200 $F/not-found-ar.html")"
if [ "$rc" -ne 0 ] && grep -q "$AR_POST: 200 but <h1> is the not-found heading" "$log"; then
  ok "Arabic article 200 with 'المقال غير موجود' <h1> -> gate FAILS"
else
  bad "Arabic not-found heading must fail (exit=$rc)"
fi

# 4. Production 2026-09-02 shape B: article 503 -> FAIL with status
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 503 $F/unavailable.html
$AR_POST 200 $F/article-ar.html")"
if [ "$rc" -ne 0 ] && grep -q "$EN_POST: status 503 (expected 200)" "$log"; then
  ok "article 503 -> gate FAILS and reports status 503"
else
  bad "503 must fail with its status (exit=$rc)"
fi

# 5. Production 2026-09-02 shape C: Arabic article 404 -> FAIL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/article-en.html")"
if [ "$rc" -ne 0 ] && grep -q "$AR_POST: status 404 (expected 200)" "$log"; then
  ok "advertised Arabic article answering 404 -> gate FAILS"
else
  bad "404 must fail (exit=$rc)"
fi

# 6. Article 200 but CSR shell (no <h1>) -> FAIL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/csr-shell.html
$AR_POST 200 $F/article-ar.html")"
if [ "$rc" -ne 0 ] && grep -q "$EN_POST: 200 but no <h1>" "$log"; then
  ok "article 200 with no <h1> (CSR shell) -> gate FAILS"
else
  bad "empty shell must fail (exit=$rc)"
fi

# 7. Several offenders are ALL listed, not just the first
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 301 $F/about.html
$EN_POST 503 $F/unavailable.html
$AR_POST 200 $F/not-found-ar.html")"
if [ "$rc" -ne 0 ] && grep -q "gate FAILED - 3 of 4" "$log" \
   && grep -q "$ABOUT: status 301" "$log" && grep -q "$EN_POST: status 503" "$log" && grep -q "$AR_POST: 200 but <h1>" "$log"; then
  ok "three offenders (301, 503, not-found) are all listed in the verdict"
else
  bad "every offender must be listed (exit=$rc): $(grep -c 'status\|<h1>' "$log") matches"
fi

# 8. Sitemap transport failure -> FATAL, exactly 000
read -r rc log <<<"$(run_gate "$ORIGIN/ 200 $F/about.html" "SIM_FAIL_URL=$SITEMAP_URL")"
if [ "$rc" -ne 0 ] && grep -q "answered status 000 " "$log" && ! grep -q "000000" "$log"; then
  ok "sitemap transport failure -> FATAL with exactly 000 (no '000000')"
else
  bad "sitemap transport failure must be fatal with 000 (exit=$rc): $(tr '\n' ' ' < "$log" | cut -c1-160)"
fi

# 9. Truncated sitemap -> FATAL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $F/truncated-sitemap.xml")"
if [ "$rc" -ne 0 ] && grep -q "not a complete <urlset>" "$log"; then
  ok "truncated sitemap (no </urlset>) -> FATAL"
else
  bad "truncated sitemap must be fatal (exit=$rc)"
fi

# 10. Too few locs -> FATAL
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/article-en.html
$AR_POST 200 $F/article-ar.html" "GATE_MIN_LOCS=30")"
if [ "$rc" -ne 0 ] && grep -q "only 4 <loc> entries, expected at least 30" "$log"; then
  ok "fewer locs than GATE_MIN_LOCS -> FATAL"
else
  bad "loc floor must be enforced (exit=$rc)"
fi

# 11. A <loc> off the canonical origin -> FAIL
OFF_SITEMAP="$(sitemap_with "$ORIGIN/" "https://evil.example.com/about")"
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $OFF_SITEMAP
$ORIGIN/ 200 $F/about.html")"
if [ "$rc" -ne 0 ] && grep -q "https://evil.example.com/about: not on the canonical origin" "$log"; then
  ok "<loc> on a foreign origin -> gate FAILS"
else
  bad "foreign origin must fail (exit=$rc)"
fi

# 12. A transport failure on one article -> reported as status 000
read -r rc log <<<"$(run_gate "$SITEMAP_URL 200 $HEALTHY_SITEMAP
$ORIGIN/ 200 $F/about.html
$ABOUT 200 $F/about.html
$EN_POST 200 $F/article-en.html
$AR_POST 200 $F/article-ar.html" "SIM_FAIL_URL=$EN_POST")"
if [ "$rc" -ne 0 ] && grep -q "$EN_POST: status 000 (expected 200)" "$log"; then
  ok "per-URL transport failure -> reported as status 000 and FAILS"
else
  bad "per-URL transport failure must fail with 000 (exit=$rc)"
fi

# 13. Staging origin: paths are requested at SITEMAP_ORIGIN while locs stay canonical
STAGING="http://127.0.0.1:4000"
read -r rc log <<<"$(run_gate "$STAGING/sitemap.xml 200 $HEALTHY_SITEMAP
$STAGING/ 200 $F/about.html
$STAGING/about 200 $F/about.html
$STAGING/resources/blog/cloud-migration-guide 200 $F/article-en.html
$STAGING/ar/resources/blog/cloud-migration-guide 200 $F/article-ar.html" "SITEMAP_ORIGIN=$STAGING" "GATE_HOST=roaya.co")"
if [ "$rc" -eq 0 ] && grep -q 'sitemap integrity OK: 4/4' "$log" && grep -q 'Host: roaya.co' "$log"; then
  ok "SITEMAP_ORIGIN override requests canonical paths at the staging/loopback origin with GATE_HOST"
else
  bad "origin override should pass against a healthy staging map (exit=$rc): $(tr '\n' ' ' < "$log" | cut -c1-200)"
fi

echo "============================================================"
echo "$PASSES passed, $FAILURES failed."
[ "$FAILURES" -eq 0 ] || exit 1
exit 0
