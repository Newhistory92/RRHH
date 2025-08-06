export default interface  Notification {
  id: number;
  text: string;
  time: string;
};

export default interface  Employee  {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  status: 'Activo' | 'Licencia';
};

export default interface  OrgNode {
  name: string;
  position: string;
  children?: OrgNode[];
};




export type SoftSkill = 
  | 'Comunicación' | 'Trabajo en Equipo' | 'Empatía' | 'Resolución de Conflictos' 
  | 'Adaptabilidad' | 'Liderazgo' | 'Creatividad' | 'Pensamiento Crítico' 
  | 'Gestión del Tiempo' | 'Toma de Decisiones' | 'Orientación al Cliente' 
  | 'Inteligencia Emocional' | 'Negociación' | 'Autocontrol' | 'Proactividad';

  
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