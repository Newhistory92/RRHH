"use client"
import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Bell, LogOut, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { StatusBadge, HoursDisplay } from "@/app/util/UiRRHH"
import { Pagination } from '@/app/Componentes/Pagination/pagination';
import { Employee, SortDirection, } from '@/app/Interfas/Interfaces';

export interface EmployeeTableViewProps {
  employees: Employee[];
  onSelectEmployee: (id: number) => void;
  onShowMessages: () => void;
  onOpenPermissionModal: (employeeId: number | null) => void;
  onShowJubilados: () => void;
}

export interface ViewState {
  name: 'table' | 'detail' | 'messages' | 'jubilados';
  id?: number;
}
type SortableKeys = keyof Employee | null;

// Interfaz para la configuración de ordenamiento
interface SortConfig {
  key: SortableKeys;
  direction: SortDirection;
}
interface SortableHeaderProps {
  children: React.ReactNode;
  columnKey: keyof Employee;
}
export const EmployeeTableView = ({
  employees,
  onSelectEmployee,
  onShowMessages,
  onOpenPermissionModal,
  onShowJubilados,
}: EmployeeTableViewProps) => {
  const [filters, setFilters] = useState({
    estado: "",
    departamento: "",
    searchTerm: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handleSort = (key: keyof Employee) => {
    let direction: SortDirection = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = [...employees];

    if (filters.estado) {
      filtered = filtered.filter((e) => e.status === filters.estado);
    }

    if (filters.departamento) {
      filtered = filtered.filter(
        (e) => e.department?.nombre === filters.departamento
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.dni.toLowerCase().includes(term) ||
          e.department?.nombre?.toLowerCase().includes(term)
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Manejar valores null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null)
          return sortConfig.direction === "ascending" ? 1 : -1;
        if (bValue == null)
          return sortConfig.direction === "ascending" ? -1 : 1;

        // Comparación normal para valores no null
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [employees, filters, sortConfig]);

  const SortableHeader = ({ children, columnKey }: SortableHeaderProps) => {
    const isSorted = sortConfig.key === columnKey;

    return (
      <th
        className="cursor-pointer hover:bg-muted"
        onClick={() => handleSort(columnKey)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isSorted ? (
            sortConfig.direction === "ascending" ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )
          ) : null}
        </div>
      </th>
    );
  };

  const totalMessages = employees.reduce(
    (acc, curr) => acc + curr.messages.length,
    0
  );

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedEmployees, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDepartmentName = (dep: any) => {
    if (!dep) return "Sin departamento";
    if (typeof dep === "string") return dep;
    if (typeof dep === "object" && "nombre" in dep && dep.nombre)
      return dep.nombre;
    return "Sin departamento";
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="font-heading text-2xl font-bold leading-6 text-foreground">
            Lista de Empleados
          </h1>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          {/* Antes vivia en un div aparte arriba de este bloque, con
              bg-muted sobre un fondo casi identico -- por eso quedaba flotando
              solo y sin contraste. Ahora comparte fila con el otro botón y
              lleva borde + texto en --primary para que se note que es
              accionable. */}
          <button
            onClick={onShowJubilados}
            className="rounded-md border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver jubilados
          </button>
          <button
            onClick={onShowMessages}
            className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Bell size={16} className="mr-2" />
            Solicitudes de Licencias
            {totalMessages > 0 && (
              <span className="ml-2 bg-error text-error-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, departamento..."
              className="block w-full rounded-md shadow-xl border-0 py-2 pl-10 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
              value={filters.searchTerm}
              onChange={(e) => {
                setFilters({ ...filters, searchTerm: e.target.value });
                setCurrentPage(1); // Resetear a primera página al buscar
              }}
            />
          </div>
        </div>
        <div className="sm:col-span-1">
          <select
            className="block w-full px-3 rounded-md border-0 py-2.5 text-foreground shadow-xl ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
            value={filters.estado}
            onChange={(e) => {
              setFilters({ ...filters, estado: e.target.value });
              setCurrentPage(1); // Resetear a primera página al filtrar
            }}
          >
            <option value="">Todos los Estados</option>
            {["Activo", "De licencia", "Parte médico"].map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <select
            className="block w-full px-3 rounded-md border-0 py-2.5 text-foreground shadow-xl ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
            value={filters.departamento}
            onChange={(e) => {
              setFilters({ ...filters, departamento: e.target.value });
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los Departamentos</option>
            {[...new Map(
              employees
                .filter(e => e.department && e.department.nombre)
                .map(e => [e.department.id ?? e.department.nombre, e.department.nombre])
            ).entries()].map(([id, nombre]) => (
              <option key={id} value={nombre}>
                {nombre}
              </option>
            ))}

          </select>
        </div>
      </div>
      {/* Tabla */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6"
                    >
                      Nombre Completo
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                    >
                      DNI
                    </th>
                    <SortableHeader columnKey="status">Estado</SortableHeader>
                    <SortableHeader columnKey="department">
                      Departamento
                    </SortableHeader>
                    <SortableHeader columnKey="horas">Horas</SortableHeader>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {/* El hover y el click van en el <tr>, no en cada <td>: si
                      van por celda se pinta solo la columna bajo el cursor. */}
                  {paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => onSelectEmployee(employee.id)}
                      className="cursor-pointer transition-colors hover:bg-muted"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                        {employee.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {employee.dni}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        <StatusBadge status={employee.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {getDepartmentName(employee.department)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        <HoursDisplay hours={employee.horas} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPermissionModal(employee.id);
                          }}
                          className="flex items-center gap-1 font-medium text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          <LogOut size={14} /> Permiso Salida
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAndSortedEmployees.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-card">
                  <AlertTriangle size={40} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 font-semibold">
                    No se encontraron empleados
                  </p>
                  <p className="text-sm">
                    Intente ajustar los filtros de búsqueda.
                  </p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {filteredAndSortedEmployees.length > 0 && (
              <div className="mt-6">
                <Pagination
                  totalItems={filteredAndSortedEmployees.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};