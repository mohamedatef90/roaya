# Roaya Backend — Full Reference Guide

> **Date:** 2026-01-28
> **Stack:** Express.js + TypeScript + Prisma ORM + PostgreSQL + Redis
> **Port:** 3001 (API at `http://localhost:3001/api/v1`)
> **Database:** PostgreSQL on port 5432, database name `roaya_leads`
> **Project Path:** `/Users/roaya/Roaya-files/Development/roaya/backend/`

---

## Table of Contents

1. [Database Tables (19 tables)](#1-database-tables)
2. [All API Endpoints (80+ routes)](#2-all-api-endpoints)
3. [How to Open & Use PostgreSQL](#3-how-to-open--use-postgresql)
4. [How to Deploy on Linux Production Server](#4-how-to-deploy-on-linux-production-server)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Seed Data & Default Credentials](#6-seed-data--default-credentials)

---

## 1. Database Tables

**Total: 19 tables + 8 enums**

### Enums

| Enum | Values |
|------|--------|
| `LeadStatus` | NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, ARCHIVED |
| `LeadSource` | CONTACT_FORM, PRICING_PAGE, ROI_CALCULATOR, NEWSLETTER, REFERRAL, LINKEDIN, GOOGLE_ADS, ORGANIC, OTHER |
| `LeadPriority` | LOW, MEDIUM, HIGH, URGENT |
| `UserRole` | SUPER_ADMIN, ADMIN, SALES_MANAGER, SALES_REP, VIEWER |
| `ActivityType` | NOTE, EMAIL_SENT, EMAIL_RECEIVED, CALL, MEETING, STATUS_CHANGE, ASSIGNMENT_CHANGE, FOLLOW_UP |
| `ContentType` | BLOG_POST, CASE_STUDY, WHITEPAPER |
| `ContentStatus` | DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED |
| `PackageType` | SUBSCRIPTION, ONE_TIME, CUSTOM |
| `LogoCategory` | CLIENT, PARTNER, TECHNOLOGY, CERTIFICATION |
| `EmailTemplateCategory` | TRANSACTIONAL, MARKETING, NOTIFICATION |
| `DocAccessLevel` | PUBLIC, INTERNAL, ADMIN |
| `NotificationStatus` | PENDING, SENT, FAILED, READ |

---

### Table 1: `admin_users` (AdminUser)

Admin panel users with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto-gen | Unique identifier |
| `email` | String | UNIQUE | Login email |
| `password_hash` | String | Required | Bcrypt hashed password |
| `first_name` | String | Required | First name |
| `last_name` | String | Required | Last name |
| `role` | UserRole | Default: VIEWER | Access level |
| `is_active` | Boolean | Default: true | Account status |
| `last_login_at` | DateTime | Nullable | Last successful login |
| `failed_login_attempts` | Int | Default: 0 | Failed login counter |
| `locked_until` | DateTime | Nullable | Account lockout expiry |
| `created_at` | DateTime | Auto | Creation timestamp |
| `updated_at` | DateTime | Auto | Last update timestamp |

**Relations:** assignedLeads (Lead[]), leadActivities (LeadActivity[]), refreshTokens (RefreshToken[]), userActivityLogs (UserActivityLog[])

---

### Table 2: `user_activity_logs` (UserActivityLog)

Tracks all admin user actions for audit purposes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `user_id` | UUID | FK → admin_users | Who performed the action |
| `action` | String | Required | Action type (LOGIN, LOGOUT, LEAD_UPDATE, etc.) |
| `details` | Json | Nullable | Extra action context |
| `ip_address` | String | Nullable | Client IP |
| `user_agent` | String | Nullable | Browser/client info |
| `created_at` | DateTime | Auto | When it happened |

**Indexes:** user_id, action, created_at

---

### Table 3: `leads` (Lead)

Main CRM table — stores all incoming leads from website forms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `first_name` | String | Required | Contact first name |
| `last_name` | String | Required | Contact last name |
| `email` | String | Required | Contact email |
| `phone` | String | Nullable | Phone number |
| `company` | String | Nullable | Company name |
| `job_title` | String | Nullable | Job title |
| `website` | String | Nullable | Company website |
| `source` | LeadSource | Required | Where they came from |
| `status` | LeadStatus | Default: NEW | Pipeline stage |
| `priority` | LeadPriority | Default: MEDIUM | Urgency level |
| `form_data` | Json | Nullable | Raw form submission data |
| `estimated_value` | Decimal(12,2) | Nullable | ROI calculator value |
| `message` | Text | Nullable | Contact form message |
| `utm_source` | String | Nullable | UTM tracking |
| `utm_medium` | String | Nullable | UTM tracking |
| `utm_campaign` | String | Nullable | UTM tracking |
| `ip_address` | String | Nullable | Submitter IP |
| `user_agent` | String | Nullable | Submitter browser |
| `referrer` | String | Nullable | Referring URL |
| `assigned_to_id` | UUID | FK → admin_users, Nullable | Assigned sales rep |
| `next_follow_up_at` | DateTime | Nullable | Next follow-up date |
| `created_at` | DateTime | Auto | Submission time |
| `updated_at` | DateTime | Auto | Last update |
| `converted_at` | DateTime | Nullable | When lead was won |

**Indexes:** email, status, source, assigned_to_id, created_at
**Relations:** activities (LeadActivity[]), tags (LeadTag[]), notes (LeadNote[]), notifications (Notification[])

---

### Table 4: `lead_activities` (LeadActivity)

Timeline of all actions taken on a lead.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `lead_id` | UUID | FK → leads | Which lead |
| `type` | ActivityType | Required | Activity category |
| `description` | Text | Required | What happened |
| `metadata` | Json | Nullable | Extra data |
| `performed_by_id` | UUID | FK → admin_users, Nullable | Who did it |
| `created_at` | DateTime | Auto | When it happened |

**Indexes:** lead_id, type, created_at

---

### Table 5: `lead_notes` (LeadNote)

Free-text notes on leads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `lead_id` | UUID | FK → leads | Which lead |
| `content` | Text | Required | Note content |
| `is_private` | Boolean | Default: false | Visibility flag |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last edit |

---

### Table 6: `tags` (Tag)

Tags for categorizing leads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | String | UNIQUE | Tag label |
| `color` | String | Default: #3B82F6 | Display color (hex) |
| `created_at` | DateTime | Auto | Creation time |

---

### Table 7: `lead_tags` (LeadTag)

Junction table: leads <-> tags (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `lead_id` | UUID | PK (composite), FK → leads | Lead reference |
| `tag_id` | UUID | PK (composite), FK → tags | Tag reference |
| `created_at` | DateTime | Auto | When tag was applied |

---

### Table 8: `notifications` (Notification)

Email/SMS notification queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `lead_id` | UUID | FK → leads, Nullable | Related lead |
| `type` | String | Required | Notification type |
| `subject` | String | Required | Email subject |
| `body` | Text | Required | Email body |
| `recipient` | String | Required | Recipient email/phone |
| `status` | NotificationStatus | Default: PENDING | Send status |
| `sent_at` | DateTime | Nullable | When sent |
| `error_msg` | String | Nullable | Error details if failed |
| `metadata` | Json | Nullable | Extra data |
| `created_at` | DateTime | Auto | Queue time |

**Indexes:** status, created_at

---

### Table 9: `refresh_tokens` (RefreshToken)

JWT refresh token storage with rotation support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `token` | String | UNIQUE | The refresh token |
| `user_id` | UUID | FK → admin_users | Token owner |
| `token_family` | UUID | Default: auto-gen | For token rotation detection |
| `used_at` | DateTime | Nullable | When token was used |
| `expires_at` | DateTime | Required | Expiry time |
| `created_at` | DateTime | Auto | Issue time |
| `revoked_at` | DateTime | Nullable | When revoked |

**Indexes:** user_id, expires_at, token_family

---

### Table 10: `email_templates` (EmailTemplate)

Bilingual email templates with variables.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | String | UNIQUE | Template identifier |
| `category` | EmailTemplateCategory | Default: TRANSACTIONAL | Category |
| `subject_en` | String | Required | English subject |
| `subject_ar` | String | Required | Arabic subject |
| `content_html_en` | Text | Required | English HTML body |
| `content_html_ar` | Text | Required | Arabic HTML body |
| `content_text_en` | Text | Nullable | English plaintext body |
| `content_text_ar` | Text | Nullable | Arabic plaintext body |
| `variables` | String[] | Default: [] | Template variables list |
| `is_active` | Boolean | Default: true | Active status |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** category, is_active

---

### Table 11: `system_settings` (SystemSetting)

Key-value store for application configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `key` | String | UNIQUE | Setting key |
| `value` | Json | Required | Setting value (any JSON) |
| `category` | String | Default: "general" | Grouping category |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** category

---

### Table 12: `content_items` (ContentItem)

Blog posts, case studies, whitepapers — bilingual content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `type` | ContentType | Required | BLOG_POST, CASE_STUDY, WHITEPAPER |
| `status` | ContentStatus | Default: DRAFT | Publish state |
| `title_en` | String | Required | English title |
| `title_ar` | String | Required | Arabic title |
| `slug_en` | String | UNIQUE | English URL slug |
| `slug_ar` | String | UNIQUE | Arabic URL slug |
| `excerpt_en` | Text | Nullable | English excerpt |
| `excerpt_ar` | Text | Nullable | Arabic excerpt |
| `content_en` | Text | Required | English full content |
| `content_ar` | Text | Required | Arabic full content |
| `featured_image` | String | Nullable | Image URL |
| `category` | String | Nullable | Content category |
| `tags` | String[] | Default: [] | Tag labels |
| `author_id` | String | Required | Author identifier |
| `meta_title_en` | String | Nullable | SEO title EN |
| `meta_title_ar` | String | Nullable | SEO title AR |
| `meta_desc_en` | Text | Nullable | SEO description EN |
| `meta_desc_ar` | Text | Nullable | SEO description AR |
| `view_count` | Int | Default: 0 | View counter |
| `published_at` | DateTime | Nullable | Publish timestamp |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** type, status, published_at

---

### Table 13: `service_packages` (ServicePackage)

Pricing packages with bilingual content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `is_active` | Boolean | Default: true | Active status |
| `order` | Int | Default: 0 | Display order |
| `name_en` | String | Required | English name |
| `name_ar` | String | Required | Arabic name |
| `description_en` | Text | Nullable | English description |
| `description_ar` | Text | Nullable | Arabic description |
| `type` | PackageType | Default: SUBSCRIPTION | Package type |
| `price_monthly` | Decimal(10,2) | Nullable | Monthly price |
| `price_yearly` | Decimal(10,2) | Nullable | Yearly price |
| `currency` | String | Default: "USD" | Currency code |
| `features_en` | Json | Required | English features list |
| `features_ar` | Json | Required | Arabic features list |
| `is_featured` | Boolean | Default: false | Highlight flag |
| `badge` | String | Nullable | e.g. "Popular", "Best Value" |
| `badge_color` | String | Nullable | Badge color |
| `cta_text_en` | String | Nullable | English CTA button text |
| `cta_text_ar` | String | Nullable | Arabic CTA button text |
| `cta_link` | String | Nullable | CTA URL |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** is_active, order

---

### Table 14: `team_members` (TeamMember)

Team page member profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `is_active` | Boolean | Default: true | Visible on website |
| `order` | Int | Default: 0 | Display order |
| `name_en` | String | Required | English name |
| `name_ar` | String | Required | Arabic name |
| `title_en` | String | Required | English job title |
| `title_ar` | String | Required | Arabic job title |
| `bio_en` | Text | Nullable | English bio |
| `bio_ar` | Text | Nullable | Arabic bio |
| `email` | String | Nullable | Contact email |
| `linkedin` | String | Nullable | LinkedIn URL |
| `twitter` | String | Nullable | Twitter URL |
| `photo_url` | String | Nullable | Profile photo URL |
| `department` | String | Nullable | Department name |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** is_active, order, department

---

### Table 15: `testimonials` (Testimonial)

Customer testimonials with ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `is_active` | Boolean | Default: true | Visible |
| `is_featured` | Boolean | Default: false | Featured on homepage |
| `order` | Int | Default: 0 | Display order |
| `quote_en` | Text | Required | English testimonial text |
| `quote_ar` | Text | Required | Arabic testimonial text |
| `author_name` | String | Required | Person name |
| `author_title_en` | String | Required | English job title |
| `author_title_ar` | String | Required | Arabic job title |
| `author_company` | String | Nullable | Company name |
| `author_photo` | String | Nullable | Photo URL |
| `rating` | Int | Default: 5 | Star rating (1-5) |
| `service` | String | Nullable | Related service |
| `industry` | String | Nullable | Client industry |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** is_active, is_featured, order

---

### Table 16: `logos` (Logo)

Client/partner logos with dark mode support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | String | Required | Logo name |
| `image_url` | String | Required | Logo image URL |
| `dark_mode_url` | String | Nullable | Dark mode variant URL |
| `category` | LogoCategory | Default: CLIENT | Logo type |
| `sections` | String[] | Default: [] | Where to display (hero, footer, about, services) |
| `website_url` | String | Nullable | Company website |
| `alt_text_en` | String | Nullable | English alt text |
| `alt_text_ar` | String | Nullable | Arabic alt text |
| `is_active` | Boolean | Default: true | Active status |
| `display_order` | Int | Default: 0 | Sort order |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** category, is_active

---

### Table 17: `doc_categories` (DocCategory)

Documentation / knowledge base categories (tree structure).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name_en` | String | Required | English name |
| `name_ar` | String | Required | Arabic name |
| `slug` | String | UNIQUE | URL slug |
| `parent_id` | UUID | FK → self, Nullable | Parent category |
| `display_order` | Int | Default: 0 | Sort order |
| `is_active` | Boolean | Default: true | Active status |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** parent_id, slug, is_active
**Self-relation:** parent (DocCategory?), children (DocCategory[])

---

### Table 18: `doc_pages` (DocPage)

Documentation pages with access levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `title_en` | String | Required | English title |
| `title_ar` | String | Required | Arabic title |
| `slug` | String | UNIQUE | URL slug |
| `content_en` | Text | Required | English content |
| `content_ar` | Text | Required | Arabic content |
| `category_id` | UUID | FK → doc_categories | Parent category |
| `access_level` | DocAccessLevel | Default: PUBLIC | Who can view |
| `is_published` | Boolean | Default: false | Publish state |
| `version` | String | Default: "1.0" | Page version |
| `display_order` | Int | Default: 0 | Sort order |
| `view_count` | Int | Default: 0 | View counter |
| `created_at` | DateTime | Auto | Creation time |
| `updated_at` | DateTime | Auto | Last update |

**Indexes:** category_id, slug, is_published, access_level

---

### Table 19: `page_views` (PageView)

Website analytics — individual page views.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `session_id` | String | Required | Session reference |
| `path` | String | Required | Page path |
| `referrer` | String | Nullable | Referrer URL |
| `user_agent` | String | Nullable | Browser info |
| `ip_address` | String | Nullable | Visitor IP |
| `country` | String | Nullable | Geo location |
| `device` | String | Nullable | desktop/mobile/tablet |
| `browser` | String | Nullable | Browser name |
| `duration` | Int | Nullable | Seconds on page |
| `created_at` | DateTime | Auto | View time |

**Indexes:** session_id, path, created_at

---

### Table 20: `analytics_sessions` (AnalyticsSession)

Website analytics — visitor sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `visitor_id` | String | Required | Anonymous visitor ID |
| `started_at` | DateTime | Auto | Session start |
| `ended_at` | DateTime | Nullable | Session end |
| `page_count` | Int | Default: 0 | Pages visited |
| `country` | String | Nullable | Geo location |
| `device` | String | Nullable | Device type |
| `browser` | String | Nullable | Browser name |
| `referrer` | String | Nullable | Entry referrer |
| `utm_source` | String | Nullable | UTM tracking |
| `utm_medium` | String | Nullable | UTM tracking |
| `utm_campaign` | String | Nullable | UTM tracking |

**Indexes:** visitor_id, started_at

---

### Table 21: `heatmap_clicks` (HeatmapClick)

Website analytics — click positions for heatmaps.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `session_id` | String | Required | Session reference |
| `path` | String | Required | Page path |
| `x` | Int | Required | X position (% from left) |
| `y` | Int | Required | Y position (% from top) |
| `element_tag` | String | Nullable | Clicked HTML tag |
| `element_id` | String | Nullable | Clicked element ID |
| `element_class` | String | Nullable | Clicked element classes |
| `created_at` | DateTime | Auto | Click time |

**Indexes:** path, created_at

---

## 2. All API Endpoints

**Base URL:** `http://localhost:3001/api/v1`

### 2.1 Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check (DB + Redis status) |

---

### 2.2 Authentication (`/auth`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| GET | `/auth/csrf-token` | No | API | Get CSRF token |
| POST | `/auth/login` | No | Login (5/15min) | Admin login (returns JWT) |
| POST | `/auth/refresh` | No | API | Refresh access token |
| POST | `/auth/logout` | Yes | API | Logout (revoke tokens) |
| GET | `/auth/profile` | Yes | API | Get current user profile |
| POST | `/auth/change-password` | Yes | API | Change own password |
| POST | `/auth/register` | SUPER_ADMIN | API | Register new admin user |

---

### 2.3 Leads (`/leads`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/leads/submit` | No | Form (5/15min) | Submit lead from website form |
| GET | `/leads` | SALES_REP+ | API | List leads (paginated, filterable) |
| GET | `/leads/stats` | SALES_REP+ | API | Dashboard statistics |
| GET | `/leads/:id` | SALES_REP+ | API | Get single lead |
| PATCH | `/leads/:id` | SALES_REP+ | API | Update lead |
| DELETE | `/leads/:id` | SALES_REP+ | API | Delete lead |
| POST | `/leads/:id/tags` | SALES_REP+ | API | Add tag to lead |
| DELETE | `/leads/:id/tags/:tagId` | SALES_REP+ | API | Remove tag from lead |
| POST | `/leads/:id/notes` | SALES_REP+ | API | Add note to lead |
| PATCH | `/leads/notes/:id` | SALES_REP+ | API | Update a note |
| DELETE | `/leads/notes/:id` | SALES_REP+ | API | Delete a note |
| GET | `/leads/:id/activities` | SALES_REP+ | API | Get lead activities (paginated) |
| POST | `/leads/:id/activities` | SALES_REP+ | API | Create manual activity |

---

### 2.4 Admin User Management (`/admin`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | SUPER_ADMIN | List all admin users |
| GET | `/admin/users/:id` | SUPER_ADMIN | Get admin user by ID |
| PATCH | `/admin/users/:id` | SUPER_ADMIN | Update admin user |
| DELETE | `/admin/users/:id` | SUPER_ADMIN | Delete admin user |
| GET | `/admin/tags` | ADMIN+ | List all tags |
| POST | `/admin/tags` | ADMIN+ | Create a tag |
| DELETE | `/admin/tags/:id` | ADMIN+ | Delete a tag |
| GET | `/admin/settings` | SUPER_ADMIN | Get all system settings |
| PATCH | `/admin/settings/:key` | SUPER_ADMIN | Update a system setting |

---

### 2.5 User Management (`/admin/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | ADMIN+ | List users (filterable by role, status, search) |
| GET | `/admin/users/:id` | ADMIN+ | Get user details |
| POST | `/admin/users` | SUPER_ADMIN | Create new user |
| PATCH | `/admin/users/:id` | SUPER_ADMIN | Update user |
| DELETE | `/admin/users/:id` | SUPER_ADMIN | Delete user |
| POST | `/admin/users/:id/reset-password` | SUPER_ADMIN | Reset user password |
| GET | `/admin/users/:id/activity` | ADMIN+ | Get user activity logs |

---

### 2.6 Analytics (`/analytics`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/overview` | Authenticated | Overview metrics |
| GET | `/analytics/conversion-funnel` | Authenticated | Conversion funnel data |
| GET | `/analytics/sales-cycle` | Authenticated | Sales cycle analysis |
| GET | `/analytics/source-performance` | Authenticated | Lead source performance |
| GET | `/analytics/team-performance` | SALES_MANAGER+ | Team performance metrics |
| GET | `/analytics/trends` | Authenticated | Trend data |
| GET | `/analytics/export` | ADMIN+ | Export analytics data |

---

### 2.7 Content Management (`/admin/content`, `/admin/packages`, `/admin/team`, `/admin/testimonials`)

**All routes require authentication.**

#### Content Items (Blog/Case Studies/Whitepapers)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/content` | Authenticated | List content (filterable by type, status, category) |
| GET | `/admin/content/:id` | Authenticated | Get content by ID |
| POST | `/admin/content` | ADMIN+ | Create content |
| PATCH | `/admin/content/:id` | ADMIN+ | Update content |
| DELETE | `/admin/content/:id` | ADMIN+ | Delete content |
| POST | `/admin/content/:id/publish` | ADMIN+ | Publish content |
| POST | `/admin/content/:id/unpublish` | ADMIN+ | Unpublish content |

#### Service Packages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/packages` | Authenticated | List packages |
| GET | `/admin/packages/:id` | Authenticated | Get package by ID |
| POST | `/admin/packages` | ADMIN+ | Create package |
| PATCH | `/admin/packages/:id` | ADMIN+ | Update package |
| DELETE | `/admin/packages/:id` | ADMIN+ | Delete package |
| PATCH | `/admin/packages/reorder` | ADMIN+ | Reorder packages |

#### Team Members

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/team` | Authenticated | List team members |
| GET | `/admin/team/departments` | Authenticated | List departments |
| GET | `/admin/team/:id` | Authenticated | Get team member |
| POST | `/admin/team` | ADMIN+ | Create team member |
| PATCH | `/admin/team/:id` | ADMIN+ | Update team member |
| DELETE | `/admin/team/:id` | ADMIN+ | Delete team member |
| PATCH | `/admin/team/reorder` | ADMIN+ | Reorder team members |

#### Testimonials

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/testimonials` | Authenticated | List testimonials |
| GET | `/admin/testimonials/:id` | Authenticated | Get testimonial |
| POST | `/admin/testimonials` | ADMIN+ | Create testimonial |
| PATCH | `/admin/testimonials/:id` | ADMIN+ | Update testimonial |
| DELETE | `/admin/testimonials/:id` | ADMIN+ | Delete testimonial |
| PATCH | `/admin/testimonials/reorder` | ADMIN+ | Reorder testimonials |
| PATCH | `/admin/testimonials/:id/toggle-featured` | ADMIN+ | Toggle featured status |

---

### 2.8 Logos & Email Templates (`/admin/logos`, `/admin/email-templates`)

#### Logos

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/logos` | **No (Public)** | Get active logos for website display |
| GET | `/admin/logos/:id` | Authenticated | Get logo by ID |
| POST | `/admin/logos` | ADMIN+ | Create logo |
| PATCH | `/admin/logos/:id` | ADMIN+ | Update logo |
| DELETE | `/admin/logos/:id` | ADMIN+ | Delete logo |
| PATCH | `/admin/logos-reorder` | ADMIN+ | Reorder logos |
| PATCH | `/admin/logos/:id/toggle-active` | ADMIN+ | Toggle active status |

#### Email Templates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/email-templates` | Authenticated | List email templates |
| GET | `/admin/email-templates/:id` | Authenticated | Get template by ID |
| POST | `/admin/email-templates` | ADMIN+ | Create template |
| PATCH | `/admin/email-templates/:id` | ADMIN+ | Update template |
| DELETE | `/admin/email-templates/:id` | ADMIN+ | Delete template |
| POST | `/admin/email-templates/:id/test` | ADMIN+ | Send test email |
| PATCH | `/admin/email-templates/:id/toggle-active` | ADMIN+ | Toggle active status |

---

### 2.9 Documentation (`/docs`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/docs/categories` | **No (Public)** | Get category tree (published only) |
| GET | `/docs/pages/slug/:slug` | **No (Public)** | Get page by slug |
| GET | `/docs/categories/:id` | ADMIN+ | Get category by ID |
| POST | `/docs/categories` | ADMIN+ | Create category |
| PATCH | `/docs/categories/:id` | ADMIN+ | Update category |
| DELETE | `/docs/categories/:id` | ADMIN+ | Delete category |
| PATCH | `/docs/categories-reorder` | ADMIN+ | Reorder categories |
| GET | `/docs/pages` | ADMIN+ | List all pages (includes unpublished) |
| GET | `/docs/pages/:id` | ADMIN+ | Get page by ID |
| POST | `/docs/pages` | ADMIN+ | Create page |
| PATCH | `/docs/pages/:id` | ADMIN+ | Update page |
| DELETE | `/docs/pages/:id` | ADMIN+ | Delete page |
| POST | `/docs/pages/:id/duplicate` | ADMIN+ | Duplicate page |

---

### 2.10 Website Analytics (`/website-analytics`)

#### Public Tracking Endpoints (Rate Limited: 100/min)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/website-analytics/tracking/pageview` | No | Track page view |
| POST | `/website-analytics/tracking/click` | No | Track heatmap click |
| POST | `/website-analytics/tracking/session/start` | No | Start session |
| POST | `/website-analytics/tracking/session/end` | No | End session |
| GET | `/website-analytics/tracking/script` | No | Get tracking script |

#### Admin Analytics Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/website-analytics/overview` | SALES_REP+ | Dashboard overview |
| GET | `/website-analytics/top-pages` | SALES_REP+ | Top visited pages |
| GET | `/website-analytics/countries` | SALES_REP+ | Visitor countries |
| GET | `/website-analytics/devices` | SALES_REP+ | Device breakdown |
| GET | `/website-analytics/browsers` | SALES_REP+ | Browser breakdown |
| GET | `/website-analytics/referrers` | SALES_REP+ | Referrer breakdown |
| GET | `/website-analytics/page-views` | SALES_REP+ | Page views over time |
| GET | `/website-analytics/heatmap/:path` | SALES_REP+ | Heatmap data for a path |
| GET | `/website-analytics/sessions` | SALES_REP+ | Sessions list |
| GET | `/website-analytics/active` | SALES_REP+ | Active visitors (real-time) |

---

### 2.11 Summary of Public (No Auth) Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/auth/csrf-token` | CSRF token |
| POST | `/auth/login` | Admin login |
| POST | `/auth/refresh` | Token refresh |
| POST | `/leads/submit` | Website form submission |
| GET | `/admin/logos` | Active logos for website |
| GET | `/docs/categories` | Doc category tree |
| GET | `/docs/pages/slug/:slug` | Public doc page |
| POST | `/website-analytics/tracking/*` | Tracking (4 endpoints) |
| GET | `/website-analytics/tracking/script` | Tracking script |

---

## 3. How to Open & Use PostgreSQL

### 3.1 Connection Details

```
Host:     localhost
Port:     5432
Database: roaya_leads
Username: postgres
Password: postgres
URL:      postgresql://postgres:postgres@localhost:5432/roaya_leads
```

### 3.2 Install PostgreSQL (macOS)

```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Verify it's running
pg_isready -h localhost -p 5432
```

### 3.3 Connect via CLI (psql)

```bash
# Connect to the database
psql -h localhost -U postgres -d roaya_leads

# If password is required
PGPASSWORD=postgres psql -h localhost -U postgres -d roaya_leads
```

**Common psql commands:**

```sql
-- List all tables
\dt

-- Describe a table
\d content_items

-- List all enums
\dT+

-- Count rows in a table
SELECT COUNT(*) FROM content_items;
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM admin_users;

-- View all admin users
SELECT id, email, first_name, last_name, role, is_active FROM admin_users;

-- View all published content
SELECT id, type, status, title_en, slug_en, published_at FROM content_items WHERE status = 'PUBLISHED';

-- View lead pipeline
SELECT status, COUNT(*) FROM leads GROUP BY status;

-- Exit
\q
```

### 3.4 Create the Database (First Time)

```bash
# Create the database
createdb -h localhost -U postgres roaya_leads

# Or via psql
psql -h localhost -U postgres -c "CREATE DATABASE roaya_leads;"
```

### 3.5 Run Prisma Migrations

```bash
cd /Users/roaya/Roaya-files/Development/roaya/backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev

# Seed the database with initial data
npm run prisma:seed

# Open Prisma Studio (visual database browser at http://localhost:5555)
npx prisma studio
```

### 3.6 GUI Tools for PostgreSQL

**Option 1: Prisma Studio (built-in)**
```bash
cd backend && npx prisma studio
# Opens at http://localhost:5555
```

**Option 2: pgAdmin (free)**
- Download from https://www.pgadmin.org/download/
- Connect with the credentials above

**Option 3: TablePlus (paid, macOS)**
- Download from https://tableplus.com/
- Create new PostgreSQL connection with credentials above

**Option 4: DBeaver (free, cross-platform)**
- Download from https://dbeaver.io/download/

### 3.7 Database Reset

```bash
cd backend

# Full reset (drops all tables, re-runs migrations, re-seeds)
npm run db:reset

# Or just re-seed without dropping
npm run prisma:seed
```

---

## 4. How to Deploy on Linux Production Server

### 4.1 Prerequisites

- Ubuntu 22.04+ or similar Linux distro
- Node.js 20+ (via nvm or NodeSource)
- PostgreSQL 15+
- Redis 7+
- Nginx (reverse proxy)
- PM2 (process manager)
- Git
- SSL certificate (Let's Encrypt)

### 4.2 Step-by-Step Deployment

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # Should be v20+
npm --version

# Install PM2 globally
sudo npm install -g pm2
```

#### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create production database and user
sudo -u postgres psql << 'EOF'
CREATE USER roaya_prod WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
CREATE DATABASE roaya_production OWNER roaya_prod;
GRANT ALL PRIVILEGES ON DATABASE roaya_production TO roaya_prod;
\q
EOF

# Verify connection
psql -h localhost -U roaya_prod -d roaya_production
```

#### Step 3: Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru
# Set: requirepass YOUR_REDIS_PASSWORD

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Verify
redis-cli -a YOUR_REDIS_PASSWORD ping
# Should return: PONG
```

#### Step 4: Clone & Build the Backend

```bash
# Create app directory
sudo mkdir -p /var/www/roaya
sudo chown $USER:$USER /var/www/roaya

# Clone repository
cd /var/www/roaya
git clone YOUR_REPO_URL .
cd backend

# Install dependencies
npm ci --production=false   # Need devDependencies for build

# Create production .env file
nano .env
```

#### Step 5: Production `.env` File

```env
# Application
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL="postgresql://roaya_prod:YOUR_STRONG_PASSWORD_HERE@localhost:5432/roaya_production"

# JWT (MUST generate strong secrets for production)
JWT_SECRET="GENERATE_64_CHAR_RANDOM_STRING_HERE"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# CSRF
CSRF_SECRET="GENERATE_ANOTHER_64_CHAR_RANDOM_STRING_HERE"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# SendGrid (for email notifications)
SENDGRID_API_KEY=SG.your_actual_api_key
SENDGRID_FROM_EMAIL=noreply@roaya.ai
SENDGRID_FROM_NAME=Roaya AI
ADMIN_NOTIFICATION_EMAIL=admin@roaya.ai

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FORM_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_MAX=5

# CORS (your production domain)
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

**Generate strong secrets:**
```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate CSRF_SECRET
openssl rand -hex 32
```

#### Step 6: Build & Migrate

```bash
cd /var/www/roaya/backend

# Generate Prisma client
npx prisma generate

# Run migrations on production database
npx prisma migrate deploy

# Seed initial data (admin user, tags, templates, settings)
npm run prisma:seed

# Build TypeScript
npm run build

# Test it works
node dist/index.js
# Should see: "Server started successfully" — Ctrl+C to stop
```

#### Step 7: Setup PM2 Process Manager

```bash
# Create PM2 ecosystem file
nano /var/www/roaya/backend/ecosystem.config.cjs
```

**ecosystem.config.cjs:**
```javascript
module.exports = {
  apps: [{
    name: 'roaya-api',
    script: 'dist/index.js',
    cwd: '/var/www/roaya/backend',
    instances: 'max',          // Use all CPU cores
    exec_mode: 'cluster',      // Cluster mode for load balancing
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '500M',
    error_file: '/var/log/roaya/api-error.log',
    out_file: '/var/log/roaya/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 5000,
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/roaya
sudo chown $USER:$USER /var/log/roaya

# Start with PM2
cd /var/www/roaya/backend
pm2 start ecosystem.config.cjs

# Save PM2 process list (auto-starts on reboot)
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Copy and run the command it outputs

# Check status
pm2 status
pm2 logs roaya-api
```

#### Step 8: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/roaya-api
```

**Nginx configuration:**
```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Request size limit
    client_max_body_size 10M;

    # Proxy to Node.js backend
    location / {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Health check (no rate limit)
    location /api/v1/health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/roaya-api /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 9: Build & Deploy Frontend (Angular)

```bash
cd /var/www/roaya/roaya-website

# Install dependencies
npm ci

# Update environment for production
# Edit src/environments/environment.prod.ts:
#   apiUrl: 'https://api.yourdomain.com/api/v1'

# Build for production
npx ng build --configuration=production

# The output will be in dist/roaya-website/browser/
# Copy to nginx serving directory
sudo mkdir -p /var/www/html/roaya
sudo cp -r dist/roaya-website/browser/* /var/www/html/roaya/
```

**Nginx config for the frontend:**
```bash
sudo nano /etc/nginx/sites-available/roaya-website
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/html/roaya;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Angular SPA routing — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/roaya-website /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo nginx -t && sudo systemctl reload nginx
```

#### Step 10: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS only
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verify
sudo ufw status
```

#### Step 11: Setup Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-roaya-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/roaya"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="roaya_production_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

PGPASSWORD="YOUR_STRONG_PASSWORD_HERE" pg_dump \
  -h localhost -U roaya_prod roaya_production \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup created: ${FILENAME}"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-roaya-db.sh

# Schedule daily backup at 2 AM
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-roaya-db.sh >> /var/log/roaya/backup.log 2>&1
```

#### Step 12: Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/roaya
```

```
/var/log/roaya/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

### 4.3 Deployment Checklist

```
Pre-Deploy:
[ ] Strong JWT_SECRET generated (64+ chars)
[ ] Strong CSRF_SECRET generated (64+ chars)
[ ] Strong PostgreSQL password set
[ ] Strong Redis password set
[ ] CORS_ORIGIN set to production domain
[ ] NODE_ENV=production
[ ] LOG_LEVEL=info (not debug)
[ ] SendGrid API key configured (for emails)

Server:
[ ] Ubuntu 22.04+ updated
[ ] Node.js 20+ installed
[ ] PostgreSQL 15+ installed and running
[ ] Redis 7+ installed and running
[ ] Nginx installed and configured
[ ] SSL certificates installed (Let's Encrypt)
[ ] Firewall enabled (UFW: SSH + Nginx only)
[ ] PM2 installed and configured
[ ] PM2 startup script configured

Application:
[ ] Code cloned to /var/www/roaya
[ ] npm ci completed
[ ] Prisma client generated
[ ] Migrations applied (prisma migrate deploy)
[ ] Database seeded (admin user created)
[ ] TypeScript built (npm run build)
[ ] PM2 started and saved
[ ] Nginx reverse proxy configured
[ ] Health check returns healthy: curl https://api.yourdomain.com/api/v1/health

Post-Deploy:
[ ] Database backups scheduled (daily cron)
[ ] Log rotation configured
[ ] SSL auto-renewal verified (certbot renew --dry-run)
[ ] Admin login works at https://yourdomain.com/admin
[ ] API responds at https://api.yourdomain.com/api/v1/health
[ ] Lead form submission works on public website
[ ] Monitoring setup (optional: UptimeRobot, PM2 monitoring)
```

---

### 4.4 Common Production Commands

```bash
# View PM2 status
pm2 status
pm2 logs roaya-api
pm2 logs roaya-api --lines 100

# Restart the API
pm2 restart roaya-api

# Zero-downtime reload
pm2 reload roaya-api

# Deploy updates
cd /var/www/roaya
git pull origin main
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload roaya-api

# Monitor resources
pm2 monit

# Check database connection
psql -h localhost -U roaya_prod -d roaya_production -c "SELECT 1;"

# Check Redis
redis-cli -a YOUR_REDIS_PASSWORD ping

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Renew SSL
sudo certbot renew

# Database shell
psql -h localhost -U roaya_prod -d roaya_production
```

---

## 5. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Environment: development, production, test |
| `PORT` | No | 3001 | Server port |
| `API_VERSION` | No | v1 | API version prefix |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | No | 15m | Access token expiry |
| `JWT_REFRESH_EXPIRY` | No | 7d | Refresh token expiry |
| `CSRF_SECRET` | No | Falls back to JWT_SECRET | CSRF token secret |
| `REDIS_HOST` | No | localhost | Redis server host |
| `REDIS_PORT` | No | 6379 | Redis server port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `SENDGRID_API_KEY` | No | — | SendGrid API key for emails |
| `SENDGRID_FROM_EMAIL` | No | noreply@roaya.ai | From email address |
| `SENDGRID_FROM_NAME` | No | Roaya AI | From display name |
| `ADMIN_NOTIFICATION_EMAIL` | No | admin@roaya.ai | Admin notification recipient |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 (15 min) | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max API requests per window |
| `FORM_RATE_LIMIT_MAX` | No | 5 | Max form submissions per window |
| `LOGIN_RATE_LIMIT_MAX` | No | 5 | Max login attempts per window |
| `CORS_ORIGIN` | No | http://localhost:3000 | Allowed CORS origin |
| `LOG_LEVEL` | No | info | Logging level |
| `LOG_FORMAT` | No | dev | Morgan log format |

---

## 6. Seed Data & Default Credentials

### Default Admin User

```
Email:    admin@roaya.ai
Password: Admin@123456
Role:     SUPER_ADMIN
```

### Default Sales Manager

```
Email:    sales@roaya.ai
Password: Admin@123456
Role:     SALES_MANAGER
```

### Default Tags

| Name | Color |
|------|-------|
| Hot Lead | #EF4444 (red) |
| Enterprise | #8B5CF6 (purple) |
| SMB | #3B82F6 (blue) |
| Follow Up | #F59E0B (amber) |
| Demo Requested | #10B981 (green) |

### Default Email Templates

| Template Name | Purpose |
|--------------|---------|
| `lead_confirmation` | Auto-reply to lead form submitter |
| `admin_new_lead` | Notify admin of new lead |
| `roi_calculator_results` | ROI calculation results email |

### Default System Settings

| Key | Category | Value |
|-----|----------|-------|
| `lead_assignment_mode` | leads | `{ mode: "round_robin", enabled: true }` |
| `notification_settings` | notifications | `{ emailOnNewLead: true, emailOnStatusChange: true, slackEnabled: false }` |
| `sla_settings` | sla | `{ firstResponseHours: 24, followUpDays: 3, escalationDays: 7 }` |

### Sample Leads (3)

| Name | Company | Source | Status | Priority |
|------|---------|--------|--------|----------|
| Ahmed Al-Rashid | TechCorp Saudi | Contact Form | NEW | HIGH |
| Sarah Johnson | Global Retail Inc | ROI Calculator | QUALIFIED | URGENT |
| Mohammad Hassan | StartupHub UAE | Pricing Page | CONTACTED | MEDIUM |

---

## 7. Project File Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (19 tables)
│   ├── seed.ts                # Database seeder
│   └── migrations/            # SQL migration files
├── src/
│   ├── app.ts                 # Express app setup (middleware, CORS, CSRF)
│   ├── server.ts              # Server entry point (startup, graceful shutdown)
│   ├── config/
│   │   ├── environment.ts     # Env vars validation (Zod)
│   │   ├── database.ts        # Prisma client connection
│   │   └── redis.ts           # Redis connection
│   ├── domain/
│   │   └── exceptions/        # Custom error classes
│   ├── application/
│   │   └── services/          # Business logic services
│   │       ├── auth.service.ts
│   │       ├── lead.service.ts
│   │       ├── content.service.ts
│   │       ├── analytics.service.ts
│   │       └── ...
│   ├── presentation/
│   │   ├── routes/            # Express route definitions
│   │   │   ├── index.ts       # Route mounting
│   │   │   ├── auth.routes.ts
│   │   │   ├── lead.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   ├── logo.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── documentation.routes.ts
│   │   │   └── website-analytics.routes.ts
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, CSRF, rate limiting
│   │   └── validators/        # Zod schemas for input validation
│   ├── infrastructure/
│   │   └── email/             # Email queue (BullMQ + SendGrid)
│   └── shared/
│       └── utils/             # Logger, security utilities
├── .env                       # Environment variables
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript config
```

---

> **IMPORTANT SECURITY NOTES:**
> - Change ALL default passwords before deploying to production
> - Generate unique JWT_SECRET and CSRF_SECRET (use `openssl rand -hex 32`)
> - Never commit `.env` files to git
> - The `.env` file in this repo contains DEVELOPMENT credentials only
> - Production PostgreSQL should NOT use the `postgres` superuser — create a dedicated user
> - Enable Redis password in production
> - Set `CORS_ORIGIN` to your actual production domain
