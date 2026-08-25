#!/usr/bin/env bash
#
# SSH remote-argument serialization round-trip test.
#
# THE DEFECT THIS LOCKS OUT (2026-08-26, release roaya-ssr-20260826-001043):
#
#   ssh host bash -s -- "$A" "$B" "$MARKER" "$TRUST"
#
# OpenSSH does NOT preserve argv. It JOINS its command arguments into ONE
# string and hands that string to the remote LOGIN SHELL, which parses it
# again. The marker "Your Trusted Technology Partner in Egypt" therefore
# arrived as SIX positional parameters, shifting every later value along:
# ${10} became "Your" and ${11} became "Trusted", so the release started with
# NG_TRUST_PROXY_HEADERS=Trusted. Angular refused to trust x-forwarded-for and
# served browser/index.csr.html to every request. The activation gate caught it
# and the deploy was rolled back.
#
# WHAT THIS TEST EXERCISES - the real seam, not a toy:
#   1. the serializer COMMITTED IN deploy/scripts/deploy-ssr.sh, extracted from
#      the script itself (never re-implemented here), and
#   2. exactly ONE remote-shell parse of what it produced, run through
#      `bash -s --` with the script on stdin, and
#   3. the remote ARGUMENT CONTRACT block, also extracted from the deploy
#      script, against wrong argument counts and corrupted values.
#
# Byte-exact comparison uses NUL-delimited output, so a value that gained or
# lost whitespace cannot pass.
#
# Offline: no network, no SSH, no production, no build.
#
# Run: npm run test:ssh-argv
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/deploy/scripts/deploy-ssr.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASSES=0
FAILURES=0
ok()  { printf '✓ %s\n' "$1"; PASSES=$((PASSES + 1)); }
bad() { printf '✗ %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

echo "SSH remote-argument serialization round-trip"
echo "============================================================"

[ -f "$SCRIPT" ] || { echo "FATAL: $SCRIPT missing" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Extract the COMMITTED serializer from the deploy script.
# ---------------------------------------------------------------------------
SER="$WORK/serializer.sh"
awk '/^# --- BEGIN remote command serializer ---$/{on=1} on{print} /^# --- END remote command serializer ---$/{exit}' \
  "$SCRIPT" > "$SER"

if ! grep -q '^build_remote_bash_command()' "$SER"; then
  bad "deploy-ssr.sh exposes an extractable build_remote_bash_command() serializer"
  echo "    Nothing between '# --- BEGIN remote command serializer ---' and its END" >&2
  echo "    marker defines build_remote_bash_command(). The ssh call is therefore" >&2
  echo "    still passing raw argv, which OpenSSH re-splits on the remote side." >&2
  echo
  echo "============================================================"
  echo "$PASSES passed, $FAILURES failed."
  exit 1
fi
ok "extracted the committed serializer from deploy-ssr.sh"
# shellcheck disable=SC1090
source "$SER"

# ---------------------------------------------------------------------------
# Extract the COMMITTED remote argument contract from the heredoc.
# ---------------------------------------------------------------------------
CONTRACT="$WORK/contract.sh"
awk '/^# --- BEGIN remote argument contract ---$/{on=1} on{print} /^# --- END remote argument contract ---$/{exit}' \
  "$SCRIPT" > "$CONTRACT"
if grep -q 'EXPECTED_ARGC' "$CONTRACT"; then
  ok "extracted the committed remote argument contract from the heredoc"
else
  bad "deploy-ssr.sh has no extractable remote argument contract (EXPECTED_ARGC)"
fi

# ---------------------------------------------------------------------------
# The receiver: prints argc and every argument NUL-delimited, byte for byte.
# ---------------------------------------------------------------------------
RECEIVER="$WORK/receiver.sh"
cat > "$RECEIVER" <<'RECV'
printf 'ARGC=%s\n' "$#"
for a in "$@"; do printf '%s\0' "$a"; done
RECV

# Replica of what OpenSSH actually does with `ssh host cmd arg arg`: join with
# single spaces and hand the result to the remote login shell. Faithful to the
# pre-fix code path, which no longer exists in the script.
legacy_join() { local out="bash -s --" a; for a in "$@"; do out="$out $a"; done; printf '%s' "$out"; }

# Run one command string through ONE shell parse, with the receiver on stdin.
# $1 = shell, $2 = command string. Writes NUL-delimited argv to $WORK/out.bin.
run_through_shell() {
  "$1" -c "$2" < "$RECEIVER" > "$WORK/out.bin" 2>"$WORK/err.txt"
}

argc_of() { head -1 "$WORK/out.bin" | sed -n 's/^ARGC=//p'; }

# Byte-exact comparison of received argv against the expected array.
argv_matches() {
  local expected_file="$WORK/expected.bin"
  : > "$expected_file"
  local a
  for a in "$@"; do printf '%s\0' "$a" >> "$expected_file"; done
  tail -n +2 "$WORK/out.bin" > "$WORK/got.bin"
  cmp -s "$WORK/got.bin" "$expected_file"
}

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
MARKER="Your Trusted Technology Partner in Egypt"
TRUST="x-forwarded-for,x-forwarded-proto"

# The REAL production argument vector, in the deploy script's declared order.
PROD_ARGS=(
  "/var/www/roaya-ssr"
  "/var/www/roaya-website"
  "roaya-ssr-20260826-001043"
  "/tmp/roaya-ssr-20260826-001043.tar.gz"
  "roaya-ssr"
  "4000"
  "production"
  "roaya.co,www.roaya.co"
  "roaya.co"
  "$MARKER"
  "$TRUST"
)

META_ARGS=(
  "/var/www/roaya-ssr"
  "$MARKER"
  "$TRUST"
  "it's quoted"
  'he said "hi"'
  'cost $HOME and `date`'
  'semi;colon && chained'
  'back\slash'
  'glob*chars?[abc]'
  '  padded  '
  ''
  'new
line-is-rejected-elsewhere'
)
# The multi-line fixture above is intentionally NOT sent through the serializer
# in the accept cases; it is used by the reject cases below.
unset 'META_ARGS[11]'
META_ARGS=("${META_ARGS[@]}")

SHELLS=()
for s in /bin/sh /bin/bash /bin/dash /bin/zsh; do [ -x "$s" ] && SHELLS+=("$s"); done

# ---------------------------------------------------------------------------
# 1. RED evidence: the pre-fix raw-argv pattern corrupts the production vector
# ---------------------------------------------------------------------------
run_through_shell /bin/sh "$(legacy_join "${PROD_ARGS[@]}")"
LEGACY_ARGC="$(argc_of)"
LEGACY_10="$(tail -n +2 "$WORK/out.bin" | tr '\0' '\n' | sed -n '10p')"
if [ "$LEGACY_ARGC" != "${#PROD_ARGS[@]}" ] && [ "$LEGACY_10" != "$MARKER" ]; then
  ok "$(printf 'legacy raw-argv assembly CORRUPTS the vector (argc %s, want %s; arg10=%q)' \
        "$LEGACY_ARGC" "${#PROD_ARGS[@]}" "$LEGACY_10")"
else
  bad "legacy raw-argv assembly unexpectedly round-tripped (argc=$LEGACY_ARGC) — fixture is wrong"
fi

# ---------------------------------------------------------------------------
# 2. GREEN: the committed serializer round-trips the production vector exactly
# ---------------------------------------------------------------------------
for sh in "${SHELLS[@]}"; do
  if ! CMD="$(build_remote_bash_command "${PROD_ARGS[@]}")"; then
    bad "serializer rejected the real production vector"
    continue
  fi
  run_through_shell "$sh" "$CMD"
  a="$(argc_of)"
  if [ "$a" = "${#PROD_ARGS[@]}" ] && argv_matches "${PROD_ARGS[@]}"; then
    ok "production argv round-trips byte-exact through $sh (argc $a)"
  else
    bad "production argv corrupted through $sh (argc=$a, want ${#PROD_ARGS[@]})"
  fi
done

# The two values the incident shifted, checked by name and in full.
run_through_shell /bin/sh "$(build_remote_bash_command "${PROD_ARGS[@]}")"
GOT_MARKER="$(tail -n +2 "$WORK/out.bin" | tr '\0' '\n' | sed -n '10p')"
GOT_TRUST="$(tail -n +2 "$WORK/out.bin" | tr '\0' '\n' | sed -n '11p')"
if [ "$GOT_MARKER" = "$MARKER" ]; then ok "arg 10 is the FULL marker, not the truncated \"Your\""
else bad "arg 10 = $(printf '%q' "$GOT_MARKER"), want the full marker"; fi
if [ "$GOT_TRUST" = "$TRUST" ]; then ok "arg 11 is the full trust list, not \"Trusted\""
else bad "arg 11 = $(printf '%q' "$GOT_TRUST"), want $TRUST"; fi

# ---------------------------------------------------------------------------
# 3. Shell metacharacters, spaces and an empty value survive one parse
# ---------------------------------------------------------------------------
for sh in "${SHELLS[@]}"; do
  if ! CMD="$(build_remote_bash_command "${META_ARGS[@]}")"; then
    bad "serializer rejected the metacharacter fixtures"
    continue
  fi
  run_through_shell "$sh" "$CMD"
  a="$(argc_of)"
  if [ "$a" = "${#META_ARGS[@]}" ] && argv_matches "${META_ARGS[@]}"; then
    ok "metacharacter/space/empty fixtures round-trip byte-exact through $sh (argc $a)"
  else
    bad "metacharacter fixtures corrupted through $sh (argc=$a, want ${#META_ARGS[@]})"
    tail -n +2 "$WORK/out.bin" | tr '\0' '\n' | sed -n '1,14p' | sed 's/^/      got: /'
  fi
done

# Nothing may execute during the parse: a command substitution that ran would
# leave its output in the argument.
if run_through_shell /bin/sh "$(build_remote_bash_command '$(touch '"$WORK"'/pwned)' '`touch '"$WORK"'/pwned2`')"; then
  if [ ! -e "$WORK/pwned" ] && [ ! -e "$WORK/pwned2" ]; then
    ok "no command substitution executes during the remote parse (no injection)"
  else
    bad "INJECTION: a substitution inside an argument executed on the remote side"
  fi
else
  bad "serializer failed on substitution-shaped input"
fi

# ---------------------------------------------------------------------------
# 4. Rejected input: CR / LF / control characters
# ---------------------------------------------------------------------------
reject_case() {
  local label="$1" value="$2"
  if build_remote_bash_command "/ok" "$value" >/dev/null 2>&1; then
    bad "$label was ACCEPTED by the serializer"
  else
    ok "$label rejected (serializer exits non-zero)"
  fi
}
reject_case "argument containing LF"  "$(printf 'a\nb')"
reject_case "argument containing CR"  "$(printf 'a\rb')"
reject_case "argument containing TAB" "$(printf 'a\tb')"

# ---------------------------------------------------------------------------
# 5. The remote argument contract: argc and value validation
# ---------------------------------------------------------------------------
# Executes the REAL extracted contract block with a given argv, and reports
# whether it accepted. Only the contract runs - no unpack, no pm2, no symlink.
RUNNER="$WORK/run-contract.sh"
{
  echo 'set -euo pipefail'
  printf '. %q\n' "$CONTRACT"
  echo 'exit 0'
} > "$RUNNER"
run_contract() { bash "$RUNNER" "$@" >"$WORK/c.out" 2>&1; }

contract_case() {
  local label="$1" want="$2"; shift 2   # want = accept|reject
  if run_contract "$@"; then got=accept; else got=reject; fi
  if [ "$got" = "$want" ]; then
    ok "contract $want: $label"
  else
    bad "contract $label: expected $want, got $got :: $(tr '\n' ' ' < "$WORK/c.out" | cut -c1-120)"
  fi
}

if grep -q 'EXPECTED_ARGC' "$CONTRACT"; then
  contract_case "exact production argv" accept "${PROD_ARGS[@]}"

  short=("${PROD_ARGS[@]}"); unset 'short[10]'
  contract_case "one argument missing" reject "${short[@]}"

  contract_case "one extra trailing argument" reject "${PROD_ARGS[@]}" "surplus"

  split=("${PROD_ARGS[@]:0:9}" "Your" "Trusted" "Technology" "Partner" "in" "Egypt" "$TRUST")
  contract_case "the exact 2026-08-26 word-split argv" reject "${split[@]}"

  trunc=("${PROD_ARGS[@]}"); trunc[9]="Your"
  contract_case "truncated marker \"Your\"" reject "${trunc[@]}"

  swapped=("${PROD_ARGS[@]}"); swapped[9]="$TRUST"; swapped[10]="$MARKER"
  contract_case "marker and trust list swapped" reject "${swapped[@]}"

  badtrust=("${PROD_ARGS[@]}"); badtrust[10]="Trusted"
  contract_case "trust list = \"Trusted\"" reject "${badtrust[@]}"

  badtrust2=("${PROD_ARGS[@]}"); badtrust2[10]="true"
  contract_case "trust list = \"true\" (wildcard trust)" reject "${badtrust2[@]}"

  badhosts=("${PROD_ARGS[@]}"); badhosts[7]="roaya.co,www.roaya.co,localhost"
  contract_case "allowed hosts widened with localhost" reject "${badhosts[@]}"

  badport=("${PROD_ARGS[@]}"); badport[5]="70000"
  contract_case "PORT out of range" reject "${badport[@]}"

  badport2=("${PROD_ARGS[@]}"); badport2[5]="4000abc"
  contract_case "PORT non-numeric" reject "${badport2[@]}"

  badport3=("${PROD_ARGS[@]}"); badport3[5]="999999999999999999999999"
  contract_case "PORT numerically oversized (arithmetic would error)" reject "${badport3[@]}"

  spacepath=("${PROD_ARGS[@]}"); spacepath[0]="/var/www/roaya ssr"
  contract_case "RELEASE_DIR containing a space" reject "${spacepath[@]}"

  badrel=("${PROD_ARGS[@]}"); badrel[0]="var/www/roaya-ssr"
  contract_case "RELEASE_DIR not absolute" reject "${badrel[@]}"

  badrel2=("${PROD_ARGS[@]}"); badrel2[0]="/var/www/../../etc/roaya-ssr"
  contract_case "RELEASE_DIR contains .." reject "${badrel2[@]}"

  badenv=("${PROD_ARGS[@]}"); badenv[6]="development"
  contract_case "NODE_ENV not production" reject "${badenv[@]}"
else
  bad "cannot exercise the remote argument contract: not extractable"
fi

echo "============================================================"
echo "$PASSES passed, $FAILURES failed."
[ "$FAILURES" -eq 0 ] || exit 1
echo "SSH ARGV ROUND-TRIP PASSED"
exit 0
