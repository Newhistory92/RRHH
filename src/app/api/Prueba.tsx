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