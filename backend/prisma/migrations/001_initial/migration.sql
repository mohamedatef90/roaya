-- Lead Management System Initial Migration
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'ARCHIVED');
CREATE TYPE "LeadSource" AS ENUM ('CONTACT_FORM', 'PRICING_PAGE', 'ROI_CALCULATOR', 'NEWSLETTER', 'REFERRAL', 'LINKEDIN', 'GOOGLE_ADS', 'ORGANIC', 'OTHER');
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'VIEWER');
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'EMAIL_SENT', 'EMAIL_RECEIVED', 'CALL', 'MEETING', 'STATUS_CHANGE', 'ASSIGNMENT_CHANGE', 'FOLLOW_UP');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- 1. Admin Users Table
CREATE TABLE "admin_users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leads Table
CREATE TABLE "leads" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "company" VARCHAR(255),
    "job_title" VARCHAR(100),
    "website" VARCHAR(255),
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "form_data" JSONB,
    "estimated_value" DECIMAL(12, 2),
    "message" TEXT,
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "referrer" TEXT,
    "assigned_to_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
    "next_follow_up_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_source_idx" ON "leads"("source");
CREATE INDEX "leads_assigned_to_idx" ON "leads"("assigned_to_id");
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- 3. Lead Activities Table
CREATE TABLE "lead_activities" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "lead_id" UUID NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performed_by_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "lead_activities_lead_id_idx" ON "lead_activities"("lead_id");
CREATE INDEX "lead_activities_type_idx" ON "lead_activities"("type");
CREATE INDEX "lead_activities_created_at_idx" ON "lead_activities"("created_at");

-- 4. Lead Notes Table
CREATE TABLE "lead_notes" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "lead_id" UUID NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "lead_notes_lead_id_idx" ON "lead_notes"("lead_id");

-- 5. Tags Table
CREATE TABLE "tags" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "color" VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lead Tags Junction Table
CREATE TABLE "lead_tags" (
    "lead_id" UUID NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
    "tag_id" UUID NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("lead_id", "tag_id")
);

-- 7. Notifications Table
CREATE TABLE "notifications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "lead_id" UUID REFERENCES "leads"("id") ON DELETE SET NULL,
    "type" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP WITH TIME ZONE,
    "error_msg" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "notifications_status_idx" ON "notifications"("status");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- 8. Refresh Tokens Table
CREATE TABLE "refresh_tokens" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "token" VARCHAR(255) NOT NULL UNIQUE,
    "user_id" UUID NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- 9. Email Templates Table
CREATE TABLE "email_templates" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "subject" VARCHAR(255) NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. System Settings Table
CREATE TABLE "system_settings" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "key" VARCHAR(100) NOT NULL UNIQUE,
    "value" JSONB NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'general',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON "admin_users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON "leads" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON "lead_notes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON "email_templates" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON "system_settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
