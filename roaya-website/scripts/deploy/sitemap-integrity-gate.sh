#!/usr/bin/env bash
#
# Post-deploy sitemap integrity gate (2026-09-02 AI-readiness reconciliation).
#
# Fetches the LIVE /sitemap.xml, extracts every <loc>, requests each one
# sequentially with a short timeout, and FAILS - listing every offender - when
#   - the sitemap itself is unreachable, truncated, or shorter than GATE_MIN_LOCS;
#   - any <loc> is not on the canonical origin;
#   - any <loc> answers anything other than HTTP 200 (a 503 from the article
#     SSR path, a 404 from an Arabic article that is not complete, a 301 from
#     a non-canonical URL - a sitemap must only advertise final 200 URLs);
#   - any article <loc> (/resources/blog/<slug>, /ar/resources/blog/<slug>)
#     has no <h1>, or its <h1> contains "Post Not Found" / "المقال غير موجود".
#
# Why a second gate: deploy/scripts/deploy-ssr.sh proves ONE prerendered route
# (/about) renders on loopback. It cannot see the production defects the
# 2026-09-02 reconciliation found: article URLs intermittently serving 503
# with a false "Post Not Found" page (the backend rate limiter counted the SSR
# process's own loopback renders), and Arabic article URLs the sitemap
# advertised that answered 404. The sitemap is the crawl contract; every URL
# in it must answer 200 with real content, and only the deployed host can
# show that (the local ai-readiness checks run with no backend, so the local
# sitemap never carries article URLs).
#
# Deliberately a standalone script: deploy-ssr.sh runs its activation logic
# inside a remote heredoc with a strict 12-argument contract, and this gate
# needs the public origin (nginx + backend), not the bare SSR upstream.
#
# Usage:
#   npm run gate:sitemap-integrity                       # https://roaya.co
#   SITEMAP_ORIGIN=https://staging.example scripts/deploy/sitemap-integrity-gate.sh
#   # on the host, against the SSR upstream with the real nginx request shape:
#   SITEMAP_ORIGIN=http://127.0.0.1:4000 GATE_HOST=roaya.co scripts/deploy/sitemap-integrity-gate.sh
#
# Environment:
#   SITEMAP_ORIGIN    origin that is requested (default https://roaya.co)
#   CANONICAL_ORIGIN  origin every <loc> must start with (default https://roaya.co);
#                     each <loc>'s path is requested at SITEMAP_ORIGIN
#   SITEMAP_URL       full sitemap URL (default $SITEMAP_ORIGIN/sitemap.xml)
#   GATE_HOST         optional Host header; also sends the X-Forwarded-* trio
#                     nginx adds, mirroring the deploy-ssr.sh activation probe
#   GATE_MAX_TIME     per-request curl timeout in seconds (default 15)
#   GATE_MIN_LOCS     minimum <loc> count, fewer = truncated sitemap (default 30)
#   GATE_DELAY        seconds to pause between requests (default 0.2)
#
# Exit status: 0 when every <loc> passes, 1 otherwise. Never modifies anything.
set -uo pipefail

SITEMAP_ORIGIN="${SITEMAP_ORIGIN:-https://roaya.co}"
SITEMAP_ORIGIN="${SITEMAP_ORIGIN%/}"
CANONICAL_ORIGIN="${CANONICAL_ORIGIN:-https://roaya.co}"
CANONICAL_ORIGIN="${CANONICAL_ORIGIN%/}"
SITEMAP_URL="${SITEMAP_URL:-$SITEMAP_ORIGIN/sitemap.xml}"
GATE_HOST="${GATE_HOST:-}"
GATE_MAX_TIME="${GATE_MAX_TIME:-15}"
GATE_MIN_LOCS="${GATE_MIN_LOCS:-30}"
GATE_DELAY="${GATE_DELAY:-0.2}"
USER_AGENT="roaya-sitemap-integrity-gate/1.0 (+https://roaya.co)"

# The two not-found headings (blog.detail.notFound.title in en.json / ar.json).
# A 200 article page carrying either is the false-negative this gate exists for.
NOT_FOUND_EN="Post Not Found"
NOT_FOUND_AR="المقال غير موجود"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

case "$GATE_MIN_LOCS" in
  ''|*[!0-9]*) echo "FATAL: GATE_MIN_LOCS must be a non-negative integer (got '$GATE_MIN_LOCS')." >&2; exit 1 ;;
esac

# fetch URL OUT_FILE -> prints exactly three digits (000 on transport failure).
# Explicit control flow, not `|| echo 000`: on a transport failure curl still
# writes its own "000" to stdout, and appending another would yield "000000"
# (same convention as the deploy-ssr.sh activation gate).
fetch() {
  local url="$1" out="$2" code
  local -a hdrs=(-A "$USER_AGENT" -H 'Accept: text/html,application/xml;q=0.9,*/*;q=0.8')
  if [ -n "$GATE_HOST" ]; then
    hdrs+=(-H "Host: $GATE_HOST" -H "X-Forwarded-For: 127.0.0.1" -H "X-Forwarded-Proto: https" -H "X-Real-IP: 127.0.0.1")
  fi
  if code=$(curl -s -o "$out" -w '%{http_code}' --max-time "$GATE_MAX_TIME" "${hdrs[@]}" "$url"); then
    :
  else
    code="000"
  fi
  case "$code" in
    [0-9][0-9][0-9]) : ;;
    *) code="000" ;;
  esac
  printf '%s' "$code"
}

# h1_texts FILE -> every <h1>...</h1> inner text, tags stripped, one per line.
# Pure bash + sed so the gate has no perl/python dependency on the host.
h1_texts() {
  local rest text
  rest="$(tr '\n\r' '  ' < "$1")"
  while [[ "$rest" == *'<h1'* ]]; do
    rest="${rest#*<h1}"
    rest="${rest#*>}"
    if [[ "$rest" == *'</h1>'* ]]; then
      text="${rest%%</h1>*}"
      rest="${rest#*</h1>}"
    else
      text="$rest"
      rest=""
    fi
    printf '%s\n' "$text" | sed -e 's/<[^>]*>//g' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
  done
}

OFFENDERS=()
offend() { OFFENDERS+=("$1"); printf '  ✗ %s\n' "$1"; }

echo "Sitemap integrity gate"
echo "============================================================"
echo "sitemap:   $SITEMAP_URL"
echo "requests:  ${SITEMAP_ORIGIN}<path>${GATE_HOST:+  (Host: $GATE_HOST + X-Forwarded-*)}"
echo "canonical: $CANONICAL_ORIGIN"

# ---------------------------------------------------------------------------
# 1. The sitemap itself
# ---------------------------------------------------------------------------
SITEMAP_FILE="$WORK/sitemap.xml"
CODE=$(fetch "$SITEMAP_URL" "$SITEMAP_FILE")
if [ "$CODE" != "200" ]; then
  echo "FATAL: $SITEMAP_URL answered status $CODE (expected 200)." >&2
  exit 1
fi
if ! grep -q '</urlset>' "$SITEMAP_FILE" 2>/dev/null; then
  echo "FATAL: $SITEMAP_URL is not a complete <urlset> document (no closing tag - truncated or an error page)." >&2
  exit 1
fi

# <loc> values, XML-unescaped (&amp; is the only entity a URL legitimately carries).
LOCS_FILE="$WORK/locs.txt"
grep -o '<loc>[^<]*</loc>' "$SITEMAP_FILE" \
  | sed -e 's/<loc>//' -e 's#</loc>##' -e 's/&amp;/\&/g' > "$LOCS_FILE"
LOC_COUNT=$(wc -l < "$LOCS_FILE" | tr -d ' ')
echo "locs:      $LOC_COUNT"

if [ "$LOC_COUNT" -lt "$GATE_MIN_LOCS" ]; then
  echo "FATAL: only $LOC_COUNT <loc> entries, expected at least $GATE_MIN_LOCS." >&2
  echo "The served sitemap is truncated or fell back to an unexpected document." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Every <loc>, sequentially
# ---------------------------------------------------------------------------
echo "------------------------------------------------------------"
BODY="$WORK/body.html"
CHECKED=0
while IFS= read -r loc; do
  [ -n "$loc" ] || continue
  CHECKED=$((CHECKED + 1))

  case "$loc" in
    "$CANONICAL_ORIGIN"|"$CANONICAL_ORIGIN"/*) : ;;
    *) offend "$loc: not on the canonical origin $CANONICAL_ORIGIN"; continue ;;
  esac
  path="${loc#"$CANONICAL_ORIGIN"}"
  [ -n "$path" ] || path="/"
  url="${SITEMAP_ORIGIN}${path}"

  : > "$BODY"
  code=$(fetch "$url" "$BODY")
  if [ "$code" != "200" ]; then
    offend "$loc: status $code (expected 200)"
  elif [[ "$path" =~ ^/(ar/)?resources/blog/.+ ]]; then
    # Article URL: a 200 must carry the article, never the not-found block.
    h1s="$(h1_texts "$BODY")"
    if [ -z "$h1s" ]; then
      offend "$loc: 200 but no <h1> (empty shell)"
    elif printf '%s\n' "$h1s" | grep -qF -e "$NOT_FOUND_EN" -e "$NOT_FOUND_AR"; then
      offend "$loc: 200 but <h1> is the not-found heading ($(printf '%s' "$h1s" | head -1 | cut -c1-60))"
    else
      printf '  ✓ %s %s\n' "$code" "$path"
    fi
  else
    printf '  ✓ %s %s\n' "$code" "$path"
  fi

  # Pace the crawl: the SSR article path calls the backend per render.
  if [ "$GATE_DELAY" != "0" ]; then sleep "$GATE_DELAY"; fi
done < "$LOCS_FILE"

# ---------------------------------------------------------------------------
# 3. Verdict
# ---------------------------------------------------------------------------
echo "============================================================"
if [ "${#OFFENDERS[@]}" -ne 0 ]; then
  echo "FATAL: sitemap integrity gate FAILED - ${#OFFENDERS[@]} of $CHECKED sitemap URL(s) do not serve as advertised:" >&2
  for o in "${OFFENDERS[@]}"; do
    printf '  - %s\n' "$o" >&2
  done
  echo "" >&2
  echo "A crawler following this sitemap would index an error page or drop a" >&2
  echo "real article. Fix the offenders (or the sitemap rule that advertises" >&2
  echo "them) before considering the release verified." >&2
  exit 1
fi

echo "sitemap integrity OK: $CHECKED/$CHECKED URL(s) answer 200; every article URL renders a real <h1>."
exit 0
