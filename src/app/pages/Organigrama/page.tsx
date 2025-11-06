"use client"
import React, { useEffect, useState } from 'react';
import {  Sparkles, LayoutGrid,  } from 'lucide-react';
import { OrgChart } from '@/app/Componentes/OrganigramaGraf/OrgChart';
import { DepartmentManagementView } from '@/app/Componentes/Orgamograma/Departamento';
import { EntityFormModal } from '@/app/Componentes/Orgamograma/Componente/EntityFormModal';
import {INTEGRATED_ORG_DATA, EMPLOYEES_DATA,} from '@/app/api/prueba2';
import {ModalConfig, Department, Office, EntityFormData,Employee  } from '@/app/Interfas/Interfaces';
import { departmentApi, transformApiDataToApp } from '@/app/Componentes/Orgamograma/departmentApi';
interface ModalContext {
  departmentId?: number;
  [key: string]: unknown; // Para permitir propiedades adicionales
}


export default function OrganigramaPage() {
  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({type: "department", data: undefined, context: {},});
  const [activeTab, setActiveTab] = useState("gestion");
 


useEffect(() => {
  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/rrhh/employees/`);
      if (!response.ok) {
        console.error('Error al obtener datos del empleado:', response.statusText);
        setEmployees([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log("Fetched employee data:", data);

      // Tomamos el array dentro de `data.employees`
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    } catch (error) {
      console.error('Error en la petición:', error);
      setEmployees([]);
    } finally {
     setLoading(false);
    }
  };

  fetchEmployeeData();
}, []);

  useEffect(() => {
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentApi.getAll();
     // const transformedData = transformApiDataToApp(response.departments);
      setDepartmentsData(response.departments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  fetchDepartments();
}, []);

console.log('Departments Data:', departmentsData);
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

const handleSave = async (formData: EntityFormData): Promise<void> => {
  const { type, data, context } = modalConfig;
  
  try {
    if (type === "department") {
      if (data && 'nivel_jerarquico' in data) {
        await departmentApi.update(data.id, { formData });
      } else {
        await departmentApi.create(formData);
      }
    } else if (type === "office") {
      const parentDeptId = context?.departmentId;
      if (parentDeptId) {
        await departmentApi.createOffice(parentDeptId, { nombre: formData.nombre });
      }
    }
    
    // Recargar datos
    const response = await departmentApi.getAll();
    const transformedData = transformApiDataToApp(response.departments);
    setDepartmentsData(transformedData);
    
    handleCloseModal();
  } catch (err) {
    console.error('Error:', err);
  }
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
            employees={employees as unknown as Employee[]}
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
          employees={employees as unknown as Employee[]} 
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