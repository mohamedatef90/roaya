#!/usr/bin/env node
/**
 * One reproducible local AI-readiness verification command (TIFO-16).
 *
 * Orchestrates existing validators (llms.txt, claim-evidence registry) plus
 * dedicated deterministic checks over robots/sitemap/route-metadata/JSON-LD/
 * case-study routing/production-build output. Emits a human-readable
 * summary to stdout and a stable, sorted, timestamp-free JSON report to
 * scripts/ai-readiness/report.json. Exits non-zero if any check fails.
 *
 * Usage: node scripts/ai-readiness/check.mjs [--json]
 *   --json   also print the JSON report to stdout instead of the file path.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ALL_CHECKS } from './checks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const ctx = {
  root,
  publicDir: join(root, 'public'),
  srcApp: join(root, 'src/app'),
  claimEvidenceDir: join(__dirname, '..', 'claim-evidence'),
  browserDistDir: join(root, 'dist/roaya-website/browser'),
  serverEntryFile: join(root, 'dist/roaya-website/server/server.mjs'),
  origin: 'https://roaya.co',
  // Fixed, deterministic base port dedicated to this check — not randomized,
  // so report output never varies run-to-run because of port selection. The
  // SSR checks each boot their own server: real-unknown-route-404 on
  // serverPort, ssr-content-quality on +1, ssr-crawler-semantics on +2.
  serverPort: 42417,
};

async function main() {
  const results = [];
  for (const check of ALL_CHECKS) {
    // eslint-disable-next-line no-await-in-loop
    const result = await check(ctx);
    results.push(result);
  }

  // Deterministic order regardless of ALL_CHECKS iteration/import order.
  results.sort((a, b) => a.id.localeCompare(b.id));

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    skipped: results.filter((r) => r.status === 'skip').length,
  };

  const report = {
    version: 1,
    summary,
    checks: results,
  };

  const reportPath = join(__dirname, 'report.json');
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const statusIcon = { pass: '✓', fail: '✗', skip: '○' };
  console.log('AI-readiness verification (TIFO-16)');
  console.log('='.repeat(60));
  for (const result of results) {
    console.log(`${statusIcon[result.status]} [${result.status.toUpperCase()}] ${result.id} — ${result.title}`);
    if (result.status === 'pass' && result.details) {
      console.log(`    ${result.details}`);
    }
    if (result.status === 'skip') {
      console.log(`    ${result.details}`);
    }
    if (result.status === 'fail') {
      for (const error of result.errors) {
        console.log(`    - ${error}`);
      }
    }
  }
  console.log('='.repeat(60));
  console.log(
    `${summary.passed}/${summary.total} passed, ${summary.failed} failed, ${summary.skipped} skipped.`,
  );
  console.log(`JSON report: ${reportPath}`);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  }

  // A skip is an unrun check, not a passing one. The gates that read the
  // rendered HTML skip themselves when dist/ is absent, so without this a
  // `verify:evidence` on a stale or missing build reports all-green while the
  // checks written to catch the production failures never executed. The deploy
  // script builds first, so it is unaffected; `--allow-skips` is for a local
  // run that deliberately skips the build.
  const allowSkips = process.argv.includes('--allow-skips');
  if (summary.skipped > 0 && !allowSkips) {
    console.log(
      `\n${summary.skipped} check(s) did not run. They are not passes: build first ` +
        '("npm run build:prod"), or pass --allow-skips to accept the gap.',
    );
  }

  process.exitCode = summary.failed > 0 || (summary.skipped > 0 && !allowSkips) ? 1 : 0;
}

main();
