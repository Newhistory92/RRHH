import React from 'react';
import { Avatar } from 'primereact/avatar';
import type { DropdownOption} from '@/app/Interfas/Interfaces';
import type { Employee } from '@/app/Interfas/Interfaces';

export interface EmployeeTemplateProps {
  option: DropdownOption;
}

export interface SelectedEmployeeTemplateProps {
  option?: number | null; // Made optional and nullable
}

interface EmployeeTemplatesProps {
  employees: Employee[];
}

export const useEmployeeTemplates = ({ employees }: EmployeeTemplatesProps) => {

   
  const employeeOptionTemplate = ({ option }: EmployeeTemplateProps) => {
    console.log('Opción recibida en employeeOptionTemplate:', option);
    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={option.photo}
          label={option.name.charAt(0)}
          size="normal"
          shape="circle"
          className="w-8 h-8"
        />
        <span>{option.name}</span>
      </div>
    );
  };

  // Fixed: Handle the case where the entire parameter might be null/undefined
  const selectedEmployeeTemplate = (param: SelectedEmployeeTemplateProps | null | undefined) => {
    console.log('Parámetro recibido en selectedEmployeeTemplate:', param);
        
    // Handle cases where param is null/undefined or option is null/undefined
    if (!param || !param.option) {
      return <span>Seleccionar empleado</span>;
    }
        
    // Buscar el empleado por ID en la lista de empleados
    const selectedEmployee = employees.find(emp => emp.id === param.option);
        
    if (!selectedEmployee) {
      return <span>Seleccionar empleado</span>;
    }
        
    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={selectedEmployee.photo}
          label={selectedEmployee.name.charAt(0)}
          size="normal"
          shape="circle"
          className="w-6 h-6"
        />
        <span>{selectedEmployee.name}</span>
      </div>
    );
  };

  const employeeMultiSelectTemplate = ({ option }: EmployeeTemplateProps) => {
    console.log('Opción recibida en employeeMultiSelectTemplate:', option);
    const employee = employees.find(emp => emp.id === option.value);
    if (!employee) return null;

    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={employee.photo}
          label={employee.name.charAt(0)}
          size="normal"
          shape="circle"
          className="w-6 h-6"
        />
        <span>{employee.name}</span>
      </div>
    );
  };

  return {
    employeeOptionTemplate,
    selectedEmployeeTemplate,
    employeeMultiSelectTemplate
  };
};