import { DEFAULT_LOCALE, splitLocale, withLocale } from './locale-routing';

describe('locale-routing', () => {
  describe('splitLocale', () => {
    it('treats an unprefixed path as the default locale', () => {
      expect(splitLocale('/about')).toEqual({ locale: 'en', path: '/about' });
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('extracts the Arabic prefix and the remaining path', () => {
      expect(splitLocale('/ar/about')).toEqual({ locale: 'ar', path: '/about' });
      expect(splitLocale('/ar/services/security/soc-solutions')).toEqual({
        locale: 'ar',
        path: '/services/security/soc-solutions',
      });
    });

    it('maps the bare locale root to the site root', () => {
      expect(splitLocale('/ar')).toEqual({ locale: 'ar', path: '/' });
      expect(splitLocale('/')).toEqual({ locale: 'en', path: '/' });
    });

    it('does not mistake a path that merely starts with the locale letters', () => {
      // /architecture is not Arabic /rchitecture.
      expect(splitLocale('/architecture')).toEqual({ locale: 'en', path: '/architecture' });
      expect(splitLocale('/arabic-support')).toEqual({ locale: 'en', path: '/arabic-support' });
    });

    it('strips query, hash and trailing slashes before deciding', () => {
      expect(splitLocale('/ar/contact/?utm=x#form')).toEqual({ locale: 'ar', path: '/contact' });
    });
  });

  describe('withLocale', () => {
    it('leaves English unprefixed so existing URLs keep working', () => {
      expect(withLocale('/about', 'en')).toBe('/about');
      expect(withLocale('/', 'en')).toBe('/');
    });

    it('prefixes Arabic', () => {
      expect(withLocale('/about', 'ar')).toBe('/ar/about');
      expect(withLocale('/', 'ar')).toBe('/ar');
    });

    it('round-trips with splitLocale for both locales', () => {
      for (const path of ['/', '/about', '/services/security/incident-response']) {
        for (const locale of ['en', 'ar'] as const) {
          expect(splitLocale(withLocale(path, locale))).toEqual({ locale, path });
        }
      }
    });
  });
});
