# Retema de Organigrama

## Contexto

Cuarto sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH y CV ya están mergeados a `main`). Cubre el módulo Organigrama: el árbol visual de jerarquía (`OrganigramaGraf/`) y la gestión de departamentos/oficinas (`Orgamograma/`, formularios incluidos).

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Alcance:** se aborda el módulo completo (árbol visual + gestión de departamentos) en un solo spec/plan, no dividido en dos fases.
- **Colores por nivel jerárquico:** el árbol usa 5 colores distintos para diferenciar visualmente Dirección/Gerencia/Supervisión/Coordinación/Operativo. Se mantiene la distinción visual, pero los 5 colores genéricos de Tailwind (índigo/teal/ámbar/violeta/rosa) se reemplazan por los 5 tokens semánticos ya existentes en `globals.css`, que coinciden con los 5 tonos de la paleta Orgánico Cálido: `primary` (coral), `warm-contrast` (taupe), `accent` (lima), `secondary` (beige), `muted` (gris claro). No se crean tokens nuevos.
- **Variantes `dark:` explícitas:** varios componentes de `OrganigramaGraf/` usan clases `dark:` (ej. `text-gray-800 dark:text-white`), a diferencia del resto de la app que usa `color-mix()` automático sin bloques `.dark` separados. Se eliminan las clases `dark:` y se usan los tokens semánticos que ya se adaptan solos.
- **Selector "Oscuro/Claro" del organigrama:** es una funcionalidad propia del componente (cambia la intensidad de color de los nodos, no el tema claro/oscuro de la app) — se mantiene sin cambios de lógica; solo se recolorea con los mismos 5 tokens, usando opacidad reducida (`/15` fondo, `/30` borde) para la variante "Claro".

## Archivos afectados

**Árbol visual (`OrganigramaGraf/`):**
- `src/app/Componentes/OrganigramaGraf/orgChart.constants.ts` (NODE_COLORS, NODE_COLORS2, DEFAULT_NODE_COLOR, DEFAULT_NODE_COLOR2)
- `src/app/Componentes/OrganigramaGraf/OrgChart.tsx`
- `src/app/Componentes/OrganigramaGraf/OrgChartNode.tsx`
- `src/app/Componentes/OrganigramaGraf/OrgHeader.tsx`
- `src/app/Componentes/OrganigramaGraf/OrgLegend.tsx`
- `src/app/Componentes/OrganigramaGraf/OrgStats.tsx`
- `src/app/Componentes/OrganigramaGraf/ExpandButton.tsx`
- `src/app/Componentes/OrganigramaGraf/NodeCard.tsx` (sin cambios directos — colores vienen de `orgChart.constants.ts` vía `OrgChartUtils.getNodeColors`)

**Pantalla raíz:**
- `src/app/screens/Organigrama/Screen.tsx`

**Gestión de departamentos (`Orgamograma/`):**
- `src/app/Componentes/Orgamograma/DepartmentTree.tsx`
- `src/app/Componentes/Orgamograma/DepartmentTreeNode.tsx`
- `src/app/Componentes/Orgamograma/EmptyState.tsx`
- `src/app/Componentes/Orgamograma/DepartmentHeader.tsx`
- `src/app/Componentes/Orgamograma/DepartmentInfo.tsx`
- `src/app/Componentes/Orgamograma/DepartmentDetails.tsx`
- `src/app/Componentes/Orgamograma/OfficesList.tsx`
- `src/app/Componentes/Orgamograma/OfficeCard.tsx`
- `src/app/Componentes/Orgamograma/Departamento.tsx` (sin cambios directos — solo layout, sin colores hardcodeados)

**Modal de formularios (`Orgamograma/Componente/`):**
- `src/app/Componentes/Orgamograma/Componente/EntityFormModal.tsx`
- `src/app/Componentes/Orgamograma/Componente/BasicFields.tsx`
- `src/app/Componentes/Orgamograma/Componente/DepartmentFields.tsx`
- `src/app/Componentes/Orgamograma/Componente/OfficeFields.tsx`
- `src/app/Componentes/Orgamograma/Componente/FormActions.tsx`
- `src/app/Componentes/Orgamograma/Componente/SkillsField.tsx`
- `src/app/Componentes/Orgamograma/Componente/AddSkillDialog.tsx` (sin cambios directos — sin colores hardcodeados propios)
- `src/app/Componentes/Orgamograma/Componente/EmployeeTemplates.tsx` (sin cambios directos — sin colores hardcodeados propios)

## Diseño

### 1. Paleta de niveles jerárquicos (`orgChart.constants.ts`)

| Nivel | Antes (Oscuro) | Después (Oscuro) |
|---|---|---|
| 1 Dirección | `bg-indigo-600 text-white border-indigo-700` | `bg-primary text-primary-foreground border-primary` |
| 2 Gerencia | `bg-teal-600 text-white border-teal-700` | `bg-warm-contrast text-warm-contrast-foreground border-warm-contrast` |
| 3 Supervisión | `bg-amber-500 text-white border-amber-600` | `bg-accent text-accent-foreground border-accent` |
| 4 Coordinación | `bg-violet-600 text-white border-violet-700` | `bg-secondary text-secondary-foreground border-secondary` |
| 5 Operativo | `bg-rose-600 text-white border-rose-700` | `bg-muted text-foreground border-muted` |
| Default (`DEFAULT_NODE_COLOR`) | `bg-slate-500 text-white border-slate-600` | `bg-secondary text-secondary-foreground border-secondary` |

Variante "Claro" (`NODE_COLORS2`/`DEFAULT_NODE_COLOR2`, pastel): mismos 5 tokens con opacidad reducida y texto consistente:

| Nivel | Antes (Claro) | Después (Claro) |
|---|---|---|
| 1 Dirección | `bg-sky-200 text-slate-800 border-sky-400` | `bg-primary/15 text-foreground border-primary/30` |
| 2 Gerencia | `bg-emerald-200 text-slate-800 border-emerald-400` | `bg-warm-contrast/15 text-foreground border-warm-contrast/30` |
| 3 Supervisión | `bg-orange-200 text-slate-800 border-orange-400` | `bg-accent/15 text-foreground border-accent/30` |
| 4 Coordinación | `bg-fuchsia-200 text-slate-800 border-fuchsia-400` | `bg-secondary text-secondary-foreground border-secondary` |
| 5 Operativo | `bg-red-200 text-slate-800 border-red-400` | `bg-muted text-foreground border-muted` |
| Default (`DEFAULT_NODE_COLOR2`) | `bg-slate-200 text-slate-800 border-slate-400` | `bg-muted text-foreground border-border` |

`LEVEL_LABELS` no cambia (es texto, no color). `OrgChartUtils.getNodeColors`/`getLevelLabel` no cambian de lógica.

### 2. Eliminación de `dark:` y retema de `OrganigramaGraf/` + `Screen.tsx`

| Archivo | Elemento | Antes | Después |
|---|---|---|---|
| `OrgChart.tsx` | Fondo raíz | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| `OrgChart.tsx` | Texto ayuda (footer) | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| `OrgHeader.tsx` | Título | `text-gray-800 dark:text-white` | `font-heading text-foreground` |
| `OrgHeader.tsx` | Ícono `Building2` | `text-blue-500` | `text-primary` |
| `OrgStats.tsx` | Texto stats | `text-gray-600 dark:text-gray-300` | `text-muted-foreground` |
| `OrgLegend.tsx` | Caja | `bg-white dark:bg-gray-800` | `bg-card` |
| `OrgLegend.tsx` | Título | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| `OrgLegend.tsx` | Texto nivel | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| `ExpandButton.tsx` | Fondo/borde | `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600` | `bg-card border-border` |
| `ExpandButton.tsx` | Hover | `hover:bg-gray-100 dark:hover:bg-gray-700` | `hover:bg-muted` |
| `ExpandButton.tsx` | Focus ring | `focus:ring-blue-500` | `focus:ring-primary` |
| `OrgChartNode.tsx` | Línea conectora | `bg-gray-400 dark:bg-gray-500` | `bg-border` |
| `Screen.tsx` | Fondo raíz | `bg-gray-100` | `bg-background` |
| `Screen.tsx` | Título | `text-gray-800` | `font-heading text-foreground` |
| `Screen.tsx` | Subtítulo | `text-gray-600` | `text-muted-foreground` |
| `Screen.tsx` | Tab activo | `border-[#2ecbe7] text-[#1ABCD7]` | `border-primary text-primary` |
| `Screen.tsx` | Tab inactivo | `text-gray-500 hover:text-blue-500` | `text-muted-foreground hover:text-primary` |
| `Screen.tsx` | Borde nav tabs | `border-gray-200` | `border-border` |

El `SelectButton` (PrimeReact) y toda la lógica de expandir/colapsar/tema Oscuro-Claro quedan sin cambios.

### 3. Panel de árbol de departamentos (`DepartmentTree`, `DepartmentTreeNode`, `EmptyState`)

| Archivo | Elemento | Antes | Después |
|---|---|---|---|
| `DepartmentTree.tsx` | Título "Departamentos" | `text-gray-700` | `font-heading text-foreground` |
| `DepartmentTreeNode.tsx` | Ícono `Building2` | `text-gray-500` | `text-muted-foreground` |
| `DepartmentTreeNode.tsx` | Badge "Con jefe" | `bg-blue-100 text-blue-800` | `bg-primary/15 text-primary` |
| `EmptyState.tsx` | Ícono | `text-gray-400` | `text-muted-foreground` |
| `EmptyState.tsx` | Título | `text-gray-700` | `font-heading text-foreground` |
| `EmptyState.tsx` | Texto | `text-gray-500` | `text-muted-foreground` |

`Card`/`Button`/`Tree` (PrimeReact) heredan el tema global, sin cambios.

### 4. Panel de detalle (`DepartmentHeader`, `DepartmentInfo`, `DepartmentDetails`, `OfficesList`, `OfficeCard`)

| Archivo | Elemento | Antes | Después |
|---|---|---|---|
| `DepartmentHeader.tsx` | Título | `text-gray-900` | `font-heading text-foreground` |
| `DepartmentHeader.tsx` | Ícono `Building2` | `text-[#06B6D4]` | `text-primary` |
| `DepartmentInfo.tsx` | Ícono estrella | `text-yellow-500` | `text-warning` |
| `DepartmentInfo.tsx` | Cards internas | `bg-gray-50` | `bg-muted` |
| `DepartmentInfo.tsx` | Texto "No asignado" | `text-gray-500 italic` | `text-muted-foreground italic` |
| `DepartmentDetails.tsx` | Descripción depto | `text-gray-600` | `text-muted-foreground` |
| `DepartmentDetails.tsx` | Título "Empleados del Departamento" | `text-gray-800` | `font-heading text-foreground` |
| `DepartmentDetails.tsx` | Caja lista empleados | `bg-white border-gray-100` | `bg-card border-border` |
| `DepartmentDetails.tsx` | Chip empleado | `bg-gray-50 border-gray-200` | `bg-muted border-border` |
| `DepartmentDetails.tsx` | Texto "sin empleados" | `text-gray-500 italic` | `text-muted-foreground italic` |
| `OfficesList.tsx` | Título "Oficinas (N)" | `text-gray-800` | `font-heading text-foreground` |
| `OfficesList.tsx` | Caja vacía | `border-gray-300` / `text-gray-600` | `border-border` / `text-muted-foreground` |
| `OfficeCard.tsx` | Fondo card | `bg-gray-50 border-gray-200` | `bg-muted border-border` |
| `OfficeCard.tsx` | Título oficina | `text-gray-800` | `text-foreground` |
| `OfficeCard.tsx` | Ícono `Briefcase` | `text-[#06B6D4]` | `text-primary` |
| `OfficeCard.tsx` | Descripción oficina | `text-gray-600` | `text-muted-foreground` |
| `OfficeCard.tsx` | Botón editar | `text-gray-500 hover:text-blue-600` | `text-muted-foreground hover:text-primary` |
| `OfficeCard.tsx` | Caja "Jefe de Oficina" | `bg-white` | `bg-card` |
| `OfficeCard.tsx` | Texto "no asignado" (x2) | `text-gray-500 italic` / `text-sm text-gray-500 italic` | `text-muted-foreground italic` |
| `OfficeCard.tsx` | Avatar borde foto empleado | `border-gray-200` | `border-border` |
| `OfficeCard.tsx` | Error fallback (sin employees) | `text-red-500` | `text-error` |

### 5. Modal de formularios (`EntityFormModal`, `BasicFields`, `DepartmentFields`, `OfficeFields`, `FormActions`, `SkillsField`)

| Archivo | Elemento | Antes | Después |
|---|---|---|---|
| `EntityFormModal.tsx` | Overlay | `bg-black bg-opacity-50` | sin cambios (scrim) |
| `EntityFormModal.tsx` | Caja modal | `bg-white` | `bg-card` |
| `EntityFormModal.tsx` | Botón cerrar (X) | `text-gray-500 hover:text-gray-800` | `text-muted-foreground hover:text-foreground` |
| `EntityFormModal.tsx` | Título modal | `text-gray-800` | `font-heading text-foreground` |
| `BasicFields.tsx` | Labels (Nombre) | `text-gray-700` | `text-foreground` |
| `DepartmentFields.tsx` | Labels (Nivel Jerárquico, Depende de, Jefe de Área, Empleados del Departamento, Empleados Seleccionados) — 5 ocurrencias | `text-gray-700` | `text-foreground` |
| `OfficeFields.tsx` | Labels (Depende de, Jefe de Oficina, Empleados Asignados, Empleados Seleccionados) — 4 ocurrencias | `text-gray-700` | `text-foreground` |
| `SkillsField.tsx` | Label "Habilidades Requeridas" | `text-gray-700` | `text-foreground` |
| `FormActions.tsx` | Botón "Cancelar" | `bg-gray-200 text-gray-800 hover:bg-gray-300` | `bg-muted text-foreground hover:bg-border` |
| `FormActions.tsx` | Botón "Guardar Cambios" | `bg-blue-600 text-white hover:bg-blue-700` | `bg-primary text-primary-foreground hover:opacity-90` |

`Dropdown`/`MultiSelect`/`InputNumber`/`InputTextarea`/`FloatLabel`/`Avatar`/`AvatarGroup`/`Dialog`/`Button` (PrimeReact) heredan el tema global, sin cambios.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `refreshDepartments`, `handleSave`, `handleOpenModal`, `useDepartmentTree`, `useFormDataOrg`, `useSkillManagement`.
- Cálculo de jerarquía/stats: `OrgChartUtils.buildHierarchy`/`calculateStats` (solo se tocan los colores, no la lógica de `getNodeColors`).
- El bug ya registrado de `useSkillManagement`/habilidades técnicas (ver memoria de fixes pendientes) — es funcional, no se toca en este spec visual.
- Otros módulos pendientes (Licencias, Feedback, IA, Admin, ConfiguracionLicencias, TestConfig).

## Testing

- Verificación visual manual: árbol del organigrama (ambas variantes Oscuro/Claro, expandir/colapsar nodos), pestaña de gestión de departamentos (árbol izquierdo + panel de detalle derecho, con y sin departamento seleccionado), modal de creación/edición de departamento y de oficina — en modo claro y oscuro de la app.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
