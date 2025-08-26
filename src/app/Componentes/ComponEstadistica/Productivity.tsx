import { ACTIVITY_TYPES, DEPARTMENTS, STATUS_TYPES } from '@/app/api/Prueba';
import { Card,getScoreColor } from '@/app/Componentes/Card';
import { ChevronDown, ChevronUp,  Filter,  } from 'lucide-react';
import React from 'react';
import {  Employee, ProductivityRankingProps, SortableKey, SortDirection  } from '@/app/Interfas/Interfaces';
import { Pagination} from '@/app/Componentes/Pagination/pagination';

export const ProductivityRanking = ({ 
  employees, 
  onSelectEmployee, 
  filters, 
  onFilterChange, 
  sortConfig, 
  onSortChange,
  currentPage,
  onPageChange
}: ProductivityRankingProps) => {
      const itemsPerPage = 10;
    const filteredEmployees = React.useMemo(() => {
        return employees
            .filter(e => filters.department === 'all' || e.department === filters.department)
            .filter(e => filters.activityType === 'all' || e.activityType === filters.activityType)
            .filter(e => filters.status === 'all' || e.status === filters.status);
    }, [employees, filters]);

   const sortedEmployees = React.useMemo(() => {
    const sortableEmployees = [...filteredEmployees];
    
    if (sortConfig.key) {
        sortableEmployees.sort((a, b) => {
            // Manejar campos que pueden ser undefined
            const valueA = a[sortConfig.key as keyof Employee] ?? 0;
            const valueB = b[sortConfig.key as keyof Employee] ?? 0;

            if (valueA < valueB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableEmployees;
}, [filteredEmployees, sortConfig]);

   const handleSort = (key: SortableKey) => {
    let direction: SortDirection = 'descending';
    
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
        direction = 'ascending';
    }
    
    onSortChange({ key, direction });
};


 // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);
//    className="w-full h-8 py-1 px-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white">
   return (
        <Card className="col-span-1 lg:col-span-3">
             <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4">
                     <h2 className="text-xl font-bold text-gray-800 dark:text-white flex-shrink-0 mr-4">Ranking de Productividad</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto flex-grow">
                        <select
                            value={filters.department}
                            onChange={(e) => onFilterChange('department', e.target.value)}
                            className="w-full h-8 py-1 px-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                        >
                            <option value="all">Todos los Departamentos</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            value={filters.activityType}
                            onChange={(e) => onFilterChange('activityType', e.target.value)}
                            className="w-full h-8 py-1 px-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                        >
                            <option value="all">Todas las Actividades</option>
                            {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                             className="w-full h-8 py-1 px-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                        >
                            <option value="all">Toda Condición Laboral</option>
                            {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                </div>
             </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Empleado</th>
                            <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Departamento</th>
                            <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden lg:table-cell">Categoría</th>
                            <th 
                                className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400 cursor-pointer"
                                onClick={() => handleSort('productivityScore')}
                            >
                                <div className="flex items-center">
                                    Productividad
                                    {sortConfig.key === 'productivityScore' ? (
                                        sortConfig.direction === 'descending' ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />
                                    ) : <ChevronDown className="ml-1 h-4 w-4 text-gray-300" />}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees.map((employee) => (
                            <tr key={employee.id} onClick={() => onSelectEmployee(employee)} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-150">
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full mr-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{employee.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{employee.department}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">{employee.department}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 hidden lg:table-cell">{employee.category}</td>
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${getScoreColor(employee.productivityScore)}`}></div>
                                        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{employee.productivityScore.toFixed(1)}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {currentEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <Filter className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sin resultados</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ajusta los filtros para encontrar empleados.</p>
                    </div>
                 )}
            </div>
            <Pagination 
                totalItems={sortedEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </Card>
    );
};