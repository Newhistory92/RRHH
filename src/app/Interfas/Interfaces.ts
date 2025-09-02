// export default interface  Notification {
//   id: number;
//   text: string;
//   time: string;
// };

// Tipos auxiliares
//export type EmployeeStatus = 'Planta permanente' | 'Contratado' | 'Pasante' | 'Licencia' | 'Suspendido';
//export type EmployeeCategory = 'Administrativo' | 'Técnico' | 'Directivo' | 'Operativo';

// export default interface  OrgNode {
//   name: string;
//   position: string;
//   children?: OrgNode[];
// };



  
// export interface UserData {
//   usuario: string;
//   departamento: string;
//   habilidades_blandas: SoftSkill[];
//   feedback_history: { evaluado: string; habilidad_blanda: SoftSkill }[];
// }

// export interface FeedbackResponse {
//   evaluador: string;
//   evaluado: string;
//   habilidad_blanda: SoftSkill;
//   respuesta: [number, number, number]; // [Mala, Buena, Excelente]
// }

// export interface Survey {
//   evaluado: string;
//   habilidad_blanda: SoftSkill;
// }




// export type Profession = 
//   | 'Contador' | 'Abogado' | 'Administrativo' | 'Trabajador Social' 
//   | 'Administrador de Empresa' | 'Sociólogo' | 'Psicopedagogo' 
//   | 'Desarrollador Backend' | 'Desarrollador Frontend' | 'Farmacéutico' | 'Recursos Humanos';

// export type EvaluationType = 'multiple-choice' | 'case-study' | 'code' | 'report' | 'typing-test';

// export interface Skill {
//   name: string;
//   description: string;
//   type: EvaluationType;
// }

// export interface Question {
//   question: string;
//   options?: string[];
//   correctAnswer: string;
// }

// export interface EvaluatedSkill {
//   nombre: string;
//   nivel: 'Malo' | 'Bueno' | 'Avanzado';
//   preguntas_correctas?: number;
//   total_preguntas?: number;
//   metricas?: Record<string, string | number>;
// }

// export interface ResultsData {
//   profesion: Profession | string;
//   habilidades_evaluadas: EvaluatedSkill[];
// }

// export interface EvaluationResult {
//     correct: number;
//     total: number;
//     level: 'Malo' | 'Bueno' | 'Avanzado';
//     passed: boolean;
// }


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

// Basic types for employee data
export type EmployeeStatus = 'Activo' | 'De licencia' | 'Parte médico' | 'Inactivo' | 'Suspendido';
export type EmploymentStatus = 'Planta permanente' | 'Contratado' | 'Comisionado' | 'Auditor' | 'Temporal';
export type EmployeeRole = 'empleado' | 'supervisor' | 'manager' | 'admin' | 'auditor';
export type LicenseStatus = 'Aprobada' | 'Pendiente' | 'Rechazada';
export type ComplaintStatus = 'Resuelto' | 'Pendiente' | 'En proceso';


// Schedule interface
export interface Schedule {
  startTime: string;
  endTime: string;
  workingHours: number;
}

// Monthly hours tracking
export interface MonthlyHours {
  month: string;
  hours: number;
}

// Task productivity
export interface Task {
  name: string;
  productivity: number;
}

// License history
export interface LicenseHistory {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: LicenseStatus;
  duration: number;
  originalMessage: string;
}

// Licenses tracking
export interface Licenses {
  '2024': number;
  '2023': number;
  history: LicenseHistory[];
}

// Absences tracking
export interface Absences {
  '2024': number;
  '2023': number;
}

// Permits
export interface Permit {
  id: string;
  date: string;
  departureTime: string;
  returnTime: string;
  hours: number;
}

// Complaints
export interface Complaint {
  id: string;
  reason: string;
  date: string;
  status: ComplaintStatus;
}

// Messages
export interface Message {
  id: number;
  text: string;
  days: number;
  startDate: string;
  endDate: string;
  date: string;
}

// Soft skills (key-value pairs)
export interface SoftSkills {
  [skillName: string]: number;
}

// Technical skills
export interface TechnicalSkill {
  id: number;
  name: string;
  level: number;
}

// Main Employee interface
export interface Employee {
  // Basic Information
  id: number;
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  photo: string;
  hours: number; // Total available hours for permissions
  // Employment Details
  position: string;
  department: string;
  departmentId: number;
  office: string;
  category: string;
  status: EmployeeStatus;
  employmentStatus: EmploymentStatus;
  activityType: string;
  startDate: string;
  permanentDate: string | null; // Can be null if employee is not permanent yet
  lastCategoryUpdate: string;

  // Management
  managerId: number | null; // Can be null if no manager assigned
  supervisor: string | null; // Can be null if no supervisor assigned
  role: EmployeeRole;

  // Schedule
  schedule: Schedule;

  // Performance Metrics
  productivityScore: number;
  overallProductivity: number;
  monthlyHours: MonthlyHours[];
  tasks: Task[];

  // Absences and Licenses
  licenses: Licenses;
  absences: Absences;
  permits: Permit[];

  // Feedback and Issues
  complaints: Complaint[];
  messages: Message[];

  // Skills Assessment
  softSkills: SoftSkills;
  technicalSkills: TechnicalSkill[];
}

// Department interface
export interface Department {
  id: number;
  name: string;
  description: string;
}

// Available skills interface
export interface AvailableSkill {
  id: number;
  name: string;
  category: string;
}

// Soft skills catalog interface
export interface SoftSkillCatalog {
  id: number;
  name: string;
  description: string;
}

// Constants for status options
export const EMPLOYEE_STATUS: Record<string, EmployeeStatus> = {
  ACTIVE: 'Activo',
  ON_LEAVE: 'De licencia',
  MEDICAL_LEAVE: 'Parte médico',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido'
} as const;

export const EMPLOYMENT_STATUS: Record<string, EmploymentStatus> = {
  PERMANENT: 'Planta permanente',
  CONTRACT: 'Contratado',
  COMMISSIONED: 'Comisionado',
  AUDITOR: 'Auditor',
  TEMPORARY: 'Temporal'
} as const;

export const EMPLOYEE_ROLES: Record<string, EmployeeRole> = {
  EMPLOYEE: 'empleado',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  ADMIN: 'admin',
  AUDITOR: 'auditor'
} as const;

// Array types for collections
export type EmployeesData = Employee[];
export type DepartmentsData = Department[];
export type AvailableSkillsData = AvailableSkill[];
export type SoftSkillsCatalogData = SoftSkillCatalog[];

// Optional: Utility types for partial updates
export type EmployeeUpdate = Partial<Employee>;
export type EmployeeBasicInfo = Pick<Employee, 'id' | 'name' | 'email' | 'position' | 'department' | 'status'>;
export type EmployeeContactInfo = Pick<Employee, 'email' | 'phone' | 'address'>;
export type EmployeePerformance = Pick<Employee, 'productivityScore' | 'overallProductivity' | 'monthlyHours' | 'tasks'>;

// Form interfaces for creating/editing
// export interface CreateEmployeeForm extends Omit<Employee, 'id'> {}
// export interface UpdateEmployeeForm extends Partial<Omit<Employee, 'id'>> {}

// API Response types (if needed for future API integration)
export interface EmployeeApiResponse {
  success: boolean;
  data: Employee;
  message?: string;
}

export interface EmployeesListApiResponse {
  success: boolean;
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}