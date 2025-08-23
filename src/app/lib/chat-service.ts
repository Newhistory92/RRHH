/* eslint-disable @typescript-eslint/no-explicit-any */
import { MCPClientService } from "./mcp-client";
import { GeminiService } from "./ai-service";
import { ResponseFormatter } from "./response-formatter";
import { ChatMessage, MCPClient, ChatResponse } from "@/app/Interfas/Interfaces";
import { Tool } from "ai";

export class ChatService {
  /**
   * Procesa una solicitud de chat completa
   */
  static async processChat(messages: ChatMessage[]): Promise<ChatResponse> {
    let mcpClient: MCPClient | null = null;
    
    try {
      console.log("Mensajes recibidos:", JSON.stringify(messages));
      
      // Crear cliente MCP
      console.log("Creando cliente MCP para sistema de archivos...");
      mcpClient = await MCPClientService.createFilesystemClient();
      console.log("Cliente MCP creado:", mcpClient ? "Éxito" : "Falló");
      
      // Obtener herramientas
      const tools = await this.getTools(mcpClient);
      
      // Generar respuesta
      console.log("Preparando para llamar al modelo Gemini...");
      const result = await GeminiService.generateResponse(messages, tools);
      
      // Formatear respuesta
      return ResponseFormatter.formatResponse(
        result.text, 
        result.toolCalls as any[], 
        result.toolResults as any[]
      );
      
    } finally {
      await this.cleanupClient(mcpClient);
    }
  }

  private static async getTools(mcpClient: MCPClient | null): Promise<Record<string, Tool<any, any>>> {
    if (!mcpClient) return {};

    try {
      console.log("Obteniendo herramientas MCP...");
      const tools = await mcpClient.tools();
      console.log("Herramientas MCP cargadas:", Object.keys(tools).length, "herramientas disponibles");
      console.log("Herramientas MCP disponibles:", Object.keys(tools));
      return tools as Record<string, Tool<any, any>>;
    } catch (error) {
      console.error("Error al obtener herramientas MCP:", error);
      return {};
    }
  }

  private static async cleanupClient(mcpClient: MCPClient | null): Promise<void> {
    if (!mcpClient) return;

    try {
      await mcpClient.close();
      console.log("Cliente MCP cerrado correctamente");
    } catch (error) {
      console.error("Error al cerrar el cliente MCP:", error);
    }
  }
}