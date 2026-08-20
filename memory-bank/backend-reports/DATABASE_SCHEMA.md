# Roaya Lead Management System - Database Schema Documentation

## Overview

This document describes the complete database schema for the Roaya Lead Management System. The system captures leads from three website forms (Contact, Pricing Quote, ROI Calculator), stores them in PostgreSQL, and provides an admin dashboard for lead management.

**Database:** PostgreSQL 16+
**ORM:** Prisma 5+
**Domain:** www.roaya.co / api.roaya.co

---

## Entity Relationship Diagram

```
                                    LOOKUP TABLES
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   lead_sources   │  │  lead_statuses   │  │    industries    │
    ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
    │ id (PK)          │  │ id (PK)          │  │ id (PK)          │
    │ code (UNIQUE)    │  │ code (UNIQUE)    │  │ code (UNIQUE)    │
    │ name             │  │ name             │  │ name_en          │
    │ description      │  │ color            │  │ name_ar          │
    │ form_endpoint    │  │ is_terminal      │  │ parent_id (FK)───┐
    │ is_active        │  │ is_active        │  │ sort_order       │ │ Self-ref
    └────────┬─────────┘  │ sort_order       │  │ is_active        │◄┘
             │            └────────┬─────────┘  └────────┬─────────┘
             │                     │                     │
             │ 1:N                 │ 1:N                 │ 1:N
             │                     │                     │
             ▼                     ▼                     ▼
    ┌────────────────────────────────────────────────────────────────┐
    │                           leads                                 │
    ├────────────────────────────────────────────────────────────────┤
    │ id (UUID PK)          │ lead_score         │ utm_source        │
    │ source_id (FK)        │ priority           │ utm_medium        │
    │ status_id (FK)        │ is_qualified       │ utm_campaign      │
    │ industry_id (FK)      │ internal_notes     │ utm_term          │
    │ assigned_to (FK)      │ last_contacted_at  │ utm_content       │
    │ company_name          │ is_archived        │                   │
    │ contact_name          │ archived_at        │ created_at        │
    │ contact_email         │ archived_by (FK)   │ updated_at        │
    │ contact_phone         │ form_data (JSONB)  │                   │
    │ employee_count        │ language           │                   │
    │ annual_revenue        │ ip_address         │                   │
    │ requirements          │ user_agent         │                   │
    │ budget_range          │ referrer_url       │                   │
    │ timeline              │                    │                   │
    └────────┬──────────────┴─────────┬──────────┴─────────┬─────────┘
             │                        │                    │
             │ 1:N                    │ 1:N                │ N:N
             ▼                        ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │ email_notif      │  │ lead_activities  │  │  lead_services   │
    ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
    │ id (UUID PK)     │  │ id (UUID PK)     │  │ id (PK)          │
    │ lead_id (FK)     │  │ lead_id (FK)     │  │ lead_id (FK)     │
    │ notification_type│  │ activity_type    │  │ service_id (FK)──┼───┐
    │ template_name    │  │ description      │  │ is_primary       │   │
    │ recipient_email  │  │ performed_by(FK) │  └──────────────────┘   │
    │ status           │  │ old_value (JSON) │                         │
    │ sent_at          │  │ new_value (JSON) │                         │
    │ delivered_at     │  │ ip_address       │                         │
    │ opened_at        │  │ created_at       │                         │
    │ error_message    │  └──────────────────┘                         │
    │ retry_count      │                                               │
    └──────────────────┘                              ┌────────────────┘
                                                      │ N:1
                         AUTHENTICATION               ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   admin_users    │  │ refresh_tokens   │  │    services      │
    ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
    │ id (UUID PK)     │◄─┤ user_id (FK)     │  │ id (PK)          │
    │ email (UNIQUE)   │  │ token_hash       │  │ code (UNIQUE)    │
    │ password_hash    │  │ expires_at       │  │ name_en          │
    │ name             │  │ revoked_at       │  │ name_ar          │
    │ role (ENUM)      │  │ device_info      │  │ description_en   │
    │ is_active        │  │ ip_address       │  │ description_ar   │
    │ failed_login_att │  └──────────────────┘  │ category         │
    │ locked_until     │                        │ sort_order       │
    │ last_login_at    │                        │ is_active        │
    │ deleted_at       │                        └──────────────────┘
    └──────────────────┘
```

---

## Tables Reference

### Lookup Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `lead_sources` | Form types (contact, pricing, ROI) | 3 |
| `lead_statuses` | Pipeline stages (new, contacted, won, lost) | 8 |
| `industries` | Industry categories with bilingual names | 13 |
| `services` | IT services offered by Roaya | 11 |

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `leads` | Main lead records | UUID PK, JSONB form_data, soft delete |
| `lead_services` | Lead-service junction | N:N relationship, is_primary flag |
| `email_notifications` | Email tracking | Delivery status, retry logic |
| `lead_activities` | Audit log | Immutable, JSON change tracking |

### Authentication Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `admin_users` | Dashboard users | Role-based access, soft delete |
| `refresh_tokens` | JWT refresh tokens | Token rotation, device tracking |

---

## Enums

### AdminRole
```sql
'admin'    -- Full access to all features
'manager'  -- Manage leads and users (no system settings)
'sales'    -- View, edit, add notes, export leads
'viewer'   -- Read-only access
```

### LeadPriority
```sql
'low'      -- Low priority lead
'medium'   -- Default priority
'high'     -- High priority, needs attention
'urgent'   -- Urgent, immediate action required
```

### LeadStatus (via lead_statuses table)
```sql
'new'         -- #3B82F6 (Blue)      - Not yet reviewed
'contacted'   -- #8B5CF6 (Purple)    - Initial outreach made
'qualified'   -- #10B981 (Green)     - Meets BANT criteria
'proposal'    -- #F59E0B (Amber)     - Proposal sent
'negotiation' -- #EC4899 (Pink)      - Active negotiation
'won'         -- #059669 (Dark Green)- Deal closed (terminal)
'lost'        -- #EF4444 (Red)       - Deal lost (terminal)
'nurture'     -- #6B7280 (Gray)      - Follow up later
```

### NotificationType
```sql
'admin_alert'       -- New lead notification to sales team
'lead_confirmation' -- Confirmation email to customer
'follow_up'         -- Follow-up reminder
'quote_sent'        -- Quote/proposal sent notification
```

### EmailStatus
```sql
'pending'   -- Not yet processed
'queued'    -- Added to email queue
'sending'   -- Currently being sent
'sent'      -- Sent to email provider
'delivered' -- Confirmed delivered
'opened'    -- Email opened (tracking pixel)
'clicked'   -- Link clicked
'failed'    -- Sending failed
'bounced'   -- Email bounced
```

### ActivityType
```sql
'created'        -- Lead created
'status_changed' -- Status updated
'edited'         -- Lead details edited
'note_added'     -- Internal note added
'email_sent'     -- Email sent to lead
'email_opened'   -- Lead opened email
'email_clicked'  -- Lead clicked email link
'qualified'      -- Lead marked as qualified
'disqualified'   -- Lead marked as not qualified
'archived'       -- Lead archived
'restored'       -- Lead restored from archive
'exported'       -- Lead data exported
'assigned'       -- Lead assigned to user
```

---

## Indexes

### Performance Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_leads_created_at_desc` | leads | created_at DESC | Recent leads dashboard |
| `idx_leads_status_created` | leads | status_id, created_at | Filter by status |
| `idx_leads_source_created` | leads | source_id, created_at | Filter by source |
| `idx_leads_assigned_to` | leads | assigned_to, is_archived | Sales rep dashboard |
| `idx_leads_email` | leads | lower(contact_email) | Duplicate detection |
| `idx_leads_company_trgm` | leads | company_name (GIN) | Fuzzy company search |
| `idx_email_notifications_pending` | email_notifications | next_retry_at | Email queue worker |

### Partial Indexes

All dashboard indexes are partial (`WHERE is_archived = FALSE`) to exclude archived leads from common queries.

---

## Key Constraints

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| leads | source_id | lead_sources.id | RESTRICT |
| leads | status_id | lead_statuses.id | RESTRICT |
| leads | industry_id | industries.id | SET NULL |
| leads | assigned_to | admin_users.id | SET NULL |
| lead_services | lead_id | leads.id | CASCADE |
| lead_services | service_id | services.id | RESTRICT |
| email_notifications | lead_id | leads.id | CASCADE |
| lead_activities | lead_id | leads.id | CASCADE |
| refresh_tokens | user_id | admin_users.id | CASCADE |

### Check Constraints

| Table | Constraint | Rule |
|-------|------------|------|
| leads | chk_leads_email | Valid email format regex |
| leads | chk_leads_score | lead_score BETWEEN 0 AND 100 |
| leads | chk_leads_language | language IN ('en', 'ar') |
| lead_statuses | chk_lead_statuses_color | Valid hex color #RRGGBB |

---

## Common Query Patterns

### 1. Dashboard: Recent Leads (Paginated)

```sql
SELECT
    l.id, l.company_name, l.contact_email, l.contact_name,
    l.created_at, l.lead_score, l.priority,
    ls.name as source_name,
    lst.name as status_name, lst.color as status_color
FROM leads l
JOIN lead_sources ls ON l.source_id = ls.id
JOIN lead_statuses lst ON l.status_id = lst.id
WHERE l.is_archived = FALSE
ORDER BY l.created_at DESC
LIMIT 20 OFFSET 0;
```
**Index used:** `idx_leads_created_at_desc`

### 2. Filter by Status

```sql
SELECT l.*, lst.name as status_name
FROM leads l
JOIN lead_statuses lst ON l.status_id = lst.id
WHERE l.status_id = 1  -- 'new'
  AND l.is_archived = FALSE
ORDER BY l.created_at DESC;
```
**Index used:** `idx_leads_status_created`

### 3. Search by Company (Fuzzy)

```sql
SELECT l.*,
       similarity(l.company_name, 'Acme') as match_score
FROM leads l
WHERE l.company_name % 'Acme'  -- Trigram similarity
  AND l.is_archived = FALSE
ORDER BY match_score DESC
LIMIT 10;
```
**Index used:** `idx_leads_company_trgm`

### 4. Check for Duplicate Email

```sql
SELECT id, company_name, created_at
FROM leads
WHERE lower(contact_email) = lower('test@example.com')
ORDER BY created_at DESC
LIMIT 5;
```
**Index used:** `idx_leads_email`

### 5. Get Lead with Services

```sql
SELECT
    l.*,
    json_agg(
        json_build_object(
            'id', s.id,
            'code', s.code,
            'name', s.name_en,
            'isPrimary', ls.is_primary
        )
    ) as services
FROM leads l
LEFT JOIN lead_services ls ON l.id = ls.lead_id
LEFT JOIN services s ON ls.service_id = s.id
WHERE l.id = 'uuid-here'
GROUP BY l.id;
```

### 6. Activity Timeline

```sql
SELECT
    la.activity_type,
    la.description,
    la.created_at,
    la.old_value,
    la.new_value,
    au.name as performed_by_name,
    la.performed_by_type
FROM lead_activities la
LEFT JOIN admin_users au ON la.performed_by = au.id
WHERE la.lead_id = 'uuid-here'
ORDER BY la.created_at DESC;
```
**Index used:** `idx_lead_activities_lead_created`

### 7. Email Queue Worker

```sql
SELECT *
FROM email_notifications
WHERE status IN ('pending', 'queued')
  AND retry_count < max_retries
  AND (next_retry_at IS NULL OR next_retry_at <= NOW())
ORDER BY next_retry_at NULLS FIRST
LIMIT 10
FOR UPDATE SKIP LOCKED;
```
**Index used:** `idx_email_notifications_pending`

---

## JSONB Schema: form_data

The `form_data` column stores form-specific fields as JSONB. Here are the expected schemas:

### Contact Form
```json
{
  "message": "string (required)",
  "preferredContactMethod": "email | phone",
  "bestTimeToContact": "morning | afternoon | evening"
}
```

### Pricing Quote Form
```json
{
  "currentProvider": "string",
  "contractEndDate": "ISO date string",
  "urgency": "immediate | within_month | exploring",
  "additionalNotes": "string"
}
```

### ROI Calculator Form
```json
{
  "calculatorType": "cloud | security | email",
  "inputs": {
    "currentSpend": "number",
    "employees": "number",
    "hoursPerWeek": "number"
  },
  "results": {
    "estimatedSavings": "number",
    "roi": "number",
    "paybackPeriod": "number (months)"
  }
}
```

---

## Migration Files

| File | Purpose |
|------|---------|
| `000_rollback.sql` | Complete schema removal (development only) |
| `001_initial_schema.sql` | Create all tables, indexes, constraints |
| `002_seed_data.sql` | Populate lookup tables with initial data |
| `seed.ts` | Prisma TypeScript seed script |

### Running Migrations

```bash
# Using psql directly
psql -U postgres -d roaya_leads -f prisma/migrations/001_initial_schema.sql
psql -U postgres -d roaya_leads -f prisma/migrations/002_seed_data.sql

# Using Prisma
npx prisma migrate deploy
npx prisma db seed
```

---

## Security Considerations

### Password Storage
- Passwords hashed with bcrypt (cost factor 12)
- Never store plaintext passwords
- Refresh tokens stored as SHA256 hashes

### PII Handling
- Email validation at database level
- Soft delete preserves audit trail
- IP addresses stored for security audit
- GDPR: CASCADE delete removes all user data

### Access Control
- Role-based access via `admin_role` enum
- Application enforces user-lead ownership
- Audit log tracks all modifications

---

## Performance Notes

### Expected Scale

| Metric | Expected | Notes |
|--------|----------|-------|
| Leads per month | ~500 | Typical for B2B IT services |
| Active leads | ~2,000 | Non-archived leads |
| Total leads (2 years) | ~12,000 | Before archival |
| Emails per month | ~1,500 | 3 per lead average |
| Activities per lead | ~10 | Lifecycle events |

### Storage Estimates

| Table | Row Size | 10K rows |
|-------|----------|----------|
| leads | ~2 KB | ~20 MB |
| lead_activities | ~500 B | ~50 MB |
| email_notifications | ~1 KB | ~15 MB |
| Total estimated | - | ~100 MB |

### Index Recommendations

1. All partial indexes exclude archived leads
2. Trigram index for fuzzy search (pg_trgm extension)
3. Composite indexes match common WHERE + ORDER BY patterns
4. Email queue index supports `FOR UPDATE SKIP LOCKED`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-21 | Initial schema design |
