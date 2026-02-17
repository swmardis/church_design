import { z } from 'zod';
import { insertSectionSchema, insertEventSchema, insertMediaSchema, insertSettingSchema, insertShortcutSchema, site_sections, events, media, settings, dashboard_shortcuts } from './schema';

export type InsertEvent = z.infer<typeof insertEventSchema>;

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
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === Public Site Content ===
  content: {
    getPage: {
      method: 'GET' as const,
      path: '/api/content/:page' as const,
      responses: {
        200: z.array(z.custom<typeof site_sections.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    updateSection: {
      method: 'POST' as const,
      path: '/api/content/:page/:sectionKey' as const,
      input: z.object({ content: z.record(z.any()) }),
      responses: {
        200: z.custom<typeof site_sections.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === Events ===
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema.extend({ date: z.coerce.date() }),
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.extend({ date: z.coerce.date() }).partial(),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === Media ===
  media: {
    list: {
      method: 'GET' as const,
      path: '/api/media' as const,
      responses: {
        200: z.array(z.custom<typeof media.$inferSelect>()),
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/media' as const,
      // Input is FormData, handled manually in handler
      responses: {
        201: z.custom<typeof media.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/media/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === Settings ===
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: z.array(z.object({ key: z.string(), value: z.any() })),
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === Dashboard Shortcuts ===
  shortcuts: {
    list: {
      method: 'GET' as const,
      path: '/api/shortcuts' as const,
      responses: {
        200: z.array(z.custom<typeof dashboard_shortcuts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/shortcuts' as const,
      input: insertShortcutSchema,
      responses: {
        201: z.custom<typeof dashboard_shortcuts.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/shortcuts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  
  // === Planning Center Integration ===
  pco: {
    sync: {
      method: 'POST' as const,
      path: '/api/pco/sync' as const,
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
  }
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
