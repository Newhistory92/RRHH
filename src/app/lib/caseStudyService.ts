import {ChatResponse } from "@/app/Interfas/Interfaces";

export interface GenerateCaseStudyRequest {
  profession: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class CaseStudyService {
  private static readonly API_ENDPOINT = '/api/generate-case-study';

  static async generateCaseStudy(request: GenerateCaseStudyRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating case study:', error);
      return {
        result: '',
        success: false,
      };
    }
  }

  static buildCaseStudyPrompt(profession: string, description: string, difficulty: string = 'intermediate'): string {
    return `Actúa como un experto en recursos humanos especializado en ${profession}. 

Genera un caso de estudio detallado y profesional para evaluar las competencias de un candidato a ${profession}.

**Descripción del test:** ${description}
**Nivel de dificultad:** ${difficulty}
**Profesión:** ${profession}

El caso de estudio debe incluir obligatoriamente:

## **Contexto**
Situación empresarial realista y específica del área de ${profession}. Incluye datos sobre la empresa, sector, tamaño, y situación actual.

## **Problema Principal**
Desafío específico que requiera conocimientos especializados de ${profession}. Debe ser concreto y solucionable.

## **Datos Técnicos/Financieros Relevantes**
Información cuantitativa necesaria para el análisis (números, fechas, métricas, presupuestos, etc.).

## **Tu Rol**
Posición específica desde la cual el candidato debe abordar el problema (ej: "Senior Developer", "Controller", "Gerente de Marketing", etc.).

## **Tareas Específicas**
Lista numerada de 4-6 tareas concretas que el candidato debe realizar para resolver el caso.

**Requisitos de formato:**
- Usa markdown con encabezados claros
- Incluye datos numéricos realistas
- Haz el caso específico para ${profession}
- Nivel de complejidad: ${difficulty}
- Longitud: entre 300-500 palabras
- Enfócate en situaciones reales de la industria

Genera SOLO el caso de estudio, sin explicaciones adicionales.`;
  }
}