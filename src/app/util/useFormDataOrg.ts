import { useState, useEffect } from 'react';
import { EntityFormData, ModalConfig, Employee, Department, Office } from '@/app/Interfas/Interfaces';

export const useFormData = (config: ModalConfig, employees: Employee[]) => {
  const { type, data } = config;
  
  const [formData, setFormData] = useState<EntityFormData>({
    nombre: '',
    descripcion: '',
    jefeId: null,
    habilidades_requeridas: [],
    nivel_jerarquico: 1,
    parentId: null,
    empleadosIds: []
  });

  useEffect(() => {
    
    if (!data) {
      if (type === "department") {
        setFormData({
          nombre: "",
          descripcion: "",
          nivel_jerarquico: 2,
          parentId: null,
          jefeId: null,
          habilidades_requeridas: [],
          empleadosIds: []
        });
      } else if (type === "office") {
        setFormData({
          nombre: "",
          descripcion: "",
          jefeId: null,
          empleadosIds: [],
          habilidades_requeridas: [],
        });
      }
    } else {
      const entityData: EntityFormData = {
        id: data.id, // CRÍTICO: Preservar el ID para filtrado de auto-referencia
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        jefeId: data.jefeId || null,
        habilidades_requeridas: data.habilidades_requeridas || [],
        nivel_jerarquico: (data as Department).nivel_jerarquico || (data as any).nivelJerarquico || 1,
        parentId: (data as Department).parentId || null,
        parentDepartmentId: (data as Office).parentDepartmentId || null,
        empleadosIds: (data as any).employees?.map((e: any) => e.id) || (data as Office)?.empleadosIds || []
      };
      setFormData(entityData);
    }
  }, [data, type, employees]);

  return { formData, setFormData };
};