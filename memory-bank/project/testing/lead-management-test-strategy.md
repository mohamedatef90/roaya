# Lead Management System - Comprehensive Test Strategy

## Document Information
- **Version:** 1.0
- **Date:** 2026-01-21
- **Status:** Ready for Implementation
- **Project:** Roaya Lead Management System
- **Domain:** www.roaya.co / api.roaya.co

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Test Strategy Overview](#2-test-strategy-overview)
3. [Testing Scope](#3-testing-scope)
4. [Testing Levels](#4-testing-levels)
5. [Test Environment Setup](#5-test-environment-setup)
6. [Entry and Exit Criteria](#6-entry-and-exit-criteria)
7. [Risk Assessment](#7-risk-assessment)
8. [Code Coverage Targets](#8-code-coverage-targets)
9. [Testing Tools and Frameworks](#9-testing-tools-and-frameworks)
10. [CI/CD Integration](#10-cicd-integration)
11. [Test Data Management](#11-test-data-management)
12. [Defect Management](#12-defect-management)

---

## 1. Executive Summary

### 1.1 Feature Overview

The Roaya Lead Management System enables:
- Lead capture from 3 forms (Contact, Pricing Quote, ROI Calculator)
- Email notifications to sales team and customers
- Admin authentication and authorization
- Lead management dashboard with CRUD operations
- Lead activity tracking and audit logging
- CSV/Excel export functionality

### 1.2 Risk Level

**Risk Level:** 🔴 **HIGH**

**Justification:**
- Handles sensitive customer data (PII)
- Direct impact on sales pipeline and revenue
- Email deliverability affects customer experience
- Security vulnerabilities could expose business data
- Data integrity issues could result in lost leads

### 1.3 Testing Priority

**P0 - Critical:** All core functionality, security, and data integrity tests must pass before deployment.

**Coverage Goal:**
- Overall: 80% minimum code coverage
- Critical paths: 95% code coverage
- Business logic: 90% code coverage

---

## 2. Test Strategy Overview

### 2.1 Testing Approach

We will implement a **comprehensive multi-layered testing strategy** covering:

| Testing Level | Coverage | Automation | Tools |
|--------------|----------|------------|-------|
| **Unit Tests** | Service layer, utilities, validators | 100% | Vitest |
| **Integration Tests** | API endpoints, database operations | 100% | Vitest + Supertest |
| **E2E Tests** | Critical user flows | 80% | Playwright |
| **Security Tests** | Auth, authorization, input validation | 100% | OWASP ZAP, Custom |
| **Performance Tests** | Load, stress, spike testing | Manual | k6, Artillery |
| **Manual Tests** | Exploratory, UAT, email templates | As needed | Manual QA |

### 2.2 Test Pyramid

```
              ╱╲
             ╱  ╲
            ╱ E2E╲ (20%)
           ╱──────╲
          ╱        ╲
         ╱  Integr. ╲ (30%)
        ╱────────────╲
       ╱              ╲
      ╱  Unit Tests    ╲ (50%)
     ╱──────────────────╲
```

**Rationale:** Unit tests provide fast feedback, integration tests validate component interactions, E2E tests verify critical business flows.

---

## 3. Testing Scope

### 3.1 In-Scope

| Feature Area | Test Types | Priority |
|-------------|------------|----------|
| **Lead Submission** | Unit, Integration, E2E, Security | P0 |
| **Email Notifications** | Unit, Integration, Manual | P0 |
| **Admin Authentication** | Unit, Integration, Security | P0 |
| **Lead Management (CRUD)** | Unit, Integration, E2E | P0 |
| **Activity Logging** | Unit, Integration | P1 |
| **Lead Export** | Integration, E2E | P1 |
| **Rate Limiting** | Integration, Performance | P0 |
| **Input Validation** | Unit, Integration, Security | P0 |
| **Error Handling** | Unit, Integration | P0 |
| **Database Transactions** | Integration | P0 |

### 3.2 Out-of-Scope

| Item | Reason |
|------|--------|
| Frontend Angular components | Separate test suite in Angular workspace |
| Third-party service internals | SendGrid, Redis already tested by vendors |
| PostgreSQL engine | Database vendor responsibility |
| Operating system | Infrastructure layer |
| Load balancer configuration | DevOps responsibility |

### 3.3 Assumptions

- PostgreSQL 16 and Redis 7 are properly configured
- SendGrid API keys are valid and rate limits understood
- Test database can be reset between test runs
- CI/CD environment has Node.js 20 LTS installed
- Email sandbox mode available for testing

---

## 4. Testing Levels

### 4.1 Unit Testing

**Objective:** Verify individual functions, classes, and modules work correctly in isolation.

**Coverage Areas:**
- Validation schemas (Zod)
- Utility functions (email formatting, phone parsing, etc.)
- Service layer business logic
- Error handling functions
- JWT token generation and validation
- Lead scoring calculations
- Data transformation functions

**Mocking Strategy:**
- Database calls mocked with test fixtures
- External APIs (SendGrid) mocked with test responses
- Redis operations mocked with in-memory store

**Example Test Structure:**
```typescript
describe('LeadValidationService', () => {
  describe('validateContactForm', () => {
    it('should accept valid contact form data', () => {
      // Arrange
      const validData = { name: 'John Doe', email: 'john@example.com', ... };

      // Act
      const result = validateContactForm(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = { name: 'John Doe', email: 'invalid-email', ... };
      const result = validateContactForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });
  });
});
```

### 4.2 Integration Testing

**Objective:** Verify API endpoints, database operations, and component interactions work together correctly.

**Coverage Areas:**
- All API endpoints (POST /leads/contact, GET /admin/leads, etc.)
- Database CRUD operations via Prisma
- Email queue integration with Redis/Bull
- JWT authentication flow
- Refresh token rotation
- Database transactions and rollbacks
- Foreign key constraints

**Test Database Strategy:**
- Use separate test database
- Reset schema before each test suite
- Seed with known test data
- Clean up after each test

**Example Test Structure:**
```typescript
describe('POST /api/v1/leads/contact', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedTestData();
  });

  it('should create lead and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/leads/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test inquiry',
        language: 'en'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('leadId');
  });

  it('should queue admin notification email', async () => {
    const emailQueueSpy = vi.spyOn(emailQueue, 'add');

    await request(app)
      .post('/api/v1/leads/contact')
      .send(validContactData);

    expect(emailQueueSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'admin_alert',
        recipient: 'sales@roaya.co'
      })
    );
  });
});
```

### 4.3 End-to-End Testing

**Objective:** Validate complete user workflows from frontend to database.

**Coverage Areas:**
- Contact form submission flow (form fill → API call → email → database)
- Pricing quote request flow
- ROI calculator submission flow
- Admin login → dashboard access → lead update
- Admin lead export flow
- Token refresh flow

**Test Environment:**
- Staging environment that mirrors production
- Real database (isolated test instance)
- Email sandbox mode (SendGrid sandbox or Mailtrap)

**Example Test Structure:**
```typescript
test('Complete contact form submission flow', async ({ page }) => {
  // Navigate to contact page
  await page.goto('https://staging.roaya.co/contact');

  // Fill form
  await page.fill('#name', 'E2E Test User');
  await page.fill('#email', 'e2e@example.com');
  await page.fill('#message', 'This is an E2E test submission');

  // Submit
  await page.click('button[type="submit"]');

  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.success-message')).toContainText('received your inquiry');

  // Verify lead in database (via API check)
  const response = await fetch('https://api-staging.roaya.co/api/v1/admin/leads', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const leads = await response.json();
  const testLead = leads.data.items.find(l => l.contact_email === 'e2e@example.com');
  expect(testLead).toBeDefined();
  expect(testLead.source_id).toBe(1); // Contact form
});
```

### 4.4 Security Testing

**Objective:** Identify and prevent security vulnerabilities.

**Coverage Areas:**
- SQL injection prevention (Prisma ORM validation)
- XSS prevention (input sanitization)
- CSRF protection
- Rate limiting effectiveness
- JWT token security (expiration, signature validation)
- Authorization checks (role-based access)
- Password hashing strength (bcrypt cost factor)
- Sensitive data masking in logs
- API authentication bypass attempts
- Session hijacking prevention

**Test Types:**
- Automated security scans (OWASP ZAP)
- Manual penetration testing
- Fuzz testing critical inputs
- Authentication/authorization boundary tests

### 4.5 Performance Testing

**Objective:** Validate system performance under load.

**Test Scenarios:**

| Test Type | Description | Target Metrics |
|-----------|-------------|----------------|
| **Baseline** | Normal load (10 concurrent users) | Response time < 200ms |
| **Load** | Expected peak (100 concurrent users) | Response time < 500ms, 0% errors |
| **Stress** | Breaking point (500 concurrent users) | Identify max capacity |
| **Spike** | Sudden traffic surge | System recovers gracefully |
| **Endurance** | Sustained load (24 hours) | No memory leaks, stable performance |

**Tools:** k6, Artillery, Apache JMeter

**Example k6 Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up
    { duration: '5m', target: 50 },  // Sustain
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  let payload = JSON.stringify({
    name: 'Load Test User',
    email: `test-${__VU}-${__ITER}@example.com`,
    message: 'Performance test message',
    language: 'en',
  });

  let res = http.post('https://api.roaya.co/api/v1/leads/contact', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## 5. Test Environment Setup

### 5.1 Test Environments

| Environment | Purpose | Database | Email | Auth |
|-------------|---------|----------|-------|------|
| **Local** | Developer unit/integration tests | SQLite or Docker PostgreSQL | Mock/Mailtrap | Test tokens |
| **CI** | Automated test pipeline | Docker PostgreSQL | Mock | Test tokens |
| **Staging** | E2E, UAT, manual testing | Dedicated PostgreSQL | SendGrid Sandbox | Real auth |
| **Production** | (No testing - monitoring only) | Production DB | SendGrid Live | Real auth |

### 5.2 Database Setup

**Test Database Configuration:**
```bash
# .env.test
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/roaya_leads_test"
NODE_ENV=test
```

**Test Database Utilities:**
```typescript
// tests/utils/database.ts
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export async function resetDatabase() {
  await execAsync('npx prisma migrate reset --force --skip-seed');
}

export async function seedTestData() {
  await prisma.leadSource.createMany({
    data: [
      { code: 'contact', name: 'Contact Form' },
      { code: 'pricing_quote', name: 'Pricing Quote' },
      { code: 'roi_calculator', name: 'ROI Calculator' },
    ],
  });

  await prisma.leadStatus.createMany({
    data: [
      { code: 'new', name: 'New', color: '#3B82F6' },
      { code: 'contacted', name: 'Contacted', color: '#8B5CF6' },
    ],
  });

  // Seed industries, services, admin user
}

export async function cleanupDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE leads CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE email_notifications CASCADE`;
}
```

### 5.3 Email Testing Setup

**Option 1: Mailtrap (Development)**
```typescript
// config/email.test.ts
export const emailConfig = {
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
};
```

**Option 2: SendGrid Sandbox Mode**
```typescript
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setSubstitutionWrappers('{{', '}}');

// In test mode, use sandbox
const msg = {
  ...emailData,
  mailSettings: {
    sandboxMode: {
      enable: process.env.NODE_ENV === 'test',
    },
  },
};
```

---

## 6. Entry and Exit Criteria

### 6.1 Entry Criteria

Testing can begin when:

- [ ] Database schema migrations are complete
- [ ] All API endpoints are implemented (even if business logic incomplete)
- [ ] Basic error handling is in place
- [ ] Test environment is configured and accessible
- [ ] Test data fixtures are prepared
- [ ] CI/CD pipeline is set up

### 6.2 Exit Criteria

Testing is complete when:

**Unit Tests:**
- [ ] All service functions have unit tests
- [ ] Code coverage >= 90% for business logic
- [ ] All tests passing
- [ ] No critical bugs in unit test coverage

**Integration Tests:**
- [ ] All API endpoints have integration tests
- [ ] Database operations tested with real DB
- [ ] Email queue integration tested
- [ ] Code coverage >= 80% overall
- [ ] All P0 tests passing

**E2E Tests:**
- [ ] Critical user flows tested (contact, pricing, ROI, admin login, lead management)
- [ ] All P0 E2E tests passing
- [ ] No blocking bugs in production-like environment

**Security Tests:**
- [ ] No high or critical security vulnerabilities
- [ ] Authentication and authorization verified
- [ ] Input validation comprehensive
- [ ] Rate limiting functional

**Performance Tests:**
- [ ] Response time targets met (p95 < 500ms)
- [ ] System handles expected load (100 concurrent users)
- [ ] No memory leaks in endurance tests

**Sign-off:**
- [ ] QA team approves test results
- [ ] Product Owner approves UAT results
- [ ] Security team approves security scan results

---

## 7. Risk Assessment

### 7.1 Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation Strategy | Owner |
|------|-----------|--------|----------|---------------------|-------|
| **Data Loss (Leads)** | Medium | Critical | 🔴 **HIGH** | Database backups, transaction management, comprehensive integration tests | Backend |
| **Email Delivery Failure** | Medium | High | 🟠 **HIGH** | Queue retry logic, monitoring, SendGrid webhook integration | Backend |
| **Auth Bypass** | Low | Critical | 🟠 **HIGH** | Security tests, JWT validation, role-based access control tests | Security |
| **SQL Injection** | Low | Critical | 🟠 **HIGH** | Prisma ORM (parameterized queries), fuzz testing | Backend |
| **Rate Limit Bypass** | Medium | Medium | 🟡 **MEDIUM** | Integration tests for rate limiting, Redis-backed limits | Backend |
| **XSS Vulnerability** | Medium | Medium | 🟡 **MEDIUM** | Input sanitization tests, CSP headers | Security |
| **Performance Degradation** | Medium | High | 🟠 **HIGH** | Performance tests, database indexing, query optimization | Backend |
| **CORS Misconfiguration** | Low | Medium | 🟡 **MEDIUM** | Integration tests, security review | Backend |
| **Token Expiration Issues** | Medium | Low | 🟢 **LOW** | Unit and integration tests for token lifecycle | Backend |
| **Form Data Validation Gaps** | Medium | Medium | 🟡 **MEDIUM** | Comprehensive validation tests, boundary tests | QA |

### 7.2 Risk Mitigation Details

**Risk: Data Loss (Leads)**
- **Mitigation:**
  - Database transactions for all write operations
  - Foreign key constraints prevent orphaned records
  - Soft delete with `is_archived` flag
  - Daily automated backups with point-in-time recovery
  - Integration tests verify transaction rollback on errors
  - Activity logging tracks all changes

**Risk: Email Delivery Failure**
- **Mitigation:**
  - Bull queue with Redis for reliable job processing
  - Exponential backoff retry (3 attempts)
  - Email status tracking in database
  - SendGrid webhook for delivery confirmations
  - Monitoring alerts for failed emails
  - Manual retry option in admin dashboard

**Risk: Auth Bypass**
- **Mitigation:**
  - JWT with short expiration (15 min)
  - Refresh token rotation on use
  - Token signature verification
  - Role-based middleware on all admin routes
  - Security tests attempt bypass scenarios
  - Account lockout after failed attempts

---

## 8. Code Coverage Targets

### 8.1 Coverage Goals

| Code Type | Minimum Coverage | Target Coverage |
|-----------|-----------------|-----------------|
| **Overall** | 80% | 85% |
| **Services (Business Logic)** | 90% | 95% |
| **Controllers (API Handlers)** | 85% | 90% |
| **Validators** | 95% | 100% |
| **Utilities** | 85% | 90% |
| **Middleware** | 80% | 85% |
| **Database Models** | 70% | 75% |

### 8.2 Coverage Exclusions

- Type definitions (`.d.ts` files)
- Configuration files
- Migration scripts
- Seed data scripts
- Third-party library wrappers (minimal logic)

### 8.3 Coverage Reporting

**Tools:** Vitest Coverage (c8 or istanbul)

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.ts',
        'prisma/migrations/',
        'prisma/seed.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

**CI/CD Integration:**
```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

---

## 9. Testing Tools and Frameworks

### 9.1 Tool Selection

| Tool | Purpose | Version | Why Chosen |
|------|---------|---------|------------|
| **Vitest** | Unit & Integration Testing | v2.0+ | Fast, TypeScript support, Jest-compatible, better ESM support |
| **Supertest** | API Testing | v7.0+ | Integrates with Express, supports promises |
| **Playwright** | E2E Testing | v1.45+ | Cross-browser, auto-wait, network interception |
| **Zod** | Schema Validation | v3.23+ | Type-safe validation, already in plan |
| **@faker-js/faker** | Test Data Generation | v8.4+ | Realistic test data |
| **nock** | HTTP Mocking | v13+ | Mock external APIs (SendGrid) |
| **testcontainers** | Database Testing | v10+ | Isolated PostgreSQL for integration tests |
| **k6** | Performance Testing | v0.51+ | JavaScript-based, scalable, Grafana integration |

### 9.2 Installation

```bash
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
npm install -D @playwright/test
npm install -D @faker-js/faker nock testcontainers
npm install -D @types/node @types/express
```

### 9.3 Project Structure

```
roaya-backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── validators/
│   └── utils/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── lead.service.test.ts
│   │   │   ├── email.service.test.ts
│   │   │   └── auth.service.test.ts
│   │   ├── validators/
│   │   │   └── lead.validator.test.ts
│   │   └── utils/
│   │       └── helpers.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── leads.api.test.ts
│   │   │   ├── auth.api.test.ts
│   │   │   └── admin.api.test.ts
│   │   └── database/
│   │       └── lead.db.test.ts
│   ├── e2e/
│   │   ├── contact-form.e2e.test.ts
│   │   ├── pricing-quote.e2e.test.ts
│   │   ├── admin-dashboard.e2e.test.ts
│   │   └── lead-export.e2e.test.ts
│   ├── performance/
│   │   ├── load-test.k6.js
│   │   └── stress-test.k6.js
│   ├── security/
│   │   ├── auth-bypass.test.ts
│   │   └── sql-injection.test.ts
│   ├── fixtures/
│   │   ├── leads.fixture.ts
│   │   └── users.fixture.ts
│   └── utils/
│       ├── database.ts
│       ├── email-mock.ts
│       └── test-server.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 10. CI/CD Integration

### 10.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
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
        image: redis:7
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
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-integration-tests

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start application (staging mode)
        run: |
          npm run build
          npm run start:test &
          npx wait-on http://localhost:3000/health

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  security-tests:
    runs-on: ubuntu-latest
    needs: unit-integration-tests

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'roaya-lead-management'
          path: '.'
          format: 'HTML'

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 10.2 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:security": "npm audit && vitest run tests/security",
    "test:performance": "k6 run tests/performance/load-test.k6.js",
    "test:watch": "vitest watch",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 11. Test Data Management

### 11.1 Test Fixtures

```typescript
// tests/fixtures/leads.fixture.ts
import { faker } from '@faker-js/faker';

export const validContactFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+201234567890',
  company: 'Acme Corp',
  message: 'I am interested in your cloud solutions',
  language: 'en' as const,
};

export const validPricingQuoteData = {
  companyName: 'Tech Startup Inc',
  industry: 'technology',
  email: 'contact@techstartup.com',
  phone: '+201234567890',
  employees: '51-200',
  services: ['cloud', 'security', 'email'],
  requirements: 'Need enterprise cloud migration',
  language: 'en' as const,
};

export const validROICalculatorData = {
  calculatorType: 'cloud' as const,
  inputs: {
    currentSpend: 10000,
    employees: 50,
    serverCount: 10,
  },
  results: {
    estimatedSavings: 3000,
    roi: 30,
    paybackPeriod: 12,
  },
  contactInfo: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+201234567890',
    company: 'Cloud Adopters LLC',
  },
  language: 'en' as const,
};

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

export const adminUser = {
  email: 'admin@roaya.co',
  password: 'TestPassword123!',
  name: 'Test Admin',
  role: 'admin' as const,
};
```

### 11.2 Database Seeding

```typescript
// tests/utils/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedTestDatabase() {
  // Lead sources
  await prisma.leadSource.createMany({
    data: [
      { id: 1, code: 'contact', name: 'Contact Form' },
      { id: 2, code: 'pricing_quote', name: 'Pricing Quote' },
      { id: 3, code: 'roi_calculator', name: 'ROI Calculator' },
    ],
  });

  // Lead statuses
  await prisma.leadStatus.createMany({
    data: [
      { id: 1, code: 'new', name: 'New', color: '#3B82F6' },
      { id: 2, code: 'contacted', name: 'Contacted', color: '#8B5CF6' },
      { id: 3, code: 'qualified', name: 'Qualified', color: '#10B981' },
    ],
  });

  // Industries
  await prisma.industry.createMany({
    data: [
      { id: 1, code: 'technology', name_en: 'Technology', name_ar: 'التكنولوجيا' },
      { id: 2, code: 'healthcare', name_en: 'Healthcare', name_ar: 'الرعاية الصحية' },
    ],
  });

  // Services
  await prisma.service.createMany({
    data: [
      { id: 1, code: 'cloud', name_en: 'Cloud Solutions', name_ar: 'الحلول السحابية' },
      { id: 2, code: 'security', name_en: 'Cybersecurity', name_ar: 'الأمن السيبراني' },
    ],
  });

  // Admin user
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  await prisma.adminUser.create({
    data: {
      email: 'admin@roaya.co',
      password_hash: passwordHash,
      name: 'Test Admin',
      role: 'admin',
    },
  });
}
```

---

## 12. Defect Management

### 12.1 Bug Classification

| Severity | Definition | Examples | SLA |
|----------|-----------|----------|-----|
| **🔴 Critical** | System unusable, data loss, security breach | Database down, auth bypass, data corruption | Fix immediately, hotfix |
| **🟠 High** | Major feature broken, workaround exists | Lead submission fails, email not sent | Fix within 24 hours |
| **🟡 Medium** | Feature partially broken, impacts some users | Filter not working, export slow | Fix within 1 week |
| **🟢 Low** | Minor issue, cosmetic, rare scenario | Typo, UI alignment, edge case | Fix in next release |

### 12.2 Bug Report Template

```markdown
## Bug Report

**Bug ID:** BUG-001
**Title:** Lead submission fails with 500 error for Arabic names
**Severity:** 🟠 High
**Priority:** P0
**Status:** Open
**Reporter:** QA Engineer
**Assigned To:** Backend Engineer
**Date Reported:** 2026-01-21

### Environment
- Browser: Chrome 131
- OS: macOS 15
- URL: https://staging.roaya.co/contact
- API Endpoint: POST /api/v1/leads/contact

### Steps to Reproduce
1. Navigate to contact form
2. Switch language to Arabic
3. Fill name field with Arabic characters: "محمد علي"
4. Fill email: test@example.com
5. Fill message: "اختبار النظام"
6. Click Submit

### Expected Behavior
- Form submits successfully
- Success message displayed
- Lead created in database
- Confirmation email sent

### Actual Behavior
- HTTP 500 Internal Server Error
- Error message: "Validation failed"
- Lead not created
- No email sent

### Impact
- Arabic-speaking customers cannot submit leads
- Estimated 40% of traffic affected (Arabic language users)
- Potential revenue loss

### Suggested Fix
- Update Zod schema to accept Unicode characters
- Add validation test for Arabic/RTL text

### Attachments
- Screenshot: bug-001-error.png
- Console logs: console-errors.txt
- Network trace: network-trace.har
```

### 12.3 Defect Tracking Workflow

```
[New Bug Reported]
       ↓
  [QA Triage] → Priority assigned
       ↓
  [Developer Assigned]
       ↓
  [In Progress] → Fix implemented
       ↓
  [Code Review] → PR approved
       ↓
  [Merged to Dev]
       ↓
  [QA Verification] → Test in staging
       ↓
  ├─ Pass → [Closed]
  └─ Fail → [Reopened] → Back to developer
```

---

## Appendix A: Test Case IDs Reference

Test cases are detailed in separate documents:

- **Unit Test Cases:** `/memory-bank/project/testing/unit-test-cases.md`
- **Integration Test Cases:** `/memory-bank/project/testing/integration-test-cases.md`
- **E2E Test Cases:** `/memory-bank/project/testing/e2e-test-cases.md`
- **Security Test Cases:** `/memory-bank/project/testing/security-test-cases.md`
- **Sample Test Files:** `/memory-bank/project/testing/sample-tests/`

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **QA Lead** | [Name] | __________ | ______ |
| **Backend Lead** | [Name] | __________ | ______ |
| **Product Owner** | [Name] | __________ | ______ |
| **Security Engineer** | [Name] | __________ | ______ |

---

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | QA Test Engineer | Initial comprehensive test strategy |

---

*This test strategy document provides the foundation for quality assurance of the Roaya Lead Management System. All team members should familiarize themselves with the testing approach and contribute to maintaining high quality standards.*
