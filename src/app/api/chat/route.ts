import { NextResponse } from "next/server";
import { streamText, experimental_createMCPClient, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";

// Define las interfaces para las llamadas a herramientas y resultados
interface ToolCall {
  type: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: any;
}

// Para depuración
process.env.DEBUG = "ai:*";

// Necesitas configurar esta variable de entorno en .env.local
// GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_api_de_google

/**
 * Crea un cliente MCP para operaciones del sistema de archivos
 * @returns Cliente MCP o null si falla la creación
 */
async function createFilesystemMCP() {
  try {
    const transport = new Experimental_StdioMCPTransport({
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
         "/home/irving/webdev/yt/nextjs-vercel-ai-sdk-mcp-tutorial",
      ],
    });
    
    const client = await experimental_createMCPClient({
      transport,
    });
    
    return client;
  } catch (error) {
    console.error("Error creating MCP client:", error);
    return null;
  }
}

/**
 * POST handler for chat API
 */
export async function POST(req: Request) {
  let mcpClient: any = null;
  
  try {
    console.log("Solicitud POST recibida para /api/chat");
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Falta la variable de entorno GOOGLE_GENERATIVE_AI_API_KEY");
      return NextResponse.json({ error: "Falta la configuración de la clave API" }, { status: 500 });
    }
    
    const {messages} = await req.json();
    console.log("Mensajes recibidos:", JSON.stringify(messages));
    
    console.log("Creando cliente MCP para sistema de archivos...");
    mcpClient = await createFilesystemMCP();
    console.log("Cliente MCP creado:", mcpClient ? "Éxito" : "Falló");
    
    let tools = {};

    if (mcpClient) {
      try {
        console.log("Obteniendo herramientas MCP...");
        tools = await mcpClient.tools();
        console.log("Herramientas MCP cargadas:", Object.keys(tools).length, "herramientas disponibles");
        console.log("Herramientas MCP disponibles:", Object.keys(tools));
      } catch (error) {
        console.error("Error al obtener herramientas MCP:", error);
      }
    }

    console.log("Preparando para llamar al modelo Gemini...");
    try {
      const modelName = "gemini-2.5-flash"; // Usando el modelo especificado
      console.log(`Usando modelo: ${modelName}`);
      
      // Primero generar texto con herramientas habilitadas (sin streaming)
      console.log("Generando texto con herramientas...");
      const result = await generateText({
        model: google(modelName),
        messages,
        tools,
        temperature: 0.7,
      });
      
      console.log("Generación completada, verificando llamadas a herramientas y resultados...");
      console.log("Llamadas a herramientas:", result.toolCalls);
      console.log("Resultados de herramientas:", result.toolResults);
      
      // Obtener la llamada a herramienta y su resultado de la respuesta
      const toolCall = result.toolCalls?.[0] as ToolCall | undefined;
      const toolResult = result.toolResults?.[0] as ToolResult | undefined;
      
      if (toolCall && toolResult) {
        console.log(`Se encontró llamada a herramienta ${toolCall.toolName} y su resultado`);
        console.log(`Resultado de la herramienta:`, toolResult.result);
        
        try {
          // Formatear el resultado de la herramienta en una respuesta legible
          const formattedResult = toolResult.result.content?.[0]?.text || JSON.stringify(toolResult.result);
          console.log("Devolviendo resultado formateado de la herramienta:", formattedResult);
          
          // Devolver una respuesta JSON simple con el resultado formateado
          return NextResponse.json({
            result: formattedResult,
            toolName: toolCall.toolName,
            success: true
          });
        } catch (toolError) {
          console.error(`Error ejecutando la herramienta ${toolCall.toolName}:`, toolError);
          return NextResponse.json({ 
            error: "Error al ejecutar la herramienta", 
            details: toolError instanceof Error ? toolError.message : String(toolError),
            stack: toolError instanceof Error ? toolError.stack : undefined,
            toolCall
          }, { status: 500 });
        }
      } else {
        // No hay llamadas a herramientas, solo devolver el texto
        console.log("No se detectaron llamadas a herramientas, devolviendo texto directamente:", result.text);
        
        // Devolver una respuesta JSON simple con el texto  
        return NextResponse.json({
          result: result.text,
          success: true
        });
      }
    } catch (modelError) {
      console.error("Error en la llamada al modelo Gemini:", modelError);
      
      // Devolver información detallada del error
      return NextResponse.json({ 
        error: "Error del modelo", 
        details: modelError instanceof Error ? modelError.message : String(modelError),
        stack: modelError instanceof Error ? modelError.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error en la API de chat:", error);
    return NextResponse.json({ 
      error: "Error del servidor", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    // Limpiar recursos del cliente MCP
    if (mcpClient) {
      try {
        await mcpClient.close();
        console.log("Cliente MCP cerrado en el bloque finally");
      } catch (error) {
        console.error("Error al cerrar el cliente MCP en el bloque finally:", error);
      }
    }
  }
}