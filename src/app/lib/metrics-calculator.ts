
import { Employee, BaseMetrics } from "@/app/Interfas/Interfaces";
import { RiskCalculator } from "./risk-calculator";
import { RecommendationEngine } from "./recommendation-engine";
import { InsightGenerator } from "./insight-generator";

export class MetricsCalculator {
  calculate(employees: Employee[]): BaseMetrics {
    const avgProductivity = this.calculateAverage(
      employees,
      e => e.productivityScore
    );
    
    const avgSatisfaction = this.calculateAverage(
      employees,
      e => e.satisfactionMetrics.overallSatisfaction
    );

    const { avgLicenses2024, avgLicenses2023 } = this.calculateLicenses(employees);
    const licenseIncrease = this.calculateLicenseIncrease(
      avgLicenses2024,
      avgLicenses2023
    );

    const turnoverScore = RiskCalculator.calculateTurnoverRisk(
      employees,
      avgSatisfaction,
      licenseIncrease,
      
    );

    const { turnoverRisk, color } = this.getRiskLevel(turnoverScore);
    const productivityTrend = this.getProductivityTrend(avgProductivity);

    return {
      avgProductivity: Math.round(avgProductivity * 10) / 10,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      turnoverScore: Math.round(turnoverScore),
      turnoverRisk,
      productivityTrend,
      color,
      licenseIncrease,
      predictedPeaks: this.predictProductivityPeaks(avgProductivity),
      recommendations: RecommendationEngine.generate(
        turnoverScore,
        avgProductivity,
        avgSatisfaction,
        employees
      ),
      keyInsights: InsightGenerator.generate(
        employees,
        avgSatisfaction,
        licenseIncrease
      ),
      riskFactors: InsightGenerator.identifyRiskFactors(employees, avgSatisfaction)
    };
  }

  
  private calculateAverage(
    employees: Employee[],
    selector: (e: Employee) => number
  ): number {
    return employees.reduce((sum, e) => sum + selector(e), 0) / employees.length;
  }

  private calculateLicenses(employees: Employee[]) {
    const avgLicenses2024 = this.calculateAverage(
      employees,
      e => e.licenses['2024']
    );
    
    const avgLicenses2023 = this.calculateAverage(
      employees,
      e => e.licenses['2023']
    );

    return { avgLicenses2024, avgLicenses2023 };
  }

  private calculateLicenseIncrease(
    licenses2024: number,
    licenses2023: number
  ): number {
    return licenses2023 > 0
      ? ((licenses2024 - licenses2023) / licenses2023) * 100
      : 0;
  }

  private getRiskLevel(score: number) {
    if (score < 30) {
      return { turnoverRisk: 'Bajo' as const, color: 'border-green-500' };
    } else if (score < 50) {
      return { turnoverRisk: 'Medio' as const, color: 'border-yellow-500' };
    } else if (score < 75) {
      return { turnoverRisk: 'Alto' as const, color: 'border-orange-500' };
    } else {
      return { turnoverRisk: 'Crítico' as const, color: 'border-red-500' };
    }
  }

  private getProductivityTrend(
    avgProductivity: number
  ): 'up' | 'down' | 'stable' {
    if (avgProductivity > 8.5) return 'up';
    if (avgProductivity < 7) return 'down';
    return 'stable';
  }

 private predictProductivityPeaks(avgProductivity: number): string[] {
    const peaks: string[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const trend = avgProductivity > 8.5 ? 15 : avgProductivity > 7.5 ? 12 : 8;

    // Últimos 2 años y actual
    for (let y = currentYear - 1; y <= currentYear; y++) {
        for (let q = 1; q <= 4; q++) {
            const startMonth = (q - 1) * 3 + 1; // Enero = 1
            const endMonth = startMonth + 2;
            const startMonthName = new Date(y, startMonth - 1).toLocaleString('default', { month: 'short' });
            const endMonthName = new Date(y, endMonth - 1).toLocaleString('default', { month: 'short' });
            const trendAdj = trend + (q === 4 ? 8 : q === 2 ? 5 : 0); // ajustar según trimestre
            peaks.push(`Q${q} ${y} (${startMonthName}-${endMonthName}): Incremento esperado del ${trendAdj}%`);
        }
    }

    return peaks;
}

}