# Retema de Organigrama Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear el módulo Organigrama (árbol jerárquico visual + gestión de departamentos/oficinas/formularios) de la paleta gris/azul/genérica de Tailwind a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` (y una tabla de constantes de color) en 19 archivos existentes, agrupados en 8 tareas por área del módulo. Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (Dropdown/MultiSelect/InputNumber/InputTextarea/FloatLabel/Avatar/AvatarGroup/Dialog/Button/Card/Tree/SelectButton — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-24-retheme-organigrama-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado (`refreshDepartments`, `handleSave`, `handleOpenModal`, `useDepartmentTree`, `useFormDataOrg`, `useSkillManagement`, `OrgChartUtils.buildHierarchy`/`calculateStats`/`getNodeColors`/`getLevelLabel`).
- No se cambian firmas de componentes ni props.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `bg-secondary`/`text-secondary-foreground`, `bg-accent`/`text-accent-foreground`, `bg-warm-contrast`/`text-warm-contrast-foreground`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-warning`, `text-error`, `font-heading`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 3 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo(s)> a tokens organico-calido` o similar.

---

### Task 1: Paleta de niveles jerárquicos (`orgChart.constants.ts`)

**Files:**
- Modify: `src/app/Componentes/OrganigramaGraf/orgChart.constants.ts`

**Interfaces:**
- Consumes: nada (archivo de constantes puro).
- Produces: `NODE_COLORS`, `DEFAULT_NODE_COLOR`, `NODE_COLORS2`, `DEFAULT_NODE_COLOR2` — mismas claves (`bg`, `text`, `border`) y mismo tipo `NodeColors`, consumidos sin cambios por `OrgChartUtils.getNodeColors` (Task 2+ no toca esta lógica) y por `NodeCard.tsx`/`OrgLegend.tsx` (no se tocan, leen el objeto vía el util).

- [ ] **Step 1: Reemplazar `NODE_COLORS` y `DEFAULT_NODE_COLOR` (variante "Oscuro")**

Reemplazar en `src/app/Componentes/OrganigramaGraf/orgChart.constants.ts` (líneas 3-15):

Antes:
```ts
export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
  2: { bg: 'bg-teal-600',   text: 'text-white', border: 'border-teal-700' },
  3: { bg: 'bg-amber-500',  text: 'text-white', border: 'border-amber-600' },
  4: { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700' },
  5: { bg: 'bg-rose-600',   text: 'text-white', border: 'border-rose-700' }
};

export const DEFAULT_NODE_COLOR: NodeColors = { 
  bg: 'bg-slate-500', 
  text: 'text-white', 
  border: 'border-slate-600' 
};
```

Después:
```ts
export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: 'bg-primary',       text: 'text-primary-foreground',       border: 'border-primary' },
  2: { bg: 'bg-warm-contrast', text: 'text-warm-contrast-foreground', border: 'border-warm-contrast' },
  3: { bg: 'bg-accent',        text: 'text-accent-foreground',        border: 'border-accent' },
  4: { bg: 'bg-secondary',     text: 'text-secondary-foreground',     border: 'border-secondary' },
  5: { bg: 'bg-muted',         text: 'text-foreground',               border: 'border-muted' }
};

export const DEFAULT_NODE_COLOR: NodeColors = { 
  bg: 'bg-secondary', 
  text: 'text-secondary-foreground', 
  border: 'border-secondary' 
};
```

- [ ] **Step 2: Reemplazar `NODE_COLORS2` y `DEFAULT_NODE_COLOR2` (variante "Claro")**

Antes:
```ts
export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: 'bg-sky-200',    text: 'text-slate-800', border: 'border-sky-400' },
  2: { bg: 'bg-emerald-200', text: 'text-slate-800', border: 'border-emerald-400' },
  3: { bg: 'bg-orange-200', text: 'text-slate-800', border: 'border-orange-400' },
  4: { bg: 'bg-fuchsia-200',text: 'text-slate-800', border: 'border-fuchsia-400' },
  5: { bg: 'bg-red-200',    text: 'text-slate-800', border: 'border-red-400' }
};

export const DEFAULT_NODE_COLOR2: NodeColors = { 
  bg: 'bg-slate-200', 
  text: 'text-slate-800', 
  border: 'border-slate-400' 
};
```

Después:
```ts
export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: 'bg-primary/15',       text: 'text-foreground', border: 'border-primary/30' },
  2: { bg: 'bg-warm-contrast/15', text: 'text-foreground', border: 'border-warm-contrast/30' },
  3: { bg: 'bg-accent/15',        text: 'text-foreground', border: 'border-accent/30' },
  4: { bg: 'bg-secondary',        text: 'text-secondary-foreground', border: 'border-secondary' },
  5: { bg: 'bg-muted',            text: 'text-foreground', border: 'border-muted' }
};

export const DEFAULT_NODE_COLOR2: NodeColors = { 
  bg: 'bg-muted', 
  text: 'text-foreground', 
  border: 'border-border' 
};
```

`LEVEL_LABELS` (líneas 31-37) no cambia — son strings de texto, no clases de color.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `orgChart.constants.ts` (el tipo `NodeColors` solo exige 3 strings; los valores cambiaron pero el tipo no).

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/OrganigramaGraf/orgChart.constants.ts
git commit -m "feat: recolorear niveles jerarquicos del organigrama a tokens organico-calido"
```

---

### Task 2: Eliminar `dark:` en `OrganigramaGraf/` (6 archivos)

**Files:**
- Modify: `src/app/Componentes/OrganigramaGraf/OrgChart.tsx`
- Modify: `src/app/Componentes/OrganigramaGraf/OrgHeader.tsx`
- Modify: `src/app/Componentes/OrganigramaGraf/OrgStats.tsx`
- Modify: `src/app/Componentes/OrganigramaGraf/OrgLegend.tsx`
- Modify: `src/app/Componentes/OrganigramaGraf/ExpandButton.tsx`
- Modify: `src/app/Componentes/OrganigramaGraf/OrgChartNode.tsx`

**Interfaces:**
- Consumes: nada nuevo — estos componentes ya reciben `colorTheme`, `stats`, `levels`, `title`, `isOpen`, `onToggle`, `hasChildren`, `node` sin cambios (Task 1 ya retemeó los colores que consumen vía `OrgChartUtils.getNodeColors`).
- Produces: nada nuevo para tareas posteriores — son hojas visuales.

- [ ] **Step 1: `OrgChart.tsx` — fondo raíz y texto de ayuda**

Antes (línea 21):
```tsx
    <div className={`p-6 bg-gray-50 dark:bg-gray-900 min-h-screen ${className}`}>
```

Después:
```tsx
    <div className={`p-6 bg-background min-h-screen ${className}`}>
```

Antes (línea 46):
```tsx
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
```

Después:
```tsx
        <div className="mt-8 text-center text-sm text-muted-foreground">
```

- [ ] **Step 2: `OrgHeader.tsx` — título e ícono**

Antes (líneas 13-14):
```tsx
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-3">
      <Building2 size={32} className="text-blue-500" />
```

Después:
```tsx
    <h1 className="font-heading text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
      <Building2 size={32} className="text-primary" />
```

- [ ] **Step 3: `OrgStats.tsx` — texto de estadísticas**

Antes (línea 10):
```tsx
  <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
```

Después:
```tsx
  <div className="flex justify-center gap-6 text-sm text-muted-foreground">
```

- [ ] **Step 4: `OrgLegend.tsx` — caja, título y texto**

Antes (líneas 11-12):
```tsx
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
```

Después:
```tsx
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3 text-center">
```

Antes (línea 22):
```tsx
              <span className="text-xs text-gray-600 dark:text-gray-400">
```

Después:
```tsx
              <span className="text-xs text-muted-foreground">
```

- [ ] **Step 5: `ExpandButton.tsx` — fondo, borde, hover y focus ring**

Antes (líneas 20-22):
```tsx
      className="mt-2 p-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 
                 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
```

Después:
```tsx
      className="mt-2 p-2 bg-card border-2 border-border 
                 rounded-full hover:bg-muted transition-colors shadow-md
                 focus:outline-none focus:ring-2 focus:ring-primary"
```

- [ ] **Step 6: `OrgChartNode.tsx` — línea conectora**

Antes (línea 34):
```tsx
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-400 dark:bg-gray-500"></div>
```

Después:
```tsx
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-border"></div>
```

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 6 archivos.

Run: `grep -rn "dark:" src/app/Componentes/OrganigramaGraf/`
Expected: 0 resultados.

- [ ] **Step 8: Commit**

```bash
git add src/app/Componentes/OrganigramaGraf/OrgChart.tsx src/app/Componentes/OrganigramaGraf/OrgHeader.tsx src/app/Componentes/OrganigramaGraf/OrgStats.tsx src/app/Componentes/OrganigramaGraf/OrgLegend.tsx src/app/Componentes/OrganigramaGraf/ExpandButton.tsx src/app/Componentes/OrganigramaGraf/OrgChartNode.tsx
git commit -m "feat: eliminar variantes dark: y retemear OrganigramaGraf a tokens organico-calido"
```

---

### Task 3: `Screen.tsx` (pantalla raíz de Organigrama)

**Files:**
- Modify: `src/app/screens/Organigrama/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Fondo raíz y header**

Antes (líneas 134-142):
```tsx
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Gestión Organizacional
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la estructura de tu empresa.
          </p>
        </header>
```

Después:
```tsx
    <div className="bg-background font-sans min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Gestión Organizacional
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra la estructura de tu empresa.
          </p>
        </header>
```

- [ ] **Step 2: Tabs (borde de nav, activo e inactivo)**

Antes (líneas 145-169):
```tsx
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
  onClick={() => setActiveTab("gestion")}
  className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "gestion"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
>
  <LayoutGrid className="h-5 w-5 mr-2" />
  Gestión de Departamentos
</button>
            <button
              onClick={() => setActiveTab("organigrama")}
              className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "organigrama"
      ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7] text-shadow-md"
      : "text-gray-500 hover:text-blue-500 text-shadow-md"
  }`}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Organigrama
            </button>
          </nav>
        </div>
```

Después:
```tsx
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-6">
            <button
  onClick={() => setActiveTab("gestion")}
  className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "gestion"
      ? "border-b-2 border-primary text-primary text-shadow-md"
      : "text-muted-foreground hover:text-primary text-shadow-md"
  }`}
>
  <LayoutGrid className="h-5 w-5 mr-2" />
  Gestión de Departamentos
</button>
            <button
              onClick={() => setActiveTab("organigrama")}
              className={`flex items-center px-4 py-2 font-semibold transition-colors duration-200 ${
    activeTab === "organigrama"
      ? "border-b-2 border-primary text-primary text-shadow-md"
      : "text-muted-foreground hover:text-primary text-shadow-md"
  }`}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Organigrama
            </button>
          </nav>
        </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/Organigrama/Screen.tsx
git commit -m "feat: retemear Screen.tsx de Organigrama a tokens organico-calido"
```

---

### Task 4: Árbol de departamentos (`DepartmentTree`, `DepartmentTreeNode`, `EmptyState`)

**Files:**
- Modify: `src/app/Componentes/Orgamograma/DepartmentTree.tsx`
- Modify: `src/app/Componentes/Orgamograma/DepartmentTreeNode.tsx`
- Modify: `src/app/Componentes/Orgamograma/EmptyState.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: `DepartmentTree.tsx` — título**

Antes (línea 46):
```tsx
        <h2 className="text-xl font-bold text-gray-700">Departamentos</h2>
```

Después:
```tsx
        <h2 className="font-heading text-xl font-bold text-foreground">Departamentos</h2>
```

- [ ] **Step 2: `DepartmentTreeNode.tsx` — ícono y badge**

Antes (líneas 16, 21):
```tsx
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
```
```tsx
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
```

Después:
```tsx
        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
```
```tsx
          <span className="text-xs bg-primary/15 text-primary px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
```

- [ ] **Step 3: `EmptyState.tsx` — ícono, título y texto**

Antes (líneas 9-14):
```tsx
      <Building2 className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700">
        Selecciona un departamento
      </h2>
      <p className="text-gray-500 mt-2">
        Elige un departamento del panel izquierdo para ver sus detalles
      </p>
```

Después:
```tsx
      <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Selecciona un departamento
      </h2>
      <p className="text-muted-foreground mt-2">
        Elige un departamento del panel izquierdo para ver sus detalles
      </p>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 3 archivos.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Orgamograma/DepartmentTree.tsx src/app/Componentes/Orgamograma/DepartmentTreeNode.tsx src/app/Componentes/Orgamograma/EmptyState.tsx
git commit -m "feat: retemear arbol de departamentos a tokens organico-calido"
```

---

### Task 5: Cabecera e info del departamento (`DepartmentHeader`, `DepartmentInfo`)

**Files:**
- Modify: `src/app/Componentes/Orgamograma/DepartmentHeader.tsx`
- Modify: `src/app/Componentes/Orgamograma/DepartmentInfo.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: `DepartmentHeader.tsx` — título e ícono**

Antes (líneas 19-20):
```tsx
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Building2 className="w-8 h-8 mr-3 text-[#06B6D4]" />
```

Después:
```tsx
        <h2 className="font-heading text-3xl font-extrabold text-foreground flex items-center">
          <Building2 className="w-8 h-8 mr-3 text-primary" />
```

- [ ] **Step 2: `DepartmentInfo.tsx` — ícono, cards y texto**

Antes (líneas 18-20):
```tsx
      <Card className="bg-gray-50 p-4">
        <h4 className="font-bold mb-2 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
```

Después:
```tsx
      <Card className="bg-muted p-4">
        <h4 className="font-bold mb-2 flex items-center">
          <Star className="w-5 h-5 mr-2 text-warning" />
```

Antes (línea 32):
```tsx
            <span className="text-gray-500 italic">No asignado</span>
```

Después:
```tsx
            <span className="text-muted-foreground italic">No asignado</span>
```

Antes (línea 37):
```tsx
      <Card className="bg-gray-50 p-4">
```

Después:
```tsx
      <Card className="bg-muted p-4">
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 2 archivos.

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/Orgamograma/DepartmentHeader.tsx src/app/Componentes/Orgamograma/DepartmentInfo.tsx
git commit -m "feat: retemear cabecera e info de departamento a tokens organico-calido"
```

---

### Task 6: Detalle, oficinas y card de oficina (`DepartmentDetails`, `OfficesList`, `OfficeCard`)

**Files:**
- Modify: `src/app/Componentes/Orgamograma/DepartmentDetails.tsx`
- Modify: `src/app/Componentes/Orgamograma/OfficesList.tsx`
- Modify: `src/app/Componentes/Orgamograma/OfficeCard.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: `DepartmentDetails.tsx` — descripción, título, caja de empleados y chip**

Antes (línea 28):
```tsx
      <p className="text-gray-600 mb-6">
```

Después:
```tsx
      <p className="text-muted-foreground mb-6">
```

Antes (líneas 36-38):
```tsx
        <h3 className="text-xl font-bold mb-3 text-gray-800">Empleados del Departamento</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
```

Después:
```tsx
        <h3 className="font-heading text-xl font-bold mb-3 text-foreground">Empleados del Departamento</h3>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex flex-wrap gap-3">
```

Antes (líneas 43-45):
```tsx
                  key={emp.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200"
                >
```

Después:
```tsx
                  key={emp.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border"
                >
```

Antes (línea 55):
```tsx
              <p className="text-gray-500 italic">No hay empleados asignados directamente a este departamento.</p>
```

Después:
```tsx
              <p className="text-muted-foreground italic">No hay empleados asignados directamente a este departamento.</p>
```

- [ ] **Step 2: `OfficesList.tsx` — título y caja vacía**

Antes (línea 23):
```tsx
        <h3 className="text-2xl font-bold text-gray-800">
```

Después:
```tsx
        <h3 className="font-heading text-2xl font-bold text-foreground">
```

Antes (líneas 48-50):
```tsx
        <Card className="text-center py-8 border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            Este departamento no tiene oficinas asignadas.
          </p>
```

Después:
```tsx
        <Card className="text-center py-8 border-2 border-dashed border-border">
          <p className="text-muted-foreground">
            Este departamento no tiene oficinas asignadas.
          </p>
```

- [ ] **Step 3: `OfficeCard.tsx` — error fallback, fondo, título, ícono, descripción, botón editar, caja jefe, textos "no asignado" y avatar**

Antes (línea 18):
```tsx
    return <div className="text-red-500">Error: No se pudieron cargar los datos de empleados</div>;
```

Después:
```tsx
    return <div className="text-error">Error: No se pudieron cargar los datos de empleados</div>;
```

Antes (líneas 22, 25-26, 29):
```tsx
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-gray-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-[#06B6D4]" />
            {office.nombre}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{office.descripcion}</p>
        </div>
        <button
          onClick={() => onEdit("office", office)}
          className="text-gray-500 hover:text-blue-600 p-1"
        >
```

Después:
```tsx
    <div className="bg-muted border border-border rounded-lg p-4 mb-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-foreground flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-primary" />
            {office.nombre}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{office.descripcion}</p>
        </div>
        <button
          onClick={() => onEdit("office", office)}
          className="text-muted-foreground hover:text-primary p-1"
        >
```

Antes (líneas 41, 50, 60-61, 73):
```tsx
        <div className="flex items-center p-2 bg-white rounded-md">
```
```tsx
            <span className="text-sm text-gray-500 italic">No asignado</span>
```
```tsx
          <span className="text-sm text-gray-500 italic">
            Sin empleados asignados
          </span>
```
```tsx
                    className="w-6 h-6 rounded-full mr-3 border-2 border-gray-200"
```

Después:
```tsx
        <div className="flex items-center p-2 bg-card rounded-md">
```
```tsx
            <span className="text-sm text-muted-foreground italic">No asignado</span>
```
```tsx
          <span className="text-sm text-muted-foreground italic">
            Sin empleados asignados
          </span>
```
```tsx
                    className="w-6 h-6 rounded-full mr-3 border-2 border-border"
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 3 archivos.

Run: `grep -nE "gray-|blue-|red-|yellow-|#06B6D4" src/app/Componentes/Orgamograma/DepartmentDetails.tsx src/app/Componentes/Orgamograma/OfficesList.tsx src/app/Componentes/Orgamograma/OfficeCard.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Orgamograma/DepartmentDetails.tsx src/app/Componentes/Orgamograma/OfficesList.tsx src/app/Componentes/Orgamograma/OfficeCard.tsx
git commit -m "feat: retemear detalle de departamento y oficinas a tokens organico-calido"
```

---

### Task 7: Modal y campos básicos (`EntityFormModal`, `BasicFields`)

**Files:**
- Modify: `src/app/Componentes/Orgamograma/Componente/EntityFormModal.tsx`
- Modify: `src/app/Componentes/Orgamograma/Componente/BasicFields.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: `EntityFormModal.tsx` — caja del modal, botón cerrar, título**

Antes (líneas 31-32, 34-37, 40):
```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
```

Después:
```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">
```

(`bg-black bg-opacity-50` del overlay raíz queda igual — es un scrim, no una superficie del tema.)

- [ ] **Step 2: `BasicFields.tsx` — label "Nombre"**

Antes (línea 20):
```tsx
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre
        </label>
```

Después:
```tsx
        <label className="block text-sm font-medium text-foreground mb-2">
          Nombre
        </label>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 2 archivos.

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/Orgamograma/Componente/EntityFormModal.tsx src/app/Componentes/Orgamograma/Componente/BasicFields.tsx
git commit -m "feat: retemear modal de entidad y campos basicos a tokens organico-calido"
```

---

### Task 8: Campos de departamento/oficina, habilidades y acciones (`DepartmentFields`, `OfficeFields`, `SkillsField`, `FormActions`)

**Files:**
- Modify: `src/app/Componentes/Orgamograma/Componente/DepartmentFields.tsx`
- Modify: `src/app/Componentes/Orgamograma/Componente/OfficeFields.tsx`
- Modify: `src/app/Componentes/Orgamograma/Componente/SkillsField.tsx`
- Modify: `src/app/Componentes/Orgamograma/Componente/FormActions.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: `DepartmentFields.tsx` — 5 labels (`text-gray-700` → `text-foreground`)**

Las 5 ocurrencias idénticas a reemplazar (líneas 39, 57, 77, 99, 127):

Antes (cada una):
```tsx
        <label className="block text-sm font-medium text-gray-700 mb-2">
```

Después (cada una):
```tsx
        <label className="block text-sm font-medium text-foreground mb-2">
```

Las 5 labels son, en orden: "Nivel Jerárquico" (línea 39), "Depende de (Dpto. Padre)" (línea 57), "Jefe de Área" (línea 77), "Empleados del Departamento" (línea 99), "Empleados Seleccionados:" (línea 127). Reemplazar las 5.

- [ ] **Step 2: `OfficeFields.tsx` — 4 labels (`text-gray-700` → `text-foreground`)**

Las 4 ocurrencias idénticas a reemplazar (líneas 43, 65, 89, 116):

Antes (cada una):
```tsx
        <label className="block text-sm font-medium text-gray-700 mb-2">
```

Después (cada una):
```tsx
        <label className="block text-sm font-medium text-foreground mb-2">
```

Las 4 labels son, en orden: "Depende de (Dpto. Padre)" (línea 43), "Jefe de Oficina" (línea 65), "Empleados Asignados" (línea 89), "Empleados Seleccionados:" (línea 116). Reemplazar las 4.

- [ ] **Step 3: `SkillsField.tsx` — label "Habilidades Requeridas"**

Antes (línea 22):
```tsx
        <label className="block text-sm font-medium text-gray-700">
          Habilidades Requeridas
        </label>
```

Después:
```tsx
        <label className="block text-sm font-medium text-foreground">
          Habilidades Requeridas
        </label>
```

- [ ] **Step 4: `FormActions.tsx` — botones Cancelar y Guardar**

Antes (líneas 10-21):
```tsx
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Guardar Cambios
      </button>
```

Después:
```tsx
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-border transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
      >
        Guardar Cambios
      </button>
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en los 4 archivos.

Run: `grep -nE "gray-|blue-" src/app/Componentes/Orgamograma/Componente/DepartmentFields.tsx src/app/Componentes/Orgamograma/Componente/OfficeFields.tsx src/app/Componentes/Orgamograma/Componente/SkillsField.tsx src/app/Componentes/Orgamograma/Componente/FormActions.tsx`
Expected: 0 resultados.

- [ ] **Step 6: Commit**

```bash
git add src/app/Componentes/Orgamograma/Componente/DepartmentFields.tsx src/app/Componentes/Orgamograma/Componente/OfficeFields.tsx src/app/Componentes/Orgamograma/Componente/SkillsField.tsx src/app/Componentes/Orgamograma/Componente/FormActions.tsx
git commit -m "feat: retemear campos de formulario y acciones a tokens organico-calido"
```
