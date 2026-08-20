
# Roaya Lead Management System - Backend API

Production-ready REST API for the Roaya IT Lead Management System built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

---

## Features

- **Lead Capture** - Three form endpoints (Contact, Pricing Quote, ROI Calculator)
- **Email Notifications** - SendGrid integration with Bull queue
- **JWT Authentication** - Access/refresh token rotation with bcrypt password hashing
- **Role-Based Access** - Admin, Manager, Sales, Viewer roles
- **Activity Logging** - Complete audit trail for all lead activities
- **Rate Limiting** - Redis-backed rate limiting per endpoint
- **Clean Architecture** - Separation of concerns (Presentation → Application → Domain → Infrastructure)
- **Production-Ready** - Comprehensive error handling, logging, security headers, CORS

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js v20 LTS | Server-side JavaScript |
| Framework | Express.js v4.18+ | REST API framework |
| Language | TypeScript v5.7+ | Type safety |
| Database | PostgreSQL v16 | Primary data store |
| Cache | Redis v7 | Sessions, rate limiting, queue |
| ORM | Prisma v5+ | Type-safe database client |
| Email | SendGrid | Transactional emails |
| Queue | Bull v4+ | Email job queue |
| Auth | JWT | Token-based authentication |
| Validation | Zod v3+ | Schema validation |
| Process Manager | PM2 | Production process management |

---

## Project Structure

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts        # Prisma client
│   │   ├── redis.ts           # Redis client
│   │   └── environment.ts     # Environment config
│   │
│   ├── presentation/          # HTTP/API layer
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── validators/
│   │
│   ├── application/           # Business logic
│   │   ├── services/
│   │   └── dto/
│   │
│   ├── domain/                # Enterprise rules
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── exceptions/
│   │
│   ├── infrastructure/        # External concerns
│   │   ├── database/
│   │   ├── email/
│   │   └── cache/
│   │
│   ├── shared/                # Shared utilities
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── ecosystem.config.js        # PM2 configuration
```

---

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 16
- Redis >= 7
- SendGrid account

---

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Critical environment variables:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/roaya_leads"

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_64_char_secret_here
JWT_REFRESH_SECRET=your_64_char_secret_here

# SendGrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@roaya.co
ADMIN_NOTIFICATION_EMAIL=sales@roaya.co

# Template IDs (create in SendGrid dashboard)
TEMPLATE_ADMIN_NOTIFICATION=d-xxxxxx
TEMPLATE_CUSTOMER_CONFIRMATION_EN=d-xxxxxx
TEMPLATE_CUSTOMER_CONFIRMATION_AR=d-xxxxxx
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) View database in Prisma Studio
npm run prisma:studio
```

### 4. Create Admin User

```typescript
// Run this via Prisma Studio or psql
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@roaya.co',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VYx.IqXki',
  'Admin User',
  'admin'
);

// Default password: AdminPassword123!
// CHANGE IMMEDIATELY AFTER FIRST LOGIN
```

### 5. SendGrid Template Setup

Create three email templates in your SendGrid dashboard:

**Template 1: Admin Notification**
- Subject: `[NEW LEAD] {{ company_name }} via {{ source_name }}`
- Variables: `source_name`, `created_at`, `contact_name`, `email`, `phone`, `company_name`, `services`, `message`, `admin_url`, `lead_id`

**Template 2: Customer Confirmation (English)**
- Subject: `Thank you for contacting Roaya IT - We received your inquiry`
- Variables: `contact_name`, `company_name`, `created_at`, `estimated_response`, `website_url`, `support_email`, `phone_number`, `address`

**Template 3: Customer Confirmation (Arabic)**
- Subject: `شكراً لتواصلك مع رؤية - تم استلام استفسارك`
- Variables: (same as English, but with Arabic text)

---

## Running the Application

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### With PM2 (Production)

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# View logs
pm2 logs roaya-api

# Stop
pm2 stop roaya-api

# Restart
pm2 restart roaya-api
```

---

## API Endpoints

### Base URL

```
Production:  https://api.roaya.co/api/v1
Development: http://localhost:3000/api/v1
```

### Public Endpoints

#### POST /api/v1/leads/contact
Submit contact form.

**Request:**
```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "phone": "+20123456789",
  "company": "Example Corp",
  "service": "cloud",
  "message": "I am interested in cloud solutions...",
  "language": "en",
  "utmParams": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "cloud_services"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "lead_abc123",
    "createdAt": "2026-01-21T10:30:00Z",
    "estimatedResponse": "24-48 hours"
  },
  "meta": {
    "timestamp": "2026-01-21T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

#### POST /api/v1/leads/pricing-quote
Submit pricing quote request.

#### POST /api/v1/leads/roi-calculator
Submit ROI calculator lead.

### Authentication Endpoints

#### POST /api/v1/auth/login
Admin login.

**Request:**
```json
{
  "email": "admin@roaya.co",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "usr_123",
      "email": "admin@roaya.co",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token.

#### POST /api/v1/auth/logout
Logout (requires authentication).

#### GET /api/v1/auth/me
Get current user (requires authentication).

### Admin Endpoints (Require Authentication)

#### GET /api/v1/admin/leads
List all leads with filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (new, contacted, qualified, etc.)
- `source` (contact, pricing_quote, roi_calculator)
- `dateFrom` (ISO 8601)
- `dateTo` (ISO 8601)
- `search` (searches name, email, company)
- `sortBy` (createdAt, updatedAt, companyName, leadScore)
- `sortOrder` (asc, desc)

#### GET /api/v1/admin/leads/:id
Get single lead with full details and activity history.

#### PATCH /api/v1/admin/leads/:id
Update lead (admin/manager/sales only).

**Request:**
```json
{
  "statusId": 2,
  "assignedTo": "usr_456",
  "leadScore": 85,
  "isQualified": true
}
```

#### POST /api/v1/admin/leads/export
Export leads to CSV/Excel (admin/manager/sales only).

#### GET /api/v1/admin/dashboard/stats
Dashboard statistics.

---

## Security

### Authentication
- JWT-based with access (15min) and refresh tokens (7 days)
- Token rotation on refresh
- Bcrypt password hashing (cost factor: 12)
- Account lockout after 10 failed login attempts

### Rate Limiting
- General API: 100 requests/minute per IP
- Form submissions: 5 per 15 minutes per IP
- Login attempts: 5 per 15 minutes per email+IP

### Security Headers
- Helmet.js for security headers
- HSTS enabled
- XSS protection
- Content-Security-Policy

### Input Validation
- Zod schema validation for all inputs
- SQL injection prevention via Prisma ORM
- XSS prevention via input sanitization

---

## Error Handling

All errors return a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Invalid email format"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-01-21T10:30:00Z"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Unexpected error |

---

## Logging

Structured JSON logging with Pino:

```typescript
{
  "level": "info",
  "time": "2026-01-21T10:30:00.000Z",
  "service": "roaya-lead-api",
  "version": "1.0.0",
  "environment": "production",
  "requestId": "req_abc123",
  "method": "POST",
  "path": "/api/v1/leads/contact",
  "statusCode": 201,
  "duration": "45ms",
  "msg": "Request completed"
}
```

Log levels: `debug`, `info`, `warn`, `error`, `fatal`

---

## Monitoring

### Health Check

```bash
GET /api/v1/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-21T10:30:00Z",
    "uptime": 123456,
    "environment": "production"
  }
}
```

### PM2 Monitoring

```bash
# Process status
pm2 list

# Real-time monitoring
pm2 monit

# Logs
pm2 logs roaya-api

# Error logs only
pm2 logs roaya-api --err
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Deployment

### Server Requirements
- 4 vCPUs
- 8 GB RAM
- 100 GB SSD
- Ubuntu 22.04 LTS

### Deployment Steps

1. **Install dependencies**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# PM2
sudo npm install -g pm2
```

2. **Clone and build**
```bash
git clone <repository>
cd backend
npm install
npm run build
```

3. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with production values
```

4. **Run migrations**
```bash
npm run prisma:migrate:prod
```

5. **Start with PM2**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

6. **Configure Nginx** (see plan document for Nginx config)

7. **Set up SSL** with Let's Encrypt
```bash
sudo certbot --nginx -d api.roaya.co
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis
```

### Email Not Sending
- Check SendGrid API key is valid
- Verify template IDs are correct
- Check email queue with `npm run queue:status`
- View queue logs: `pm2 logs roaya-api | grep email`

### High Memory Usage
- Check PM2 memory limit: `max_memory_restart: '500M'`
- Restart app: `pm2 restart roaya-api`
- Monitor: `pm2 monit`

---

## Contributing

1. Follow TypeScript style guide
2. Write tests for new features
3. Update documentation
4. Run linter: `npm run lint`
5. Format code: `npm run format`

---

## License

Proprietary - Roaya IT Solutions

---

## Support

For issues or questions:
- Email: dev@roaya.co
- Slack: #roaya-backend

---

**Built with excellence by the Roaya Engineering Team**
