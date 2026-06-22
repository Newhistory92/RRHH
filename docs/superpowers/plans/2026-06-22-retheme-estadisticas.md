# Retema de Estadísticas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retematizar el módulo de Estadísticas (4 archivos + 1 util compartido) de la paleta gris/indigo hardcodeada actual a los tokens semánticos de la paleta "Orgánico Cálido" ya definidos en `globals.css`, migrando el componente `Card` de PrimeReact a shadcn/ui y retemeando el tema visual de PrimeReact para `DataTable`/`Dropdown`.

**Architecture:** Cambio puramente de presentación sobre componentes ya existentes — ninguna lógica de fetch, estado o estructura de datos cambia. Cada tarea reemplaza el contenido visual de un archivo a la vez, de la base (instalación + tokens compartidos) hacia los archivos hoja.

**Tech Stack:** Next.js 14, Tailwind v4 (tokens ya definidos en `globals.css`), shadcn/ui (componente `Card` nuevo a instalar), PrimeReact (tema `lara-light-pink`, `DataTable`/`Dropdown`/`ProgressSpinner` sin cambios de librería), recharts.

## Global Constraints

- No tocar lógica de fetch/estado (`fetchData`, `useEffect`, los hooks de cada componente) — solo JSX/clases/estilos.
- No migrar `DataTable`, `Column`, `Dropdown`, `ProgressSpinner` de PrimeReact a otra librería — siguen siendo PrimeReact, solo cambia su tema visual global.
- No corregir el bug preexistente de tipo implícito en `DetailModal.tsx` (parámetro `skill` sin tipo en el `.map` de softSkills) — no relacionado con este retema.
- Verificación: `npx tsc --noEmit` acotado a archivos tocados + verificación visual manual (no hay test suite automatizado para cambios puramente visuales).
- Todos los nombres de token usados (`--primary`, `--warm-contrast`, `--secondary`, `--muted`, `--accent`, `--color-success`, `--color-warning`, `--color-error`, `--popover`, `--card`, `--border`, `--foreground`, `--muted-foreground`) ya existen en `src/app/globals.css` desde las fases anteriores — ninguna tarea de este plan crea tokens nuevos.

---

### Task 1: Instalar Card de shadcn/ui + retemear PrimeReact

**Files:**
- Create: `src/components/ui/card.tsx` (generado por el CLI de shadcn)
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: componentes `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` desde `@/components/ui/card` — usados en las Tareas 4-6.

- [ ] **Step 1: Instalar el componente Card de shadcn**

```bash
npx shadcn@latest add card
```

- [ ] **Step 2: Cambiar el tema de PrimeReact**

Modify `src/app/page.tsx`. Reemplazar la línea:

```tsx
import "primereact/resources/themes/lara-light-cyan/theme.css";
```

por:

```tsx
import "primereact/resources/themes/lara-light-pink/theme.css";
```

- [ ] **Step 3: Agregar overrides de variables de PrimeReact**

Modify `src/app/globals.css`. Agregar al final del archivo (después del bloque `body { ... }` ya existente):

```css

:root {
  --primary-color: #E7717D;
  --primary-color-text: #FFFFFF;
}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` — confirmar que no hay errores nuevos en `page.tsx`/`globals.css`/`card.tsx`.

Run: `npm run dev` brevemente (arrancar, esperar "Ready", detener) para confirmar que no hay error de compilación con el nuevo import de tema.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/card.tsx src/app/page.tsx src/app/globals.css package.json package-lock.json
git commit -m "feat: install shadcn Card, retheme PrimeReact to lara-light-pink"
```

---

### Task 2: Simplificar getScoreColor a 3 niveles semánticos

**Files:**
- Modify: `src/app/util/UiRRHH.tsx`

**Interfaces:**
- Produces: `getScoreColor(score?: number): string` — misma firma que antes, retorna ahora `'bg-muted' | 'bg-success' | 'bg-warning' | 'bg-error'` en vez de los 5 valores anteriores. Consumida sin cambios por `Productivity.tsx` (Tarea 5) y `DetailModal.tsx` (Tarea 6) — ambas ya importan esta función, ninguna cambia su forma de llamarla.

- [ ] **Step 1: Reemplazar la función**

Modify `src/app/util/UiRRHH.tsx`. La función activa actual (línea ~962):

```ts
export const getScoreColor = (score?: number) => {
  if (score === undefined) return 'bg-gray-200';
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 7) return 'bg-lime-500';
  if (score >= 5) return 'bg-yellow-500';
  if (score >= 3) return 'bg-orange-500';
  return 'bg-red-500';
};
```

Reemplazar por:

```ts
export const getScoreColor = (score?: number) => {
  if (score === undefined) return 'bg-muted';
  if (score >= 7) return 'bg-success';
  if (score >= 5) return 'bg-warning';
  return 'bg-error';
};
```

No tocar el bloque comentado más arriba en el mismo archivo (líneas ~320-340, una versión vieja ya desactivada) — queda igual.

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `UiRRHH.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: simplify getScoreColor to 3 semantic tiers (success/warning/error)"
```

---

### Task 3: Retemear Screen.tsx

**Files:**
- Modify: `src/app/screens/Estadisticas/Screen.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva — solo cambia clases CSS dentro del JSX ya existente.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el estado de carga**

El archivo actual tiene (líneas 94-101):

```tsx
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Cargando datos estadísticos…</p>
      </div>
    );
  }
```

Reemplazar por:

```tsx
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Cargando datos estadísticos…</p>
      </div>
    );
  }
```

- [ ] **Step 2: Retemear el estado de error**

El archivo actual tiene (líneas 104-118):

```tsx
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
```

Reemplazar por:

```tsx
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="w-14 h-14 text-error" />
        <h2 className="text-xl font-bold text-foreground">No se pudieron cargar los datos</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <button
          onClick={() => fetchData(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }
```

- [ ] **Step 3: Retemear el contenedor raíz, header y botón de actualizar**

El archivo actual tiene (líneas 120-136):

```tsx
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
```

Reemplazar por:

```tsx
  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Panel Estadístico de Personal</h1>
            <p className="text-muted-foreground">Visualización y análisis de datos de empleados.</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            title="Actualizar datos"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline text-muted-foreground">Actualizar</span>
          </button>
        </header>
```

- [ ] **Step 4: Retemear las pestañas**

El archivo actual tiene (líneas 138-155):

```tsx
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
```

Reemplazar por:

```tsx
        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {([
              { id: 'ranking',  label: 'Ranking de Productividad', Icon: User },
              { id: 'globales', label: 'Estadísticas Globales',    Icon: BarChart2 },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
                  activeTab === id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}>
                <Icon className="mr-2 h-5 w-5" /> {label}
              </button>
            ))}
          </nav>
        </div>
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Screen.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/app/screens/Estadisticas/Screen.tsx
git commit -m "feat: retheme Estadisticas Screen.tsx to organic-warm tokens"
```

---

### Task 4: Retemear Globalstat.tsx

**Files:**
- Modify: `src/app/Componentes/ComponEstadistica/Globalstat.tsx`

**Interfaces:**
- Consumes: `Card`/`CardHeader`/`CardTitle`/`CardContent` desde `@/components/ui/card` (Tarea 1).
- Produces: ninguna interfaz nueva — `GlobalStatsProps` no cambia.

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

El archivo actual (`src/app/Componentes/ComponEstadistica/Globalstat.tsx`) tiene 107 líneas usando `Card` de `primereact/card` con la prop `title`. Reemplazar el archivo completo por:

```tsx
"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Award, Users, Frown, AlertTriangle, Clock } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalStatsData } from '@/app/Interfas/Interfaces';
import { ProgressSpinner } from 'primereact/progressspinner';

interface GlobalStatsProps {
  data: GlobalStatsData | null;
  isLoading: boolean;
  error: string | null;
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-error">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>Error al cargar las estadísticas globales: {error}</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { bestDepartment, lowEfficiencyActivities, avgAbsences, avgLateness, statusDistribution, departmentProductivity } = data;
  const PIE_COLORS = ['var(--primary)', 'var(--accent)', 'var(--warm-contrast)', 'var(--secondary)'];
  const departmentProductivityData = departmentProductivity;
  const tooltipStyle = { backgroundColor: 'var(--popover)', border: 'none', borderRadius: '0.5rem', color: 'var(--popover-foreground)' };
  const tooltipTextStyle = { color: 'var(--popover-foreground)' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        className="flex flex-col items-center justify-center text-center text-primary-foreground border-none"
        style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--warm-contrast))' }}
      >
        <CardHeader className="items-center">
          <Award className="h-12 w-12 opacity-80" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-primary-foreground">Mejor Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{bestDepartment.name}</p>
          <p className="text-lg font-medium opacity-90">Promedio: {bestDepartment.avg}</p>
        </CardContent>
      </Card>

      <Card
        className="flex flex-col items-center justify-center text-center border-none"
        style={{ background: 'linear-gradient(to bottom right, var(--secondary), var(--muted))' }}
      >
        <CardHeader className="items-center">
          <Frown className="h-12 w-12 opacity-80 text-foreground" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-foreground">Ausencias (Promedio/Año)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground">{avgAbsences}</p>
        </CardContent>
      </Card>

      <Card className="flex flex-col items-center justify-center bg-card">
        <CardHeader className="items-center">
          <Clock className="h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-muted-foreground">Tardanzas (Promedio/Año)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground">{avgLateness}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-10 w-10 text-warm-contrast" />
            Actividades de Baja Eficiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowEfficiencyActivities.length > 0 ? (
            <ul className="space-y-2">
              {lowEfficiencyActivities.map((act) => (
                <li key={act.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{act.name}</span>
                  <span className="font-bold text-error">{act.avg.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Todas las actividades tienen buena eficiencia.</p>}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-primary" />
            <span>Productividad Promedio por Departamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentProductivityData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} />
              <Legend />
              <Bar dataKey="productividad" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            <span>Distribución por Estado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="var(--primary)" dataKey="value" nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-(midAngle ?? 0) * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-(midAngle ?? 0) * (Math.PI / 180));
                  return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${((percent ?? 0) * 100).toFixed(0)}%`}</text>;
                }}>
                {statusDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
```

Nota: `fill="white"` dentro de la etiqueta del pie chart (el porcentaje sobre cada porción) se deja como literal — es texto que va siempre sobre porciones de color saturado (rosa/verde/marrón/beige), blanco mantiene legibilidad en los 4 casos; no es un color de fondo/superficie sujeto al tema.

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Globalstat.tsx`.

- [ ] **Step 3: Verificación visual manual**

Con `npm run dev` corriendo, ir a Estadísticas → pestaña "Estadísticas Globales" y confirmar: las 2 tarjetas superiores tienen gradiente rosa→marrón y beige→gris respectivamente, el gráfico de barras es rosa coral, el gráfico de torta usa las 4 colores de la paleta, los tooltips de ambos gráficos tienen fondo claro (no gris oscuro).

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/ComponEstadistica/Globalstat.tsx
git commit -m "feat: retheme Globalstat.tsx to organic-warm tokens, migrate Card to shadcn"
```

---

### Task 5: Retemear Productivity.tsx

**Files:**
- Modify: `src/app/Componentes/ComponEstadistica/Productivity.tsx`

**Interfaces:**
- Consumes: `Card`/`CardContent` desde `@/components/ui/card` (Tarea 1); `getScoreColor` desde `@/app/util/UiRRHH` (Tarea 2, firma sin cambios).
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Cambiar el import de Card**

El archivo actual tiene en la línea 10:

```tsx
import { Card } from 'primereact/card';
```

Reemplazar por:

```tsx
import { Card, CardContent } from '@/components/ui/card';
```

- [ ] **Step 2: Retemear el template de empleado**

El archivo actual tiene (líneas 120-132):

```tsx
  const employeeBodyTemplate = (employee: Employee) => {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold">
          {employee.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{employee.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{formatDisplayValue((employee as any).department)}</p>
        </div>
      </div>
    );
  };
```

Reemplazar por:

```tsx
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
```

- [ ] **Step 3: Retemear el template de productividad**

El archivo actual tiene (líneas 135-144):

```tsx
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
```

Reemplazar por:

```tsx
  const productivityBodyTemplate = (employee: Employee) => {
    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${getScoreColor(employee.productivityScore)}`}></div>
        <span className="font-bold text-lg text-foreground">
          {employee.productivityScore.toFixed(1)}
        </span>
      </div>
    );
  };
```

- [ ] **Step 4: Retemear el header con sort**

El archivo actual tiene (líneas 147-161):

```tsx
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
```

Reemplazar la última línea (`<ChevronDown className="ml-1 h-4 w-4 text-gray-300" />`) por:

```tsx
        ) : <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />}
```

- [ ] **Step 5: Retemear el mensaje vacío**

El archivo actual tiene (líneas 164-172):

```tsx
  const emptyMessageTemplate = () => {
    return (
      <div className="text-center py-12">
        <Filter className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sin resultados</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ajusta los filtros para encontrar empleados.</p>
      </div>
    );
  };
```

Reemplazar por:

```tsx
  const emptyMessageTemplate = () => {
    return (
      <div className="text-center py-12">
        <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">Sin resultados</h3>
        <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros para encontrar empleados.</p>
      </div>
    );
  };
```

- [ ] **Step 6: Retemear el título y envolver el contenido en CardContent**

El archivo actual tiene (líneas 176-183 y 252-259, el wrapper completo):

```tsx
  return (
    <Card className="col-span-1 lg:col-span-3">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex-shrink-0 mr-4">
            Ranking de Productividad
          </h2>
```

y, al final del componente:

```tsx
            <Pagination 
                totalItems={sortedEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </Card>
    );
};
```

Reemplazar la apertura por:

```tsx
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardContent>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-foreground flex-shrink-0 mr-4">
            Ranking de Productividad
          </h2>
```

Y el cierre por:

```tsx
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
```

(Todo el contenido entre la apertura y el cierre — los `Dropdown`, el `DataTable` con sus `Column`s — queda exactamente igual, solo se agregan las etiquetas `<CardContent>`/`</CardContent>` alrededor.)

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `Productivity.tsx`.

- [ ] **Step 8: Commit**

```bash
git add src/app/Componentes/ComponEstadistica/Productivity.tsx
git commit -m "feat: retheme Productivity.tsx to organic-warm tokens, migrate Card to shadcn"
```

---

### Task 6: Retemear DetailModal.tsx

**Files:**
- Modify: `src/app/Componentes/ComponEstadistica/DetailModal.tsx`

**Interfaces:**
- Consumes: `Card`/`CardHeader`/`CardTitle`/`CardContent` desde `@/components/ui/card` (Tarea 1); `getScoreColor` desde `@/app/util/UiRRHH` (Tarea 2, firma sin cambios).
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

El archivo actual (`src/app/Componentes/ComponEstadistica/DetailModal.tsx`) tiene 343 líneas usando `Card` de `primereact/card` con la prop `title` en 6 lugares. Reemplazar el archivo completo por:

```tsx
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {getScoreColor, SoftSkillBar } from '@/app/util/UiRRHH';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, } from 'recharts';
import {  X,  BarChart2, Star,  Briefcase, Calendar, MessageSquareWarning, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/app/Interfas/Interfaces';
import { useEffect, useState } from 'react';
export const EmployeeDetailModal: React.FC<{
  employee: Employee | null;
  onClose: () => void;
}> = ({ employee, onClose }) => {

  const [remoteEmployee, setRemoteEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // Hooks SIEMPRE arriba
  useEffect(() => {
    
    if (!employee) {
      return;
    }

    if (!employee.id) {
      return;
    }

    const controller = new AbortController();

    const fetchEmployee = async () => {
      try {

        setLoading(true);
        setError(null);

        const url = `http://127.0.0.1:8000/employee/${employee.id}`;

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        setRemoteEmployee(data);

      } catch {
        if (controller.signal.aborted) {
          console.log("⚠️ Fetch abortado");
        } else {
          console.error("❌ Error al cargar empleado remoto:", error);
          setError("No se pudieron cargar los datos remotos.");
        }
      } finally {

        setLoading(false);
      }
    };

    fetchEmployee();

  }, [employee]);

  if (!employee) {
    return null;
  }

const currentYear = String(new Date().getFullYear());
const tooltipStyle = { backgroundColor: 'var(--popover)', border: 'none', borderRadius: '0.5rem', color: 'var(--popover-foreground)' };
const tooltipTextStyle = { color: 'var(--popover-foreground)' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={24} />
        </button>

        <div className="p-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center mb-6">

            <div className={`p-2 rounded-full ${getScoreColor(remoteEmployee?.productivityScore)} mr-6`}>
              <div className="bg-card rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-foreground">
                {remoteEmployee?.productivityScore.toFixed(1)}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">
                 {remoteEmployee?.name}
              </h2>

              <p className="text-lg text-muted-foreground">
    {remoteEmployee?.department?.nombre ?? "Depende Directamente"}
    {" / "}
    {remoteEmployee?.office?.nombre ?? "Depende Directamente"}
  </p>

  <p className="text-sm text-primary font-semibold">
    Categoría: {remoteEmployee?.condicionLaboral?.categoria ?? "-"}
    {" • "}
    {remoteEmployee?.licenciaActiva?.status ?? "-"}
  </p>

              {loading && (
                <p className="text-sm text-primary mt-2">
                  Cargando datos...
                </p>
              )}

              {error && (
                <p className="text-sm text-error mt-2">
                  {error}
                </p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Horas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="text-primary" />
                  Horas a Favor/Contra por Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={250}>

                <BarChart
                  data={remoteEmployee?.monthlyHours || []}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipTextStyle}
                    itemStyle={tooltipTextStyle}
                  />

                  <Bar dataKey="hours" name="Horas">

                    {(remoteEmployee?.monthlyHours || []).map(
                      (entry: { hours: number }, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.hours >= 0 ? 'var(--color-success)' : 'var(--color-error)'}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="text-warm-contrast" />
                  Feedback del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>

              {(remoteEmployee?.softSkills || []).length > 0 ? (
                (remoteEmployee?.softSkills || []).map(
                  (skill, index: number) => (
                    <SoftSkillBar
                      key={index}
                      skill={skill.nombre}
                      score={skill.level}
                    />
                  )
                )
              ) : (
                <p className="text-muted-foreground">
                  Sin feedback registrado.
                </p>
              )}

              </CardContent>
            </Card>

            {/* Productividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="text-accent" />
                  Productividad por Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>

              {(remoteEmployee?.tasks || []).length > 0 ? (
                <ul>

                  {(remoteEmployee?.tasks || []).map(
                    (task: { name: string; productivity: number }) => (

                      <li
                        key={task.name}
                        className="flex justify-between items-center py-2 border-b border-border"
                      >
                        <span className="text-muted-foreground">
                          {task.name}
                        </span>

                        <span className={`font-bold px-2 py-1 rounded-md text-white text-sm ${getScoreColor(task.productivity)}`}>
                          {task.productivity.toFixed(1)}
                        </span>
                      </li>

                    )
                  )}

                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Sin tareas registradas.
                </p>
              )}

              </CardContent>
            </Card>

            {/* Licencias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="text-primary" />
                  Licencias y Faltas (Anual)
                </CardTitle>
              </CardHeader>
              <CardContent>

              <div className="space-y-4">

                <div>
                  <p className="text-muted-foreground">
                    Licencias tomadas
                  </p>

                  <p className="text-2xl font-bold text-foreground">
  {remoteEmployee?.licenses?.[currentYear] || 0}
  <span className="text-base font-normal text-muted-foreground">
    {' '}en {currentYear}
  </span>
</p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Faltas
                  </p>

                  <p className="text-2xl font-bold text-foreground">
                    {remoteEmployee?.absences?.['2024'] || 0}
                    <span className="text-base font-normal text-muted-foreground">
                      {' '}en 2024
                    </span>
                  </p>
                </div>

              </div>

              </CardContent>
            </Card>

            {/* Quejas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareWarning className="text-error" />
                  Quejas Recibidas
                </CardTitle>
              </CardHeader>
              <CardContent>

              <p className="text-4xl font-bold text-error mb-2">
                {(remoteEmployee?.complaints || []).length}
              </p>

              {(remoteEmployee?.complaints || []).length > 0 ? (

                <ul className="list-disc list-inside text-muted-foreground space-y-1">

                  {(remoteEmployee?.complaints || []).map(
                    (c: { id: string | number; reason: string }) => (
                      <li key={c.id}>
                        {c.reason}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p className="text-muted-foreground">
                  Sin quejas registradas.
                </p>

              )}

              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
};
```

Nota: el parámetro `skill` en el `.map` de `softSkills` (sección Feedback) sigue sin tipo explícito — es el bug preexistente mencionado en el Global Constraints, no se toca en este plan. El `text-white` en la insignia de productividad por tarea (sección Productividad) se mantiene literal — `getScoreColor` solo retorna la clase de fondo (Tarea 2), no hay un sistema de texto-emparejado en este plan; blanco sobre los 3 tonos success/warning/error (verde/ámbar/rojo) mantiene legibilidad aceptable.

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar que no hay errores NUEVOS en `DetailModal.tsx` (el error preexistente de tipo implícito en el parámetro `skill` seguirá apareciendo — es el mismo de antes, no uno nuevo introducido por este cambio).

- [ ] **Step 3: Verificación visual manual**

Con `npm run dev` corriendo, ir a Estadísticas → pestaña "Ranking de Productividad" → click en una fila para abrir el modal de detalle. Confirmar que las 6 tarjetas usan el nuevo estilo (sombra suave, bordes redondeados), los íconos tienen los colores de la paleta, y el gráfico de horas usa verde/rojo semánticos para horas positivas/negativas.

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/ComponEstadistica/DetailModal.tsx
git commit -m "feat: retheme DetailModal.tsx to organic-warm tokens, migrate Card to shadcn"
```
