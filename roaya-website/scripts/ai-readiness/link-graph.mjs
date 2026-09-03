#!/usr/bin/env node
/**
 * Internal link graph over the production build.
 *
 * The action plan (P1.6) asks for a CI link-graph report and for every
 * commercial page to be reachable "through semantic links from a hub within
 * three clicks". Both need the same thing: the graph a crawler actually walks,
 * which is the anchors in the served HTML — not the route table, not the
 * sitemap, and not the mega-menu configuration.
 *
 * The distinction matters here. A page can sit in the sitemap, have perfect
 * metadata, and still be reachable only by typing its URL: crawlers discover
 * and weight pages by following links, and an assistant asked for "Roaya's SOC
 * page" finds it the same way. This is also how the blog was invisible for
 * months — the cards used routerLink on a non-anchor element, so the rendered
 * HTML had no href at all.
 *
 * Run directly to write the report; imported by the ai-readiness check that
 * enforces the rules.
 */
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Every prerendered route in the build, as a site path. */
export function prerenderedRoutes(browserDistDir) {
  const routes = [];
  for (const entry of readdirSync(browserDistDir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || entry.name !== 'index.html') continue;
    const dir = relative(browserDistDir, entry.parentPath ?? entry.path);
    routes.push(dir === '' ? '/' : `/${dir.split(sep).join('/')}`);
  }
  return routes.sort();
}

/** Same-origin anchor targets on a page, normalised to canonical paths. */
export function outboundLinks(html) {
  const links = new Set();
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const path = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    links.add(path);
  }
  return [...links];
}

/**
 * Build the graph and derive the three things worth acting on: how deep each
 * page sits, which pages nothing links to, and which links point nowhere.
 */
/** Indexable paths, from the sitemap the site actually publishes. */
export function sitemapPaths(publicDir, origin) {
  const xml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(origin, '').replace(/\/$/, '') || '/')
    .sort();
}

export function buildLinkGraph(browserDistDir, publicDir, origin = 'https://roaya.co') {
  const routes = prerenderedRoutes(browserDistDir);
  // A page can be real without being prerendered: listings and detail pages are
  // RenderMode.Server precisely so they are not baked at build time. The
  // sitemap is what the site claims exists, so it is the ground truth for
  // "this link points somewhere".
  const indexable = new Set(sitemapPaths(publicDir, origin));
  const known = new Set([...routes, ...indexable]);
  const edges = new Map();
  const inbound = new Map(routes.map((r) => [r, 0]));
  const broken = [];

  for (const route of routes) {
    const file = join(browserDistDir, route === '/' ? '' : route.slice(1), 'index.html');
    if (!existsSync(file)) continue;
    const targets = outboundLinks(readFileSync(file, 'utf8'));
    edges.set(route, targets);
    for (const target of targets) {
      if (known.has(target)) {
        if (target !== route) inbound.set(target, (inbound.get(target) ?? 0) + 1);
      } else {
        // A dynamic route (blog post, case study) is server-rendered rather
        // than prerendered, so it legitimately has no index.html in the build.
        const dynamic = /^\/(ar\/)?resources\/(blog|case-studies)\/[^/]+$/.test(target);
        if (!dynamic) broken.push({ from: route, to: target });
      }
    }
  }

  // Depth from each locale's own home page: an Arabic page is not "four clicks
  // deep" because the shortest path runs through the English tree.
  const depth = new Map();
  for (const start of ['/', '/ar'].filter((s) => known.has(s))) {
    const queue = [[start, 0]];
    while (queue.length) {
      const [node, d] = queue.shift();
      if (depth.has(node) && depth.get(node) <= d) continue;
      depth.set(node, d);
      for (const next of edges.get(node) ?? []) {
        if (known.has(next) && !(depth.has(next) && depth.get(next) <= d + 1)) queue.push([next, d + 1]);
      }
    }
  }

  // Only indexable pages are judged. A route deliberately kept out of the
  // sitemap (the noindex placeholders) is meant to be undiscoverable, so
  // counting it as an orphan would be reporting the intended state as a fault.
  const judged = routes.filter((r) => indexable.has(r) && r !== '/' && r !== '/ar');
  const orphans = judged.filter((r) => (inbound.get(r) ?? 0) === 0);
  const unreachable = judged.filter((r) => !depth.has(r));
  // Unreachable is a stronger statement than deep; do not report a page twice.
  const tooDeep = judged.filter((r) => depth.has(r) && depth.get(r) > 3);
  const excluded = routes.filter((r) => !indexable.has(r));

  return { routes, indexable, excluded, edges, inbound, depth, orphans, unreachable, tooDeep, broken };
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = join(__dirname, '..', '..');
  const browserDistDir = join(root, 'dist/roaya-website/browser');
  if (!existsSync(browserDistDir)) {
    console.error('No production build found — run "npm run build:prod" first.');
    process.exit(2);
  }

  const g = buildLinkGraph(browserDistDir, join(root, 'public'));
  const byDepth = new Map();
  for (const [route, d] of g.depth) byDepth.set(d, [...(byDepth.get(d) ?? []), route]);

  const outDir = join(root, '..', 'memory-bank', 'Audit', 'link-graph');
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = [
    '# Internal link graph',
    '',
    `**Generated:** ${stamp} from the production build.`,
    '',
    'Built from the anchors in the served HTML — the graph a crawler actually walks,',
    'not the route table or the sitemap. A page absent from this graph is reachable',
    'only by typing its URL.',
    '',
    '## Summary',
    '',
    '| Measure | Count |',
    '|---|---:|',
    `| Prerendered routes | ${g.routes.length} |`,
    `| Indexable (in the sitemap) | ${g.indexable.size} |`,
    `| Deliberately excluded from discovery | ${g.excluded.length} |`,
    `| Reachable from a locale home page | ${g.depth.size} |`,
    `| Indexable orphans (nothing links to them) | ${g.orphans.length} |`,
    `| Indexable and unreachable by any path | ${g.unreachable.length} |`,
    `| Deeper than three clicks | ${g.tooDeep.length} |`,
    `| Links pointing at no page | ${g.broken.length} |`,
    '',
    '## Depth distribution',
    '',
    '| Clicks from home | Routes |',
    '|---:|---:|',
    ...[...byDepth.keys()].sort((a, b) => a - b).map((d) => `| ${d} | ${byDepth.get(d).length} |`),
    '',
  ];
  if (g.orphans.length) {
    lines.push(
      '## Indexable orphans',
      '',
      'Nothing on the site links to these. They are in the sitemap, so the site claims',
      'they matter, but a crawler following links never arrives and a reader cannot',
      'navigate to them.',
      '',
      ...g.orphans.map((r) => `- \`${r}\``),
      '',
    );
  }
  if (g.unreachable.length) {
    lines.push('## Indexable but unreachable', '', ...g.unreachable.map((r) => `- \`${r}\``), '');
  }
  if (g.excluded.length) {
    lines.push(
      '## Excluded from discovery on purpose',
      '',
      'Not in the sitemap, so not judged above.',
      '',
      ...g.excluded.map((r) => `- \`${r}\``),
      '',
    );
  }
  if (g.tooDeep.length) {
    lines.push('## Deeper than three clicks', '', ...g.tooDeep.map((r) => `- \`${r}\` (${g.depth.get(r)})`), '');
  }
  if (g.broken.length) {
    lines.push('## Links pointing at no page', '', ...g.broken.map((b) => `- \`${b.from}\` → \`${b.to}\``), '');
  }

  const outPath = join(outDir, `${stamp}.md`);
  writeFileSync(outPath, lines.join('\n'));
  console.log(`${g.routes.length} routes (${g.indexable.size} indexable) · ${g.orphans.length} orphan(s) · ${g.unreachable.length} unreachable · ${g.tooDeep.length} deeper than 3 clicks · ${g.broken.length} broken link(s)`);
  console.log(`Report: ${relative(join(root, '..'), outPath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
