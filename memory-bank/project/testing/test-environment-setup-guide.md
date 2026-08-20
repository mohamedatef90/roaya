# Test Environment Setup Guide

## Document Information
- **Version:** 1.0
- **Date:** 2026-01-21
- **Purpose:** Complete guide for setting up testing infrastructure

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [CI/CD Environment Setup](#3-cicd-environment-setup)
4. [Staging Environment Setup](#4-staging-environment-setup)
5. [Test Configuration Files](#5-test-configuration-files)
6. [Database Setup](#6-database-setup)
7. [Email Testing Setup](#7-email-testing-setup)
8. [Test Data Management](#8-test-data-management)
9. [Running Tests](#9-running-tests)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | v20 LTS | `nvm install 20 && nvm use 20` |
| **npm** | v10+ | Included with Node.js |
| **PostgreSQL** | v16 | `brew install postgresql@16` (macOS)<br>`apt install postgresql-16` (Linux) |
| **Redis** | v7 | `brew install redis` (macOS)<br>`apt install redis-server` (Linux) |
| **Docker** | Latest | https://docker.com/get-started |
| **Git** | v2.40+ | `brew install git` or `apt install git` |

### 1.2 Optional Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Postman** | Manual API testing | https://postman.com/downloads |
| **TablePlus / DBeaver** | Database GUI | https://tableplus.com |
| **Mailtrap** | Email testing | https://mailtrap.io (sign up) |
| **k6** | Performance testing | `brew install k6` |

---

## 2. Local Development Setup

### 2.1 Clone Repository

```bash
cd /Users/roaya/Roaya-files/Development/roaya
git clone <backend-repo-url> roaya-backend
cd roaya-backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Environment Configuration

Create `.env.test` file:

```bash
# .env.test
NODE_ENV=test
PORT=3001

# Database
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/roaya_leads_test"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (test only - not for production!)
JWT_ACCESS_SECRET=test_access_secret_1234567890abcdefghijklmnopqrstuvwxyz
JWT_REFRESH_SECRET=test_refresh_secret_abcdefghijklmnopqrstuvwxyz1234567890

# SendGrid (use sandbox mode)
SENDGRID_API_KEY=SG.test_key_here
SENDGRID_FROM_EMAIL=noreply@roaya.co
SENDGRID_FROM_NAME=Roaya IT

# Admin notification email
ADMIN_NOTIFICATION_EMAIL=sales@roaya.co

# Rate Limiting (relaxed for testing)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
FORM_RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=error
```

### 2.4 Database Setup (Local PostgreSQL)

#### Option 1: Local PostgreSQL Installation

```bash
# Start PostgreSQL
brew services start postgresql@16  # macOS
sudo systemctl start postgresql    # Linux

# Create test database and user
psql postgres
```

```sql
-- In psql shell:
CREATE USER test_user WITH PASSWORD 'test_password';
CREATE DATABASE roaya_leads_test OWNER test_user;
GRANT ALL PRIVILEGES ON DATABASE roaya_leads_test TO test_user;
\q
```

#### Option 2: Docker PostgreSQL (Recommended)

```bash
# Create docker-compose.test.yml
cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  postgres-test:
    image: postgres:16-alpine
    container_name: roaya-postgres-test
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: roaya_leads_test
    ports:
      - "5433:5432"
    volumes:
      - postgres-test-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d roaya_leads_test"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-test:
    image: redis:7-alpine
    container_name: roaya-redis-test
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-test-data:
EOF

# Start containers
docker-compose -f docker-compose.test.yml up -d

# Wait for health checks
docker-compose -f docker-compose.test.yml ps
```

Update `.env.test` if using Docker:
```bash
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/roaya_leads_test"
REDIS_PORT=6380
```

### 2.5 Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Seed test data
npx prisma db seed
```

Verify database setup:
```bash
psql -h localhost -U test_user -d roaya_leads_test -c "\dt"
```

Expected output:
```
              List of relations
 Schema |         Name          | Type  |   Owner
--------+-----------------------+-------+-----------
 public | admin_users           | table | test_user
 public | email_notifications   | table | test_user
 public | industries            | table | test_user
 public | lead_activities       | table | test_user
 public | lead_services         | table | test_user
 public | lead_sources          | table | test_user
 public | lead_statuses         | table | test_user
 public | leads                 | table | test_user
 public | refresh_tokens        | table | test_user
 public | services              | table | test_user
```

### 2.6 Install Test Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 \
  supertest @types/supertest \
  @playwright/test \
  @faker-js/faker \
  nock \
  testcontainers
```

---

## 3. CI/CD Environment Setup

### 3.1 GitHub Actions Configuration

Create `.github/workflows/test.yml`:

```yaml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  unit-integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: roaya_leads_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Seed test database
        run: npx prisma db seed
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Generate coverage report
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Check coverage thresholds
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1)
          echo "Coverage: $COVERAGE%"
          if [ $COVERAGE -lt 80 ]; then
            echo "Error: Coverage $COVERAGE% is below threshold 80%"
            exit 1
          fi

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: unit-integration-tests

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Start application
        run: |
          npm run start:test &
          npx wait-on http://localhost:3001/health --timeout 60000
        env:
          NODE_ENV: test
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3001
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  security-scan:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run security tests
        run: npm run test:security

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'roaya-lead-management'
          path: '.'
          format: 'HTML'
          out: 'reports'

      - name: Upload security reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-reports
          path: reports/
```

### 3.2 Required GitHub Secrets

Add these secrets in GitHub repository settings:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `CODECOV_TOKEN` | Codecov upload token | `abc123...` |
| `TEST_DATABASE_URL` | CI database URL | `postgresql://...` |
| `TEST_ADMIN_PASSWORD` | Test admin password | `SecureTestPass123!` |
| `SENDGRID_API_KEY_TEST` | SendGrid test key | `SG.xxx...` |

---

## 4. Staging Environment Setup

### 4.1 Staging Server Requirements

- Ubuntu 22.04 LTS
- 4 GB RAM minimum
- PostgreSQL 16
- Redis 7
- Node.js 20 LTS
- Nginx

### 4.2 Staging Database Setup

```bash
# On staging server
sudo -u postgres psql

CREATE DATABASE roaya_leads_staging OWNER roaya_staging;
GRANT ALL PRIVILEGES ON DATABASE roaya_leads_staging TO roaya_staging;
\q
```

### 4.3 Staging Environment Variables

Create `/var/www/roaya-api/staging/.env`:

```bash
NODE_ENV=staging
PORT=3000
API_URL=https://api-staging.roaya.co

FRONTEND_URL=https://staging.roaya.co

DATABASE_URL="postgresql://roaya_staging:SECURE_PASSWORD@localhost:5432/roaya_leads_staging"

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=<generate-with-openssl>
JWT_REFRESH_SECRET=<generate-with-openssl>

SENDGRID_API_KEY=<sendgrid-sandbox-key>
SENDGRID_FROM_EMAIL=noreply@roaya.co
ADMIN_NOTIFICATION_EMAIL=qa-team@roaya.co

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
FORM_RATE_LIMIT_MAX=5

LOG_LEVEL=info
LOG_FILE=/var/log/roaya-api/staging.log
```

---

## 5. Test Configuration Files

### 5.1 Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e/**',
      'tests/performance/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        'prisma/migrations/',
        'prisma/seed.ts',
        'src/types/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

### 5.2 Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.roaya.co',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run start:test',
        url: 'http://localhost:3001/health',
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },
});
```

### 5.3 Test Setup File

Create `tests/setup.ts`:

```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { resetDatabase, seedTestData } from './utils/database';

// Global test setup
beforeAll(async () => {
  console.log('Setting up test environment...');
  await resetDatabase();
  await seedTestData();
});

// Clean up after all tests
afterAll(async () => {
  console.log('Cleaning up test environment...');
  await prisma.$disconnect();
});

// Reset between test suites
beforeEach(async () => {
  // Clean transactional data only (keep reference data)
  await prisma.lead.deleteMany({});
  await prisma.emailNotification.deleteMany({});
  await prisma.leadActivity.deleteMany({});
  await prisma.refreshToken.deleteMany({});
});
```

---

## 6. Database Setup

### 6.1 Test Database Utilities

Create `tests/utils/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import bcrypt from 'bcrypt';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export async function resetDatabase() {
  console.log('Resetting test database...');

  // Drop and recreate schema
  await execAsync(
    'npx prisma migrate reset --force --skip-seed',
    {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    }
  );

  console.log('Database reset complete.');
}

export async function seedTestData() {
  console.log('Seeding test data...');

  // Seed lead sources
  await prisma.leadSource.createMany({
    data: [
      {
        id: 1,
        code: 'contact',
        name: 'Contact Form',
        form_endpoint: '/api/v1/leads/contact',
      },
      {
        id: 2,
        code: 'pricing_quote',
        name: 'Pricing Quote',
        form_endpoint: '/api/v1/leads/pricing-quote',
      },
      {
        id: 3,
        code: 'roi_calculator',
        name: 'ROI Calculator',
        form_endpoint: '/api/v1/leads/roi-calculator',
      },
    ],
  });

  // Seed lead statuses
  await prisma.leadStatus.createMany({
    data: [
      { id: 1, code: 'new', name: 'New', color: '#3B82F6', sort_order: 1 },
      { id: 2, code: 'contacted', name: 'Contacted', color: '#8B5CF6', sort_order: 2 },
      { id: 3, code: 'qualified', name: 'Qualified', color: '#10B981', sort_order: 3 },
    ],
  });

  // Seed industries
  await prisma.industry.createMany({
    data: [
      { id: 1, code: 'technology', name_en: 'Technology', name_ar: 'التكنولوجيا' },
      { id: 2, code: 'healthcare', name_en: 'Healthcare', name_ar: 'الرعاية الصحية' },
    ],
  });

  // Seed services
  await prisma.service.createMany({
    data: [
      { id: 1, code: 'cloud', name_en: 'Cloud Solutions', name_ar: 'الحلول السحابية' },
      { id: 2, code: 'security', name_en: 'Cybersecurity', name_ar: 'الأمن السيبراني' },
      { id: 3, code: 'email', name_en: 'Email & Collaboration', name_ar: 'البريد الإلكتروني' },
    ],
  });

  // Seed admin user
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  await prisma.adminUser.create({
    data: {
      email: 'admin@roaya.co',
      password_hash: passwordHash,
      name: 'Test Admin',
      role: 'admin',
    },
  });

  console.log('Test data seeded successfully.');
}

export async function cleanupDatabase() {
  await prisma.lead.deleteMany({});
  await prisma.emailNotification.deleteMany({});
  await prisma.leadActivity.deleteMany({});
}
```

---

## 7. Email Testing Setup

### 7.1 Mailtrap Configuration

Sign up at https://mailtrap.io and get SMTP credentials.

Update `.env.test`:
```bash
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password
```

### 7.2 SendGrid Sandbox Mode

For staging environment:
```typescript
// src/lib/email.ts
const mailSettings = {
  sandboxMode: {
    enable: process.env.NODE_ENV !== 'production',
  },
};
```

---

## 8. Test Data Management

### 8.1 Test Fixtures

Create `tests/fixtures/leads.fixture.ts` - already provided in sample tests.

### 8.2 Faker for Dynamic Data

```typescript
import { faker } from '@faker-js/faker';

export function generateRandomLead() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+20##########'),
    company: faker.company.name(),
    message: faker.lorem.paragraph(),
    language: faker.helpers.arrayElement(['en', 'ar']),
  };
}
```

---

## 9. Running Tests

### 9.1 Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit tests/unit/lead.service.test.ts

# Watch mode
npm run test:unit -- --watch
```

### 9.2 Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### 9.3 E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

### 9.4 All Tests

```bash
# Run entire test suite
npm run test:ci
```

---

## 10. Troubleshooting

### 10.1 Database Connection Errors

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL is running
pg_isadmin
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Start PostgreSQL if needed
sudo systemctl start postgresql   # Linux
brew services start postgresql@16 # macOS
```

### 10.2 Prisma Migration Errors

**Error:** `Migration failed to apply`

**Solution:**
```bash
# Reset database
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate

# Reapply migrations
npx prisma migrate deploy
```

### 10.3 Redis Connection Errors

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Start Redis
redis-server                        # Direct
brew services start redis           # macOS
sudo systemctl start redis-server   # Linux
```

### 10.4 Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### 10.5 Playwright Installation Issues

**Error:** `Executable doesn't exist`

**Solution:**
```bash
# Install browsers
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium
```

---

## Quick Start Checklist

- [ ] Install Node.js 20 LTS
- [ ] Install PostgreSQL 16
- [ ] Install Redis 7
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.test` file
- [ ] Start PostgreSQL and Redis
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npx prisma db seed`
- [ ] Run `npm run test:unit` to verify setup
- [ ] Run `npm run test:integration`
- [ ] Install Playwright browsers: `npx playwright install`
- [ ] Run `npm run test:e2e`

---

**Next Steps:**
- Review test strategy document
- Examine sample test files
- Start implementing tests for your features

**Support:**
- Test strategy: `/memory-bank/project/testing/lead-management-test-strategy.md`
- Test cases: `/memory-bank/project/testing/test-case-matrix.md`
- Sample tests: `/memory-bank/project/testing/sample-tests/`

---

*This guide provides complete setup instructions for all testing environments. Follow each step carefully to ensure a proper testing infrastructure.*
