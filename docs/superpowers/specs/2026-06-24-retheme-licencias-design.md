# Retema de Licencias

## Contexto

Quinto sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV y Organigrama ya están mergeados a `main`). Cubre el módulo de Gestión de Licencias: pantalla raíz (`LicenciasManage/Screen.tsx`) y los 4 componentes reales del flujo en `src/app/GestionLicencias/` (`Licencias.tsx`, `Calendario.tsx`, `ModalProval.tsx`, `FormularioLicencia.tsx`).

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Iconos por tipo de licencia** (`ICONOS` en `Licencias.tsx`): son puramente decorativos (no indican estado), pero se decide **mantener la distinción de color por categoría** en vez de colapsar a un solo color — mismo criterio que los niveles jerárquicos del Organigrama. Se recolorean los 5 grupos a 5 tokens cálidos ya existentes (`primary`, `warm-contrast`, `error`, `warning`, `muted-foreground`), sin crear tokens nuevos.
- **Badges de estado de solicitud** (`STATUS` en `Licencias.tsx`): usan el patrón "soft" ya establecido en la fase RRHH (`bg-*-soft`/`text-*-soft-foreground`). El estado "En revisión" (antes cian) no tiene un token "info-soft" propio — se trata como variante de `primary` (`bg-primary/15 text-primary border-primary/30`), consistente con el resto del módulo donde el cian es el color de acento "de marca", no un estado semántico distinto.
- **Color cian genérico** (`cyan-*`, usado extensamente como acento de marca en todo el módulo): se mapea a `primary` en todos los casos que no sean parte de los 5 colores de tipo de licencia o de los estados.
- **Colores inline en JS** (no son clases de Tailwind): la barra de progreso de saldo en `Licencias.tsx` (línea 146) y el `color` prop de `ProgressBar` en `FormularioLicencia.tsx` (línea 407) usan hex literales (`'#ef4444'`, `'#f59e0b'`, `'#06b6d4'`/`'#06b6d4'`). Se reemplazan por `var(--color-error)`, `var(--color-warning)`, `var(--primary)` — las custom properties ya definidas en `globals.css` — para que sigan adaptándose en modo oscuro igual que el resto del tema.
- **Caja azul "Historial de Aprobaciones"** (`ModalProval.tsx`, `bg-blue-50`/`text-blue-800`/`text-blue-700`): no es un estado de error/warning/success — se trata como variante de `primary` (`bg-primary/15`/`text-primary`), igual que el cian genérico.

## Archivos afectados

- `src/app/screens/LicenciasManage/Screen.tsx`
- `src/app/GestionLicencias/Licencias.tsx`
- `src/app/GestionLicencias/Calendario.tsx`
- `src/app/GestionLicencias/ModalProval.tsx`
- `src/app/GestionLicencias/FormularioLicencia.tsx`

## Diseño

### 1. `Screen.tsx` (pantalla raíz)

| Elemento | Antes | Después |
|---|---|---|
| Loading: fondo | `bg-gray-100` | `bg-background` |
| Loading: spinner | `border-cyan-600` | `border-primary` |
| Fondo raíz | `bg-gray-50` | `bg-background` |
| Ícono `FileText` | `text-[#1ABCD7]` | `text-primary` |
| Título "Gestión de Licencias" | `text-gray-800` | `font-heading text-foreground` |

### 2. `Licencias.tsx` — estados, tipos de licencia, secciones

**Estados (`STATUS`, patrón "soft"):**

| Estado | Antes | Después |
|---|---|---|
| Pendiente | `bg-yellow-50 text-yellow-700 border-yellow-200` | `bg-warning-soft text-warning-soft-foreground border-warning` |
| Pendiente Siguiente Aprobación ("En revisión") | `bg-cyan-50 text-cyan-700 border-cyan-200` | `bg-primary/15 text-primary border-primary/30` |
| Aprobada | `bg-green-50 text-green-700 border-green-200` | `bg-success-soft text-success-soft-foreground border-success` |
| Rechazada | `bg-red-50 text-red-700 border-red-200` | `bg-error-soft text-error-soft-foreground border-error` |

**Iconos por tipo de licencia (`ICONOS`, decorativos, 5 grupos):**

| Tipos | Antes | Después |
|---|---|---|
| Licencias, Vacaciones, Particulares, Particular, Articulos, Examen, "Lic por Examen", Estudio, Nacimiento, Paternidad, default (`getIcon` fallback) | `text-cyan-500` | `text-primary` |
| Maternidad, Embarazo | `text-pink-500` | `text-warm-contrast` |
| "Matrimonio del empleado", "Matrimonio de su hijo" | `text-red-400` | `text-error` |
| Enfermedad, "Lic por Enfermedad" | `text-amber-500` | `text-warning` |
| LAR | `text-gray-500` | `text-muted-foreground` |

**Resto del archivo:**

| Elemento | Antes | Después |
|---|---|---|
| `Section` caja | `bg-white border-gray-100` | `bg-card border-border` |
| `Section` borde divisor header | `border-gray-50` | `border-border` |
| `Section` título | `text-gray-700` | `font-heading text-foreground` |
| `details`/`summary` saldos por año | `border-gray-100` / `bg-gray-50 text-gray-700 hover:bg-gray-100` / ícono `text-gray-400` | `border-border` / `bg-muted text-foreground hover:bg-border` / ícono `text-muted-foreground` |
| Card individual de tipo (saldo) | `border-gray-100 hover:border-cyan-200` | `border-border hover:border-primary/40` |
| Texto label tipo (icono+nombre) | `text-gray-500` | `text-muted-foreground` |
| Cifra "disponibles" | `text-cyan-600` | `text-primary` |
| Texto "/ N días" y "consumidos" | `text-gray-400` | `text-muted-foreground` |
| Barra de fondo (track) | `bg-gray-100` | `bg-muted` |
| Barra de progreso (color inline JS) | `porcentaje > 80 ? '#ef4444' : porcentaje > 50 ? '#f59e0b' : '#06b6d4'` | `porcentaje > 80 ? 'var(--color-error)' : porcentaje > 50 ? 'var(--color-warning)' : 'var(--primary)'` |
| Card "Nueva Solicitud" (gradiente) | `from-cyan-500 to-cyan-600` ... `text-white` / `bg-white/20` / `text-cyan-100` | `from-primary to-warm-contrast` ... `text-primary-foreground` / `bg-primary-foreground/20` / `text-primary-foreground/80` |
| Botón "Solicitar" | `bg-white text-cyan-600 hover:bg-cyan-50` | `bg-card text-primary hover:bg-muted` |
| Ícono "Pendientes de Mi Aprobación" | `text-amber-500` | `text-warning` |
| Fila pendiente (hover) | `border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/50` | `border-border hover:border-primary/40 hover:bg-primary/10` |
| Texto nombre+tipo+duración (pendiente) | `text-gray-800` ... `text-cyan-600` | `text-foreground` ... `text-primary` |
| Texto fecha (pendiente) | `text-gray-400` | `text-muted-foreground` |
| Chevron (pendiente, hover) | `text-gray-300 group-hover:text-cyan-500` | `text-muted-foreground group-hover:text-primary` |
| Texto "no tenés solicitudes" | `text-gray-400` | `text-muted-foreground` |
| Fila historial (hover) | `border-gray-100 hover:bg-gray-50` | `border-border hover:bg-muted` |
| Texto duración+tipo (historial) | `text-gray-800` | `text-foreground` |
| Texto fecha (historial) | `text-gray-400` | `text-muted-foreground` |
| Texto observación rechazo | `text-red-500` | `text-error` |

### 3. `Calendario.tsx` (`DateRangePicker`)

| Elemento | Antes | Después |
|---|---|---|
| Día feriado (tachado) | `text-red-400` | `text-error` |
| Spinner carga feriados (texto) | `text-gray-400` | `text-muted-foreground` |
| Spinner carga feriados (anillo) | `border-gray-300 border-t-cyan-500` | `border-border border-t-primary` |
| Panel calendario (PrimeReact `pt.panel`) | `border-gray-100` | `border-border` |
| Chip "días hábiles" (normal) | `bg-cyan-50 border-cyan-200 text-cyan-700` | `bg-primary/15 border-primary/30 text-primary` |
| Chip "días hábiles" (excede máximo) | `bg-red-50 border-red-200 text-red-700` | `bg-error-soft border-error text-error-soft-foreground` |
| Mensaje "Superaste el máximo" | `text-red-600` | `text-error` |
| Botón "Limpiar" | `text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300` | `text-muted-foreground bg-card border-border hover:bg-muted hover:border-border` |

### 4. `ModalProval.tsx` (`ApprovalModal`)

| Elemento | Antes | Después |
|---|---|---|
| Caja "Historial de Aprobaciones" | `bg-blue-50 border-blue-200` | `bg-primary/15 border-primary/30` |
| Título caja historial | `text-blue-800` | `text-primary` |
| Lista historial | `text-blue-700` | `text-primary` |
| `<pre>` mensaje original | `bg-gray-50` | `bg-muted` |
| Caja "Tomar Decisión" | `bg-gray-50 border-gray-300` | `bg-muted border-border` |
| Título "Tomar Decision" | `text-[#1ABCD7]` | `text-primary` |
| Texto ayuda dropdown ("Si no seleccionas...") | `text-gray-500` | `text-muted-foreground` |

`Dialog`/`Button`/`Dropdown`/`InputTextarea`/`Toast` (PrimeReact) heredan el tema global, sin cambios.

### 5. `FormularioLicencia.tsx` (`RequestForm`)

| Elemento | Antes | Después |
|---|---|---|
| Badge numerado `StepLabel` | `bg-cyan-500 text-white` | `bg-primary text-primary-foreground` |
| Título `StepLabel` | `text-gray-700` | `text-foreground` |
| `Section` caja | `bg-white border-gray-100` | `bg-card border-border` |
| Botón volver (flecha) | `hover:bg-gray-100 text-gray-500` | `hover:bg-muted text-muted-foreground` |
| Título "Nueva Solicitud de Licencia" | `text-gray-800` | `font-heading text-foreground` |
| Subtítulo (nombre/contrato) | `text-gray-400` | `text-muted-foreground` |
| Caja de error | `bg-red-50 border-red-200 text-red-600` | `bg-error-soft border-error text-error-soft-foreground` |
| Caja saldo del tipo seleccionado | `border-gray-100` | `border-border` |
| Texto "N/M consumidos" | `text-gray-500` | `text-muted-foreground` |
| `ProgressBar` color (inline JS, prop `color`) | `color="#06b6d4"` | `color="var(--primary)"` |
| Texto "Disponibles: N días" | `text-cyan-600` | `text-primary` |
| Texto "No hay saldo disponible" | `text-gray-400` | `text-muted-foreground` |
| Caja "sin tipo seleccionado" | `border-gray-200 text-gray-400` | `border-border text-muted-foreground` |
| Aviso "90 días de corrido" | `text-amber-600 bg-amber-50 border-amber-100` | `text-warning bg-warning-soft border-warning` |
| Caja "Período Calculado" | `bg-cyan-50 border-cyan-100` | `bg-primary/15 border-primary/30` |
| Texto "Período Calculado:" / fechas / "90 días..." (3 tonos de cian) | `text-cyan-700` / `text-cyan-800` / `text-cyan-600` | `text-primary` (las 3 ocurrencias) |
| Caja "Tu Aprobador" | `bg-gray-50` | `bg-muted` |
| Avatar inicial supervisor | `bg-cyan-100 text-cyan-700` | `bg-primary/15 text-primary` |
| Texto "Superior Directo" | `text-gray-500` | `text-muted-foreground` |
| Texto "Consultando jerarquía..." | `text-gray-400` | `text-muted-foreground` |
| Textarea vista previa (texto + fondo) | `text-gray-600` / `bg-gray-50` | `text-foreground` / `bg-muted` |
| Botón "Cancelar" | `text-gray-500 hover:bg-gray-100` | `text-muted-foreground hover:bg-muted` |
| Botón "Enviar Solicitud" | `bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-200 disabled:text-gray-400 text-white` | `bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground` |

`Dropdown`/`Calendar`/`InputTextarea`/`ProgressBar` (PrimeReact, excepto el `color` prop ya cubierto arriba) heredan el tema global, sin cambios.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `fetchData`, `handleNewRequest`, `handleManageRequest` (`Screen.tsx`); cálculo de días hábiles y feriados, `processHolidays`/`countBusinessDays` (`Calendario.tsx`); todos los `useEffect` de asignación de supervisor, carga de tipos, distribución de saldos, generación de mensaje, `generarPlantillaVacaciones`, `getAvailableLicenses`, `handleSubmit`/`handleTypeChange` (`FormularioLicencia.tsx`); `handleApprove`/`handleReject` (`ModalProval.tsx`).
- Otros módulos pendientes (Feedback, IA, Admin, ConfiguracionLicencias, TestConfig).

## Testing

- Verificación visual manual: pantalla de Gestión de Licencias completa — vista "Mis Licencias" (saldos, pendientes de aprobación, historial con los 4 estados), formulario de nueva solicitud (todos los pasos, incluyendo el caso de licencia de 90 días corridos), modal de aprobación/rechazo — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
