-- Migration: Add Documentation and Website Analytics Tables
-- Created: 2026-01-26

-- ============================================
-- DOCUMENTATION / KNOWLEDGE BASE
-- ============================================

-- Create enum for documentation access levels
CREATE TYPE "DocAccessLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'ADMIN');

-- Create documentation categories table
CREATE TABLE "doc_categories" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doc_categories_pkey" PRIMARY KEY ("id")
);

-- Create documentation pages table
CREATE TABLE "doc_pages" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "access_level" "DocAccessLevel" NOT NULL DEFAULT 'PUBLIC',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doc_pages_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints and indexes for documentation
CREATE UNIQUE INDEX "doc_categories_slug_key" ON "doc_categories"("slug");
CREATE UNIQUE INDEX "doc_pages_slug_key" ON "doc_pages"("slug");

CREATE INDEX "doc_categories_parent_id_idx" ON "doc_categories"("parent_id");
CREATE INDEX "doc_categories_slug_idx" ON "doc_categories"("slug");
CREATE INDEX "doc_categories_is_active_idx" ON "doc_categories"("is_active");

CREATE INDEX "doc_pages_category_id_idx" ON "doc_pages"("category_id");
CREATE INDEX "doc_pages_slug_idx" ON "doc_pages"("slug");
CREATE INDEX "doc_pages_is_published_idx" ON "doc_pages"("is_published");
CREATE INDEX "doc_pages_access_level_idx" ON "doc_pages"("access_level");

-- Add foreign keys
ALTER TABLE "doc_categories" ADD CONSTRAINT "doc_categories_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "doc_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "doc_pages" ADD CONSTRAINT "doc_pages_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "doc_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- WEBSITE ANALYTICS
-- ============================================

-- Create page views table
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "country" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- Create analytics sessions table
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "page_count" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- Create heatmap clicks table
CREATE TABLE "heatmap_clicks" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "element_tag" TEXT,
    "element_id" TEXT,
    "element_class" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heatmap_clicks_pkey" PRIMARY KEY ("id")
);

-- Create indexes for website analytics
CREATE INDEX "page_views_session_id_idx" ON "page_views"("session_id");
CREATE INDEX "page_views_path_idx" ON "page_views"("path");
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

CREATE INDEX "analytics_sessions_visitor_id_idx" ON "analytics_sessions"("visitor_id");
CREATE INDEX "analytics_sessions_started_at_idx" ON "analytics_sessions"("started_at");

CREATE INDEX "heatmap_clicks_path_idx" ON "heatmap_clicks"("path");
CREATE INDEX "heatmap_clicks_created_at_idx" ON "heatmap_clicks"("created_at");

-- Add comments for documentation
COMMENT ON TABLE "doc_categories" IS 'Hierarchical categories for documentation pages';
COMMENT ON TABLE "doc_pages" IS 'Documentation pages with bilingual content';
COMMENT ON TABLE "page_views" IS 'Individual page view tracking for analytics';
COMMENT ON TABLE "analytics_sessions" IS 'User sessions for analytics tracking';
COMMENT ON TABLE "heatmap_clicks" IS 'Click tracking for heatmap visualization';
