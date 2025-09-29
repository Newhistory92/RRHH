

import { ComplaintStatus, EmployeeRole, EmployeeStatus, EmploymentStatus, LicenseStatus, TestsByProfession,SkillStatus } from "../Interfas/Interfaces";


  // const TIPOS_LICENCIA = [
  //   'Licencia', 'Parte_Medico', 'Profilactica', 'Particular',
  //   'Matrimonio', 'Matrimonio_Hijo', 'Paternidad', 'Paternidad_Especial',
  //   'Maternidad', 'Fallecimiento', 'Enfermedad', 'Guarda_Tenencia','Articulo'
  // ];
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
    gender: 'Femenino',
    birthDate: '1990-05-20',
    photo: 'https://placehold.co/150x150/E2E8F0/4A5568?text=AG',
    hours: 160, 
    // Información organizacional actualizada
    position: 'Abogado',
    department: 'Atención al Cliente',
    departmentId: 2,
    office: [],
    officeId: 201,
    category: '24',
    status: 'Activo' as EmployeeStatus,
    employmentStatus: 'Planta permanente' as EmploymentStatus,
    activityType: 'Atención al público',
    startDate: '2020-03-15',
    permanentDate: '2021-03-15',
    lastCategoryUpdate: '2023-06-01',
    
    // Jerarquía organizacional
    managerId: 3, // Reporta a María Rodríguez
    supervisor: 'María Rodríguez',
    role: 'supervisor' as EmployeeRole, // Lidera su oficina
    subordinates: [5], // Supervisa a Laura Fernández
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
      '2024': 21, // Licencias del año actual
      '2023': 5,  // Licencias del año anterior
      '2022': 2,  // Licencias de hace 2 años
     usuarios: {
  'empleado-1': { id: 1, name: 'Juan Pérez', dni: '12.345.678',  office: 'Contabilidad', role: 'empleado' },
  'supervisor-1': { id: 2, name: 'Ana García (Jefa de Área)', dni: '98.765.432', department: 'Dirección', role: 'supervisor' },
  'supervisor-2': { id: 3, name: 'Carlos Gomez (Director Gral.)', dni: '55.666.777', department: 'Gerencia', role: 'supervisor' },
},
      saldos: {
      '2024': {
        Licencias: 21,
        Particulares: 5,
        Articulos: 10,
        Examen: 4
      },
      '2023': {
        Licencias: 5,
        Particulares: 0,
        Articulos: 0,
        Examen: 0
      },
      '2022': {
        Licencias: 2,
        Particulares: 0,
        Articulos: 0,
        Examen: 0
      }
    }, 
      history: [
        {
          id: 1,
          solicitanteId:1,
          supervisorId :1,
          name: 'Ana García',
          type: 'Vacaciones',
          startDate: '2024-07-10',
          endDate: '2024-07-20',
          status: 'Pendiente' as LicenseStatus,
          duration: 10,
          originalMessage: 'Se aprueba la licencia por vacaciones solicitada para julio.',
          createdAt:'2024-07-10'
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
        id: 1,
        text: 'Solicitud de licencia por vacaciones aprobada.',
        days: 5,
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        date: '2024-07-25'
      }
    ],
    
    // Skills Assessment
    softSkills: [
      {
        nombre: 'Comunicación',
        level: 9
      },
      {
        nombre: 'Trabajo en equipo',
        level: 8
      },
      {
        nombre: 'Resolución de conflictos',
        level: 9
      },
      {
        nombre: 'Adaptabilidad',
        level: 10
      },
      {
        nombre: 'Liderazgo',
        level: 7
      },
      {
        nombre: 'Empatía',
        level: 9
      }
    ],
    technicalSkills: [
      { id: 1, nombre: 'Sistemas CRM', level: 8 },
      { id: 2, nombre: 'Gestión de tickets', level: 9 },
      { id: 3, nombre: 'Comunicación telefónica', level: 9 }
    ],
    academicFormation: [ 
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null }, 
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
    certifications: [
      { id: 1, name: 'Certificación en Gestión de Proyectos', institution: 'PMI', date: '2022-05-15', validUntil: '2025-05-15', attachment: null },
      { id: 2, name: 'Curso Avanzado de Comunicación', institution: 'Coursera', date: '2023-03-20', validUntil: '2026-03-20', attachment: null }  ,
    ],
    feedback_history: [],
    notificaciones: [
  { id: 1, text: 'Nueva solicitud de vacaciones de Juan Pérez.', time: 'hace 5 minutos',status:'nueva' },
  { id: 2, text: 'El reporte de productividad del Q2 está listo.', time: 'hace 2 horas',status:'leida' },
  { id: 3, text: 'Recordatorio: Reunión de equipo a las 3 PM.', time: 'hace 1 día',status:'leida' },
    ],
  },

  {
    id: 2,
    name: 'Juan Pérez',
    dni: '12345678A',
    email: 'juan.perez@example.com',
    gender: 'Masculino',
    phone: '11-8765-4321',
    address: 'Calle Falsa 123',
    birthDate: '1988-03-12',
    photo: 'https://placehold.co/100x100/c2f0c2/333333?text=JP',
    hours: 120, 
    position: 'Desarrollador de Sistemas',
    department: 'Sistemas',
    departmentId: 2,
    office: [
      {
        id: 401,
        nombre: 'Desarrollo de Aplicaciones',
        descripcion: 'Desarrollo de nuevas funcionalidades y mantenimiento de sistemas.',
        jefeId: 2,
        empleadosIds: [2],
        departmentId: 4
      }
    ],
    officeId: 401,
    category: '17',
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
    
      softSkills: [
      {
        nombre: 'Comunicación',
        level: 9
      },
      {
        nombre: 'Trabajo en equipo',
        level: 8
      },
      {
        nombre: 'Resolución de conflictos',
        level: 9
      },
      {
        nombre: 'Adaptabilidad',
        level: 10
      },
      {
        nombre: 'Liderazgo',
        level: 7
      },
      {
        nombre: 'Empatía',
        level: 9
      }
    ],
    technicalSkills: [
      { id: 1, nombre: 'React.js', level: 9 },
      { id: 2, nombre: 'Node.js', level: 8 },
      { id: 3, nombre: 'SQL', level: 8 },
      { id: 4, nombre: 'DevOps con Docker', level: 7 }
    ],academicFormation: [
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null },
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
     certifications: [
      { id: 1, name: 'Certificación en Gestión de Proyectos', institution: 'PMI', date: '2022-05-15', validUntil: '2025-05-15', attachment: null },
      { id: 2, name: 'Curso Avanzado de Comunicación', institution: 'Coursera', date: '2023-03-20', validUntil: '2026-03-20', attachment: null }  ,
    ],
    feedback_history: [],
  },
  {
    id: 3,
    name: 'María Rodríguez',
    dni: '87654321B',
    email: 'maria.rodriguez@example.com',
    gender: 'Femenino',
    phone: '11-2233-4455',
    address: 'Boulevard de los Sueños Rotos',
    birthDate: '1985-11-08',
    photo: 'https://placehold.co/100x100/f0c2f0/333333?text=MR',
    hours: 160, // Total available hours for permissions
    position: 'Especialista en Recursos Humanos',
    department: 'Recursos Humanos',
    departmentId: 3,
    office: [
      {
        id: 301,
        nombre: 'Administración de Personal',
        descripcion: 'Gestión de nóminas, licencias y administración del personal.',
        jefeId: 3,
        empleadosIds: [3],
        departmentId: 3
      }
    ],
    officeId: 301,
    category: '12',
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
        id: 2,
        text: 'Se aprueba su solicitud de licencia por asuntos personales.',
        days: 2,
        startDate: '2024-09-10',
        endDate: '2024-09-11',
        date: '2024-09-08'
      }
    ],
      softSkills: [
      {
        nombre: 'Comunicación',
        level: 9
      },
      {
        nombre: 'Trabajo en equipo',
        level: 8
      },
      {
        nombre: 'Resolución de conflictos',
        level: 9
      },
      {
        nombre: 'Adaptabilidad',
        level: 10
      },
      {
        nombre: 'Liderazgo',
        level: 7
      },
      {
        nombre: 'Empatía',
        level: 9
      }
    ],
    technicalSkills: [
      { id: 1, nombre: 'Gestión de Proyectos (Agile)', level: 8 },
      { id: 2, nombre: 'Análisis de Datos con Pandas', level: 6 },
      { id: 3, nombre: 'Sistemas RRHH', level: 9 }
    ],academicFormation: [
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null },
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
     certifications: [
      { id: 1, name: 'Certificación en Gestión de Proyectos', institution: 'PMI', date: '2022-05-15', validUntil: '2025-05-15', attachment: null },
      { id: 2, name: 'Curso Avanzado de Comunicación', institution: 'Coursera', date: '2023-03-20', validUntil: '2026-03-20', attachment: null }  ,
    ],
    feedback_history: [],
  },
  {
    id: 4,
    name: 'Carlos Sánchez',
    dni: '11223344C',
    email: 'carlos.sanchez@example.com',
    gender: 'Masculino',
    phone: '11-5566-7788',
    address: 'Av. Corrientes 1234',
    birthDate: '1982-07-15',
    photo: 'https://placehold.co/100x100/c2c2f0/333333?text=CS',
     hours: 140, // Total available hours for permissions
    position: 'Auditor Legal',
    department: 'Legales',
    departmentId: 4,
    office: [
      {
        id: 501,
        nombre: 'Auditoría Legal',
        descripcion: 'Revisión de expedientes y auditorías internas de cumplimiento.',
        jefeId: 4,
        empleadosIds: [4],
        departmentId: 5
      }
    ],
     officeId: 501,
    category: '24',
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
    
     softSkills: [
      {
        nombre: 'Comunicación',
        level: 9
      },
      {
        nombre: 'Trabajo en equipo',
        level: 8
      },
      {
        nombre: 'Resolución de conflictos',
        level: 9
      },
      {
        nombre: 'Adaptabilidad',
        level: 10
      },
      {
        nombre: 'Liderazgo',
        level: 7
      },
      {
        nombre: 'Empatía',
        level: 9
      }
    ],
    technicalSkills: [
      { id: 1,nombre: 'Derecho Laboral', level: 9 },
      { id: 2, nombre: 'Auditoría', level: 8 },
      { id: 3, nombre: 'Análisis Legal', level: 8 }
    ],academicFormation: [
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null },
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
     certifications: [
      { id: 1, name: 'Certificación en Gestión de Proyectos', institution: 'PMI', date: '2022-05-15', validUntil: '2025-05-15', attachment: null },
      { id: 2, name: 'Curso Avanzado de Comunicación', institution: 'Coursera', date: '2023-03-20', validUntil: '2026-03-20', attachment: null }  ,
    ],
    feedback_history: [],
  },
  {
    id: 5,
    name: 'Laura Fernández',
    dni: '99887766D',
    email: 'laura.fernandez@example.com',
    gender: 'Femenino',
    phone: '11-9988-7766',
    address: 'San Martín 567',
    birthDate: '1992-01-25',
    photo: 'https://placehold.co/100x100/f0d4c2/333333?text=LF',
    hours: 0, // Total available hours for permissions
    position: 'Especialista Senior en Atención al Cliente',
    department: 'Atención al Cliente',
    departmentId: 1,
    office: [
      {
        id: 202,
        nombre: 'Gestión de Reclamos',
        descripcion: 'Resolución especializada de quejas y reclamos complejos.',
        jefeId: 5,
        empleadosIds: [5],
        departmentId: 2
      }
    ],
    officeId: 202,
    category: '20',
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
      softSkills: [
      {
        nombre: 'Comunicación',
        level: 9
      },
      {
        nombre: 'Trabajo en equipo',
        level: 8
      },
      {
        nombre: 'Resolución de conflictos',
        level: 9
      },
      {
        nombre: 'Adaptabilidad',
        level: 10
      },
      {
        nombre: 'Liderazgo',
        level: 7
      },
      {
        nombre: 'Empatía',
        level: 9
      }
    ],
    technicalSkills: [
      { id: 1, nombre: 'Sistemas CRM Avanzado', level: 10 },
      { id: 2, nombre: 'Gestión de tickets', level: 10 },
      { id: 3, nombre: 'Comunicación multicanal', level: 9 },
      { id: 4, nombre: 'Análisis de satisfacción', level: 8 }
    ],academicFormation: [
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null },
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
     certifications: [
      { id: 1, name: 'Certificación en Gestión de Proyectos', institution: 'PMI', date: '2022-05-15', validUntil: '2025-05-15', attachment: null },
      { id: 2, name: 'Curso Avanzado de Comunicación', institution: 'Coursera', date: '2023-03-20', validUntil: '2026-03-20', attachment: null }  ,
    ],
    feedback_history: [],
  }
];

// Additional reference data for consistency
export const DEPARTMENTS = [
  { 
    id: 1, 
    nombre: 'Dirección General', 
    descripcion: 'Máxima autoridad de la organización',
    nivel_jerarquico: 1,
    parentId: null,
    offices: ['Dirección Ejecutiva']
  },
  { 
    id: 2, 
    nombre: 'Atención al Cliente', 
    descripcion: 'Gestión de relaciones con clientes',
    nivel_jerarquico: 2,
    parentId: 1,
    offices: ['Atención Telefónica', 'Gestión de Reclamos']
  },
  { 
    id: 3, 
    nombre: 'Recursos Humanos', 
    descripcion: 'Gestión del capital humano',
    nivel_jerarquico: 2,
    parentId: 1,
    offices: ['Administración de Personal', 'Selección y Capacitación']
  },
  { 
    id: 4, 
    nombre: 'Sistemas', 
    descripcion: 'Desarrollo y mantenimiento tecnológico',
    nivel_jerarquico: 2,
    parentId: 1,
    offices: ['Desarrollo de Aplicaciones', 'Soporte Técnico']
  },
  { 
    id: 5, 
    nombre: 'Legales', 
    descripcion: 'Asesoría legal y auditoría',
    nivel_jerarquico: 2,
    parentId: 1,
    offices: ['Auditoría Legal', 'Asesoría Jurídica']
  }
];


export const INTEGRATED_ORG_DATA = [
  {
    id: 1,
    nombre: 'Dirección General',
    nivel_jerarquico: 1,
    descripcion: 'Máxima autoridad de la organización. Define la estrategia y supervisa todas las operaciones.',
    jefeId: null, // CEO - sin jefe directo
    parentId: null,
    habilidades_requeridas: [{
      id: 1,
      nombre: 'Liderazgo Estratégico',
      nivel: 'intermedio'
    }, {
      id: 2,
      nombre: 'Visión Empresarial',
      nivel: 'intermedio'
    }],
    oficinas: [
      {
        id: 101,
        nombre: 'Dirección Ejecutiva',
        descripcion: 'Oficina principal de dirección y toma de decisiones estratégicas.',
        ubicacion: 'Sede Central - Piso 10',
        jefeId: null, // CEO
        empleadosIds: [1], // El CEO no está en nuestros datos de empleados actuales
        departmentId: 1,
        habilidades_requeridas: [{
          id: 1,
          nombre: 'Liderazgo Estratégico',
          nivel: 'intermedio'
        }, {
          id: 2,
          nombre: 'Toma de Decisiones',
          nivel: 'intermedio'
        }]
      }
    ]
  },
  {
    id: 2,
    nombre: 'Atención al Cliente',
    nivel_jerarquico: 2,
    descripcion: 'Gestión de relaciones con clientes, soporte y resolución de consultas.',
    jefeId: 3, // María Rodríguez como supervisora general
    parentId: 1,
    habilidades_requeridas: [{
      id: 3,
      nombre: 'Comunicación',
      nivel: 'intermedio'
    }, {
      id: 4,
      nombre: 'Empatía',
      nivel: 'intermedio'
    }, {
      id: 5,
      nombre: 'Resolución de conflictos',
      nivel: 'intermedio'
    }],
    oficinas: [
      {
        id: 201,
        nombre: 'Atención Telefónica',
        descripcion: 'Atención directa a clientes vía telefónica y chat.',
        ubicacion: 'Sede Central - Piso 2',
        jefeId: 1, // Ana García
        empleadosIds: [1, 5], // Ana García y Laura Fernández
        departmentId: 2,
        habilidades_requeridas: [{
          id: 6,
          nombre: 'Comunicación telefónica',
          nivel: 'intermedio'
        }, {
          id: 7,
          nombre: 'Sistemas CRM',
          nivel: 'intermedio'
        }, {
          id: 8,
          nombre: 'Gestión de tickets',
          nivel: 'básico'
        }]
      },
      {
        id: 202,
        nombre: 'Gestión de Reclamos',
        descripcion: 'Resolución especializada de quejas y reclamos complejos.',
        ubicacion: 'Anexo Sur - Piso 1',
        jefeId: 5, // Laura Fernández (especialista senior)
        empleadosIds: [5], // Laura Fernández
        departmentId: 2,
        habilidades_requeridas: [{
          id: 9,
          nombre: 'Resolución de conflictos',
          nivel: 'intermedio'
        }, {
          id: 10,
          nombre: 'Análisis de satisfacción',
          nivel: 'básico'
        }]
      }
    ]
  },
  {
    id: 3,
    nombre: 'Recursos Humanos',
    nivel_jerarquico: 2,
    descripcion: 'Gestión del capital humano, incluyendo contratación, nóminas y clima laboral.',
    jefeId: null, // Reporta directamente a dirección
    parentId: 1,
    habilidades_requeridas: [{
      id: 11,
      nombre: 'Legislación Laboral',
      nivel: 'básico'
    }, {
      id: 12,
      nombre: 'Gestión de Personal',
      nivel: 'intermedio'
    }],
    oficinas: [
      {
        id: 301,
        nombre: 'Administración de Personal',
        descripcion: 'Gestión de nóminas, licencias y administración del personal.',
        ubicacion: 'Sede Central - Piso 3',
        jefeId: 3, // María Rodríguez
        empleadosIds: [3], // María Rodríguez
        departmentId: 3,
        habilidades_requeridas: [{
          id: 13,
          nombre: 'Sistemas RRHH',
          nivel: 'intermedio'
        }, {
          id: 14,
          nombre: 'Gestión de nóminas',
          nivel: 'básico'
        }]
      },
      {
        id: 302,
        nombre: 'Selección y Capacitación',
        descripcion: 'Procesos de selección de personal y desarrollo de capacitaciones.',
        ubicacion: 'Sede Central - Piso 3',
        jefeId: 3, // María Rodríguez
        empleadosIds: [3], // María Rodríguez (maneja ambas funciones)
        departmentId: 3,
        habilidades_requeridas: [{
          id: 15,
          nombre: 'Procesos de selección',
          nivel: 'intermedio'
        }, {
          id: 16,
          nombre: 'Capacitaciones',
          nivel: 'básico'
        }]
      }
    ]
  },
  {
    id: 4,
    nombre: 'Sistemas',
    nivel_jerarquico: 2,
    descripcion: 'Desarrollo y mantenimiento tecnológico, infraestructura y soporte técnico.',
    jefeId: null, // Reporta directamente a dirección
    parentId: 1,
    habilidades_requeridas: [{
      id: 17,
      nombre: 'Desarrollo de Software',
      nivel: 'intermedio'
    }, {
      id: 18,
      nombre: 'Infraestructura TI',
      nivel: 'básico'
    }],
    oficinas: [
      {
        id: 401,
        nombre: 'Desarrollo de Aplicaciones',
        descripcion: 'Desarrollo de nuevas funcionalidades y mantenimiento de sistemas.',
        ubicacion: 'Anexo Norte - Piso 2',
        jefeId: 2, // Juan Pérez (como desarrollador principal)
        empleadosIds: [2], // Juan Pérez
        departmentId: 4,
        habilidades_requeridas: [{
          id: 19,
          nombre: 'React.js',
          nivel: 'intermedio'
        }, {
          id: 20,
          nombre: 'Node.js',
          nivel: 'intermedio'
        }, {
          id: 30,
          nombre: 'SQL',
          nivel: 'básico'
        }]
      },
      {
        id: 402,
        nombre: 'Soporte Técnico',
        descripcion: 'Soporte técnico interno y mantenimiento de infraestructura.',
        ubicacion: 'Anexo Norte - Piso 1',
        jefeId: 2, // Juan Pérez
        empleadosIds: [2], // Juan Pérez (cubre ambas áreas)
        departmentId: 4,
        habilidades_requeridas: [{
          id: 21,
          nombre: 'DevOps con Docker',
          nivel: 'intermedio'
        }, {
          id: 22,
          nombre: 'Soporte técnico interno',
          nivel: 'básico'
        }]
      }
    ]
  },
  {
    id: 5,
    nombre: 'Legales',
    nivel_jerarquico: 2,
    descripcion: 'Asesoría legal, auditoría y cumplimiento normativo.',
    jefeId: null, // Reporta directamente a dirección
    parentId: 1,
    habilidades_requeridas: [{
      id: 23,
      nombre: 'Derecho Laboral',
      nivel: 'básico'
    }, {
      id: 24,
      nombre: 'Auditoría Legal',
      nivel: 'avanzado'
    }],
    oficinas: [
      {
        id: 501,
        nombre: 'Auditoría Legal',
        descripcion: 'Revisión de expedientes y auditorías internas de cumplimiento.',
        ubicacion: 'Sede Central - Piso 4',
        jefeId: 4, // Carlos Sánchez
        empleadosIds: [4], // Carlos Sánchez
        departmentId: 5,
        habilidades_requeridas: [{
          id: 256,
          nombre: 'Auditoría',
          nivel: 'avanzado'
        }, {
          id: 26,
          nombre: 'Análisis Legal',
          nivel: 'intermedio'
        }, {
          id: 33,
          nombre: 'Derecho Laboral',
          nivel: 'básico'
        }]
      },
      {
        id: 502,
        nombre: 'Asesoría Jurídica',
        descripcion: 'Consultoría legal y elaboración de dictámenes.',
        ubicacion: 'Sede Central - Piso 4',
        jefeId: 4, // Carlos Sánchez
        empleadosIds: [4], // Carlos Sánchez
        departmentId: 5,
        habilidades_requeridas: [
          { id: 29, nombre: 'Dictámenes legales', nivel: 'avanzado' },
          { id: 28, nombre: 'Derecho Laboral', nivel: 'intermedio' }
        ]
      }
    ]
  }
];




// Lista completa de oficinas
export const OFFICES = [
  // Dirección General
  { id: 101, name: 'Dirección Ejecutiva', departmentId: 1, location: 'Sede Central - Piso 10' },
  
  // Atención al Cliente
  { id: 201, name: 'Atención Telefónica', departmentId: 2, location: 'Sede Central - Piso 2' },
  { id: 202, name: 'Gestión de Reclamos', departmentId: 2, location: 'Anexo Sur - Piso 1' },
  
  // Recursos Humanos
  { id: 301, name: 'Administración de Personal', departmentId: 3, location: 'Sede Central - Piso 3' },
  { id: 302, name: 'Selección y Capacitación', departmentId: 3, location: 'Sede Central - Piso 3' },
  
  // Sistemas
  { id: 401, name: 'Desarrollo de Aplicaciones', departmentId: 4, location: 'Anexo Norte - Piso 2' },
  { id: 402, name: 'Soporte Técnico', departmentId: 4, location: 'Anexo Norte - Piso 1' },
  
  // Legales
  { id: 501, name: 'Auditoría Legal', departmentId: 5, location: 'Sede Central - Piso 4' },
  { id: 502, name: 'Asesoría Jurídica', departmentId: 5, location: 'Sede Central - Piso 4' }
];

export const AVAILABLE_SKILLS = [
  { id: 1, nombre: 'React.js', level: 8 },
  { id: 2, nombre: 'Node.js', level: 7 },
  { id: 3, nombre: 'Python', level: 6 },
  { id: 4, nombre: 'Análisis de Datos con Pandas', level: 5 },
  { id: 5, nombre: 'Gestión de Proyectos (Agile)', level: 4 },
  { id: 6, nombre: 'SQL', level: 3 },
  { id: 7, nombre: 'DevOps con Docker', level: 2 },
  { id: 8, nombre: 'UI/UX Design Fundamentals', level: 1 },
  { id: 9, nombre: 'Sistemas CRM', level: 1 },
  { id: 10, nombre: 'Derecho Laboral', level: 1 },
  { id: 11, nombre: 'Auditoría', level: 1 }
];

export const SOFT_SKILLS_CATALOG = [
  { id: 1, nombre: 'Comunicación', description: 'Habilidad para transmitir ideas de forma clara y concisa' },
  { id: 2, nombre: 'Trabajo en equipo', description: 'Capacidad para colaborar efectivamente con otros' },
  { id: 3, nombre: 'Resolución de conflictos', description: 'Aptitud para mediar y resolver disputas' },
  { id: 4, nombre: 'Adaptabilidad', description: 'Flexibilidad ante cambios y nuevas situaciones' },
  { id: 5, nombre: 'Liderazgo', description: 'Capacidad para guiar y motivar equipos' },
  { id: 6, nombre: 'Empatía', description: 'Habilidad para comprender y conectar con otros' },
  { id: 7, nombre: 'Pensamiento Crítico', description: 'Análisis objetivo de información para tomar decisiones' },
  { id: 8, nombre: 'Resolución de Problemas', description: 'Identificación y solución creativa de problemas' }
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


export const initialProfessions: { [key: string]: number[] } = {
  "Abogado": [9, 10, 11],
  "Contador" : [1, 2], // Sistemas CRM, Auditoría
  "Desarrollador": [1, 2, 6, 7], // React.js, Node.js, SQL, DevOps con Docker
  "Diseñador UX/UI": [1, 2, 6], // React.js, Node.js, SQL
  "Marketing Digital": [1, 2, 6], // React.js, Node.js, SQL
  "Recursos Humanos": [1, 2, 6] // React.js, Node.js, SQL
};

export const initialTestsByProfession:TestsByProfession = {
  "Contador": [
    {
      id: "1",
      name: "Fundamentos de Contabilidad",
      description: "Test básico sobre principios contables y estados financieros",
      type: "multiple-choice",
      questions: [
        {
          id: "q1",
          text: "¿Cuál es la ecuación fundamental de la contabilidad?",
          answers: [
            { id: "a1", text: "Activo = Pasivo + Patrimonio", isCorrect: true },
            { id: "a2", text: "Activo + Pasivo = Patrimonio", isCorrect: false },
            { id: "a3", text: "Patrimonio = Activo - Pasivo", isCorrect: false },
            { id: "a4", text: "Activo = Patrimonio - Pasivo", isCorrect: false },
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Análisis de Estados Financieros",
      description: "Caso práctico de análisis financiero empresarial",
      type: "case-study",
      scenario: "Una empresa presenta los siguientes estados financieros... Analice la situación financiera y proponga mejoras."
    }
  ],
  "Desarrollador": [
    {
      id: "3",
      name: "JavaScript Avanzado",
      description: "Test sobre conceptos avanzados de JavaScript",
      type: "multiple-choice",
      questions: [
        {
          id: "q2",
          text: "¿Qué es el 'hoisting' en JavaScript?",
          answers: [
            { id: "a5", text: "Elevación de declaraciones al inicio del scope", isCorrect: true },
            { id: "a6", text: "Un método para optimizar código", isCorrect: false },
            { id: "a7", text: "Una forma de declarar variables", isCorrect: false },
          ]
        }
      ]
    }
  ]
};



export const SKILL_STATUS_DATA: SkillStatus[] = [
  // Habilidades para Ana García (ID: 1)
  {
    id:1,
    skill_id: 1, // Sistemas CRM
    employee_id: 1,
    status: 'unlocked',
    unlockDate: '2024-01-15T10:30:00.000Z',
  },
  {
    id:2,
    skill_id: 2, // Gestión de tickets
    employee_id: 1,
    status: 'unlocked',
    unlockDate: '2024-02-20T14:45:00.000Z',
  },
  {
    id:3,
    skill_id: 3, // Comunicación telefónica
    employee_id: 1,
    status: 'unlocked',
    unlockDate: '2024-01-10T09:00:00.000Z',

  },

  // Habilidades bloqueadas para Ana García
  {
    id:4,
    skill_id: 10,
    employee_id: 1,
    status: 'locked',
    unlockDate: '2025-12-15T13:02:42.683Z',
  },
  {
    id:5,
    skill_id: 11,
    employee_id: 1,
    status: 'locked',
    unlockDate: '2025-06-01T08:00:00.000Z',
 
  },

  // Habilidades para María Rodríguez (ID: 3) - Gerente de Atención al Cliente
  {
    id:6,
    skill_id: 4, // Liderazgo de equipos
    employee_id: 3,
    status: 'locked',
    unlockDate: '2023-05-10T11:20:00.000Z',
 
  },
  {
    id:7,
    skill_id: 5, // Gestión de recursos
    employee_id: 3,
    status: 'locked',
    unlockDate: '2023-08-15T09:30:00.000Z',
   
  },
  {
    id:8,
    skill_id: 6, // Análisis de métricas
    employee_id: 3,
    status: 'locked',
    unlockDate: '2024-09-01T08:00:00.000Z',
   
  },

  // Habilidades para Laura Fernández (ID: 5) - Representante de Atención al Cliente
  {
    id:9,
    skill_id: 1, // Sistemas CRM
    employee_id: 5,
    status: 'locked',
    unlockDate: '2024-10-15T13:30:00.000Z',
    
  },
];



// [
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Resolución de conflictos",
//       "level": 9
//     },
//     "respuesta": [
//       0,
//       1,
//       0
//     ]
//   },
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Trabajo en equipo",
//       "level": 8
//     },
//     "respuesta": [
//       0,
//       1,
//       0
//     ]
//   },
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Empatía",
//       "level": 9
//     },
//     "respuesta": [
//       0,
//       0,
//       1
//     ]
//   },
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Liderazgo",
//       "level": 7
//     },
//     "respuesta": [
//       1,
//       0,
//       0
//     ]
//   },
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Adaptabilidad",
//       "level": 10
//     },
//     "respuesta": [
//       0,
//       0,
//       1
//     ]
//   },
//   {
//     "evaluador": "Ana García",
//     "evaluado": "Laura Fernández",
//     "softSkills": {
//       "nombre": "Comunicación",
//       "level": 9
//     },
//     "respuesta": [
//       1,
//       0,
//       0
//     ]
//   }
// ]



// export const getInitialDB = () => {
//   const currentYear = new Date().getFullYear();
  
//   // Convertir EMPLOYEES_DATA al formato del mockup original manteniendo jerarquía
//   const usuarios = {};
//   const saldos = {};
  
//   EMPLOYEES_DATA.forEach(employee => {
//     let userId;
    
//     // Generar ID según jerarquía específica
//     if (employee.role === 'empleado') {
//       userId = `empleado-${employee.id}`;
//     } else if (employee.role === 'supervisor') {
//       if (employee.supervisorLevel === 1) {
//         userId = 'supervisor-1'; // Supervisor directo
//       } else if (employee.supervisorLevel === 2) {
//         userId = 'supervisor-2'; // Supervisor del supervisor
//       }
//     }
    
//     usuarios[userId] = {
//       id: userId,
//       name: employee.name,
//       dni: employee.dni, // null para supervisores
//       oficina: employee.role === 'empleado' ? employee.office[0] : undefined,
//       department: employee.role === 'supervisor' ? employee.department : undefined,
//       rol: employee.role
//     };
    
//     saldos[userId] = Object.keys(employee.licenseBalances).map(year => ({
//       anio: parseInt(year),
//       ...employee.licenseBalances[year]
//     }));
//   });
  
//   return {
//     usuarios,
//     saldos,
//     solicitudes: []
//   };
// };

// // Función helper para obtener la cadena de supervisión
// export const getSupervisionChain = (employeeId) => {
//   const employee = getEmployeeById(employeeId);
//   if (!employee) return [];
  
//   const chain = [];
//   let current = employee;
  
//   while (current && current.managerId) {
//     const supervisor = getEmployeeById(current.managerId);
//     if (supervisor) {
//       chain.push({
//         id: supervisor.id,
//         name: supervisor.name,
//         role: supervisor.role,
//         level: supervisor.supervisorLevel
//       });
//       current = supervisor;
//     } else {
//       break;
//     }
//   }
  
//   return chain;
// };

// // Función helper para obtener empleado por ID
// export const getEmployeeById = (id) => {
//   return EMPLOYEES_DATA.find(emp => emp.id === id);
// };

// // Función helper para obtener empleados por rol
// export const getEmployeesByRole = (role) => {
//   return EMPLOYEES_DATA.filter(emp => emp.role === role);
// };