# Retema de CV

## Contexto

Tercer sub-proyecto de la fase de retema de contenido (Estadísticas y RRHH ya están mergeados a `main`). Este cubre el módulo CV: ficha curricular del empleado (datos personales, formación académica, experiencia laboral, idiomas, habilidades técnicas/blandas, certificaciones), incluyendo el flujo de validación de habilidades técnicas (examen con IA).

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real (reducir clics, reorganizar formularios, etc.) es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **`SkillCard`** (componente compartido en `UiRRHH.tsx`, usado solo por CV): migra de `Card` de PrimeReact a `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter` de shadcn — mismo componente instalado en la fase de Estadísticas. `Tag`/`Button`/`ProgressBar` de PrimeReact dentro de `SkillCard` se mantienen sin cambios.
- **`TestModal.tsx`** (en `Componentes/Validaciones/`, fuera de la carpeta `CvComponente/` pero parte del flujo de validación de habilidades abierto desde `HabilidadesTecnicas.tsx`): incluido en este spec.
- **`UiCv.tsx`**: solo `SectionTitle` se retemea (es el único export realmente usado, por `Screen.tsx`). `Card`, `Accordion`, `Input`, `Select`, `FieldLabel` son código muerto (ningún archivo de `CvComponente/` los importa) — no se tocan, mismo criterio que el código comentado de `UiRRHH.tsx` en la fase de RRHH.
- **`DynamicSectionCv.tsx`** (en `Componentes/Perfil/`, fuera de `CvComponente/` pero usado por 4 de los 7 componentes — `FormacionAcademica`, `ExperienciaLaboral`, `Idiomas`, `CertificacionesCursos` delegan todo su renderizado de campos a este componente compartido): agregado al alcance tras revisión — sin él, esas 4 secciones quedarían sin retematizar. Incluido en este spec.

## Archivos afectados

- `src/app/screens/Cv/Screen.tsx`
- `src/app/Componentes/CvComponente/DatosPersonales.tsx`
- `src/app/Componentes/CvComponente/FormacionAcademica.tsx` (sin cambios directos — ver `DynamicSectionCv.tsx`)
- `src/app/Componentes/CvComponente/ExperienciaLaboral.tsx` (sin cambios directos — ver `DynamicSectionCv.tsx`)
- `src/app/Componentes/CvComponente/Idiomas.tsx` (sin cambios directos — ver `DynamicSectionCv.tsx`)
- `src/app/Componentes/CvComponente/HabilidadesTecnicas.tsx`
- `src/app/Componentes/CvComponente/HabilidadesBlandas.tsx`
- `src/app/Componentes/CvComponente/CertificacionesCursos.tsx` (sin cambios directos — ver `DynamicSectionCv.tsx`)
- `src/app/Componentes/CvComponente/SkillTest.tsx`
- `src/app/Componentes/Validaciones/TestModal.tsx`
- `src/app/Componentes/Perfil/DynamicSectionCv.tsx`
- `src/app/util/UiCv.tsx` (solo `SectionTitle`)
- `src/app/util/UiRRHH.tsx` (solo `SkillCard` y `ProfilePictureUploader`)

## Diseño

### 1. Migración de `SkillCard`

`SkillCard` (en `UiRRHH.tsx`) usa hoy `Card` de `primereact/card` con props `title`/`footer`. Pasa a usar `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter` de `@/components/ui/card` (ya instalado, sin pasos de instalación nuevos en este spec). `Tag` (severity success/danger) y `Button`/`ProgressBar` dentro del componente se mantienen como PrimeReact, heredando el tema global ya retemado.

### 2. `SectionTitle` y formularios

`SectionTitle` (ícono + título de sección en `Screen.tsx`): `text-[#1ABCD7]` (ícono) → `text-primary`; `text-gray-800` (título) → `font-heading text-foreground`.

Patrón repetido en los 5 componentes de datos (`DatosPersonales`, `FormacionAcademica`, `ExperienciaLaboral`, `Idiomas`, `CertificacionesCursos`): labels de campo `text-gray-700`/`text-sm font-medium` → `text-foreground`. Los componentes de PrimeReact (`InputText`, `Dropdown`, `Calendar`, `Accordion`/`AccordionTab`) ya heredan el tema `lara-light-pink` global — no se tocan.

### 3. `HabilidadesBlandas` (checkbox list)

- Checkbox: `border-gray-300 text-blue-600 focus:ring-blue-500` → `border-border text-primary focus:ring-primary`.
- Fila seleccionable: `hover:bg-gray-50` (habilitado) / `bg-gray-50` (deshabilitado) → `hover:bg-muted` / `bg-muted`.
- Nombre de habilidad `text-gray-900` → `text-foreground`; descripción `text-gray-500` → `text-muted-foreground`.

### 4. `SkillTest.tsx` y `TestModal.tsx` (examen de habilidad)

Ambos archivos implementan el mismo flujo (examen de opción múltiple con resultado aprobado/reprobado) de forma independiente — se retemean con el mismo mapeo en los dos:

| Elemento | Antes | Después |
|---|---|---|
| Ícono/resultado aprobado | `text-green-500` | `text-success` |
| Ícono/resultado reprobado | `text-red-500` | `text-error` |
| Caja de mensaje aprobado | `bg-green-50 text-green-800`/`text-green-700` | `bg-success-soft text-success-soft-foreground` |
| Caja de mensaje reprobado | `bg-red-50 text-red-800`/`text-red-700` | `bg-error-soft text-error-soft-foreground` |
| Nivel "Bueno" (`SkillTest.tsx`, texto del nivel) | `text-blue-600` | `text-primary` |
| Timer en alerta (`TestModal.tsx`, <60s) | `bg-red-100 text-red-600` | `bg-error-soft text-error-soft-foreground` |
| Timer normal (`TestModal.tsx`) | `bg-gray-200 text-gray-700` | `bg-muted text-muted-foreground` |
| Textos generales (preguntas, labels, contadores) | `text-gray-600`/`text-gray-700`/`text-gray-800`/`text-gray-500` | `text-muted-foreground`/`text-foreground` según corresponda |
| Tarjetas de pregunta (`TestModal.tsx`) | `bg-white border-gray-100` | `bg-card border-border` |
| Opciones de respuesta (hover) | `hover:bg-gray-50` | `hover:bg-muted` |

Los tokens `bg-success-soft`/`bg-error-soft` (y sus `-foreground`) ya existen desde la fase de RRHH — no se crean tokens nuevos en este spec.

### 5. `DynamicSectionCv.tsx` (renderizado compartido de campos)

| Elemento | Antes | Después |
|---|---|---|
| Botón "Añadir nuevo registro" (2 ocurrencias) | `border-dashed border-gray-400 text-gray-700 hover:bg-gray-50` | `border-dashed border-border text-foreground hover:bg-muted` |
| Labels de campo (texto/select/file, 3 ocurrencias) | `text-gray-700` | `text-foreground` |
| Asterisco de campo requerido (2 ocurrencias) | `text-red-500` | `text-error` |
| Checkbox | `border-gray-300 text-blue-600 focus:ring-blue-500` | `border-border text-primary focus:ring-primary` |
| Input de archivo | `border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50` | `border-border focus:ring-primary focus:border-primary disabled:bg-muted` |
| Badge "✓ Verificado" | `text-green-700 bg-green-100` | `bg-success-soft text-success-soft-foreground` |
| Botón "Verificar" | `text-blue-500 hover:text-blue-700 hover:bg-blue-50 bg-white` | `text-primary hover:opacity-80 hover:bg-primary/10 bg-card` |
| Botón eliminar (ícono papelera) | `text-red-500 hover:text-red-700 hover:bg-red-100 bg-white` | `text-error hover:opacity-80 hover:bg-error-soft bg-card` |
| Ícono "Formación destacada" (estrella) | `text-yellow-400` | `text-warning` |

### 6. `ProfilePictureUploader`

`border-4 border-white` (anillo del avatar) → `border-4 border-card`. El overlay de hover (`bg-black/50`, ícono/texto blanco) se mantiene igual — es un scrim sobre la foto, no un color de superficie del tema.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX (reducir clics, reorganizar formularios, validaciones nuevas, etc.) — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado, generación de exámenes con IA (Gemini, `/api/skill-validation/*`).
- Código muerto de `UiCv.tsx` (`Card`, `Accordion`, `Input`, `Select`, `FieldLabel`).
- Otros módulos pendientes (Organigrama, Licencias, Feedback, IA, Admin, ConfiguracionLicencias, TestConfig).

## Testing

- Verificación visual manual: ficha de CV completa en modo lectura y edición (los 7 componentes), examen de validación de habilidad técnica con resultado aprobado y reprobado (ambos flujos: `SkillTest.tsx` y `TestModal.tsx`) — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
