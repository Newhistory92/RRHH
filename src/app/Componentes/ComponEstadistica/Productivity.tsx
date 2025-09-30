
import{INTEGRATED_ORG_DATA ,EMPLOYMENT_STATUS,ACTIVITY_TYPES } from '@/app/api/prueba2';
import { getScoreColor } from '@/app/Componentes/Card';
import { ChevronDown, ChevronUp,  Filter,  } from 'lucide-react';
import React from 'react';
import {  Employee, ProductivityRankingProps, SortableKey, SortDirection  } from '@/app/Interfas/Interfaces';
import { Pagination} from '@/app/Componentes/Pagination/pagination';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
        
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

  // Preparar opciones de departamentos desde INTEGRATED_ORG_DATA
  const departmentOptions = React.useMemo(() => {
    const options = [{ label: 'Todos los Departamentos', value: 'all' }];
    
    INTEGRATED_ORG_DATA.forEach(dept => {
      // Agregar el departamento principal
      options.push({ label: dept.nombre, value: dept.nombre });
      
      // Agregar las oficinas como sub-opciones (si existen)
      if (dept.oficinas && dept.oficinas.length > 0) {
        dept.oficinas.forEach(oficina => {
          options.push({ 
            label: `   • ${oficina.nombre}`, 
            value: oficina.nombre 
          });
        });
      }
    });
    
    return options;
  }, []);

  // Opciones para tipo de actividad
  const activityTypeOptions = React.useMemo(() => {
    return [
      { label: 'Todas las Actividades', value: 'all' },
      ...ACTIVITY_TYPES.map(a => ({ label: a, value: a }))
    ];
  }, []);

  // Opciones para estado
  const statusOptions = React.useMemo(() => {
    return [
      { label: 'Toda Condición Laboral', value: 'all' },
      ...EMPLOYMENT_STATUS.map(s => ({ label: s, value: s }))
    ];
  }, []);

  const filteredEmployees = React.useMemo(() => {
    return employees
      .filter(e => filters.department === 'all' || e.department === filters.department)
      .filter(e => filters.activityType === 'all' || e.activityType === filters.activityType)
      .filter(e => filters.employmentStatus === 'all' || e.employmentStatus === filters.employmentStatus);
  }, [employees, filters]);

  console.log(filteredEmployees)
  const sortedEmployees = React.useMemo(() => {
    const sortableEmployees = [...filteredEmployees];
    
    if (sortConfig.key) {
      sortableEmployees.sort((a, b) => {
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

  // Template para la columna de empleado
  const employeeBodyTemplate = (employee: Employee) => {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold">
          {employee.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{employee.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{employee.department}</p>
        </div>
      </div>
    );
  };

  // Template para la columna de productividad
  const productivityBodyTemplate = (employee: Employee) => {
    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${getScoreColor(employee.productivityScore)}`}></div>
        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
          {employee.productivityScore.toFixed(1)}
        </span>
      </div>
    );
  };

  // Template para header con sort
  const productivityHeaderTemplate = () => {
    return (
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => handleSort('productivityScore')}
      >
        Productividad
        {sortConfig.key === 'productivityScore' ? (
          sortConfig.direction === 'descending' ? 
            <ChevronDown className="ml-1 h-4 w-4" /> : 
            <ChevronUp className="ml-1 h-4 w-4" />
        ) : <ChevronDown className="ml-1 h-4 w-4 text-gray-300" />}
      </div>
    );
  };

  // Empty message template
  const emptyMessageTemplate = () => {
    return (
      <div className="text-center py-12">
        <Filter className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sin resultados</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ajusta los filtros para encontrar empleados.</p>
      </div>
    );
  };



  return (
    <Card className="col-span-1 lg:col-span-3">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex-shrink-0 mr-4">
            Ranking de Productividad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto flex-grow">
            <Dropdown
              value={filters.department}
              options={departmentOptions}
              onChange={(e: DropdownChangeEvent) => onFilterChange('department', e.value)}
              placeholder="Todos los Departamentos"
              className="w-full"
              panelClassName="max-h-60 overflow-auto"
            />
            <Dropdown
              value={filters.activityType}
              options={activityTypeOptions}
              onChange={(e: DropdownChangeEvent) => onFilterChange('activityType', e.value)}
              placeholder="Todas las Actividades"
              className="w-full"
            />
            <Dropdown
              value={filters.employmentStatus}
              options={statusOptions}
              onChange={(e: DropdownChangeEvent) => onFilterChange('employmentStatus', e.value)}
              placeholder="Toda Condición Laboral"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <DataTable
        value={currentEmployees}
        onRowClick={(e) => onSelectEmployee(e.data)}
        emptyMessage={emptyMessageTemplate()}
        className="w-full"
        rowHover
        stripedRows
      >
        <Column 
          field="name" 
          header="Empleado" 
          body={employeeBodyTemplate}
          style={{ minWidth: '200px' }}
        />
        <Column 
          field="department" 
          header="Departamento"
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column 
          field="category" 
          header="Categoría"
          className="hidden lg:table-cell"
          headerClassName="hidden lg:table-cell"
        />
        <Column 
          field="productivityScore" 
          header={productivityHeaderTemplate()}
          body={productivityBodyTemplate}
          style={{ minWidth: '150px' }}
        />
      </DataTable>
            <Pagination 
                totalItems={sortedEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </Card>
    );
};