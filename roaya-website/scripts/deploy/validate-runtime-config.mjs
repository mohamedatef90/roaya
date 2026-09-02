#!/usr/bin/env node
/**
 * Deployment runtime-config guard.
 *
 * Locks in the SSR runtime contract documented in docs/deploy/RUNTIME-ENV.md.
 * Pure static analysis of repository files: deterministic, no network, no SSH,
 * no production contact, no build required.
 *
 * The failure this exists to prevent: @angular/ssr >= 21 rejects a request
 * whose Host header hostname is not in NG_ALLOWED_HOSTS by serving
 * browser/index.csr.html with HTTP 200. It fails OPEN, so a status-only health
 * check reports success while every route serves an empty shell.
 *
 * DESIGN RULE (learned from the 2026-08-25 review): assertions must be
 * STRUCTURAL and BLOCK-SCOPED. Checking that a string exists somewhere in the
 * file is not enough - operator-facing `echo` prose and `exit 1` statements in
 * unrelated branches will satisfy a loose regex while the executed code has
 * regressed. Every check below either anchors to an executable line or slices
 * the specific `if` block it is about.
 *
 * Run: npm run test:deploy-runtime-config
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// DEPLOY_CONFIG_ROOT lets validate-runtime-config.selftest.mjs point this guard
// at a mutated copy of the tree. Unset in normal use.
const ROOT = process.env['DEPLOY_CONFIG_ROOT']
  ? resolve(process.env['DEPLOY_CONFIG_ROOT'])
  : join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);

const EXPECTED_ALLOWLIST = 'roaya.co,www.roaya.co';
const EXPECTED_HOSTS = ['roaya.co', 'www.roaya.co'];
const EXPECTED_DEV_ALLOWLIST = 'localhost,127.0.0.1';
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
const HEALTH_MARKER = 'Your Trusted Technology Partner in Egypt';
// Explicit list; REPLACES Angular's defaults, so it must name exactly the
// forwarded headers nginx sends to the SSR upstream - no more, no less.
const EXPECTED_TRUST = 'x-forwarded-for,x-forwarded-proto';
// Values that must never appear in the trust list.
const FORBIDDEN_TRUST = ['true', '*', 'forwarded', 'x-forwarded-host', 'x-forwarded-prefix', 'x-forwarded-port', 'x-real-ip'];
// Headers the activation probe must send to mirror the real nginx shape.
const GATE_HEADERS = [
  ['Host', /-H "Host: \$SSR_HEALTH_HOST"/],
  ['X-Forwarded-For', /-H "X-Forwarded-For: 127\.0\.0\.1"/],
  ['X-Forwarded-Proto', /-H "X-Forwarded-Proto: https"/],
  ['X-Real-IP', /-H "X-Real-IP: 127\.0\.0\.1"/],
];
const PORT_PLACEHOLDER = '__SSR_PORT__';

const ECOSYSTEM = 'deploy/pm2/ecosystem.config.js';
const SERVICE = 'deploy/systemd/roaya-ssr.service';
const SCRIPT = 'deploy/scripts/deploy-ssr.sh';
const DOC = 'docs/deploy/RUNTIME-ENV.md';
const NGINX = 'deploy/nginx/roaya-website.conf';
// Every file below must only reference docs/deploy/*.md files that exist.
// deploy/nginx/roaya-website.conf is included: its comments were repointed to
// RUNTIME-ENV.md rather than citing a runbook that was never written.
const DOC_REF_SOURCES = [
  SCRIPT, ECOSYSTEM, SERVICE, DOC, 'CLAUDE.md',
  'docs/ai-readiness-human-gates.md', 'deploy/nginx/roaya-website.conf',
];

const failures = [];
const passes = [];
const fail = (check, detail) => failures.push({ check, detail });
const pass = (check, detail) => passes.push({ check, detail });

const read = (rel) => {
  const p = join(ROOT, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
};

/** Strip `#` comment lines (shell / systemd). */
const stripHashComments = (t) => t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
/** Strip `//` line comments (JS). */
const stripSlashComments = (t) => t.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

/**
 * Slice one shell `if` block: from the line matching `startRe` to the next
 * column-0 `fi`. Returns null when the block is absent. This is what keeps a
 * later branch's `exit 1` from satisfying an earlier branch's assertion.
 */
function sliceIfBlock(text, startRe) {
  const m = text.match(startRe);
  if (!m) return null;
  const start = m.index;
  const rest = text.slice(start);
  const end = rest.search(/\n fi$|\nfi$|\nfi\n/m);
  return end === -1 ? rest : rest.slice(0, end + 4);
}

/** Split a comma-separated allowlist literal into hostnames. */
const hosts = (v) => String(v).split(',').map((h) => h.trim()).filter(Boolean);

/**
 * Validate a NG_TRUST_PROXY_HEADERS literal. Returns null when correct, else a
 * reason. Exact-string contract: the list replaces Angular's defaults, so an
 * extra entry widens trust and a missing entry silently deopts SSR to the CSR
 * shell with HTTP 200.
 */
function trustProblem(value) {
  if (value === undefined || value === null || value === '')
    return `must be set to exactly "${EXPECTED_TRUST}"; unset makes @angular/ssr serve the CSR shell (HTTP 200) for every real nginx request`;
  const raw = String(value);
  if (raw !== raw.trim() || /,\s*,|,\s*$|^\s*,/.test(raw))
    return `malformed list ${JSON.stringify(raw)} (stray/empty comma or padding)`;
  const parts = raw.split(',').map((h) => h.trim());
  if (parts.some((h) => h === '')) return `malformed list ${JSON.stringify(raw)} (empty entry)`;
  const lowered = parts.map((h) => h.toLowerCase());
  for (const bad of FORBIDDEN_TRUST) {
    if (lowered.includes(bad))
      return `must not contain ${JSON.stringify(bad)} — trusting it would either accept attacker-supplied forwarding headers or name a header nginx does not send`;
  }
  if (raw !== EXPECTED_TRUST)
    return `must be exactly "${EXPECTED_TRUST}" (order and spelling included), got ${JSON.stringify(raw)}`;
  return null;
}

// ---------------------------------------------------------------------------
// 1. PM2 ecosystem
// ---------------------------------------------------------------------------
{
  const raw = read(ECOSYSTEM);
  if (!raw) {
    fail('ecosystem:exists', `${ECOSYSTEM} is missing`);
  } else {
    let cfg = null;
    try {
      cfg = require(join(ROOT, ECOSYSTEM));
    } catch (err) {
      fail('ecosystem:loads', `${ECOSYSTEM} failed to load: ${err.message}`);
    }
    const app = cfg?.apps?.find((a) => a.name === 'roaya-ssr');
    if (!app) {
      fail('ecosystem:app', 'no app named "roaya-ssr" in ecosystem config');
    } else {
      const prod = app.env_production ?? {};
      const dev = app.env ?? {};

      // --- production allowlist: exact, and free of loopback/wildcard
      if (prod.NG_ALLOWED_HOSTS === EXPECTED_ALLOWLIST) {
        pass('ecosystem:prod-allowlist', EXPECTED_ALLOWLIST);
      } else {
        fail(
          'ecosystem:prod-allowlist',
          `env_production.NG_ALLOWED_HOSTS must be exactly "${EXPECTED_ALLOWLIST}", got ${JSON.stringify(prod.NG_ALLOWED_HOSTS)}`,
        );
      }
      {
        const h = hosts(prod.NG_ALLOWED_HOSTS ?? '');
        const bad = h.filter((x) => x === '*' || LOOPBACK_HOSTS.includes(x));
        const extra = h.filter((x) => !EXPECTED_HOSTS.includes(x));
        if (bad.length) fail('ecosystem:prod-no-loopback', `production allowlist contains ${JSON.stringify(bad)}`);
        else if (extra.length) fail('ecosystem:prod-no-loopback', `production allowlist has unexpected ${JSON.stringify(extra)}`);
        else pass('ecosystem:prod-no-loopback', 'no wildcard or loopback host in production');
      }

      // --- development allowlist: present, loopback-only, no production hosts
      if (dev.NG_ALLOWED_HOSTS === EXPECTED_DEV_ALLOWLIST) {
        pass('ecosystem:dev-allowlist', EXPECTED_DEV_ALLOWLIST);
      } else if (dev.NG_ALLOWED_HOSTS === undefined) {
        fail(
          'ecosystem:dev-allowlist',
          `env.NG_ALLOWED_HOSTS is missing; a non-production "pm2 start" would run with an EMPTY allowlist and silently serve the CSR shell. Expected "${EXPECTED_DEV_ALLOWLIST}"`,
        );
      } else {
        const h = hosts(dev.NG_ALLOWED_HOSTS);
        if (h.includes('*')) fail('ecosystem:dev-allowlist', 'development allowlist must not use "*"');
        else if (h.some((x) => EXPECTED_HOSTS.includes(x)))
          fail('ecosystem:dev-allowlist', `development allowlist must not contain production hosts: ${JSON.stringify(h)}`);
        else
          fail('ecosystem:dev-allowlist', `expected "${EXPECTED_DEV_ALLOWLIST}", got ${JSON.stringify(dev.NG_ALLOWED_HOSTS)}`);
      }

      if (prod.NODE_ENV === 'production') pass('ecosystem:prod-NODE_ENV', 'production');
      else fail('ecosystem:prod-NODE_ENV', `expected "production", got ${JSON.stringify(prod.NODE_ENV)}`);

      // --- PORT: a real port, or the documented placeholder. Nothing else.
      {
        const v = prod.PORT;
        const s = String(v ?? '');
        const n = Number(s);
        if (s === PORT_PLACEHOLDER) {
          pass('ecosystem:prod-PORT', `documented placeholder ${PORT_PLACEHOLDER} (must be substituted before use)`);
        } else if (/^\d+$/.test(s) && n >= 1 && n <= 65535) {
          pass('ecosystem:prod-PORT', `${n}`);
        } else {
          fail(
            'ecosystem:prod-PORT',
            `env_production.PORT must be a port in 1-65535 or the exact placeholder "${PORT_PLACEHOLDER}", got ${JSON.stringify(v)}`,
          );
        }
      }

      // Production MUST carry the exact trust list; development must NOT (a
      // local `pm2 start` has no proxy in front of it).
      {
        const problem = trustProblem(prod.NG_TRUST_PROXY_HEADERS);
        if (problem) fail('ecosystem:prod-trust', `env_production.NG_TRUST_PROXY_HEADERS ${problem}`);
        else pass('ecosystem:prod-trust', EXPECTED_TRUST);
      }
      if ('NG_TRUST_PROXY_HEADERS' in dev)
        fail('ecosystem:dev-trust', 'env.NG_TRUST_PROXY_HEADERS must stay UNSET — a local run has no reverse proxy, so trusting forwarded headers there only widens attack surface');
      else pass('ecosystem:dev-trust', 'unset (no proxy in local runs)');
    }
  }
}

// ---------------------------------------------------------------------------
// 2. systemd unit
// ---------------------------------------------------------------------------
{
  const raw = read(SERVICE);
  if (!raw) {
    fail('systemd:exists', `${SERVICE} is missing`);
  } else {
    const active = stripHashComments(raw);
    const esc = EXPECTED_ALLOWLIST.replace(/\./g, '\\.');

    if (new RegExp(`^Environment=NG_ALLOWED_HOSTS=${esc}$`, 'm').test(active))
      pass('systemd:allowlist', EXPECTED_ALLOWLIST);
    else fail('systemd:allowlist', `missing exact line: Environment=NG_ALLOWED_HOSTS=${EXPECTED_ALLOWLIST}`);

    if (/^Environment=NODE_ENV=production$/m.test(active)) pass('systemd:NODE_ENV', 'production');
    else fail('systemd:NODE_ENV', 'missing Environment=NODE_ENV=production');

    if (/^Environment=PORT=/m.test(active)) pass('systemd:PORT', 'declared');
    else fail('systemd:PORT', 'missing Environment=PORT=');

    if (/^EnvironmentFile=/m.test(active)) pass('systemd:EnvironmentFile', 'retained');
    else fail('systemd:EnvironmentFile', 'optional EnvironmentFile behaviour was removed');

    {
      const m = active.match(/^Environment=NG_TRUST_PROXY_HEADERS=(.*)$/m);
      const problem = trustProblem(m ? m[1] : undefined);
      if (problem) fail('systemd:trust', `Environment=NG_TRUST_PROXY_HEADERS ${problem}`);
      else pass('systemd:trust', EXPECTED_TRUST);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. deploy-ssr.sh — structural, block-scoped
// ---------------------------------------------------------------------------
{
  const raw = read(SCRIPT);
  if (!raw) {
    fail('script:exists', `${SCRIPT} is missing`);
  } else {
    const active = stripHashComments(raw);
    const idx = (re) => active.search(re);

    // --- 3a. contract value defined and threaded through -------------------
    if (active.includes(`NG_ALLOWED_HOSTS_VALUE="${EXPECTED_ALLOWLIST}"`))
      pass('script:allowlist-value', EXPECTED_ALLOWLIST);
    else fail('script:allowlist-value', `missing NG_ALLOWED_HOSTS_VALUE="${EXPECTED_ALLOWLIST}"`);

    // The remote argument vector is declared once, in REMOTE_ARGS, and the
    // serializer builds the whole remote command from it. Every element must be
    // a FULLY QUOTED variable reference: an unquoted one word-splits in the
    // LOCAL shell before the serializer ever sees it, which is the same class of
    // defect as the 2026-08-26 incident, one layer earlier.
    const argsBlock = active.match(/^REMOTE_ARGS=\(\n([\s\S]*?)\n\)$/m);
    const argNames = [];
    let argsShapeOk = argsBlock !== null;
    if (argsBlock) {
      for (const line of argsBlock[1].split('\n')) {
        if (!line.trim()) continue;
        const m = line.match(/^\s*"\$([A-Za-z_][A-Za-z0-9_]*)"$/);
        if (m) argNames.push(m[1]);
        else { argsShapeOk = false; argNames.push(`<malformed:${line.trim()}>`); }
      }
    }
    if (argsShapeOk && argNames.length > 0)
      pass('script:ssh-args-from-array', `${argNames.length} remote arguments, each a fully quoted variable reference`);
    else
      fail(
        'script:ssh-args-from-array',
        argsBlock
          ? `every REMOTE_ARGS element must be exactly "$VAR"; found ${JSON.stringify(argNames.filter((n) => n.startsWith('<')))}`
          : 'no REMOTE_ARGS=( ... ) vector found; the remote arguments must be declared once, in one array',
      );

    if (argNames.includes('NG_ALLOWED_HOSTS_VALUE'))
      pass('script:allowlist-passed', 'passed to the remote block via REMOTE_ARGS');
    else
      fail('script:allowlist-passed', 'the allowlist is not passed into the remote activation block');

    for (const [name, re] of [
      ['NG_ALLOWED_HOSTS', /^export\s+NG_ALLOWED_HOSTS=/m],
      ['NODE_ENV', /^export\s+NODE_ENV=/m],
      ['PORT', /^export\s+PORT=/m],
    ]) {
      if (re.test(active)) pass(`script:export-${name}`, 'exported in the remote block');
      else fail(`script:export-${name}`, `missing "export ${name}=" before the pm2 restart`);
    }

    // --- 3b. THE restart statement: line-anchored and bounded --------------
    // Must match the executed condition, not any echo prose mentioning it.
    const RESTART_RE = /^\s*if\s+timeout\s+\d+\s+pm2\s+restart\s+"\$PM2_APP"\s+--update-env\b[^\n]*;\s*then\s*$/m;
    const restartLine = active.match(RESTART_RE);
    if (restartLine) {
      pass('script:restart-statement', 'executed restart is bounded and uses --update-env');
      if (/\|\|\s*true|;\s*true/.test(restartLine[0]))
        fail('script:restart-failclosed', 'the executed restart masks failure with "|| true"');
      else pass('script:restart-failclosed', 'executed restart does not mask failure');
    } else {
      // Distinguish the likely causes so the message is actionable.
      const loose = active.match(/^\s*if\s+[^\n]*pm2\s+restart\s+"\$PM2_APP"[^\n]*;\s*then\s*$/m);
      if (loose && !/--update-env/.test(loose[0]))
        fail(
          'script:restart-statement',
          'the EXECUTED pm2 restart is missing --update-env (prose elsewhere does not count); exported NG_ALLOWED_HOSTS would never reach the process',
        );
      else if (loose && !/timeout\s+\d+/.test(loose[0]))
        fail('script:restart-statement', 'the executed pm2 restart is unbounded (no timeout)');
      else
        fail(
          'script:restart-statement',
          'no line-anchored `if timeout <n> pm2 restart "$PM2_APP" --update-env ...; then` found',
        );
      fail('script:restart-failclosed', 'cannot verify fail-closed restart: executed statement not recognised');
    }

    const exportIdx = idx(/^export\s+NG_ALLOWED_HOSTS=/m);
    const restartIdx = restartLine ? restartLine.index : idx(/pm2\s+restart/);
    if (exportIdx !== -1 && restartIdx !== -1 && exportIdx < restartIdx)
      pass('script:export-order', 'exports precede the pm2 restart');
    else fail('script:export-order', 'NG_ALLOWED_HOSTS must be exported BEFORE pm2 restart --update-env');

    // --- 3c. runtime marker validation, before any mutation ---------------
    const markerGuardIdx = idx(/if\s+\[\s+-z\s+"\$\{SSR_HEALTH_MARKER\/\/\[\[:space:\]\]\/\}"\s+\]/);
    const flipIdx = idx(/^ln -sfn\s+"\$RELEASE_DIR\/releases\/\$STAMP"/m);
    if (markerGuardIdx !== -1) {
      pass('script:marker-runtime-guard', 'empty/whitespace marker rejected at runtime');
      if (flipIdx !== -1 && markerGuardIdx < flipIdx && markerGuardIdx < restartIdx)
        pass('script:marker-guard-order', 'marker validated before symlink flip and restart');
      else fail('script:marker-guard-order', 'the marker must be validated BEFORE the symlink flip and restart');
    } else {
      fail(
        'script:marker-runtime-guard',
        'missing runtime rejection of an empty/whitespace SSR_HEALTH_MARKER; the gate would degrade to grep -qF "" and match the CSR shell',
      );
      fail('script:marker-guard-order', 'cannot verify ordering: marker guard absent');
    }
    if (active.includes(`SSR_HEALTH_MARKER="${HEALTH_MARKER}"`))
      pass('script:marker-value', `asserts "${HEALTH_MARKER}"`);
    else fail('script:marker-value', `missing SSR_HEALTH_MARKER="${HEALTH_MARKER}"`);

    // --- 3d. rollback target captured before the flip ----------------------
    const prevIdx = idx(/^PREV_TARGET=\$\(readlink -f "\$RELEASE_DIR\/current"/m);
    if (prevIdx !== -1) {
      pass('script:prev-target-captured', 'PREV_TARGET captured via readlink -f');
      if (flipIdx !== -1 && prevIdx < flipIdx)
        pass('script:prev-target-order', 'captured BEFORE current is repointed');
      else fail('script:prev-target-order', 'PREV_TARGET must be captured before `ln -sfn` flips current');
    } else {
      fail('script:prev-target-captured', 'missing PREV_TARGET capture; rollback target would be unknowable after the flip');
      fail('script:prev-target-order', 'cannot verify ordering: PREV_TARGET absent');
    }
    if (/case\s+"\$PREV_TARGET"\s+in[\s\S]{0,400}?\$RELEASE_DIR\/releases\//.test(active) && /-d "\$PREV_TARGET"/.test(active))
      pass('script:prev-target-validated', 'validated as an existing directory under $RELEASE_DIR/releases');
    else
      fail('script:prev-target-validated', 'PREV_TARGET must be validated as an existing directory inside $RELEASE_DIR/releases before being offered');

    // --- 3e. rollback output is executable, not a placeholder -------------
    if (active.includes('<previous>'))
      fail('script:rollback-no-placeholder', 'rollback output still contains the literal placeholder "<previous>"');
    else pass('script:rollback-no-placeholder', 'no "<previous>" placeholder in rollback output');

    const emit = active.match(/emit_rollback\(\)\s*\{[\s\S]*?\n\}/);
    if (!emit) {
      fail('script:rollback-emitter', 'no emit_rollback() helper found');
    } else {
      const body = emit[0];
      const okQuote = /printf\s+'[^']*%q/.test(body);
      const okLink = /ln -sfn %q %q/.test(body) && /"\$PREV_TARGET"/.test(body);
      const okRestart = /pm2 restart %q --update-env/.test(body);
      if (okQuote && okLink && okRestart)
        pass('script:rollback-emitter', 'emits %q-quoted symlink restore + pm2 restart --update-env using PREV_TARGET');
      else
        fail(
          'script:rollback-emitter',
          `emit_rollback() must print %q-quoted commands including the symlink restore to PREV_TARGET and the pm2 restart --update-env (quote=${okQuote}, link=${okLink}, restart=${okRestart})`,
        );
    }
    // Both failure paths must call it.
    const restartFailCalls = /FATAL: 'pm2 restart[\s\S]{0,600}?emit_rollback/.test(active);
    const gateFailCalls = /SSR activation gate FAILED[\s\S]{0,1400}?emit_rollback/.test(active);
    if (restartFailCalls && gateFailCalls)
      pass('script:rollback-wired', 'both restart-failure and gate-failure paths emit rollback commands');
    else
      fail('script:rollback-wired', `rollback must be emitted on both failure paths (restart=${restartFailCalls}, gate=${gateFailCalls})`);

    // --- 3f. health probe shape ------------------------------------------
    if (/-H\s+"Host:\s*\$SSR_HEALTH_HOST"/.test(active)) pass('script:health-host', 'sends Host: $SSR_HEALTH_HOST');
    else fail('script:health-host', 'the health check must send an allowlisted Host header');
    if (/SSR_HEALTH_HOST="\$\{SSR_HEALTH_HOST:-roaya\.co\}"/.test(active))
      pass('script:health-host-default', 'defaults to roaya.co');
    else fail('script:health-host-default', 'SSR_HEALTH_HOST must default to roaya.co');
    if (/--max-time/.test(active)) pass('script:health-bounded', '--max-time present');
    else fail('script:health-bounded', 'health check curl must be bounded with --max-time');
    if (/mktemp/.test(active) && /trap\s+'rm -f/.test(active))
      pass('script:health-tmp-cleanup', 'response file removed via trap on all exit paths');
    else fail('script:health-tmp-cleanup', 'the temporary response file must be cleaned up on success and failure');

    // curl status must not be built by concatenating curl output with echo.
    if (/\|\|\s*echo\s+000/.test(active))
      fail('script:health-code-parse', 'CODE is built with `|| echo 000`, which yields "000000" on transport failure');
    else if (/CODE="000"/.test(active) && /\[0-9\]\[0-9\]\[0-9\]\)/.test(active))
      pass('script:health-code-parse', 'transport failure normalises to exactly 000');
    else fail('script:health-code-parse', 'expected explicit control flow normalising a failed probe to CODE=000');

    if (/CSR_SHELL=[^\n]*index\.csr\.html/.test(active) && /cmp\s+-s\s+"\$RESP_FILE"\s+"\$CSR_SHELL"/.test(active))
      pass('script:health-csr-reject', 'rejects a response identical to index.csr.html');
    else fail('script:health-csr-reject', 'the health check must reject a response byte-identical to browser/index.csr.html');

    // --- 3g. health-failure branch, sliced ------------------------------
    const gateBlock = sliceIfBlock(active, /^if \[ "\$HEALTH_FAIL" -ne 0 \]; then$/m);
    if (!gateBlock) {
      fail('script:gate-exit', 'no `if [ "$HEALTH_FAIL" -ne 0 ]; then` block found');
    } else {
      const hasExit = /^\s*exit 1\s*$/m.test(gateBlock);
      const hasCsrMsg = /CLIENT-SIDE RENDERING FALLBACK/.test(gateBlock);
      const hasRollback = /emit_rollback/.test(gateBlock);
      if (hasExit) pass('script:gate-exit', 'gate exits non-zero INSIDE its own branch');
      else
        fail(
          'script:gate-exit',
          'the health-failure branch has no unconditional `exit 1` of its own (a later branch\'s exit does not count)',
        );
      if (hasCsrMsg) pass('script:gate-message', 'names the CSR-fallback failure mode');
      else fail('script:gate-message', 'the gate failure message must name the CSR-fallback possibility');
      if (hasRollback) pass('script:gate-rollback', 'emits rollback commands');
      else fail('script:gate-rollback', 'the gate failure branch must emit rollback commands');
    }

    // --- 3h. pm2 save block, sliced -------------------------------------
    const SAVE_RE = /^if\s+timeout\s+\d+\s+pm2\s+save\b[^\n]*;\s*then$/m;
    const saveLine = active.match(SAVE_RE);
    const saveBlock = sliceIfBlock(active, SAVE_RE);
    if (!saveLine || !saveBlock) {
      fail('script:save-statement', 'no line-anchored `if timeout <n> pm2 save ...; then` found');
      fail('script:save-failclosed', 'cannot verify: save statement not recognised');
    } else {
      if (/\|\|\s*true|;\s*true/.test(saveLine[0]))
        fail('script:save-statement', 'the executed pm2 save masks failure with "|| true"');
      else pass('script:save-statement', 'bounded pm2 save, failure not masked');

      // The save block's own else-branch must exit non-zero.
      const elseIdx = saveBlock.search(/^else$/m);
      const elseBody = elseIdx === -1 ? '' : saveBlock.slice(elseIdx);
      if (/^\s*exit 1\s*$/m.test(elseBody))
        pass('script:save-failclosed', 'save failure exits non-zero within its own branch');
      else
        fail('script:save-failclosed', 'the pm2 save failure branch must contain its own `exit 1`');
    }

    const gateIdx = idx(/^if \[ "\$HEALTH_FAIL" -ne 0 \]; then$/m);
    const saveIdx = saveLine ? saveLine.index : -1;
    if (gateIdx !== -1 && saveIdx !== -1 && gateIdx < saveIdx)
      pass('script:save-order', 'pm2 save runs only after the SSR gate');
    else fail('script:save-order', 'pm2 save must come after the SSR health gate');

    // --- 3i. pruning only after restart + gate + save --------------------
    const pruneIdx = idx(/tail -n \+6/);
    if (pruneIdx === -1) {
      fail('script:prune-present', 'release pruning was removed entirely');
    } else if (saveIdx !== -1 && pruneIdx > saveIdx && saveBlock && /tail -n \+6/.test(saveBlock)) {
      pass('script:prune-order', 'pruning happens inside the pm2-save success path (after restart, gate and save)');
    } else {
      fail(
        'script:prune-order',
        'release pruning must happen only after the restart, the SSR gate and pm2 save have all succeeded, so a rollback target always survives a failed deploy',
      );
    }

    // --- 3j. misc ---------------------------------------------------------
    // --- trusted-proxy contract: value, plumbing, export, rollback ---------
    {
      const m = active.match(/^NG_TRUST_PROXY_HEADERS_VALUE="([^"]*)"$/m);
      const problem = trustProblem(m ? m[1] : undefined);
      if (problem) fail('script:trust-value', `NG_TRUST_PROXY_HEADERS_VALUE ${problem}`);
      else pass('script:trust-value', EXPECTED_TRUST);
    }
    if (argNames.includes('NG_TRUST_PROXY_HEADERS_VALUE'))
      pass('script:trust-passed', 'passed into the remote block via REMOTE_ARGS');
    else fail('script:trust-passed', 'the trust list is not passed into the remote activation block');

    const trustExportIdx = idx(/^export\s+NG_TRUST_PROXY_HEADERS="\$NG_TRUST_PROXY_HEADERS_VALUE"$/m);
    if (trustExportIdx !== -1) {
      pass('script:trust-export', 'exported in the remote block');
      if (restartIdx !== -1 && trustExportIdx < restartIdx)
        pass('script:trust-export-order', 'exported before pm2 restart');
      else fail('script:trust-export-order', 'NG_TRUST_PROXY_HEADERS must be exported BEFORE pm2 restart --update-env');
    } else {
      fail('script:trust-export', 'missing `export NG_TRUST_PROXY_HEADERS="$NG_TRUST_PROXY_HEADERS_VALUE"` — the restart would drop it and SSR would serve the CSR shell');
      fail('script:trust-export-order', 'cannot verify ordering: export absent');
    }

    // Rollback must restore the SAME runtime contract, or a rollback restart
    // reintroduces the very failure it is recovering from.
    if (emit && /NG_TRUST_PROXY_HEADERS=%q/.test(emit[0]) && /"\$NG_TRUST_PROXY_HEADERS_VALUE"/.test(emit[0]))
      pass('script:trust-rollback', 'rollback restart carries the trust list');
    else fail('script:trust-rollback', 'the printed rollback command must set NG_TRUST_PROXY_HEADERS');

    // --- the gate must mirror the real nginx request shape ----------------
    for (const [name, re] of GATE_HEADERS) {
      if (re.test(active)) pass(`script:gate-header-${name}`, 'sent by the activation probe');
      else
        fail(
          `script:gate-header-${name}`,
          `the activation probe must send ${name}; a probe that omits the forwarded headers nginx adds tests a request shape no visitor ever sends (this is how the 2026-08-25 CSR-shell release passed its gate)`,
        );
    }
    if (/trustProxyHeaders/.test(active))
      pass('script:gate-deopt-log', 'gate fails on an untrusted proxy-header deopt log line');
    else fail('script:gate-deopt-log', 'the gate should assert the SSR log has no trustProxyHeaders deopt notice');

    // --- 3k. SSH argument serialization (the 2026-08-26 defect) -----------
    // OpenSSH does not preserve argv: it JOINS its command arguments into one
    // string that the remote LOGIN SHELL parses again. `ssh host bash -s --
    // "$A" "$MARKER"` therefore delivered the multi-word marker as six
    // positional parameters and shifted NG_TRUST_PROXY_HEADERS to "Trusted",
    // so the release served the CSR shell. Every assertion below is anchored to
    // executed code, never to the comments explaining it.
    {
      // The marker-delimited blocks are comments, so slice them from the RAW
      // text; `active` has had every comment line removed.
      const between = (a, b) => {
        const i = raw.indexOf(a);
        const j = raw.indexOf(b);
        return i === -1 || j === -1 || j < i ? null : raw.slice(i, j + b.length);
      };
      const serRaw = between('# --- BEGIN remote command serializer ---', '# --- END remote command serializer ---');
      const conRaw = between('# --- BEGIN remote argument contract ---', '# --- END remote argument contract ---');

      // --- the ssh call itself: ONE constructed command string, nothing else
      const SSH_RE = /^ssh "\$\{SSH_OPTS\[@\]\}" "\$SSH_HOST" "\$REMOTE_COMMAND" <<'REMOTE'$/m;
      const legacyRaw = /^\s*ssh\b[^\n]*\bbash\s+-s\s+--/m.test(active);
      const appended = /"\$REMOTE_COMMAND[^"]/.test(active);
      if (legacyRaw)
        fail(
          'script:ssh-single-command',
          'the legacy `ssh ... bash -s -- "$VALUE" ...` pattern is back; OpenSSH joins those arguments into one string that the remote shell re-splits, which is exactly what shifted NG_TRUST_PROXY_HEADERS to "Trusted" on 2026-08-26',
        );
      else if (appended)
        fail(
          'script:ssh-single-command',
          'something is concatenated onto "$REMOTE_COMMAND"; every remote argument must go through the serializer, never be appended raw after it',
        );
      else if (SSH_RE.test(active))
        pass('script:ssh-single-command', 'ssh receives exactly one serialized command string');
      else
        fail(
          'script:ssh-single-command',
          'expected the exact line: ssh "${SSH_OPTS[@]}" "$SSH_HOST" "$REMOTE_COMMAND" <<\'REMOTE\'',
        );

      // --- the serializer
      if (!serRaw || !/^build_remote_bash_command\(\)\s*\{/m.test(serRaw)) {
        fail('script:serializer-present', 'no build_remote_bash_command() between the serializer BEGIN/END markers; the remote command is not being quoted for the remote shell');
        fail('script:serializer-posix-quote', 'cannot verify: serializer absent');
        fail('script:serializer-rejects-control', 'cannot verify: serializer absent');
      } else {
        const body = stripHashComments(serRaw);
        pass('script:serializer-present', 'build_remote_bash_command() is defined and extractable');

        // POSIX single-quote encoding: each value wrapped in single quotes with
        // embedded quotes escaped. Inside single quotes nothing expands, so
        // $(...), backticks, ; && * ? \ and " are all inert.
        const wraps = /out="\$out '\$q'"/.test(body);
        const escapes = /q=\$\{a\/\/\\'\//.test(body);
        const rawConcat = /out="\$out \$a"|out="\$out "?\$a\b/.test(body);
        if (wraps && escapes && !rawConcat)
          pass('script:serializer-posix-quote', "each argument is POSIX single-quoted with embedded ' escaped");
        else
          fail(
            'script:serializer-posix-quote',
            `the serializer must single-quote every argument and escape embedded single quotes (wraps=${wraps}, escapes=${escapes}, raw-concat=${rawConcat})`,
          );

        // Control characters must be REJECTED, not encoded: a smuggled newline
        // is the one thing a single-quoted string cannot neutralise on a
        // `bash -s --` command line.
        const rejects = /\*\[!\[:print:\]\]\*\)/.test(body) && /^\s*return 1$/m.test(body);
        if (rejects && /local LC_ALL=C/.test(body))
          pass('script:serializer-rejects-control', 'non-printable bytes (CR, LF, TAB, NUL-equivalent) are rejected under LC_ALL=C');
        else
          fail(
            'script:serializer-rejects-control',
            `the serializer must return non-zero for an argument containing a control character, with LC_ALL=C so [[:print:]] means ASCII (rejects=${rejects})`,
          );
      }

      // --- the remote argument contract
      if (!conRaw || !/^EXPECTED_ARGC=(\d+)$/m.test(conRaw)) {
        for (const c of [
          'script:remote-argc-check', 'script:remote-argc-matches-array', 'script:remote-arg-order',
          'script:remote-no-trailing-args', 'script:remote-marker-exact', 'script:remote-trust-exact',
          'script:remote-hosts-exact', 'script:remote-port-range', 'script:remote-contract-order',
        ]) fail(c, 'no remote argument contract (EXPECTED_ARGC) between the contract BEGIN/END markers; a shifted argument vector would be acted on');
      } else {
        const con = stripHashComments(conRaw);
        const argc = Number(con.match(/^EXPECTED_ARGC=(\d+)$/m)[1]);

        // The exact count check, and it must fail closed.
        const argcCheck = con.match(/^if \[ "\$#" -ne "\$EXPECTED_ARGC" \]; then\n\s*contract_fail /m);
        if (argcCheck) pass('script:remote-argc-check', `exact argument count asserted (${argc}) before any host mutation`);
        else fail('script:remote-argc-check', 'missing `if [ "$#" -ne "$EXPECTED_ARGC" ]; then contract_fail ...`; an argument shift would go unnoticed');

        if (argc === argNames.length)
          pass('script:remote-argc-matches-array', `EXPECTED_ARGC (${argc}) equals the REMOTE_ARGS length`);
        else
          fail('script:remote-argc-matches-array', `EXPECTED_ARGC is ${argc} but REMOTE_ARGS declares ${argNames.length} arguments; one of them is wrong and the deploy would be rejected on the host (or worse, accepted shifted)`);

        // Positional assignment order must equal the declared array order.
        const positional = [];
        for (const m of con.matchAll(/^([A-Za-z_][A-Za-z0-9_]*)="\$(?:(\d)|\{(\d+)\})"$/gm)) {
          positional[Number(m[2] ?? m[3]) - 1] = m[1];
        }
        const sameOrder =
          positional.length === argNames.length && positional.every((n, i) => n === argNames[i]);
        if (sameOrder) pass('script:remote-arg-order', `all ${argc} arguments are assigned in the declared order`);
        else
          fail(
            'script:remote-arg-order',
            `REMOTE_ARGS order and the remote positional assignments disagree.\n      declared: ${JSON.stringify(argNames)}\n      received: ${JSON.stringify(positional)}`,
          );

        const shiftM = con.match(/^shift (\d+)$/m);
        if (shiftM && Number(shiftM[1]) === argc && /^if \[ "\$#" -ne 0 \]; then\n\s*contract_fail /m.test(con))
          pass('script:remote-no-trailing-args', 'surplus positional arguments are rejected');
        else
          fail('script:remote-no-trailing-args', `after assignment the contract must \`shift ${argc}\` and reject a non-empty $# (shift=${shiftM ? shiftM[1] : 'absent'})`);

        // Expected values are literals INSIDE the quoted heredoc, so they cannot
        // be corrupted by the seam they check. They must still agree with the
        // configuration at the top of the script, and be compared with EXACT
        // equality - a prefix or substring test would have accepted "Your".
        const literal = (name) => {
          const m = con.match(new RegExp(`^${name}='([^']*)'$`, 'm'));
          return m ? m[1] : undefined;
        };
        // Exact `[ "$VALUE" = "$EXPECTED" ] || contract_fail`, matched as a
        // literal line. A `case ... in *substring*)` test would have accepted
        // the truncated "Your" and the shifted "Trusted", so nothing looser
        // than string equality counts here.
        const exactCmp = (v, name) => {
          const line = '[ "$' + v + '" = "$' + name + '" ] || \\\n';
          const i = con.indexOf(line);
          return i !== -1 && /^\s*contract_fail /.test(con.slice(i + line.length));
        };

        for (const [check, name, expected, varName, why] of [
          ['script:remote-marker-exact', 'EXPECTED_MARKER', HEALTH_MARKER, 'SSR_HEALTH_MARKER',
            'the word-split delivered the 4-byte prefix "Your", which a substring test accepts'],
          ['script:remote-trust-exact', 'EXPECTED_TRUST_PROXY', EXPECTED_TRUST, 'NG_TRUST_PROXY_HEADERS_VALUE',
            'the word-split delivered "Trusted", which @angular/ssr silently treats as trusting nothing'],
          ['script:remote-hosts-exact', 'EXPECTED_ALLOWED_HOSTS', EXPECTED_ALLOWLIST, 'NG_ALLOWED_HOSTS_VALUE',
            'a widened allowlist would let an unexpected Host reach SSR'],
        ]) {
          const lit = literal(name);
          if (lit === undefined) fail(check, `the contract does not declare ${name}='...'`);
          else if (lit !== expected)
            fail(check, `${name} is ${JSON.stringify(lit)} but this script configures ${JSON.stringify(expected)}; the host would reject every deploy`);
          else if (!exactCmp(varName, name))
            fail(check, `${varName} must be compared with EXACT equality ([ "$${varName}" = "$${name}" ] || contract_fail); ${why}`);
          else pass(check, `${name} matches the configured value and is compared exactly`);
        }

        const portOk = /case "\$SSR_PORT" in\n\s*''\|\*\[!0-9\]\*\) contract_fail/.test(con)
          && /\[ "\$SSR_PORT" -lt 1 \] \|\| \[ "\$SSR_PORT" -gt 65535 \]/.test(con);
        if (portOk) pass('script:remote-port-range', 'PORT validated as numeric within 1-65535');
        else fail('script:remote-port-range', 'the contract must reject a non-numeric PORT and one outside 1-65535');

        // Nothing may mutate the host before the contract has passed.
        const endIdx = raw.indexOf('# --- END remote argument contract ---');
        const mutators = [
          ['tar xzf', /^tar xzf /m],
          ['mkdir -p', /^mkdir -p /m],
          ['ln -sfn', /^ln -sfn /m],
          ['pm2 restart', /pm2 restart "\$PM2_APP"/],
        ];
        const early = mutators.filter(([, re]) => {
          const m = raw.match(re);
          return m && m.index < endIdx;
        });
        if (!early.length)
          pass('script:remote-contract-order', 'the contract is validated before unpack, symlink flip and pm2 restart');
        else
          fail(
            'script:remote-contract-order',
            `${early.map(([n]) => n).join(', ')} runs BEFORE the argument contract is validated; a shifted vector would already have changed the host`,
          );
      }

      // The evidence-suite banner must not hardcode a count that goes stale the
      // next time a check is added to the suite.
      if (/must be \d+\/\d+/.test(active))
        fail('script:no-stale-evidence-count', 'the evidence-suite log line hardcodes a "must be N/N" count; it goes stale silently whenever the suite grows');
      else pass('script:no-stale-evidence-count', 'no hardcoded evidence-suite count');
    }

    if (/https?:\/\/(www\.)?roaya\.co/.test(active))
      fail('script:health-origin-only', 'active code references the public roaya.co URL; the gate must probe the loopback upstream');
    else if (/"http:\/\/127\.0\.0\.1:\$SSR_PORT\/about"/.test(active))
      pass('script:health-origin-only', 'probes 127.0.0.1 upstream');
    else fail('script:health-origin-only', 'the gate must request http://127.0.0.1:$SSR_PORT/about');
  }
}

// ---------------------------------------------------------------------------
// 3b. nginx template: SSR locations must overwrite X-Forwarded-For
// ---------------------------------------------------------------------------
// @angular/ssr TRUSTS X-Forwarded-For (see NG_TRUST_PROXY_HEADERS), so an
// appended client chain must never reach it. /api/ is out of scope here and
// must keep its existing behaviour.
{
  const raw = read(NGINX);
  if (!raw) {
    fail('nginx:exists', `${NGINX} is missing`);
  } else {
    const active = stripHashComments(raw);
    // Slice each location block by brace depth so a directive in one location
    // can never satisfy an assertion about another.
    // Collect every `location ... {` block, then pick by content. NOTE: there
    // are two `location / {` blocks (the :80 redirect server and the SSR
    // server), so selecting by name alone picks the wrong one.
    const allBlocks = [];
    const locRe = /^ {4}location ([^\n{]+)\{$/gm;
    let lm;
    while ((lm = locRe.exec(active))) {
      const rest = active.slice(lm.index);
      const end = rest.indexOf('\n    }');
      allBlocks.push({ name: `location ${lm[1].trim()}`, body: end === -1 ? rest : rest.slice(0, end) });
    }
    // Three SSR proxy locations: `location /`, `location @ssr`, and
    // `location = /sitemap.xml` (the sitemap is served by an Express route
    // that merges the static base with published blog URLs — see
    // docs/deploy/RUNTIME-ENV.md, NG_SSR_API_ORIGIN).
    const EXPECTED_SSR_LOCATIONS = 3;
    const ssrBlocks = allBlocks
      .filter((b) => /proxy_pass http:\/\/roaya_ssr;/.test(b.body))
      .map((b) => [b.name, b.body]);
    if (ssrBlocks.length !== EXPECTED_SSR_LOCATIONS)
      fail('nginx:ssr-xff', `expected ${EXPECTED_SSR_LOCATIONS} SSR proxy locations, found ${ssrBlocks.length}`);
    let ok = 0;
    for (const [label, block] of ssrBlocks) {
      if (!block) {
        fail('nginx:ssr-xff', `could not locate the ${label} block`);
        continue;
      }
      if (/proxy_add_x_forwarded_for/.test(block)) {
        fail(
          'nginx:ssr-xff',
          `${label} still forwards $proxy_add_x_forwarded_for; @angular/ssr trusts X-Forwarded-For, so an appended client-supplied chain would reach a trusted header`,
        );
      } else if (/proxy_set_header X-Forwarded-For \$remote_addr;/.test(block)) {
        ok++;
      } else {
        fail('nginx:ssr-xff', `${label} does not set X-Forwarded-For to $remote_addr`);
      }
      // The other forwarded headers the app and gate depend on must stay.
      for (const [h, re] of [
        ['Host', /proxy_set_header Host \$host;/],
        ['X-Forwarded-Proto', /proxy_set_header X-Forwarded-Proto \$scheme;/],
        ['X-Real-IP', /proxy_set_header X-Real-IP \$remote_addr;/],
      ]) {
        if (!re.test(block)) fail('nginx:ssr-headers', `${label} no longer sets ${h}`);
      }
    }
    if (ok === EXPECTED_SSR_LOCATIONS) pass('nginx:ssr-xff', 'all SSR locations overwrite X-Forwarded-For with $remote_addr');
    if (!failures.some((f) => f.check === 'nginx:ssr-headers'))
      pass('nginx:ssr-headers', 'Host / X-Forwarded-Proto / X-Real-IP retained in all SSR locations');

    // /api/ must be untouched by this change.
    const api = (() => {
      const i = active.search(/^ {4}location \^~ \/api\/ \{$/m);
      if (i === -1) return null;
      const rest = active.slice(i);
      const end = rest.indexOf('\n    }');
      return end === -1 ? rest : rest.slice(0, end);
    })();
    if (!api) fail('nginx:api-untouched', 'could not locate the /api/ block');
    else if (/proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;/.test(api))
      pass('nginx:api-untouched', '/api/ keeps $proxy_add_x_forwarded_for (out of scope)');
    else
      fail('nginx:api-untouched', '/api/ X-Forwarded-For changed; this task must not alter backend proxy behaviour');
  }
}

// ---------------------------------------------------------------------------
// 4. No forbidden host in any literal production allowlist
// ---------------------------------------------------------------------------
{
  const sources = [
    [ECOSYSTEM, read(ECOSYSTEM), stripSlashComments],
    [SERVICE, read(SERVICE), stripHashComments],
    [SCRIPT, read(SCRIPT), stripHashComments],
  ];
  let bad = 0;
  for (const [name, rawText, strip] of sources) {
    if (!rawText) continue;
    const activeText = strip(rawText);
    const values = [...activeText.matchAll(/NG_ALLOWED_HOSTS(?:_VALUE)?\s*[:=]\s*['"]?([A-Za-z0-9.,:*_-]+)['"]?/g)].map((m) => m[1]);
    for (const v of values) {
      if (v.startsWith('$')) continue;
      const h = hosts(v);
      // The development env block is the one legitimate loopback location.
      const isDevLoopback = name === ECOSYSTEM && v === EXPECTED_DEV_ALLOWLIST;
      if (isDevLoopback) continue;
      for (const x of h) {
        if (x === '*' || LOOPBACK_HOSTS.includes(x)) {
          fail('allowlist:forbidden-host', `${name} lists forbidden host "${x}" in "${v}"`);
          bad++;
        }
      }
      const extra = h.filter((x) => !EXPECTED_HOSTS.includes(x));
      if (extra.length) {
        fail('allowlist:unexpected-host', `${name} lists unexpected host(s) ${JSON.stringify(extra)} in "${v}"`);
        bad++;
      }
    }
  }
  if (bad === 0) pass('allowlist:forbidden-host', 'no wildcard/loopback host in any production allowlist');
}

// ---------------------------------------------------------------------------
// 5. Documentation
// ---------------------------------------------------------------------------
{
  const doc = read(DOC);
  if (!doc) {
    fail('docs:exists', `${DOC} is missing`);
  } else {
    const need = [
      [`NG_ALLOWED_HOSTS=${EXPECTED_ALLOWLIST}`, 'the required production value'],
      ['proxy_set_header Host $host', 'that nginx must forward the real Host'],
      ['Host: roaya.co', 'that local health checks send an allowlisted Host'],
      ['NG_TRUST_PROXY_HEADERS', 'that NG_TRUST_PROXY_HEADERS is intentionally unset'],
      ['not atomic', 'that activation is not atomic'],
      ['manual', 'that rollback is manual/attended'],
    ];
    let missing = 0;
    for (const [needle, why] of need) {
      if (!doc.includes(needle)) {
        fail('docs:content', `${DOC} does not document ${why} (missing "${needle}")`);
        missing++;
      }
    }
    if (!missing) pass('docs:content', `${DOC} documents the full contract`);

    // Line-level, not document-level: a disclaimer elsewhere must not excuse a
    // positive claim here. Any line mentioning atomicity/zero-downtime has to
    // carry its own negation.
    {
      const claims = doc
        .split('\n')
        .filter((l) => /\b(atomic|zero[- ]downtime)\b/i.test(l))
        .filter((l) => !/\b(not|never|neither|non-atomic|isn't|nor)\b/i.test(l));
      if (claims.length)
        fail('docs:no-atomic-claim', `${DOC} claims atomicity without negation: ${JSON.stringify(claims[0].trim().slice(0, 80))}`);
      else pass('docs:no-atomic-claim', 'no unqualified atomicity claim');
    }
  }

  // Every docs/deploy/*.md referenced by the files this guard owns must exist.
  let dangling = 0;
  for (const rel of DOC_REF_SOURCES) {
    const text = read(rel);
    if (!text) continue;
    for (const m of text.matchAll(/docs\/deploy\/[A-Za-z0-9._-]+\.md/g)) {
      if (!existsSync(join(ROOT, m[0]))) {
        fail('docs:references', `${rel} references missing ${m[0]}`);
        dangling++;
      }
    }
  }
  if (!dangling) pass('docs:references', 'every docs/deploy/*.md reference in the owned files resolves');
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log('Deployment runtime-config guard');
console.log('='.repeat(60));
for (const p of passes) console.log(`✓ [PASS] ${p.check} — ${p.detail}`);
for (const f of failures) console.log(`✗ [FAIL] ${f.check} — ${f.detail}`);
console.log('='.repeat(60));
console.log(`${passes.length} passed, ${failures.length} failed.`);

if (failures.length) {
  console.log('\nSee docs/deploy/RUNTIME-ENV.md for the required runtime contract.');
  process.exit(1);
}
process.exit(0);
