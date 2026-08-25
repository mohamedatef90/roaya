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
const PORT_PLACEHOLDER = '__SSR_PORT__';

const ECOSYSTEM = 'deploy/pm2/ecosystem.config.js';
const SERVICE = 'deploy/systemd/roaya-ssr.service';
const SCRIPT = 'deploy/scripts/deploy-ssr.sh';
const DOC = 'docs/deploy/RUNTIME-ENV.md';
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

      for (const [label, env] of [['prod', prod], ['dev', dev]]) {
        if ('NG_TRUST_PROXY_HEADERS' in env)
          fail(`ecosystem:${label}-NG_TRUST_PROXY_HEADERS`, 'must remain UNSET');
        else pass(`ecosystem:${label}-NG_TRUST_PROXY_HEADERS`, 'unset');
      }
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

    if (/^Environment=NG_TRUST_PROXY_HEADERS=/m.test(active))
      fail('systemd:NG_TRUST_PROXY_HEADERS', 'must remain UNSET');
    else pass('systemd:NG_TRUST_PROXY_HEADERS', 'unset');
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

    if (/ssh[\s\S]{0,600}?"\$NG_ALLOWED_HOSTS_VALUE"/.test(active))
      pass('script:allowlist-passed', 'passed to the remote block as an argument');
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
    if (/export\s+NG_TRUST_PROXY_HEADERS=/.test(active) || /NG_TRUST_PROXY_HEADERS=\S/.test(active))
      fail('script:NG_TRUST_PROXY_HEADERS', 'must remain UNSET');
    else pass('script:NG_TRUST_PROXY_HEADERS', 'unset');

    if (/https?:\/\/(www\.)?roaya\.co/.test(active))
      fail('script:health-origin-only', 'active code references the public roaya.co URL; the gate must probe the loopback upstream');
    else if (/"http:\/\/127\.0\.0\.1:\$SSR_PORT\/about"/.test(active))
      pass('script:health-origin-only', 'probes 127.0.0.1 upstream');
    else fail('script:health-origin-only', 'the gate must request http://127.0.0.1:$SSR_PORT/about');
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
