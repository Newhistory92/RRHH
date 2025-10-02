

import { GeminiService } from "./ai-service";
import { ResponseFormatter } from "./response-formatter";
import { DepartmentAnalysis } from "@/app/Interfas/Interfaces";
import { PromptBuilder } from "./prompt-builder";
import { Tool } from "ai";
export class ExecutiveSummaryGenerator {
  constructor(
    private mcpTools: Record<string, Tool>,) {}

  async generate(analyses: DepartmentAnalysis[]): Promise<string> {
    const totalEmployees = analyses.reduce((sum, d) => sum + d.employees, 0);
    const highRiskDepartments = analyses.filter(
      d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico'
    ).length;
    const avgProductivity = analyses.reduce(
      (sum, d) => sum + d.avgProductivity,
      0
    ) / analyses.length;

    const prompt = PromptBuilder.buildExecutiveSummaryPrompt(
      analyses.length,
      totalEmployees,
      highRiskDepartments,
      avgProductivity
    );

    try {
      const aiResponse = await GeminiService.generateResponse(
        [
          {
            role: "system",
            content: "Eres un consultor senior de RRHH. Genera resúmenes ejecutivos concisos."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        this.mcpTools
      );

      const formatted = ResponseFormatter.formatResponse(
        aiResponse.text,
        aiResponse.toolCalls,
        aiResponse.toolResults
      );

      return formatted.result;

    } catch (error) {
      console.error("Error generando resumen ejecutivo:", error);
      return this.createFallbackSummary(analyses.length, highRiskDepartments);
    }
  }

  private createFallbackSummary(
    totalDepartments: number,
    highRiskDepartments: number
  ): string {
    return `Análisis completado de ${totalDepartments} departamentos. Se detectaron ${highRiskDepartments} departamentos con riesgo alto de rotación que requieren atención inmediata.`;
  }
}