// util/rbac.ts
// Configuración centralizada de permisos por rol (Role-Based Access Control).
// Los IDs corresponden a los registros en la tabla Role de la base de datos:
//   1 → ADMIN, 2 → USER, 3 → RRHH, 4 → ESTADISTA

import { Page } from "@/app/Interfas/Interfaces";

// ── IDs de roles ─────────────────────────────────────────────────────────────
export const ROLE_ID = {
  ADMIN: 1,
  USER: 2,
  RRHH: 3,
  ESTADISTA: 4,
} as const;

export type RoleId = (typeof ROLE_ID)[keyof typeof ROLE_ID];

// ── Configuración de cada página ─────────────────────────────────────────────
export interface PageConfig {
  id: Page;
  label: string;
  icon: string; // Nombre del ícono de lucide-react para el Sidebar
  /** roleIds que pueden VER esta página en el sidebar */
  visibleFor: RoleId[];
  /** roleIds que pueden NAVEGAR a esta página */
  accessibleFor: RoleId[];
  /** Si true, el rol ESTADISTA solo puede leer (sin acciones de edición) */
  readOnlyForEstadista?: boolean;
}

export const PAGE_CONFIG: PageConfig[] = [
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: "BarChart2",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
  },
  {
    id: "recursos-humanos",
    label: "Recursos Humanos",
    icon: "Users",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "configuracion-licencias",
    label: "Configuración de Licencias",
    icon: "Settings",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "ia",
    label: "Inteligencia Artificial",
    icon: "BrainCircuit",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "organigrama",
    label: "Organigrama",
    icon: "GitMerge",
    // ESTADISTA puede VER el organigrama en el sidebar
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    // ESTADISTA lo ve en modo solo lectura (sin botones de edición)
    readOnlyForEstadista: true,
  },
  {
    id: "test",
    label: "Tests",
    icon: "ClipboardList",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "editar-perfil",
    label: "Mi Perfil",
    icon: "UserCircle",
    // USER accede via Header (menú perfil), no sidebar
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "licencias",
    label: "Licencias",
    icon: "FileText",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "MessageSquare",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "admin",
    label: "Administración",
    icon: "Shield",
    // SOLO ADMIN puede acceder y ver en sidebar
    visibleFor: [ROLE_ID.ADMIN],
    accessibleFor: [ROLE_ID.ADMIN],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retorna las páginas visibles en el Sidebar para un roleId dado.
 * USER (id 2) no tiene sidebar → retorna []
 */
export function getSidebarPages(roleId: number): PageConfig[] {
  if (roleId === ROLE_ID.USER) return []; // Sin sidebar
  return PAGE_CONFIG.filter((p) => p.visibleFor.includes(roleId as RoleId));
}

/**
 * Verifica si un roleId puede acceder a una página específica.
 */
export function canAccess(roleId: number, page: Page): boolean {
  const config = PAGE_CONFIG.find((p) => p.id === page);
  if (!config) return false;
  return config.accessibleFor.includes(roleId as RoleId);
}

/**
 * Retorna la primera página accesible para un roleId (para redirect inicial).
 */
export function getDefaultPage(roleId: number): Page {
  const defaults: Record<number, Page> = {
    [ROLE_ID.ADMIN]: "admin",
    [ROLE_ID.RRHH]: "estadisticas",
    [ROLE_ID.ESTADISTA]: "estadisticas",
    [ROLE_ID.USER]: "editar-perfil",
  };
  return defaults[roleId] ?? "estadisticas";
}

/**
 * Retorna true si el rol ESTADISTA debe ver la página en modo solo lectura.
 */
export function isReadOnlyForRole(roleId: number, page: Page): boolean {
  if (roleId !== ROLE_ID.ESTADISTA) return false;
  const config = PAGE_CONFIG.find((p) => p.id === page);
  return config?.readOnlyForEstadista ?? false;
}
