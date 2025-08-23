/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export class ErrorHandler {
  static handleError(error: unknown, context: string = "Error del servidor") {
    console.error(`Error en ${context}:`, error);
    
    return NextResponse.json({ 
      error: context, 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }

  static handleApiKeyError() {
    console.error("Falta la variable de entorno GOOGLE_GENERATIVE_AI_API_KEY");
    return NextResponse.json(
      { error: "Falta la configuración de la clave API" }, 
      { status: 500 }
    );
  }

  static handleToolError(error: unknown, toolCall: any) {
    console.error(`Error ejecutando la herramienta ${toolCall.toolName}:`, error);
    return NextResponse.json({ 
      error: "Error al ejecutar la herramienta", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      toolCall
    }, { status: 500 });
  }
}