

import { ArrowLeft } from 'lucide-react';

type PredictiveAnalysisProps = {
  onBack: () => void;
};

export const PredictiveAnalysis = ({ onBack }: PredictiveAnalysisProps) => {
  const departmentData = [
    {
      name: 'Ventas',
      feedback: 'El equipo muestra una excelente comunicación con los clientes, pero se ha detectado una baja proactividad en la búsqueda de nuevas oportunidades. La colaboración interna es alta.',
      diagnosis: 'Riesgo moderado de estancamiento en el crecimiento. Se recomienda implementar un programa de incentivos para la generación de leads y talleres de creatividad.',
      color: 'border-blue-500'
    },
    {
      name: 'Marketing',
      feedback: 'Alta creatividad y habilidades técnicas en herramientas digitales. Sin embargo, la retroalimentación entre compañeros indica dificultades en la gestión del tiempo y cumplimiento de plazos.',
      diagnosis: 'Riesgo alto de retrasos en proyectos clave. Se sugiere una capacitación en metodologías ágiles (Scrum/Kanban) para mejorar la planificación y entrega.',
      color: 'border-green-500'
    },
    {
      name: 'Ingeniería',
      feedback: 'Dominio técnico excepcional y gran capacidad para la resolución de problemas complejos. El feedback revela una comunicación interna muy técnica y poco accesible para otros departamentos.',
      diagnosis: 'Riesgo de silos de información y pobre colaboración interdepartamental. Se recomienda fomentar la participación en reuniones multi-departamento y entrenar habilidades de comunicación efectiva.',
      color: 'border-purple-500'
    },
  ];

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver
      </button>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Análisis Predictivo</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Diagnóstico departamental basado en feedback de habilidades blandas.</p>
      <div className="space-y-6">
        {departmentData.map((dept) => (
          <div key={dept.name} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${dept.color}`}>
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">{dept.name}</h3>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Resumen de Feedback:</p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{dept.feedback}</p>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Diagnóstico y Recomendación:</p>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">{dept.diagnosis}</p>
          </div>
        ))}
      </div>
    </div>
  );
};