# Retema de Licencias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear el módulo de Gestión de Licencias (pantalla raíz + los 4 componentes reales en `src/app/GestionLicencias/`) de la paleta cian/gris/genérica de Tailwind a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` (y 2 colores inline en JS para gráficos de progreso) en 5 archivos existentes, agrupados en 7 tareas. Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (Dropdown/Calendar/InputTextarea/ProgressBar/Dialog/Button/Toast — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-24-retheme-licencias-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `fetchData`, `handleNewRequest`, `handleManageRequest` (`Screen.tsx`); `processHolidays`/`countBusinessDays` y todos los hooks de `Calendario.tsx`; todos los `useEffect`, `handleSubmit`, `handleTypeChange`, `generarPlantillaVacaciones`, `getAvailableLicenses` (`FormularioLicencia.tsx`); `handleApprove`/`handleReject` (`ModalProval.tsx`).
- No se cambian firmas de componentes ni props.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-warm-contrast`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-warning`, `bg-warning-soft`/`text-warning-soft-foreground`, `text-error`, `bg-error-soft`/`text-error-soft-foreground`, `bg-success-soft`/`text-success-soft-foreground`, `font-heading`. Para colores inline en JS (no clases Tailwind): `var(--color-error)`, `var(--color-warning)`, `var(--primary)`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 4 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo(s)> a tokens organico-calido` o similar.

---

### Task 1: `Screen.tsx` (pantalla raíz)

**Files:**
- Modify: `src/app/screens/LicenciasManage/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Loading state**

Antes (líneas 136-140):
```tsx
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
```

Después:
```tsx
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
```

- [ ] **Step 2: Fondo raíz, ícono y título**

Antes (líneas 144-150):
```tsx
    <div className="bg-gray-50 p-4 font-sans min-h-screen">
      <Toast ref={toast} />
      <div className="flex items-center gap-3 py-4 px-4">
        <FileText className="text-[#1ABCD7]" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Licencias
        </h1>
      </div>
```

Después:
```tsx
    <div className="bg-background p-4 font-sans min-h-screen">
      <Toast ref={toast} />
      <div className="flex items-center gap-3 py-4 px-4">
        <FileText className="text-primary" size={32} />
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Gestión de Licencias
        </h1>
      </div>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/screens/LicenciasManage/Screen.tsx
git commit -m "feat: retemear Screen.tsx de Licencias a tokens organico-calido"
```

---

### Task 2: `Licencias.tsx` — estados e iconos por tipo

**Files:**
- Modify: `src/app/GestionLicencias/Licencias.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `STATUS`, `ICONOS`, `getIcon`, `StatusChip` — mismas claves/firma, solo cambian las clases CSS dentro de los valores. Consumido sin cambios por el resto del archivo (Task 3 toca otras partes del mismo archivo).

- [ ] **Step 1: `STATUS` (badges de estado)**

Antes (líneas 28-33):
```tsx
const STATUS: Record<LicenseStatus, { cls: string; label: string }> = {
  'Pendiente': { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pendiente' },
  'Pendiente Siguiente Aprobación': { cls: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'En revisión' },
  'Aprobada': { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Aprobada' },
  'Rechazada': { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Rechazada' },
};
```

Después:
```tsx
const STATUS: Record<LicenseStatus, { cls: string; label: string }> = {
  'Pendiente': { cls: 'bg-warning-soft text-warning-soft-foreground border-warning', label: 'Pendiente' },
  'Pendiente Siguiente Aprobación': { cls: 'bg-primary/15 text-primary border-primary/30', label: 'En revisión' },
  'Aprobada': { cls: 'bg-success-soft text-success-soft-foreground border-success', label: 'Aprobada' },
  'Rechazada': { cls: 'bg-error-soft text-error-soft-foreground border-error', label: 'Rechazada' },
};
```

- [ ] **Step 2: `ICONOS` (iconos por tipo de licencia, 5 grupos de color)**

Antes (líneas 36-54):
```tsx
const ICONOS: Record<string, React.ReactNode> = {
  Licencias: <Briefcase size={14} className="text-cyan-500" />,
  Vacaciones: <Briefcase size={14} className="text-cyan-500" />,
  Particulares: <Users size={14} className="text-cyan-500" />,
  Particular: <Users size={14} className="text-cyan-500" />,
  Articulos: <Award size={14} className="text-cyan-500" />,
  Examen: <GraduationCap size={14} className="text-cyan-500" />,
  'Lic por Examen': <GraduationCap size={14} className="text-cyan-500" />,
  Estudio: <GraduationCap size={14} className="text-cyan-500" />,
  Nacimiento: <Baby size={14} className="text-cyan-500" />,
  Paternidad: <Baby size={14} className="text-cyan-500" />,
  Maternidad: <Heart size={14} className="text-pink-500" />,
  Embarazo: <Heart size={14} className="text-pink-500" />,
  'Matrimonio del empleado': <Heart size={14} className="text-red-400" />,
  'Matrimonio de su hijo': <Heart size={14} className="text-red-400" />,
  Enfermedad: <AlertTriangle size={14} className="text-amber-500" />,
  'Lic por Enfermedad': <AlertTriangle size={14} className="text-amber-500" />,
  LAR: <Clock size={14} className="text-gray-500" />,
};

const getIcon = (tipo: string) => ICONOS[tipo] || <FileText size={14} className="text-cyan-500" />;
```

Después:
```tsx
const ICONOS: Record<string, React.ReactNode> = {
  Licencias: <Briefcase size={14} className="text-primary" />,
  Vacaciones: <Briefcase size={14} className="text-primary" />,
  Particulares: <Users size={14} className="text-primary" />,
  Particular: <Users size={14} className="text-primary" />,
  Articulos: <Award size={14} className="text-primary" />,
  Examen: <GraduationCap size={14} className="text-primary" />,
  'Lic por Examen': <GraduationCap size={14} className="text-primary" />,
  Estudio: <GraduationCap size={14} className="text-primary" />,
  Nacimiento: <Baby size={14} className="text-primary" />,
  Paternidad: <Baby size={14} className="text-primary" />,
  Maternidad: <Heart size={14} className="text-warm-contrast" />,
  Embarazo: <Heart size={14} className="text-warm-contrast" />,
  'Matrimonio del empleado': <Heart size={14} className="text-error" />,
  'Matrimonio de su hijo': <Heart size={14} className="text-error" />,
  Enfermedad: <AlertTriangle size={14} className="text-warning" />,
  'Lic por Enfermedad': <AlertTriangle size={14} className="text-warning" />,
  LAR: <Clock size={14} className="text-muted-foreground" />,
};

const getIcon = (tipo: string) => ICONOS[tipo] || <FileText size={14} className="text-primary" />;
```

- [ ] **Step 3: `Section` (componente compartido del archivo)**

Antes (líneas 69-77):
```tsx
const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
      {icon}
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);
```

Después:
```tsx
const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
      {icon}
      <h2 className="font-heading text-sm font-semibold text-foreground">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Licencias.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/GestionLicencias/Licencias.tsx
git commit -m "feat: retemear estados, iconos y Section de Licencias a tokens organico-calido"
```

---

### Task 3: `Licencias.tsx` — saldos, card "Nueva Solicitud", pendientes e historial

**Files:**
- Modify: `src/app/GestionLicencias/Licencias.tsx`

**Interfaces:**
- Consumes: `STATUS`, `ICONOS`, `getIcon`, `Section` ya retemados por Task 2 — no se vuelven a tocar sus definiciones, solo se usan tal cual.
- Produces: nada nuevo.

- [ ] **Step 1: Spinner y `details`/`summary` de saldos por año**

Antes (líneas 110-119):
```tsx
              <div className="flex justify-center py-6">
                <span className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-cyan-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(saldos).map(([anio, valores]) => (
                  <details key={anio} className="group rounded-lg border border-gray-100 overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-100 transition list-none">
                      Año {anio}
                      <ChevronRight size={14} className="text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
```

Después:
```tsx
              <div className="flex justify-center py-6">
                <span className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(saldos).map(([anio, valores]) => (
                  <details key={anio} className="group rounded-lg border border-border overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-2.5 bg-muted cursor-pointer text-sm font-semibold text-foreground hover:bg-border transition list-none">
                      Año {anio}
                      <ChevronRight size={14} className="text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
```

- [ ] **Step 2: Card individual de tipo (saldo) y barra de progreso**

Antes (líneas 130-152):
```tsx
                          <div key={tipo} className="border border-gray-100 rounded-xl p-3 hover:border-cyan-200 transition">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              {getIcon(tipo)}
                              <span className="font-medium truncate">{tipo}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                              <p className="text-xl font-bold text-cyan-600">{disponibles}</p>
                              <span className="text-[10px] text-gray-400">/ {diasTotales} días</span>
                            </div>
                            {/* Barra de consumo */}
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(porcentaje, 100)}%`,
                                  backgroundColor: porcentaje > 80 ? '#ef4444' : porcentaje > 50 ? '#f59e0b' : '#06b6d4'
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {consumidos > 0 ? `${consumidos} consumidos` : 'Sin consumo'}
                            </p>
                          </div>
```

Después:
```tsx
                          <div key={tipo} className="border border-border rounded-xl p-3 hover:border-primary/40 transition">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                              {getIcon(tipo)}
                              <span className="font-medium truncate">{tipo}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                              <p className="text-xl font-bold text-primary">{disponibles}</p>
                              <span className="text-[10px] text-muted-foreground">/ {diasTotales} días</span>
                            </div>
                            {/* Barra de consumo */}
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(porcentaje, 100)}%`,
                                  backgroundColor: porcentaje > 80 ? 'var(--color-error)' : porcentaje > 50 ? 'var(--color-warning)' : 'var(--primary)'
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {consumidos > 0 ? `${consumidos} consumidos` : 'Sin consumo'}
                            </p>
                          </div>
```

- [ ] **Step 3: Card "Nueva Solicitud" (gradiente)**

Antes (líneas 165-178):
```tsx
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 flex flex-col items-center justify-center text-center text-white shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Plus size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Nueva Solicitud</h3>
          <p className="text-xs text-cyan-100 mb-4">Iniciá tu solicitud de licencia</p>
          <button
            onClick={onNewRequest}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-cyan-600 text-xs font-semibold rounded-full hover:bg-cyan-50 transition shadow-sm"
          >
            <Send size={13} />
            Solicitar
          </button>
        </div>
```

Después:
```tsx
        <div className="bg-gradient-to-br from-primary to-warm-contrast rounded-xl p-5 flex flex-col items-center justify-center text-center text-primary-foreground shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-3">
            <Plus size={20} className="text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Nueva Solicitud</h3>
          <p className="text-xs text-primary-foreground/80 mb-4">Iniciá tu solicitud de licencia</p>
          <button
            onClick={onNewRequest}
            className="flex items-center gap-1.5 px-4 py-2 bg-card text-primary text-xs font-semibold rounded-full hover:bg-muted transition shadow-sm"
          >
            <Send size={13} />
            Solicitar
          </button>
        </div>
```

- [ ] **Step 4: Sección "Pendientes de Mi Aprobación" (ícono + lista)**

Antes (líneas 183-204):
```tsx
        <Section title="Pendientes de Mi Aprobación" icon={<Clock size={15} className="text-amber-500" />}>
          <div className="space-y-2">
            {pendientes.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedRequest(s)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/50 transition group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {s.name} · <span className="text-cyan-600">{s.type}</span> · {s.duration} días
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt(s.desde)} → {fmt(s.hasta)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-cyan-500 transition" />
              </button>
            ))}
          </div>
        </Section>
```

Después:
```tsx
        <Section title="Pendientes de Mi Aprobación" icon={<Clock size={15} className="text-warning" />}>
          <div className="space-y-2">
            {pendientes.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedRequest(s)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/10 transition group"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {s.name} · <span className="text-primary">{s.type}</span> · {s.duration} días
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fmt(s.desde)} → {fmt(s.hasta)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition" />
              </button>
            ))}
          </div>
        </Section>
```

- [ ] **Step 5: Sección "Historial de Solicitudes"**

Antes (líneas 207-236):
```tsx
      <Section title="Historial de Solicitudes">
        {misSolicitudes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tenés solicitudes registradas.</p>
        ) : (
          <div className="space-y-2">
            {misSolicitudes.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {getIcon(s.type)}
                    <p className="text-sm font-semibold text-gray-800">
                      {s.duration} días · {s.type}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {fmt(s.startDate)} → {fmt(s.endDate)}
                  </p>
                  {s.status === 'Rechazada' && s.observacion && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <MessageSquare size={11} />
                      {s.observacion}
                    </p>
                  )}
                </div>
                <StatusChip status={s.status} observacion={s.observacion} />
              </div>
            ))}
          </div>
        )}
      </Section>
```

Después:
```tsx
      <Section title="Historial de Solicitudes">
        {misSolicitudes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tenés solicitudes registradas.</p>
        ) : (
          <div className="space-y-2">
            {misSolicitudes.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {getIcon(s.type)}
                    <p className="text-sm font-semibold text-foreground">
                      {s.duration} días · {s.type}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmt(s.startDate)} → {fmt(s.endDate)}
                  </p>
                  {s.status === 'Rechazada' && s.observacion && (
                    <p className="text-xs text-error flex items-center gap-1 mt-1">
                      <MessageSquare size={11} />
                      {s.observacion}
                    </p>
                  )}
                </div>
                <StatusChip status={s.status} observacion={s.observacion} />
              </div>
            ))}
          </div>
        )}
      </Section>
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Licencias.tsx`.

Run: `grep -nE "gray-|cyan-|red-|amber-|white" src/app/GestionLicencias/Licencias.tsx`
Expected: 0 resultados (la única excepción ya cubierta en Task 2 era `text-pink-500`/`text-red-400`/`text-gray-500` dentro de `ICONOS`, ya reemplazados).

- [ ] **Step 7: Commit**

```bash
git add src/app/GestionLicencias/Licencias.tsx
git commit -m "feat: retemear saldos, nueva solicitud, pendientes e historial a tokens organico-calido"
```

---

### Task 4: `Calendario.tsx` (`DateRangePicker`)

**Files:**
- Modify: `src/app/GestionLicencias/Calendario.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Día feriado, spinner y panel del calendario**

Antes (líneas 99-103, 124-128, 145-148):
```tsx
        <span
          title={holiday.name}
          className="line-through text-red-400 font-medium"
        >
```
```tsx
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-cyan-500 animate-spin" />
          Cargando feriados...
        </p>
```
```tsx
          pt={{
            panel: { className: 'rounded-2xl shadow-lg border border-gray-100 overflow-hidden' },
          }}
```

Después:
```tsx
        <span
          title={holiday.name}
          className="line-through text-error font-medium"
        >
```
```tsx
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-border border-t-primary animate-spin" />
          Cargando feriados...
        </p>
```
```tsx
          pt={{
            panel: { className: 'rounded-2xl shadow-lg border border-border overflow-hidden' },
          }}
```

- [ ] **Step 2: Chip "días hábiles", mensaje de error y botón "Limpiar"**

Antes (líneas 156, 167, 176):
```tsx
          <div className={`flex items-center gap-2 px-4 py-2 border rounded-full ${exceedsMax ? 'bg-red-50 border-red-200 text-red-700' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
```
```tsx
          <div className="w-full text-center text-xs text-red-600 font-semibold mt-1">
```
```tsx
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
```

Después:
```tsx
          <div className={`flex items-center gap-2 px-4 py-2 border rounded-full ${exceedsMax ? 'bg-error-soft border-error text-error-soft-foreground' : 'bg-primary/15 border-primary/30 text-primary'}`}>
```
```tsx
          <div className="w-full text-center text-xs text-error font-semibold mt-1">
```
```tsx
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-full hover:bg-muted hover:border-border transition shadow-sm"
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Calendario.tsx`.

Run: `grep -nE "gray-|cyan-|red-|white" src/app/GestionLicencias/Calendario.tsx`
Expected: 0 resultados.

- [ ] **Step 4: Commit**

```bash
git add src/app/GestionLicencias/Calendario.tsx
git commit -m "feat: retemear Calendario.tsx a tokens organico-calido"
```

---

### Task 5: `ModalProval.tsx` (`ApprovalModal`)

**Files:**
- Modify: `src/app/GestionLicencias/ModalProval.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Caja "Historial de Aprobaciones", `<pre>` mensaje original y caja "Tomar Decisión"**

Antes (líneas 109-113, 127, 133-134, 149):
```tsx
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">
                Historial de Aprobaciones
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-700">
```
```tsx
            <pre className="w-full p-3 border rounded-lg bg-gray-50 font-sans text-sm whitespace-pre-wrap">
```
```tsx
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
            <h4 className="font-bold text-[#1ABCD7]  mb-3">Tomar Decision</h4>
```
```tsx
                <p className="text-xs text-gray-500 mt-1">
```

Después:
```tsx
            <div className="p-3 bg-primary/15 border border-primary/30 rounded-lg">
              <h4 className="font-bold text-primary mb-2">
                Historial de Aprobaciones
              </h4>
              <ul className="list-disc list-inside text-sm text-primary">
```
```tsx
            <pre className="w-full p-3 border rounded-lg bg-muted font-sans text-sm whitespace-pre-wrap">
```
```tsx
          <div className="p-3 bg-muted border border-border rounded-lg">
            <h4 className="font-bold text-primary mb-3">Tomar Decision</h4>
```
```tsx
                <p className="text-xs text-muted-foreground mt-1">
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `ModalProval.tsx`.

Run: `grep -nE "gray-|blue-|#1ABCD7" src/app/GestionLicencias/ModalProval.tsx`
Expected: 0 resultados.

- [ ] **Step 3: Commit**

```bash
git add src/app/GestionLicencias/ModalProval.tsx
git commit -m "feat: retemear ModalProval.tsx a tokens organico-calido"
```

---

### Task 6: `FormularioLicencia.tsx` — encabezado, paso 1 (tipo de licencia)

**Files:**
- Modify: `src/app/GestionLicencias/FormularioLicencia.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `StepLabel`, `Section` (definidos en este archivo) — mismas firmas, solo cambian las clases CSS. Consumidos sin cambios por Task 7 más adelante en el mismo archivo.

- [ ] **Step 1: `StepLabel` y `Section` (componentes compartidos del archivo)**

Antes (líneas 52-65):
```tsx
const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
  </div>
);

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);
```

Después:
```tsx
const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-foreground text-sm">{label}</h3>
  </div>
);

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-xl border border-border shadow-sm p-5 ${className}`}>
    {children}
  </div>
);
```

- [ ] **Step 2: Encabezado (botón volver, título, subtítulo) y caja de error**

Antes (líneas 360-374):
```tsx
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Nueva Solicitud de Licencia</h2>
          <p className="text-xs text-gray-400">{userData.name} · {userData.condicionLaboral?.tipoContrato}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
```

Después:
```tsx
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Nueva Solicitud de Licencia</h2>
          <p className="text-xs text-muted-foreground">{userData.name} · {userData.condicionLaboral?.tipoContrato}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-error-soft border border-error rounded-xl text-sm text-error-soft-foreground">
```

- [ ] **Step 3: Paso 1 — caja de saldo del tipo seleccionado, `ProgressBar` y mensajes**

Antes (líneas 393-418):
```tsx
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

Después:
```tsx
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
              <p className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded-xl">
                No hay saldo disponible para esta categoría.
              </p>
            )}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `FormularioLicencia.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/GestionLicencias/FormularioLicencia.tsx
git commit -m "feat: retemear encabezado y paso 1 de FormularioLicencia a tokens organico-calido"
```

---

### Task 7: `FormularioLicencia.tsx` — pasos 2-4 (fechas, aprobador, nota) y footer

**Files:**
- Modify: `src/app/GestionLicencias/FormularioLicencia.tsx`

**Interfaces:**
- Consumes: `StepLabel`, `Section` ya retemados por Task 6 — no se vuelven a tocar sus definiciones, solo se usan tal cual.
- Produces: nada nuevo.

- [ ] **Step 1: Paso 2 — caja "sin tipo seleccionado", aviso "90 días corrido" y caja "Período Calculado"**

Antes (líneas 424-451):
```tsx
            <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <p className="text-sm">Por favor, seleccioná primero el tipo de licencia.</p>
            </div>
          ) : licenseMeta.mode === 'corrido' ? (
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
```

Después:
```tsx
            <div className="p-4 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
              <p className="text-sm">Por favor, seleccioná primero el tipo de licencia.</p>
            </div>
          ) : licenseMeta.mode === 'corrido' ? (
            <div className="space-y-4">
              <p className="text-xs text-warning bg-warning-soft p-2 rounded-lg border border-warning flex items-center gap-2">
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
                <div className="p-3 bg-primary/15 border border-primary/30 rounded-xl">
                  <p className="text-xs font-semibold text-primary">Período Calculado:</p>
                  <p className="text-sm text-primary font-bold">
                    {startDate?.toLocaleDateString()} al {endDate.toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-primary mt-1">90 días calendario automáticos.</p>
                </div>
              )}
            </div>
```

- [ ] **Step 2: Paso 3 — caja "Tu Aprobador"**

Antes (líneas 460-470):
```tsx
          {supervisorData ? (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-bold">
                {supervisorData.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-semibold">{supervisorData.name}</p>
                <p className="text-xs text-gray-500">Superior Directo</p>
              </div>
            </div>
          ) : <p className="text-xs italic text-gray-400">Consultando jerarquía...</p>}
```

Después:
```tsx
          {supervisorData ? (
            <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 text-primary rounded-full flex items-center justify-center font-bold">
                {supervisorData.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-semibold">{supervisorData.name}</p>
                <p className="text-xs text-muted-foreground">Superior Directo</p>
              </div>
            </div>
          ) : <p className="text-xs italic text-muted-foreground">Consultando jerarquía...</p>}
```

- [ ] **Step 3: Paso 4 — textarea vista previa y footer (Cancelar/Enviar)**

Antes (líneas 475-495):
```tsx
          <InputTextarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={15}
            autoResize
            className="w-full text-xs text-gray-600 border-none bg-gray-50 rounded-lg p-3"
          />
        </Section>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={onCancel} className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:cursor-not-allowed"
        >
```

Después:
```tsx
          <InputTextarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={15}
            autoResize
            className="w-full text-xs text-foreground border-none bg-muted rounded-lg p-3"
          />
        </Section>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={onCancel} className="text-sm text-muted-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-sm font-semibold rounded-xl transition shadow-sm disabled:cursor-not-allowed"
        >
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `FormularioLicencia.tsx`.

Run: `grep -nE "gray-|cyan-|amber-" src/app/GestionLicencias/FormularioLicencia.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/GestionLicencias/FormularioLicencia.tsx
git commit -m "feat: retemear pasos 2-4 y footer de FormularioLicencia a tokens organico-calido"
```
