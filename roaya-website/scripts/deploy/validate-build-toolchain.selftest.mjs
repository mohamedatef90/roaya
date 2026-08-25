#!/usr/bin/env node
/**
 * Self-test for scripts/deploy/validate-build-toolchain.mjs.
 *
 * Copies package.json / package-lock.json / the doc into a temp tree, seeds one
 * regression at a time, and asserts the guard rejects it FOR THE INTENDED
 * REASON. Offline, deterministic, never mutates the repository.
 *
 * Run: npm run test:build-toolchain:selftest
 */
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const GUARD = join(HERE, 'validate-build-toolchain.mjs');
const FILES = ['package.json', 'package-lock.json', 'docs/deploy/BUILD-TOOLCHAIN.md'];

function makeTree() {
  const dir = mkdtempSync(join(tmpdir(), 'roaya-toolchain-'));
  for (const rel of FILES) {
    const dest = join(dir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(ROOT, rel), dest);
  }
  return dir;
}

function runGuard(root) {
  let out = '', code = 0;
  try {
    out = execFileSync(process.execPath, [GUARD], {
      env: { ...process.env, BUILD_TOOLCHAIN_ROOT: root },
      encoding: 'utf8',
    });
  } catch (err) {
    out = err.stdout || '';
    code = err.status ?? 1;
  }
  return { code, fails: [...out.matchAll(/✗ \[FAIL\] (\S+)/g)].map((m) => m[1]) };
}

const editPkg = (root, fn) => {
  const p = join(root, 'package.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  fn(j);
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
};
const editLock = (root, fn) => {
  const p = join(root, 'package-lock.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  fn(j);
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
};

const mutations = [
  ['declaration bumped to the first broken version 21.2.14', 'declare:build',
    (r) => editPkg(r, (j) => { j.devDependencies['@angular/build'] = '21.2.14'; })],
  ['declaration bumped to 21.2.21 (the version we reproduced the hang on)', 'declare:build',
    (r) => editPkg(r, (j) => { j.devDependencies['@angular/build'] = '21.2.21'; })],
  ['caret range reintroduced (^21.2.13)', 'declare:build',
    (r) => editPkg(r, (j) => { j.devDependencies['@angular/build'] = '^21.2.13'; })],
  ['tilde range reintroduced (~21.2.13)', 'declare:cli',
    (r) => editPkg(r, (j) => { j.devDependencies['@angular/cli'] = '~21.2.13'; })],
  ['cli declaration bumped to 21.2.21', 'declare:cli',
    (r) => editPkg(r, (j) => { j.devDependencies['@angular/cli'] = '21.2.21'; })],
  ['lock entry removed', 'lock:build',
    (r) => editLock(r, (j) => { delete j.packages['node_modules/@angular/build']; })],
  ['lock resolves a different version than declared', 'lock:build',
    (r) => editLock(r, (j) => { j.packages['node_modules/@angular/build'].version = '21.2.19'; })],
  ['declaration/lock mismatch (declaration moved, lock left behind)', 'sync:cli',
    (r) => { editPkg(r, (j) => { j.devDependencies['@angular/cli'] = '21.2.20'; }); }],
  ['pin rationale doc deleted', 'docs:exists',
    (r) => rmSync(join(r, 'docs/deploy/BUILD-TOOLCHAIN.md'))],
  ['doc no longer cites the upstream issue', 'docs:content',
    (r) => {
      const p = join(r, 'docs/deploy/BUILD-TOOLCHAIN.md');
      writeFileSync(p, readFileSync(p, 'utf8').split('33497').join('XXXXX'));
    }],
];

let failed = 0;
{
  const root = makeTree();
  const { code } = runGuard(root);
  rmSync(root, { recursive: true, force: true });
  if (code === 0) console.log('✓ baseline: pinned toolchain passes');
  else { console.log(`✗ baseline FAILED (exit ${code})`); failed++; }
}

for (const [name, expected, apply] of mutations) {
  const root = makeTree();
  let res;
  try { apply(root); res = runGuard(root); }
  catch (err) { console.log(`✗ ${name}\n    fixture error: ${err.message}`); rmSync(root, { recursive: true, force: true }); failed++; continue; }
  rmSync(root, { recursive: true, force: true });
  if (res.code === 0) { console.log(`✗ ${name}\n    guard did NOT reject this regression`); failed++; }
  else if (!res.fails.includes(expected)) {
    console.log(`✗ ${name}\n    rejected, but NOT for the intended reason\n    expected: ${expected}\n    actual:   ${res.fails.join(', ') || '(none)'}`);
    failed++;
  } else console.log(`✓ ${name} — rejected by ${expected}`);
}

const total = mutations.length + 1;
console.log('='.repeat(60));
if (failed) { console.log(`${total - failed}/${total} checks passed, ${failed} failed.`); process.exit(1); }
console.log(`All ${total} checks passed — every seeded toolchain regression is rejected for its intended reason.`);
process.exit(0);
