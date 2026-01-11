# Admin Panel - Sprint 0 Checklist (Week 0)

**Goal:** Complete all CRITICAL pre-implementation tasks before Sprint 1
**Duration:** 1 week
**Status:** 🔴 NOT STARTED

---

## Overview

Sprint 0 addresses all CRITICAL issues identified by the specialist review team. NO implementation work begins until these items are complete.

**Exit Criteria:**
- ✅ All 17 CRITICAL items resolved
- ✅ Database schema finalized and reviewed
- ✅ API design approved by Tech Lead
- ✅ Infrastructure provisioned and tested
- ✅ CI/CD pipeline working end-to-end

---

## Day 1-2: Database Architecture

### Task 1: Finalize Database Schema with Partitioning
**Owner:** Database Engineer
**Effort:** 2 days
**Priority:** 🔴 CRITICAL

**Checklist:**
- [ ] Create Prisma schema file (`prisma/schema.prisma`)
- [ ] Add partitioning configuration for analytics tables:
  - [ ] `pageviews` (monthly partitions)
  - [ ] `heatmap_clicks` (monthly partitions)
  - [ ] `cursor_movements` (monthly partitions)
- [ ] Add partition creation function (PostgreSQL function)
- [ ] Add automated partition creation cron job logic
- [ ] Document partition management procedure

**Acceptance:**
- Schema compiles without errors
- Partitioning strategy documented
- Monthly partition creation automated

---

### Task 2: Add Missing Tables
**Owner:** Database Engineer
**Effort:** 1 day
**Priority:** 🔴 CRITICAL

**Missing Tables to Add:**
- [ ] `refresh_tokens` (token family tracking)
- [ ] `password_reset_tokens` (reset flow)
- [ ] `blog_categories` (normalized categories)
- [ ] `blog_tags` (normalized tags)
- [ ] `blog_post_tags` (many-to-many)
- [ ] `blog_post_revisions` (content versioning - optional for MVP)
- [ ] `audit_logs` (security audit trail)
- [ ] `system_settings` (key-value config)

**Schema Requirements:**
```prisma
// refresh_tokens table
model RefreshToken {
  id         String   @id @default(uuid())
  familyId   String
  userId     String
  tokenHash  String   @unique
  isUsed     Boolean  @default(false)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([familyId])
  @@index([expiresAt])
}

// blog_categories table
model BlogCategory {
  id           String   @id @default(uuid())
  slug         String   @unique
  name         String
  nameAr       String   @map("name_ar")
  displayOrder Int      @default(0) @map("display_order")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")

  posts BlogPost[]

  @@map("blog_categories")
}

// blog_tags table (similar pattern)
// ... (add remaining tables)
```

**Acceptance:**
- All missing tables added to schema
- Foreign key relationships defined
- Indexes added for performance
- Schema compiles without errors

---

## Day 2-3: API Design & Standards

### Task 3: Define API Versioning Strategy
**Owner:** Backend Engineer
**Effort:** 0.5 days
**Priority:** 🔴 CRITICAL

**Checklist:**
- [ ] Create API versioning ADR (ADR-ADMIN-001)
- [ ] Document URL path versioning strategy: `/api/v1/`
- [ ] Create NestJS global prefix configuration
- [ ] Document version migration strategy
- [ ] Define deprecation policy (6-month sunset)

**Implementation Example:**
```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API versioning
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
}
```

**Acceptance:**
- ADR document created
- Versioning strategy documented
- NestJS configuration defined

---

### Task 4: Define Response Envelope Standard
**Owner:** Backend Engineer
**Effort:** 0.5 days
**Priority:** 🔴 CRITICAL

**Checklist:**
- [ ] Create response envelope ADR (ADR-ADMIN-002)
- [ ] Document success response format
- [ ] Document error response format
- [ ] Create TypeScript interfaces
- [ ] Create NestJS response interceptor
- [ ] Create global exception filter

**Response Formats:**
```typescript
// Success response
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  path?: string;
}
```

**Acceptance:**
- ADR document created
- TypeScript interfaces defined
- Interceptor implementation planned
- Exception filter design documented

---

## Day 3-4: Infrastructure Setup

### Task 5: Create Prisma Schema (Complete)
**Owner:** Backend Engineer
**Effort:** 1 day
**Priority:** 🔴 CRITICAL
**Dependencies:** Task 1, Task 2

**Checklist:**
- [ ] Combine all table definitions into single Prisma schema
- [ ] Add all models:
  - [ ] User (with security fields)
  - [ ] BlogPost (with bilingual fields)
  - [ ] Author
  - [ ] BlogCategory
  - [ ] BlogTag
  - [ ] BlogPostTag
  - [ ] RefreshToken
  - [ ] PasswordResetToken
  - [ ] Pageview (with partitioning annotation)
  - [ ] Session
  - [ ] HeatmapClick
  - [ ] CursorMovement
  - [ ] AuditLog
  - [ ] SystemSetting
- [ ] Add all indexes (performance-critical)
- [ ] Add full-text search indexes
- [ ] Test schema generation: `npx prisma generate`
- [ ] Create initial migration: `npx prisma migrate dev --name init`

**Performance Indexes:**
```prisma
model BlogPost {
  // ... fields

  @@index([status, publishedAt(sort: Desc)])
  @@index([status, updatedAt(sort: Desc), createdBy])
  @@index([slug])
  @@index([categoryId])
}

model Pageview {
  // ... fields

  @@index([timestamp(sort: Desc)])
  @@index([countryCode])
  @@index([sessionId])
}
```

**Acceptance:**
- Schema generates without errors
- Migration creates all tables
- All indexes present
- Foreign keys working

---

### Task 6: Set Up Terraform for Infrastructure
**Owner:** DevOps / Backend Engineer
**Effort:** 1 day
**Priority:** 🟠 HIGH

**Checklist:**
- [ ] Create `terraform/` directory structure
- [ ] Create DigitalOcean provider configuration
- [ ] Define PostgreSQL managed database resource
- [ ] Define Redis managed database resource
- [ ] Define App Platform application resource
- [ ] Define Spaces (object storage) resource
- [ ] Create `variables.tf` for environment-specific values
- [ ] Create `outputs.tf` for resource endpoints
- [ ] Test `terraform plan` (dry run)
- [ ] Document manual steps (if any)

**Directory Structure:**
```
terraform/
├── main.tf                 # Main resources
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── environments/
│   ├── staging.tfvars      # Staging config
│   └── production.tfvars   # Production config
└── README.md               # Setup instructions
```

**Acceptance:**
- Terraform configuration valid
- `terraform plan` succeeds
- Resources documented
- Cost estimate documented

---

### Task 7: Configure CI/CD Pipeline (GitHub Actions)
**Owner:** DevOps / Backend Engineer
**Effort:** 1 day
**Priority:** 🟠 HIGH

**Checklist:**
- [ ] Create `.github/workflows/` directory
- [ ] Create `lint.yml` workflow (ESLint)
- [ ] Create `test.yml` workflow (unit + integration tests)
- [ ] Create `security-scan.yml` workflow (Snyk/npm audit)
- [ ] Create `build.yml` workflow (compile TypeScript)
- [ ] Create `deploy-staging.yml` workflow (auto-deploy on `develop`)
- [ ] Create `deploy-production.yml` workflow (manual approval on `main`)
- [ ] Add required secrets to GitHub repository:
  - [ ] `DIGITALOCEAN_ACCESS_TOKEN`
  - [ ] `DATABASE_URL` (staging)
  - [ ] `DATABASE_URL` (production)
  - [ ] `SNYK_TOKEN`
  - [ ] `SENTRY_DSN`
- [ ] Test CI pipeline with dummy commit

**Pipeline Flow:**
```
Commit → Lint → Test → Security Scan → Build
                                         ↓
                              ┌──────────┴──────────┐
                              ↓                     ↓
                         Staging (auto)     Production (manual)
```

**Acceptance:**
- All workflow files created
- Secrets configured
- Test pipeline run successful
- Documentation updated

---

## Day 4-5: Project Scaffolding

### Task 8: NestJS Project Scaffolding
**Owner:** Backend Engineer
**Effort:** 1 day
**Priority:** 🟠 HIGH
**Dependencies:** Task 3, Task 4, Task 5

**Checklist:**
- [ ] Initialize NestJS project: `nest new roaya-admin-api`
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Install core dependencies:
  - [ ] `@prisma/client`
  - [ ] `@nestjs/passport`
  - [ ] `@nestjs/jwt`
  - [ ] `passport-jwt`
  - [ ] `bcrypt`
  - [ ] `class-validator`
  - [ ] `class-transformer`
  - [ ] `bull` (BullMQ)
  - [ ] `pino` (logging)
  - [ ] `helmet` (security headers)
  - [ ] `express-rate-limit`
- [ ] Create folder structure (Clean Architecture):
  - [ ] `src/auth/`
  - [ ] `src/blog/`
  - [ ] `src/analytics/`
  - [ ] `src/users/`
  - [ ] `src/shared/`
  - [ ] `src/config/`
- [ ] Configure environment variables (`.env.example`)
- [ ] Configure Prisma client injection
- [ ] Configure global prefix: `/api/v1`
- [ ] Configure response interceptor (Task 4)
- [ ] Configure exception filter (Task 4)
- [ ] Test server startup: `npm run start:dev`

**Environment Variables:**
```env
# .env.example
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/roaya_admin
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

IP_HASH_SALT=your-random-salt-here

S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_BUCKET=roaya-admin-uploads
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@roaya.co

SENTRY_DSN=your-sentry-dsn
```

**Acceptance:**
- NestJS server starts without errors
- API versioning working (`/api/v1`)
- Prisma client injectable
- Health check endpoint working: `GET /api/v1/health`

---

### Task 9: Angular Admin Panel Scaffolding
**Owner:** Frontend Engineer
**Effort:** 1 day
**Priority:** 🟠 HIGH

**Checklist:**
- [ ] Initialize Angular project: `ng new roaya-admin-panel`
- [ ] Configure Angular for standalone components
- [ ] Install core dependencies:
  - [ ] `primeng` (UI library)
  - [ ] `primeicons` (icons)
  - [ ] `@ngx-translate/core` (i18n)
  - [ ] `chart.js` + `ng2-charts` (if using Chart.js)
  - [ ] `apexcharts` + `ng-apexcharts` (recommended)
  - [ ] `quill` (rich text editor)
- [ ] Configure Tailwind CSS
- [ ] Configure PrimeNG theme
- [ ] Create folder structure:
  - [ ] `src/app/core/` (services, guards, interceptors)
  - [ ] `src/app/features/` (feature modules)
  - [ ] `src/app/shared/` (shared components)
  - [ ] `src/app/layouts/` (layout components)
- [ ] Configure routing (`app.routes.ts`)
- [ ] Configure i18n (EN/AR)
- [ ] Create HTTP interceptor (JWT token)
- [ ] Create auth guard
- [ ] Test development server: `npm run dev`

**Folder Structure:**
```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── api.service.ts
│   │   └── analytics.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── jwt.interceptor.ts
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── blog/
│   └── analytics/
├── shared/
│   └── components/
└── layouts/
    ├── admin-layout/
    └── auth-layout/
```

**Acceptance:**
- Angular dev server running
- PrimeNG components render
- Tailwind CSS working
- i18n configured (EN/AR)
- Routing working

---

## Day 5: Final Validation

### Task 10: Infrastructure Provisioning (DigitalOcean)
**Owner:** DevOps / Backend Engineer
**Effort:** 0.5 days
**Priority:** 🟠 HIGH
**Dependencies:** Task 6 (Terraform)

**Checklist:**
- [ ] Create DigitalOcean account (if not exists)
- [ ] Run `terraform apply` for staging environment
- [ ] Verify PostgreSQL database created
- [ ] Verify Redis cache created
- [ ] Verify Spaces (object storage) created
- [ ] Run Prisma migrations on staging database
- [ ] Test database connection from local machine
- [ ] Document connection strings (securely)

**Validation Commands:**
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# Test Redis connection
redis-cli -u $REDIS_URL ping

# Test Prisma connection
npx prisma db pull
```

**Acceptance:**
- All infrastructure resources running
- Database accessible
- Redis accessible
- Prisma migrations applied

---

### Task 11: End-to-End Validation
**Owner:** Tech Lead
**Effort:** 0.5 days
**Priority:** 🔴 CRITICAL
**Dependencies:** All tasks

**Validation Checklist:**
- [ ] Database schema finalized and reviewed
- [ ] All missing tables present
- [ ] API versioning configured
- [ ] Response envelope implemented
- [ ] Prisma schema generates without errors
- [ ] NestJS server starts without errors
- [ ] Angular dev server starts without errors
- [ ] CI/CD pipeline runs successfully
- [ ] Infrastructure provisioned and accessible
- [ ] All ADRs documented
- [ ] Tech Lead approval obtained

**Manual Tests:**
```bash
# Backend
cd roaya-admin-api
npm install
npm run start:dev
curl http://localhost:3000/api/v1/health

# Frontend
cd roaya-admin-panel
npm install
npm run dev
# Visit http://localhost:4200

# Database
npx prisma studio
# Browse database schema

# CI/CD
git push origin develop
# Watch GitHub Actions pipeline
```

**Acceptance:**
- All systems operational
- No blockers for Sprint 1
- Tech Lead sign-off

---

## Summary

### Sprint 0 Checklist

| Task | Priority | Owner | Effort | Status |
|------|----------|-------|--------|--------|
| 1. Finalize DB schema with partitioning | 🔴 CRITICAL | Database Engineer | 2 days | ⬜ TODO |
| 2. Add missing tables | 🔴 CRITICAL | Database Engineer | 1 day | ⬜ TODO |
| 3. Define API versioning | 🔴 CRITICAL | Backend Engineer | 0.5 days | ⬜ TODO |
| 4. Define response envelope | 🔴 CRITICAL | Backend Engineer | 0.5 days | ⬜ TODO |
| 5. Create Prisma schema | 🔴 CRITICAL | Backend Engineer | 1 day | ⬜ TODO |
| 6. Set up Terraform | 🟠 HIGH | DevOps | 1 day | ⬜ TODO |
| 7. Configure CI/CD | 🟠 HIGH | DevOps | 1 day | ⬜ TODO |
| 8. NestJS scaffolding | 🟠 HIGH | Backend Engineer | 1 day | ⬜ TODO |
| 9. Angular scaffolding | 🟠 HIGH | Frontend Engineer | 1 day | ⬜ TODO |
| 10. Provision infrastructure | 🟠 HIGH | DevOps | 0.5 days | ⬜ TODO |
| 11. End-to-end validation | 🔴 CRITICAL | Tech Lead | 0.5 days | ⬜ TODO |

### Total Effort

**Days:** 5 days (1 week)
**Team:** 3.5 FTE

### Exit Criteria

✅ All CRITICAL items complete
✅ All 17 specialist issues addressed
✅ Database schema finalized
✅ API design approved
✅ Infrastructure provisioned
✅ CI/CD pipeline working
✅ Tech Lead approval

---

## What Happens After Sprint 0

**Sprint 1 (Weeks 1-2):**
- Auth core implementation
- JWT login/logout
- Password reset flow
- Login page UI

**Ready to Start?** YES, if all Sprint 0 tasks complete.

---

## Daily Stand-Up Format

**What I did yesterday:**
[List completed tasks]

**What I'm doing today:**
[List in-progress tasks]

**Blockers:**
[List any blockers - escalate immediately]

---

## Escalation Path

**Blockers?** Notify Tech Lead immediately (within 4 hours)
**Technical Questions?** Ask Tech Lead or specialist agents
**Infrastructure Issues?** DevOps + Tech Lead

---

**Status:** 🔴 NOT STARTED (as of 2026-01-11)
**Next Review:** Daily stand-ups during Sprint 0

---

**END OF SPRINT 0 CHECKLIST**
