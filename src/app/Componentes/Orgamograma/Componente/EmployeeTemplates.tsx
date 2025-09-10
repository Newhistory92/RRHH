import React from 'react';
import { Avatar } from 'primereact/avatar';
import type { DropdownOption,Employee } from '@/app/Interfas/Interfaces';


export interface EmployeeTemplateProps {
  option: DropdownOption;
}

interface EmployeeTemplatesProps {
  employees: Employee[];
}

export interface SelectedEmployeeTemplateProps {
  option?: number | null;
}
export interface DropdownChangeEvent {
  value: number | number[] | null;
  target: {
    name?: string;
    value: number | number[] | null;
  };
}

export type SelectedEmployeeOptionParam = number | EmployeeOptionParam | null;
export interface EmployeeOptionParam {
  value: number;
  label?: string;
  name?: string;
}
export const useEmployeeTemplates = ({ employees }: EmployeeTemplatesProps) => {

   

  const employeeOptionTemplate = (option: EmployeeOptionParam) => {
    if (!option) return null;
    
    const employee = employees.find(emp => emp.id === option.value);
    if (!employee) return null;

    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={employee.photo}
          label={employee.name.charAt(0)}
          size="normal"
          shape="circle"
          className="w-8 h-8"
        />
        <span>{employee.name}</span>
      </div>
    );
  };


 const selectedEmployeeTemplate = (option: SelectedEmployeeOptionParam) => {

    if (!option) return <span>Seleccionar empleado</span>;
    const employeeId = typeof option === 'object' ? option.value : option;
      
    const employee = employees.find(emp => emp.id === employeeId); 
    if (!employee) return <span>{`Empleado no encontrado (ID: ${employeeId})`}</span>;
    
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

  const selectedMultiSelectEmployeeTemplate = (option: SelectedEmployeeTemplateProps) => {
    if (!option) return null;
    
    const employee = employees.find(emp => emp.id === option);
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


  const employeeMultiSelectTemplate = (option: DropdownChangeEvent) => {
    if (!option) return null;
    
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
    selectedMultiSelectEmployeeTemplate,
    employeeMultiSelectTemplate
  };
};