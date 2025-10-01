import React from 'react';
import { Star } from 'lucide-react';
import { Card } from 'primereact/card';
import { SkillsDisplay, EmployeeAvatar } from '../../util/UiRRHH';
import type { Department, Employee } from '@/app/Interfas/Interfaces';

interface DepartmentInfoProps {
  department: Department;
  employees: Employee[];
}

export const DepartmentInfo: React.FC<DepartmentInfoProps> = ({
  department,
  employees
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-gray-50 p-4">
        <h4 className="font-bold mb-2 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Jefe de Área
        </h4>
        <div className="flex items-center">
          {department.jefeId ? (
            <EmployeeAvatar
              employeeId={department.jefeId}
              employees={employees} 
              showName={true}
              size="md"
            /> 
          ) : (
            <span className="text-gray-500 italic">No asignado</span>
          )}
        </div>
      </Card>
      
      <Card className="bg-gray-50 p-4">
        <h4 className="font-bold mb-2">Habilidades Clave</h4>
        <div className="flex flex-wrap gap-2">
          <SkillsDisplay selectedDepartment={department} />
        </div>
      </Card>
    </div>
  );
};