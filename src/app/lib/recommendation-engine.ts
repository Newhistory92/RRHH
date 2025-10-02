

import { Employee } from "@/app/Interfas/Interfaces";

export class RecommendationEngine {
  static generate(
    turnoverScore: number,
    productivity: number,
    satisfaction: number,
    employees: Employee[]
  ): string[] {
    const recs: string[] = [];

    // Riesgo crítico de rotación
    if (turnoverScore > 50) {
      recs.push(
        '🚨 URGENTE: Implementar plan de retención inmediato. Realizar entrevistas 1:1 con empleados clave.'
      );
    }

    // Satisfacción baja
    if (satisfaction < 7) {
      recs.push(
        '💬 Realizar encuesta de clima laboral profunda para identificar causas específicas de insatisfacción.'
      );
      recs.push(
        '🎯 Establecer programa de mejora de satisfacción con objetivos medibles trimestrales.'
      );
    }

    // Productividad baja
    if (productivity < 8) {
      recs.push(
        '📈 Implementar programa de capacitación técnica y metodologías ágiles (Scrum/Kanban).'
      );
      recs.push(
        '⚡ Revisar cargas de trabajo y redistribuir tareas para optimizar rendimiento del equipo.'
      );
    }

    // Work-life balance
    const avgWorkLife = this.calculateAverage(
      employees,
      e => e.satisfactionMetrics.workLifeBalance
    );
    
    if (avgWorkLife < 6) {
      recs.push(
        '⏰ Implementar políticas de flexibilidad horaria y opciones de trabajo remoto/híbrido.'
      );
    }

    // Crecimiento profesional
    const avgCareerGrowth = this.calculateAverage(
      employees,
      e => e.satisfactionMetrics.careerGrowthSatisfaction
    );
    
    if (avgCareerGrowth < 7) {
      recs.push(
        '🎓 Desarrollar plan de carrera claro con oportunidades de crecimiento y promoción visible.'
      );
    }

    // Todo va bien
    if (turnoverScore < 30) {
      recs.push(
        '✅ Mantener las prácticas actuales de gestión de talento que están funcionando bien.'
      );
    }

    return recs;
  }

  private static calculateAverage(
    employees: Employee[],
    selector: (e: Employee) => number
  ): number {
    return employees.reduce((sum, e) => sum + selector(e), 0) / employees.length;
  }
}