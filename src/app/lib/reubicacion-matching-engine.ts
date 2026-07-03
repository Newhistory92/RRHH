/**
 * Motor de Matching para Reubicacion Inteligente (subsistema 3).
 *
 * Determina, para un empleado que solicito reubicacion, cual es la mejor
 * oficina destino (excluyendo la actual) en base a:
 * - Skill match (70%): que porcentaje de las habilidades requeridas de la
 *   oficina candidata posee el empleado.
 * - Deficit de personal (30%): que porcentaje de esas habilidades requeridas
 *   NO esta cubierto por la dotacion actual de esa oficina (prioriza mandar
 *   gente a donde falta cobertura).
 */

import type { OrgAnalysisEmployee, OrgAnalysisDepartment } from "@/app/Interfas/Interfaces";

const SKILL_MATCH_WEIGHT = 0.7;
const DEFICIT_WEIGHT = 0.3;

interface CandidateOffice {
  officeId: number;
  officeNombre: string;
  departmentId: number;
  departmentNombre: string;
  habilidadesRequeridas: { nombre: string; level: number }[];
}

export interface MatchResult {
  officeIdSugerido: number | null;
  officeNombreSugerido: string | null;
  departmentIdSugerido: number | null;
  departmentNombreSugerido: string | null;
  scoreCompatibilidad: number;
  matchedSkills: string[];
  missingSkills: string[];
  deficitSkills: string[];
}

function employeeSkillNames(employee: OrgAnalysisEmployee): Set<string> {
  const names = new Set<string>();
  for (const s of employee.softSkills) names.add(s.nombre.toLowerCase());
  for (const t of employee.technicalSkills) names.add(t.nombre.toLowerCase());
  return names;
}

function listCandidateOffices(
  departments: OrgAnalysisDepartment[],
  excludeOfficeId: number | null
): CandidateOffice[] {
  const candidates: CandidateOffice[] = [];
  for (const dept of departments) {
    for (const office of dept.offices) {
      if (office.id === excludeOfficeId) continue;
      candidates.push({
        officeId: office.id,
        officeNombre: office.nombre,
        departmentId: dept.id,
        departmentNombre: dept.nombre,
        habilidadesRequeridas: office.habilidades_requeridas,
      });
    }
  }
  return candidates;
}

type ScoreDetails = Pick<
  MatchResult,
  "scoreCompatibilidad" | "matchedSkills" | "missingSkills" | "deficitSkills"
>;

function scoreCandidate(
  candidate: CandidateOffice,
  empSkillNames: Set<string>,
  allEmployees: OrgAnalysisEmployee[]
): ScoreDetails {
  const required = candidate.habilidadesRequeridas;

  if (required.length === 0) {
    // Sin requisitos definidos para esta oficina: no se puede evaluar match
    // ni deficit, se usa un score neutral para no penalizar ni favorecer.
    return { scoreCompatibilidad: 50, matchedSkills: [], missingSkills: [], deficitSkills: [] };
  }

  const matchedSkills = required.filter((r) => empSkillNames.has(r.nombre.toLowerCase())).map((r) => r.nombre);
  const missingSkills = required.filter((r) => !empSkillNames.has(r.nombre.toLowerCase())).map((r) => r.nombre);
  const skillMatchRatio = matchedSkills.length / required.length;

  const staffSkillNames = new Set<string>();
  for (const emp of allEmployees) {
    if (emp.officeId !== candidate.officeId) continue;
    for (const s of emp.softSkills) staffSkillNames.add(s.nombre.toLowerCase());
    for (const t of emp.technicalSkills) staffSkillNames.add(t.nombre.toLowerCase());
  }
  const deficitSkills = required.filter((r) => !staffSkillNames.has(r.nombre.toLowerCase())).map((r) => r.nombre);
  const deficitRatio = deficitSkills.length / required.length;

  const scoreCompatibilidad = Math.round(
    skillMatchRatio * SKILL_MATCH_WEIGHT * 100 + deficitRatio * DEFICIT_WEIGHT * 100
  );

  return { scoreCompatibilidad, matchedSkills, missingSkills, deficitSkills };
}

export function findBestRelocationMatch(
  employee: OrgAnalysisEmployee,
  allEmployees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[]
): MatchResult {
  const candidates = listCandidateOffices(departments, employee.officeId);
  const empSkillNames = employeeSkillNames(employee);

  let best: MatchResult | null = null;

  for (const candidate of candidates) {
    const scored = scoreCandidate(candidate, empSkillNames, allEmployees);
    if (!best || scored.scoreCompatibilidad > best.scoreCompatibilidad) {
      best = {
        officeIdSugerido: candidate.officeId,
        officeNombreSugerido: candidate.officeNombre,
        departmentIdSugerido: candidate.departmentId,
        departmentNombreSugerido: candidate.departmentNombre,
        ...scored,
      };
    }
  }

  return (
    best ?? {
      officeIdSugerido: null,
      officeNombreSugerido: null,
      departmentIdSugerido: null,
      departmentNombreSugerido: null,
      scoreCompatibilidad: 0,
      matchedSkills: [],
      missingSkills: [],
      deficitSkills: [],
    }
  );
}
