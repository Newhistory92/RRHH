# Retema de IA

## Contexto

Octavo sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV, Organigrama, Licencias, ConfiguracionLicencias y Feedback ya están mergeados a `main`). Cubre el módulo de Herramientas de IA: la pantalla de selección (`IA/Screen.tsx`) y sus 3 herramientas (`MCPIA/Predictive.tsx`, `MCPIA/HRChatbot.tsx`, `MCPIA/DepartmentOptimization.tsx`), más los componentes compartidos `StatCard`/`RiskBadge`/`InfoList` de `UiRRHH.tsx` consumidos por `Predictive.tsx`.

Es el primero de 3 specs/planes separados (IA, Admin, TestConfig) acordados para cerrar la iniciativa de retema — cada uno con su propia rama y ciclo de revisión, en vez de un único plan combinado.

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Colores de riesgo** (`RiskBadge`, en 2 implementaciones distintas — la de `UiRRHH.tsx` con 4 niveles Bajo/Medio/Alto/Crítico, y la local de `DepartmentOptimization.tsx` con 3 niveles Alto/Medio/Bajo): se mapean a los tokens "soft" de estado ya existentes (`success-soft`/`warning-soft`/`error-soft`), no se colapsan a un solo color. En la versión de 4 niveles, "Alto" y "Medio" comparten el token `warning-soft` (se diferencian por el ícono `TrendingDown` vs `Activity`, no por color).
- **Categorías de `StatCard`** (cyan/verde/rojo/púrpura en ambas implementaciones — la de `UiRRHH.tsx` vía `colorClass` prop, la local de `DepartmentOptimization.tsx` vía `colorMap`): se mapean a `primary`/`accent`/`error`/`warm-contrast` respectivamente, reusando tokens existentes sin crear nuevos — mismo criterio que los niveles del Organigrama y los iconos de tipo de licencia.
- **Color cian genérico** (`cyan-*`, acento de marca en `Predictive.tsx`/`DepartmentOptimization.tsx`) y **azul genérico** (`blue-*` en `HRChatbot.tsx`): ambos se mapean a `primary`.
- **Color dinámico `bg-${dept.color}-500`** (`Predictive.tsx`, barra superior de cada card de departamento): el valor de `dept.color` viene del backend (dato, no literal hardcodeado en este archivo) — queda fuera de alcance, no se modifica.
- **Eliminación de `dark:`**: ambos archivos de `MCPIA/` y los componentes de `UiRRHH.tsx` usan `dark:` extensamente (paleta `slate-*`) — se eliminan, usando los tokens semánticos que se adaptan solos, mismo criterio que Organigrama y ConfiguracionLicencias.

## Archivos afectados

- `src/app/screens/IA/Screen.tsx`
- `src/app/Componentes/MCPIA/Predictive.tsx`
- `src/app/Componentes/MCPIA/HRChatbot.tsx`
- `src/app/Componentes/MCPIA/DepartmentOptimization.tsx`
- `src/app/util/UiRRHH.tsx` (solo `StatCard`, `RiskBadge`, `InfoList` — líneas 983-1030)

## Diseño

### 1. `Screen.tsx` (dashboard de selección)

| Elemento | Antes | Después |
|---|---|---|
| Fondo raíz | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| Título "Herramientas de IA" | `text-gray-800 dark:text-white` | `font-heading text-foreground` |
| Ícono `BrainCircuit` (Análisis Predictivo) | `text-blue-500` | `text-primary` |
| Ícono `Users` (Chatbot) | `text-green-500` | `text-warm-contrast` |
| Ícono `BarChart2` (Optimización) | `text-purple-500` | `text-accent` |
| Títulos de card | `text-gray-800 dark:text-white` | `text-foreground` |
| Descripciones de card | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |

`Card` (PrimeReact) hereda el tema global.

### 2. `Predictive.tsx` + `StatCard`/`RiskBadge`/`InfoList` (`UiRRHH.tsx`)

**`Predictive.tsx`:**

| Elemento | Antes | Después |
|---|---|---|
| Fondo (loading + raíz) | `bg-slate-50 dark:bg-slate-900` | `bg-background` |
| Ícono `Brain` (loading) | `text-cyan-500` | `text-primary` |
| Títulos/texto loading | `text-slate-700/500 dark:...` | `text-foreground`/`text-muted-foreground` |
| Caja ícono header | `bg-cyan-100 dark:bg-cyan-900/50` | `bg-primary/15` |
| Ícono `Zap` | `text-[#1ABCD7]` | `text-primary` |
| Título/subtítulo header | `text-slate-800 dark:text-white` / `text-slate-500 dark:text-slate-400` | `font-heading text-foreground` / `text-muted-foreground` |
| Botón "Volver" | `border-[#2ecbe7] text-[#1ABCD7] hover:bg-[#2ecbe7] hover:text-white` | `border-primary text-primary hover:bg-primary hover:text-primary-foreground` |
| `StatCard` "Empleados" (ícono+colorClass) | `text-cyan-500` / `bg-cyan-100 dark:bg-cyan-900/50` | `text-primary` / `bg-primary/15` |
| `StatCard` "Departamentos en Riesgo" | `text-red-500` / `bg-red-100 dark:bg-red-900/50` | `text-error` / `bg-error-soft` |
| `StatCard` "Productividad Promedio" | `text-green-500` / `bg-green-100 dark:bg-green-900/50` | `text-accent` / `bg-accent/15` |
| Cards de departamento (fondo/borde/hover) | `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#2ecbe7]` | `bg-card border-border hover:border-primary` |
| Barra de color por dept (`bg-${dept.color}-500`, dinámico desde datos) | sin cambios | sin cambios (fuera de alcance) |
| Textos internos de card (nombre/empleados/métricas) | `text-slate-800/600/500 dark:...` | `text-foreground`/`text-muted-foreground` |
| "Brechas de Habilidades" (título) | `text-red-600 dark:text-red-400` | `text-error` |
| Lista de brechas (texto) | `text-slate-700 dark:text-slate-300` | `text-foreground` |
| Borde divisor "Detalles del análisis" | `border-slate-200 dark:border-slate-700` | `border-border` |
| `InfoList` "Factores de Riesgo" (ícono) | `text-orange-500` | `text-warning` |
| `InfoList` "Perspectivas Clave" (ícono) | `text-yellow-500` | `text-warning` |
| `InfoList` "Recomendaciones IA" (ícono) | `text-cyan-500` | `text-primary` |
| Footer (caja/texto) | `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700` / `text-slate-500 dark:slate-400` | `bg-card border-border` / `text-muted-foreground` |

**`StatCard`/`RiskBadge`/`InfoList` en `UiRRHH.tsx` (líneas 983-1030, versiones activas — no las comentadas):**

| Componente | Elemento | Antes | Después |
|---|---|---|---|
| `StatCard` | caja | `bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-cyan-300` | `bg-card border-border hover:border-primary/40` |
| `StatCard` | título | `text-slate-400` | `text-muted-foreground` |
| `StatCard` | valor | `text-slate-800 dark:text-slate-100` | `text-foreground` |
| `RiskBadge` | Bajo | `bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300` | `bg-success-soft text-success-soft-foreground` |
| `RiskBadge` | Medio | `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300` | `bg-warning-soft text-warning-soft-foreground` |
| `RiskBadge` | Alto | `bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300` | `bg-warning-soft text-warning-soft-foreground` |
| `RiskBadge` | Crítico | `bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300` | `bg-error-soft text-error-soft-foreground` |
| `InfoList` | título | `text-slate-700 dark:text-slate-200` | `text-foreground` |
| `InfoList` | ítems | `text-slate-600 dark:text-slate-400` | `text-muted-foreground` |

### 3. `HRChatbot.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Botón "Volver" | `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white` | `text-muted-foreground hover:text-foreground` |
| Título | `text-gray-800 dark:text-white` | `font-heading text-foreground` |
| Subtítulo | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| Caja del chat | `bg-white dark:bg-gray-800` | `bg-card` |
| Burbuja usuario | `bg-blue-500 text-white` | `bg-primary text-primary-foreground` |
| Burbuja asistente | `bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white` | `bg-muted text-foreground` |
| Burbuja "escribiendo" (caja + puntos animados) | `bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white` / `bg-gray-500` (x3) | `bg-muted text-foreground` / `bg-muted-foreground` (x3) |
| Burbuja error | `bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300` | `bg-error-soft text-error-soft-foreground` |
| Borde área de input | `border-t dark:border-gray-700` | `border-t border-border` |
| Input de texto | `bg-gray-100 dark:bg-gray-900 focus:ring-blue-500` | `bg-muted focus:ring-primary` |
| Botón enviar | `bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800` | `bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground` |

### 4. `DepartmentOptimization.tsx` (con `RiskBadge`/`Section`/`StatCard` locales propios)

| Elemento | Antes | Después |
|---|---|---|
| `riskColors` (objeto local, Alto/Medio/Bajo) | `bg`/`text` con `red-100/700`, `yellow-100/700`, `green-100/700` (+ `dark:` variantes); `dot`: `bg-red-500`/`bg-yellow-500`/`bg-green-500` | `bg`/`text`: `bg-error-soft`/`text-error-soft-foreground`, `bg-warning-soft`/`text-warning-soft-foreground`, `bg-success-soft`/`text-success-soft-foreground`; `dot`: `bg-error`/`bg-warning`/`bg-success`; `border` (no usado en render actual, pero definido) se actualiza igual a `border-error`/`border-warning`/`border-success` |
| `Section` (caja) | `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700` | `bg-card border-border` |
| `Section` (hover botón) | `hover:bg-slate-50 dark:hover:bg-slate-700/50` | `hover:bg-muted` |
| `Section` (título) | `text-slate-800 dark:text-white` | `text-foreground` |
| `Section` (badge contador) | `bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300` | `bg-primary/15 text-primary` |
| `Section` (chevron, divisor interno) | `text-slate-400` / `border-slate-100 dark:border-slate-700` | `text-muted-foreground` / `border-border` |
| Loading: ícono `Brain` + ping | `text-cyan-500` / `bg-cyan-400` | `text-primary` / `bg-primary` |
| Loading: títulos/texto | `text-slate-700 dark:text-slate-300` / `text-slate-500 dark:text-slate-400` | `text-foreground` / `text-muted-foreground` |
| Loading: puntos animados | `bg-cyan-500` | `bg-primary` |
| Error: caja | `bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800` | `bg-error-soft border-error` |
| Error: ícono/título/texto | `text-red-500` / `text-red-700 dark:text-red-300` / `text-red-600 dark:text-red-400` | `text-error` / `text-error-soft-foreground` / `text-error` |
| Error: botón "Reintentar" | `bg-red-600 text-white hover:bg-red-700` | `bg-error text-error-soft-foreground hover:opacity-90` |
| Botón "Volver" (estado error) | `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white` | `text-muted-foreground hover:text-foreground` |
| Caja ícono header + `Zap` | `bg-cyan-100 dark:bg-cyan-900/50` / `text-[#1ABCD7]` | `bg-primary/15` / `text-primary` |
| Título/subtítulo header | `text-slate-800 dark:text-white` / `text-slate-500 dark:text-slate-400` | `font-heading text-foreground` / `text-muted-foreground` |
| Botón "Regenerar" | `border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white` | `border-primary text-primary hover:bg-primary hover:text-primary-foreground` |
| Botón "Volver" (header) | `border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700` | `border-border text-muted-foreground hover:bg-muted` |
| `StatCard` local — `colorMap` (cyan/green/red/purple) | `bg-cyan-100.../text-cyan-600`, `bg-green-100.../text-green-600`, `bg-red-100.../text-red-600`, `bg-purple-100.../text-purple-600` | `bg-primary/15 text-primary`, `bg-accent/15 text-accent`, `bg-error-soft text-error`, `bg-warm-contrast/15 text-warm-contrast` |
| `StatCard` local — caja/valor/label | `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700` / `text-slate-800 dark:text-white` / `text-slate-500 dark:text-slate-400` | `bg-card border-border` / `text-foreground` / `text-muted-foreground` |
| Ícono sección "Resumen Ejecutivo" (`FileText`) | `text-cyan-500` | `text-primary` |
| Ícono sección "Mapa de Calor" (`ShieldAlert`) | `text-orange-500` | `text-warning` |
| Ícono sección "Brechas de Habilidades" (`TrendingUp`) | `text-red-500` | `text-error` |
| Ícono sección "Propuestas de Reubicación" (`ArrowRightLeft`) | `text-purple-500` | `text-warm-contrast` |
| Ícono sección "Puntos Únicos de Fallo" (`AlertTriangle`) | `text-amber-500` | `text-warning` |
| Ícono sección "Plan de Acción" (`CheckCircle`) | `text-green-500` | `text-success` |
| Tablas (borde header/filas, texto header, hover, texto celdas) | `border-slate-700` (dark) / `text-slate-500 dark:text-slate-400` / `hover:bg-slate-50 dark:hover:bg-slate-700/30` / `text-slate-800 dark:text-white`, `text-slate-600 dark:text-slate-400` | `border-border` / `text-muted-foreground` / `hover:bg-muted` / `text-foreground`, `text-muted-foreground` |
| Mensajes "sin datos" (italic) | `text-slate-500 dark:text-slate-400` | `text-muted-foreground` |
| Cajas "Brechas de Habilidades" (borde/fondo) | `border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10` | `border-error bg-error-soft` |
| Badge "Nivel: X" | `bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300` | `bg-error-soft text-error-soft-foreground` |
| Texto "Falta: X" | `text-red-600 dark:text-red-400` | `text-error` |
| Badge "Dept. Sugerido" | `bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300` | `bg-warm-contrast/15 text-warm-contrast` |
| Cajas "Puntos Únicos de Fallo" (borde/fondo) | `border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10` | `border-warning bg-warning-soft` |
| Ícono `ShieldAlert` (SPOF) | `text-amber-500` | `text-warning` |
| Texto "criticalSkill" (SPOF) | `text-amber-600 dark:text-amber-400` | `text-warning` |
| "Plan de Acción" (badge numerado) | `bg-cyan-500 text-white` | `bg-primary text-primary-foreground` |
| "Plan de Acción" (caja de paso) | `bg-slate-50 dark:bg-slate-700/30` | `bg-muted` |
| Footer (caja/texto) | `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700` / `text-slate-500 dark:slate-400` | `bg-card border-border` / `text-muted-foreground` |

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `fetchPredictiveAnalysis` (`Predictive.tsx`); `handleSend` (`HRChatbot.tsx`); `fetchAnalysis` (`DepartmentOptimization.tsx`).
- El color dinámico `bg-${dept.color}-500` en `Predictive.tsx` (viene de datos del backend, no es un literal en este archivo).
- Otros módulos pendientes de esta tanda (Admin, TestConfig) — cada uno con su propio spec/plan.

## Testing

- Verificación visual manual: dashboard de selección, Análisis Predictivo (con departamentos y sin riesgo detectado), Chatbot de RRHH (mensajes, "escribiendo", error), Optimización de Departamentos (loading, error, las 6 secciones con y sin datos) — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
