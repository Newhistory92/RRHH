import { Employee } from '@/app/Interfas/Interfaces';

// Licencias exclusivas que solo un Admin/RRHH puede asignar
export const RRHH_EXCLUSIVE_LICENSES = [
  "lesiones de largo tratamiento",
  "lar",
  "accidente de trabajo",
  "enfermedad profesional",
  "licencia sin goce de haberes",
  "lic por enfermedad",
  "fallecimiento en parto",
  "enfermedad de miembros del grupo",
  "guarda o tenencia"
];

// Límite de días aplicable en base a reglas del backend/estatuto
export const LICENSE_MAX_CONSTRAINTS: Record<string, number> = {
  "guarda o tenencia": 15
};

/**
 * Función principal para filtrar el catálogo crudo devuelto por la API,
 * basándose en el nivel de acceso del componente, tipo de contrato y 
 * antigüedad en años.
 */
export function getAvailableLicenses(
  allLicenses: any[], 
  isRRHHComponent: boolean,
  userContract: string,
  seniority: number
) {
  if (!allLicenses || !Array.isArray(allLicenses)) return [];

  return allLicenses.map(lic => {
    // Retornamos un clon para no mutar el estado original
    return { ...lic };
  }).filter(lic => {
    const nameLower = lic.nombre.toLowerCase();
    
    // 1. Filtrado de grupo (Estándar vs RRHH Exclusivo)
    if (!isRRHHComponent) {
      const isExclusive = RRHH_EXCLUSIVE_LICENSES.some(rrhhLic => nameLower.includes(rrhhLic));
      if (isExclusive) return false;
    }

    // 2. Regla de antigüedad especial
    if (nameLower.includes("sin goce")) {
       if (userContract.toLowerCase() !== 'permanente' || seniority < 2) {
         return false; // Oculta la opción íntegramente
       }
    }

    // 3. Aplicar restricciones especiales de días si los hay, 
    // y si el catálogo daba en "diasTotales" un monto superior 
    // o dinámico, podemos constreñirlo para la UI.
    const maxConstraint = Object.entries(LICENSE_MAX_CONSTRAINTS)
      .find(([key]) => nameLower.includes(key));
    if (maxConstraint) {
      lic.diasTotales = maxConstraint[1]; // Limitamos a 15 de manera local visualmente
      lic.disponibles = maxConstraint[1] - (lic.consumidos || 0);
    }

    return true; // Cumple todo
  });
}
