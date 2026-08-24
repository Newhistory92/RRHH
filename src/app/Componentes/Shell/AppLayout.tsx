"use client";

import { useState } from "react";
import { AppSidebar } from "@/app/Componentes/Shell/AppSidebar";
import { AppHeader } from "@/app/Componentes/Shell/AppHeader";
import { Employee, Page } from "@/app/Interfas/Interfaces";
import { getSidebarSections } from "@/app/util/rbac";

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

  const hasSidebar = getSidebarSections(permisos).length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar
        activePage={activePage}
        setPage={setPage}
        permisos={permisos}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />
      <div
        className={`transition-all duration-300 ${
          hasSidebar ? (isCollapsed ? "md:pl-16" : "md:pl-64") : ""
        }`}
      >
        <AppHeader setPage={setPage} employeeData={employeeData} />
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
