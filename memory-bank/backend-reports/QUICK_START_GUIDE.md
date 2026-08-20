# Quick Start Guide - Documentation & Analytics APIs

## Step 1: Apply Database Migration

```bash
cd /Users/roaya/Roaya-files/Development/roaya/backend

# Apply migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Restart development server
npm run dev
```

---

## Step 2: Test Documentation API

### Create a Category

```bash
curl -X POST http://localhost:3000/api/v1/docs/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nameEn": "Getting Started",
    "nameAr": "البدء",
    "slug": "getting-started",
    "displayOrder": 0
  }'
```

### Create a Page

```bash
curl -X POST http://localhost:3000/api/v1/docs/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Quick Start Guide",
    "titleAr": "دليل البدء السريع",
    "slug": "quick-start",
    "contentEn": "<h1>Quick Start</h1><p>Welcome to our documentation!</p>",
    "contentAr": "<h1>البدء السريع</h1><p>مرحبًا بك في وثائقنا!</p>",
    "categoryId": "CATEGORY_ID_FROM_ABOVE",
    "accessLevel": "PUBLIC",
    "isPublished": true
  }'
```

### Get Page by Slug (Public - No Auth)

```bash
curl http://localhost:3000/api/v1/docs/pages/slug/quick-start
```

---

## Step 3: Test Website Analytics API

### Start Tracking Session

```bash
curl -X POST http://localhost:3000/api/v1/tracking/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "visitorId": "v_test_123",
    "device": "desktop",
    "browser": "Chrome",
    "referrer": "https://google.com",
    "utmSource": "google",
    "utmMedium": "cpc"
  }'
```

**Save the returned `sessionId` for next steps**

### Track Page View

```bash
curl -X POST http://localhost:3000/api/v1/tracking/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_FROM_ABOVE",
    "path": "/",
    "device": "desktop",
    "browser": "Chrome"
  }'
```

### Track Click

```bash
curl -X POST http://localhost:3000/api/v1/tracking/click \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_FROM_ABOVE",
    "path": "/",
    "x": 50,
    "y": 30,
    "elementTag": "BUTTON",
    "elementId": "cta-button"
  }'
```

### Get Analytics Overview (Admin)

```bash
curl "http://localhost:3000/api/v1/website-analytics/overview?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Active Visitors (Admin)

```bash
curl http://localhost:3000/api/v1/website-analytics/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Step 4: Install Tracking Script on Website

Add this script to your website (before closing `</body>` tag):

```html
<script src="http://localhost:3000/api/v1/tracking/script" async></script>
```

The script automatically:
- Generates visitor ID
- Tracks page views
- Tracks clicks
- Manages sessions

---

## Step 5: Verify Everything Works

### Check Database Tables

```bash
npx prisma studio
```

You should see:
- `doc_categories`
- `doc_pages`
- `page_views`
- `analytics_sessions`
- `heatmap_clicks`

### Check API Health

```bash
curl http://localhost:3000/api/v1/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-26T10:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

---

## Troubleshooting

### Migration Failed

```bash
# Reset database (development only!)
npx prisma migrate reset

# Apply all migrations
npx prisma migrate deploy
```

### TypeScript Errors

```bash
# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Import Errors

```bash
# Ensure services are exported
# Check: src/application/services/index.ts
```

---

## Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Roaya - Documentation & Analytics",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Documentation",
      "item": [
        {
          "name": "Get Categories",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/docs/categories?includePages=true"
          }
        },
        {
          "name": "Create Category",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/docs/categories",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"nameEn\":\"Getting Started\",\"nameAr\":\"البدء\",\"slug\":\"getting-started\"}"
            }
          }
        },
        {
          "name": "Create Page",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/docs/pages",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"titleEn\":\"Quick Start\",\"titleAr\":\"البدء السريع\",\"slug\":\"quick-start\",\"contentEn\":\"<h1>Welcome</h1>\",\"contentAr\":\"<h1>مرحبا</h1>\",\"categoryId\":\"{{categoryId}}\",\"isPublished\":true}"
            }
          }
        },
        {
          "name": "Get Page by Slug",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/docs/pages/slug/quick-start"
          }
        }
      ]
    },
    {
      "name": "Analytics",
      "item": [
        {
          "name": "Start Session",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/tracking/session/start",
            "body": {
              "mode": "raw",
              "raw": "{\"visitorId\":\"v_test_123\",\"device\":\"desktop\",\"browser\":\"Chrome\"}"
            }
          }
        },
        {
          "name": "Track Page View",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/tracking/pageview",
            "body": {
              "mode": "raw",
              "raw": "{\"sessionId\":\"{{sessionId}}\",\"path\":\"/\",\"device\":\"desktop\"}"
            }
          }
        },
        {
          "name": "Get Overview",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/website-analytics/overview",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ]
          }
        },
        {
          "name": "Get Active Visitors",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/website-analytics/active",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}" }
            ]
          }
        }
      ]
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:3000/api/v1" },
    { "key": "token", "value": "YOUR_JWT_TOKEN" },
    { "key": "categoryId", "value": "" },
    { "key": "sessionId", "value": "" }
  ]
}
```

---

## Next Steps

1. ✅ Run migration
2. ✅ Test endpoints with Postman
3. ✅ Create sample documentation content
4. ✅ Install tracking script on frontend
5. ✅ Build admin dashboard UI
6. ✅ Integrate heatmap visualization

---

## Support

- **API Docs**: `/backend/docs/DOCUMENTATION_API.md`
- **Analytics Docs**: `/backend/docs/WEBSITE_ANALYTICS_API.md`
- **Full Report**: `/backend/docs/DOCUMENTATION_AND_ANALYTICS_IMPLEMENTATION_REPORT.md`
