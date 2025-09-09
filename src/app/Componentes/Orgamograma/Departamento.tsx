import React from 'react';
import { DepartmentTree } from './DepartmentTree';
import { DepartmentDetails } from './DepartmentDetails';
import { EmptyState } from './EmptyState';
import type { Department, Employee, Office,ModalContext  } from '@/app/Interfas/Interfaces';
export interface DepartmentManagementViewProps {
  departmentsData: Department[];
  onSelect: (department: Department) => void;
  selectedDepartment: Department | null;
  onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
  employees: Employee[];
}
export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({
  departmentsData,
  onSelect,
  selectedDepartment,
  onOpenModal,
  employees
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <DepartmentTree
        departmentsData={departmentsData}
        selectedDepartment={selectedDepartment}
        onSelect={onSelect}
        onOpenModal={onOpenModal}
      />
      
      <main className="md:w-2/3 lg:w-3/4">
        {selectedDepartment ? (
          <DepartmentDetails
            department={selectedDepartment}
            employees={employees}
            onOpenModal={onOpenModal}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};