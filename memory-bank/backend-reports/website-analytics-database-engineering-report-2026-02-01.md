# Roaya Website Analytics -- Database Engineering Report

**Date:** 2026-02-01
**Database Engineer:** Database Engineer Agent
**Database:** PostgreSQL 16+ via Prisma ORM
**Backend Location:** `/Users/roaya/Roaya-files/Development/roaya/backend/`

---

## 1. Current vs Target Schema

### Current Issues
- **Zero FK constraints** between analytics tables
- **Missing composite indexes** for common query patterns
- **No data retention** - session recordings grow unbounded (50-500KB each)
- **No daily summary** table - dashboard queries scan millions of rows

### Target Schema Changes
- FK constraints with CASCADE DELETE on all child tables
- 7 new composite indexes for query patterns
- New `analytics_daily_summary` table for pre-computed aggregates
- New columns: `is_bot` (sessions), `byte_size` (recordings)
- Optimize `x`/`y` columns from INT to SMALLINT

---

## 2. Foreign Key Constraints

| Child Table | FK Column | Parent | ON DELETE | Rationale |
|-------------|-----------|--------|-----------|-----------|
| `page_views` | `session_id` | `analytics_sessions` | CASCADE | Views meaningless without session |
| `heatmap_clicks` | `session_id` | `analytics_sessions` | CASCADE | Orphaned clicks waste storage |
| `session_recording_events` | `session_id` | `analytics_sessions` | CASCADE | Largest rows, must cascade |

**Pre-requisite:** Clean orphaned data before adding constraints.

---

## 3. New Composite Indexes

| Index | Table | Columns | Query Pattern |
|-------|-------|---------|---------------|
| `idx_pv_session_created` | page_views | (session_id, created_at DESC) | Active visitors |
| `idx_pv_created_path` | page_views | (created_at, path) | Top pages + time-series |
| `idx_hc_path_created` | heatmap_clicks | (path, created_at) | Heatmap date range |
| `idx_as_visitor_started` | analytics_sessions | (visitor_id, started_at DESC) | Visitor history |
| `idx_as_started_country` | analytics_sessions | (started_at, country) | Country breakdown |
| `idx_as_started_device` | analytics_sessions | (started_at, device) | Device breakdown |
| `idx_as_is_bot` | analytics_sessions | (is_bot) WHERE FALSE | Bot filtering |

---

## 4. Data Retention Strategy

| Table | Retention | Rationale |
|-------|-----------|-----------|
| `page_views` | **90 days** | High volume, daily summaries preserve aggregates |
| `heatmap_clicks` | **90 days** | Page layouts change, old data has low value |
| `session_recording_events` | **30 days** | Largest storage consumer (95%+ of total) |
| `analytics_sessions` | **180 days** | Keep session metadata after children cleaned |
| `analytics_daily_summary` | **Indefinite** | 1 row/day = 365 rows/year, preserves trends |

### Automated Cleanup (Daily at 03:00 UTC)
```sql
DELETE FROM session_recording_events WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM heatmap_clicks WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM analytics_sessions WHERE started_at < NOW() - INTERVAL '180 days';
```

---

## 5. Storage Estimates

### Per-Row Sizes
| Table | Avg Row Size |
|-------|-------------|
| analytics_sessions | ~280 bytes |
| page_views | ~220 bytes |
| heatmap_clicks | ~150 bytes |
| session_recording_events | **50KB-500KB** |
| analytics_daily_summary | ~2KB |

### Projections (with retention cleanup)

| Daily Visitors | 90-Day Live Data | Key Finding |
|----------------|------------------|-------------|
| 1,000 | ~59 GB | Recordings = 95% of storage (~45 GB) |
| 10,000 | ~450 GB | Requires dedicated DB server |
| 100,000 | ~4.5 TB | Requires partitioning + archival |

**Critical:** Session recordings dominate storage. Consider recording only 10-20% of sessions.

---

## 6. Migration SQL

### Up Migration (005_analytics_schema_improvements)

```sql
BEGIN;

-- STEP 1: Clean orphaned data
DELETE FROM page_views pv
WHERE NOT EXISTS (SELECT 1 FROM analytics_sessions s WHERE s.id = pv.session_id::uuid);

DELETE FROM heatmap_clicks hc
WHERE NOT EXISTS (SELECT 1 FROM analytics_sessions s WHERE s.id = hc.session_id::uuid);

DELETE FROM session_recording_events sre
WHERE NOT EXISTS (SELECT 1 FROM analytics_sessions s WHERE s.id = sre.session_id::uuid);

-- STEP 2: FK constraints
ALTER TABLE page_views ADD CONSTRAINT fk_page_views_session
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE;

ALTER TABLE heatmap_clicks ADD CONSTRAINT fk_heatmap_clicks_session
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE;

ALTER TABLE session_recording_events ADD CONSTRAINT fk_recording_events_session
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE;

-- STEP 3: New columns
ALTER TABLE analytics_sessions ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE session_recording_events ADD COLUMN byte_size INT;

-- STEP 4: Optimize types
ALTER TABLE heatmap_clicks ALTER COLUMN x TYPE SMALLINT, ALTER COLUMN y TYPE SMALLINT;

-- STEP 6: Daily summary table
CREATE TABLE analytics_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_date DATE NOT NULL UNIQUE,
    total_sessions INT NOT NULL DEFAULT 0,
    unique_visitors INT NOT NULL DEFAULT 0,
    total_page_views INT NOT NULL DEFAULT 0,
    avg_session_duration NUMERIC(8,2) NOT NULL DEFAULT 0,
    bounce_count INT NOT NULL DEFAULT 0,
    top_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
    device_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    country_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    browser_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    referrer_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ads_summary_date ON analytics_daily_summary (summary_date DESC);

COMMIT;

-- STEP 5: Indexes (MUST run outside transaction for CONCURRENTLY)
CREATE INDEX CONCURRENTLY idx_pv_session_created ON page_views (session_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_pv_created_path ON page_views (created_at, path);
CREATE INDEX CONCURRENTLY idx_hc_path_created ON heatmap_clicks (path, created_at);
CREATE INDEX CONCURRENTLY idx_as_visitor_started ON analytics_sessions (visitor_id, started_at DESC);
CREATE INDEX CONCURRENTLY idx_as_started_country ON analytics_sessions (started_at, country);
CREATE INDEX CONCURRENTLY idx_as_started_device ON analytics_sessions (started_at, device);
CREATE INDEX CONCURRENTLY idx_as_is_bot ON analytics_sessions (is_bot) WHERE is_bot = FALSE;
```

### Down Migration (Rollback)
```sql
BEGIN;
DROP TABLE IF EXISTS analytics_daily_summary;
ALTER TABLE analytics_sessions DROP COLUMN IF EXISTS is_bot;
ALTER TABLE session_recording_events DROP COLUMN IF EXISTS byte_size;
ALTER TABLE heatmap_clicks ALTER COLUMN x TYPE INT, ALTER COLUMN y TYPE INT;
DROP INDEX IF EXISTS idx_pv_session_created, idx_pv_created_path, idx_hc_path_created,
    idx_as_visitor_started, idx_as_started_country, idx_as_started_device, idx_as_is_bot;
ALTER TABLE page_views DROP CONSTRAINT IF EXISTS fk_page_views_session;
ALTER TABLE heatmap_clicks DROP CONSTRAINT IF EXISTS fk_heatmap_clicks_session;
ALTER TABLE session_recording_events DROP CONSTRAINT IF EXISTS fk_recording_events_session;
COMMIT;
```

---

## 7. Prisma Schema Updates

Key changes to `schema.prisma`:
- Add `session` relation with `@relation(fields: [sessionId], references: [id], onDelete: Cascade)` to PageView, HeatmapClick, SessionRecordingEvent
- Add reverse relations (`pageViews[]`, `heatmapClicks[]`, `recordingEvents[]`) to AnalyticsSession
- Add `isBot Boolean @default(false) @map("is_bot")` to AnalyticsSession
- Add `byteSize Int? @map("byte_size")` to SessionRecordingEvent
- Change `x`/`y` to `@db.SmallInt` in HeatmapClick
- Add new `AnalyticsDailySummary` model

---

## 8. Production Monitoring

### Alert Thresholds

| Alert | Threshold | Severity |
|-------|-----------|----------|
| Recording storage > 20 GB | WARNING | Verify retention running |
| Recording storage > 50 GB | CRITICAL | Run manual cleanup |
| Stale rows (>91 days) | WARNING | Retention cron missed |
| Cache hit ratio < 95% | WARNING | Need more RAM |
| Cache hit ratio < 90% | CRITICAL | Urgent RAM needed |
| Tracking INSERT > 50ms p95 | CRITICAL | Must be <20ms |
| Analytics query > 500ms p95 | WARNING | Index optimization needed |

### Partitioning
**Not recommended now.** With 90-day retention, `page_views` caps at ~900K rows. Revisit if table exceeds 10M rows.

---

**Report Author:** Database Engineer Agent
**Status:** READY FOR IMPLEMENTATION
