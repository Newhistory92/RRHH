/**
 * Prompt Builder para la recomendacion de reubicacion (subsistema 3).
 * El motor determinista (reubicacion-matching-engine.ts) ya calculo el
 * destino y el score; Gemini solo redacta la explicacion en espanol.
 */

import type { OrgAnalysisEmployee } from "@/app/Interfas/Interfaces";
import type { MatchResult } from "./reubicacion-matching-engine";

export interface RecomendacionIA {
  explicacion: string;
  beneficios: string[];
  riesgos: string[];
}

export function buildRecomendacionPrompt(
  employee: OrgAnalysisEmployee,
  motivo: string,
  match: MatchResult
): string {
  return `
Eres un consultor de Recursos Humanos. Redacta en español una recomendación de
reubicación interna para RRHH, basándote EXCLUSIVAMENTE en los siguientes datos
YA CALCULADOS (no inventes información, especialmente NO menciones "experiencia
previa" porque ese dato no está disponible):

Empleado: ${employee.name}
Motivo de la solicitud: ${motivo}
Oficina actual: ${employee.officeName ?? "sin oficina asignada"} (${employee.departmentName})
Oficina destino sugerida: ${match.officeNombreSugerido ?? "ninguna disponible"} (${match.departmentNombreSugerido ?? "-"})
Score de compatibilidad: ${match.scoreCompatibilidad}%
Habilidades que coinciden: ${match.matchedSkills.join(", ") || "ninguna"}
Habilidades que le faltan: ${match.missingSkills.join(", ") || "ninguna"}
Habilidades con déficit de personal en el destino: ${match.deficitSkills.join(", ") || "ninguna"}
${match.capacidad != null ? `Vacantes disponibles en el destino: ${match.vacantes} de ${match.capacidad} (capacidad requerida configurada).` : "Capacidad requerida del destino: no configurada (dato no disponible)."}

Responde ESTRICTAMENTE con este JSON:
{
  "explicacion": "1-2 oraciones explicando por que se recomienda (o no) este destino, mencionando el % de compatibilidad y el deficit de personal si aplica. Si el score es bajo (menor a 70), se honesto y dilo explicitamente.",
  "beneficios": ["beneficio esperado 1", "beneficio esperado 2"],
  "riesgos": ["riesgo 1", "riesgo 2"]
}

REGLAS:
- Responde SOLO con el JSON, sin texto adicional antes ni después.
- Basa todo EXCLUSIVAMENTE en los datos provistos arriba.
- Entre 2 y 4 items en "beneficios" y entre 2 y 4 en "riesgos".
- Todo en español.
`;
}

export function buildFallbackRecomendacion(match: MatchResult): RecomendacionIA {
  const destino = match.officeNombreSugerido;

  if (!destino) {
    return {
      explicacion: `No se encontró un destino con datos suficientes para recomendar una reubicación (score ${match.scoreCompatibilidad}%).`,
      beneficios: [],
      riesgos: ["Sin datos suficientes para evaluar el traslado"],
    };
  }

  const vacantesTexto =
    match.capacidad != null && match.vacantes != null && match.vacantes > 0
      ? ` Además, tiene ${match.vacantes} vacante${match.vacantes === 1 ? "" : "s"} disponible${
          match.vacantes === 1 ? "" : "s"
        } sobre una capacidad de ${match.capacidad}.`
      : "";

  const explicacion =
    match.scoreCompatibilidad >= 70
      ? `Se recomienda trasladar al empleado a ${destino} debido a que posee un ${match.scoreCompatibilidad}% de compatibilidad con las competencias requeridas${
          match.deficitSkills.length > 0
            ? " y actualmente existe un déficit de personal especializado en esa oficina"
            : ""
        }.${vacantesTexto}`
      : `La compatibilidad con ${destino} es baja (${match.scoreCompatibilidad}%): se recomienda evaluar con cautela antes de aprobar este traslado.${vacantesTexto}`;

  return {
    explicacion,
    beneficios: ["Mejor aprovechamiento del talento", "Cobertura de vacantes", "Mayor productividad"],
    riesgos: ["Pérdida de conocimiento en la oficina actual", "Necesidad de reemplazo", "Impacto operativo temporal"],
  };
}
