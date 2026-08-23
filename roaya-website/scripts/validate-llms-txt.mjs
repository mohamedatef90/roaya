#!/usr/bin/env node
/**
 * Deterministic validation for public/llms.txt:
 * every internal link must use the canonical origin, exist in public/sitemap.xml
 * (which itself is generated from the registered public routes), and appear once.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://roaya.co';

export function extractSitemapUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

export function extractLlmsLinks(llmsTxt) {
  return [...llmsTxt.matchAll(/]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]);
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

  return { errors, linkCount: links.length };
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(__dirname, '..', 'public');
  const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');
  const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');

  const { errors, linkCount } = validateLlmsTxt({ llmsTxt, sitemapXml });

  if (errors.length > 0) {
    console.error(`llms.txt validation FAILED (${errors.length} error(s) across ${linkCount} link(s)):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`llms.txt validation passed: ${linkCount} link(s), all canonical and sitemap-registered, no duplicates.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
