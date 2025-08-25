import   Notification, { Profession, Skill } from '../Interfas/Interfaces';
import   Employee from '../Interfas/Interfaces';
import   OrgNode from '../Interfas/Interfaces';
import { SoftSkill } from '../Interfas/Interfaces';

// --- DATOS DE PRUEBA ---
export const mockNotifications: Notification[] = [
  { id: 1, text: 'Nueva solicitud de vacaciones de Juan Pérez.', time: 'hace 5 minutos' },
  { id: 2, text: 'El reporte de productividad del Q2 está listo.', time: 'hace 2 horas' },
  { id: 3, text: 'Recordatorio: Reunión de equipo a las 3 PM.', time: 'hace 1 día' },
];

// export const mockEmployees: Employee[] = [
//   { id: 'EMP001', name: 'Ana García', position: 'Desarrolladora Frontend', department: 'Tecnología', email: 'ana.garcia@example.com', status: 'Activo' },
//   { id: 'EMP002', name: 'Carlos Rodríguez', position: 'Gerente de Proyectos', department: 'Tecnología', email: 'carlos.r@example.com', status: 'Activo' },
//   { id: 'EMP003', name: 'Beatriz López', position: 'Diseñadora UX/UI', department: 'Diseño', email: 'beatriz.l@example.com', status: 'Licencia' },
//   { id: 'EMP004', name: 'David Martínez', position: 'Especialista en Marketing', department: 'Marketing', email: 'david.m@example.com', status: 'Activo' },
// ];

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


export const mockData = {
  employees: [
    { id: 1, full_name: 'Ana García', email: 'ana.garcia@example.com', position: 'Desarrolladora Frontend Senior', department_id: 1, manager_id: 3, start_date: '2020-03-15', status: 'activo', role: 'empleado', photo: `https://placehold.co/150x150/E2E8F0/4A5568?text=AG`, dni: '12.345.678', birth_date: '1990-05-20' },
  ],
  availableSkills: [ 
      {id: 1, name: 'React.js'}, {id: 2, name: 'Node.js'}, {id: 3, name: 'Python'}, 
      {id: 4, name: 'Análisis de Datos con Pandas'}, {id: 5, name: 'Gestión de Proyectos (Agile)'}, {id: 6, name: 'SQL'},
      {id: 7, name: 'DevOps con Docker'}, {id: 8, name: 'UI/UX Design Fundamentals'}
  ],
  softSkills: [
      { id: 1, name: 'Comunicación Efectiva', description: 'Habilidad para transmitir ideas de forma clara y concisa, tanto verbalmente como por escrito, y escuchar activamente a los demás.' },
      { id: 2, name: 'Trabajo en Equipo', description: 'Capacidad para colaborar con otros, aportar al grupo y priorizar los objetivos del equipo sobre los individuales.' },
      { id: 3, name: 'Resolución de Problemas', description: 'Aptitud para identificar problemas, analizar sus causas y encontrar soluciones eficientes y creativas.' },
      { id: 4, name: 'Liderazgo', description: 'Capacidad para motivar, guiar e inspirar a un equipo hacia la consecución de metas comunes.' },
      { id: 5, name: 'Adaptabilidad', description: 'Flexibilidad para ajustarse a nuevos entornos, tareas y desafíos, manteniendo una actitud positiva ante el cambio.' },
      { id: 6, name: 'Pensamiento Crítico', description: 'Habilidad para analizar información de manera objetiva, evaluar argumentos y tomar decisiones fundamentadas.' },
  ],
};




export const initialCvData = (employee) => ({
    personalData: {
        fullName: employee.full_name, dni: employee.dni, birthDate: employee.birth_date,
        nationality: 'Argentino/a', gender: 'Femenino', address: 'Av. Libertador 1234',
        city: 'Buenos Aires', province: 'CABA', phone: '+54 9 11 1234 5678', email: employee.email, 
        profilePhoto: employee.photo, profilePhotoFile: null,
    },
    academicFormation: [ 
        { id: 1, title: 'Ingeniería en Sistemas de Información', institution: 'Universidad Tecnológica Nacional (UTN)', level: 'Universitario', status: 'Completo', startDate: '2010-03-01', endDate: '2015-12-15', isCurrent: false, attachment: null }, 
        { id: 2, title: 'Bachiller Técnico', institution: 'Escuela Técnica N°5', level: 'Secundario', status: 'Completo', startDate: '2005-03-01', endDate: '2009-12-10', isCurrent: false, attachment: null },
    ],
    languages: [ { id: 1, language: 'Inglés', level: 'Avanzado', certification: 'TOEFL iBT', attachment: null }, { id: 2, language: 'Español', level: 'Nativo', certification: '', attachment: null }, ],
    workExperience: [ 
        { id: 1, position: 'Desarrolladora Frontend Senior', company: 'Empresa Actual', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2020-03-01', endDate: '', isCurrent: true, contractType: 'Tiempo completo' },
        { id: 2, position: 'Desarrolladora Frontend', company: 'Tech Solutions S.A.', industry: 'Tecnología', location: 'Buenos Aires, Argentina', startDate: '2016-03-01', endDate: '2020-02-28', isCurrent: false, contractType: 'Tiempo completo' },
    ],
    technicalSkills: [ { id: 1, skill: 'JavaScript (ES6+)', level: 'Avanzado', experienceYears: 5 } ],
    softSkills: [1, 3], // IDs from mockSoftSkills
    certifications: [ { id: 1, name: 'Scrum Fundamentals Certified', issuingBody: 'SCRUMstudy', issueDate: '2019-06-10', attachment: null }, ],
    validation_status: 'Pendiente',
    skillStatus: [ { skill_id: 6, status: 'locked', unlockDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) } ]
});



export const getInitialDB = () => {
    const currentYear = new Date().getFullYear();
    return {
      usuarios: {
        'empleado-1': { id: 'empleado-1', nombreCompleto: 'Juan Pérez', dni: '12.345.678', oficina: 'Contabilidad', rol: 'empleado' },
        'supervisor-1': { id: 'supervisor-1', nombreCompleto: 'Ana García (Jefa de Área)', dni: '98.765.432', oficina: 'Dirección', rol: 'supervisor' },
        'supervisor-2': { id: 'supervisor-2', nombreCompleto: 'Carlos Gomez (Director Gral.)', dni: '55.666.777', oficina: 'Gerencia', rol: 'supervisor' },
      },
      saldos: {
        'empleado-1': [
            { anio: currentYear, Licencias: 21, Particulares: 5, Articulos: 10, Examen: 4 },
            { anio: currentYear - 1, Licencias: 5, Particulares: 0, Articulos: 0, Examen: 0 },
            { anio: currentYear - 2, Licencias: 2, Particulares: 0, Articulos: 0, Examen: 0 },
        ],
        'supervisor-1': [
            { anio: currentYear, Licencias: 21, Particulares: 5, Articulos: 10, Examen: 4 },
        ],
         'supervisor-2': [
            { anio: currentYear, Licencias: 21, Particulares: 5, Articulos: 10, Examen: 4 },
        ],
      },
      solicitudes: [],
    };
};



export const mockEmployeesorg = [
    { id: 101, nombre: 'Ana María Torres', foto: 'https://placehold.co/100x100/d1d4ff/333333?text=AT' },
    { id: 102, nombre: 'Juan Pérez', foto: 'https://placehold.co/100x100/c2f0c2/333333?text=JP' },
    { id: 103, nombre: 'Mónica Díaz', foto: 'https://placehold.co/100x100/f0c2f0/333333?text=MD' },
    { id: 104, nombre: 'David Ortiz', foto: 'https://placehold.co/100x100/f0f0c2/333333?text=DO' },
    { id: 105, nombre: 'Luisa Fernández', foto: 'https://placehold.co/100x100/f0d4c2/333333?text=LF' },
    { id: 106, nombre: 'Carlos Ruiz', foto: 'https://placehold.co/100x100/c2c2f0/333333?text=CR' },
    { id: 107, nombre: 'Sofía Gómez', foto: 'https://placehold.co/100x100/e6c2f0/333333?text=SG' },
    { id: 108, nombre: 'Ricardo Morales', foto: 'https://placehold.co/100x100/c2e2f0/333333?text=RM' },
    { id: 109, nombre: 'Elena Vázquez', foto: 'https://placehold.co/100x100/f0c2c2/333333?text=EV' },
    { id: 110, nombre: 'Pedro Castillo', foto: 'https://placehold.co/100x100/d3d3d3/333333?text=PC' },
    { id: 111, nombre: 'Laura Pausini', foto: 'https://placehold.co/100x100/c8d6e5/333333?text=LP' },
    { id: 112, nombre: 'Marco Antonio Solis', foto: 'https://placehold.co/100x100/f8c291/333333?text=MS' },
    { id: 113, nombre: 'Beatriz Pinzón', foto: 'https://placehold.co/100x100/ffda79/333333?text=BP' },
    { id: 114, nombre: 'Armando Mendoza', foto: 'https://placehold.co/100x100/778beb/333333?text=AM' },
];

export const initialDataOrg = [
    { id: 1, nombre: 'Dirección General', nivel_jerarquico: 1, descripcion: 'Máxima autoridad de la organización. Define la estrategia y supervisa todas las operaciones.', jefeId: 101, parentId: null, habilidades_requeridas: ['Liderazgo Estratégico'], oficinas: [] },
    { id: 2, nombre: 'Recursos Humanos', nivel_jerarquico: 2, descripcion: 'Gestión del capital humano, incluyendo contratación, nóminas y clima laboral.', jefeId: 102, parentId: 1, habilidades_requeridas: ['Legislación Laboral'], oficinas: [
        { id: 201, nombre: 'Selección de Personal', descripcion: 'Atrae, entrevista y selecciona al mejor talento para la organización.', jefeId: 105, empleadosIds: [106, 107], habilidades_requeridas: ['Headhunting'] },
        { id: 202, nombre: 'Nóminas y Compensaciones', descripcion: 'Administra salarios, beneficios e impuestos de los empleados.', jefeId: 108, empleadosIds: [109], habilidades_requeridas: ['Excel Avanzado'] }
    ]},
    { id: 3, nombre: 'Tecnología de la Información', nivel_jerarquico: 2, descripcion: 'Gestiona la infraestructura tecnológica, el software y la seguridad.', jefeId: 103, parentId: 1, habilidades_requeridas: ['Ciberseguridad'], oficinas: [] },
    { id: 4, nombre: 'Adquisiciones y Compras', nivel_jerarquico: 3, descripcion: 'Se encarga de la compra de materiales y suministros para la empresa.', jefeId: 113, parentId: 2, habilidades_requeridas: ['Negociación'], oficinas: [] },
    { id: 5, nombre: 'Contratación y Talento', nivel_jerarquico: 3, descripcion: 'Departamento enfocado en la búsqueda y reclutamiento de nuevos empleados.', jefeId: 114, parentId: 2, habilidades_requeridas: ['Reclutamiento'], oficinas: [] }
];



export const initialEmployees = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678A',
    estado: 'Activo',
    departamento: 'Desarrollo',
    horas: 8.5,
    foto: 'https://placehold.co/100x100/EFEFEF/333?text=JP',
    datosPersonales: {
        telefono: '11-1234-5678',
        domicilio: 'Av. Siempre Viva 742'
    },
    condicionLaboral: {
      tipoContrato: 'Planta permanente',
      fechaIngreso: '2020-01-15',
      fechaPlanta: '2021-01-15',
      categoria: 'Senior Developer',
      ultimaModificacionCategoria: '2023-06-01',
    },
    productividad: 95.5,
    supervisor: 'Ana Gómez',
    horario: {
      ingreso: '09:00',
      salida: '18:00',
    },
    licencias: [
      { id: 'L1', tipo: 'Vacaciones', inicio: '2023-07-10', fin: '2023-07-20', estado: 'Aprobada', duracion: 10, mensajeOriginal: 'Se aprueba la licencia por vacaciones solicitada para julio.', diasSolicitados: 10, fechasSolicitadas: 'del 2023-07-10 al 2023-07-20' },
      { id: 'L2', tipo: 'Médica', inicio: '2023-03-05', fin: '2023-03-07', estado: 'Aprobada', duracion: 3, mensajeOriginal: 'Licencia médica aprobada por 3 días.', diasSolicitados: 3, fechasSolicitadas: 'del 2023-03-05 al 2023-03-07' },
    ],
    mensajes: [
      { id: 'M1', texto: 'Solicitud de licencia por vacaciones aprobada.', dias: 5, fechaInicio: '2024-08-01', fechaFin: '2024-08-05' },
    ],
    permisos: [
      { id: 'P1', fecha: '2024-06-15', horaSalida: '14:00', horaRetorno: '15:30', horas: -1.5 }
    ],
  },
  {
    id: 2,
    nombre: 'Maria',
    apellido: 'Lopez',
    dni: '87654321B',
    estado: 'De licencia',
    departamento: 'Marketing',
    horas: -5,
    foto: 'https://placehold.co/100x100/EFEFEF/333?text=ML',
    datosPersonales: {
        telefono: '11-8765-4321',
        domicilio: 'Calle Falsa 123'
    },
    condicionLaboral: {
      tipoContrato: 'Contratado',
      fechaIngreso: '2022-05-20',
      fechaPlanta: null,
      categoria: 'Marketing Specialist',
      ultimaModificacionCategoria: '2023-01-10',
    },
    productividad: 88.0,
    supervisor: 'Carlos Ruiz',
    horario: {
      ingreso: '08:30',
      salida: '17:30',
    },
    licencias: [
      { id: 'L3', tipo: 'Médica', inicio: '2024-06-20', fin: '2024-06-30', estado: 'Aprobada', duracion: 11, mensajeOriginal: 'Licencia médica extendida.', diasSolicitados: 11, fechasSolicitadas: 'del 2024-06-20 al 2024-06-30' },
    ],
    mensajes: [],
    permisos: [],
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'García',
    dni: '11223344C',
    estado: 'Parte médico',
    departamento: 'Recursos Humanos',
    horas: 0,
    foto: 'https://placehold.co/100x100/EFEFEF/333?text=CG',
    datosPersonales: {
        telefono: '11-2233-4455',
        domicilio: 'Boulevard de los Sueños Rotos'
    },
    condicionLaboral: {
      tipoContrato: 'Planta permanente',
      fechaIngreso: '2018-09-01',
      fechaPlanta: '2019-09-01',
      categoria: 'HR Manager',
      ultimaModificacionCategoria: '2022-11-15',
    },
    productividad: 92.3,
    supervisor: 'Dirección',
    horario: {
      ingreso: '09:00',
      salida: '18:00',
    },
    licencias: [],
    mensajes: [
        { id: 'M2', texto: 'Se aprueba su solicitud de licencia por asuntos personales.', dias: 2, fechaInicio: '2024-09-10', fechaFin: '2024-09-11' }
    ],
    permisos: [],
  },
];
export const initialArchivedMessages = [];




export const EMPLOYEES_DATA = [
  {
    id: 1,
    name: 'Ana García',
    department: 'Atención al Cliente',
    office: 'Sede Central',
    category: 'Administrativo',
    status: 'Planta permanente',
    activityType: 'Atención al público',
    productivityScore: 9.2,
    monthlyHours: [{ month: 'Ene', hours: 5 }, { month: 'Feb', hours: -2 }, { month: 'Mar', hours: 8 }, { month: 'Abr', hours: 3 }],
    tasks: [
      { name: 'Resolución de tickets', productivity: 9.5 },
      { name: 'Atención telefónica', productivity: 9.0 },
      { name: 'Gestión de reclamos', productivity: 8.8 },
    ],
    licenses: { '2024': 5, '2023': 12 },
    absences: { '2024': 1, '2023': 3 },
    complaints: [{ id: 'C01', reason: 'Demora en la respuesta inicial.' }],
    softSkills: {
      Comunicación: 9,
      'Trabajo en equipo': 8,
      'Resolución de conflictos': 9,
      Adaptabilidad: 10,
      Liderazgo: 7,
      Empatía: 9,
    },
  },
  {
    id: 2,
    name: 'Juan Pérez',
    department: 'Sistemas',
    office: 'Anexo Norte',
    category: 'Técnico',
    status: 'Contratado',
    activityType: 'Trabajo en sistemas',
    productivityScore: 8.5,
    monthlyHours: [{ month: 'Ene', hours: 2 }, { month: 'Feb', hours: 4 }, { month: 'Mar', hours: -1 }, { month: 'Abr', hours: 6 }],
    tasks: [
        { name: 'Desarrollo de nuevas funciones', productivity: 9.0 },
        { name: 'Mantenimiento de base de datos', productivity: 8.0 },
        { name: 'Soporte técnico interno', productivity: 8.5 },
    ],
    licenses: { '2024': 2, '2023': 8 },
    absences: { '2024': 0, '2023': 2 },
    complaints: [],
    softSkills: {
        Comunicación: 7,
        'Trabajo en equipo': 9,
        'Resolución de conflictos': 8,
        Adaptabilidad: 9,
        Liderazgo: 6,
        Empatía: 7,
    },
  },
  {
    id: 3,
    name: 'María Rodríguez',
    department: 'Recursos Humanos',
    office: 'Sede Central',
    category: 'Profesional',
    status: 'Planta permanente',
    activityType: 'Administrativo',
    productivityScore: 7.8,
    monthlyHours: [{ month: 'Ene', hours: -3 }, { month: 'Feb', hours: 0 }, { month: 'Mar', hours: 5 }, { month: 'Abr', hours: 2 }],
    tasks: [
        { name: 'Procesos de selección', productivity: 8.5 },
        { name: 'Gestión de nóminas', productivity: 7.5 },
        { name: 'Capacitaciones', productivity: 7.8 },
    ],
    licenses: { '2024': 8, '2023': 15 },
    absences: { '2024': 2, '2023': 4 },
    complaints: [],
    softSkills: {
        Comunicación: 8,
        'Trabajo en equipo': 7,
        'Resolución de conflictos': 8,
        Adaptabilidad: 7,
        Liderazgo: 8,
        Empatía: 9,
    },
  },
  {
    id: 4,
    name: 'Carlos Sánchez',
    department: 'Legales',
    office: 'Sede Central',
    category: 'Auditor',
    status: 'Auditor',
    activityType: 'Expedientes',
    productivityScore: 6.5,
    monthlyHours: [{ month: 'Ene', hours: 1 }, { month: 'Feb', hours: -5 }, { month: 'Mar', hours: -2 }, { month: 'Abr', hours: 1 }],
    tasks: [
        { name: 'Revisión de expedientes', productivity: 7.0 },
        { name: 'Dictámenes legales', productivity: 6.0 },
        { name: 'Auditorías internas', productivity: 6.5 },
    ],
    licenses: { '2024': 4, '2023': 10 },
    absences: { '2024': 3, '2023': 6 },
    complaints: [{ id: 'C02', reason: 'Excesivo formalismo en la comunicación.' }, { id: 'C03', reason: 'Plazos de entrega no cumplidos.' }],
    softSkills: {
        Comunicación: 5,
        'Trabajo en equipo': 6,
        'Resolución de conflictos': 5,
        Adaptabilidad: 7,
        Liderazgo: 5,
        Empatía: 4,
    },
  },
  {
    id: 5,
    name: 'Laura Fernández',
    department: 'Atención al Cliente',
    office: 'Anexo Sur',
    category: 'Administrativo',
    status: 'Comisionado',
    activityType: 'Atención al público',
    productivityScore: 9.8,
    monthlyHours: [{ month: 'Ene', hours: 10 }, { month: 'Feb', hours: 8 }, { month: 'Mar', hours: 12 }, { month: 'Abr', hours: 9 }],
    tasks: [
        { name: 'Resolución de tickets', productivity: 10.0 },
        { name: 'Atención telefónica', productivity: 9.5 },
        { name: 'Gestión de reclamos', productivity: 9.8 },
    ],
    licenses: { '2024': 1, '2023': 5 },
    absences: { '2024': 0, '2023': 0 },
    complaints: [],
    softSkills: {
        Comunicación: 10,
        'Trabajo en equipo': 9,
        'Resolución de conflictos': 10,
        Adaptabilidad: 9,
        Liderazgo: 8,
        Empatía: 10,
    },
  },
];


export const DEPARTMENTS = [...new Set(EMPLOYEES_DATA.map(e => e.department))];
export const ACTIVITY_TYPES = [...new Set(EMPLOYEES_DATA.map(e => e.activityType))];
export const STATUS_TYPES = [...new Set(EMPLOYEES_DATA.map(e => e.status))];



export const ALL_SOFT_SKILLS: SoftSkill[] = [
  'Comunicación', 'Trabajo en Equipo', 'Empatía', 'Resolución de Conflictos', 
  'Adaptabilidad', 'Liderazgo', 'Creatividad', 'Pensamiento Crítico', 
  'Gestión del Tiempo', 'Toma de Decisiones', 'Orientación al Cliente', 
  'Inteligencia Emocional', 'Negociación', 'Autocontrol', 'Proactividad'
];




export const PROFESSIONS_SKILLS: Record<Profession, Skill[]> = {
  'Contador': [
    { name: 'Conocimientos Contables', description: 'Evaluación sobre Normas NIIF, liquidación de sueldos y balances.', type: 'multiple-choice' },
    { name: 'Excel Avanzado', description: 'Uso de tablas dinámicas, fórmulas financieras y macros.', type: 'case-study' },
    { name: 'Legislación Tributaria Argentina', description: 'Comprensión de normativas de AFIP, IVA e Impuesto a las Ganancias.', type: 'multiple-choice' },
  ],
  'Abogado': [
    { name: 'Redacción Jurídica', description: 'Elaboración de cláusulas, contratos y recursos legales.', type: 'report' },
    { name: 'Derecho Argentino', description: 'Conocimientos en derecho civil, laboral, penal y comercial.', type: 'multiple-choice' },
    { name: 'Análisis de Casos y Argumentación', description: 'Resolución de casos prácticos y desarrollo de argumentación lógica.', type: 'case-study' },
  ],
  'Administrativo': [
    { name: 'Test de Mecanografía', description: 'Mide la velocidad (PPM) y precisión al escribir. Objetivo: 200 palabras en 2 minutos.', type: 'typing-test' },
    { name: 'Excel Intermedio', description: 'Manejo de listas, filtros, fórmulas y funciones básicas.', type: 'case-study' },
    { name: 'Organización y Atención al Público', description: 'Gestión de agendas, documentos y protocolos de atención.', type: 'case-study' },
  ],
  'Trabajador Social': [
    { name: 'Resolución de Conflictos Sociales', description: 'Análisis y propuesta de soluciones para casos prácticos.', type: 'case-study' },
    { name: 'Redacción de Informes Sociales', description: 'Elaboración de informes técnicos y sociales estructurados.', type: 'report' },
    { name: 'Ética y Legislación Social Argentina', description: 'Conocimiento del marco legal y los principios éticos de la profesión.', type: 'multiple-choice' },
  ],
  'Administrador de Empresa': [
    { name: 'Análisis Financiero y Presupuestario', description: 'Interpretación de estados financieros y elaboración de presupuestos.', type: 'case-study' },
    { name: 'Toma de Decisiones y Resolución de Problemas', description: 'Evaluación de escenarios y elección de la solución más óptima.', type: 'case-study' },
    { name: 'Liderazgo y Gestión de Equipos', description: 'Conocimientos sobre estilos de liderazgo y manejo de equipos de trabajo.', type: 'multiple-choice' },
  ],
  'Sociólogo': [
    { name: 'Análisis de Datos Estadísticos', description: 'Interpretación de datos, gráficos y tablas estadísticas.', type: 'case-study' },
    { name: 'Redacción de Informes Académicos', description: 'Elaboración de informes de campo y papers académicos.', type: 'report' },
    { name: 'Metodologías de Investigación', description: 'Conocimiento sobre metodologías cualitativas y cuantitativas y ética de investigación.', type: 'multiple-choice' },
  ],
  'Psicopedagogo': [
    { name: 'Interpretación de Tests Psicopedagógicos', description: 'Análisis de resultados de tests estandarizados.', type: 'case-study' },
    { name: 'Planes de Intervención Educativa', description: 'Elaboración de planes de apoyo y adaptaciones curriculares.', type: 'report' },
    { name: 'Detección de Trastornos del Aprendizaje', description: 'Conocimiento sobre indicadores y criterios diagnósticos de TDAH, dislexia, etc.', type: 'multiple-choice' },
  ],
  'Desarrollador Backend': [
    { name: 'Lógica y Estructuras de Datos', description: 'Resolución de problemas algorítmicos.', type: 'code' },
    { name: 'Bases de Datos (SQL/NoSQL)', description: 'Diseño de esquemas y escritura de consultas complejas.', type: 'code' },
    { name: 'Programación Orientada a Objetos', description: 'Aplicación de principios de POO en lenguajes como Java o Python.', type: 'code' },
    { name: 'Diseño de APIs y Autenticación', description: 'Creación de endpoints RESTful y manejo de seguridad con JWT.', type: 'case-study' },
  ],
  'Desarrollador Frontend': [
    { name: 'HTML, CSS y JavaScript', description: 'Maquetación, estilización y manipulación del DOM.', type: 'code' },
    { name: 'Frameworks (React/Vue)', description: 'Creación de componentes, manejo de estado y ciclo de vida.', type: 'code' },
    { name: 'Diseño Responsivo y Accesibilidad', description: 'Uso de media queries, flexbox, grid y principios de WCAG.', type: 'case-study' },
    { name: 'Consumo de APIs y Estado', description: 'Uso de Fetch/Axios y manejo de estado global (Context/Redux).', type: 'code' },
  ],
  'Farmacéutico': [
    { name: 'Farmacología General', description: 'Conocimiento sobre indicaciones, contraindicaciones e interacciones.', type: 'multiple-choice' },
    { name: 'Control de Recetas y Normativa ANMAT', description: 'Validación de recetas y conocimiento de la regulación vigente.', type: 'case-study' },
    { name: 'Cálculos Farmacéuticos', description: 'Resolución de problemas de dosis, diluciones y conversiones.', type: 'multiple-choice' },
  ],
  'Recursos Humanos': [
    { name: 'Entrevista por Competencias', description: 'Diseño de entrevistas y evaluación de candidatos basada en competencias.', type: 'case-study' },
    { name: 'Legislación Laboral Argentina', description: 'Conocimiento sobre contratos, despidos, y regulaciones laborales.', type: 'multiple-choice' },
    { name: 'Gestión de Clima y Conflictos', description: 'Estrategias para la medición del clima laboral y la mediación de conflictos.', type: 'case-study' },
  ]
};