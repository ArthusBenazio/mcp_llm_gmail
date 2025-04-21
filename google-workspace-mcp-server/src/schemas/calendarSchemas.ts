import { z } from "zod";

export const calendarSchemas = {
  listEventsSchema: z.object({
    maxResults: z.number().optional(),
    timeMin: z.string().optional(),
    timeMax: z.string().optional(),
  }),

  createEventSchema: z.object({
    summary: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    start: z.string(),
    end: z.string(),
    attendees: z.array(z.string()).optional(),
  }),

  updateEventSchema: z.object({
    eventId: z.string(),
    summary: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  }),

  deleteEventSchema: z.object({
    eventId: z.string(),
  }),
};