import { calendar } from "../config/auth.js";


export async function listEvents(args: any) {
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: args.timeMin || new Date().toISOString(),
    timeMax: args.timeMax,
    maxResults: args.maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(res.data.items, null, 2),
      },
    ],
  };
}

export async function createEvent(args: any) {
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: args.summary,
      location: args.location,
      description: args.description,
      start: { dateTime: args.start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: args.end, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      attendees: args.attendees?.map((email: string) => ({ email })),
    },
  });

  return { content: [{ type: "text", text: `Event created. ID: ${res.data.id}` }] };
}

export async function updateEvent(args: any) {
  const res = await calendar.events.patch({
    calendarId: "primary",
    eventId: args.eventId,
    requestBody: {
      summary: args.summary,
      location: args.location,
      description: args.description,
      start: args.start ? { dateTime: args.start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone } : undefined,
      end: args.end ? { dateTime: args.end, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone } : undefined,
      attendees: args.attendees?.map((email: string) => ({ email })),
    },
  });

  return { content: [{ type: "text", text: `Event updated. ID: ${res.data.id}` }] };
}

export async function deleteEvent(args: any) {
  await calendar.events.delete({ calendarId: "primary", eventId: args.eventId });
  return { content: [{ type: "text", text: `Event deleted. ID: ${args.eventId}` }] };
}