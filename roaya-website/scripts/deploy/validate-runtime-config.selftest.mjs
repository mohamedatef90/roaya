#!/usr/bin/env node
/**
 * Self-test for scripts/deploy/validate-runtime-config.mjs.
 *
 * A guard that cannot fail is not a guard. This copies the real deployment
 * files into a temp directory, applies one regression at a time, and asserts
 * the guard rejects it FOR THE INTENDED REASON - not incidentally because some
 * unrelated check happened to fire. Deterministic, offline, never touches
 * production, never mutates the repository.
 *
 * Run: npm run test:deploy-runtime-config:selftest
 */
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const GUARD = join(HERE, 'validate-runtime-config.mjs');

const ECO = 'deploy/pm2/ecosystem.config.js';
const SVC = 'deploy/systemd/roaya-ssr.service';
const SH = 'deploy/scripts/deploy-ssr.sh';
const DOC = 'docs/deploy/RUNTIME-ENV.md';
const NGX = 'deploy/nginx/roaya-website.conf';
const EXTRA = ['CLAUDE.md', 'docs/ai-readiness-human-gates.md', NGX];
const FILES = [ECO, SVC, SH, DOC, ...EXTRA];

function makeTree() {
  const dir = mkdtempSync(join(tmpdir(), 'roaya-deploycfg-'));
  for (const rel of FILES) {
    const dest = join(dir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(ROOT, rel), dest);
  }
  return dir;
}

/** Run the guard against a root; return {code, fails[]}. */
function runGuard(root) {
  let out = '';
  let code = 0;
  try {
    out = execFileSync(process.execPath, [GUARD], {
      env: { ...process.env, DEPLOY_CONFIG_ROOT: root },
      encoding: 'utf8',
    });
  } catch (err) {
    out = err.stdout || '';
    code = err.status ?? 1;
  }
  return { code, fails: [...out.matchAll(/✗ \[FAIL\] (\S+)/g)].map((m) => m[1]) };
}

const rd = (root, rel) => readFileSync(join(root, rel), 'utf8');
const wr = (root, rel, s) => writeFileSync(join(root, rel), s);

function patch(root, rel, from, to, all = false) {
  const s = rd(root, rel);
  if (!s.includes(from)) throw new Error(`fixture drift: ${rel} lacks ${JSON.stringify(from.slice(0, 70))}`);
  wr(root, rel, all ? s.split(from).join(to) : s.replace(from, to));
}

/** Move the whole `pm2 save` if-block to just before the health gate. */
function moveSaveBeforeGate(root) {
  let s = rd(root, SH);
  const startRe = /^# Only persist once[\s\S]*?\n^fi$/m;
  const m = s.match(startRe);
  if (!m) throw new Error('fixture drift: pm2 save block not found');
  s = s.replace(m[0], '# (save block relocated by selftest)');
  const anchor = '# ---------------------------------------------------------------------------\n# Fail-closed SSR activation gate';
  if (!s.includes(anchor)) throw new Error('fixture drift: gate anchor not found');
  wr(root, SH, s.replace(anchor, `${m[0]}\n\n${anchor}`));
}

/** Move the prune line to before the health gate. */
function movePruneBeforeGate(root) {
  let s = rd(root, SH);
  const line = '  ls -1dt "$RELEASE_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf\n';
  if (!s.includes(line)) throw new Error('fixture drift: prune line not found');
  s = s.replace(line, '');
  const anchor = 'sleep 3\nRESP_FILE=$(mktemp)';
  if (!s.includes(anchor)) throw new Error('fixture drift: gate anchor not found');
  wr(root, SH, s.replace(anchor, `ls -1dt "$RELEASE_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf\n${anchor}`));
}

/** Move PREV_TARGET capture to after the symlink flip. */
function movePrevAfterFlip(root) {
  let s = rd(root, SH);
  const cap = 'PREV_TARGET=$(readlink -f "$RELEASE_DIR/current" 2>/dev/null || true)\n';
  if (!s.includes(cap)) throw new Error('fixture drift: PREV_TARGET capture not found');
  s = s.replace(cap, '');
  const flip = 'ln -sfn "$RELEASE_DIR/releases/$STAMP" "$RELEASE_DIR/current"\n';
  wr(root, SH, s.replace(flip, flip + cap));
}

// The exact ssh invocation, and the legacy raw-argv form it replaced. OpenSSH
// joins its command arguments into ONE string that the remote shell parses
// again, so the legacy form delivered the multi-word marker as six positional
// parameters and shifted NG_TRUST_PROXY_HEADERS to "Trusted".
const SSH_INVOCATION = "ssh \"${SSH_OPTS[@]}\" \"$SSH_HOST\" \"$REMOTE_COMMAND\" <<'REMOTE'";
const LEGACY_INVOCATION = "ssh \"${SSH_OPTS[@]}\" \"$SSH_HOST\" bash -s -- \\\n  \"$RELEASE_DIR\" \"$REMOTE_ROOT\" \"$STAMP\" \"$REMOTE_TARBALL\" \"$PM2_APP\" \"$SSR_PORT\" \\\n  \"$NODE_ENV_VALUE\" \"$NG_ALLOWED_HOSTS_VALUE\" \"$SSR_HEALTH_HOST\" \"$SSR_HEALTH_MARKER\" \\\n  \"$NG_TRUST_PROXY_HEADERS_VALUE\" <<'REMOTE'";

/**
 * Move the remote argument VALIDATION to after the release is unpacked, leaving
 * the positional assignments in place so everything downstream still resolves.
 * Ordering is the whole point: a validated-too-late contract has already let a
 * shifted vector change the host.
 */
function moveContractAfterUnpack(root) {
  let s = rd(root, SH);
  const begin = '# --- BEGIN remote argument contract ---';
  const end = '# --- END remote argument contract ---';
  const i = s.indexOf(begin);
  const j = s.indexOf(end);
  if (i === -1 || j === -1) throw new Error('fixture drift: contract markers not found');
  const block = s.slice(i, j + end.length);
  const assignments = block.match(/RELEASE_DIR="\$1"[\s\S]*?NG_TRUST_PROXY_HEADERS_VALUE="\$\{11\}"/);
  if (!assignments) throw new Error('fixture drift: positional assignments not found');
  s = s.slice(0, i) + assignments[0] + '\n' + s.slice(j + end.length);
  const anchor = "find \"$RELEASE_DIR/releases/$STAMP\" -name '._*' -delete";
  if (!s.includes(anchor)) throw new Error('fixture drift: unpack anchor not found');
  wr(root, SH, s.replace(anchor, anchor + '\n\n' + block));
}

const mutations = [
  // --- ecosystem -----------------------------------------------------------
  ['ecosystem: prod allowlist removed', 'ecosystem:prod-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", '')],
  ['ecosystem: prod allowlist = *', 'ecosystem:prod-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", "NG_ALLOWED_HOSTS: '*',")],
  ['ecosystem: loopback added to prod', 'ecosystem:prod-no-loopback',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co,localhost',")],
  ['ecosystem: dev allowlist removed', 'ecosystem:dev-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',", '')],
  ['ecosystem: dev allowlist = *', 'ecosystem:dev-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',", "NG_ALLOWED_HOSTS: '*',")],
  ['ecosystem: prod host in dev allowlist', 'ecosystem:dev-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',", "NG_ALLOWED_HOSTS: 'localhost,roaya.co',")],
  ['ecosystem: PORT empty', 'ecosystem:prod-PORT',
    (r) => patch(r, ECO, "PORT: '__SSR_PORT__',", "PORT: '',")],
  ['ecosystem: PORT arbitrary string', 'ecosystem:prod-PORT',
    (r) => patch(r, ECO, "PORT: '__SSR_PORT__',", "PORT: 'not-a-port',")],
  ['ecosystem: PORT out of range', 'ecosystem:prod-PORT',
    (r) => patch(r, ECO, "PORT: '__SSR_PORT__',", "PORT: 70000,")],

  // --- systemd -------------------------------------------------------------
  ['systemd: allowlist removed', 'systemd:allowlist',
    (r) => patch(r, SVC, 'Environment=NG_ALLOWED_HOSTS=roaya.co,www.roaya.co', '')],

  // --- script: contract plumbing ------------------------------------------
  ['script: export removed', 'script:export-NG_ALLOWED_HOSTS',
    (r) => patch(r, SH, 'export NG_ALLOWED_HOSTS="$NG_ALLOWED_HOSTS_VALUE"', ':')],
  ['script: allowlist dropped from REMOTE_ARGS', 'script:allowlist-passed',
    (r) => patch(r, SH, '  "$NG_ALLOWED_HOSTS_VALUE"\n', '')],

  // --- script: THE restart statement (the P1 blind spot) ------------------
  ['script: --update-env removed from EXECUTED restart only (prose intact)', 'script:restart-statement',
    (r) => patch(r, SH, 'if timeout 60 pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1; then', 'if timeout 60 pm2 restart "$PM2_APP" >/dev/null 2>&1; then')],
  ['script: restart unbounded (timeout removed)', 'script:restart-statement',
    (r) => patch(r, SH, 'if timeout 60 pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1; then', 'if pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1; then')],
  ['script: restart failure masked with || true', 'script:restart-failclosed',
    (r) => patch(r, SH, 'if timeout 60 pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1; then', 'if timeout 60 pm2 restart "$PM2_APP" --update-env >/dev/null 2>&1 || true; then')],

  // --- script: marker -----------------------------------------------------
  ['script: runtime marker validation removed', 'script:marker-runtime-guard',
    (r) => patch(r, SH, 'if [ -z "${SSR_HEALTH_MARKER//[[:space:]]/}" ]; then', 'if false; then')],
  ['script: marker emptied', 'script:marker-value',
    (r) => patch(r, SH, 'SSR_HEALTH_MARKER="Your Trusted Technology Partner in Egypt"', 'SSR_HEALTH_MARKER=""')],
  ['script: marker whitespace-only', 'script:marker-value',
    (r) => patch(r, SH, 'SSR_HEALTH_MARKER="Your Trusted Technology Partner in Egypt"', 'SSR_HEALTH_MARKER="   "')],

  // --- script: rollback target --------------------------------------------
  ['script: PREV_TARGET capture removed', 'script:prev-target-captured',
    (r) => patch(r, SH, 'PREV_TARGET=$(readlink -f "$RELEASE_DIR/current" 2>/dev/null || true)', 'PREV_TARGET=""')],
  ['script: PREV_TARGET captured AFTER the flip', 'script:prev-target-order', movePrevAfterFlip],
  ['script: PREV_TARGET validation removed', 'script:prev-target-validated',
    (r) => patch(r, SH, 'if [ -d "$PREV_TARGET" ] && [ "$PREV_TARGET" != "$RELEASE_DIR/releases/$STAMP" ]; then', 'if true; then')],
  ['script: rollback reverts to a <previous> placeholder', 'script:rollback-no-placeholder',
    (r) => patch(r, SH, "printf '  ln -sfn %q %q\\n' \"$PREV_TARGET\" \"$RELEASE_DIR/current\" >&2", 'echo "  ln -sfn $RELEASE_DIR/releases/<previous> $RELEASE_DIR/current" >&2')],
  ['script: rollback drops the pm2 restart command', 'script:rollback-emitter',
    (r) => patch(r, SH, "    printf '  NODE_ENV=%q PORT=%q NG_ALLOWED_HOSTS=%q NG_TRUST_PROXY_HEADERS=%q pm2 restart %q --update-env\\n' \\\n      \"$NODE_ENV_VALUE\" \"$SSR_PORT\" \"$NG_ALLOWED_HOSTS_VALUE\" \"$NG_TRUST_PROXY_HEADERS_VALUE\" \"$PM2_APP\" >&2", '    :')],

  // --- script: health gate (the second P1 blind spot) ---------------------
  ['script: gate exit removed, later exits intact', 'script:gate-exit',
    (r) => patch(r, SH, '  emit_rollback\n  exit 1\nfi\n\necho "SSR healthy', '  emit_rollback\nfi\n\necho "SSR healthy')],
  ['script: gate stops emitting rollback', 'script:gate-rollback',
    (r) => patch(r, SH, '  emit_rollback\n  exit 1\nfi\n\necho "SSR healthy', '  exit 1\nfi\n\necho "SSR healthy')],
  ['script: Host header dropped', 'script:health-host',
    (r) => patch(r, SH, '-H "Host: $SSR_HEALTH_HOST" ', '')],
  ['script: CSR-shell rejection removed', 'script:health-csr-reject',
    (r) => patch(r, SH, 'CSR_SHELL="$RELEASE_DIR/current/browser/index.csr.html"', 'CSR_SHELL="$RELEASE_DIR/current/browser/index.html.disabled"')],
  ['script: CODE built with || echo 000 again', 'script:health-code-parse',
    (r) => {
      const fs = require('node:fs');
      const p2 = join(r, SH);
      const t = fs.readFileSync(p2, 'utf8');
      const start = t.indexOf('if CODE=$(curl');
      const end = t.indexOf('esac', start) + 4;
      const replacement = 'CODE=$(curl -s -o "$RESP_FILE" -w \'%{http_code}\' --max-time 10 -H "Host: $SSR_HEALTH_HOST" -H "X-Forwarded-For: 127.0.0.1" -H "X-Forwarded-Proto: https" -H "X-Real-IP: 127.0.0.1" "http://127.0.0.1:$SSR_PORT/about" || echo 000)';
      fs.writeFileSync(p2, t.slice(0, start) + replacement + t.slice(end));
    }],
  ['script: gate probes the public CDN URL', 'script:health-origin-only',
    (r) => patch(r, SH, '"http://127.0.0.1:$SSR_PORT/about"', '"https://roaya.co/about"')],

  // --- script: pm2 save + pruning ordering --------------------------------
  ['script: pm2 save masked with || true', 'script:save-statement',
    (r) => patch(r, SH, 'if timeout 30 pm2 save >/dev/null 2>&1; then', 'if timeout 30 pm2 save >/dev/null 2>&1 || true; then')],
  ['script: save-branch exit removed, later exits intact', 'script:save-failclosed',
    (r) => patch(r, SH, '  echo "fallback on every route. Re-run \'pm2 save\' on the host before leaving." >&2\n  exit 1', '  echo "fallback on every route. Re-run \'pm2 save\' on the host before leaving." >&2')],
  ['script: pm2 save moved before the gate', 'script:save-order', moveSaveBeforeGate],
  ['script: pruning moved before the gate', 'script:prune-order', movePruneBeforeGate],
  ['script: pruning removed entirely', 'script:prune-present',
    (r) => patch(r, SH, 'ls -1dt "$RELEASE_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf', ':')],

  // --- trusted-proxy contract (2026-08-25 CSR-shell incident) --------------
  ['trust: removed from the EXECUTED export only', 'script:trust-export',
    (r) => patch(r, SH, 'export NG_TRUST_PROXY_HEADERS="$NG_TRUST_PROXY_HEADERS_VALUE"', ':')],
  ['trust: dropped from REMOTE_ARGS', 'script:trust-passed',
    (r) => patch(r, SH, '  "$NG_TRUST_PROXY_HEADERS_VALUE"\n)', ')')],
  ['trust: script value set to true', 'script:trust-value',
    (r) => patch(r, SH, 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"', 'NG_TRUST_PROXY_HEADERS_VALUE="true"')],
  ['trust: script value gains x-forwarded-host', 'script:trust-value',
    (r) => patch(r, SH, 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"', 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto,x-forwarded-host"')],
  ['trust: script value omits x-forwarded-proto', 'script:trust-value',
    (r) => patch(r, SH, 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"', 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for"')],
  ['trust: script value omits x-forwarded-for', 'script:trust-value',
    (r) => patch(r, SH, 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"', 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-proto"')],
  ['trust: script value malformed (trailing comma)', 'script:trust-value',
    (r) => patch(r, SH, 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto"', 'NG_TRUST_PROXY_HEADERS_VALUE="x-forwarded-for,x-forwarded-proto,"')],
  ['trust: rollback command drops the trust env', 'script:trust-rollback',
    (r) => patch(r, SH, "NODE_ENV=%q PORT=%q NG_ALLOWED_HOSTS=%q NG_TRUST_PROXY_HEADERS=%q pm2 restart %q --update-env", "NODE_ENV=%q PORT=%q NG_ALLOWED_HOSTS=%q pm2 restart %q --update-env")],
  ['trust: pm2 env_production value unset', 'ecosystem:prod-trust',
    (r) => patch(r, ECO, "NG_TRUST_PROXY_HEADERS: 'x-forwarded-for,x-forwarded-proto',", '')],
  ['trust: pm2 env_production set to true', 'ecosystem:prod-trust',
    (r) => patch(r, ECO, "NG_TRUST_PROXY_HEADERS: 'x-forwarded-for,x-forwarded-proto'", "NG_TRUST_PROXY_HEADERS: 'true'")],
  ['trust: pm2 dev env gains a trust value', 'ecosystem:dev-trust',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',", "NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',\n        NG_TRUST_PROXY_HEADERS: 'x-forwarded-for',")],
  ['trust: systemd value unset', 'systemd:trust',
    (r) => patch(r, SVC, 'Environment=NG_TRUST_PROXY_HEADERS=x-forwarded-for,x-forwarded-proto', '')],
  ['trust: systemd value wildcard', 'systemd:trust',
    (r) => patch(r, SVC, 'Environment=NG_TRUST_PROXY_HEADERS=x-forwarded-for,x-forwarded-proto', 'Environment=NG_TRUST_PROXY_HEADERS=*')],

  // --- activation gate must mirror the real nginx shape -------------------
  ['gate: omits X-Forwarded-For', 'script:gate-header-X-Forwarded-For',
    (r) => patch(r, SH, '  -H "X-Forwarded-For: 127.0.0.1" \\\n', '')],
  ['gate: omits X-Forwarded-Proto', 'script:gate-header-X-Forwarded-Proto',
    (r) => patch(r, SH, '  -H "X-Forwarded-Proto: https" \\\n', '')],
  ['gate: omits X-Real-IP', 'script:gate-header-X-Real-IP',
    (r) => patch(r, SH, '  -H "X-Real-IP: 127.0.0.1" \\\n', '')],

  // --- nginx proxy hardening ---------------------------------------------
  ['nginx: SSR location / reverts to $proxy_add_x_forwarded_for', 'nginx:ssr-xff',
    (r) => {
      const fs = require('node:fs');
      const p2 = join(r, NGX);
      const t = fs.readFileSync(p2, 'utf8');
      // revert only the FIRST SSR occurrence
      fs.writeFileSync(p2, t.replace('proxy_set_header X-Forwarded-For $remote_addr;', 'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'));
    }],
  ['nginx: only /api/ hardened while SSR locations stay wrong', 'nginx:ssr-xff',
    (r) => {
      const fs = require('node:fs');
      const p2 = join(r, NGX);
      let t = fs.readFileSync(p2, 'utf8');
      t = t.split('proxy_set_header X-Forwarded-For $remote_addr;').join('proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
      t = t.replace('proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;', 'proxy_set_header X-Forwarded-For $remote_addr;');
      fs.writeFileSync(p2, t);
    }],
  ['nginx: /api/ behaviour changed (out of scope)', 'nginx:api-untouched',
    (r) => {
      const fs = require('node:fs');
      const p2 = join(r, NGX);
      const t = fs.readFileSync(p2, 'utf8');
      fs.writeFileSync(p2, t.replace('proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;', 'proxy_set_header X-Forwarded-For $remote_addr;'));
    }],

  // --- SSH argument serialization (the 2026-08-26 word-split incident) -----
  ['ssh: reverted to the legacy raw-argv invocation', 'script:ssh-single-command',
    (r) => patch(r, SH, SSH_INVOCATION, LEGACY_INVOCATION)],
  ['ssh: a raw argument appended after the built command', 'script:ssh-single-command',
    (r) => patch(r, SH, '"$SSH_HOST" "$REMOTE_COMMAND" <<', '"$SSH_HOST" "$REMOTE_COMMAND $SSR_HEALTH_MARKER" <<')],
  ['ssh: SSR_HEALTH_MARKER unquoted in REMOTE_ARGS', 'script:ssh-args-from-array',
    (r) => patch(r, SH, '  "$SSR_HEALTH_MARKER"\n', '  $SSR_HEALTH_MARKER\n')],
  ['ssh: NG_TRUST_PROXY_HEADERS unquoted in REMOTE_ARGS', 'script:ssh-args-from-array',
    (r) => patch(r, SH, '  "$NG_TRUST_PROXY_HEADERS_VALUE"\n)', '  $NG_TRUST_PROXY_HEADERS_VALUE\n)')],
  ['ssh: marker and trust list swapped in REMOTE_ARGS', 'script:remote-arg-order',
    (r) => patch(r, SH, '  "$SSR_HEALTH_MARKER"\n  "$NG_TRUST_PROXY_HEADERS_VALUE"\n',
                        '  "$NG_TRUST_PROXY_HEADERS_VALUE"\n  "$SSR_HEALTH_MARKER"\n')],

  ['serializer: removed entirely', 'script:serializer-present',
    (r) => patch(r, SH, 'build_remote_bash_command() {', 'unused_helper() {')],
  ['serializer: silently accepts a newline', 'script:serializer-rejects-control',
    (r) => patch(r, SH, '      *[![:print:]]*)', '      *[![:print:]]zzz*)')],
  ['serializer: concatenates raw values instead of quoting', 'script:serializer-posix-quote',
    (r) => patch(r, SH, 'out="$out \'$q\'"', 'out="$out $a"')],

  ['contract: exact argc check deleted', 'script:remote-argc-check',
    (r) => patch(r, SH, 'if [ "$#" -ne "$EXPECTED_ARGC" ]; then', 'if false; then')],
  ['contract: EXPECTED_ARGC off by one', 'script:remote-argc-matches-array',
    (r) => patch(r, SH, 'EXPECTED_ARGC=11', 'EXPECTED_ARGC=10')],
  ['contract: trailing-argument rejection removed', 'script:remote-no-trailing-args',
    (r) => patch(r, SH, 'shift 11\nif [ "$#" -ne 0 ]; then', 'shift 11\nif false; then')],
  ['contract: exact marker validation removed', 'script:remote-marker-exact',
    (r) => patch(r, SH, '[ "$SSR_HEALTH_MARKER" = "$EXPECTED_MARKER" ] || \\', ': || \\')],
  ['contract: marker literal truncated to "Your"', 'script:remote-marker-exact',
    (r) => patch(r, SH, "EXPECTED_MARKER='Your Trusted Technology Partner in Egypt'", "EXPECTED_MARKER='Your'")],
  ['contract: trust literal drifts from the configured value', 'script:remote-trust-exact',
    (r) => patch(r, SH, "EXPECTED_TRUST_PROXY='x-forwarded-for,x-forwarded-proto'", "EXPECTED_TRUST_PROXY='x-forwarded-for'")],
  ['contract: trust compared loosely instead of exactly', 'script:remote-trust-exact',
    (r) => patch(r, SH, '[ "$NG_TRUST_PROXY_HEADERS_VALUE" = "$EXPECTED_TRUST_PROXY" ] || \\',
                        'case "$NG_TRUST_PROXY_HEADERS_VALUE" in *x-forwarded*) : ;; *) false ;; esac || \\')],
  ['contract: allowed-hosts literal drifts from the configured value', 'script:remote-hosts-exact',
    (r) => patch(r, SH, "EXPECTED_ALLOWED_HOSTS='roaya.co,www.roaya.co'", "EXPECTED_ALLOWED_HOSTS='roaya.co'")],
  ['contract: PORT range validation removed', 'script:remote-port-range',
    (r) => patch(r, SH, 'if [ "$SSR_PORT" -lt 1 ] || [ "$SSR_PORT" -gt 65535 ]; then', 'if false; then')],
  ['contract: validated only AFTER the release is unpacked', 'script:remote-contract-order',
    moveContractAfterUnpack],

  ['script: stale "must be N/N" evidence count reintroduced', 'script:no-stale-evidence-count',
    (r) => patch(r, SH, 'log "Verifying evidence suite"', 'log "Verifying evidence suite (must be 9/9)"')],

  // --- docs ---------------------------------------------------------------
  ['docs: required value removed', 'docs:content',
    (r) => patch(r, DOC, 'NG_ALLOWED_HOSTS=roaya.co,www.roaya.co', 'NG_ALLOWED_HOSTS=<redacted>', true)],
  ['docs: dangling docs/deploy reference introduced', 'docs:references',
    (r) => patch(r, DOC, '## Manual rollback', '## Manual rollback\n\nSee docs/deploy/NOPE-MISSING.md.')],
  // Surgical: adds an unqualified claim WITHOUT removing any required string,
  // so only docs:no-atomic-claim may fire.
  ['docs: unqualified atomicity claim added', 'docs:no-atomic-claim',
    (r) => patch(r, DOC, '## Manual rollback', 'Deployment is atomic and zero-downtime.\n\n## Manual rollback')],
];

let failed = 0;

// Baseline: the real files must PASS.
{
  const root = makeTree();
  const { code } = runGuard(root);
  rmSync(root, { recursive: true, force: true });
  if (code === 0) console.log('✓ baseline: unmutated deployment config passes');
  else {
    console.log(`✗ baseline: unmutated deployment config FAILED the guard (exit ${code})`);
    failed++;
  }
}

// Each mutation must be rejected, and rejected for its intended reason.
for (const [name, expected, apply] of mutations) {
  const root = makeTree();
  let res;
  try {
    apply(root);
    res = runGuard(root);
  } catch (err) {
    console.log(`✗ ${name}\n    fixture error: ${err.message}`);
    rmSync(root, { recursive: true, force: true });
    failed++;
    continue;
  }
  rmSync(root, { recursive: true, force: true });

  if (res.code === 0) {
    console.log(`✗ ${name}\n    guard did NOT reject this regression`);
    failed++;
  } else if (!res.fails.includes(expected)) {
    console.log(`✗ ${name}\n    rejected, but NOT for the intended reason` +
      `\n    expected: ${expected}\n    actual:   ${res.fails.join(', ') || '(none)'}`);
    failed++;
  } else {
    console.log(`✓ ${name} — rejected by ${expected}`);
  }
}

const total = mutations.length + 1;
console.log('='.repeat(60));
if (failed) {
  console.log(`${total - failed}/${total} checks passed, ${failed} failed.`);
  process.exit(1);
}
console.log(`All ${total} checks passed — every seeded regression is rejected for its intended reason.`);
process.exit(0);
