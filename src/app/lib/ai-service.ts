import { google } from "@ai-sdk/google";
import { generateText, Tool } from "ai";
import { ChatMessage} from "@/app/Interfas/Interfaces";

export class GeminiService {
  private static readonly MODEL_NAME = "gemini-2.5-flash";
  private static readonly DEFAULT_TEMPERATURE = 0.7;

  /**
   * Genera una respuesta usando el modelo Gemini con herramientas
   */
  static async generateResponse(
    messages: ChatMessage[], 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: Record<string, Tool<any, any>> = {}
  ) {
    this.validateApiKey();

    const messagesWithLanguage = this.addLanguageInstruction(messages);

    console.log(`Usando modelo: ${this.MODEL_NAME}`);
    console.log("Generando texto con herramientas...");

    const result = await generateText({
      model: google(this.MODEL_NAME),
      messages: messagesWithLanguage,
      tools,
      temperature: this.DEFAULT_TEMPERATURE,
    });

    console.log("Generación completada");
    console.log("Llamadas a herramientas:", result.toolCalls);
    console.log("Resultados de herramientas:", result.toolResults);

    return result;
  }

  private static validateApiKey(): void {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error("Falta la variable de entorno GOOGLE_GENERATIVE_AI_API_KEY");
    }
  }

  private static addLanguageInstruction(messages: ChatMessage[]): ChatMessage[] {
    return [
      { 
        role: "system" as const, 
        content: "Responde siempre en español, sin importar el idioma de la consulta." 
      },
      ...messages
    ];
  }
}