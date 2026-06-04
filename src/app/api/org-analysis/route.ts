/**
 * API Route: /api/org-analysis
 *
 * Orquesta el análisis organizacional completo:
 * 1. Obtiene datos reales del backend FastAPI (/rrhh/org-analysis-data)
 * 2. Ejecuta los 4 análisis locales (skill gap, misalignment, mobility, SPOF)
 * 3. Envía contexto a Gemini para generar resumen ejecutivo + plan de acción
 * 4. Retorna el reporte completo estructurado
 */

import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/app/lib/org-analysis-engine";
import { buildOrgReportPrompt, buildAnalysisContext } from "@/app/lib/org-report-prompt";
import { GeminiService } from "@/app/lib/ai-service";
import type { OrgAnalysisReport } from "@/app/Interfas/Interfaces";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    console.log("🧠 Iniciando análisis organizacional con IA...");

    // ── 1. Obtener token del header (forward desde el cliente) ──────────────
    const authHeader = request.headers.get("authorization") || "";

    // ── 2. Obtener datos reales del backend ─────────────────────────────────
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
    console.log(`📊 Datos recibidos: ${employees.length} empleados, ${departments.length} departamentos`);

    // ── 3. Ejecutar análisis locales ────────────────────────────────────────
    const analysisResults = runFullAnalysis(employees, departments);
    console.log(`🔍 Análisis completado:`);
    console.log(`   - ${analysisResults.skillGaps.length} brechas de habilidades`);
    console.log(`   - ${analysisResults.misaligned.length} empleados subutilizados`);
    console.log(`   - ${analysisResults.relocationProposals.length} propuestas de reubicación`);
    console.log(`   - ${analysisResults.singlePointsOfFailure.length} puntos únicos de fallo`);

    // ── 4. Generar reporte con IA ───────────────────────────────────────────
    const context = buildAnalysisContext(employees, analysisResults, departments.length);
    const prompt = buildOrgReportPrompt(context);

    let executiveSummary = "";
    let actionPlan: string[] = [];

    try {
      const aiResponse = await GeminiService.generateResponse([
        {
          role: "system",
          content: "Eres un consultor senior de RRHH. Genera reportes ejecutivos en español basados en datos reales. Responde SOLO con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      // Parsear la respuesta de Gemini
      const responseText = aiResponse.text || "";
      // Extraer JSON de la respuesta (puede venir envuelto en ```json ... ```)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        executiveSummary = parsed.executiveSummary || "";
        actionPlan = parsed.actionPlan || [];
      }

      console.log("✅ Reporte IA generado correctamente");
    } catch (aiError) {
      console.error("⚠️ Error en IA, usando fallback:", aiError);
      // Fallback sin IA
      const highRisk = analysisResults.riskHeatMap.filter(r => r.riskLevel === "Alto").length;
      executiveSummary = `Análisis organizacional completado para ${employees.length} empleados en ${departments.length} departamentos. Se detectaron ${analysisResults.skillGaps.length} brechas de habilidades, ${analysisResults.singlePointsOfFailure.length} puntos únicos de fallo y ${highRisk} departamentos en riesgo alto. Se sugieren ${analysisResults.relocationProposals.length} reubicaciones internas para optimizar la distribución del talento.`;
      actionPlan = [
        "Revisar las brechas de habilidades críticas en los departamentos de alto riesgo",
        "Evaluar las propuestas de reubicación interna para cubrir vacíos de competencias",
        "Implementar plan de capacitación cruzada para mitigar puntos únicos de fallo",
        "Realizar encuestas de satisfacción en departamentos con indicadores bajos",
        "Programar revisión trimestral del organigrama con este análisis como baseline"
      ];
    }

    // ── 5. Ensamblar reporte final ──────────────────────────────────────────
    const report: OrgAnalysisReport = {
      executiveSummary,
      riskHeatMap: analysisResults.riskHeatMap,
      relocationProposals: analysisResults.relocationProposals,
      actionPlan,
      skillGaps: analysisResults.skillGaps,
      singlePointsOfFailure: analysisResults.singlePointsOfFailure,
      analysisDate: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: report,
      metadata: {
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        analysisDate: report.analysisDate,
      },
    });

  } catch (error) {
    console.error("❌ Error en análisis organizacional:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
