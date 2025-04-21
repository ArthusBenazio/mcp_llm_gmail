import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import * as emailHandlers from "../handlers/emails";
import * as calendarHandlers from "../handlers/calendar";
import { emailSchemas } from "../schemas/emailSchemas";
import { calendarSchemas } from "../schemas/calendarSchemas";
import { tools } from "../schemas/toolsSchema";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


export class GoogleWorkspaceServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "google-workspace-server", version: "0.1.0" },
      { capabilities: { tools } }
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          case "list_emails":
            return await emailHandlers.listEmails(emailSchemas.listEmailsSchema.parse(args));
          case "search_emails":
            return await emailHandlers.searchEmails(emailSchemas.searchEmailsSchema.parse(args));
          case "send_email":
            return await emailHandlers.sendEmail(emailSchemas.sendEmailSchema.parse(args));
          case "modify_email":
            return await emailHandlers.modifyEmail(emailSchemas.modifyEmailSchema.parse(args));
          case "list_events":
            return await calendarHandlers.listEvents(calendarSchemas.listEventsSchema.parse(args));
          case "create_event":
            return await calendarHandlers.createEvent(calendarSchemas.createEventSchema.parse(args));
          case "update_event":
            return await calendarHandlers.updateEvent(calendarSchemas.updateEventSchema.parse(args));
          case "delete_event":
            return await calendarHandlers.deleteEvent(calendarSchemas.deleteEventSchema.parse(args));
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });

    this.server.onerror = (err) => console.error("[MCP Error]", err);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Google Workspace MCP server running on stdio");
  }
}