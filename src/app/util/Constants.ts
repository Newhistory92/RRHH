
import { SkillSeverity } from "../Interfas/Interfaces"; 
export const SKILL_LEVELS: Record<string, number> = {
  'básico': 5,
  'intermedio': 7,
  'avanzado': 9,
  'experto': 10
};

export const SEVERITY_ORDER: Record<SkillSeverity, number> = {
  'Crítico': 4,
  'Alto': 3,
  'Medio': 2,
  'Bajo': 1
};

export const RISK_THRESHOLDS = {
  turnover: { low: 30, medium: 50, high: 75 },
  conflict: { medium: 30, high: 50, critical: 70 },
  skillGap: { low: 2, medium: 3, high: 4 }
} as const;

export const SYSTEM_PROMPT = `Eres un experto en análisis predictivo de recursos humanos con especialización en:
- Predicción de rotación de personal
- Análisis de productividad y tendencias
- Identificación de brechas de habilidades críticas
- Detección de conflictos y problemas de equipo
- Evaluación de eventos críticos y su impacto
- Generación de recomendaciones accionables

Analiza los datos proporcionados y genera insights profundos basados en machine learning y estadísticas.`;