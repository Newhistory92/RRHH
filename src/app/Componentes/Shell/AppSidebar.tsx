"use client";

import {
  BarChart2,
  Users,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
  Settings,
  Home,
  Newspaper,
  Boxes,
  Package,
  Cpu,
  ArrowLeftRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Page } from "@/app/Interfas/Interfaces";
import { getSidebarSections } from "@/app/util/rbac";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart2,
  Users,
  Settings,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
  Home,
  Newspaper,
  Boxes,
  Package,
  Cpu,
  ArrowLeftRight,
};

interface AppSidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  permisos: string[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** En móvil el sidebar vive fuera de pantalla y entra con este estado. */
  mobileAbierto?: boolean;
  onCerrarMobile?: () => void;
}

export function AppSidebar({
  activePage,
  setPage,
  permisos,
  isCollapsed,
  onToggleCollapse,
  mobileAbierto = false,
  onCerrarMobile,
}: AppSidebarProps) {
  const sections = getSidebarSections(permisos);

  // Sin páginas visibles no hay sidebar que dibujar (caso USER).
  if (sections.length === 0) return null;

  // Colapsado es de escritorio: en el panel móvil siempre van las etiquetas,
  // que es lo único que hace navegable un menú chico.
  const colapsado = isCollapsed && !mobileAbierto;

  const irA = (page: Page) => {
    setPage(page);
    onCerrarMobile?.();
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Fondo que atenúa el contenido mientras el panel está abierto; tocarlo
          lo cierra, que es el gesto que se espera en un cajón lateral. */}
      {mobileAbierto && (
        <div
          onClick={onCerrarMobile}
          className="md:hidden fixed inset-0 top-16 bg-overlay z-30"
          aria-hidden="true"
        />
      )}
      {/* Arranca en top-16, debajo del navbar, que ahora cruza todo el ancho. */}
      <aside
        className={`bg-muted border-r border-border fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col transition-all duration-300 ease-in-out w-64 ${
          mobileAbierto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${isCollapsed ? "md:w-16" : "md:w-64"}`}
      >
        <button
          onClick={onToggleCollapse}
          className="hidden md:block absolute top-4 -right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:opacity-90 transition-opacity z-50"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden space-y-4">
          {sections.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && <Separator className="mb-3" />}
              {!colapsado && (
                <p className="px-3 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.pages.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] ?? Shield;
                  const isActive = activePage === item.id;
                  const link = (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        irA(item.id);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-warm-contrast text-warm-contrast-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      } ${colapsado ? "justify-center" : ""}`}
                    >
                      <IconComponent size={18} className="flex-shrink-0" />
                      {!colapsado && <span className="ml-3 truncate">{item.label}</span>}
                    </a>
                  );

                  return (
                    <li key={item.id}>
                      {colapsado ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
