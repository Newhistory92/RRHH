"use client"
import React from 'react';
import {  BarChart2, User } from 'lucide-react';
import { ProductivityRanking } from '@/app/Componentes/ComponEstadistica/Productivity';
import { EMPLOYEES_DATA } from '@/app/api/prueba2';
import { GlobalStats } from '@/app/Componentes/ComponEstadistica/Globalstat';
import { EmployeeDetailModal } from '@/app/Componentes/ComponEstadistica/DetailModal';
import {  Employee,ProductivityRankingProps , SortConfig } from '@/app/Interfas/Interfaces';



export default function EstadisticasPage() {
    const [activeTab, setActiveTab] = React.useState('ranking'); // 'ranking' o 'globales'
    const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [filters, setFilters] = React.useState({
        department: 'all',
        activityType: 'all',
        status: 'all',
    });
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'productivityScore', direction: 'descending' });


const handleFilterChange: ProductivityRankingProps["onFilterChange"] = (key, value) => {
  setFilters(prev => ({ ...prev, [key]: value }));
  setCurrentPage(1);
};

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Estadístico de Personal</h1>
                        <p className="text-gray-600 dark:text-gray-400">Visualización y análisis de datos de empleados.</p>
                    </div>
                </header>

                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "ranking"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
                        >
                            <User className="mr-2 h-5 w-5"/> Ranking de Productividad
                        </button>
                        <button
                            onClick={() => setActiveTab('globales')}
                           className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "globales"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
                        >
                            <BarChart2 className="mr-2 h-5 w-5"/> Estadísticas Globales
                        </button>
                    </nav>
                </div>

                <main>
                    {activeTab === 'ranking' ? (
                        <ProductivityRanking
                            employees={EMPLOYEES_DATA as unknown as Employee[]}
                            onSelectEmployee={setSelectedEmployee}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            sortConfig={sortConfig}
                            onSortChange={setSortConfig}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    ) : (
                        <GlobalStats employees={EMPLOYEES_DATA as unknown as Employee[]} />
                    )}
                </main>

                <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
            </div>
        </div>
    );
}
