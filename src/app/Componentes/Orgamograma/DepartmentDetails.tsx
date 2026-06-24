import React from 'react';
import { Card } from 'primereact/card';
import { DepartmentHeader } from './DepartmentHeader';
import { DepartmentInfo } from './DepartmentInfo';
import { OfficesList } from './OfficesList';
import { EmployeeAvatar } from '../../util/UiRRHH';
import type { Department, Employee, Office, ModalContext } from '@/app/Interfas/Interfaces';


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

      <p className="text-muted-foreground mb-6">
        {department.descripcion}
      </p>

      <DepartmentInfo
        department={department}
        employees={employees}
      />
      <div className="my-6">
        <h3 className="font-heading text-xl font-bold mb-3 text-foreground">Empleados del Departamento</h3>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex flex-wrap gap-3">
            {department.employees && department.employees.length > 0 ? (
              department.employees.map(emp => (
                <div
                  key={emp.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border"
                >
                  <EmployeeAvatar
                    employeeId={emp.id}
                    employees={employees}
                    showName={true}
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">No hay empleados asignados directamente a este departamento.</p>
            )}
          </div>
        </div>
      </div>

      <OfficesList
        department={department}
        employees={employees}
        onOpenModal={onOpenModal}
      />
    </Card>
  );
};