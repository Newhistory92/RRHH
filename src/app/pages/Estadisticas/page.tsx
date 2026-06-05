"use client"
/**
 * pages/Estadisticas/page.tsx
 *
 * Panel Estadístico de Personal — datos reales desde DB.
 *
 * Flujo de datos:
 *  1. GET /stats/dashboard  → StatsEmployee[] enriquecido con sesiones + RRHH
 *  2. GET /stats/metadata   → EstadisticasMetadata (filtros)
 *
 * Anti-spam: no se vuelve a hacer fetch si la última llamada fue hace < 3 s.
 */

import React from 'react';
import { BarChart2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { ProductivityRanking } from '@/app/Componentes/ComponEstadistica/Productivity';
import { GlobalStats }         from '@/app/Componentes/ComponEstadistica/Globalstat';
import { EmployeeDetailModal } from '@/app/Componentes/ComponEstadistica/DetailModal';
import type {
  StatsEmployee,
  EstadisticasMetadata,
  Filters,
  SortConfig,
  GlobalStatsData,
} from '@/app/Interfas/Interfaces';

const ANTI_SPAM_MS = 3_000;

export default function EstadisticasPage() {
  const [activeTab, setActiveTab]         = React.useState<'ranking' | 'globales'>('ranking');
  const [selectedEmployee, setSelectedEmployee] = React.useState<StatsEmployee | null>(null);
  const [currentPage, setCurrentPage]     = React.useState(1);
  const [filters, setFilters]             = React.useState<Filters>({ department: 'all', activityType: 'all', employmentStatus: 'all' });
  const [sortConfig, setSortConfig]       = React.useState<SortConfig>({ key: 'productivityAvg', direction: 'descending' });

  const [employees, setEmployees]         = React.useState<StatsEmployee[]>([]);
  const [metadata, setMetadata]           = React.useState<EstadisticasMetadata>({ departments: [], employmentStatuses: [], activityTypes: [] });
  const [globalStats, setGlobalStats]     = React.useState<GlobalStatsData | null>(null);
  const [isLoading, setIsLoading]         = React.useState(true);
  const [error, setError]                 = React.useState<string | null>(null);

  // Anti-spam ref — guarda el timestamp del último fetch exitoso
  const lastFetchTs = React.useRef<number>(0);

  const fetchData = React.useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetchTs.current < ANTI_SPAM_MS) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [dashboardRes, metaRes, globalRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/stats/dashboard', { headers }),
        fetch('http://127.0.0.1:8000/stats/metadata', { headers }),
        fetch('http://127.0.0.1:8000/stats/global-stats', { headers }),
      ]);

      if (!dashboardRes.ok) throw new Error(`Dashboard API: ${dashboardRes.status}`);
      if (!metaRes.ok)      throw new Error(`Metadata API: ${metaRes.status}`);
      if (!globalRes.ok)    throw new Error(`Global Stats API: ${globalRes.status}`);

      const dashboardJson = await dashboardRes.json() as { success: boolean; data: StatsEmployee[]; error?: string };
      const metaJson      = await metaRes.json()      as { success: boolean; data: EstadisticasMetadata; error?: string };
      const globalJson    = await globalRes.json()    as { success: boolean; data: GlobalStatsData; error?: string };

      if (!dashboardJson.success) throw new Error(dashboardJson.error ?? 'Error al cargar el dashboard');
      if (!metaJson.success)      throw new Error(metaJson.error ?? 'Error al cargar metadata');
      if (!globalJson.success)    throw new Error(globalJson.error ?? 'Error al cargar global stats');

      setEmployees(dashboardJson.data);
      setMetadata(metaJson.data);
      setGlobalStats(globalJson.data);

      lastFetchTs.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial
  React.useEffect(() => { fetchData(true); }, [fetchData]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Cargando datos estadísticos…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="w-14 h-14 text-red-400" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">No se pudieron cargar los datos</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
        <button
          onClick={() => fetchData(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Estadístico de Personal</h1>
            <p className="text-gray-600 dark:text-gray-400">Visualización y análisis de datos de empleados.</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            title="Actualizar datos"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline text-gray-600 dark:text-gray-300">Actualizar</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {([
              { id: 'ranking',  label: 'Ranking de Productividad', Icon: User },
              { id: 'globales', label: 'Estadísticas Globales',    Icon: BarChart2 },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
                  activeTab === id
                    ? 'border-b-2 border-[#2ecbe7] text-[#1ABCD7]'
                    : 'text-gray-500 hover:text-blue-500'
                }`}>
                <Icon className="mr-2 h-5 w-5" /> {label}
              </button>
            ))}
          </nav>
        </div>

        <main>
          {activeTab === 'ranking' ? (
            <ProductivityRanking
              employees={employees}
              onSelectEmployee={setSelectedEmployee}
              filters={filters}
              onFilterChange={handleFilterChange}
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              metadata={metadata}
            />
          ) : (
            <GlobalStats data={globalStats} isLoading={isLoading} error={error} />
          )}
        </main>

        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      </div>
    </div>
  );
}
