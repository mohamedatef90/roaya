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
  validateNginxMachineFileContentTypes,
  findPricingAssertions,
} from './validate-llms-txt.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');
const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
const nginxConf = readFileSync(
  join(__dirname, '..', 'deploy', 'nginx', 'roaya-website.conf'),
  'utf8',
);

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
  const { errors } = validateNginxMachineFileContentTypes(nginxConf);
  check('baseline nginx config passes with zero errors', errors.length === 0);
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

// Mutation: removing the `location = /llms.txt` block entirely must be caught.
{
  const mutated = nginxConf.replace(
    /location\s*=\s*\/llms\.txt\s*\{[\s\S]*?\n\s*\}/,
    '',
  );
  const { errors } = validateNginxMachineFileContentTypes(mutated);
  check(
    'missing `location = /llms.txt` block in nginx config is rejected',
    errors.some((e) => e.includes('no `location = /llms.txt` block')),
  );
}

// Mutation: dropping just the default_type from the /llms.txt block must be
// caught — the block still exists, so a block-presence check alone would miss
// this and nginx would fall back to a charset-less content type.
{
  const mutated = nginxConf.replace(
    /(location\s*=\s*\/llms\.txt\s*\{[\s\S]*?)\n\s*default_type\s+"[^"]+"\s*;/,
    '$1',
  );
  const { errors } = validateNginxMachineFileContentTypes(mutated);
  check(
    'missing default_type in the /llms.txt block is rejected',
    errors.some((e) => e.includes('has no default_type directive')),
  );
}

// Mutation: wrong content type value must be caught.
{
  const mutated = nginxConf.replace(
    /(location\s*=\s*\/llms\.txt\s*\{[\s\S]*?default_type\s+)"[^"]+"/,
    '$1"application/octet-stream"',
  );
  const { errors } = validateNginxMachineFileContentTypes(mutated);
  check(
    'wrong /llms.txt default_type value is rejected',
    errors.some((e) => e.includes('default_type must be')),
  );
}

// Mutation: the same gates must hold for robots.txt and sitemap.xml, not just
// llms.txt — otherwise a regression on either could ship unnoticed.
for (const route of ['/robots.txt', '/sitemap.xml']) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mutated = nginxConf.replace(
    new RegExp(`(location\\s*=\\s*${escaped}\\s*\\{[\\s\\S]*?default_type\\s+)"[^"]+"`),
    '$1"application/octet-stream"',
  );
  const { errors } = validateNginxMachineFileContentTypes(mutated);
  check(
    `wrong ${route} default_type value is rejected`,
    errors.some((e) => e.includes(`\`location = ${route}\` default_type must be`)),
  );
}

// Mutation: removing the `types { }` reset must be caught. This is the exact
// defect that reached production on 2026-08-24 — every default_type was
// present and correct, so a check that only looked at default_type passed
// while the live origin served text/plain and text/xml.
for (const route of ['/robots.txt', '/sitemap.xml', '/llms.txt']) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mutated = nginxConf.replace(
    new RegExp(`(location\\s*=\\s*${escaped}\\s*\\{[\\s\\S]*?)\\n\\s*types\\s*\\{\\s*\\}`),
    '$1',
  );
  const { errors } = validateNginxMachineFileContentTypes(mutated);
  check(
    `missing \`types { }\` reset for ${route} is rejected`,
    errors.some((e) => e.includes('has no empty `types { }` block')),
  );
}

// Mutation: an empty or unreadable config must be caught rather than passing
// vacuously.
{
  const { errors } = validateNginxMachineFileContentTypes('');
  check('empty nginx config is rejected', errors.some((e) => e.includes('empty or unreadable')));
}

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — validator is not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — validator correctly rejects every mutated input.');
}
