# Retema de ConfiguracionLicencias

## Contexto

Sexto sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV, Organigrama y Licencias ya están mergeados a `main`). Cubre la pantalla de Configuración General (`ConfiguracionLicencias/Screen.tsx`): 5 tabs (Reglas de Licencias, Tipos de Contrato, Profesiones y Cargos, Habilidades Blandas, Régimen Horario) y 4 modales (Licencia, Contrato, Profesión, Jornada), más el componente `SoftSkills.tsx` usado en la pestaña de Habilidades Blandas.

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Color de marca (`indigo-*`)**: este módulo usa índigo como acento (distinto del cian de Licencias/CV o el `#1ABCD7` de RRHH) — se mapea uniformemente a `primary`, igual criterio que las fases anteriores con sus respectivos acentos.
- **Notificación toast** (éxito/error verde/rojo): usa el patrón "soft" ya establecido (`bg-success-soft`/`bg-error-soft`).
- **`SoftSkills.tsx`**: tiene clases `dark:` explícitas (a diferencia del resto de la app, que usa `color-mix()` automático sin bloques `.dark` separados) — se eliminan y se usan tokens semánticos, mismo criterio aplicado en la fase de Organigrama.
- **4 modales con estructura idéntica** (Licencia, Contrato, Profesión, Jornada): comparten exactamente el mismo patrón de clases (overlay, caja, header, labels, botones) — se retemean los 4 con el mismo mapeo.
- **Inputs/selects/textareas nativos**: mantienen su `border rounded-xl` genérico sin color de borde hardcodeado explícito (heredan el borde por defecto del navegador) — fuera de alcance, no es un color de marca a recolorear.

## Archivos afectados

- `src/app/screens/ConfiguracionLicencias/Screen.tsx`
- `src/app/Componentes/TestComponent/SoftSkills.tsx`

## Diseño

### 1. Notificación toast, header y tabs

| Elemento | Antes | Después |
|---|---|---|
| Toast éxito | `bg-green-50 border-green-200 text-green-800` | `bg-success-soft border-success text-success-soft-foreground` |
| Toast error | `bg-red-50 border-red-200 text-red-800` | `bg-error-soft border-error text-error-soft-foreground` |
| Fondo raíz | `bg-gray-100` ... `text-gray-900` | `bg-background` ... `text-foreground` |
| Ícono header (caja) | `bg-indigo-600` ... `shadow-indigo-200` | `bg-primary` ... `shadow-primary/20` |
| Título "Configuración General" | `text-gray-900` | `font-heading text-foreground` |
| Subtítulo | `text-gray-500` | `text-muted-foreground` |
| Caja de tabs | `bg-white border-gray-200` | `bg-card border-border` |
| Tab activo (`TabButton`) | `border-indigo-600 text-indigo-600 bg-indigo-50/50` | `border-primary text-primary bg-primary/10` |
| Tab inactivo | `text-gray-500 hover:text-gray-700 hover:border-gray-300` | `text-muted-foreground hover:text-foreground hover:border-border` |

### 2. Tab "Licencias" (tabla de cupos)

| Elemento | Antes | Después |
|---|---|---|
| Loading: caja | `bg-white border-gray-200` | `bg-card border-border` |
| Loading: spinner | `text-indigo-500` | `text-primary` |
| Loading: texto | `text-gray-400` | `text-muted-foreground` |
| Caja del tab (panel blanco) | `bg-white border-gray-200` | `bg-card border-border` |
| Título "Cupos de Licencias Anuales" | `text-gray-800` | `font-heading text-foreground` |
| Input de búsqueda | `border-gray-200 focus:ring-indigo-500` / ícono `text-gray-400` | `border-border focus:ring-primary` / ícono `text-muted-foreground` |
| Botón "Nueva Regla" | `bg-indigo-600 hover:bg-indigo-700 text-white` | `bg-primary hover:opacity-90 text-primary-foreground` |
| Header tabla | `bg-gray-50 border-gray-100 text-gray-400` / hover `hover:text-indigo-500` | `bg-muted border-border text-muted-foreground` / hover `hover:text-primary` |
| `SortIcon` inactivo/activo | `text-gray-300` / `text-indigo-500` | `text-muted-foreground` / `text-primary` |
| Filas tabla (divisor, hover) | `divide-gray-50` / `hover:bg-gray-50/50` | `divide-border` / `hover:bg-muted` |
| Celda año | `text-gray-500` | `text-muted-foreground` |
| Badge tipo contrato | `bg-indigo-50 text-indigo-700` | `bg-primary/15 text-primary` |
| Celda categoría | `text-gray-700` | `text-foreground` |
| Badge cupo (días) | `bg-gray-100 text-gray-600 border-gray-200` | `bg-muted text-foreground border-border` |
| Botón editar fila | `text-gray-400 hover:text-indigo-600` | `text-muted-foreground hover:text-primary` |
| Botón eliminar fila | `text-gray-400 hover:text-red-600` | `text-muted-foreground hover:text-error` |
| Texto "no se encontraron reglas" | `text-gray-400` | `text-muted-foreground` |

### 3. Tab "Contratos" (cards de tipos de contrato)

| Elemento | Antes | Después |
|---|---|---|
| Título "Tipos de Contrato Disponibles" | `text-gray-800` | `font-heading text-foreground` |
| Botón "Nuevo Contrato" | `bg-indigo-600 hover:bg-indigo-700 text-white` | `bg-primary hover:opacity-90 text-primary-foreground` |
| Card de contrato | `border-gray-200 bg-white hover:border-indigo-200` | `border-border bg-card hover:border-primary/40` |
| Nombre contrato | `text-gray-900` | `text-foreground` |
| Badge "key" | `bg-indigo-50 text-indigo-700` | `bg-primary/15 text-primary` |
| Descripción | `text-gray-500` | `text-muted-foreground` |
| Divisor footer card | `border-gray-100` | `border-border` |
| Botón "Editar" | `text-indigo-600 hover:bg-indigo-50` | `text-primary hover:bg-primary/10` |
| Botón "Desactivar" | `text-red-600 hover:bg-red-50` | `text-error hover:bg-error-soft` |

### 4. Tab "Profesiones" y Tab "Horarios"

**Profesiones (tabla):**

| Elemento | Antes | Después |
|---|---|---|
| Título "Catálogo de Profesiones y Cargos" | `text-gray-800` | `font-heading text-foreground` |
| Botón "Nueva Profesión" | `bg-indigo-600 hover:bg-indigo-700 text-white` | `bg-primary hover:opacity-90 text-primary-foreground` |
| Header tabla | `bg-gray-50 border-gray-100 text-gray-400` | `bg-muted border-border text-muted-foreground` |
| Filas (divisor, hover) | `divide-gray-50` / `hover:bg-gray-50/50` | `divide-border` / `hover:bg-muted` |
| Nombre profesión | `text-gray-700` | `text-foreground` |
| Descripción | `text-gray-500` | `text-muted-foreground` |
| Botón editar | `text-gray-400 hover:text-indigo-600` | `text-muted-foreground hover:text-primary` |
| Botón desactivar | `text-gray-400 hover:text-red-600` | `text-muted-foreground hover:text-error` |
| Texto "no hay profesiones" | `text-gray-400` | `text-muted-foreground` |

**Horarios (jornadas laborales):**

| Elemento | Antes | Después |
|---|---|---|
| Título "Jornadas Laborales..." | `text-gray-800` | `font-heading text-foreground` |
| Botón "Nueva Jornada" | `text-indigo-600 hover:bg-indigo-50 border-indigo-200` | `text-primary hover:bg-primary/10 border-primary/30` |
| Card jornada | `border-gray-100 bg-gray-50` | `border-border bg-muted` |
| Nombre jornada | `text-gray-900` | `text-foreground` |
| Horas/día | `text-gray-500` | `text-muted-foreground` |
| Botón editar | `text-gray-400 hover:text-indigo-600` | `text-muted-foreground hover:text-primary` |
| Botón eliminar | `text-gray-400 hover:text-red-600` | `text-muted-foreground hover:text-error` |

### 5. Los 4 modales (Licencia, Contrato, Profesión, Jornada) — estructura idéntica repetida

| Elemento | Antes | Después |
|---|---|---|
| Overlay (backdrop) | `bg-gray-900/60 backdrop-blur-sm` | sin cambios (scrim, no es color de superficie) |
| Caja del modal | `bg-white border-gray-100` | `bg-card border-border` |
| Divisor header | `border-gray-100` | `border-border` |
| Título modal | `text-gray-900` | `font-heading text-foreground` |
| Botón cerrar (X) | `text-gray-400 hover:text-gray-600` | `text-muted-foreground hover:text-foreground` |
| Labels de campo (~9 ocurrencias entre los 4 modales) | `text-gray-700` | `text-foreground` |
| Input "key" deshabilitado (Modal Contrato) | `disabled:bg-gray-100` | `disabled:bg-muted` |
| Botón "Cancelar" (×4) | `bg-gray-100 hover:bg-gray-200` | `bg-muted hover:bg-border` |
| Botón "Guardar" (×4) | `bg-indigo-600 hover:bg-indigo-700 text-white` | `bg-primary hover:opacity-90 text-primary-foreground` |

### 6. `SoftSkills.tsx` — eliminar `dark:` y retemear

| Elemento | Antes | Después |
|---|---|---|
| Título "Añadir Nueva Habilidad Blanda" (×2, ambas `Card`) | `text-gray-700 dark:text-gray-200` | `font-heading text-foreground` |
| Labels de campo (×2: "Nombre...", "Descripción") | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| Texto "Aún no se han creado..." | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| Texto "Agrega la primera..." | `text-gray-400 dark:text-gray-500` | `text-muted-foreground` |
| Card de habilidad existente | `bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700/70` | `bg-muted hover:bg-border` |
| Nombre habilidad | `text-gray-800 dark:text-white` | `text-foreground` |
| Descripción habilidad | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Botón "Eliminar" | `text-red-500 hover:text-red-700` | `text-error hover:opacity-80` |

`Card`/`InputText`/`InputTextarea`/`Button` (PrimeReact) heredan el tema global, sin cambios. La clase `input-style` (definida en CSS global, no en este archivo) queda fuera de alcance.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `loadAllData`, todos los `handleSave*`/`handleDelete*`, `handleAddSoftSkill`, `handleDeleteSoftSkill`, `sortedLicencias`, `toggleSort`.
- Estilo de borde de `input`/`select`/`textarea` nativos (sin color hardcodeado explícito).
- Otros módulos pendientes (Feedback, IA, Admin, TestConfig).

## Testing

- Verificación visual manual: las 5 pestañas (con datos y con listas vacías), los 4 modales (crear y editar), la notificación toast (éxito y error) — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
