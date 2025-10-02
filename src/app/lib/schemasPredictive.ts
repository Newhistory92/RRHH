

import { z } from "zod";

export const PredictiveAnalysisSchema = z.object({
  employees: z.array(z.any()),
  departments: z.array(z.any()).optional(),
  analysisType: z.enum(['turnover', 'productivity', 'full']).default('full'),
  timeframe: z.enum(['3months', '6months', '12months']).default('12months')
});