
import { getScoreColor } from '@/app/util/UiRRHH';
import { ChevronDown, ChevronUp, Filter, AlertTriangle } from 'lucide-react';
import React from 'react';
import {  Employee, StatsProductivityRankingProps, SortableKey, SortDirection  } from '@/app/Interfas/Interfaces';
import { Pagination} from '@/app/Componentes/Pagination/pagination';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card, CardContent } from '@/components/ui/card';
        
const formatDisplayValue = (text: string | null | undefined): string => {
  if (!text) return '';
  const cleaned = text.replace(/_/g, ' ').replace(/[^\w\sáéíóúÁÉÍÓÚñÑ.-]/g, '');
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ProductivityRanking = ({ 
  employees, 
  onSelectEmployee, 
  filters, 
  onFilterChange, 
  sortConfig, 
  onSortChange,
  currentPage,
  onPageChange,
  metadata
}: StatsProductivityRankingProps) => {
  const itemsPerPage = 10;
console.log('Metadata recibida en ProductivityRanking:',  employees);
  // Preparar opciones de departamentos desde metadata
  const departmentOptions = React.useMemo(() => {
    const options = [{ label: 'Todos los Departamentos', value: 'all' }];
    
    if (metadata && metadata.departments) {
      metadata.departments.forEach(dept => {
        if (dept.startsWith('   - ')) {
          const cleanName = dept.replace('   - ', '');
          options.push({ label: `   • ${formatDisplayValue(cleanName)}`, value: cleanName });
        } else {
          options.push({ label: formatDisplayValue(dept), value: dept });
        }
      });
    }
    
    return options;
  }, [metadata]);

  // Opciones para tipo de actividad desde metadata
  const activityTypeOptions = React.useMemo(() => {
    const options = [{ label: 'Todas las Actividades', value: 'all' }];
    if (metadata && metadata.activityTypes) {
      metadata.activityTypes.forEach(act => {
        options.push({ label: formatDisplayValue(act), value: act });
      });
    }
    return options;
  }, [metadata]);

  // Opciones para estado desde metadata
  const statusOptions = React.useMemo(() => {
    const options = [{ label: 'Toda Condición Laboral', value: 'all' }];
    if (metadata && metadata.employmentStatuses) {
      metadata.employmentStatuses.forEach(stat => {
        options.push({ label: formatDisplayValue(stat), value: stat });
      });
    }
    return options;
  }, [metadata]);

  const filteredEmployees = React.useMemo(() => {
    return employees
      .filter(e => filters.department === 'all' || e.department === filters.department || (e as any).office === filters.department)
      .filter(e => filters.activityType === 'all' || (e as any).activityType === filters.activityType)
      .filter(e => filters.employmentStatus === 'all' || (e as any).tipoContrato === filters.employmentStatus)
  }, [employees, filters]);


  const sortedEmployees = React.useMemo(() => {
    const sortableEmployees = [...filteredEmployees];
    
    if (sortConfig.key) {
      sortableEmployees.sort((a, b) => {
        const valueA = a[sortConfig.key as keyof Employee];
        const valueB = b[sortConfig.key as keyof Employee];

        // "Sin dato" no es un cero: si se ordenara como 0 la persona caeria al
        // fondo del ranking y se leeria como la peor, que es justo lo que la
        // columna evita al mostrar "N/A" en vez de un numero. Van siempre al
        // final, en las dos direcciones, para que no se mezclen con los medidos.
        const faltaA = valueA === null || valueA === undefined;
        const faltaB = valueB === null || valueB === undefined;
        if (faltaA && faltaB) return 0;
        if (faltaA) return 1;
        if (faltaB) return -1;

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
        <div className="w-10 h-10 rounded-full mr-4 flex items-center justify-center bg-warm-contrast text-warm-contrast-foreground font-bold">
          {employee.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{employee.name}</p>
          <p className="text-sm text-muted-foreground md:hidden">{formatDisplayValue((employee as any).department)}</p>
        </div>
      </div>
    );
  };

  // Template para la columna de productividad
  const productivityBodyTemplate = (employee: Employee) => {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getScoreColor(employee.productivityScore)}`}></div>
        <span className="font-bold text-lg text-foreground">
          {employee.productivityScore != null ? employee.productivityScore.toFixed(1) : 'N/A'}
        </span>
        {employee.isExento && (
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-info-soft text-info-soft-foreground"
            title="Promedio del área — el trabajo de esta área no se mide por accesos al sistema"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            Promedio
          </span>
        )}
      </div>
    );
  };

  // Columna de Feedback 360. Dos estados posibles y solo dos: el puntaje y
  // las alertas comparten el piso de 3 evaluadores, asi que o se muestran
  // ambos o ninguno. No existe "Datos insuficientes" con icono de alerta.
  const feedbackBodyTemplate = (employee: Employee) => {
    const promedio = employee.feedbackPromedio;
    const alertas = employee.feedbackAlertas ?? 0;

    if (promedio == null) {
      return (
        <span
          className="text-sm text-muted-foreground"
          title="Hacen falta al menos 3 evaluadores para mostrar un puntaje. Con menos, el numero seria la opinion de una o dos personas y haria deducible quien evaluo."
        >
          Datos insuficientes
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div>
          <span className="font-bold text-lg text-foreground">{promedio.toFixed(1)}</span>
          <p className="text-xs text-muted-foreground">
            {employee.feedbackEvaluadores} evaluadores
          </p>
        </div>
        {alertas > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-warning-soft text-warning-soft-foreground"
            title={`${alertas} alerta(s) de conducta para revisar por RRHH`}
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {alertas}
          </span>
        )}
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
        ) : <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />}
      </div>
    );
  };

  // Empty message template
  const emptyMessageTemplate = () => {
    return (
      <div className="text-center py-12">
        <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">Sin resultados</h3>
        <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros para encontrar empleados.</p>
      </div>
    );
  };



  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardContent>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-foreground flex-shrink-0 mr-4">
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
        onRowClick={(e) => onSelectEmployee(e.data as Employee)}
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
          body={(rowData: Employee) => formatDisplayValue((rowData as any).department)}
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column 
          field="tipoContrato" 
          header="Condición Laboral"
          body={(rowData: Employee) => formatDisplayValue((rowData as any).tipoContrato)}
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column 
          field="categoria" 
          header="Categoría"
          body={(rowData: Employee) => formatDisplayValue((rowData as any).categoria)}
          className="hidden lg:table-cell"
          headerClassName="hidden lg:table-cell"
        />
        <Column
          field="productivityScore"
          header={productivityHeaderTemplate()}
          body={productivityBodyTemplate}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="feedbackPromedio"
          header="Feedback"
          body={feedbackBodyTemplate}
          style={{ minWidth: '160px' }}
          className="hidden lg:table-cell"
          headerClassName="hidden lg:table-cell"
        />
      </DataTable>
            <Pagination
                totalItems={sortedEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
      </CardContent>
        </Card>
    );
};