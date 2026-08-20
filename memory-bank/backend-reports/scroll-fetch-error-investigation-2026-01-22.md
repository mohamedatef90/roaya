# Technical Investigation Report: "Failed to fetch while scrolling" Error

**Date:** 2026-01-22
**Reported By:** User
**Investigated By:** Super Tech Lead Agent
**Status:** RESOLVED

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** Debug logging code making HTTP fetch calls to localhost:7242 on every scroll event

**Severity:** HIGH (Performance impact + User-facing errors)
**Impact:** Every scroll event triggers network requests that fail when debug server is not running
**Location:** `/src/app/shared/components/scroll-indicator/scroll-indicator.component.ts`

---

## 1. Root Cause Analysis

### Primary Issue: Debug Agent Logging in Production Code

**File:** `scroll-indicator.component.ts`

The scroll event handler contains debug fetch calls that fire every 100ms during scroll:

```typescript
// Inside throttled scroll event handler
this.scrollSubscription = fromEvent(window, 'scroll', { passive: true })
  .pipe(throttleTime(100))
  .subscribe(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/...',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({location:'scroll-indicator.component.ts:164', ...})
    }).catch(()=>{});
    // #endregion
    this.updateActiveSection();
  });
```

**How This Causes the Error:**

1. Scroll Indicator Component is imported in main-layout (global)
2. Every 100ms during scroll, the throttled event fires
3. Each scroll event triggers fetch() calls to localhost:7242
4. When debug server is not running → "Failed to fetch" error
5. Errors propagate to browser console

---

## 2. Performance & User Experience Impact

### Network Performance
- **Request Frequency:** Every 100ms during scroll (10 requests/second)
- **Failed Requests:** 100% failure rate when debug server offline
- **Browser Overhead:** Failed DNS lookups, connection attempts, timeouts

### User-Facing Symptoms
- Browser console flooded with "Failed to fetch" errors
- Potential scroll jank on slower devices
- Network tab shows constant failed requests

---

## 3. Resolution

### Action Taken
Removed all debug fetch calls from `scroll-indicator.component.ts`:
- Deleted fetch calls within `#region agent log` blocks
- Preserved all functional scroll indicator logic
- No changes to user-facing functionality

### Files Modified
- `/src/app/shared/components/scroll-indicator/scroll-indicator.component.ts`

---

## 4. Testing Verification

- [x] Zero network requests during scroll events
- [x] No console errors during normal user scrolling
- [x] Scroll indicator functionality unchanged
- [x] Production build succeeds
- [ ] 60 FPS maintained during scroll (manual verification needed)

---

## 5. Prevention Recommendations

### ADR-015: Debug Logging Policy (Proposed)

**Decision:** Prohibit network calls in UI event handlers; use environment-gated console logging only

**Implementation:**
- Use `isDevMode()` guard for all debug code
- Use `console.debug()` instead of network calls
- Environment configuration for debug features
- Build-time tree-shaking removes debug code from production

---

## 6. Lessons Learned

1. Debug logging code should never make network calls in UI event handlers
2. All debug code must be gated with `isDevMode()` or environment checks
3. Code review should catch hardcoded localhost URLs before merge
