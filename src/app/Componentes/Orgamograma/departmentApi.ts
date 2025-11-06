import { EntityFormData } from "@/app/Interfas/Interfaces";

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ApiEmployee {
  id: number;
  name: string;
  dni: string;
}

export interface ApiOffice {
  id: number;
  nombre: string;
  employees: ApiEmployee[];
}

export interface ApiDepartment {
  id: number;
  nombre: string;
  offices: ApiOffice[];
  employees: ApiEmployee[];
}

export interface ApiResponse {
  message: string;
  departments: ApiDepartment[];
}

export const departmentApi = {
  // GET - Obtener todos los departamentos
  getAll: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/departments/`);
    if (!response.ok) throw new Error('Error al obtener departamentos');
    return response.json();
  },

  // POST - Crear departamento
  create: async ( formData: EntityFormData) => {
    console.log('Creating department with data:', formData);
    const response = await fetch(`${API_BASE_URL}/departments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error('Error al crear departamento');
    return response.json();
  },

  // PUT - Actualizar departamento
  update: async (depId: number, data: { nombre: string }) => {
    const response = await fetch(`${API_BASE_URL}/departments/${depId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar departamento');
    return response.json();
  },

  // DELETE - Eliminar departamento
  delete: async (depId: number) => {
    const response = await fetch(`${API_BASE_URL}/departments/${depId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar departamento');
    return response.json();
  },

  // POST - Crear oficina
  createOffice: async (depId: number, officeData: { nombre: string }) => {
    const response = await fetch(`${API_BASE_URL}/departments/${depId}/offices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officeData),
    });
    if (!response.ok) throw new Error('Error al crear oficina');
    return response.json();
  },

  // PUT - Asignar empleado a departamento
  assignEmployeeToDept: async (depId: number, empId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/departments/${depId}/assign-employee/${empId}`,
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error('Error al asignar empleado');
    return response.json();
  },

  // PUT - Asignar empleado a oficina
  assignEmployeeToOffice: async (officeId: number, empId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/departments/office/${officeId}/assign-employee/${empId}`,
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error('Error al asignar empleado');
    return response.json();
  },
};

// Función para transformar datos de API al formato de tu app
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformApiDataToApp = (apiDepts: ApiDepartment[]): any[] => {
  return apiDepts.map(dept => ({
    id: dept.id,
    nombre: dept.nombre,
    descripcion: '',
   nivelJerarquico: 0,
    jefeId: undefined,
    parentId: null,
    habilidades_requeridas: [],
    oficinas: dept.offices.map(office => ({
      id: office.id,
      nombre: office.nombre,
      descripcion: '',
      jefeId: undefined,
      empleadosIds: office.employees.map(emp => emp.id),
      departmentId: dept.id,
      habilidades_requeridas: [],
    })),
  }));
};