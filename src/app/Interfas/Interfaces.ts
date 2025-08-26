// export default interface  Notification {
//   id: number;
//   text: string;
//   time: string;
// };

// Tipos auxiliares
export type EmployeeStatus = 'Planta permanente' | 'Contratado' | 'Pasante' | 'Licencia' | 'Suspendido';
export type EmployeeCategory = 'Administrativo' | 'Técnico' | 'Directivo' | 'Operativo';

export type SoftSkill = 
  | 'Comunicación' 
  | 'Trabajo en equipo' 
  | 'Empatía' 
  | 'Resolución de conflictos' 
  | 'Adaptabilidad' 
  | 'Liderazgo' 
  | 'Creatividad' 
  | 'Pensamiento Crítico' 
  | 'Gestión del Tiempo' 
  | 'Toma de Decisiones' 
  | 'Orientación al Cliente' 
  | 'Inteligencia Emocional' 
  | 'Negociación' 
  | 'Autocontrol' 
  | 'Proactividad';

// Interfaces para objetos anidados
export interface MonthlyHour {
  month: string;
  hours: number;
}

export interface Task {
  name: string;
  productivity: number;
}

export interface YearlyRecord {
  [year: string]: number;
}

export interface Complaint {
  id: string;
  reason: string;
  date?: string;
  status?: 'Abierta' | 'En proceso' | 'Resuelta' | 'Cerrada';
}

export interface SoftSkills {
  [key: string]: number;
}

// Interface principal del empleado
export interface Employee {
  // Información básica (obligatoria)
  id: number | string;
  name: string;
  department: string;
  
  // Información laboral
  office: string;
  category: EmployeeCategory;
  status: EmployeeStatus;
  activityType: string;
  
  // Métricas de rendimiento
  productivityScore: number;
  monthlyHours: MonthlyHour[];
  tasks: Task[];
  
  // Historial laboral
  licenses: YearlyRecord;
  absences: YearlyRecord;
  complaints: Complaint[];
  
  // Habilidades
  softSkills: SoftSkills;
  
  // Campos opcionales adicionales (para compatibilidad)
  position?: string;
  email?: string;
  phone?: string;
  hireDate?: string;
  birthDate?: string;
  salary?: number;
  supervisor?: string;
  location?: string;
  workSchedule?: string;
  contractType?: string;
  address?: string;
  photo?: string;
  managerId?: number;
  departmentId: number;
  completedTasks?: number;
  efficiency?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Interface simplificada para listas y vistas resumidas
export interface EmployeeSummary {
  id: number | string;
  name: string;
  department: string;
  position?: string;
  status: EmployeeStatus;
  productivityScore?: number;
  email?: string;
}

// Interface para filtros y búsquedas
export interface EmployeeFilters {
  department?: string;
  office?: string;
  category?: EmployeeCategory;
  status?: EmployeeStatus;
  minProductivity?: number;
  maxProductivity?: number;
  hasComplaints?: boolean;
}

// Interface para estadísticas agregadas
export interface EmployeeStats {
  totalEmployees: number;
  averageProductivity: number;
  departmentDistribution: { [department: string]: number };
  statusDistribution: { [status: string]: number };
  categoryDistribution: { [category: string]: number };
}

// Tipos para operaciones CRUD
export type CreateEmployeeData = Omit<Employee, 'id'>;
export type UpdateEmployeeData = Partial<Omit<Employee, 'id'>>;

// Constantes útiles
export const DEPARTMENTS = [
  'Atención al Cliente',
  'Recursos Humanos',
  'Tecnología',
  'Ventas',
  'Marketing',
  'Finanzas',
  'Operaciones',
  'Legal'
] as const;

export const OFFICES = [
  'Sede Central',
  'Sucursal Norte',
  'Sucursal Sur',
  'Sucursal Este',
  'Sucursal Oeste',
  'Remoto'
] as const;

export const ACTIVITY_TYPES = [
  'Atención al público',
  'Desarrollo de software',
  'Análisis de datos',
  'Gestión de proyectos',
  'Ventas directas',
  'Marketing digital',
  'Contabilidad',
  'Legal'
] as const;

// export default interface  OrgNode {
//   name: string;
//   position: string;
//   children?: OrgNode[];
// };



  
export interface UserData {
  usuario: string;
  departamento: string;
  habilidades_blandas: SoftSkill[];
  feedback_history: { evaluado: string; habilidad_blanda: SoftSkill }[];
}

export interface FeedbackResponse {
  evaluador: string;
  evaluado: string;
  habilidad_blanda: SoftSkill;
  respuesta: [number, number, number]; // [Mala, Buena, Excelente]
}

export interface Survey {
  evaluado: string;
  habilidad_blanda: SoftSkill;
}




export type Profession = 
  | 'Contador' | 'Abogado' | 'Administrativo' | 'Trabajador Social' 
  | 'Administrador de Empresa' | 'Sociólogo' | 'Psicopedagogo' 
  | 'Desarrollador Backend' | 'Desarrollador Frontend' | 'Farmacéutico' | 'Recursos Humanos';

export type EvaluationType = 'multiple-choice' | 'case-study' | 'code' | 'report' | 'typing-test';

export interface Skill {
  name: string;
  description: string;
  type: EvaluationType;
}

export interface Question {
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface EvaluatedSkill {
  nombre: string;
  nivel: 'Malo' | 'Bueno' | 'Avanzado';
  preguntas_correctas?: number;
  total_preguntas?: number;
  metricas?: Record<string, string | number>;
}

export interface ResultsData {
  profesion: Profession | string;
  habilidades_evaluadas: EvaluatedSkill[];
}

export interface EvaluationResult {
    correct: number;
    total: number;
    level: 'Malo' | 'Bueno' | 'Avanzado';
    passed: boolean;
}


export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  result: {
    content?: { text?: string }[];
  } | string;
}

export interface ChatResponse {
  result: string;
  toolName?: string;
  success: boolean;
}

export interface MCPClient {
  tools: () => Promise<Record<string, unknown>>;
  close: () => Promise<void>;
}

export interface Filters {
  department?: string;
  position?: string;
  status?: string;
  activityType?: string;
  minScore?: number;
  maxScore?: number;
  skills?: string[];
}

export interface SortConfig {
  key: keyof Employee | 'productivityScore' | 'completedTasks' | 'efficiency';
  direction: 'ascending' | 'descending';
}
export type SortableKey = keyof Employee | 'productivityScore' | 'completedTasks' | 'efficiency';
export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
    key: SortableKey;
    direction: SortDirection;
}

export interface ProductivityRankingProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee | null) => void;
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void; // Cambiado
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
   currentPage: number;
   onPageChange: (page: number) => void;
}



export interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

// // --- USERS & ROLES ---
// export interface Role {
//   id: number;
//   name: string;
//   description?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface User {
//   id: number;
//   email: string;
//   password: string;
//   employeeId?: number;
//   roleId: number;
//   approvedLicenses?: License[];
//   notifications?: Notification[];
//   createdAt: Date;
//   updatedAt: Date;
//   employee?: Employee;
//   role?: Role;
// }

// // --- EMPLOYEE ---
// export interface Employee {
//   id: number;
//   full_name: string;
//   email?: string;
//   position?: string;
//   department?: string;
//   status?: string;
//   dni?: string;
//   birthDate?: string;
//   photo?: string;
//   supervisorId?: number;

//   // Relaciones
//   messages?: Message[];
//   permissions?: Permission[];
//   certifications?: Certification[];
//   skillStatuses?: SkillStatus[];
//   complaints?: Complaint[];
//   tasks?: Task[];
//   licenses?: License[];
//   user?: User;
// }

// // --- LICENSE ---
// export interface License {
//   id: number;
//   type: string;
//   startDate: Date;
//   endDate: Date;
//   status: string;
//   description?: string;

//   employeeId: number;
//   approvedById?: number;
//   userId?: number;

//   // Relaciones
//   employee?: Employee;
//   approvedBy?: User;
// }

// // --- MESSAGE ---
// export interface Message {
//   id: number;
//   employeeId: number;
//   text: string;
//   days?: number;
//   startDate?: Date;
//   endDate?: Date;
//   createdAt: Date;
//   employee?: Employee;
// }

// // --- PERMISSION ---
// export interface Permission {
//   id: number;
//   employeeId: number;
//   date: Date;
//   exitTime: string;
//   returnTime: string;
//   hours: number;
//   employee?: Employee;
// }

// // --- CERTIFICATION ---
// export interface Certification {
//   id: number;
//   employeeId: number;
//   name: string;
//   issuingBody: string;
//   issueDate: Date;
//   attachment?: string;
//   employee?: Employee;
// }

// // --- SKILL STATUS ---
// export interface SkillStatus {
//   id: number;
//   employeeId: number;
//   skillId: number;
//   status: 'locked' | 'unlocked';
//   unlockDate?: Date;
//   employee?: Employee;
// }

// // --- COMPLAINT ---
// export interface Complaint {
//   id: number;
//   employeeId: number;
//   reason: string;
//   createdAt: Date;
//   employee?: Employee;
// }

// // --- TASK ---
// export interface Task {
//   id: number;
//   employeeId: number;
//   name: string;
//   productivity: number;
//   employee?: Employee;
// }

// // --- NOTIFICATIONS ---
// export interface Notification {
//   id: number;
//   text: string;
//   time: string;
// }
