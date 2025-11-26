import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "cue",
  version: "0.1.0",
});

server.registerTool(
  "echo",
  {
    inputSchema: { inputMessage: z.string() },
    outputSchema: { outputMessage: z.string() },
  },
  async ({ inputMessage }) => {
    const output = { outputMessage: `echo: ${inputMessage}` };

    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
