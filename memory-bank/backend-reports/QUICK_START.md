# Quick Start Guide - Roaya Lead API

Get the backend API running in 5 minutes.

---

## Prerequisites

```bash
# Verify installations
node --version  # Should be >= 20.0.0
npm --version   # Should be >= 10.0.0
psql --version  # Should be >= 16
redis-cli --version  # Should be >= 7
```

---

## 1. Install Dependencies

```bash
cd backend
npm install
```

---

## 2. Configure Environment

```bash
cp .env.example .env
```

**Edit `.env` with your values:**

```env
# Database (create database first: createdb roaya_leads)
DATABASE_URL="postgresql://postgres:password@localhost:5432/roaya_leads"

# JWT Secrets (generate: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here

# SendGrid
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=noreply@roaya.co
ADMIN_NOTIFICATION_EMAIL=sales@roaya.co

# Template IDs (from SendGrid dashboard)
TEMPLATE_ADMIN_NOTIFICATION=d-xxxxxx
TEMPLATE_CUSTOMER_CONFIRMATION_EN=d-xxxxxx
TEMPLATE_CUSTOMER_CONFIRMATION_AR=d-xxxxxx
```

---

## 3. Setup Database

```bash
# Create database
createdb roaya_leads

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed data (optional - includes sample admin user)
npx tsx prisma/seed.ts
```

---

## 4. Create Admin User

**Option A: Via Prisma Studio**
```bash
npm run prisma:studio
# Navigate to admin_users table
# Click "Add record"
# Fill in:
#   email: admin@roaya.co
#   password_hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VYx.IqXki
#   name: Admin User
#   role: admin
# Save
```

**Option B: Via psql**
```bash
psql roaya_leads

INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@roaya.co',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VYx.IqXki',
  'Admin User',
  'admin'
);
```

**Default password:** `AdminPassword123!` (change immediately!)

---

## 5. Start Redis

```bash
# Start Redis server
redis-server

# Or if using systemd
sudo systemctl start redis
```

---

## 6. Run the API

```bash
# Development mode (with hot reload)
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 7. Test the API

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@roaya.co",
    "password": "AdminPassword123!"
  }'
```

Copy the `accessToken` from response.

### Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/v1/leads/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+20123456789",
    "company": "Test Corp",
    "message": "I am interested in your cloud solutions",
    "language": "en"
  }'
```

### List Leads (requires auth)
```bash
curl -X GET http://localhost:3000/api/v1/admin/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Common Issues

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
# Verify database exists: psql -l
```

### "Redis connection failed"
```bash
# Check Redis is running
sudo systemctl status redis

# Or start it
redis-server
```

### "Email not sending"
```bash
# Check SendGrid API key is set in .env
# Verify template IDs are correct
# Check logs: npm run dev (watch console)
```

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

---

## Development Tools

### View Database
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### View Logs
```bash
# Development mode shows logs in console
npm run dev

# Production mode
pm2 logs roaya-api
```

### Generate JWT Secrets
```bash
openssl rand -base64 64
```

### Test Email Queue
```bash
# Check queue status in Redis
redis-cli
> LLEN bull:email-notifications:wait
```

---

## Next Steps

1. **Configure SendGrid Templates**
   - Create 3 templates in SendGrid dashboard
   - Copy template IDs to `.env`

2. **Test Email Delivery**
   - Submit a test form
   - Check your email for confirmation

3. **Frontend Integration**
   - Update Angular environment with API URL
   - Test form submissions from frontend

4. **Production Deployment**
   - See README.md for full deployment guide
   - Configure Nginx reverse proxy
   - Set up SSL with Let's Encrypt
   - Deploy with PM2

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:migrate` | Run database migrations |
| `npm test` | Run tests |
| `npm run lint` | Check code style |

---

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/health` | GET | No | Health check |
| `/api/v1/leads/contact` | POST | No | Submit contact form |
| `/api/v1/leads/pricing-quote` | POST | No | Submit pricing quote |
| `/api/v1/leads/roi-calculator` | POST | No | Submit ROI calculator |
| `/api/v1/auth/login` | POST | No | Admin login |
| `/api/v1/auth/refresh` | POST | No | Refresh token |
| `/api/v1/auth/me` | GET | Yes | Get current user |
| `/api/v1/admin/leads` | GET | Yes | List leads |
| `/api/v1/admin/leads/:id` | GET | Yes | Get lead details |
| `/api/v1/admin/leads/:id` | PATCH | Yes | Update lead |

---

## Environment Variables Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment |
| `PORT` | No | 3000 | Server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |
| `REDIS_HOST` | No | localhost | Redis host |
| `JWT_ACCESS_SECRET` | Yes | - | JWT secret (64+ chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh secret (64+ chars) |
| `SENDGRID_API_KEY` | Yes | - | SendGrid API key |
| `ADMIN_NOTIFICATION_EMAIL` | Yes | - | Sales team email |
| `TEMPLATE_ADMIN_NOTIFICATION` | Yes | - | SendGrid template ID |
| `TEMPLATE_CUSTOMER_CONFIRMATION_EN` | Yes | - | SendGrid template ID |
| `TEMPLATE_CUSTOMER_CONFIRMATION_AR` | Yes | - | SendGrid template ID |

---

## Support

**Questions?** Check the full documentation:
- `README.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical overview
- `memory-bank/project/lead-management-system-complete-plan.md` - Full system plan

**Issues?** Contact:
- Email: dev@roaya.co
- Slack: #roaya-backend

---

**You're all set! Start building amazing features.** 🚀
