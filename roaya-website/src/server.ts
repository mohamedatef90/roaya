import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasCompleteArabicVersion } from './app/core/utils/arabic-content-completeness';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ---------------------------------------------------------------------------
// Dynamic machine files: /sitemap.xml (static base + published blog posts)
// and /rss.xml (blog feed). Registered BEFORE express.static so they win over
// the static sitemap.xml copy in the browser dist.
//
// Blog posts live in the backend database, so the static sitemap can never
// list them (2026-09-01 AI-readiness audit, P1: blog detail URLs absent from
// the sitemap). At request time the published post list is fetched from the
// backend through NG_SSR_API_ORIGIN (the same loopback origin the SSR API
// interceptor uses — see docs/deploy/RUNTIME-ENV.md) and appended to the
// static base. When the variable is unset or the backend is unreachable, the
// static sitemap is served unchanged and the feed renders with no items —
// never an error, never a partial document.
// ---------------------------------------------------------------------------

const SITE_ORIGIN = 'https://roaya.co';
const MACHINE_FILE_CACHE_MS = 10 * 60 * 1000;
const BLOG_FETCH_TIMEOUT_MS = 5000;

interface BlogPostEntry {
  slug: string;
  title: string;
  excerpt: string;
  lastmod: string; // YYYY-MM-DD
  pubDate: string; // RFC 1123, for RSS
  // Whether the Arabic version is a complete article (shared rule in
  // app/core/utils/arabic-content-completeness.ts). Decides whether the
  // sitemap lists /ar/resources/blog/<slug> and an hreflang="ar" alternate
  // at all (2026-09-02 AI-readiness reconciliation).
  hasCompleteArabicVersion: boolean;
}

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

let blogPostsCache: { at: number; posts: BlogPostEntry[] } | null = null;

/**
 * Published posts from the backend, newest first. Cached for 10 minutes.
 * Returns [] when NG_SSR_API_ORIGIN is unset (build/CI/local checks) or the
 * backend cannot be reached — callers then serve the static-only variant.
 */
async function fetchPublishedBlogPosts(): Promise<BlogPostEntry[]> {
  const apiOrigin = process.env['NG_SSR_API_ORIGIN'];
  if (!apiOrigin) {
    return [];
  }
  if (blogPostsCache && Date.now() - blogPostsCache.at < MACHINE_FILE_CACHE_MS) {
    return blogPostsCache.posts;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BLOG_FETCH_TIMEOUT_MS);
    // limit=50 is the backend's validated maximum (limit=100 is rejected with
    // HTTP 500 — verified against the live API on 2026-09-02) and matches what
    // the blog listing itself requests.
    const res = await fetch(
      `${apiOrigin.replace(/\/$/, '')}/api/v1/content/blog?page=1&limit=50`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) {
      return blogPostsCache?.posts ?? [];
    }
    const body = (await res.json()) as {
      data?: {
        slugEn?: string;
        titleEn?: string;
        titleAr?: string;
        excerptEn?: string;
        contentEn?: string;
        contentAr?: string;
        publishedAt?: string;
        createdAt?: string;
      }[];
    };
    const posts: BlogPostEntry[] = (body.data ?? [])
      .filter((item) => typeof item.slugEn === 'string' && item.slugEn.length > 0)
      .map((item) => {
        const when = new Date(item.publishedAt ?? item.createdAt ?? Date.now());
        const valid = Number.isNaN(when.getTime()) ? new Date() : when;
        return {
          slug: item.slugEn as string,
          title: item.titleEn ?? '',
          excerpt: item.excerptEn ?? '',
          lastmod: valid.toISOString().slice(0, 10),
          pubDate: valid.toUTCString(),
          hasCompleteArabicVersion: hasCompleteArabicVersion({
            titleAr: item.titleAr,
            contentAr: item.contentAr,
            contentEn: item.contentEn,
          }),
        };
      })
      .sort((a, b) => (a.lastmod < b.lastmod ? 1 : -1));
    blogPostsCache = { at: Date.now(), posts };
    return posts;
  } catch {
    return blogPostsCache?.posts ?? [];
  }
}

/**
 * Sitemap <url> entries for one post, matching the static file's shape.
 *
 * A post with a complete Arabic version gets the bilingual pair (EN + AR
 * <url>, each with en/ar/x-default alternates). A post whose Arabic version
 * is a stub gets ONLY the EN <url> with en + x-default alternates: the
 * sitemap may not advertise an Arabic article that does not exist as a
 * complete article (2026-09-02 AI-readiness reconciliation — every published
 * post was listed under /ar with a few hundred characters of Arabic).
 */
function sitemapEntriesForPost(post: BlogPostEntry): string {
  const en = `${SITE_ORIGIN}/resources/blog/${encodeURIComponent(post.slug)}`;
  const ar = `${SITE_ORIGIN}/ar/resources/blog/${encodeURIComponent(post.slug)}`;
  const alternates = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
    ...(post.hasCompleteArabicVersion ? [`    <xhtml:link rel="alternate" hreflang="ar" href="${ar}"/>`] : []),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`,
  ].join('\n');
  const locs = post.hasCompleteArabicVersion ? [en, ar] : [en];
  return locs
    .map((loc) =>
      ['  <url>', `    <loc>${loc}</loc>`, `    <lastmod>${post.lastmod}</lastmod>`, alternates, '  </url>'].join('\n'),
    )
    .join('\n');
}

app.get('/sitemap.xml', async (_req, res) => {
  let staticSitemap: string;
  try {
    staticSitemap = readFileSync(join(browserDistFolder, 'sitemap.xml'), 'utf8');
  } catch {
    res.status(404).type('text/plain').send('sitemap.xml is not available');
    return;
  }

  const posts = await fetchPublishedBlogPosts();
  const closing = '</urlset>';
  const body =
    posts.length > 0 && staticSitemap.includes(closing)
      ? staticSitemap.replace(closing, `${posts.map(sitemapEntriesForPost).join('\n')}\n${closing}`)
      : staticSitemap;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.send(body);
});

app.get('/rss.xml', async (_req, res) => {
  const posts = await fetchPublishedBlogPosts();
  const items = posts
    .map((post) =>
      [
        '    <item>',
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${SITE_ORIGIN}/resources/blog/${encodeURIComponent(post.slug)}</link>`,
        `      <guid isPermaLink="true">${SITE_ORIGIN}/resources/blog/${encodeURIComponent(post.slug)}</guid>`,
        `      <pubDate>${post.pubDate}</pubDate>`,
        `      <description>${xmlEscape(post.excerpt)}</description>`,
        '    </item>',
      ].join('\n'),
    )
    .join('\n');

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Roaya IT Blog</title>',
    `    <link>${SITE_ORIGIN}/resources/blog</link>`,
    `    <atom:link href="${SITE_ORIGIN}/rss.xml" rel="self" type="application/rss+xml"/>`,
    '    <description>IT insights, best practices, and updates from Roaya IT experts.</description>',
    '    <language>en</language>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.send(feed);
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Permanent 301 redirects for legacy URLs. These must be handled at the server
 * layer (before the Angular handler) so that crawlers receive a real HTTP 301
 * status and Location header, not a client-side redirect.
 */
app.get('/services/security/pentest-v2', (_req, res) => {
  res.redirect(301, '/services/security/penetration-testing');
});
app.get('/ar/services/security/pentest-v2', (_req, res) => {
  res.redirect(301, '/ar/services/security/penetration-testing');
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
