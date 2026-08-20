# Lead Management System - New Developer Guide

> Complete onboarding guide for developers joining the Roaya Lead Management System project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Environment Setup](#local-environment-setup)
5. [Running the Application](#running-the-application)
6. [Application URLs Map](#application-urls-map)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Database Schema](#database-schema)
9. [Authentication Flow](#authentication-flow)
10. [Testing](#testing)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

The Lead Management System is a full-stack application for capturing, tracking, and managing sales leads for Roaya AI. It consists of:

- **Backend API**: Node.js/Express REST API with PostgreSQL database
- **Admin Panel**: Angular frontend for lead management
- **Public Website**: Angular frontend with lead capture forms

### Key Features

- Lead capture from multiple sources (contact forms, pricing page, ROI calculator)
- Admin dashboard with statistics and analytics
- Lead status management pipeline (New → Contacted → Qualified → Won/Lost)
- Role-based access control (Super Admin, Sales Manager, Sales Rep)
- Email notifications via SendGrid
- Real-time updates with Redis caching

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v20+ | Runtime environment |
| Express.js | v4.x | Web framework |
| TypeScript | v5.x | Type safety |
| PostgreSQL | v16 | Primary database |
| Prisma | v5.x | ORM and migrations |
| Redis | v7+ | Caching and job queues |
| JWT | - | Authentication |
| Zod | - | Request validation |
| BullMQ | - | Email queue processing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | v19 | Frontend framework |
| TypeScript | v5.x | Type safety |
| Tailwind CSS | v3.x | Styling |
| ngx-translate | - | i18n (EN/AR) |

---

## Project Structure

```
roaya/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── index.ts           # Entry point
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routes/    # API routes
│   │   │       ├── controllers/
│   │   │       └── middlewares/
│   │   ├── application/
│   │   │   └── services/      # Business logic
│   │   ├── config/            # Database, Redis config
│   │   ├── domain/
│   │   │   └── entities/      # Domain models
│   │   └── infrastructure/
│   │       └── email/         # Email service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts            # Seed data
│   ├── tests/                 # Test files
│   ├── .env                   # Environment variables
│   └── package.json
│
├── roaya-website/              # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/  # API services
│   │   │   │   ├── guards/    # Auth guards
│   │   │   │   └── interceptors/
│   │   │   ├── features/
│   │   │   │   └── admin/     # Admin panel module
│   │   │   └── shared/        # Shared components
│   │   ├── assets/
│   │   │   └── i18n/          # Translation files
│   │   └── environments/
│   └── package.json
│
└── memory-bank/                # Documentation
    └── backend-reports/       # Technical reports
```

---

## Local Environment Setup

### Prerequisites

Install the following on your machine:

```bash
# Check versions
node --version    # Should be v20+
npm --version     # Should be v10+
psql --version    # Should be v14+
redis-cli --version  # Should be v7+
```

### Install Prerequisites (macOS)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Install PostgreSQL
brew install postgresql@16

# Install Redis
brew install redis

# Install Angular CLI globally
npm install -g @angular/cli
```

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd roaya

# Setup Backend
cd backend
npm install
cp .env.example .env  # Then edit .env with your values

# Setup Frontend
cd ../roaya-website
npm install
```

### Database Setup

```bash
# Start PostgreSQL
brew services start postgresql@16

# Create database
/opt/homebrew/opt/postgresql@16/bin/createdb roaya_leads

# Create postgres user (if needed)
/opt/homebrew/opt/postgresql@16/bin/psql -d postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';"

# Run migrations
cd backend
npx prisma generate
npx prisma migrate dev

# Seed test data
npm run prisma:seed
```

### Environment Variables

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roaya_leads"

# JWT (must be at least 32 characters)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (optional for local dev)
SENDGRID_API_KEY=
ADMIN_NOTIFICATION_EMAIL=admin@roaya.ai

# CORS
CORS_ORIGIN=http://localhost:4200
```

---

## Running the Application

### Start All Services

```bash
# Terminal 1: Start PostgreSQL & Redis
brew services start postgresql@16
brew services start redis

# Terminal 2: Start Backend
cd /Users/roaya/Roaya-files/Development/roaya/backend
npm run dev
# Backend runs on: http://localhost:3001

# Terminal 3: Start Frontend
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
ng serve
# Frontend runs on: http://localhost:4200
```

### Verify Services

```bash
# Check PostgreSQL
/opt/homebrew/opt/postgresql@16/bin/psql -d roaya_leads -c "SELECT 1"

# Check Redis
redis-cli ping  # Should return PONG

# Check Backend API
curl http://localhost:3001/api/v1/health
```

### Stop All Services

```bash
# Stop servers
lsof -ti :3001 :4200 | xargs kill -9 2>/dev/null

# Stop databases (optional)
brew services stop postgresql@16
brew services stop redis
```

---

## Application URLs Map

### Development URLs

| Application | URL | Description |
|-------------|-----|-------------|
| **Backend API** | http://localhost:3001 | REST API server |
| **API Health** | http://localhost:3001/api/v1/health | Health check endpoint |
| **Frontend** | http://localhost:4200 | Main website |
| **Admin Login** | http://localhost:4200/admin/login | Admin panel login |
| **Admin Dashboard** | http://localhost:4200/admin/dashboard | Admin dashboard |
| **Admin Leads** | http://localhost:4200/admin/leads | Lead management |
| **Prisma Studio** | http://localhost:5555 | Database GUI |

### Admin Panel Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/admin/login` | Login page | No |
| `/admin/dashboard` | Dashboard with stats | Yes |
| `/admin/leads` | Lead list with filters | Yes |
| `/admin/leads/:id` | Single lead details | Yes |
| `/admin/settings` | System settings | Yes (Super Admin) |

### Public Website Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/contact` | Contact form (creates lead) |
| `/pricing` | Pricing page (creates lead) |
| `/roi-calculator` | ROI calculator (creates lead) |

---

## API Endpoints Reference

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/leads/submit` | Submit new lead |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get profile |

### Lead Management (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leads` | List leads (paginated) |
| GET | `/api/v1/leads/:id` | Get single lead |
| PATCH | `/api/v1/leads/:id` | Update lead |
| DELETE | `/api/v1/leads/:id` | Delete lead |
| GET | `/api/v1/leads/stats` | Dashboard statistics |

### Example API Calls

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Submit lead
curl -X POST http://localhost:3001/api/v1/leads/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","source":"CONTACT_FORM"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@roaya.ai","password":"Admin@123456"}'

# Get leads (with token)
TOKEN="your-access-token"
curl http://localhost:3001/api/v1/leads \
  -H "Authorization: Bearer $TOKEN"
```

---

## Database Schema

### Main Tables

```
┌─────────────────┐     ┌─────────────────┐
│     AdminUser   │     │      Lead       │
├─────────────────┤     ├─────────────────┤
│ id (UUID)       │────<│ assignedToId    │
│ email           │     │ id (UUID)       │
│ password        │     │ firstName       │
│ firstName       │     │ lastName        │
│ lastName        │     │ email           │
│ role            │     │ phone           │
│ isActive        │     │ company         │
│ createdAt       │     │ source          │
│ updatedAt       │     │ status          │
└─────────────────┘     │ priority        │
                        │ message         │
┌─────────────────┐     │ createdAt       │
│      Tag        │     └─────────────────┘
├─────────────────┤            │
│ id (UUID)       │            │
│ name            │     ┌──────┴──────┐
│ color           │     │             │
└─────────────────┘     ▼             ▼
        │        ┌─────────────┐ ┌─────────────┐
        │        │ LeadActivity│ │  LeadNote   │
        │        ├─────────────┤ ├─────────────┤
        └───────>│ leadId      │ │ leadId      │
                 │ type        │ │ content     │
                 │ description │ │ createdById │
                 │ createdAt   │ │ createdAt   │
                 └─────────────┘ └─────────────┘
```

### Enums

**LeadStatus**: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`, `ARCHIVED`

**LeadSource**: `CONTACT_FORM`, `PRICING_PAGE`, `ROI_CALCULATOR`, `NEWSLETTER`, `REFERRAL`, `LINKEDIN`, `GOOGLE_ADS`, `ORGANIC`, `OTHER`

**LeadPriority**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

**AdminRole**: `SUPER_ADMIN`, `SALES_MANAGER`, `SALES_REP`

### Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

---

## Authentication Flow

### Login Flow

```
1. User submits email/password to POST /api/v1/auth/login
2. Server validates credentials against AdminUser table
3. Server generates JWT access token (15min) and refresh token (7d)
4. Client stores tokens (localStorage)
5. Client includes access token in Authorization header for protected routes
```

### Token Refresh Flow

```
1. Access token expires (15 minutes)
2. Client sends refresh token to POST /api/v1/auth/refresh
3. Server validates refresh token
4. Server issues new access token
5. Client updates stored token
```

### Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@roaya.ai | Admin@123456 | SUPER_ADMIN |
| sales@roaya.ai | Admin@123456 | SALES_MANAGER |

---

## Testing

### Run Tests

```bash
cd backend

# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/
│   ├── auth.service.test.ts    # Auth service tests
│   └── lead.service.test.ts    # Lead service tests
└── integration/
    ├── auth.api.test.ts        # Auth API tests
    └── leads.api.test.ts       # Leads API tests
```

### Writing Tests

Tests use Vitest with mocked dependencies:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const mockData = { id: 'test-id' };

    // Act
    const result = await someFunction(mockData);

    // Assert
    expect(result).toBeDefined();
  });
});
```

---

## Common Tasks

### Add a New API Endpoint

1. Create route in `src/api/v1/routes/`
2. Create controller in `src/api/v1/controllers/`
3. Add validation schema with Zod
4. Register route in `src/api/v1/routes/index.ts`
5. Add tests

### Add a New Database Table

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate`
4. Update seed file if needed

### Add a New Admin Page

1. Create component in `roaya-website/src/app/features/admin/`
2. Add route in admin routing module
3. Add navigation link in sidebar
4. Implement API service calls

### Debug Database Issues

```bash
# Connect to database
/opt/homebrew/opt/postgresql@16/bin/psql -d roaya_leads

# Common queries
SELECT * FROM "Lead" ORDER BY "createdAt" DESC LIMIT 10;
SELECT * FROM "AdminUser";
SELECT COUNT(*) FROM "Lead" GROUP BY status;
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `EADDRINUSE: port 3001` | Kill process: `lsof -ti :3001 \| xargs kill -9` |
| Database connection failed | Start PostgreSQL: `brew services start postgresql@16` |
| Redis connection failed | Start Redis: `brew services start redis` |
| Prisma client not found | Run `npx prisma generate` |
| JWT errors | Ensure JWT_SECRET is at least 32 characters |
| CORS errors | Check CORS_ORIGIN in .env matches frontend URL |
| 401 Unauthorized | Check token is valid and not expired |
| 422 Validation Error | Check request body matches Zod schema |

### Logs

```bash
# Backend logs are in terminal where npm run dev is running

# Check PostgreSQL logs
tail -f /opt/homebrew/var/log/postgresql@16.log

# Check Redis logs
tail -f /opt/homebrew/var/log/redis.log
```

### Reset Everything

```bash
# Reset database
cd backend
npx prisma migrate reset

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Regenerate Prisma client
npx prisma generate
```

---

## Useful Commands Cheatsheet

```bash
# === Backend ===
npm run dev              # Start dev server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Run linter

# === Database ===
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema without migration
npx prisma generate      # Generate client

# === Frontend ===
ng serve                 # Start dev server
ng build                 # Build for production
ng test                  # Run tests
ng generate component    # Generate component

# === Services ===
brew services list       # List all services
brew services start X    # Start service
brew services stop X     # Stop service
brew services restart X  # Restart service
```

---

## Related Documentation

- [API Access Guide](./API_ACCESS.md) - Detailed API documentation
- [Database Schema](./DATABASE_SCHEMA.md) - Full database documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Architecture details
- [Local Testing Guide](./LOCAL_TESTING_GUIDE.md) - Testing instructions

---

## Getting Help

1. Check this documentation first
2. Review error logs in terminal
3. Check the troubleshooting section
4. Ask team lead or senior developer

---

*Last updated: January 21, 2026*
