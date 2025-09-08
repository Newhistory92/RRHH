import { useMemo } from 'react';
import { Building2, Star, ChevronsRight, PlusCircle, Pencil} from 'lucide-react';
import {SkillsDisplay,  EmployeeAvatar} from '../../util/UiRRHH';
import { OfficeCard } from './OfficeCard';
import type {Department, Employee, Office} from '@/app/Interfas/Interfaces';
import { Button } from 'primereact/button';
import { Card } from '../Card';
import { Tag } from 'primereact/tag';
import { Tree } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';

interface ModalContext {
  departmentId?: number;
  [key: string]: unknown; // Para permitir propiedades adicionales
}

interface DepartmentManagementViewProps {
  departmentsData: Department[];
  onSelect: (department: Department) => void;
  selectedDepartment: Department | null;
   onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
   employees: Employee[];
}
interface DepartmentWithSubDepartments extends Department {
  subDepartments: DepartmentWithSubDepartments[];
}

interface DepartmentListItemProps {
  department: DepartmentWithSubDepartments;
  onSelect: (department: Department) => void;
  selectedId?: number;
  level?: number;
}

export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({departmentsData,onSelect,selectedDepartment,onOpenModal,employees}) => {

  const departmentTree = useMemo((): DepartmentWithSubDepartments[] => {
    const tree: DepartmentWithSubDepartments[] = [];
    const map: { [key: number]: DepartmentWithSubDepartments } = {};
    
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

  
  const DepartmentListItem: React.FC<DepartmentListItemProps> = ({
    department,
    onSelect,
    selectedId,
    level = 0,
  }) => (
    <>
 <Button onClick={() => onSelect(department)} link  >
        <ChevronsRight
          className={`w-4 h-4 mr-2 transition-transform ${
            selectedId === department.id ? "rotate-90" : ""
          }`}
        />
        {department.nombre}
      </Button>
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


  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/3 lg:w-1/4">
        <Card className="h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Departamentos</h2>
            <Button
              icon={<PlusCircle className="w-5 h-5" />}
              onClick={() => onOpenModal("department")}
              className="p-button-rounded p-button-text"
              tooltip="Crear Nuevo Departamento"
            />
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
        </Card>
      </aside>
      
      <main className="md:w-2/3 lg:w-3/4">
        {selectedDepartment ? (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <Building2 className="w-8 h-8 mr-3 text-[#06B6D4]" />
                  {selectedDepartment.nombre}
                </h2>
                <Tag 
                  value={`Nivel Jerárquico: ${selectedDepartment.nivel_jerarquico}`}
                  severity="secondary"
                  className="mt-2"
                />
              </div>
              <Button
                icon={<Pencil className="w-4 h-4" />}
                link
                label="Editar Departamento"
                onClick={() => onOpenModal("department", selectedDepartment)}
                className="p-button-text p-button-sm"
              />
            </div>
            
            <p className="text-gray-600 mb-6">
              {selectedDepartment.descripcion}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gray-50 p-4">
                <h4 className="font-bold mb-2 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Jefe de Área
                </h4>
                <div className="flex items-center">
                  {selectedDepartment.jefeId ? (
                       <EmployeeAvatar
                        employeeId={selectedDepartment.jefeId}
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
                   <SkillsDisplay selectedDepartment={selectedDepartment} />
                </div>
              </Card>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Oficinas ({selectedDepartment.oficinas?.length || 0})
                </h3>
                <Button
                  icon={<PlusCircle className="w-5 h-5 mr-1" />}
                  label="Crear Oficina"
                  onClick={() =>
                    onOpenModal("office", null, {
                      departmentId: selectedDepartment.id,
                    })
                  }
                  severity="success"
                />
              </div>
              
              {selectedDepartment.oficinas.length > 0 ? (
                selectedDepartment.oficinas.map((office) => (
                  <OfficeCard
                    key={office.id}
                    office={office}
                    onEdit={onOpenModal}
                    employees={employees} 
                  />
                ))
              ) : (
                <Card className="text-center py-8 border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">
                    Este departamento no tiene oficinas asignadas.
                  </p>
                </Card>
              )}
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center p-10 h-full">
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">
              Selecciona un departamento
            </h2>
            <p className="text-gray-500 mt-2">
              Elige un departamento del panel izquierdo para ver sus detalles
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};
  