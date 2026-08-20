/*
  Warnings:

  - You are about to drop the column `body_html` on the `email_templates` table. All the data in the column will be lost.
  - You are about to drop the column `body_text` on the `email_templates` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `email_templates` table. All the data in the column will be lost.
  - The `variables` column on the `email_templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `content_html_ar` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_html_en` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_ar` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_en` to the `email_templates` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailTemplateCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "LogoCategory" AS ENUM ('CLIENT', 'PARTNER', 'TECHNOLOGY', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "DocAccessLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'ADMIN');

-- AlterTable
ALTER TABLE "email_templates" DROP COLUMN "body_html",
DROP COLUMN "body_text",
DROP COLUMN "subject",
ADD COLUMN     "category" "EmailTemplateCategory" NOT NULL DEFAULT 'TRANSACTIONAL',
ADD COLUMN     "content_html_ar" TEXT NOT NULL,
ADD COLUMN     "content_html_en" TEXT NOT NULL,
ADD COLUMN     "content_text_ar" TEXT,
ADD COLUMN     "content_text_en" TEXT,
ADD COLUMN     "subject_ar" TEXT NOT NULL,
ADD COLUMN     "subject_en" TEXT NOT NULL,
DROP COLUMN "variables",
ADD COLUMN     "variables" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "token_family" DROP DEFAULT;

-- CreateTable
CREATE TABLE "logos" (
    "id" TEXT NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE INDEX "logos_category_idx" ON "logos"("category");

-- CreateIndex
CREATE INDEX "logos_is_active_idx" ON "logos"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "doc_categories_slug_key" ON "doc_categories"("slug");

-- CreateIndex
CREATE INDEX "doc_categories_parent_id_idx" ON "doc_categories"("parent_id");

-- CreateIndex
CREATE INDEX "doc_categories_slug_idx" ON "doc_categories"("slug");

-- CreateIndex
CREATE INDEX "doc_categories_is_active_idx" ON "doc_categories"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "doc_pages_slug_key" ON "doc_pages"("slug");

-- CreateIndex
CREATE INDEX "doc_pages_category_id_idx" ON "doc_pages"("category_id");

-- CreateIndex
CREATE INDEX "doc_pages_slug_idx" ON "doc_pages"("slug");

-- CreateIndex
CREATE INDEX "doc_pages_is_published_idx" ON "doc_pages"("is_published");

-- CreateIndex
CREATE INDEX "doc_pages_access_level_idx" ON "doc_pages"("access_level");

-- CreateIndex
CREATE INDEX "page_views_session_id_idx" ON "page_views"("session_id");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

-- CreateIndex
CREATE INDEX "analytics_sessions_visitor_id_idx" ON "analytics_sessions"("visitor_id");

-- CreateIndex
CREATE INDEX "analytics_sessions_started_at_idx" ON "analytics_sessions"("started_at");

-- CreateIndex
CREATE INDEX "heatmap_clicks_path_idx" ON "heatmap_clicks"("path");

-- CreateIndex
CREATE INDEX "heatmap_clicks_created_at_idx" ON "heatmap_clicks"("created_at");

-- CreateIndex
CREATE INDEX "email_templates_category_idx" ON "email_templates"("category");

-- CreateIndex
CREATE INDEX "email_templates_is_active_idx" ON "email_templates"("is_active");

-- AddForeignKey
ALTER TABLE "doc_categories" ADD CONSTRAINT "doc_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "doc_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_pages" ADD CONSTRAINT "doc_pages_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "doc_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
