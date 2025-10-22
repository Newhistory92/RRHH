import { ReactElement, ReactNode, useState } from 'react';
import Image from "next/image";
import { Tag} from 'primereact/tag';        
import {TechnicalSkill,Employee,Skill,Usuario,Role} from '@/app/Interfas/Interfaces';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Camera,CheckCircle, Activity, TrendingDown, AlertTriangle,Plus,SquarePen} from "lucide-react";
import { useRef, ChangeEvent } from "react";
import React from 'react';
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

export interface ProfilePictureUploaderProps {
    photo: string;
    setPhoto: (photo: string) => void;
    isEditing: boolean;
}

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  colorClass?: string;
}

type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";

// Props para RiskBadge
interface RiskBadgeProps {
  risk: RiskLevel;
  score: number;
}


interface InfoListProps {
  title: string;
  items: string[];
  icon: ReactElement<{ className?: string }>;
  colorClass: string;
}

// --- Props Interfaces ---
interface UsersTableProps {
    users: Usuario[];
    onEdit?: (user: Usuario) => void;
    onToggleStatus: (userId: number) => void;
}

interface RolesGridProps {
    roles: Role[];
    onEdit: (role: Role | null) => void;
}

interface UserEditModalProps {
    user:Usuario;
    roles: Role[];
    onClose: () => void;
     onSave: (formData: {
    name: string;
    dni: string;
    gender: string;
    role: string;
  }) => void;
   onRoleChange: (userId: number, role: string) => void; 
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
          value={`${skill.nombre} (${skill.level})`} 
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




export const SkillCard = ({
  skill,
  onStartTest,
}: {
  skill: Skill;
  onStartTest: (skill: Skill) => void;
}) => {
  const isLocked =
    skill.status === "locked" &&
    skill.unlockDate &&
    new Date() < new Date(skill.unlockDate);
  const isValidated = skill.status === "validated";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const footer = (
    <div className="flex justify-end mt-2">
      {!isValidated && (
        <Button
          label="Comenzar Prueba"
          icon="pi pi-bolt"
          onClick={() => onStartTest(skill)}
           disabled={isLocked === true}
          className="p-button-sm"
        />
      )}
    </div>
  );

  return (
    <Card title={skill.name} footer={footer} className="h-full flex flex-col">
      <div className="flex-grow">
        <p className="text-gray-600 text-sm mb-4">{skill.description}</p>
        {isValidated && (
          <div>
            <Tag
              severity="success"
              value="Validado"
              icon="pi pi-check-circle"
              className="mb-2"
            />
            <ProgressBar
              value={skill.level * 10}
              style={{ height: "8px" }}
              showValue={false}
            ></ProgressBar>
            <small>Nivel: {skill.level}/10</small>
          </div>
        )}
        {isLocked && skill.unlockDate && (
          <Tag severity="danger" icon="pi pi-lock">
            Bloqueado hasta: {formatDate(skill.unlockDate)}
          </Tag>
        )}
      </div>
    </Card>
  );
};





export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({ 
    photo, 
    setPhoto, 
    isEditing 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    setPhoto(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative group w-36 h-36">
                <Image
                    src={photo} 
                    alt="Foto de Perfil" 
                    width={360} 
                    height={360} 
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" 
                />
                {isEditing && (
                    <button 
                        onClick={handleClick} 
                        className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        type="button"
                        aria-label="Cambiar foto de perfil"
                    >
                        <div className="text-white text-center">
                            <Camera className="w-8 h-8 mx-auto" />
                            <span className="text-sm font-semibold">Cambiar foto</span>
                        </div>
                    </button>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg, image/png, image/jpg, image/webp" 
                    className="hidden"
                />
            </div>
        </div>
    );
};




export const getScoreColor = (score: number | undefined) => {
  if (score === undefined) return 'bg-gray-200 dark:bg-gray-700';
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 7) return 'bg-lime-500';
  if (score >= 5) return 'bg-yellow-500';
  if (score >= 3) return 'bg-orange-500';
  return 'bg-red-500';
};


export const SoftSkillBar = ({ skill, score }: { skill: string; score: number | undefined  }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{skill}</span>
            <span className={`text-sm font-bold text-gray-700 dark:text-gray-200`}>{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${(score || 0) * 10}%` }}></div>
        </div>
    </div>
);



export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:border-cyan-400">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, score }) => {
  const riskStyles: Record<RiskLevel, string> = {
    "Bajo": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "Medio": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    "Alto": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    "Crítico": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${riskStyles[risk]}`}>
      {risk === "Bajo" && <CheckCircle size={16} />}
      {risk === "Medio" && <Activity size={16} />}
      {risk === "Alto" && <TrendingDown size={16} />}
      {risk === "Crítico" && <AlertTriangle size={16} />}
      <span>{risk}</span>
      <span className="font-mono text-xs opacity-70">({score}%)</span>
    </div>
  );
};


export const InfoList: React.FC<InfoListProps> = ({ title, items, icon, colorClass }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {React.cloneElement(icon, { className: `w-5 h-5 ${colorClass}` })}
      <h4 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
    </div>
    <ul className="space-y-2 pl-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span
            className={`mt-1 w-1.5 h-1.5 rounded-full ${colorClass.replace("text-", "bg-")}`}
          ></span>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  </div>
);
export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onToggleStatus }) => (

 
    <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase font-semibold">
                <tr>
                    <th scope="col" className="px-6 py-3">Usuario</th>
                    <th scope="col" className="px-6 py-3 hidden lg:table-cell">Nombre</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">DNI</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Rol</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Departamento/Oficina</th>
                    <th scope="col" className="px-6 py-3 hidden sm:table-cell">Estado</th>
                    <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-medium whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                                <Image
                                     className={`h-8 w-8 rounded-full object-cover ${!user.activo ? 'filter grayscale' : ''}`}
                                    src={user.avatar}
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                />
                                <span className={!user.activo ? 'text-gray-400' : 'text-white'}>
                  {user.usuario}
                </span>
                            </div>
                        </td>
                        <td className={`px-6 py-4 hidden lg:table-cell ${!user.activo ? 'text-gray-400' : ''}`}>{user.name}</td>
                        <td className={`px-6 py-4 hidden md:table-cell ${!user.activo ? 'text-gray-400' : ''}`}>{user.dni}</td>
                        <td className={`px-6 py-4 hidden md:table-cell${!user.activo ? 'text-gray-400' : ''}`}>{user.role}</td>
                        <td className={`px-6 py-4 hidden md:table-cell ${!user.activo ? 'text-gray-400' : ''}`}>{user.department || user.office}</td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                            {user.activo ? (
                <span className="bg-green-900 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Activo
                </span>
              ) : (
                <span className="bg-gray-600 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Inactivo
                </span>
              )}
                        </td>
                       <td className="px-6 py-4 text-center">
  {user.activo ? (

    <div className="flex items-center justify-center gap-3">
      {onEdit && (
        <Button
          onClick={() => onEdit(user)}
          className="border border-[#2ecbe7] text-[#1ABCD7] hover:bg-cyan-500/10 text-xs py-1 px-3 rounded-md transition"
          outlined
          label="Editar"
        />
      )}
      <Button
  onClick={() => onToggleStatus(user.id)}
  className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-md shadow-md transition"
  severity="danger"
  label="Desactivar"
/>

    </div>
  ) : (
    <div className="flex items-center justify-center">
      <Button
  onClick={() => onToggleStatus(user.id)}
  className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-3 rounded-md shadow-md transition"
  severity="success"
  label="Activar"
/>

    </div>
  )}
</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
            <div key={role.id} className="bg-gray-700 p-6 rounded-xl shadow-lg relative">
                <div className="absolute top-4 right-4">
                    <button onClick={() => onEdit(role)} className="text-gray-400 hover:text-white transition">
                        <SquarePen />
                    </button>
                </div>
                <h3 className={`font-bold text-lg text-${role.color}-400`}>{role.name}</h3>
                <p className="text-gray-400 mt-2 text-sm pr-8">{role.description}</p>
            </div>
        ))}
        <div 
            onClick={() => onEdit(null)} 
            className="border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center p-6 hover:border-cyan-500 hover:text-cyan-500 transition cursor-pointer"
        >
            <div className="text-center">
                <Plus />
                <p className="mt-2 font-semibold">Crear Nuevo Rol</p>
            </div>
        </div>
    </div>
);

export const ProfileSettings: React.FC = () => {
  // Mapeo de nombres en castellano a nombres reales de las tablas
  const tableMap: Record<string, string> = {
    "Formación Académica": "AcademicRecord",
    "Experiencia Laboral": "WorkExperience",
    "Idiomas": "Language",
    "Habilidades Técnicas": "TechnicalSkill",
    "Habilidades Blandas": "SoftSkill",
    "Certificaciones": "Certification",
    "Encuesta": "Feedback",
  };

  // Estado de los toggles
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Formación Académica": true,
    "Experiencia Laboral": true,
    "Idiomas": false,
    "Habilidades Técnicas": true,
    "Habilidades Blandas": false,
    "Certificaciones": true,
    "Encuesta": false,
  });

  // Maneja el cambio del toggle y hace el PUT al backend
  const handleToggleChange = async (setting: string) => {
    const newState = !toggles[setting];
    setToggles((prev) => ({ ...prev, [setting]: newState }));

    const tabla = tableMap[setting];
    const url = `http://127.0.0.1:8000/records/${tabla}/toggle`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: newState }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar ${setting}`);
      }

      console.log(`✅ ${setting} actualizado correctamente: ${newState}`);
    } catch (error) {
      console.error(`❌ Falló la actualización de ${setting}:`, error);
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h3 className="font-bold text-lg text-white">Configuración de Perfiles</h3>
      <p className="text-gray-400 mt-1 text-sm">
        Define los campos que los usuarios pueden gestionar en sus perfiles.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(toggles).map((setting) => (
          <div
            key={setting}
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
          >
            <p className="font-medium text-white">{setting}</p>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles[setting]}
                onChange={() => handleToggleChange(setting)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};


export const UserEditModal: React.FC<UserEditModalProps> = ({ user, roles, onClose, onSave,  onRoleChange }) => {
 const [formData, setFormData] = useState({
    name: user.name,
    dni: user.dni,
    gender: user.gender,
    role: user.role,
  });
  console.log(roles)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData); // enviamos los datos al padre
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-transform duration-300 scale-100">
        <h3 className="text-xl font-semibold mb-4 text-white">Editar Usuario</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              DNI
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
            >
              <option>Femenino</option>
              <option>Masculino</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rol
            </label>
           <select
  name="role"
  value={formData.role}
  onChange={(e) => {
    handleChange(e);
    onRoleChange(user.id, e.target.value); // actualiza el rol por separado
  }}
  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
>
  {roles.map((role) => (
    <option key={role.id} value={role.id}>
      {role.name}
    </option>
  ))}
</select>

          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RoleEditModal: React.FC<{ role: Role; onClose: () => void; onSave: (e: React.FormEvent<HTMLFormElement>) => void }> = 
    ({ role, onClose, onSave }) => {
    const isCreating = !role.id;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">{isCreating ? "Crear Nuevo Rol" : "Editar Rol"}</h3>
                <form onSubmit={onSave}>
                    <input type="hidden" name="editRoleId" defaultValue={role.id || ''} />
                    <div className="mb-4">
                        <label htmlFor="editRoleName" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Rol</label>
                        <input type="text" id="editRoleName" name="editRoleName" defaultValue={role.name} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="editRoleDescription" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                        <textarea id="editRoleDescription" name="editRoleDescription" rows={3} defaultValue={role.description} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};