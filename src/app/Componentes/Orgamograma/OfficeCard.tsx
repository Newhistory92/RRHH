
import React from 'react';
import { Briefcase, Pencil } from 'lucide-react';
import Image from 'next/image';
import { EmployeeAvatar } from '../../util/UiRRHH';
import type { Office, Employee } from '@/app/Interfas/Interfaces';

interface OfficeCardProps {
  office: Office;
  onEdit: (type: 'office', office: Office) => void;
  employees: Employee[]; 
}

export const OfficeCard: React.FC<OfficeCardProps> = ({ office, onEdit, employees }) => {
  // Validación para asegurar que employees existe
  if (!employees || !Array.isArray(employees)) {
    console.error('OfficeCard: employees prop is undefined or not an array');
    return <div className="text-error">Error: No se pudieron cargar los datos de empleados</div>;
  }

  return (
    <div className="bg-muted border border-border rounded-lg p-4 mb-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-foreground flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-primary" />
            {office.nombre}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{office.descripcion}</p>
        </div>
        <button
          onClick={() => onEdit("office", office)}
          className="text-muted-foreground hover:text-primary p-1"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <h5 className="font-semibold text-sm mb-2">Jefe de Oficina:</h5>
        <div className="flex items-center p-2 bg-card rounded-md">
          {office.jefeId ? (
            <EmployeeAvatar
              employeeId={office.jefeId}
              employees={employees}
              showName={true}
              size="md"
            />
          ) : (
            <span className="text-sm text-muted-foreground italic">No asignado</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h5 className="font-semibold text-sm mb-2">
          Empleados ({office.empleadosIds?.length || 0}):
        </h5>
        {!office.empleadosIds || office.empleadosIds.length === 0 ? (
          <span className="text-sm text-muted-foreground italic">
            Sin empleados asignados
          </span>
        ) : (
          <ul className="space-y-2 pt-2">
            {office.empleadosIds.map((id: number) => {
              const emp = employees.find((e: Employee) => e.id === id);
              return emp ? (
                <li key={id} className="flex items-center text-sm">
                  <Image
                    src={emp.photo}
                    alt={emp.name}
                    title={emp.name}
                    className="w-6 h-6 rounded-full mr-3 border-2 border-border"
                    width={24}
                    height={24}
                  />
                  {emp.name}
                </li>
              ) : null;
            })}
          </ul>
        )}
      </div>
    </div>
  );
};