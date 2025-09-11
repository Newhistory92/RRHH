
import { NextResponse } from "next/server";
import { ChatService } from "@/app/lib/chat-service";
import { ChatMessage, ChatResponse } from "@/app/Interfas/Interfaces";
import { CaseStudyService, GenerateCaseStudyRequest } from "@/app/lib/caseStudyService";

export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  try {
    console.log("Solicitud POST recibida para /api/generate-case-study");
    
    // Validar clave API
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({
        result: '',
        success: false,
      }, { status: 500 });
    }
    
    // Parsear request
    const { profession, description, difficulty = 'intermediate' }: GenerateCaseStudyRequest = await req.json();
    
    // Validar parámetros requeridos
    if (!profession || !description) {
      return NextResponse.json({
        result: 'Profesión y descripción son requeridas',
        success: false,
      }, { status: 400 });
    }

    // Construir prompt específico para caso de estudio
    const prompt = CaseStudyService.buildCaseStudyPrompt(profession, description, difficulty);
    
    // Crear mensajes para el chat service
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt
      }
    ];
    
    console.log("Generando caso de estudio para:", { profession, description, difficulty });
    
    // Usar el ChatService existente
    const response = await ChatService.processChat(messages);
    
    console.log("Caso de estudio generado exitosamente");
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error en generate-case-study:", error);
    return NextResponse.json({
      result: 'Error interno del servidor al generar caso de estudio',
      success: false,
    }, { status: 500 });
  }
}