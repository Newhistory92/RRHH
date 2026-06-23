# Retema de RRHH

## Contexto

Segundo sub-proyecto de la fase de retema de contenido (el primero, Estadísticas, ya está mergeado a `main`). Este cubre el módulo RRHH: ficha de empleados, vista de detalle (3 tabs), mensajes/licencias pendientes, y los modales de licencia/permiso.

A diferencia de Estadísticas, ningún componente de este módulo usa `Card` de PrimeReact — solo inputs/dropdowns/calendar/dialog/toast/progressbar, que ya heredan el tema `lara-light-pink` + override de `--primary-color` aplicado globalmente en la fase de Estadísticas (`src/app/page.tsx`, `src/app/globals.css`). Por lo tanto este spec es, casi en su totalidad, un reemplazo de clases Tailwind hardcodeadas por los tokens semánticos ya existentes — sin migraciones de librería.

## Decisiones (de la sesión de brainstorming)

- **Alcance**: un solo spec/plan cubre los 6 archivos del módulo (no se parte en sub-proyectos más chicos).
- **`StatusBadge`** (Activo/De licencia/Parte médico): mantiene el estilo de "pastilla suave" (fondo clarito + texto del mismo tono, más oscuro/saturado) en vez de pasar a fondo sólido — requiere 3 tokens nuevos (`--color-success-soft`, `--color-warning-soft`, `--color-error-soft`, cada uno con su `-foreground`).
- **`HoursDisplay`** (saldo de horas, positivo/negativo): usa `text-success`/`text-error` — mismo patrón ya usado en el modal de detalle de Estadísticas para `Employee.horas`.
- **`InfoCard`**: pasa de `bg-gray-50`/`border-gray-100`/`text-gray-400`/`text-gray-800` a `bg-muted`/`border-border`/`text-muted-foreground`/`text-foreground`.

## Archivos afectados

- `src/app/screens/RRHH/Screen.tsx`
- `src/app/Componentes/TablaOperador/Table.tsx`
- `src/app/Componentes/TablaOperador/Perfildetail.tsx`
- `src/app/Componentes/TablaOperador/MensajeDetail.tsx`
- `src/app/Componentes/TablaOperador/DetailTables.tsx`
- `src/app/Componentes/ModalRRHH/LicenseModal.tsx`
- `src/app/util/UiRRHH.tsx` (solo `StatusBadge`, `HoursDisplay`, `InfoCard`)
- `src/app/globals.css` (3 tokens nuevos `-soft`)

## Diseño

### 1. Tokens nuevos: variantes "soft" de success/warning/error

Definidos vía `color-mix()` relativo a `--background`, de modo que se adaptan automáticamente a modo claro/oscuro sin necesitar un bloque `.dark` separado — mismo patrón ya usado para `--border`/`--input`/`--ring` en el retema de tokens base:

```css
--color-success-soft: color-mix(in srgb, var(--color-success) 20%, var(--background));
--color-success-soft-foreground: var(--color-success);
--color-warning-soft: color-mix(in srgb, var(--color-warning) 20%, var(--background));
--color-warning-soft-foreground: var(--color-warning);
--color-error-soft: color-mix(in srgb, var(--color-error) 20%, var(--background));
--color-error-soft-foreground: var(--color-error);
```

En modo claro, `--background` es casi blanco → el resultado es un tinte pálido (ej. verde muy claro) con texto verde saturado encima. En modo oscuro, `--background` es oscuro → el resultado es un tinte oscuro con el mismo texto saturado, manteniendo contraste en ambos temas sin definir valores por separado.

### 2. Mapeo de color — utilidades compartidas (`UiRRHH.tsx`)

| Componente | Antes | Después |
|---|---|---|
| `StatusBadge` — Activo | `bg-green-100 text-green-800` | `bg-success-soft text-success-soft-foreground` |
| `StatusBadge` — De licencia | `bg-yellow-100 text-yellow-800` | `bg-warning-soft text-warning-soft-foreground` |
| `StatusBadge` — Parte médico | `bg-red-100 text-red-800` | `bg-error-soft text-error-soft-foreground` |
| `StatusBadge` — default (status desconocido) | `bg-gray-100 text-gray-800` | `bg-muted text-muted-foreground` |
| `HoursDisplay` — saldo positivo | `text-blue-600` | `text-success` |
| `HoursDisplay` — saldo negativo | `text-orange-600` | `text-error` |
| `InfoCard` — contenedor | `bg-gray-50 border-gray-100` | `bg-muted border-border` |
| `InfoCard` — ícono | `text-gray-400` | `text-muted-foreground` |
| `InfoCard` — título | `text-gray-400` | `text-muted-foreground` |
| `InfoCard` — contenido | `text-gray-800` | `text-foreground` |

### 3. Mapeo de color — el resto de los archivos

Mismo patrón aplicado en Estadísticas: cualquier `bg-gray-*`/`text-gray-*`/`border-gray-*` se reemplaza por su equivalente semántico (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`); acentos de color (`text-blue-*`, `text-indigo-*`, `bg-indigo-*`, etc.) pasan a `text-primary`/`bg-primary` salvo que el contexto sea claramente un estado success/warning/error, en cuyo caso usan esos tokens. Esto incluye:

- **`Screen.tsx`**: estado de carga (spinner/texto), fondo del contenedor raíz.
- **`Table.tsx`**: encabezados, filas, hover states, íconos de búsqueda/ordenamiento, badges de paginación.
- **`Perfildetail.tsx`**: header del perfil, avatar, textos secundarios.
- **`MensajeDetail.tsx`**: lista de mensajes pendientes, estados vacíos.
- **`DetailTables.tsx`**: las 3 tabs (Perfil, Historial de Licencias, Historial de Permisos) — labels de paso (`StepLabel`), secciones (`Section`), inputs nativos no-PrimeReact si los hay.
- **`LicenseModal.tsx`**: ambos modales (detalle de licencia, permiso).

No se listan líneas exactas en este spec dado el volumen (94+ ocurrencias entre los 6 archivos) — el plan de implementación hará el mapeo archivo por archivo con el detalle necesario, archivo por tarea.

## Fuera de alcance

- Migración de cualquier componente PrimeReact (InputText, Dropdown, Calendar, Button, Toast, InputMask, Dialog, ProgressBar, Avatar) a shadcn — ya heredan el tema global retemado, no se toca su librería.
- Lógica de fetch/estado (`fetchEmployeeData`, `handleApplyLicense`, etc.) — no se toca, solo presentación.
- Otros módulos pendientes (Organigrama, Licencias, Feedback, IA, CV, Admin, ConfiguracionLicencias, TestConfig).
- El sistema de tracking diario de horas (biométrico) — pendiente, fuera de esta fase.

## Testing

- Verificación visual manual: tabla de empleados (incluyendo badges de estado y saldo de horas en ambos signos), vista de detalle con sus 3 tabs, vista de mensajes/licencias pendientes, ambos modales — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
