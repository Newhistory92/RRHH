/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatResponse }  from "@/app/Interfas/Interfaces";

export class ResponseFormatter {
  /**
   * Formatea la respuesta basada en si hay llamadas a herramientas o no
   */
  static formatResponse(
    text: string,
    toolCalls?: any[],
    toolResults?: any[]
  ): ChatResponse {
    const toolCall = toolCalls?.[0];
    const toolResult = toolResults?.[0];

    if (toolCall && toolResult) {
      return this.formatToolResponse(toolCall, toolResult);
    }

    return this.formatTextResponse(text);
  }

  private static formatToolResponse(toolCall: any, toolResult: any): ChatResponse {
    console.log(`Se encontró llamada a herramienta ${toolCall.toolName} y su resultado`);
    console.log(`Resultado completo de la herramienta:`, JSON.stringify(toolResult, null, 2));

    const formattedResult = this.extractToolResult(toolResult);
    console.log("Devolviendo resultado formateado de la herramienta:", formattedResult);

    return {
      result: formattedResult,
      toolName: toolCall.toolName,
      success: !toolResult.output?.isError
    };
  }

  private static formatTextResponse(text: string): ChatResponse {
    console.log("No se detectaron llamadas a herramientas, devolviendo texto directamente:", text);
    
    return {
      result: text,
      success: true
    };
  }

  private static extractToolResult(toolResult: any): string {
    // Verificar si hay un error
    if (toolResult.output?.isError) {
      return this.formatErrorResult(toolResult);
    }

    // Intentar extraer el contenido del resultado
    const output = toolResult.output;
    
    // Si output.content es un array
    if (output?.content && Array.isArray(output.content)) {
      const contentArray = output.content;
      
      if (contentArray.length > 0) {
        // Si el primer elemento tiene texto
        if (contentArray[0]?.text) {
          return contentArray[0].text;
        }
        
        // Si el contenido es un array de strings o objetos
        return contentArray.map((item: { text: string; type: string; }) => {
          if (typeof item === 'string') return item;
          if (item?.text) return item.text;
          if (item?.type === 'text' && item?.text) return item.text;
          return JSON.stringify(item);
        }).join('\n');
      }
    }

    // Si output tiene texto directo
    if (output?.text) {
      return output.text;
    }

    // Si hay contenido directo en result (formato anterior)
    if (toolResult.result) {
      if (typeof toolResult.result === 'string') {
        return toolResult.result;
      }
      
      if (toolResult.result?.content?.[0]?.text) {
        return toolResult.result.content[0].text;
      }
    }

    // Fallback: convertir todo a JSON
    return JSON.stringify(output || toolResult, null, 2);
  }

  private static formatErrorResult(toolResult: any): string {
    const output = toolResult.output;
    
    // Intentar extraer mensaje de error del contenido
    if (output?.content && Array.isArray(output.content)) {
      const errorMessages = output.content.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.text) return item.text;
        if (item?.message) return item.message;
        return JSON.stringify(item);
      }).join('\n');
      
      return `Error en la herramienta: ${errorMessages}`;
    }

    return `Error en la herramienta: ${JSON.stringify(output, null, 2)}`;
  }
}