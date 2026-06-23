# Retema de RRHH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retematizar el módulo RRHH (tabla de empleados, vista de detalle con 3 tabs, mensajes/licencias pendientes, modales de licencia/permiso) reemplazando clases Tailwind hardcodeadas por los tokens semánticos de la paleta "Orgánico Cálido" ya definidos.

**Architecture:** Cambio puramente de presentación — ninguna lógica de fetch/estado cambia. Ningún componente de este módulo usa `Card` de PrimeReact (solo inputs/dropdowns/calendar/dialog/toast/progressbar, que ya heredan el tema `lara-light-pink` retemado globalmente en la fase de Estadísticas), así que no hay migraciones de librería — solo swap de clases.

**Tech Stack:** Next.js 14, Tailwind v4 (tokens en `globals.css`), PrimeReact (sin cambios de librería, solo hereda el tema ya retemado).

## Global Constraints

- No tocar lógica de fetch/estado (`fetchEmployeeData`, `handleApplyLicense`, `handleSubmit`, `handleSave`, etc.) — solo JSX/clases.
- No migrar ningún componente PrimeReact a otra librería.
- Los 3 tokens nuevos (`--color-success-soft`/`-foreground`, `--color-warning-soft`/`-foreground`, `--color-error-soft`/`-foreground`) se definen vía `color-mix()` relativo a `--background` — se adaptan a claro/oscuro automáticamente, sin bloque `.dark` separado.
- Verificación: `npx tsc --noEmit` acotado a archivos tocados + verificación visual manual (no hay test suite automatizado para cambios puramente visuales).

---

### Task 1: Tokens "soft" en globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: utilidades Tailwind `bg-success-soft`, `text-success-soft-foreground`, `bg-warning-soft`, `text-warning-soft-foreground`, `bg-error-soft`, `text-error-soft-foreground` — consumidas por la Tarea 2 (`StatusBadge` en `UiRRHH.tsx`).

- [ ] **Step 1: Agregar los 6 tokens nuevos al bloque `@theme inline`**

El archivo actual tiene en las líneas 109-111:

```css
  --color-info: var(--color-info);
  --color-info-foreground: var(--color-info-foreground);
}
```

Reemplazar por:

```css
  --color-info: var(--color-info);
  --color-info-foreground: var(--color-info-foreground);
  --color-success-soft: color-mix(in srgb, var(--color-success) 20%, var(--background));
  --color-success-soft-foreground: var(--color-success);
  --color-warning-soft: color-mix(in srgb, var(--color-warning) 20%, var(--background));
  --color-warning-soft-foreground: var(--color-warning);
  --color-error-soft: color-mix(in srgb, var(--color-error) 20%, var(--background));
  --color-error-soft-foreground: var(--color-error);
}
```

- [ ] **Step 2: Probar que las utilidades se generan**

Crear un archivo temporal `src/app/test-soft-probe.tsx`:

```tsx
export default function TestSoft() {
  return (
    <div className="p-4 space-y-2">
      <span className="bg-success-soft text-success-soft-foreground px-3 py-1 rounded-full">success</span>
      <span className="bg-warning-soft text-warning-soft-foreground px-3 py-1 rounded-full">warning</span>
      <span className="bg-error-soft text-error-soft-foreground px-3 py-1 rounded-full">error</span>
    </div>
  );
}
```

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `globals.css`/`test-soft-probe.tsx`.

Run: `npm run dev` brevemente y, si es posible, abrir `http://localhost:3000/test-soft-probe` para confirmar visualmente que cada pastilla tiene fondo clarito y texto del mismo tono más saturado. Si no podés verlo, alcanza con confirmar que compila sin error.

- [ ] **Step 3: Borrar el archivo temporal**

```bash
rm src/app/test-soft-probe.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add soft success/warning/error tokens for status pills"
```

---

### Task 2: Retemear utilidades compartidas en UiRRHH.tsx

**Files:**
- Modify: `src/app/util/UiRRHH.tsx`

**Interfaces:**
- Consumes: utilidades `bg-success-soft`/`text-success-soft-foreground` (y warning/error) de la Tarea 1.
- Produces: `StatusBadge`, `HoursDisplay`, `InfoCard` — mismas firmas de props, solo cambian clases. Consumidos sin cambios por `Table.tsx`, `Perfildetail.tsx`, `DetailTables.tsx` (Tareas 4, 5, 7).

- [ ] **Step 1: Retemear `StatusBadge`**

El archivo actual tiene (línea ~830):

```tsx
export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'De licencia': 'bg-yellow-100 text-yellow-800',
    'Parte médico': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};
```

Reemplazar por:

```tsx
export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    'Activo': 'bg-success-soft text-success-soft-foreground',
    'De licencia': 'bg-warning-soft text-warning-soft-foreground',
    'Parte médico': 'bg-error-soft text-error-soft-foreground',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};
```

- [ ] **Step 2: Retemear `HoursDisplay`**

El archivo actual tiene (línea ~843):

```tsx
export const HoursDisplay = ({ hours }: { hours: number | null }) => {
  const h = hours ?? 0;
  return (
    <span className={`font-semibold ${h >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
      {h > 0 ? '+' : ''}{h.toFixed(2)}hs
    </span>
  );
};
```

Reemplazar por:

```tsx
export const HoursDisplay = ({ hours }: { hours: number | null }) => {
  const h = hours ?? 0;
  return (
    <span className={`font-semibold ${h >= 0 ? 'text-success' : 'text-error'}`}>
      {h > 0 ? '+' : ''}{h.toFixed(2)}hs
    </span>
  );
};
```

- [ ] **Step 3: Retemear `InfoCard`**

El archivo actual tiene (línea ~852):

```tsx
export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
  <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 h-full shadow-sm border border-gray-100">
    <Icon className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</h4>
      <div className="text-gray-800 text-sm">{children}</div>
    </div>
  </div>
);
```

Reemplazar por:

```tsx
export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
  <div className="bg-muted rounded-xl p-4 flex items-start gap-3 h-full shadow-sm border border-border">
    <Icon className="text-muted-foreground mt-0.5 flex-shrink-0" size={18} />
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{title}</h4>
      <div className="text-foreground text-sm">{children}</div>
    </div>
  </div>
);
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `UiRRHH.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: retheme StatusBadge, HoursDisplay, InfoCard to organic-warm tokens"
```

---

### Task 3: Retemear Screen.tsx

**Files:**
- Modify: `src/app/screens/RRHH/Screen.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva — solo cambia clases.

- [ ] **Step 1: Retemear el estado de carga**

El archivo actual tiene (líneas 111-120):

```tsx
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
```

Reemplazar por:

```tsx
   if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Retemear el contenedor raíz**

El archivo actual tiene (línea 167):

```tsx
      <div className="bg-white min-h-screen font-sans shadow-2xl">
```

Reemplazar por:

```tsx
      <div className="bg-background min-h-screen font-sans">
```

(Se quita `shadow-2xl` del contenedor raíz de toda la página — no aporta nada visualmente al ocupar toda la pantalla, y no estaba en los tokens del retema anterior para ningún otro `Screen.tsx`.)

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/RRHH/Screen.tsx
git commit -m "feat: retheme RRHH Screen.tsx to organic-warm tokens"
```

---

### Task 4: Retemear Table.tsx

**Files:**
- Modify: `src/app/Componentes/TablaOperador/Table.tsx`

**Interfaces:**
- Consumes: `StatusBadge`/`HoursDisplay` desde `@/app/util/UiRRHH` (Tarea 2, props sin cambios).
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el header sorteable**

El archivo actual tiene (línea 108):

```tsx
        className="cursor-pointer hover:bg-gray-50"
```

Reemplazar por:

```tsx
        className="cursor-pointer hover:bg-muted"
```

- [ ] **Step 2: Retemear el título y botón de "Solicitudes de Licencias"**

El archivo actual tiene (líneas 159-166):

```tsx
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Lista de Empleados
          </h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={onShowMessages}
            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
```

Reemplazar por:

```tsx
          <h1 className="font-heading text-2xl font-bold leading-6 text-foreground">
            Lista de Empleados
          </h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={onShowMessages}
            className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
```

- [ ] **Step 3: Retemear el badge de contador de mensajes**

El archivo actual tiene (línea 171):

```tsx
              <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
```

Reemplazar por:

```tsx
              <span className="ml-2 bg-error text-error-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
```

- [ ] **Step 4: Retemear el buscador**

El archivo actual tiene (líneas 184-189):

```tsx
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, departamento..."
              className="block w-full rounded-md shadow-xl border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
```

Reemplazar por:

```tsx
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, departamento..."
              className="block w-full rounded-md shadow-xl border-0 py-2 pl-10 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
```

- [ ] **Step 5: Retemear los selects de filtro (estado y departamento)**

El archivo actual tiene (línea 200):

```tsx
            className="block w-full px-3 rounded-md border-0 py-2.5 text-gray-900 shadow-xl ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
```

(esta clase aparece dos veces, idéntica, en los selects de Estado y Departamento — líneas 200 y 217). Reemplazar **ambas** ocurrencias por:

```tsx
            className="block w-full px-3 rounded-md border-0 py-2.5 text-foreground shadow-xl ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
```

- [ ] **Step 6: Retemear la tabla (encabezado, filas, vacío)**

El archivo actual tiene (líneas 243-271):

```tsx
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Nombre Completo
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      DNI
                    </th>
                    <SortableHeader columnKey="status">Estado</SortableHeader>
                    <SortableHeader columnKey="department">
                      Departamento
                    </SortableHeader>
                    <SortableHeader columnKey="hours">Horas</SortableHeader>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
```

Reemplazar por:

```tsx
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
                    <SortableHeader columnKey="hours">Horas</SortableHeader>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
```

- [ ] **Step 7: Retemear las celdas de fila**

El archivo actual tiene (líneas 272-314):

```tsx
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {employee.name}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {employee.dni}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        <StatusBadge status={employee.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {getDepartmentName(employee.department)}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        <HoursDisplay hours={employee.hours} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPermissionModal(employee.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                        >
                          <LogOut size={14} /> Permiso Salida
                        </button>
                      </td>
                    </tr>
                  ))}
```

Reemplazar por:

```tsx
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6 hover:bg-muted cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {employee.name}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {employee.dni}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        <StatusBadge status={employee.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        {getDepartmentName(employee.department)}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                        onClick={() => onSelectEmployee(employee.id)}
                      >
                        <HoursDisplay hours={employee.hours} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPermissionModal(employee.id);
                          }}
                          className="text-primary hover:opacity-80 font-medium flex items-center gap-1"
                        >
                          <LogOut size={14} /> Permiso Salida
                        </button>
                      </td>
                    </tr>
                  ))}
```

- [ ] **Step 8: Retemear el estado vacío**

El archivo actual tiene (líneas 319-329):

```tsx
              {filteredAndSortedEmployees.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white">
                  <AlertTriangle size={40} className="mx-auto text-gray-400" />
                  <p className="mt-2 font-semibold">
                    No se encontraron empleados
                  </p>
                  <p className="text-sm">
                    Intente ajustar los filtros de búsqueda.
                  </p>
                </div>
              )}
```

Reemplazar por:

```tsx
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
```

- [ ] **Step 9: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Table.tsx`.

- [ ] **Step 10: Commit**

```bash
git add src/app/Componentes/TablaOperador/Table.tsx
git commit -m "feat: retheme Table.tsx to organic-warm tokens"
```

---

### Task 5: Retemear Perfildetail.tsx

**Files:**
- Modify: `src/app/Componentes/TablaOperador/Perfildetail.tsx`

**Interfaces:**
- Consumes: `StatusBadge` desde `@/app/util/UiRRHH` (Tarea 2, props sin cambios).
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el estado "empleado no encontrado"**

El archivo actual tiene (líneas 22-35):

```tsx
  if (!employee) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver
        </button>
        <div className="text-center text-gray-500">
          No se encontró información del empleado
        </div>
      </div>
    );
  }
```

Reemplazar por:

```tsx
  if (!employee) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-muted text-foreground rounded hover:bg-border"
        >
          ← Volver
        </button>
        <div className="text-center text-muted-foreground">
          No se encontró información del empleado
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Retemear el botón "Volver" y el header del perfil**

El archivo actual tiene (líneas 41-56):

```tsx
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 no-print"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver a la lista
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-white rounded-lg shadow-md">
      <Avatar image={employee.photo} size="xlarge" shape="circle" />
        <div>
          <p className="text-gray-800 text-2xl"> {employee.name}</p>
          <p className="text-gray-500 text-lg"> DNI: {employee.dni}</p>
          <div className="mt-2">
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>
```

Reemplazar por:

```tsx
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 no-print"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver a la lista
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-card rounded-lg shadow-sm">
      <Avatar image={employee.photo} size="xlarge" shape="circle" />
        <div>
          <p className="font-heading text-foreground text-2xl"> {employee.name}</p>
          <p className="text-muted-foreground text-lg"> DNI: {employee.dni}</p>
          <div className="mt-2">
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>
```

- [ ] **Step 3: Retemear las pestañas (Perfil / Historial de Licencias / Historial de Permisos)**

El archivo actual tiene (líneas 58-91):

```tsx
      <div className="border-b border-gray-200 no-print">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`${
              activeTab === "perfil"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("licencias")}
            className={`${
              activeTab === "licencias"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Licencias
          </button>
          <button
            onClick={() => setActiveTab("permisos")}
            className={`${
              activeTab === "permisos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Permisos
          </button>
        </nav>
      </div>
```

Reemplazar por:

```tsx
      <div className="border-b border-border no-print">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`${
              activeTab === "perfil"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("licencias")}
            className={`${
              activeTab === "licencias"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Licencias
          </button>
          <button
            onClick={() => setActiveTab("permisos")}
            className={`${
              activeTab === "permisos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Permisos
          </button>
        </nav>
      </div>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Perfildetail.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/TablaOperador/Perfildetail.tsx
git commit -m "feat: retheme Perfildetail.tsx to organic-warm tokens"
```

---

### Task 6: Retemear MensajeDetail.tsx

**Files:**
- Modify: `src/app/Componentes/TablaOperador/MensajeDetail.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el botón "Volver" y el título**

El archivo actual tiene (líneas 37-53):

```tsx
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver
      </button>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Mensajes y Solicitudes
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona las solicitudes de licencia pendientes y consulta el
            historial.
          </p>
        </div>
      </div>
```

Reemplazar por:

```tsx
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver
      </button>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="font-heading text-2xl font-bold leading-6 text-foreground">
            Mensajes y Solicitudes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona las solicitudes de licencia pendientes y consulta el
            historial.
          </p>
        </div>
      </div>
```

- [ ] **Step 2: Retemear las pestañas**

El archivo actual tiene (líneas 56-84):

```tsx
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`${
              activeTab === "pendientes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Pendientes <Mail size={16} className="ml-2" />{" "}
            {pendingMessages.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`${
              activeTab === "historial"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Historial <Archive size={16} className="ml-2" />
          </button>
        </nav>
      </div>
```

Reemplazar por:

```tsx
      <div className="border-b border-border mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`${
              activeTab === "pendientes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Pendientes <Mail size={16} className="ml-2" />{" "}
            {pendingMessages.length > 0 && (
              <span className="ml-2 bg-error text-error-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`${
              activeTab === "historial"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Historial <Archive size={16} className="ml-2" />
          </button>
        </nav>
      </div>
```

- [ ] **Step 3: Retemear la lista de mensajes pendientes**

El archivo actual tiene (líneas 86-114):

```tsx
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {activeTab === "pendientes" &&
          (pendingMessages.length > 0 ? (
            pendingMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                onClick={() => setSelectedMessageData(msg)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <Mail className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-gray-600">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hacer clic para ver detalles y aplicar.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Bell size={48} className="mx-auto text-gray-400" />
              <p className="mt-4 font-semibold">No hay mensajes pendientes.</p>
            </div>
          ))}
```

Reemplazar por:

```tsx
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        {activeTab === "pendientes" &&
          (pendingMessages.length > 0 ? (
            pendingMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                onClick={() => setSelectedMessageData(msg)}
                className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">{msg.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hacer clic para ver detalles y aplicar.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Bell size={48} className="mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">No hay mensajes pendientes.</p>
            </div>
          ))}
```

- [ ] **Step 4: Retemear la lista de historial**

El archivo actual tiene (líneas 115-145):

```tsx
        {activeTab === "historial" &&
          (archivedMessages.length > 0 ? (
            archivedMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                className="p-4 border rounded-lg bg-gray-50 flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <CheckCircle className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    &quot;{msg.text}&quot;
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Procesado el: {msg.date}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Archive size={48} className="mx-auto text-gray-400" />
              <p className="mt-4 font-semibold">
                El historial de mensajes está vacío.
              </p>
            </div>
          ))}
```

Reemplazar por:

```tsx
        {activeTab === "historial" &&
          (archivedMessages.length > 0 ? (
            archivedMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                className="p-4 border border-border rounded-lg bg-muted flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{msg.text}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Procesado el: {msg.date}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Archive size={48} className="mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">
                El historial de mensajes está vacío.
              </p>
            </div>
          ))}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `MensajeDetail.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/app/Componentes/TablaOperador/MensajeDetail.tsx
git commit -m "feat: retheme MensajeDetail.tsx to organic-warm tokens"
```

---

### Task 7: Retemear DetailTables.tsx

**Files:**
- Modify: `src/app/Componentes/TablaOperador/DetailTables.tsx`

**Interfaces:**
- Consumes: `InfoCard`/`HoursDisplay` desde `@/app/util/UiRRHH` (Tarea 2, props sin cambios).
- Produces: ninguna interfaz nueva — `ProfileTab`, `LicenseHistoryTab`, `PermissionHistoryTab` mantienen sus firmas.

- [ ] **Step 1: Retemear las 3 tarjetas de `ProfileTab`**

El archivo actual tiene, repetido 3 veces (líneas 191-194, 211-215, 316-319), el mismo patrón de tarjeta:

```tsx
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Datos Personales
            </h3>
```

(y análogamente con título `Condición Laboral` en la segunda, `Detalles Adicionales` en la tercera). Reemplazar **las 3 ocurrencias** del patrón `bg-white p-6 rounded-lg shadow-md` por `bg-card p-6 rounded-lg shadow-sm`, y **las 3 ocurrencias** de `text-lg font-bold text-gray-800 mb-4 border-b pb-2` por `font-heading text-lg font-bold text-foreground mb-4 border-b border-border pb-2`. Específicamente:

Línea 191-194 (bloque "Datos Personales"):
```tsx
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Datos Personales
            </h3>
```
→
```tsx
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
              Datos Personales
            </h3>
```

Línea 211-215 (bloque "Condición Laboral", incluye el div del header con el botón de editar):
```tsx
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                Condición Laboral
              </h3>
```
→
```tsx
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Condición Laboral
              </h3>
```

Línea 316-319 (bloque "Detalles Adicionales"):
```tsx
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Detalles Adicionales
            </h3>
```
→
```tsx
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
              Detalles Adicionales
            </h3>
```

- [ ] **Step 2: Retemear el botón de editar y los textos sueltos de `ProfileTab`**

El archivo actual tiene (línea 217-223):

```tsx
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm"
                  onClick={() => setIsEditing(true)}
                  style={{ color: '#2563eb' }}
                />
```

Reemplazar por:

```tsx
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm"
                  onClick={() => setIsEditing(true)}
                  style={{ color: 'var(--primary)' }}
                />
```

El archivo actual tiene (línea 349):

```tsx
                    <span className="text-gray-500 flex-shrink-0">—</span>
```

Reemplazar por:

```tsx
                    <span className="text-muted-foreground flex-shrink-0">—</span>
```

- [ ] **Step 3: Retemear `StepLabel`**

El archivo actual tiene (líneas 376-383):

```tsx
const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
  </div>
);
```

Reemplazar por:

```tsx
const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-foreground text-sm">{label}</h3>
  </div>
);
```

- [ ] **Step 4: Retemear el header de `LicenseHistoryTab` y el aviso "Modo RRHH"**

El archivo actual tiene (líneas 546-575):

```tsx
    <div className="mt-4 flow-root">
      <Toast ref={toast} />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Historial de Licencias</h2>
```

Reemplazar por:

```tsx
    <div className="mt-4 flow-root">
      <Toast ref={toast} />
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Historial de Licencias</h2>
```

El archivo actual tiene (línea 574):

```tsx
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700">
              <span className="font-bold">Modo RRHH:</span> Esta licencia no requiere aprobación del supervisor y se guardará directamente como <strong>Aprobada</strong> en el historial, descontando los saldos correspondientes.
            </div>
```

Reemplazar por:

```tsx
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-xs text-primary">
              <span className="font-bold">Modo RRHH:</span> Esta licencia no requiere aprobación del supervisor y se guardará directamente como <strong>Aprobada</strong> en el historial, descontando los saldos correspondientes.
            </div>
```

- [ ] **Step 5: Retemear el bloque de saldo disponible y la barra de progreso**

El archivo actual tiene (líneas 591-617):

```tsx
                {typeKey && tiposData[typeKey] && (
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{typeKey}</span>
                      <span className="text-xs text-gray-500">
                        {tiposData[typeKey].consumidos}/{tiposData[typeKey].diasTotales} consumidos
                      </span>
                    </div>
                    <ProgressBar
                      value={tiposData[typeKey].diasTotales > 0
                        ? (tiposData[typeKey].consumidos / tiposData[typeKey].diasTotales) * 100
                        : 0}
                      showValue={false}
                      style={{ height: 6 }}
                      color="#06b6d4"
                    />
                    <p className="text-xs text-cyan-600 mt-1 font-medium">
                      Disponibles: {tiposData[typeKey].disponibles} días
                    </p>
                  </div>
                )}
                {typeKey && !tiposData[typeKey] && (
                  <p className="text-center text-xs text-gray-400 py-4 border border-dashed rounded-xl">
                    No hay saldo disponible para esta categoría.
                  </p>
                )}
```

Reemplazar por:

```tsx
                {typeKey && tiposData[typeKey] && (
                  <div className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{typeKey}</span>
                      <span className="text-xs text-muted-foreground">
                        {tiposData[typeKey].consumidos}/{tiposData[typeKey].diasTotales} consumidos
                      </span>
                    </div>
                    <ProgressBar
                      value={tiposData[typeKey].diasTotales > 0
                        ? (tiposData[typeKey].consumidos / tiposData[typeKey].diasTotales) * 100
                        : 0}
                      showValue={false}
                      style={{ height: 6 }}
                      color="var(--primary)"
                    />
                    <p className="text-xs text-primary mt-1 font-medium">
                      Disponibles: {tiposData[typeKey].disponibles} días
                    </p>
                  </div>
                )}
                {typeKey && !tiposData[typeKey] && (
                  <p className="text-center text-xs text-muted-foreground py-4 border border-dashed border-border rounded-xl">
                    No hay saldo disponible para esta categoría.
                  </p>
                )}
```

- [ ] **Step 6: Retemear el bloque de rango de fechas (modo "corrido")**

El archivo actual tiene (líneas 621-651):

```tsx
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Periodo de Licencia</label>
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <Section>
                  <StepLabel n={1} label="Rango de fechas" />
                  {licenseMeta.mode === 'corrido' ? (
                    <div className="space-y-4">
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Esta licencia es de 90 días de corrido (calendario).
                      </p>
                      <div className="field">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha de Inicio</label>
                        <Calendar
                          value={startDate}
                          onChange={(e) => setStartDate(e.value as Date)}
                          inline
                          locale="es"
                          className="w-full"
                        />
                      </div>
                      {endDate && (
                        <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
                          <p className="text-xs font-semibold text-cyan-700">Período Calculado:</p>
                          <p className="text-sm text-cyan-800 font-bold">
                            {startDate?.toLocaleDateString()} al {endDate.toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-cyan-600 mt-1">90 días calendario automáticos.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <DateRangePicker onDateChange={handleDateChange} maxDays={maxDaysAvailable} />
                  )}
                </Section>
              </div>
            </div>
```

Reemplazar por:

```tsx
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Periodo de Licencia</label>
              <div className="border border-border rounded-lg p-2 bg-muted">
                <Section>
                  <StepLabel n={1} label="Rango de fechas" />
                  {licenseMeta.mode === 'corrido' ? (
                    <div className="space-y-4">
                      <p className="text-xs text-warning bg-warning-soft p-2 rounded-lg border border-border flex items-center gap-2">
                        <AlertCircle size={14} />
                        Esta licencia es de 90 días de corrido (calendario).
                      </p>
                      <div className="field">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Fecha de Inicio</label>
                        <Calendar
                          value={startDate}
                          onChange={(e) => setStartDate(e.value as Date)}
                          inline
                          locale="es"
                          className="w-full"
                        />
                      </div>
                      {endDate && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                          <p className="text-xs font-semibold text-primary">Período Calculado:</p>
                          <p className="text-sm text-primary font-bold">
                            {startDate?.toLocaleDateString()} al {endDate.toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-primary mt-1">90 días calendario automáticos.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <DateRangePicker onDateChange={handleDateChange} maxDays={maxDaysAvailable} />
                  )}
                </Section>
              </div>
            </div>
```

- [ ] **Step 7: Retemear la etiqueta de "Observaciones"**

El archivo actual tiene (línea 660):

```tsx
              <label className="text-sm font-semibold text-gray-700">Observaciones / Motivo</label>
```

Reemplazar por:

```tsx
              <label className="text-sm font-semibold text-foreground">Observaciones / Motivo</label>
```

- [ ] **Step 8: Retemear la tabla de historial de licencias**

El archivo actual tiene (líneas 673-748, la tabla completa con su badge de estado inline):

```tsx
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Inicio
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Fin
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Duración
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((lic: LicenseHistory) => (
                  <tr
                    key={lic.id}
                    onClick={() => onRowClick(lic)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {lic.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.startDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.endDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.duration} días
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${lic.status === "Aprobada"
                          ? "bg-green-100 text-green-800"
                          : lic.status === "Rechazada"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No hay historial de licencias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
```

Reemplazar por:

```tsx
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                  >
                    Inicio
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                  >
                    Fin
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                  >
                    Duración
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentItems.map((lic: LicenseHistory) => (
                  <tr
                    key={lic.id}
                    onClick={() => onRowClick(lic)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">
                      {lic.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {lic.startDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {lic.endDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {lic.duration} días
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${lic.status === "Aprobada"
                          ? "bg-success-soft text-success-soft-foreground"
                          : lic.status === "Rechazada"
                            ? "bg-error-soft text-error-soft-foreground"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay historial de licencias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
```

- [ ] **Step 9: Retemear `PermissionHistoryTab`**

El archivo actual tiene (líneas 772-839):

```tsx
  <div className="mt-4 flow-root">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Salida
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Retorno
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Horas Adeudadas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(permisos) && permisos.length > 0 ? (
                permisos.map((p, index) => (
                  <tr key={p.id ?? index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {formatDate(p.date) ?? "Sin fecha"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {decimalToTimeString(p.exitTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {decimalToTimeString(p.returnTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <HoursDisplay hours={p.hours ?? 0} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-sm text-gray-500 py-4"
                  >
                    No hay permisos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
```

Reemplazar por:

```tsx
  <div className="mt-4 flow-root">
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                >
                  Hora Salida
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                >
                  Hora Retorno
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                >
                  Horas Adeudadas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.isArray(permisos) && permisos.length > 0 ? (
                permisos.map((p, index) => (
                  <tr key={p.id ?? index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">
                      {formatDate(p.date) ?? "Sin fecha"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {decimalToTimeString(p.exitTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {decimalToTimeString(p.returnTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      <HoursDisplay hours={p.hours ?? 0} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-4"
                  >
                    No hay permisos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 10: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `DetailTables.tsx`.

- [ ] **Step 11: Commit**

```bash
git add src/app/Componentes/TablaOperador/DetailTables.tsx
git commit -m "feat: retheme DetailTables.tsx to organic-warm tokens"
```

---

### Task 8: Retemear LicenseModal.tsx

**Files:**
- Modify: `src/app/Componentes/ModalRRHH/LicenseModal.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear `ApplyLicenseModal`**

El archivo actual tiene (líneas 36-86):

```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Confirmar Licencia
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            <strong className="text-gray-600">Empleado:</strong> {employeeName}
          </p>
          <p>
            <strong className="text-gray-600">Mensaje:</strong>{" "}
            <span className="text-gray-700 italic">{message.text}</span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p>
              <strong className="text-blue-800">Días solicitados:</strong>{" "}
              {message.days}
            </p>
            <p>
              <strong className="text-blue-800">Fechas:</strong> del{" "}
              {message.startDate} al {message.endDate}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onApply(message)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Aplicar Licencia
          </button>
        </div>
      </div>
    </div>
```

Reemplazar por:

```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Confirmar Licencia
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            <strong className="text-muted-foreground">Empleado:</strong> {employeeName}
          </p>
          <p>
            <strong className="text-muted-foreground">Mensaje:</strong>{" "}
            <span className="text-foreground italic">{message.text}</span>
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p>
              <strong className="text-primary">Días solicitados:</strong>{" "}
              {message.days}
            </p>
            <p>
              <strong className="text-primary">Fechas:</strong> del{" "}
              {message.startDate} al {message.endDate}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onApply(message)}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Aplicar Licencia
          </button>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Retemear el header y el cartel "Empleado/a" de `PermissionModal`**

El archivo actual tiene (líneas 180-203):

```tsx
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Registrar Permiso de Salida
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
              disabled={isLoading}
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <strong className="text-gray-700">Empleado/a:</strong>{" "}
              <span className="text-gray-900">{employee.name}</span>
            </p>
```

Reemplazar por:

```tsx
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
            <h3 className="font-heading text-xl font-bold text-foreground">
              Registrar Permiso de Salida
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="bg-primary/10 p-3 rounded-md border border-primary/20">
              <strong className="text-foreground">Empleado/a:</strong>{" "}
              <span className="text-foreground">{employee.name}</span>
            </p>
```

- [ ] **Step 3: Retemear las etiquetas de los inputs de hora**

El archivo actual tiene (líneas 206-211 y 226-231, idénticas salvo el `htmlFor`/texto):

```tsx
              <label
                htmlFor="salida"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hora de Salida
              </label>
```

y

```tsx
              <label
                htmlFor="retorno"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hora de Retorno
              </label>
```

Reemplazar `text-gray-700` por `text-foreground` en **ambas**:

```tsx
              <label
                htmlFor="salida"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Hora de Salida
              </label>
```

```tsx
              <label
                htmlFor="retorno"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Hora de Retorno
              </label>
```

- [ ] **Step 4: Retemear los botones de `PermissionModal`**

El archivo actual tiene (líneas 246-273):

```tsx
            <Button
              type="button"
              label='Cancelar'
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              severity="secondary" text raised
            ></Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              text raised
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Guardar Permiso
                </>
              )}
            </Button>
```

Reemplazar por:

```tsx
            <Button
              type="button"
              label='Cancelar'
              onClick={onClose}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              severity="secondary" text raised
            ></Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              text raised
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Guardar Permiso
                </>
              )}
            </Button>
```

- [ ] **Step 5: Retemear `LicenseDetailModal` — header**

El archivo actual tiene (líneas 290-306):

```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div ref={printableRef}>
          <div className="flex justify-between items-start border-b pb-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Detalle de Licencia Aprobada
              </h3>
              <p className="text-sm text-gray-500">Comprobante de respaldo</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
```

Reemplazar por:

```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div ref={printableRef}>
          <div className="flex justify-between items-start border-b border-border pb-3 mb-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Detalle de Licencia Aprobada
              </h3>
              <p className="text-sm text-muted-foreground">Comprobante de respaldo</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
```

- [ ] **Step 6: Retemear las 4 tarjetas de detalle (Tipo, Estado, Período, Duración)**

El archivo actual tiene (líneas 308-348):

```tsx
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <User size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Tipo de Licencia</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.type}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Estado</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${license.status === "Aprobada"
                    ? "bg-green-100 text-green-800"
                    : license.status === "Rechazada"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {license.status}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Período</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.startDate} al {license.endDate}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Duración</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.duration} días hábiles</p>
              </div>
            </div>
```

Reemplazar por:

```tsx
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <User size={16} className="text-primary mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Tipo de Licencia</span>
                </div>
                <p className="text-foreground font-semibold">{license.type}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <CheckCircle size={16} className="text-success mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Estado</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${license.status === "Aprobada"
                    ? "bg-success-soft text-success-soft-foreground"
                    : license.status === "Rechazada"
                      ? "bg-error-soft text-error-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  {license.status}
                </span>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-warm-contrast mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Período</span>
                </div>
                <p className="text-foreground font-semibold">{license.startDate} al {license.endDate}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="text-accent mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Duración</span>
                </div>
                <p className="text-foreground font-semibold">{license.duration} días hábiles</p>
              </div>
            </div>
```

- [ ] **Step 7: Retemear el bloque "Respaldo de Aprobación" y los botones finales**

El archivo actual tiene (líneas 350-386):

```tsx
            {license.mensajeOriginal && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Respaldo de Aprobación
                </h4>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-sm text-gray-700 italic">{license.originalMessage}</p>
                  {license.startDate && license.endDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Fechas solicitadas:</strong> {license.startDate} al {license.endDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};
```

Reemplazar por:

```tsx
            {license.mensajeOriginal && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Respaldo de Aprobación
                </h4>
                <div className="bg-card p-3 rounded border border-border">
                  <p className="text-sm text-foreground italic">{license.originalMessage}</p>
                  {license.startDate && license.endDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Fechas solicitadas:</strong> {license.startDate} al {license.endDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-success text-success-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 8: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `LicenseModal.tsx`.

- [ ] **Step 9: Verificación visual manual**

Con `npm run dev` corriendo, ir a RRHH y confirmar: tabla de empleados (badges, saldo de horas, búsqueda/filtros), abrir el detalle de un empleado (3 tabs), ir a "Solicitudes de Licencias" (pendientes + historial), abrir el modal de aplicar licencia, el modal de permiso de salida, y el modal de detalle de licencia aprobada (incluyendo el botón de imprimir) — en modo claro y oscuro.

- [ ] **Step 10: Commit**

```bash
git add src/app/Componentes/ModalRRHH/LicenseModal.tsx
git commit -m "feat: retheme LicenseModal.tsx to organic-warm tokens"
```
