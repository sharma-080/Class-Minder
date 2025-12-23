import { z } from 'zod';
import { insertSubjectSchema, insertWeeklyScheduleSchema, insertAttendanceRecordSchema, subjects, weeklySchedule, attendanceRecords } from './schema';

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
  subjects: {
    list: {
      method: 'GET' as const,
      path: '/api/subjects',
      responses: {
        200: z.array(z.custom<typeof subjects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/subjects',
      input: insertSubjectSchema,
      responses: {
        201: z.custom<typeof subjects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/subjects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  schedule: {
    list: {
      method: 'GET' as const,
      path: '/api/schedule',
      responses: {
        200: z.array(z.custom<typeof weeklySchedule.$inferSelect & { subject: typeof subjects.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/schedule',
      input: insertWeeklyScheduleSchema,
      responses: {
        201: z.custom<typeof weeklySchedule.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/schedule/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/schedule/generate',
      input: z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        months: z.number().min(1).max(12),
      }),
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance',
      input: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendanceRecords.$inferSelect & { subject: typeof subjects.$inferSelect }>()),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/attendance/:id',
      input: z.object({ status: z.enum(["scheduled", "present", "absent", "cancelled"]) }),
      responses: {
        200: z.custom<typeof attendanceRecords.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/attendance/stats',
      responses: {
        200: z.array(z.object({
          subjectId: z.number(),
          subjectName: z.string(),
          total: z.number(),
          present: z.number(),
          absent: z.number(),
          percentage: z.number(),
        })),
      },
    }
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
