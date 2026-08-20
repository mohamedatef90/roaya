# Lead Management System - API Access Guide

## Base URL
```
http://localhost:3001/api/v1
```

---

## Admin Panel Access

### URL
```
http://localhost:4200/admin
```

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@roaya.ai | Admin@123456 |
| Sales Manager | sales@roaya.ai | Admin@123456 |

### Admin Panel Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | http://localhost:4200/admin/login | Admin login page |
| Dashboard | http://localhost:4200/admin/dashboard | Overview with stats and charts |
| Leads List | http://localhost:4200/admin/leads | View and manage all leads |
| Lead Details | http://localhost:4200/admin/leads/:id | View single lead details |

### Start Admin Panel (Angular Frontend)

```bash
# Navigate to frontend directory
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website

# Install dependencies (first time only)
npm install

# Start development server
ng serve
# or
npm start
```

**Opens at:** http://localhost:4200

### Admin Panel Features

- **Dashboard**: View lead statistics, charts, and recent activity
- **Lead Management**: Filter, search, and manage leads
- **Lead Details**: View full lead information, add notes, update status
- **Status Updates**: Change lead status (New → Contacted → Qualified → Won/Lost)
- **Priority Management**: Set lead priority (Low, Medium, High, Urgent)
- **Activity Timeline**: Track all interactions with a lead

---

## Quick Start Commands

### Start All Services
```bash
# 1. Start PostgreSQL
brew services start postgresql@16

# 2. Start Redis
brew services start redis

# 3. Start Backend Server (Terminal 1)
cd /Users/roaya/Roaya-files/Development/roaya/backend
npm run dev
# Runs on: http://localhost:3001

# 4. Start Admin Panel Frontend (Terminal 2)
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
ng serve
# Runs on: http://localhost:4200
```

### Stop Services
```bash
# Stop Backend (kill port 3001)
lsof -ti :3001 | xargs kill -9

# Stop Frontend (kill port 4200)
lsof -ti :4200 | xargs kill -9

# Stop PostgreSQL
brew services stop postgresql@16

# Stop Redis
brew services stop redis
```

### Stop All Services (One Command)
```bash
lsof -ti :3001 :4200 | xargs kill -9 2>/dev/null; brew services stop postgresql@16; brew services stop redis
```

---

## Public Endpoints (No Authentication Required)

### 1. Health Check
```bash
# GET - Check API and services status
curl http://localhost:3001/api/v1/health
```
**Browser URL:** http://localhost:3001/api/v1/health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-21T15:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

---

### 2. Submit Lead (Contact Form)
```bash
# POST - Submit a new lead
curl -X POST http://localhost:3001/api/v1/leads/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "source": "CONTACT_FORM",
    "message": "I am interested in your services"
  }'
```

**Lead Sources:** `CONTACT_FORM`, `PRICING_PAGE`, `ROI_CALCULATOR`, `NEWSLETTER`, `REFERRAL`, `LINKEDIN`, `GOOGLE_ADS`, `ORGANIC`, `OTHER`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "message": "Thank you for your submission. We will contact you shortly."
  }
}
```

---

## Authentication Endpoints

### 3. Login
```bash
# POST - Login and get tokens
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@roaya.ai",
    "password": "Admin@123456"
  }'
```

**Test Accounts:**
| Email | Password | Role |
|-------|----------|------|
| admin@roaya.ai | Admin@123456 | SUPER_ADMIN |
| sales@roaya.ai | Admin@123456 | SALES_MANAGER |

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@roaya.ai",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "SUPER_ADMIN"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": 900
    }
  }
}
```

---

### 4. Refresh Token
```bash
# POST - Refresh access token
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

### 5. Get Profile
```bash
# GET - Get current user profile (requires auth)
curl http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Logout
```bash
# POST - Logout and invalidate tokens
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Protected Endpoints (Authentication Required)

> **Note:** Replace `YOUR_ACCESS_TOKEN` with the token from login response.

### 7. Get All Leads
```bash
# GET - List leads with pagination and filters
curl "http://localhost:3001/api/v1/leads?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With filters
curl "http://localhost:3001/api/v1/leads?status=NEW&source=CONTACT_FORM&priority=HIGH" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
| Parameter | Values |
|-----------|--------|
| page | 1, 2, 3... |
| limit | 10, 20, 50, 100 |
| status | NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, ARCHIVED |
| source | CONTACT_FORM, PRICING_PAGE, ROI_CALCULATOR, etc. |
| priority | LOW, MEDIUM, HIGH, URGENT |
| search | Search by name, email, company |
| sortBy | createdAt, updatedAt, firstName, company |
| sortOrder | asc, desc |

---

### 8. Get Single Lead
```bash
# GET - Get lead by ID
curl http://localhost:3001/api/v1/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9. Update Lead
```bash
# PATCH - Update lead details
curl -X PATCH http://localhost:3001/api/v1/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED",
    "priority": "HIGH",
    "notes": "Called and left voicemail"
  }'
```

---

### 10. Delete Lead
```bash
# DELETE - Remove a lead
curl -X DELETE http://localhost:3001/api/v1/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 11. Get Dashboard Statistics
```bash
# GET - Get lead statistics for dashboard
curl http://localhost:3001/api/v1/leads/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 4,
    "newLeadsToday": 4,
    "newLeadsThisWeek": 4,
    "newLeadsThisMonth": 4,
    "leadsByStatus": {
      "NEW": 2,
      "CONTACTED": 1,
      "QUALIFIED": 1,
      "PROPOSAL": 0,
      "NEGOTIATION": 0,
      "WON": 0,
      "LOST": 0,
      "ARCHIVED": 0
    },
    "leadsBySource": {
      "CONTACT_FORM": 2,
      "PRICING_PAGE": 1,
      "ROI_CALCULATOR": 1
    },
    "conversionRate": 0,
    "averageResponseTime": 0
  }
}
```

---

## Database Tools

### Prisma Studio (Database GUI)
```bash
cd /Users/roaya/Roaya-files/Development/roaya/backend
npx prisma studio
```
**Opens at:** http://localhost:5555

---

## Quick Test Script

Save this as `test-api.sh` and run with `bash test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"

echo "=== Testing Health ==="
curl -s $BASE_URL/health | jq .

echo -e "\n=== Testing Login ==="
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@roaya.ai","password":"Admin@123456"}' \
  | jq -r '.data.tokens.accessToken')

echo "Token: ${TOKEN:0:50}..."

echo -e "\n=== Testing Get Leads ==="
curl -s $BASE_URL/leads -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo -e "\n=== Testing Stats ==="
curl -s $BASE_URL/leads/stats -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Environment Configuration

Location: `/Users/roaya/Roaya-files/Development/roaya/backend/.env`

Key settings:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roaya_leads"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="your-secret-key"
CORS_ORIGIN=http://localhost:4200
```
