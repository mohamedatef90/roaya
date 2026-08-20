import { z } from 'zod';

// Tracking schemas
export const trackPageViewSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  path: z.string().min(1, 'Path is required').max(2000),
  referrer: z.string().max(2000).optional(),
  country: z.string().max(100).optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  browser: z.string().max(100).optional(),
});

export const updatePageViewDurationSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  path: z.string().min(1, 'Path is required').max(2000),
  duration: z.number().int().min(0, 'Duration must be >= 0'),
  scrollDepth: z.number().int().min(0).max(100, 'Scroll depth must be 0-100').optional(),
});

export const trackClickSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  path: z.string().min(1, 'Path is required').max(2000),
  x: z.number().int().min(0).max(100, 'X coordinate must be 0-100'),
  y: z.number().int().min(0).max(100, 'Y coordinate must be 0-100'),
  elementTag: z.string().max(50).optional(),
  elementId: z.string().max(255).optional(),
  elementClass: z.string().max(500).optional(),
});

export const startSessionSchema = z.object({
  visitorId: z.string().min(1).max(255).optional(), // Optional - backend generates if missing
  country: z.string().max(100).optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  browser: z.string().max(100).optional(),
  referrer: z.string().max(2000).optional(),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
});

export const endSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

// Analytics query schemas
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  granularity: z.enum(['day', 'week', 'month']).optional(),
});

export const heatmapPathSchema = z.object({
  path: z.string().min(1, 'Path is required'),
});

export const sessionFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  device: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const storeRecordingEventsSchema = z.object({
  sessionId: z.string().uuid(),
  events: z
    .array(z.record(z.unknown()))
    .min(1)
    .max(200)
    .refine(
      (events) => JSON.stringify(events).length <= 500_000,
      'Recording events batch must be under 500KB'
    ),
  sequence: z.number().int().min(0),
});

// Custom Event Tracking schemas (Feature 2)
export const trackEventSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  eventName: z.string().min(1, 'Event name is required').max(255),
  eventCategory: z.string().min(1, 'Event category is required').max(100),
  eventData: z
    .record(z.unknown())
    .refine(
      (data) => JSON.stringify(data).length <= 10_000,
      'Event data must be under 10KB'
    )
    .optional(),
  pagePath: z.string().min(1, 'Page path is required').max(2000),
});

export const eventFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventName: z.string().max(255).optional(),
  eventCategory: z.string().max(100).optional(),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>;
export type TrackClickInput = z.infer<typeof trackClickSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
export type UpdatePageViewDurationInput = z.infer<typeof updatePageViewDurationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type SessionFiltersInput = z.infer<typeof sessionFiltersSchema>;
export type StoreRecordingEventsInput = z.infer<typeof storeRecordingEventsSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
