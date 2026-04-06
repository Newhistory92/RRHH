// employeeApi.ts
// API de empleados usando el cliente centralizado (apiClient).
// Antes, estas funciones NO incluían el header de Authorization.
// Ahora se inyecta automáticamente via apiClient.

import { apiClient } from "@/app/util/apiClient";

// Tipos para las requests
interface UpdateCondicionLaboralRequest {
  tipoContrato: string;
  fechaIngreso: string; // Formato ISO string
  fechaPlanta?: string | null; // Formato ISO string
  categoria: string;
  fechaCategoria?: string | null; // Formato ISO string
  position: string;
}

interface UpdateHorarioRequest {
  horaInicio: number; // Formato decimal (ej: 9.5 para 9:30)
  horaFin: number; // Formato decimal (ej: 17.5 para 17:30)
}

// Función helper para convertir "HH:MM" a decimal
export const timeStringToDecimal = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
};

// Función helper para convertir decimal a "HH:MM"
export const decimalToTimeString = (decimal: number): string => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

// Actualizar condición laboral del empleado
export const updateCondicionLaboral = async (
  employeeId: number,
  data: UpdateCondicionLaboralRequest
): Promise<void> => {
  return apiClient.put<void>(
    `/rrhh/employee/${employeeId}/condicion-laboral`,
    data
  );
};

// Actualizar horario del empleado
export const updateHorario = async (
  employeeId: number,
  data: UpdateHorarioRequest
): Promise<void> => {
  return apiClient.put<void>(
    `/rrhh/employee/${employeeId}/horario`,
    data
  );
};

// Registrar permiso horario del empleado
export const permisoHorario = async (
  employeeId: number,
  data: UpdateHorarioRequest
): Promise<void> => {
  return apiClient.put<void>(
    `/rrhh/employee/${employeeId}/permission`,
    data
  );
};
