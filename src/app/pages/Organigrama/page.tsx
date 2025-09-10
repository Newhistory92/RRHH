"use client"
import React, { useState } from 'react';
import {  Sparkles, LayoutGrid,  } from 'lucide-react';
import { OrgChart } from '@/app/Componentes/OrganigramaGraf/OrgChart';
import { DepartmentManagementView } from '@/app/Componentes/Orgamograma/Departamento';
import { EntityFormModal } from '@/app/Componentes/Orgamograma/Componente/EntityFormModal';
import {INTEGRATED_ORG_DATA, EMPLOYEES_DATA,} from '@/app/api/prueba2';
import {ModalConfig, Department, Office, EntityFormData,Employee  } from '@/app/Interfas/Interfaces';

interface ModalContext {
  departmentId?: number;
  [key: string]: unknown; // Para permitir propiedades adicionales
}


export default function OrganigramaPage() {
 const [departmentsData, setDepartmentsData] = useState<Department[]>(INTEGRATED_ORG_DATA);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({type: "department", data: undefined, context: {},});
  const [activeTab, setActiveTab] = useState("gestion");
 


  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(departmentsData.find((d) => d.id === department.id) || null);
  };

  const handleOpenModal = (
  type: 'department' | 'office', 
  data?: Department | Office | null | undefined, 
  context: ModalContext = {} 
) => {
  setModalConfig({ 
    type, 
    data: data ?? undefined, 
    context: context as { departmentId?: number } 
  });
  setIsModalOpen(true);
};

  const handleCloseModal = () => setIsModalOpen(false);

const handleSave = (formData: EntityFormData): void => {
    const { type, data, context } = modalConfig;
    
    if (type === "department") {
      if (data && 'nivel_jerarquico' in data) {
        // Editando departamento existente
        const updatedDepartment: Department = {
          ...(data as Department),
          ...formData,
          nivel_jerarquico: formData.nivel_jerarquico || 1,
          parentId: formData.parentId || null
        };
        
        setDepartmentsData(
          departmentsData.map((d) =>
            d.id === data.id ? updatedDepartment : d
          )
        );
      } else {
        // Creando nuevo departamento
        const newDepartment: Department = {
          id: Date.now(),
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          nivel_jerarquico: formData.nivel_jerarquico || 1,
          jefeId: formData.jefeId,
          parentId: formData.parentId || null,
          habilidades_requeridas: formData.habilidades_requeridas || [],
          oficinas: []
        };
        
        setDepartmentsData([...departmentsData, newDepartment]);
      }
    } else if (type === "office") {
      let parentDeptId: number;
      
      if (data && 'empleadosIds' in data) {
        // Editando oficina existente - buscar el departamento padre
        const parentDept = departmentsData.find((d) => 
          d.oficinas.some((o) => o.id === data.id)
        );
        if (!parentDept) {
          console.error('No se encontró el departamento padre de la oficina');
          return;
        }
        parentDeptId = parentDept.id;
      } else {
        // Creando nueva oficina
        if (!context?.departmentId) {
          console.error('No se especificó el departamento para la nueva oficina');
          return;
        }
        parentDeptId = context.departmentId;
      }
      
      setDepartmentsData(
        departmentsData.map((d) => {
          if (d.id === parentDeptId) {
            let newOficinas: Office[];
            
            if (data && 'empleadosIds' in data) {
              // Editando oficina existente
              const updatedOffice: Office = {
                ...(data as Office),
                ...formData,
                empleadosIds: formData.empleadosIds || []
              };
              
              newOficinas = d.oficinas.map((o) =>
                o.id === data.id ? updatedOffice : o
              );
            } else {
              // Creando nueva oficina
              const newOffice: Office = {
                id: Date.now(), //eliminar cuando pase a base de datos
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                jefeId: formData.jefeId,
                empleadosIds: formData.empleadosIds || [],
                departmentId: parentDeptId,
                habilidades_requeridas: formData.habilidades_requeridas || []
              };
              
              newOficinas = [...d.oficinas, newOffice];
            }
            
            return { ...d, oficinas: newOficinas };
          }
          return d;
        })
      );
    }
    
    // Actualizar departamento seleccionado si es necesario
    if (selectedDepartment && data && 'nivel_jerarquico' in data && selectedDepartment.id === data.id) {
      const updatedDept = departmentsData.find(d => d.id === data.id);
      if (updatedDept) {
        handleSelectDepartment(updatedDept);
      }
    }
    
    handleCloseModal();
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Gestión Organizacional
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la estructura de tu empresa.
          </p>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
  onClick={() => setActiveTab("gestion")}
  className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "gestion"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
>
  <LayoutGrid className="h-5 w-5 mr-2" />
  Gestión de Departamentos
</button>
            <button
              onClick={() => setActiveTab("organigrama")}
              className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "organigrama"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Organigrama
            </button>
          </nav>
        </div>
        {activeTab === "gestion" && (
          <DepartmentManagementView
            departmentsData={departmentsData}
            onSelect={handleSelectDepartment}
            selectedDepartment={selectedDepartment}
            onOpenModal={handleOpenModal}
            employees={EMPLOYEES_DATA as unknown as Employee[]}
          />
        )}
          {activeTab === "organigrama" &&
          <div className="animate-fade-in">
            
        <OrgChart
        data={INTEGRATED_ORG_DATA}
        title="Mi Organigrama Empresarial"
        showLegend={true}
        showStats={true}
      />
      </div>}
      </div>
      {isModalOpen && (
        <EntityFormModal
          config={modalConfig}
          onClose={handleCloseModal}
          onSave={handleSave}
          departments={departmentsData}
          employees={EMPLOYEES_DATA as unknown as Employee[]} 
        />
      )}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}