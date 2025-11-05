// Tipos para las requests
interface UpdateCondicionLaboralRequest {
  tipoContrato: string;
  fechaIngreso: string; // ISO string format
  fechaPlanta?: string | null; // ISO string format
  categoria: string;
  fechaCategoria?: string | null; // ISO string format
  position: string;
}

interface UpdateHorarioRequest {
  horaInicio: number; // Formato decimal (ej: 9.5 para 9:30)
  horaFin: number; // Formato decimal (ej: 17.5 para 17:30)
}

// Función helper para convertir "HH:MM" a decimal
export const timeStringToDecimal = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
};

// Función helper para convertir decimal a "HH:MM"
export const decimalToTimeString = (decimal: number): string => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Función para actualizar condición laboral
export const updateCondicionLaboral = async (
  employeeId: number,
  data: UpdateCondicionLaboralRequest
): Promise<void> => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/rrhh/employee/${employeeId}/condicion-laboral`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al actualizar condición laboral: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateCondicionLaboral:', error);
    throw error;
  }
};

// Función para actualizar horario
export const updateHorario = async (
  employeeId: number,
  data: UpdateHorarioRequest
): Promise<void> => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/rrhh/employee/${employeeId}/horario`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al actualizar horario: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateHorario:', error);
    throw error;
  }
};






// Función para actualizar horario
export const permisoHorario = async (
  employeeId: number,
  data: UpdateHorarioRequest
): Promise<void> => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/rrhh/employee/${employeeId}/permission`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al actualizar horario: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateHorario:', error);
    throw error;
  }
};


