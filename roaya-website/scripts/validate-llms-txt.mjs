#!/usr/bin/env node
/**
 * Deterministic validation for public/llms.txt:
 * - every internal link must use the canonical origin, exist in public/sitemap.xml
 *   (which itself is generated from the registered public routes), and appear once.
 * - the file must not make pricing assertions (price tokens, "$", "/month", claims
 *   about whether a price list exists), matching the Stage 0 pricing-deferred decision.
 * - vercel.json must serve /llms.txt as text/plain; charset=utf-8, matching the
 *   established robots.txt/sitemap.xml pattern.
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

export function validateVercelLlmsContentType(vercelConfigJson) {
  const errors = [];
  let config;
  try {
    config = JSON.parse(vercelConfigJson);
  } catch (error) {
    return { errors: [`vercel.json is not valid JSON: ${error.message}`] };
  }

  const headerRules = Array.isArray(config.headers) ? config.headers : [];
  const llmsRule = headerRules.find((rule) => rule.source === '/llms.txt');

  if (!llmsRule) {
    errors.push('vercel.json has no header rule for source "/llms.txt".');
    return { errors };
  }

  const contentTypeHeader = (llmsRule.headers ?? []).find(
    (header) => header.key === 'Content-Type',
  );

  if (!contentTypeHeader) {
    errors.push('vercel.json "/llms.txt" rule has no Content-Type header.');
  } else if (contentTypeHeader.value !== LLMS_CONTENT_TYPE) {
    errors.push(
      `vercel.json "/llms.txt" Content-Type must be "${LLMS_CONTENT_TYPE}", found "${contentTypeHeader.value}".`,
    );
  }

  return { errors };
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(__dirname, '..', 'public');
  const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');
  const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
  const vercelConfigJson = readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8');

  const llmsResult = validateLlmsTxt({ llmsTxt, sitemapXml });
  const vercelResult = validateVercelLlmsContentType(vercelConfigJson);
  const errors = [...llmsResult.errors, ...vercelResult.errors];

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
      'no prohibited pricing assertions, vercel.json serves /llms.txt as text/plain; charset=utf-8.',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
