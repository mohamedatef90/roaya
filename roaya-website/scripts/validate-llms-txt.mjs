#!/usr/bin/env node
/**
 * Deterministic validation for public/llms.txt:
 * - every internal link must use the canonical origin, exist in public/sitemap.xml
 *   (which itself is generated from the registered public routes), and appear once.
 * - the file must not make pricing assertions (price tokens, "$", "/month", claims
 *   about whether a price list exists), matching the Stage 0 pricing-deferred decision.
 * - the deployed nginx config must serve /llms.txt as text/plain; charset=utf-8,
 *   matching the established robots.txt/sitemap.xml pattern. Production is the
 *   self-hosted nginx origin, so that config is the only place this guarantee
 *   can live.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://roaya.co';
const LLMS_CONTENT_TYPE = 'text/plain; charset=utf-8';

// Prohibited pricing assertions/tokens (Stage 0 decision 9: pricing is deferred —
// llms.txt may link to /pricing but must not state a price, a price range, or
// make any claim about whether a public price list exists).
const PRICING_PATTERNS = [
  { name: 'dollar amount', pattern: /\$\s?\d/ },
  { name: 'per-user/month price', pattern: /\d+(\.\d+)?\s*\/\s*(user\s*\/\s*)?month/i },
  { name: 'price-list existence claim', pattern: /price\s+list\s+(is|has\s+been|are)\s+\w+/i },
  { name: '"no public price list" claim', pattern: /no\s+public\s+price\s+list/i },
  { name: '"starting at" price framing', pattern: /starting\s+at/i },
  { name: 'price range claim', pattern: /price\s+rang(e|es)/i },
];

export function extractSitemapUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

export function extractLlmsLinks(llmsTxt) {
  return [...llmsTxt.matchAll(/]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]);
}

export function findPricingAssertions(llmsTxt) {
  const findings = [];
  for (const { name, pattern } of PRICING_PATTERNS) {
    const match = llmsTxt.match(pattern);
    if (match) {
      findings.push(`Prohibited pricing assertion (${name}): "${match[0]}"`);
    }
  }
  return findings;
}

export function validateLlmsTxt({ llmsTxt, sitemapXml }) {
  const errors = [];
  const sitemapUrls = new Set(extractSitemapUrls(sitemapXml));
  const links = extractLlmsLinks(llmsTxt);

  if (links.length === 0) {
    errors.push('llms.txt contains no internal links to validate.');
  }

  const seen = new Set();
  for (const url of links) {
    if (!(url === ORIGIN || url.startsWith(`${ORIGIN}/`))) {
      errors.push(`Non-canonical origin (must start with ${ORIGIN}): ${url}`);
      continue;
    }

    if (seen.has(url)) {
      errors.push(`Duplicate URL: ${url}`);
    }
    seen.add(url);

    const normalized = url === ORIGIN ? `${ORIGIN}/` : url;
    if (!sitemapUrls.has(normalized)) {
      errors.push(`URL is not a canonical, sitemap-registered route: ${url}`);
    }
  }

  errors.push(...findPricingAssertions(llmsTxt));

  return { errors, linkCount: links.length };
}

/**
 * Assert the nginx config declares an explicit content type for each machine
 * file. nginx would otherwise fall back to its mime.types mapping, which has
 * no entry for .txt served as UTF-8 and would emit a bare `text/plain` with no
 * charset. These files are the crawler/AI-agent contract, so the charset is
 * part of it.
 *
 * `location = /path` (exact match) and `default_type "<value>";` are matched
 * as a pair inside the same block, so moving a default_type into an unrelated
 * block does not satisfy the check.
 *
 * An empty `types { }` block is ALSO required, and that requirement is not
 * cosmetic. `default_type` only applies when nginx cannot resolve a type from
 * mime.types — and .txt and .xml are both in it. Without the `types { }`
 * reset, nginx serves `text/plain` and `text/xml` and never consults
 * `default_type` at all. This was caught in production on 2026-08-24: the
 * config had every `default_type` in place, this validator passed, and the
 * live origin still served the wrong types. Asserting the directive exists is
 * not the same as asserting it takes effect.
 */
export const MACHINE_FILE_CONTENT_TYPES = {
  '/robots.txt': 'text/plain; charset=utf-8',
  '/sitemap.xml': 'application/xml; charset=utf-8',
  '/llms.txt': 'text/plain; charset=utf-8',
};

export function validateNginxMachineFileContentTypes(nginxConf) {
  const errors = [];

  if (typeof nginxConf !== 'string' || nginxConf.trim() === '') {
    return { errors: ['nginx config is empty or unreadable.'] };
  }

  for (const [route, expected] of Object.entries(MACHINE_FILE_CONTENT_TYPES)) {
    // Match `location = <route> { ... }` up to the first closing brace at the
    // block's own indentation. The generated config never nests inside these.
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockMatch = nginxConf.match(
      new RegExp(`location\\s*=\\s*${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`),
    );

    if (!blockMatch) {
      errors.push(`nginx config has no \`location = ${route}\` block.`);
      continue;
    }

    const block = blockMatch[1];
    const defaultType = block.match(/default_type\s+"([^"]+)"\s*;/);

    if (!defaultType) {
      errors.push(`nginx \`location = ${route}\` block has no default_type directive.`);
    } else if (defaultType[1] !== expected) {
      errors.push(
        `nginx \`location = ${route}\` default_type must be "${expected}", found "${defaultType[1]}".`,
      );
    }

    // Without an empty `types { }` reset, the default_type above is inert for
    // any extension present in mime.types — which includes .txt and .xml.
    if (!/types\s*\{\s*\}/.test(block)) {
      errors.push(
        `nginx \`location = ${route}\` has no empty \`types { }\` block, so its ` +
          `default_type is ignored for known extensions (nginx would serve the ` +
          `mime.types value instead).`,
      );
    }
  }

  return { errors };
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(__dirname, '..', 'public');
  const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');
  const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
  const nginxConf = readFileSync(
    join(__dirname, '..', 'deploy', 'nginx', 'roaya-website.conf'),
    'utf8',
  );

  const llmsResult = validateLlmsTxt({ llmsTxt, sitemapXml });
  const nginxResult = validateNginxMachineFileContentTypes(nginxConf);
  const errors = [...llmsResult.errors, ...nginxResult.errors];

  if (errors.length > 0) {
    console.error(
      `llms.txt validation FAILED (${errors.length} error(s) across ${llmsResult.linkCount} link(s)):`,
    );
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `llms.txt validation passed: ${llmsResult.linkCount} link(s) canonical/sitemap-registered/non-duplicated, ` +
      'no prohibited pricing assertions, nginx serves all 3 machine files with explicit content types.',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
