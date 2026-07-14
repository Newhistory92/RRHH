/**
 * Motor de Matching para Reubicacion Inteligente (subsistema 3).
 *
 * Determina, para un empleado que solicito reubicacion, cual es la mejor
 * oficina destino (excluyendo la actual) en base a:
 * - Skill match (55%): que porcentaje de las habilidades requeridas de la
 *   oficina candidata posee el empleado.
 * - Deficit de personal por skills (20%): que porcentaje de esas habilidades
 *   requeridas NO esta cubierto por la dotacion actual de esa oficina
 *   (prioriza mandar gente a donde falta cobertura).
 * - Vacantes por capacidad (25%): que tan lejos esta la oficina de su
 *   capacidad requerida (capacidadRequerida - asignados). Si la oficina no
 *   tiene capacidad configurada (o es 0), este peso se redistribuye entre
 *   los otros dos factores.
 */

import type { OrgAnalysisEmployee, OrgAnalysisDepartment } from "@/app/Interfas/Interfaces";

const SKILL_MATCH_WEIGHT = 0.55;
const DEFICIT_WEIGHT = 0.20;
const CAPACITY_WEIGHT = 0.25;

interface CandidateOffice {
  officeId: number;
  officeNombre: string;
  departmentId: number;
  departmentNombre: string;
  habilidadesRequeridas: { nombre: string; level: number }[];
  capacidadRequerida: number | null;
  asignados: number;
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
  vacantes: number | null;
  capacidad: number | null;
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
        capacidadRequerida: office.capacidadRequerida,
        asignados: office.asignados,
      });
    }
  }
  return candidates;
}

type ScoreDetails = Pick<
  MatchResult,
  "scoreCompatibilidad" | "matchedSkills" | "missingSkills" | "deficitSkills" | "vacantes" | "capacidad"
>;

function scoreCandidate(
  candidate: CandidateOffice,
  empSkillNames: Set<string>,
  allEmployees: OrgAnalysisEmployee[]
): ScoreDetails {
  const required = candidate.habilidadesRequeridas;
  const vacantes =
    candidate.capacidadRequerida != null ? Math.max(candidate.capacidadRequerida - candidate.asignados, 0) : null;

  if (required.length === 0) {
    // Sin requisitos definidos para esta oficina: no se puede evaluar match
    // ni deficit, se usa un score neutral para no penalizar ni favorecer.
    return {
      scoreCompatibilidad: 50,
      matchedSkills: [],
      missingSkills: [],
      deficitSkills: [],
      vacantes,
      capacidad: candidate.capacidadRequerida,
    };
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

  let skillWeight = SKILL_MATCH_WEIGHT;
  let deficitWeight = DEFICIT_WEIGHT;
  let capacityWeight = CAPACITY_WEIGHT;
  let capacityRatio = 0;

  const capacidadValida = candidate.capacidadRequerida != null && candidate.capacidadRequerida > 0;
  if (capacidadValida) {
    capacityRatio = Math.min(
      Math.max((candidate.capacidadRequerida! - candidate.asignados) / candidate.capacidadRequerida!, 0),
      1
    );
  } else {
    // Sin capacidad configurada (o en 0): se redistribuye su peso
    // proporcionalmente entre skill match y deficit, para no penalizar ni
    // favorecer a esta oficina.
    const remaining = SKILL_MATCH_WEIGHT + DEFICIT_WEIGHT;
    skillWeight = SKILL_MATCH_WEIGHT + (SKILL_MATCH_WEIGHT / remaining) * CAPACITY_WEIGHT;
    deficitWeight = DEFICIT_WEIGHT + (DEFICIT_WEIGHT / remaining) * CAPACITY_WEIGHT;
    capacityWeight = 0;
  }

  const scoreCompatibilidad = Math.round(
    skillMatchRatio * skillWeight * 100 + deficitRatio * deficitWeight * 100 + capacityRatio * capacityWeight * 100
  );

  return { scoreCompatibilidad, matchedSkills, missingSkills, deficitSkills, vacantes, capacidad: candidate.capacidadRequerida };
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
      vacantes: null,
      capacidad: null,
    }
  );
}
