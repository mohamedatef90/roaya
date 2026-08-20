# Website Analytics API

## Overview

**Module**: Website Analytics & Tracking
**Base Path**: `/api/v1/website-analytics` (Admin), `/api/v1/tracking` (Public)
**Authentication**: Admin endpoints require authentication, tracking endpoints are public

## Features

- **Real-time tracking**: Page views, sessions, clicks
- **Heatmap data**: Click tracking for visualization
- **Visitor analytics**: Device, browser, country breakdown
- **UTM tracking**: Campaign source tracking
- **Active visitors**: Real-time visitor count
- **Privacy-focused**: No personally identifiable information

---

## Endpoints

### Public Tracking (Rate Limited)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | /tracking/session/start | Start visitor session | 100/min |
| POST | /tracking/pageview | Track page view | 100/min |
| POST | /tracking/click | Track click for heatmap | 100/min |
| POST | /tracking/session/end | End session | 100/min |
| GET | /tracking/script | Get tracking script | Unlimited |

### Admin Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /website-analytics/overview | Dashboard overview | Admin |
| GET | /website-analytics/top-pages | Top visited pages | Admin |
| GET | /website-analytics/countries | Top countries | Admin |
| GET | /website-analytics/devices | Device breakdown | Admin |
| GET | /website-analytics/browsers | Browser breakdown | Admin |
| GET | /website-analytics/referrers | Top referrers | Admin |
| GET | /website-analytics/page-views | Page views over time | Admin |
| GET | /website-analytics/heatmap/:path | Heatmap data | Admin |
| GET | /website-analytics/sessions | Sessions list | Admin |
| GET | /website-analytics/active | Active visitors | Admin |

---

## Tracking Flow

```
1. User visits website
   ↓
2. Start Session (POST /tracking/session/start)
   ← Returns sessionId
   ↓
3. Track Page Views (POST /tracking/pageview)
   ↓
4. Track Clicks (POST /tracking/click)
   ↓
5. End Session (POST /tracking/session/end) on page unload
```

---

## Request/Response Schemas

### Tracking Endpoints

#### Start Session

```typescript
POST /api/v1/tracking/session/start

{
  "visitorId": "v_1706260800000_abc123", // Generated client-side
  "device": "desktop", // desktop, mobile, tablet
  "browser": "Chrome",
  "country": "US", // Optional (can be enriched server-side)
  "referrer": "https://google.com",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "winter-2026"
}

Response:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000" // sessionId
  }
}
```

#### Track Page View

```typescript
POST /api/v1/tracking/pageview

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "path": "/services/digital-marketing",
  "referrer": "https://google.com",
  "device": "desktop",
  "browser": "Chrome",
  "country": "US"
}

Response:
{
  "success": true,
  "data": {
    "id": "pageview-uuid"
  }
}
```

#### Track Click

```typescript
POST /api/v1/tracking/click

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "path": "/pricing",
  "x": 45, // Percentage from left (0-100)
  "y": 30, // Percentage from top (0-100)
  "elementTag": "BUTTON",
  "elementId": "cta-button",
  "elementClass": "btn btn-primary"
}

Response:
{
  "success": true,
  "data": {
    "id": "click-uuid"
  }
}
```

#### End Session

```typescript
POST /api/v1/tracking/session/end

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "success": true,
  "data": {
    "message": "Session ended successfully"
  }
}
```

---

### Analytics Endpoints

#### Overview Dashboard

```typescript
GET /api/v1/website-analytics/overview?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z

Response:
{
  "success": true,
  "data": {
    "totalPageViews": 15420,
    "totalSessions": 4230,
    "uniqueVisitors": 3180,
    "avgSessionDuration": 245, // seconds
    "bounceRate": 42.5, // percentage
    "topPages": [
      { "path": "/", "views": 3200 },
      { "path": "/services", "views": 2100 },
      { "path": "/pricing", "views": 1800 },
      { "path": "/about", "views": 1200 },
      { "path": "/contact", "views": 950 }
    ]
  }
}
```

#### Top Pages

```typescript
GET /api/v1/website-analytics/top-pages?from=...&to=...&limit=10

Response:
{
  "success": true,
  "data": [
    {
      "path": "/services/digital-marketing",
      "views": 3200,
      "avgDuration": 180 // seconds
    },
    {
      "path": "/pricing",
      "views": 1800,
      "avgDuration": 120
    }
  ]
}
```

#### Top Countries

```typescript
GET /api/v1/website-analytics/countries?from=...&to=...&limit=10

Response:
{
  "success": true,
  "data": [
    { "country": "US", "sessions": 1200 },
    { "country": "GB", "sessions": 450 },
    { "country": "CA", "sessions": 320 },
    { "country": "AU", "sessions": 280 },
    { "country": "DE", "sessions": 210 }
  ]
}
```

#### Device Breakdown

```typescript
GET /api/v1/website-analytics/devices?from=...&to=...

Response:
{
  "success": true,
  "data": [
    { "device": "desktop", "count": 2500, "percentage": 59.1 },
    { "device": "mobile", "count": 1400, "percentage": 33.1 },
    { "device": "tablet", "count": 330, "percentage": 7.8 }
  ]
}
```

#### Browser Breakdown

```typescript
GET /api/v1/website-analytics/browsers?from=...&to=...

Response:
{
  "success": true,
  "data": [
    { "browser": "Chrome", "count": 2800, "percentage": 66.2 },
    { "browser": "Safari", "count": 850, "percentage": 20.1 },
    { "browser": "Firefox", "count": 380, "percentage": 9.0 },
    { "browser": "Edge", "count": 150, "percentage": 3.5 },
    { "browser": "Other", "count": 50, "percentage": 1.2 }
  ]
}
```

#### Referrer Breakdown

```typescript
GET /api/v1/website-analytics/referrers?from=...&to=...

Response:
{
  "success": true,
  "data": [
    { "referrer": "https://google.com", "sessions": 1200 },
    { "referrer": "https://facebook.com", "sessions": 450 },
    { "referrer": "https://linkedin.com", "sessions": 320 },
    { "referrer": "(direct)", "sessions": 1800 }
  ]
}
```

#### Page Views Over Time

```typescript
GET /api/v1/website-analytics/page-views?from=...&to=...&granularity=day

Response:
{
  "success": true,
  "data": [
    { "date": "2026-01-01T00:00:00.000Z", "views": 450 },
    { "date": "2026-01-02T00:00:00.000Z", "views": 520 },
    { "date": "2026-01-03T00:00:00.000Z", "views": 480 },
    ...
  ]
}
```

#### Heatmap Data

```typescript
GET /api/v1/website-analytics/heatmap/pricing?from=...&to=...

Response:
{
  "success": true,
  "data": [
    {
      "x": 45,
      "y": 30,
      "elementTag": "BUTTON",
      "elementId": "cta-button",
      "elementClass": "btn-primary"
    },
    {
      "x": 50,
      "y": 60,
      "elementTag": "A",
      "elementId": null,
      "elementClass": "nav-link"
    },
    ...
    // Array of click coordinates for visualization
  ]
}
```

#### Sessions List

```typescript
GET /api/v1/website-analytics/sessions?startDate=...&endDate=...&device=mobile&page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "visitorId": "v_1706260800000_abc123",
      "startedAt": "2026-01-26T10:00:00.000Z",
      "endedAt": "2026-01-26T10:15:30.000Z",
      "pageCount": 8,
      "country": "US",
      "device": "mobile",
      "browser": "Chrome",
      "referrer": "https://google.com",
      "utmSource": "google",
      "utmMedium": "cpc",
      "utmCampaign": "winter-2026"
    },
    ...
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 4230,
    "totalPages": 212,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Active Visitors

```typescript
GET /api/v1/website-analytics/active

Response:
{
  "success": true,
  "data": {
    "activeVisitors": 12 // Visitors in last 5 minutes
  }
}
```

---

## Tracking Script

### Get Tracking Script

```typescript
GET /api/v1/tracking/script

Response: (JavaScript file)

Content-Type: application/javascript

(function() {
  // Auto-tracking script
  // - Generates visitor ID
  // - Starts session
  // - Tracks page views
  // - Tracks clicks
  // - Ends session on page unload
})();
```

### Installation

```html
<!-- Add before closing </body> tag -->
<script src="https://api.roaya.com/api/v1/tracking/script" async></script>
```

The script automatically:
1. Generates/retrieves visitor ID from localStorage
2. Starts a session with device/browser detection
3. Tracks current page view
4. Listens for clicks and tracks coordinates
5. Ends session on page unload

---

## Query Parameters

### Date Range (All Analytics Endpoints)

- `from`: ISO 8601 datetime (default: 30 days ago)
- `to`: ISO 8601 datetime (default: now)
- `limit`: Integer 1-100 (default: 10)

### Granularity (Page Views Over Time)

- `granularity`: `day` | `week` | `month` (default: `day`)

### Sessions List

- `startDate`: ISO 8601 datetime
- `endDate`: ISO 8601 datetime
- `device`: `desktop` | `mobile` | `tablet`
- `country`: Country code (e.g., `US`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

---

## Rate Limiting

### Tracking Endpoints

- **Rate**: 100 requests per minute per IP
- **Headers**: Standard rate limit headers included
- **Error Response**:

```json
{
  "success": false,
  "error": {
    "code": "TRACKING_RATE_LIMIT_EXCEEDED",
    "message": "Too many tracking requests"
  }
}
```

### Admin Endpoints

- Standard API rate limiting applies (100 req/15min)

---

## Privacy & Data Retention

1. **No PII**: No personally identifiable information stored
2. **Anonymous IDs**: Visitor IDs are random, not tied to users
3. **IP Anonymization**: Consider anonymizing last octet
4. **Retention**: Recommend 90-day retention policy
5. **GDPR Compliance**: Ensure consent before tracking
6. **Cookie-less**: Uses localStorage (client-side)

---

## Performance Optimizations

1. **Async Tracking**: Non-blocking POST requests
2. **Batching**: Consider batching page views
3. **Indexes**: All timestamp and foreign keys indexed
4. **Aggregations**: Pre-computed daily summaries recommended
5. **Partitioning**: Consider partitioning by date for large datasets

---

## Heatmap Visualization

Use heatmap data with libraries like:
- [heatmap.js](https://www.patrick-wied.at/static/heatmapjs/)
- [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)

```typescript
// Example with heatmap.js
const heatmapData = {
  max: 100,
  data: analyticsData.map(click => ({
    x: (click.x / 100) * containerWidth,
    y: (click.y / 100) * containerHeight,
    value: 1
  }))
};

heatmapInstance.setData(heatmapData);
```

---

## Security & Performance

- **Authentication**: Admin routes require JWT token
- **Rate Limiting**: Aggressive limits on tracking endpoints (100/min)
- **Validation**: All inputs validated with Zod schemas
- **Indexes**: Timestamp, path, and session indexes for fast queries
- **CORS**: Configure CORS for tracking endpoints
- **Beacon API**: Use `navigator.sendBeacon()` for session end

---

## Advanced Usage

### Custom Events

Extend the tracking to support custom events:

```typescript
// Track custom conversion event
await fetch('/api/v1/tracking/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    eventType: 'CONVERSION',
    eventData: { plan: 'enterprise', value: 5000 }
  })
});
```

### A/B Testing Integration

Use session data for A/B test analysis:

```typescript
// Store variant in session metadata
await fetch('/api/v1/tracking/session/start', {
  method: 'POST',
  body: JSON.stringify({
    ...sessionData,
    metadata: {
      abTestVariant: 'B'
    }
  })
});
```
