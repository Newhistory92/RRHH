// import { NextResponse } from "next/server";
// import { experimental_createMCPClient, generateText } from "ai";
// import { google } from "@ai-sdk/google";
// import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
// import path from "path";
// import fs from "fs";
// import os from "os";

// // Interfaces para las llamadas a herramientas y resultados
// interface ToolCall {
//   type: string;
//   toolCallId: string;
//   toolName: string;
//   args: Record<string, unknown>;
// }

// interface ToolResult {
//   toolCallId: string;
//   toolName: string;
//   result: unknown;
// }

// // ===== CONFIGURACIÓN DE DIRECTORIOS =====
// class DirectoryConfig {
//   private static instance: DirectoryConfig;
//   private _allowedDirectories: string[] = [];
//   private _initialized: boolean = false;

//   private constructor() {}

//   public static getInstance(): DirectoryConfig {
//     if (!DirectoryConfig.instance) {
//       DirectoryConfig.instance = new DirectoryConfig();
//     }
//     return DirectoryConfig.instance;
//   }

//   /**
//    * Inicializa los directorios permitidos
//    */
//   public initialize(): void {
//     if (this._initialized) return;

//     // Usar la raíz del proyecto directamente
//     const projectRootDir = process.cwd(); // D:\Mi Documentos\Documents\RRHH\
    
//     console.log(`📂 Usando directorio raíz del proyecto: ${projectRootDir}`);

//     this._allowedDirectories = [projectRootDir];
//     this._initialized = true;
    
//     console.log("📁 Configuración de directorios:");
//     console.log(`   - Directorio principal: ${projectRootDir}`);
//     console.log(`   - ¿Existe?: ${fs.existsSync(projectRootDir)}`);
//   }

//   /**
//    * Obtiene los directorios permitidos
//    */
//   public getAllowedDirectories(): string[] {
//     if (!this._initialized) {
//       this.initialize();
//     }
//     return [...this._allowedDirectories];
//   }

//   /**
//    * Obtiene el directorio principal (public)
//    */
//   public getMainDirectory(): string {
//     if (!this._initialized) {
//       this.initialize();
//     }
//     return this._allowedDirectories[0];
//   }

//   /**
//    * Agrega un directorio adicional (opcional)
//    */
//   public addDirectory(dirPath: string): boolean {
//     if (!fs.existsSync(dirPath)) {
//       console.warn(`⚠️  Directorio no existe: ${dirPath}`);
//       return false;
//     }
    
//     if (!this._allowedDirectories.includes(dirPath)) {
//       this._allowedDirectories.push(dirPath);
//       console.log(`✅ Directorio agregado: ${dirPath}`);
//       return true;
//     }
    
//     return false;
//   }
// }

// // ===== CONFIGURACIÓN DEL SERVIDOR MCP =====
// class MCPServerConfig {
//   private serverPath: string;
  
//   constructor() {
//     this.serverPath = path.join(
//       process.cwd(), 
//       "node_modules", 
//       "@modelcontextprotocol", 
//       "server-filesystem", 
//       "dist", 
//       "index.js"
//     );
//   }

//   /**
//    * Verifica si el servidor MCP está instalado
//    */
//   public isInstalled(): boolean {
//     return fs.existsSync(this.serverPath);
//   }

//   /**
//    * Obtiene la configuración del transporte
//    */
//   public getTransportConfig(allowedDirectories: string[]) {
//     return new Experimental_StdioMCPTransport({
//       command: process.execPath,
//       args: [
//         this.serverPath,
//         ...allowedDirectories,
//       ],
//       env: {
//         ...process.env,
//         NODE_PATH: path.join(process.cwd(), "node_modules"),
//       },
//       shell: process.platform === 'win32'
//     });
//   }

//   public getServerPath(): string {
//     return this.serverPath;
//   }
// }

// // ===== CLIENTE MCP =====
// class MCPClientManager {
//   private static instance: MCPClientManager;
//   private client: any = null;
//   private directoryConfig: DirectoryConfig;
//   private serverConfig: MCPServerConfig;

//   private constructor() {
//     this.directoryConfig = DirectoryConfig.getInstance();
//     this.serverConfig = new MCPServerConfig();
//   }

//   public static getInstance(): MCPClientManager {
//     if (!MCPClientManager.instance) {
//       MCPClientManager.instance = new MCPClientManager();
//     }
//     return MCPClientManager.instance;
//   }

//   /**
//    * Crea el cliente MCP
//    */
//   public async createClient(): Promise<any> {
//     try {
//       // Verificar servidor
//       if (!this.serverConfig.isInstalled()) {
//         console.error(`❌ Servidor MCP no encontrado en: ${this.serverConfig.getServerPath()}`);
//         console.log("💡 Instala el servidor con: npm install @modelcontextprotocol/server-filesystem");
//         return null;
//       }

//       // Inicializar directorios
//       this.directoryConfig.initialize();
//       const allowedDirectories = this.directoryConfig.getAllowedDirectories();
      
//       console.log("🚀 Configurando cliente MCP...");
//       console.log(`📂 Directorios permitidos: ${allowedDirectories.length}`);
//       allowedDirectories.forEach((dir, index) => {
//         console.log(`   ${index + 1}. ${dir}`);
//       });

//       // Crear transporte y cliente
//       const transport = this.serverConfig.getTransportConfig(allowedDirectories);
      
//       this.client = await experimental_createMCPClient({ transport });
      
//       console.log("✅ Cliente MCP creado exitosamente");
//       return this.client;

//     } catch (error) {
//       console.error("❌ Error creando cliente MCP:", error);
//       return null;
//     }
//   }

//   /**
//    * Obtiene las herramientas disponibles
//    */
//   public async getTools(): Promise<Record<string, unknown>> {
//     if (!this.client) {
//       throw new Error("Cliente MCP no inicializado");
//     }

//     try {
//       const tools = await this.client.tools();
//       console.log(`🛠️  Herramientas MCP cargadas: ${Object.keys(tools).length} disponibles`);
//       console.log(`   Herramientas: ${Object.keys(tools).join(', ')}`);
//       return tools;
//     } catch (error) {
//       console.error("❌ Error obteniendo herramientas MCP:", error);
//       return {};
//     }
//   }

//   /**
//    * Cierra el cliente
//    */
//   public async close(): Promise<void> {
//     if (this.client) {
//       try {
//         await this.client.close();
//         console.log("🔒 Cliente MCP cerrado correctamente");
//       } catch (error) {
//         console.error("❌ Error cerrando cliente MCP:", error);
//       } finally {
//         this.client = null;
//       }
//     }
//   }
// }

// // ===== CONFIGURACIÓN DEL MODELO =====
// class ModelConfig {
//   public static getSystemMessage(): string {
//     const directoryConfig = DirectoryConfig.getInstance();
//     const mainDir = directoryConfig.getMainDirectory();
    
//     return `Responde siempre en español.

// 🎯 INSTRUCCIONES PARA ARCHIVOS:
// IMPORTANTE: Todos los archivos se crearán en la raíz del proyecto: ${mainDir}

// Para write_file usa SOLO el nombre del archivo:
// - ✅ CORRECTO: "ejemplo.txt", "datos.json", "mi_archivo.pdf"
// - ❌ INCORRECTO: "./ejemplo.txt", "carpeta/archivo.txt", rutas absolutas

// 📂 UBICACIÓN: Los archivos se guardarán directamente en el directorio del proyecto.

// 🚀 HERRAMIENTAS DISPONIBLES:
// - write_file: Crear archivos en la raíz del proyecto
// - read_file: Leer archivos existentes  
// - list_directory: Ver archivos en el directorio
// - create_directory: Crear subdirectorios si necesario

// Usa únicamente nombres de archivo simples sin rutas.`;
//   }

//   public static getModelInstance() {
//     if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
//       throw new Error("❌ Falta la variable GOOGLE_GENERATIVE_AI_API_KEY");
//     }
//     return google("gemini-2.5-flash");
//   }
// }

// // ===== PROCESADOR DE RESULTADOS =====
// class ResultProcessor {
//   public static formatToolResult(toolCall: any, toolResult: any): string {
//     try {
//       console.log(`🔧 Procesando resultado de ${toolCall.toolName}...`);

//       // Verificar si hay error
//       if (toolResult.output && toolResult.output.isError) {
//         const errorContent = toolResult.output.content;
//         if (Array.isArray(errorContent) && errorContent.length > 0) {
//           const errorText = errorContent[0].text || errorContent[0].toString();
//           return `❌ Error en ${toolCall.toolName}: ${errorText}`;
//         } else {
//           return `❌ Error en ${toolCall.toolName}: Error desconocido`;
//         }
//       }

//       // Resultado exitoso
//       const output = toolResult.output || toolResult.result;
//       let result = "";

//       if (output && output.content && Array.isArray(output.content)) {
//         result = output.content
//           .map((item: any) => item.text || item.toString())
//           .join('\n') || 'Operación completada exitosamente';
//       } else if (typeof output === 'string') {
//         result = output;
//       } else {
//         // Mensajes específicos por herramienta
//         switch (toolCall.toolName) {
//           case 'write_file':
//             result = `✅ Archivo '${toolCall.input.path}' creado exitosamente en public/`;
//             break;
//           case 'create_directory':
//             result = `✅ Directorio '${toolCall.input.path}' creado exitosamente`;
//             break;
//           case 'read_file':
//             result = `✅ Archivo '${toolCall.input.path}' leído exitosamente`;
//             break;
//           default:
//             result = `✅ Herramienta ${toolCall.toolName} ejecutada exitosamente`;
//         }
//       }

//       console.log(`✅ Resultado procesado: ${result}`);
//       return result;

//     } catch (error) {
//       console.error(`❌ Error procesando resultado de ${toolCall.toolName}:`, error);
//       return `❌ Error al procesar el resultado de ${toolCall.toolName}`;
//     }
//   }
// }

// // ===== API HANDLER PRINCIPAL =====
// export async function POST(req: Request) {
//   const mcpManager = MCPClientManager.getInstance();
  
//   try {
//     console.log("🚀 === INICIANDO SOLICITUD CHAT API ===");
    
//     const { messages } = await req.json();
//     console.log(`📨 Mensajes recibidos: ${messages.length}`);
    
//     // Crear cliente MCP
//     console.log("🔧 Creando cliente MCP...");
//     const mcpClient = await mcpManager.createClient();
    
//     if (!mcpClient) {
//       return NextResponse.json({ 
//         error: "No se pudo inicializar el cliente MCP" 
//       }, { status: 500 });
//     }
    
//     // Obtener herramientas
//     const tools = await mcpManager.getTools();
    
//     // Preparar mensajes con configuración del sistema
//     const messagesWithSystem = [
//       { role: "system" as const, content: ModelConfig.getSystemMessage() },
//       ...messages
//     ];

//     console.log("🤖 Llamando al modelo Gemini...");
    
//     // Generar respuesta
//     const result = await generateText({
//       model: ModelConfig.getModelInstance(),
//       messages: messagesWithSystem,
//       tools,
//       temperature: 0.7,
//     });
    
//     console.log("✅ Generación completada");
//     console.log(`🔧 Llamadas a herramientas: ${result.toolCalls?.length || 0}`);
    
//     // Procesar resultados
//     const toolCall = result.toolCalls?.[0] as unknown as any;
//     const toolResult = result.toolResults?.[0] as unknown as any;
    
//     if (toolCall && toolResult) {
//       console.log(`🔍 DEBUG - Tool Input: ${JSON.stringify(toolCall.input)}`);
//       console.log(`🔍 DEBUG - Path usado: "${toolCall.input.path}"`);
//       console.log(`🔍 DEBUG - Directorio permitido: "${DirectoryConfig.getInstance().getMainDirectory()}"`);
      
//       const formattedResult = ResultProcessor.formatToolResult(toolCall, toolResult);
      
//       return NextResponse.json({
//         result: formattedResult,
//         toolName: toolCall.toolName,
//         success: !toolResult.output?.isError,
//         toolInput: toolCall.input,
//         directory: DirectoryConfig.getInstance().getMainDirectory()
//       });
//     } else {
//       console.log("💬 Sin herramientas, devolviendo texto directo");
//       return NextResponse.json({
//         result: result.text,
//         success: true
//       });
//     }

//   } catch (error) {
//     console.error("❌ Error en la API de chat:", error);
//     return NextResponse.json({ 
//       error: "Error del servidor", 
//       details: error instanceof Error ? error.message : String(error)
//     }, { status: 500 });
//   } finally {
//     // Limpiar recursos
//     await mcpManager.close();
//     console.log("🏁 === SOLICITUD COMPLETADA ===");
//   }
// }


import { NextResponse } from "next/server";
import { ChatService } from "@/app/lib/chat-service";
import { ErrorHandler } from "@/app/util/errorHandler";
import { ChatRequest } from "@/app/Interfas/Interfaces";

/**
 * POST handler para la API de chat
 */
export async function POST(req: Request) {
  try {
    console.log("Solicitud POST recibida para /api/chat");
    
    // Validar clave API
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return ErrorHandler.handleApiKeyError();
    }
    
    // Parsear request
    const { messages }: ChatRequest = await req.json();
    
    // Procesar chat
    const response = await ChatService.processChat(messages);
    
    return NextResponse.json(response);
    
  } catch (error) {
    return ErrorHandler.handleError(error, "Error en la API de chat");
  }
}