import { z } from 'zod';
import { TripPlan } from '../types';

const GeoLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string(),
  address: z.string().optional()
});

const ActivitySchema = z.object({
  id: z.string().optional(),
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['sightseeing', 'food', 'transport', 'shopping', 'rest', 'other']),
  transportDetail: z.string().optional(),
  cost: z.string().optional(),
  localTip: z.string().optional(),
  duration: z.string().optional(),
  bookingRequired: z.boolean().optional(),
  rainPlan: z.string().optional(),
  location: GeoLocationSchema.optional()
});

const DayPlanSchema = z.object({
  day: z.number().int().positive(),
  date: z.string().min(1),
  theme: z.string().min(1),
  summary: z.string().min(1),
  activities: z.array(ActivitySchema).min(1)
});

export const TripPlanSchema = z.object({
  tripTitle: z.string().min(1),
  destination: z.string().min(1),
  duration: z.string().min(1),
  totalBudgetEstimate: z.string().min(1),
  visualVibe: z.enum(['modern', 'historical', 'nature', 'tropical']),
  days: z.array(DayPlanSchema).min(1),
  generalTips: z.array(z.string().min(1)).min(1)
});

export type TripPlanParsed = z.infer<typeof TripPlanSchema> & TripPlan;

export const parseTripPlan = (raw: unknown): TripPlan => {
  const parsed = TripPlanSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map(issue => `${issue.path.join('.')} ${issue.message}`)
      .join('; ');
    throw new Error(`行程資料格式驗證失敗：${message}`);
  }
  return parsed.data;
};

