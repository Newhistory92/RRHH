
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
  employmentStatus?: string;
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
export type LicenseStatus = 'Aprobada' | 'Pendiente' | 'Rechazada'| 'Pendiente Siguiente Aprobación';
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
  id?: number;
  solicitanteId: number;
  name: string;
  type: string;
  supervisorId: number
  startDate: string;
  endDate: string;
  status: LicenseStatus;
  duration: number;
  originalMessage: string;
  createdAt: string
  aprobaciones?: Aprobacion[]
  tiposLicencia: TiposLicencia
  observacion?: string
  
}

// Licenses tracking
export interface Licenses {
  '2024': number;
  '2023': number;
  usuarios: Record<number, Usuario>
   saldos: Saldo[]
  history: LicenseHistory[];
}

export interface Saldo {
  anio: number
  [tipo: string]: number 
}


export interface Usuario {
  id: number
  name: string
  dni: string
  office?: string
  department?: string
  role: string
}

export interface Aprobacion {
  supervisorId: number
  nombre: string
  fecha: string           
  accion: "aprobar" | "rechazar"
  observacion?: string
}

export interface TiposLicencia {
  [anio: string]: {
  [tipo: string]: number
  }
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
export interface SoftSkill {
  nombre: string;
  level?:number;
  descripcion: string;
  SkillStatus?: SkillStatus;
}


// Technical skills
export interface TechnicalSkill {
  id: number;
  nombre: string;
  level:number;
  SkillStatus?: SkillStatus;
}

export interface certifications {
  id: number;
  name: string;
  institution: string;
  date: string; // Fecha de obtención en formato ISO (YYYY-MM-DD)
  validUntil: string | null; // Fecha de expiración en formato ISO o null si no expira
  attachment: File | string | null; // Puede ser un File object, URL string o null
}

export interface Notification {
  id: number;
  text: string;
  time: string;
  status: string;
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
  gender?: string;
  photo: string;
  hours: number; // Total available hours for permissions
  // Employment Details
  position: string;
  department: string;
  departmentId: number;
  office: string | null;
  officeId: number | null;
  category: string;
  status: EmployeeStatus;
  employmentStatus: EmploymentStatus;
  activityType: string;
  startDate: string;
  permanentDate: string | null; // Can be null if employee is not permanent yet
  lastCategoryUpdate: string;
 academicFormation: AcademicFormation[];
  languages: Language[];
  workExperience: WorkExperience[];
  certifications: certifications[];
  // Management
  managerId: number | null; // Can be null if no manager assigned
  supervisor: string | null; // Can be null if no supervisor assigned
  role: EmployeeRole;
  subordinates: number[];

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


 softSkills: SoftSkill[];
 skillStatus?: SkillStatus[];
  softSkillsArray?: number[]; 
  technicalSkills: TechnicalSkill[];
  notificaciones: Notification[];
}
// Department interface
export interface Department {
  id: number;
  nombre: string;
  descripcion: string;
  nivel_jerarquico: number;
  jefeId?: number | null;
  parentId?: number | null;
  habilidades_requeridas?:TechnicalSkill[];
  oficinas: Office[];
}

export interface AcademicFormation {
  id: number;
  title: string;
  institution: string;
  level: string; // Ej: 'Licenciatura', 'Maestría', 'Doctorado', etc.
  status: string; // Ej: 'Completado', 'En curso', 'Abandonado';
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string | null; // ISO format: YYYY-MM-DD o null si está en curso
  isCurrent: boolean;
  attachment: File | string | null; // Puede ser un File object, URL string o null
}

// Interfaces para Languages (Idiomas)
export interface Language {
  id: number ;
  language: string;
  level: string;
  certification: string; // Nombre de la certificación (ej: TOEFL, DELE)
  attachment: File | string | null ; // Certificado o comprobante
}

// Interfaces para Work Experience (Experiencia Laboral)
export interface WorkExperience {
  id: number;
  position: string; // Cargo o puesto
  company: string; // Nombre de la empresa
  industry: string; // Industria o rubro
  location: string; // Ubicación (ciudad, país)
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string | null; // ISO format: YYYY-MM-DD o null si es trabajo actual
  isCurrent: boolean;
  contractType: string
  description?: string; // Opcional: descripción de responsabilidades
  achievements?: string[]; // Opcional: logros o proyectos destacados
}


// Soft skills catalog interface
export interface SoftSkillCatalog {
  id: number;
  nombre: string;
  description?: string;
}
export interface Office {
  id: number;
  nombre: string;
  descripcion: string;
  jefeId?: number | null;
  empleadosIds?: number[];
  departmentId: number;
  habilidades_requeridas?: TechnicalSkill[];
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

export interface ProcessedMessage extends Message {
  employeeId: number; // o string, debe coincidir con Employee.id
  employeeName: string;
}

export interface ModalConfig {
  type: 'department' | 'office';
  data?: Department | Office;
  context?: {
    departmentId?: number;
  };
}

export interface EntityFormData {
  // Campos comunes
  id?: number;
  nombre: string;
  descripcion: string;
  jefeId: number | null;
  habilidades_requeridas: TechnicalSkill[];
  // Campos específicos de Department
  nivel_jerarquico?: number;
  parentId?: number | null;
  // Campos específicos de Office
  empleadosIds?: number[];
}

export interface ModalContext {
  departmentId?: number;
  [key: string]: unknown; // Para permitir propiedades adicionales
}

export interface DropdownOption {
  value: number;
  label: string;
  name: string;
  photo?: string;
}

export interface EntityFormModalProps {
  config: ModalConfig;
  onClose: () => void;
  onSave: (formData: EntityFormData) => void;
  departments: Department[];
  employees: Employee[];
}

export interface FormFieldProps {
  formData: EntityFormData;
  setFormData: React.Dispatch<React.SetStateAction<EntityFormData>>;
  employees: Employee[];
  departments: Department[];
  availableSkills?: TechnicalSkill[];
  setAvailableSkills?: React.Dispatch<React.SetStateAction<TechnicalSkill[]>>;
}





export interface OrgData {
  id: number;
  nombre: string;
  nivel_jerarquico: number;
  jefeId: number | null;
}

export interface OrgNode extends OrgData {
  children?: OrgNode[];
}

export interface  OrgStatsType {
  totalNodos: number;
  maxNivel: number;
  nivelesUnicos: number[];
}

export interface NodeColors {
  bg: string;
  text: string;
  border: string;
}

export interface OrgChartProps {
  data: OrgData[];
  title?: string;
  showLegend?: boolean;
  showStats?: boolean;
  className?: string;
}

export type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export type BaseTest = {
  id: string;
  name: string;
  description: string;
};

export type MultipleChoiceTest = BaseTest & {
  type: 'multiple-choice';
  questions: Question[];
};

export type CaseStudyTest = BaseTest & {
  type: 'case-study';
  scenario: string;
};

export type Test = MultipleChoiceTest | CaseStudyTest;

export type TestsByProfession = {
  [key: string]: Test[];
};



export interface Skill {
  id: number;
  name: string;
  description: string;
  status: 'validated'|'pending'|'locked';
  level: number;
  unlockDate: string | null;
}

export interface SkillStatus {
  id: number;
  employee_id: number;
  skill_id: number;
  status: 'locked' | 'unlocked' | 'passed';
  unlockDate?: string;
}

export interface SkillTestDialogProps {
  isVisible: boolean;
  skill: Skill | null;
  position: string;
  onClose: () => void;
  onTestComplete: (skill: Skill, score: number) => void;
}


export type Page =
  | "estadisticas"
  | "recursos-humanos"
  | "ia"
  | "organigrama"
  | "editar-perfil"
  | "feedback"
  | "licencias"
  | "test";