// util/permisos.ts
// Lectura/escritura de los códigos de permiso del usuario y chequeo local.
// Los códigos los emite el backend (GET /auth/permisos); acá no se decide
// nada sobre roles — solo se guardan y se consultan.

const CLAVE = "permisos";

/** Comodín: quien lo tiene pasa cualquier chequeo. Se lo asigna ADMIN. */
export const COMODIN = "*";

export function leerPermisos(): string[] {
  if (typeof window === "undefined") return [];
  const crudo = localStorage.getItem(CLAVE);
  if (!crudo) return [];
  try {
    const parsed = JSON.parse(crudo);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarPermisos(permisos: string[]): void {
  localStorage.setItem(CLAVE, JSON.stringify(permisos));
}

export function limpiarPermisos(): void {
  localStorage.removeItem(CLAVE);
}

/**
 * True si el conjunto habilita el código pedido.
 * Espeja a tiene_permiso() del backend: comodín gana, resto match exacto.
 * El backend vuelve a chequear igual — esto es solo para no mostrar botones
 * que van a dar 403.
 */
export function tienePermiso(permisos: string[], code: string): boolean {
  return permisos.includes(COMODIN) || permisos.includes(code);
}
