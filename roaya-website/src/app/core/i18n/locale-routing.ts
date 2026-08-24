/**
 * Locale-prefixed routing (Stage 3.4).
 *
 * URL shape: English is served unprefixed at the root and Arabic mirrors it
 * under `/ar`. English is deliberately NOT given an `/en` prefix — every
 * URL already indexed, linked, and listed in sitemap.xml/llms.txt stays
 * exactly where it is, so this change adds a locale without invalidating a
 * single existing address.
 *
 * The URL is the single source of truth for the rendered language. Before
 * this, the language lived only in `localStorage`/`navigator.language`, both
 * browser-only, so the server always rendered English and Arabic existed
 * only after hydration — invisible to every crawler and AI agent. Now the
 * path decides, which is also what makes an Arabic page linkable and
 * shareable at all.
 */
export type Locale = 'en' | 'ar';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ar'];

/** Path segment that identifies a non-default locale. */
const LOCALE_SEGMENT: Readonly<Record<Locale, string>> = {
  en: '',
  ar: '/ar'
};

/**
 * Split a router path into its locale and its locale-independent remainder.
 * `/ar/about` -> `{ locale: 'ar', path: '/about' }`
 * `/about`    -> `{ locale: 'en', path: '/about' }`
 * `/ar`       -> `{ locale: 'ar', path: '/' }`
 */
export function splitLocale(rawPath: string): { locale: Locale; path: string } {
  const clean = rawPath.split('#')[0].split('?')[0];
  const withLeadingSlash = clean.startsWith('/') ? clean : `/${clean}`;
  const normalized = withLeadingSlash.replace(/\/+$/, '') || '/';

  if (normalized === '/ar' || normalized.startsWith('/ar/')) {
    return { locale: 'ar', path: normalized.slice(3) || '/' };
  }
  return { locale: DEFAULT_LOCALE, path: normalized };
}

/**
 * The mirror of `path` (a locale-independent path) in `locale`.
 * `('/about', 'ar')` -> `/ar/about`;  `('/', 'ar')` -> `/ar`
 */
export function withLocale(path: string, locale: Locale): string {
  const base = path === '/' ? '' : path;
  return `${LOCALE_SEGMENT[locale]}${base}` || '/';
}
