import React from 'react';
import { Building2 } from 'lucide-react';
import { Card } from 'primereact/card';
        

export const EmptyState: React.FC = () => {
  return (
    <Card className="flex flex-col items-center justify-center p-10 h-full">
      <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Selecciona un departamento
      </h2>
      <p className="text-muted-foreground mt-2">
        Elige un departamento del panel izquierdo para ver sus detalles
      </p>
    </Card>
  );
};