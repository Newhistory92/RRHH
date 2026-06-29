# Retema de TestConfig

## Contexto

Décimo y último sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV, Organigrama, Licencias, ConfiguracionLicencias, Feedback, IA y Admin ya están mergeados a `main`). Cubre el módulo de Gestión de Tests: la pantalla raíz (`TestConfig/Screen.tsx`), `TechnicalTests.tsx` y `CreateTestModal.tsx`.

Es el tercero y último de los 3 specs/planes separados (IA, Admin, TestConfig) acordados para cerrar la iniciativa de retema.

Justo antes de este spec se eliminó el tab duplicado "Habilidades Blandas" de `Screen.tsx` (ya gestionado en ConfiguracionLicencias) — cambio funcional ya commiteado en `main`, no parte de este spec.

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Color cian/azul genérico** (`#1ABCD7`, `#2ecbe7`, `blue-*`, acento de marca en los 3 archivos): se mapea a `primary`, mismo criterio que las fases anteriores.
- **Badges de tipo de test** ("Multiple Choice" morado, "Caso de Estudio" verde — distinción de categoría, no de estado): se mapean a `accent` y `warm-contrast` respectivamente, mismo criterio que las categorías de `StatCard` en IA y los iconos de tipo de licencia.
- **Tarjetas de stats en `Screen.tsx`** (cian/morado/verde para Total Profesiones/Tests Técnicos/Habilidades Blandas): se mapean a `primary`/`accent`/`warm-contrast` respectivamente.
- **Eliminación de `dark:`**: los 3 archivos usan `dark:` extensamente — se eliminan, usando los tokens semánticos que se adaptan solos, mismo criterio que Organigrama, ConfiguracionLicencias e IA.

## Archivos afectados

- `src/app/screens/TestConfig/Screen.tsx`
- `src/app/Componentes/TestComponent/TechnicalTests.tsx`
- `src/app/Componentes/TestComponent/CreateTestModal.tsx`

## Diseño

### 1. `Screen.tsx` (pantalla raíz, único tab restante tras la eliminación de Habilidades Blandas)

| Elemento | Antes | Después |
|---|---|---|
| Loading: fondo | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| Loading: caja | `bg-white dark:bg-gray-800` | `bg-card` |
| Loading: spinner | `border-[#1ABCD7]` | `border-primary` |
| Loading: texto | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Fondo raíz | `bg-gray-50 dark:bg-gray-900` | `bg-background` |
| Título "Gestión de Tests" | `text-gray-800 dark:text-white` | `font-heading text-foreground` |
| Subtítulo | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Borde nav tabs | `border-gray-200 dark:border-gray-700` | `border-border` |
| Tab activo (único, "Tests Técnicos") | `border-[#2ecbe7] text-[#1ABCD7]` | `border-primary text-primary` |
| Tab inactivo (ternario, sin uso actual pero presente en el código) | `text-gray-500 hover:text-blue-500` | `text-muted-foreground hover:text-primary` |
| Cards de stats (caja) | `bg-white dark:bg-gray-800` | `bg-card` |
| Cards de stats (label) | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Cards de stats (valor) | `text-gray-900 dark:text-white` | `text-foreground` |
| Ícono "Total Profesiones" | `bg-blue-100 dark:bg-blue-900` | `bg-primary/15` |
| Ícono "Tests Técnicos" | `bg-purple-100 dark:bg-purple-900` | `bg-accent/15` |
| Ícono "Habilidades Blandas" | `bg-green-100 dark:bg-green-900` | `bg-warm-contrast/15` |

### 2. `TechnicalTests.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Label "Seleccionar Profesión" | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| Título "Tests para [profesión]" | `text-gray-700 dark:text-gray-200` | `font-heading text-foreground` |
| Nombre de la profesión (resaltado) | `text-blue-500` | `text-primary` |
| Contador "N tests" | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| Estado vacío: texto principal | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| Estado vacío: texto secundario | `text-gray-400 dark:text-gray-500` | `text-muted-foreground` |
| Estado vacío: botón "Crear Primer Test" | `text-blue-500 hover:text-blue-600` | `text-primary hover:opacity-80` |
| Card de test (fondo) | `bg-gray-50 dark:bg-gray-700/50` | `bg-muted` |
| Card de test (hover) | `hover:bg-gray-100 dark:hover:bg-gray-700/70` | `hover:bg-border` |
| Nombre del test | `text-gray-800 dark:text-white` | `text-foreground` |
| Descripción del test | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Contador de preguntas | `text-gray-500 dark:text-gray-500` | `text-muted-foreground` |
| Badge "Multiple Choice" | `bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300` | `bg-accent/15 text-accent` |
| Badge "Caso de Estudio" | `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300` | `bg-warm-contrast/15 text-warm-contrast` |
| Botón eliminar test (papelera) | `text-red-500 hover:text-red-700` | `text-error hover:opacity-80` |
| Label modal "Seleccione la Especialidad" | `text-gray-700` | `text-foreground` |
| Texto ayuda modal (italic) | `text-gray-500` | `text-muted-foreground` |

`Card`/`Dropdown`/`Button`/`Dialog` (PrimeReact) heredan el tema global, sin cambios.

### 3. `CreateTestModal.tsx`

| Elemento | Antes | Después |
|---|---|---|
| Overlay | `bg-black bg-opacity-50` | sin cambios (scrim) |
| Caja del modal | `bg-white dark:bg-gray-800` | `bg-card` |
| Borde header | `border-b dark:border-gray-700` | `border-b border-border` |
| Borde sección preguntas | `border-t dark:border-gray-700` | `border-t border-border` |
| Borde sección caso de estudio | `border-t dark:border-gray-700` | `border-t border-border` |
| Borde footer | `border-t dark:border-gray-700` | `border-t border-border` |
| Título "Crear Nuevo Test para..." | `text-gray-800 dark:text-white` | `font-heading text-foreground` |
| Botón cerrar (X) | `text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200` | `text-muted-foreground hover:text-foreground` |
| Labels "Nombre del Test"/"Tipo de Test"/"Descripción" | `text-gray-700 dark:text-gray-300` | `text-foreground` |
| Título "Preguntas (N/10)" | `text-gray-700 dark:text-gray-200` | `text-foreground` |
| Card de pregunta (borde) | `border dark:border-gray-600` | `border border-border` |
| Label "Pregunta N" | `text-gray-700 dark:text-gray-200` | `text-foreground` |
| Botón eliminar pregunta (papelera) | `text-red-500 hover:text-red-700` | `text-error hover:opacity-80` |
| Label "Respuestas:" | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| Botón eliminar respuesta (X) | `text-red-500 hover:text-red-700` | `text-error hover:opacity-80` |
| Botón "Añadir Respuesta" | `text-blue-600 hover:text-blue-800` | `text-primary hover:opacity-80` |
| Label "Escenario del Caso de Estudio" | `text-gray-700 dark:text-gray-200` | `text-foreground` |
| Caja de error IA (fondo/borde) | `bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800` | `bg-error-soft border-error` |
| Ícono error IA | `text-red-500` | `text-error` |
| Texto error IA | `text-red-700 dark:text-red-300` | `text-error-soft-foreground` |
| Botón cerrar error IA | `text-red-500 hover:text-red-700` | `text-error hover:opacity-80` |
| Caja "Tip" IA (fondo) | `bg-blue-50 dark:bg-blue-900/20` | `bg-primary/15` |
| Texto "Tip" IA | `text-blue-600 dark:text-blue-400` | `text-primary` |
| Footer (fondo) | `bg-gray-50 dark:bg-gray-800/50` | `bg-muted` |
| Footer texto contador | `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |

`Card`/`Dropdown`/`InputText`/`InputTextarea`/`Checkbox`/`Button` (PrimeReact) heredan el tema global, sin cambios.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `handleSelectedProfessionChange`, `handleAddProfession`, `handleSaveTest`, `handleDeleteTest` (`Screen.tsx`); todos los handlers de preguntas/respuestas, `handleGenerateWithAI`, `handleSubmit`, `useCaseStudyGeneration` (`CreateTestModal.tsx`); `handleAddNewProfession`, `handleSaveTest` (`TechnicalTests.tsx`).
- El error de tipos pre-existente sobre `argentinianDegrees`/`TechnicalTestsProps` (no relacionado a color, fuera de alcance de un spec visual).
- Otros módulos — este es el último de los 10 sub-proyectos de la fase de retema.

## Testing

- Verificación visual manual: pantalla con tests cargados y sin tests, modal de creación de test (Multiple Choice y Caso de Estudio, incluyendo el estado de error de generación con IA), modal de añadir profesión — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
