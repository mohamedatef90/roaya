# Roaya Website Audit Fix Plan

## Overview
**Total Issues:** 161 (93 language issues + 68 UI bugs) across 24 pages
**Framework:** Angular 21 with ngx-translate, Tailwind CSS v4
**Audit Report:** `/memory-bank/Audit/Roaya_Website_Test_Report.md`

---

## Phase 1: Critical i18n Fixes (HIGH Priority)

### 1.1 Add Missing Translation Keys
**Files:**
- `/roaya-website/src/assets/i18n/en.json` - Add to `common` section:
  ```json
  "of": "of",
  "goToTestimonial": "Go to testimonial"
  ```
- `/roaya-website/src/assets/i18n/ar.json` - Add:
  ```json
  "of": "من",
  "goToTestimonial": "الانتقال إلى الشهادة"
  ```

### 1.2 Fix SEO Service Translation Bug
**File:** `/roaya-website/src/app/features/resources/coming-soon/coming-soon.component.ts`
- Inject `TranslateService`
- Use `translate.instant()` to translate keys before passing to SEO service

---

## Phase 2: Breadcrumb Accessibility (HIGH Priority)

**Issue:** 17 service pages use "/" as separate `<li>` items
**Fix:** Replace "/" text with SVG chevron icon (already used correctly in industry-detail.component.html)

**Files to update:**
1. `/src/app/features/services/backup/backup.component.html`
2. `/src/app/features/services/automation/automation.component.html`
3. `/src/app/features/services/cloud/cloud.component.html`
4. `/src/app/features/services/consulting/consulting.component.html`
5. `/src/app/features/services/devops/devops.component.html`
6. `/src/app/features/services/email/email.component.html`
7. `/src/app/features/services/managed/managed.component.html`
8. `/src/app/features/services/sap/sap.component.html`
9. `/src/app/features/services/worldposta/worldposta.component.html`
10. `/src/app/features/services/security/security.component.html`
11. `/src/app/features/services/security/penetration-testing/penetration-testing.component.html`
12. `/src/app/features/services/security/soc-solutions/soc-solutions.component.html`
13. `/src/app/features/services/security/incident-response/incident-response.component.html`
14. `/src/app/features/services/service-detail/service-detail.component.html`

**Pattern to apply:**
```html
<!-- Before -->
<li aria-hidden="true" class="rtl:rotate-180">/</li>

<!-- After -->
<li aria-hidden="true">
  <svg class="w-4 h-4 rtl:rotate-180" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
  </svg>
</li>
```

---

## Phase 3: Complementary Services Links (HIGH Priority)

**Issue:** Service cards wrap title + description + CTA in single `<a>` tag (poor accessibility)
**Fix:** Add `aria-label` attribute with concise description

**Files to update (7 service pages):**
1. `/src/app/features/services/consulting/consulting.component.html`
2. `/src/app/features/services/backup/backup.component.html`
3. `/src/app/features/services/automation/automation.component.html`
4. `/src/app/features/services/managed/managed.component.html`
5. `/src/app/features/services/email/email.component.html`
6. `/src/app/features/services/cloud/cloud.component.html`
7. `/src/app/features/services/sap/sap.component.html`

**Pattern:**
```html
<a [routerLink]="service.route"
   [attr.aria-label]="'Learn more about ' + (service.title | translate)">
```

---

## Phase 4: Translation File Fixes (MEDIUM Priority)

### 4.1 en.json Fixes
**File:** `/roaya-website/src/assets/i18n/en.json`

| Fix Type | Search Pattern | Replacement |
|----------|----------------|-------------|
| timezone -> time zone | `"timezone"` | `"time zone"` |
| Missing periods | Sentences ending without `.` | Add `.` |
| Grammar: analytics | `"analytics that improves"` | `"analytics that improve"` |
| Expand CBE | `"CBE regulations"` | `"Central Bank of Egypt (CBE) regulations"` |
| Expand SOC | First `"SOC"` occurrence | `"Security Operations Center (SOC)"` |
| Copyright year | `"© 2024"` or `"© 2026"` | Keep dynamic with company name |

### 4.2 Specific Text Fixes (from audit)
- `"Egyptian support team available 24/7 in your timezone and language."`
  → `"Our Egyptian support team is available 24/7 in your time zone and language."`
- `"<4 Hour"` → `"Under 4 Hours"`
- `"15 min"` → `"15 minutes"`
- `"Protect,Detect,Respond"` → `"Protect, Detect, Respond"`
- `"Loading ."` / `"Loading .."` → `"Loading..."`

### 4.3 ar.json Parity
Apply equivalent fixes to Arabic translation file.

---

## Phase 5: Pricing Link Fixes (MEDIUM Priority)

**Issue:** "View Pricing" buttons link to `/contact` instead of `/pricing`
**Decision:** Change button label to "Contact for Pricing" (keeping /contact link)

**Translation key to add:**
- `en.json`: `"contactForPricing": "Contact for Pricing"`
- `ar.json`: `"contactForPricing": "تواصل معنا للتسعير"`

**Files to update:**
- `/src/app/features/services/managed/managed.component.html`
- `/src/app/features/services/sap/sap.component.html`
- `/src/app/features/services/consulting/consulting.component.html`
- `/src/app/features/services/cloud/cloud.component.html`
- `/src/app/features/services/automation/automation.component.html`
- `/src/app/features/services/backup/backup.component.html`
- `/src/app/features/services/email/email.component.html`

---

## Phase 6: Skip Link & Main Content (MEDIUM Priority)

**File:** `/src/app/layouts/main-layout/main-layout.component.html`
- Add `tabindex="-1"` to `<main id="main-content">` for programmatic focus

---

## Phase 7: Image Alt Text Audit (MEDIUM Priority)

**Issue:** Many images lack descriptive alt text
**Approach:**
1. Audit all `<img>` tags in feature components
2. For decorative images: `alt="" role="presentation"`
3. For content images: Add descriptive alt text
4. For service/partner logos: Use company/service name

---

## Phase 8: Loading State Standardization (LOW Priority)

**Issue:** Inconsistent loading text ("Loading .", "Loading ..", "Loading...")
**Fix:** Ensure all loading states use `{{ 'common.loading' | translate }}`

---

## Phase 9: Footer Copyright (LOW Priority)

**File:** `/src/app/layouts/main-layout/main-layout.component.html`
- Ensure copyright includes company name: `"© 2026 Roaya IT. All rights reserved."`

---

## Phase 10: Console Warning Fixes (LOW Priority)

- Add defensive checks for GSAP animation targets
- Ensure Three.js material colors have default values
- Add graceful WebGL fallback

---

## Verification Steps

After each phase:
1. `npm run build` - Verify no build errors
2. `npm run lint` - Check linting issues
3. Test in English and Arabic
4. Test on mobile and desktop
5. Run accessibility audit (screen reader testing for breadcrumbs, links)
6. Check dark mode compatibility

---

## Summary: Issues by Category

| Category | Count | Phase |
|----------|-------|-------|
| Missing translation keys | 2 | 1 |
| SEO translation bug | 1 | 1 |
| Breadcrumb accessibility | 17 pages | 2 |
| Complementary services links | 7 pages | 3 |
| Language/copy fixes | ~80 | 4 |
| Pricing link misdirection | 7 pages | 5 |
| Skip link target | 1 | 6 |
| Image alt text | ~30 | 7 |
| Loading state text | ~5 | 8 |
| Footer copyright | 1 | 9 |
| Console warnings | ~3 | 10 |

---

## Critical Files Summary

1. **`/src/assets/i18n/en.json`** - Translation fixes
2. **`/src/assets/i18n/ar.json`** - Arabic parity
3. **`/src/app/features/resources/coming-soon/coming-soon.component.ts`** - SEO fix
4. **17 service page HTML files** - Breadcrumb fixes
5. **7 service page HTML files** - Complementary services accessibility
6. **`/src/app/layouts/main-layout/main-layout.component.html`** - Layout fixes
