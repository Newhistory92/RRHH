"use client"
import React from 'react';
import {  BarChart2, User } from 'lucide-react';
import { ProductivityRanking } from '@/app/Componentes/ComponEstadistica/Productivity';
import { EMPLOYEES_DATA } from '@/app/api/Prueba';
import { GlobalStats } from '@/app/Componentes/ComponEstadistica/Globalstat';
import { EmployeeDetailModal } from '@/app/Componentes/ComponEstadistica/DetailModal';




export default function EstadisticasPage() {
    const [activeTab, setActiveTab] = React.useState('ranking'); // 'ranking' o 'globales'
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);
    const [filters, setFilters] = React.useState({
        department: 'all',
        activityType: 'all',
        status: 'all',
    });
    const [sortConfig, setSortConfig] = React.useState({ key: 'productivityScore', direction: 'descending' });
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

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
                            className={`${activeTab === 'ranking' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <User className="mr-2 h-5 w-5"/> Ranking de Productividad
                        </button>
                        <button
                            onClick={() => setActiveTab('globales')}
                            className={`${activeTab === 'globales' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <BarChart2 className="mr-2 h-5 w-5"/> Estadísticas Globales
                        </button>
                    </nav>
                </div>

                <main>
                    {activeTab === 'ranking' ? (
                        <ProductivityRanking
                            employees={EMPLOYEES_DATA}
                            onSelectEmployee={setSelectedEmployee}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            sortConfig={sortConfig}
                            onSortChange={setSortConfig}
                        />
                    ) : (
                        <GlobalStats employees={EMPLOYEES_DATA} />
                    )}
                </main>

                <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
            </div>
        </div>
    );
}
