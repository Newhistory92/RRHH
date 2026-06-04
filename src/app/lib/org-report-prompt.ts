/**
 * Prompt Builder para el Reporte Ejecutivo Organizacional
 * Envía los resultados de los 4 análisis a Gemini para generar el reporte en español.
 */

import type {
  SkillGapEntry,
  RelocationProposal,
  SPOFEntry,
  RiskHeatMapEntry,
  OrgAnalysisEmployee,
} from "@/app/Interfas/Interfaces";

interface AnalysisContext {
  totalEmployees: number;
  totalDepartments: number;
  skillGaps: SkillGapEntry[];
  relocationProposals: RelocationProposal[];
  singlePointsOfFailure: SPOFEntry[];
  riskHeatMap: RiskHeatMapEntry[];
  misalignedEmployees: { name: string; currentDept: string; unusedSkills: string[] }[];
  avgProductivity: number;
  avgSatisfaction: number;
}

export function buildOrgReportPrompt(ctx: AnalysisContext): string {
  return `
Eres un consultor senior de Recursos Humanos experto en análisis organizacional.
Genera un REPORTE PROFESIONAL en español basado en los siguientes datos REALES de la organización.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DATOS GENERALES:
- Total de empleados: ${ctx.totalEmployees}
- Total de departamentos: ${ctx.totalDepartments}
- Productividad promedio: ${ctx.avgProductivity.toFixed(1)}/10
- Satisfacción promedio: ${ctx.avgSatisfaction.toFixed(1)}/10

📌 MAPA DE CALOR DE RIESGOS (ya calculado):
${ctx.riskHeatMap.map(r => `• ${r.department}: ${r.riskLevel} — ${r.mainRisk} (${r.employeeCount} empleados)`).join("\n") || "No se detectaron riesgos significativos."}

🔍 BRECHAS DE HABILIDADES DETECTADAS:
${ctx.skillGaps.slice(0, 15).map(g => `• ${g.department}: Falta "${g.missingSkill}" — ${g.riskDescription}`).join("\n") || "No se detectaron brechas de habilidades."}

👤 EMPLEADOS CON TALENTO SUBUTILIZADO:
${ctx.misalignedEmployees.slice(0, 10).map(m => `• ${m.name} (${m.currentDept}): skills sin usar → ${m.unusedSkills.slice(0, 3).join(", ")}`).join("\n") || "No se detectaron casos de subutilización."}

🔄 PROPUESTAS DE REUBICACIÓN (ya calculadas):
${ctx.relocationProposals.map(p => `• ${p.employeeName}: ${p.currentDept} → ${p.suggestedDept} — ${p.reason}`).join("\n") || "No se generaron propuestas de reubicación."}

⚠️ PUNTOS ÚNICOS DE FALLO:
${ctx.singlePointsOfFailure.slice(0, 10).map(s => `• ${s.department}: "${s.criticalSkill}" solo la posee ${s.soleHolder}`).join("\n") || "No se detectaron puntos únicos de fallo."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

En base a estos datos, genera tu respuesta ESTRICTAMENTE en el siguiente formato JSON:

{
  "executiveSummary": "Un resumen ejecutivo de 150-200 palabras sobre la salud organizacional general. Debe incluir hallazgos clave, nivel general de riesgo, y los 3 puntos más críticos.",
  "actionPlan": [
    "Paso 1: acción concreta e inmediata...",
    "Paso 2: acción concreta...",
    "Paso 3: acción concreta...",
    "Paso 4: acción concreta...",
    "Paso 5: acción concreta..."
  ]
}

REGLAS:
- Responde SOLO con el JSON, sin texto adicional antes ni después.
- El resumen ejecutivo debe ser profesional, útil para un director de RRHH.
- El plan de acción debe tener entre 3 y 5 pasos concretos, priorizados por urgencia.
- Basa tus conclusiones EXCLUSIVAMENTE en los datos proporcionados, no inventes información.
- Todo en español.
`;
}

export function buildAnalysisContext(
  employees: OrgAnalysisEmployee[],
  analysisResults: {
    skillGaps: SkillGapEntry[];
    relocationProposals: RelocationProposal[];
    singlePointsOfFailure: SPOFEntry[];
    riskHeatMap: RiskHeatMapEntry[];
    misaligned: { employee: OrgAnalysisEmployee; unusedSkills: string[]; currentDept: string }[];
  },
  totalDepartments: number
): AnalysisContext {
  const avgProductivity = employees.length > 0
    ? employees.reduce((s, e) => s + (e.productivityScore || 0), 0) / employees.length
    : 0;

  const avgSatisfaction = employees.length > 0
    ? employees.reduce((s, e) => s + (e.satisfactionMetrics?.overallSatisfaction || 0), 0) / employees.length
    : 0;

  return {
    totalEmployees: employees.length,
    totalDepartments,
    skillGaps: analysisResults.skillGaps,
    relocationProposals: analysisResults.relocationProposals,
    singlePointsOfFailure: analysisResults.singlePointsOfFailure,
    riskHeatMap: analysisResults.riskHeatMap,
    misalignedEmployees: analysisResults.misaligned.map(m => ({
      name: m.employee.name,
      currentDept: m.currentDept,
      unusedSkills: m.unusedSkills,
    })),
    avgProductivity,
    avgSatisfaction,
  };
}
