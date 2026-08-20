# CI/CD Test Pipeline Configuration

## Document Information
- **Version:** 1.0
- **Date:** 2026-01-21
- **Purpose:** Complete CI/CD pipeline for automated testing

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [GitHub Actions Workflow](#2-github-actions-workflow)
3. [Pipeline Stages](#3-pipeline-stages)
4. [Code Coverage Integration](#4-code-coverage-integration)
5. [Quality Gates](#5-quality-gates)
6. [Performance Benchmarks](#6-performance-benchmarks)
7. [Deployment Pipeline](#7-deployment-pipeline)
8. [Monitoring and Alerts](#8-monitoring-and-alerts)

---

## 1. Pipeline Overview

### 1.1 Pipeline Architecture

```
[Push/PR] → [Lint] → [Unit Tests] → [Integration Tests] → [E2E Tests] → [Security Scan] → [Deploy Staging]
                ↓          ↓               ↓                    ↓              ↓              ↓
             [Fast]    [Medium]        [Medium]            [Slow]         [Medium]       [Manual]
             [2min]    [5min]          [8min]              [15min]        [5min]         [Approval]
```

### 1.2 Pipeline Triggers

| Trigger | Branches | Tests Run | Deployment |
|---------|----------|-----------|------------|
| **Push** | `develop`, `main` | All | Staging (develop), Production (main) |
| **Pull Request** | All | Unit + Integration + E2E | None |
| **Schedule** | `main` | All + Performance | None |
| **Manual** | Any | Configurable | Configurable |

---

## 2. GitHub Actions Workflow

### 2.1 Complete Workflow File

Create `.github/workflows/test-and-deploy.yml`:

```yaml
name: Test and Deploy Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  schedule:
    # Run performance tests daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  NODE_VERSION: '20'
  POSTGRES_VERSION: '16'
  REDIS_VERSION: '7'

jobs:
  # ============================================================
  # Stage 1: Code Quality Checks
  # ============================================================
  lint-and-format:
    name: Lint and Format Check
    runs-on: ubuntu-latest
    timeout-minutes: 5

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

      - name: Run ESLint
        run: npm run lint

      - name: Check code formatting (Prettier)
        run: npm run format:check

      - name: TypeScript type check
        run: npm run type-check

  # ============================================================
  # Stage 2: Unit Tests
  # ============================================================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: lint-and-format

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

      - name: Run unit tests
        run: npm run test:unit -- --reporter=verbose --reporter=json --outputFile=unit-test-results.json

      - name: Upload unit test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: unit-test-results
          path: unit-test-results.json

  # ============================================================
  # Stage 3: Integration Tests
  # ============================================================
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: unit-tests

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

      - name: Run integration tests
        run: npm run test:integration -- --reporter=verbose --reporter=json --outputFile=integration-test-results.json
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          NODE_ENV: test

      - name: Upload integration test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: integration-test-results
          path: integration-test-results.json

  # ============================================================
  # Stage 4: Code Coverage
  # ============================================================
  code-coverage:
    name: Code Coverage Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: integration-tests

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

      - name: Setup database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test

      - name: Generate coverage report
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/roaya_leads_test
          REDIS_HOST: localhost

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests,integration
          name: codecov-umbrella
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Check coverage thresholds
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1)
          echo "📊 Total Coverage: $COVERAGE%"

          if [ $COVERAGE -lt 80 ]; then
            echo "❌ Error: Coverage $COVERAGE% is below threshold 80%"
            exit 1
          else
            echo "✅ Coverage check passed: $COVERAGE% >= 80%"
          fi

      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: coverage-reports
          path: |
            coverage/
            !coverage/tmp/

  # ============================================================
  # Stage 5: E2E Tests
  # ============================================================
  e2e-tests:
    name: E2E Tests - ${{ matrix.browser }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: integration-tests

    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]

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
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Build application
        run: npm run build

      - name: Start application in background
        run: |
          npm run start:test &
          npx wait-on http://localhost:3001/health --timeout 60000
        env:
          NODE_ENV: test
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          JWT_ACCESS_SECRET: ${{ secrets.TEST_JWT_ACCESS_SECRET }}
          JWT_REFRESH_SECRET: ${{ secrets.TEST_JWT_REFRESH_SECRET }}

      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }}
        env:
          BASE_URL: http://localhost:3001
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 7

  # ============================================================
  # Stage 6: Security Scanning
  # ============================================================
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: integration-tests

    permissions:
      security-events: write

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
        continue-on-error: true

      - name: Run security tests
        run: npm run test:security

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'roaya-lead-management'
          path: '.'
          format: 'HTML,JSON'
          out: 'reports'

      - name: Upload OWASP report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: owasp-dependency-check-report
          path: reports/

      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # ============================================================
  # Stage 7: Performance Tests (Scheduled Only)
  # ============================================================
  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    if: github.event_name == 'schedule'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run load tests
        run: k6 run tests/performance/load-test.k6.js
        env:
          BASE_URL: https://api-staging.roaya.co

      - name: Run stress tests
        run: k6 run tests/performance/stress-test.k6.js
        env:
          BASE_URL: https://api-staging.roaya.co

      - name: Upload performance results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: performance-test-results
          path: performance-results/

  # ============================================================
  # Stage 8: Build Docker Image
  # ============================================================
  build-docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [e2e-tests, security-scan, code-coverage]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: roaya/lead-management-api
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=roaya/lead-management-api:buildcache
          cache-to: type=registry,ref=roaya/lead-management-api:buildcache,mode=max

  # ============================================================
  # Stage 9: Deploy to Staging
  # ============================================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: build-docker
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://api-staging.roaya.co

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/roaya-api/staging
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T api npx prisma migrate deploy
            docker-compose logs --tail=50

      - name: Run smoke tests
        run: |
          sleep 10
          curl -f https://api-staging.roaya.co/health || exit 1
          echo "✅ Staging deployment successful"

      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================================
  # Stage 10: Deploy to Production (Manual Approval Required)
  # ============================================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: build-docker
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.roaya.co

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create database backup
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            pg_dump -U roaya_prod roaya_leads > /backups/roaya_leads_$(date +%Y%m%d_%H%M%S).sql

      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/roaya-api/production
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T api npx prisma migrate deploy
            docker-compose logs --tail=50

      - name: Run smoke tests
        run: |
          sleep 15
          curl -f https://api.roaya.co/health || exit 1
          echo "✅ Production deployment successful"

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: '🚀 Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 3. Pipeline Stages

### 3.1 Stage Summary

| Stage | Duration | Failure Action | Artifacts |
|-------|----------|----------------|-----------|
| **Lint** | 2-3 min | Block PR | None |
| **Unit Tests** | 3-5 min | Block PR | Test results |
| **Integration Tests** | 5-8 min | Block PR | Test results |
| **Code Coverage** | 5-8 min | Block if <80% | Coverage reports |
| **E2E Tests** | 10-15 min | Block PR | Screenshots, videos |
| **Security Scan** | 5-10 min | Warn only | Security reports |
| **Performance** | 20-30 min | Warn only | Performance metrics |
| **Build Docker** | 5-10 min | Block deployment | Docker image |
| **Deploy Staging** | 5-10 min | Alert team | Deployment logs |
| **Deploy Production** | 10-15 min | Rollback | Deployment logs |

---

## 4. Code Coverage Integration

### 4.1 Codecov Configuration

Create `codecov.yml`:

```yaml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 1%
        if_ci_failed: error

    patch:
      default:
        target: 70%
        if_ci_failed: error

  ignore:
    - "tests/**"
    - "**/*.d.ts"
    - "**/*.config.ts"
    - "prisma/migrations/**"

comment:
  layout: "reach,diff,flags,tree,footer"
  behavior: default
  require_changes: false
```

### 4.2 Coverage Badges

Add to README.md:
```markdown
[![codecov](https://codecov.io/gh/roaya/lead-management/branch/main/graph/badge.svg)](https://codecov.io/gh/roaya/lead-management)
```

---

## 5. Quality Gates

### 5.1 Pull Request Requirements

```yaml
# .github/branch-protection.yml
required_status_checks:
  strict: true
  contexts:
    - "Lint and Format Check"
    - "Unit Tests"
    - "Integration Tests"
    - "Code Coverage Analysis"
    - "E2E Tests - chromium"
    - "Security Scan"

required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
```

### 5.2 Automated Quality Checks

| Check | Threshold | Action |
|-------|-----------|--------|
| Code Coverage | >= 80% | Block merge |
| ESLint Errors | 0 | Block merge |
| TypeScript Errors | 0 | Block merge |
| Security Vulnerabilities (High) | 0 | Block merge |
| Security Vulnerabilities (Medium) | Warn | Allow merge |
| Test Failures | 0 | Block merge |

---

## 6. Performance Benchmarks

### 6.1 Performance Test Script

Create `tests/performance/load-test.k6.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failureRate = new Rate('failed_requests');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    failed_requests: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'https://api-staging.roaya.co';

  // Test lead submission
  const payload = JSON.stringify({
    name: `Load Test User ${__VU}-${__ITER}`,
    email: `load-test-${__VU}-${__ITER}@example.com`,
    message: 'This is a performance test submission',
    language: 'en',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${baseUrl}/api/v1/leads/contact`, payload, params);

  const success = check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has leadId': (r) => r.json('data.leadId') !== undefined,
  });

  failureRate.add(!success);

  sleep(1);
}
```

---

## 7. Deployment Pipeline

### 7.1 Deployment Strategy

```
develop branch → Staging (Automatic)
     ↓
  Testing
     ↓
main branch → Production (Manual Approval)
```

### 7.2 Rollback Procedure

```yaml
# .github/workflows/rollback.yml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version/tag to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Rollback deployment
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets[format('{0}_HOST', upper(github.event.inputs.environment))] }}
          username: ${{ secrets[format('{0}_USER', upper(github.event.inputs.environment))] }}
          key: ${{ secrets[format('{0}_SSH_KEY', upper(github.event.inputs.environment))] }}
          script: |
            cd /var/www/roaya-api/${{ github.event.inputs.environment }}
            docker-compose pull roaya/lead-management-api:${{ github.event.inputs.version }}
            docker-compose up -d
            docker-compose logs --tail=100
```

---

## 8. Monitoring and Alerts

### 8.1 Slack Notifications

```yaml
# Add to workflow
- name: Notify on failure
  uses: 8398a7/action-slack@v3
  if: failure()
  with:
    status: ${{ job.status }}
    text: |
      ❌ Pipeline failed
      Branch: ${{ github.ref }}
      Actor: ${{ github.actor }}
      Job: ${{ github.job }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 8.2 Test Result Dashboard

Use GitHub Actions dashboard or integrate with:
- **Allure Report** for test visualization
- **SonarQube** for code quality metrics
- **Grafana** for performance metrics

---

## Required GitHub Secrets

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `CODECOV_TOKEN` | Codecov upload token | https://codecov.io |
| `TEST_DATABASE_URL` | CI test database URL | Managed by GitHub Actions services |
| `TEST_JWT_ACCESS_SECRET` | Test JWT secret | Generate: `openssl rand -base64 64` |
| `TEST_JWT_REFRESH_SECRET` | Test refresh token secret | Generate: `openssl rand -base64 64` |
| `TEST_ADMIN_PASSWORD` | Test admin password | Choose secure password |
| `DOCKER_USERNAME` | Docker Hub username | https://hub.docker.com |
| `DOCKER_PASSWORD` | Docker Hub password/token | https://hub.docker.com |
| `STAGING_HOST` | Staging server IP/hostname | Server configuration |
| `STAGING_USER` | SSH username for staging | Server configuration |
| `STAGING_SSH_KEY` | SSH private key for staging | Generate: `ssh-keygen` |
| `PRODUCTION_HOST` | Production server IP/hostname | Server configuration |
| `PRODUCTION_USER` | SSH username for production | Server configuration |
| `PRODUCTION_SSH_KEY` | SSH private key for production | Generate: `ssh-keygen` |
| `SNYK_TOKEN` | Snyk security scan token | https://snyk.io |
| `SLACK_WEBHOOK` | Slack webhook URL | Slack workspace settings |

---

## Pipeline Execution Examples

### Pull Request Pipeline
```
Pull Request #42 opened
├─ Lint and Format Check ✅ (2m 15s)
├─ Unit Tests ✅ (4m 30s)
├─ Integration Tests ✅ (7m 20s)
├─ Code Coverage ✅ 83% (6m 45s)
├─ E2E Tests (chromium) ✅ (12m 30s)
├─ E2E Tests (firefox) ✅ (13m 10s)
├─ E2E Tests (webkit) ✅ (14m 05s)
└─ Security Scan ⚠️ 2 medium vulnerabilities (8m 00s)

Total: 48m 25s
Status: ✅ Ready to merge
```

### Deployment Pipeline (develop → staging)
```
Push to develop
├─ [Previous stages pass]
├─ Build Docker Image ✅ (8m 30s)
└─ Deploy to Staging ✅ (6m 15s)
   └─ Smoke Tests ✅ (30s)

Deployment complete: https://api-staging.roaya.co
```

---

**Next Steps:**
- Set up GitHub secrets
- Configure branch protection rules
- Test pipeline with a pull request
- Monitor first deployments

**References:**
- GitHub Actions docs: https://docs.github.com/actions
- Codecov docs: https://docs.codecov.com
- k6 docs: https://k6.io/docs

---

*This CI/CD pipeline ensures every code change is thoroughly tested before reaching production.*
