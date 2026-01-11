# Roaya IT Admin Panel - Complete Product Plan

**Project:** Roaya IT Website Admin Panel
**Date:** 2026-01-11
**Status:** Planning Phase - Awaiting Approval

---

## 1. Executive Summary

### What We're Building
A comprehensive, enterprise-grade admin panel for the Roaya IT website to:
- Manage blog content without developer intervention
- Track visitor analytics with heatmaps
- Provide extensibility for future content management (pricing tables, etc.)

### Feasibility Assessment
- **Feasibility:** HIGH - Current frontend architecture is well-structured with service stubs ready
- **Complexity:** MEDIUM-HIGH - Full-stack with advanced analytics
- **Timeline:** 18 weeks (~4.5 months) across 3 phases

### Key Challenges
1. **Security:** Admin authentication must be enterprise-grade (MENA region targeted attacks)
2. **Analytics Privacy:** GDPR/Egypt PDPL compliance for visitor tracking
3. **Bilingual CMS:** Dual-language editing with RTL support
4. **Heatmaps:** Real-time cursor tracking requires performance optimization

---

## 2. Current State Analysis

### Technology Stack (Existing)
- **Framework:** Angular v21 with standalone components
- **Styling:** Tailwind CSS v4, shadcn UI
- **i18n:** ngx-translate with EN/AR support, RTL ready
- **Animations:** GSAP + Anime.js
- **State:** RxJS + Signals

### What Exists
- ✅ Blog system (10 posts in-memory)
- ✅ GA4 service stub (not connected)
- ✅ API service stubs (contact, ROI leads)
- ✅ SEO service (meta tags, structured data)

### What Doesn't Exist
- ❌ Admin panel
- ❌ Authentication system
- ❌ Backend API
- ❌ Database
- ❌ Visitor tracking/heatmaps
- ❌ Content management

---

## 3. Technology Stack (New)

### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | NestJS 10 (Node.js 20 LTS) | TypeScript-native, modular, enterprise-ready |
| ORM | Prisma | Type-safe, excellent migrations |
| Database | PostgreSQL 16 | ACID, JSONB for analytics |
| Cache | Redis 7 | Sessions, rate limiting |
| Auth | Passport.js + JWT | Industry standard |

### Frontend (Admin Panel)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Angular 21 | Same as public site, shared types |
| UI Library | PrimeNG or Angular Material | Rich admin components |
| Charts | Chart.js or ApexCharts | Dashboard visualizations |
| Heatmaps | heatmap.js or custom Canvas | Click/scroll visualization |
| Editor | Quill (MVP) or TinyMCE | Rich text editing |

### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | AWS or DigitalOcean | Scalable, reliable |
| CDN | CloudFlare | DDoS protection, caching |
| Storage | S3/MinIO | Image storage |
| Email | SendGrid | Password reset, notifications |
| Geo IP | MaxMind GeoLite2 | Country detection |

---

## 4. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'analyst')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- English fields
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[],

  -- Arabic fields
  title_ar VARCHAR(500) NOT NULL,
  excerpt_ar TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  meta_title_ar VARCHAR(255),
  meta_description_ar TEXT,
  keywords_ar TEXT[],

  -- Common fields
  author_id UUID REFERENCES authors(id),
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  tags_ar TEXT[],
  featured_image_url TEXT,
  reading_time INT,
  reading_time_ar INT,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  featured BOOLEAN DEFAULT false,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Authors Table
```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  role_ar VARCHAR(255),
  bio TEXT,
  bio_ar TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Analytics - Pageviews
```sql
CREATE TABLE pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(500),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country_code CHAR(2),
  city VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_pageviews_timestamp ON pageviews(timestamp DESC);
CREATE INDEX idx_pageviews_country ON pageviews(country_code);
```

### Analytics - Sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INT,
  page_count INT DEFAULT 0,
  entry_page VARCHAR(500),
  exit_page VARCHAR(500),
  country_code CHAR(2),
  device_type VARCHAR(50)
);
```

### Analytics - Heatmap Clicks
```sql
CREATE TABLE heatmap_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  page_path VARCHAR(500) NOT NULL,
  x_coord INT NOT NULL,
  y_coord INT NOT NULL,
  viewport_width INT,
  viewport_height INT,
  element_id VARCHAR(255),
  element_class VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Analytics - Cursor Movements
```sql
CREATE TABLE cursor_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  page_path VARCHAR(500) NOT NULL,
  movements JSONB NOT NULL, -- [{x, y, timestamp}]
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Specification

### Authentication
```
POST   /api/auth/login
  Body: { email, password }
  Response: { access_token, refresh_token, user }

POST   /api/auth/logout
  Response: 204 No Content

POST   /api/auth/refresh
  Body: { refresh_token }
  Response: { access_token }

POST   /api/auth/forgot-password
  Body: { email }
  Response: 200 OK

POST   /api/auth/reset-password
  Body: { token, new_password }
  Response: 200 OK
```

### Blog Management
```
GET    /api/blog/posts?status=published&category=security&page=1&limit=10
  Response: { posts: [], total, page, totalPages }

GET    /api/blog/posts/:slug
  Response: { post }

POST   /api/blog/posts
  Body: { title, title_ar, content, content_ar, category, ... }
  Response: { post }
  Auth: Admin/Editor

PUT    /api/blog/posts/:id
  Body: { title, content, ... }
  Response: { post }
  Auth: Admin/Editor

DELETE /api/blog/posts/:id
  Response: 204 No Content
  Auth: Admin only

POST   /api/blog/posts/:id/publish
  Response: { post }
  Auth: Admin/Editor

POST   /api/blog/posts/:id/schedule
  Body: { scheduled_for }
  Response: { post }
```

### Image Upload
```
POST   /api/upload/image
  Body: FormData (multipart/form-data)
  Response: { url }
  Auth: Admin/Editor
```

### Analytics
```
POST   /api/analytics/track/pageview
  Body: { page_path, page_title, referrer, user_agent }
  Response: 204 No Content

POST   /api/analytics/track/heatmap-click
  Body: { page_path, x, y, viewport_width, viewport_height, element_id }
  Response: 204 No Content

POST   /api/analytics/track/cursor
  Body: { page_path, movements: [{x, y, t}] }
  Response: 204 No Content

GET    /api/analytics/dashboard/overview?start_date=...&end_date=...
  Response: { total_visitors, page_views, avg_session_time, top_pages, countries }
  Auth: Admin/Analyst

GET    /api/analytics/heatmap/:page_path?type=click&start_date=...
  Response: { heatmap_data, screenshot_url }
  Auth: Admin/Analyst

GET    /api/analytics/content-performance?start_date=...&end_date=...
  Response: { posts: [{ slug, views, avg_time, bounce_rate }] }
  Auth: Admin/Analyst
```

### User Management
```
GET    /api/users
  Response: { users: [] }
  Auth: Admin only

POST   /api/users
  Body: { email, name, role }
  Response: { user, invitation_sent: true }
  Auth: Admin only

PUT    /api/users/:id
  Body: { name, role, is_active }
  Response: { user }
  Auth: Admin only

DELETE /api/users/:id
  Response: 204 No Content
  Auth: Admin only
```

---

## 6. User Interface Design

### Information Architecture
```
Admin Panel
├── Dashboard (Home)
│   ├── Quick Stats Cards
│   ├── Recent Activity Feed
│   └── Quick Actions
├── Blog Management
│   ├── All Posts (list with filters)
│   ├── New Post (bilingual editor)
│   ├── Categories
│   ├── Tags
│   └── Authors
├── Analytics
│   ├── Overview Dashboard
│   ├── Heatmaps (by page)
│   ├── Visitors (geo map)
│   ├── Content Performance
│   └── Reports (export)
├── Settings
│   ├── User Management
│   ├── Profile
│   └── Security Logs
└── Help & Docs
```

### Blog Editor Layout
- **Header:** Save Draft | Preview | Publish | Discard
- **Layout:** Two-column (EN | AR) with sync scroll
- **Left Sidebar:** Category, tags, author, image, SEO
- **Main Content:** Rich text editors (EN/AR)
- **Right Sidebar:** Preview thumbnail, publish settings

### Dashboard Widgets
1. **Visitors Today** - Number with trend arrow
2. **New Posts This Week** - Count
3. **Top Page** - Most visited page
4. **Avg Session Time** - Minutes:Seconds
5. **Visitors Chart** - 30-day line chart
6. **Recent Posts Table** - 5 most recent

---

## 7. Security Architecture

### Authentication Flow
```
1. User submits email/password → /api/auth/login
2. Backend validates credentials (bcrypt compare)
3. Backend generates:
   - Access Token (JWT, 15min expiry)
   - Refresh Token (UUID, Redis, 7 days)
4. Frontend stores:
   - Access Token in memory
   - Refresh Token in HttpOnly cookie
5. Subsequent requests include Access Token
6. On expiry: refresh via /api/auth/refresh
```

### Role-Based Access Control
| Role | Permissions |
|------|-------------|
| Admin | Full access, user management, security logs |
| Editor | CRUD blog posts, view analytics |
| Analyst | View analytics only |

### Security Measures
- JWT secret: 256-bit random
- Refresh tokens in Redis with TTL
- Account lockout: 5 failed attempts → 15min lock
- Rate limiting: 100 req/min (public), 1000 req/min (admin)
- HTTPS only, HSTS header
- IP anonymization for GDPR/PDPL
- HTML sanitization (XSS prevention)
- Prisma ORM (SQL injection prevention)

### Security Risk Table
| Risk | Severity | Mitigation |
|------|----------|------------|
| Unauthorized admin access | CRITICAL | JWT + MFA + Rate limiting + Lockout |
| XSS in blog content | HIGH | HTML sanitization + CSP headers |
| SQL injection | HIGH | Prisma ORM |
| Heatmap data exposure | MEDIUM | IP anonymization + Access control |
| Brute force login | MEDIUM | Rate limiting + Lockout + CAPTCHA |
| DDoS | MEDIUM | CloudFlare + Rate limiting |

---

## 8. Implementation Phases

### Phase 1: MVP (6 Weeks)

**Week 1: Setup**
- Security architecture review
- Hosting provider selection
- Database schema finalization
- UX wireframes for admin panel

**Week 2: Infrastructure**
- NestJS project scaffolding
- Prisma ORM + PostgreSQL setup
- Redis connection
- Angular admin panel scaffolding
- CI/CD pipeline (GitHub Actions)

**Week 3-4: Authentication**
- User model + migrations
- Auth API endpoints (login, logout, refresh, reset)
- JWT strategy + guards
- Login/logout UI
- Password reset flow
- User management CRUD (Admin only)
- **Security Review Checkpoint**

**Week 5-6: Blog Admin + Analytics**
- Blog post model + migrations
- Blog CRUD API endpoints
- Image upload API (local → S3)
- Blog list UI with filters
- Blog editor UI (bilingual, rich text)
- Preview functionality
- Pageview tracking endpoint
- Analytics dashboard API
- Dashboard UI (stats cards, charts)
- Integration testing
- **Security Audit**
- **UAT with Content Team**
- **Production Deployment**

### Phase 2: Advanced Analytics (8 Weeks)

**Week 7-8: Tracking Implementation**
- Click tracking endpoint
- Scroll depth tracking
- Session management
- Cursor movement tracking (sampled)

**Week 9-10: Heatmap Backend**
- Data aggregation service
- Heatmap tile generation
- Page screenshot service
- Geographic visualization data

**Week 11-12: Heatmap Frontend**
- Heatmap visualization component
- Click/scroll/cursor map tabs
- Filters (date, device, country)
- Export to PNG/CSV

**Week 13: Session Analysis**
- Time spent per page
- Pages per session
- Bounce rate calculation
- Exit page analysis

**Week 14: Polish**
- Performance optimization
- Testing
- Documentation
- **Security Audit**
- **Production Deployment**

### Phase 3: CMS Extensibility (4 Weeks)

**Week 15-16: Pricing Admin**
- Pricing table model + API
- Package CRUD UI
- Feature management
- Bilingual support

**Week 17-18: CMS Framework**
- Generic content type builder
- Custom fields support
- Content versioning
- **Final Testing**
- **Production Deployment**

---

## 9. User Personas

### Persona 1: Content Manager (Primary)
- **Name:** Sarah, Marketing Content Lead
- **Goals:** Publish 2-3 blog posts/week in EN/AR
- **Pain Points:** Depends on developers, no visibility into performance

### Persona 2: Marketing Analyst (Primary)
- **Name:** Ahmed, Digital Marketing Analyst
- **Goals:** Understand visitor behavior, optimize funnels
- **Pain Points:** No analytics beyond GA4, can't see heatmaps

### Persona 3: System Administrator (Secondary)
- **Name:** Omar, IT Operations Lead
- **Goals:** Manage users, monitor security
- **Pain Points:** No centralized admin, security concerns

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Content Velocity | 3+ posts/week | Admin logs |
| Time to Publish | <10 min (from 2 hours) | Stopwatch test |
| Analytics Adoption | 5+ logins/week | Login analytics |
| Content Visibility | 100% posts tracked | Heatmap coverage |
| User Satisfaction | 4.5/5 rating | Post-launch survey |
| Security Incidents | 0 breaches/year | Security monitoring |

---

## 11. Performance Requirements

| Metric | Target |
|--------|--------|
| API response time | <200ms (p95) |
| Dashboard load | <2s |
| Heatmap render | <3s for 10k points |
| Database queries | <100ms (p95) |
| Uptime | 99.9% |

### Scalability Targets
- Phase 1: 100k pageviews/day
- Phase 2: 1M pageviews/day (with horizontal scaling)
- Admin panel: 10 concurrent users

---

## 12. Open Decisions

| Decision | Options | Recommendation | Deadline |
|----------|---------|----------------|----------|
| Hosting | AWS vs DigitalOcean | AWS | Week 1 |
| Rich Text Editor | TinyMCE vs Quill | Quill (MVP) | Week 4 |
| Email Service | SendGrid vs AWS SES | SendGrid | Week 2 |
| Analytics (Phase 2) | Custom vs PostHog | Evaluate end of Phase 1 | Week 6 |
| Image CDN | CloudFlare vs CloudFront | CloudFlare | Week 4 |

---

## 13. Dependencies & Blockers

### External Dependencies
- MaxMind GeoLite2 Database (IP → Country)
- SendGrid Account
- SSL Certificate (Let's Encrypt)
- Domain DNS (admin.roaya.co subdomain)
- CloudFlare Account

### Pre-Implementation Checklist
- [ ] Hosting provider selected
- [ ] Domain DNS configured
- [ ] Database credentials provisioned
- [ ] Email service account created
- [ ] S3 bucket created

---

## 14. Team Requirements

| Role | Allocation | Responsibilities |
|------|------------|------------------|
| Backend Engineer | 1 FTE | NestJS, Prisma, PostgreSQL |
| Frontend Engineer | 1 FTE | Angular admin panel |
| QA Engineer | 0.5 FTE | Testing, automation |
| Security Reviewer | 0.5 FTE | Audits, penetration testing |

---

## 15. File Structure

### Backend
```
roaya-admin-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── blog/
│   │   ├── blog.module.ts
│   │   ├── blog.controller.ts
│   │   ├── blog.service.ts
│   │   └── dto/
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   ├── heatmap.service.ts
│   │   └── geo.service.ts
│   ├── users/
│   ├── upload/
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── test/
```

### Frontend
```
roaya-admin-panel/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── blog-admin.service.ts
│   │   │   │   └── analytics-admin.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   └── interceptors/
│   │   │       ├── jwt.interceptor.ts
│   │   │       └── error.interceptor.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── forgot-password/
│   │   │   ├── dashboard/
│   │   │   ├── blog/
│   │   │   │   ├── blog-list/
│   │   │   │   ├── blog-editor/
│   │   │   │   ├── categories/
│   │   │   │   └── authors/
│   │   │   ├── analytics/
│   │   │   │   ├── overview/
│   │   │   │   ├── heatmaps/
│   │   │   │   └── content-performance/
│   │   │   └── settings/
│   │   │       ├── users/
│   │   │       └── profile/
│   │   ├── shared/
│   │   │   └── components/
│   │   └── layouts/
│   │       ├── admin-layout/
│   │       └── auth-layout/
│   └── assets/
│       └── i18n/
│           ├── admin-en.json
│           └── admin-ar.json
```

---

## 16. Verification Plan

### MVP Acceptance Criteria
- [ ] Content Manager can publish blog post in <10 minutes
- [ ] Blog appears on public website immediately
- [ ] Analytics dashboard shows visitor count (±5% accuracy)
- [ ] Works on Chrome, Firefox, Safari (latest)
- [ ] Mobile responsive (tablet+)
- [ ] No critical security vulnerabilities
- [ ] Uptime >99% during beta
- [ ] User satisfaction >4/5

### Security Checklist
- [ ] Penetration testing completed
- [ ] OWASP Top 10 compliance
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Password policy enforced
- [ ] Account lockout working
- [ ] Dependency vulnerability scan
- [ ] Backup and recovery tested

---

## 17. Bilingual Admin UI Translations

### English (admin-en.json)
```json
{
  "admin": {
    "login": {
      "title": "Welcome to Roaya IT Admin",
      "subtitle": "Login to manage your website content and analytics",
      "emailLabel": "Email Address",
      "passwordLabel": "Password",
      "loginButton": "Login",
      "forgotPassword": "Forgot Password?"
    },
    "dashboard": {
      "welcome": "Welcome back, {{name}}",
      "visitorsToday": "Visitors Today",
      "newPostsThisWeek": "New Posts This Week"
    },
    "blog": {
      "newPost": "New Post",
      "saveButton": "Save Draft",
      "publishButton": "Publish",
      "previewButton": "Preview"
    }
  }
}
```

### Arabic (admin-ar.json)
```json
{
  "admin": {
    "login": {
      "title": "مرحبًا بك في لوحة تحكم رؤية لتكنولوجيا المعلومات",
      "subtitle": "قم بتسجيل الدخول لإدارة محتوى الموقع والتحليلات",
      "emailLabel": "البريد الإلكتروني",
      "passwordLabel": "كلمة المرور",
      "loginButton": "تسجيل الدخول",
      "forgotPassword": "نسيت كلمة المرور؟"
    },
    "dashboard": {
      "welcome": "مرحبًا بعودتك، {{name}}",
      "visitorsToday": "الزوار اليوم",
      "newPostsThisWeek": "منشورات جديدة هذا الأسبوع"
    },
    "blog": {
      "newPost": "منشور جديد",
      "saveButton": "حفظ المسودة",
      "publishButton": "نشر",
      "previewButton": "معاينة"
    }
  }
}
```

---

## 18. Summary

This comprehensive admin panel plan provides:

1. **Clear MVP:** Auth + Blog Admin + Basic Analytics (6 weeks)
2. **Enterprise Security:** JWT, RBAC, validation, audits
3. **Scalable Architecture:** NestJS + PostgreSQL + Redis
4. **Phased Delivery:** MVP → Analytics → CMS (18 weeks total)
5. **Bilingual Native:** EN/AR from Day 1
6. **Quality Gates:** Security reviews, QA, design reviews

**Total Investment:**
- Timeline: 18 weeks (~4.5 months)
- Team: 3-4 developers
- First Value: 6 weeks (MVP)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Author:** Claude Opus 4.5 (Product Orchestrator)
**Status:** Awaiting Approval
