#!/usr/bin/env node
/**
 * Red-capable self-test for the AI-readiness checks (TIFO-16): proves each
 * critical gate actually fails on a deliberately mutated copy of the real
 * source tree, not just that the current committed state passes clean.
 *
 * Runs entirely inside a per-test temp sandbox (os.tmpdir()) that mirrors
 * only the files each check reads — never mutates the real repo.
 */
import { mkdtempSync, rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  checkRobotsPolicy,
  checkSitemapValidity,
  checkLlmsTxt,
  checkCanonicalMetadataCoverage,
  checkJsonLdExclusionGates,
  checkCaseStudyRouteIntegrity,
  checkApprovedFactualConsistency,
} from './checks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const realRoot = join(__dirname, '..', '..');

let failures = 0;
function check(name, condition) {
  if (!condition) {
    console.error(`✗ ${name}`);
    failures += 1;
  } else {
    console.log(`✓ ${name}`);
  }
}

function makeSandbox() {
  const sandboxRoot = mkdtempSync(join(tmpdir(), 'tifo16-ai-readiness-'));
  mkdirSync(join(sandboxRoot, 'public'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/app/core/seo'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/app/features/resources/case-studies/case-study-detail'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/app/features/services/worldposta'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/app/features/not-found'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/assets/i18n'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'scripts/claim-evidence'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'deploy/nginx'), { recursive: true });

  cpSync(join(realRoot, 'public/robots.txt'), join(sandboxRoot, 'public/robots.txt'));
  cpSync(join(realRoot, 'public/sitemap.xml'), join(sandboxRoot, 'public/sitemap.xml'));
  cpSync(join(realRoot, 'public/llms.txt'), join(sandboxRoot, 'public/llms.txt'));
  cpSync(
    join(realRoot, 'deploy', 'nginx', 'roaya-website.conf'),
    join(sandboxRoot, 'deploy', 'nginx', 'roaya-website.conf'),
    { recursive: false },
  );
  cpSync(join(realRoot, 'src/app/core/seo/route-metadata.ts'), join(sandboxRoot, 'src/app/core/seo/route-metadata.ts'));
  cpSync(join(realRoot, 'src/app/core/seo/entity-taxonomy.ts'), join(sandboxRoot, 'src/app/core/seo/entity-taxonomy.ts'));
  cpSync(join(realRoot, 'src/app/app.routes.ts'), join(sandboxRoot, 'src/app/app.routes.ts'));
  cpSync(join(realRoot, 'src/app/app.routes.server.ts'), join(sandboxRoot, 'src/app/app.routes.server.ts'));
  cpSync(
    join(realRoot, 'src/app/features/resources/case-studies/case-studies.data.ts'),
    join(sandboxRoot, 'src/app/features/resources/case-studies/case-studies.data.ts'),
  );
  cpSync(
    join(realRoot, 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html'),
    join(sandboxRoot, 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html'),
  );
  cpSync(join(realRoot, 'src/assets/i18n/en.json'), join(sandboxRoot, 'src/assets/i18n/en.json'));
  cpSync(join(realRoot, 'src/assets/i18n/ar.json'), join(sandboxRoot, 'src/assets/i18n/ar.json'));
  cpSync(
    join(realRoot, 'src/app/features/services/worldposta/worldposta.component.ts'),
    join(sandboxRoot, 'src/app/features/services/worldposta/worldposta.component.ts'),
  );
  cpSync(
    join(realRoot, 'src/app/features/not-found/not-found.component.ts'),
    join(sandboxRoot, 'src/app/features/not-found/not-found.component.ts'),
  );
  cpSync(
    join(realRoot, 'scripts/claim-evidence/registry.json'),
    join(sandboxRoot, 'scripts/claim-evidence/registry.json'),
  );

  return {
    root: sandboxRoot,
    publicDir: join(sandboxRoot, 'public'),
    srcApp: join(sandboxRoot, 'src/app'),
    claimEvidenceDir: join(sandboxRoot, 'scripts/claim-evidence'),
    browserDistDir: join(sandboxRoot, 'dist/roaya-website/browser'),
    serverEntryFile: join(sandboxRoot, 'dist/roaya-website/server/server.mjs'),
    origin: 'https://roaya.co',
    serverPort: 42418,
    _dir: sandboxRoot,
  };
}

function withSandbox(mutate, run) {
  const ctx = makeSandbox();
  try {
    mutate(ctx);
    return run(ctx);
  } finally {
    rmSync(ctx._dir, { recursive: true, force: true });
  }
}

function editFile(path, transform) {
  const content = readFileSync(path, 'utf8');
  const mutated = transform(content);
  if (mutated === content) {
    throw new Error(`Self-test fixture mutation was a no-op: ${path}`);
  }
  writeFileSync(path, mutated);
}

// --- Baseline: every check passes clean on an untouched sandbox copy. ---
{
  const results = withSandbox(
    () => {},
    (ctx) => [
      checkRobotsPolicy(ctx),
      checkSitemapValidity(ctx),
      checkLlmsTxt(ctx),
      checkCanonicalMetadataCoverage(ctx),
      checkJsonLdExclusionGates(ctx),
      checkCaseStudyRouteIntegrity(ctx),
      checkApprovedFactualConsistency(ctx),
    ],
  );
  for (const result of results) {
    check(`baseline sandbox passes: ${result.id}`, result.status === 'pass');
  }
}

// --- robots-policy ---
// Use regex to match both LF and CRLF line endings (Windows compatibility)
check(
  'robots-policy fails when an AI training crawler is no longer disallowed',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'robots.txt'), (t) => t.replace(/User-agent: GPTBot\r?\nDisallow: \//, 'User-agent: GPTBot\nAllow: /')),
    (ctx) => checkRobotsPolicy(ctx).status === 'fail',
  ),
);
check(
  'robots-policy fails when the sitemap directive is removed',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'robots.txt'), (t) => t.replace('Sitemap: https://roaya.co/sitemap.xml', '')),
    (ctx) => checkRobotsPolicy(ctx).status === 'fail',
  ),
);
check(
  'robots-policy fails when an admin path disallow is removed',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'robots.txt'), (t) => t.replace(/Disallow: \/admin\/\r?\n/, '')),
    (ctx) => checkRobotsPolicy(ctx).status === 'fail',
  ),
);

// --- sitemap-validity ---
check(
  'sitemap-validity fails on a duplicated <loc>',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace('</urlset>', '<url><loc>https://roaya.co/about</loc><lastmod>2026-08-20</lastmod></url></urlset>')),
    (ctx) => checkSitemapValidity(ctx).status === 'fail',
  ),
);
check(
  'sitemap-validity fails on a non-canonical origin',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace('https://roaya.co/about', 'https://evil.example.com/about')),
    (ctx) => checkSitemapValidity(ctx).status === 'fail',
  ),
);
check(
  'sitemap-validity fails on a malformed lastmod',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace('<lastmod>2026-08-20</lastmod>', '<lastmod>20th August 2026</lastmod>')),
    (ctx) => checkSitemapValidity(ctx).status === 'fail',
  ),
);

// --- llms-txt (already covered by validate-llms-txt.selftest.mjs; smoke-test the wrapper too) ---
check(
  'llms-txt fails when a link is not sitemap-registered',
  withSandbox(
    // Targets the markdown link, not the bare URL: llms.txt prose also
    // mentions example URLs, and mutating the first textual match would edit
    // prose the validator never inspects - leaving this check green while
    // proving nothing.
    (ctx) => editFile(join(ctx.publicDir, 'llms.txt'), (t) => t.replace('](https://roaya.co/about)', '](https://roaya.co/about-not-a-real-route)')),
    (ctx) => checkLlmsTxt(ctx).status === 'fail',
  ),
);

// --- canonical-metadata-coverage ---
check(
  'canonical-metadata-coverage fails when a sitemap route loses its ROUTE_METADATA entry',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/route-metadata.ts'), (t) => t.replace(/\s*'\/about':\s*\{[^}]*\},?/, '')),
    (ctx) => checkCanonicalMetadataCoverage(ctx).status === 'fail',
  ),
);
check(
  'canonical-metadata-coverage fails when a prerendered route is missing from the sitemap',
  withSandbox(
    // The <url> block now also carries xhtml:link alternates, so this must
    // match the whole block rather than assuming loc+lastmod and nothing else
    // - a regex that silently stops matching leaves the sandbox unbroken and
    // turns this red-capability test green for the wrong reason.
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace(/\s*<url>\s*<loc>https:\/\/roaya\.co\/about<\/loc>[\s\S]*?<\/url>/, '')),
    (ctx) => checkCanonicalMetadataCoverage(ctx).status === 'fail',
  ),
);

// --- json-ld-exclusion-gates ---
check(
  'json-ld-exclusion-gates fails when a service description gains a pricing token',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), (t) => t.replace(
      "Welcome to CloudEdge by WorldPosta,",
      "Welcome to CloudEdge by WorldPosta, now $1.50/user/month,",
    )),
    (ctx) => checkJsonLdExclusionGates(ctx).status === 'fail',
  ),
);
check(
  'json-ld-exclusion-gates fails when a service description gains an ISO claim',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), (t) => t.replace(
      "Welcome to CloudEdge by WorldPosta,",
      "ISO-certified: Welcome to CloudEdge by WorldPosta,",
    )),
    (ctx) => checkJsonLdExclusionGates(ctx).status === 'fail',
  ),
);
check(
  'json-ld-exclusion-gates fails when the verified uptime claim is removed from the registry',
  withSandbox(
    (ctx) => editFile(join(ctx.claimEvidenceDir, 'registry.json'), (t) => {
      const registry = JSON.parse(t);
      registry.claims = registry.claims.filter((c) => c.id !== 'uptime-cloudedge-posta-9999');
      return JSON.stringify(registry);
    }),
    (ctx) => checkJsonLdExclusionGates(ctx).status === 'fail',
  ),
);

// --- case-study-route-integrity ---
check(
  'case-study-route-integrity fails when a case-study slug is missing from the sitemap',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace(
      /\s*<url>\s*<loc>https:\/\/roaya\.co\/resources\/case-studies\/bank-cloud-migration<\/loc>[\s\S]*?<\/url>/,
      '',
    )),
    (ctx) => checkCaseStudyRouteIntegrity(ctx).status === 'fail',
  ),
);
check(
  'case-study-route-integrity fails when the NotFoundComponent stops setting a real 404',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'features/not-found/not-found.component.ts'), (t) => t.replace(
      'this.responseInit.status = 404;',
      'this.responseInit.status = 200;',
    )),
    (ctx) => checkCaseStudyRouteIntegrity(ctx).status === 'fail',
  ),
);
check(
  'case-study-route-integrity fails when the detail route is removed from app.routes.ts',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'app.routes.ts'), (t) => t.replace(
      /\s*\{\s*\n\s*path:\s*'resources\/case-studies\/:slug',[\s\S]*?\n\s*\},/,
      ',',
    )),
    (ctx) => checkCaseStudyRouteIntegrity(ctx).status === 'fail',
  ),
);

// --- approved-factual-consistency ---
check(
  'approved-factual-consistency fails when a verified sourcePointer fragment is renamed away',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, '..', 'assets/i18n/en.json'), (t) => t.replace(
      '"p1": "Founded in 2012,',
      '"p1renamed": "Founded in 2012,',
    )),
    (ctx) => checkApprovedFactualConsistency(ctx).status === 'fail',
  ),
);
check(
  'approved-factual-consistency fails when a registry claim has a duplicate id',
  withSandbox(
    (ctx) => editFile(join(ctx.claimEvidenceDir, 'registry.json'), (t) => {
      const registry = JSON.parse(t);
      const dup = JSON.parse(JSON.stringify(registry.claims.find((c) => c.id === 'clients-150-plus')));
      dup.id = 'founded-2012';
      registry.claims.push(dup);
      return JSON.stringify(registry);
    }),
    (ctx) => checkApprovedFactualConsistency(ctx).status === 'fail',
  ),
);
check(
  'approved-factual-consistency fails when a verified claim points at a missing file',
  withSandbox(
    (ctx) => editFile(join(ctx.claimEvidenceDir, 'registry.json'), (t) => {
      const registry = JSON.parse(t);
      const claim = registry.claims.find((c) => c.id === 'founded-2012');
      claim.sourcePointer = 'src/assets/i18n/nonexistent.json#about.story.p1';
      return JSON.stringify(registry);
    }),
    (ctx) => checkApprovedFactualConsistency(ctx).status === 'fail',
  ),
);

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — AI-readiness checks are not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — every gate correctly rejects its mutated input.');
}
