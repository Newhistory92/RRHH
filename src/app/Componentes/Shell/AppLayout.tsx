"use client";

import { useState } from "react";
import { AppSidebar } from "@/app/Componentes/Shell/AppSidebar";
import { AppHeader } from "@/app/Componentes/Shell/AppHeader";
import { AppBottomNav } from "@/app/Componentes/Shell/AppBottomNav";
import { Employee, Page } from "@/app/Interfas/Interfaces";
import { getSidebarSections, tieneNavegacionSimple } from "@/app/util/rbac";

interface AppLayoutProps {
  activePage: Page;
  setPage: (page: Page) => void;
  permisos: string[];
  employeeData?: Employee | null;
  children: React.ReactNode;
}

export function AppLayout({
  activePage,
  setPage,
  permisos,
  employeeData,
  children,
}: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false);

  const hasSidebar = getSidebarSections(permisos).length > 0;
  const navegacionSimple = tieneNavegacionSimple(permisos);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* El navbar es fixed y cruza todo el ancho, asi que va fuera del
          contenedor desplazado y el contenido compensa su alto con pt-16. */}
      <AppHeader
        setPage={setPage}
        employeeData={employeeData}
        permisos={permisos}
        hayMenu={hasSidebar && !navegacionSimple}
        onAbrirMenu={() => setMenuMobileAbierto(true)}
      />
      <AppSidebar
        activePage={activePage}
        setPage={setPage}
        permisos={permisos}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        mobileAbierto={menuMobileAbierto}
        onCerrarMobile={() => setMenuMobileAbierto(false)}
      />
      {navegacionSimple && (
        <AppBottomNav activePage={activePage} setPage={setPage} permisos={permisos} />
      )}
      <div
        className={`pt-16 transition-all duration-300 ${
          hasSidebar ? (isCollapsed ? "md:pl-16" : "md:pl-64") : ""
        } ${navegacionSimple ? "pb-20 md:pb-0" : ""}`}
      >
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
