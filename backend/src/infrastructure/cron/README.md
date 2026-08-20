# Analytics Cleanup Cron Job

Automated data retention and daily summary aggregation for the Roaya analytics system.

## Overview

This cron job provides automated cleanup and aggregation for analytics data to:
- Maintain database performance by removing old data
- Reduce storage costs
- Comply with data retention policies
- Generate daily summary metrics before raw data deletion

## Features

### 1. Daily Summary Aggregation
Runs **before** cleanup to compute and store aggregated metrics for the previous day:

- **Session Metrics**: Total sessions, unique visitors
- **Page Metrics**: Total page views, top 10 pages
- **Engagement**: Average session duration, bounce rate
- **Demographics**: Device, country, browser, referrer breakdowns

Summary data is stored in the `analytics_daily_summary` table for long-term retention and fast dashboard queries.

### 2. Data Retention Cleanup
Automatically deletes old analytics data based on configurable retention periods:

| Table | Default Retention | Environment Variable |
|-------|------------------|---------------------|
| `session_recording_events` | 30 days | `RECORDING_RETENTION_DAYS` |
| `heatmap_clicks` | 90 days | `DATA_RETENTION_DAYS` |
| `page_views` | 90 days | `DATA_RETENTION_DAYS` |
| `analytics_sessions` | 180 days | `SESSION_RETENTION_DAYS` |

### 3. Performance Optimizations

- **Batch Deletion**: Deletes rows in batches of 1000 to avoid long table locks
- **Proper Ordering**: Cleans child tables before parent tables (respects foreign keys)
- **Throttling**: Small delays between batches to reduce database load
- **Raw SQL**: Uses `$executeRawUnsafe` for optimal performance

## Schedule

**Daily at 03:00 UTC**

The cron runs once per day during off-peak hours to minimize impact on production traffic.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Data Retention Configuration (days)
RECORDING_RETENTION_DAYS=30    # Session recordings (largest storage)
DATA_RETENTION_DAYS=90         # Page views and heatmap clicks
SESSION_RETENTION_DAYS=180     # Analytics sessions (parent table)
```

### Defaults

If not specified, the system uses these defaults:
- Session Recordings: 30 days
- Page Views & Heatmap: 90 days
- Analytics Sessions: 180 days
- Batch Size: 1000 rows

## Usage

### Automatic Start

The cleanup scheduler starts automatically when the backend server starts:

```typescript
// src/index.ts
import { startAnalyticsCleanupScheduler } from './infrastructure/cron/index.js';

// In bootstrap()
startAnalyticsCleanupScheduler();
```

### Manual Trigger

For testing or admin-initiated cleanup:

```typescript
import { triggerManualCleanup } from './infrastructure/cron/index.js';

// Trigger manual cleanup
const result = await triggerManualCleanup();

if (result.success) {
  console.log('Cleanup completed successfully');
} else {
  console.error('Cleanup failed:', result.error);
}
```

### Check Status

```typescript
import { getCleanupStatus } from './infrastructure/cron/index.js';

const status = getCleanupStatus();
console.log(status);
// {
//   isRunning: true,
//   lastRunDate: '2026-02-01',
//   nextRunTime: 'Daily at 03:00 UTC',
//   config: { ... }
// }
```

## Monitoring & Logging

All operations are logged using Winston:

### Info Logs
- Scheduler start/stop
- Daily summary computation start/completion
- Cleanup start/completion with metrics
- Batch deletion progress

### Error Logs
- Daily summary computation failures
- Batch deletion errors
- Unexpected exceptions

### Example Log Output

```
2026-02-01 03:00:00 [info]: Triggering scheduled analytics cleanup
2026-02-01 03:00:00 [info]: Starting daily summary computation {"summaryDate":"2026-01-31T00:00:00.000Z"}
2026-02-01 03:00:05 [info]: Daily summary computation completed {"totalSessions":1523,"uniqueVisitors":892,"totalPageViews":4567,"durationMs":5234}
2026-02-01 03:00:05 [info]: Starting batch deletion for session_recording_events {"cutoffDate":"2026-01-02T03:00:00.000Z","retentionDays":30}
2026-02-01 03:00:12 [info]: Batch deletion completed for session_recording_events {"totalDeleted":15234}
2026-02-01 03:01:45 [info]: Analytics cleanup completed successfully {"totalDeleted":28456,"durationMs":105234,"durationMinutes":"1.75"}
```

## Database Schema Requirements

The cleanup job expects the following tables to exist:

### Input Tables (cleaned up)
- `session_recording_events`
- `heatmap_clicks`
- `page_views`
- `analytics_sessions`

### Output Table (aggregated summaries)
- `analytics_daily_summary`

See `/backend/prisma/schema.prisma` for complete schema definitions.

## Performance Considerations

### Database Load
- Batch size of 1000 rows per deletion
- 100ms delay between batches
- Runs during off-peak hours (03:00 UTC)

### Expected Execution Time
For typical traffic (10,000 sessions/day):
- Daily summary computation: 5-15 seconds
- Data cleanup: 1-5 minutes
- Total: < 6 minutes

For high traffic (100,000+ sessions/day):
- Daily summary computation: 30-60 seconds
- Data cleanup: 10-30 minutes
- Total: < 35 minutes

### Storage Savings

Example for 10,000 sessions/day:
- Session recordings: ~2GB/month → Keep 1 month → **~2GB**
- Page views: ~500MB/month → Keep 3 months → **~1.5GB**
- Heatmap clicks: ~200MB/month → Keep 3 months → **~600MB**
- Sessions: ~50MB/month → Keep 6 months → **~300MB**

**Total active data: ~4.4GB** (vs. unlimited growth)

## Error Handling

### Automatic Recovery
- Batch deletion failures stop the current table but don't prevent cleanup of other tables
- Next day's run will clean up any rows that aged past retention during the failed run

### Manual Intervention
If cleanup fails repeatedly:
1. Check database connectivity and locks
2. Review logs for specific error messages
3. Manually trigger cleanup during low-traffic period
4. Consider adjusting batch size if timeout issues occur

## Integration with Admin Panel

The cleanup job exports functions that can be integrated into an admin panel:

```typescript
// Example admin route
router.post('/admin/analytics/cleanup', async (req, res) => {
  const result = await triggerManualCleanup();
  res.json(result);
});

router.get('/admin/analytics/cleanup/status', (req, res) => {
  const status = getCleanupStatus();
  res.json(status);
});
```

## Testing

### Test in Development

```bash
# Set short retention for testing
RECORDING_RETENTION_DAYS=1
DATA_RETENTION_DAYS=7
SESSION_RETENTION_DAYS=14

# Start server and monitor logs
npm run dev
```

### Manual Test

```typescript
// Create a test script: scripts/test-cleanup.ts
import { runAnalyticsCleanup } from '../src/infrastructure/cron/analytics-cleanup.js';
import { connectDatabase } from '../src/config/database.js';

async function test() {
  await connectDatabase();
  await runAnalyticsCleanup();
  process.exit(0);
}

test();
```

```bash
tsx scripts/test-cleanup.ts
```

## Best Practices

1. **Monitor Logs**: Set up alerts for cleanup failures
2. **Review Metrics**: Check daily summary data to ensure accuracy
3. **Adjust Retention**: Balance storage costs vs. data needs
4. **Test Changes**: Always test retention policy changes in staging first
5. **Backup Data**: Consider archiving old data before deletion if needed

## Troubleshooting

### Issue: Cleanup Taking Too Long

**Solution**: Increase batch size or reduce retention period temporarily
```bash
# Temporarily reduce retention to catch up
DATA_RETENTION_DAYS=60
SESSION_RETENTION_DAYS=120
```

### Issue: Daily Summary Missing Data

**Solution**: Check if summary ran before cleanup
- Summary runs first, so this shouldn't happen
- Manually run summary for missing date using SQL

### Issue: Foreign Key Violations

**Solution**: Ensure cleanup order is correct
- The code already handles this by cleaning child tables first
- Check for custom foreign keys not in the standard schema

## Future Enhancements

Potential improvements for future versions:
- [ ] Compression of old data before deletion (archive to S3)
- [ ] Configurable retention per data type via admin panel
- [ ] Email notifications on cleanup completion/failure
- [ ] Metrics dashboard showing cleanup statistics
- [ ] Support for weekly/monthly summary aggregations
