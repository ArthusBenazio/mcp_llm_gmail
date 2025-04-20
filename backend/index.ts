import Fastify from "fastify";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAI } from "openai";
import cors from "@fastify/cors";

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: "*",
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SERVER_SCRIPT_PATH = "../google-workspace-mcp-server/build/index.js";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const mcpClient = new Client({ name: "mcp-api-server", version: "1.0.0" });

let tools: any = [];

async function initMCP() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_SCRIPT_PATH],
  });

  mcpClient.connect(transport);
  const { tools: serverTools } = await mcpClient.listTools();
  tools = serverTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

fastify.post("/chat", async (req: any, reply) => {
  const { message } = req.body;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "user", content: message },
  ];
  
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages,
    tools,
    tool_choice: "auto",
  });

  const results: string[] = [];

  const toolCalls = response.choices[0].message.tool_calls;

  if (toolCalls) {
    for (const call of toolCalls) {
      const toolResult = await mcpClient.callTool({
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments),
      });

      const contentText = Array.isArray(toolResult.content)
        ? toolResult.content.map((c) => c.text).join("\n")
        : JSON.stringify(toolResult.content);

      results.push(`[Tool ${call.function.name}]\n${contentText}`);
    }
  }

  if (response.choices[0].message.content) {
    results.push(response.choices[0].message.content);
  }

  return { response: results.join("\n") };
});

fastify.listen({ port: 3001 }, async (err) => {
  if (err) throw err;
  await initMCP();
  console.log("🚀 Backend ready at http://localhost:3001");
});
