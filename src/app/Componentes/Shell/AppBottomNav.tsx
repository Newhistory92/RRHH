"use client";

// Barra inferior para quien no administra nada (hoy el rol USER), solo en
// celular. Sus cuatro secciones entran en la barra, así que no necesita el
// cajón lateral ni ir a buscar la mitad de las cosas al menú del avatar.

import { Clock, FileText, Folder, Home } from "lucide-react";
import { Page } from "@/app/Interfas/Interfaces";
import { canAccess } from "@/app/util/rbac";

const ITEMS: { id: Page; label: string; Icono: typeof Home }[] = [
  { id: "inicio", label: "Inicio", Icono: Home },
  { id: "asistencia", label: "Asistencia", Icono: Clock },
  { id: "licencias", label: "Licencias", Icono: FileText },
  { id: "documentos", label: "Documentos", Icono: Folder },
];

interface AppBottomNavProps {
  activePage: Page;
  setPage: (page: Page) => void;
  permisos: string[];
}

export function AppBottomNav({ activePage, setPage, permisos }: AppBottomNavProps) {
  // Se filtra por permiso igual que el sidebar: si algún día un rol sin
  // gestión no tiene una de las cuatro, la barra sale con menos ítems en vez
  // de ofrecer una sección que después responde "Acceso denegado".
  const visibles = ITEMS.filter((item) => canAccess(permisos, item.id));
  if (visibles.length === 0) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-border bg-card"
      // Respeta el indicador de inicio del iPhone. Depende de
      // viewportFit: "cover" en el layout: sin eso este valor es siempre 0.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {visibles.map(({ id, label, Icono }) => {
        const activo = activePage === id;
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            aria-current={activo ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
              activo ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icono size={22} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
