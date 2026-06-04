/**
 * Motor de Análisis Organizacional
 * 
 * Ejecuta 4 análisis sobre datos reales del backend:
 * 1. Skill Gap Analysis — brechas de habilidades por departamento
 * 2. Talent Misalignment — talento subutilizado (overqualification)
 * 3. Internal Mobility — recomendaciones de reubicación
 * 4. Single Points of Failure — dependencias críticas de personas
 */

import type {
  OrgAnalysisEmployee,
  OrgAnalysisDepartment,
  SkillGapEntry,
  RelocationProposal,
  SPOFEntry,
  RiskHeatMapEntry,
} from "@/app/Interfas/Interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────

interface OverqualifiedEmployee {
  employee: OrgAnalysisEmployee;
  unusedSkills: string[];
  currentDept: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SKILL GAP ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeSkillGaps(
  employees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[]
): SkillGapEntry[] {
  const gaps: SkillGapEntry[] = [];

  for (const dept of departments) {
    // Empleados de este departamento
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);
    if (deptEmployees.length === 0 && dept.habilidades_requeridas.length === 0) continue;

    // Todas las habilidades que poseen los empleados del depto (soft + technical)
    const employeeSkillNames = new Set<string>();
    for (const emp of deptEmployees) {
      for (const s of emp.softSkills) employeeSkillNames.add(s.nombre.toLowerCase());
      for (const t of emp.technicalSkills) employeeSkillNames.add(t.nombre.toLowerCase());
    }

    // Habilidades requeridas del departamento
    const allRequired = [...dept.habilidades_requeridas];
    for (const office of dept.offices) {
      allRequired.push(...office.habilidades_requeridas);
    }

    // Detectar gaps
    for (const req of allRequired) {
      if (!employeeSkillNames.has(req.nombre.toLowerCase())) {
        gaps.push({
          department: dept.nombre,
          missingSkill: req.nombre,
          requiredLevel: req.level,
          riskDescription: deptEmployees.length === 0
            ? `Departamento sin empleados asignados — habilidad "${req.nombre}" sin cobertura`
            : `Ninguno de los ${deptEmployees.length} empleados posee "${req.nombre}"`
        });
      }
    }
  }

  return gaps;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TALENT MISALIGNMENT (Overqualification)
// ─────────────────────────────────────────────────────────────────────────────

export function detectTalentMisalignment(
  employees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[]
): OverqualifiedEmployee[] {
  const misaligned: OverqualifiedEmployee[] = [];

  for (const emp of employees) {
    const dept = departments.find(d => d.id === emp.departmentId);
    if (!dept) continue;

    // Habilidades requeridas del departamento (nombres en minúscula)
    const requiredNames = new Set<string>();
    for (const h of dept.habilidades_requeridas) requiredNames.add(h.nombre.toLowerCase());
    for (const off of dept.offices) {
      for (const h of off.habilidades_requeridas) requiredNames.add(h.nombre.toLowerCase());
    }

    if (requiredNames.size === 0) continue;

    // Habilidades del empleado que NO están en los requisitos de su dept
    const allEmpSkills = [
      ...emp.softSkills.map(s => s.nombre),
      ...emp.technicalSkills.map(t => t.nombre),
    ];

    const unusedSkills = allEmpSkills.filter(
      skill => !requiredNames.has(skill.toLowerCase())
    );

    // Si más del 60% de sus skills no se usan en su departamento → overqualified/misaligned
    if (allEmpSkills.length > 0 && unusedSkills.length / allEmpSkills.length > 0.6) {
      misaligned.push({
        employee: emp,
        unusedSkills,
        currentDept: dept.nombre,
      });
    }
  }

  return misaligned;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. INTERNAL MOBILITY RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function generateMobilityRecommendations(
  gaps: SkillGapEntry[],
  misaligned: OverqualifiedEmployee[],
  departments: OrgAnalysisDepartment[]
): RelocationProposal[] {
  const proposals: RelocationProposal[] = [];
  const usedEmployees = new Set<number>();

  for (const gap of gaps) {
    // Buscar en misaligned alguien que tenga la habilidad faltante
    for (const candidate of misaligned) {
      if (usedEmployees.has(candidate.employee.id)) continue;
      if (candidate.currentDept === gap.department) continue;

      const hasSkill = candidate.unusedSkills.some(
        s => s.toLowerCase() === gap.missingSkill.toLowerCase()
      );

      if (hasSkill) {
        proposals.push({
          employeeName: candidate.employee.name,
          employeeId: candidate.employee.id,
          currentDept: candidate.currentDept,
          suggestedDept: gap.department,
          reason: `Posee "${gap.missingSkill}" que es una habilidad crítica faltante en ${gap.department}`,
          benefit: `Cubre brecha de habilidades y aprovecha mejor el perfil del empleado`,
        });
        usedEmployees.add(candidate.employee.id);
        break;
      }
    }
  }

  return proposals;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SINGLE POINTS OF FAILURE
// ─────────────────────────────────────────────────────────────────────────────

export function identifySinglePointsOfFailure(
  employees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[]
): SPOFEntry[] {
  const spofs: SPOFEntry[] = [];

  for (const dept of departments) {
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);
    if (deptEmployees.length <= 1) continue;

    // Para cada habilidad requerida, contar cuántos empleados la poseen
    const allRequired = [...dept.habilidades_requeridas];
    for (const office of dept.offices) {
      allRequired.push(...office.habilidades_requeridas);
    }

    // Deduplicar por nombre
    const uniqueRequired = new Map<string, number>();
    for (const h of allRequired) {
      uniqueRequired.set(h.nombre.toLowerCase(), h.level);
    }

    for (const [skillName] of uniqueRequired) {
      const holders = deptEmployees.filter(emp => {
        const allSkills = [
          ...emp.softSkills.map(s => s.nombre.toLowerCase()),
          ...emp.technicalSkills.map(t => t.nombre.toLowerCase()),
        ];
        return allSkills.includes(skillName);
      });

      if (holders.length === 1) {
        spofs.push({
          department: dept.nombre,
          criticalSkill: skillName,
          soleHolder: holders[0].name,
          risk: `Si ${holders[0].name} deja el departamento, nadie puede cubrir "${skillName}"`,
        });
      }
    }
  }

  return spofs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RISK HEAT MAP
// ─────────────────────────────────────────────────────────────────────────────

export function buildRiskHeatMap(
  employees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[],
  gaps: SkillGapEntry[],
  spofs: SPOFEntry[]
): RiskHeatMapEntry[] {
  const heatMap: RiskHeatMapEntry[] = [];

  for (const dept of departments) {
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);
    const deptGaps = gaps.filter(g => g.department === dept.nombre);
    const deptSPOFs = spofs.filter(s => s.department === dept.nombre);

    // Calcular score de riesgo
    let riskScore = 0;
    const risks: string[] = [];

    // Brechas de habilidades
    if (deptGaps.length > 3) {
      riskScore += 3;
      risks.push(`${deptGaps.length} brechas de habilidades`);
    } else if (deptGaps.length > 0) {
      riskScore += 1;
      risks.push(`${deptGaps.length} brechas de habilidades`);
    }

    // Puntos únicos de fallo
    if (deptSPOFs.length > 2) {
      riskScore += 3;
      risks.push(`${deptSPOFs.length} puntos únicos de fallo`);
    } else if (deptSPOFs.length > 0) {
      riskScore += 1;
      risks.push(`${deptSPOFs.length} puntos únicos de fallo`);
    }

    // Productividad baja
    const avgProd = deptEmployees.length > 0
      ? deptEmployees.reduce((s, e) => s + (e.productivityScore || 0), 0) / deptEmployees.length
      : 0;
    if (avgProd > 0 && avgProd < 6) {
      riskScore += 2;
      risks.push(`Productividad baja (${avgProd.toFixed(1)}/10)`);
    }

    // Satisfacción baja
    const avgSat = deptEmployees.length > 0
      ? deptEmployees.reduce((s, e) => s + (e.satisfactionMetrics?.overallSatisfaction || 0), 0) / deptEmployees.length
      : 0;
    if (avgSat > 0 && avgSat < 6) {
      riskScore += 2;
      risks.push(`Satisfacción baja (${avgSat.toFixed(1)}/10)`);
    }

    // Sin empleados
    if (deptEmployees.length === 0) {
      riskScore += 1;
      risks.push("Sin empleados asignados");
    }

    const riskLevel: 'Alto' | 'Medio' | 'Bajo' =
      riskScore >= 4 ? 'Alto' : riskScore >= 2 ? 'Medio' : 'Bajo';

    heatMap.push({
      department: dept.nombre,
      riskLevel,
      mainRisk: risks.length > 0 ? risks.join("; ") : "Sin riesgos detectados",
      employeeCount: deptEmployees.length,
    });
  }

  // Ordenar: Alto primero
  const order = { Alto: 0, Medio: 1, Bajo: 2 };
  heatMap.sort((a, b) => order[a.riskLevel] - order[b.riskLevel]);

  return heatMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// EJECUTAR ANÁLISIS COMPLETO
// ─────────────────────────────────────────────────────────────────────────────

export function runFullAnalysis(
  employees: OrgAnalysisEmployee[],
  departments: OrgAnalysisDepartment[]
) {
  const skillGaps = analyzeSkillGaps(employees, departments);
  const misaligned = detectTalentMisalignment(employees, departments);
  const relocationProposals = generateMobilityRecommendations(skillGaps, misaligned, departments);
  const singlePointsOfFailure = identifySinglePointsOfFailure(employees, departments);
  const riskHeatMap = buildRiskHeatMap(employees, departments, skillGaps, singlePointsOfFailure);

  return {
    skillGaps,
    misaligned,
    relocationProposals,
    singlePointsOfFailure,
    riskHeatMap,
  };
}
