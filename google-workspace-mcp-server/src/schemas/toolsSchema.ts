import { zodToJsonSchema } from "zod-to-json-schema";
import { emailSchemas } from "./emailSchemas.js";
import { calendarSchemas } from "./calendarSchemas.js";

export const tools = {
  list_emails: {
    description: "List recent emails from Gmail inbox",
    inputSchema: zodToJsonSchema(emailSchemas.listEmailsSchema),
  },
  search_emails: {
    description: "Search emails with advanced query",
    inputSchema: zodToJsonSchema(emailSchemas.searchEmailsSchema),
  },
  send_email: {
    description: "Send a new email",
    inputSchema: zodToJsonSchema(emailSchemas.sendEmailSchema),
  },
  modify_email: {
    description: "Modify email labels",
    inputSchema: zodToJsonSchema(emailSchemas.modifyEmailSchema),
  },
  list_events: {
    description: "List upcoming calendar events",
    inputSchema: zodToJsonSchema(calendarSchemas.listEventsSchema),
  },
  create_event: {
    description: "Create a new calendar event",
    inputSchema: zodToJsonSchema(calendarSchemas.createEventSchema),
  },
  update_event: {
    description: "Update an existing calendar event",
    inputSchema: zodToJsonSchema(calendarSchemas.updateEventSchema),
  },
  delete_event: {
    description: "Delete a calendar event",
    inputSchema: zodToJsonSchema(calendarSchemas.deleteEventSchema),
  },
};