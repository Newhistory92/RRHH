"use client"
import { useState, useMemo } from 'react';
import { Search, SearchX, Bell, LogOut, HelpCircle, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { StatusBadge, HoursDisplay } from "@/app/util/UiRRHH"
import { Pagination } from '@/app/Componentes/Pagination/pagination';
import { Employee, SortDirection, } from '@/app/Interfas/Interfaces';
import { GuiaLicenciasRRHHModal } from "@/app/Componentes/ModalRRHH/GuiaLicenciasRRHHModal";

export interface EmployeeTableViewProps {
  employees: Employee[];
  onSelectEmployee: (id: number) => void;
  onShowMessages: () => void;
  onOpenPermissionModal: (employeeId: number | null) => void;
  onShowBajas: () => void;
}

export interface ViewState {
  name: 'table' | 'detail' | 'messages' | 'bajas';
  id?: number;
  /** Desde qué vista se abrió el detalle, para que "Volver" regrese ahí. */
  desde?: 'table' | 'bajas';
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
  /** Las columnas de cifras se alinean a la derecha, junto con sus valores. */
  align?: 'left' | 'right';
}
export const EmployeeTableView = ({
  employees,
  onSelectEmployee,
  onShowMessages,
  onOpenPermissionModal,
  onShowBajas,
}: EmployeeTableViewProps) => {
  const [mostrarGuiaLicencias, setMostrarGuiaLicencias] = useState(false);
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

  // Antes era un <th onClick> sin padding propio: no se podia ordenar con el
  // teclado y las columnas ordenables quedaban mas angostas que las fijas. El
  // hueco del chevron se reserva siempre para que la etiqueta no se corra al
  // alternar el orden.
  const SortableHeader = ({ children, columnKey, align = 'left' }: SortableHeaderProps) => {
    const isSorted = sortConfig.key === columnKey;

    return (
      <th
        scope="col"
        className="px-3 py-3.5"
        aria-sort={
          isSorted
            ? sortConfig.direction === "ascending" ? "ascending" : "descending"
            : "none"
        }
      >
        <button
          type="button"
          onClick={() => handleSort(columnKey)}
          className={`group flex w-full items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            align === 'right' ? 'justify-end' : ''
          }`}
        >
          {children}
          <span className="flex h-4 w-4 items-center justify-center">
            {isSorted ? (
              sortConfig.direction === "ascending" ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )
            ) : (
              <ChevronDownIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-40" />
            )}
          </span>
        </button>
      </th>
    );
  };

  const totalMessages = employees.reduce(
    (acc, curr) => acc + curr.messages.length,
    0
  );

  // Las cifras describen el padron entero, no la vista filtrada: si cambiaran
  // al tipear en el buscador no se podria leer un total, que es justo para lo
  // que estan. El filtro acota la tabla de abajo, no el encabezado.
  const resumen = useMemo(() => {
    const ausentes = employees.filter(
      (e) => e.status === "De licencia" || e.status === "Parte médico"
    ).length;
    return {
      total: employees.length,
      activos: employees.filter((e) => e.status === "Activo").length,
      ausentes,
      saldo: employees.reduce((acc, e) => acc + (e.horas ?? 0), 0),
    };
  }, [employees]);

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
        <div className="sm:flex-auto flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Lista de empleados
          </h1>
          <button
            type="button"
            onClick={() => setMostrarGuiaLicencias(true)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-heartbeat"
            aria-label="Cómo funcionan las licencias"
            title="Cómo funcionan las licencias"
          >
            <HelpCircle size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <button
            onClick={onShowBajas}
            className="whitespace-nowrap rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver bajas
          </button>
          <button
            onClick={onShowMessages}
            className="flex items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell size={16} className="mr-2" />
            Solicitudes de licencias
            {totalMessages > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 font-mono text-xs tabular-nums text-error-foreground">
                {totalMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Como esta el padron hoy. Son cuatro cifras y ningun grafico: la tabla
          de abajo es lo que se usa, el encabezado solo tiene que dar el total
          de un vistazo. */}
      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Empleados</dt>
          <dd className="mt-2 whitespace-nowrap font-mono text-xl tabular-nums text-foreground sm:text-2xl">
            {resumen.total}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Activos</dt>
          <dd className="mt-2 whitespace-nowrap font-mono text-xl tabular-nums text-foreground sm:text-2xl">
            {resumen.activos}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Ausentes hoy</dt>
          <dd className="mt-2 whitespace-nowrap font-mono text-xl tabular-nums text-foreground sm:text-2xl">
            {resumen.ausentes}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            Licencia y parte médico
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Saldo acumulado</dt>
          <dd
            className={`mt-2 whitespace-nowrap font-mono text-xl tabular-nums sm:text-2xl ${
              resumen.saldo >= 0 ? "text-success" : "text-error"
            }`}
          >
            {resumen.saldo > 0 ? "+" : ""}
            {resumen.saldo.toFixed(2)} hs
          </dd>
        </div>
      </dl>

      {/* Filtros */}
      {/* 12 columnas y no 6: con sextos, el select de estado se quedaba en
          1/6 del ancho y cortaba "Todos los estados" a media palabra. */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o departamento"
              aria-label="Buscar empleados"
              className="block h-10 w-full rounded-lg border-0 pl-9 pr-3 text-sm text-foreground ring-1 ring-inset ring-border transition-shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              value={filters.searchTerm}
              onChange={(e) => {
                setFilters({ ...filters, searchTerm: e.target.value });
                setCurrentPage(1); // Resetear a primera página al buscar
              }}
            />
          </div>
        </div>
        <div className="sm:col-span-3">
          <select
            aria-label="Filtrar por estado"
            className="block h-10 w-full rounded-lg border-0 px-3 text-sm text-foreground ring-1 ring-inset ring-border transition-shadow focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            value={filters.estado}
            onChange={(e) => {
              setFilters({ ...filters, estado: e.target.value });
              setCurrentPage(1); // Resetear a primera página al filtrar
            }}
          >
            <option value="">Todos los estados</option>
            {["Activo", "De licencia", "Parte médico"].map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-4">
          <select
            aria-label="Filtrar por departamento"
            className="block h-10 w-full rounded-lg border-0 px-3 text-sm text-foreground ring-1 ring-inset ring-border transition-shadow focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            value={filters.departamento}
            onChange={(e) => {
              setFilters({ ...filters, departamento: e.target.value });
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los departamentos</option>
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
      {/* El panel lleva el radio de panel (16px) y una hairline del token
          --border. Antes era shadow + ring-black/5, que es un negro crudo
          fuera de la paleta y no se adapta al tema oscuro. */}
      <div className="mt-8">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-muted-foreground sm:pl-6"
                    >
                      Nombre completo
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground"
                    >
                      DNI
                    </th>
                    <SortableHeader columnKey="status">Estado</SortableHeader>
                    <SortableHeader columnKey="department">
                      Departamento
                    </SortableHeader>
                    <SortableHeader columnKey="horas" align="right">
                      Horas
                    </SortableHeader>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground"
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
                      {/* El nombre es un boton de verdad: el click en la fila
                          sirve para el mouse, pero sin esto el legajo no se
                          puede abrir con el teclado. */}
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEmployee(employee.id);
                          }}
                          className="rounded text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {employee.name}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 font-mono text-sm tabular-nums text-muted-foreground">
                        {employee.dni}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <StatusBadge status={employee.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {getDepartmentName(employee.department)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                        <HoursDisplay hours={employee.horas} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPermissionModal(employee.id);
                          }}
                          className="flex items-center gap-1.5 rounded font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <LogOut size={16} /> Permiso de salida
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          {/* Un filtro que no coincide no es una alerta: nada esta mal, solo
              no hay coincidencias. Antes era un triangulo de advertencia. */}
          {filteredAndSortedEmployees.length === 0 && (
            <div className="bg-card py-12 text-center">
              <SearchX size={32} className="mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No se encontraron empleados
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Intente ajustar los filtros
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

      {mostrarGuiaLicencias && (
        <GuiaLicenciasRRHHModal onClose={() => setMostrarGuiaLicencias(false)} />
      )}
    </div>
  );
};