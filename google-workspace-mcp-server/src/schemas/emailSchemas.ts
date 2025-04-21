import { z } from "zod";

export const emailSchemas = {
  listEmailsSchema: z.object({
    maxResults: z.number().optional(),
    query: z.string().optional(),
  }),

  searchEmailsSchema: z.object({
    query: z.string(),
    maxResults: z.number().optional(),
  }),

  sendEmailSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
    cc: z.string().optional(),
    bcc: z.string().optional(),
  }),

  modifyEmailSchema: z.object({
    id: z.string(),
    addLabels: z.array(z.string()).optional(),
    removeLabels: z.array(z.string()).optional(),
  }),
};