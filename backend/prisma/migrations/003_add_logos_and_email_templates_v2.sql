-- Migration: Add Logos table and Update Email Templates

-- Create enums
CREATE TYPE "LogoCategory" AS ENUM ('CLIENT', 'PARTNER', 'TECHNOLOGY', 'CERTIFICATION');
CREATE TYPE "EmailTemplateCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING', 'NOTIFICATION');

-- Create Logos Table
CREATE TABLE "logos" (
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

CREATE INDEX "logos_category_idx" ON "logos"("category");
CREATE INDEX "logos_is_active_idx" ON "logos"("is_active");

-- Update Email Templates Table
ALTER TABLE "email_templates" ADD COLUMN "category" "EmailTemplateCategory" NOT NULL DEFAULT 'TRANSACTIONAL';
ALTER TABLE "email_templates" RENAME COLUMN "subject" TO "subject_old";
ALTER TABLE "email_templates" RENAME COLUMN "body_html" TO "body_html_old";
ALTER TABLE "email_templates" RENAME COLUMN "body_text" TO "body_text_old";

ALTER TABLE "email_templates" ADD COLUMN "subject_en" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "subject_ar" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "content_html_en" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "content_html_ar" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "content_text_en" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "content_text_ar" TEXT;

-- Migrate data
UPDATE "email_templates"
SET
    "subject_en" = COALESCE("subject_old", ''),
    "subject_ar" = COALESCE("subject_old", ''),
    "content_html_en" = COALESCE("body_html_old", ''),
    "content_html_ar" = COALESCE("body_html_old", ''),
    "content_text_en" = "body_text_old",
    "content_text_ar" = "body_text_old";

-- Make columns required
ALTER TABLE "email_templates" ALTER COLUMN "subject_en" SET NOT NULL;
ALTER TABLE "email_templates" ALTER COLUMN "subject_ar" SET NOT NULL;
ALTER TABLE "email_templates" ALTER COLUMN "content_html_en" SET NOT NULL;
ALTER TABLE "email_templates" ALTER COLUMN "content_html_ar" SET NOT NULL;

-- Drop old columns
ALTER TABLE "email_templates" DROP COLUMN "subject_old";
ALTER TABLE "email_templates" DROP COLUMN "body_html_old";
ALTER TABLE "email_templates" DROP COLUMN "body_text_old";

-- Update variables column
ALTER TABLE "email_templates" DROP COLUMN "variables";
ALTER TABLE "email_templates" ADD COLUMN "variables" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes
CREATE INDEX "email_templates_category_idx" ON "email_templates"("category");
CREATE INDEX "email_templates_is_active_idx" ON "email_templates"("is_active");
