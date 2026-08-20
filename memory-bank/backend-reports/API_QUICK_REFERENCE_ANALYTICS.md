# Analytics API - Quick Reference

## Base URL
```
Production: https://api.roaya.com/api/v1
Development: http://localhost:3000/api/v1
```

---

## 🔓 Public Endpoints (No Auth)

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "website-analytics",
  "timestamp": "2026-02-01T12:00:00Z",
  "metrics": {
    "uptime": 3600,
    "activeSessions": 42,
    "totalPageViewsToday": 1234,
    "cacheHitRate": 0.95,
    "avgResponseTime": 45
  }
}
```

---

### Prometheus Metrics
```http
GET /metrics
```

**Response:** (text/plain)
```
analytics_active_sessions 42
analytics_page_views_total 1234
analytics_cache_hit_rate 0.95
analytics_avg_response_time_ms 45
analytics_uptime_seconds 3600
```

---

### Track Custom Event
```http
POST /tracking/event
Content-Type: application/json
```

**Rate Limit:** 30/min per IP

**Request:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "eventName": "cta_click",
  "eventCategory": "engagement",
  "eventData": {
    "buttonId": "hero-cta",
    "label": "Get Started"
  },
  "pagePath": "/pricing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "eventId": "uuid"
  }
}
```

**Event Name Examples:**
- `cta_click` - CTA button clicked
- `form_submit` - Form submitted
- `feature_view` - Feature viewed
- `video_play` - Video played
- `download_click` - Download initiated
- `pricing_view` - Pricing card viewed
- `calculator_use` - ROI calculator used

**Event Categories:**
- `engagement` - User interaction events
- `conversion` - Conversion actions
- `navigation` - Navigation events
- `content` - Content interaction
- `error` - Error tracking

---

## 🔒 Admin Endpoints (Auth Required)

### Get Custom Events
```http
GET /events?startDate=2026-01-01T00:00:00Z&endDate=2026-02-01T23:59:59Z&eventName=cta_click&limit=100
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate` (optional) - ISO datetime
- `endDate` (optional) - ISO datetime
- `eventName` (optional) - Filter by event name
- `eventCategory` (optional) - Filter by category
- `limit` (optional) - Max 1000, default 100
- `offset` (optional) - Pagination offset, default 0

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "eventName": "cta_click",
      "eventCategory": "engagement",
      "count": 1234
    },
    {
      "eventName": "form_submit",
      "eventCategory": "conversion",
      "count": 567
    }
  ]
}
```

---

### Get Events Summary
```http
GET /events/summary?from=2026-01-01T00:00:00Z&to=2026-02-01T23:59:59Z
Authorization: Bearer {token}
```

**Query Parameters:**
- `from` (optional) - ISO datetime, default: 30 days ago
- `to` (optional) - ISO datetime, default: now

**Response:**
```json
{
  "success": true,
  "data": {
    "topEvents": [
      { "eventName": "cta_click", "count": 1234 },
      { "eventName": "form_submit", "count": 567 },
      { "eventName": "feature_view", "count": 432 }
    ],
    "categoryBreakdown": [
      { "category": "engagement", "count": 2000 },
      { "category": "conversion", "count": 800 },
      { "category": "navigation", "count": 500 }
    ],
    "eventsOverTime": [
      { "date": "2026-02-01T00:00:00Z", "count": 500 },
      { "date": "2026-02-02T00:00:00Z", "count": 600 }
    ]
  }
}
```

---

## Frontend Integration Examples

### Track CTA Click
```javascript
async function trackCTAClick(buttonId, buttonText, destination) {
  const sessionId = sessionStorage.getItem('ra_session_id');
  if (!sessionId) return;

  await fetch('/api/v1/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      eventName: 'cta_click',
      eventCategory: 'engagement',
      eventData: {
        buttonId,
        buttonText,
        destination
      },
      pagePath: window.location.pathname
    })
  });
}

// Usage
document.getElementById('hero-cta').addEventListener('click', () => {
  trackCTAClick('hero-cta', 'Get Started', '/contact');
});
```

---

### Track Form Submission
```javascript
async function trackFormSubmit(formId, formType, fields) {
  const sessionId = sessionStorage.getItem('ra_session_id');
  if (!sessionId) return;

  await fetch('/api/v1/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      eventName: 'form_submit',
      eventCategory: 'conversion',
      eventData: {
        formId,
        formType,
        fields,
        timestamp: new Date().toISOString()
      },
      pagePath: window.location.pathname
    })
  });
}

// Usage
document.getElementById('contact-form').addEventListener('submit', (e) => {
  trackFormSubmit('contact-form', 'lead-capture', ['name', 'email', 'company']);
});
```

---

### Track Feature View
```javascript
async function trackFeatureView(featureId, featureName) {
  const sessionId = sessionStorage.getItem('ra_session_id');
  if (!sessionId) return;

  await fetch('/api/v1/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      eventName: 'feature_view',
      eventCategory: 'engagement',
      eventData: {
        featureId,
        featureName,
        viewDuration: 0 // Can update later
      },
      pagePath: window.location.pathname
    })
  });
}

// Usage with Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      trackFeatureView(entry.target.id, entry.target.dataset.name);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.feature-card').forEach(card => {
  observer.observe(card);
});
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "eventName",
        "code": "INVALID_FORMAT",
        "message": "Event name is required"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-02-01T12:00:00Z"
  }
}
```

---

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "error": {
    "code": "TRACKING_RATE_LIMIT_EXCEEDED",
    "message": "Too many tracking requests"
  }
}
```

---

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "req_abc123",
    "timestamp": "2026-02-01T12:00:00Z"
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/tracking/event` | 30 | 1 minute |
| `/tracking/pageview` | 30 | 1 minute |
| `/tracking/click` | 60 | 1 minute |
| `/tracking/session/start` | 5 | 1 minute |
| `/events` | 100 | 1 minute |
| `/events/summary` | 100 | 1 minute |
| `/health` | None | - |
| `/metrics` | None | - |

---

## IP Anonymization

All IP addresses are automatically anonymized before storage:

- **IPv4:** `192.168.1.123` → `192.168.1.0`
- **IPv6:** `2001:db8::1234:5678` → `2001:db8::0000:0000`

This ensures GDPR compliance (Article 32) while maintaining geographic data accuracy.

---

## Best Practices

### 1. Event Naming Convention
```javascript
// ✅ Good
eventName: 'cta_click'
eventName: 'form_submit'
eventName: 'feature_view'

// ❌ Bad
eventName: 'Click'
eventName: 'user clicked button'
eventName: 'FormSubmitted'
```

### 2. Event Categories
```javascript
// ✅ Use standard categories
eventCategory: 'engagement'
eventCategory: 'conversion'
eventCategory: 'navigation'
eventCategory: 'content'

// ❌ Avoid custom categories unless needed
eventCategory: 'my_custom_category'
```

### 3. Event Data Structure
```javascript
// ✅ Flat, descriptive objects
eventData: {
  buttonId: 'hero-cta',
  buttonText: 'Get Started',
  destination: '/contact'
}

// ❌ Nested or ambiguous data
eventData: {
  button: {
    props: {
      id: 'hero-cta'
    }
  }
}
```

### 4. Error Handling
```javascript
// ✅ Silent failure for tracking
async function trackEvent(data) {
  try {
    await fetch('/api/v1/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    // Log but don't block user experience
    console.debug('Analytics tracking failed:', error);
  }
}

// ❌ Don't show errors to users
trackEvent(data).catch(err => alert('Tracking failed!'));
```

---

## Monitoring Integration

### Prometheus Scraping
```yaml
scrape_configs:
  - job_name: 'roaya-analytics'
    scrape_interval: 30s
    static_configs:
      - targets: ['api.roaya.com:443']
    metrics_path: '/api/v1/metrics'
    scheme: https
```

### Health Check Monitoring
```bash
# Simple uptime check
curl -f https://api.roaya.com/api/v1/health || exit 1

# Check specific metric
curl -s https://api.roaya.com/api/v1/health | jq '.metrics.avgResponseTime < 100'
```

---

## Support

For API issues or questions:
- **Technical Docs:** `/backend/docs/ADVANCED_ANALYTICS_FEATURES.md`
- **Source Code:** `/backend/src/application/services/website-analytics.service.ts`
- **Migration:** `/backend/prisma/migrations/20260201_add_custom_analytics_events.sql`

---

**Last Updated:** 2026-02-01
**API Version:** v1
