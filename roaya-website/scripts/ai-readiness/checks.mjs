/**
 * Individual, side-effect-scoped AI-readiness checks (TIFO-16).
 *
 * Every check function takes a `ctx` object (see check.mjs for its shape)
 * and returns `{ id, title, status: 'pass' | 'fail' | 'skip', details, errors }`.
 * Checks never mutate files and never make network calls; the only
 * exception is the SSR trio (`checkRealUnknownRoute404`,
 * `checkSsrContentQuality`, `checkSsrCrawlerSemantics`) which talks to a
 * server process *this same run* started on 127.0.0.1 via
 * `startLocalSsrServer`, never a remote host and never a backend.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  extractLlmsLinks,
  validateLlmsTxt,
  validateNginxMachineFileContentTypes,
} from '../validate-llms-txt.mjs';
import { validateRegistry, extractCaseStudySlugs } from '../claim-evidence/validate-registry.mjs';
import { buildLinkGraph } from './link-graph.mjs';

function ok(id, title, details) {
  return { id, title, status: 'pass', details, errors: [] };
}
function fail(id, title, errors, details) {
  return { id, title, status: 'fail', details, errors };
}
function skip(id, title, reason) {
  return { id, title, status: 'skip', details: reason, errors: [] };
}

/**
 * Split a site path into locale + locale-independent path. English is
 * unprefixed, Arabic lives under /ar (see src/app/core/i18n/locale-routing.ts).
 */
function splitLocalePath(path) {
  if (path === '/ar') return { locale: 'ar', path: '/' };
  if (path.startsWith('/ar/')) return { locale: 'ar', path: path.slice(3) };
  return { locale: 'en', path };
}

/**
 * Locale-independent paths exported as `NOINDEX_ROUTES` by route-metadata.ts
 * (2026-09-02 AI-readiness reconciliation): reachable for humans, marked
 * `robots: noindex, follow`, and deliberately absent from sitemap.xml and
 * llms.txt. Returns `null` when the export is missing so callers fail closed
 * instead of silently treating "unknown" as "nothing is noindex".
 */
export function extractNoindexRoutes(routeMetadataTs) {
  const match = routeMetadataTs.match(/export\s+const\s+NOINDEX_ROUTES\b[^=]*=\s*\[([\s\S]*?)\]/);
  if (!match) return null;
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/**
 * Route paths declared in SERVICE_ENTITY_KEYS / FAQ_ENTITY_KEYS
 * (entity-taxonomy.ts). Parsed the same way as NOINDEX_ROUTES: the checks are
 * plain Node and cannot import the TypeScript source.
 *
 * Returns null when the export is gone, so callers can fail closed rather than
 * quietly verify an empty list.
 */
export function extractTopLevelMapKeys(taxonomyTs, exportName) {
  const start = taxonomyTs.indexOf(`export const ${exportName}`);
  if (start === -1) return null;
  const open = taxonomyTs.indexOf('{', taxonomyTs.indexOf('=', start));
  if (open === -1) return null;
  // Walk to the matching brace so a nested object cannot end the scan early.
  let depth = 0;
  let end = -1;
  for (let i = open; i < taxonomyTs.length; i += 1) {
    if (taxonomyTs[i] === '{') depth += 1;
    else if (taxonomyTs[i] === '}') {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;
  const body = taxonomyTs.slice(open + 1, end);
  // Only keys at depth 0 of this object are route paths.
  const keys = [];
  let nesting = 0;
  for (const line of body.split('\n')) {
    if (nesting === 0) {
      const m = line.match(/^\s*'([^']+)'\s*:/);
      if (m) keys.push(m[1]);
    }
    nesting += (line.match(/[{[]/g) ?? []).length - (line.match(/[}\]]/g) ?? []).length;
  }
  return keys;
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

  // The full set implementing the stated "AI training crawlers opted out"
  // policy: GPTBot (OpenAI training), ClaudeBot (Anthropic training), CCBot
  // (Common Crawl — the largest single training corpus), Google-Extended
  // (Gemini training; does not affect Googlebot search indexing),
  // Applebot-Extended (Apple foundation models), meta-externalagent (Meta
  // training), Bytespider (ByteDance; frequently ignores robots.txt, listed
  // for policy completeness).
  const aiTrainingBots = [
    'GPTBot',
    'ClaudeBot',
    'CCBot',
    'Google-Extended',
    'Applebot-Extended',
    'meta-externalagent',
    'Bytespider',
  ];
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

  // NOINDEX_ROUTES (2026-09-02 AI-readiness reconciliation): the only routes
  // allowed to be prerendered yet absent from the sitemap. Fail closed when
  // the export is gone — an empty list would silently re-legitimise every
  // placeholder page as indexable.
  const noindexRoutes = extractNoindexRoutes(routeMetadataTs);
  if (noindexRoutes === null) {
    errors.push('route-metadata.ts no longer exports NOINDEX_ROUTES — noindex/sitemap exclusion of placeholder pages cannot be verified.');
  }
  const noindexSet = new Set(noindexRoutes ?? []);

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

  for (const sitemapPath of sitemapPaths) {
    // ROUTE_METADATA is keyed by locale-independent paths: /about and
    // /ar/about resolve the same entry through the active language.
    const { path } = splitLocalePath(sitemapPath);
    // A noindex route in the sitemap contradicts itself: the sitemap invites
    // crawling while the page refuses indexing.
    if (noindexSet.has(path)) {
      errors.push(`Sitemap lists "${sitemapPath}", which is a NOINDEX route (route-metadata.ts NOINDEX_ROUTES) — noindex pages must not be in sitemap.xml.`);
      continue;
    }
    if (registeredKeys.includes(path)) continue;
    if (selfResolvingRoutes.has(path)) continue;
    if (isSelfResolvingDynamicDetail(path)) continue;
    if (pendingGaps.includes(path)) continue;
    errors.push(`Sitemap route "${sitemapPath}" has no ROUTE_METADATA entry, is not a documented self-resolving route, and is not listed in PENDING_ROUTE_METADATA_GAPS.`);
  }

  // Locale parity. A page that exists in one locale and not the other is the
  // failure mode this whole change exists to prevent: a reader following an
  // Arabic link into a 404, or an Arabic page no sitemap ever announces.
  const byLocale = { en: new Set(), ar: new Set() };
  for (const sitemapPath of sitemapPaths) {
    const { locale, path } = splitLocalePath(sitemapPath);
    byLocale[locale].add(path);
  }
  for (const path of byLocale.en) {
    if (!byLocale.ar.has(path)) {
      errors.push(`Sitemap lists "${path}" in English but has no Arabic mirror ("/ar${path === '/' ? '' : path}").`);
    }
  }
  for (const path of byLocale.ar) {
    if (!byLocale.en.has(path)) {
      errors.push(`Sitemap lists Arabic "/ar${path === '/' ? '' : path}" with no English original ("${path}").`);
    }
  }

  // Every sitemap URL must carry the full hreflang alternate set, or the two
  // locales read as competing duplicates rather than one page in two
  // languages.
  const urlBlocks = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '(unknown)';
    for (const hreflang of ['en', 'ar', 'x-default']) {
      if (!block.includes(`hreflang="${hreflang}"`)) {
        errors.push(`Sitemap entry "${loc}" is missing its hreflang="${hreflang}" alternate.`);
      }
    }
  }

  // Route registry (serverRoutes) prerendered static paths must match the
  // sitemap set exactly (excluding admin/parameterized/wildcard entries).
  const serverStaticPaths = [...serverRoutesTs.matchAll(/\{\s*path:\s*'([^']*)',\s*renderMode:\s*RenderMode\.Prerender\s*\}/g)]
    .map((m) => (m[1] === '' ? '/' : `/${m[1]}`));

  const sitemapSet = new Set(sitemapPaths);
  const serverSet = new Set(serverStaticPaths);
  for (const path of serverStaticPaths) {
    if (!sitemapSet.has(path)) {
      // Allowed to be absent only when the locale-independent path is a
      // declared NOINDEX route; anything else is an unannounced page.
      if (noindexSet.has(splitLocalePath(path).path)) continue;
      errors.push(`Prerendered static route "${path}" (app.routes.server.ts) is missing from sitemap.xml and is not listed in NOINDEX_ROUTES.`);
    }
  }

  // Every NOINDEX entry must still name a real route in both locales, or the
  // list drifts into a stale allowlist nobody notices.
  const allServerRoutePaths = new Set(
    [...serverRoutesTs.matchAll(/\{\s*path:\s*'([^']*)',\s*renderMode:\s*RenderMode\.\w+\s*\}/g)]
      .map((m) => (m[1] === '' ? '/' : `/${m[1]}`)),
  );
  for (const route of noindexSet) {
    for (const localized of [route, `/ar${route}`]) {
      if (!allServerRoutePaths.has(localized)) {
        errors.push(`NOINDEX_ROUTES lists "${route}" but app.routes.server.ts has no route for "${localized}" — stale entry.`);
      }
    }
  }

  // llms.txt is a discovery file for AI assistants: linking a noindex page
  // from it is the same contradiction as listing it in the sitemap.
  const llmsPath = join(ctx.publicDir, 'llms.txt');
  if (existsSync(llmsPath)) {
    for (const url of extractLlmsLinks(readFileSync(llmsPath, 'utf8'))) {
      if (!(url === ctx.origin || url.startsWith(`${ctx.origin}/`))) continue;
      const linkPath = url.slice(ctx.origin.length) || '/';
      if (noindexSet.has(splitLocalePath(linkPath).path)) {
        errors.push(`llms.txt links to "${url}", which is a NOINDEX route — remove it from llms.txt until the page has indexable content.`);
      }
    }
  }
  // Extract dynamic server routes (industries/:id, services/:id, etc.) to
  // verify that sitemap detail pages are covered by a matching Server route.
  const serverRenderedPaths = [...serverRoutesTs.matchAll(/\{\s*path:\s*'([^']+)',\s*renderMode:\s*RenderMode\.Server\s*\}/g)]
    .map((m) => m[1]);
  const serverDynamicPatterns = serverRenderedPaths.filter((p) => p.includes(':'));

  // API-backed listing pages are deliberately RenderMode.Server, not
  // prerendered: prerendering them bakes an empty build-time state (no
  // backend at build time) into static HTML forever (2026-09-01 audit, P1).
  // They stay in the sitemap because they are served per request; verify each
  // is actually registered as a static (non-parameterized) Server route in
  // both locales.
  const serverRenderedListings = ['/resources/blog'];
  const serverRenderedListingSet = new Set();
  for (const listing of serverRenderedListings) {
    const bare = listing.slice(1);
    for (const candidate of [bare, `ar/${bare}`]) {
      if (serverRenderedPaths.includes(candidate)) {
        serverRenderedListingSet.add(`/${candidate}`);
      } else {
        errors.push(`Server-rendered listing "${listing}" is not registered as a RenderMode.Server route for "${candidate}" in app.routes.server.ts.`);
      }
    }
  }

  const isCoveredByDynamicRoute = (sitemapPath) => {
    const { path } = splitLocalePath(sitemapPath);
    for (const pattern of serverDynamicPatterns) {
      const localeIndependentPattern = pattern.startsWith('ar/') ? pattern.slice(3) : pattern;
      // Convert :param to regex segment (e.g., industries/:id -> industries/[^/]+)
      const regex = new RegExp(`^/${localeIndependentPattern.replace(/:[^/]+/g, '[^/]+')}$`);
      if (regex.test(path)) return true;
    }
    return false;
  };

  for (const sitemapPath of sitemapPaths) {
    // Dynamic detail pages are server-rendered per request in both locales,
    // so they are never in the prerendered set. Check they're covered by a
    // dynamic RenderMode.Server route instead.
    const { path } = splitLocalePath(sitemapPath);
    if (path.startsWith('/resources/blog/') && path !== '/resources/blog') continue;
    if (path.startsWith('/resources/case-studies/') && path !== '/resources/case-studies') continue;
    // Industry detail pages are now server-rendered via industries/:id
    if (path.startsWith('/industries/') && path !== '/industries') {
      if (!isCoveredByDynamicRoute(sitemapPath)) {
        errors.push(`Sitemap route "${sitemapPath}" is not covered by any RenderMode.Server dynamic route in app.routes.server.ts.`);
      }
      continue;
    }
    if (serverRenderedListingSet.has(sitemapPath)) continue;
    if (!serverSet.has(sitemapPath)) {
      errors.push(`Sitemap route "${sitemapPath}" is not a prerendered static route in app.routes.server.ts.`);
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${registeredKeys.length} registered metadata route(s), ${serverStaticPaths.length} prerendered route(s) reconciled against ${sitemapPaths.length} sitemap route(s); ${noindexSet.size} NOINDEX route(s) kept out of sitemap.xml and llms.txt.`);
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

  // Breadcrumb labels are translated copy resolved at render time, so a key
  // that is missing, empty, or English-only would ship a raw key (or an
  // English label on an Arabic page) straight into the structured data. That
  // is invisible in the built HTML unless something asserts it here.
  const breadcrumbMapMatch = entityTaxonomyTs.match(/BREADCRUMB_LABEL_KEYS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!breadcrumbMapMatch) {
    errors.push('entity-taxonomy.ts no longer exports a BREADCRUMB_LABEL_KEYS map — breadcrumb coverage cannot be verified.');
  } else {
    const breadcrumbEntries = [...breadcrumbMapMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g)]
      .map((m) => ({ path: m[1], key: m[2] }));
    if (breadcrumbEntries.length === 0) {
      errors.push('BREADCRUMB_LABEL_KEYS is empty — no route would emit a BreadcrumbList.');
    }

    const locales = ['en', 'ar'];
    const dictionaries = Object.fromEntries(
      locales.map((locale) => [locale, readJson(join(ctx.root, `src/assets/i18n/${locale}.json`))]),
    );
    const resolve = (dictionary, dottedKey) =>
      dottedKey.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dictionary);

    for (const { path, key } of breadcrumbEntries) {
      for (const locale of locales) {
        const value = resolve(dictionaries[locale], key);
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push(`Breadcrumb label for "${path}" ("${key}") does not resolve to non-empty text in ${locale}.json.`);
        }
      }
    }

    // Every registered metadata route should be reachable in a breadcrumb;
    // an unlabelled ancestor silently truncates its children's chains.
    const routeMetadataTs = readFileSync(join(ctx.srcApp, 'core/seo/route-metadata.ts'), 'utf8');
    const routeMetadataMatch = routeMetadataTs.match(/ROUTE_METADATA[^=]*=\s*\{([\s\S]*)\n\};/);
    const metadataPaths = routeMetadataMatch
      ? [...routeMetadataMatch[1].matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map((m) => m[1])
      : [];
    const labelled = new Set(breadcrumbEntries.map((entry) => entry.path));
    for (const path of metadataPaths) {
      if (!labelled.has(path)) {
        errors.push(`Route "${path}" has registry metadata but no BREADCRUMB_LABEL_KEYS entry, so it emits no BreadcrumbList.`);
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
    : ok(
        id,
        title,
        `${routeKeys.length} route(s) registered in ROUTE_ENTITY_MAP; ` +
          `${breadcrumbMapMatch ? [...breadcrumbMapMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g)].length : 0} breadcrumb label(s) resolving in en+ar; ` +
          'no hard-excluded tokens in service descriptions; uptime scope claim verified.',
      );
}

export function checkPentestV2Canonicalization(ctx) {
  const id = 'pentest-v2-canonicalization';
  const title = 'pentest-v2 redirects to canonical penetration-testing';
  const errors = [];

  // Verify pentest-v2 is a redirect in app.routes.ts (client-side fallback)
  const appRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.ts'), 'utf8');
  const hasClientRedirect = /path:\s*'services\/security\/pentest-v2'[\s\S]*?redirectTo:\s*'services\/security\/penetration-testing'/.test(appRoutesTs);
  if (!hasClientRedirect) {
    errors.push('app.routes.ts does not redirect pentest-v2 to penetration-testing (client fallback).');
  }

  // Verify server.ts has permanent 301 redirects for pentest-v2 (both locales)
  const serverTs = readFileSync(join(ctx.root, 'src/server.ts'), 'utf8');
  const hasEnServerRedirect = /app\.get\s*\(\s*['"]\/services\/security\/pentest-v2['"]/.test(serverTs) &&
    /res\.redirect\s*\(\s*301\s*,\s*['"]\/services\/security\/penetration-testing['"]/.test(serverTs);
  const hasArServerRedirect = /app\.get\s*\(\s*['"]\/ar\/services\/security\/pentest-v2['"]/.test(serverTs) &&
    /res\.redirect\s*\(\s*301\s*,\s*['"]\/ar\/services\/security\/penetration-testing['"]/.test(serverTs);
  if (!hasEnServerRedirect) {
    errors.push('server.ts does not have a 301 redirect for /services/security/pentest-v2.');
  }
  if (!hasArServerRedirect) {
    errors.push('server.ts does not have a 301 redirect for /ar/services/security/pentest-v2.');
  }

  // Verify pentest-v2 is NOT in sitemap.xml
  const sitemapXml = readFileSync(join(ctx.publicDir, 'sitemap.xml'), 'utf8');
  if (sitemapXml.includes('pentest-v2')) {
    errors.push('sitemap.xml still contains pentest-v2 (should be removed after canonicalization).');
  }

  // Verify pentest-v2 is NOT in app.routes.server.ts prerender list
  const serverRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.server.ts'), 'utf8');
  if (/pentest-v2.*Prerender/.test(serverRoutesTs)) {
    errors.push('app.routes.server.ts still prerenders pentest-v2 (should be removed after canonicalization).');
  }

  // Verify canonical penetration-testing route exists and is prerendered
  if (!serverRoutesTs.includes("'services/security/penetration-testing'")) {
    errors.push('app.routes.server.ts does not prerender the canonical penetration-testing route.');
  }

  // Verify pentest-v2 is NOT in route-metadata.ts (except as comment)
  const routeMetadataTs = readFileSync(join(ctx.srcApp, 'core/seo/route-metadata.ts'), 'utf8');
  // Look for pentest-v2 as a registered route key, not just in comments
  if (/^\s*'\/services\/security\/pentest-v2':/m.test(routeMetadataTs)) {
    errors.push('route-metadata.ts still registers pentest-v2 as a metadata route (should be removed).');
  }

  // Verify pentest-v2 is NOT in breadcrumb labels (except as comment)
  const entityTaxonomyTs = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');
  if (/^\s*'\/services\/security\/pentest-v2':/m.test(entityTaxonomyTs)) {
    errors.push('entity-taxonomy.ts BREADCRUMB_LABEL_KEYS still registers pentest-v2 (should be removed).');
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, 'pentest-v2 correctly redirects to penetration-testing via server 301; client fallback present; removed from sitemap, prerender, metadata, and breadcrumbs.');
}

export function checkIndustryRouteIntegrity(ctx) {
  const id = 'industry-route-integrity';
  const title = 'industry registered routes/registry/404 integrity';
  const errors = [];

  // Import the approved industry IDs from the TypeScript registry.
  // We parse it as text since the evidence check runs in Node/mjs context.
  const industryRegistryTs = readFileSync(
    join(ctx.srcApp, 'core/seo/industry-registry.ts'),
    'utf8',
  );

  // Extract the 6 approved industry IDs from the registry
  const approvedIdMatches = [...industryRegistryTs.matchAll(/id:\s*'([^']+)'/g)];
  const approvedIds = approvedIdMatches.map((m) => m[1]);
  if (approvedIds.length !== 6) {
    errors.push(`industry-registry.ts does not have exactly 6 approved industry IDs (found ${approvedIds.length}).`);
  }

  const expectedIds = ['finance', 'healthcare', 'government', 'manufacturing', 'retail', 'education'];
  for (const expectedId of expectedIds) {
    if (!approvedIds.includes(expectedId)) {
      errors.push(`industry-registry.ts is missing the expected industry ID "${expectedId}".`);
    }
  }
  for (const approvedId of approvedIds) {
    if (!expectedIds.includes(approvedId)) {
      errors.push(`industry-registry.ts contains unexpected industry ID "${approvedId}".`);
    }
  }

  // Verify industry detail component imports and uses the registry
  const industryDetailTs = readFileSync(
    join(ctx.srcApp, 'features/industries/industry-detail/industry-detail.component.ts'),
    'utf8',
  );
  if (!industryDetailTs.includes('isValidIndustryId')) {
    errors.push('industry-detail.component.ts does not import/use isValidIndustryId from the closed registry.');
  }
  if (!industryDetailTs.includes('RESPONSE_INIT')) {
    errors.push('industry-detail.component.ts does not inject RESPONSE_INIT for setting HTTP 404 status.');
  }

  // Check sitemap contains all 6 industry routes (both locales)
  const sitemapXml = readFileSync(join(ctx.publicDir, 'sitemap.xml'), 'utf8');
  const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  for (const industryId of approvedIds) {
    const enUrl = `${ctx.origin}/industries/${industryId}`;
    const arUrl = `${ctx.origin}/ar/industries/${industryId}`;
    if (!sitemapUrls.has(enUrl)) {
      errors.push(`Industry "${industryId}" EN route is missing from sitemap.xml (expected ${enUrl}).`);
    }
    if (!sitemapUrls.has(arUrl)) {
      errors.push(`Industry "${industryId}" AR route is missing from sitemap.xml (expected ${arUrl}).`);
    }
  }

  // Check app.routes.server.ts has industry dynamic server routes (not prerender)
  // Industry detail pages are served via industries/:id with a closed registry
  // that returns a real 404 for unknown IDs via RESPONSE_INIT.
  const serverRoutesTs = readFileSync(join(ctx.srcApp, 'app.routes.server.ts'), 'utf8');
  const hasEnDynamicRoute = /\{\s*path:\s*'industries\/:id',\s*renderMode:\s*RenderMode\.Server\s*\}/.test(serverRoutesTs);
  const hasArDynamicRoute = /\{\s*path:\s*'ar\/industries\/:id',\s*renderMode:\s*RenderMode\.Server\s*\}/.test(serverRoutesTs);
  if (!hasEnDynamicRoute) {
    errors.push('app.routes.server.ts does not have RenderMode.Server for "industries/:id" (EN).');
  }
  if (!hasArDynamicRoute) {
    errors.push('app.routes.server.ts does not have RenderMode.Server for "ar/industries/:id" (AR).');
  }

  // Check route-metadata has all 6 industry pages
  const routeMetadataTs = readFileSync(join(ctx.srcApp, 'core/seo/route-metadata.ts'), 'utf8');
  for (const industryId of approvedIds) {
    const route = `/industries/${industryId}`;
    if (!routeMetadataTs.includes(`'${route}':`)) {
      errors.push(`route-metadata.ts is missing ROUTE_METADATA entry for "${route}".`);
    }
  }

  // Check breadcrumb labels exist for all 6 industry pages
  const entityTaxonomyTs = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');
  for (const industryId of approvedIds) {
    const route = `/industries/${industryId}`;
    if (!entityTaxonomyTs.includes(`'${route}':`)) {
      errors.push(`entity-taxonomy.ts BREADCRUMB_LABEL_KEYS is missing entry for "${route}".`);
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${approvedIds.length} approved industry ID(s) registered in routing, sitemap, metadata, and breadcrumbs; closed registry enforced in component with RESPONSE_INIT 404.`);
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
  // The wildcard route must be server-rendered. The HTTP 404 status is set by
  // NotFoundComponent via RESPONSE_INIT injection (Angular SSR doesn't accept
  // status: 404 in route config; it only allows redirect status codes).
  const wildcardIsServerRendered = /path:\s*'\*\*',\s*renderMode:\s*RenderMode\.Server/.test(serverRoutesTs);
  if (!wildcardIsServerRendered) {
    errors.push('app.routes.server.ts wildcard "**" route is not configured for RenderMode.Server.');
  }
  // Verify NotFoundComponent sets the 404 status via RESPONSE_INIT
  const notFoundTs = readFileSync(join(ctx.srcApp, 'features/not-found/not-found.component.ts'), 'utf8');
  const notFoundSets404 = /RESPONSE_INIT/.test(notFoundTs) && /responseInit\.status\s*=\s*404/.test(notFoundTs);
  if (!notFoundSets404) {
    errors.push('NotFoundComponent does not set HTTP 404 status via RESPONSE_INIT (required for SSR 404 responses).');
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
  const publicSurfaceFiles = {
    'src/assets/i18n/en.json': readFileSync(join(ctx.root, 'src/assets/i18n/en.json'), 'utf8'),
    'src/assets/i18n/ar.json': readFileSync(join(ctx.root, 'src/assets/i18n/ar.json'), 'utf8'),
    'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html': readFileSync(join(ctx.root, 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html'), 'utf8'),
  };
  const { errors: schemaErrors } = validateRegistry(registryJson, { caseStudySlugs, publicSurfaceFiles });
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

/**
 * Figures and phrases that must not reach any published page or shipped
 * translation asset, with the reason a reader can act on.
 *
 * Added by the 2026-09-02 AI-readiness reconciliation after two live escapes
 * that every existing gate passed: /services/sap published "99.95% uptime
 * guarantee" (an unregistered figure — the homepage rule that catches "99.95"
 * only reads / and /ar), and dist shipped src/assets/i18n/*.json.backup, a
 * December-2025 snapshot served at https://roaya.co/assets/i18n/en.json.backup
 * carrying claims the registry blocks. Page-scoped assertions cannot catch a
 * claim on a page nobody thought to assert on, so this sweep reads the whole
 * build instead.
 */
export const BLOCKED_PUBLISHED_PATTERNS = [
  {
    pattern: /99\.95/,
    reason: 'unregistered uptime figure — the site-wide figure is 99.9%; 99.99% is scoped to WorldPosta CloudEdge/Posta only (claim registry)',
  },
  {
    pattern: /military[-\s]?grade/i,
    reason: 'vague security puffery — name the actual control and its scope instead (2026-09-02 action plan, P0.3)',
  },
  {
    pattern: /guaranteed ROI/i,
    reason: 'blocked promotional claim (no evidence on file)',
  },
  {
    pattern: /first IT provider/i,
    reason: 'blocked superlative market claim (no evidence on file)',
  },
  {
    pattern: /15-Minute Response Guaranteed/i,
    reason: 'blocked response-time claim contradicting the published support wording',
  },
];

/**
 * Every published artefact a crawler or reader can fetch from the build: the
 * prerendered pages and the translation assets the running app loads.
 */
function publishedBuildArtefacts(browserDistDir) {
  const entries = readdirSync(browserDistDir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .filter((file) => {
      const rel = relative(browserDistDir, file);
      if (rel.endsWith('index.html')) return true;
      return rel.startsWith(join('assets', 'i18n'));
    });
}

/** Blocked patterns found in one artefact's text. */
export function assessPublishedText(text) {
  return BLOCKED_PUBLISHED_PATTERNS.filter(({ pattern }) => pattern.test(text));
}

/**
 * The single founding year, and every figure derived from it.
 *
 * The company fact that cost the most credibility was not a missing page: it
 * was the About page saying "Founded in 2012" in its story and "2018 — Company
 * Founded" in its own timeline, twenty lines apart. An external reviewer read
 * the timeline and reported Roaya as founded in 2018, and the homepage's "10+
 * Years Experience" agreed with neither. Six surfaces state or derive this one
 * fact, and nothing made them agree.
 *
 * `ORGANIZATION_FOUNDING_DATE` is the source. Everything else must follow it,
 * including the two "years experience" figures, which must be the same number
 * and must be the years actually elapsed. When the year rolls over, this check
 * fails and names the files to bump — that is the intended behaviour: a site
 * claiming "14+ years" in 2027 is stale, not merely unverified.
 *
 * Added by the 2026-09-02 AI-readiness reconciliation (action plan P0.2,
 * "no unresolved material date discrepancy across controlled channels"),
 * after the product owner reconfirmed 2012.
 */
/**
 * Critical-path budget, measured from the build rather than from a lab run.
 *
 * The action plan sets LCP and TBT milestones, which need Lighthouse on agreed
 * hardware and cannot run here. What CAN be checked on every build is the
 * input those numbers come from: how many bytes and how many blocking requests
 * the first paint waits for. This gate holds that line so a regression is
 * caught at the commit that causes it, not at the next audit.
 *
 * Budgets are the current measured values plus deliberate headroom, so they
 * ratchet: raising one is an explicit decision, in the diff, with a reason.
 */
const CRITICAL_PATH_BUDGET = {
  /**
   * Sum of initial JS + CSS the browser must fetch before the app runs.
   *
   * 260 kB is the measured baseline (253.4 kB on 2026-09-02) plus headroom,
   * not a target: it is Angular's framework, router, forms, http, i18n and
   * hydration plus the app shell, and no single dependency dominates it —
   * GSAP, Three, Sentry, Quill and Chart.js are all already lazy. It is set
   * here so a REGRESSION fails the build. Bringing the number down needs the
   * app shell split, which is its own change with its own measurement.
   */
  maxInitialTransferBytes: 260 * 1024,
  /** Render-blocking stylesheets from other origins, before first paint. */
  maxBlockingExternalStylesheets: 1,
  /** Font families on the critical path. Each costs a face set. */
  maxCriticalFontFamilies: 2,
  /**
   * Inlined @font-face CSS in the HTML shell. The build has
   * optimization.fonts enabled, so a requested family is not a lazy download:
   * its faces are written into every HTML document. Four families cost 21 kB
   * per page before two of them — used only by lazy routes — were moved out.
   */
  maxInlineFontCssBytes: 12 * 1024,
};

/** Approximate transfer size: gzip is what the server negotiates. */
async function gzipSize(path) {
  const { gzipSync } = await import('node:zlib');
  return gzipSync(readFileSync(path), { level: 9 }).length;
}

/**
 * Service Facts integrity and coverage (P1.1).
 *
 * The facts model is only worth having if a `published` entry cannot outrun
 * its evidence. This check enforces exactly that, and reports coverage so the
 * gap between "we describe our services" and "a buyer can act on what we
 * publish" is a number in the build output rather than a feeling.
 *
 * Rules:
 *   - a published fact carries a value: an i18n key that resolves in BOTH
 *     locales, or a literal;
 *   - a published fact naming an availability figure carries a `claimId`, and
 *     that claim is `verified` in the registry — an unregistered SLA is the
 *     single most repeated finding in every audit of this site;
 *   - a pending fact names the decision that unblocks it, and that document
 *     exists;
 *   - every service route with a Service node has a facts record, so adding a
 *     service page cannot silently skip the model.
 */
/**
 * Internal link graph (P1.6).
 *
 * Metadata correctness says nothing about discoverability. A page can be in the
 * sitemap, carry perfect canonical and schema, and still be reachable only by
 * typing its URL — crawlers and assistants find pages by following links, and
 * a page nothing links to reads as one the site itself does not consider
 * important.
 *
 * This is not hypothetical here. The 2026-09-03 report found /services/worldposta
 * orphaned and the /resources hub unreachable: their only routes were the
 * desktop mega-menu and the mobile drawer, and neither renders an anchor in the
 * server HTML. The sitemap listed both the whole time.
 *
 * Judged over indexable pages only. A route deliberately kept out of the
 * sitemap — the noindex placeholders — is meant to be undiscoverable, and
 * reporting the intended state as a fault would train people to ignore this.
 */
/**
 * Per-page metadata, as rendered, across every indexable URL.
 *
 * `canonical-metadata-coverage` reconciles the route registry against the
 * sitemap — it proves an entry EXISTS. This proves the entry is any good: that
 * the page does not fall back to the site-wide default, that its description
 * was written rather than sliced out of body copy, and that no two pages claim
 * to be the same thing.
 *
 * The 2026-09-03 sweep found the difference. Every page had metadata and the
 * registry check passed, yet the legal pages' descriptions were the first ~155
 * characters of a legal paragraph cut off mid-sentence, and the SOC page's
 * title was the hero tagline "Stop Chasing Alerts. Focus on Real Risks." — a
 * slogan that never names the service someone searched for.
 *
 * Lengths are measured with HTML entities decoded: `&amp;` is five characters
 * of markup and one character of title.
 */
const METADATA_LIMITS = {
  maxTitleChars: 65,
  maxDescriptionChars: 165,
};

const DEFAULT_TITLE = 'Roaya IT - Enterprise IT Solutions & Services';
const DEFAULT_DESCRIPTION_PREFIX = 'Roaya IT provides enterprise-grade IT solutions';

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

export async function checkPageMetadataQuality(ctx) {
  const id = 'page-metadata-quality';
  const title = 'every indexable page renders its own written title, description and social metadata';
  if (!existsSync(ctx.serverEntryFile)) {
    return skip(id, title, `No production SSR server build found at ${relative(ctx.root, ctx.serverEntryFile)} — run "npm run build:prod" first.`);
  }

  const sitemapXml = readFileSync(join(ctx.publicDir, 'sitemap.xml'), 'utf8');
  const paths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(ctx.origin, '') || '/');

  const port = ctx.serverPort + 3;
  const server = await startLocalSsrServer(ctx, port);
  const errors = [];
  const titles = new Map();
  const descriptions = new Map();
  try {
    if (!server.up) {
      return fail(id, title, [server.notReadyError]);
    }

    for (const path of paths) {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: sitemap URL returned HTTP ${res.status}.`);
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const html = await res.text();
      const read = (re) => decodeEntities(html.match(re)?.[1] ?? '').replace(/\s+/g, ' ').trim();

      const pageTitle = read(/<title>([^<]*)<\/title>/);
      const description = read(/<meta name="description" content="([^"]*)"/);

      if (!pageTitle) errors.push(`${path}: no <title>.`);
      else if (pageTitle === DEFAULT_TITLE) errors.push(`${path}: renders the site-wide default title — no route metadata was applied.`);
      else if (pageTitle.length > METADATA_LIMITS.maxTitleChars) errors.push(`${path}: title is ${pageTitle.length} characters (limit ${METADATA_LIMITS.maxTitleChars}); result pages truncate it.`);

      if (!description) errors.push(`${path}: no meta description.`);
      else if (description.startsWith(DEFAULT_DESCRIPTION_PREFIX)) errors.push(`${path}: renders the site-wide default description.`);
      else if (description.length > METADATA_LIMITS.maxDescriptionChars) errors.push(`${path}: description is ${description.length} characters (limit ${METADATA_LIMITS.maxDescriptionChars}).`);
      // A trailing ellipsis means the description is body copy sliced to fit
      // rather than a sentence written to be the description.
      else if (/[…]$|\.\.\.$/.test(description)) errors.push(`${path}: description ends mid-sentence — it is body copy truncated to fit, not a written description. Give the route its own metaDescription key.`);

      const canonical = read(/<link rel="canonical" href="([^"]*)"/);
      const expected = `${ctx.origin}${path === '/' ? '/' : path}`;
      if (canonical !== expected) errors.push(`${path}: canonical is ${canonical || '(none)'}, expected ${expected}.`);
      if (read(/property="og:url" content="([^"]*)"/) !== canonical) errors.push(`${path}: og:url does not match the canonical.`);
      for (const [label, re] of [
        ['og:title', /property="og:title" content="([^"]*)"/],
        ['og:description', /property="og:description" content="([^"]*)"/],
        ['og:image', /property="og:image" content="([^"]*)"/],
        ['twitter:card', /name="twitter:card" content="([^"]*)"/],
      ]) {
        if (!read(re)) errors.push(`${path}: no ${label}.`);
      }

      if (pageTitle) titles.set(pageTitle, [...(titles.get(pageTitle) ?? []), path]);
      if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), path]);
    }

    // Two pages sharing a title or description tell a search engine they are
    // the same page, and give an assistant no way to tell them apart.
    for (const [value, pages] of titles) {
      if (pages.length > 1) errors.push(`Duplicate <title> "${value.slice(0, 50)}" on: ${pages.join(', ')}.`);
    }
    for (const [value, pages] of descriptions) {
      if (pages.length > 1) errors.push(`Duplicate description on: ${pages.join(', ')}.`);
    }

    return errors.length
      ? fail(id, title, errors)
      : ok(id, title, `${paths.length} indexable URL(s): each renders its own title and written description within length, a self-referencing canonical matching og:url, and complete Open Graph and Twitter metadata. No duplicates.`);
  } finally {
    server.stop();
  }
}

export function checkInternalLinkGraph(ctx) {
  const id = 'internal-link-graph';
  const title = 'every indexable page is reachable by following links, within three clicks';
  if (!existsSync(ctx.browserDistDir)) {
    return skip(id, title, `No production build found at ${relative(ctx.root, ctx.browserDistDir)} — run "npm run build:prod" first.`);
  }

  const graph = buildLinkGraph(ctx.browserDistDir, ctx.publicDir, ctx.origin);
  const errors = [];

  for (const route of graph.orphans) {
    errors.push(`${route}: in the sitemap, but no page on the site links to it. A crawler following links never arrives.`);
  }
  for (const route of graph.unreachable) {
    if (graph.orphans.includes(route)) continue;
    errors.push(`${route}: indexable but not reachable from either locale's home page by following anchors.`);
  }
  for (const route of graph.tooDeep) {
    errors.push(`${route}: ${graph.depth.get(route)} clicks from the home page; the agreed limit is three.`);
  }
  for (const link of graph.broken) {
    errors.push(`${link.from} links to ${link.to}, which is neither a built page nor a sitemap URL.`);
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(
        id,
        title,
        `${graph.routes.length} built route(s), ${graph.indexable.size} indexable: no orphans, none unreachable, none deeper than three clicks, no link pointing at a page that does not exist. ${graph.excluded.length} route(s) excluded from discovery on purpose.`,
      );
}

export function checkServiceFactsIntegrity(ctx) {
  const id = 'service-facts-integrity';
  const title = 'service facts are evidence-backed, bilingual, and cover every service route';
  const errors = [];

  const factsTs = readFileSync(join(ctx.srcApp, 'core/seo/service-facts.ts'), 'utf8');
  const taxonomyTs = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');
  const en = readJson(join(ctx.root, 'src/assets/i18n/en.json'));
  const ar = readJson(join(ctx.root, 'src/assets/i18n/ar.json'));
  const registry = readJson(join(ctx.claimEvidenceDir, 'registry.json'));
  const verifiedClaims = new Set(registry.claims.filter((c) => c.status === 'verified').map((c) => c.id));

  // Every i18n key the model publishes must resolve in both locales.
  const valueKeys = [...factsTs.matchAll(/valueKey:\s*'([^']+)'/g)].map((m) => m[1]);
  if (valueKeys.length === 0) {
    errors.push('service-facts.ts publishes no valueKey at all — either the model is empty or the parser no longer matches it.');
  }
  for (const key of valueKeys) {
    for (const [locale, bundle] of [['en', en], ['ar', ar]]) {
      const value = resolveDottedPath(bundle, key);
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`service-facts.ts publishes "${key}" but it does not resolve to a non-empty string in ${locale}.json — the ${locale} page would render a raw key.`);
      }
    }
  }

  // Field labels must exist too, or the table renders keys as terms.
  const fields = [...(factsTs.match(/export const SERVICE_FACT_FIELDS[^=]*=\s*\[([\s\S]*?)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (fields.length === 0) {
    errors.push('SERVICE_FACT_FIELDS could not be read from service-facts.ts.');
  }
  for (const field of fields) {
    for (const [locale, bundle] of [['en', en], ['ar', ar]]) {
      if (typeof resolveDottedPath(bundle, `serviceFacts.fields.${field}`) !== 'string') {
        errors.push(`No label for the "${field}" fact in ${locale}.json (serviceFacts.fields.${field}).`);
      }
    }
  }

  // An availability figure must trace to a verified claim.
  for (const block of factsTs.matchAll(/sla:\s*\{([^}]*)\}/g)) {
    const body = block[1];
    if (!body.includes("status: 'published'")) continue;
    const claimId = body.match(/claimId:\s*'([^']+)'/)?.[1];
    if (!claimId) {
      errors.push('A published SLA fact carries no claimId — an availability figure must trace to the claim registry before it is published.');
    } else if (!verifiedClaims.has(claimId)) {
      errors.push(`A published SLA fact cites claim "${claimId}", which is not verified in the registry.`);
    }
  }

  // Pending facts must name a decision document that exists.
  const decisionRefs = new Set();
  for (const constant of factsTs.matchAll(/const PENDING_[A-Z_]+ = '([^']+)'/g)) {
    decisionRefs.add(constant[1]);
  }
  for (const inline of factsTs.matchAll(/decisionRef:\s*'([^']+)'/g)) {
    decisionRefs.add(inline[1]);
  }
  if (decisionRefs.size === 0) {
    errors.push('No pending decision references found in service-facts.ts — either nothing is pending (unlikely) or the parser no longer matches.');
  }
  for (const ref of decisionRefs) {
    const [docPath] = ref.split('#');
    if (!existsSync(join(ctx.root, docPath))) {
      errors.push(`A pending fact points at "${docPath}", which does not exist — a gap with no owner is not tracked.`);
    }
  }

  // Every service route must appear in the model.
  const serviceRoutes = extractTopLevelMapKeys(taxonomyTs, 'SERVICE_ENTITY_KEYS') ?? [];
  const factPaths = new Set([...factsTs.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]));
  for (const m of factsTs.matchAll(/^\s*'(\/services\/[^']+)',?$/gm)) {
    factPaths.add(m[1]);
  }
  const uncovered = serviceRoutes.filter((route) => !factPaths.has(route));
  if (uncovered.length) {
    errors.push(`Service route(s) with no Service Facts record: ${uncovered.join(', ')}. Adding a service page must not skip the facts model.`);
  }

  // Object literals end the property with , or }; the interface declarations
  // end it with ; — counting those too would inflate the coverage figure.
  const published = [...factsTs.matchAll(/status: 'published'\s*[,}]/g)].length;
  const pending = [...factsTs.matchAll(/status: 'pending'\s*[,}]/g)].length;

  return errors.length
    ? fail(id, title, errors)
    : ok(
        id,
        title,
        `${serviceRoutes.length} service route(s) covered; ${published} published fact(s) (all evidence-backed and bilingual) and ${pending} pending, each naming the decision that unblocks it.`,
      );
}

export async function checkCriticalPathBudget(ctx) {
  const id = 'critical-path-budget';
  const title = 'initial transfer size and render-blocking requests within budget';
  if (!existsSync(ctx.browserDistDir)) {
    return skip(id, title, `No production build found at ${relative(ctx.root, ctx.browserDistDir)} — run "npm run build:prod" first.`);
  }

  const indexPath = join(ctx.browserDistDir, 'index.html');
  if (!existsSync(indexPath)) {
    return fail(id, title, ['Production build has no index.html — the critical path cannot be measured.']);
  }
  const html = readFileSync(indexPath, 'utf8');
  const errors = [];

  // Everything the browser must have before the app runs. index.html names the
  // entry points and modulepreloads the first level only; the rest arrive as
  // static ESM imports of those, so the graph has to be walked. Measuring just
  // the named files under-reports the real cost by about 90 kB here.
  const entries = [...html.matchAll(/<(?:script[^>]*\ssrc|link[^>]*\shref)="(\/?[^":]+\.(?:js|css))"/g)]
    .map((m) => m[1].replace(/^\//, ''));

  const initialAssets = [];
  const missing = [];
  const queue = [...new Set(entries)];
  while (queue.length > 0) {
    const asset = queue.shift();
    if (initialAssets.includes(asset)) continue;
    const assetPath = join(ctx.browserDistDir, asset);
    if (!existsSync(assetPath)) {
      missing.push(asset);
      continue;
    }
    initialAssets.push(asset);
    if (!asset.endsWith('.js')) continue;
    const source = readFileSync(assetPath, 'utf8');
    for (const m of source.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) {
      if (!initialAssets.includes(m[1])) queue.push(m[1]);
    }
  }

  let transferred = 0;
  for (const asset of initialAssets) {
    // eslint-disable-next-line no-await-in-loop
    transferred += await gzipSize(join(ctx.browserDistDir, asset));
  }
  if (missing.length) {
    errors.push(`index.html references built assets that are not in the build: ${missing.join(', ')}.`);
  }
  if (transferred > CRITICAL_PATH_BUDGET.maxInitialTransferBytes) {
    errors.push(
      `Initial transfer is ${(transferred / 1024).toFixed(1)} kB gzipped across ${initialAssets.length} file(s), over the ${(CRITICAL_PATH_BUDGET.maxInitialTransferBytes / 1024).toFixed(0)} kB budget. Split a route bundle or drop a dependency rather than raising the budget.`,
    );
  }

  // Cross-origin stylesheets block first paint and cost a connection. With
  // optimization.fonts on, the build replaces the Google Fonts <link> with
  // inlined @font-face rules, so this should normally find none — it stays as
  // the guard for inlining being switched off.
  const externalStylesheets = [...html.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => /\brel="stylesheet"/.test(tag) && /\bhref="https?:\/\//.test(tag))
    .filter((tag) => !/\bmedia="print"/.test(tag));
  if (externalStylesheets.length > CRITICAL_PATH_BUDGET.maxBlockingExternalStylesheets) {
    errors.push(
      `${externalStylesheets.length} render-blocking cross-origin stylesheet(s) in <head>, budget is ${CRITICAL_PATH_BUDGET.maxBlockingExternalStylesheets}. Each one delays first paint by a full connection plus download.`,
    );
  }

  // What the fonts actually cost here: @font-face rules written into every
  // HTML document, plus the font files each one points at.
  const fontFaces = [...html.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
  const inlineFontBytes = fontFaces.reduce((total, rule) => total + rule.length, 0);
  const families = new Set(
    fontFaces
      .map((rule) => rule.match(/font-family:\s*['"]?([^'";}]+)/)?.[1]?.trim())
      .filter(Boolean),
  );
  for (const tag of externalStylesheets) {
    const href = tag.match(/href="([^"]+)"/)?.[1] ?? '';
    for (const m of href.matchAll(/family=([^&:"]+)/g)) {
      families.add(decodeURIComponent(m[1].replace(/\+/g, ' ')));
    }
  }
  if (families.size > CRITICAL_PATH_BUDGET.maxCriticalFontFamilies) {
    errors.push(
      `${families.size} font families on the critical path (${[...families].join(', ')}), budget is ${CRITICAL_PATH_BUDGET.maxCriticalFontFamilies}. A family used by one route belongs in that route's own stylesheet, behind its fallback — inlining means every page pays for it otherwise.`,
    );
  }
  if (inlineFontBytes > CRITICAL_PATH_BUDGET.maxInlineFontCssBytes) {
    errors.push(
      `${(inlineFontBytes / 1024).toFixed(1)} kB of inlined @font-face CSS across ${fontFaces.length} face(s) in every HTML document, budget is ${(CRITICAL_PATH_BUDGET.maxInlineFontCssBytes / 1024).toFixed(0)} kB. Drop a weight the site never sets, or move a family to the route that uses it.`,
    );
  }

  // A preload for a URL the build inlines is an early hint for a request that
  // never happens.
  for (const tag of [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map((m) => m[0])) {
    const href = tag.match(/href="([^"]+)"/)?.[1] ?? '';
    if (/fonts\.googleapis\.com/.test(href) && fontFaces.length > 0) {
      errors.push('index.html preloads a Google Fonts stylesheet that the build inlines — the URL is never fetched, so the hint is wasted.');
    }
  }

  // Third-party tags must not block: they are outside our control and their
  // latency lands directly on the user's first paint.
  const blockingThirdParty = [...html.matchAll(/<script\b[^>]*\bsrc="https?:\/\/[^"]*"[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => !/\b(async|defer)\b/.test(tag));
  if (blockingThirdParty.length) {
    errors.push(`${blockingThirdParty.length} third-party <script src> tag(s) in index.html load synchronously — add async or defer.`);
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(
        id,
        title,
        `Initial transfer ${(transferred / 1024).toFixed(1)} kB gzipped across ${initialAssets.length} file(s) (budget ${(CRITICAL_PATH_BUDGET.maxInitialTransferBytes / 1024).toFixed(0)} kB); ${fontFaces.length} inlined font face(s) in ${(inlineFontBytes / 1024).toFixed(1)} kB covering ${families.size} famil(y/ies); ${externalStylesheets.length} blocking cross-origin stylesheet(s); no synchronous third-party scripts.`,
      );
}

export function checkCompanyFactsConsistency(ctx) {
  const id = 'company-facts-consistency';
  const title = 'founding year and derived experience figures agree across every surface';
  const errors = [];

  const taxonomy = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');
  const foundingMatch = taxonomy.match(/ORGANIZATION_FOUNDING_DATE\s*=\s*'(\d{4})'/);
  if (!foundingMatch) {
    return fail(id, title, ["entity-taxonomy.ts does not export ORGANIZATION_FOUNDING_DATE as a four-digit year literal — the founding year has no single source."]);
  }
  const foundingYear = Number(foundingMatch[1]);

  // The story paragraph and the timeline's first milestone are the two places
  // a reader sees the year in prose. They disagreed in production.
  const en = readJson(join(ctx.root, 'src/assets/i18n/en.json'));
  const ar = readJson(join(ctx.root, 'src/assets/i18n/ar.json'));
  for (const [locale, bundle] of [['en', en], ['ar', ar]]) {
    const story = String(resolveDottedPath(bundle, 'about.story.p1') ?? '');
    if (!story.includes(String(foundingYear))) {
      errors.push(`src/assets/i18n/${locale}.json#about.story.p1 does not state the founding year ${foundingYear}.`);
    }
    const otherYears = [...story.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0])).filter((y) => y !== foundingYear);
    if (otherYears.length) {
      errors.push(`src/assets/i18n/${locale}.json#about.story.p1 also names ${otherYears.join(', ')} — a second year in the founding sentence reads as a competing founding date.`);
    }
  }

  const aboutTs = readFileSync(join(ctx.srcApp, 'features/about/about.component.ts'), 'utf8');
  const milestoneYear = aboutTs.match(/year:\s*'(\d{4})'/)?.[1];
  if (milestoneYear !== String(foundingYear)) {
    errors.push(`about.component.ts first milestone year is ${milestoneYear ?? '(none)'}, not ${foundingYear} — the timeline contradicts the story paragraph on the same page (this is what an external reviewer read as the founding year).`);
  }

  const llmsTxt = readFileSync(join(ctx.publicDir, 'llms.txt'), 'utf8');
  if (!llmsTxt.includes(`founded in ${foundingYear}`)) {
    errors.push(`public/llms.txt does not say "founded in ${foundingYear}" — the machine-readable summary must carry the same year as the pages.`);
  }

  // Both "years experience" figures are derived, not independent facts.
  const elapsed = new Date().getFullYear() - foundingYear;
  const aboutYears = aboutTs.match(/value:\s*'(\d+)\+',\s*label:\s*'about\.stats\.years'/)?.[1];
  const homeTs = readFileSync(join(ctx.srcApp, 'features/home/home.component.ts'), 'utf8');
  const homeYears = homeTs.match(/value:\s*(\d+),\s*suffix:\s*'\+',\s*label:\s*'home\.stats\.experience'/)?.[1];

  for (const [where, value] of [['about.component.ts stats', aboutYears], ['home.component.ts stats', homeYears]]) {
    if (value === undefined) {
      errors.push(`${where}: could not read the years-experience figure — the founding year can no longer be checked against it.`);
    } else if (Number(value) !== elapsed) {
      errors.push(`${where} publishes ${value}+ years, but ${elapsed} years have elapsed since ${foundingYear}. Update both stats figures together.`);
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `Founding year ${foundingYear} is stated consistently in entity-taxonomy.ts, both about.story.p1 translations, the About timeline and llms.txt; both years-experience figures read ${elapsed}+.`);
}

export function checkPublishedClaimSweep(ctx) {
  const id = 'published-claim-sweep';
  const title = 'blocked figures and phrases absent from every built page and shipped translation asset';
  if (!existsSync(ctx.browserDistDir)) {
    return skip(id, title, `No production build found at ${relative(ctx.root, ctx.browserDistDir)} — run "npm run build:prod" first.`);
  }

  const errors = [];
  const artefacts = publishedBuildArtefacts(ctx.browserDistDir);
  if (artefacts.length === 0) {
    return fail(id, title, [`No prerendered pages or translation assets found under ${relative(ctx.root, ctx.browserDistDir)}.`]);
  }

  for (const file of artefacts) {
    const rel = relative(ctx.browserDistDir, file);

    // A stale copy of a translation file ships every claim it froze, including
    // the ones later removed from the live file, and is served like any asset.
    if (/\.(backup|bak|old|orig)$/i.test(rel)) {
      errors.push(`${rel}: stale copy shipped in the production build — a superseded file is still publicly fetchable and carries whatever claims it froze.`);
      continue;
    }

    for (const { pattern, reason } of assessPublishedText(readFileSync(file, 'utf8'))) {
      errors.push(`${rel}: matches ${pattern} — ${reason}.`);
    }
  }

  return errors.length
    ? fail(id, title, errors)
    : ok(id, title, `${artefacts.length} built page(s) and translation asset(s) carry none of the ${BLOCKED_PUBLISHED_PATTERNS.length} blocked pattern(s).`);
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

/**
 * Boot the built SSR server on 127.0.0.1:<port> for the duration of one check.
 *
 * NG_ALLOWED_HOSTS='*' lets Angular SSR server-render on 127.0.0.1 in the
 * local test environment. Without it, Angular falls back to client-side
 * rendering (CSR) for host validation failures and RESPONSE_INIT.status never
 * propagates, so the 404 set by NotFoundComponent is lost.
 *
 * NG_SSR_API_ORIGIN is stripped from the inherited environment on purpose:
 * these checks must exercise the "no backend reachable" render path (empty
 * listings, 503 article state) deterministically, whatever the developer's
 * shell happens to export (2026-09-02 AI-readiness reconciliation).
 */
async function startLocalSsrServer(ctx, port) {
  const { spawn } = await import('node:child_process');
  const { NG_SSR_API_ORIGIN: _unusedApiOrigin, ...inheritedEnv } = process.env;
  const child = spawn(process.execPath, [ctx.serverEntryFile], {
    cwd: ctx.root,
    env: { ...inheritedEnv, PORT: String(port), NG_ALLOWED_HOSTS: '*' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderrOutput = '';
  child.stderr.on('data', (chunk) => {
    stderrOutput += chunk.toString();
  });

  let up = false;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.status) {
        up = true;
        break;
      }
    } catch {
      // Not up yet.
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  return {
    up,
    notReadyError: `Local SSR server on port ${port} did not become ready within 20s. stderr: ${stderrOutput.slice(0, 500)}`,
    stop: () => child.kill('SIGTERM'),
  };
}

export async function checkRealUnknownRoute404(ctx) {
  const id = 'real-unknown-route-404';
  const title = 'real unknown-route 404 via local production server';
  if (!existsSync(ctx.serverEntryFile)) {
    return skip(id, title, `No production SSR server build found at ${relative(ctx.root, ctx.serverEntryFile)} — run "npm run build:prod" first.`);
  }

  const port = ctx.serverPort;
  const server = await startLocalSsrServer(ctx, port);

  try {
    if (!server.up) {
      return fail(id, title, [server.notReadyError]);
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
    server.stop();
  }
}

/**
 * Strip a raw HTML document down to its visible text (scripts, styles, and
 * tags removed; entities left as-is — word counting doesn't need them).
 */
function visibleText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * SSR content-quality gate (2026-09-01 audit remediation).
 *
 * The existing gates reconcile registries and static files; none of them read
 * the HTML a crawler actually receives. That is exactly how ten case-study
 * URLs shipped as loading shells for months: every registry agreed, the build
 * passed, and the raw response carried no H1 and no content.
 *
 * This check boots the production server build locally (same harness as
 * checkRealUnknownRoute404) and asserts, for every case-study URL in both
 * locales, that the raw first response — no JavaScript executed — contains:
 *   - HTTP 200,
 *   - a non-empty <h1>,
 *   - at least MIN_VISIBLE_WORDS of visible text,
 *   - an og:url that matches the page's own canonical URL (not the homepage).
 *
 * The blog listings are asserted more loosely (HTTP 200 + <h1>): without a
 * backend in the check environment they legitimately render an empty list.
 * Their post content is a runtime concern verified on the deployed host.
 */
export async function checkSsrContentQuality(ctx) {
  const id = 'ssr-content-quality';
  const title = 'raw SSR content quality (H1, visible text, og:url) via local production server';
  const MIN_VISIBLE_WORDS = 50;

  if (!existsSync(ctx.serverEntryFile)) {
    return skip(id, title, `No production SSR server build found at ${relative(ctx.root, ctx.serverEntryFile)} — run "npm run build:prod" first.`);
  }

  const caseStudiesDataTs = readFileSync(
    join(ctx.srcApp, 'features/resources/case-studies/case-studies.data.ts'),
    'utf8',
  );
  const slugs = extractCaseStudySlugs(caseStudiesDataTs);
  if (slugs.length === 0) {
    return fail(id, title, ['case-studies.data.ts CaseStudySlug union produced zero slugs.']);
  }

  const port = ctx.serverPort + 1;
  const server = await startLocalSsrServer(ctx, port);

  const errors = [];
  try {
    if (!server.up) {
      return fail(id, title, [server.notReadyError]);
    }

    const contentPaths = [];
    for (const slug of slugs) {
      contentPaths.push(`/resources/case-studies/${slug}`);
      contentPaths.push(`/ar/resources/case-studies/${slug}`);
    }

    for (const path of contentPaths) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      const html = await res.text();

      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h1Text = h1Match ? visibleText(h1Match[1]) : '';
      if (!h1Text) {
        errors.push(`${path}: raw HTML has no non-empty <h1>.`);
      }

      const words = visibleText(html).split(' ').filter(Boolean).length;
      if (words < MIN_VISIBLE_WORDS) {
        errors.push(`${path}: only ${words} visible word(s) in raw HTML (minimum ${MIN_VISIBLE_WORDS}) — looks like a loading/empty shell.`);
      }

      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
      const expectedCanonical = `${ctx.origin}${path}`;
      if (canonical !== expectedCanonical) {
        errors.push(`${path}: canonical is ${canonical ?? '(missing)'}, expected ${expectedCanonical}.`);
      }
      if (ogUrl !== expectedCanonical) {
        errors.push(`${path}: og:url is ${ogUrl ?? '(missing)'}, expected ${expectedCanonical} (must match the page's canonical, not the homepage).`);
      }

      // Case-study structured data (emitted since the 2026-09-01 claim
      // approvals): the graph must carry this page's WebPage and Article
      // nodes, and the breadcrumb must end at the page itself.
      const ldMatch = html.match(/<script id="roaya-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (!ldMatch) {
        errors.push(`${path}: no roaya-structured-data JSON-LD script in raw HTML.`);
      } else {
        let graph;
        try {
          graph = JSON.parse(ldMatch[1])['@graph'] ?? [];
        } catch {
          errors.push(`${path}: JSON-LD script is not valid JSON.`);
          graph = [];
        }
        const webPage = graph.find((n) => n['@type'] === 'WebPage');
        const article = graph.find((n) => n['@type'] === 'Article');
        const breadcrumb = graph.find((n) => n['@type'] === 'BreadcrumbList');
        if (!webPage || webPage['@id'] !== `${expectedCanonical}#webpage` || !webPage.name) {
          errors.push(`${path}: JSON-LD is missing a named WebPage node with @id ${expectedCanonical}#webpage.`);
        }
        if (!article || article['@id'] !== `${expectedCanonical}#article` || !article.headline) {
          errors.push(`${path}: JSON-LD is missing an Article node with a headline and @id ${expectedCanonical}#article.`);
        }
        const items = breadcrumb?.itemListElement ?? [];
        if (items.length < 3 || items[items.length - 1]?.item !== expectedCanonical) {
          errors.push(`${path}: BreadcrumbList must end at the page itself (${expectedCanonical}); got ${items.length} item(s), last = ${items[items.length - 1]?.item ?? '(none)'}.`);
        }
      }
    }

    // Locale-aware links: an Arabic page must never link into the English
    // tree. Every same-origin <a href="/..."> on an /ar page has to stay
    // under /ar (2026-09-01 audit follow-up: before the locale-aware link
    // pass, every internal link on every Arabic page pointed at the
    // unprefixed English URL).
    for (const arPath of ['/ar', '/ar/about', '/ar/services', '/ar/resources/case-studies', `/ar/resources/case-studies/${slugs[0]}`]) {
      const res = await fetch(`http://127.0.0.1:${port}${arPath}`);
      if (res.status !== 200) {
        errors.push(`${arPath}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      const html = await res.text();
      const hrefs = [...html.matchAll(/<a\s[^>]*href="(\/[^"]*)"/g)].map((m) => m[1]);
      const leaks = [...new Set(hrefs.filter((h) => h !== '/ar' && !h.startsWith('/ar/') && !h.startsWith('/#')))];
      if (leaks.length) {
        errors.push(`${arPath}: Arabic page links into the English tree: ${leaks.slice(0, 8).join(', ')}${leaks.length > 8 ? ` (+${leaks.length - 8} more)` : ''}.`);
      }
    }

    for (const path of ['/resources/blog', '/ar/resources/blog']) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      const html = await res.text();
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (!h1Match || !visibleText(h1Match[1])) {
        errors.push(`${path}: raw HTML has no non-empty <h1>.`);
      }
    }

    // Dynamic machine files served by the Express routes in src/server.ts.
    // Without a backend (this check environment) the sitemap must still be
    // the complete static base and the feed a valid empty channel — never an
    // error and never a truncated document.
    {
      const res = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
      const body = res.status === 200 ? await res.text() : '';
      const type = res.headers.get('content-type') ?? '';
      if (res.status !== 200) {
        errors.push(`/sitemap.xml: expected HTTP 200, got ${res.status}.`);
      } else {
        if (!type.startsWith('application/xml')) {
          errors.push(`/sitemap.xml: content-type must be application/xml, got "${type}".`);
        }
        if (!body.startsWith('<?xml') || !body.includes('</urlset>')) {
          errors.push('/sitemap.xml: response is not a complete <urlset> document.');
        }
      }
    }
    {
      const res = await fetch(`http://127.0.0.1:${port}/rss.xml`);
      const body = res.status === 200 ? await res.text() : '';
      const type = res.headers.get('content-type') ?? '';
      if (res.status !== 200) {
        errors.push(`/rss.xml: expected HTTP 200, got ${res.status}.`);
      } else {
        if (!type.startsWith('application/rss+xml')) {
          errors.push(`/rss.xml: content-type must be application/rss+xml, got "${type}".`);
        }
        if (!body.startsWith('<?xml') || !body.includes('</rss>')) {
          errors.push('/rss.xml: response is not a complete <rss> document.');
        }
      }
    }

    return errors.length
      ? fail(id, title, errors)
      : ok(id, title, `${contentPaths.length} case-study URL(s) served complete raw HTML (H1, ≥${MIN_VISIBLE_WORDS} visible words, og:url = canonical, WebPage+Article JSON-LD, self-terminating breadcrumb); Arabic pages keep every internal link under /ar; blog listings render with an H1; /sitemap.xml and /rss.xml serve complete XML with correct content types.`);
  } finally {
    server.stop();
  }
}

// ---------------------------------------------------------------------------
// Crawler-semantics assessors (2026-09-02 AI-readiness reconciliation).
// Pure functions over a raw response so the selftest can drive them with
// fixture HTML; `checkSsrCrawlerSemantics` feeds them the live SSR output.
// ---------------------------------------------------------------------------

/** Homepage stat values the crawler-visible text must carry exactly once each. */
const HOMEPAGE_STAT_VALUES = ['150+', '99.9%', '24/7', '14+'];
/** A count-up start value leaking into SSR output: "0+", "0%", "0/7". */
const ZEROED_COUNTER_RE = /\b0\+|\b0%|\b0\/7/;
/** Blog-detail not-found headings (blog.detail.notFound.title, en + ar). */
const BLOG_NOT_FOUND_H1 = ['Post Not Found', 'المقال غير موجود'];
/** The shared placeholder <title> a blog article must never ship with. */
const BLOG_GENERIC_TITLE = 'Blog Post - Roaya IT';

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

/** First <h1> text (tags stripped, whitespace collapsed), or '' when absent. */
export function firstH1Text(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? visibleText(match[1]) : '';
}

/** <title> text (whitespace collapsed), or '' when absent. */
export function titleText(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

/**
 * The `<section class="… stats-section …">…</section>` block of the homepage,
 * or null when no such section exists. The section has no nested <section>,
 * so the first closing tag after the marker ends it.
 */
export function extractStatsSection(html) {
  const start = html.search(/<section\b[^>]*\bclass="[^"]*\bstats-section\b[^"]*"/i);
  if (start === -1) return null;
  const end = html.indexOf('</section>', start);
  return end === -1 ? html.slice(start) : html.slice(start, end + '</section>'.length);
}

/**
 * Normalised `content` of the first `<meta name="robots">` tag (attribute
 * order and spacing tolerant), or null when the page declares no robots tag.
 */
export function robotsMetaContent(html) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\bname\s*=\s*"robots"/i.test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*"([^"]*)"/i)?.[1] ?? '';
    return content.toLowerCase().replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
  }
  return null;
}

/** The page's JSON-LD @graph, or [] when the page carries none. */
export function parseGraph(html) {
  const match = html.match(/<script id="roaya-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return [];
  try {
    return JSON.parse(match[1])['@graph'] ?? [];
  } catch {
    return [];
  }
}

/**
 * Homepage (/, /ar) as a crawler reads it. Live before the reconciliation the
 * raw text carried "150+ 0+", "99.9% 0%", "24/7 0/7" (an sr-only duplicate
 * plus the count-up start value), a hard-coded "99.95%", the Meta pixel
 * <noscript> <img> serialized as escaped text, and "10+" years against the
 * 2012 founding decision.
 */
export function assessHomepageCrawlerSemantics(html, path) {
  const errors = [];
  const text = visibleText(html);

  const zeroed = text.match(ZEROED_COUNTER_RE);
  if (zeroed) {
    errors.push(`${path}: visible text contains a zeroed counter "${zeroed[0]}" — a count-up start value or duplicate stat leaked into the SSR output.`);
  }
  if (text.includes('99.95')) {
    errors.push(`${path}: visible text contains "99.95" — the site-wide uptime figure is 99.9% (2026-09-02 reconciliation; the figure is pending registration, see docs/decisions/2026-09-02-pending-decisions.md item 2). 99.99% is registry-scoped to WorldPosta CloudEdge/Posta only.`);
  }
  // Any escaped tag, not just <img>: the SSR DOM serialises every head-level
  // <noscript> child as text, so the same bug reaches a reader through an
  // <iframe>, a <link> or a <div> exactly as it did through the Meta pixel.
  const escapedTag = html.match(/&lt;\/?([a-z][a-z0-9-]*)\b/i);
  if (escapedTag) {
    errors.push(`${path}: raw HTML contains escaped "&lt;${escapedTag[1]}" markup — a tag was serialized as visible text, which text extractors read as page content (keep <noscript> blocks in <body>, not <head>).`);
  }
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) {
    errors.push(`${path}: expected exactly one <h1>, found ${h1Count}.`);
  }

  const statsSection = extractStatsSection(html);
  if (statsSection === null) {
    errors.push(`${path}: no <section class="stats-section"> in raw HTML — the homepage stats are not server-rendered.`);
  } else {
    const statsText = visibleText(statsSection);
    for (const value of HOMEPAGE_STAT_VALUES) {
      const n = countOccurrences(statsText, value);
      if (n !== 1) {
        errors.push(`${path}: stats section renders "${value}" ${n} time(s), expected exactly once (one text value per stat, no sr-only/animated duplicate).`);
      }
    }
    if (countOccurrences(statsText, '10+') > 0) {
      errors.push(`${path}: stats section still renders "10+" — years of experience is 14+ (founded 2012, 2026-09-01 decision).`);
    }
  }
  return errors;
}

/**
 * Blog article URL while the backend is unreachable (this check environment
 * has no NG_SSR_API_ORIGIN). Live before the reconciliation the SSR answered
 * 503 but rendered the "Post Not Found" block, kept the generic <title>, and
 * pointed canonical/og:url at the homepage — a crawler read "gone" for a
 * transient outage. Unknown-slug 404 semantics are unchanged and need a
 * backend, so they are not asserted here.
 */
export function assessBlogDetailUnavailable({ path, status, html, retryAfter, origin }) {
  const errors = [];
  if (status !== 503) {
    errors.push(`${path}: expected HTTP 503 while the backend is unreachable, got ${status}.`);
  }
  if (!retryAfter) {
    errors.push(`${path}: unavailable-article response has no Retry-After header.`);
  }

  const h1 = firstH1Text(html);
  if (!h1) {
    errors.push(`${path}: raw HTML has no non-empty <h1>.`);
  } else if (BLOG_NOT_FOUND_H1.includes(h1)) {
    errors.push(`${path}: <h1> is "${h1}" — a backend outage must render an unavailable state, not the not-found page.`);
  }

  const title = titleText(html);
  if (!title) {
    errors.push(`${path}: raw HTML has no <title>.`);
  } else if (title === BLOG_GENERIC_TITLE) {
    errors.push(`${path}: <title> is the generic "${BLOG_GENERIC_TITLE}".`);
  }

  const expectedCanonical = `${origin}${path}`;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  if (canonical !== expectedCanonical) {
    errors.push(`${path}: canonical is ${canonical ?? '(missing)'}, expected ${expectedCanonical}.`);
  }
  if (ogUrl !== expectedCanonical) {
    errors.push(`${path}: og:url is ${ogUrl ?? '(missing)'}, expected ${expectedCanonical} (must match the page's canonical, not the homepage).`);
  }
  return errors;
}

/**
 * SSR crawler-semantics gate (2026-09-02 AI-readiness reconciliation).
 *
 * Boots the production server build without a backend and asserts what a
 * crawler receives on the routes the reconciliation changed:
 *   - homepage (/, /ar): single stat values, no zeroed counters, no 99.95,
 *     no escaped <noscript> markup, exactly one <h1>;
 *   - blog article while the backend is down: 503 + Retry-After, an
 *     unavailable-state <h1>/<title>, self-referencing canonical/og:url;
 *   - NOINDEX_ROUTES (both locales): 200 with robots "noindex, follow";
 *   - indexable routes (/, /about, /ar/about): no robots noindex.
 */
export async function checkSsrCrawlerSemantics(ctx) {
  const id = 'ssr-crawler-semantics';
  const title = 'crawler semantics of raw SSR output (stats, noindex, unavailable-article 503) via local production server';

  if (!existsSync(ctx.serverEntryFile)) {
    return skip(id, title, `No production SSR server build found at ${relative(ctx.root, ctx.serverEntryFile)} — run "npm run build:prod" first.`);
  }

  const routeMetadataTs = readFileSync(join(ctx.srcApp, 'core/seo/route-metadata.ts'), 'utf8');
  // An EMPTY list is legitimate (every placeholder replaced by real content);
  // a MISSING export is not — fail closed like canonical-metadata-coverage.
  const noindexRoutes = extractNoindexRoutes(routeMetadataTs);
  if (noindexRoutes === null) {
    return fail(id, title, ['route-metadata.ts no longer exports NOINDEX_ROUTES — the noindex placeholder pages cannot be verified.']);
  }

  // Service and FAQ coverage (P1.2). Declaring a route in the taxonomy is not
  // the same as the node reaching the page: the graph is composed at render
  // time from translated keys, so a renamed key or a route that stops matching
  // produces silence, not an error.
  const taxonomyTs = readFileSync(join(ctx.srcApp, 'core/seo/entity-taxonomy.ts'), 'utf8');
  const serviceRoutes = extractTopLevelMapKeys(taxonomyTs, 'SERVICE_ENTITY_KEYS');
  const faqRoutes = extractTopLevelMapKeys(taxonomyTs, 'FAQ_ENTITY_KEYS');
  if (serviceRoutes === null || faqRoutes === null) {
    return fail(id, title, ['entity-taxonomy.ts no longer exports SERVICE_ENTITY_KEYS and FAQ_ENTITY_KEYS — Service/FAQPage coverage cannot be verified.']);
  }
  if (serviceRoutes.length === 0) {
    return fail(id, title, ['SERVICE_ENTITY_KEYS is empty — every commercial service page would ship without a Service node.']);
  }

  const port = ctx.serverPort + 2;
  const server = await startLocalSsrServer(ctx, port);
  const errors = [];
  try {
    if (!server.up) {
      return fail(id, title, [server.notReadyError]);
    }

    const homepagePaths = ['/', '/ar'];
    for (const path of homepagePaths) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      errors.push(...assessHomepageCrawlerSemantics(await res.text(), path));
    }

    const blogPaths = ['/resources/blog/some-slug-that-cannot-exist-x1', '/ar/resources/blog/some-slug-x1'];
    for (const path of blogPaths) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      errors.push(...assessBlogDetailUnavailable({
        path,
        status: res.status,
        html: await res.text(),
        retryAfter: res.headers.get('retry-after'),
        origin: ctx.origin,
      }));
    }

    const noindexPaths = noindexRoutes.flatMap((route) => [route, `/ar${route}`]);
    for (const path of noindexPaths) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: expected HTTP 200 (reachable for humans), got ${res.status}.`);
        continue;
      }
      const robots = robotsMetaContent(await res.text());
      if (robots !== 'noindex, follow') {
        errors.push(`${path}: expected <meta name="robots" content="noindex, follow">, got ${robots === null ? 'no robots meta' : `"${robots}"`}.`);
      }
    }

    const indexablePaths = ['/', '/about', '/ar/about'];
    for (const path of indexablePaths) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.status !== 200) {
        errors.push(`${path}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      const robots = robotsMetaContent(await res.text());
      if (robots !== null && robots.includes('noindex')) {
        errors.push(`${path}: indexable route carries robots "${robots}" — the noindex tag leaked from a placeholder route.`);
      }
    }

    // Every declared service route must carry its Service node, in both
    // locales, with a non-empty name and a self @id — and the Arabic page must
    // carry Arabic, not a fallback to the English string.
    for (const route of serviceRoutes) {
      for (const localePath of [route, `/ar${route}`]) {
        const res = await fetch(`http://127.0.0.1:${port}${localePath}`);
        if (res.status !== 200) {
          errors.push(`${localePath}: expected HTTP 200 for a declared service route, got ${res.status}.`);
          continue;
        }
        const graph = parseGraph(await res.text());
        const service = graph.find((node) => node['@type'] === 'Service' && node['@id'] === `${ctx.origin}${localePath}#service`);
        if (!service) {
          errors.push(`${localePath}: SERVICE_ENTITY_KEYS declares this route but the rendered graph has no Service node with @id ${ctx.origin}${localePath}#service.`);
          continue;
        }
        if (!service.name || String(service.name).includes('.')) {
          errors.push(`${localePath}: Service name is ${JSON.stringify(service.name)} — an empty value or a raw i18n key, not a translated name.`);
        }
        if (!service.provider?.['@id']) {
          errors.push(`${localePath}: Service node does not reference the Organization as its provider.`);
        }
      }
    }

    // Arabic Service names must actually differ from English wherever the
    // translation differs — a silent fallback would publish an English graph
    // on the Arabic site, which is exactly the bug the locale-aware link pass
    // fixed for anchors.
    for (const route of serviceRoutes) {
      const [en, ar] = await Promise.all([
        fetch(`http://127.0.0.1:${port}${route}`).then((r) => r.text()),
        fetch(`http://127.0.0.1:${port}/ar${route}`).then((r) => r.text()),
      ]);
      const enName = parseGraph(en).find((n) => n['@type'] === 'Service')?.name;
      const arName = parseGraph(ar).find((n) => n['@type'] === 'Service')?.name;
      if (enName && arName && enName === arName && !/^[A-Za-z0-9 &/+.-]+$/.test(String(enName))) {
        errors.push(`/ar${route}: Arabic Service name is identical to English ("${enName}") — looks like a missing translation rather than a deliberately untranslated product name.`);
      }
    }

    // Declared FAQs must reach the page as a FAQPage whose questions and
    // answers are all present and non-empty.
    // Contact details (P3): the page that shows an address and a phone number
    // must say so in machine-readable form too, in both locales — and no other
    // page may, since no other page renders them.
    for (const contactPath of ['/contact', '/ar/contact']) {
      const res = await fetch(`http://127.0.0.1:${port}${contactPath}`);
      if (res.status !== 200) {
        errors.push(`${contactPath}: expected HTTP 200, got ${res.status}.`);
        continue;
      }
      const html = await res.text();
      const graph = parseGraph(html);
      const address = graph.find((node) => node['@type'] === 'PostalAddress');
      const contactPoint = graph.find((node) => node['@type'] === 'ContactPoint');
      if (!address?.streetAddress) {
        errors.push(`${contactPath}: no PostalAddress node with a street address, though the page renders one.`);
      } else if (!visibleText(html).includes(address.streetAddress)) {
        errors.push(`${contactPath}: the PostalAddress streetAddress is not the address the page displays — structured data must repeat the page, not extend it.`);
      }
      if (!contactPoint?.telephone || !contactPoint?.email) {
        errors.push(`${contactPath}: ContactPoint is missing a telephone or an email.`);
      } else {
        for (const value of [contactPoint.telephone, contactPoint.email]) {
          if (!html.includes(value)) {
            errors.push(`${contactPath}: ContactPoint publishes "${value}", which does not appear on the page.`);
          }
        }
      }
    }
    for (const otherPath of ['/', '/about']) {
      const graph = parseGraph(await (await fetch(`http://127.0.0.1:${port}${otherPath}`)).text());
      if (graph.some((node) => node['@type'] === 'ContactPoint' || node['@type'] === 'PostalAddress')) {
        errors.push(`${otherPath}: emits contact details, but the page does not display them.`);
      }
    }

    for (const route of faqRoutes) {
      for (const localePath of [route === '/' ? '/' : route, route === '/' ? '/ar' : `/ar${route}`]) {
        const res = await fetch(`http://127.0.0.1:${port}${localePath}`);
        if (res.status !== 200) {
          errors.push(`${localePath}: expected HTTP 200 for a declared FAQ route, got ${res.status}.`);
          continue;
        }
        const html = await res.text();
        const faq = parseGraph(html).find((node) => node['@type'] === 'FAQPage');
        if (!faq) {
          errors.push(`${localePath}: FAQ_ENTITY_KEYS declares this route but the rendered graph has no FAQPage node.`);
          continue;
        }
        const questions = faq.mainEntity ?? [];
        if (questions.length === 0) {
          errors.push(`${localePath}: FAQPage carries no questions.`);
        }
        for (const [index, question] of questions.entries()) {
          const answer = question.acceptedAnswer?.text;
          if (!question.name || String(question.name).includes('.')) {
            errors.push(`${localePath}: FAQ question ${index + 1} is ${JSON.stringify(question.name)} — empty or a raw i18n key.`);
          }
          if (!answer) {
            errors.push(`${localePath}: FAQ question ${index + 1} has no answer text.`);
          } else if (!visibleText(html).includes(String(answer).slice(0, 40))) {
            // Schema may never say more than the page. If the answer is not in
            // the served HTML, the FAQPage is asserting unseen content.
            errors.push(`${localePath}: FAQ answer ${index + 1} is not present in the page's own HTML — structured data must not assert content the page does not show.`);
          }
        }
      }
    }

    return errors.length
      ? fail(id, title, errors)
      : ok(id, title, `${serviceRoutes.length} service route(s) emit a Service node and ${faqRoutes.length} route(s) a page-matched FAQPage in both locales; ${homepagePaths.length} homepage(s) render one value per stat with no zeroed counters, no "99.95", no escaped <noscript> markup and one <h1>; ${blogPaths.length} article URL(s) answer 503 + Retry-After with an unavailable state and self-referencing canonical/og:url while the backend is down; ${noindexPaths.length} NOINDEX route(s) serve 200 with robots "noindex, follow"; ${indexablePaths.length} indexable route(s) carry no noindex.`);
  } finally {
    server.stop();
  }
}

export const ALL_CHECKS = [
  checkRobotsPolicy,
  checkSitemapValidity,
  checkLlmsTxt,
  checkCanonicalMetadataCoverage,
  checkJsonLdExclusionGates,
  checkPentestV2Canonicalization,
  checkIndustryRouteIntegrity,
  checkCaseStudyRouteIntegrity,
  checkApprovedFactualConsistency,
  checkMachineFilesInBuild,
  checkPublishedClaimSweep,
  checkCompanyFactsConsistency,
  checkCriticalPathBudget,
  checkServiceFactsIntegrity,
  checkInternalLinkGraph,
  checkPageMetadataQuality,
  checkRealUnknownRoute404,
  checkSsrContentQuality,
  checkSsrCrawlerSemantics,
];
