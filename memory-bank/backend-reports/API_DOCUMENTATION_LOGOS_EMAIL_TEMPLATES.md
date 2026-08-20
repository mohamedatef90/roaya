# Logos and Email Templates API Documentation

## Overview

This document provides complete API documentation for the Logos and Email Templates management endpoints in the Roaya Lead Management System.

**Base URL**: `http://localhost:3001/api/v1`

---

## Table of Contents

1. [Logos API](#logos-api)
2. [Email Templates API](#email-templates-api)
3. [Data Models](#data-models)
4. [Authentication](#authentication)
5. [Error Responses](#error-responses)

---

## Logos API

### 1. List Logos

Get a list of logos with optional filters.

**Endpoint**: `GET /admin/logos`

**Query Parameters**:
- `category` (optional): Filter by category (CLIENT, PARTNER, TECHNOLOGY, CERTIFICATION)
- `section` (optional): Filter by section (hero, footer, about, services)
- `isActive` (optional): Filter by active status (true/false)

**Public Access**: Yes (filters to active logos only when unauthenticated)

**Example Request**:
```bash
GET /admin/logos?category=CLIENT&isActive=true
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Acme Corporation",
      "imageUrl": "https://cdn.roaya.ai/logos/acme-logo.png",
      "darkModeUrl": "https://cdn.roaya.ai/logos/acme-logo-dark.png",
      "category": "CLIENT",
      "sections": ["hero", "footer"],
      "websiteUrl": "https://acme.com",
      "altTextEn": "Acme Corporation Logo",
      "altTextAr": "شعار شركة أكمي",
      "isActive": true,
      "displayOrder": 0,
      "createdAt": "2026-01-26T10:00:00.000Z",
      "updatedAt": "2026-01-26T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Logo by ID

Get a specific logo by ID.

**Endpoint**: `GET /admin/logos/:id`

**Authentication**: Required (Admin)

**Example Request**:
```bash
GET /admin/logos/uuid-here
Authorization: Bearer <access_token>
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Acme Corporation",
    "imageUrl": "https://cdn.roaya.ai/logos/acme-logo.png",
    "darkModeUrl": "https://cdn.roaya.ai/logos/acme-logo-dark.png",
    "category": "CLIENT",
    "sections": ["hero", "footer"],
    "websiteUrl": "https://acme.com",
    "altTextEn": "Acme Corporation Logo",
    "altTextAr": "شعار شركة أكمي",
    "isActive": true,
    "displayOrder": 0,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 3. Create Logo

Create a new logo.

**Endpoint**: `POST /admin/logos`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "imageUrl": "https://cdn.roaya.ai/logos/acme-logo.png",
  "darkModeUrl": "https://cdn.roaya.ai/logos/acme-logo-dark.png",
  "category": "CLIENT",
  "sections": ["hero", "footer"],
  "websiteUrl": "https://acme.com",
  "altTextEn": "Acme Corporation Logo",
  "altTextAr": "شعار شركة أكمي",
  "displayOrder": 0
}
```

**Field Validations**:
- `name`: Required, 1-200 characters
- `imageUrl`: Required, valid URL
- `darkModeUrl`: Optional, valid URL
- `category`: Required, enum (CLIENT, PARTNER, TECHNOLOGY, CERTIFICATION)
- `sections`: Optional, array of strings
- `websiteUrl`: Optional, valid URL
- `altTextEn`: Optional, string
- `altTextAr`: Optional, string
- `displayOrder`: Optional, integer >= 0

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "name": "Acme Corporation",
    "imageUrl": "https://cdn.roaya.ai/logos/acme-logo.png",
    "darkModeUrl": "https://cdn.roaya.ai/logos/acme-logo-dark.png",
    "category": "CLIENT",
    "sections": ["hero", "footer"],
    "websiteUrl": "https://acme.com",
    "altTextEn": "Acme Corporation Logo",
    "altTextAr": "شعار شركة أكمي",
    "isActive": true,
    "displayOrder": 0,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 4. Update Logo

Update an existing logo.

**Endpoint**: `PATCH /admin/logos/:id`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "isActive": false,
  "displayOrder": 5
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Updated Name",
    "imageUrl": "https://cdn.roaya.ai/logos/acme-logo.png",
    "darkModeUrl": "https://cdn.roaya.ai/logos/acme-logo-dark.png",
    "category": "CLIENT",
    "sections": ["hero", "footer"],
    "websiteUrl": "https://acme.com",
    "altTextEn": "Acme Corporation Logo",
    "altTextAr": "شعار شركة أكمي",
    "isActive": false,
    "displayOrder": 5,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T11:00:00.000Z"
  }
}
```

---

### 5. Delete Logo

Delete a logo.

**Endpoint**: `DELETE /admin/logos/:id`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Example Response**:
```json
{
  "success": true,
  "message": "Logo deleted successfully"
}
```

---

### 6. Reorder Logos

Bulk reorder logos by providing an ordered array of IDs.

**Endpoint**: `PATCH /admin/logos-reorder`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body**:
```json
{
  "orderedIds": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Logos reordered successfully"
}
```

---

### 7. Toggle Logo Active Status

Toggle the active status of a logo.

**Endpoint**: `PATCH /admin/logos/:id/toggle-active`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Acme Corporation",
    "isActive": false,
    ...
  }
}
```

---

## Email Templates API

### 1. List Email Templates

Get a list of email templates with optional filters.

**Endpoint**: `GET /admin/email-templates`

**Authentication**: Required (All authenticated users)

**Query Parameters**:
- `category` (optional): Filter by category (TRANSACTIONAL, MARKETING, NOTIFICATION)
- `isActive` (optional): Filter by active status (true/false)

**Example Request**:
```bash
GET /admin/email-templates?category=TRANSACTIONAL&isActive=true
Authorization: Bearer <access_token>
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "lead_confirmation",
      "category": "TRANSACTIONAL",
      "subjectEn": "Thank you for contacting Roaya AI",
      "subjectAr": "شكراً لتواصلك مع روايا AI",
      "contentHtmlEn": "<html>...</html>",
      "contentHtmlAr": "<html>...</html>",
      "contentTextEn": "Thank you...",
      "contentTextAr": "شكراً...",
      "variables": ["firstName", "email"],
      "isActive": true,
      "createdAt": "2026-01-26T10:00:00.000Z",
      "updatedAt": "2026-01-26T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Email Template by ID

Get a specific email template by ID.

**Endpoint**: `GET /admin/email-templates/:id`

**Authentication**: Required (All authenticated users)

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "lead_confirmation",
    "category": "TRANSACTIONAL",
    "subjectEn": "Thank you for contacting Roaya AI",
    "subjectAr": "شكراً لتواصلك مع روايا AI",
    "contentHtmlEn": "<html><body><p>Dear {{firstName}},</p><p>Thank you for contacting us...</p></body></html>",
    "contentHtmlAr": "<html><body><p>عزيزي {{firstName}}،</p><p>شكراً لتواصلك معنا...</p></body></html>",
    "contentTextEn": "Dear {{firstName}}, Thank you for contacting us...",
    "contentTextAr": "عزيزي {{firstName}}، شكراً لتواصلك معنا...",
    "variables": ["firstName", "email"],
    "isActive": true,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 3. Create Email Template

Create a new email template.

**Endpoint**: `POST /admin/email-templates`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body**:
```json
{
  "name": "welcome_email",
  "category": "MARKETING",
  "subjectEn": "Welcome to Roaya AI",
  "subjectAr": "مرحباً بك في روايا AI",
  "contentHtmlEn": "<html><body><h1>Welcome {{firstName}}!</h1><p>We're excited to have you...</p></body></html>",
  "contentHtmlAr": "<html><body><h1>مرحباً {{firstName}}!</h1><p>يسعدنا انضمامك...</p></body></html>",
  "contentTextEn": "Welcome {{firstName}}! We're excited to have you...",
  "contentTextAr": "مرحباً {{firstName}}! يسعدنا انضمامك...",
  "variables": ["firstName", "email", "companyName"]
}
```

**Field Validations**:
- `name`: Required, 1-200 characters, unique
- `category`: Required, enum (TRANSACTIONAL, MARKETING, NOTIFICATION)
- `subjectEn`: Required
- `subjectAr`: Required
- `contentHtmlEn`: Required
- `contentHtmlAr`: Required
- `contentTextEn`: Optional
- `contentTextAr`: Optional
- `variables`: Optional, array of strings

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "name": "welcome_email",
    "category": "MARKETING",
    "subjectEn": "Welcome to Roaya AI",
    "subjectAr": "مرحباً بك في روايا AI",
    "contentHtmlEn": "<html>...</html>",
    "contentHtmlAr": "<html>...</html>",
    "contentTextEn": "Welcome...",
    "contentTextAr": "مرحباً...",
    "variables": ["firstName", "email", "companyName"],
    "isActive": true,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 4. Update Email Template

Update an existing email template.

**Endpoint**: `PATCH /admin/email-templates/:id`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body** (all fields optional):
```json
{
  "subjectEn": "Updated Subject",
  "isActive": true
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "welcome_email",
    "subjectEn": "Updated Subject",
    ...
  }
}
```

---

### 5. Delete Email Template

Delete an email template.

**Endpoint**: `DELETE /admin/email-templates/:id`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Example Response**:
```json
{
  "success": true,
  "message": "Email template deleted successfully"
}
```

---

### 6. Send Test Email

Send a test email using a template with sample data.

**Endpoint**: `POST /admin/email-templates/:id/test`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Request Body**:
```json
{
  "recipientEmail": "test@example.com",
  "language": "en"
}
```

**Field Validations**:
- `recipientEmail`: Required, valid email
- `language`: Optional, enum ('en', 'ar'), default 'en'

**Example Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Test email sent successfully"
  }
}
```

---

### 7. Toggle Email Template Active Status

Toggle the active status of an email template.

**Endpoint**: `PATCH /admin/email-templates/:id/toggle-active`

**Authentication**: Required (ADMIN or SUPER_ADMIN)

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "welcome_email",
    "isActive": false,
    ...
  }
}
```

---

## Data Models

### Logo Model

```typescript
{
  id: string;              // UUID
  name: string;            // Logo name
  imageUrl: string;        // URL to logo image
  darkModeUrl?: string;    // URL to dark mode variant
  category: LogoCategory;  // CLIENT | PARTNER | TECHNOLOGY | CERTIFICATION
  sections: string[];      // Sections where logo appears (hero, footer, about, services)
  websiteUrl?: string;     // Optional link to company website
  altTextEn?: string;      // English alt text for accessibility
  altTextAr?: string;      // Arabic alt text for accessibility
  isActive: boolean;       // Whether logo is active
  displayOrder: number;    // Order for display (lower = first)
  createdAt: Date;
  updatedAt: Date;
}
```

### Email Template Model

```typescript
{
  id: string;                      // UUID
  name: string;                    // Unique template identifier (e.g., 'lead_confirmation')
  category: EmailTemplateCategory; // TRANSACTIONAL | MARKETING | NOTIFICATION
  subjectEn: string;               // English subject line
  subjectAr: string;               // Arabic subject line
  contentHtmlEn: string;           // English HTML content
  contentHtmlAr: string;           // Arabic HTML content
  contentTextEn?: string;          // English plain text fallback
  contentTextAr?: string;          // Arabic plain text fallback
  variables: string[];             // List of template variables (e.g., ['firstName', 'email'])
  isActive: boolean;               // Whether template is active
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Authentication

All admin endpoints require authentication using JWT bearer tokens.

**Header Format**:
```
Authorization: Bearer <access_token>
```

**Role Requirements**:
- **Public**: Logo list endpoint (filters to active only)
- **All Authenticated Users**: View logos and email templates
- **ADMIN / SUPER_ADMIN**: Create, update, delete operations

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ]
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Server error |

### Example Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "imageUrl",
        "code": "INVALID_FORMAT",
        "message": "Please provide a valid URL"
      }
    ]
  }
}
```

---

## Template Variables

Email templates support variable interpolation using `{{variableName}}` syntax.

### Common Variables

- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{email}}` - User's email address
- `{{companyName}}` - Company name
- `{{adminUrl}}` - Link to admin panel
- `{{bookingUrl}}` - Link to booking/contact page
- `{{estimatedValue}}` - Calculated ROI value
- Custom variables defined per template

### Example Template

```html
<p>Dear {{firstName}} {{lastName}},</p>
<p>Thank you for contacting {{companyName}}.</p>
<p>We received your inquiry from {{email}}.</p>
<p><a href="{{adminUrl}}">View in Admin Panel</a></p>
```

---

## Implementation Notes

### Database Schema

Both models use PostgreSQL with the following features:
- UUID primary keys
- Indexed fields for performance (category, isActive)
- Bilingual content support (English and Arabic)
- Soft delete capability (via isActive flag)
- Automatic timestamps (createdAt, updatedAt)

### Performance

- Logo list queries are optimized with indexes on `category` and `isActive`
- Email template queries use unique index on `name` for fast lookup
- Reorder operations use database transactions for atomicity

### Security

- All write operations require ADMIN or SUPER_ADMIN role
- Input validation using Zod schemas
- SQL injection protection via Prisma ORM
- XSS prevention through proper HTML escaping

---

## Migration Details

The database migration adds:
1. `logos` table with LogoCategory enum
2. Updated `email_templates` table with bilingual support
3. EmailTemplateCategory enum
4. Necessary indexes for performance
5. Migration of existing email template data

**Migration File**: `prisma/migrations/003_add_logos_and_email_templates_v2.sql`

---

## Service Layer Architecture

### Logo Service

Located at: `/src/application/services/logo.service.ts`

**Methods**:
- `getLogos(filters)` - List with filters
- `getLogoById(id)` - Single logo retrieval
- `createLogo(data)` - Create new logo
- `updateLogo(id, data)` - Update existing
- `deleteLogo(id)` - Delete logo
- `reorderLogos(orderedIds)` - Bulk reorder
- `toggleActive(id)` - Toggle active status

### Email Template Service

Located at: `/src/application/services/email-template.service.ts`

**Methods**:
- `getTemplates(filters)` - List with filters
- `getTemplateById(id)` - Single template retrieval
- `getTemplateByName(name)` - Get by unique name
- `createTemplate(data)` - Create new template
- `updateTemplate(id, data)` - Update existing
- `deleteTemplate(id)` - Delete template
- `sendTestEmail(id, email, language)` - Send test
- `toggleActive(id)` - Toggle active status

---

## Usage Examples

### Frontend Integration (Angular)

```typescript
// logo.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogoService {
  private apiUrl = 'http://localhost:3001/api/v1/admin';

  constructor(private http: HttpClient) {}

  getLogos(category?: string, section?: string): Observable<any> {
    const params: any = { isActive: true };
    if (category) params.category = category;
    if (section) params.section = section;
    return this.http.get(`${this.apiUrl}/logos`, { params });
  }

  createLogo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/logos`, data);
  }

  updateLogo(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/logos/${id}`, data);
  }

  deleteLogo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/logos/${id}`);
  }

  reorderLogos(orderedIds: string[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/logos-reorder`, { orderedIds });
  }
}
```

---

## Testing

### cURL Examples

**Create Logo**:
```bash
curl -X POST http://localhost:3001/api/v1/admin/logos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "imageUrl": "https://example.com/logo.png",
    "category": "CLIENT",
    "sections": ["hero"]
  }'
```

**Send Test Email**:
```bash
curl -X POST http://localhost:3001/api/v1/admin/email-templates/{id}/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "language": "en"
  }'
```

---

*Generated: 2026-01-26*
*Backend Version: 1.0.0*
*API Version: v1*
