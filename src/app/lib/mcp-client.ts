
import { experimental_createMCPClient} from "ai";
import path from "path";
import fs from "fs";
import { MCPClient } from "@/app/Interfas/Interfaces";
import { PathManager } from "./directory-config";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";

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
      const client = await experimental_createMCPClient({ transport });
      
      console.log("Cliente MCP creado exitosamente");
      return client as MCPClient;
    } catch (error) {
      console.error("Error creating MCP client:", error);
      return null;
    }
  }

  private static isServerInstalled(): boolean {
    return fs.existsSync(this.MCP_SERVER_PATH);
  }

  private static createTransport(workingDirectory: string) {
    return new Experimental_StdioMCPTransport({
      command: process.execPath,
      args: [this.MCP_SERVER_PATH, workingDirectory],
      env: {
        ...process.env,
        NODE_PATH: path.join(process.cwd(), "node_modules"),
      }
    });
  }
}