// import { ReactElement, ReactNode, useState, useEffect } from 'react';
// import Image from "next/image";
// import { Tag } from 'primereact/tag';
// import { TechnicalSkill, Employee, Skill, Usuario, Role } from '@/app/Interfas/Interfaces';
// import { Card } from 'primereact/card';
// import { ProgressBar } from 'primereact/progressbar';
// import { Button } from 'primereact/button';
// import { Camera, CheckCircle, Activity, TrendingDown, AlertTriangle, Plus, SquarePen } from "lucide-react";
// import { useRef, ChangeEvent } from "react";
// import React from 'react';
// interface Department {
//   habilidades_requeridas?: TechnicalSkill[];
// }
// interface InfoCardProps {
//   icon: React.ComponentType<{ className?: string; size?: number }>;
//   title: string;
//   children: ReactNode;
// }

// interface EmployeeAvatarProps {
//   employeeId: number;
//   employees: Employee[];
//   showName?: boolean;
//   size?: 'sm' | 'md' | 'lg';
// }

// export interface ProfilePictureUploaderProps {
//   photo: string;
//   setPhoto: (photo: string) => void;
//   isEditing: boolean;
// }

// interface StatCardProps {
//   icon: ReactNode;
//   title: string;
//   value: string | number;
//   colorClass?: string;
// }

// type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";

// // Props para RiskBadge
// interface RiskBadgeProps {
//   risk: RiskLevel;
//   score: number;
// }


// interface InfoListProps {
//   title: string;
//   items: string[];
//   icon: ReactElement<{ className?: string }>;
//   colorClass: string;
// }

// // --- Props Interfaces ---
// interface UsersTableProps {
//   users: Usuario[];
//   onEdit?: (user: Usuario) => void;
//   onToggleStatus: (userId: number) => void;
// }

// interface RolesGridProps {
//   roles: Role[];
//   onEdit: (role: Role | null) => void;
// }

// interface UserEditModalProps {
//   user: Usuario;
//   roles: Role[];
//   onClose: () => void;
//   onSave: (formData: {
//     name: string;
//     dni: string;
//     gender: string;
//     role: string;
//   }) => void;
//   onRoleChange: (userId: number, role: string) => void;
// }




// export const StatusBadge = ({ status }: { status: string }) => {
//   const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
//   const statusClasses: Record<string, string> = {
//     'Activo': 'bg-green-100 text-green-800',
//     'De licencia': 'bg-yellow-100 text-yellow-800',
//     'Parte médico': 'bg-red-100 text-red-800',
//   };
//   return <span className={`${baseClasses} ${statusClasses[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>;
// };

// export const HoursDisplay = ({ hours }: { hours: number | null }) => {
//   const safeHours = hours ?? 0; // si es null o undefined, usar 0
//   const classes = safeHours >= 0 ? 'text-blue-600' : 'text-orange-600';
//   const sign = safeHours > 0 ? '+' : '';
//   return (
//     <span className={`font-semibold ${classes}`}>
//       {sign}{safeHours.toFixed(2)}hs
//     </span>
//   );

// }; export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
//   <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4 h-full">
//     <Icon className="text-gray-400 mt-1 flex-shrink-0" size={20} />
//     <div className="flex-1 min-w-0">
//       <h4 className="font-semibold text-gray-600">{title}</h4>
//       <div className="text-gray-800 text-sm">{children}</div>
//     </div>
//   </div>
// );



// export const SkillsDisplay = ({ selectedDepartment }: { selectedDepartment?: Department }) => {
//   return (
//     <div className="flex flex-wrap gap-2">
//       {selectedDepartment?.habilidades_requeridas?.map((skill: TechnicalSkill) => (
//         <Tag
//           key={skill.id}
//           value={`${skill.nombre} (${skill.level})`}
//           severity="info"
//         />
//       ))}
//     </div>
//   );
// };

// export const EmployeeAvatar = ({
//   employeeId,
//   employees,
//   showName = true,
//   size = 'md'
// }: EmployeeAvatarProps) => {
//   const employee = employees.find((e) => e.id === employeeId);

//   if (!employee) return null;

//   const sizeClasses = {
//     sm: 'w-12 h-12',
//     md: 'w-16 h-16',
//     lg: 'w-24 h-24'
//   };

//   const textSizeClasses = {
//     sm: 'text-xs',
//     md: 'text-sm',
//     lg: 'text-base'
//   };

//   const pixelSize = { sm: 48, md: 64, lg: 96 };

//   return (
//     <div className="flex items-center gap-2" title={employee.name}>
//       <div
//         className={`
//           relative flex-shrink-0
//           ${sizeClasses[size]}
//           rounded-full overflow-hidden
//           border-2 border-white shadow-md
//         `}
//       >
//         <Image
//           src={employee.photo || '/Default-avatar.webp'}
//           alt={`Foto de ${employee.name}`}
//           width={pixelSize[size]}
//           height={pixelSize[size]}
//           className="w-full h-full object-cover rounded-full"
//         />
//       </div>
//       {showName && (
//         <span className={`text-gray-700 ${textSizeClasses[size]} font-medium`}>
//           {employee.name}
//         </span>
//       )}
//     </div>
//   );
// };
// // Versión simplificada si solo necesitas el avatar sin nombre
// export const EmployeeAvatarIcon = ({
//   employeeId,
//   employees,
//   size = 'md'
// }: Omit<EmployeeAvatarProps, 'showName'>) => {
//   return <EmployeeAvatar employeeId={employeeId} employees={employees} showName={false} size={size} />;
// };




// export const SkillCard = ({
//   skill,
//   onStartTest,
// }: {
//   skill: Skill;
//   onStartTest: (skill: Skill) => void;
// }) => {
//   const isLocked =
//     skill.status === "locked" &&
//     skill.unlockDate &&
//     new Date() < new Date(skill.unlockDate);
//   const isValidated = skill.status === "validated";

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   const footer = (
//     <div className="flex justify-end mt-2">
//       {!isValidated && (
//         <Button
//           label="Comenzar Prueba"
//           icon="pi pi-bolt"
//           onClick={() => onStartTest(skill)}
//           disabled={isLocked === true}
//           className="p-button-sm"
//         />
//       )}
//     </div>
//   );

//   return (
//     <Card title={skill.name} footer={footer} className="h-full flex flex-col">
//       <div className="flex-grow">
//         <p className="text-gray-600 text-sm mb-4">{skill.description}</p>
//         {isValidated && (
//           <div>
//             <Tag
//               severity="success"
//               value="Validado"
//               icon="pi pi-check-circle"
//               className="mb-2"
//             />
//             <ProgressBar
//               value={skill.level * 10}
//               style={{ height: "8px" }}
//               showValue={false}
//             ></ProgressBar>
//             <small>Nivel: {skill.level}/10</small>
//           </div>
//         )}
//         {isLocked && skill.unlockDate && (
//           <Tag severity="danger" icon="pi pi-lock">
//             Bloqueado hasta: {formatDate(skill.unlockDate)}
//           </Tag>
//         )}
//       </div>
//     </Card>
//   );
// };



// export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
//   photo,
//   setPhoto,
//   isEditing
// }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         if (reader.result && typeof reader.result === 'string') {
//           setPhoto(reader.result);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleClick = () => {
//     if (!isEditing) return;
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <div className="relative group flex-shrink-0 w-36 h-36">
//         <Image
//           src={photo || '/Default-avatar.webp'}
//           alt="Foto de Perfil"
//           width={144}
//           height={144}
//           className="w-full h-full rounded-full object-cover object-center border-4 border-white shadow-lg"
//         />
//         {isEditing && (
//           <button
//             onClick={handleClick}
//             className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
//             type="button"
//             aria-label="Cambiar foto de perfil"
//           >
//             <div className="text-white text-center">
//               <Camera className="w-8 h-8 mx-auto" />
//               <span className="text-sm font-semibold">Cambiar foto</span>
//             </div>
//           </button>
//         )}
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           accept="image/jpeg, image/png, image/jpg, image/webp"
//           className="hidden"
//         />
//       </div>
//     </div>
//   );
// };



// export const getScoreColor = (score: number | undefined) => {
//   if (score === undefined) return 'bg-gray-200 dark:bg-gray-700';
//   if (score >= 9) return 'bg-emerald-500';
//   if (score >= 7) return 'bg-lime-500';
//   if (score >= 5) return 'bg-yellow-500';
//   if (score >= 3) return 'bg-orange-500';
//   return 'bg-red-500';
// };


// export const SoftSkillBar = ({ skill, score }: { skill: string; score: number | undefined }) => (
//   <div className="mb-3">
//     <div className="flex justify-between items-center mb-1">
//       <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{skill}</span>
//       <span className={`text-sm font-bold text-gray-700 dark:text-gray-200`}>{score}/10</span>
//     </div>
//     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
//       <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${(score || 0) * 10}%` }}></div>
//     </div>
//   </div>
// );



// export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
//   <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:border-cyan-400">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
//         <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
//       </div>
//       <div className={`p-3 rounded-full ${colorClass}`}>
//         {icon}
//       </div>
//     </div>
//   </div>
// );

// export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, score }) => {
//   const riskStyles: Record<RiskLevel, string> = {
//     "Bajo": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
//     "Medio": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
//     "Alto": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
//     "Crítico": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
//   };

//   return (
//     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${riskStyles[risk]}`}>
//       {risk === "Bajo" && <CheckCircle size={16} />}
//       {risk === "Medio" && <Activity size={16} />}
//       {risk === "Alto" && <TrendingDown size={16} />}
//       {risk === "Crítico" && <AlertTriangle size={16} />}
//       <span>{risk}</span>
//       <span className="font-mono text-xs opacity-70">({score}%)</span>
//     </div>
//   );
// };


// export const InfoList: React.FC<InfoListProps> = ({ title, items, icon, colorClass }) => (
//   <div>
//     <div className="flex items-center gap-2 mb-3">
//       {React.cloneElement(icon, { className: `w-5 h-5 ${colorClass}` })}
//       <h4 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
//     </div>
//     <ul className="space-y-2 pl-2">
//       {items.map((item, idx) => (
//         <li key={idx} className="flex items-start gap-3">
//           <span
//             className={`mt-1 w-1.5 h-1.5 rounded-full ${colorClass.replace("text-", "bg-")}`}
//           ></span>
//           <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
//         </li>
//       ))}
//     </ul>
//   </div>
// );
// export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onToggleStatus }) => (
//   <div className="overflow-x-auto bg-gray-900 rounded-xl">
//     <table className="min-w-full text-xs text-left text-gray-300">
//       <thead className="bg-gray-800 text-xs uppercase font-semibold tracking-wide">
//         <tr>
//           <th scope="col" className="px-3 py-2">Usuario</th>
//           <th scope="col" className="px-3 py-2 hidden lg:table-cell">Nombre</th>
//           <th scope="col" className="px-3 py-2 hidden md:table-cell">DNI</th>
//           <th scope="col" className="px-3 py-2 hidden md:table-cell">Rol</th>
//           <th scope="col" className="px-3 py-2 hidden md:table-cell">Depto / Oficina</th>
//           <th scope="col" className="px-3 py-2 hidden sm:table-cell">Estado</th>
//           <th scope="col" className="px-3 py-2 text-center">Acciones</th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-gray-700/50">
//         {users.map(user => (
//           <tr key={user.id} className="hover:bg-gray-700/40 transition-colors">

//             {/* Usuario */}
//             <td className="px-3 py-2 whitespace-nowrap">
//               <div className="flex items-center gap-2">
//                 <Image
//                   className={`h-7 w-7 rounded-full object-cover flex-shrink-0 ${!user.activo ? 'grayscale opacity-60' : ''}`}
//                   src={user.avatar}
//                   alt={user.name}
//                   width={28}
//                   height={28}
//                 />
//                 <span className={`font-medium ${!user.activo ? 'text-gray-500' : 'text-white'}`}>
//                   {user.usuario}
//                 </span>
//               </div>
//             </td>

//             {/* Nombre */}
//             <td className={`px-3 py-2 hidden lg:table-cell ${!user.activo ? 'text-gray-500' : 'text-gray-200'}`}>
//               {user.name}
//             </td>

//             {/* DNI */}
//             <td className={`px-3 py-2 hidden md:table-cell ${!user.activo ? 'text-gray-500' : 'text-gray-300'}`}>
//               {user.dni}
//             </td>

//             {/* Rol */}
//             <td className={`px-3 py-2 hidden md:table-cell ${!user.activo ? 'text-gray-500' : 'text-gray-300'}`}>
//               {user.role}
//             </td>

//             {/* Depto / Oficina */}
//             <td className={`px-3 py-2 hidden md:table-cell ${!user.activo ? 'text-gray-500' : 'text-gray-300'}`}>
//               {user.department || user.office || '—'}
//             </td>

//             {/* Estado */}
//             <td className="px-3 py-2 hidden sm:table-cell">
//               {user.activo ? (
//                 <span className="bg-green-900/60 text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
//                   Activo
//                 </span>
//               ) : (
//                 <span className="bg-gray-700 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
//                   Inactivo
//                 </span>
//               )}
//             </td>

//             {/* Acciones */}
//             <td className="px-2 py-1 text-center">
//               {user.activo ? (
//                 <div className="flex items-center justify-center gap-2">
//                   {onEdit && (
//                     <Button
//                       onClick={() => onEdit(user)}
//                       className="text-[11px] py-0.5 px-2 rounded border border-[#2ecbe7] text-[#1ABCD7] hover:bg-cyan-500/10 transition leading-tight"
//                       outlined
//                       text
//                       label="Editar"
//                       size="small"
//                     />
//                   )}
//                   <Button
//                     onClick={() => onToggleStatus(user.id)}
//                     className="text-[11px] py-0.5 px-2 rounded bg-red-600/80 hover:bg-red-600 text-white transition leading-tight"
//                     severity="danger" text raised
//                     label="Desactivar"
//                     size="small"
//                   />
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center">
//                   <Button
//                     onClick={() => onToggleStatus(user.id)}
//                     className="text-[11px] py-0.5 px-2 rounded bg-green-600/80 hover:bg-green-600 text-white transition leading-tight"
//                     severity="success"
//                     text raised
//                     label="Activar"

//                   />
//                 </div>
//               )}
//             </td>

//           </tr>
//         ))}

//         {users.length === 0 && (
//           <tr>
//             <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
//               No hay usuarios para mostrar.
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// );

// export const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//     {roles.map(role => (
//       <div key={role.id} className="bg-gray-700 p-6 rounded-xl shadow-lg relative">
//         <div className="absolute top-4 right-4">
//           <button onClick={() => onEdit(role)} className="text-gray-400 hover:text-white transition">
//             <SquarePen />
//           </button>
//         </div>
//         <h3 className={`font-bold text-lg text-${role.color}-400`}>{role.name}</h3>
//         <p className="text-gray-400 mt-2 text-sm pr-8">{role.description}</p>
//       </div>
//     ))}
//     <div
//       onClick={() => onEdit(null)}
//       className="border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center p-6 hover:border-cyan-500 hover:text-cyan-500 transition cursor-pointer"
//     >
//       <div className="text-center">
//         <Plus />
//         <p className="mt-2 font-semibold">Crear Nuevo Rol</p>
//       </div>
//     </div>
//   </div>
// );

// export const ProfileSettings: React.FC = () => {
//   // Mapeo de nombres en castellano a nombres reales de las tablas
//   const tableMap: Record<string, string> = {
//     "Formación Académica": "AcademicRecord",
//     "Experiencia Laboral": "WorkExperience",
//     "Idiomas": "Language",
//     "Habilidades Técnicas": "TechnicalSkill",
//     "Habilidades Blandas": "SoftSkill",
//     "Certificaciones": "Certification",
//     "Encuesta": "Feedback",
//   };

//   // Estado de los toggles
//   const [toggles, setToggles] = useState<Record<string, boolean>>({
//     "Formación Académica": true,
//     "Experiencia Laboral": true,
//     "Idiomas": false,
//     "Habilidades Técnicas": true,
//     "Habilidades Blandas": false,
//     "Certificaciones": true,
//     "Encuesta": false,
//   });

//   // Cargar estado inicial desde el servidor
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch("http://127.0.0.1:8000/records/status", {
//           headers: { "Authorization": `Bearer ${token}` }
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setToggles({
//             "Formación Académica": data["AcademicRecord"] ?? true,
//             "Experiencia Laboral": data["WorkExperience"] ?? true,
//             "Idiomas": data["Language"] ?? true,
//             "Habilidades Técnicas": data["TechnicalSkill"] ?? true,
//             "Habilidades Blandas": data["SoftSkill"] ?? true,
//             "Certificaciones": data["Certification"] ?? true,
//             "Encuesta": data["Feedback"] ?? true,
//           });
//         }
//       } catch (error) {
//         console.error("Error al cargar estado de los toggles:", error);
//       }
//     };
//     fetchStatus();
//   }, []);

//   // Maneja el cambio del toggle y hace el PUT al backend
//   const handleToggleChange = async (setting: string) => {
//     const newState = !toggles[setting];
//     setToggles((prev) => ({ ...prev, [setting]: newState }));

//     const tabla = tableMap[setting];
//     const url = `http://127.0.0.1:8000/records/${tabla}/toggle`;

//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(url, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({ activo: newState }),
//       });

//       if (!response.ok) {
//         throw new Error(`Error al actualizar ${setting}`);
//       }

//       console.log(`✅ ${setting} actualizado correctamente: ${newState}`);
//     } catch (error) {
//       console.error(`❌ Falló la actualización de ${setting}:`, error);
//     }
//   };

//   return (
//     <div className="bg-gray-700 p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
//       <h3 className="font-bold text-lg text-white">Configuración de Perfiles</h3>
//       <p className="text-gray-400 mt-1 text-sm">
//         Define los campos que los usuarios pueden gestionar en sus perfiles.
//       </p>

//       <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {Object.keys(toggles).map((setting) => (
//           <div
//             key={setting}
//             className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
//           >
//             <p className="font-medium text-white">{setting}</p>

//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={toggles[setting]}
//                 onChange={() => handleToggleChange(setting)}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
//             </label>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


// export const UserEditModal: React.FC<UserEditModalProps> = ({ user, roles, onClose, onSave, onRoleChange }) => {
//   const [formData, setFormData] = useState({
//     name: user.name === 'No especificado' ? '' : user.name,
//     dni: user.dni === 'N/A' ? '' : user.dni,
//     gender: user.gender === 'No especificado' ? '' : user.gender,
//     role: user.role || "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     onSave(formData); // enviamos los datos al padre
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 transition-opacity duration-300">
//       <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-transform duration-300 scale-100">
//         <h3 className="text-xl font-semibold mb-4 text-white">Editar Usuario</h3>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               Nombre
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               DNI
//             </label>
//             <input
//               type="text"
//               name="dni"
//               value={formData.dni}
//               onChange={handleChange}
//               className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               Género
//             </label>
//             <select
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
//               required
//             >
//               <option value="">Seleccionar género</option>
//               <option value="Femenino">Femenino</option>
//               <option value="Masculino">Masculino</option>
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               Rol
//             </label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={(e) => {
//                 const newRole = e.target.value;
//                 setFormData((prev) => ({ ...prev, role: newRole }));
//               }}
//               className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"
//             >
//               {/* Opción por defecto */}
//               <option value="">Sin Rol Asignado</option>

//               {/* Lista de roles de la API */}
//               {roles.map((role) => (
//                 <option key={role.id} value={role.id}>
//                   {role.name}
//                 </option>
//               ))}
//             </select>
//           </div>



//           <div className="flex justify-end gap-3">
//             <Button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
//             >
//               Cancelar
//             </Button>
//             <Button
//               type="submit"
//               className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition"
//             >
//               {user.employee_id ? 'Actualizar Datos' : 'Guardar Datos'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export const RoleEditModal: React.FC<{ role: Role; onClose: () => void; onSave: (e: React.FormEvent<HTMLFormElement>) => void }> =
//   ({ role, onClose, onSave }) => {
//     const isCreating = !role.id;
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
//         <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
//           <h3 className="text-xl font-semibold mb-4 text-white">{isCreating ? "Crear Nuevo Rol" : "Editar Rol"}</h3>
//           <form onSubmit={onSave}>
//             <input type="hidden" name="editRoleId" defaultValue={role.id || ''} />
//             <div className="mb-4">
//               <label htmlFor="editRoleName" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Rol</label>
//               <input type="text" id="editRoleName" name="editRoleName" defaultValue={role.name} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" required />
//             </div>
//             <div className="mb-6">
//               <label htmlFor="editRoleDescription" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
//               <textarea id="editRoleDescription" name="editRoleDescription" rows={3} defaultValue={role.description} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"></textarea>
//             </div>
//             <div className="flex justify-end gap-3">
//               <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
//               <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition">Guardar</button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   };


import { ReactElement, ReactNode, useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from "next/image";
import { TechnicalSkill, Employee, Skill, Usuario, Role } from '@/app/Interfas/Interfaces';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Camera, CheckCircle, Activity, TrendingDown, AlertTriangle, Plus, SquarePen } from "lucide-react";
import { Tag } from 'primereact/tag';
import React from 'react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Department { habilidades_requeridas?: TechnicalSkill[] }
interface InfoCardProps { icon: React.ComponentType<{ className?: string; size?: number }>; title: string; children: ReactNode }
interface EmployeeAvatarProps { employeeId: number; employees: Employee[]; showName?: boolean; size?: 'sm' | 'md' | 'lg' }
export interface ProfilePictureUploaderProps { photo: string; setPhoto: (photo: string) => void; isEditing: boolean }
interface StatCardProps { icon: ReactNode; title: string; value: string | number; colorClass?: string }
interface InfoListProps { title: string; items: string[]; icon: ReactElement<{ className?: string }>; colorClass: string }
interface UsersTableProps { users: Usuario[]; onEdit?: (user: Usuario) => void; onToggleStatus: (userId: number) => void }
interface RolesGridProps { roles: Role[]; onEdit: (role: Role | null) => void }
interface UserEditModalProps {
  user: Usuario; roles: Role[]; onClose: () => void;
  onSave: (formData: { name: string; dni: string; gender: string; role: string }) => void;
  onRoleChange: (userId: number, role: string) => void;
}
type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";
interface RiskBadgeProps { risk: RiskLevel; score: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5 focus:outline-none focus:border-cyan-500 transition";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";

// ─── Componentes ──────────────────────────────────────────────────────────────

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'De licencia': 'bg-yellow-100 text-yellow-800',
    'Parte médico': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export const HoursDisplay = ({ hours }: { hours: number | null }) => {
  const h = hours ?? 0;
  return (
    <span className={`font-semibold ${h >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
      {h > 0 ? '+' : ''}{h.toFixed(2)}hs
    </span>
  );
};

export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
  <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 h-full shadow-sm border border-gray-100">
    <Icon className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</h4>
      <div className="text-gray-800 text-sm">{children}</div>
    </div>
  </div>
);

export const SkillsDisplay = ({ selectedDepartment }: { selectedDepartment?: Department }) => (
  <div className="flex flex-wrap gap-2">
    {selectedDepartment?.habilidades_requeridas?.map((skill) => (
      <Tag key={skill.id} value={`${skill.nombre} (${skill.level})`} severity="info" />
    ))}
  </div>
);

export const EmployeeAvatar = ({ employeeId, employees, showName = true, size = 'md' }: EmployeeAvatarProps) => {
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return null;

  const sz = { sm: { cls: 'w-8 h-8', px: 32 }, md: { cls: 'w-12 h-12', px: 48 }, lg: { cls: 'w-16 h-16', px: 64 } }[size];
  const textCls = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size];

  return (
    <div className="flex items-center gap-2" title={employee.name}>
      <div className={`relative flex-shrink-0 ${sz.cls} rounded-full overflow-hidden border-2 border-white shadow-sm`}>
        <Image
          src={employee.photo || '/Default-avatar.webp'}
          alt={employee.name}
          width={sz.px} height={sz.px}
          className="w-full h-full object-cover object-center rounded-full"
        />
      </div>
      {showName && <span className={`text-gray-700 ${textCls} font-medium`}>{employee.name}</span>}
    </div>
  );
};

export const EmployeeAvatarIcon = (props: Omit<EmployeeAvatarProps, 'showName'>) =>
  <EmployeeAvatar {...props} showName={false} />;

export const SkillCard = ({ skill, onStartTest }: { skill: Skill; onStartTest: (skill: Skill) => void }) => {
  const isLocked = skill.status === "locked" && skill.unlockDate && new Date() < new Date(skill.unlockDate);
  const isValidated = skill.status === "validated";
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Card
      title={skill.name}
      footer={!isValidated && (
        <div className="flex justify-end">
          <Button label="Comenzar Prueba" icon="pi pi-bolt" onClick={() => onStartTest(skill)} disabled={!!isLocked} size="small" />
        </div>
      )}
      className="h-full flex flex-col"
    >
      <p className="text-gray-500 text-sm mb-3">{skill.description}</p>
      {isValidated && (
        <>
          <Tag severity="success" value="Validado" icon="pi pi-check-circle" className="mb-2" />
          <ProgressBar value={skill.level * 10} style={{ height: 6 }} showValue={false} />
          <small className="text-gray-400 mt-1 block">Nivel: {skill.level}/10</small>
        </>
      )}
      {isLocked && skill.unlockDate && (
        <Tag severity="danger" icon="pi pi-lock" value={`Bloqueado hasta: ${fmt(skill.unlockDate)}`} />
      )}
    </Card>
  );
};

export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({ photo, setPhoto, isEditing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => typeof reader.result === 'string' && setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group flex-shrink-0 w-36 h-36">
        <Image
          src={photo || '/Default-avatar.webp'}
          alt="Foto de Perfil"
          width={144} height={144}
          className="w-full h-full rounded-full object-cover object-center border-4 border-white shadow-lg"
        />
        {isEditing && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Cambiar foto de perfil"
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-7 h-7 text-white" />
            <span className="text-xs text-white font-semibold mt-1">Cambiar foto</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  );
};

export const getScoreColor = (score?: number) => {
  if (score === undefined) return 'bg-gray-200';
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 7) return 'bg-lime-500';
  if (score >= 5) return 'bg-yellow-500';
  if (score >= 3) return 'bg-orange-500';
  return 'bg-red-500';
};

export const SoftSkillBar = ({ skill, score }: { skill: string; score?: number }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{skill}</span>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{score}/10</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className={`${getScoreColor(score)} h-2 rounded-full transition-all`} style={{ width: `${(score ?? 0) * 10}%` }} />
    </div>
  </div>
);

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-cyan-300 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
    </div>
  </div>
);

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, score }) => {
  const styles: Record<RiskLevel, string> = {
    "Bajo": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "Medio": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    "Alto": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    "Crítico": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  const icons: Record<RiskLevel, ReactNode> = {
    "Bajo": <CheckCircle size={14} />, "Medio": <Activity size={14} />,
    "Alto": <TrendingDown size={14} />, "Crítico": <AlertTriangle size={14} />,
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[risk]}`}>
      {icons[risk]}
      <span>{risk}</span>
      <span className="font-mono opacity-60">({score}%)</span>
    </div>
  );
};

export const InfoList: React.FC<InfoListProps> = ({ title, items, icon, colorClass }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {React.cloneElement(icon, { className: `w-4 h-4 ${colorClass}` })}
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
    </div>
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace("text-", "bg-")}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  </div>
);

export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onToggleStatus }) => {
  const cell = (inactive: boolean, extra = '') =>
    `px-3 py-2 ${inactive ? 'text-gray-500' : 'text-gray-300'} ${extra}`;

  return (
    <div className="overflow-x-auto bg-gray-900 rounded-xl">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-gray-800 text-[11px] uppercase tracking-wide text-gray-400">
          <tr>
            {['Usuario', 'Nombre', 'DNI', 'Rol', 'Depto / Oficina', 'Estado', 'Acciones'].map((h, i) => (
              <th key={h} className={`px-3 py-2 font-semibold ${i === 0 ? '' : i === 1 ? 'hidden lg:table-cell' : i < 5 ? 'hidden md:table-cell' : i === 5 ? 'hidden sm:table-cell' : 'text-center'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/40">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Image src={user.avatar || '/Default-avatar.webp'} alt={user.name} width={28} height={28}
                    className={`w-7 h-7 rounded-full object-cover flex-shrink-0 ${!user.activo ? 'grayscale opacity-50' : ''}`} />
                  <span className={`font-medium ${!user.activo ? 'text-gray-500' : 'text-white'}`}>{user.usuario}</span>
                </div>
              </td>
              <td className={cell(!user.activo, 'hidden lg:table-cell')}>{user.name}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.dni}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.role}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.department || user.office || '—'}</td>
              <td className="px-3 py-2 hidden sm:table-cell">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${user.activo ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {user.activo && onEdit && (
                    <button onClick={() => onEdit(user)}
                      className="text-[11px] px-2 py-0.5 rounded border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10 transition leading-tight">
                      Editar
                    </button>
                  )}
                  <button onClick={() => onToggleStatus(user.id)}
                    className={`text-[11px] px-2 py-0.5 rounded transition leading-tight ${user.activo ? 'bg-red-600/70 hover:bg-red-600 text-white' : 'bg-green-600/70 hover:bg-green-600 text-white'}`}>
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-gray-500">No hay usuarios para mostrar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {roles.map(role => (
      <div key={role.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-500 transition relative group">
        <button onClick={() => onEdit(role)} className="absolute top-3 right-3 text-gray-500 hover:text-white transition">
          <SquarePen size={16} />
        </button>
        <h3 className={`font-bold text-base text-${role.color}-400 mb-1`}>{role.name}</h3>
        <p className="text-gray-400 text-sm pr-6">{role.description}</p>
      </div>
    ))}
    <button onClick={() => onEdit(null)}
      className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-6 hover:border-cyan-500 hover:text-cyan-400 text-gray-500 transition cursor-pointer gap-2">
      <Plus size={20} />
      <span className="text-sm font-medium">Crear Nuevo Rol</span>
    </button>
  </div>
);

export const ProfileSettings: React.FC = () => {
  const tableMap: Record<string, string> = {
    "Formación Académica": "AcademicRecord", "Experiencia Laboral": "WorkExperience",
    "Idiomas": "Language", "Habilidades Técnicas": "TechnicalSkill",
    "Habilidades Blandas": "SoftSkill", "Certificaciones": "Certification", "Encuesta": "Feedback",
  };

  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(tableMap).map(k => [k, true]))
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/records/status", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setToggles(Object.fromEntries(Object.entries(tableMap).map(([k, v]) => [k, data[v] ?? true])));
      } catch { /* silencioso */ }
    };
    load();
  }, []);

  const handleToggle = async (setting: string) => {
    const next = !toggles[setting];
    setToggles(p => ({ ...p, [setting]: next }));
    try {
      await fetch(`http://127.0.0.1:8000/records/${tableMap[setting]}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ activo: next }),
      });
    } catch { /* silencioso */ }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
      <h3 className="font-bold text-white mb-0.5">Configuración de Perfiles</h3>
      <p className="text-gray-400 text-sm mb-5">Define los campos visibles en los perfiles de usuario.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(toggles).map(setting => (
          <div key={setting} className="flex items-center justify-between bg-gray-900/60 px-4 py-3 rounded-lg">
            <span className="text-sm text-white font-medium">{setting}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={toggles[setting]} onChange={() => handleToggle(setting)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Modales ──────────────────────────────────────────────────────────────────

const ModalShell = ({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition text-xl leading-none">&times;</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="mb-4">
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, roles, onClose, onSave, onRoleChange }) => {
  const [form, setForm] = useState({
    name: user.name === 'No especificado' ? '' : user.name,
    dni: user.dni === 'N/A' ? '' : user.dni,
    gender: user.gender === 'No especificado' ? '' : user.gender,
    role: user.role || '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <ModalShell title="Editar Usuario" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <Field label="Nombre">
          <input name="name" value={form.name} onChange={set('name')} className={inputCls} required />
        </Field>
        <Field label="DNI">
          <input name="dni" value={form.dni} onChange={set('dni')} className={inputCls} required />
        </Field>
        <Field label="Género">
          <select name="gender" value={form.gender} onChange={set('gender')} className={inputCls} required>
            <option value="">Seleccionar</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </Field>
        <Field label="Rol">
          <select name="role" value={form.role}
            onChange={(e) => { set('role')(e); if (e.target.value) onRoleChange(user.id, e.target.value); }}
            className={inputCls}>
            <option value="">Sin Rol Asignado</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition">
            {user.employee_id ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const RoleEditModal: React.FC<{ role: Role; onClose: () => void; onSave: (e: React.FormEvent<HTMLFormElement>) => void }> =
  ({ role, onClose, onSave }) => (
    <ModalShell title={role.id ? "Editar Rol" : "Crear Rol"} onClose={onClose}>
      <form onSubmit={onSave}>
        <input type="hidden" name="editRoleId" defaultValue={role.id || ''} />
        <Field label="Nombre del Rol">
          <input id="editRoleName" name="editRoleName" defaultValue={role.name} className={inputCls} required />
        </Field>
        <Field label="Descripción">
          <textarea id="editRoleDescription" name="editRoleDescription" rows={3} defaultValue={role.description} className={inputCls} />
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition">Guardar</button>
        </div>
      </form>
    </ModalShell>
  );
