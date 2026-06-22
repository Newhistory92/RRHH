# Retema de Estadísticas

## Contexto

El shell de navegación (sidebar/header/layout) y los tokens de diseño globales ya fueron retemados a la paleta "Orgánico Cálido" (ver `docs/superpowers/specs/2026-06-22-retheme-organic-warm-design.md`, mergeado a `main`). Ese retema dejó explícitamente fuera de alcance el contenido de las páginas (`src/app/screens/**` y `src/app/Componentes/**`), que todavía usa clases hardcodeadas (`bg-gray-*`, `text-indigo-*`, colores arbitrarios de gráficos) en vez de los tokens semánticos ya definidos.

Hay 10 módulos de contenido pendientes de retematizar. Este spec cubre **solo el primero: Estadísticas** — el resto se abordan como sub-proyectos separados, cada uno con su propio spec/plan, siguiendo el mismo patrón.

Estadísticas es la página de inicio por defecto para los roles ADMIN, RRHH y ESTADISTA (según `getDefaultPage` en `rbac.ts`), por lo que es el módulo de mayor visibilidad inmediata.

## Decisiones (de la sesión de brainstorming)

- **Alcance del cambio**: paleta + forma + reorganización visual (no solo color) — incluye migrar el componente `Card` de PrimeReact a `Card` de shadcn/ui para consistencia con el resto del sistema ya construido.
- **`DataTable`/`Dropdown` de PrimeReact** (usados en el ranking de productividad): se mantienen sin cambios de librería — solo se retemea el tema visual de PrimeReact. Bajo riesgo: no se toca lógica de sorting/filtrado que ya funciona.
- **Gráficos (recharts)**: se retemean con la paleta nueva (series de color, tooltips).
- **Tarjetas "hero"** (Mejor Departamento, Ausencias): mantienen su tratamiento en gradiente, pero usando la paleta nueva en vez de colores genéricos.
- **`DetailModal.tsx`** (modal de detalle de empleado): incluido en este spec, no diferido.
- **`getScoreColor`** (indicador de productividad, compartido entre `Productivity.tsx` y `DetailModal.tsx`): se simplifica de 5 niveles de color genéricos a 3 niveles usando los tokens semánticos `--color-success/warning/error` ya existentes (sin cambios desde la fase anterior).

## Archivos afectados

- `src/app/screens/Estadisticas/Screen.tsx`
- `src/app/Componentes/ComponEstadistica/Globalstat.tsx`
- `src/app/Componentes/ComponEstadistica/Productivity.tsx`
- `src/app/Componentes/ComponEstadistica/DetailModal.tsx`
- `src/app/util/UiRRHH.tsx` (solo la función `getScoreColor`)
- `src/app/page.tsx` (import del tema de PrimeReact)
- `src/app/globals.css` (overrides de variables de PrimeReact + instalación del componente `Card` de shadcn)

## Diseño

### 1. Migración de `Card` (PrimeReact → shadcn/ui)

Los 3 archivos que usan `Card` de `primereact/card` (`Globalstat.tsx`, `Productivity.tsx`, `DetailModal.tsx`) pasan a usar `Card`/`CardHeader`/`CardTitle`/`CardContent` de `@/components/ui/card` (componente shadcn nuevo a instalar, no existe todavía en el proyecto — los componentes instalados hasta ahora son `button, avatar, dropdown-menu, tooltip, separator, badge, sheet, skeleton`). `DataTable`/`Column`/`Dropdown` de PrimeReact NO se tocan — siguen importándose de `primereact/datatable`, `primereact/column`, `primereact/dropdown` sin cambios.

### 2. Tema de PrimeReact

`src/app/page.tsx` importa hoy:
```tsx
import "primereact/resources/themes/lara-light-cyan/theme.css";
```

Cambia a:
```tsx
import "primereact/resources/themes/lara-light-pink/theme.css";
```

Y en `src/app/globals.css`, fuera de los bloques `:root`/`.dark`/`@theme inline` ya existentes (en una sección nueva, al final del archivo), se agregan overrides de las variables CSS que el tema de PrimeReact expone:

```css
:root {
  --primary-color: #E7717D;
  --primary-color-text: #FFFFFF;
}
```

Esto afecta `DataTable` (fila seleccionada/hover), `Dropdown` (opción resaltada) y cualquier otro componente PrimeReact que consuma `--primary-color` — sin necesidad de recompilar el tema SCSS completo.

### 3. Mapeo de color en `Globalstat.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Tarjeta "Mejor Departamento" | `linear-gradient(to bottom right, #6366f1, #a855f7)` | `linear-gradient(to bottom right, var(--primary), var(--warm-contrast))` |
| Tarjeta "Ausencias" | `linear-gradient(to bottom right, #f43f5e, #f97316)` | `linear-gradient(to bottom right, var(--secondary), var(--muted))`, texto `text-foreground` (ya no blanco — el fondo es claro) |
| Tarjeta "Tardanzas" | `bg-white dark:bg-gray-800` | `bg-card` (clase Tailwind, ya mapeada al token) |
| Tarjeta "Actividades de baja eficiencia" | sin fondo especial, textos `text-gray-*` | textos `text-foreground`/`text-muted-foreground`, ícono `text-warm-contrast` en vez de `text-red-500` |
| Gráfico de barras — serie | `fill="#8884d8"` | `fill="var(--primary)"` |
| Gráfico de torta — `PIE_COLORS` | `['#8884d8', '#82ca9d', '#ffc658', '#ff8042']` | `['var(--primary)', 'var(--accent)', 'var(--warm-contrast)', 'var(--secondary)']` |
| Tooltips de ambos gráficos (`contentStyle`) | `backgroundColor: 'rgba(31,41,55,0.9)'`, texto blanco | `backgroundColor: 'var(--popover)'`, `color: 'var(--popover-foreground)'` |

Nota: recharts no permite clases Tailwind en sus props de color (`fill`, `contentStyle`) — se usan `var(--token)` directamente, ya que esas variables están disponibles globalmente vía `:root`/`.dark` (no requieren el namespace `@theme inline`, que es solo para generar utilidades Tailwind).

### 4. Mapeo de color en `Productivity.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Avatar circular (inicial del empleado) | `bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300` | `bg-warm-contrast text-warm-contrast-foreground` |
| Texto nombre/departamento | `text-gray-800 dark:text-gray-200` / `text-gray-500 dark:text-gray-400` | `text-foreground` / `text-muted-foreground` |
| Indicador de productividad (punto de color) | `getScoreColor(score)` → 5 niveles genéricos | `getScoreColor(score)` → 3 niveles semánticos (ver sección 6) |
| Mensaje "Sin resultados" (`emptyMessageTemplate`) | `text-gray-900 dark:text-white` / `text-gray-500 dark:text-gray-400` | `text-foreground` / `text-muted-foreground` |

El wrapper `<Card>` de PrimeReact (línea 177, 258) se reemplaza por `<Card>` de shadcn según la sección 1 — el contenido interno (filtros, `DataTable`, paginación) queda igual, solo cambia el contenedor.

### 5. Mapeo de color en `Screen.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Contenedor raíz | `bg-gray-100 dark:bg-gray-900 ... text-gray-900 dark:text-gray-100` | `bg-background text-foreground` |
| Título / subtítulo | `text-gray-900 dark:text-white` / `text-gray-600 dark:text-gray-400` | `text-foreground` / `text-muted-foreground`, título con clase `font-heading` (Fraunces, consistente con el resto del shell) |
| Botón "Actualizar" | `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700` | `bg-card border-border hover:bg-muted` |
| Pestaña activa | `border-b-2 border-[#2ecbe7] text-[#1ABCD7]` | `border-b-2 border-primary text-primary` |
| Pestaña inactiva (hover) | `text-gray-500 hover:text-blue-500` | `text-muted-foreground hover:text-primary` |
| Spinner de carga | `border-indigo-500` | `border-primary` |
| Estado de error (ícono/texto) | `text-red-400`, `text-gray-800 dark:text-white` | `text-error`, `text-foreground` |
| Botón "Reintentar" | `bg-indigo-600 hover:bg-indigo-700` | `bg-primary hover:opacity-90` |

### 6. `getScoreColor` simplificado

`src/app/util/UiRRHH.tsx`, función activa (línea ~962, hay una versión comentada más arriba que no se toca):

```ts
export const getScoreColor = (score?: number) => {
  if (score === undefined) return 'bg-muted';
  if (score >= 7) return 'bg-success';
  if (score >= 5) return 'bg-warning';
  return 'bg-error';
};
```

Cambia el umbral de 5 niveles (emerald ≥9 / lime ≥7 / yellow ≥5 / orange ≥3 / red <3) a 3 niveles (success ≥7 / warning ≥5 / error <5). Es la única función que cambia de comportamiento (no solo de color) en este spec — los demás cambios son puramente visuales.

### 7. `DetailModal.tsx`

Mismo tratamiento que `Globalstat.tsx`/`Productivity.tsx`: `Card` de PrimeReact → shadcn, gráfico de barras (recharts) con `fill="var(--primary)"`, clases `text-gray-*`/`bg-gray-*` reemplazadas por los tokens equivalentes (`text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`). El badge/indicador de productividad usa el mismo `getScoreColor` simplificado de la sección 6.

## Fuera de alcance

- Los otros 9 módulos de contenido (RRHH, Organigrama, Licencias, Feedback, IA, CV, Admin, ConfiguracionLicencias, TestConfig) — sub-proyectos futuros, mismo patrón.
- Lógica de fetch/datos (`fetchData`, `useEffect`, los 3 endpoints consumidos) — no se toca, solo presentación.
- El bug preexistente de tipo implícito en `DetailModal.tsx:200` (`(skill, index: number) =>`, parámetro `skill` sin tipo) — no relacionado con este retema, no se corrige aquí.
- Componentes PrimeReact más allá de `Card` (es decir, `DataTable`, `Column`, `Dropdown`, `ProgressSpinner` siguen siendo PrimeReact, solo cambia su tema visual global).

## Testing

- Verificación visual manual: login con un rol que vea Estadísticas (ADMIN/RRHH/ESTADISTA), revisar ambas pestañas (Ranking y Globales) en modo claro y oscuro, abrir el modal de detalle de un empleado, confirmar que gradientes/gráficos/indicadores de color reflejan la paleta nueva y que el tema de PrimeReact (`lara-light-pink` + overrides) se ve coherente con el resto de la UI.
- `npx tsc --noEmit` acotado a los archivos tocados, como en las fases anteriores (no hay test suite automatizado para cambios puramente visuales).
