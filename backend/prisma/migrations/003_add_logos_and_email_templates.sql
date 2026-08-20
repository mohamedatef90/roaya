-- Migration: Add Logos table and Update Email Templates
-- This migration adds the logos table and updates email templates to support bilingual content

-- ============================================
-- STEP 1: Create Logo Category Enum
-- ============================================
DO $$ BEGIN
    CREATE TYPE "LogoCategory" AS ENUM ('CLIENT', 'PARTNER', 'TECHNOLOGY', 'CERTIFICATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create Logos Table
-- ============================================
CREATE TABLE IF NOT EXISTS "logos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "dark_mode_url" TEXT,
    "category" "LogoCategory" NOT NULL DEFAULT 'CLIENT',
    "sections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website_url" TEXT,
    "alt_text_en" TEXT,
    "alt_text_ar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create indexes for logos
CREATE INDEX IF NOT EXISTS "logos_category_idx" ON "logos"("category");
CREATE INDEX IF NOT EXISTS "logos_is_active_idx" ON "logos"("is_active");

-- ============================================
-- STEP 3: Create Email Template Category Enum
-- ============================================
DO $$ BEGIN
    CREATE TYPE "EmailTemplateCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING', 'NOTIFICATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 4: Update Email Templates Table
-- ============================================

-- Add category column
ALTER TABLE "email_templates" 
ADD COLUMN IF NOT EXISTS "category" "EmailTemplateCategory" NOT NULL DEFAULT 'TRANSACTIONAL';

-- Rename old columns (preserve data)
ALTER TABLE "email_templates" 
RENAME COLUMN "subject" TO "subject_old";

ALTER TABLE "email_templates" 
RENAME COLUMN "body_html" TO "body_html_old";

ALTER TABLE "email_templates" 
RENAME COLUMN "body_text" TO "body_text_old";

-- Add new bilingual columns
ALTER TABLE "email_templates" 
ADD COLUMN IF NOT EXISTS "subject_en" TEXT,
ADD COLUMN IF NOT EXISTS "subject_ar" TEXT,
ADD COLUMN IF NOT EXISTS "content_html_en" TEXT,
ADD COLUMN IF NOT EXISTS "content_html_ar" TEXT,
ADD COLUMN IF NOT EXISTS "content_text_en" TEXT,
ADD COLUMN IF NOT EXISTS "content_text_ar" TEXT;

-- Migrate existing data to English columns
UPDATE "email_templates" 
SET 
    "subject_en" = COALESCE("subject_old", ''),
    "subject_ar" = COALESCE("subject_old", ''),
    "content_html_en" = COALESCE("body_html_old", ''),
    "content_html_ar" = COALESCE("body_html_old", ''),
    "content_text_en" = "body_text_old",
    "content_text_ar" = "body_text_old";

-- Now make the new columns required
ALTER TABLE "email_templates" 
ALTER COLUMN "subject_en" SET NOT NULL,
ALTER COLUMN "subject_ar" SET NOT NULL,
ALTER COLUMN "content_html_en" SET NOT NULL,
ALTER COLUMN "content_html_ar" SET NOT NULL;

-- Drop old columns
ALTER TABLE "email_templates" 
DROP COLUMN IF EXISTS "subject_old",
DROP COLUMN IF EXISTS "body_html_old",
DROP COLUMN IF EXISTS "body_text_old";

-- Update variables column type
DO $$ BEGIN
    ALTER TABLE "email_templates" DROP COLUMN IF EXISTS "variables";
    ALTER TABLE "email_templates" ADD COLUMN "variables" TEXT[] DEFAULT ARRAY[]::TEXT[];
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create indexes for email_templates
CREATE INDEX IF NOT EXISTS "email_templates_category_idx" ON "email_templates"("category");
CREATE INDEX IF NOT EXISTS "email_templates_is_active_idx" ON "email_templates"("is_active");

COMMIT;
