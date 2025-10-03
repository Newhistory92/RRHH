"use client"
import React, { useState } from 'react';
import { Header } from '@/app/Componentes/Navbar/Header';
import { Sidebar } from '@/app/Componentes/Navbar/Sidebar';
import  EstadisticasPage  from '@/app/pages/Estadisticas/page';
import  RecursosHumanosPage  from '@/app/pages/RRHH/page';
import  IAPage  from '@/app/pages/IA/page';
import  OrganigramaPage  from '@/app/pages/Organigrama/page';
import EmployeeCV  from '@/app/pages/Cv/page';
import LicenciasManage from '@/app/pages/LicenciasManage/page';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';
import  TestPage  from './pages/TestConfig/page';
import FeedbackTab from './pages/Feedback/page';
import { Page} from "@/app/Interfas/Interfaces";

export default function App() {
  const [page, setPage] = useState<Page>('estadisticas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderPage = () => {
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
        return <EmployeeCV />;
      case 'licencias':
        return <LicenciasManage />;
      case 'feedback':
        return <FeedbackTab />;
      case 'test':
        return <TestPage />;
      default:
        return <EstadisticasPage />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <PrimeReactProvider>
        <Header setPage={setPage} />
        <Sidebar 
          activePage={page} 
          setPage={setPage} 
          onCollapseChange={setIsSidebarCollapsed}
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