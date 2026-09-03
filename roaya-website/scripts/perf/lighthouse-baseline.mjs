#!/usr/bin/env node
/**
 * Lighthouse baseline under one agreed, pinned profile.
 *
 * The 2026-09-02 action plan sets LCP and TBT milestones but says the numbers
 * only mean something "under an agreed, repeatable mobile test profile,
 * retained as a release artifact". Two runs on different profiles are not
 * comparable, and a number nobody kept is not a baseline. This script fixes
 * the profile, writes the artifact, and prints the comparison.
 *
 * Usage:
 *   node scripts/perf/lighthouse-baseline.mjs                 # local production build
 *   node scripts/perf/lighthouse-baseline.mjs --url=https://roaya.co/
 *   node scripts/perf/lighthouse-baseline.mjs --url=... --gate # non-zero exit if a milestone is missed
 *
 * Measure PRODUCTION for a number that means anything. The local server does
 * not gzip — nginx does that in production — so a local run reports roughly
 * 1.8 MB of "enable text compression" savings that do not exist for real
 * users, and its LCP is correspondingly wrong.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const repoRoot = join(root, '..');

/**
 * The agreed profile. Changing any of this invalidates comparison with every
 * previous run, so change it deliberately and say so in the artifact.
 */
const PROFILE = {
  lighthouseVersion: '12',
  formFactor: 'mobile',
  throttlingMethod: 'simulate',
  categories: ['performance', 'accessibility', 'seo', 'best-practices'],
};

/** Milestones from the action plan, in order. */
const MILESTONES = [
  { name: 'first two weeks', lcpSeconds: 4.0, tbtMs: 800 },
  { name: '30 days', lcpSeconds: 3.0, tbtMs: 300 },
  { name: '90 days', lcpSeconds: 2.5, tbtMs: 200 },
];

const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith('--url='))?.slice('--url='.length);
const gate = args.includes('--gate');
const targetUrl = urlArg ?? 'http://127.0.0.1:4500/';

const chromePath =
  process.env.CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
if (chromePath && !existsSync(chromePath)) {
  console.error(`Chrome not found at ${chromePath}. Set CHROME_PATH to your Chrome binary.`);
  process.exit(2);
}

const outDir = join(repoRoot, 'memory-bank', 'Audit', 'performance');
mkdirSync(outDir, { recursive: true });
const host = new URL(targetUrl).host.replace(/[^a-z0-9.-]/gi, '_');
const stamp = new Date().toISOString().slice(0, 10);
const jsonPath = join(outDir, `${stamp}-${host}.json`);

console.log(`Lighthouse ${PROFILE.lighthouseVersion} · ${PROFILE.formFactor} · ${PROFILE.throttlingMethod}`);
console.log(`Target: ${targetUrl}`);

const result = spawnSync(
  'npx',
  [
    '-y',
    `lighthouse@${PROFILE.lighthouseVersion}`,
    targetUrl,
    `--form-factor=${PROFILE.formFactor}`,
    '--screenEmulation.mobile',
    `--throttling-method=${PROFILE.throttlingMethod}`,
    `--only-categories=${PROFILE.categories.join(',')}`,
    '--output=json',
    `--output-path=${jsonPath}`,
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--quiet',
  ],
  { stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, CHROME_PATH: chromePath } },
);
if (result.status !== 0 || !existsSync(jsonPath)) {
  console.error('Lighthouse run failed.');
  process.exit(result.status || 1);
}

const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
const metric = (id) => report.audits[id];
const lcpSeconds = (metric('largest-contentful-paint')?.numericValue ?? 0) / 1000;
const tbtMs = metric('total-blocking-time')?.numericValue ?? 0;

const opportunities = Object.values(report.audits)
  .filter((a) => a.details?.type === 'opportunity' && a.numericValue > 0)
  .sort((a, b) => b.numericValue - a.numericValue)
  .slice(0, 8);

const met = MILESTONES.filter((m) => lcpSeconds <= m.lcpSeconds && tbtMs <= m.tbtMs);
const nextMilestone = MILESTONES.find((m) => !met.includes(m));

const lines = [
  `# Lighthouse baseline — ${targetUrl}`,
  '',
  `**Run:** ${stamp}  `,
  `**Profile:** Lighthouse ${PROFILE.lighthouseVersion}, ${PROFILE.formFactor}, ${PROFILE.throttlingMethod} throttling, categories: ${PROFILE.categories.join(', ')}  `,
  `**Raw report:** \`${jsonPath.replace(repoRoot + '/', '')}\``,
  '',
  '## Scores',
  '',
  '| Category | Score |',
  '|---|---:|',
  ...Object.entries(report.categories).map(([k, v]) => `| ${v.title ?? k} | ${Math.round(v.score * 100)} |`),
  '',
  '## Core metrics against the action-plan milestones',
  '',
  '| Metric | Measured | First two weeks | 30 days | 90 days |',
  '|---|---:|---:|---:|---:|',
  `| LCP | ${metric('largest-contentful-paint')?.displayValue ?? 'n/a'} | ≤ 4.0 s | ≤ 3.0 s | ≤ 2.5 s |`,
  `| TBT | ${metric('total-blocking-time')?.displayValue ?? 'n/a'} | ≤ 800 ms | ≤ 300 ms | ≤ 200 ms |`,
  `| CLS | ${metric('cumulative-layout-shift')?.displayValue ?? 'n/a'} | — | — | — |`,
  `| FCP | ${metric('first-contentful-paint')?.displayValue ?? 'n/a'} | — | — | — |`,
  '',
  nextMilestone
    ? `**Next milestone not met:** ${nextMilestone.name} (LCP ≤ ${nextMilestone.lcpSeconds} s, TBT ≤ ${nextMilestone.tbtMs} ms).`
    : '**All milestones met.**',
  '',
  '## Largest opportunities',
  '',
  '| Opportunity | Estimated saving |',
  '|---|---|',
  ...opportunities.map((a) => `| ${a.title} | ${a.displayValue ?? ''} |`),
  '',
];

const mdPath = join(outDir, `${stamp}-${host}.md`);
writeFileSync(mdPath, lines.join('\n'));

console.log('');
for (const [k, v] of Object.entries(report.categories)) {
  console.log(`  ${(v.title ?? k).padEnd(16)} ${Math.round(v.score * 100)}`);
}
console.log(`  LCP ${lcpSeconds.toFixed(1)} s · TBT ${Math.round(tbtMs)} ms`);
console.log(`\nArtifact: ${mdPath.replace(repoRoot + '/', '')}`);

if (gate && nextMilestone === MILESTONES[0]) {
  console.error(`\nFAIL: the first milestone (LCP ≤ 4.0 s, TBT ≤ 800 ms) is not met.`);
  process.exit(1);
}
