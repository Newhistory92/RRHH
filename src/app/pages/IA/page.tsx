import React, { useState } from 'react';
import { BarChart2, Users, BrainCircuit } from 'lucide-react';
import {PredictiveAnalysis} from '@/app/Componentes/MCPIA/Predictive';
import {HRChatbot} from '@/app/Componentes/MCPIA/HRChatbot';
import {DepartmentOptimization} from '@/app/Componentes/MCPIA/DepartmentOptimization';


type CardProps = {
  children: React.ReactNode;
  onClick: () => void;
};

const Card: React.FC<CardProps> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full border dark:border-gray-700"
  >
    {children}
  </button>
);


export const IAPage = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeComponent) {
      case 'predictive':
        return <PredictiveAnalysis onBack={() => setActiveComponent(null)} />;
      case 'chatbot':
        return <HRChatbot onBack={() => setActiveComponent(null)} />;
      case 'optimization':
        return <DepartmentOptimization onBack={() => setActiveComponent(null)} />;
      default:
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Herramientas de IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card onClick={() => setActiveComponent('predictive')}>
                <BrainCircuit size={40} className="text-blue-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Análisis Predictivo</h3>
                <p className="text-gray-600 dark:text-gray-400">Anticipa tendencias de rotación de personal y picos de productividad.</p>
              </Card>
              <Card onClick={() => setActiveComponent('chatbot')}>
                <Users size={40} className="text-green-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Chatbot de RRHH</h3>
                <p className="text-gray-600 dark:text-gray-400">Responde preguntas frecuentes de empleados sobre políticas y beneficios.</p>
              </Card>
              <Card onClick={() => setActiveComponent('optimization')}>
                <BarChart2 size={40} className="text-purple-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Optimización de Departamentos</h3>
                <p className="text-gray-600 dark:text-gray-400">Analiza la estructura de la empresa para una mayor eficiencia.</p>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}

