
import { NextRequest, NextResponse } from "next/server";
import { MCPClientService } from "@/app/lib/mcp-client";
import { PredictiveAnalysisSchema } from "@/app/lib/schemasPredictive";
import { DepartmentAnalyzer } from "@/app/lib/department-analyzer";
import { ExecutiveSummaryGenerator } from "@/app/lib/executive-summary-generator";
import { groupEmployeesByDepartment } from "@/app/lib/data-grouping";
import { Tool } from "ai";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  let mcpClient = null;

  try {
    console.log("📊 Iniciando análisis predictivo con IA...");

    const body = await request.json();
    console.log("Datos recibidos para análisis:", body);
    const validatedData = PredictiveAnalysisSchema.parse(body);
    const { analysisType, timeframe } = validatedData;

    // ── Obtener token del header (forward desde el cliente) ──────────────
    const authHeader = request.headers.get("authorization") || "";

    // ── Obtener datos reales del backend ─────────────────────────────────
    const backendResponse = await fetch(`${BACKEND_URL}/rrhh/org-analysis-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      console.error("❌ Error obteniendo datos del backend:", errorBody);
      throw new Error(`Backend respondió con status ${backendResponse.status}`);
    }

    const { employees, departments } = await backendResponse.json();
    console.log(`📊 Datos reales recibidos: ${employees.length} empleados, ${departments.length} departamentos`);

    console.log(`Tipo de análisis: ${analysisType}, Marco temporal: ${timeframe}`);

    // Crear cliente MCP
    mcpClient = await MCPClientService.createFilesystemClient();
    if (!mcpClient) {
      console.warn("⚠️ Cliente MCP no disponible, usando análisis local");
    }

    const mcpTools: Record<string, Tool> = mcpClient
  ? (await mcpClient.tools()) as Record<string, Tool>
  : {};


    // Agrupar empleados por departamento
    const departmentGroups = groupEmployeesByDepartment(employees);

    // Analizar cada departamento con datos reales del backend
    const analyzer = new DepartmentAnalyzer(mcpTools, departments);
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