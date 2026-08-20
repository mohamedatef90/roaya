# Lead Management System - Test Case Matrix

## Document Information
- **Version:** 1.0
- **Date:** 2026-01-21
- **Related:** Lead Management Test Strategy

---

## Table of Contents

1. [Test Case Organization](#1-test-case-organization)
2. [Lead Submission Tests](#2-lead-submission-tests)
3. [Authentication Tests](#3-authentication-tests)
4. [Admin Lead Management Tests](#4-admin-lead-management-tests)
5. [Email Notification Tests](#5-email-notification-tests)
6. [Security Tests](#6-security-tests)
7. [Performance Tests](#7-performance-tests)

---

## 1. Test Case Organization

### 1.1 Test ID Format

`[CATEGORY]-[TYPE]-[NUMBER]`

**Categories:**
- `LEAD` - Lead submission endpoints
- `AUTH` - Authentication endpoints
- `ADMIN` - Admin management endpoints
- `EMAIL` - Email notification tests
- `SEC` - Security tests
- `PERF` - Performance tests

**Types:**
- `FUNC` - Functional test (happy path)
- `NEG` - Negative test (error handling)
- `BOUND` - Boundary test (edge cases)
- `INT` - Integration test
- `E2E` - End-to-end test

### 1.2 Priority Definitions

- **P0** - Critical: Must pass before deployment
- **P1** - High: Should pass before deployment
- **P2** - Medium: Fix in next sprint
- **P3** - Low: Fix when time permits

---

## 2. Lead Submission Tests

### 2.1 POST /api/v1/leads/contact

#### Test Case Matrix

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **LEAD-FUNC-001** | Submit valid contact form | Functional | P0 | 1. Send POST with valid data<br>2. Verify response | 201 Created<br>Returns leadId<br>Lead in DB | `validContactFormData` |
| **LEAD-FUNC-002** | Submit with all optional fields | Functional | P0 | 1. Send POST with all fields populated<br>2. Verify all fields saved | 201 Created<br>All fields in DB | `completeContactFormData` |
| **LEAD-FUNC-003** | Submit with minimal required fields | Functional | P0 | 1. Send POST with only required fields<br>2. Verify defaults applied | 201 Created<br>Optional fields null/default | `minimalContactFormData` |
| **LEAD-NEG-001** | Submit with missing required field (email) | Negative | P0 | 1. Send POST without email<br>2. Check error response | 400 Bad Request<br>Error: "email required" | `{ name, message }` |
| **LEAD-NEG-002** | Submit with invalid email format | Negative | P0 | 1. Send POST with "invalid-email"<br>2. Check validation error | 400 Bad Request<br>Error: "invalid email format" | `email: "notanemail"` |
| **LEAD-NEG-003** | Submit with XSS attempt in message | Negative | P0 | 1. Send POST with `<script>alert()</script>` in message<br>2. Verify sanitization | 201 Created<br>Script tags sanitized | `message: "<script>..."` |
| **LEAD-NEG-004** | Submit with SQL injection in name | Negative | P0 | 1. Send POST with `'; DROP TABLE leads;--`<br>2. Verify no SQL execution | 201 Created<br>Stored as text, not executed | `name: "'; DROP TABLE--"` |
| **LEAD-NEG-005** | Submit with excessively long message (>2000 chars) | Negative | P0 | 1. Send POST with 2500 char message<br>2. Check validation | 400 Bad Request<br>Error: "message too long" | `message: "a".repeat(2500)` |
| **LEAD-BOUND-001** | Submit with exactly 2000 char message | Boundary | P1 | 1. Send POST with 2000 char message<br>2. Verify acceptance | 201 Created<br>Full message stored | `message: "a".repeat(2000)` |
| **LEAD-BOUND-002** | Submit with 2001 char message | Boundary | P1 | 1. Send POST with 2001 chars<br>2. Verify rejection | 400 Bad Request | `message: "a".repeat(2001)` |
| **LEAD-BOUND-003** | Submit with 1 char name | Boundary | P1 | 1. Send POST with name="A"<br>2. Check validation | 400 Bad Request<br>Error: "name min 2 chars" | `name: "A"` |
| **LEAD-BOUND-004** | Submit with 2 char name (minimum) | Boundary | P1 | 1. Send POST with name="AB"<br>2. Verify acceptance | 201 Created | `name: "AB"` |
| **LEAD-INT-001** | Lead creates activity log entry | Integration | P0 | 1. Submit lead<br>2. Query lead_activities table<br>3. Verify "created" activity exists | Activity logged with type="created" | `validContactFormData` |
| **LEAD-INT-002** | Lead triggers admin email queue | Integration | P0 | 1. Submit lead<br>2. Check email_notifications table<br>3. Verify queued | Email notification with type="admin_alert" | `validContactFormData` |
| **LEAD-INT-003** | Lead triggers customer email queue | Integration | P0 | 1. Submit lead<br>2. Check email_notifications table<br>3. Verify confirmation email | Email notification with type="lead_confirmation" | `validContactFormData` |
| **LEAD-INT-004** | Duplicate email detection (same email within 24h) | Integration | P1 | 1. Submit lead with email@test.com<br>2. Submit again within 24h<br>3. Check response | 201 Created (both)<br>Log duplicate flag | Same email twice |
| **LEAD-INT-005** | UTM parameters captured | Integration | P1 | 1. Send POST with utmParams<br>2. Query lead in DB<br>3. Verify UTM fields populated | UTM source, medium, campaign stored | `utmParams: { utm_source: "google" }` |

#### Arabic Language Tests

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **LEAD-FUNC-004** | Submit with Arabic name and message | Functional | P0 | 1. Send POST with Arabic text<br>2. Verify Unicode storage | 201 Created<br>Arabic text preserved | `{ name: "محمد علي", message: "مرحبا" }` |
| **LEAD-FUNC-005** | Submit with language=ar | Functional | P0 | 1. Send POST with language="ar"<br>2. Verify customer email in Arabic | Email template uses Arabic version | `language: "ar"` |
| **LEAD-NEG-006** | Submit with invalid language code | Negative | P1 | 1. Send POST with language="fr"<br>2. Check validation | 400 Bad Request<br>Error: "language must be en or ar" | `language: "fr"` |

---

### 2.2 POST /api/v1/leads/pricing-quote

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **LEAD-FUNC-006** | Submit valid pricing quote | Functional | P0 | 1. Send POST with valid data<br>2. Verify source_id=2 | 201 Created<br>source_id = "pricing_quote" | `validPricingQuoteData` |
| **LEAD-FUNC-007** | Submit with multiple services | Functional | P0 | 1. Send POST with services array [cloud, security, email]<br>2. Verify junction table | 201 Created<br>3 entries in lead_services | `services: ["cloud", "security", "email"]` |
| **LEAD-NEG-007** | Submit with empty services array | Negative | P0 | 1. Send POST with services=[]<br>2. Check validation | 400 Bad Request<br>Error: "services required" | `services: []` |
| **LEAD-NEG-008** | Submit with invalid service code | Negative | P0 | 1. Send POST with services=["invalid_service"]<br>2. Check validation | 400 Bad Request<br>Error: "invalid service code" | `services: ["nonexistent"]` |
| **LEAD-NEG-009** | Submit with invalid employee range | Negative | P1 | 1. Send POST with employees="999"<br>2. Check validation | 400 Bad Request | `employees: "999"` |
| **LEAD-BOUND-005** | Submit with valid employee ranges | Boundary | P1 | 1. Test each: "1-50", "51-200", "201-500", "500+"<br>2. Verify acceptance | 201 Created for all | Multiple iterations |
| **LEAD-INT-006** | Services linked via junction table | Integration | P0 | 1. Submit with 3 services<br>2. Query lead_services<br>3. Verify 3 rows | 3 rows with correct lead_id and service_id | `services: ["cloud", "security", "backup"]` |
| **LEAD-INT-007** | Industry association | Integration | P1 | 1. Submit with industry="technology"<br>2. Query lead<br>3. Verify industry_id FK | industry_id points to correct row | `industry: "technology"` |

---

### 2.3 POST /api/v1/leads/roi-calculator

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **LEAD-FUNC-008** | Submit valid ROI calculator lead | Functional | P0 | 1. Send POST with calculator data<br>2. Verify form_data JSONB | 201 Created<br>form_data contains inputs/results | `validROICalculatorData` |
| **LEAD-FUNC-009** | Submit with calculatorType=cloud | Functional | P0 | 1. Send POST with cloud inputs<br>2. Verify storage | 201 Created<br>calculatorType in form_data | `calculatorType: "cloud"` |
| **LEAD-FUNC-010** | Submit with calculatorType=security | Functional | P1 | 1. Send POST with security inputs<br>2. Verify storage | 201 Created | `calculatorType: "security"` |
| **LEAD-FUNC-011** | Submit with calculatorType=email | Functional | P1 | 1. Send POST with email inputs<br>2. Verify storage | 201 Created | `calculatorType: "email"` |
| **LEAD-NEG-010** | Submit with invalid calculatorType | Negative | P0 | 1. Send POST with calculatorType="invalid"<br>2. Check validation | 400 Bad Request | `calculatorType: "invalid"` |
| **LEAD-NEG-011** | Submit with negative ROI value | Negative | P1 | 1. Send POST with roi=-50<br>2. Verify acceptance (negative ROI valid) | 201 Created | `results: { roi: -50 }` |
| **LEAD-INT-008** | ROI data stored in JSONB format | Integration | P0 | 1. Submit ROI lead<br>2. Query form_data column<br>3. Verify JSON structure | form_data is valid JSON with inputs/results | `validROICalculatorData` |
| **LEAD-INT-009** | Lead score calculated | Integration | P1 | 1. Submit ROI lead with high savings<br>2. Query lead_score<br>3. Verify score > 0 | lead_score assigned based on ROI | High savings data |

---

## 3. Authentication Tests

### 3.1 POST /api/v1/auth/login

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **AUTH-FUNC-001** | Login with valid credentials | Functional | P0 | 1. Send POST with correct email/password<br>2. Verify tokens returned | 200 OK<br>Returns accessToken, refreshToken<br>Tokens are valid JWTs | `email: admin@roaya.co, password: correct` |
| **AUTH-FUNC-002** | Access token contains user data | Functional | P0 | 1. Login<br>2. Decode accessToken<br>3. Verify payload | Token contains: sub, email, role, exp, iat | Decoded JWT payload |
| **AUTH-FUNC-003** | Refresh token stored in database | Functional | P0 | 1. Login<br>2. Query refresh_tokens table<br>3. Verify entry exists | refresh_tokens row with user_id, token_hash | Check DB after login |
| **AUTH-NEG-012** | Login with incorrect password | Negative | P0 | 1. Send POST with wrong password<br>2. Check error | 401 Unauthorized<br>Error: "Invalid credentials" | `password: "wrongpassword"` |
| **AUTH-NEG-013** | Login with non-existent email | Negative | P0 | 1. Send POST with unknown email<br>2. Check error | 401 Unauthorized<br>Error: "Invalid credentials" | `email: "notfound@roaya.co"` |
| **AUTH-NEG-014** | Login with missing email field | Negative | P0 | 1. Send POST without email<br>2. Check validation | 400 Bad Request<br>Error: "email required" | `{ password: "..." }` |
| **AUTH-NEG-015** | Login with missing password field | Negative | P0 | 1. Send POST without password<br>2. Check validation | 400 Bad Request<br>Error: "password required" | `{ email: "..." }` |
| **AUTH-INT-010** | Failed login increments attempt counter | Integration | P0 | 1. Login with wrong password 5 times<br>2. Check DB or cache<br>3. Verify counter | Failed attempt counter = 5 | Wrong password x5 |
| **AUTH-INT-011** | Account locked after 10 failed attempts | Integration | P0 | 1. Login with wrong password 10 times<br>2. Try with correct password<br>3. Check response | 429 Too Many Requests<br>Error: "Account locked" | Wrong password x10 |
| **AUTH-INT-012** | Last login timestamp updated | Integration | P1 | 1. Login successfully<br>2. Query admin_users.last_login_at<br>3. Verify timestamp | last_login_at updated to current time | Check DB timestamp |
| **AUTH-BOUND-006** | Login with 9 failed attempts (not locked) | Boundary | P1 | 1. Fail 9 times<br>2. Succeed on 10th<br>3. Verify login | 200 OK (still allowed) | 9 failures + 1 success |
| **AUTH-BOUND-007** | Login with exactly 10 failed attempts (locked) | Boundary | P0 | 1. Fail 10 times<br>2. Try 11th time<br>3. Check lock | 429 Too Many Requests | 10 failures |

---

### 3.2 POST /api/v1/auth/refresh

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **AUTH-FUNC-004** | Refresh with valid refresh token | Functional | P0 | 1. Login to get refresh token<br>2. POST to /refresh with token<br>3. Verify new access token | 200 OK<br>New accessToken returned | Valid refresh token |
| **AUTH-FUNC-005** | Old refresh token revoked after use | Functional | P0 | 1. Use refresh token<br>2. Try to reuse same token<br>3. Check rejection | 401 Unauthorized<br>Error: "Token already used" | Used refresh token |
| **AUTH-NEG-016** | Refresh with expired token | Negative | P0 | 1. Use expired refresh token<br>2. Check error | 401 Unauthorized<br>Error: "Token expired" | Expired token (7+ days old) |
| **AUTH-NEG-017** | Refresh with invalid token signature | Negative | P0 | 1. Send POST with tampered token<br>2. Check error | 401 Unauthorized<br>Error: "Invalid token" | Tampered JWT |
| **AUTH-NEG-018** | Refresh with revoked token | Negative | P0 | 1. Revoke token in DB (set revoked_at)<br>2. Try to refresh<br>3. Check error | 401 Unauthorized<br>Error: "Token revoked" | Revoked token |
| **AUTH-INT-013** | New refresh token stored in DB | Integration | P0 | 1. Refresh access token<br>2. Query refresh_tokens table<br>3. Verify new row | New refresh_tokens entry created | After refresh |
| **AUTH-INT-014** | Old refresh token marked as revoked | Integration | P0 | 1. Refresh token<br>2. Query old token row<br>3. Verify revoked_at set | revoked_at timestamp populated | After refresh |

---

### 3.3 POST /api/v1/auth/logout

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **AUTH-FUNC-006** | Logout with valid token | Functional | P0 | 1. Login<br>2. POST to /logout with refresh token<br>3. Verify revocation | 200 OK<br>Message: "Logged out successfully" | Valid session |
| **AUTH-NEG-019** | Logout with already logged out token | Negative | P1 | 1. Logout<br>2. Try to logout again with same token<br>3. Check error | 401 Unauthorized | Already revoked token |
| **AUTH-INT-015** | Logout revokes all user refresh tokens | Integration | P0 | 1. Login from 2 devices (2 refresh tokens)<br>2. Logout from one<br>3. Verify both revoked | All refresh tokens revoked for user | Multi-device scenario |

---

## 4. Admin Lead Management Tests

### 4.1 GET /api/v1/admin/leads

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **ADMIN-FUNC-001** | List leads without authentication | Functional | P0 | 1. GET /admin/leads without Authorization header<br>2. Check error | 401 Unauthorized<br>Error: "Authentication required" | No token |
| **ADMIN-FUNC-002** | List leads with valid token | Functional | P0 | 1. Login<br>2. GET /admin/leads with Bearer token<br>3. Verify response | 200 OK<br>Returns paginated leads array | Valid admin token |
| **ADMIN-FUNC-003** | Default pagination (page=1, limit=20) | Functional | P0 | 1. GET /admin/leads<br>2. Check response structure | Returns max 20 items<br>meta.page=1, meta.limit=20 | No query params |
| **ADMIN-FUNC-004** | Custom pagination (page=2, limit=10) | Functional | P1 | 1. GET /admin/leads?page=2&limit=10<br>2. Verify pagination | Returns items 11-20<br>meta.page=2 | page=2&limit=10 |
| **ADMIN-FUNC-005** | Filter by status | Functional | P0 | 1. GET /admin/leads?status=new<br>2. Verify all returned leads have status="new" | All leads.status_id = "new" | status=new |
| **ADMIN-FUNC-006** | Filter by source | Functional | P0 | 1. GET /admin/leads?source=contact<br>2. Verify source_id | All leads.source_id = "contact" | source=contact |
| **ADMIN-FUNC-007** | Filter by date range | Functional | P1 | 1. GET /admin/leads?dateFrom=2026-01-01&dateTo=2026-01-31<br>2. Verify dates | All leads.created_at within range | Date range params |
| **ADMIN-FUNC-008** | Search by email | Functional | P0 | 1. GET /admin/leads?search=john@example.com<br>2. Verify email match | Returns leads with matching email | search=email |
| **ADMIN-FUNC-009** | Search by company name | Functional | P1 | 1. GET /admin/leads?search=Acme<br>2. Verify company match | Returns leads with "Acme" in company_name | search=Acme |
| **ADMIN-FUNC-010** | Sort by createdAt descending (default) | Functional | P0 | 1. GET /admin/leads<br>2. Verify order | Leads sorted newest first | Default sort |
| **ADMIN-FUNC-011** | Sort by createdAt ascending | Functional | P1 | 1. GET /admin/leads?sortBy=createdAt&sortOrder=asc<br>2. Verify order | Leads sorted oldest first | sortOrder=asc |
| **ADMIN-NEG-020** | Exceed max limit (>100) | Negative | P1 | 1. GET /admin/leads?limit=200<br>2. Check validation | 400 Bad Request<br>Error: "limit max 100" | limit=200 |
| **ADMIN-NEG-021** | Invalid status filter | Negative | P1 | 1. GET /admin/leads?status=invalid<br>2. Check validation | 400 Bad Request | status=invalid |
| **ADMIN-NEG-022** | Invalid date format | Negative | P1 | 1. GET /admin/leads?dateFrom=invalid-date<br>2. Check validation | 400 Bad Request | dateFrom=invalid |
| **ADMIN-INT-016** | Pagination meta includes total count | Integration | P0 | 1. Seed 50 leads<br>2. GET /admin/leads?limit=20<br>3. Check meta | meta.total=50, meta.totalPages=3 | 50 leads in DB |
| **ADMIN-INT-017** | Archived leads excluded by default | Integration | P1 | 1. Archive a lead<br>2. GET /admin/leads<br>3. Verify excluded | Archived lead not in results | is_archived=true |
| **ADMIN-INT-018** | Role-based access: viewer can access | Integration | P0 | 1. Login as viewer role<br>2. GET /admin/leads<br>3. Verify access | 200 OK | viewer role token |
| **ADMIN-INT-019** | Leads include related data (source, status, industry) | Integration | P0 | 1. GET /admin/leads<br>2. Verify joins | Each lead has source.name, status.name, industry.name_en | Check response structure |

---

### 4.2 GET /api/v1/admin/leads/:id

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **ADMIN-FUNC-012** | Get single lead by valid UUID | Functional | P0 | 1. GET /admin/leads/{uuid}<br>2. Verify response | 200 OK<br>Returns full lead object | Existing lead UUID |
| **ADMIN-FUNC-013** | Lead details include services | Functional | P0 | 1. GET /admin/leads/{id}<br>2. Check services array | Lead includes services: [{ id, name_en }] | Lead with multiple services |
| **ADMIN-FUNC-014** | Lead details include activity timeline | Functional | P0 | 1. GET /admin/leads/{id}<br>2. Check activities array | Lead includes activities sorted by date | Lead with history |
| **ADMIN-FUNC-015** | Lead details include email notifications | Functional | P1 | 1. GET /admin/leads/{id}<br>2. Check emails array | Lead includes email_notifications | Lead with sent emails |
| **ADMIN-NEG-023** | Get non-existent lead UUID | Negative | P0 | 1. GET /admin/leads/{random-uuid}<br>2. Check error | 404 Not Found<br>Error: "Lead not found" | Invalid UUID |
| **ADMIN-NEG-024** | Get lead with invalid UUID format | Negative | P1 | 1. GET /admin/leads/not-a-uuid<br>2. Check validation | 400 Bad Request<br>Error: "Invalid UUID" | "not-a-uuid" |
| **ADMIN-NEG-025** | Get archived lead | Negative | P1 | 1. GET /admin/leads/{archived-lead-id}<br>2. Check visibility | 404 Not Found OR returns with is_archived=true flag | Archived lead UUID |

---

### 4.3 PATCH /api/v1/admin/leads/:id

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **ADMIN-FUNC-016** | Update lead status | Functional | P0 | 1. PATCH /admin/leads/{id} with status="contacted"<br>2. Verify update | 200 OK<br>status_id updated | status: "contacted" |
| **ADMIN-FUNC-017** | Update creates activity log | Functional | P0 | 1. Update lead<br>2. Query lead_activities<br>3. Verify "status_changed" activity | Activity with old_value, new_value | Status change |
| **ADMIN-FUNC-018** | Assign lead to user | Functional | P0 | 1. PATCH with assignedTo={user-uuid}<br>2. Verify assignment | 200 OK<br>assigned_to FK set | assignedTo: user UUID |
| **ADMIN-FUNC-019** | Add internal notes | Functional | P1 | 1. PATCH with notes="Follow up Friday"<br>2. Verify storage | 200 OK<br>Notes stored | notes: "text" |
| **ADMIN-FUNC-020** | Mark lead as qualified | Functional | P0 | 1. PATCH with is_qualified=true<br>2. Verify flag | 200 OK<br>is_qualified=true | is_qualified: true |
| **ADMIN-NEG-026** | Update with invalid status code | Negative | P0 | 1. PATCH with status="invalid"<br>2. Check validation | 400 Bad Request<br>Error: "Invalid status" | status: "invalid" |
| **ADMIN-NEG-027** | Update with invalid user UUID for assignment | Negative | P1 | 1. PATCH with assignedTo={non-existent-uuid}<br>2. Check error | 400 Bad Request<br>Error: "User not found" | Invalid UUID |
| **ADMIN-NEG-028** | Viewer role attempts update | Negative | P0 | 1. Login as viewer<br>2. PATCH lead<br>3. Check authorization | 403 Forbidden<br>Error: "Insufficient permissions" | Viewer role token |
| **ADMIN-INT-020** | Status update triggers activity log | Integration | P0 | 1. Update status new→contacted<br>2. Query lead_activities<br>3. Verify entry | activity_type="status_changed", old_value="new", new_value="contacted" | Status transition |
| **ADMIN-INT-021** | Assignment triggers activity log | Integration | P1 | 1. Assign lead to user<br>2. Check activity log | activity_type="assigned", performed_by={admin-uuid} | Assignment action |
| **ADMIN-INT-022** | Concurrent updates handled (optimistic locking) | Integration | P2 | 1. Two admins update same lead simultaneously<br>2. Verify conflict resolution | One succeeds, one gets conflict error | Concurrent requests |

---

### 4.4 POST /api/v1/admin/leads/export

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **ADMIN-FUNC-021** | Export all leads to CSV | Functional | P0 | 1. POST /admin/leads/export with format="csv"<br>2. Verify file | 200 OK<br>Returns CSV file<br>Content-Type: text/csv | format: "csv" |
| **ADMIN-FUNC-022** | Export filtered leads (by status) | Functional | P1 | 1. POST with filters: { status: "qualified" }<br>2. Verify only qualified leads in CSV | CSV contains only qualified leads | filters: { status: "qualified" } |
| **ADMIN-FUNC-023** | Export with date range filter | Functional | P1 | 1. POST with dateFrom/dateTo<br>2. Verify date filtering | CSV contains only leads in date range | Date range filter |
| **ADMIN-FUNC-024** | CSV includes all relevant fields | Functional | P0 | 1. Export leads<br>2. Verify CSV columns | Columns: name, email, company, status, source, created_at, etc. | Check CSV headers |
| **ADMIN-NEG-029** | Export with invalid format | Negative | P1 | 1. POST with format="pdf"<br>2. Check validation | 400 Bad Request<br>Error: "Invalid format" | format: "pdf" |
| **ADMIN-NEG-030** | Viewer role attempts export | Negative | P1 | 1. Login as viewer<br>2. POST to export<br>3. Check authorization | 403 Forbidden | Viewer role |
| **ADMIN-INT-023** | Export logs activity | Integration | P1 | 1. Export leads<br>2. Query lead_activities (or audit log)<br>3. Verify "exported" entry | Activity logged for export action | Check activity log |
| **ADMIN-INT-024** | Export handles large dataset (1000+ leads) | Integration | P1 | 1. Seed 1000 leads<br>2. Export all<br>3. Verify performance | Export completes in <5 seconds<br>All leads in file | 1000 leads |

---

## 5. Email Notification Tests

### 5.1 Admin Notification Email

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **EMAIL-FUNC-001** | Admin email queued on lead submission | Functional | P0 | 1. Submit lead<br>2. Check email_notifications table<br>3. Verify entry | Email row with type="admin_alert", status="pending" | Contact form submission |
| **EMAIL-FUNC-002** | Admin email sent within 1 minute | Functional | P0 | 1. Submit lead<br>2. Wait for email queue processor<br>3. Check email in inbox (Mailtrap) | Email received with correct subject and content | Real email check |
| **EMAIL-FUNC-003** | Admin email contains lead details | Functional | P0 | 1. Submit lead<br>2. Open received email<br>3. Verify content | Email includes: name, email, phone, company, message, CTA link to dashboard | Check email body |
| **EMAIL-FUNC-004** | Admin email subject includes company name | Functional | P1 | 1. Submit lead from "Acme Corp"<br>2. Check email subject | Subject: "[NEW LEAD] Acme Corp via Contact Form" | Company name in subject |
| **EMAIL-INT-025** | Failed email retries up to 3 times | Integration | P0 | 1. Simulate SendGrid failure<br>2. Trigger email send<br>3. Check retry_count | retry_count increments to 3, then status="failed" | Mock SendGrid error |
| **EMAIL-INT-026** | Email status updated on successful delivery | Integration | P0 | 1. Send email successfully<br>2. Query email_notifications<br>3. Verify status | status="sent", sent_at timestamp populated | Successful send |
| **EMAIL-INT-027** | Email delivery webhook updates status | Integration | P1 | 1. Send email<br>2. Simulate SendGrid webhook callback<br>3. Check status | status="delivered", delivered_at populated | Webhook simulation |
| **EMAIL-NEG-031** | Email fails after max retries | Negative | P0 | 1. Simulate persistent failure<br>2. Trigger 3 retries<br>3. Verify final status | status="failed", retry_count=3 | Persistent error |

---

### 5.2 Customer Confirmation Email

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **EMAIL-FUNC-005** | Customer email queued on lead submission | Functional | P0 | 1. Submit lead<br>2. Check email_notifications<br>3. Verify entry | Email row with type="lead_confirmation", recipient=customer email | Contact submission |
| **EMAIL-FUNC-006** | English template used for language=en | Functional | P0 | 1. Submit lead with language="en"<br>2. Check email template used | template_name="customer_confirmation_en" | language: "en" |
| **EMAIL-FUNC-007** | Arabic template used for language=ar | Functional | P0 | 1. Submit lead with language="ar"<br>2. Check email template | template_name="customer_confirmation_ar" | language: "ar" |
| **EMAIL-FUNC-008** | Customer email personalizes with name | Functional | P1 | 1. Submit lead with name="John Doe"<br>2. Check email content | Email starts with "Dear John Doe" | name in email |
| **EMAIL-FUNC-009** | Customer email includes "24-48 hour" response time | Functional | P1 | 1. Send customer email<br>2. Check content | Email mentions "24-48 business hours" | Check email body |
| **EMAIL-INT-028** | Customer email sent to correct address | Integration | P0 | 1. Submit lead with email=test@example.com<br>2. Check email_notifications.recipient_email | recipient_email = "test@example.com" | Verify recipient |

---

## 6. Security Tests

### 6.1 Authentication Security

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **SEC-FUNC-001** | JWT token signature validation | Security | P0 | 1. Create valid token<br>2. Modify payload<br>3. Try to use token | 401 Unauthorized<br>Error: "Invalid signature" | Tampered token |
| **SEC-FUNC-002** | Expired access token rejected | Security | P0 | 1. Use token older than 15 min<br>2. Try to access admin endpoint | 401 Unauthorized<br>Error: "Token expired" | Expired token |
| **SEC-FUNC-003** | Bearer token required in Authorization header | Security | P0 | 1. Call admin endpoint without header<br>2. Check error | 401 Unauthorized | No Authorization header |
| **SEC-FUNC-004** | Role-based access: sales can edit leads | Security | P0 | 1. Login as sales role<br>2. PATCH lead<br>3. Verify access | 200 OK | sales role |
| **SEC-FUNC-005** | Role-based access: viewer cannot edit leads | Security | P0 | 1. Login as viewer<br>2. PATCH lead<br>3. Check denial | 403 Forbidden | viewer role |
| **SEC-NEG-032** | Malformed JWT rejected | Security | P0 | 1. Send Authorization: Bearer "not-a-jwt"<br>2. Check error | 401 Unauthorized | Invalid JWT format |
| **SEC-NEG-033** | Token for different user cannot access others' data | Security | P0 | 1. Login as user A<br>2. Try to update lead assigned to user B<br>3. Verify isolation | 403 Forbidden (if strict ownership enforced) | Different users |

---

### 6.2 Input Validation Security

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **SEC-FUNC-006** | SQL injection prevented in search | Security | P0 | 1. GET /admin/leads?search='; DROP TABLE leads;--<br>2. Verify no SQL execution | 200 OK<br>No database affected<br>Returns empty or safe results | SQL injection string |
| **SEC-FUNC-007** | XSS prevented in form submission | Security | P0 | 1. Submit lead with message=`<script>alert('XSS')</script>`<br>2. Retrieve lead<br>3. Verify sanitization | Script tags removed or escaped | XSS payload |
| **SEC-FUNC-008** | Command injection prevented | Security | P0 | 1. Submit form with name=`$(whoami)`<br>2. Verify no command execution | Stored as plain text | Command injection |
| **SEC-FUNC-009** | Path traversal prevented in export | Security | P1 | 1. POST export with filename="../../../etc/passwd"<br>2. Verify rejection | 400 Bad Request or safe handling | Path traversal attempt |
| **SEC-FUNC-010** | Email header injection prevented | Security | P0 | 1. Submit lead with email="test@example.com\nBCC: attacker@evil.com"<br>2. Verify sanitization | Email validation rejects or sanitizes | Email header injection |

---

### 6.3 Rate Limiting Security

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **SEC-FUNC-011** | Form submission rate limit (5 per 15 min) | Security | P0 | 1. Submit 5 contact forms from same IP<br>2. Attempt 6th submission<br>3. Check rejection | 429 Too Many Requests<br>Error: "Rate limit exceeded" | 6 rapid submissions |
| **SEC-FUNC-012** | Login rate limit (5 per 15 min) | Security | P0 | 1. Attempt 5 failed logins<br>2. Try 6th attempt<br>3. Verify block | 429 Too Many Requests | 6 login attempts |
| **SEC-FUNC-013** | Rate limit resets after time window | Security | P1 | 1. Hit rate limit<br>2. Wait 15 minutes<br>3. Try again | 201 Created (allowed) | Wait 15 min |
| **SEC-INT-029** | Rate limit uses Redis for distributed tracking | Integration | P1 | 1. Submit from IP<br>2. Query Redis for key<br>3. Verify counter | Redis key exists with TTL=900s | Check Redis |
| **SEC-NEG-034** | Rate limit cannot be bypassed with different User-Agent | Security | P0 | 1. Hit rate limit<br>2. Change User-Agent header<br>3. Try again | 429 Too Many Requests (still blocked) | Change User-Agent |

---

### 6.4 Data Protection

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Test Data |
|---------|-------|------|----------|------------|-----------------|-----------|
| **SEC-FUNC-014** | Passwords hashed with bcrypt | Security | P0 | 1. Create admin user<br>2. Query password_hash<br>3. Verify bcrypt format | password_hash starts with "$2b$12$" | Check DB |
| **SEC-FUNC-015** | Sensitive data not logged | Security | P0 | 1. Submit lead with email/phone<br>2. Check application logs<br>3. Verify no PII | Logs do not contain email addresses, phone numbers | Review logs |
| **SEC-FUNC-016** | CORS restricted to allowed origins | Security | P0 | 1. Send request with Origin: https://evil.com<br>2. Check CORS headers | Access-Control-Allow-Origin does NOT include evil.com | CORS check |
| **SEC-FUNC-017** | HTTPS enforced (redirect HTTP to HTTPS) | Security | P0 | 1. Access http://api.roaya.co<br>2. Verify redirect | 301 Redirect to https:// | HTTP request |
| **SEC-FUNC-018** | Helmet security headers present | Security | P0 | 1. Make any API request<br>2. Check response headers | Headers include: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security | Check headers |

---

## 7. Performance Tests

### 7.1 Response Time Tests

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Metrics |
|---------|-------|------|----------|------------|-----------------|---------|
| **PERF-FUNC-001** | Lead submission response time | Performance | P0 | 1. Submit 100 leads sequentially<br>2. Measure response time | p95 < 200ms<br>p99 < 300ms | Response time distribution |
| **PERF-FUNC-002** | Admin list leads response time | Performance | P0 | 1. Seed 1000 leads<br>2. GET /admin/leads (page 1)<br>3. Measure time | p95 < 500ms | Response time |
| **PERF-FUNC-003** | Database query performance | Performance | P1 | 1. Seed 10,000 leads<br>2. Run complex filter query<br>3. Measure time | Query time < 100ms | Query execution time |
| **PERF-INT-030** | Email queue processing time | Performance | P1 | 1. Queue 100 emails<br>2. Start queue processor<br>3. Measure completion | All 100 emails processed in < 2 minutes | Processing throughput |

---

### 7.2 Load Tests

| Test ID | Title | Type | Priority | Test Steps | Expected Result | Metrics |
|---------|-------|------|----------|------------|-----------------|---------|
| **PERF-FUNC-004** | Handle 100 concurrent users | Performance | P0 | 1. Simulate 100 concurrent form submissions<br>2. Measure success rate | 0% error rate<br>All requests succeed | Success rate, errors |
| **PERF-FUNC-005** | Handle 500 concurrent users (stress test) | Performance | P1 | 1. Simulate 500 concurrent users<br>2. Identify breaking point | System gracefully degrades<br>No crashes | Max throughput |
| **PERF-FUNC-006** | Sustained load (1 hour) | Performance | P1 | 1. Maintain 50 concurrent users for 1 hour<br>2. Monitor performance | No memory leaks<br>Stable response times | Memory usage, response time trend |

---

## Test Execution Summary

### Execution Phases

| Phase | Test Types | Duration | Environment |
|-------|-----------|----------|-------------|
| **Phase 1: Unit** | LEAD-NEG, AUTH-NEG, Validators | 2 days | Local |
| **Phase 2: Integration** | LEAD-INT, AUTH-INT, ADMIN-INT, EMAIL-INT | 3 days | CI + Local PostgreSQL |
| **Phase 3: E2E** | LEAD-E2E, ADMIN-E2E | 2 days | Staging |
| **Phase 4: Security** | SEC-FUNC, SEC-NEG, SEC-INT | 2 days | Staging + Security tools |
| **Phase 5: Performance** | PERF-FUNC | 1 day | Staging (isolated) |
| **Phase 6: UAT** | Manual exploratory | 2 days | Staging |

### Total Test Cases

| Category | Functional | Negative | Boundary | Integration | Security | Performance | **Total** |
|----------|------------|----------|----------|-------------|----------|-------------|-----------|
| **Lead Submission** | 11 | 11 | 7 | 9 | - | - | **38** |
| **Authentication** | 6 | 8 | 2 | 6 | 6 | - | **28** |
| **Admin Management** | 21 | 8 | - | 6 | - | - | **35** |
| **Email Notifications** | 9 | 1 | - | 4 | - | - | **14** |
| **Security** | 18 | 2 | - | 1 | - | - | **21** |
| **Performance** | 6 | - | - | 1 | - | - | **7** |
| **TOTAL** | **71** | **30** | **9** | **27** | **6** | **0** | **143** |

---

## Appendix: Test Data Files

All test data fixtures are located in:
- `/memory-bank/project/testing/sample-tests/fixtures/`

---

**Document Version:** 1.0
**Last Updated:** 2026-01-21
**Next Review:** After implementation starts

---

*This test case matrix provides comprehensive coverage of all API endpoints and critical business flows. All test cases should be implemented in the order specified in the execution phases.*
