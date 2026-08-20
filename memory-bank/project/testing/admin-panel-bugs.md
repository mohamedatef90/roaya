# Admin Panel Bugs - Quick Reference
**Project:** Roaya Lead Management System
**Last Updated:** 2026-01-21

---

## Critical Bugs (P0)

### BUG-001: TypeScript Compilation Errors in Leads List Component
**Status:** OPEN
**Priority:** P0 (CRITICAL)
**Severity:** CRITICAL
**Assignee:** Frontend Developer
**Blocking:** All testing and deployment

**Summary:**
6 TypeScript compilation errors in `leads-list.component.ts` prevent the application from building. The `getSourceIcon()` method references LeadSource enum values that don't exist.

**Location:**
- File: `/src/app/features/admin/leads/leads-list.component.ts`
- Lines: 287-300

**Error Messages:**
```
✘ [ERROR] TS2739: Type '{ ... }' is missing properties: NEWSLETTER, LINKEDIN, GOOGLE_ADS, ORGANIC
✘ [ERROR] TS2339: Property 'WEBSITE' does not exist on type 'typeof LeadSource'.
✘ [ERROR] TS2339: Property 'BLOG' does not exist on type 'typeof LeadSource'.
✘ [ERROR] TS2339: Property 'CASE_STUDY' does not exist on type 'typeof LeadSource'.
✘ [ERROR] TS2339: Property 'EMAIL' does not exist on type 'typeof LeadSource'.
✘ [ERROR] TS2339: Property 'PHONE' does not exist on type 'typeof LeadSource'.
```

**Impact:**
- Build fails completely
- Application cannot be started
- No testing possible
- Deployment blocked

**Fix Required:** See `admin-panel-critical-fix.md` for detailed fix instructions.

---

### BUG-003: Backend API Not Running
**Status:** OPEN
**Priority:** P0 (CRITICAL)
**Severity:** HIGH
**Assignee:** Backend Developer
**Blocking:** All API-dependent tests (TC4-TC11)

**Summary:**
Backend API server is not running at configured endpoint, preventing testing of login, leads data loading, and dashboard functionality.

**Expected:**
- API running at `http://localhost:3001/api/v1`
- Endpoints responding to requests

**Actual:**
- API not reachable
- Connection refused errors

**Impact:**
- Cannot test login flow
- Cannot load leads data
- Cannot display dashboard stats
- Cannot test any CRUD operations

**Fix Required:**
1. Start backend server: `cd backend && npm run dev`
2. Verify API health: `curl http://localhost:3001/api/v1/health`
3. Seed test data: `npm run seed`

---

## High Priority Bugs (P1)

None currently identified (all testing blocked by P0 bugs)

---

## Medium Priority Bugs (P2)

None currently identified (all testing blocked by P0 bugs)

---

## Low Priority Bugs (P3)

### BUG-002: Unused PrimeNG Component Imports
**Status:** OPEN
**Priority:** P3
**Severity:** LOW
**Assignee:** Frontend Developer
**Blocking:** None

**Summary:**
Two PrimeNG components are imported but not used in templates, causing build warnings and minor bundle size increase.

**Affected Files:**
1. `lead-detail.component.ts:62` - `TabPanels` not used
2. `leads-list.component.ts:54` - `Select` not used

**Warning Messages:**
```
▲ [WARNING] NG8113: TabPanels is not used within the template of LeadDetailComponent
▲ [WARNING] NG8113: Select is not used within the template of LeadsListComponent
```

**Impact:**
- Build warnings
- Minor bundle size increase (~2-3KB)
- Code cleanliness

**Fix:**
Remove unused imports from both files:
```typescript
// Remove from imports array
TabPanels,  // lead-detail.component.ts
Select,     // leads-list.component.ts
```

---

### BUG-004: Deprecated Sass @import Syntax
**Status:** OPEN
**Priority:** P3
**Severity:** LOW
**Assignee:** Frontend Developer
**Blocking:** None

**Summary:**
`styles.scss` uses deprecated `@import` syntax which will be removed in Dart Sass 3.0.0.

**Location:**
- File: `/src/styles.scss`
- Line: 9

**Warning Message:**
```
▲ [WARNING] Deprecation [plugin angular-sass]
src/styles.scss:9:8:
@import './styles/theme.scss';

Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

**Impact:**
- Build warning
- Future compatibility issue

**Fix:**
Replace `@import` with `@use`:
```scss
// Old (deprecated)
@import './styles/theme.scss';

// New (recommended)
@use './styles/theme.scss';
```

---

## Bug Statistics

| Priority | Count | Blocking Testing |
|----------|-------|-----------------|
| P0 (Critical) | 2 | Yes (all tests) |
| P1 (High) | 0 | - |
| P2 (Medium) | 0 | - |
| P3 (Low) | 2 | No |
| **TOTAL** | **4** | **2 blockers** |

---

## Severity Breakdown

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 1 |
| Medium | 0 |
| Low | 2 |
| **TOTAL** | **4** |

---

## Priority Matrix

```
CRITICAL (P0)     │ BUG-001: TypeScript errors
                  │ BUG-003: Backend not running
──────────────────┼────────────────────────────────
HIGH (P1)         │ (None)
──────────────────┼────────────────────────────────
MEDIUM (P2)       │ (None)
──────────────────┼────────────────────────────────
LOW (P3)          │ BUG-002: Unused imports
                  │ BUG-004: Deprecated Sass syntax
```

---

## Fix Priority Order

1. **IMMEDIATE:** BUG-001 (TypeScript errors) - BLOCKS EVERYTHING
2. **IMMEDIATE:** BUG-003 (Start backend) - BLOCKS API TESTING
3. **SOON:** BUG-002 (Remove unused imports) - Code quality
4. **LATER:** BUG-004 (Migrate Sass syntax) - Future-proofing

---

## Estimated Fix Time

| Bug | Complexity | Time Estimate |
|-----|------------|---------------|
| BUG-001 | Low | 15 minutes |
| BUG-002 | Trivial | 5 minutes |
| BUG-003 | Medium | 30 minutes (setup) |
| BUG-004 | Low | 1 hour (test all styles) |
| **TOTAL** | - | **~2 hours** |

---

## Testing Readiness Checklist

- [ ] BUG-001 fixed and verified
- [ ] BUG-003 resolved (backend running)
- [ ] Build succeeds: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] App loads at `http://localhost:4200`
- [ ] Login page accessible at `/admin/login`
- [ ] API health check passes
- [ ] Test user seeded in database

**When all items checked:** Ready for full test execution

---

## Notes

- All bugs discovered during pre-test build validation
- No runtime testing performed yet (blocked by build errors)
- Code review performed on static analysis only
- Architecture and service design appear solid once bugs are fixed

---

**Last Review:** 2026-01-21
**Next Review:** After P0 bugs are resolved
