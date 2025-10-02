
import { NextRequest, NextResponse } from "next/server";
import { MCPClientService } from "@/app/lib/mcp-client";
import { PredictiveAnalysisSchema } from "@/app/lib/schemasPredictive";
import { DepartmentAnalyzer } from "@/app/lib/department-analyzer";
import { ExecutiveSummaryGenerator } from "@/app/lib/executive-summary-generator";
import { groupEmployeesByDepartment } from "@/app/lib/data-grouping";
import { INTEGRATED_ORG_DATA } from "@/app/api/prueba2";
import { Tool } from "ai";

export async function POST(request: NextRequest) {
  let mcpClient = null;

  try {
    console.log("📊 Iniciando análisis predictivo con IA...");

    const body = await request.json();
    console.log("Datos recibidos para análisis:", body);
    const validatedData = PredictiveAnalysisSchema.parse(body);
    const { employees, analysisType, timeframe } = validatedData;

    console.log(`Analizando ${employees.length} empleados`);
    console.log(`Tipo de análisis: ${analysisType}, Marco temporal: ${timeframe}`);

    // Crear cliente MCP
    mcpClient = await MCPClientService.createFilesystemClient();
    if (!mcpClient) {
      console.warn("⚠️ Cliente MCP no disponible, usando análisis local");
    }

    const mcpTools: Record<string, Tool> = mcpClient ? await mcpClient.tools() : {};

    // Agrupar empleados por departamento
    const departmentGroups = groupEmployeesByDepartment(employees);

    // Analizar cada departamento
    const analyzer = new DepartmentAnalyzer(mcpTools  , INTEGRATED_ORG_DATA);
    const departmentAnalyses = await analyzer.analyzeAll(
      departmentGroups,
      analysisType,
      timeframe
    );

    // Generar resumen ejecutivo
    const summaryGenerator = new ExecutiveSummaryGenerator(mcpTools);
    const executiveSummary = await summaryGenerator.generate(departmentAnalyses);

    console.log("✅ Análisis predictivo completado");

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentAnalyses,
        executiveSummary,
        metadata: {
          totalEmployees: employees.length,
          departmentsAnalyzed: departmentAnalyses.length,
          highRiskDepartments: departmentAnalyses.filter(
            d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico'
          ).length,
          analysisDate: new Date().toISOString(),
          analysisType,
          timeframe
          
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en análisis predictivo:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido en el análisis"
      },
      { status: 500 }
    );

  } finally {
    if (mcpClient) {
      try {
        await mcpClient.close();
        console.log("Cliente MCP cerrado correctamente");
      } catch (error) {
        console.error("Error cerrando cliente MCP:", error);
      }
    }
  }
}