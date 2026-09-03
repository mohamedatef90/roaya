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
  checkCompanyFactsConsistency,
  checkServiceFactsIntegrity,
  extractNoindexRoutes,
  extractStatsSection,
  robotsMetaContent,
  assessHomepageCrawlerSemantics,
  assessBlogDetailUnavailable,
  assessPublishedText,
  BLOCKED_PUBLISHED_PATTERNS,
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
  mkdirSync(join(sandboxRoot, 'src/app/features/about'), { recursive: true });
  mkdirSync(join(sandboxRoot, 'src/app/features/home'), { recursive: true });
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
  // company-facts-consistency reads the two components that publish figures
  // derived from the founding year.
  cpSync(
    join(realRoot, 'src/app/features/about/about.component.ts'),
    join(sandboxRoot, 'src/app/features/about/about.component.ts'),
  );
  cpSync(
    join(realRoot, 'src/app/features/home/home.component.ts'),
    join(sandboxRoot, 'src/app/features/home/home.component.ts'),
  );
  // service-facts-integrity reads the facts model and the decision documents
  // its pending entries point at.
  cpSync(
    join(realRoot, 'src/app/core/seo/service-facts.ts'),
    join(sandboxRoot, 'src/app/core/seo/service-facts.ts'),
  );
  mkdirSync(join(sandboxRoot, 'docs/decisions'), { recursive: true });
  cpSync(
    join(realRoot, 'docs/decisions/2026-09-02-pending-decisions.md'),
    join(sandboxRoot, 'docs/decisions/2026-09-02-pending-decisions.md'),
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

/**
 * Replace the body of the NOINDEX_ROUTES export in a route-metadata.ts copy
 * (or remove the export entirely with `routes === null`). Keeps the fixture
 * independent of how many entries the real list carries.
 */
function setNoindexRoutes(ts, routes) {
  const re = /export\s+const\s+NOINDEX_ROUTES\b[^=]*=\s*\[[\s\S]*?\];/;
  if (!re.test(ts)) {
    throw new Error('Self-test fixture expects route-metadata.ts to export NOINDEX_ROUTES.');
  }
  if (routes === null) return ts.replace(re, '');
  const body = routes.map((r) => `  '${r}',`).join('\n');
  return ts.replace(re, `export const NOINDEX_ROUTES: readonly string[] = [\n${body}\n];`);
}

/** One bilingual sitemap <url> pair in the static file's exact shape. */
function sitemapPair(path) {
  const en = `https://roaya.co${path}`;
  const ar = `https://roaya.co/ar${path}`;
  const alternates = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="ar" href="${ar}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`,
  ].join('\n');
  return [en, ar]
    .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-09-02</lastmod>\n${alternates}\n  </url>`)
    .join('\n');
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

// --- canonical-metadata-coverage: NOINDEX_ROUTES (2026-09-02 AI-readiness reconciliation) ---
// The committed tree is the "allowed-absent" case: NOINDEX routes are
// prerendered, absent from sitemap.xml and llms.txt, and the baseline above
// passes. Each mutation below breaks one leg of that contract.
check(
  'canonical-metadata-coverage extracts NOINDEX_ROUTES from the real route-metadata.ts',
  (() => {
    const routes = extractNoindexRoutes(readFileSync(join(realRoot, 'src/app/core/seo/route-metadata.ts'), 'utf8'));
    return Array.isArray(routes) && routes.includes('/resources/whitepapers') && routes.includes('/resources/documentation');
  })(),
);
check(
  'extractNoindexRoutes returns null (fail-closed signal) when the export is absent',
  extractNoindexRoutes('export const PENDING_ROUTE_METADATA_GAPS: readonly string[] = [];') === null,
);
check(
  'canonical-metadata-coverage passes when a NOINDEX route is absent from the sitemap (allowed-absent)',
  withSandbox(
    // Re-assert the shape explicitly instead of relying on the committed list:
    // exactly these two routes noindex, both absent from sitemap and llms.txt.
    (ctx) => {
      const ts = join(ctx.srcApp, 'core/seo/route-metadata.ts');
      writeFileSync(ts, setNoindexRoutes(readFileSync(ts, 'utf8'), ['/resources/whitepapers', '/resources/documentation']));
    },
    (ctx) => checkCanonicalMetadataCoverage(ctx).status === 'pass',
  ),
);
check(
  'canonical-metadata-coverage fails when a NOINDEX route reappears in the sitemap',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'sitemap.xml'), (t) => t.replace('</urlset>', `${sitemapPair('/resources/whitepapers')}\n</urlset>`)),
    (ctx) => {
      const result = checkCanonicalMetadataCoverage(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('NOINDEX route') && e.includes('/resources/whitepapers'));
    },
  ),
);
check(
  'canonical-metadata-coverage fails when NOINDEX_ROUTES is emptied while the routes stay out of the sitemap',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/route-metadata.ts'), (t) => setNoindexRoutes(t, [])),
    (ctx) => {
      const result = checkCanonicalMetadataCoverage(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('missing from sitemap.xml and is not listed in NOINDEX_ROUTES'));
    },
  ),
);
check(
  'canonical-metadata-coverage fails closed when the NOINDEX_ROUTES export is removed',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/route-metadata.ts'), (t) => setNoindexRoutes(t, null)),
    (ctx) => {
      const result = checkCanonicalMetadataCoverage(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('no longer exports NOINDEX_ROUTES'));
    },
  ),
);
check(
  'canonical-metadata-coverage fails when llms.txt links to a NOINDEX route',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'llms.txt'), (t) => t.replace('## Legal', '- [Whitepapers](https://roaya.co/resources/whitepapers)\n\n## Legal')),
    (ctx) => {
      const result = checkCanonicalMetadataCoverage(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('llms.txt links to') && e.includes('/resources/whitepapers'));
    },
  ),
);
check(
  'canonical-metadata-coverage fails when NOINDEX_ROUTES names a route that does not exist',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/route-metadata.ts'), (t) => setNoindexRoutes(t, ['/resources/whitepapers', '/resources/documentation', '/resources/no-such-placeholder'])),
    (ctx) => {
      const result = checkCanonicalMetadataCoverage(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('stale entry') && e.includes('/resources/no-such-placeholder'));
    },
  ),
);

// --- company-facts-consistency (2026-09-02 AI-readiness reconciliation) ---
//
// The exact production drift: story says 2012, timeline says 2018, homepage
// says 10+ years. Each mutation must be rejected on its own.

check(
  'company-facts-consistency passes on the reconciled tree',
  withSandbox(() => {}, (ctx) => checkCompanyFactsConsistency(ctx).status === 'pass'),
);

check(
  'company-facts-consistency fails when the About timeline contradicts the story (the live 2018-vs-2012 bug)',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'features/about/about.component.ts'), (ts) => ts.replace("year: '2012'", "year: '2018'")),
    (ctx) => {
      const result = checkCompanyFactsConsistency(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('first milestone year is 2018'));
    },
  ),
);

check(
  'company-facts-consistency fails when a years-experience figure drifts from the founding year',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'features/home/home.component.ts'), (ts) =>
      ts.replace(/value:\s*\d+,(\s*)suffix: '\+',(\s*)label: 'home\.stats\.experience'/, "value: 10,$1suffix: '+',$2label: 'home.stats.experience'")),
    (ctx) => {
      const result = checkCompanyFactsConsistency(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('publishes 10+ years'));
    },
  ),
);

check(
  'company-facts-consistency fails when llms.txt states a different founding year',
  withSandbox(
    (ctx) => editFile(join(ctx.publicDir, 'llms.txt'), (txt) => txt.replace('founded in 2012', 'founded in 2018')),
    (ctx) => {
      const result = checkCompanyFactsConsistency(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('llms.txt'));
    },
  ),
);

check(
  'company-facts-consistency fails when the story paragraph names a second year',
  withSandbox(
    (ctx) => editFile(join(ctx.root, 'src/assets/i18n/en.json'), (json) => json.replace('Founded in 2012,', 'Founded in 2012 (operating since 2018),')),
    (ctx) => {
      const result = checkCompanyFactsConsistency(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('also names 2018'));
    },
  ),
);

// --- service-facts-integrity (2026-09-02 AI-readiness, P1.1) ---

check(
  'service-facts-integrity passes on the current model',
  withSandbox(() => {}, (ctx) => checkServiceFactsIntegrity(ctx).status === 'pass'),
);

check(
  'service-facts-integrity fails when a published SLA loses its registry claim',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/service-facts.ts'), (ts) =>
      ts.replace(/claimId: 'uptime-cloudedge-posta-9999'/, "claimId: 'no-such-claim'")),
    (ctx) => {
      const result = checkServiceFactsIntegrity(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('not verified in the registry'));
    },
  ),
);

check(
  'service-facts-integrity fails when a published SLA carries no claim at all',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/service-facts.ts'), (ts) =>
      ts.replace(/, claimId: 'uptime-cloudedge-posta-9999'/, '')),
    (ctx) => {
      const result = checkServiceFactsIntegrity(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('carries no claimId'));
    },
  ),
);

check(
  'service-facts-integrity fails when a published value has no Arabic translation',
  withSandbox(
    (ctx) => editFile(join(ctx.root, 'src/assets/i18n/ar.json'), (json) => {
      const data = JSON.parse(json);
      delete data.serviceFacts.worldposta.providerRole;
      return JSON.stringify(data, null, 2);
    }),
    (ctx) => {
      const result = checkServiceFactsIntegrity(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('ar.json'));
    },
  ),
);

check(
  'service-facts-integrity fails when a service route has no facts record',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/service-facts.ts'), (ts) =>
      ts.replace("      '/services/backup',\n", '')),
    (ctx) => {
      const result = checkServiceFactsIntegrity(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('/services/backup'));
    },
  ),
);

check(
  'service-facts-integrity fails when a pending fact points at a missing decision document',
  withSandbox(
    (ctx) => editFile(join(ctx.srcApp, 'core/seo/service-facts.ts'), (ts) =>
      ts.replace(/docs\/decisions\/2026-09-02-pending-decisions\.md/g, 'docs/decisions/gone.md')),
    (ctx) => {
      const result = checkServiceFactsIntegrity(ctx);
      return result.status === 'fail' && result.errors.some((e) => e.includes('does not exist'));
    },
  ),
);

// --- published-claim-sweep assessor (2026-09-02 AI-readiness reconciliation) ---

check(
  'published-claim assessor passes on reconciled copy',
  assessPublishedText('<p>99.9% uptime SLA, encryption in transit and at rest.</p>').length === 0,
);

check(
  'published-claim assessor catches the live /services/sap escape ("99.95% uptime guarantee")',
  assessPublishedText('<div>99.95%</div><p>99.95% uptime guarantee with defined response times</p>')
    .some(({ reason }) => reason.includes('unregistered uptime figure')),
);

check(
  'published-claim assessor catches "Military-Grade Encryption" in any casing or spacing',
  ['Military-Grade Encryption', 'military grade encryption', 'MILITARY-GRADE']
    .every((text) => assessPublishedText(text).some(({ reason }) => reason.includes('vague security puffery'))),
);

check(
  'published-claim assessor catches the blocked claims frozen in the removed i18n backups',
  ["Egypt's first IT provider with transparent pricing and guaranteed ROI"]
    .flatMap((text) => assessPublishedText(text).map((m) => m.reason))
    .filter((reason) => reason.includes('blocked')).length === 2,
);

check(
  'published-claim patterns each carry an actionable reason',
  BLOCKED_PUBLISHED_PATTERNS.every(({ pattern, reason }) => pattern instanceof RegExp && typeof reason === 'string' && reason.length > 20),
);

// --- ssr-crawler-semantics assessors on fixture HTML (2026-09-02 AI-readiness reconciliation) ---
// The live check boots the production server; these fixtures prove the
// assertions themselves are red-capable without a build.
const statCard = (value, extra = '') =>
  `<div class="stat-card"><div role="text"><span data-stat-value>${value}</span>${extra}</div><div>label</div></div>`;
const homepageFixture = ({ stats, extraHead = '', extraBody = '' }) =>
  `<!doctype html><html><head><title>Roaya IT</title>${extraHead}</head><body>` +
  `<h1>Your Trusted Technology Partner in Egypt</h1>` +
  `<section _ngcontent-x class="stats-section relative py-16"><div>${stats}</div></section>` +
  `<section id="aws"><p>10+ years of cloud experience and 24/7 support</p></section>${extraBody}</body></html>`;
const cleanStats = [statCard('150+'), statCard('99.9%'), statCard('24/7'), statCard('14+')].join('');

check(
  'homepage assessor passes on one value per stat, one <h1>, and no escaped markup',
  assessHomepageCrawlerSemantics(homepageFixture({ stats: cleanStats }), '/').length === 0,
);
check(
  'homepage assessor scopes stat counting to the stats section (AWS "10+"/"24/7" outside it are ignored)',
  (() => {
    const html = homepageFixture({ stats: cleanStats });
    const section = extractStatsSection(html);
    return section !== null && !section.includes('cloud experience') && assessHomepageCrawlerSemantics(html, '/').length === 0;
  })(),
);
check(
  'homepage assessor fails on the live sr-only duplicate + zeroed count-up ("150+ 0+", "99.9% 0%", "24/7 0/7")',
  (() => {
    const duplicated = [
      statCard('150+', '<span aria-hidden="true">0+</span>'),
      statCard('99.9%', '<span aria-hidden="true">0%</span>'),
      statCard('24/7', '<span aria-hidden="true">0/7</span>'),
      statCard('10+', '<span aria-hidden="true">0+</span>'),
    ].join('');
    const errors = assessHomepageCrawlerSemantics(homepageFixture({ stats: duplicated }), '/');
    return errors.some((e) => e.includes('zeroed counter'))
      && errors.some((e) => e.includes('"14+" 0 time(s)'))
      && errors.some((e) => e.includes('still renders "10+"'));
  })(),
);
check(
  'homepage assessor fails when a stat value is rendered twice even without a zero',
  assessHomepageCrawlerSemantics(homepageFixture({ stats: cleanStats + statCard('150+') }), '/').some((e) => e.includes('"150+" 2 time(s)')),
);
check(
  'homepage assessor fails on a head-level <noscript> <img> serialized as escaped text',
  assessHomepageCrawlerSemantics(
    homepageFixture({ stats: cleanStats, extraHead: '<noscript>&lt;img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1"/&gt;</noscript>' }),
    '/',
  ).some((e) => e.includes('&lt;img')),
);
check(
  'homepage assessor catches escaped markup other than <img> (the GTM <iframe>, a <link>)',
  ['&lt;iframe src="https://www.googletagmanager.com/ns.html?id=GTM-X"', '&lt;link rel="stylesheet"']
    .every((escaped) =>
      assessHomepageCrawlerSemantics(homepageFixture({ stats: cleanStats, extraHead: `<noscript>${escaped}</noscript>` }), '/')
        .some((e) => e.includes('serialized as visible text')),
    ),
);

check(
  'homepage assessor passes when the <noscript> <img> is real markup in <body>',
  assessHomepageCrawlerSemantics(
    homepageFixture({ stats: cleanStats, extraBody: '<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1"/></noscript>' }),
    '/',
  ).length === 0,
);
check(
  'homepage assessor fails on "99.95" and on a second <h1>',
  (() => {
    const errors = assessHomepageCrawlerSemantics(homepageFixture({ stats: cleanStats, extraBody: '<h1>Second</h1><div>99.95%</div>' }), '/ar');
    return errors.some((e) => e.includes('99.95')) && errors.some((e) => e.includes('expected exactly one <h1>, found 2'));
  })(),
);
check(
  'homepage assessor fails when the stats section is missing entirely',
  assessHomepageCrawlerSemantics('<html><body><h1>x</h1></body></html>', '/').some((e) => e.includes('no <section class="stats-section">')),
);

const blogPage = ({ title, h1, canonical, ogUrl }) =>
  `<!doctype html><html><head><title>${title}</title><link rel="canonical" href="${canonical}"><meta property="og:url" content="${ogUrl}"></head>` +
  `<body><h1 class="text-3xl">\n  ${h1}\n</h1><p>body</p></body></html>`;
const blogPath = '/resources/blog/some-slug-that-cannot-exist-x1';
check(
  'blog assessor fails on the live production shape (200/not-found H1/generic title/homepage canonical/no Retry-After)',
  (() => {
    const errors = assessBlogDetailUnavailable({
      path: blogPath,
      status: 200,
      html: blogPage({ title: 'Blog Post - Roaya IT', h1: 'Post Not Found', canonical: 'https://roaya.co/', ogUrl: 'https://roaya.co/' }),
      retryAfter: null,
      origin: 'https://roaya.co',
    });
    return errors.some((e) => e.includes('expected HTTP 503'))
      && errors.some((e) => e.includes('Retry-After'))
      && errors.some((e) => e.includes('"Post Not Found"'))
      && errors.some((e) => e.includes('generic "Blog Post - Roaya IT"'))
      && errors.some((e) => e.includes('canonical is https://roaya.co/'))
      && errors.some((e) => e.includes('og:url is https://roaya.co/'));
  })(),
);
check(
  'blog assessor fails on the Arabic not-found heading even with a 503',
  assessBlogDetailUnavailable({
    path: '/ar/resources/blog/some-slug-x1',
    status: 503,
    html: blogPage({ title: 'مقال غير متاح مؤقتاً | Roaya IT', h1: 'المقال غير موجود', canonical: 'https://roaya.co/ar/resources/blog/some-slug-x1', ogUrl: 'https://roaya.co/ar/resources/blog/some-slug-x1' }),
    retryAfter: '120',
    origin: 'https://roaya.co',
  }).some((e) => e.includes('المقال غير موجود')),
);
check(
  'blog assessor passes on the reconciled unavailable state (503 + Retry-After, own H1/title, self canonical = og:url)',
  assessBlogDetailUnavailable({
    path: blogPath,
    status: 503,
    html: blogPage({ title: 'Article temporarily unavailable | Roaya IT Blog', h1: 'This article is temporarily unavailable', canonical: `https://roaya.co${blogPath}`, ogUrl: `https://roaya.co${blogPath}` }),
    retryAfter: '120',
    origin: 'https://roaya.co',
  }).length === 0,
);

check(
  'robotsMetaContent reads noindex regardless of attribute order/spacing and returns null when absent',
  robotsMetaContent('<head><meta name="robots" content="noindex, follow"></head>') === 'noindex, follow'
    && robotsMetaContent('<head><meta content="noindex,follow"  name="robots" /></head>') === 'noindex, follow'
    && robotsMetaContent('<head><meta name="description" content="noindex is not here"></head>') === null,
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
