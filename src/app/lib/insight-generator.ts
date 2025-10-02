
import { Employee } from "@/app/Interfas/Interfaces";

export class InsightGenerator {
  static generate(
    employees: Employee[],
    avgSatisfaction: number,
    licenseIncrease: number
  ): string[] {
    const insights: string[] = [];

    // Aumento de licencias
    if (licenseIncrease > 50) {
      insights.push(
        `Aumento del ${Math.round(licenseIncrease)}% en licencias vs. año anterior - posible indicador de burnout o problemas de salud`
      );
    }

    // Alto rendimiento
    const highPerformers = employees.filter(e => e.productivityScore > 9).length;
    if (highPerformers > 0) {
      insights.push(
        `${highPerformers} empleados de alto rendimiento (>9/10) identificados - priorizar su retención y desarrollo`
      );
    }

    // Satisfacción crítica
    const lowSatisfaction = employees.filter(
      e => e.satisfactionMetrics.overallSatisfaction < 6
    ).length;
    
    if (lowSatisfaction > 0) {
      insights.push(
        `${lowSatisfaction} empleados con satisfacción crítica (<6/10) - requieren atención inmediata`
      );
    }

    // Antigüedad promedio
    const avgTenure = this.calculateAverageTenure(employees);
    if (avgTenure < 2) {
      insights.push(
        `Antigüedad promedio baja (${avgTenure.toFixed(1)} años) - evaluar procesos de onboarding y retención temprana`
      );
    }

    return insights;
  }

  static identifyRiskFactors(
    employees: Employee[],
    avgSatisfaction: number
  ): string[] {
    const risks: string[] = [];

    // Baja satisfacción general
    if (avgSatisfaction < 7) {
      risks.push('Baja satisfacción general del equipo (indicador principal de rotación)');
    }

    // Alto ausentismo
    const highAbsences = employees.filter(e => e.absences['2024'] > 5).length;
    if (highAbsences > employees.length * 0.3) {
      risks.push(
        `Alto índice de ausentismo (${Math.round((highAbsences / employees.length) * 100)}% del equipo con >5 ausencias)`
      );
    }

    // Problemas de cohesión de equipo
    const lowTeamSatisfaction = employees.filter(
      e => e.satisfactionMetrics.teamSatisfaction < 6
    ).length;
    
    if (lowTeamSatisfaction > 0) {
      risks.push('Problemas de cohesión de equipo detectados en múltiples empleados');
    }

    // Problemas de liderazgo
    const lowLeadership = employees.filter(
      e => e.satisfactionMetrics.leadershipSatisfaction < 6
    ).length;
    
    if (lowLeadership > employees.length * 0.3) {
      risks.push('Baja satisfacción con el liderazgo - requiere evaluación de managers');
    }

    return risks;
  }

  private static calculateAverageTenure(employees: Employee[]): number {
    return employees.reduce((sum, e) => {
      const years = (new Date().getTime() - new Date(e.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24 * 365);
      return sum + years;
    }, 0) / employees.length;
  }
}