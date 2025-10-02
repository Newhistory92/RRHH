

import { Employee } from "@/app/Interfas/Interfaces";

export class RiskCalculator {
  static calculateTurnoverRisk(
    employees: Employee[],
    avgSatisfaction: number,
    licenseIncrease: number
  ): number {
    let score = 0;

    // Factor 1: Satisfacción baja (35%)
    score += this.getSatisfactionScore(avgSatisfaction);

    // Factor 2: Aumento de licencias (25%)
    score += this.getLicenseScore(licenseIncrease);

    // Factor 3: Productividad baja (20%)
    score += this.getProductivityScore(employees);

    // Factor 4: Work-life balance bajo (20%)
    score += this.getWorkLifeScore(employees);

    return Math.min(score, 100);
  }

  private static getSatisfactionScore(avgSatisfaction: number): number {
    if (avgSatisfaction < 6) return 35;
    if (avgSatisfaction < 7) return 25;
    if (avgSatisfaction < 8) return 15;
    return 0;
  }

  private static getLicenseScore(licenseIncrease: number): number {
    if (licenseIncrease > 100) return 25;
    if (licenseIncrease > 50) return 15;
    if (licenseIncrease > 25) return 10;
    return 0;
  }

  private static getProductivityScore(employees: Employee[]): number {
    const lowProductivityCount = employees.filter(
      e => e.productivityScore < 7
    ).length;
    
    const lowProdPercentage = (lowProductivityCount / employees.length) * 100;
    
    if (lowProdPercentage > 50) return 20;
    if (lowProdPercentage > 30) return 12;
    return 0;
  }

  private static getWorkLifeScore(employees: Employee[]): number {
    const avgWorkLife = employees.reduce(
      (sum, e) => sum + e.satisfactionMetrics.workLifeBalance,
      0
    ) / employees.length;

    if (avgWorkLife < 5) return 20;
    if (avgWorkLife < 6) return 12;
    if (avgWorkLife < 7) return 8;
    return 0;
  }
}