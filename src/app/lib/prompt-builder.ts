
import { Employee, BaseMetrics } from "@/app/Interfas/Interfaces";

export class PromptBuilder {
  static readonly SYSTEM_PROMPT = `Eres un experto en análisis predictivo de recursos humanos con especialización en:
- Predicción de rotación de personal
- Análisis de productividad y tendencias
- Identificación de factores de riesgo
- Generación de recomendaciones accionables

Analiza los datos proporcionados y genera insights basados en machine learning y estadísticas.`;

  static buildAnalysisPrompt(
    deptName: string,
    employees: Employee[],
    baseMetrics: BaseMetrics,
    analysisType: string,
    timeframe: string,
    habilidadesRequeridas: { nombre: string; nivel: string }[],
  ): string {
    return `
Analiza el siguiente departamento de RRHH y proporciona insights predictivos avanzados:

**Departamento:** ${deptName}
**Número de empleados:** ${employees.length}
**Marco temporal:** ${timeframe}
**Tipo de análisis:** ${analysisType}

**Métricas calculadas:**
- Productividad promedio: ${baseMetrics.avgProductivity}/10
- Satisfacción promedio: ${baseMetrics.avgSatisfaction}/10
- Score de riesgo de rotación: ${baseMetrics.turnoverScore}%
- Nivel de riesgo: ${baseMetrics.turnoverRisk}
- Tendencia de productividad: ${baseMetrics.productivityTrend}
- Aumento de licencias: ${baseMetrics.licenseIncrease.toFixed(1)}%

**Habilidades requeridas del departamento:**
${habilidadesRequeridas.length > 0 
  ? habilidadesRequeridas.map(h => `- ${h.nombre} (nivel: ${h.nivel})`).join("\n")
  : "⚠️ No se definieron habilidades requeridas en la organización"}

**Datos detallados de empleados:**
${JSON.stringify(
  employees.map(e => ({
    id: e.id,
    productivityScore: e.productivityScore,
    satisfaction: e.satisfactionMetrics,
    licenses: e.licenses,
    absences: e.absences,
    softSkills: e.softSkills.map(s => `${s.nombre}: ${s.level}/10`),
    technicalSkills: e.technicalSkills?.map(t => `${t.nombre}: ${t.level}/10`)
  })),
  null,
  2
)}

Por favor, proporciona tu análisis en el siguiente formato JSON:

{
  "predictedPeaks": ["Predicción 1", "Predicción 2"],
  "recommendations": ["Recomendación específica 1", "Recomendación 2"],
  "keyInsights": ["Insight profundo 1", "Insight 2"],
  "riskFactors": ["Factor de riesgo identificado 1", "Factor 2"],
  "skillsGap": ["Gap de habilidades 1", "Gap 2"], // 🆕 opcional
  "aiConfidence": 0.85
}

Enfócate en:
1. Predicciones específicas basadas en patrones detectados
2. Recomendaciones accionables y priorizadas
3. Insights que no son obvios en los números
4. Factores de riesgo emergentes u ocultos
5. Brechas de habilidades (comparando requeridas vs actuales del equipo)
`;
}
  static buildExecutiveSummaryPrompt(
    totalDepartments: number,
    totalEmployees: number,
    highRiskDepartments: number,
    avgProductivity: number,
  ): string {
    return `
Genera un resumen ejecutivo breve (máximo 150 palabras) sobre el análisis predictivo de RRHH:

**Departamentos analizados:** ${totalDepartments}
**Total empleados:** ${totalEmployees}
**Departamentos en riesgo alto/crítico:** ${highRiskDepartments}
**Productividad promedio general:** ${avgProductivity.toFixed(1)}/10

Enfócate en los 3 puntos más críticos que requieren atención inmediata de la dirección.
`;
  }
}