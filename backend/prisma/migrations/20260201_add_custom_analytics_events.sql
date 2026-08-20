-- Migration: Add Custom Analytics Events Table
-- Feature: Custom event tracking for button clicks, form submissions, etc.
-- Date: 2026-02-01

-- Create custom analytics events table
CREATE TABLE IF NOT EXISTS custom_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_category VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_path VARCHAR(2000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Foreign key to analytics_sessions
  CONSTRAINT fk_custom_events_session
    FOREIGN KEY (session_id)
    REFERENCES analytics_sessions(id)
    ON DELETE CASCADE
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_custom_events_session_id ON custom_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_custom_events_name ON custom_analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_custom_events_category ON custom_analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_custom_events_created_at ON custom_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_events_name_created ON custom_analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_events_category_created ON custom_analytics_events(event_category, created_at DESC);

-- Add comment to table
COMMENT ON TABLE custom_analytics_events IS 'Stores custom analytics events like button clicks, form submissions, feature usage, etc.';
COMMENT ON COLUMN custom_analytics_events.event_name IS 'Event identifier (e.g., cta_click, form_submit, feature_view)';
COMMENT ON COLUMN custom_analytics_events.event_category IS 'Event category (e.g., engagement, conversion, navigation)';
COMMENT ON COLUMN custom_analytics_events.event_data IS 'Arbitrary event metadata as JSON';
