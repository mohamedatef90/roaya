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

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const GUARD = join(HERE, 'validate-runtime-config.mjs');

const ECO = 'deploy/pm2/ecosystem.config.js';
const SVC = 'deploy/systemd/roaya-ssr.service';
const SH = 'deploy/scripts/deploy-ssr.sh';
const DOC = 'docs/deploy/RUNTIME-ENV.md';
const EXTRA = ['CLAUDE.md', 'docs/ai-readiness-human-gates.md', 'deploy/nginx/roaya-website.conf'];
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

const mutations = [
  // --- ecosystem -----------------------------------------------------------
  ['ecosystem: prod allowlist removed', 'ecosystem:prod-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", '')],
  ['ecosystem: prod allowlist = *', 'ecosystem:prod-allowlist',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", "NG_ALLOWED_HOSTS: '*',")],
  ['ecosystem: loopback added to prod', 'ecosystem:prod-no-loopback',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co,localhost',")],
  ['ecosystem: prod NG_TRUST_PROXY_HEADERS set', 'ecosystem:prod-NG_TRUST_PROXY_HEADERS',
    (r) => patch(r, ECO, "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',", "NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',\n        NG_TRUST_PROXY_HEADERS: 'true',")],
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
  ['systemd: NG_TRUST_PROXY_HEADERS set', 'systemd:NG_TRUST_PROXY_HEADERS',
    (r) => patch(r, SVC, 'Environment=NG_ALLOWED_HOSTS=roaya.co,www.roaya.co', 'Environment=NG_ALLOWED_HOSTS=roaya.co,www.roaya.co\nEnvironment=NG_TRUST_PROXY_HEADERS=true')],

  // --- script: contract plumbing ------------------------------------------
  ['script: export removed', 'script:export-NG_ALLOWED_HOSTS',
    (r) => patch(r, SH, 'export NG_ALLOWED_HOSTS="$NG_ALLOWED_HOSTS_VALUE"', ':')],
  ['script: allowlist not passed to remote', 'script:allowlist-passed',
    (r) => patch(r, SH, '"$NG_ALLOWED_HOSTS_VALUE" "$SSR_HEALTH_HOST"', '"$SSR_HEALTH_HOST"')],

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
    (r) => patch(r, SH, "    printf '  NODE_ENV=%q PORT=%q NG_ALLOWED_HOSTS=%q pm2 restart %q --update-env\\n' \\\n      \"$NODE_ENV_VALUE\" \"$SSR_PORT\" \"$NG_ALLOWED_HOSTS_VALUE\" \"$PM2_APP\" >&2", '    :')],

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
    (r) => patch(r, SH, 'if CODE=$(curl -s -o "$RESP_FILE" -w \'%{http_code}\' --max-time 10 \\\n  -H "Host: $SSR_HEALTH_HOST" "http://127.0.0.1:$SSR_PORT/about"); then\n  :\nelse\n  CODE="000"\nfi', 'CODE=$(curl -s -o "$RESP_FILE" -w \'%{http_code}\' --max-time 10 -H "Host: $SSR_HEALTH_HOST" "http://127.0.0.1:$SSR_PORT/about" || echo 000)')],
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
