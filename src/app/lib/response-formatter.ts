import { ToolCall, ToolResult, ChatResponse }  from "@/app/Interfas/Interfaces";

export class ResponseFormatter {
  /**
   * Formatea la respuesta basada en si hay llamadas a herramientas o no
   */
  static formatResponse(
    text: string,
    toolCalls?: ToolCall[],
    toolResults?: ToolResult[]
  ): ChatResponse {
    const toolCall = toolCalls?.[0];
    const toolResult = toolResults?.[0];

    if (toolCall && toolResult) {
      return this.formatToolResponse(toolCall, toolResult);
    }

    return this.formatTextResponse(text);
  }

  private static formatToolResponse(toolCall: ToolCall, toolResult: ToolResult): ChatResponse {
    console.log(`Se encontró llamada a herramienta ${toolCall.toolName} y su resultado`);
    console.log(`Resultado de la herramienta:`, toolResult.result);

    const formattedResult = this.extractToolResult(toolResult);
    console.log("Devolviendo resultado formateado de la herramienta:", formattedResult);

    return {
      result: formattedResult,
      toolName: toolCall.toolName,
      success: true
    };
  }

  private static formatTextResponse(text: string): ChatResponse {
    console.log("No se detectaron llamadas a herramientas, devolviendo texto directamente:", text);
    
    return {
      result: text,
      success: true
    };
  }

  private static extractToolResult(toolResult: ToolResult): string {
    if (typeof toolResult.result === 'string') {
      return toolResult.result;
    }

    if (typeof toolResult.result === 'object' && toolResult.result?.content?.[0]?.text) {
      return toolResult.result.content[0].text;
    }

    return JSON.stringify(toolResult.result);
  }
}