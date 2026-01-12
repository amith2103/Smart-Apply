import { z } from 'zod';
import { insertApplicationSchema, applications } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications',
      input: z.object({
        search: z.string().optional(),
        status: z.enum(["Applied", "Interviewing", "Offer", "Rejected"]).optional(),
        sponsorshipStatus: z.enum(["Not needed", "Required", "Offered", "Not offered", "Unknown"]).optional(),
        sort: z.enum(["newest", "followUp", "priority"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/analytics/dashboard',
      responses: {
        200: z.custom<{
          counts: {
            totalApplications: number;
            interviewsCount: number;
            offersCount: number;
            rejectionsCount: number;
            sponsorshipOfferedCount: number;
            overdueFollowUpsCount: number;
          };
          chartData: {
            statusBreakdown: { name: string; value: number }[];
            sponsorshipBreakdown: { name: string; value: number }[];
            applicationsTrend: { periodLabel: string; count: number }[];
          };
        }>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
