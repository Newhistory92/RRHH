
import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Users,   Target, Brain, Zap, CheckCircle, Lightbulb, ShieldAlert } from 'lucide-react';
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
        const token = localStorage.getItem('token');
        const response = await fetch('/api/predictive-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
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
      <div className="bg-background flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Brain className="w-20 h-20 text-primary animate-pulse mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Analizando Datos con IA</h2>
          <p className="text-muted-foreground">Procesando patrones y generando predicciones...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/15 p-2 rounded-lg">
                <Zap className="text-primary" size={28} />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Análisis Predictivo de Riesgos</h1>
            </div>
            <p className="text-muted-foreground">
              Predicción de rotación y productividad con IA para una gestión proactiva.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-semibold border-2 border-primary text-primary px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground self-start sm:self-center"
          >
            <ArrowLeft size={16} />
            Volver al Dashboard
          </button>
        </div>

        {/* Resumen Ejecutivo con StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<Users size={24} className="text-primary" />}
            title="Empleados Analizados"
            value={analysis.reduce((sum, d) => sum + d.employees, 0)}
            colorClass="bg-primary/15"
          />
          <StatCard
            icon={<AlertTriangle size={24} className="text-error" />}
            title="Departamentos en Riesgo"
            value={analysis.filter(d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico').length}
            colorClass="bg-error-soft"
          />
          <StatCard
            icon={<Target size={24} className="text-accent" />}
            title="Productividad Promedio"
            value={`${(analysis.reduce((sum, d) => sum + d.avgProductivity, 0) / analysis.length).toFixed(1)}/10`}
            colorClass="bg-accent/15"
          />
        </div>

        {/* Listado de Análisis por Departamento */}
        <div className="space-y-6">
          {analysis.map((dept) => (
            <div
              key={dept.name}
              className="bg-card rounded-xl shadow-md border border-border transition-all hover:shadow-xl hover:border-primary overflow-hidden"
            >
              <div className={`h-2 w-full bg-${dept.color}-500`}></div>
              <div className="p-6">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dept.employees} empleados
                    </p>
                  </div>
                  <RiskBadge risk={dept.turnoverRisk} score={dept.turnoverScore} />
                </div>

                {/* Métricas clave con barras de progreso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-muted-foreground">Productividad</span>
      <span className="text-sm font-bold text-foreground">
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
      <span className="text-sm font-medium text-muted-foreground">Satisfacción</span>
      <span className="text-sm font-bold text-foreground">
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
    <h4 className="text-sm font-semibold text-error mb-2">
      Brechas de Habilidades Detectadas
    </h4>
    <ul className="list-disc pl-5 text-sm text-foreground">
      {dept.skillsGap.map((skill, idx) => (
        <li key={idx}>{skill.nombre} (nivel {skill.nivel})</li>
      ))}
    </ul>
  </div>
)}
                {/* Detalles del análisis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-border pt-6">
                  {dept.riskFactors.length > 0 && <InfoList title="Factores de Riesgo" items={dept.riskFactors} icon={<ShieldAlert/>} colorClass="text-warning" />}
                  {dept.keyInsights.length > 0 && <InfoList title="Perspectivas Clave" items={dept.keyInsights} icon={<Lightbulb/>} colorClass="text-warning" />}
                  {dept.recommendations.length > 0 && <InfoList title="Recomendaciones IA" items={dept.recommendations} icon={<CheckCircle/>} colorClass="text-primary" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-5 text-center bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
            <strong>Metodología:</strong> El análisis se basa en un modelo de IA que evalúa 15+ variables, incluyendo satisfacción, productividad histórica, ausentismo, y evaluaciones de desempeño. La precisión del modelo se re-evalúa continuamente con nuevos datos.
          </p>
        </div>
      </div>
    </div>
  );
}
