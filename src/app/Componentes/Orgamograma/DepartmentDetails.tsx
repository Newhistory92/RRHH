import React from 'react';
import { Card } from '../Card';
import { DepartmentHeader } from './DepartmentHeader';
import { DepartmentInfo } from './DepartmentInfo';
import { OfficesList } from './OfficesList';
import type { Department, Employee, Office,ModalContext  } from '@/app/Interfas/Interfaces';


interface DepartmentDetailsProps {
  department: Department;
  employees: Employee[];
  onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
}

export const DepartmentDetails: React.FC<DepartmentDetailsProps> = ({
  department,
  employees,
  onOpenModal
}) => {
  return (
    <Card className="animate-fade-in">
      <DepartmentHeader 
        department={department} 
        onOpenModal={onOpenModal} 
      />
      
      <p className="text-gray-600 mb-6">
        {department.descripcion}
      </p>
      
      <DepartmentInfo 
        department={department} 
        employees={employees} 
      />
      
      <OfficesList 
        department={department} 
        employees={employees} 
        onOpenModal={onOpenModal} 
      />
    </Card>
  );
};