/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/Componentes/Navbar/Header';
import { Sidebar } from '@/app/Componentes/Navbar/Sidebar';
import  EstadisticasPage  from '@/app/pages/Estadisticas/page';
import  RecursosHumanosPage  from '@/app/pages/RRHH/page';
import  IAPage  from '@/app/pages/IA/page';
import  OrganigramaPage  from '@/app/pages/Organigrama/page';
import EmployeeCV  from '@/app/pages/Cv/page';
import LicenciasManage from '@/app/pages/LicenciasManage/page';
import  AdminPage  from '@/app/pages/Admin/page';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import  TestPage  from './pages/TestConfig/page';
import FeedbackTab from './pages/Feedback/page';
import { Page} from "@/app/Interfas/Interfaces";

export default function App() {
  const router = useRouter();
  const [page, setPage] = useState<Page>('estadisticas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<any>(null);

  // Páginas permitidas por rol
  const rolePermissions: Record<string, Page[]> = {
    RRHH: ['estadisticas', 'recursos-humanos', 'ia', 'organigrama', 'test'],
    User: ['editar-perfil', 'licencias', 'feedback', 'admin'],
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      // Verificar si el usuario está autenticado
      const token = localStorage.getItem('token');
      const roleName = localStorage.getItem('roleName');
      const Empleado_ID = localStorage.getItem('employeeId');

      if (!token) {
        // Si no hay token, redirigir al login
        router.push('/login');
        return;
      }

      setUserRole(roleName);
      
      // Establecer página inicial según el rol
      if (roleName) {
        const allowedPages = rolePermissions[roleName] || [];
        if (allowedPages.length > 0) {
          setPage(allowedPages[0]);
        }
      }

      // Fetch de datos del empleado si existe el ID
      if (Empleado_ID) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/employee/${Empleado_ID}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Datos del empleado obtenidos:', data);
            setEmployeeData(data);
          } else {
            console.error('Error al obtener datos del empleado:', response.statusText);
          }
        } catch (error) {
          console.error('Error en la petición:', error);
        }
      }
      
      setIsLoading(false);
    };

    fetchEmployeeData();
  }, [router]);

  // Verificar si el usuario tiene permiso para ver una página
  const canAccessPage = (pageName: Page): boolean => {
    if (!userRole) return false;
    const allowedPages = rolePermissions[userRole] || [];
    return allowedPages.includes(pageName);
  };

  // Manejar cambio de página con validación de permisos
  const handlePageChange = (newPage: Page) => {
    if (canAccessPage(newPage)) {
      setPage(newPage);
    } else {
      console.warn(`Usuario con rol ${userRole} no tiene acceso a ${newPage}`);
    }
  };

  const renderPage = () => {
    // Verificar permisos antes de renderizar
    if (!canAccessPage(page)) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="pi pi-lock text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }

    switch (page) {
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'recursos-humanos':
        return <RecursosHumanosPage />;
      case 'ia':
        return <IAPage />;
      case 'organigrama':
        return <OrganigramaPage />;
       case 'editar-perfil':
        return <EmployeeCV employeeData={employeeData}  />;
      case 'licencias':
        return <LicenciasManage employeeData={employeeData}  />;
      case 'feedback':
        return <FeedbackTab employeeData={employeeData}  />;
      case 'test':
        return <TestPage />;
         case 'admin':
        return <AdminPage />;
      default:
        return <EstadisticasPage />;
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <PrimeReactProvider>
        <Header setPage={handlePageChange} />
        <Sidebar 
          activePage={page} 
          setPage={handlePageChange}
          onCollapseChange={setIsSidebarCollapsed}
          userRole={userRole}
        />
        <main 
          className={`pt-20 pr-4 md:pr-8 pb-8 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'
          }`}
        >
          {renderPage()}
        </main>
      </PrimeReactProvider>
    </div>
  );
}