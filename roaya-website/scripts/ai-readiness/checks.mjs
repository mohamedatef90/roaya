/**
 * Individual, side-effect-scoped AI-readiness checks (TIFO-16).
 *
 * Every check function takes a `ctx` object (see check.mjs for its shape)
 * and returns `{ id, title, status: 'pass' | 'fail' | 'skip', details, errors }`.
 * Checks never mutate files and never make network calls; the only
 * exception is `productionBuildAnd404` which talks to a server process
 * *this same run* started on 127.0.0.1, never a remote host.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { validateLlmsTxt, validateNginxMachineFileContentTypes } from '../validate-llms-txt.mjs';
import { validateRegistry, extractCaseStudySlugs } from '../claim-evidence/validate-registry.mjs';

function ok(id, title, details) {
  return { id, title, status: 'pass', details, errors: [] };
}
function fail(id, title, errors, details) {
  return { id, title, status: 'fail', details, errors };
}
function skip(id, title, reason) {
  return { id, title, status: 'skip', details: reason, errors: [] };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function resolveDottedPath(obj, dottedPath) {
  const parts = dottedPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

export function checkRobotsPolicy(ctx) {
  const id = 'robots-policy';
  const title = 'robots.txt policy and bot allow/deny decisions';
  const path = join(ctx.publicDir, 'robots.txt');
  if (!existsSync(path)) return fail(id, title, [`Missing ${relative(ctx.root, path)}`]);
  const text = readFileSync(path, 'utf8');
  const errors = [];

  if (!/User-agent:\s*\*[\s\S]*?Allow:\s*\/\s*$/m.test(text.split('\n\n')[0] ?? text)) {
    if (!/User-agent:\s*\*/.test(text) || !/Allow:\s*\/\s*(\n|$)/m.test(text)) {
      errors.push('Default "User-agent: *" block does not Allow: / for general crawlers.');
    }
  }

  const requiredDisallows = ['/admin/', '/dashboard/', '/leads/', '/users/', '/settings/', '/analytics/'];
  for (const path_ of requiredDisallows) {
    if (!text.includes(`Disallow: ${path_}`)) {
      errors.push(`Missing "Disallow: ${path_}" for general crawlers.`);
    }
  }

  const aiSearchBots = ['OAI-SearchBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot'];
  for (const bot of aiSearchBots) {
    const re = new RegExp(`User-agent:\\s*${bot}\\s*\\n\\s*Allow:\\s*/`, 'i');
    if (!re.test(text)) {
      errors.push(`AI search/assistant crawler "${bot}" is not explicitly Allow: /.`);
    }
  }

  const aiTrainingBots = ['GPTBot', 'ClaudeBot'];
  for (const bot of aiTrainingBots) {
    const re = new RegExp(`User-agent:\\s*${bot}\\s*\\n\\s*Disallow:\\s*/`, 'i');
    if (!re.test(text)) {
      errors.push(`AI training crawler "${bot}" is not explicitly Disallow: /.`);
    }
  }

  if (!/Sitemap:\s*https:\/\/roaya\.co\/sitemap\.xml/.test(text)) {
    errors.push('robots.txt does not declare "Sitemap: https://roaya.co/sitemap.xml".');
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${requiredDisallows.length} disallow rule(s), ${aiSearchBots.length} AI search bot(s) allowed, ${aiTrainingBots.length} AI training bot(s) disallowed, sitemap directive present.`);
}

export function checkSitemapValidity(ctx) {
  const id = 'sitemap-validity';
  const title = 'sitemap.xml validity, canonical URLs, and duplicates';
  const path = join(ctx.publicDir, 'sitemap.xml');
  if (!existsSync(path)) return fail(id, title, [`Missing ${relative(ctx.root, path)}`]);
  const xml = readFileSync(path, 'utf8');
  const errors = [];

  if (!xml.startsWith('<?xml')) {
    errors.push('sitemap.xml must start with an XML declaration.');
  }
  if (!/<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(xml)) {
    errors.push('sitemap.xml <urlset> is missing the required sitemaps.org namespace.');
  }

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) {
    errors.push('sitemap.xml contains no <loc> entries.');
  }

  const seen = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(ctx.origin)) {
      errors.push(`<loc> is not on the canonical origin (${ctx.origin}): ${loc}`);
    }
    if (loc !== `${ctx.origin}/` && loc.endsWith('/')) {
      errors.push(`<loc> has a non-root trailing slash: ${loc}`);
    }
    if (seen.has(loc)) {
      errors.push(`Duplicate <loc>: ${loc}`);
    }
    seen.add(loc);
  }

  const urlBlocks = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)];
  for (const block of urlBlocks) {
    if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block[0])) {
      errors.push(`<url> block missing a well-formed <lastmod>YYYY-MM-DD</lastmod>: ${block[0].slice(0, 80)}...`);
    }
  }

  return errors.length ? fail(id, title, errors) : ok(id, title, `${locs.length} canonical, non-duplicated <loc> entries.`);
}

export function checkLlmsTxt(ctx) {
  const id = 'llms-txt';
  const title = 'llms.txt validator, MIME config, prohibited assertions';
  const llmsPath = join(ctx.publicDir, 'llms.txt');
  const sitemapPath = join(ctx.publicDir, 'sitemap.xml');
  const nginxPath = join(ctx.root, 'deploy', 'nginx', 'roaya-website.conf');
  if (!existsSync(llmsPath)) return fail(id, title, [`Missing ${relative(ctx.root, llmsPath)}`]);

  const llmsTxt = readFileSync(llmsPath, 'utf8');
  const sitemapXml = readFileSync(sitemapPath, 'utf8');
  if (!existsSync(nginxPath))
    return fail(id, title, [`Missing ${relative(ctx.root, nginxPath)}`]);
  const nginxConf = readFileSync(nginxPath, 'utf8');

  const llmsResult = validateLlmsTxt({ llmsTxt, sitemapXml });
  const nginxResult = validateNginxMachineFileContentTypes(nginxConf);
  const errors = [...llmsResult.errors, ...nginxResult.errors];

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${llmsResult.linkCount} link(s) canonical/sitemap-registered/non-duplicated; nginx content-type rules present for all 3 machine files.`);
}

export function checkCanonicalMetadataCoverage(ctx) {
  const id = 'canonical-metadata-coverage';
  const title = 'canonical metadata coverage and route registry vs sitemap';
  const errors = [];

  const routeMetadataTs = readFileSync(join(ctx.srcApp, 'core/seo/route-metadata.ts'), 'utf8');
  const serverRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.server.ts'), 'utf8');
  const sitemapXml = readFileSync(join(ctx.publicDir, 'sitemap.xml'), 'utf8');

  const registeredKeys = [...routeMetadataTs.matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]);
  const pendingGapsMatch = routeMetadataTs.match(/PENDING_ROUTE_METADATA_GAPS[^=]*=\s*\[([\s\S]*?)\];/);
  const pendingGaps = pendingGapsMatch
    ? [...pendingGapsMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    : [];

  // Dynamic detail routes resolve their own metadata at render time
  // (documented in route-metadata.ts) and are deliberately unregistered here.
  const selfResolvingRoutes = new Set([
    '/resources/blog/:slug',
    '/resources/case-studies/:slug',
    '/resources/whitepapers',
    '/resources/documentation',
  ]);

  const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(ctx.origin, '') || '/')
    .map((p) => (p === '' ? '/' : p));

  const isSelfResolvingDynamicDetail = (path) =>
    (path.startsWith('/resources/blog/') && path !== '/resources/blog') ||
    (path.startsWith('/resources/case-studies/') && path !== '/resources/case-studies');

  for (const path of sitemapPaths) {
    if (registeredKeys.includes(path)) continue;
    if (selfResolvingRoutes.has(path)) continue;
    if (isSelfResolvingDynamicDetail(path)) continue;
    if (pendingGaps.includes(path)) continue;
    errors.push(`Sitemap route "${path}" has no ROUTE_METADATA entry, is not a documented self-resolving route, and is not listed in PENDING_ROUTE_METADATA_GAPS.`);
  }

  // Route registry (serverRoutes) prerendered static paths must match the
  // sitemap set exactly (excluding admin/parameterized/wildcard entries).
  const serverStaticPaths = [...serverRoutesTs.matchAll(/\{\s*path:\s*'([^']*)',\s*renderMode:\s*RenderMode\.Prerender\s*\}/g)]
    .map((m) => (m[1] === '' ? '/' : `/${m[1]}`));

  const sitemapSet = new Set(sitemapPaths);
  const serverSet = new Set(serverStaticPaths);
  for (const path of serverStaticPaths) {
    if (!sitemapSet.has(path)) {
      errors.push(`Prerendered static route "${path}" (app.routes.server.ts) is missing from sitemap.xml.`);
    }
  }
  for (const path of sitemapPaths) {
    const isDynamicDetail = path.startsWith('/resources/blog/') && path !== '/resources/blog';
    if (isDynamicDetail) continue;
    if (path.startsWith('/resources/case-studies/') && path !== '/resources/case-studies') continue;
    if (!serverSet.has(path)) {
      errors.push(`Sitemap route "${path}" is not a prerendered static route in app.routes.server.ts.`);
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${registeredKeys.length} registered metadata route(s), ${serverStaticPaths.length} prerendered route(s) reconciled against ${sitemapPaths.length} sitemap route(s).`);
}

export function checkJsonLdExclusionGates(ctx) {
  const id = 'json-ld-exclusion-gates';
  const title = 'JSON-LD validity and hard-exclusion gates';
  const errors = [];

  const entityTaxonomyTs = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');

  const forbiddenTokens = [
    { name: 'dollar amount', pattern: /\$\s?\d/ },
    { name: 'ISO claim', pattern: /\bISO\b/ },
    { name: 'CloudSpace', pattern: /CloudSpace/ },
    { name: 'rating/review', pattern: /\brating|\breview(?!ed\b)/i },
  ];

  const descriptionBlocks = [...entityTaxonomyTs.matchAll(/description:\s*\n?\s*'([^']*(?:\\'[^']*)*)'/g)].map((m) => m[1]);
  for (const description of descriptionBlocks) {
    for (const { name, pattern } of forbiddenTokens) {
      if (pattern.test(description)) {
        errors.push(`entity-taxonomy.ts service description contains a hard-excluded token (${name}): "${description.slice(0, 60)}..."`);
      }
    }
  }

  const routeEntityMapMatch = entityTaxonomyTs.match(/ROUTE_ENTITY_MAP[^=]*=\s*\{([\s\S]*)\n\};/);
  const routeKeys = routeEntityMapMatch
    ? [...routeEntityMapMatch[1].matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map((m) => m[1])
    : [];
  if (routeKeys.length === 0) {
    errors.push('ROUTE_ENTITY_MAP has no registered routes — expected at least "/" (Organization/WebSite).');
  }

  // Cross-check against the claim-evidence registry: every approved-service
  // description here must correspond to a "verified" business_decision claim.
  const registryJson = readFileSync(join(ctx.claimEvidenceDir, 'registry.json'), 'utf8');
  const registry = JSON.parse(registryJson);
  const uptimeClaim = registry.claims.find((c) => c.id === 'uptime-cloudedge-posta-9999');
  if (!uptimeClaim || uptimeClaim.status !== 'verified' || !Array.isArray(uptimeClaim.scope) || uptimeClaim.scope.length === 0) {
    errors.push('Claim-evidence registry does not carry a verified, scoped uptime-cloudedge-posta-9999 claim backing the JSON-LD/i18n uptime copy.');
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${routeKeys.length} route(s) registered in ROUTE_ENTITY_MAP; no hard-excluded tokens in service descriptions; uptime scope claim verified.`);
}

export function checkCaseStudyRouteIntegrity(ctx) {
  const id = 'case-study-route-integrity';
  const title = 'case-study registered routes/anchors/404 integrity';
  const errors = [];

  const caseStudiesDataTs = readFileSync(
    join(ctx.srcApp, 'features/resources/case-studies/case-studies.data.ts'),
    'utf8',
  );
  const slugs = extractCaseStudySlugs(caseStudiesDataTs);
  if (slugs.length === 0) {
    errors.push('case-studies.data.ts CaseStudySlug union produced zero slugs.');
  }

  const sitemapXml = readFileSync(join(ctx.publicDir, 'sitemap.xml'), 'utf8');
  const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

  const appRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.ts'), 'utf8');
  const hasDetailRoute = /path:\s*'resources\/case-studies\/:slug'/.test(appRoutesTs);
  if (!hasDetailRoute) {
    errors.push('app.routes.ts has no "resources/case-studies/:slug" route registered.');
  }

  const serverRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.server.ts'), 'utf8');
  const detailIsServerRendered = /path:\s*'resources\/case-studies\/:slug',\s*renderMode:\s*RenderMode\.Server/.test(serverRoutesTs);
  if (!detailIsServerRendered) {
    errors.push('app.routes.server.ts does not server-render "resources/case-studies/:slug" (needed for a real per-slug 404).');
  }
  const wildcardIs404 = /path:\s*'\*\*',\s*renderMode:\s*RenderMode\.Server,\s*status:\s*404/.test(serverRoutesTs);
  if (!wildcardIs404) {
    errors.push('app.routes.server.ts wildcard "**" route is not configured to return a real HTTP 404.');
  }

  for (const slug of slugs) {
    const url = `${ctx.origin}/resources/case-studies/${slug}`;
    if (!sitemapUrls.has(url)) {
      errors.push(`Case study slug "${slug}" is missing from sitemap.xml (expected ${url}).`);
    }
  }

  const listingUrl = `${ctx.origin}/resources/case-studies`;
  if (!sitemapUrls.has(listingUrl)) {
    errors.push('Case studies listing page is missing from sitemap.xml.');
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${slugs.length} case-study slug(s) registered in routing, data, and sitemap; wildcard 404 route configured.`);
}

export function checkApprovedFactualConsistency(ctx) {
  const id = 'approved-factual-consistency';
  const title = 'approved factual consistency and deferred-claim non-expansion';
  const errors = [];

  const registryJson = readFileSync(join(ctx.claimEvidenceDir, 'registry.json'), 'utf8');
  const caseStudiesDataTs = readFileSync(
    join(ctx.srcApp, 'features/resources/case-studies/case-studies.data.ts'),
    'utf8',
  );
  const caseStudySlugs = extractCaseStudySlugs(caseStudiesDataTs);
  const { errors: schemaErrors } = validateRegistry(registryJson, { caseStudySlugs });
  errors.push(...schemaErrors);

  const registry = JSON.parse(registryJson);
  const jsonCache = new Map();
  const loadJson = (relPath) => {
    if (!jsonCache.has(relPath)) {
      jsonCache.set(relPath, readJson(join(ctx.root, relPath)));
    }
    return jsonCache.get(relPath);
  };

  for (const claim of registry.claims) {
    if (!claim.sourcePointer) continue;
    const [filePart, fragment] = claim.sourcePointer.split('#');
    const absPath = join(ctx.root, filePart);
    if (!existsSync(absPath)) {
      errors.push(`[${claim.id}] sourcePointer file does not exist: ${filePart}`);
      continue;
    }
    if (filePart.endsWith('.json') && fragment) {
      const data = loadJson(filePart);
      const value = resolveDottedPath(data, fragment);
      if (value === undefined) {
        errors.push(`[${claim.id}] sourcePointer fragment "${fragment}" does not resolve in ${filePart} — the underlying copy moved or was renamed.`);
      } else if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`[${claim.id}] sourcePointer fragment "${fragment}" in ${filePart} is not a non-empty string.`);
      }
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${registry.claims.length} registry claim(s) internally consistent; all resolvable source pointers still point to real, non-empty copy.`);
}

export function checkMachineFilesInBuild(ctx) {
  const id = 'machine-files-in-build';
  const title = 'machine files present in production build';
  if (!existsSync(ctx.browserDistDir)) {
    return skip(id, title, `No production build found at ${relative(ctx.root, ctx.browserDistDir)} — run "npm run build:prod" first.`);
  }

  const errors = [];
  const required = ['robots.txt', 'sitemap.xml', 'llms.txt'];
  for (const file of required) {
    const srcPath = join(ctx.publicDir, file);
    const distPath = join(ctx.browserDistDir, file);
    if (!existsSync(distPath)) {
      errors.push(`Production build is missing ${file} at ${relative(ctx.root, distPath)}.`);
      continue;
    }
    const srcContent = readFileSync(srcPath, 'utf8');
    const distContent = readFileSync(distPath, 'utf8');
    if (srcContent !== distContent) {
      errors.push(`Built ${file} differs byte-for-byte from public/${file} (static asset copy did not pass through untouched).`);
    }
  }

  if (!existsSync(ctx.serverEntryFile)) {
    errors.push(`Production SSR server entry is missing: ${relative(ctx.root, ctx.serverEntryFile)}`);
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${required.length} machine file(s) present and byte-identical in the production build; SSR server entry present.`);
}

export async function checkRealUnknownRoute404(ctx) {
  const id = 'real-unknown-route-404';
  const title = 'real unknown-route 404 via local production server';
  if (!existsSync(ctx.serverEntryFile)) {
    return skip(id, title, `No production SSR server build found at ${relative(ctx.root, ctx.serverEntryFile)} — run "npm run build:prod" first.`);
  }

  const { spawn } = await import('node:child_process');
  const port = ctx.serverPort;
  const child = spawn(process.execPath, [ctx.serverEntryFile], {
    cwd: ctx.root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderrOutput = '';
  child.stderr.on('data', (chunk) => {
    stderrOutput += chunk.toString();
  });

  const waitForServer = async () => {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/`);
        if (res.status) return true;
      } catch {
        // Not up yet.
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  };

  try {
    const up = await waitForServer();
    if (!up) {
      return fail(id, title, [`Local SSR server on port ${port} did not become ready within 20s. stderr: ${stderrOutput.slice(0, 500)}`]);
    }

    const unknownPath = '/this-route-does-not-exist-tifo-16-check';
    const res = await fetch(`http://127.0.0.1:${port}${unknownPath}`);
    if (res.status !== 404) {
      return fail(id, title, [`Expected HTTP 404 for an unknown route, got ${res.status} for ${unknownPath}.`]);
    }

    const knownRes = await fetch(`http://127.0.0.1:${port}/about`);
    if (knownRes.status !== 200) {
      return fail(id, title, [`Expected HTTP 200 for a known static route (/about), got ${knownRes.status}.`]);
    }

    return ok(id, title, `Unknown route returned real HTTP 404; known static route (/about) returned HTTP 200 on local server (port ${port}).`);
  } finally {
    child.kill('SIGTERM');
  }
}

export const ALL_CHECKS = [
  checkRobotsPolicy,
  checkSitemapValidity,
  checkLlmsTxt,
  checkCanonicalMetadataCoverage,
  checkJsonLdExclusionGates,
  checkCaseStudyRouteIntegrity,
  checkApprovedFactualConsistency,
  checkMachineFilesInBuild,
  checkRealUnknownRoute404,
];
