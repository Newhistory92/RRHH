// util/rbac.ts
// Metadata de cada página y el permiso que la habilita.
// No hay IDs de rol acá: quién tiene cada permiso lo decide la tabla
// RolePermission en la base, y el backend lo informa en GET /auth/permisos.

import { Page } from "@/app/Interfas/Interfaces";
import { tienePermiso } from "@/app/util/permisos";

export interface PageConfig {
  id: Page;
  label: string;
  icon: string; // Nombre del ícono de lucide-react para el Sidebar
  section: "General" | "Gente" | "Organización" | "Aprendizaje" | "IA" | "Sistema" | "Activos";
  /** Código de permiso que habilita esta página */
  permiso: string;
  /** Si true, no aparece en el sidebar aunque el usuario tenga el permiso
   *  (se llega por el menú de perfil del Header) */
  ocultaEnSidebar?: boolean;
}

export const PAGE_CONFIG: PageConfig[] = [
  { id: "inicio", label: "Inicio", icon: "Home", section: "General", permiso: "inicio.ver" },
  { id: "estadisticas", label: "Estadísticas", icon: "BarChart2", section: "General", permiso: "estadisticas.ver" },
  { id: "recursos-humanos", label: "Recursos Humanos", icon: "Users", section: "Gente", permiso: "rrhh.gestionar" },
  { id: "gestion-publicaciones", label: "Publicaciones", icon: "Newspaper", section: "Gente", permiso: "publicaciones.gestionar" },
  { id: "configuracion-licencias", label: "Configuración de Licencias", icon: "Settings", section: "Organización", permiso: "licencias.configurar" },
  { id: "ia", label: "Inteligencia Artificial", icon: "BrainCircuit", section: "IA", permiso: "ia.usar" },
  { id: "organigrama", label: "Organigrama", icon: "GitMerge", section: "Organización", permiso: "organigrama.ver" },
  { id: "test", label: "Tests", icon: "ClipboardList", section: "Aprendizaje", permiso: "test.gestionar" },
  { id: "editar-perfil", label: "Mi Perfil", icon: "UserCircle", section: "Gente", permiso: "perfil.editar", ocultaEnSidebar: true },
  { id: "licencias", label: "Licencias", icon: "FileText", section: "Organización", permiso: "licencias.propias" },
  { id: "documentos", label: "Documentos", icon: "Folder", section: "Gente", permiso: "documentos.propios", ocultaEnSidebar: true },
  { id: "feedback", label: "Feedback", icon: "MessageSquare", section: "Gente", permiso: "feedback.participar" },
  { id: "asistencia", label: "Asistencia", icon: "Clock", section: "Gente", permiso: "asistencia.propia" },
  { id: "activos-config", label: "Configuración de Activos", icon: "Boxes", section: "Activos", permiso: "activos.configurar" },
  { id: "activos-inventario", label: "Inventario", icon: "Package", section: "Activos", permiso: "activos.inventario" },
  { id: "activos-modelos", label: "Modelos de PC", icon: "Cpu", section: "Activos", permiso: "activos.modelos" },
  { id: "admin", label: "Administración", icon: "Shield", section: "Sistema", permiso: "admin.gestionar" },
];

/**
 * Reubicación es la única página con dos variantes según permiso, así que
 * no entra en PAGE_CONFIG con un permiso único: se resuelve en page.tsx.
 * Se declara acá para que el sidebar la muestre a quien tenga cualquiera
 * de las dos.
 */
export const REUBICACION_CONFIG: PageConfig & { permisoAlterno: string } = {
  id: "reubicacion",
  label: "Reubicación",
  icon: "ArrowLeftRight",
  section: "Gente",
  permiso: "reubicacion.gestionar",
  permisoAlterno: "reubicacion.solicitar",
};

function permisoDePagina(page: Page): string[] {
  if (page === REUBICACION_CONFIG.id) {
    return [REUBICACION_CONFIG.permiso, REUBICACION_CONFIG.permisoAlterno];
  }
  const config = PAGE_CONFIG.find((p) => p.id === page);
  return config ? [config.permiso] : [];
}

/** Verifica si el usuario puede navegar a una página. */
export function canAccess(permisos: string[], page: Page): boolean {
  const requeridos = permisoDePagina(page);
  if (requeridos.length === 0) return false;
  return requeridos.some((code) => tienePermiso(permisos, code));
}

/** Páginas visibles en el sidebar (excluye las marcadas ocultaEnSidebar). */
export function getSidebarPages(permisos: string[]): PageConfig[] {
  const pages = PAGE_CONFIG.filter(
    (p) => !p.ocultaEnSidebar && tienePermiso(permisos, p.permiso)
  );
  if (canAccess(permisos, REUBICACION_CONFIG.id)) {
    pages.push(REUBICACION_CONFIG);
  }
  return pages;
}

/**
 * Primera página accesible, en el orden en que están declaradas.
 * Inicio va primero en PAGE_CONFIG, así que todo rol con inicio.ver
 * aterriza ahí; los que no, caen en la primera que tengan.
 */
export function getDefaultPage(permisos: string[]): Page {
  const primera = PAGE_CONFIG.find((p) => tienePermiso(permisos, p.permiso));
  return primera?.id ?? "inicio";
}

// ── Agrupación por sección ──────────────────────────────────────────────────

export interface NavSection {
  label: PageConfig["section"];
  pages: PageConfig[];
}

const SECTION_ORDER: PageConfig["section"][] = [
  "General",
  "Gente",
  "Organización",
  "Aprendizaje",
  "IA",
  "Activos",
  "Sistema",
];

/**
 * Páginas visibles agrupadas por sección, en el orden fijo de SECTION_ORDER.
 * Secciones sin páginas visibles no se incluyen. Un usuario sin ninguna
 * página de sidebar recibe [] y AppLayout no dibuja el sidebar.
 */
export function getSidebarSections(permisos: string[]): NavSection[] {
  const visibles = getSidebarPages(permisos);
  return SECTION_ORDER.map((section) => ({
    label: section,
    pages: visibles.filter((p) => p.section === section),
  })).filter((group) => group.pages.length > 0);
}
