# Website Analytics Module — Unified Production Action Plan

**Date:** 2026-02-01
**Coordinator:** Product Orchestrator
**Input From:** Super Business Analyst, Database Engineer, Super Backend Engineer

---

## Executive Summary

Three specialist agents conducted parallel analysis of the Website Analytics admin module. **Consensus: the module is NOT production-ready.** All three agents independently flagged the same critical blockers.

### Cross-Agent Agreement Matrix

| Issue | Business Analyst | Database Engineer | Backend Engineer |
|-------|:---:|:---:|:---:|
| GDPR Consent Missing | P0 | — | P0 |
| localStorage XSS Risk | P0 | — | P0 |
| No Data Retention | P0 | P-HIGH | P0 |
| Missing FK Constraints | P0 | P-HIGH | — |
| Hardcoded UI Stats | P0 | — | — |
| Pagination Bug | P0 | — | — |
| No Error Logging | P0 | — | P0 |
| Tracking Script Vulns | — | — | P0 (7 sub-issues) |
| Missing Composite Indexes | — | P-HIGH | P1 |
| No Daily Summary Table | — | P-HIGH | P0 |
| Active Visitors Polling | P0 | — | P0 |
| Recording Storage Growth | — | CRITICAL (95% storage) | P0 |

---

## Phased Implementation Plan

### Phase 1: Security & Legal (v1.0) — MUST DO BEFORE LAUNCH

**Goal:** Legal compliance + security hardening

| # | Task | Owner | Files to Change | Effort |
|---|------|-------|----------------|--------|
| 1 | GDPR consent banner + opt-in tracking | Frontend | visitor-tracking.service.ts, new consent component | 3 days |
| 2 | Session recording separate consent | Frontend | visitor-tracking.service.ts, consent component | 1 day |
| 3 | Replace localStorage with httpOnly cookie for visitor ID | Backend + Frontend | website-analytics.service.ts (backend), visitor-tracking.service.ts | 3 days |
| 4 | Fix tracking script: error handling, deduplication, sendBeacon | Backend | website-analytics.service.ts lines 536-649 | 2 days |
| 5 | Add FK constraints + clean orphaned data | Database | Prisma migration 005 | 1 day |
| 6 | Add composite indexes (7 new) | Database | Prisma migration 005 | 0.5 day |
| 7 | Create analytics_daily_summary table | Database | Prisma migration 005 + backend cron | 1 day |
| 8 | Data retention policy (cron: 90/30/180 day cleanup) | Backend | New cron job + migration | 1 day |
| 9 | Remove hardcoded stats from Dashboard, Heatmaps, Recordings | Frontend | 3 component files | 2 days |
| 10 | Fix recordings pagination bug | Frontend | recordings-list.component.ts | 0.5 day |
| 11 | Implement CSV/JSON export | Frontend + Backend | Dashboard, Recordings components + new endpoint | 2 days |
| 12 | Error logging (centralized, no PII) | Full Stack | Error handler service + components | 2 days |
| 13 | Add health check endpoint | Backend | New route | 0.5 day |

**Total Phase 1:** ~19.5 days | **Team:** 2 developers = ~2 weeks

---

### Phase 2: Performance & Stability (v1.1)

**Goal:** Scalable under load + real-time features

| # | Task | Owner | Files to Change | Effort |
|---|------|-------|----------------|--------|
| 14 | WebSocket/SSE for active visitors | Backend + Frontend | New WS route + dashboard component | 3 days |
| 15 | Dashboard reads from daily_summary table | Backend | overview endpoint in service | 1 day |
| 16 | Cache analytics endpoints (30s TTL) | Backend | Redis or in-memory cache | 1 day |
| 17 | Compress recording events (gzip) | Backend + Frontend | storeRecordingEvents + tracking service | 2 days |
| 18 | Add byte_size tracking to recordings | Backend | Recording INSERT + migration | 0.5 day |
| 19 | Bot detection (is_bot flag) | Backend | Session start endpoint + UA patterns | 1 day |
| 20 | Dynamic country flags (Unicode emoji) | Frontend | recordings-list.component.ts | 0.5 day |
| 21 | Real scroll depth metrics | Full Stack | New tracking event + DB column + UI | 2 days |
| 22 | Real avg time on page | Backend + Frontend | pageview duration calculation + UI | 1 day |
| 23 | CSRF tokens on tracking endpoints | Backend | Middleware | 1 day |
| 24 | Rate limiting tuning (10 req/min for tracking per session) | Backend | Rate limiter config | 0.5 day |

**Total Phase 2:** ~13.5 days | **Team:** 2 developers = ~1.5 weeks

---

### Phase 3: Advanced Features (v1.2)

| # | Task | Effort |
|---|------|--------|
| 25 | IP anonymization (GDPR Article 32) | 1 day |
| 26 | Custom event tracking API | 3 days |
| 27 | Session replay speed controls | 1 day |
| 28 | Recording search by page visited | 1 day |
| 29 | Heatmap intensity scale | 1 day |
| 30 | Prometheus metrics endpoint | 1 day |

**Total Phase 3:** ~8 days

---

## Database Migration (Ready to Execute)

The Database Engineer provided a complete migration. Key steps:

```
Migration: 005_analytics_schema_improvements

Phase A (transactional):
  1. Clean orphaned page_views, heatmap_clicks, session_recording_events
  2. Add 3 FK constraints (CASCADE DELETE)
  3. Add is_bot column to sessions
  4. Add byte_size column to recordings
  5. Change heatmap x/y to SMALLINT
  6. Create analytics_daily_summary table

Phase B (non-transactional):
  7. CREATE INDEX CONCURRENTLY x7 composite indexes
```

Full SQL available in: `website-analytics-database-engineering-report-2026-02-01.md`

---

## Storage Warning

**Session recordings consume 95% of total database storage.**

| At 1K visitors/day | With Retention | Without Retention |
|---------------------|---------------|-------------------|
| 30 days recordings | ~15 GB | 15 GB + growing |
| 90 days other data | ~14 GB | 14 GB + growing |
| **Total (stable)** | **~29 GB** | **Unbounded** |

**Recommendation:** Consider recording sampling (10-20% of sessions) to reduce to ~3 GB.

---

## Environment Variables Needed for Production

```bash
# Required
API_BASE_URL=https://api.roaya.co
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-random>

# Analytics-specific
DATA_RETENTION_DAYS=90
RECORDING_RETENTION_DAYS=30
SESSION_RETENTION_DAYS=180
RECORDING_SAMPLE_RATE=0.2          # Record 20% of sessions
MAX_RECORDING_CHUNK_SIZE=1048576   # 1MB max per chunk
ANALYTICS_CACHE_TTL=30             # 30 second cache

# Optional
SENTRY_DSN=<sentry-url>           # Error tracking
REDIS_URL=redis://...              # Cache backend
```

---

## Reports Index

| Report | Author | Location |
|--------|--------|----------|
| Production Readiness Analysis | Business Analyst | `website-analytics-production-readiness-analysis-2026-02-01.md` |
| Database Engineering Report | Database Engineer | `website-analytics-database-engineering-report-2026-02-01.md` |
| Backend Production Readiness | Backend Engineer | `WEBSITE-ANALYTICS-PRODUCTION-READINESS-REPORT-2026-02-01.md` |
| **This Unified Plan** | Product Orchestrator | `WEBSITE-ANALYTICS-UNIFIED-ACTION-PLAN-2026-02-01.md` |

---

## Decision Required

Before implementation begins, the stakeholder must decide:

1. **Recording sampling rate:** Record 100% (costly) or 10-20% (recommended)?
2. **Consent banner design:** Simple banner or full cookie preferences modal?
3. **Error logging service:** Sentry (SaaS) or custom backend endpoint?
4. **Real-time updates:** WebSocket (complex, better UX) or SSE (simpler)?
5. **Phase 1 timeline:** Start immediately or after backend deployment?

---

**Prepared by:** Product Orchestrator
**Date:** 2026-02-01
**Status:** AWAITING STAKEHOLDER DECISIONS
