import { ComplaintStatus, EmployeeRole, EmployeeStatus, EmploymentStatus, LicenseStatus } from "../Interfas/Interfaces";

// Unified Employee Data Structure
export const EMPLOYEES_DATA = [
  {
    // Basic Information
    id: 1,
    name: 'Ana García',
    dni: '12.345.678',
    email: 'ana.garcia@example.com',
    phone: '11-1234-5678',
    address: 'Av. Siempre Viva 742',
    birthDate: '1990-05-20',
    photo: 'https://placehold.co/150x150/E2E8F0/4A5568?text=AG',
    hours: 160, // Total available hours for permissions
    // Employment Details
    position: 'Especialista en Atención al Cliente',
    department: 'Atención al Cliente',
    departmentId: 1,
    office: 'Sede Central',
    category: 'Administrativo',
    status: 'Activo' as EmployeeStatus, // Unified status (Activo, De licencia, Parte médico, Inactivo)
    employmentStatus: 'Planta permanente' as EmploymentStatus, // Contract type
    activityType: 'Atención al público',
    startDate: '2020-03-15',
    permanentDate: '2021-03-15',
    lastCategoryUpdate: '2023-06-01',
    
    // Management
    managerId: 3,
    supervisor: 'Ana Gómez',
    role: 'empleado' as EmployeeRole, // empleado, supervisor, manager, admin

    // Schedule
    schedule: {
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 8
    },
    
    // Performance Metrics
    productivityScore: 9.2,
    overallProductivity: 95.5,
    monthlyHours: [
      { month: 'Ene', hours: 5 },
      { month: 'Feb', hours: -2 },
      { month: 'Mar', hours: 8 },
      { month: 'Abr', hours: 3 }
    ],
    tasks: [
      { name: 'Resolución de tickets', productivity: 9.5 },
      { name: 'Atención telefónica', productivity: 9.0 },
      { name: 'Gestión de reclamos', productivity: 8.8 }
    ],
    
  
    // Absences and Licenses
    licenses: {
      '2024': 5,
      '2023': 12,
      history: [
        {
          id: 'L1',
          type: 'Vacaciones',
          startDate: '2024-07-10',
          endDate: '2024-07-20',
          status: 'Aprobada' as LicenseStatus,
          duration: 10,
          originalMessage: 'Se aprueba la licencia por vacaciones solicitada para julio.',
          requestedDays: 10,
          requestedDates: 'del 2024-07-10 al 2024-07-20'
        }
      ]
    },
    absences: {
      '2024': 1,
      '2023': 3
    },
    permits: [
      {
        id: 'P1',
        date: '2024-06-15',
        departureTime: '14:00',
        returnTime: '15:30',
        hours: -1.5
      }
    ],
    
    // Feedback and Issues
    complaints: [
      {
        id: 'C01',
        reason: 'Demora en la respuesta inicial.',
        date: '2024-01-15',
        status: 'Resuelto' as ComplaintStatus
      }
    ],
    messages: [
      {
        id: 'M1',
        text: 'Solicitud de licencia por vacaciones aprobada.',
        days: 5,
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        date: '2024-07-25'
      }
    ],
    
    // Skills Assessment
    softSkills: {
      'Comunicación': 9,
      'Trabajo en equipo': 8,
      'Resolución de conflictos': 9,
      'Adaptabilidad': 10,
      'Liderazgo': 7,
      'Empatía': 9
    },
    technicalSkills: [
      { id: 1, name: 'Sistemas CRM', level: 8 },
      { id: 2, name: 'Gestión de tickets', level: 9 },
      { id: 3, name: 'Comunicación telefónica', level: 9 }
    ]
  },
  {
    id: 2,
    name: 'Juan Pérez',
    dni: '12345678A',
    email: 'juan.perez@example.com',
    phone: '11-8765-4321',
    address: 'Calle Falsa 123',
    birthDate: '1988-03-12',
    photo: 'https://placehold.co/100x100/c2f0c2/333333?text=JP',
     hours: 120, // Total available hours for permissions
    position: 'Desarrollador de Sistemas',
    department: 'Sistemas',
    departmentId: 2,
    office: 'Anexo Norte',
    category: 'Técnico',
    status: 'Activo' as EmployeeStatus,
    employmentStatus: 'Contratado' as EmploymentStatus,
    activityType: 'Trabajo en sistemas',
    startDate: '2022-05-20',
    permanentDate: null,
    lastCategoryUpdate: '2023-01-10',
    
    managerId: 4,
    supervisor: 'Carlos Ruiz',
    role: 'empleado' as EmployeeRole,

    schedule: {
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 8
    },
    
    productivityScore: 8.5,
    overallProductivity: 88.0,
    monthlyHours: [
      { month: 'Ene', hours: 2 },
      { month: 'Feb', hours: 4 },
      { month: 'Mar', hours: -1 },
      { month: 'Abr', hours: 6 }
    ],
    tasks: [
      { name: 'Desarrollo de nuevas funciones', productivity: 9.0 },
      { name: 'Mantenimiento de base de datos', productivity: 8.0 },
      { name: 'Soporte técnico interno', productivity: 8.5 }
    ],
    
    licenses: {
      '2024': 2,
      '2023': 8,
      history: []
    },
    absences: {
      '2024': 0,
      '2023': 2
    },
    permits: [],
    
    complaints: [],
    messages: [],
    
    softSkills: {
      'Comunicación': 7,
      'Trabajo en equipo': 9,
      'Resolución de conflictos': 8,
      'Adaptabilidad': 9,
      'Liderazgo': 6,
      'Empatía': 7
    },
    technicalSkills: [
      { id: 1, name: 'React.js', level: 9 },
      { id: 2, name: 'Node.js', level: 8 },
      { id: 3, name: 'SQL', level: 8 },
      { id: 4, name: 'DevOps con Docker', level: 7 }
    ]
  },
  {
    id: 3,
    name: 'María Rodríguez',
    dni: '87654321B',
    email: 'maria.rodriguez@example.com',
    phone: '11-2233-4455',
    address: 'Boulevard de los Sueños Rotos',
    birthDate: '1985-11-08',
    photo: 'https://placehold.co/100x100/f0c2f0/333333?text=MR',
    hours: 160, // Total available hours for permissions
    position: 'Especialista en Recursos Humanos',
    department: 'Recursos Humanos',
    departmentId: 3,
    office: 'Sede Central',
    category: 'Profesional',
    status: 'De licencia' as EmployeeStatus,
    employmentStatus: 'Planta permanente' as EmploymentStatus,
    activityType: 'Administrativo',
    startDate: '2018-09-01',
    permanentDate: '2019-09-01',
    lastCategoryUpdate: '2022-11-15',
    
    managerId: null,
    supervisor: 'Dirección',
    role: 'supervisor' as EmployeeRole,
    schedule: {
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 8
    },
    
    productivityScore: 7.8,
    overallProductivity: 92.3,
    monthlyHours: [
      { month: 'Ene', hours: -3 },
      { month: 'Feb', hours: 0 },
      { month: 'Mar', hours: 5 },
      { month: 'Abr', hours: 2 }
    ],
    tasks: [
      { name: 'Procesos de selección', productivity: 8.5 },
      { name: 'Gestión de nóminas', productivity: 7.5 },
      { name: 'Capacitaciones', productivity: 7.8 }
    ],
    
    licenses: {
      '2024': 8,
      '2023': 15,
      history: [
        {
          id: 'L3',
          type: 'Médica',
          startDate: '2024-06-20',
          endDate: '2024-06-30',
          status: 'Aprobada' as LicenseStatus,
          duration: 11,
          originalMessage: 'Licencia médica extendida.',
          requestedDays: 11,
          requestedDates: 'del 2024-06-20 al 2024-06-30'
        }
      ]
    },
    absences: {
      '2024': 2,
      '2023': 4
    },
    permits: [],
    
    complaints: [],
    messages: [
      {
        id: 'M2',
        text: 'Se aprueba su solicitud de licencia por asuntos personales.',
        days: 2,
        startDate: '2024-09-10',
        endDate: '2024-09-11',
        date: '2024-09-08'
      }
    ],
    
    softSkills: {
      'Comunicación': 8,
      'Trabajo en equipo': 7,
      'Resolución de conflictos': 8,
      'Adaptabilidad': 7,
      'Liderazgo': 8,
      'Empatía': 9
    },
    technicalSkills: [
      { id: 1, name: 'Gestión de Proyectos (Agile)', level: 8 },
      { id: 2, name: 'Análisis de Datos con Pandas', level: 6 },
      { id: 3, name: 'Sistemas RRHH', level: 9 }
    ]
  },
  {
    id: 4,
    name: 'Carlos Sánchez',
    dni: '11223344C',
    email: 'carlos.sanchez@example.com',
    phone: '11-5566-7788',
    address: 'Av. Corrientes 1234',
    birthDate: '1982-07-15',
    photo: 'https://placehold.co/100x100/c2c2f0/333333?text=CS',
     hours: 140, // Total available hours for permissions
    position: 'Auditor Legal',
    department: 'Legales',
    departmentId: 4,
    office: 'Sede Central',
    category: 'Auditor',
    status: 'Parte médico' as EmployeeStatus,
    employmentStatus: 'Auditor' as EmploymentStatus,
    activityType: 'Expedientes',
    startDate: '2019-02-10',
    permanentDate: null,
    lastCategoryUpdate: '2021-08-20',
    
    managerId: null,
    supervisor: 'Dirección Legal',
    role: 'auditor' as EmployeeRole,

    schedule: {
      startTime: '08:30',
      endTime: '17:30',
      workingHours: 8
    },
    
    productivityScore: 6.5,
    overallProductivity: 75.2,
    monthlyHours: [
      { month: 'Ene', hours: 1 },
      { month: 'Feb', hours: -5 },
      { month: 'Mar', hours: -2 },
      { month: 'Abr', hours: 1 }
    ],
    tasks: [
      { name: 'Revisión de expedientes', productivity: 7.0 },
      { name: 'Dictámenes legales', productivity: 6.0 },
      { name: 'Auditorías internas', productivity: 6.5 }
    ],
    
    licenses: {
      '2024': 4,
      '2023': 10,
      history: []
    },
    absences: {
      '2024': 3,
      '2023': 6
    },
    permits: [],
    
    complaints: [
      {
        id: 'C02',
        reason: 'Excesivo formalismo en la comunicación.',
        date: '2024-02-10',
        status: 'En revisión' as ComplaintStatus
      },
      {
        id: 'C03',
        reason: 'Plazos de entrega no cumplidos.',
        date: '2024-03-15',
        status: 'Pendiente' as ComplaintStatus
      }
    ],
    messages: [],
    
    softSkills: {
      'Comunicación': 5,
      'Trabajo en equipo': 6,
      'Resolución de conflictos': 5,
      'Adaptabilidad': 7,
      'Liderazgo': 5,
      'Empatía': 4
    },
    technicalSkills: [
      { id: 1, name: 'Derecho Laboral', level: 9 },
      { id: 2, name: 'Auditoría', level: 8 },
      { id: 3, name: 'Análisis Legal', level: 8 }
    ]
  },
  {
    id: 5,
    name: 'Laura Fernández',
    dni: '99887766D',
    email: 'laura.fernandez@example.com',
    phone: '11-9988-7766',
    address: 'San Martín 567',
    birthDate: '1992-01-25',
    photo: 'https://placehold.co/100x100/f0d4c2/333333?text=LF',
    hours: 0, // Total available hours for permissions
    position: 'Especialista Senior en Atención al Cliente',
    department: 'Atención al Cliente',
    departmentId: 1,
    office: 'Anexo Sur',
    category: 'Administrativo',
    status: 'Activo' as EmployeeStatus,
    employmentStatus: 'Comisionado' as EmploymentStatus,
    activityType: 'Atención al público',
    startDate: '2021-08-10',
    permanentDate: null,
    lastCategoryUpdate: '2023-08-10',
    
    managerId: 1,
    supervisor: 'Ana García',
    role: 'empleado' as EmployeeRole,

    schedule: {
      startTime: '08:00',
      endTime: '17:00',
      workingHours: 8
    },
    
    productivityScore: 9.8,
    overallProductivity: 98.5,
    monthlyHours: [
      { month: 'Ene', hours: 10 },
      { month: 'Feb', hours: 8 },
      { month: 'Mar', hours: 12 },
      { month: 'Abr', hours: 9 }
    ],
    tasks: [
      { name: 'Resolución de tickets', productivity: 10.0 },
      { name: 'Atención telefónica', productivity: 9.5 },
      { name: 'Gestión de reclamos', productivity: 9.8 }
    ],
    
    licenses: {
      '2024': 1,
      '2023': 5,
      history: []
    },
    absences: {
      '2024': 0,
      '2023': 0
    },
    permits: [],
    
    complaints: [],
    messages: [],
    
    softSkills: {
      'Comunicación': 10,
      'Trabajo en equipo': 9,
      'Resolución de conflictos': 10,
      'Adaptabilidad': 9,
      'Liderazgo': 8,
      'Empatía': 10
    },
    technicalSkills: [
      { id: 1, name: 'Sistemas CRM Avanzado', level: 10 },
      { id: 2, name: 'Gestión de tickets', level: 10 },
      { id: 3, name: 'Comunicación multicanal', level: 9 },
      { id: 4, name: 'Análisis de satisfacción', level: 8 }
    ]
  }
];

// Additional reference data for consistency
export const DEPARTMENTS = [
  { id: 1, name: 'Atención al Cliente', description: 'Gestión de relaciones con clientes' },
  { id: 2, name: 'Sistemas', description: 'Desarrollo y mantenimiento tecnológico' },
  { id: 3, name: 'Recursos Humanos', description: 'Gestión del capital humano' },
  { id: 4, name: 'Legales', description: 'Asesoría legal y auditoría' },
  { id: 5, name: 'Marketing', description: 'Promoción y comunicación' },
  { id: 6, name: 'Tecnología', description: 'Innovación tecnológica' },
  { id: 7, name: 'Diseño', description: 'Diseño UX/UI y gráfico' }
];

export const AVAILABLE_SKILLS = [
  { id: 1, name: 'React.js', category: 'Frontend' },
  { id: 2, name: 'Node.js', category: 'Backend' },
  { id: 3, name: 'Python', category: 'Programming' },
  { id: 4, name: 'Análisis de Datos con Pandas', category: 'Data Science' },
  { id: 5, name: 'Gestión de Proyectos (Agile)', category: 'Management' },
  { id: 6, name: 'SQL', category: 'Database' },
  { id: 7, name: 'DevOps con Docker', category: 'Infrastructure' },
  { id: 8, name: 'UI/UX Design Fundamentals', category: 'Design' },
  { id: 9, name: 'Sistemas CRM', category: 'Business Tools' },
  { id: 10, name: 'Derecho Laboral', category: 'Legal' },
  { id: 11, name: 'Auditoría', category: 'Finance' }
];

export const SOFT_SKILLS_CATALOG = [
  { id: 1, name: 'Comunicación', description: 'Habilidad para transmitir ideas de forma clara y concisa' },
  { id: 2, name: 'Trabajo en equipo', description: 'Capacidad para colaborar efectivamente con otros' },
  { id: 3, name: 'Resolución de conflictos', description: 'Aptitud para mediar y resolver disputas' },
  { id: 4, name: 'Adaptabilidad', description: 'Flexibilidad ante cambios y nuevas situaciones' },
  { id: 5, name: 'Liderazgo', description: 'Capacidad para guiar y motivar equipos' },
  { id: 6, name: 'Empatía', description: 'Habilidad para comprender y conectar con otros' },
  { id: 7, name: 'Pensamiento Crítico', description: 'Análisis objetivo de información para tomar decisiones' },
  { id: 8, name: 'Resolución de Problemas', description: 'Identificación y solución creativa de problemas' }
];

// Status options for consistency
export const EMPLOYEE_STATUS = {
  ACTIVE: 'Activo',
  ON_LEAVE: 'De licencia',
  MEDICAL_LEAVE: 'Parte médico',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido'
};

export const EMPLOYMENT_STATUS = {
  PERMANENT: 'Planta permanente',
  CONTRACT: 'Contratado',
  COMMISSIONED: 'Comisionado',
  AUDITOR: 'Auditor',
  TEMPORARY: 'Temporal'
};

export const EMPLOYEE_ROLES = {
  EMPLOYEE: 'empleado',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  ADMIN: 'admin',
  AUDITOR: 'auditor'
};