
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dynamicTool, jsonSchema, Tool } from "ai";
import path from "path";
import fs from "fs";
import { MCPClient } from "@/app/Interfas/Interfaces";
import { PathManager } from "./directory-config";

export class MCPClientService {
  private static readonly MCP_SERVER_PATH = path.join(
    process.cwd(),
    "node_modules",
    "@modelcontextprotocol",
    "server-filesystem",
    "dist",
    "index.js"
  );

  /**
   * Crea un cliente MCP para el sistema de archivos
   */
  static async createFilesystemClient(): Promise<MCPClient | null> {
    try {
      if (!this.isServerInstalled()) {
        console.error(`Servidor MCP no encontrado en: ${this.MCP_SERVER_PATH}`);
        console.log("Por favor, instale el servidor MCP");
        return null;
      }

      const workingDirectory = PathManager.getWorkingDirectory();
      console.log(`Configurando MCP para el directorio: ${workingDirectory}`);

      const transport = this.createTransport(workingDirectory);

      console.log("Creando cliente MCP...");
      const client = new Client({ name: "rrhh-mcp-client", version: "1.0.0" });
      await client.connect(transport);

      console.log("Cliente MCP creado exitosamente");

      return {
        tools: async (): Promise<Record<string, unknown>> => {
          const { tools } = await client.listTools();
          const result: Record<string, Tool<unknown, unknown>> = {};

          for (const mcpTool of tools) {
            result[mcpTool.name] = dynamicTool({
              description: mcpTool.description ?? "",
              inputSchema: jsonSchema(
                (mcpTool.inputSchema as Record<string, unknown>) ?? {
                  type: "object",
                  properties: {},
                }
              ),
              execute: async (input: unknown) => {
                const callResult = await client.callTool({
                  name: mcpTool.name,
                  arguments: input as Record<string, unknown>,
                });
                return callResult;
              },
            });
          }

          return result;
        },
        close: async (): Promise<void> => {
          await client.close();
        },
      };
    } catch (error) {
      console.error("Error creating MCP client:", error);
      return null;
    }
  }

  private static isServerInstalled(): boolean {
    return fs.existsSync(this.MCP_SERVER_PATH);
  }

  private static createTransport(workingDirectory: string) {
    return new StdioClientTransport({
      command: process.execPath,
      args: [this.MCP_SERVER_PATH, workingDirectory],
      env: {
        ...process.env,
        NODE_PATH: path.join(process.cwd(), "node_modules"),
      } as Record<string, string>,
    });
  }
}
