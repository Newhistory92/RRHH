
import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Users,   Target, Brain, Zap, CheckCircle, Lightbulb, ShieldAlert } from 'lucide-react';
import { EMPLOYEES_DATA } from '@/app/api/prueba2';
import {  DepartmentAnalysis } from '@/app/Interfas/Interfaces';
import { StatCard,RiskBadge,InfoList} from '@/app/util/UiRRHH';
import { ProgressBar } from 'primereact/progressbar';
                

type PredictiveAnalysisProps = {
  onBack: () => void;
};

export default function PredictiveAnalysis({ onBack }: PredictiveAnalysisProps) {
  const [analysis, setAnalysis] = useState<DepartmentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
 console.log(analysis)
  useEffect(() => {
    const fetchPredictiveAnalysis = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/predictive-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employees:EMPLOYEES_DATA,
            analysisType: 'full',
            timeframe: '3months'
          })
        });

        if (!response.ok) {
          throw new Error('Error en el análisis predictivo');
        }

        const result = await response.json();
        
        if (result.success) {
          setAnalysis(result.data.departments);
        } 
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictiveAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Brain className="w-20 h-20 text-cyan-500 animate-pulse mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Analizando Datos con IA</h2>
          <p className="text-slate-500 dark:text-slate-400">Procesando patrones y generando predicciones...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-lg">
                <Zap className="text-[#1ABCD7]" size={28} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Análisis Predictivo de Riesgos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Predicción de rotación y productividad con IA para una gestión proactiva.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-semibold border-2 border-[#2ecbe7] text-[#1ABCD7] px-4 py-2 rounded-lg transition-all hover:bg-[#2ecbe7] hover:text-white self-start sm:self-center"
          >
            <ArrowLeft size={16} />
            Volver al Dashboard
          </button>
        </div>

        {/* Resumen Ejecutivo con StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard 
            icon={<Users size={24} className="text-cyan-500" />}
            title="Empleados Analizados"
            value={analysis.reduce((sum, d) => sum + d.employees, 0)}
            colorClass="bg-cyan-100 dark:bg-cyan-900/50"
          />
          <StatCard 
            icon={<AlertTriangle size={24} className="text-red-500" />}
            title="Departamentos en Riesgo"
            value={analysis.filter(d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico').length}
            colorClass="bg-red-100 dark:bg-red-900/50"
          />
          <StatCard 
            icon={<Target size={24} className="text-green-500" />}
            title="Productividad Promedio"
            value={`${(analysis.reduce((sum, d) => sum + d.avgProductivity, 0) / analysis.length).toFixed(1)}/10`}
            colorClass="bg-green-100 dark:bg-green-900/50"
          />
        </div>

        {/* Listado de Análisis por Departamento */}
        <div className="space-y-6">
          {analysis.map((dept) => (
            <div
              key={dept.name}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:shadow-xl hover:border-[#2ecbe7] overflow-hidden"
            >
              <div className={`h-2 w-full bg-${dept.color}-500`}></div>
              <div className="p-6">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{dept.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {dept.employees} empleados
                    </p>
                  </div>
                  <RiskBadge risk={dept.turnoverRisk} score={dept.turnoverScore} />
                </div>

                {/* Métricas clave con barras de progreso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Productividad</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {dept.avgProductivity} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgProductivity * 10} // Escalamos 1-10 -> 0-100
      showValue={false} // ocultamos el % para que no muestre "80%"
      className="h-3"
    />
  </div>

  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Satisfacción</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {dept.avgSatisfaction} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgSatisfaction * 10}
      showValue={false}
      className="h-3"
    />
  </div>
</div>
{dept.skillsGap && dept.skillsGap.length > 0 && (
  <div className="col-span-2 mt-4 mb-3">
    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
      Brechas de Habilidades Detectadas
    </h4>
    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
      {dept.skillsGap.map((skill, idx) => (
        <li key={idx}>{skill.nombre} (nivel {skill.nivel})</li>
      ))}
    </ul>
  </div>
)}
                {/* Detalles del análisis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                  {dept.riskFactors.length > 0 && <InfoList title="Factores de Riesgo" items={dept.riskFactors} icon={<ShieldAlert/>} colorClass="text-orange-500" />}
                  {dept.keyInsights.length > 0 && <InfoList title="Perspectivas Clave" items={dept.keyInsights} icon={<Lightbulb/>} colorClass="text-yellow-500" />}
                  {dept.recommendations.length > 0 && <InfoList title="Recomendaciones IA" items={dept.recommendations} icon={<CheckCircle/>} colorClass="text-cyan-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-5 text-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            <strong>Metodología:</strong> El análisis se basa en un modelo de IA que evalúa 15+ variables, incluyendo satisfacción, productividad histórica, ausentismo, y evaluaciones de desempeño. La precisión del modelo se re-evalúa continuamente con nuevos datos.
          </p>
        </div>
      </div>
    </div>
  );
}
