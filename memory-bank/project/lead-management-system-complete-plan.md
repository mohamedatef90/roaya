# Roaya Lead Management System - Complete Implementation Plan

## Document Version
- **Version:** 1.0
- **Date:** 2026-01-21
- **Status:** Ready for Implementation
- **Domain:** www.roaya.co
- **Server:** Private Linux Server

---

## Executive Summary

This document provides a complete technical specification for implementing a lead management system for the Roaya IT website. The system will:

1. **Capture leads** from 3 forms: Contact, Pricing Quote, ROI Calculator
2. **Store data** in PostgreSQL database with full audit trail
3. **Notify sales team** via email when new leads arrive
4. **Send confirmation emails** to customers with "request processing" message
5. **Provide admin dashboard** to view and manage all leads

**Timeline:** 5-6 weeks for complete implementation
**Technology Stack:** Node.js + Express + TypeScript + PostgreSQL + Redis + SendGrid

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Design](#2-database-design)
3. [API Specification](#3-api-specification)
4. [Email Service](#4-email-service)
5. [Authentication](#5-authentication)
6. [Admin Dashboard](#6-admin-dashboard)
7. [Security Measures](#7-security-measures)
8. [Deployment Configuration](#8-deployment-configuration)
9. [Environment Variables](#9-environment-variables)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (www.roaya.co - Angular)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Contact   │  │   Pricing   │  │    ROI Calculator       │  │
│  │    Form     │  │    Form     │  │        Form             │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          └────────────────┼─────────────────────┘
                           │ HTTPS POST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                        │
│              SSL Termination + Rate Limiting                     │
│                    api.roaya.co:443                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                         │
│                   Express + TypeScript                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    API Endpoints                             ││
│  │  POST /api/v1/leads/contact                                  ││
│  │  POST /api/v1/leads/pricing-quote                            ││
│  │  POST /api/v1/leads/roi-calculator                           ││
│  │  POST /api/v1/auth/login                                     ││
│  │  GET  /api/v1/admin/leads                                    ││
│  │  GET  /api/v1/admin/leads/:id                                ││
│  │  PATCH /api/v1/admin/leads/:id                               ││
│  │  POST /api/v1/admin/leads/export                             ││
│  └─────────────────────────────────────────────────────────────┘│
└───────┬───────────────────────────┬─────────────────────────────┘
        │                           │
        ▼                           ▼
┌───────────────────┐       ┌───────────────────┐
│   PostgreSQL      │       │      Redis        │
│   (Lead Data)     │       │  (Sessions,       │
│                   │       │   Rate Limiting,  │
│  - leads          │       │   Email Queue)    │
│  - lead_sources   │       │                   │
│  - lead_statuses  │       └─────────┬─────────┘
│  - industries     │                 │
│  - services       │                 ▼
│  - activities     │       ┌───────────────────┐
│  - admin_users    │       │   Email Queue     │
│  - email_notif    │       │   (Bull)          │
└───────────────────┘       └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │    SendGrid       │
                            │  (Email Service)  │
                            │                   │
                            │ - Admin Notif     │
                            │ - Customer Email  │
                            └───────────────────┘
```

### 1.2 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | v20 LTS | Server-side JavaScript |
| **Framework** | Express.js | v4.18+ | REST API framework |
| **Language** | TypeScript | v5.7+ | Type safety |
| **Database** | PostgreSQL | v16 | Primary data store |
| **Cache** | Redis | v7 | Sessions, rate limiting, queue |
| **ORM** | Prisma | v5+ | Type-safe database client |
| **Email** | SendGrid | Latest | Transactional emails |
| **Queue** | Bull | v4+ | Email job queue |
| **Auth** | JWT | - | Token-based authentication |
| **Validation** | Zod | v3+ | Schema validation |
| **Process Manager** | PM2 | Latest | Production process management |
| **Web Server** | Nginx | Latest | Reverse proxy, SSL |

---

## 2. Database Design

### 2.1 Why PostgreSQL?

| Factor | PostgreSQL | MySQL | SQLite |
|--------|------------|-------|--------|
| **JSON Support** | Native JSONB with indexing | Limited | Basic |
| **UUID Support** | Native `gen_random_uuid()` | Requires workaround | Manual |
| **Array Types** | Native arrays | Requires JSON | No |
| **Full-text Search** | Built-in | Plugin required | Limited |
| **Constraints** | Advanced CHECK, EXCLUDE | Basic | Basic |
| **Scalability** | Excellent | Good | Single-file limit |

### 2.2 Entity Relationship Diagram

```
┌─────────────────────┐
│   lead_sources      │
├─────────────────────┤
│ id (PK)             │
│ code (UNIQUE)       │──────────────┐
│ name                │              │
│ is_active           │              │
└─────────────────────┘              │
                                     │ 1:N
┌─────────────────────┐              │
│   lead_statuses     │              │
├─────────────────────┤              │
│ id (PK)             │──────┐       │
│ code (UNIQUE)       │      │       │
│ name                │      │       │
│ color               │      │       │
│ is_terminal         │      │       │
└─────────────────────┘      │       │
                             │       │
┌─────────────────────┐      │       │
│    industries       │      │       │
├─────────────────────┤      │       │
│ id (PK)             │──────┼───────┼───────┐
│ code (UNIQUE)       │      │       │       │
│ name_en             │      │       │       │
│ name_ar             │      │       │       │
└─────────────────────┘      │ 1:N   │ 1:N   │ 1:N
                             │       │       │
                             ▼       ▼       ▼
                    ┌─────────────────────────────┐
                    │          leads              │
                    ├─────────────────────────────┤
                    │ id (UUID PK)                │
                    │ source_id (FK)              │
                    │ status_id (FK)              │
                    │ industry_id (FK)            │
                    │ company_name                │
                    │ contact_email               │
                    │ contact_phone               │
                    │ employee_count              │
                    │ requirements                │
                    │ form_data (JSONB)           │
                    │ lead_score                  │
                    │ is_archived                 │
                    │ created_at                  │
                    │ updated_at                  │
                    └─────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          │ 1:N                   │ 1:N                   │ N:N
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ email_notif     │    │ lead_activities │    │ lead_services   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ lead_id (FK)    │
│ lead_id (FK)    │    │ lead_id (FK)    │    │ service_id (FK) │
│ type            │    │ activity_type   │    │ is_primary      │
│ recipient       │    │ description     │    └────────┬────────┘
│ status          │    │ performed_by    │             │
│ sent_at         │    │ old_value       │             │
│ error_message   │    │ new_value       │             ▼
│ retry_count     │    │ created_at      │    ┌─────────────────┐
└─────────────────┘    └─────────────────┘    │    services     │
                                              ├─────────────────┤
                                              │ id (PK)         │
                                              │ code (UNIQUE)   │
                                              │ name_en         │
                                              │ name_ar         │
                                              └─────────────────┘
```

### 2.3 Complete SQL Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For fuzzy text search

-- ============================================================
-- HELPER FUNCTION: Update timestamp trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: lead_sources
-- ============================================================
CREATE TABLE lead_sources (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    form_endpoint VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_sources_code UNIQUE (code)
);

COMMENT ON TABLE lead_sources IS 'Reference table for lead capture form sources';

-- ============================================================
-- TABLE: lead_statuses
-- ============================================================
CREATE TABLE lead_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_statuses_code UNIQUE (code),
    CONSTRAINT chk_lead_statuses_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE lead_statuses IS 'Lead pipeline stages';

-- ============================================================
-- TABLE: industries
-- ============================================================
CREATE TABLE industries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    parent_id INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_industries_code UNIQUE (code),
    CONSTRAINT fk_industries_parent
        FOREIGN KEY (parent_id)
        REFERENCES industries(id)
        ON DELETE SET NULL
);

COMMENT ON TABLE industries IS 'Industry categories for lead classification';

-- ============================================================
-- TABLE: services
-- ============================================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_services_code UNIQUE (code)
);

COMMENT ON TABLE services IS 'Services offered by Roaya';

-- ============================================================
-- TABLE: admin_users
-- ============================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_admin_users_email UNIQUE (email),
    CONSTRAINT chk_admin_users_role CHECK (role IN ('admin', 'manager', 'sales', 'viewer'))
);

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE admin_users IS 'Admin dashboard users';

-- ============================================================
-- TABLE: leads (CORE TABLE)
-- ============================================================
CREATE TABLE leads (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    source_id INTEGER NOT NULL,
    industry_id INTEGER,
    status_id INTEGER NOT NULL,
    assigned_to UUID,

    -- Contact information
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),

    -- Company details
    employee_count VARCHAR(50),
    annual_revenue VARCHAR(50),

    -- Requirements
    requirements TEXT,
    budget_range VARCHAR(50),
    timeline VARCHAR(100),

    -- Form-specific data (flexible schema)
    form_data JSONB NOT NULL DEFAULT '{}',

    -- Tracking and metadata
    language VARCHAR(5) NOT NULL DEFAULT 'en',
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),

    -- Scoring and prioritization
    lead_score INTEGER DEFAULT 0,
    is_qualified BOOLEAN DEFAULT FALSE,

    -- Soft delete support
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    archived_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
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

    CONSTRAINT chk_leads_email
        CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    CONSTRAINT chk_leads_score
        CHECK (lead_score >= 0 AND lead_score <= 100),

    CONSTRAINT chk_leads_language
        CHECK (language IN ('en', 'ar'))
);

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE leads IS 'Core lead/prospect records from all capture forms';
COMMENT ON COLUMN leads.form_data IS 'JSONB for form-specific fields (ROI inputs, etc.)';

-- ============================================================
-- TABLE: lead_services (Junction Table)
-- ============================================================
CREATE TABLE lead_services (
    id SERIAL PRIMARY KEY,
    lead_id UUID NOT NULL,
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

COMMENT ON TABLE lead_services IS 'Many-to-many: leads interested in multiple services';

-- ============================================================
-- TABLE: email_notifications
-- ============================================================
CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,

    -- Notification details
    notification_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100),

    -- Recipient
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),

    -- Content (for audit/debugging)
    subject VARCHAR(500),
    body_preview TEXT,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Delivery tracking
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,

    -- Error handling
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- External references
    external_message_id VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_email_notifications_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_email_notifications_status
        CHECK (status IN ('pending', 'queued', 'sending', 'sent', 'delivered',
                          'opened', 'clicked', 'failed', 'bounced')),

    CONSTRAINT chk_email_notifications_type
        CHECK (notification_type IN ('admin_alert', 'lead_confirmation',
                                     'follow_up', 'quote_sent'))
);

CREATE TRIGGER trg_email_notifications_updated_at
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_notifications IS 'Email delivery tracking for lead notifications';

-- ============================================================
-- TABLE: lead_activities (Audit Log)
-- ============================================================
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,

    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,

    -- Who performed the action
    performed_by UUID,
    performed_by_type VARCHAR(20) NOT NULL DEFAULT 'system',

    -- Change tracking
    old_value JSONB,
    new_value JSONB,

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    -- Timestamp (immutable - no updated_at)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_lead_activities_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lead_activities_performed_by
        FOREIGN KEY (performed_by)
        REFERENCES admin_users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_lead_activities_type
        CHECK (activity_type IN (
            'created', 'status_changed', 'edited', 'note_added',
            'email_sent', 'email_opened', 'email_clicked',
            'qualified', 'disqualified', 'archived', 'restored',
            'exported', 'assigned'
        )),

    CONSTRAINT chk_lead_activities_performer_type
        CHECK (performed_by_type IN ('system', 'admin', 'api', 'cron'))
);

COMMENT ON TABLE lead_activities IS 'Immutable audit log of all lead-related activities';

-- ============================================================
-- TABLE: refresh_tokens
-- ============================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES admin_users(id)
        ON DELETE CASCADE
);

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for admin authentication';
```

### 2.4 Indexes

```sql
-- ============================================================
-- INDEXES
-- ============================================================

-- Dashboard: Recent leads list
CREATE INDEX idx_leads_created_at_desc
ON leads (created_at DESC)
WHERE is_archived = FALSE;

-- Dashboard: Filter by status
CREATE INDEX idx_leads_status_created
ON leads (status_id, created_at DESC)
WHERE is_archived = FALSE;

-- Dashboard: Filter by source
CREATE INDEX idx_leads_source_created
ON leads (source_id, created_at DESC)
WHERE is_archived = FALSE;

-- Search by email (duplicate detection)
CREATE INDEX idx_leads_email
ON leads (lower(contact_email));

-- Fuzzy search by company name
CREATE INDEX idx_leads_company_trgm
ON leads USING gin (company_name gin_trgm_ops);

-- Email notifications queue (for worker)
CREATE INDEX idx_email_notifications_pending
ON email_notifications (next_retry_at)
WHERE status IN ('pending', 'queued') AND retry_count < max_retries;

-- Email notifications by lead
CREATE INDEX idx_email_notifications_lead
ON email_notifications (lead_id, created_at DESC);

-- Lead activities timeline
CREATE INDEX idx_lead_activities_lead_created
ON lead_activities (lead_id, created_at DESC);

-- Lead services lookup
CREATE INDEX idx_lead_services_lead ON lead_services (lead_id);
CREATE INDEX idx_lead_services_service ON lead_services (service_id);

-- Date range reporting
CREATE INDEX idx_leads_created_at ON leads (created_at);

-- Refresh tokens lookup
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;
```

### 2.5 Seed Data

```sql
-- ============================================================
-- SEED DATA
-- ============================================================

-- Lead Sources
INSERT INTO lead_sources (code, name, description, form_endpoint) VALUES
('contact', 'Contact Form', 'General inquiry form on contact page', '/api/v1/leads/contact'),
('pricing_quote', 'Pricing Quote', 'Pricing page quote request form', '/api/v1/leads/pricing-quote'),
('roi_calculator', 'ROI Calculator', 'ROI calculator lead capture form', '/api/v1/leads/roi-calculator');

-- Lead Statuses
INSERT INTO lead_statuses (code, name, description, color, is_terminal, sort_order) VALUES
('new', 'New', 'Newly submitted lead, not yet reviewed', '#3B82F6', FALSE, 1),
('contacted', 'Contacted', 'Initial outreach made', '#8B5CF6', FALSE, 2),
('qualified', 'Qualified', 'Lead meets qualification criteria', '#10B981', FALSE, 3),
('proposal', 'Proposal Sent', 'Proposal/quote has been sent', '#F59E0B', FALSE, 4),
('negotiation', 'Negotiation', 'In active negotiation', '#EC4899', FALSE, 5),
('won', 'Won', 'Deal closed successfully', '#059669', TRUE, 6),
('lost', 'Lost', 'Deal lost or lead disqualified', '#EF4444', TRUE, 7),
('nurture', 'Nurture', 'Not ready now, follow up later', '#6B7280', FALSE, 8);

-- Industries
INSERT INTO industries (code, name_en, name_ar, sort_order) VALUES
('healthcare', 'Healthcare', 'الرعاية الصحية', 1),
('finance', 'Finance & Banking', 'المالية والمصارف', 2),
('retail', 'Retail & E-commerce', 'التجزئة والتجارة الإلكترونية', 3),
('manufacturing', 'Manufacturing', 'التصنيع', 4),
('real_estate', 'Real Estate', 'العقارات', 5),
('education', 'Education', 'التعليم', 6),
('government', 'Government', 'الحكومة', 7),
('technology', 'Technology', 'التكنولوجيا', 8),
('energy', 'Energy & Utilities', 'الطاقة والمرافق', 9),
('other', 'Other', 'أخرى', 100);

-- Services (matching your frontend)
INSERT INTO services (code, name_en, name_ar, category, sort_order) VALUES
('cloud', 'Cloud Solutions', 'الحلول السحابية', 'infrastructure', 1),
('security', 'Cybersecurity', 'الأمن السيبراني', 'security', 2),
('email', 'Email & Collaboration', 'البريد الإلكتروني والتعاون', 'productivity', 3),
('managed', 'Managed IT Services', 'خدمات تقنية المعلومات المُدارة', 'managed', 4),
('backup', 'Backup & Recovery', 'النسخ الاحتياطي والاسترداد', 'infrastructure', 5),
('sap', 'SAP Solutions', 'حلول SAP', 'enterprise', 6),
('consulting', 'IT Consulting', 'استشارات تقنية المعلومات', 'consulting', 7),
('devops', 'DevOps Services', 'خدمات DevOps', 'development', 8),
('ai', 'AI Solutions', 'حلول الذكاء الاصطناعي', 'ai', 9);

-- Create initial admin user (password: AdminPassword123!)
-- IMPORTANT: Change this password immediately after deployment!
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@roaya.co', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VYx.IqXki', 'Admin User', 'admin');
```

---

## 3. API Specification

### 3.1 Base URL
```
Production:  https://api.roaya.co/api/v1
Development: http://localhost:3000/api/v1
```

### 3.2 Response Format (Standard Envelope)

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-21T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Invalid email" }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-01-21T10:30:00Z"
  }
}
```

### 3.3 Public Endpoints (No Auth Required)

#### POST /api/v1/leads/contact
Submit contact form.

**Request:**
```typescript
{
  name: string;           // Required, 2-100 chars
  email: string;          // Required, valid email
  phone?: string;         // Optional, E.164 format
  company?: string;       // Optional, max 200 chars
  service?: string;       // Optional
  message: string;        // Required, 10-2000 chars
  language: 'en' | 'ar';  // Required
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "leadId": "lead_xk9j2m3n4p5q",
    "createdAt": "2026-01-21T10:30:00Z",
    "estimatedResponse": "24-48 hours"
  }
}
```

#### POST /api/v1/leads/pricing-quote
Submit pricing quote request.

**Request:**
```typescript
{
  companyName: string;    // Required
  industry?: string;      // Optional
  email: string;          // Required
  phone?: string;         // Optional
  employees?: string;     // Optional: '1-50', '51-200', '201-500', '500+'
  services: string[];     // Required, array of service codes
  requirements?: string;  // Optional
  language: 'en' | 'ar';
  utmParams?: UTMParams;
}
```

#### POST /api/v1/leads/roi-calculator
Submit ROI calculator lead.

**Request:**
```typescript
{
  calculatorType: 'cloud' | 'security' | 'email';
  inputs: {
    currentSpend?: number;
    employees?: number;
    // ... calculator-specific fields
  };
  results: {
    estimatedSavings: number;
    roi: number;
    paybackPeriod: number;
  };
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  language: 'en' | 'ar';
  utmParams?: UTMParams;
}
```

### 3.4 Admin Endpoints (Auth Required)

#### POST /api/v1/auth/login
Admin login.

**Request:**
```json
{
  "email": "admin@roaya.co",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 900,
    "user": {
      "id": "usr_123",
      "email": "admin@roaya.co",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token.

#### GET /api/v1/admin/leads
List all leads with filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (new, contacted, qualified, converted, rejected)
- `source` (contact, pricing_quote, roi_calculator)
- `dateFrom` (ISO 8601)
- `dateTo` (ISO 8601)
- `search` (searches name, email, company)
- `sortBy` (createdAt, updatedAt, name, company)
- `sortOrder` (asc, desc)

#### GET /api/v1/admin/leads/:id
Get single lead details with activity history.

#### PATCH /api/v1/admin/leads/:id
Update lead status, assignment, notes.

**Request:**
```json
{
  "status": "contacted",
  "assignedTo": "usr_456",
  "notes": "Called customer, will follow up Friday"
}
```

#### POST /api/v1/admin/leads/export
Export leads to CSV/Excel.

**Request:**
```json
{
  "format": "csv",
  "filters": {
    "status": "qualified",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-01-31"
  }
}
```

#### GET /api/v1/admin/dashboard/stats
Dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 450,
    "newLeads": 35,
    "qualifiedLeads": 120,
    "convertedLeads": 85,
    "conversionRate": 18.9,
    "leadsBySource": {
      "contact": 200,
      "pricing_quote": 150,
      "roi_calculator": 100
    },
    "leadsByStatus": {
      "new": 35,
      "contacted": 180,
      "qualified": 120,
      "converted": 85,
      "rejected": 30
    },
    "monthlyTrend": [
      { "month": "2025-11", "count": 85 },
      { "month": "2025-12", "count": 120 },
      { "month": "2026-01", "count": 150 }
    ]
  }
}
```

---

## 4. Email Service

### 4.1 Email Provider: SendGrid

**Why SendGrid:**
- 100 free emails/day (sufficient for MVP)
- Excellent deliverability
- Built-in template engine
- Open/click tracking
- Easy API integration

### 4.2 Email Templates

#### Template 1: Admin Notification (New Lead)

**Subject:** `[NEW LEAD] {{ company_name }} via {{ source_name }}`

**Body:**
```html
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
              color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">New Lead: {{ source_name }}</h1>
    <p style="margin: 5px 0 0 0;">Submitted on {{ created_at | date }}</p>
  </div>

  <div style="padding: 20px; background: white; border: 1px solid #e5e7eb;">
    <table style="width: 100%;">
      <tr>
        <td style="padding: 8px 0;"><strong>Name:</strong></td>
        <td>{{ contact_name }}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Email:</strong></td>
        <td><a href="mailto:{{ email }}">{{ email }}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Phone:</strong></td>
        <td><a href="tel:{{ phone }}">{{ phone }}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Company:</strong></td>
        <td>{{ company_name }}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Services:</strong></td>
        <td>{{ services | join: ', ' }}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td>
        <td style="white-space: pre-wrap;">{{ message }}</td>
      </tr>
    </table>

    <div style="margin-top: 20px; text-align: center;">
      <a href="{{ admin_url }}/leads/{{ lead_id }}"
         style="display: inline-block; background: #3D5A80; color: white;
                padding: 12px 30px; border-radius: 6px; text-decoration: none;">
        View in Dashboard
      </a>
    </div>
  </div>
</div>
```

#### Template 2: Customer Confirmation

**Subject (EN):** `Thank you for contacting Roaya IT - We received your inquiry`
**Subject (AR):** `شكراً لتواصلك مع رؤية - تم استلام استفسارك`

**Body (EN):**
```html
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%);
              color: white; padding: 30px; text-align: center;">
    <img src="https://www.roaya.co/assets/logo-white.png" alt="Roaya IT"
         style="height: 40px; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 24px;">Thank You for Reaching Out!</h1>
  </div>

  <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
    <p>Dear {{ contact_name }},</p>

    <p>Thank you for contacting Roaya IT. We have received your inquiry and our
       team is reviewing your request.</p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #3D5A80;">What happens next?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Our sales team will contact you within <strong>24-48 business hours</strong></li>
        <li>We'll discuss your requirements and how Roaya can help</li>
        <li>You'll receive a personalized proposal if applicable</li>
      </ul>
    </div>

    <p>In the meantime, feel free to explore our services at
       <a href="https://www.roaya.co">www.roaya.co</a></p>

    <p>Best regards,<br><strong>The Roaya IT Team</strong></p>
  </div>

  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>Roaya IT Solutions<br>
       Block 3/67, Maadi Zahraa - 10th Sector, Cairo, Egypt<br>
       <a href="tel:+201234567890">+20 123 456 7890</a></p>
  </div>
</div>
```

**Body (AR):** (RTL version with Arabic text)

### 4.3 Email Queue Implementation

```typescript
// Using Bull for Redis-backed job queue
import Queue from 'bull';

const emailQueue = new Queue('email-queue', {
  redis: { host: process.env.REDIS_HOST, port: 6379 }
});

// Add email to queue
async function queueEmail(data: EmailPayload) {
  await emailQueue.add(data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false
  });
}

// Process queue
emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;
  await sendgrid.send({
    to,
    from: { email: 'noreply@roaya.co', name: 'Roaya IT' },
    subject,
    templateId: template,
    dynamicTemplateData: data
  });
});
```

---

## 5. Authentication

### 5.1 JWT-Based Authentication

**Access Token:** Short-lived (15 minutes)
**Refresh Token:** Long-lived (7 days), stored in database

### 5.2 Token Structure

```typescript
// Access Token Payload
{
  sub: string;        // User ID
  email: string;
  role: 'admin' | 'sales' | 'viewer';
  iat: number;        // Issued at
  exp: number;        // Expires at (15 min)
}

// Refresh Token Payload
{
  sub: string;        // User ID
  type: 'refresh';
  iat: number;
  exp: number;        // Expires at (7 days)
}
```

### 5.3 Password Security

- Hash with **bcrypt** (cost factor 12) or **Argon2**
- Minimum password: 12 characters, mixed case + numbers + symbols
- Rate limit: 5 failed attempts per IP per 15 minutes
- Account lockout after 10 failed attempts

---

## 6. Admin Dashboard

### 6.1 Information Architecture

```
Admin Dashboard (/admin)
│
├── Login (/admin/login)
│
├── Dashboard Home (/admin/dashboard)
│   ├── Summary Cards (Total, New, Qualified, Converted)
│   ├── Recent Leads Table
│   └── Quick Stats Chart
│
├── All Leads (/admin/leads)
│   ├── Filters (Source, Status, Date)
│   ├── Search
│   └── Leads Table (paginated)
│
├── Lead Detail (/admin/leads/:id)
│   ├── Contact Info
│   ├── Form Data
│   ├── Status Update
│   ├── Notes Section
│   └── Activity Timeline
│
└── Settings (/admin/settings) [Phase 2]
    ├── Change Password
    └── Notification Preferences
```

### 6.2 User Roles

| Role | View Leads | Edit Status | Add Notes | Export | Manage Users |
|------|------------|-------------|-----------|--------|--------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Sales** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 7. Security Measures

### 7.1 Input Validation (Zod)

```typescript
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  phone: z.string().regex(/^\+?[0-9\s\-()]{8,20}$/).optional(),
  company: z.string().max(200).optional(),
  message: z.string().min(10).max(2000).trim(),
  language: z.enum(['en', 'ar']),
  utmParams: z.object({
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional()
  }).optional()
});
```

### 7.2 Rate Limiting

```typescript
// General API: 100 requests/minute
// Form submissions: 5 per 15 minutes per IP
// Login attempts: 5 per 15 minutes per email+IP
```

### 7.3 Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));
```

### 7.4 CORS Configuration

```typescript
const corsOptions = {
  origin: ['https://www.roaya.co', 'https://roaya.co'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
};
```

### 7.5 SQL Injection Prevention

- Use Prisma ORM with parameterized queries
- Never concatenate user input into SQL
- Validate and sanitize all inputs

### 7.6 XSS Prevention

- Sanitize all user input before database storage
- Escape all output in admin dashboard
- Use Content-Security-Policy headers

---

## 8. Deployment Configuration

### 8.1 Server Requirements

**Minimum:**
- 2 vCPUs
- 4 GB RAM
- 50 GB SSD
- Ubuntu 22.04 LTS

**Recommended:**
- 4 vCPUs
- 8 GB RAM
- 100 GB SSD

### 8.2 Software Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

### 8.3 PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'roaya-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: { NODE_ENV: 'production' },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
```

### 8.4 Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.roaya.co;

    ssl_certificate /etc/letsencrypt/live/api.roaya.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.roaya.co/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # CORS
    add_header Access-Control-Allow-Origin "https://www.roaya.co" always;
    add_header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.roaya.co;
    return 301 https://$host$request_uri;
}
```

---

## 9. Environment Variables

### .env.production

```bash
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.roaya.co

# Frontend CORS
FRONTEND_URL=https://www.roaya.co

# Database
DATABASE_URL="postgresql://roaya_prod:STRONG_PASSWORD@localhost:5432/roaya_leads"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_64_char_access_secret_here
JWT_REFRESH_SECRET=your_64_char_refresh_secret_here

# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@roaya.co
SENDGRID_FROM_NAME=Roaya IT

# Admin notification email
ADMIN_NOTIFICATION_EMAIL=sales@roaya.co

# SendGrid Template IDs
TEMPLATE_ADMIN_NOTIFICATION=d-xxx
TEMPLATE_CUSTOMER_CONFIRMATION_EN=d-xxx
TEMPLATE_CUSTOMER_CONFIRMATION_AR=d-xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
FORM_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/roaya-api/app.log
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up Node.js/Express/TypeScript project
- [ ] Configure Prisma + PostgreSQL
- [ ] Create database schema and migrations
- [ ] Run seed data
- [ ] Implement lead submission endpoints (contact, pricing, ROI)
- [ ] Add input validation (Zod)
- [ ] Set up error handling

### Phase 2: Email Integration (Week 2)
- [ ] Configure SendGrid account
- [ ] Create email templates (admin notification, customer confirmation)
- [ ] Set up Bull queue with Redis
- [ ] Implement retry logic
- [ ] Test email delivery

### Phase 3: Authentication & Admin API (Week 3)
- [ ] Implement JWT authentication (login, refresh)
- [ ] Create admin user management
- [ ] Build admin API endpoints (list, detail, update, export)
- [ ] Add role-based access control
- [ ] Implement activity logging

### Phase 4: Security & Testing (Week 4)
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Set up security headers
- [ ] Add XSS/SQL injection protection
- [ ] Write unit and integration tests
- [ ] Perform security audit

### Phase 5: Deployment (Week 5)
- [ ] Set up PostgreSQL on server
- [ ] Set up Redis on server
- [ ] Configure Nginx
- [ ] Obtain SSL certificate
- [ ] Deploy backend with PM2
- [ ] Configure monitoring
- [ ] Set up database backups

### Phase 6: Frontend Integration (Week 6)
- [ ] Update Angular ApiService
- [ ] Test form submissions
- [ ] Build admin dashboard (if Angular)
- [ ] End-to-end testing
- [ ] UAT with sales team
- [ ] Go live

---

## Appendix A: Angular Frontend Updates

### Update ApiService

```typescript
// src/app/core/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LeadResponse {
  success: boolean;
  data: {
    leadId: string;
    createdAt: string;
    estimatedResponse: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // https://api.roaya.co/api/v1

  submitContactForm(data: ContactFormData): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(`${this.apiUrl}/leads/contact`, {
      ...data,
      source: 'contact_page',
      language: this.getCurrentLanguage(),
      utmParams: this.getUtmParams()
    });
  }

  submitPricingQuote(data: PricingQuoteData): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(`${this.apiUrl}/leads/pricing-quote`, {
      ...data,
      source: 'pricing_page',
      language: this.getCurrentLanguage(),
      utmParams: this.getUtmParams()
    });
  }

  submitROICalculator(data: ROICalculatorData): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(`${this.apiUrl}/leads/roi-calculator`, {
      ...data,
      source: 'roi_calculator',
      language: this.getCurrentLanguage(),
      utmParams: this.getUtmParams()
    });
  }

  private getCurrentLanguage(): 'en' | 'ar' {
    return localStorage.getItem('language') as 'en' | 'ar' || 'en';
  }

  private getUtmParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || ''
    };
  }
}
```

### Update Environment

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.roaya.co/api/v1'
};
```

---

## Appendix B: Open Questions (Need User Input)

1. **Admin Email:** What email address should receive new lead notifications?
   - Single email or multiple recipients?

2. **Initial Admin Password:** How should the initial admin password be communicated securely?

3. **Data Retention:** How long should leads be kept in the database?
   - Indefinitely?
   - Archive after X years?

4. **Business Hours:** Does "24-48 hour response" mean business hours only?
   - What timezone? (Egypt time?)

5. **Email Branding:** Should confirmation emails include Roaya logo?
   - Link to logo asset?

---

## 11. Future Phase: User Analytics System (Hotjar-like)

> **Status:** Future Enhancement (After Lead Management MVP)
> **Priority:** High
> **Estimated Timeline:** 8-12 weeks

### 11.1 Overview

Build an in-house user behavior analytics platform similar to Hotjar, providing:
- **Session Recordings** - Record and replay user sessions
- **Heatmaps** - Click, scroll, and movement heatmaps
- **User Journey Tracking** - Funnel analysis and conversion paths
- **Form Analytics** - Field-level form interaction analysis
- **Feedback Widgets** - On-site surveys and feedback collection

### 11.2 Why Build In-House vs. Using Hotjar?

| Factor | Hotjar/3rd Party | In-House Solution |
|--------|------------------|-------------------|
| **Data Ownership** | Data on external servers | Full control, Egypt-hosted |
| **Privacy/GDPR** | Depends on vendor | Complete control |
| **Cost** | $99-389+/month | One-time development |
| **Customization** | Limited | Fully customizable |
| **Integration** | API limitations | Deep integration with lead system |
| **Arabic RTL Support** | Limited | Full native support |

### 11.3 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (www.roaya.co)                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Analytics Tracking Script                       ││
│  │  - Mouse movements & clicks                                  ││
│  │  - Scroll depth                                              ││
│  │  - DOM snapshots                                             ││
│  │  - Form interactions                                         ││
│  │  - Page navigation                                           ││
│  │  - Session metadata                                          ││
│  └──────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────────┘
                              │ WebSocket / Batched HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS INGESTION API                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Event Stream   │  │  Session Mgmt   │  │  Data Compress  │ │
│  │  Processor      │  │  Service        │  │  & Storage      │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│   Apache Kafka    │  │    PostgreSQL     │  │  ClickHouse /     │
│   (Event Stream)  │  │  (Session Meta)   │  │  TimescaleDB      │
│                   │  │                   │  │  (Time-series)    │
└─────────┬─────────┘  └───────────────────┘  └─────────┬─────────┘
          │                                             │
          └─────────────────────┬───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS PROCESSING                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Heatmap        │  │  Session        │  │  Funnel         │ │
│  │  Generator      │  │  Replay Builder │  │  Analyzer       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS DASHBOARD                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  - Session Replay Player                                     ││
│  │  - Heatmap Visualizations (Click, Scroll, Movement)          ││
│  │  - User Journey Flows (Sankey diagrams)                      ││
│  │  - Conversion Funnels                                        ││
│  │  - Form Analytics                                            ││
│  │  - Real-time Visitors                                        ││
│  │  - Segmentation & Filtering                                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Core Features

#### Feature 1: Session Recording & Replay

**Data Captured:**
- DOM mutations (incremental snapshots using rrweb)
- Mouse position (sampled at 30fps)
- Clicks with element identification
- Scroll position
- Form input changes (masked for sensitive fields)
- Page URL changes
- Viewport resize
- Console errors

**Storage Strategy:**
```
Per Session (avg 5 min):
- DOM snapshots: ~200KB compressed
- Mouse data: ~50KB
- Events: ~30KB
- Total: ~300KB per session
- 1000 sessions/day = ~300MB/day = ~9GB/month
```

**Database Schema:**
```sql
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL,

    -- Session info
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Device info
    device_type VARCHAR(20),  -- desktop, tablet, mobile
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_width INTEGER,
    screen_height INTEGER,

    -- Location
    country VARCHAR(2),
    city VARCHAR(100),

    -- Behavior summary
    pages_viewed INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    scroll_depth_max INTEGER DEFAULT 0,
    rage_clicks INTEGER DEFAULT 0,
    u_turns INTEGER DEFAULT 0,

    -- Entry/exit
    entry_url TEXT,
    exit_url TEXT,
    referrer TEXT,

    -- UTM
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Lead connection
    lead_id UUID REFERENCES leads(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES analytics_sessions(id),

    event_type VARCHAR(50) NOT NULL,  -- click, scroll, mutation, input, etc.
    timestamp_ms BIGINT NOT NULL,

    -- Event data (compressed JSON)
    data JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2026_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

#### Feature 2: Heatmaps

**Types:**
1. **Click Heatmap** - Where users click
2. **Scroll Heatmap** - How far users scroll (depth visualization)
3. **Movement Heatmap** - Mouse movement patterns (attention areas)
4. **Attention Heatmap** - Combined time spent + movement

**Generation Process:**
```typescript
interface HeatmapConfig {
  pageUrl: string;
  dateRange: { from: Date; to: Date };
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  type: 'click' | 'scroll' | 'movement' | 'attention';
}

// Aggregate click data
async function generateClickHeatmap(config: HeatmapConfig): Promise<HeatmapData> {
  const clicks = await db.query(`
    SELECT
      e.data->>'x' as x,
      e.data->>'y' as y,
      e.data->>'selector' as element,
      COUNT(*) as count
    FROM analytics_events e
    JOIN analytics_sessions s ON e.session_id = s.id
    WHERE e.event_type = 'click'
      AND s.entry_url LIKE $1
      AND e.created_at BETWEEN $2 AND $3
      ${config.deviceType ? 'AND s.device_type = $4' : ''}
    GROUP BY x, y, element
  `, [config.pageUrl + '%', config.dateRange.from, config.dateRange.to, config.deviceType]);

  return normalizeHeatmapData(clicks);
}
```

#### Feature 3: User Journey / Funnel Analysis

**Funnel Definition:**
```typescript
interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
}

interface FunnelStep {
  name: string;
  condition: {
    type: 'pageview' | 'click' | 'event';
    url?: string;      // For pageview
    selector?: string; // For click
    eventName?: string; // For custom event
  };
}

// Example: Contact Form Funnel
const contactFunnel: Funnel = {
  id: 'contact-form',
  name: 'Contact Form Conversion',
  steps: [
    { name: 'Visit Contact Page', condition: { type: 'pageview', url: '/contact' } },
    { name: 'Start Form', condition: { type: 'click', selector: '#contact-form input' } },
    { name: 'Fill Email', condition: { type: 'event', eventName: 'form_field_email' } },
    { name: 'Submit Form', condition: { type: 'click', selector: '#contact-form button[type=submit]' } },
    { name: 'Success', condition: { type: 'pageview', url: '/contact/success' } }
  ]
};
```

**Visualization:** Sankey diagram showing user flow between pages with drop-off rates.

#### Feature 4: Form Analytics

**Tracked Metrics:**
- Time to first interaction
- Field completion rate
- Field abandonment rate
- Error rate per field
- Average time per field
- Field refill rate (corrections)
- Drop-off point

**Schema:**
```sql
CREATE TABLE analytics_form_interactions (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    form_id VARCHAR(100) NOT NULL,

    field_name VARCHAR(100) NOT NULL,
    interaction_type VARCHAR(20) NOT NULL,  -- focus, blur, input, error

    timestamp_ms BIGINT NOT NULL,
    time_spent_ms INTEGER,
    had_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 11.5 Frontend Tracking Script

**Lightweight Script (~15KB gzipped):**
```typescript
// roaya-analytics.js
(function() {
  const config = {
    apiEndpoint: 'https://analytics.roaya.co/api/v1',
    sampleRate: 1.0,  // 100% of sessions
    mouseSampleRate: 30,  // 30 fps
    batchInterval: 5000,  // Send every 5 seconds
    maskInputs: true,
    maskSelectors: ['[data-sensitive]', 'input[type=password]']
  };

  class RoayaAnalytics {
    private sessionId: string;
    private visitorId: string;
    private eventBuffer: AnalyticsEvent[] = [];
    private rrwebRecorder: any;

    init() {
      this.visitorId = this.getOrCreateVisitorId();
      this.sessionId = this.createSession();
      this.startRecording();
      this.bindEventListeners();
      this.startBatchSender();
    }

    private startRecording() {
      // Using rrweb for DOM recording
      this.rrwebRecorder = rrweb.record({
        emit: (event) => this.bufferEvent('dom', event),
        maskInputOptions: {
          password: true,
          text: config.maskInputs
        },
        maskTextSelector: config.maskSelectors.join(',')
      });
    }

    private bindEventListeners() {
      // Click tracking
      document.addEventListener('click', (e) => {
        this.bufferEvent('click', {
          x: e.clientX,
          y: e.clientY,
          selector: this.getSelector(e.target),
          text: (e.target as HTMLElement).innerText?.slice(0, 50)
        });
      });

      // Scroll tracking (debounced)
      let scrollTimeout: any;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.bufferEvent('scroll', {
            y: window.scrollY,
            depth: this.calculateScrollDepth()
          });
        }, 100);
      });

      // Form interaction tracking
      document.querySelectorAll('form').forEach(form => {
        form.querySelectorAll('input, textarea, select').forEach(field => {
          field.addEventListener('focus', () => this.trackFormField(form, field, 'focus'));
          field.addEventListener('blur', () => this.trackFormField(form, field, 'blur'));
        });
      });
    }

    private bufferEvent(type: string, data: any) {
      this.eventBuffer.push({
        type,
        timestamp: Date.now(),
        data
      });
    }

    private async sendBatch() {
      if (this.eventBuffer.length === 0) return;

      const batch = this.eventBuffer.splice(0, this.eventBuffer.length);

      await fetch(`${config.apiEndpoint}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          events: batch
        }),
        keepalive: true  // Ensure data sent even on page unload
      });
    }
  }

  // Initialize
  window.roayaAnalytics = new RoayaAnalytics();
  window.roayaAnalytics.init();
})();
```

### 11.6 Privacy & Compliance

**GDPR/Privacy Requirements:**
- Explicit consent banner before tracking starts
- Automatic PII masking (emails, phone numbers, names)
- Password fields never recorded
- Custom masking selectors for sensitive areas
- Data retention policy (auto-delete after 90 days)
- User opt-out mechanism
- Data export on request

**Consent Flow:**
```typescript
// Check consent before initializing
if (hasAnalyticsConsent()) {
  loadAnalyticsScript();
} else {
  showConsentBanner({
    onAccept: () => {
      setAnalyticsConsent(true);
      loadAnalyticsScript();
    },
    onReject: () => {
      setAnalyticsConsent(false);
    }
  });
}
```

### 11.7 Database Requirements

| Data Type | Storage/Month | Retention | Database |
|-----------|---------------|-----------|----------|
| Sessions | ~500MB | 12 months | PostgreSQL |
| DOM Events | ~8GB | 90 days | TimescaleDB |
| Click/Scroll | ~1GB | 12 months | TimescaleDB |
| Heatmaps (pre-computed) | ~200MB | 12 months | PostgreSQL |
| Form Analytics | ~100MB | 12 months | PostgreSQL |

**Total estimated storage:** ~10GB/month

### 11.8 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend Script** | TypeScript + rrweb | DOM recording, event capture |
| **Ingestion API** | Node.js + Fastify | High-throughput event ingestion |
| **Event Stream** | Apache Kafka or Redis Streams | Real-time event processing |
| **Time-series DB** | TimescaleDB or ClickHouse | Event storage, fast aggregations |
| **Metadata DB** | PostgreSQL | Sessions, visitors, funnels |
| **Object Storage** | MinIO or S3 | DOM snapshots, large recordings |
| **Session Replay** | rrweb-player | Client-side replay rendering |
| **Heatmap Rendering** | h337.js (heatmap.js) | Canvas-based heatmap visualization |
| **Dashboard** | Angular + D3.js | Analytics dashboard UI |

### 11.9 Implementation Phases

#### Phase 1: Core Tracking (Weeks 1-3)
- [ ] Develop lightweight tracking script
- [ ] Set up event ingestion API
- [ ] Configure TimescaleDB for event storage
- [ ] Implement session management
- [ ] Basic click and scroll tracking
- [ ] Privacy consent implementation

#### Phase 2: Session Recording (Weeks 4-6)
- [ ] Integrate rrweb for DOM recording
- [ ] Build session replay player
- [ ] Implement PII masking
- [ ] Add session search and filtering
- [ ] Connect sessions to leads

#### Phase 3: Heatmaps (Weeks 7-8)
- [ ] Click heatmap generation
- [ ] Scroll depth visualization
- [ ] Movement heatmap (attention)
- [ ] Device-specific heatmaps
- [ ] Heatmap caching and pre-computation

#### Phase 4: Funnels & Journeys (Weeks 9-10)
- [ ] Funnel definition UI
- [ ] Funnel analysis engine
- [ ] User journey visualization (Sankey)
- [ ] Conversion tracking
- [ ] Drop-off analysis

#### Phase 5: Form Analytics (Weeks 11-12)
- [ ] Field-level tracking
- [ ] Form analytics dashboard
- [ ] Error tracking
- [ ] Abandonment analysis
- [ ] A/B testing integration (future)

### 11.10 Integration with Lead Management

**Key Integration Points:**
1. **Session → Lead Linking:** When a visitor submits a form, link their session history to the lead record
2. **Lead Behavior Analysis:** View all session recordings for a specific lead
3. **Conversion Attribution:** Track which pages/interactions led to form submission
4. **Sales Insights:** Sales team can watch session replay before contacting leads

**Example Query:**
```sql
-- Get all sessions for a lead before conversion
SELECT
    s.id,
    s.start_time,
    s.duration_seconds,
    s.pages_viewed,
    s.entry_url,
    s.referrer
FROM analytics_sessions s
WHERE s.visitor_id = (
    SELECT visitor_id FROM analytics_sessions
    WHERE lead_id = 'lead_xxx'
    ORDER BY created_at DESC LIMIT 1
)
AND s.created_at < (
    SELECT created_at FROM leads WHERE id = 'lead_xxx'
)
ORDER BY s.start_time;
```

### 11.11 Estimated Costs

| Item | Monthly Cost |
|------|--------------|
| TimescaleDB (self-hosted) | Server cost only |
| Additional storage (100GB) | ~$10 |
| Kafka/Redis Streams | Server cost only |
| CDN for tracking script | ~$5 |
| **Total additional** | **~$15/month** |

**vs. Hotjar Business:** $99-389/month

### 11.12 Success Metrics

| Metric | Target |
|--------|--------|
| Script load time | < 50ms |
| Script size | < 20KB gzipped |
| Event latency | < 100ms |
| Session replay accuracy | > 99% |
| Heatmap generation time | < 5 seconds |
| Dashboard load time | < 2 seconds |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | Claude Code | Initial comprehensive plan |

---

*This document was generated by Product Orchestrator, Database Engineer, and Backend Engineer agents working collaboratively.*
