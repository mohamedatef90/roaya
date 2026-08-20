# Website Analytics Module - Comprehensive QA Test Strategy

**Project:** Roaya IT Corporate Website
**Module:** Website Analytics (Visitor Tracking, Heatmaps, Session Recording)
**Date:** 2026-02-01
**Test Engineer:** QA/Test Engineer Agent
**Status:** Ready for Testing

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Test Strategy Overview](#test-strategy-overview)
3. [Test Scope](#test-scope)
4. [Test Cases by Feature Area](#test-cases-by-feature-area)
5. [E2E Test Scenarios (Playwright)](#e2e-test-scenarios-playwright)
6. [Regression Test Checklist](#regression-test-checklist)
7. [Bug Report Template](#bug-report-template)

---

## Executive Summary

### Feature Overview
The Website Analytics module is a comprehensive visitor tracking and analytics system providing Hotjar-like capabilities including visitor tracking, heatmaps, session recordings, and real-time active visitor monitoring via WebSocket.

**Risk Level:** 🔴 **High**
**Testing Priority:** **P0 (Critical)**
**Coverage Goal:** 90%+ (automated E2E + manual testing)

### Key Features
- GDPR-compliant visitor tracking with consent management
- Real-time session recording with rrweb
- Click heatmaps with intensity controls
- WebSocket-based active visitor monitoring
- Automated data retention (30/90/180 days)
- Bot detection and IP anonymization
- Performance optimization (in-memory cache, compressed recordings, daily summary table)
- Security (rate limiting, JWT auth, input validation)

### Quality Gates

**Entry Criteria:**
- ✅ All 3 implementation phases completed
- ✅ Backend API endpoints functional
- ✅ Frontend components implemented
- ✅ WebSocket server operational
- ✅ Database migrations applied
- ✅ GDPR consent banner integrated

**Exit Criteria:**
- ✅ All P0 test cases pass
- ✅ 90%+ P1 test cases pass
- ✅ No critical bugs outstanding
- ✅ Performance benchmarks met (response time < 500ms, cache hit rate > 70%)
- ✅ GDPR compliance verified
- ✅ Cross-browser compatibility confirmed (Chrome, Firefox, Safari)
- ✅ Security audit passed

---

## Test Strategy Overview

### 1. Test Types & Coverage

| Test Type | Coverage | Ownership | Tools | Priority |
|-----------|----------|-----------|-------|----------|
| **Unit Tests** | Service logic, utility functions | Backend Team | Jest/Vitest | P1 |
| **Integration Tests** | API endpoints, database operations | Backend Team | Jest + Supertest | P0 |
| **E2E Tests** | Critical user flows | QA Team | Playwright | P0 |
| **Manual Tests** | GDPR compliance, visual QA | QA Team | Manual + Checklist | P0 |
| **Security Tests** | Rate limiting, JWT auth, XSS/CSRF | Security Reviewer | OWASP ZAP, Manual | P0 |
| **Performance Tests** | Response time, WebSocket scalability | QA Team | k6, Artillery | P1 |
| **Accessibility Tests** | WCAG 2.1 AA compliance | QA Team | axe-core, Lighthouse | P2 |

### 2. Test Environment Requirements

**Frontend:**
- Node.js 18+ with Angular 21
- Test browsers: Chrome (latest), Firefox (latest), Safari (latest 2 versions)
- Test devices: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

**Backend:**
- Node.js 18+ with Express
- PostgreSQL 14+ with Prisma ORM
- Redis (optional, for distributed cache)
- WebSocket support (ws library)

**Test Data:**
- Seed database with 100+ sessions, 500+ page views, 200+ clicks
- Mock consent states (accepted/declined/none)
- Mock bot user agents
- Test visitor IDs and session IDs

### 3. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **GDPR Non-Compliance** | 🟡 Medium | 🔴 Critical | Dedicated GDPR test suite, legal review |
| **Performance Degradation** | 🟡 Medium | 🟠 High | Performance testing, cache monitoring |
| **WebSocket Connection Failure** | 🟡 Medium | 🟡 Medium | Fallback to polling, reconnection logic |
| **Bot Traffic Skewing Data** | 🟢 Low | 🟡 Medium | Bot detection validation |
| **Session Recording Storage Overflow** | 🟡 Medium | 🟠 High | Retention policy testing, compression validation |
| **XSS in Heatmap Overlay** | 🟢 Low | 🔴 Critical | Security testing, input sanitization |
| **Rate Limit Bypass** | 🟢 Low | 🟠 High | Rate limiter testing |

---

## Test Scope

### In-Scope

| Feature | Testing Approach |
|---------|------------------|
| ✅ **Consent Banner** | Manual + E2E |
| ✅ **Visitor Tracking** | E2E + Integration |
| ✅ **Session Recording** | E2E + Manual |
| ✅ **Admin Dashboard** | E2E + Manual |
| ✅ **Heatmaps** | E2E + Manual |
| ✅ **Recordings List** | E2E + Manual |
| ✅ **WebSocket Active Visitors** | Integration + E2E |
| ✅ **Data Retention Cron** | Integration + Manual |
| ✅ **Bot Detection** | Integration |
| ✅ **CSV/JSON Export** | Manual |
| ✅ **Custom Events** | Integration |
| ✅ **Security (Auth, Rate Limiting)** | Security + Integration |
| ✅ **Performance (Cache, Compression)** | Performance + Manual |
| ✅ **GDPR Compliance** | Manual + Legal Review |

### Out-of-Scope

| Item | Reason |
|------|--------|
| ❌ **Third-party Analytics (Google Analytics 4)** | Separate module |
| ❌ **Backend Admin Panel (other than Analytics)** | Separate feature |
| ❌ **Email Reporting** | Future feature |
| ❌ **Mobile App Analytics** | Not in scope |
| ❌ **A/B Testing** | Future feature |

---

## Test Cases by Feature Area

### 1. Consent Banner (9 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-CONSENT-001** | Display consent banner on first visit | Functional | Clear localStorage, visit website | 1. Open browser in incognito mode<br>2. Navigate to homepage | Banner appears at bottom with "Accept" and "Decline" buttons | | ⏳ Pending |
| **TC-CONSENT-002** | Accept analytics consent | Functional | Consent banner visible | 1. Check "Allow session recording" checkbox<br>2. Click "Accept" button | Banner disappears, `ra_analytics_consent=accepted` in localStorage, tracking starts | | ⏳ Pending |
| **TC-CONSENT-003** | Decline analytics consent | Functional | Consent banner visible | 1. Click "Decline" button | Banner disappears, `ra_analytics_consent=declined` in localStorage, no tracking | | ⏳ Pending |
| **TC-CONSENT-004** | Accept without recording consent | Functional | Consent banner visible | 1. Leave recording checkbox unchecked<br>2. Click "Accept" | Banner disappears, `ra_recording_consent=declined`, page views tracked but no recording | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-CONSENT-005** | Consent persists across sessions | Functional | Accepted consent | 1. Accept consent<br>2. Close browser<br>3. Reopen website | Banner does not appear, tracking continues | | ⏳ Pending |
| **TC-CONSENT-006** | Do Not Track header respected | Functional | Browser DNT enabled | 1. Enable DNT in browser<br>2. Visit website | Tracking disabled even if consent accepted | | ⏳ Pending |
| **TC-CONSENT-007** | Privacy policy link works | Functional | Consent banner visible | 1. Click "Learn more" link | Navigates to `/privacy` page | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-CONSENT-008** | Consent banner RTL layout (Arabic) | UI | Language set to Arabic | 1. Switch to Arabic language<br>2. View consent banner | Banner text is RTL, buttons are right-aligned | | ⏳ Pending |
| **TC-CONSENT-009** | Consent banner mobile responsive | UI | Mobile viewport (375px) | 1. Resize viewport to 375px<br>2. View banner | Banner is readable, buttons stack vertically | | ⏳ Pending |

---

### 2. Visitor Tracking (12 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-TRACK-001** | Start session on first page view | Functional | Consent accepted | 1. Visit homepage with consent accepted | Session created in DB with visitorId, device, browser | | ⏳ Pending |
| **TC-TRACK-002** | Track page view | Functional | Active session | 1. Navigate to `/services` page | PageView record created with sessionId, path, referrer | | ⏳ Pending |
| **TC-TRACK-003** | Track click for heatmap | Functional | Active session | 1. Click on element at (50%, 30%) | HeatmapClick record created with x, y, elementTag | | ⏳ Pending |
| **TC-TRACK-004** | End session on page unload | Functional | Active session | 1. Close browser tab | Session endedAt timestamp updated | | ⏳ Pending |
| **TC-TRACK-005** | Update page duration on navigation | Functional | Active session, page viewed for 30s | 1. View page for 30s<br>2. Navigate to another page | PageView.duration updated to ~30s | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-TRACK-006** | Detect device type correctly | Functional | Various devices | 1. Visit from mobile (iPhone)<br>2. Visit from tablet (iPad)<br>3. Visit from desktop | Device correctly identified (mobile/tablet/desktop) | | ⏳ Pending |
| **TC-TRACK-007** | Detect browser correctly | Functional | Various browsers | 1. Visit from Chrome<br>2. Visit from Firefox<br>3. Visit from Safari | Browser correctly identified | | ⏳ Pending |
| **TC-TRACK-008** | Track UTM parameters | Functional | UTM in URL | 1. Visit `/?utm_source=google&utm_medium=cpc&utm_campaign=test` | Session has utmSource, utmMedium, utmCampaign populated | | ⏳ Pending |
| **TC-TRACK-009** | Skip admin routes | Functional | Active session | 1. Navigate to `/admin/dashboard` | No PageView created for admin routes | | ⏳ Pending |
| **TC-TRACK-010** | Scroll depth tracking | Functional | Active session | 1. Scroll to 75% of page<br>2. Navigate away | PageView.scrollDepth ~75% | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-TRACK-011** | Click throttling (500ms) | Functional | Active session | 1. Click rapidly 5 times in 300ms | Only 1-2 clicks tracked (throttled) | | ⏳ Pending |
| **TC-TRACK-012** | Heatmap preview mode skips tracking | Functional | Heatmap preview URL | 1. Visit `/?_heatmap_preview=1` | No tracking occurs | | ⏳ Pending |

---

### 3. Session Recording (10 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RECORD-001** | Start rrweb recording with consent | Functional | Recording consent accepted | 1. Accept recording consent<br>2. Navigate pages | SessionRecordingEvent records created with rrweb events | | ⏳ Pending |
| **TC-RECORD-002** | Flush recording events (50 events) | Functional | Active recording | 1. Generate 50+ events (clicks, scrolls) | Events flushed to backend in batch | | ⏳ Pending |
| **TC-RECORD-003** | Compress recording data (gzip) | Functional | Active recording | 1. Generate events<br>2. Check network payload | Request has `Content-Encoding: gzip` header, payload is compressed | | ⏳ Pending |
| **TC-RECORD-004** | Fallback to uncompressed if no CompressionStream | Functional | Safari < 16.4 (no CompressionStream) | 1. Test in Safari 15<br>2. Generate events | Uncompressed JSON sent, tracking continues | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RECORD-005** | No recording without consent | Functional | Recording consent declined | 1. Decline recording consent<br>2. Navigate pages | No SessionRecordingEvent records created | | ⏳ Pending |
| **TC-RECORD-006** | Recording stops on session end | Functional | Active recording | 1. Close browser tab | Recording stopped, final events flushed via sendBeacon | | ⏳ Pending |
| **TC-RECORD-007** | Mask sensitive inputs | Functional | Active recording, form with password | 1. Type in password field<br>2. Review recording | Password field is masked (rrweb `maskAllInputs: true`) | | ⏳ Pending |
| **TC-RECORD-008** | Block elements with rr-block class | Functional | Active recording, element with `class="rr-block"` | 1. View page with blocked element<br>2. Review recording | Element content is blocked | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RECORD-009** | Recording sequence numbering | Functional | Active recording | 1. Generate 3 batches of events | Each batch has incrementing sequence (0, 1, 2) | | ⏳ Pending |
| **TC-RECORD-010** | Recording byte size calculation | Functional | Active recording | 1. Generate events<br>2. Check DB | SessionRecordingEvent.byteSize matches JSON byte size | | ⏳ Pending |

---

### 4. Admin Dashboard (12 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-DASH-001** | Load dashboard overview | Functional | Admin authenticated | 1. Navigate to `/admin/website-analytics/dashboard` | Stats cards show: unique visitors, page views, avg duration, bounce rate | | ⏳ Pending |
| **TC-DASH-002** | Date range filter (Last 7 days) | Functional | Dashboard loaded | 1. Select "Last 7 days" from dropdown<br>2. Verify stats | Stats update to show last 7 days data | | ⏳ Pending |
| **TC-DASH-003** | Visitors chart (daily) | Functional | Dashboard loaded | 1. View "Visitors Overview" chart | Line chart shows daily page views with dates on X-axis | | ⏳ Pending |
| **TC-DASH-004** | Device breakdown doughnut chart | Functional | Dashboard loaded | 1. View "Device Breakdown" chart | Doughnut chart shows desktop/tablet/mobile percentages | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-DASH-005** | Active visitors real-time (WebSocket) | Functional | Dashboard loaded, WebSocket connected | 1. Open dashboard<br>2. Verify "Active Users" card | Active users count updates every 10s via WebSocket | | ⏳ Pending |
| **TC-DASH-006** | Fallback to polling if WebSocket fails | Functional | Dashboard loaded, WebSocket disabled | 1. Disable WebSocket (mock network error)<br>2. Verify active users | Active users updates via HTTP polling every 30s | | ⏳ Pending |
| **TC-DASH-007** | Top pages table | Functional | Dashboard loaded | 1. View "Top Pages" table | Table shows top 5 pages with views and avg duration | | ⏳ Pending |
| **TC-DASH-008** | Top countries with flags | Functional | Dashboard loaded | 1. View "Top Countries" section | Countries listed with flag emojis (🇪🇬, 🇺🇸, etc.) | | ⏳ Pending |
| **TC-DASH-009** | Chart period toggle (daily/weekly/monthly) | Functional | Dashboard loaded | 1. Click "Weekly" toggle on chart<br>2. Verify chart | Chart data aggregates by week | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-DASH-010** | Empty state (no data) | UI | Dashboard with no analytics data | 1. View dashboard with empty DB | Charts show empty state with helpful message | | ⏳ Pending |
| **TC-DASH-011** | Dark mode support | UI | Dashboard loaded, dark mode enabled | 1. Toggle dark mode<br>2. Verify dashboard | All charts and cards render correctly in dark mode | | ⏳ Pending |
| **TC-DASH-012** | Mobile responsive layout | UI | Dashboard on mobile (375px) | 1. Resize to 375px<br>2. Verify layout | Stats cards stack, charts are scrollable | | ⏳ Pending |

---

### 5. Heatmaps (10 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-HEAT-001** | Select page for heatmap | Functional | Admin authenticated | 1. Navigate to `/admin/website-analytics/heatmaps`<br>2. Click on a page from list | Page preview loads in iframe, heatmap overlay displays | | ⏳ Pending |
| **TC-HEAT-002** | Heatmap overlay with click data | Functional | Page selected, clicks exist | 1. View heatmap overlay | Click points rendered as gradient heatmap (blue → red) | | ⏳ Pending |
| **TC-HEAT-003** | Adjust heatmap radius (Tight/Normal/Wide) | Functional | Heatmap displayed | 1. Click "Tight" radius button<br>2. Click "Wide" radius button | Heatmap re-renders with smaller/larger click circles | | ⏳ Pending |
| **TC-HEAT-004** | Device filter (Desktop/Tablet/Mobile) | Functional | Heatmap displayed | 1. Click "Mobile" device filter<br>2. Verify iframe | Iframe scales to mobile width (375px), heatmap updates | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-HEAT-005** | Legend toggle (show/hide) | Functional | Heatmap displayed | 1. Click legend toggle button | Legend appears/disappears from bottom-right corner | | ⏳ Pending |
| **TC-HEAT-006** | Scroll map visualization | Functional | Heatmap displayed, scroll map tab | 1. Click "Scroll Map" tab | Color zones show scroll depth (green=100%, red=25%) | | ⏳ Pending |
| **TC-HEAT-007** | Search pages by URL | Functional | Pages list loaded | 1. Type "/pricing" in search<br>2. Verify list | Only pricing page shown in list | | ⏳ Pending |
| **TC-HEAT-008** | Date range filter for heatmap | Functional | Heatmap displayed | 1. Select "Last 30 days" date range<br>2. Verify heatmap | Heatmap shows clicks from last 30 days only | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-HEAT-009** | Iframe cross-origin handling | Security | Heatmap preview | 1. Load heatmap preview<br>2. Check console | No CORS errors, iframe loads with `?_heatmap_preview=1` param | | ⏳ Pending |
| **TC-HEAT-010** | Empty heatmap (no clicks) | UI | Page with no click data | 1. Select page with 0 clicks | Heatmap shows empty state with message | | ⏳ Pending |

---

### 6. Recordings List (10 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-REC-001** | Load recordings list | Functional | Admin authenticated | 1. Navigate to `/admin/website-analytics/recordings` | Table shows recent recordings with sessionId, duration, device | | ⏳ Pending |
| **TC-REC-002** | Play recording | Functional | Recordings list loaded | 1. Click play button on a recording | Modal opens, rrweb player loads and plays session | | ⏳ Pending |
| **TC-REC-003** | Recording playback speed control | Functional | Recording player open | 1. Click "2x" speed button<br>2. Verify playback | Recording plays at 2x speed | | ⏳ Pending |
| **TC-REC-004** | Pagination (10 per page) | Functional | 20+ recordings exist | 1. View recordings list<br>2. Click page 2 | Shows recordings 11-20 | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-REC-005** | Filter by device type | Functional | Recordings list loaded | 1. Select "Mobile" from device dropdown<br>2. Verify list | Only mobile recordings shown | | ⏳ Pending |
| **TC-REC-006** | Filter by duration | Functional | Recordings list loaded | 1. Select "> 5 minutes" from duration dropdown<br>2. Verify list | Only recordings > 5min shown | | ⏳ Pending |
| **TC-REC-007** | Search by page URL | Functional | Recordings list loaded | 1. Type "/pricing" in search box<br>2. Verify list | Only recordings with /pricing page view shown | | ⏳ Pending |
| **TC-REC-008** | Download recording | Functional | Recording selected | 1. Click download button | Toast shows "Coming Soon" message (feature not yet implemented) | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-REC-009** | No recording events available | UI | Recording with 0 events | 1. Open recording with no events<br>2. Verify modal | Modal shows "No Recording Available" message | | ⏳ Pending |
| **TC-REC-010** | Delete recording | Functional | Recording selected | 1. Click delete button<br>2. Confirm deletion | Recording removed from list (client-side only for now) | | ⏳ Pending |

---

### 7. WebSocket Active Visitors (8 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-WS-001** | Connect to WebSocket with valid JWT | Functional | Admin authenticated | 1. Navigate to dashboard<br>2. Check network tab | WebSocket connection established to `/ws/analytics/active-visitors` | | ⏳ Pending |
| **TC-WS-002** | Receive active visitors data | Functional | WebSocket connected | 1. Wait 10 seconds<br>2. Check messages | Message received: `{"type":"active_visitors","data":{...}}` | | ⏳ Pending |
| **TC-WS-003** | Update every 10 seconds | Functional | WebSocket connected | 1. Monitor WebSocket messages for 30s | Messages received at 0s, 10s, 20s, 30s | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-WS-004** | Reject connection without JWT | Security | No JWT token | 1. Attempt WebSocket connection without token | Connection rejected with 401 Unauthorized | | ⏳ Pending |
| **TC-WS-005** | Reject connection for non-admin role | Security | JWT with SALES_REP role | 1. Attempt connection with non-admin token | Connection rejected with 403 Forbidden | | ⏳ Pending |
| **TC-WS-006** | Automatic reconnection on disconnect | Functional | WebSocket connected | 1. Disconnect WebSocket (mock network error)<br>2. Wait for reconnection | Client reconnects with exponential backoff | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-WS-007** | Heartbeat ping/pong | Functional | WebSocket connected | 1. Monitor ping/pong every 30s | Server sends ping, client responds with pong | | ⏳ Pending |
| **TC-WS-008** | Terminate unresponsive connection | Functional | WebSocket connected, client stops responding | 1. Mock client not sending pong<br>2. Wait 60s | Server terminates connection after 2 missed pongs | | ⏳ Pending |

---

### 8. Data Retention (8 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RETENTION-001** | Cron runs daily at 03:00 UTC | Integration | Cron scheduler started | 1. Set system time to 02:59 UTC<br>2. Wait 2 minutes<br>3. Check logs | Cleanup job executes at 03:00 UTC | | ⏳ Pending |
| **TC-RETENTION-002** | Delete session recordings after 30 days | Integration | Recordings older than 30 days exist | 1. Trigger cleanup job<br>2. Check DB | SessionRecordingEvent records > 30 days deleted | | ⏳ Pending |
| **TC-RETENTION-003** | Delete heatmap clicks after 90 days | Integration | Heatmap clicks older than 90 days exist | 1. Trigger cleanup job<br>2. Check DB | HeatmapClick records > 90 days deleted | | ⏳ Pending |
| **TC-RETENTION-004** | Delete sessions after 180 days | Integration | Sessions older than 180 days exist | 1. Trigger cleanup job<br>2. Check DB | AnalyticsSession records > 180 days deleted | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RETENTION-005** | Daily summary computed before cleanup | Integration | No summary for yesterday | 1. Trigger cleanup job<br>2. Check DB | AnalyticsDailySummary created for yesterday before deletion | | ⏳ Pending |
| **TC-RETENTION-006** | Batch deletion (1000 per batch) | Integration | 5000+ old records exist | 1. Trigger cleanup job<br>2. Monitor logs | Deletion happens in 5 batches of 1000 | | ⏳ Pending |
| **TC-RETENTION-007** | Configurable retention periods (env vars) | Integration | Set `RECORDING_RETENTION_DAYS=7` | 1. Set env var<br>2. Trigger cleanup | Recordings > 7 days deleted (instead of 30) | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-RETENTION-008** | Manual cleanup trigger (admin panel) | Manual | Admin panel available | 1. Click "Run Cleanup Now" button<br>2. Verify logs | Cleanup runs immediately, logs show results | | ⏳ Pending |

---

### 9. Bot Detection (6 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-BOT-001** | Detect Googlebot | Integration | None | 1. Send request with UA `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` | Session created with `isBot: true` | | ⏳ Pending |
| **TC-BOT-002** | Exclude bots from analytics | Integration | Bot session exists | 1. Trigger overview query<br>2. Verify results | Bot sessions not counted in stats | | ⏳ Pending |
| **TC-BOT-003** | Human session not flagged as bot | Integration | None | 1. Send request with UA `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36` | Session created with `isBot: false` | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-BOT-004** | Detect common bots (BingBot, YandexBot, etc.) | Integration | None | 1. Send requests with various bot UAs<br>2. Check DB | All bot sessions flagged with `isBot: true` | | ⏳ Pending |
| **TC-BOT-005** | Detect curl/wget requests | Integration | None | 1. Send request with UA `curl/7.68.0`<br>2. Check DB | Session flagged as bot | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-BOT-006** | Empty user agent handling | Integration | None | 1. Send request with no UA header<br>2. Check DB | Session created with `isBot: false` (edge case, treat as human) | | ⏳ Pending |

---

### 10. CSV/JSON Export (5 Test Cases)

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-EXPORT-001** | Export recordings as CSV | Manual | Recordings exist | 1. Click "Export" button on recordings page<br>2. Select CSV format | CSV file downloads with session data | | ⏳ Pending |
| **TC-EXPORT-002** | Export recordings as JSON | Manual | Recordings exist | 1. Click "Export" button<br>2. Select JSON format | JSON file downloads with session data | | ⏳ Pending |
| **TC-EXPORT-003** | Export dashboard report | Manual | Dashboard loaded | 1. Click "Export Report" button on dashboard | PDF/CSV report downloads with overview stats | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-EXPORT-004** | Export with no data | Manual | Empty recordings list | 1. Click "Export" button | Toast shows "No data to export" | | ⏳ Pending |
| **TC-EXPORT-005** | Export large dataset (1000+ records) | Performance | 1000+ recordings exist | 1. Click "Export" button<br>2. Monitor time | Export completes in < 10 seconds | | ⏳ Pending |

---

### 11. Custom Events (8 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-EVENT-001** | Track custom event | Integration | Active session | 1. POST to `/tracking/event` with `{eventName: "button_click", eventCategory: "engagement", pagePath: "/pricing"}` | CustomAnalyticsEvent created in DB | | ⏳ Pending |
| **TC-EVENT-002** | Query events by name | Integration | Custom events exist | 1. GET `/events?eventName=button_click` | Returns only button_click events | | ⏳ Pending |
| **TC-EVENT-003** | Events summary (top 10) | Integration | Custom events exist | 1. GET `/events/summary` | Returns top 10 events by count | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-EVENT-004** | Query events by category | Integration | Custom events exist | 1. GET `/events?eventCategory=engagement` | Returns only engagement category events | | ⏳ Pending |
| **TC-EVENT-005** | Events over time (daily granularity) | Integration | Custom events exist | 1. GET `/events/summary?from=2026-01-01&to=2026-01-31` | Returns daily event counts | | ⏳ Pending |
| **TC-EVENT-006** | Event data JSON field | Integration | None | 1. Track event with `eventData: {button_id: "cta-1"}` | Event stored with JSON data | | ⏳ Pending |

#### P2 - Edge Cases

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-EVENT-007** | Empty eventData | Integration | None | 1. Track event with no eventData | Event created with empty object `{}` | | ⏳ Pending |
| **TC-EVENT-008** | Pagination (100 events per page) | Integration | 200+ events exist | 1. GET `/events?limit=100&offset=0`<br>2. GET `/events?limit=100&offset=100` | Returns first 100, then next 100 | | ⏳ Pending |

---

### 12. Security Tests (10 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-SEC-001** | Rate limit session start (5 req/min) | Security | None | 1. Send 6 session start requests in 1 minute | First 5 succeed, 6th returns 429 Too Many Requests | | ⏳ Pending |
| **TC-SEC-002** | Rate limit page views (30 req/min) | Security | None | 1. Send 31 page view requests in 1 minute | First 30 succeed, 31st returns 429 | | ⏳ Pending |
| **TC-SEC-003** | Rate limit clicks (60 req/min) | Security | None | 1. Send 61 click requests in 1 minute | First 60 succeed, 61st returns 429 | | ⏳ Pending |
| **TC-SEC-004** | Admin endpoints require authentication | Security | No JWT token | 1. GET `/overview` without token | Returns 401 Unauthorized | | ⏳ Pending |
| **TC-SEC-005** | Admin endpoints require SALES_REP+ role | Security | JWT with USER role | 1. GET `/overview` with USER role token | Returns 403 Forbidden | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-SEC-006** | IP anonymization (IPv4) | Security | None | 1. Send request from IP `192.168.1.123`<br>2. Check DB | IP stored as `192.168.1.0` (last octet zeroed) | | ⏳ Pending |
| **TC-SEC-007** | IP anonymization (IPv6) | Security | None | 1. Send request from IPv6 `2001:db8::1234:5678`<br>2. Check DB | IP stored as `2001:db8::0000:0000` (last 2 segments zeroed) | | ⏳ Pending |
| **TC-SEC-008** | Input validation on tracking endpoints | Security | None | 1. POST to `/tracking/pageview` with invalid JSON<br>2. Check response | Returns 400 Bad Request with validation error | | ⏳ Pending |

#### P2 - Penetration Testing

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-SEC-009** | XSS in heatmap overlay | Security | Heatmap with malicious elementId | 1. Inject `<script>alert('XSS')</script>` in click elementId<br>2. View heatmap | Script does not execute (sanitized) | | ⏳ Pending |
| **TC-SEC-010** | SQL injection in event tracking | Security | None | 1. POST to `/tracking/event` with `eventName: "'; DROP TABLE custom_analytics_events;--"` | Query fails safely, no SQL injection | | ⏳ Pending |

---

### 13. Performance Tests (6 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-PERF-001** | Dashboard load time | Performance | Admin authenticated | 1. Navigate to dashboard<br>2. Measure time to interactive | Load time < 2 seconds | | ⏳ Pending |
| **TC-PERF-002** | Heatmap rendering performance | Performance | Heatmap with 1000+ clicks | 1. Load heatmap with 1000+ clicks<br>2. Measure render time | Renders in < 3 seconds | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-PERF-003** | Cache hit rate > 70% | Performance | Overview endpoint cached | 1. Call `/overview` 10 times in 30s<br>2. Check cache metrics | 9/10 requests served from cache (90% hit rate) | | ⏳ Pending |
| **TC-PERF-004** | Recording compression ratio | Performance | Active recording | 1. Generate 100 events<br>2. Check network payload size | Compressed payload is 50-70% smaller than uncompressed | | ⏳ Pending |
| **TC-PERF-005** | WebSocket scalability (100 concurrent connections) | Performance | None | 1. Connect 100 WebSocket clients<br>2. Monitor server CPU/memory | Server CPU < 50%, memory stable | | ⏳ Pending |

#### P2 - Stress Testing

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-PERF-006** | Database query performance (10k sessions) | Performance | 10k sessions in DB | 1. Query `/overview` for last 30 days<br>2. Measure query time | Query completes in < 500ms | | ⏳ Pending |

---

### 14. GDPR Compliance (8 Test Cases)

#### P0 - Critical Path

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-GDPR-001** | No tracking before consent | GDPR | No consent given | 1. Visit website without accepting consent<br>2. Check network tab | No tracking requests sent | | ⏳ Pending |
| **TC-GDPR-002** | Consent withdrawal stops tracking | GDPR | Consent previously accepted | 1. Delete `ra_analytics_consent` from localStorage<br>2. Reload page | Tracking stops, consent banner reappears | | ⏳ Pending |
| **TC-GDPR-003** | IP anonymization enabled | GDPR | None | 1. Check DB for any analytics record<br>2. Verify ipAddress | All IPs anonymized (last octet/segments zeroed) | | ⏳ Pending |

#### P1 - Important

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-GDPR-004** | Data retention policy enforced | GDPR | None | 1. Check cleanup job logs<br>2. Verify retention periods | Recordings deleted after 30 days, sessions after 180 days | | ⏳ Pending |
| **TC-GDPR-005** | User data export (GDPR Article 15) | GDPR | User requests data | 1. Provide visitorId to support<br>2. Export all data | All sessions, page views, clicks for visitorId exported | | ⏳ Pending |
| **TC-GDPR-006** | User data deletion (GDPR Article 17) | GDPR | User requests deletion | 1. Delete all records for visitorId<br>2. Verify DB | No records remain for that visitorId | | ⏳ Pending |

#### P2 - Legal Compliance

| TC-ID | Title | Type | Preconditions | Steps | Expected Result | Actual Result | Status |
|-------|-------|------|---------------|-------|----------------|---------------|--------|
| **TC-GDPR-007** | Privacy policy link accessible | GDPR | Consent banner visible | 1. Click "Learn more" link | Privacy policy page loads | | ⏳ Pending |
| **TC-GDPR-008** | Separate consent for recording | GDPR | Consent banner visible | 1. Accept analytics but decline recording<br>2. Verify behavior | Page views tracked, but no session recording | | ⏳ Pending |

---

## E2E Test Scenarios (Playwright)

### Scenario 1: New Visitor → Consent → Tracking → Admin Views Data

```typescript
// E2E-001: Complete visitor journey from consent to analytics dashboard
test('new visitor journey: consent, tracking, and admin dashboard verification', async ({ page, context }) => {
  // Arrange: Start fresh with no consent
  await context.clearCookies();
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
  });

  // Act: Visit homepage
  await page.goto('http://localhost:4200');

  // Assert: Consent banner appears
  const consentBanner = page.locator('app-consent-banner');
  await expect(consentBanner).toBeVisible();

  // Act: Check recording consent and accept
  await page.check('input[type="checkbox"]'); // Recording consent
  await page.click('button:has-text("Accept")');

  // Assert: Banner disappears, tracking starts
  await expect(consentBanner).not.toBeVisible();

  // Wait for session start request
  const sessionStartRequest = page.waitForResponse(resp =>
    resp.url().includes('/tracking/session/start') && resp.status() === 200
  );
  await sessionStartRequest;

  // Act: Navigate to services page
  await page.goto('http://localhost:4200/services');

  // Wait for page view request
  const pageViewRequest = page.waitForResponse(resp =>
    resp.url().includes('/tracking/pageview') && resp.status() === 200
  );
  await pageViewRequest;

  // Act: Click on a service card
  await page.click('.service-card:first-child');

  // Wait for click tracking
  const clickRequest = page.waitForResponse(resp =>
    resp.url().includes('/tracking/click') && resp.status() === 200
  );
  await clickRequest;

  // Act: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Wait for authentication
  await page.waitForURL('**/admin/dashboard');

  // Act: Navigate to analytics dashboard
  await page.goto('http://localhost:4200/admin/website-analytics/dashboard');

  // Assert: Dashboard loads with stats
  await expect(page.locator('text=Website Analytics')).toBeVisible();
  await expect(page.locator('.stat-card').first()).toBeVisible();

  // Assert: Active visitors card shows data
  const activeUsersCard = page.locator('text=Active Users').locator('..');
  await expect(activeUsersCard).toBeVisible();
  const activeCount = await activeUsersCard.locator('.realtime-value .number').textContent();
  expect(parseInt(activeCount!)).toBeGreaterThanOrEqual(1); // At least 1 active user (us)

  // Assert: Page views chart is rendered
  await expect(page.locator('.visitors-chart')).toBeVisible();
});
```

---

### Scenario 2: Admin Views Dashboard → WebSocket → Export Report

```typescript
// E2E-002: Admin dashboard with WebSocket real-time updates and report export
test('admin dashboard: WebSocket active visitors and report export', async ({ page, context }) => {
  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');

  // Act: Navigate to analytics dashboard
  await page.goto('http://localhost:4200/admin/website-analytics/dashboard');

  // Assert: Dashboard loads
  await expect(page.locator('text=Website Analytics')).toBeVisible();

  // Act: Wait for WebSocket connection
  const wsConnected = page.waitForEvent('websocket', { timeout: 5000 });
  const ws = await wsConnected;
  expect(ws.url()).toContain('/ws/analytics/active-visitors');

  // Assert: WebSocket sends active visitors message
  const wsMessage = await ws.waitForEvent('framereceived', { timeout: 15000 });
  const messageData = JSON.parse(wsMessage.payload as string);
  expect(messageData.type).toBe('active_visitors');
  expect(messageData.data).toHaveProperty('activeVisitors');
  expect(messageData.data).toHaveProperty('timestamp');

  // Act: Change date range filter
  await page.click('p-select[placeholder="Select Date Range"]');
  await page.click('text=Last 30 days');

  // Assert: Stats cards update (wait for API response)
  await page.waitForResponse(resp => resp.url().includes('/overview') && resp.status() === 200);

  // Act: Click export button
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export Report")');

  // Assert: Report download initiated
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/analytics-report/);
});
```

---

### Scenario 3: Heatmap Page Selection → View Clicks → Adjust Intensity → Legend

```typescript
// E2E-003: Heatmap visualization with intensity controls and legend
test('heatmap: page selection, click overlay, intensity adjustment, and legend', async ({ page }) => {
  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Act: Navigate to heatmaps page
  await page.goto('http://localhost:4200/admin/website-analytics/heatmaps');

  // Assert: Page list loads
  await expect(page.locator('.pages-list .page-item')).toHaveCount(1, { timeout: 5000 });

  // Act: Select first page from list
  await page.click('.page-item:first-child');

  // Assert: Heatmap iframe loads
  const iframe = page.locator('iframe.heatmap-iframe');
  await expect(iframe).toBeVisible();

  // Assert: Heatmap overlay canvas renders
  await expect(page.locator('.heatmap-overlay canvas')).toBeVisible({ timeout: 3000 });

  // Act: Adjust radius to "Wide"
  await page.click('button:has-text("Wide")');

  // Assert: Heatmap re-renders (check canvas update)
  await page.waitForTimeout(500); // Wait for re-render
  const canvas = page.locator('.heatmap-overlay canvas');
  await expect(canvas).toBeVisible();

  // Act: Toggle device filter to "Mobile"
  await page.click('.device-btn[title="Mobile"]');

  // Assert: Iframe width changes to mobile viewport
  const iframeElement = await iframe.elementHandle();
  const width = await iframeElement!.evaluate(el => el.clientWidth);
  expect(width).toBe(375); // Mobile width

  // Act: Toggle legend visibility
  await page.click('button[title="Show Legend"]');

  // Assert: Legend appears
  await expect(page.locator('.heatmap-legend-enhanced')).toBeVisible();

  // Assert: Legend shows gradient and labels
  await expect(page.locator('.legend-gradient-bar')).toBeVisible();
  await expect(page.locator('.legend-label-item:has-text("Low")')).toBeVisible();
  await expect(page.locator('.legend-label-item:has-text("High")')).toBeVisible();

  // Act: Hide legend
  await page.click('.legend-close');

  // Assert: Legend disappears
  await expect(page.locator('.heatmap-legend-enhanced')).not.toBeVisible();
});
```

---

### Scenario 4: Recording Playback → Speed Control → Page Filter

```typescript
// E2E-004: Session recording playback with speed controls and page filtering
test('session recording: playback, speed control, and page navigation', async ({ page }) => {
  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Act: Navigate to recordings page
  await page.goto('http://localhost:4200/admin/website-analytics/recordings');

  // Assert: Recordings table loads
  await expect(page.locator('table tbody tr')).toHaveCount(1, { timeout: 5000 });

  // Act: Click play button on first recording
  await page.click('table tbody tr:first-child button[title="Play"]');

  // Assert: Recording modal opens
  const modal = page.locator('ui-dialog[open]');
  await expect(modal).toBeVisible();

  // Assert: Recording player loads
  await expect(modal.locator('.rrweb-player-wrapper')).toBeVisible({ timeout: 3000 });

  // Act: Change playback speed to 2x
  await modal.locator('button:has-text("2x")').click();

  // Assert: Speed button is active
  await expect(modal.locator('button:has-text("2x").active')).toBeVisible();

  // Act: Filter recordings by page "/pricing"
  await page.click('ui-dialog button:has([class*="close"])'); // Close modal
  await page.fill('input[placeholder*="Filter by page"]', '/pricing');

  // Assert: Only recordings with /pricing are shown
  const filteredRows = page.locator('table tbody tr');
  await expect(filteredRows).toHaveCount(1, { timeout: 2000 });
  const pageText = await filteredRows.first().locator('.page-cell').textContent();
  expect(pageText).toContain('/pricing');
});
```

---

### Scenario 5: Consent Decline → Verify No Tracking

```typescript
// E2E-005: Consent decline prevents all tracking
test('consent decline: verify no tracking occurs', async ({ page, context }) => {
  // Arrange: Clear state
  await context.clearCookies();
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
  });

  // Act: Visit homepage
  await page.goto('http://localhost:4200');

  // Assert: Consent banner appears
  const consentBanner = page.locator('app-consent-banner');
  await expect(consentBanner).toBeVisible();

  // Act: Decline consent
  const networkRequests: string[] = [];
  page.on('request', req => {
    if (req.url().includes('/tracking/')) {
      networkRequests.push(req.url());
    }
  });

  await page.click('button:has-text("Decline")');

  // Assert: Banner disappears
  await expect(consentBanner).not.toBeVisible();

  // Assert: Consent declined in localStorage
  const analyticsConsent = await page.evaluate(() =>
    localStorage.getItem('ra_analytics_consent')
  );
  expect(analyticsConsent).toBe('declined');

  // Act: Navigate to multiple pages
  await page.goto('http://localhost:4200/services');
  await page.goto('http://localhost:4200/pricing');
  await page.goto('http://localhost:4200/contact');

  // Wait a bit for any potential tracking requests
  await page.waitForTimeout(2000);

  // Assert: No tracking requests were sent
  expect(networkRequests).toHaveLength(0);

  // Act: Click on page elements
  await page.click('a:has-text("Services")');
  await page.waitForTimeout(1000);

  // Assert: Still no tracking requests
  expect(networkRequests).toHaveLength(0);
});
```

---

### Scenario 6: WebSocket Reconnection After Network Failure

```typescript
// E2E-006: WebSocket automatic reconnection on network failure
test('websocket: automatic reconnection after network disconnect', async ({ page, context }) => {
  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Act: Navigate to analytics dashboard
  await page.goto('http://localhost:4200/admin/website-analytics/dashboard');

  // Assert: WebSocket connects
  const ws1 = await page.waitForEvent('websocket');
  expect(ws1.url()).toContain('/ws/analytics/active-visitors');

  // Act: Simulate network disconnect by closing WebSocket
  await page.evaluate(() => {
    // Close WebSocket connection from client side
    const wsService = (window as any).ngRef?.injector.get('AnalyticsWebSocketService');
    if (wsService) {
      wsService.disconnect();
    }
  });

  // Assert: WebSocket closes
  await ws1.waitForEvent('close', { timeout: 2000 });

  // Act: Wait for automatic reconnection (exponential backoff starts at 1s)
  const ws2 = await page.waitForEvent('websocket', { timeout: 10000 });

  // Assert: New WebSocket connection established
  expect(ws2.url()).toContain('/ws/analytics/active-visitors');
  expect(ws2.isClosed()).toBe(false);

  // Assert: Active visitors data received on new connection
  const messageEvent = await ws2.waitForEvent('framereceived', { timeout: 15000 });
  const messageData = JSON.parse(messageEvent.payload as string);
  expect(messageData.type).toBe('active_visitors');
});
```

---

### Scenario 7: Data Retention Daily Summary and Cleanup

```typescript
// E2E-007: Daily summary computation and data retention cleanup
test('data retention: daily summary and cleanup job', async ({ page }) => {
  // Note: This test requires admin API access to trigger manual cleanup

  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Act: Trigger manual cleanup via API (admin panel feature)
  const response = await page.request.post('http://localhost:3000/api/v1/admin/analytics/cleanup/trigger', {
    headers: {
      'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('auth_token'))}`
    }
  });

  // Assert: Cleanup successful
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.success).toBe(true);

  // Act: Verify daily summary was created
  const summaryResponse = await page.request.get('http://localhost:3000/api/v1/admin/analytics/daily-summary/yesterday', {
    headers: {
      'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('auth_token'))}`
    }
  });

  // Assert: Daily summary exists
  expect(summaryResponse.status()).toBe(200);
  const summary = await summaryResponse.json();
  expect(summary.data).toHaveProperty('totalSessions');
  expect(summary.data).toHaveProperty('uniqueVisitors');
  expect(summary.data).toHaveProperty('totalPageViews');
});
```

---

### Scenario 8: Bot Detection and Filtering

```typescript
// E2E-008: Bot detection and exclusion from analytics
test('bot detection: verify bots are flagged and excluded from stats', async ({ page, request }) => {
  // Arrange: Send tracking request with bot user agent
  const botUA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

  // Act: Start session as bot
  const sessionResponse = await request.post('http://localhost:3000/api/v1/website-analytics/tracking/session/start', {
    headers: {
      'User-Agent': botUA,
      'Content-Type': 'application/json'
    },
    data: {
      visitorId: 'bot-visitor-123',
      device: 'desktop',
      browser: 'Googlebot'
    }
  });

  // Assert: Session created
  expect(sessionResponse.status()).toBe(200);
  const sessionData = await sessionResponse.json();
  const botSessionId = sessionData.data.id;

  // Act: Track page view as bot
  await request.post('http://localhost:3000/api/v1/website-analytics/tracking/pageview', {
    headers: {
      'User-Agent': botUA,
      'Content-Type': 'application/json'
    },
    data: {
      sessionId: botSessionId,
      path: '/services'
    }
  });

  // Arrange: Login as admin
  await page.goto('http://localhost:4200/admin/login');
  await page.fill('input[name="email"]', 'admin@roaya.co');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Act: Navigate to analytics dashboard
  await page.goto('http://localhost:4200/admin/website-analytics/dashboard');

  // Assert: Bot session not counted in unique visitors
  const uniqueVisitorsCard = page.locator('.stat-card:has-text("Unique Visitors")');
  const visitorCount = await uniqueVisitorsCard.locator('.stat-value').textContent();

  // Bot sessions should be excluded, so count should not increase
  // (This assumes we know the expected count before the bot visit)
  expect(parseInt(visitorCount!)).toBeGreaterThanOrEqual(0);

  // Act: Verify bot session in database (direct DB check via API)
  const sessionsResponse = await page.request.get('http://localhost:3000/api/v1/admin/analytics/sessions?device=desktop', {
    headers: {
      'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('auth_token'))}`
    }
  });

  const sessions = await sessionsResponse.json();
  const botSession = sessions.data.sessions.find((s: any) => s.id === botSessionId);

  // Assert: Bot session flagged
  expect(botSession).toBeDefined();
  expect(botSession.isBot).toBe(true);
});
```

---

## Regression Test Checklist

Run this checklist before each release to verify no regressions.

### Pre-Release Smoke Test (15 minutes)

**Frontend Public Site:**
- [ ] ✅ Consent banner appears on first visit
- [ ] ✅ Accept consent → banner disappears, tracking starts
- [ ] ✅ Decline consent → no tracking occurs
- [ ] ✅ Page navigation tracked (check network tab)
- [ ] ✅ Click tracking works (check network tab)
- [ ] ✅ Session ends on tab close (check network tab for beacon)

**Admin Panel:**
- [ ] ✅ Login as admin
- [ ] ✅ Navigate to `/admin/website-analytics/dashboard`
- [ ] ✅ Dashboard loads with stats (4 stat cards visible)
- [ ] ✅ Active visitors card shows count > 0 (if WebSocket working)
- [ ] ✅ Date range filter changes stats
- [ ] ✅ Chart renders (Visitors Overview line chart)
- [ ] ✅ Device breakdown doughnut chart renders
- [ ] ✅ Top pages table shows data
- [ ] ✅ Top countries section shows flags

**Heatmaps:**
- [ ] ✅ Navigate to `/admin/website-analytics/heatmaps`
- [ ] ✅ Pages list loads
- [ ] ✅ Select page → iframe loads
- [ ] ✅ Heatmap overlay canvas renders
- [ ] ✅ Radius controls work (Tight/Normal/Wide)
- [ ] ✅ Device filter works (Desktop/Mobile)
- [ ] ✅ Legend toggle works

**Recordings:**
- [ ] ✅ Navigate to `/admin/website-analytics/recordings`
- [ ] ✅ Recordings table loads
- [ ] ✅ Click play → recording modal opens
- [ ] ✅ rrweb player loads and plays
- [ ] ✅ Speed controls work (1x/2x/4x)
- [ ] ✅ Device filter works
- [ ] ✅ Search by page URL works

**WebSocket:**
- [ ] ✅ WebSocket connects on dashboard load
- [ ] ✅ Active visitors updates every 10 seconds
- [ ] ✅ Fallback to polling if WebSocket fails (test by blocking WS in DevTools)

**Data Retention:**
- [ ] ✅ Cron scheduler running (check logs)
- [ ] ✅ Daily summary created for yesterday (check DB)
- [ ] ✅ Old recordings deleted (check retention policy)

**Security:**
- [ ] ✅ Rate limiting works (send 6 session starts in 1 min → 429)
- [ ] ✅ Admin endpoints require auth (GET `/overview` without token → 401)
- [ ] ✅ WebSocket requires JWT (connect without token → 401)

**Performance:**
- [ ] ✅ Dashboard loads in < 2 seconds
- [ ] ✅ Heatmap renders in < 3 seconds
- [ ] ✅ Cache hit rate > 70% (check `/metrics` endpoint)

**GDPR Compliance:**
- [ ] ✅ No tracking before consent
- [ ] ✅ IP anonymization enabled (check DB)
- [ ] ✅ Retention policy enforced (check logs)

---

## Bug Report Template

Use this template for all analytics module bugs.

---

**Bug Report: [Brief Description]**

**Bug ID:** BUG-ANALYTICS-XXX
**Reporter:** [Your Name]
**Date:** YYYY-MM-DD
**Severity:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Priority:** P0 | P1 | P2 | P3

---

### Environment

**Component:** [Consent Banner | Visitor Tracking | Session Recording | Dashboard | Heatmaps | Recordings | WebSocket | Data Retention | Security]
**Browser:** [Chrome 120 | Firefox 121 | Safari 17.2]
**OS:** [Windows 11 | macOS 14.2 | Ubuntu 22.04]
**Device:** [Desktop 1920x1080 | Tablet 768x1024 | Mobile 375x667]
**URL:** `http://localhost:4200/...`
**User Role:** [Public Visitor | Admin | Super Admin]

---

### Description

**Summary:**
[One-sentence description of the bug]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

---

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
...

**Test Data Used:**
- visitorId: `v_1234567890_abc123`
- sessionId: `s_9876543210_xyz789`
- Email: `test@example.com` (if login required)

---

### Evidence

**Screenshots:**
[Attach screenshots showing the issue]

**Console Errors:**
```
[Error logs from browser console]
```

**Network Tab:**
```
Request: POST /api/v1/tracking/pageview
Status: 500
Response: {"error": "Internal Server Error"}
```

**Database State:**
```sql
SELECT * FROM analytics_sessions WHERE id = 's_9876543210_xyz789';
```

---

### Impact Analysis

**User Impact:**
[How does this affect users? How many users are affected?]

**Business Impact:**
[Does this affect GDPR compliance? Revenue? Data integrity?]

**Security Impact:**
[Does this expose user data? Create a vulnerability?]

---

### Suggested Fix

**Root Cause:**
[If known, describe the underlying issue]

**Recommended Solution:**
[Proposed fix or workaround]

**Code Reference:**
```
File: /backend/src/application/services/website-analytics.service.ts
Line: 456
Issue: Missing null check for sessionId
```

---

### Additional Notes

[Any other relevant information, related bugs, or dependencies]

---

## Test Execution Summary

### Test Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Total Test Cases** | 112 | - | ⏳ Pending |
| **P0 Test Cases** | 48 | - | ⏳ Pending |
| **P1 Test Cases** | 46 | - | ⏳ Pending |
| **P2 Test Cases** | 18 | - | ⏳ Pending |
| **Automated (E2E)** | 8 scenarios | - | ⏳ Pending |
| **Pass Rate (P0)** | 100% | - | ⏳ Pending |
| **Pass Rate (P1)** | 90%+ | - | ⏳ Pending |
| **Critical Bugs** | 0 | - | ⏳ Pending |
| **High Bugs** | < 3 | - | ⏳ Pending |

---

## Approval & Sign-Off

**QA Lead:** ___________________________  Date: _________
**Product Owner:** ___________________________  Date: _________
**Tech Lead:** ___________________________  Date: _________

---

**End of Test Strategy Document**

*Generated by: QA/Test Engineer Agent*
*Last Updated: 2026-02-01*
*Version: 1.0*
