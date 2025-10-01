import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { OfficeCard } from './OfficeCard';
import type { Department, Employee, Office,ModalContext } from '@/app/Interfas/Interfaces';


interface OfficesListProps {
  department: Department;
  employees: Employee[];
  onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
}

export const OfficesList: React.FC<OfficesListProps> = ({
  department,
  employees,
  onOpenModal
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">
          Oficinas ({department.oficinas?.length || 0})
        </h3>
        <Button
          icon={<PlusCircle className="w-5 h-5 mr-1" />}
          label="Crear Oficina"
          onClick={() =>
            onOpenModal("office", null, {
              departmentId: department.id,
            })
          }
          severity="success"
        />
      </div>
      
      {department.oficinas?.length > 0 ? (
        department.oficinas.map((office) => (
          <OfficeCard
            key={office.id}
            office={office}
            onEdit={onOpenModal}
            employees={employees} 
          />
        ))
      ) : (
        <Card className="text-center py-8 border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            Este departamento no tiene oficinas asignadas.
          </p>
        </Card>
      )}
    </div>
  );
};