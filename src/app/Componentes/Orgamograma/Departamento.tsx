import { useEffect, useMemo, useState } from 'react';
import { Building2, Star, Briefcase, ChevronsRight, PlusCircle, Pencil} from 'lucide-react';
import {EMPLOYEES_DATA} from '@/app/api/prueba2';
import Image from 'next/image';
import { Chips } from 'primereact/chips';
        

const EmployeeAvatar = ({ employeeId }) => {
  const employee = EMPLOYEES_DATA.find((e) => e.id === employeeId);
  if (!employee) return null;
  return (
    <div className="flex items-center" title={employee.name}>
      <Image
         src={employee.photo}
       alt={`Foto de ${employee.name}`}
      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
      width={96}
      height={96}
      />
      <span className="text-gray-700 hidden sm:inline">{employee.name}</span>
    </div>
  );
};


export const DepartmentManagementView = ({departmentsData,onSelect,selectedDepartment,onOpenModal,}) => {
  console.log('departmentsData:', departmentsData);
  console.log('selectedDepartment:', selectedDepartment);
const [skillValues, setSkillValues] = useState<string[]>([]);

useEffect(() => {
  if (selectedDepartment?.habilidades_requeridas) {
    const skills = selectedDepartment.habilidades_requeridas.map(skill => 
      `${skill.nombre} (${skill.nivel})`
    );
    setSkillValues(skills);
  } else {
    setSkillValues([]);
  }
}, [selectedDepartment]);

  const departmentTree = useMemo(() => {
    const tree = [];
    const map = {};
    departmentsData.forEach((dept) => {
      map[dept.id] = { ...dept, subDepartments: [] };
    });
    departmentsData.forEach((dept) => {
      if (dept.parentId && map[dept.parentId]) {
        map[dept.parentId].subDepartments.push(map[dept.id]);
      } else {
        tree.push(map[dept.id]);
      }
    });
    return tree;
  }, [departmentsData]);

  const DepartmentListItem = ({department,onSelect,selectedId,level = 0,}) => (
    <>
      <button
        onClick={() => onSelect(department)}
        className={`w-full text-left p-2 rounded-md flex items-center transition-colors ${
          selectedId === department.id
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200"
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <ChevronsRight
          className={`w-4 h-4 mr-2 transition-transform ${
            selectedId === department.id ? "rotate-90" : ""
          }`}
        />
        {department.nombre}
      </button>
      {department.subDepartments?.map((subDept) => (
        <DepartmentListItem
          key={subDept.id}
          department={subDept}
          onSelect={onSelect}
          selectedId={selectedId}
          level={level + 1}
        />
      ))}
    </>
  );

  const OfficeCard = ({ office, onEdit }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-gray-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
            {office.nombre}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{office.descripcion}</p>
        </div>
        <button
          onClick={() => onEdit("office", office)}
          className="text-gray-500 hover:text-blue-600 p-1"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-4">
        <h5 className="font-semibold text-sm mb-2">Jefe de Oficina:</h5>
        <div className="flex items-center p-2 bg-white rounded-md">
          {office.jefeId ? (
            <EmployeeAvatar employeeId={office.jefeId} />
          ) : (
            <span className="text-sm text-gray-500 italic">No asignado</span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h5 className="font-semibold text-sm mb-2">
          Empleados ({office.empleadosIds?.length || 0}):
        </h5>
        {!office.empleadosIds || office.empleadosIds.length === 0 ? (
          <span className="text-sm text-gray-500 italic">
            Sin empleados asignados
          </span>
        ) : (
          <ul className="space-y-2 pt-2">
            {office.empleadosIds.map((id) => {
              const emp = EMPLOYEES_DATA.find((e) => e.id === id);
              return emp ? (
                <li key={id} className="flex items-center text-sm">
                  <Image
                    src={emp.photo}
                    alt={emp.name}
                    title={emp.name}
                    className="w-6 h-6 rounded-full mr-3 border-2 border-gray-200"
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

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/3 lg:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">Departamentos</h2>
          <button
            onClick={() => onOpenModal("department")}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
            title="Crear Nuevo Departamento"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-1">
          {departmentTree.map((dept) => (
            <DepartmentListItem
              key={dept.id}
              department={dept}
              onSelect={onSelect}
              selectedId={selectedDepartment?.id}
            />
          ))}
        </div>
      </aside>
      <main className="md:w-2/3 lg:w-3/4">
        {selectedDepartment ? (
          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                  {selectedDepartment.nombre}
                </h2>
                <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                  Nivel Jerárquico: {selectedDepartment.nivel_jerarquico}
                </span>
              </div>
              <button
                onClick={() => onOpenModal("department", selectedDepartment)}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <Pencil className="w-4 h-4 mr-1" /> Editar Departamento
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {selectedDepartment.descripcion}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Jefe de Área
                </h3>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
                  {selectedDepartment.jefeId ? (
                    <>
                      <EmployeeAvatar employeeId={selectedDepartment.jefeId} />
                    </>
                  ) : (
                    <span className="text-gray-500 italic">No asignado</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Habilidades Clave</h3>
                <div className="flex flex-wrap gap-2">
                {selectedDepartment?.habilidades_requeridas && (
  <div className="flex flex-wrap gap-2">
    <Chips 
      value={skillValues} 
      onChange={(e) => setSkillValues(e.value)} 
      separator=","
      keyfilter="alpha"
      placeholder="Agregar habilidades..."
    />
  </div>
)}

                </div>
              </div>
            </div>
            <hr className="my-6" />
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Oficinas ({selectedDepartment.oficinas.length})
                </h3>
                <button
                  onClick={() =>
                    onOpenModal("office", null, {
                      departmentId: selectedDepartment.id,
                    })
                  }
                  className="flex items-center text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Crear Oficina
                </button>
              </div>
              {selectedDepartment.oficinas.length > 0 ? (
                selectedDepartment.oficinas.map((office) => (
                  <OfficeCard
                    key={office.id}
                    office={office}
                    onEdit={onOpenModal}
                  />
                ))
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="mt-4 text-gray-600">
                    Este departamento no tiene oficinas asignadas.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md h-full">
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">
              Selecciona un departamento
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};



// import React, { useMemo } from 'react';
// import { EMPLOYEES_DATA } from '@/app/api/prueba2';
// import { Avatar } from 'primereact/avatar';
// import { Chip } from 'primereact/chip';
// import { Button } from 'primereact/button';
// import { Tag } from 'primereact/tag';
// import { Card } from 'primereact/card';
// import { 
//   Building2, 
//   Star, 
//   Briefcase, 
//   Pencil, 
//   PlusCircle, 
//   ChevronsRight,
// } from 'lucide-react';
// import type { 
//   Department,Office
// } from '@/app/Interfas/Interfaces'; 


// interface DepartmentExtended extends Department {
//   nivel_jerarquico: number;
//   parentId?: number | null;
//   jefeId?: number | null;
//   habilidades_requeridas: string[];
//   oficinas: Office[];
//   subDepartments?: DepartmentExtended[];
// }

// interface DepartmentManagementViewProps {
//   departmentsData: DepartmentExtended[];
//   onSelect: (department: DepartmentExtended) => void;
//   selectedDepartment: DepartmentExtended | null;
//   onOpenModal: (
//     type: 'department' | 'office',
//     item?: DepartmentExtended | Office | null,
//     extra?: Record<string, unknown>
//   ) => void;
// }

// // Componente SkillChip mejorado con PrimeReact
// const SkillChip: React.FC<{ 
//   skill: string; 
//   onRemove?: (skill: string) => void;
//   removable?: boolean;
// }> = ({ skill, onRemove, removable = false }) => {
//   return (
//     <Chip 
//       label={skill}
//       removable={removable}
//       onRemove={onRemove ? () => { onRemove(skill); return true; } : undefined}
//       className="mr-2 mb-2 bg-blue-100 text-blue-800 border-blue-200"
//       style={{ 
//         backgroundColor: '#dbeafe', 
//         color: '#1e40af',
//         border: '1px solid #bfdbfe'
//       }}
//     />
//   );
// };

// // Componente EmployeeAvatar mejorado con PrimeReact
// const EmployeeAvatar: React.FC<{ 
//   employeeId: number;
//   size?: 'small' | 'normal' | 'large';
//   showName?: boolean;
// }> = ({ employeeId, size = 'normal', showName = true }) => {
//   const employee = EMPLOYEES_DATA.find((e) => e.id === employeeId);
  
//   if (!employee) return null;

//   const sizeClasses = {
//     small: 'w-8 h-8',
//     normal: 'w-12 h-12', 
//     large: 'w-24 h-24'
//   };

//   const avatarSize = {
//     small: 32,
//     normal: 48,
//     large: 96
//   };

//   return (
//     <div className="flex items-center gap-3" title={employee.name}>
//       <Avatar
//         image={employee.photo}
//         shape="circle"
//         size={size === 'small' ? 'normal' : 'large'}
//         className={`${sizeClasses[size]} border-2 border-white shadow-lg`}
//         style={{ 
//           width: `${avatarSize[size]}px`, 
//           height: `${avatarSize[size]}px` 
//         }}
//       />
//       {showName && (
//         <div className="flex flex-col">
//           <span className="text-gray-700 font-medium hidden sm:inline">
//             {employee.name}
//           </span>
//           {size === 'large' && (
//             <span className="text-sm text-gray-500">
//               {employee.position}
//             </span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({
//   departmentsData,
//   onSelect,
//   selectedDepartment,
//   onOpenModal,
// }) => {
//   const departmentTree = useMemo(() => {
//     const tree: DepartmentExtended[] = [];
//     const map: { [key: number]: DepartmentExtended } = {};
    
//     // Crear el mapa con subdepartamentos inicializados
//     departmentsData.forEach((dept) => {
//       map[dept.id] = { ...dept, subDepartments: [] };
//     });
    
//     // Construir el árbol jerárquico
//     departmentsData.forEach((dept) => {
//       if (dept.parentId && map[dept.parentId]) {
//         map[dept.parentId].subDepartments!.push(map[dept.id]);
//       } else {
//         tree.push(map[dept.id]);
//       }
//     });
    
//     return tree;
//   }, [departmentsData]);

//   const DepartmentListItem: React.FC<{
//     department: DepartmentExtended;
//     onSelect: (dept: DepartmentExtended) => void;
//     selectedId?: number;
//     level?: number;
//   }> = ({ department, onSelect, selectedId, level = 0 }) => (
//     <>
//       <Button
//         onClick={() => onSelect(department)}
//         className={`w-full text-left p-2 rounded-md flex items-center transition-colors border-0 ${
//           selectedId === department.id
//             ? "bg-blue-600 text-white"
//             : "bg-transparent hover:bg-gray-200 text-gray-700"
//         }`}
//         style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
//         unstyled
//       >
//         <ChevronsRight
//           className={`w-4 h-4 mr-2 transition-transform ${
//             selectedId === department.id ? "rotate-90" : ""
//           }`}
//         />
//         {department.name}
//       </Button>
//       {department.subDepartments?.map((subDept) => (
//         <DepartmentListItem
//           key={subDept.id}
//           department={subDept}
//           onSelect={onSelect}
//           selectedId={selectedId}
//           level={level + 1}
//         />
//       ))}
//     </>
//   );

//   const OfficeCard: React.FC<{ 
//     office: Office; 
//     onEdit: (type: string, office: Office) => void;
//   }> = ({ office, onEdit }) => {
//     const cardHeader = (
//       <div className="flex justify-between items-start">
//         <div>
//           <h4 className="font-bold text-lg text-gray-800 flex items-center">
//             <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
//             {office.nombre}
//           </h4>
//           <p className="text-sm text-gray-600 mt-1">{office.descripcion}</p>
//         </div>
//         <Button
//           icon={<Pencil className="w-4 h-4" />}
//           onClick={() => onEdit("office", office)}
//           className="p-button-text p-button-sm text-gray-500 hover:text-blue-600"
//           tooltip="Editar oficina"
//         />
//       </div>
//     );

//     return (
//       <Card 
//         header={cardHeader}
//         className="mb-4 hover:shadow-lg transition-shadow border border-gray-200"
//       >
//         <div className="space-y-4">
//           <div>
//             <h5 className="font-semibold text-sm mb-2 flex items-center">
//               <Star className="w-4 h-4 mr-1 text-yellow-500" />
//               Jefe de Oficina:
//             </h5>
//             <div className="flex items-center p-2 bg-gray-50 rounded-md">
//               {office.jefeId ? (
//                 <EmployeeAvatar 
//                   employeeId={office.jefeId} 
//                   size="small"
//                   showName={true}
//                 />
//               ) : (
//                 <span className="text-sm text-gray-500 italic">No asignado</span>
//               )}
//             </div>
//           </div>
          
//           <div>
//             <h5 className="font-semibold text-sm mb-2">
//               Empleados ({office.empleadosIds?.length || 0}):
//             </h5>
//             {!office.empleadosIds || office.empleadosIds.length === 0 ? (
//               <span className="text-sm text-gray-500 italic">
//                 Sin empleados asignados
//               </span>
//             ) : (
//               <div className="space-y-2">
//                 {office.empleadosIds.map((id) => {
//                   const emp = EMPLOYEES_DATA.find((e) => e.id === id);
//                   return emp ? (
//                     <div key={id} className="flex items-center text-sm p-2 bg-white rounded border">
//                       <EmployeeAvatar 
//                         employeeId={id} 
//                         size="small"
//                         showName={true}
//                       />
//                       <div className="ml-2">
//                         <Tag 
//                           value={emp.position} 
//                           severity="info" 
//                           className="text-xs"
//                         />
//                       </div>
//                     </div>
//                   ) : null;
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </Card>
//     );
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-8">
//       <aside className="md:w-1/3 lg:w-1/4">
//         <Card className="h-fit">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-gray-700">Departamentos</h2>
//             <Button
//               icon={<PlusCircle className="w-5 h-5" />}
//               onClick={() => onOpenModal("department")}
//               className="p-button-rounded p-button-text"
//               tooltip="Crear Nuevo Departamento"
//             />
//           </div>
//           <div className="space-y-1">
//             {departmentTree.map((dept) => (
//               <DepartmentListItem
//                 key={dept.id}
//                 department={dept}
//                 onSelect={onSelect}
//                 selectedId={selectedDepartment?.id}
//               />
//             ))}
//           </div>
//         </Card>
//       </aside>
      
//       <main className="md:w-2/3 lg:w-3/4">
//         {selectedDepartment ? (
//           <Card className="animate-fade-in">
//             <div className="flex justify-between items-start mb-6">
//               <div>
//                 <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
//                   <Building2 className="w-8 h-8 mr-3 text-blue-600" />
//                   {selectedDepartment.name}
//                 </h2>
//                 <Tag 
//                   value={`Nivel Jerárquico: ${selectedDepartment.nivel_jerarquico}`}
//                   severity="secondary"
//                   className="mt-2"
//                 />
//               </div>
//               <Button
//                 icon={<Pencil className="w-4 h-4" />}
//                 label="Editar Departamento"
//                 onClick={() => onOpenModal("department", selectedDepartment)}
//                 className="p-button-text p-button-sm"
//               />
//             </div>
            
//             <p className="text-gray-600 mb-6">
//               {selectedDepartment.description}
//             </p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <Card title="Jefe de Área" className="bg-gray-50">
//                 <div className="flex items-center">
//                   {selectedDepartment.jefeId ? (
//                     <EmployeeAvatar 
//                       employeeId={selectedDepartment.jefeId}
//                       size="large"
//                       showName={true}
//                     />
//                   ) : (
//                     <span className="text-gray-500 italic">No asignado</span>
//                   )}
//                 </div>
//               </Card>
              
//               <Card title="Habilidades Clave" className="bg-gray-50">
//                 <div className="flex flex-wrap gap-2">
//                   {selectedDepartment.habilidades_requeridas?.map((skill) => (
//                     <SkillChip key={skill} skill={skill} />
//                   ))}
//                 </div>
//               </Card>
//             </div>
            
//             <div>
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-2xl font-bold text-gray-800">
//                   Oficinas ({selectedDepartment.oficinas?.length || 0})
//                 </h3>
//                 <Button
//                   icon={<PlusCircle className="w-5 h-5" />}
//                   label="Crear Oficina"
//                   onClick={() =>
//                     onOpenModal("office", null, {
//                       departmentId: selectedDepartment.id,
//                     })
//                   }
//                   severity="success"
//                 />
//               </div>
              
//               {selectedDepartment.oficinas && selectedDepartment.oficinas.length > 0 ? (
//                 selectedDepartment.oficinas.map((office) => (
//                   <OfficeCard
//                     key={office.id}
//                     office={office}
//                     onEdit={(type, office) => onOpenModal(type as 'office', office)}
//                   />
//                 ))
//               ) : (
//                 <Card className="text-center py-8 border-2 border-dashed border-gray-300">
//                   <p className="text-gray-600">
//                     Este departamento no tiene oficinas asignadas.
//                   </p>
//                 </Card>
//               )}
//             </div>
//           </Card>
//         ) : (
//           <Card className="flex flex-col items-center justify-center p-10 h-full">
//             <Building2 className="w-16 h-16 text-gray-400 mb-4" />
//             <h2 className="text-2xl font-semibold text-gray-700">
//               Selecciona un departamento
//             </h2>
//             <p className="text-gray-500 mt-2">
//               Elige un departamento del panel izquierdo para ver sus detalles
//             </p>
//           </Card>
//         )}
//       </main>
//     </div>
//   );
// };