# Retema de ConfiguracionLicencias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear la pantalla de Configuración General (5 tabs + 4 modales en `Screen.tsx`) y `SoftSkills.tsx` de la paleta índigo/gris/genérica de Tailwind a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` en 2 archivos existentes, agrupados en 7 tareas (6 para `Screen.tsx`, dividido por tab/grupo de modales, y 1 para `SoftSkills.tsx`). Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (Card/InputText/InputTextarea/Button en `SoftSkills.tsx` — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-24-retheme-configuracion-licencias-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `loadAllData`, `handleSaveLicencia`/`handleSaveContract`/`handleSaveProfession`/`handleSaveJornada`, `handleDeleteLicencia`/`handleDeleteContract`/`handleDeleteProfession`/`handleDeleteJornada`, `handleAddSoftSkill`/`handleDeleteSoftSkill`, `sortedLicencias`, `toggleSort`.
- No se cambian firmas de componentes ni props.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-error`, `bg-error-soft`/`text-error-soft-foreground`, `bg-success-soft`/`text-success-soft-foreground`, `font-heading`.
- El overlay de los 4 modales (`bg-gray-900/60 backdrop-blur-sm`) y el `border rounded-xl` genérico de inputs/selects/textareas nativos quedan sin cambios (no son colores de marca).
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 5 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo(s)> a tokens organico-calido` o similar.

---

### Task 1: Toast, header y tabs (`Screen.tsx`)

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `TabButton` — misma firma `{ id, label, icon }`, solo cambian las clases CSS dentro del componente. Consumido sin cambios por las 5 invocaciones existentes en el `<nav>` (no se tocan en esta tarea).

- [ ] **Step 1: Notificación toast**

Antes (líneas 327-334):
```tsx
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
                    notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}
```

Después:
```tsx
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
                    notification.type === 'success' ? 'bg-success-soft border-success text-success-soft-foreground' : 'bg-error-soft border-error text-error-soft-foreground'
                }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}
```

- [ ] **Step 2: Fondo raíz y header**

Antes (líneas 326, 336-347):
```tsx
        <div className="min-h-screen bg-gray-100 p-6 font-sans antialiased text-gray-900">
```
```tsx
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Settings className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuración General</h1>
                        <p className="text-gray-500 text-sm">Parámetros globales del sistema de Recursos Humanos</p>
                    </div>
                </div>
            </div>
```

Después:
```tsx
        <div className="min-h-screen bg-background p-6 font-sans antialiased text-foreground">
```
```tsx
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                        <Settings className="text-primary-foreground" size={28} />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">Configuración General</h1>
                        <p className="text-muted-foreground text-sm">Parámetros globales del sistema de Recursos Humanos</p>
                    </div>
                </div>
            </div>
```

Nota: `<Settings className="text-white" size={28} />` aparece dos veces de forma idéntica en el archivo (una vez aquí en el header, en JSX directo — no confundir con el ícono pasado como prop `icon={Settings}` al `TabButton` de la línea 352, que NO se toca en esta tarea).

- [ ] **Step 3: Caja de tabs y `TabButton`**

Antes (líneas 150-164, 350-357):
```tsx
    const TabButton = ({ id, label, icon: Icon }: { id: TabId, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(id); setSearchTerm(""); }}
            className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
```
```tsx
            {/* Tabs Navigation */}
            <div className="max-w-7xl mx-auto mb-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <nav className="flex space-x-1 overflow-x-auto">
```

Después:
```tsx
    const TabButton = ({ id, label, icon: Icon }: { id: TabId, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(id); setSearchTerm(""); }}
            className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
```
```tsx
            {/* Tabs Navigation */}
            <div className="max-w-7xl mx-auto mb-6 bg-card border border-border rounded-xl p-1 shadow-sm">
                <nav className="flex space-x-1 overflow-x-auto">
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear toast, header y tabs de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 2: Tab "Licencias" (tabla de cupos)

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: `TabButton` ya retemado por Task 1 — no se vuelve a tocar su definición.
- Produces: nada nuevo.

- [ ] **Step 1: Estado de carga (loading)**

Antes (líneas 362-366):
```tsx
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="text-gray-400 font-medium animate-pulse">Cargando datos...</p>
                    </div>
                ) : (
```

Después:
```tsx
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-card rounded-2xl border border-border shadow-sm">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-muted-foreground font-medium animate-pulse">Cargando datos...</p>
                    </div>
                ) : (
```

- [ ] **Step 2: Caja del panel principal**

Antes (línea 368):
```tsx
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
```

Después:
```tsx
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6">
```

- [ ] **Step 3: Header del tab, búsqueda y botón "Nueva Regla"**

Antes (líneas 373-396):
```tsx
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Cupos de Licencias Anuales</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar regla..."
                                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-60"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setLicenciaForm({ anio: new Date().getFullYear(), tipo: contracts[0]?.key || "", categoria: "", diasTotales: 5 });
                                                setIsEditingLicencia(false);
                                                setShowLicenciaModal(true);
                                            }}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <Plus size={16} /> Nueva Regla
                                        </button>
                                    </div>
                                </div>
```

Después:
```tsx
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="font-heading text-lg font-bold text-foreground">Cupos de Licencias Anuales</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar regla..."
                                                className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-60"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setLicenciaForm({ anio: new Date().getFullYear(), tipo: contracts[0]?.key || "", categoria: "", diasTotales: 5 });
                                                setIsEditingLicencia(false);
                                                setShowLicenciaModal(true);
                                            }}
                                            className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <Plus size={16} /> Nueva Regla
                                        </button>
                                    </div>
                                </div>
```

- [ ] **Step 4: Header de tabla, `SortIcon` y filas**

Antes (líneas 400-444):
```tsx
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('anio')}>
                                                    <div className="flex items-center">Año <SortIcon field="anio" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('tipo')}>
                                                    <div className="flex items-center">Contrato / Perfil <SortIcon field="tipo" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('categoria')}>
                                                    <div className="flex items-center">Tipo de Licencia <SortIcon field="categoria" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('diasTotales')}>
                                                    <div className="flex items-center justify-center">Cupo <SortIcon field="diasTotales" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {sortedLicencias.length > 0 ? sortedLicencias.map((config) => (
                                                <tr key={config.id} className="hover:bg-gray-50/50 group">
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{config.anio}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                                            {contracts.find(c => c.key === config.tipo)?.nombre || config.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-700">{config.categoria}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600 border border-gray-200">
                                                            {config.diasTotales} {config.diasTotales === 1 ? 'día' : 'días'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setLicenciaForm(config); setIsEditingLicencia(true); setShowLicenciaModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteLicencia(config.id)} className="p-2 text-gray-400 hover:text-red-600" title="Eliminar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-gray-400 italic">No se encontraron reglas configuradas.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
```

Después:
```tsx
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted border-b border-border uppercase tracking-wider text-[10px] text-muted-foreground font-bold">
                                                <th className="px-6 py-4 cursor-pointer hover:text-primary" onClick={() => toggleSort('anio')}>
                                                    <div className="flex items-center">Año <SortIcon field="anio" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-primary" onClick={() => toggleSort('tipo')}>
                                                    <div className="flex items-center">Contrato / Perfil <SortIcon field="tipo" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-primary" onClick={() => toggleSort('categoria')}>
                                                    <div className="flex items-center">Tipo de Licencia <SortIcon field="categoria" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => toggleSort('diasTotales')}>
                                                    <div className="flex items-center justify-center">Cupo <SortIcon field="diasTotales" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border text-sm">
                                            {sortedLicencias.length > 0 ? sortedLicencias.map((config) => (
                                                <tr key={config.id} className="hover:bg-muted group">
                                                    <td className="px-6 py-4 text-muted-foreground font-medium">{config.anio}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                                                            {contracts.find(c => c.key === config.tipo)?.nombre || config.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-foreground">{config.categoria}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-mono bg-muted px-2.5 py-1 rounded text-foreground border border-border">
                                                            {config.diasTotales} {config.diasTotales === 1 ? 'día' : 'días'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setLicenciaForm(config); setIsEditingLicencia(true); setShowLicenciaModal(true); }} className="p-2 text-muted-foreground hover:text-primary" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteLicencia(config.id)} className="p-2 text-muted-foreground hover:text-error" title="Eliminar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-muted-foreground italic">No se encontraron reglas configuradas.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
```

- [ ] **Step 5: `SortIcon`**

Antes (líneas 309-312):
```tsx
    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-300" />;
        return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 text-indigo-500" /> : <ArrowDown size={14} className="ml-1 text-indigo-500" />;
    };
```

Después:
```tsx
    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-muted-foreground" />;
        return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 text-primary" /> : <ArrowDown size={14} className="ml-1 text-primary" />;
    };
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear tab Licencias de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 3: Tab "Contratos" (cards de tipos de contrato)

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Header del tab y botón "Nuevo Contrato"**

Antes (líneas 453-461):
```tsx
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Tipos de Contrato Disponibles</h2>
                                    <button
                                        onClick={() => { setContractForm({ nombre: "", key: "", descripcion: "" }); setIsEditingContract(false); setShowContractModal(true); }}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nuevo Contrato
                                    </button>
                                </div>
```

Después:
```tsx
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-heading text-lg font-bold text-foreground">Tipos de Contrato Disponibles</h2>
                                    <button
                                        onClick={() => { setContractForm({ nombre: "", key: "", descripcion: "" }); setIsEditingContract(false); setShowContractModal(true); }}
                                        className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nuevo Contrato
                                    </button>
                                </div>
```

- [ ] **Step 2: Card de contrato**

Antes (líneas 463-477):
```tsx
                                    {contracts.map(c => (
                                        <div key={c.id} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-gray-900">{c.nombre}</h3>
                                                    <span className="px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 rounded-md font-mono font-bold uppercase">{c.key}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{c.descripcion || 'Sin descripción disponible.'}</p>
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                                <button onClick={() => { setContractForm(c); setIsEditingContract(true); setShowContractModal(true); }} className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-all font-semibold"><Edit2 size={12} /> Editar</button>
                                                <button onClick={() => c.id && handleDeleteContract(c.id)} className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-all font-semibold"><Trash2 size={12} /> Desactivar</button>
                                            </div>
                                        </div>
                                    ))}
```

Después:
```tsx
                                    {contracts.map(c => (
                                        <div key={c.id} className="p-5 border border-border rounded-2xl bg-card shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-foreground">{c.nombre}</h3>
                                                    <span className="px-2 py-0.5 text-[9px] bg-primary/15 text-primary rounded-md font-mono font-bold uppercase">{c.key}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{c.descripcion || 'Sin descripción disponible.'}</p>
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-border pt-3">
                                                <button onClick={() => { setContractForm(c); setIsEditingContract(true); setShowContractModal(true); }} className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-all font-semibold"><Edit2 size={12} /> Editar</button>
                                                <button onClick={() => c.id && handleDeleteContract(c.id)} className="flex items-center gap-1 text-xs text-error hover:bg-error-soft px-2 py-1 rounded-md transition-all font-semibold"><Trash2 size={12} /> Desactivar</button>
                                            </div>
                                        </div>
                                    ))}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear tab Contratos de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 4: Tab "Profesiones" y Tab "Horarios"

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Tab Profesiones — header y tabla**

Antes (líneas 485-522):
```tsx
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Catálogo de Profesiones y Cargos</h2>
                                    <button
                                        onClick={() => { setProfessionForm({ nombre: "", descripcion: "" }); setIsEditingProfession(false); setShowProfessionModal(true); }}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nueva Profesión
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
                                                <th className="px-6 py-4">Profesión / Cargo</th>
                                                <th className="px-6 py-4">Descripción</th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {professions.length > 0 ? professions.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 group">
                                                    <td className="px-6 py-4 font-bold text-gray-700">{p.nombre}</td>
                                                    <td className="px-6 py-4 text-gray-500">{p.descripcion || 'Sin descripción.'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setProfessionForm(p); setIsEditingProfession(true); setShowProfessionModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => p.id && handleDeleteProfession(p.id)} className="p-2 text-gray-400 hover:text-red-600" title="Desactivar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-gray-400 italic">No hay profesiones cargadas en el sistema.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
```

Después:
```tsx
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-heading text-lg font-bold text-foreground">Catálogo de Profesiones y Cargos</h2>
                                    <button
                                        onClick={() => { setProfessionForm({ nombre: "", descripcion: "" }); setIsEditingProfession(false); setShowProfessionModal(true); }}
                                        className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nueva Profesión
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted border-b border-border uppercase tracking-wider text-[10px] text-muted-foreground font-bold">
                                                <th className="px-6 py-4">Profesión / Cargo</th>
                                                <th className="px-6 py-4">Descripción</th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border text-sm">
                                            {professions.length > 0 ? professions.map(p => (
                                                <tr key={p.id} className="hover:bg-muted group">
                                                    <td className="px-6 py-4 font-bold text-foreground">{p.nombre}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{p.descripcion || 'Sin descripción.'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setProfessionForm(p); setIsEditingProfession(true); setShowProfessionModal(true); }} className="p-2 text-muted-foreground hover:text-primary" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => p.id && handleDeleteProfession(p.id)} className="p-2 text-muted-foreground hover:text-error" title="Desactivar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-muted-foreground italic">No hay profesiones cargadas en el sistema.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
```

- [ ] **Step 2: Tab Horarios — jornadas laborales**

Antes (líneas 539-562):
```tsx
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800">Jornadas Laborales (Contratos vs Horas)</h3>
                                        <button
                                            onClick={() => { setJornadaForm({ nombre: "", horasDia: 8 }); setIsEditingJornada(false); setShowJornadaModal(true); }}
                                            className="flex items-center gap-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <Plus size={14} /> Nueva Jornada
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {jornadas.map(j => (
                                            <div key={j.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{j.nombre}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">{j.horasDia} hrs/día</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => { setJornadaForm(j); setIsEditingJornada(true); setShowJornadaModal(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                                                    <button onClick={() => j.id && handleDeleteJornada(j.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
```

Después:
```tsx
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-heading font-bold text-foreground">Jornadas Laborales (Contratos vs Horas)</h3>
                                        <button
                                            onClick={() => { setJornadaForm({ nombre: "", horasDia: 8 }); setIsEditingJornada(false); setShowJornadaModal(true); }}
                                            className="flex items-center gap-1.5 text-primary hover:bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <Plus size={14} /> Nueva Jornada
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {jornadas.map(j => (
                                            <div key={j.id} className="p-4 border border-border rounded-xl bg-muted flex items-center justify-between shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm">{j.nombre}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 font-mono">{j.horasDia} hrs/día</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => { setJornadaForm(j); setIsEditingJornada(true); setShowJornadaModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary"><Edit2 size={14} /></button>
                                                    <button onClick={() => j.id && handleDeleteJornada(j.id)} className="p-1.5 text-muted-foreground hover:text-error"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear tabs Profesiones y Horarios de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 5: Modal Licencia y Modal Contrato

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Modal Licencia**

Antes (líneas 573-613):
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLicenciaModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingLicencia ? 'Editar Regla de Licencia' : 'Nueva Regla Anual'}</h3>
                            <button onClick={() => setShowLicenciaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveLicencia} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Año Fiscal</label>
                                    <input type="number" required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.anio} onChange={e => setLicenciaForm({ ...licenciaForm, anio: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Días Totales</label>
                                    <input type="number" required min="0" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.diasTotales || 0} onChange={e => setLicenciaForm({ ...licenciaForm, diasTotales: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Contrato</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.tipo} onChange={e => setLicenciaForm({ ...licenciaForm, tipo: e.target.value })}>
                                    <option value="">Seleccionar tipo</option>
                                    {contracts.map(c => <option key={c.key} value={c.key}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Licencia</label>
                                <input list="license-types" required placeholder="Ej: Particular, Vacaciones" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.categoria} onChange={e => setLicenciaForm({ ...licenciaForm, categoria: e.target.value })} />
                                <datalist id="license-types">
                                    {TIPOS_LICENCIA_DEFAULT.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowLicenciaModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

Después:
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLicenciaModal(false)} />
                    <div className="relative bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
                            <h3 className="font-heading text-lg font-bold text-foreground">{isEditingLicencia ? 'Editar Regla de Licencia' : 'Nueva Regla Anual'}</h3>
                            <button onClick={() => setShowLicenciaModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveLicencia} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Año Fiscal</label>
                                    <input type="number" required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.anio} onChange={e => setLicenciaForm({ ...licenciaForm, anio: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Días Totales</label>
                                    <input type="number" required min="0" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.diasTotales || 0} onChange={e => setLicenciaForm({ ...licenciaForm, diasTotales: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Tipo de Contrato</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.tipo} onChange={e => setLicenciaForm({ ...licenciaForm, tipo: e.target.value })}>
                                    <option value="">Seleccionar tipo</option>
                                    {contracts.map(c => <option key={c.key} value={c.key}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Nombre de la Licencia</label>
                                <input list="license-types" required placeholder="Ej: Particular, Vacaciones" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.categoria} onChange={e => setLicenciaForm({ ...licenciaForm, categoria: e.target.value })} />
                                <datalist id="license-types">
                                    {TIPOS_LICENCIA_DEFAULT.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowLicenciaModal(false)} className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

- [ ] **Step 2: Modal Contrato**

Antes (líneas 617-644):
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowContractModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingContract ? 'Editar Contrato' : 'Nuevo Tipo de Contrato'}</h3>
                            <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveContract} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Contrato</label>
                                <input type="text" required placeholder="Ej: Contrato Eventual" className="w-full px-3 py-2 border rounded-xl" value={contractForm.nombre} onChange={e => setContractForm({ ...contractForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Clave de Referencia (Key)</label>
                                <input type="text" required placeholder="Ej: eventual" disabled={isEditingContract} className="w-full px-3 py-2 border rounded-xl disabled:bg-gray-100" value={contractForm.key} onChange={e => setContractForm({ ...contractForm, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea placeholder="Detalles de este tipo de régimen contractual" className="w-full px-3 py-2 border rounded-xl" rows={3} value={contractForm.descripcion} onChange={e => setContractForm({ ...contractForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowContractModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

Después:
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowContractModal(false)} />
                    <div className="relative bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
                            <h3 className="font-heading text-lg font-bold text-foreground">{isEditingContract ? 'Editar Contrato' : 'Nuevo Tipo de Contrato'}</h3>
                            <button onClick={() => setShowContractModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveContract} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Nombre del Contrato</label>
                                <input type="text" required placeholder="Ej: Contrato Eventual" className="w-full px-3 py-2 border rounded-xl" value={contractForm.nombre} onChange={e => setContractForm({ ...contractForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Clave de Referencia (Key)</label>
                                <input type="text" required placeholder="Ej: eventual" disabled={isEditingContract} className="w-full px-3 py-2 border rounded-xl disabled:bg-muted" value={contractForm.key} onChange={e => setContractForm({ ...contractForm, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Descripción</label>
                                <textarea placeholder="Detalles de este tipo de régimen contractual" className="w-full px-3 py-2 border rounded-xl" rows={3} value={contractForm.descripcion} onChange={e => setContractForm({ ...contractForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowContractModal(false)} className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear modales Licencia y Contrato de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 6: Modal Profesión y Modal Jornada

**Files:**
- Modify: `src/app/screens/ConfiguracionLicencias/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Modal Profesión**

Antes (líneas 647-671):
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowProfessionModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingProfession ? 'Editar Profesión' : 'Nueva Profesión / Cargo'}</h3>
                            <button onClick={() => setShowProfessionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveProfession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cargo / Profesión</label>
                                <input type="text" required placeholder="Ej: Desarrollador Backend" className="w-full px-3 py-2 border rounded-xl" value={professionForm.nombre} onChange={e => setProfessionForm({ ...professionForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea placeholder="Breve descripción del alcance del cargo" className="w-full px-3 py-2 border rounded-xl" rows={3} value={professionForm.descripcion} onChange={e => setProfessionForm({ ...professionForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowProfessionModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

Después:
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowProfessionModal(false)} />
                    <div className="relative bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
                            <h3 className="font-heading text-lg font-bold text-foreground">{isEditingProfession ? 'Editar Profesión' : 'Nueva Profesión / Cargo'}</h3>
                            <button onClick={() => setShowProfessionModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveProfession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Nombre del Cargo / Profesión</label>
                                <input type="text" required placeholder="Ej: Desarrollador Backend" className="w-full px-3 py-2 border rounded-xl" value={professionForm.nombre} onChange={e => setProfessionForm({ ...professionForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Descripción</label>
                                <textarea placeholder="Breve descripción del alcance del cargo" className="w-full px-3 py-2 border rounded-xl" rows={3} value={professionForm.descripcion} onChange={e => setProfessionForm({ ...professionForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowProfessionModal(false)} className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

- [ ] **Step 2: Modal Jornada**

Antes (líneas 674-701):
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowJornadaModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingJornada ? 'Editar Jornada Laboral' : 'Nueva Jornada Laboral'}</h3>
                            <button onClick={() => setShowJornadaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveJornada} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre (Tipo de Contrato)</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.nombre} onChange={e => setJornadaForm({ ...jornadaForm, nombre: e.target.value })}>
                                    <option value="">Seleccionar contrato relacionado</option>
                                    {contracts.map(c => <option key={c.key} value={c.nombre}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Horas Diarias</label>
                                <input type="number" required min="1" max="24" className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.horasDia} onChange={e => setJornadaForm({ ...jornadaForm, horasDia: parseFloat(e.target.value) })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowJornadaModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

Después:
```tsx
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowJornadaModal(false)} />
                    <div className="relative bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
                            <h3 className="font-heading text-lg font-bold text-foreground">{isEditingJornada ? 'Editar Jornada Laboral' : 'Nueva Jornada Laboral'}</h3>
                            <button onClick={() => setShowJornadaModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveJornada} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Nombre (Tipo de Contrato)</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.nombre} onChange={e => setJornadaForm({ ...jornadaForm, nombre: e.target.value })}>
                                    <option value="">Seleccionar contrato relacionado</option>
                                    {contracts.map(c => <option key={c.key} value={c.nombre}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">Horas Diarias</label>
                                <input type="number" required min="1" max="24" className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.horasDia} onChange={e => setJornadaForm({ ...jornadaForm, horasDia: parseFloat(e.target.value) })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowJornadaModal(false)} className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

Run: `grep -nE "indigo-|gray-(100|200|300|400|500|600|700|800|900)|gray-50/|text-gray-50\b|bg-white\b|text-red-|bg-red-|hover:bg-red-|bg-green-|text-green-" src/app/screens/ConfiguracionLicencias/Screen.tsx`
Expected: 0 resultados (la única excepción permitida, no capturada por este patrón, es el overlay `bg-gray-900/60` de los 4 modales, fuera de alcance por diseño).

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/ConfiguracionLicencias/Screen.tsx
git commit -m "feat: retemear modales Profesion y Jornada de ConfiguracionLicencias a tokens organico-calido"
```

---

### Task 7: `SoftSkills.tsx` — eliminar `dark:` y retemear

**Files:**
- Modify: `src/app/Componentes/TestComponent/SoftSkills.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Card "Añadir Nueva Habilidad Blanda" — título y labels**

Antes (líneas 40-48, 61-63):
```tsx
        <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">
          Añadir Nueva Habilidad Blanda
        </h3>
        <form onSubmit={handleSoftSkillSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="softskill-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
```
```tsx
            <label
              htmlFor="softskill-desc"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
```

Después:
```tsx
        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">
          Añadir Nueva Habilidad Blanda
        </h3>
        <form onSubmit={handleSoftSkillSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="softskill-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
```
```tsx
            <label
              htmlFor="softskill-desc"
              className="block text-sm font-medium text-foreground mb-2"
            >
```

- [ ] **Step 2: Card "Habilidades Blandas Existentes" — título, estado vacío, lista y botón eliminar**

Antes (líneas 92-124):
```tsx
        <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">
          Habilidades Blandas Existentes ({softSkills.length})
        </h3>
        <div className="space-y-3">
          {softSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Aún no se han creado habilidades blandas.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Agrega la primera habilidad blanda usando el formulario de arriba.
              </p>
            </div>
          ) : (
            softSkills.map((skill, index) => (
              <div
                key={`skill-${index}`}
                className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {skill.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {skill.descripcion}
                    </p>
                  </div>
                  {onDeleteSoftSkill && (
                    <Button
                      type="button"
                      onClick={() => onDeleteSoftSkill(index)}
                      className="ml-3 text-red-500 hover:text-red-700"
                      text
                      size="small"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
```

Después:
```tsx
        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">
          Habilidades Blandas Existentes ({softSkills.length})
        </h3>
        <div className="space-y-3">
          {softSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aún no se han creado habilidades blandas.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega la primera habilidad blanda usando el formulario de arriba.
              </p>
            </div>
          ) : (
            softSkills.map((skill, index) => (
              <div
                key={`skill-${index}`}
                className="p-4 bg-muted rounded-lg hover:bg-border transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {skill.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {skill.descripcion}
                    </p>
                  </div>
                  {onDeleteSoftSkill && (
                    <Button
                      type="button"
                      onClick={() => onDeleteSoftSkill(index)}
                      className="ml-3 text-error hover:opacity-80"
                      text
                      size="small"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `SoftSkills.tsx`.

Run: `grep -n "dark:" src/app/Componentes/TestComponent/SoftSkills.tsx`
Expected: 0 resultados.

- [ ] **Step 4: Commit**

```bash
git add src/app/Componentes/TestComponent/SoftSkills.tsx
git commit -m "feat: eliminar variantes dark: y retemear SoftSkills.tsx a tokens organico-calido"
```
