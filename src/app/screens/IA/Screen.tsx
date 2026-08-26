"use client"
import React, { useState } from 'react';
import { BarChart2, Users, BrainCircuit } from 'lucide-react';
import PredictiveAnalysis from '@/app/Componentes/MCPIA/Predictive';
import {HRChatbot} from '@/app/Componentes/MCPIA/HRChatbot';
import {DepartmentOptimization} from '@/app/Componentes/MCPIA/DepartmentOptimization';

/**
 * Tarjeta de herramienta: es un <button>, no un <div onClick>, para que se
 * pueda accionar con teclado y los lectores de pantalla la anuncien como
 * control. Antes usaba el Card de PrimeReact sin ninguna clase, que no trae
 * sombra ni padding propios y quedaba plana.
 */
function HerramientaCard({
  icono,
  titulo,
  descripcion,
  onClick,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col items-start rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="mb-4">{icono}</span>
      <h3 className="mb-2 font-heading text-xl font-bold text-foreground">{titulo}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{descripcion}</p>
    </button>
  );
}


export default function IAPage() {

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
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Herramientas de IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <HerramientaCard
                icono={<BrainCircuit size={40} className="text-primary" />}
                titulo="Análisis Predictivo"
                descripcion="Anticipa tendencias de rotación de personal y picos de productividad."
                onClick={() => setActiveComponent('predictive')}
              />
              <HerramientaCard
                icono={<Users size={40} className="text-sage-strong" />}
                titulo="Chatbot de RRHH"
                descripcion="Responde preguntas frecuentes de empleados sobre políticas y beneficios."
                onClick={() => setActiveComponent('chatbot')}
              />
              <HerramientaCard
                icono={<BarChart2 size={40} className="text-olive-strong" />}
                titulo="Optimización de Departamentos"
                descripcion="Analiza la estructura de la empresa para una mayor eficiencia."
                onClick={() => setActiveComponent('optimization')}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}

