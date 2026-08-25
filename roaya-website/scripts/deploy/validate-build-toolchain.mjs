#!/usr/bin/env node
/**
 * Build-toolchain pin guard.
 *
 * @angular/build and @angular/cli are pinned to EXACTLY 21.2.13 because
 * 21.2.14+ hangs after a successful one-shot `ng build`:
 *
 *   angular/angular-cli#33497 — "ng build hangs after a successful build on
 *   @angular/build 21.2.14–21.2.18 (regression from #33267)"
 *
 * PR #33267 moved one-shot builds from `esbuild.build()` to
 * `esbuild.context()` + `.rebuild()`, which exposed a context-teardown race:
 * the build finishes and prints `Output location:`, but the esbuild service
 * child process is never released, so the parent's event loop never drains and
 * `ng build` never exits. Locally reproduced on 21.2.21 with a single ref'd
 * ChildProcess handle for the platform `@esbuild` service binary, and zero timers
 * or sockets; killing only that child made the parent exit 0 immediately.
 *
 * A hanging build is not a cosmetic annoyance here: deploy/scripts/deploy-ssr.sh
 * builds before it ships, so the hang blocks the entire release path. Raising
 * the pin without re-verifying a natural exit will silently re-break deploys.
 *
 * See docs/deploy/BUILD-TOOLCHAIN.md. Verify any change with
 * `npm run test:build-exit`.
 *
 * Static, offline, deterministic. Run: npm run test:build-toolchain
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// BUILD_TOOLCHAIN_ROOT lets the self-test point this guard at a mutated copy.
const ROOT = process.env['BUILD_TOOLCHAIN_ROOT']
  ? resolve(process.env['BUILD_TOOLCHAIN_ROOT'])
  : join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const PINNED = '21.2.13';
const PACKAGES = ['@angular/build', '@angular/cli'];
const UPSTREAM = 'angular/angular-cli#33497';
const DOC = 'docs/deploy/BUILD-TOOLCHAIN.md';

const failures = [];
const passes = [];
const fail = (c, d) => failures.push({ check: c, detail: d });
const pass = (c, d) => passes.push({ check: c, detail: d });

const readJson = (rel) => {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    fail(`${rel}:parse`, `could not parse: ${err.message}`);
    return null;
  }
};

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');

if (!pkg) fail('package.json:exists', 'package.json missing or unparseable');
if (!lock) fail('package-lock.json:exists', 'package-lock.json missing or unparseable');

for (const name of PACKAGES) {
  const short = name.replace('@angular/', '');

  // --- 1. declaration must be the exact version, no range operator ---------
  if (pkg) {
    const inDeps = pkg.dependencies?.[name];
    const inDev = pkg.devDependencies?.[name];
    const declared = inDeps ?? inDev;
    if (declared === undefined) {
      fail(`declare:${short}`, `${name} is not declared in package.json`);
    } else if (declared === PINNED) {
      pass(`declare:${short}`, `exactly ${PINNED} (${inDeps !== undefined ? 'dependencies' : 'devDependencies'})`);
    } else if (/^[\^~>=<]|\s|\|\||x|\*/.test(declared)) {
      fail(
        `declare:${short}`,
        `${name} must be the exact version "${PINNED}" with no range operator, got "${declared}". A range lets 21.2.14+ back in, which hangs after a successful build (${UPSTREAM}).`,
      );
    } else {
      fail(
        `declare:${short}`,
        `${name} must be exactly "${PINNED}", got "${declared}". Do not raise this pin without proving a natural build exit (npm run test:build-exit) — see ${UPSTREAM}.`,
      );
    }
  }

  // --- 2. lockfile must resolve to the same exact version -----------------
  if (lock) {
    const entry = lock.packages?.[`node_modules/${name}`];
    if (!entry) {
      fail(`lock:${short}`, `no lockfile entry for node_modules/${name}`);
    } else if (entry.version === PINNED) {
      pass(`lock:${short}`, `resolved ${PINNED}`);
    } else {
      fail(`lock:${short}`, `lockfile resolves ${name} to ${entry.version}, expected ${PINNED}`);
    }

    // Declaration and lock must agree with each other, not just with PINNED.
    const declared = pkg?.dependencies?.[name] ?? pkg?.devDependencies?.[name];
    if (declared !== undefined && entry && declared !== entry.version) {
      fail(
        `sync:${short}`,
        `package.json declares "${declared}" but the lockfile resolves "${entry.version}" — run npm install to reconcile`,
      );
    } else if (declared !== undefined && entry) {
      pass(`sync:${short}`, 'declaration and lockfile agree');
    }
  }
}

// --- 3. no installed copy may be anything other than the pin --------------
// Skipped when node_modules is absent (e.g. inside the self-test's temp tree).
{
  const nm = join(ROOT, 'node_modules');
  if (!existsSync(nm)) {
    pass('installed:skip', 'node_modules absent — install check skipped');
  } else {
    const found = [];
    const seek = (dir, depth) => {
      if (depth > 6) return;
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const p = join(dir, e.name);
        if (e.name === '@angular') {
          for (const name of PACKAGES) {
            const short = name.split('/')[1];
            const pj = join(p, short, 'package.json');
            if (existsSync(pj)) {
              try {
                found.push({ name, version: JSON.parse(readFileSync(pj, 'utf8')).version, path: pj });
              } catch {}
            }
          }
        }
        if (e.name === 'node_modules' || e.name.startsWith('@') || depth < 3) seek(p, depth + 1);
      }
    };
    seek(nm, 0);

    for (const name of PACKAGES) {
      const short = name.replace('@angular/', '');
      const copies = found.filter((f) => f.name === name);
      if (!copies.length) {
        fail(`installed:${short}`, `${name} is not installed`);
        continue;
      }
      const bad = copies.filter((c) => c.version !== PINNED);
      if (bad.length) {
        fail(
          `installed:${short}`,
          `installed copies not at ${PINNED}: ${bad.map((b) => `${b.version} (${b.path.replace(ROOT + '/', '')})`).join(', ')}`,
        );
      } else if (copies.length > 1) {
        pass(`installed:${short}`, `${copies.length} copies, all ${PINNED}`);
      } else {
        pass(`installed:${short}`, PINNED);
      }
    }
  }
}

// --- 4. the reason must stay documented ----------------------------------
{
  const doc = existsSync(join(ROOT, DOC)) ? readFileSync(join(ROOT, DOC), 'utf8') : null;
  if (!doc) {
    fail('docs:exists', `${DOC} is missing — the pin must stay explained or someone will "tidy" it away`);
  } else {
    const need = [
      ['33497', 'the upstream issue number'],
      [PINNED, 'the pinned version'],
      ['esbuild', 'the esbuild service child mechanism'],
    ];
    const missing = need.filter(([n]) => !doc.includes(n));
    if (missing.length) fail('docs:content', `${DOC} does not mention ${missing.map(([, w]) => w).join(', ')}`);
    else pass('docs:content', `${DOC} documents the pin and ${UPSTREAM}`);
  }
}

console.log('Build-toolchain pin guard');
console.log('='.repeat(60));
for (const p of passes) console.log(`✓ [PASS] ${p.check} — ${p.detail}`);
for (const f of failures) console.log(`✗ [FAIL] ${f.check} — ${f.detail}`);
console.log('='.repeat(60));
console.log(`${passes.length} passed, ${failures.length} failed.`);
if (failures.length) {
  console.log(`\n${UPSTREAM}: @angular/build 21.2.14+ never exits after a successful one-shot build.`);
  console.log(`See ${DOC}. Prove any pin change with: npm run test:build-exit`);
  process.exit(1);
}
process.exit(0);
