# Documentation / Knowledge Base API

## Overview

**Module**: Documentation Management
**Base Path**: `/api/v1/docs`
**Authentication**: Mixed (Public & Admin)

## Features

- Hierarchical category tree structure
- Bilingual content (English/Arabic)
- Access level control (PUBLIC, INTERNAL, ADMIN)
- Page versioning
- SEO-friendly slugs
- View count tracking
- Drag-and-drop reordering

---

## Endpoints

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /docs/categories | Get category tree | Public |
| GET | /docs/categories/:id | Get category by ID | Admin |
| POST | /docs/categories | Create category | Admin |
| PATCH | /docs/categories/:id | Update category | Admin |
| DELETE | /docs/categories/:id | Delete category | Admin |
| PATCH | /docs/categories-reorder | Reorder categories | Admin |

### Pages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /docs/pages | List pages (filtered) | Admin |
| GET | /docs/pages/:id | Get page by ID | Admin |
| GET | /docs/pages/slug/:slug | Get page by slug | Public |
| POST | /docs/pages | Create page | Admin |
| PATCH | /docs/pages/:id | Update page | Admin |
| DELETE | /docs/pages/:id | Delete page | Admin |
| POST | /docs/pages/:id/duplicate | Duplicate page | Admin |

---

## Request/Response Schemas

### Category

#### Create Category

```typescript
POST /api/v1/docs/categories

{
  "nameEn": "Getting Started",
  "nameAr": "البدء",
  "slug": "getting-started",
  "parentId": "uuid-of-parent-category", // optional
  "displayOrder": 0,
  "isActive": true
}

Response:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nameEn": "Getting Started",
    "nameAr": "البدء",
    "slug": "getting-started",
    "parentId": null,
    "displayOrder": 0,
    "isActive": true,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z",
    "parent": null,
    "children": [],
    "pages": []
  }
}
```

#### Get Category Tree

```typescript
GET /api/v1/docs/categories?includePages=true

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nameEn": "Getting Started",
      "nameAr": "البدء",
      "slug": "getting-started",
      "parentId": null,
      "displayOrder": 0,
      "isActive": true,
      "children": [
        {
          "id": "uuid",
          "nameEn": "Installation",
          "nameAr": "التثبيت",
          "slug": "installation",
          "parentId": "parent-uuid",
          "displayOrder": 0,
          "pages": [
            {
              "id": "uuid",
              "titleEn": "Quick Start Guide",
              "titleAr": "دليل البدء السريع",
              "slug": "quick-start",
              "accessLevel": "PUBLIC",
              "viewCount": 150
            }
          ]
        }
      ],
      "pages": []
    }
  ]
}
```

#### Reorder Categories

```typescript
PATCH /api/v1/docs/categories-reorder

{
  "orderedIds": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}

Response:
{
  "success": true,
  "data": {
    "message": "Categories reordered successfully"
  }
}
```

### Page

#### Create Page

```typescript
POST /api/v1/docs/pages

{
  "titleEn": "Quick Start Guide",
  "titleAr": "دليل البدء السريع",
  "slug": "quick-start",
  "contentEn": "<h1>Quick Start</h1><p>Get started in 5 minutes...</p>",
  "contentAr": "<h1>البدء السريع</h1><p>ابدأ في 5 دقائق...</p>",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "accessLevel": "PUBLIC", // PUBLIC, INTERNAL, ADMIN
  "isPublished": true,
  "version": "1.0",
  "displayOrder": 0
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "titleEn": "Quick Start Guide",
    "titleAr": "دليل البدء السريع",
    "slug": "quick-start",
    "contentEn": "...",
    "contentAr": "...",
    "categoryId": "uuid",
    "accessLevel": "PUBLIC",
    "isPublished": true,
    "version": "1.0",
    "displayOrder": 0,
    "viewCount": 0,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z",
    "category": {
      "id": "uuid",
      "nameEn": "Getting Started",
      "nameAr": "البدء",
      "slug": "getting-started",
      "parentId": null
    }
  }
}
```

#### Get Page by Slug (Public)

```typescript
GET /api/v1/docs/pages/slug/quick-start

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "titleEn": "Quick Start Guide",
    "titleAr": "دليل البدء السريع",
    "slug": "quick-start",
    "contentEn": "<h1>Quick Start</h1>...",
    "contentAr": "<h1>البدء السريع</h1>...",
    "categoryId": "uuid",
    "accessLevel": "PUBLIC",
    "isPublished": true,
    "version": "1.0",
    "displayOrder": 0,
    "viewCount": 151, // Auto-incremented
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z",
    "category": {
      "id": "uuid",
      "nameEn": "Getting Started",
      "nameAr": "البدء",
      "slug": "getting-started",
      "parentId": null
    }
  }
}
```

#### List Pages (Admin)

```typescript
GET /api/v1/docs/pages?categoryId=uuid&isPublished=true&search=quick

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titleEn": "Quick Start Guide",
      "titleAr": "دليل البدء السريع",
      "slug": "quick-start",
      "contentEn": "...",
      "contentAr": "...",
      "categoryId": "uuid",
      "accessLevel": "PUBLIC",
      "isPublished": true,
      "version": "1.0",
      "displayOrder": 0,
      "viewCount": 151,
      "createdAt": "2026-01-26T10:00:00.000Z",
      "updatedAt": "2026-01-26T10:00:00.000Z",
      "category": {
        "id": "uuid",
        "nameEn": "Getting Started",
        "nameAr": "البدء",
        "slug": "getting-started"
      }
    }
  ]
}
```

#### Duplicate Page

```typescript
POST /api/v1/docs/pages/:id/duplicate

Response:
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "titleEn": "Quick Start Guide (Copy)",
    "titleAr": "دليل البدء السريع (نسخة)",
    "slug": "quick-start-copy",
    "contentEn": "... (same content)",
    "contentAr": "... (same content)",
    "categoryId": "uuid",
    "accessLevel": "PUBLIC",
    "isPublished": false, // Always false for duplicates
    "version": "1.0",
    "displayOrder": 1,
    "viewCount": 0,
    "createdAt": "2026-01-26T10:05:00.000Z",
    "updatedAt": "2026-01-26T10:05:00.000Z",
    "category": { ... }
  }
}
```

---

## Access Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| PUBLIC | Anyone can view | General documentation, help articles |
| INTERNAL | Requires authentication | Internal processes, team guidelines |
| ADMIN | Admin users only | System documentation, configuration guides |

---

## Validation Rules

### Category

- `nameEn`: Required, max 255 characters
- `nameAr`: Required, max 255 characters
- `slug`: Required, lowercase letters, numbers, hyphens only, unique
- `parentId`: Must be valid category UUID
- `displayOrder`: Non-negative integer

### Page

- `titleEn`: Required, max 500 characters
- `titleAr`: Required, max 500 characters
- `slug`: Required, lowercase letters, numbers, hyphens only, unique
- `contentEn`: Required, no max length
- `contentAr`: Required, no max length
- `categoryId`: Must be valid category UUID
- `accessLevel`: Must be PUBLIC, INTERNAL, or ADMIN
- `version`: Max 20 characters

---

## Error Handling

### Category Deletion

```typescript
DELETE /api/v1/docs/categories/:id

// If category has pages
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category with 5 pages. Please move or delete pages first."
  }
}

// If category has children
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category with 3 sub-categories. Please move or delete sub-categories first."
  }
}
```

### Circular Reference Prevention

```typescript
PATCH /api/v1/docs/categories/:id

{
  "parentId": "child-category-id" // Creates circular reference
}

Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Circular reference detected in category hierarchy"
  }
}
```

---

## Performance Optimizations

1. **View Count Increment**: Optimistic increment without blocking response
2. **Category Tree**: Single query with nested includes
3. **Slug Lookup**: Indexed for fast public access
4. **Content Search**: Full-text search on both languages

---

## Usage Example (Frontend)

```typescript
// Fetch category tree for navigation
const { data: categories } = await api.get('/docs/categories?includePages=true');

// Render navigation
categories.forEach(category => {
  renderCategory(category);
  category.children?.forEach(child => {
    renderSubCategory(child);
    child.pages?.forEach(page => {
      renderPageLink(page);
    });
  });
});

// Fetch page by slug
const { data: page } = await api.get(`/docs/pages/slug/${slug}`);
renderPage(page);
```

---

## Security & Performance

- **Authentication**: Admin routes require JWT token
- **Rate Limiting**: Standard API limits apply
- **Caching**: Category tree can be cached (5 minutes)
- **Indexes**: All slugs, foreign keys, and search fields indexed
- **Validation**: All inputs validated with Zod schemas
