# Dynamic Content Integration: Admin Panel → Public Website

> **Date:** 2026-01-27
> **Status:** Planning Complete — Ready for Implementation
> **Scope:** Blog Posts + Case Studies
> **Database:** Local PostgreSQL (`localhost:5432`)
> **Backend:** Local Express.js (`localhost:3001`)

---

## 1. Executive Summary

The admin panel can already create, edit, publish, and unpublish blog posts and case studies via real HTTP API calls to the backend. The data is stored in PostgreSQL via Prisma ORM. However, the **public-facing website** displays entirely **hardcoded data** — it never reads from the database.

This report documents everything needed to connect them: when an admin publishes a blog post or case study, it should appear on the public website. When they unpublish it, it should disappear.

---

## 2. Current Architecture

### What Works (Admin Side)

```
Admin Panel UI
  → ContentAdminService (Angular)
    → HTTP POST/PATCH/DELETE to /api/v1/admin/content
      → content.controller.ts (Express)
        → content.service.ts (Prisma)
          → PostgreSQL content_items table
```

**Key files:**
- `roaya-website/src/app/core/services/content-admin.service.ts` — Makes real HTTP calls
- `backend/src/presentation/routes/content.routes.ts` — All routes behind `authenticate` middleware
- `backend/src/presentation/controllers/content.controller.ts` — Zod validation, CRUD handlers
- `backend/src/application/services/content.service.ts` — Prisma queries
- `backend/prisma/schema.prisma` — `ContentItem` model (line 352)

### What Does NOT Work (Public Side)

```
Public Blog Page
  → BlogService (Angular)
    → Returns hardcoded in-memory array (1750 lines of static data)
    → NEVER calls the backend API

Public Case Studies Page
  → CaseStudiesComponent (Angular)
    → Returns hardcoded inline array (5 case studies)
    → NEVER calls the backend API
```

**Key files with hardcoded data:**
- `roaya-website/src/app/core/services/blog.service.ts` — 1750 lines, 10 hardcoded blog posts, 5 authors
- `roaya-website/src/app/features/resources/case-studies/case-studies.component.ts` — 5 hardcoded case studies (lines 83-174)

### The Gap

| Layer | Status |
|-------|--------|
| Admin UI → Backend API (write) | Working |
| Backend API → PostgreSQL (store) | Working |
| PostgreSQL → Public API (read) | **MISSING — No public endpoints exist** |
| Public API → Public Website (display) | **MISSING — Website reads hardcoded data** |

---

## 3. Data Model Analysis

### 3.1 Backend: ContentItem (Prisma)

**File:** `backend/prisma/schema.prisma` (lines 352-396)

```
ContentItem {
  id            String         @id @default(uuid())
  type          ContentType    (BLOG_POST | CASE_STUDY | WHITEPAPER)
  status        ContentStatus  (DRAFT | PENDING_REVIEW | PUBLISHED | ARCHIVED)
  titleEn       String
  titleAr       String
  slugEn        String         @unique
  slugAr        String         @unique
  excerptEn     String?
  excerptAr     String?
  contentEn     String         @db.Text
  contentAr     String         @db.Text
  featuredImage String?
  category      String?
  tags          String[]       @default([])
  authorId      String
  metaTitleEn   String?
  metaTitleAr   String?
  metaDescEn    String?
  metaDescAr    String?
  viewCount     Int            @default(0)
  publishedAt   DateTime?
  createdAt     DateTime
  updatedAt     DateTime
}
```

### 3.2 Frontend: BlogPost Interface

**File:** `roaya-website/src/app/core/interfaces/blog.interface.ts`

```typescript
interface BlogPost {
  id: string;
  slug: string;                // maps from slugEn
  title: string;               // maps from titleEn
  titleAr: string;             // maps from titleAr
  excerpt: string;             // maps from excerptEn
  excerptAr: string;           // maps from excerptAr
  content: string;             // maps from contentEn
  contentAr: string;           // maps from contentAr
  author: Author;              // COMPLEX — needs lookup or metadata
  publishedDate: Date;         // maps from publishedAt
  updatedDate?: Date;          // maps from updatedAt
  category: BlogCategory;      // maps from category (string → enum)
  tags: string[];              // maps from tags
  tagsAr: string[];            // NOT in ContentItem — needs metadata
  featuredImage: string;       // maps from featuredImage
  featuredImageAlt: string;    // NOT in ContentItem — needs metadata
  featuredImageAltAr: string;  // NOT in ContentItem — needs metadata
  readingTime: number;         // NOT in ContentItem — compute from content
  readingTimeAr: number;       // NOT in ContentItem — compute from content
  featured: boolean;           // NOT in ContentItem — needs metadata
  metaTitle?: string;          // maps from metaTitleEn
  metaTitleAr?: string;        // maps from metaTitleAr
  metaDescription?: string;    // maps from metaDescEn
  metaDescriptionAr?: string;  // maps from metaDescAr
  keywords: string[];          // NOT in ContentItem — needs metadata
  keywordsAr: string[];        // NOT in ContentItem — needs metadata
}
```

**BlogCategory type:** `'cloud' | 'security' | 'sap' | 'industry' | 'updates'`

**Author interface:**
```typescript
interface Author {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar: string;
  bio: string;
  bioAr: string;
  linkedin?: string;
}
```

### 3.3 Frontend: CaseStudy Interface

**File:** `roaya-website/src/app/features/resources/case-studies/case-studies.component.ts` (lines 7-30)

```typescript
interface CaseStudy {
  id: string;
  slug: string;                  // maps from slugEn
  translationPrefix: string;     // NOT in ContentItem — for i18n keys
  title: string;                 // maps from titleEn
  excerpt: string;               // maps from excerptEn
  content?: string;              // maps from contentEn
  industry: string;              // NOT in ContentItem — needs metadata
  services: string[];            // NOT in ContentItem — needs metadata
  companySize: string;           // NOT in ContentItem — needs metadata
  keyResults: {                  // NOT in ContentItem — needs metadata
    metric: string;
    value: string;
    description: string;
  }[];
  featuredImage?: string;        // maps from featuredImage
  logo?: string;                 // NOT in ContentItem — needs metadata
  publishedDate: Date;           // maps from publishedAt
  duration?: string;             // NOT in ContentItem — needs metadata
  location?: string;             // NOT in ContentItem — needs metadata
}
```

### 3.4 Field Mapping Gap Summary

| Frontend Field | ContentItem Field | Gap |
|----------------|-------------------|-----|
| `author` (object) | `authorId` (string) | Author details not in ContentItem. Needs `metadata` JSON or separate Author table |
| `tagsAr` | — | Not stored. Needs `metadata` JSON |
| `featuredImageAlt/AltAr` | — | Not stored. Needs `metadata` JSON |
| `readingTime/Ar` | — | Can be computed from content length |
| `featured` | — | Not stored. Needs `metadata` JSON or DB field |
| `keywords/Ar` | — | Not stored. Needs `metadata` JSON |
| `industry` (case study) | — | Not stored. Needs `metadata` JSON |
| `services[]` (case study) | — | Not stored. Needs `metadata` JSON or `tags` |
| `companySize` (case study) | — | Not stored. Needs `metadata` JSON |
| `keyResults[]` (case study) | — | Not stored. Needs `metadata` JSON |
| `duration` (case study) | — | Not stored. Needs `metadata` JSON |
| `location` (case study) | — | Not stored. Needs `metadata` JSON |

**Solution:** Add a `metadata Json?` field to `ContentItem` in the Prisma schema. This field stores all extra structured data that doesn't have its own column.

---

## 4. Backend Content Service — Existing Methods

**File:** `backend/src/application/services/content.service.ts`

| Method | Auth Required | Description |
|--------|--------------|-------------|
| `getContents(filters, page, limit)` | Yes | Paginated list with type/status/category/search filters |
| `getContentById(id)` | Yes | Single item by UUID |
| `getContentBySlug(slug, lang)` | **Partially public** | Finds published content by slug, increments view count. Already filters by `PUBLISHED` status |
| `createContent(data)` | Yes | Create new item |
| `updateContent(id, data)` | Yes | Partial update |
| `deleteContent(id)` | Yes | Hard delete |
| `publishContent(id)` | Yes | Set status to PUBLISHED, set publishedAt |
| `unpublishContent(id)` | Yes | Set status to DRAFT, clear publishedAt |

**Note:** `getContentBySlug()` (lines 105-123) already works as a public method — it only returns PUBLISHED content and increments view count. It just isn't exposed on a public route.

---

## 5. Backend Routes — Current State

**File:** `backend/src/presentation/routes/content.routes.ts`

All content routes are mounted under `/api/v1/admin` and require authentication:

```
router.use(authenticate);  // Line 9 — ALL routes require auth

GET    /api/v1/admin/content           → getContents
GET    /api/v1/admin/content/:id       → getContentById
POST   /api/v1/admin/content           → createContent (ADMIN+)
PATCH  /api/v1/admin/content/:id       → updateContent (ADMIN+)
DELETE /api/v1/admin/content/:id       → deleteContent (ADMIN+)
POST   /api/v1/admin/content/:id/publish   → publishContent (ADMIN+)
POST   /api/v1/admin/content/:id/unpublish → unpublishContent (ADMIN+)
```

**File:** `backend/src/presentation/routes/index.ts`

```typescript
router.use('/admin', contentRoutes);  // Line 39
```

**No public content routes exist.**

---

## 6. Existing Public (Unauthenticated) Routes — For Reference

These routes already exist without auth and can serve as a pattern:

| Route | File | Rate Limiting |
|-------|------|---------------|
| `POST /api/v1/leads/submit` | lead.routes.ts | formRateLimiter |
| `GET /api/v1/auth/csrf-token` | auth.routes.ts | apiRateLimiter |
| `POST /api/v1/auth/login` | auth.routes.ts | loginRateLimiter |
| `GET /api/v1/docs/categories` | documentation.routes.ts | apiRateLimiter |
| `GET /api/v1/docs/pages/slug/:slug` | documentation.routes.ts | apiRateLimiter |
| `GET /api/v1/admin/logos` | logo.routes.ts | apiRateLimiter |
| `POST /api/v1/website-analytics/tracking/*` | website-analytics.routes.ts | custom (100 req/min) |

---

## 7. BlogService — Current Hardcoded Methods

**File:** `roaya-website/src/app/core/services/blog.service.ts` (1750 lines)

Contains 5 hardcoded authors and 10 hardcoded blog posts with full bilingual content.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAllPosts()` | `Observable<BlogPost[]>` | Returns all 10 hardcoded posts |
| `getPostBySlug(slug)` | `Observable<BlogPost \| undefined>` | Find by slug |
| `getPostsByCategory(category)` | `Observable<BlogPost[]>` | Filter by category |
| `getFeaturedPosts(limit)` | `Observable<BlogPost[]>` | First N featured posts |
| `getRelatedPosts(post, limit)` | `Observable<BlogPost[]>` | Same category, exclude current |
| `searchPosts(query)` | `Observable<BlogPost[]>` | Search title/excerpt/content/tags |
| `generateToc(content)` | `TocItem[]` | Parse HTML headings for table of contents |
| `getAuthorById(id)` | `Author \| undefined` | Lookup author by ID |
| `getAllAuthors()` | `Author[]` | Return all authors |

**Consumers:**
- `blog.component.ts` — Calls `getAllPosts()`, `getFeaturedPosts()`
- `blog-detail.component.ts` — Calls `getPostBySlug()`, `getRelatedPosts()`, `generateToc()`

---

## 8. Case Studies — Current Hardcoded Data

**File:** `roaya-website/src/app/features/resources/case-studies/case-studies.component.ts` (lines 80-177)

5 hardcoded case studies:

| # | Slug | Industry | Services |
|---|------|----------|----------|
| 1 | `bank-cloud-migration` | finance | cloud, migration, security |
| 2 | `healthcare-soc-implementation` | healthcare | security |
| 3 | `government-digital-transformation` | government | cloud, automation, security |
| 4 | `manufacturing-sap-implementation` | manufacturing | sap, cloud |
| 5 | `ecommerce-auto-scaling` | retail | cloud, security |

Each has `keyResults[]` with metric/value/description, `translationPrefix` for i18n, and industry/service classification.

---

## 9. Implementation Plan

### Step 1: Schema Migration

**File:** `backend/prisma/schema.prisma`

Add `metadata Json?` field to the `ContentItem` model (after the SEO fields, before `viewCount`):

```prisma
// Structured metadata (author info, case study data, blog extras)
metadata  Json?
```

Then run: `npx prisma migrate dev --name add_content_metadata`

### Step 2: Add Public Service Method

**File:** `backend/src/application/services/content.service.ts`

Add `getPublishedContents()` method:

```typescript
async getPublishedContents(
  type: ContentType,
  filters: { category?: string; search?: string; tag?: string },
  page: number,
  limit: number
)
```

- Filters by `status: PUBLISHED` and given `type`
- Supports `category`, `search` (title/excerpt), and `tag` filters
- Orders by `publishedAt DESC`
- Returns `{ contents, meta }` with pagination

The existing `getContentBySlug()` already works for single-item public access.

### Step 3: Create Public Content Routes

**New file:** `backend/src/presentation/routes/public-content.routes.ts`

```
GET /blog              → List published blog posts (paginated)
GET /blog/:slug        → Single blog post by slug
GET /case-studies      → List published case studies (paginated)
GET /case-studies/:slug → Single case study by slug
```

- NO authentication middleware
- Apply `apiRateLimiter` for rate limiting
- Query params: `page`, `limit`, `category`, `search`, `tag`

**New file:** `backend/src/presentation/controllers/public-content.controller.ts`

- Zod validation for query params
- Calls `contentService.getPublishedContents()` with `type: BLOG_POST` or `type: CASE_STUDY`
- Calls `contentService.getContentBySlug()` for single items
- Response format: `{ success: true, data: [...], meta: { page, limit, total, totalPages } }`

### Step 4: Mount Public Routes

**File:** `backend/src/presentation/routes/index.ts`

Add:
```typescript
import publicContentRoutes from './public-content.routes.js';
router.use('/content', publicContentRoutes);
```

This creates:
- `GET /api/v1/content/blog`
- `GET /api/v1/content/blog/:slug`
- `GET /api/v1/content/case-studies`
- `GET /api/v1/content/case-studies/:slug`

### Step 5: Seed Database

**New file:** `backend/prisma/seed-content.ts`

Migrate existing hardcoded data into the database:

**Blog Posts (10):**
- Map each hardcoded `BlogPost` from `blog.service.ts` to a `ContentItem` record
- `title` → `titleEn`, `titleAr` → `titleAr`, `slug` → `slugEn`, etc.
- Store author info, tagsAr, featuredImageAlt, readingTime, featured flag, keywords in `metadata` JSON
- Set `status: PUBLISHED`, `publishedAt` from `publishedDate`

**Case Studies (5):**
- Map each hardcoded `CaseStudy` to a `ContentItem` record with `type: CASE_STUDY`
- `title` → `titleEn`, `excerpt` → `excerptEn`
- Store industry, services, companySize, keyResults, duration, location in `metadata` JSON
- Set `status: PUBLISHED`

**Update:** `backend/package.json` prisma seed script already points to `prisma/seed.ts`. Either add content seeding to the existing seed file or create a separate seed-content script.

### Step 6: Create Frontend Public ContentService

**New file:** `roaya-website/src/app/core/services/content.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBlogPosts(params): Observable<PaginatedResponse<BlogPost>>
  getBlogPostBySlug(slug): Observable<BlogPost>
  getCaseStudies(params): Observable<PaginatedResponse<CaseStudy>>
  getCaseStudyBySlug(slug): Observable<CaseStudy>
}
```

- Contains `mapContentItemToBlogPost()` — transforms API `ContentItem` to frontend `BlogPost`
- Contains `mapContentItemToCaseStudy()` — transforms API `ContentItem` to frontend `CaseStudy`
- Extracts author, tags, keywords, readingTime from `metadata` JSON
- Computes `readingTime` from content length if not in metadata

### Step 7: Rewrite BlogService

**File:** `roaya-website/src/app/core/services/blog.service.ts`

Replace 1750 lines of hardcoded data with API calls:

| Current Method | New Implementation |
|----------------|-------------------|
| `getAllPosts()` | `http.get('/content/blog')` → map response |
| `getPostBySlug(slug)` | `http.get('/content/blog/:slug')` → map response |
| `getPostsByCategory(cat)` | `http.get('/content/blog?category=cat')` → map response |
| `getFeaturedPosts(limit)` | `http.get('/content/blog?featured=true&limit=N')` → map response |
| `getRelatedPosts(post, limit)` | `http.get('/content/blog?category=X&limit=N')` → filter out current |
| `searchPosts(query)` | `http.get('/content/blog?search=query')` → map response |
| `generateToc(content)` | Keep as-is (pure HTML parsing, no API needed) |
| `getAuthorById(id)` | Lookup from metadata or keep static author list |
| `getAllAuthors()` | Keep static list or fetch from API |

**Important:** Keep the `BlogPost` interface unchanged. No template changes needed.

### Step 8: Update Case Studies Component

**File:** `roaya-website/src/app/features/resources/case-studies/case-studies.component.ts`

Replace `loadCaseStudies()` hardcoded array with:

```typescript
private contentService = inject(ContentService);

private loadCaseStudies(): void {
  this.loading.set(true);
  this.contentService.getCaseStudies().subscribe({
    next: (response) => {
      this.allCaseStudies.set(response.data);
      this.filteredCaseStudies.set(response.data);
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });
}
```

### Step 9: Update Blog Components

**Files:**
- `roaya-website/src/app/features/resources/blog/blog.component.ts`
- `roaya-website/src/app/features/resources/blog/blog-detail/blog-detail.component.ts`

Changes:
- Add loading signal for async data fetching
- Add error handling for failed API calls
- Update `getAllPosts()` call to handle paginated response (currently returns `BlogPost[]`, will return `PaginatedResponse<BlogPost>`)
- Add pagination UI if needed
- Blog detail component: update `getPostBySlug()` and `getRelatedPosts()` calls

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `backend/src/presentation/routes/public-content.routes.ts` | Public API routes (no auth) |
| `backend/src/presentation/controllers/public-content.controller.ts` | Public API controller |
| `backend/prisma/seed-content.ts` | Database seeder with existing content |
| `roaya-website/src/app/core/services/content.service.ts` | Frontend public content service |

## 11. Files to Modify

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `metadata Json?` to ContentItem |
| `backend/src/presentation/routes/index.ts` | Mount `/content` public routes |
| `backend/src/application/services/content.service.ts` | Add `getPublishedContents()` method |
| `roaya-website/src/app/core/services/blog.service.ts` | Replace hardcoded data with API calls |
| `roaya-website/src/app/features/resources/case-studies/case-studies.component.ts` | Replace hardcoded data with API calls |
| `roaya-website/src/app/features/resources/blog/blog.component.ts` | Handle async loading |
| `roaya-website/src/app/features/resources/blog/blog-detail/blog-detail.component.ts` | Handle async loading |

## 12. Files to Keep Unchanged

| File | Reason |
|------|--------|
| `roaya-website/src/app/core/interfaces/blog.interface.ts` | BlogPost interface stays the same — no template changes |
| `roaya-website/src/app/core/services/content-admin.service.ts` | Admin service already works correctly |
| `backend/src/presentation/routes/content.routes.ts` | Admin routes stay authenticated |
| `backend/src/presentation/controllers/content.controller.ts` | Admin controller unchanged |

---

## 13. Execution Order

```
1. Schema migration         → Add metadata field, run prisma migrate
2. Backend service method   → Add getPublishedContents() to content.service.ts
3. Public API endpoints     → Create routes + controller, mount in index.ts
4. Database seed            → Populate DB with existing hardcoded content
5. Frontend content service → New ContentService with mapping logic
6. Rewrite BlogService      → Replace hardcoded data with API calls
7. Update case studies      → Replace hardcoded data with API calls
8. Update blog components   → Handle async loading states
```

---

## 14. Metadata JSON Structure

### For Blog Posts

```json
{
  "author": {
    "id": "ahmed-hassan",
    "name": "Ahmed Hassan",
    "nameAr": "أحمد حسن",
    "role": "Chief Technology Officer",
    "roleAr": "الرئيس التنفيذي للتكنولوجيا",
    "avatar": "/assets/images/team/ahmed-hassan.jpg",
    "bio": "...",
    "bioAr": "...",
    "linkedin": "https://linkedin.com/in/ahmed-hassan-roaya"
  },
  "tagsAr": ["الحوسبة السحابية", "التحول الرقمي"],
  "featuredImageAlt": "Cloud migration architecture diagram",
  "featuredImageAltAr": "مخطط هندسة الترحيل السحابي",
  "readingTime": 8,
  "readingTimeAr": 9,
  "featured": true,
  "keywords": ["cloud migration", "digital transformation"],
  "keywordsAr": ["الترحيل السحابي", "التحول الرقمي"]
}
```

### For Case Studies

```json
{
  "industry": "finance",
  "services": ["cloud", "migration", "security"],
  "companySize": "500+",
  "duration": "8 months",
  "location": "Egypt",
  "keyResults": [
    {
      "metric": "42%",
      "value": "Cost Reduction",
      "description": "Annual infrastructure savings"
    },
    {
      "metric": "99.94%",
      "value": "Uptime",
      "description": "Zero critical outages"
    }
  ],
  "logo": "/assets/images/clients/bank-logo.png"
}
```

---

## 15. API Response Format

### List Endpoint

```json
GET /api/v1/content/blog?page=1&limit=10&category=cloud

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "BLOG_POST",
      "status": "PUBLISHED",
      "titleEn": "...",
      "titleAr": "...",
      "slugEn": "...",
      "slugAr": "...",
      "excerptEn": "...",
      "excerptAr": "...",
      "contentEn": "...",
      "contentAr": "...",
      "featuredImage": "...",
      "category": "cloud",
      "tags": ["cloud", "migration"],
      "authorId": "uuid",
      "metadata": { ... },
      "viewCount": 42,
      "publishedAt": "2024-01-15T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Single Item Endpoint

```json
GET /api/v1/content/blog/cloud-migration-guide

{
  "success": true,
  "data": { ... single ContentItem ... }
}
```

---

## 16. Security Considerations

- Public endpoints return **only PUBLISHED content** — no drafts, pending reviews, or archived items
- Rate limiting via `apiRateLimiter` (100 requests per 15 minutes)
- No sensitive data exposed (authorId is a UUID, no passwords/emails)
- View count increment is fire-and-forget (non-blocking)
- CSRF protection does not apply to GET requests (already excluded in `app.ts`)
- Content is read-only via public endpoints — no create/update/delete

---

## 17. Verification Checklist

### Backend Verification

- [ ] `npx prisma migrate dev` completes without errors
- [ ] `npx prisma db seed` populates 10 blog posts + 5 case studies
- [ ] `curl http://localhost:3001/api/v1/content/blog` returns published blog posts
- [ ] `curl http://localhost:3001/api/v1/content/blog?category=cloud` filters correctly
- [ ] `curl http://localhost:3001/api/v1/content/blog?search=migration` searches correctly
- [ ] `curl http://localhost:3001/api/v1/content/blog/cloud-migration-guide` returns single post
- [ ] `curl http://localhost:3001/api/v1/content/case-studies` returns published case studies
- [ ] `curl http://localhost:3001/api/v1/content/case-studies/bank-cloud-migration` returns single study
- [ ] View count increments on single-item requests
- [ ] Unpublished content is NOT returned by any public endpoint

### Frontend Verification

- [ ] `npm run build` completes without TypeScript errors
- [ ] `npm run dev` starts without errors
- [ ] `/resources/blog` page loads posts from API (not hardcoded)
- [ ] `/resources/blog/:slug` detail page loads from API
- [ ] Blog category filtering works
- [ ] Blog search works
- [ ] Related posts display on detail page
- [ ] `/resources/case-studies` page loads from API
- [ ] Case study industry/service filtering works
- [ ] Loading states display while fetching
- [ ] Error states display on API failure

### End-to-End Verification

- [ ] Create blog post in admin panel → publish → appears on public blog page
- [ ] Edit published post title → title updates on public page
- [ ] Unpublish a post → disappears from public blog page
- [ ] Create case study in admin → publish → appears on public case studies page
- [ ] View count increases when visiting a blog post detail page

---

## 18. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API down → public pages show nothing | High | Consider caching last response in localStorage, or showing "Content unavailable" message |
| Metadata JSON structure changes | Medium | Define TypeScript interface for metadata, validate on write |
| Large content bodies slow down list endpoints | Medium | Don't return full `contentEn`/`contentAr` in list endpoints — only excerpt |
| Blog service method signatures change | Medium | Keep existing `Observable<BlogPost[]>` return types, only change internals |
| SEO impact — URLs must stay the same | High | Use same slug structure (`/resources/blog/:slug`) — no URL changes |
| CORS issues | Low | Already configured in `app.ts` — frontend origin allowed |

---

## 19. Future Enhancements (Out of Scope)

- Image upload and CDN for featured images
- Rich text editor in admin for content creation
- Draft preview mode (view unpublished content as admin)
- Content versioning and revision history
- Scheduled publishing (set future publish date)
- Content categories management (CRUD for categories)
- Author management (CRUD for authors instead of metadata JSON)
- RSS feed generation from published blog posts
- Sitemap.xml auto-generation from published content
