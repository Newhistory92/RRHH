# Retema de Feedback

## Contexto

Séptimo sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV, Organigrama, Licencias y ConfiguracionLicencias ya están mergeados a `main`). Cubre el módulo de Feedback 360°: la pantalla raíz (`Feedback/Screen.tsx`) y el componente de encuesta (`Encuesta/FeedbackTab.tsx`).

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Color de marca (`indigo-*`)**: este módulo usa índigo como acento, igual que ConfiguracionLicencias — se mapea uniformemente a `primary`, mismo criterio que la fase anterior.
- **Ícono verde decorativo** (`MessageSquare`, título de la card de encuesta en `FeedbackTab.tsx`): es un solo ícono aislado, no forma parte de un patrón de distinción por categoría (a diferencia de los iconos de tipo de licencia en la fase de Licencias) — se colapsa a `primary` sin necesidad de preservar un color distinto.

## Archivos afectados

- `src/app/screens/Feedback/Screen.tsx`
- `src/app/Componentes/Encuesta/FeedbackTab.tsx`

## Diseño

### 1. `Screen.tsx` (pantalla raíz)

| Elemento | Antes | Después |
|---|---|---|
| Loading: fondo | `bg-gray-100` | `bg-background` |
| Loading: ícono | `text-indigo-400` | `text-primary` |
| Loading: texto | `text-gray-600` | `text-muted-foreground` |
| Error: fondo | `bg-gray-100` | `bg-background` |
| Error: caja | `bg-white` | `bg-card` |
| Error: ícono | `text-red-400` | `text-error` |
| Error: texto | `text-red-600` | `text-error` |
| Botón "Reintentar" | `bg-indigo-600 text-white hover:bg-indigo-700` | `bg-primary text-primary-foreground hover:opacity-90` |
| Fondo raíz | `bg-gray-100` ... `text-gray-800` | `bg-background` ... `text-foreground` |
| Título "Sistema de Feedback 360°" | `text-gray-800` | `font-heading text-foreground` |
| Subtítulo | `text-gray-600` | `text-muted-foreground` |
| Ícono `BarChart` (card "Tu progreso") | `text-indigo-500` | `text-primary` |
| Texto "Compañeros evaluables" | `text-gray-600` ... `text-indigo-600` | `text-muted-foreground` ... `text-primary` |
| Texto "evaluaciones son anónimas" | `text-gray-500 italic` | `text-muted-foreground italic` |
| Botón "Recargar compañeros" | `bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200` | `bg-primary/15 text-primary hover:bg-primary/20 border-primary/30` |

### 2. `FeedbackTab.tsx` (encuesta de feedback)

| Elemento | Antes | Después |
|---|---|---|
| Ícono `MessageSquare` (título card) | `text-green-500` | `text-primary` |
| Título "Evaluacion del Equipo de Trabajo" | `text-gray-800` | `font-heading text-foreground` |
| Texto "Tu Opinión es Totalmente Anónima" | `text-gray-500` | `text-muted-foreground` |
| Label "Progreso de Evaluaciones" | `text-gray-700` | `text-foreground` |
| Texto "% completado" | `text-gray-600` | `text-muted-foreground` |
| Card de la encuesta (borde) | `border-indigo-200` | `border-primary/30` |
| Texto "¿Consideras que..." | `text-gray-700` | `text-foreground` |
| Nombre del compañero evaluado | `text-indigo-600` | `text-primary` |
| Nombre de la habilidad | `text-indigo-700` | `text-primary` |
| Caja "sin encuestas disponibles" | `bg-gray-50 border-gray-200` | `bg-muted border-border` |
| Ícono `MessageSquare` (estado vacío) | `text-gray-400` | `text-muted-foreground` |
| Texto mensaje "sin encuestas" | `text-gray-600` | `text-muted-foreground` |
| Caja "última evaluación completa" | `text-gray-500 bg-gray-100` | `text-muted-foreground bg-muted` |

`Card`/`SelectButton`/`Button`/`ProgressBar` (PrimeReact) heredan el tema global, sin cambios.

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `getAuthToken`, `adaptPeerToUserData`, `loadPeers`, `handleSaveFeedback`, `handleUpdateUser` (`Screen.tsx`); `generateSurvey`, `handleSubmit`, `getEvaluationProgress`, `getNoSurveyMessage` (`FeedbackTab.tsx`).
- Otros módulos pendientes (IA, Admin, TestConfig).

## Testing

- Verificación visual manual: estado de carga, estado de error (sin sesión), pantalla principal con encuesta disponible, estado "sin encuestas disponibles" y estado "evaluación completa (en espera)" — en modo claro y oscuro.
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
