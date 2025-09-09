import React from 'react';
import { Building2 } from 'lucide-react';
import { Card } from '../Card';

export const EmptyState: React.FC = () => {
  return (
    <Card className="flex flex-col items-center justify-center p-10 h-full">
      <Building2 className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700">
        Selecciona un departamento
      </h2>
      <p className="text-gray-500 mt-2">
        Elige un departamento del panel izquierdo para ver sus detalles
      </p>
    </Card>
  );
};