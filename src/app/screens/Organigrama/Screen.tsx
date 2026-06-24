"use client"
import React, { useEffect, useState, useCallback } from 'react';
import {  Sparkles, LayoutGrid,  } from 'lucide-react';
import { OrgChart } from '@/app/Componentes/OrganigramaGraf/OrgChart';
import { DepartmentManagementView } from '@/app/Componentes/Orgamograma/Departamento';
import { EntityFormModal } from '@/app/Componentes/Orgamograma/Componente/EntityFormModal';
import {ModalConfig, Department, Office, EntityFormData,Employee, OrgData  } from '@/app/Interfas/Interfaces';
import { departmentApi } from '@/app/Componentes/Orgamograma/departmentApi';
import { apiClient } from '@/app/util/apiClient';
interface ModalContext {
  departmentId?: number;
  [key: string]: unknown; // Para permitir propiedades adicionales
}
interface OrganigramaPageProps {
  readOnly?: boolean;
}

const OFFICE_ID_OFFSET = 100000;

export default function OrganigramaPage({ readOnly = false }: OrganigramaPageProps) {
  const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({type: "department", data: undefined, context: {},});
  const [activeTab, setActiveTab] = useState("gestion");
 

  // Función centralizada para recargar departamentos (re-validación de estado)
  const refreshDepartments = useCallback(async () => {
    try {
      const response = await departmentApi.getAll();
      const sortedDepartments = [...response.departments]
        .sort((a: any, b: any) => {
          const levelA = a.nivelJerarquico || a.nivel_jerarquico || 1;
          const levelB = b.nivelJerarquico || b.nivel_jerarquico || 1;
          return levelA - levelB;
        })
        .map((d: any) => ({
          ...d,
          descripcion: d.description || d.descripcion || '',
          nivel_jerarquico: d.nivelJerarquico || d.nivel_jerarquico || 1,
          parentId: d.parentId ?? null,
        })) as Department[];
      setDepartmentsData(sortedDepartments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  // Cargar empleados al montar — usa apiClient con interceptor 401
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const data = await apiClient.get<{ employees: Employee[] }>('/rrhh/employees');
        setEmployees(Array.isArray(data.employees) ? data.employees : []);
      } catch (error) {
        console.error('Error al obtener empleados:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  // Cargar departamentos al montar
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      await refreshDepartments();
      setLoading(false);
    };
    fetchDepartments();
  }, [refreshDepartments]);

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
      if (data && data.id) {
        await departmentApi.update(data.id, formData);
      } else {
        await departmentApi.create(formData);
      }
    } else if (type === "office") {
      if (data && data.id) {
        // Actualizar oficina existente
        await departmentApi.updateOffice(data.id, formData);
      } else {
        // Crear nueva oficina
        const parentDeptId = context?.departmentId;
        if (parentDeptId) {
          await departmentApi.createOffice(parentDeptId, formData);
        }
      }
    }
    
    // Re-validar estado: recargar datos del servidor inmediatamente
    await refreshDepartments();
    
    handleCloseModal();
  } catch (err) {
    console.error('Error al guardar:', err);
  }
};



  return (
    <div className="bg-background font-sans min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Gestión Organizacional
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra la estructura de tu empresa.
          </p>
        </header>

        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-6">
            <button
  onClick={() => setActiveTab("gestion")}
  className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "gestion"
      ? "border-b-2 border-primary text-primary text-shadow-md"
      : "text-muted-foreground hover:text-primary text-shadow-md"
  }`}
>
  <LayoutGrid className="h-5 w-5 mr-2" />
  Gestión de Departamentos
</button>
            <button
              onClick={() => setActiveTab("organigrama")}
              className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "organigrama"
      ? "border-b-2 border-primary text-primary text-shadow-md"
      : "text-muted-foreground hover:text-primary text-shadow-md"
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
          {activeTab === "organigrama" && (
          <div className="animate-fade-in">
        <OrgChart
        data={(() => {
          const chartData: OrgData[] = [];
          
          // Mapear Departamentos
          departmentsData.forEach(d => {
            chartData.push({
              id: d.id,
              nombre: d.nombre,
              nivel_jerarquico: (d as any).nivelJerarquico || d.nivel_jerarquico || 1,
              jefeId: (d as any).parentId ?? d.parentId ?? null
            });
            
            // Mapear Oficinas de este departamento
            if (d.offices) {
              d.offices.forEach(o => {
                chartData.push({
                  id: o.id + OFFICE_ID_OFFSET,
                  nombre: o.nombre,
                  // Las oficinas suelen estar un nivel por debajo del dpto, o nivel 3+
                  nivel_jerarquico: ((d as any).nivelJerarquico || d.nivel_jerarquico || 1) + 1,
                  // Dependencia jerárquica de la oficina:
                  // Si tiene dpto padre específico se usa, si no, se usa el dpto al que pertenece
                  jefeId: o.parentDepartmentId ?? d.id
                });
              });
            }
          });
          
          return chartData;
        })()}
        title="Mi Organigrama Empresarial"
        showLegend={true}
        showStats={true}
      />
      </div>
      )}
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