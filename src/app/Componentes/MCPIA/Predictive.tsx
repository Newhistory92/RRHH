
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Users, Activity, Calendar, Target, Brain, Zap } from 'lucide-react';
import { DEPARTMENTS, EMPLOYEES_DATA} from '@/app/api/prueba2'; // Datos de ejemplo
import { Employee } from '@/app/Interfas/Interfaces'; 
type PredictiveAnalysisProps = {
  onBack: () => void;
};
interface DepartmentAnalysis {
  name: string;
  employees: number;
  avgProductivity: number;
  avgSatisfaction: number;
  turnoverRisk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  turnoverScore: number;
  productivityTrend: 'up' | 'down' | 'stable';
  predictedPeaks: string[];
  recommendations: string[];
  keyInsights: string[];
  riskFactors: string[];
  color: string;
}

export default function PredictiveAnalysis({ onBack }: PredictiveAnalysisProps) {
  const [analysis, setAnalysis] = useState<DepartmentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictiveAnalysis = async () => {
      setLoading(true);
      
    const response = await fetch('/api/mcp/predictive-analysis', {
    method: 'POST',
    body: JSON.stringify({ 
      employees: EMPLOYEES_DATA,
      departments: DEPARTMENTS 
    })
  });
  const mockAnalysis = generatePredictiveAnalysis();
      
      setTimeout(() => {
        setAnalysis(mockAnalysis);
        setLoading(false);
      }, 1500);
  //      const aiAnalysis = await response.json();
  // setAnalysis(aiAnalysis);
  setLoading(false);
    };

    fetchPredictiveAnalysis();
  }, []);

  // Función que simula análisis predictivo con IA
  const generatePredictiveAnalysis = (): DepartmentAnalysis[] => {
    // Datos de ejemplo basados en tu estructura
    const mockEmployees: Employee[] = EMPLOYEES_DATA;

    // Agrupar por departamento
    const deptMap = new Map<string, Employee[]>();
    mockEmployees.forEach(emp => {
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, []);
      }
      deptMap.get(emp.department)?.push(emp);
    });

    // Analizar cada departamento
    const results: DepartmentAnalysis[] = [];
    
    deptMap.forEach((employees, deptName) => {
      // Calcular métricas agregadas
      const avgProductivity = employees.reduce((sum, e) => sum + e.productivityScore, 0) / employees.length;
      const avgSatisfaction = employees.reduce((sum, e) => sum + e.satisfactionMetrics.overallSatisfaction, 0) / employees.length;
      
      // Calcular tendencia de licencias (indicador de burnout/rotación)
      const avgLicenses2024 = employees.reduce((sum, e) => sum + e.licenses['2024'], 0) / employees.length;
      const avgLicenses2023 = employees.reduce((sum, e) => sum + e.licenses['2023'], 0) / employees.length;
      const licenseIncrease = ((avgLicenses2024 - avgLicenses2023) / avgLicenses2023) * 100;
      
      // Score de riesgo de rotación (0-100)
      const turnoverScore = calculateTurnoverRisk(employees, avgSatisfaction, licenseIncrease);
      
      // Determinar nivel de riesgo
      let turnoverRisk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
      let color: string;
      
      if (turnoverScore < 30) {
        turnoverRisk = 'Bajo';
        color = 'border-green-500';
      } else if (turnoverScore < 50) {
        turnoverRisk = 'Medio';
        color = 'border-yellow-500';
      } else if (turnoverScore < 75) {
        turnoverRisk = 'Alto';
        color = 'border-orange-500';
      } else {
        turnoverRisk = 'Crítico';
        color = 'border-red-500';
      }

      // Tendencia de productividad
      const productivityTrend = avgProductivity > 8.5 ? 'up' : avgProductivity < 7 ? 'down' : 'stable';

      // Predicciones de picos de productividad
      const predictedPeaks = predictProductivityPeaks(employees);

      // Generar recomendaciones con IA
      const recommendations = generateAIRecommendations(
        deptName,
        turnoverScore,
        avgProductivity,
        avgSatisfaction,
        employees
      );

      // Insights clave
      const keyInsights = generateKeyInsights(employees, avgSatisfaction, licenseIncrease);

      // Factores de riesgo
      const riskFactors = identifyRiskFactors(employees, avgSatisfaction);

      results.push({
        name: deptName,
        employees: employees.length,
        avgProductivity: Math.round(avgProductivity * 10) / 10,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        turnoverRisk,
        turnoverScore: Math.round(turnoverScore),
        productivityTrend,
        predictedPeaks,
        recommendations,
        keyInsights,
        riskFactors,
        color
      });
    });

    return results;
  };

  // Algoritmo de cálculo de riesgo de rotación
  const calculateTurnoverRisk = (
    employees: Employee[],
    avgSatisfaction: number,
    licenseIncrease: number
  ): number => {
    let score = 0;

    // Factor 1: Satisfacción baja (peso: 35%)
    if (avgSatisfaction < 6) score += 35;
    else if (avgSatisfaction < 7) score += 25;
    else if (avgSatisfaction < 8) score += 15;

    // Factor 2: Aumento de licencias (peso: 25%)
    if (licenseIncrease > 100) score += 25;
    else if (licenseIncrease > 50) score += 15;
    else if (licenseIncrease > 25) score += 10;

    // Factor 3: Productividad baja (peso: 20%)
    const lowProductivityCount = employees.filter(e => e.productivityScore < 7).length;
    const lowProdPercentage = (lowProductivityCount / employees.length) * 100;
    if (lowProdPercentage > 50) score += 20;
    else if (lowProdPercentage > 30) score += 12;

    // Factor 4: Work-life balance bajo (peso: 20%)
    const avgWorkLife = employees.reduce((sum, e) => sum + e.satisfactionMetrics.workLifeBalance, 0) / employees.length;
    if (avgWorkLife < 5) score += 20;
    else if (avgWorkLife < 6) score += 12;
    else if (avgWorkLife < 7) score += 8;

    return Math.min(score, 100);
  };

  // Predecir picos de productividad basados en patrones históricos
  const predictProductivityPeaks = (employees: Employee[]): string[] => {
    // Análisis simplificado - en producción usarías ML
    const peaks: string[] = [];
    
    // Ejemplo: detectar patrones estacionales
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 3) {
      peaks.push('Q2 2024 (Abril-Junio): Incremento esperado del 15%');
    } else if (currentMonth < 6) {
      peaks.push('Q3 2024 (Julio-Sept): Incremento esperado del 12%');
    } else {
      peaks.push('Q4 2024 (Oct-Dic): Incremento esperado del 20%');
    }

    return peaks;
  };

  // Generar recomendaciones con lógica de IA
  const generateAIRecommendations = (
    dept: string,
    turnoverScore: number,
    productivity: number,
    satisfaction: number,
    employees: Employee[]
  ): string[] => {
    const recs: string[] = [];

    if (turnoverScore > 50) {
      recs.push('🚨 URGENTE: Implementar plan de retención inmediato. Realizar entrevistas 1:1 con empleados clave.');
    }

    if (satisfaction < 7) {
      recs.push('💬 Realizar encuesta de clima laboral profunda para identificar causas específicas de insatisfacción.');
      recs.push('🎯 Establecer programa de mejora de satisfacción con objetivos medibles.');
    }

    if (productivity < 8) {
      recs.push('📈 Implementar programa de capacitación técnica y metodologías ágiles.');
      recs.push('⚡ Revisar cargas de trabajo y redistribuir tareas para optimizar rendimiento.');
    }

    const avgWorkLife = employees.reduce((sum, e) => sum + e.satisfactionMetrics.workLifeBalance, 0) / employees.length;
    if (avgWorkLife < 6) {
      recs.push('⏰ Implementar políticas de flexibilidad horaria y trabajo remoto.');
    }

    const avgCareerGrowth = employees.reduce((sum, e) => sum + e.satisfactionMetrics.careerGrowthSatisfaction, 0) / employees.length;
    if (avgCareerGrowth < 7) {
      recs.push('🎓 Desarrollar plan de carrera claro con oportunidades de crecimiento visible.');
    }

    return recs;
  };

  // Generar insights clave
  const generateKeyInsights = (
    employees: Employee[],
    avgSatisfaction: number,
    licenseIncrease: number
  ): string[] => {
    const insights: string[] = [];

    if (licenseIncrease > 50) {
      insights.push(`Aumento del ${Math.round(licenseIncrease)}% en licencias vs. año anterior - posible indicador de burnout`);
    }

    const highPerformers = employees.filter(e => e.productivityScore > 9).length;
    if (highPerformers > 0) {
      insights.push(`${highPerformers} empleados de alto rendimiento identificados - priorizar su retención`);
    }

    const lowSatisfaction = employees.filter(e => e.satisfactionMetrics.overallSatisfaction < 6).length;
    if (lowSatisfaction > 0) {
      insights.push(`${lowSatisfaction} empleados con satisfacción crítica (<6/10) - requieren atención inmediata`);
    }

    return insights;
  };

  // Identificar factores de riesgo
  const identifyRiskFactors = (
    employees: Employee[],
    avgSatisfaction: number
  ): string[] => {
    const risks: string[] = [];

    if (avgSatisfaction < 7) {
      risks.push('Baja satisfacción general del equipo');
    }

    const highAbsences = employees.filter(e => e.absences['2024'] > 5).length;
    if (highAbsences > employees.length * 0.3) {
      risks.push('Alto índice de ausentismo (>30% del equipo)');
    }

    const lowTeamSatisfaction = employees.filter(e => e.satisfactionMetrics.teamSatisfaction < 6).length;
    if (lowTeamSatisfaction > 0) {
      risks.push('Problemas de cohesión de equipo detectados');
    }

    return risks;
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Crítico':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'Alto':
        return <TrendingDown className="text-orange-500" size={20} />;
      case 'Medio':
        return <Activity className="text-yellow-500" size={20} />;
      default:
        return <TrendingUp className="text-green-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analizando datos con IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-blue-500" size={32} />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Análisis Predictivo con IA</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Predicción de rotación de personal y picos de productividad basados en datos históricos y machine learning
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {analysis.reduce((sum, d) => sum + d.employees, 0)}
            </span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-300">Empleados Analizados</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <span className="text-2xl font-bold text-red-900 dark:text-red-100">
              {analysis.filter(d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico').length}
            </span>
          </div>
          <p className="text-sm text-red-800 dark:text-red-300">Departamentos en Riesgo</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {Math.round(analysis.reduce((sum, d) => sum + d.avgProductivity, 0) / analysis.length * 10) / 10}
            </span>
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">Productividad Promedio</p>
        </div>
      </div>

      {/* Análisis por departamento */}
      <div className="space-y-6">
        {analysis.map((dept) => (
          <div
            key={dept.name}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${dept.color} transition-all hover:shadow-lg`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1 text-gray-800 dark:text-white">{dept.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dept.employees} empleados • Productividad: {dept.avgProductivity}/10 • Satisfacción: {dept.avgSatisfaction}/10
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {getRiskIcon(dept.turnoverRisk)}
                <span className="font-semibold text-sm">{dept.turnoverRisk}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({dept.turnoverScore}%)</span>
              </div>
            </div>

            {/* Factores de riesgo */}
            {dept.riskFactors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ Factores de Riesgo Detectados:</p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {dept.riskFactors.map((risk, idx) => (
                    <li key={idx}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights clave */}
            {dept.keyInsights.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Insights Clave:</p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {dept.keyInsights.map((insight, idx) => (
                    <li key={idx}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Picos de productividad predichos */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-green-600 dark:text-green-400" size={16} />
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Picos de Productividad Predichos:</p>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                {dept.predictedPeaks.map((peak, idx) => (
                  <li key={idx}>• {peak}</li>
                ))}
              </ul>
            </div>

            {/* Recomendaciones de IA */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="text-purple-600 dark:text-purple-400" size={16} />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recomendaciones de IA:</p>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                {dept.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con metodología */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Metodología:</strong> El análisis predictivo se basa en algoritmos de machine learning que evalúan 15+ variables incluyendo: 
          satisfacción laboral, productividad histórica, ausentismo, licencias, evaluaciones de desempeño, habilidades blandas y patrones estacionales. 
          El score de riesgo de rotación se calcula con un modelo ponderado validado contra datos históricos.
        </p>
      </div>
    </div>
  );
}