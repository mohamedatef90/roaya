-- =============================================================================
-- Roaya Lead Management System - Initial Migration
-- =============================================================================
-- Migration: 001_initial_schema
-- Version: 1.0.0
-- Database: PostgreSQL 16+
-- Created: 2026-01-21
--
-- This migration creates the complete schema for the lead management system.
-- Run this script on a fresh PostgreSQL database.
--
-- IMPORTANT:
--   - Backup your database before running
--   - Run in a transaction (wrapped in BEGIN/COMMIT)
--   - Test on staging environment first
-- =============================================================================

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fuzzy text search (for company name search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Admin user roles
CREATE TYPE admin_role AS ENUM ('admin', 'manager', 'sales', 'viewer');
COMMENT ON TYPE admin_role IS 'Admin dashboard user roles: admin (full), manager (leads+users), sales (leads), viewer (read-only)';

-- Lead priority levels
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
COMMENT ON TYPE lead_priority IS 'Manual lead priority for sales team';

-- Email notification types
CREATE TYPE notification_type AS ENUM ('admin_alert', 'lead_confirmation', 'follow_up', 'quote_sent');
COMMENT ON TYPE notification_type IS 'Types of email notifications sent by the system';

-- Email delivery status
CREATE TYPE email_status AS ENUM ('pending', 'queued', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced');
COMMENT ON TYPE email_status IS 'Email delivery lifecycle status';

-- Activity log types
CREATE TYPE activity_type AS ENUM ('created', 'status_changed', 'edited', 'note_added', 'email_sent', 'email_opened', 'email_clicked', 'qualified', 'disqualified', 'archived', 'restored', 'exported', 'assigned');
COMMENT ON TYPE activity_type IS 'Types of audited activities on leads';

-- Activity performer types
CREATE TYPE performer_type AS ENUM ('system', 'admin', 'api', 'cron');
COMMENT ON TYPE performer_type IS 'Who/what performed an activity';

-- ============================================================================
-- HELPER FUNCTION: Automatic updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to auto-update updated_at timestamp';

-- ============================================================================
-- TABLE: lead_sources
-- Reference table for lead capture form sources
-- ============================================================================

CREATE TABLE lead_sources (
    id            SERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    form_endpoint VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_sources_code UNIQUE (code)
);

COMMENT ON TABLE lead_sources IS 'Reference table for lead capture form sources (contact, pricing, ROI calculator)';
COMMENT ON COLUMN lead_sources.code IS 'Unique code identifier (contact, pricing_quote, roi_calculator)';
COMMENT ON COLUMN lead_sources.form_endpoint IS 'API endpoint for this form type';

-- ============================================================================
-- TABLE: lead_statuses
-- Lead pipeline stages
-- ============================================================================

CREATE TABLE lead_statuses (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    color       VARCHAR(7),
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_statuses_code UNIQUE (code),
    CONSTRAINT chk_lead_statuses_color CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE lead_statuses IS 'Lead pipeline stages (new, contacted, qualified, won, lost, etc.)';
COMMENT ON COLUMN lead_statuses.color IS 'Hex color code for UI display (#RRGGBB format)';
COMMENT ON COLUMN lead_statuses.is_terminal IS 'Terminal statuses cannot transition further (won, lost)';
COMMENT ON COLUMN lead_statuses.is_active IS 'Inactive statuses are hidden from new lead assignment';

-- ============================================================================
-- TABLE: industries
-- Industry categories with hierarchy support
-- ============================================================================

CREATE TABLE industries (
    id         SERIAL PRIMARY KEY,
    code       VARCHAR(50) NOT NULL,
    name_en    VARCHAR(100) NOT NULL,
    name_ar    VARCHAR(100) NOT NULL,
    parent_id  INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_industries_code UNIQUE (code),
    CONSTRAINT fk_industries_parent
        FOREIGN KEY (parent_id)
        REFERENCES industries(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_industries_parent ON industries(parent_id);

COMMENT ON TABLE industries IS 'Industry categories for lead classification with optional hierarchy';
COMMENT ON COLUMN industries.name_en IS 'Industry name in English';
COMMENT ON COLUMN industries.name_ar IS 'Industry name in Arabic';
COMMENT ON COLUMN industries.parent_id IS 'Parent industry for hierarchical categories';

-- ============================================================================
-- TABLE: services
-- Services offered by Roaya IT
-- ============================================================================

CREATE TABLE services (
    id             SERIAL PRIMARY KEY,
    code           VARCHAR(50) NOT NULL,
    name_en        VARCHAR(100) NOT NULL,
    name_ar        VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category       VARCHAR(50),
    sort_order     INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_services_code UNIQUE (code)
);

COMMENT ON TABLE services IS 'IT services offered by Roaya (cloud, security, SAP, etc.)';
COMMENT ON COLUMN services.category IS 'Service category for grouping (infrastructure, security, etc.)';

-- ============================================================================
-- TABLE: admin_users
-- Admin dashboard users with role-based access
-- ============================================================================

CREATE TABLE admin_users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                 VARCHAR(255) NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    role                  admin_role NOT NULL DEFAULT 'viewer',
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until          TIMESTAMPTZ,
    last_login_at         TIMESTAMPTZ,
    last_login_ip         VARCHAR(45),
    deleted_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_admin_users_email UNIQUE (email)
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active_role ON admin_users(is_active, role);

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE admin_users IS 'Admin dashboard users with role-based access control';
COMMENT ON COLUMN admin_users.password_hash IS 'bcrypt hashed password (cost factor 12)';
COMMENT ON COLUMN admin_users.failed_login_attempts IS 'Counter for failed login attempts (reset on success)';
COMMENT ON COLUMN admin_users.locked_until IS 'Account locked until this timestamp after too many failures';
COMMENT ON COLUMN admin_users.last_login_ip IS 'IPv4 or IPv6 address of last login';
COMMENT ON COLUMN admin_users.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- TABLE: leads (CORE TABLE)
-- Core lead/prospect records from all capture forms
-- ============================================================================

CREATE TABLE leads (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    source_id   INTEGER NOT NULL,
    industry_id INTEGER,
    status_id   INTEGER NOT NULL,
    assigned_to UUID,

    -- Contact information
    company_name  VARCHAR(255) NOT NULL,
    contact_name  VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),

    -- Company details
    employee_count VARCHAR(50),
    annual_revenue VARCHAR(50),

    -- Requirements
    requirements VARCHAR(2000),
    budget_range VARCHAR(50),
    timeline     VARCHAR(100),

    -- Form-specific data (flexible schema for different form types)
    form_data JSONB NOT NULL DEFAULT '{}',

    -- Tracking and metadata
    language     VARCHAR(5) NOT NULL DEFAULT 'en',
    ip_address   VARCHAR(45),
    user_agent   TEXT,
    referrer_url TEXT,

    -- UTM tracking parameters
    utm_source   VARCHAR(100),
    utm_medium   VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term     VARCHAR(100),
    utm_content  VARCHAR(100),

    -- Scoring and prioritization
    lead_score   INTEGER NOT NULL DEFAULT 0,
    priority     lead_priority NOT NULL DEFAULT 'medium',
    is_qualified BOOLEAN NOT NULL DEFAULT FALSE,

    -- Internal notes (quick notes without activity log)
    internal_notes TEXT,

    -- Quick access timestamp
    last_contacted_at TIMESTAMPTZ,

    -- Soft delete support
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    archived_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_leads_source
        FOREIGN KEY (source_id)
        REFERENCES lead_sources(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leads_industry
        FOREIGN KEY (industry_id)
        REFERENCES industries(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_leads_status
        FOREIGN KEY (status_id)
        REFERENCES lead_statuses(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_leads_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES admin_users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_leads_archived_by
        FOREIGN KEY (archived_by)
        REFERENCES admin_users(id)
        ON DELETE SET NULL,

    -- Check constraints
    CONSTRAINT chk_leads_email
        CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    CONSTRAINT chk_leads_score
        CHECK (lead_score >= 0 AND lead_score <= 100),

    CONSTRAINT chk_leads_language
        CHECK (language IN ('en', 'ar'))
);

-- Indexes for common query patterns
CREATE INDEX idx_leads_created_at_desc ON leads(created_at DESC) WHERE is_archived = FALSE;
CREATE INDEX idx_leads_status_created ON leads(status_id, created_at DESC) WHERE is_archived = FALSE;
CREATE INDEX idx_leads_source_created ON leads(source_id, created_at DESC) WHERE is_archived = FALSE;
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to, is_archived, created_at DESC);
CREATE INDEX idx_leads_email ON leads(lower(contact_email));
CREATE INDEX idx_leads_email_source ON leads(lower(contact_email), source_id);
CREATE INDEX idx_leads_company_trgm ON leads USING gin(company_name gin_trgm_ops);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_priority ON leads(priority, created_at DESC) WHERE is_archived = FALSE;

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE leads IS 'Core lead/prospect records from all capture forms (contact, pricing, ROI)';
COMMENT ON COLUMN leads.form_data IS 'JSONB for form-specific fields (ROI inputs, calculator results, etc.)';
COMMENT ON COLUMN leads.lead_score IS 'Computed lead score 0-100 based on business rules';
COMMENT ON COLUMN leads.priority IS 'Manual priority override by sales team';
COMMENT ON COLUMN leads.internal_notes IS 'Quick internal notes (use activities for formal notes)';
COMMENT ON COLUMN leads.last_contacted_at IS 'Quick access timestamp for last contact (denormalized)';

-- ============================================================================
-- TABLE: lead_services
-- Junction table for many-to-many lead-service relationship
-- ============================================================================

CREATE TABLE lead_services (
    id         SERIAL PRIMARY KEY,
    lead_id    UUID NOT NULL,
    service_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_services UNIQUE (lead_id, service_id),

    CONSTRAINT fk_lead_services_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lead_services_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_lead_services_lead ON lead_services(lead_id);
CREATE INDEX idx_lead_services_service ON lead_services(service_id);

COMMENT ON TABLE lead_services IS 'Many-to-many junction: leads interested in multiple services';
COMMENT ON COLUMN lead_services.is_primary IS 'Primary service of interest for this lead';

-- ============================================================================
-- TABLE: email_notifications
-- Email delivery tracking for lead notifications
-- ============================================================================

CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lead_id UUID NOT NULL,

    -- Notification details
    notification_type notification_type NOT NULL,
    template_name     VARCHAR(100),

    -- Recipient
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name  VARCHAR(255),

    -- Content (for audit/debugging)
    subject      VARCHAR(500),
    body_preview TEXT,

    -- Status tracking
    status email_status NOT NULL DEFAULT 'pending',

    -- Delivery tracking timestamps
    scheduled_at TIMESTAMPTZ,
    sent_at      TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at    TIMESTAMPTZ,
    clicked_at   TIMESTAMPTZ,

    -- Error handling
    error_message TEXT,
    retry_count   INTEGER NOT NULL DEFAULT 0,
    max_retries   INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- External references (SendGrid message ID)
    external_message_id VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_email_notifications_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE
);

-- Index for email queue worker
CREATE INDEX idx_email_notifications_pending
    ON email_notifications(next_retry_at)
    WHERE status IN ('pending', 'queued') AND retry_count < max_retries;

CREATE INDEX idx_email_notifications_lead ON email_notifications(lead_id, created_at DESC);
CREATE INDEX idx_email_notifications_external ON email_notifications(external_message_id);

CREATE TRIGGER trg_email_notifications_updated_at
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_notifications IS 'Email delivery tracking and history for all lead notifications';
COMMENT ON COLUMN email_notifications.external_message_id IS 'SendGrid message ID for webhook matching';
COMMENT ON COLUMN email_notifications.body_preview IS 'First 500 chars of email body for audit';

-- ============================================================================
-- TABLE: lead_activities
-- Immutable audit log of all lead-related activities
-- ============================================================================

CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lead_id UUID NOT NULL,

    -- Activity details
    activity_type    activity_type NOT NULL,
    description      TEXT,

    -- Who performed the action
    performed_by      UUID,
    performed_by_type performer_type NOT NULL DEFAULT 'system',

    -- Change tracking (for edits)
    old_value JSONB,
    new_value JSONB,

    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Timestamp (immutable - NO updated_at for audit logs)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_lead_activities_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lead_activities_performed_by
        FOREIGN KEY (performed_by)
        REFERENCES admin_users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_lead_activities_lead_created ON lead_activities(lead_id, created_at DESC);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type, created_at DESC);
CREATE INDEX idx_lead_activities_performer ON lead_activities(performed_by, created_at DESC);

COMMENT ON TABLE lead_activities IS 'Immutable audit log of all lead-related activities';
COMMENT ON COLUMN lead_activities.old_value IS 'Previous value(s) before change (JSONB for flexibility)';
COMMENT ON COLUMN lead_activities.new_value IS 'New value(s) after change';

-- ============================================================================
-- TABLE: refresh_tokens
-- JWT refresh tokens for admin authentication
-- ============================================================================

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    device_info VARCHAR(255),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES admin_users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for admin dashboard authentication';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token (never store plaintext)';
COMMENT ON COLUMN refresh_tokens.device_info IS 'User agent or device identifier for token management';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
--
-- After running this migration:
-- 1. Run the seed data script (002_seed_data.sql)
-- 2. Verify all tables were created: \dt
-- 3. Verify all indexes were created: \di
-- 4. Verify all constraints: \d+ leads
-- 5. Create initial admin user (in seed data or separately)
--
-- To rollback this migration, run:
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;
-- (WARNING: This destroys ALL data)
-- ============================================================================
