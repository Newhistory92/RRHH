import { useState } from 'react';
import { CaseStudyService, GenerateCaseStudyRequest } from '@/app/lib/caseStudyService';

export const useCaseStudyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaseStudy = async (request: GenerateCaseStudyRequest): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
          const result = await CaseStudyService.generateCaseStudy(request);
      
      if (!result.success) {
        throw new Error('Error al generar el caso de estudio');
      }

      return result.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar caso de estudio';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    generateCaseStudy,
    isGenerating,
    error,
    clearError,
    setIsGenerating,
  };
};