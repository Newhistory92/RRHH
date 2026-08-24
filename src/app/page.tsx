/* eslint-disable react-hooks/exhaustive-deps */
"use client"
// app/page.tsx — Shell principal de la aplicación.
// RBAC: usa los códigos de permiso que el backend devuelve al loguear
// (GET /auth/permisos), y los helpers de util/rbac.ts para navegación
// y sidebar. No hay IDs de rol en este archivo.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/util/apiClient';
import { AppLayout } from '@/app/Componentes/Shell/AppLayout';
import EstadisticasPage from '@/app/screens/Estadisticas/Screen';
import PortalInicio from '@/app/screens/PortalInicio/Screen';
import RecursosHumanosPage from '@/app/screens/RRHH/Screen';
import IAPage from '@/app/screens/IA/Screen';
import OrganigramaPage from '@/app/screens/Organigrama/Screen';
import EmployeeCV from '@/app/screens/Cv/Screen';
import MisDocumentos from '@/app/screens/MisDocumentos/Screen';
import Reubicacion from '@/app/screens/Reubicacion/Screen';
import ReubicacionTablero from '@/app/screens/ReubicacionTablero/Screen';
import LicenciasManage from '@/app/screens/LicenciasManage/Screen';
import AdminPage from '@/app/screens/Admin/Screen';
import ConfiguracionLicencias from '@/app/screens/ConfiguracionLicencias/Screen';
import GestionPublicaciones from '@/app/screens/GestionPublicaciones/Screen';
import ActivosConfig from '@/app/screens/ActivosConfig/Screen';
import ActivosInventario from '@/app/screens/ActivosInventario/Screen';
import ActivosModelos from '@/app/screens/ActivosModelos/Screen';
import AsistenciaPage from '@/app/screens/Asistencia/Screen';
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';
import TestPage from './screens/TestConfig/Screen';
import FeedbackTab from './screens/Feedback/Screen';
import { Employee, Page } from "@/app/Interfas/Interfaces";
import {
  canAccess,
  getDefaultPage,
} from "@/app/util/rbac";
import { leerPermisos, tienePermiso } from "@/app/util/permisos";

export default function App() {
  const router = useRouter();

  // ── Estado de autenticación (se llena desde localStorage en useEffect) ──────
  const [permisos, setPermisos] = useState<string[]>([]);
  const [page, setPage] = useState<Page>('inicio');
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [globalSettings, setGlobalSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = localStorage.getItem('token');
      const employeeId = localStorage.getItem('employeeId');
      if (!token) {
        router.push('/');
        return;
      }

      const permisosGuardados = leerPermisos();
      setPermisos(permisosGuardados);
      setPage(getDefaultPage(permisosGuardados));

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
    if (canAccess(permisos, newPage)) {
      setPage(newPage);
    } else {
      console.warn(`Sin permiso para la página: ${newPage}`);
    }
  };

  // ── Renderizado de página con control de acceso ───────────────────────────
  const renderPage = () => {
    if (!canAccess(permisos, page)) {
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

    switch (page) {
      case 'inicio':
        return <PortalInicio employeeData={employeeData} />;
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'recursos-humanos':
        return <RecursosHumanosPage />;
      case 'gestion-publicaciones':
        return <GestionPublicaciones />;
      case 'configuracion-licencias':
        return <ConfiguracionLicencias />;
      case 'ia':
        return <IAPage />;
      case 'organigrama':
        return <OrganigramaPage readOnly={false} />;
      case 'editar-perfil':
        return <EmployeeCV employeeData={employeeData} globalSettings={globalSettings} />;
      case 'licencias':
        return <LicenciasManage />;
      case 'documentos':
        return <MisDocumentos employeeData={employeeData} />;
      case 'reubicacion':
        return tienePermiso(permisos, 'reubicacion.gestionar')
          ? <ReubicacionTablero />
          : <Reubicacion employeeData={employeeData} />;
      case 'asistencia':
        return <AsistenciaPage puedeGestionar={tienePermiso(permisos, 'asistencia.gestionar')} />;
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
      case 'activos-config':
        return <ActivosConfig />;
      case 'activos-inventario':
        return <ActivosInventario />;
      case 'activos-modelos':
        return <ActivosModelos />;
      case 'admin':
        return <AdminPage />;
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
    <PrimeReactProvider>
      <AppLayout
        activePage={page}
        setPage={handlePageChange}
        permisos={permisos}
        employeeData={employeeData}
      >
        {renderPage()}
      </AppLayout>
    </PrimeReactProvider>
  );
}