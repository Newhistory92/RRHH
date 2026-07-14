import React from 'react';
import { Building2, Pencil } from 'lucide-react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { CapacityBadge } from './CapacityBadge';
import type { Department, Office,ModalContext } from '@/app/Interfas/Interfaces';

interface DepartmentHeaderProps {
  department: Department;
  onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
}

export const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({
  department,
  onOpenModal
}) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground flex items-center">
          <Building2 className="w-8 h-8 mr-3 text-primary" />
          {department.nombre}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <Tag
            value={`Nivel Jerárquico: ${department.nivel_jerarquico}`}
            severity="secondary"
          />
          <CapacityBadge asignados={department.asignados} capacidadRequerida={department.capacidadRequerida} />
        </div>
      </div>
      <Button
        icon={<Pencil className="w-4 h-4" />}
        link
        label="Editar Departamento"
        onClick={() => onOpenModal("department", department)}
        className="p-button-text p-button-sm"
      />
    </div>
  );
};