/*
  Warnings:

  - The required column `token_family` was added to the `refresh_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('BLOG_POST', 'CASE_STUDY', 'WHITEPAPER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME', 'CUSTOM');

-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_until" TIMESTAMP(3);

-- AlterTable - Add token_family and used_at columns to refresh_tokens
-- Step 1: Add token_family as nullable first
ALTER TABLE "refresh_tokens" ADD COLUMN     "token_family" TEXT;

-- Step 2: Populate existing rows with a unique UUID for each token family
UPDATE "refresh_tokens" SET "token_family" = gen_random_uuid()::text WHERE "token_family" IS NULL;

-- Step 3: Make token_family required
ALTER TABLE "refresh_tokens" ALTER COLUMN "token_family" SET NOT NULL;

-- Step 4: Set default for future inserts
ALTER TABLE "refresh_tokens" ALTER COLUMN "token_family" SET DEFAULT gen_random_uuid()::text;

-- Step 5: Add used_at column (nullable - this is fine)
ALTER TABLE "refresh_tokens" ADD COLUMN     "used_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug_en" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "excerpt_en" TEXT,
    "excerpt_ar" TEXT,
    "content_en" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "featured_image" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author_id" TEXT NOT NULL,
    "meta_title_en" TEXT,
    "meta_title_ar" TEXT,
    "meta_desc_en" TEXT,
    "meta_desc_ar" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_packages" (
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "type" "PackageType" NOT NULL DEFAULT 'SUBSCRIPTION',
    "price_monthly" DECIMAL(10,2),
    "price_yearly" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features_en" JSONB NOT NULL,
    "features_ar" JSONB NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "badge_color" TEXT,
    "cta_text_en" TEXT,
    "cta_text_ar" TEXT,
    "cta_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "bio_en" TEXT,
    "bio_ar" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "photo_url" TEXT,
    "department" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "quote_en" TEXT NOT NULL,
    "quote_ar" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_title_en" TEXT NOT NULL,
    "author_title_ar" TEXT NOT NULL,
    "author_company" TEXT,
    "author_photo" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "service" TEXT,
    "industry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_idx" ON "user_activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "user_activity_logs_action_idx" ON "user_activity_logs"("action");

-- CreateIndex
CREATE INDEX "user_activity_logs_created_at_idx" ON "user_activity_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_en_key" ON "content_items"("slug_en");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_ar_key" ON "content_items"("slug_ar");

-- CreateIndex
CREATE INDEX "content_items_type_idx" ON "content_items"("type");

-- CreateIndex
CREATE INDEX "content_items_status_idx" ON "content_items"("status");

-- CreateIndex
CREATE INDEX "content_items_published_at_idx" ON "content_items"("published_at");

-- CreateIndex
CREATE INDEX "service_packages_is_active_idx" ON "service_packages"("is_active");

-- CreateIndex
CREATE INDEX "service_packages_order_idx" ON "service_packages"("order");

-- CreateIndex
CREATE INDEX "team_members_is_active_idx" ON "team_members"("is_active");

-- CreateIndex
CREATE INDEX "team_members_order_idx" ON "team_members"("order");

-- CreateIndex
CREATE INDEX "team_members_department_idx" ON "team_members"("department");

-- CreateIndex
CREATE INDEX "testimonials_is_active_idx" ON "testimonials"("is_active");

-- CreateIndex
CREATE INDEX "testimonials_is_featured_idx" ON "testimonials"("is_featured");

-- CreateIndex
CREATE INDEX "testimonials_order_idx" ON "testimonials"("order");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_family_idx" ON "refresh_tokens"("token_family");

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
