import React from 'react';
import { BarChart2, Users, BrainCircuit } from 'lucide-react';
import { Card } from '@/app/Componentes/Card';
export const IAPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Herramientas de IA</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <BrainCircuit size={40} className="text-blue-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Análisis Predictivo</h3>
            <p className="text-gray-600 dark:text-gray-400">Anticipa tendencias de rotación de personal y picos de productividad.</p>
        </Card>
        <Card>
            <Users size={40} className="text-green-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Chatbot de RRHH</h3>
            <p className="text-gray-600 dark:text-gray-400">Responde preguntas frecuentes de empleados sobre políticas y beneficios.</p>
        </Card>
        <Card>
            <BarChart2 size={40} className="text-purple-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Optimización de Turnos</h3>
            <p className="text-gray-600 dark:text-gray-400">Genera horarios de trabajo eficientes basados en la demanda y disponibilidad.</p>
        </Card>
    </div>
  </div>
);