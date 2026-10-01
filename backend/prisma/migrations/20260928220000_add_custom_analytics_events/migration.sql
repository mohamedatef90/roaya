CREATE TABLE IF NOT EXISTS "custom_analytics_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" VARCHAR(255) NOT NULL,
  "event_name" VARCHAR(255) NOT NULL,
  "event_category" VARCHAR(100) NOT NULL,
  "event_data" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "page_path" VARCHAR(2000) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "custom_analytics_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_custom_events_session"
    FOREIGN KEY ("session_id") REFERENCES "analytics_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_custom_events_session_id"
  ON "custom_analytics_events"("session_id");
CREATE INDEX IF NOT EXISTS "idx_custom_events_name"
  ON "custom_analytics_events"("event_name");
CREATE INDEX IF NOT EXISTS "idx_custom_events_category"
  ON "custom_analytics_events"("event_category");
CREATE INDEX IF NOT EXISTS "idx_custom_events_created_at"
  ON "custom_analytics_events"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_custom_events_name_created"
  ON "custom_analytics_events"("event_name", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_custom_events_category_created"
  ON "custom_analytics_events"("event_category", "created_at" DESC);
