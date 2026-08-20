# Local Testing Guide - Lead Management System

Complete guide for testing the Lead Management System backend locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running Automated Tests](#running-automated-tests)
4. [Manual API Testing](#manual-api-testing)
5. [Testing with Real Database](#testing-with-real-database)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before testing, ensure you have the following installed:

```bash
# Check versions
node --version    # Should be >= 20.0.0
npm --version     # Should be >= 10.0.0
psql --version   # Should be >= 16 (optional for unit/integration tests)
redis-cli --version  # Should be >= 7 (optional for unit/integration tests)
```

**Note:** Unit and integration tests use mocks, so PostgreSQL and Redis are **not required** for automated tests. However, they are needed for:
- E2E tests
- Manual API testing
- Full system testing

---

## Initial Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

For **automated tests**, environment variables are automatically set in `tests/setup.ts`. No `.env` file needed.

For **manual/E2E testing**, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your local values:

```env
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database (for E2E and manual testing)
DATABASE_URL="postgresql://postgres:password@localhost:5432/roaya_leads_test"

# Redis (for E2E and manual testing)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your-test-secret-key-at-least-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# SendGrid (optional for testing - can be empty)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@roaya.co
SENDGRID_FROM_NAME=Roaya AI
ADMIN_NOTIFICATION_EMAIL=test@roaya.co

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

---

## Running Automated Tests

### Quick Test Commands

```bash
# Run all tests (unit + integration)
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run E2E tests only (requires real DB and Redis)
npm run test:e2e
```

### Test Structure

The project has three types of tests:

1. **Unit Tests** (`tests/unit/`)
   - Test individual services in isolation
   - Use mocked dependencies
   - Fast execution
   - Files:
     - `lead.service.test.ts` - Lead service logic
     - `auth.service.test.ts` - Authentication logic

2. **Integration Tests** (`tests/integration/`)
   - Test API endpoints end-to-end
   - Use mocked database/Redis
   - Test request/response flow
   - Files:
     - `leads.api.test.ts` - Lead endpoints
     - `auth.api.test.ts` - Auth endpoints

3. **E2E Tests** (`tests/e2e/`)
   - Test full system with real database
   - Requires PostgreSQL and Redis running
   - Slower but most comprehensive
   - File:
     - `contact-form.e2e.test.ts` - Full contact form submission flow

### Running Specific Test Suites

```bash
# Run only unit tests
npx vitest run tests/unit

# Run only integration tests
npx vitest run tests/integration

# Run a specific test file
npx vitest run tests/unit/lead.service.test.ts

# Run tests matching a pattern
npx vitest run -t "createLead"
```

### Test Coverage

After running `npm run test:coverage`, view the HTML report:

```bash
# Coverage report is generated in:
open coverage/index.html  # macOS
# or
xdg-open coverage/index.html  # Linux
```

Coverage metrics:
- **Services**: Target 85%+ statements, 80%+ branches
- **Controllers**: Target 80%+ statements, 75%+ branches
- **Middleware**: Target 75%+ statements, 70%+ branches

---

## Manual API Testing

### 1. Start the Development Server

```bash
# Terminal 1: Start the API
npm run dev

# Server should start at http://localhost:3001
```

### 2. Test with cURL

#### Health Check

```bash
curl http://localhost:3001/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-21T10:30:00Z"
  }
}
```

#### Submit Contact Form (Public Endpoint)

```bash
curl -X POST http://localhost:3001/api/v1/leads/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Al-Rashid",
    "email": "ahmed@company.com",
    "phone": "+966501234567",
    "company": "TechCorp",
    "jobTitle": "CTO",
    "source": "CONTACT_FORM",
    "message": "Interested in AI solutions",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "ai-ksa"
  }'
```

Expected response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "message": "Thank you for your submission. We will contact you shortly."
  }
}
```

#### Admin Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@roaya.ai",
    "password": "YourAdminPassword"
  }'
```

Save the `accessToken` from the response.

#### Get Leads List (Protected)

```bash
curl -X GET "http://localhost:3001/api/v1/leads?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### Get Lead Statistics

```bash
curl -X GET http://localhost:3001/api/v1/leads/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### Update Lead Status

```bash
curl -X PATCH http://localhost:3001/api/v1/leads/LEAD_UUID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED",
    "priority": "HIGH"
  }'
```

### 3. Test with Postman

1. **Import Collection** (create manually or use these endpoints):

   **Base URL:** `http://localhost:3001/api/v1`

   **Endpoints:**
   - `GET /health` - Health check
   - `POST /leads/submit` - Submit lead (public)
   - `POST /auth/login` - Admin login
   - `GET /leads` - List leads (requires auth)
   - `GET /leads/stats` - Statistics (requires auth)
   - `GET /leads/:id` - Get lead details (requires auth)
   - `PATCH /leads/:id` - Update lead (requires auth)
   - `POST /leads/:id/notes` - Add note (requires auth)

2. **Set Environment Variables:**
   - `baseUrl`: `http://localhost:3001/api/v1`
   - `accessToken`: (set after login)

3. **Test Flow:**
   ```
   1. POST /auth/login → Save accessToken
   2. GET /leads → Should return list
   3. POST /leads/submit → Create new lead
   4. GET /leads → Verify new lead appears
   5. PATCH /leads/:id → Update lead
   6. GET /leads/:id → Verify update
   ```

### 4. Test Rate Limiting

```bash
# Submit 6 requests quickly (limit is 5 per 15 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/v1/leads/submit \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "Test",
      "lastName": "User",
      "email": "test'$i'@example.com",
      "phone": "+966501234567",
      "company": "Test Corp",
      "source": "CONTACT_FORM"
    }'
  echo ""
done
```

The 6th request should return `429 Too Many Requests`.

---

## Testing with Real Database

For E2E tests and full system testing, you need a real database.

### 1. Set Up Test Database

```bash
# Create test database
createdb roaya_leads_test

# Or with specific user
createdb -U postgres roaya_leads_test
```

### 2. Run Migrations

```bash
# Set test database URL
export DATABASE_URL="postgresql://postgres:password@localhost:5432/roaya_leads_test"

# Run migrations
npm run prisma:migrate

# Or use Prisma migrate directly
npx prisma migrate dev --name test_setup
```

### 3. Seed Test Data (Optional)

```bash
# Seed with sample data
npm run prisma:seed
```

### 4. Run E2E Tests

```bash
# Make sure Redis is running
redis-server  # or: sudo systemctl start redis

# Run E2E tests
npm run test:e2e
```

### 5. View Database During Testing

```bash
# Open Prisma Studio
npm run prisma:studio

# Or use psql
psql roaya_leads_test

# View leads
SELECT * FROM leads;

# View admin users
SELECT * FROM admin_users;

# View activities
SELECT * FROM lead_activities;
```

---

## Testing Checklist

### ✅ Automated Tests

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass
- [ ] E2E tests pass (if DB/Redis available)
- [ ] Coverage meets targets (85%+ services, 80%+ controllers)

### ✅ Manual API Testing

- [ ] Health check endpoint works
- [ ] Public lead submission works
- [ ] Rate limiting works (test with 6+ requests)
- [ ] Admin login works
- [ ] Protected endpoints require authentication
- [ ] Lead CRUD operations work
- [ ] Statistics endpoint returns data
- [ ] Notes can be added to leads
- [ ] Tags can be added/removed

### ✅ Security Testing

- [ ] Invalid credentials rejected
- [ ] Expired tokens rejected
- [ ] Rate limiting prevents abuse
- [ ] Input validation works (try invalid email, etc.)
- [ ] SQL injection attempts fail (try `'; DROP TABLE--`)

### ✅ Email Testing (if SendGrid configured)

- [ ] Lead confirmation email sent
- [ ] Admin notification email sent
- [ ] Email queue processes jobs
- [ ] Failed emails are retried

---

## Troubleshooting

### Tests Fail with "Cannot find module"

```bash
# Regenerate Prisma client
npm run prisma:generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Tests Fail with Database Connection Error

**For unit/integration tests:** This shouldn't happen as they use mocks. If it does:

```bash
# Check that tests/setup.ts is properly mocking Prisma
# Verify NODE_ENV=test is set
```

**For E2E tests:** Ensure PostgreSQL is running:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -U postgres -d roaya_leads_test -c "SELECT 1;"
```

### Tests Fail with Redis Connection Error

**For unit/integration tests:** Shouldn't happen (mocked).

**For E2E tests:** Ensure Redis is running:

```bash
# Check Redis status
redis-cli ping  # Should return PONG

# Start Redis
redis-server

# Or with systemd
sudo systemctl start redis
```

### "Port 3001 already in use"

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Tests Timeout

```bash
# Increase timeout in vitest.config.ts
testTimeout: 30000  # 30 seconds

# Or for specific test
it('should work', async () => {
  // test code
}, { timeout: 60000 });  // 60 seconds
```

### Mock Not Working

```bash
# Clear Vitest cache
rm -rf node_modules/.vitest

# Re-run tests
npm test
```

### Coverage Report Not Generated

```bash
# Install coverage provider
npm install --save-dev @vitest/coverage-v8

# Run with coverage
npm run test:coverage

# Check coverage directory exists
ls -la coverage/
```

---

## Advanced Testing

### Testing with Different Environments

```bash
# Test with production-like config
NODE_ENV=production npm test

# Test with custom database
DATABASE_URL="postgresql://..." npm run test:e2e
```

### Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/vitest run

# Or use VS Code debugger
# Create .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

### Performance Testing

```bash
# Test API response times
time curl http://localhost:3001/api/v1/health

# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/v1/health

# Or use autocannon
npx autocannon http://localhost:3001/api/v1/health
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With coverage |
| `npm run test:e2e` | E2E tests only |
| `npm run dev` | Start dev server |
| `npm run prisma:studio` | View database |
| `npm run prisma:migrate` | Run migrations |

---

## Next Steps

After local testing passes:

1. **Code Review** - Ensure all tests pass
2. **CI/CD Setup** - Configure automated testing in pipeline
3. **Staging Deployment** - Test on staging environment
4. **Production Deployment** - Deploy to production

---

## Support

**Issues?** Check:
- `README.md` - Full documentation
- `QUICK_START.md` - Quick setup guide
- `memory-bank/project/lead-management-system-final-report.md` - System documentation

**Questions?** Contact:
- Email: dev@roaya.co
- Slack: #roaya-backend

---

**Happy Testing! 🧪**
