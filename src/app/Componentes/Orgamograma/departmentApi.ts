// departmentApi.ts
// API de departamentos usando el cliente centralizado (apiClient).
// Todas las peticiones incluyen automáticamente el token Bearer
// y manejan errores 401 (sesión expirada) de forma transparente.

import { apiClient } from "@/app/util/apiClient";
import { EntityFormData } from "@/app/Interfas/Interfaces";

export interface ApiEmployee {
  id: number;
  name: string;
  dni: string;
}

export interface ApiOffice {
  id: number;
  nombre: string;
  employees: ApiEmployee[];
  parentDepartmentId?: number | null;
}

export interface ApiDepartment {
  id: number;
  nombre: string;
  description?: string;
  nivelJerarquico?: number;
  jefeId?: number | null;
  parentId?: number | null;
  offices: ApiOffice[];
  employees: ApiEmployee[];
}

export interface ApiResponse {
  message: string;
  departments: ApiDepartment[];
}

export const departmentApi = {
  // GET — Obtener todos los departamentos con oficinas, empleados y habilidades
  getAll: (): Promise<ApiResponse> =>
    apiClient.get<ApiResponse>("/departments/"),

  // POST — Crear departamento
  create: (formData: EntityFormData): Promise<{ message: string }> => {
    console.log("Creando departamento con datos:", formData);
    return apiClient.post<{ message: string }>("/departments/", formData);
  },

  // PUT — Actualizar departamento
  update: (depId: number, data: unknown): Promise<{ message: string }> =>
    apiClient.put<{ message: string }>(`/departments/${depId}`, data),

  // DELETE — Eliminar departamento
  delete: (depId: number): Promise<{ message: string }> =>
    apiClient.delete<{ message: string }>(`/departments/${depId}`),

  // POST — Crear oficina dentro de un departamento
  createOffice: (
    depId: number,
    officeData: Partial<EntityFormData>
  ): Promise<{ message: string; office_id: number }> =>
    apiClient.post<{ message: string; office_id: number }>(
      `/departments/${depId}/offices`,
      officeData
    ),

  // PUT — Actualizar oficina
  updateOffice: (
    officeId: number,
    officeData: Partial<EntityFormData>
  ): Promise<{ message: string }> =>
    apiClient.put<{ message: string }>(
      `/rrhh/office/${officeId}`, // Asumiendo este endpoint en el backend
      officeData
    ),

  // DELETE — Eliminar oficina
  deleteOffice: (officeId: number): Promise<{ message: string }> =>
    apiClient.delete<{ message: string }>(`/rrhh/office/${officeId}`),

  // PUT — Asignar empleado a departamento
  assignEmployeeToDept: (
    depId: number,
    empId: number
  ): Promise<{ message: string }> =>
    apiClient.put<{ message: string }>(
      `/departments/${depId}/assign-employee/${empId}`
    ),

  // PUT — Asignar empleado a oficina
  assignEmployeeToOffice: (
    officeId: number,
    empId: number
  ): Promise<{ message: string }> =>
    apiClient.put<{ message: string }>(
      `/departments/office/${officeId}/assign-employee/${empId}`
    ),
};

// Función para transformar datos de la API al formato de la app.
// IMPORTANTE: ahora mapea parentId y nivel_jerarquico reales del backend.
export const transformApiDataToApp = (apiDepts: ApiDepartment[]): any[] => {
  return apiDepts.map((dept) => ({
    id: dept.id,
    nombre: dept.nombre,
    descripcion: dept.description || "",
    nivel_jerarquico: dept.nivelJerarquico ?? 1,
    jefeId: dept.jefeId ?? null,
    parentId: dept.parentId ?? null,
    habilidades_requeridas: [],
    oficinas: dept.offices.map((office) => ({
      id: office.id,
      nombre: office.nombre,
      descripcion: "",
      jefeId: undefined,
      empleadosIds: office.employees.map((emp) => emp.id),
      departmentId: dept.id,
      parentDepartmentId: office.parentDepartmentId ?? null,
      habilidades_requeridas: [],
    })),
  }));
};
