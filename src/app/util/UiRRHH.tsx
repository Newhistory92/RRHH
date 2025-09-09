import { ReactNode } from 'react';
import Image from "next/image";
import { Tag } from 'primereact/tag';        
import {TechnicalSkill,Employee} from '@/app/Interfas/Interfaces';

interface Department {
  habilidades_requeridas?: TechnicalSkill[];
}
interface InfoCardProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  children: ReactNode;
}

interface EmployeeAvatarProps {
  employeeId: number;
  employees: Employee[];
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const statusClasses: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'De licencia': 'bg-yellow-100 text-yellow-800',
    'Parte médico': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

export const HoursDisplay = ({ hours }: { hours: number }) => {
  const classes = hours >= 0 ? 'text-blue-600' : 'text-orange-600';
  const sign = hours > 0 ? '+' : '';
  return <span className={`font-semibold ${classes}`}>{sign}{hours.toFixed(2)}hs</span>;
};

export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
    <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4 h-full">
        <Icon className="text-gray-400 mt-1 flex-shrink-0" size={20}/>
        <div>
            <h4 className="font-semibold text-gray-600">{title}</h4>
            <div className="text-gray-800 text-sm">{children}</div>
        </div>
    </div>
);



export const SkillsDisplay = ({ selectedDepartment }: { selectedDepartment?: Department }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {selectedDepartment?.habilidades_requeridas?.map((skill: TechnicalSkill) => (
        <Tag 
          key={skill.id} 
          value={`${skill.nombre} (${skill.nivel})`} 
          severity="info"
        />
      ))}
    </div>
  );
};


export const EmployeeAvatar = ({ 
  employeeId, 
  employees, 
  showName = true, 
  size = 'md' 
}: EmployeeAvatarProps) => {
  const employee = employees.find((e) => e.id === employeeId);
  
  if (!employee) return null;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-2" title={employee.name}>
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-md`}>
        <Image
          src={employee.photo || '/default-avatar.png'}
          alt={`Foto de ${employee.name}`}
          fill
          className="object-cover"
          sizes={`${size === 'sm' ? '48px' : size === 'md' ? '64px' : '96px'}`}
        />
      </div>
      {showName && (
        <span className={`text-gray-700 ${textSizeClasses[size]} font-medium`}>
          {employee.name}
        </span>
      )}
    </div>
  );
};

// Versión simplificada si solo necesitas el avatar sin nombre
export const EmployeeAvatarIcon = ({ 
  employeeId, 
  employees,
  size = 'md'
}: Omit<EmployeeAvatarProps, 'showName'>) => {
  return <EmployeeAvatar employeeId={employeeId} employees={employees} showName={false} size={size} />;
};