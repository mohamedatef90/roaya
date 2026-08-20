# Heatmaps Component Error Investigation Report

> **Date:** 2026-02-01
> **Investigator:** Product Orchestrator (with Explore Agent)
> **Status:** RESOLVED
> **Affected Component:** Admin Panel > Website Analytics > Heatmaps

---

## Summary

Three errors were identified in the Heatmaps admin component. Two have been fixed with code changes; one is an external/environmental issue.

| # | Error | Severity | Status |
|---|-------|----------|--------|
| 1 | NG0904: unsafe value used in resource URL context | **HIGH** | FIXED |
| 2 | 422 Unprocessable Entity from heatmap API | **HIGH** | FIXED |
| 3 | rrweb.js blocked by content blocker | LOW | Not actionable (external) |

---

## Error 1: NG0904 — Unsafe Resource URL in iframe

### Problem

Angular's security system blocks dynamic URLs bound to iframe `[src]` attributes. The heatmaps component was binding a computed string URL directly to the iframe without sanitization.

**Location:** `heatmaps.component.ts:206:21`

```html
<iframe
  #pageIframe
  [src]="iframeSrc()"   <!-- NG0904 ERROR -->
  sandbox="allow-same-origin"
  ...
></iframe>
```

**Computed signal (line 794-798):**
```typescript
iframeSrc = computed(() => {
  const page = this.selectedPage();
  if (!page) return '';
  return page.url + (page.url.includes('?') ? '&' : '?') + '_heatmap_preview=1';
});
```

### Root Cause

Angular classifies iframe `[src]` as a **Resource URL context** (higher security than regular property bindings). Dynamic URLs from runtime data must be explicitly marked safe using `DomSanitizer.bypassSecurityTrustResourceUrl()`.

### Fix Applied

```typescript
// Added import
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Injected service
private readonly sanitizer = inject(DomSanitizer);

// Updated computed signal to return SafeResourceUrl
iframeSrc = computed<SafeResourceUrl | string>(() => {
  const page = this.selectedPage();
  if (!page) return '';
  const url = page.url + (page.url.includes('?') ? '&' : '?') + '_heatmap_preview=1';
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
});
```

### Files Modified

- `src/app/features/admin/website-analytics/heatmaps/heatmaps.component.ts`

---

## Error 2: 422 Unprocessable Entity from Heatmap API

### Problem

The API endpoint `GET /api/v1/website-analytics/heatmap/:path` returned 422 when querying heatmap data for the home page (`/`).

**Request URL:** `http://localhost:3001/api/v1/website-analytics/heatmap/?from=2026-01-25T06:53:45.847Z&to=2026-02-01T06:53:45.847Z`

### Root Cause

In `WebsiteAnalyticsService.getHeatmap()`, the leading `/` was stripped from the page path:

```typescript
const encodedPath = pagePath.startsWith('/')
  ? pagePath.substring(1)    // "/" becomes "" (empty string!)
  : pagePath;
```

For the home page (`/`), this resulted in an empty string. The URL became `/heatmap/` with no path segment.

The backend validator requires `path: z.string().min(1, 'Path is required')`, so an empty path triggers a 422 validation error.

### Fix Applied

```typescript
let encodedPath = pagePath.startsWith('/')
  ? pagePath.substring(1)
  : pagePath;
if (!encodedPath) encodedPath = '/';  // Fallback to "/" for root page
```

This sends `/heatmap//` which Express wildcard route `:path(*)` captures as `path = "/"`, matching the stored path in the database.

### Files Modified

- `src/app/core/services/website-analytics.service.ts`

---

## Error 3: rrweb.js Blocked by Content Blocker

### Problem

```
GET http://localhost:4200/@fs/.../rrweb.js net::ERR_BLOCKED_BY_CONTENT_BLOCKER
```

### Root Cause

Browser content blockers (ad blockers, privacy extensions) block rrweb.js because it's a session recording library commonly flagged as a tracking tool.

### Impact

- **Low impact** — The visitor-tracking service already has a try-catch fallback (line 270):
  ```typescript
  catch { /* rrweb failed to load – silently skip recording */ }
  ```
- Session recording is disabled when rrweb is blocked, but **click tracking still works** independently
- Heatmap click data collection is NOT affected by this

### Recommendation

- No code change needed
- Document that admin users should disable ad blockers for the admin panel if they want session recording features
- Consider adding a small info banner in the Recordings page if rrweb fails to load

---

## Build Verification

After applying fixes:
- Production build: **PASS** (no new errors)
- Pre-existing warnings only (deprecated PrimeNG `styleClass`, Sass `@import`)

---

## Related Files

| File | Role |
|------|------|
| `src/app/features/admin/website-analytics/heatmaps/heatmaps.component.ts` | Heatmaps UI component (iframe, overlay, controls) |
| `src/app/core/services/website-analytics.service.ts` | API service for heatmap data |
| `src/app/core/services/visitor-tracking.service.ts` | Client-side click/session tracking |
| `backend/src/presentation/routes/website-analytics.routes.ts` | Backend route definitions |
| `backend/src/presentation/validators/website-analytics.validators.ts` | Zod validation schemas |
| `backend/src/application/services/website-analytics.service.ts` | Backend heatmap data service |
