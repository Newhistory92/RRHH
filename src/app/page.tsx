/* eslint-disable react-hooks/exhaustive-deps */
"use client"
// app/page.tsx — Shell principal de la aplicación.
// RBAC: usa roleId numérico (1=ADMIN, 2=USER, 3=RRHH, 4=ESTADISTA)
// proveniente de localStorage, y los helpers de util/rbac.ts
// para determinar permisos de navegación y sidebar.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/util/apiClient';
import { Header } from '@/app/Componentes/Navbar/Header';
import { Sidebar } from '@/app/Componentes/Navbar/Sidebar';
import EstadisticasPage from '@/app/screens/Estadisticas/Screen';
import RecursosHumanosPage from '@/app/screens/RRHH/Screen';
import IAPage from '@/app/screens/IA/Screen';
import OrganigramaPage from '@/app/screens/Organigrama/Screen';
import EmployeeCV from '@/app/screens/Cv/Screen';
import LicenciasManage from '@/app/screens/LicenciasManage/Screen';
import AdminPage from '@/app/screens/Admin/Screen';
import ConfiguracionLicencias from '@/app/screens/ConfiguracionLicencias/Screen';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import TestPage from './screens/TestConfig/Screen';
import FeedbackTab from './screens/Feedback/Screen';
import { Employee, Page } from "@/app/Interfas/Interfaces";
import {
  canAccess,
  getDefaultPage,
  isReadOnlyForRole,
  ROLE_ID,
} from "@/app/util/rbac";

export default function App() {
  const router = useRouter();

  // ── Estado de autenticación (se llena desde localStorage en useEffect) ──────
  const [roleId, setRoleId] = useState<number | null>(null);
  const [page, setPage] = useState<Page>('estadisticas');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [globalSettings, setGlobalSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = localStorage.getItem('token');
      const storedId = localStorage.getItem('roleId');   // Número guardado al login
      const employeeId = localStorage.getItem('employeeId');
      if (!token) {
        router.push('/');
        return;
      }

      const parsedRoleId = storedId ? parseInt(storedId, 10) : null;
      setRoleId(parsedRoleId);

      // Establecer página inicial según el rol
      if (parsedRoleId) {
        setPage(getDefaultPage(parsedRoleId));
      }

      // Fetch de datos del empleado — usa apiClient para interceptar 401
      if (employeeId) {
        try {
          const empData = await apiClient.get<any>(`/employee/${employeeId}`);
          setEmployeeData(empData);
        } catch (err) {
          console.error('Error al obtener datos del empleado:', err);
        }
      }

      setIsLoading(false);
    };

    fetchEmployeeData();
  }, [router]);

  // Actualizar configuración maestra si el admin navega — usa apiClient para interceptar 401
  useEffect(() => {
    const fetchConfigs = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const settings = await apiClient.get<Record<string, boolean>>('/records/status');
        setGlobalSettings(settings);
      } catch (err) {
        console.error("Error al cargar configuración global:", err);
      }
    };
    fetchConfigs();
  }, [page]);

  // Verificar permiso antes de navegar
  const handlePageChange = (newPage: Page) => {
    if (roleId && canAccess(roleId, newPage)) {

      setPage(newPage);
    } else {
      console.warn(`Rol ${roleId} no tiene acceso a la página: ${newPage}`);
    }
  };

  // ── Renderizado de página con control de acceso ───────────────────────────
  const renderPage = () => {
    if (!roleId || !canAccess(roleId, page)) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="pi pi-lock text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No tenés permisos para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }

    // Prop readOnly para páginas que ESTADISTA debe ver sin edição
    const readOnly = isReadOnlyForRole(roleId, page);

    switch (page) {
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'recursos-humanos':
        return <RecursosHumanosPage />;
      case 'configuracion-licencias':
        return <ConfiguracionLicencias />;
      case 'ia':
        return <IAPage />;
      case 'organigrama':
        // Pasa readOnly al Organigrama para que muestre/oculte controles de edición
        return <OrganigramaPage readOnly={readOnly} />;
      case 'editar-perfil':
        return <EmployeeCV employeeData={employeeData} globalSettings={globalSettings} />;
      case 'licencias':
        return <LicenciasManage />;
      case 'feedback':
        if (globalSettings["Feedback"] === false) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center border dark:border-gray-700">
                <i className="pi pi-ban text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Módulo Inactivo</h2>
                <p className="text-gray-500 dark:text-gray-400">Este módulo ha sido deshabilitado por el administrador.</p>
              </div>
            </div>
          );
        }
        return <FeedbackTab />;
      case 'test':
        return <TestPage />;
      case 'admin':
        // Solo ADMIN (id 1) puede llegar aquí, protegido por canAccess()
        return roleId === ROLE_ID.ADMIN ? <AdminPage /> : null;
      default:
        return <EstadisticasPage />;
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <PrimeReactProvider>
        <Header setPage={handlePageChange} employeeData={employeeData} />
        {/* Sidebar se oculta automáticamente para USER (roleId 2) */}
        <Sidebar
          activePage={page}
          setPage={handlePageChange}
          onCollapseChange={setSidebarCollapsed}
          roleId={roleId}
        />
        <main
          className={`pt-20 pr-4 md:pr-8 pb-8 transition-all duration-300 ${
            // Sin sidebar para USER → sin padding izquierdo
            !roleId || roleId === ROLE_ID.USER
              ? 'pl-4 md:pl-8'
              : isSidebarCollapsed
                ? 'md:pl-24'
                : 'md:pl-72'
            }`}
        >
          {renderPage()}
        </main>
      </PrimeReactProvider>
    </div>
  );
}