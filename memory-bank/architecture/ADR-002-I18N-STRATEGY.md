# ADR 002: Use @angular/localize for Internationalization

**Status:** Accepted
**Date:** 2025-12-05
**Decision Makers:** Tech Lead, Development Team

## Context and Problem Statement

The Roaya IT website must support both English and Arabic languages with proper RTL support. We need to choose an internationalization (i18n) solution that provides:
- Excellent SSR (Server-Side Rendering) support
- RTL/LTR handling
- SEO-friendly URL structure
- Optimal performance
- Type safety

## Decision Drivers

- SEO requirements (separate URLs for each locale)
- SSR performance
- Bundle size impact
- Translation workflow
- Developer experience
- Maintenance overhead

## Considered Options

### Option 1: @angular/localize (SELECTED)
**Approach:** Compile-time translation with separate builds per locale

**Pros:**
- Official Angular solution
- Zero runtime overhead (translations baked into builds)
- Perfect SSR support (separate build = separate SSR render)
- SEO-friendly (each locale has own URL: `/` vs `/ar/`)
- Type-safe translations in templates
- Best Lighthouse performance scores
- Smaller bundle per locale

**Cons:**
- Separate build per locale increases build time
- Cannot switch language without page reload/navigation
- More complex deployment (multiple build outputs)
- Translation extraction workflow required

### Option 2: ngx-translate
**Approach:** Runtime translation with JSON files

**Pros:**
- Single build for all locales
- Runtime language switching without reload
- Simpler deployment
- Large community and ecosystem

**Cons:**
- Runtime performance overhead
- SSR complications (need to handle locale detection server-side)
- Larger initial bundle (includes all translations)
- SEO challenges (same URL for all languages)
- Translation files loaded separately
- Not official Angular solution

### Option 3: Transloco
**Approach:** Modern runtime translation library

**Pros:**
- Better performance than ngx-translate
- SSR support
- Cleaner API
- Smaller bundle size

**Cons:**
- Still runtime overhead
- Smaller community than ngx-translate
- Same SEO challenges as ngx-translate
- Additional dependency to maintain

## Decision Outcome

**SELECTED: Option 1 - @angular/localize (Compile-time)**

We will use Angular's built-in `@angular/localize` with compile-time translation, producing separate builds for English and Arabic.

### Implementation Architecture

```
Build Output:
├── dist/
│   ├── en/              # English build (default)
│   │   ├── index.html
│   │   ├── main.js
│   │   └── ...
│   └── ar/              # Arabic build
│       ├── index.html
│       ├── main.js
│       └── ...
```

### URL Structure

- English (default): `https://roayait.com/`
- Arabic: `https://roayait.com/ar/`

Each locale has completely separate routes:
- `/about` (English)
- `/ar/about` (Arabic)

### Translation Workflow

1. **Mark translatable content** in templates:
```html
<h1 i18n="Page title|Main heading@@homeTitle">Welcome to Roaya IT</h1>
```

2. **Extract messages**:
```bash
ng extract-i18n --output-path src/assets/i18n
```
Generates: `messages.xlf` (source file)

3. **Translate**:
Copy `messages.xlf` to `messages.ar.xlf` and translate content

4. **Build for production**:
```bash
ng build --configuration=production --localize
```
Generates separate builds for each locale

### Configuration

```json
// angular.json
{
  "i18n": {
    "sourceLocale": "en",
    "locales": {
      "ar": {
        "translation": "src/assets/i18n/messages.ar.xlf",
        "baseHref": "/ar/"
      }
    }
  }
}
```

### Consequences

#### Positive
- **Zero runtime cost**: Translations compiled into bundles
- **Perfect SSR**: Each locale renders server-side without locale detection logic
- **Optimal SEO**: Search engines index separate URLs for each language
- **Smaller bundles per locale**: Only includes one language
- **Better Core Web Vitals**: No translation loading delay
- **Type safety**: Compiler errors for missing translations

#### Negative
- **Longer build time**: ~2x build time (build each locale separately)
- **No runtime switching**: Changing language requires navigation to new URL
- **More complex deployment**: Need to serve multiple build outputs
- **Translation workflow**: Requires extraction and XLF file management

#### Neutral
- Language switching navigates to `/ar/` or `/` instead of in-place toggle
- Users might prefer URL-based language (can bookmark, share specific language)

### Performance Impact

| Metric | ngx-translate | @angular/localize | Difference |
|--------|---------------|-------------------|------------|
| Initial Bundle | +25KB | 0KB | -25KB |
| Translation Load | ~10KB JSON | 0KB | -10KB |
| Runtime Overhead | ~2ms per translation | 0ms | -2ms |
| FCP Impact | +50-100ms | 0ms | -50-100ms |
| Lighthouse Score | -2 to -5 | 0 | Better |

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Slow build times** | High | Medium | Parallel builds, CI caching, build only changed locales in dev |
| **Complex deployment** | Medium | Medium | Use platform with multi-locale support (Vercel, Netlify) |
| **Translation management** | Medium | Low | Use translation management tools (POEditor, Lokalise) |
| **Missing translations** | Low | High | Build fails if translation missing (fail-fast) |

### Migration Path

If runtime switching becomes critical in future:
1. Keep URL-based locale structure
2. Migrate to Transloco (better than ngx-translate)
3. Evaluate impact on performance budget

## Validation

Success criteria:
- Build time < 2 minutes for all locales
- Zero runtime translation overhead
- Lighthouse Performance score 95+
- Separate Google Search Console properties for `/` and `/ar/`
- Social sharing works correctly for both locales

## Related Decisions

- ADR 003: RTL Layout Strategy
- ADR 004: Font Loading Strategy
- ADR 005: SEO Implementation

## References

- [Angular i18n Official Guide](https://angular.dev/guide/i18n)
- [Angular Localize Package](https://angular.io/api/localize)
- [XLIFF 2.0 Specification](http://docs.oasis-open.org/xliff/xliff-core/v2.0/xliff-core-v2.0.html)
- Performance comparison: [Compile-time vs Runtime i18n](https://web.dev/articles/i18n-best-practices)
