#!/usr/bin/env node
/**
 * Red-capable self-test for validate-llms-txt.mjs: proves each check actually
 * fails on a broken input, not just passes on the current good state.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  validateLlmsTxt,
  validateVercelLlmsContentType,
  findPricingAssertions,
} from './validate-llms-txt.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');
const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
const vercelConfigJson = readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8');

let failures = 0;

function check(name, condition) {
  if (!condition) {
    console.error(`✗ ${name}`);
    failures += 1;
  } else {
    console.log(`✓ ${name}`);
  }
}

// Baseline: current committed files must pass clean.
{
  const { errors } = validateLlmsTxt({ llmsTxt, sitemapXml });
  check('baseline llms.txt passes with zero errors', errors.length === 0);
}
{
  const { errors } = validateVercelLlmsContentType(vercelConfigJson);
  check('baseline vercel.json passes with zero errors', errors.length === 0);
}

// Mutation: non-canonical origin must be rejected.
{
  const mutated = llmsTxt.replace('https://roaya.co/about', 'http://roaya.co/about');
  const { errors } = validateLlmsTxt({ llmsTxt: mutated, sitemapXml });
  check(
    'non-canonical (http) origin is rejected',
    errors.some((e) => e.includes('Non-canonical origin')),
  );
}

// Mutation: a link not present in the sitemap must be rejected.
{
  const mutated = llmsTxt.replace(
    'https://roaya.co/about',
    'https://roaya.co/about-not-a-real-route',
  );
  const { errors } = validateLlmsTxt({ llmsTxt: mutated, sitemapXml });
  check(
    'a URL absent from sitemap.xml is rejected',
    errors.some((e) => e.includes('not a canonical, sitemap-registered route')),
  );
}

// Mutation: a duplicated link must be rejected.
{
  const mutated = `${llmsTxt}\n- [dup](https://roaya.co/about)\n`;
  const { errors } = validateLlmsTxt({ llmsTxt: mutated, sitemapXml });
  check(
    'a duplicated URL is rejected',
    errors.some((e) => e.includes('Duplicate URL')),
  );
}

// Mutation: reintroducing each prohibited pricing pattern must be caught.
const pricingMutations = [
  '$1.50/user/month',
  'Enterprise-grade solutions starting at $1.50 per user per month.',
  'no public price list is published',
  'Our price range varies by contract.',
];
for (const mutation of pricingMutations) {
  const findings = findPricingAssertions(`${llmsTxt}\n${mutation}\n`);
  check(`pricing assertion is caught: "${mutation}"`, findings.length > 0);
}

// Mutation: removing the /llms.txt Content-Type rule from vercel.json must be caught.
{
  const config = JSON.parse(vercelConfigJson);
  config.headers = config.headers.filter((rule) => rule.source !== '/llms.txt');
  const { errors } = validateVercelLlmsContentType(JSON.stringify(config));
  check(
    'missing /llms.txt header rule in vercel.json is rejected',
    errors.some((e) => e.includes('no header rule for source "/llms.txt"')),
  );
}

// Mutation: wrong Content-Type value on the /llms.txt rule must be caught.
{
  const config = JSON.parse(vercelConfigJson);
  const rule = config.headers.find((r) => r.source === '/llms.txt');
  rule.headers.find((h) => h.key === 'Content-Type').value = 'application/octet-stream';
  const { errors } = validateVercelLlmsContentType(JSON.stringify(config));
  check(
    'wrong /llms.txt Content-Type value in vercel.json is rejected',
    errors.some((e) => e.includes('Content-Type must be')),
  );
}

// Mutation: invalid JSON in vercel.json must be caught.
{
  const { errors } = validateVercelLlmsContentType('{ not valid json');
  check('invalid vercel.json is rejected', errors.some((e) => e.includes('not valid JSON')));
}

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — validator is not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — validator correctly rejects every mutated input.');
}
