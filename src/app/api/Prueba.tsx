import   Notification from '../Interfas/Interfaces';
import   Employee from '../Interfas/Interfaces';
import   OrgNode from '../Interfas/Interfaces';


// --- DATOS DE PRUEBA ---
export const mockNotifications: Notification[] = [
  { id: 1, text: 'Nueva solicitud de vacaciones de Juan Pérez.', time: 'hace 5 minutos' },
  { id: 2, text: 'El reporte de productividad del Q2 está listo.', time: 'hace 2 horas' },
  { id: 3, text: 'Recordatorio: Reunión de equipo a las 3 PM.', time: 'hace 1 día' },
];

export const productivityData = [
  { name: 'Ene', Productividad: 80 }, { name: 'Feb', Productividad: 85 },
  { name: 'Mar', Productividad: 90 }, { name: 'Abr', Productividad: 88 },
  { name: 'May', Productividad: 92 }, { name: 'Jun', Productividad: 95 },
];

export const absenceData = [
  { name: 'L', Ausencias: 2 }, { name: 'M', Ausencias: 1 }, { name: 'X', Ausencias: 0 },
  { name: 'J', Ausencias: 3 }, { name: 'V', Ausencias: 1 },
];

export const delayData = [
  { name: 'Ingeniería', value: 5 }, { name: 'Ventas', value: 8 },
  { name: 'Marketing', value: 3 }, { name: 'Soporte', value: 2 },
];
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const mockEmployees: Employee[] = [
  { id: 'EMP001', name: 'Ana García', position: 'Desarrolladora Frontend', department: 'Tecnología', email: 'ana.garcia@example.com', status: 'Activo' },
  { id: 'EMP002', name: 'Carlos Rodríguez', position: 'Gerente de Proyectos', department: 'Tecnología', email: 'carlos.r@example.com', status: 'Activo' },
  { id: 'EMP003', name: 'Beatriz López', position: 'Diseñadora UX/UI', department: 'Diseño', email: 'beatriz.l@example.com', status: 'Licencia' },
  { id: 'EMP004', name: 'David Martínez', position: 'Especialista en Marketing', department: 'Marketing', email: 'david.m@example.com', status: 'Activo' },
];

 export const orgChartData: OrgNode = {
  name: 'Elena Torres',
  position: 'CEO',
  children: [
    {
      name: 'Ricardo Mendoza',
      position: 'CTO',
      children: [
        { name: 'Ana García', position: 'Líder de Frontend' },
        { name: 'Luis Jiménez', position: 'Líder de Backend' },
      ],
    },
    {
      name: 'Sofía Castro',
      position: 'CFO',
      children: [
        { name: 'Mario Vargas', position: 'Contador Principal' },
      ],
    },
    {
      name: 'Jorge Campos',
      position: 'COO',
      children: [
        { name: 'Laura Pausini', position: 'Gerente de Operaciones' },
      ],
    },
  ],
};
