/* eslint-disable @typescript-eslint/no-explicit-any */


import { GeminiService } from "./ai-service";
import { ResponseFormatter } from "./response-formatter";
import { Employee,DepartmentAnalysis,skillsGap  } from "@/app/Interfas/Interfaces";
import { MetricsCalculator } from "./metrics-calculator";
import { PromptBuilder } from "./prompt-builder";
import { parseAIResponse } from "./ai-response-parser";
import { INTEGRATED_ORG_DATA } from "@/app/api/prueba2";
import { Tool } from "ai";

export class DepartmentAnalyzer {
  constructor(
    private mcpTools: Record<string, Tool<any, any>>,
    private orgData: typeof INTEGRATED_ORG_DATA
  ) {}



  async analyzeAll(
    departmentGroups: Record<string, Employee[]>,
    analysisType: string,
    timeframe: string,
  ): Promise<DepartmentAnalysis[]> {
    const analyses: DepartmentAnalysis[] = [];

    for (const [deptName, employees] of Object.entries(departmentGroups)) {
      console.log(`\n🔍 Analizando departamento: ${deptName}`);
      
      const analysis = await this.analyzeDepartment(
        deptName,
        employees,
        analysisType,
        timeframe
      );

      analyses.push(analysis);
    }

    return analyses;
  }

  private async analyzeDepartment(
    deptName: string,
    employees: Employee[],
    analysisType: string,
    timeframe: string
  ): Promise<DepartmentAnalysis> {
    const calculator = new MetricsCalculator();
    const baseMetrics = calculator.calculate(employees);
  const deptInfo = this.orgData.find(d => d.nombre === deptName);
  const habilidadesRequeridas = deptInfo?.habilidades_requeridas || [];

    // 2. Recolectar habilidades reales de los empleados
    const habilidadesEmpleados = employees.flatMap(emp => [
    ...emp.softSkills.map(s => s.nombre),
    ...emp.technicalSkills.map(t => t.nombre)
  ]);

    // 3. Detectar brechas (skillsGap)
     const skillsGap = habilidadesRequeridas.filter(
    h => !habilidadesEmpleados.includes(h.nombre)
  );
    try {
      const prompt = PromptBuilder.buildAnalysisPrompt(
        deptName,
        employees,
        baseMetrics,
        analysisType,
        timeframe,
        habilidadesRequeridas,
      );

      const aiResponse = await GeminiService.generateResponse(
        [
          {
            role: "system",
            content: PromptBuilder.SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ],
        this.mcpTools
      );

      const formattedResponse = ResponseFormatter.formatResponse(
        aiResponse.text,
        aiResponse.toolCalls,
        aiResponse.toolResults
      );

      const aiInsights = parseAIResponse(formattedResponse.result);

      return this.mergeAnalysis(deptName, employees, baseMetrics, aiInsights, skillsGap);

    } catch (error) {
      console.error(`Error en análisis IA para ${deptName}:`, error);
      return this.createFallbackAnalysis(deptName, employees, baseMetrics, skillsGap);
    }
  }

  private mergeAnalysis(
    deptName: string,
    employees: Employee[],
    baseMetrics: any,
    aiInsights: any,
    skillsGap: skillsGap[]
  ): DepartmentAnalysis {
    return {
      name: deptName,
      employees: employees.length,
      avgProductivity: baseMetrics.avgProductivity,
      avgSatisfaction: baseMetrics.avgSatisfaction,
      turnoverRisk: baseMetrics.turnoverRisk,
      turnoverScore: baseMetrics.turnoverScore,
      productivityTrend: baseMetrics.productivityTrend,
      predictedPeaks: aiInsights.predictedPeaks || baseMetrics.predictedPeaks,
      recommendations: aiInsights.recommendations || baseMetrics.recommendations,
      keyInsights: aiInsights.keyInsights || baseMetrics.keyInsights,
      riskFactors: aiInsights.riskFactors || baseMetrics.riskFactors,
      color: baseMetrics.color,
      skillsGap
    };
  }


  private createFallbackAnalysis(
    deptName: string,
    employees: Employee[],
    baseMetrics: any,
    skillsGap:skillsGap[]
  ): DepartmentAnalysis {
    return {
      name: deptName,
      employees: employees.length,
      ...baseMetrics,
      skillsGap
    };
  }
}