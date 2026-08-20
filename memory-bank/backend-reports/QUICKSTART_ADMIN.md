# Quick Start Guide - Admin Dashboard

## Getting Started in 5 Minutes

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 16+ running
- Redis 7+ running (for email queue)

### Step 1: Start the Backend (Terminal 1)

```bash
cd /Users/roaya/Roaya-files/Development/roaya/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Backend will run on `http://localhost:3001`

### Step 2: Start the Frontend (Terminal 2)

```bash
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
npm install
ng serve
```

Frontend will run on `http://localhost:4200`

### Step 3: Login to Admin Dashboard

1. Open browser: `http://localhost:4200/admin/login`
2. Use these credentials:
   - **Email**: `admin@roaya.ai`
   - **Password**: `Admin@123456`
3. Click "Login"

### Step 4: Explore the Dashboard

You should now see:
- Dashboard with statistics and charts
- Lead pipeline funnel visualization
- Leads list with filters
- Dark mode toggle
- Language switcher (EN/AR)

---

## Default Admin Users

After running `npm run prisma:seed`, you'll have these users:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@roaya.ai | Admin@123456 |
| **Sales Manager** | sales@roaya.ai | Admin@123456 |

### Password Requirements (for new passwords)
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&#^()_+-=[]{}|;':",.<>/\`~)

---

## Project Structure

```
roaya/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── api/v1/            # API routes & controllers
│   │   ├── application/       # Business logic services
│   │   ├── config/            # Database & Redis config
│   │   └── infrastructure/    # Email service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   └── package.json
│
└── roaya-website/             # Angular 21 Frontend
    ├── src/
    │   └── app/
    │       ├── features/admin/    # Admin dashboard pages
    │       ├── core/              # Services, guards, interceptors
    │       └── shared/            # Shared components
    ├── ADMIN_DASHBOARD.md        # Full documentation
    └── package.json
```

---

## Security Features

### Authentication
- **httpOnly Cookies**: Tokens stored in secure httpOnly cookies (not accessible via JavaScript)
- **CSRF Protection**: All state-changing requests require CSRF token
- **Session Management**: Server-side session validation
- **Rate Limiting**: 5 login attempts per 15 minutes per IP

### How Authentication Works
1. User logs in → Server sets httpOnly cookies with tokens
2. All API requests automatically include cookies (`withCredentials: true`)
3. State-changing requests (POST/PUT/DELETE) include CSRF token header
4. Tokens refresh automatically before expiry
5. Logout clears all cookies server-side

### Security Headers
- `X-CSRF-Token` - Required for POST, PUT, PATCH, DELETE requests
- Cookies: `httpOnly`, `secure` (production), `sameSite=strict`

---

## API Endpoints

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/leads/submit` | Submit new lead |

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (sets cookies) |
| POST | `/api/v1/auth/logout` | Logout (clears cookies) |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/profile` | Get current user |
| GET | `/api/v1/auth/csrf-token` | Get CSRF token |

### Lead Management (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leads` | List leads (paginated) |
| GET | `/api/v1/leads/:id` | Get single lead |
| PATCH | `/api/v1/leads/:id` | Update lead |
| DELETE | `/api/v1/leads/:id` | Delete lead |
| GET | `/api/v1/leads/stats` | Dashboard statistics |

---

## Key Features

### Dashboard
- Total leads count with trend indicators
- New leads (today, week, month)
- Lead pipeline funnel (New → Contacted → Qualified → Won)
- Leads by status chart
- Leads by source chart
- Source × Status heatmap

### Lead Management
- Paginated table with sorting
- Advanced filters (status, source, priority, date range)
- Search with 300ms debounce
- Lead detail view with editing
- Activity timeline
- Notes management
- Tag management
- XSS-safe content display

### Theme & i18n
- Dark/Light mode toggle
- English/Arabic language toggle
- RTL support

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process
lsof -ti :3001 | xargs kill -9

# Check PostgreSQL is running
brew services start postgresql@16

# Check Redis is running
brew services start redis
```

### Frontend won't start
```bash
# Check if port 4200 is in use
lsof -i :4200

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login
```bash
# Reseed the database to recreate admin users
cd /Users/roaya/Roaya-files/Development/roaya/backend
npx prisma migrate reset
npm run prisma:seed
```

### CORS errors
Check `backend/.env` has:
```env
CORS_ORIGIN=http://localhost:4200
```

### CSRF token errors
CSRF token is fetched automatically after login. If you see CSRF errors:
1. Clear browser cookies
2. Clear localStorage/sessionStorage
3. Login again

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roaya_leads"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CSRF
CSRF_SECRET=your-csrf-secret-key-at-least-32-chars

# CORS
CORS_ORIGIN=http://localhost:4200

# Email (optional for local dev)
SENDGRID_API_KEY=
ADMIN_NOTIFICATION_EMAIL=admin@roaya.ai
```

---

## Documentation

- **Admin Dashboard**: `roaya-website/ADMIN_DASHBOARD.md`
- **New Developer Guide**: `memory-bank/backend-reports/NEW_DEVELOPER_GUIDE.md`
- **API Access Guide**: `backend/API_ACCESS.md`
- **Security Implementation**: `backend/SECURITY_IMPLEMENTATION.md`
- **Backend Testing**: `memory-bank/backend-reports/LOCAL_TESTING_GUIDE.md`

---

## Tech Stack

**Frontend:**
- Angular 21 (Standalone Components)
- PrimeNG 21 (UI Library)
- TypeScript
- RxJS & Signals
- SCSS with Glassmorphism

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL 16
- Redis 7 (email queue)
- JWT with httpOnly cookies
- CSRF protection

---

## Development Workflow

1. **Start services**: PostgreSQL, Redis, Backend, Frontend
2. **Make changes** to components/services
3. **Hot reload** automatically updates browser
4. **Check console** for any errors
5. **Test in browser** using the admin dashboard
6. **Run build** to verify: `npm run build`
7. **Commit changes** when ready

---

## Useful Commands

```bash
# Backend
cd /Users/roaya/Roaya-files/Development/roaya/backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run test             # Run tests
npx prisma studio        # Open database GUI

# Frontend
cd /Users/roaya/Roaya-files/Development/roaya/roaya-website
ng serve                 # Start dev server
npm run build            # Build for production

# Kill ports
lsof -ti :3001 :4200 | xargs kill -9

# Database
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema changes
npx prisma studio        # Database GUI (localhost:5555)
```

---

**Status**: Production Ready
**Last Updated**: January 22, 2026
**Security**: httpOnly cookies, CSRF protection, rate limiting
