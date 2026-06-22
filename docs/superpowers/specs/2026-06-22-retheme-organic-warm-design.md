# Retema "Orgánico Cálido" — Talexa

## Contexto

El sistema de diseño + shell de navegación (sidebar agrupado, header, AppLayout) ya está construido y mergeado a `main` (ver `docs/superpowers/specs/2026-06-19-design-system-navigation-design.md` y su plan de implementación). Ese sistema usa una paleta neutra OKLCH estándar de shadcn ("New York"/"Neutral"), que el usuario describe como "muy clásica" y pide reemplazar por una paleta cálida y orgánica más distintiva, junto con ajustes de forma y tipografía para reforzar una sensación premium/profesional.

Este spec es un **retema**, no una reconstrucción: reutiliza la estructura de `AppSidebar`/`AppHeader`/`AppLayout` ya aprobada, solo reemplaza valores visuales (color, radio de bordes, tipografía).

## Decisiones (de la sesión de brainstorming, con companion visual)

- **Dirección de estilo**: "Orgánico suave" (opción A de 3 mockups comparados) — bordes redondeados, sombras suaves, fondo cálido marfil. Confirmado tras ver mockups de sidebar/header en 3 tratamientos distintos.
- **Nivel de redondeo**: moderado (~12-16px en tarjetas/botones/items de menú) — confirmado visualmente, no extremo tipo "pill".
- **Iconografía**: iconos de línea de `lucide-react` (los mismos que ya usa el sidebar actual: `BarChart2`, `Users`, `MessageSquare`, `GitMerge`, `FileText`, `Bell`, etc.) — explícitamente NO emojis ni iconos caricaturescos. Esto ya es lo que el código real usa hoy; los mockups iniciales usaban emoji solo como placeholder rápido y se corrigieron a SVGs de línea antes de la aprobación final.
- **Tipografía**: Fraunces (serif cálida) para marca/títulos/números destacados, Inter para el resto de la UI — reemplaza Geist.
- **Modo oscuro**: derivar una versión coherente con la misma identidad (rosa coral como acento, verde como énfasis) sobre fondos oscuros cálidos, no negros puros — la paleta original no trae versión oscura.

## Paleta y mapeo a tokens

Reutiliza los nombres de variable que ya existen en `src/app/globals.css` (Task 2-3 del plan anterior) — solo cambian los valores, no los nombres, para no romper nada que ya las consume (`AppSidebar`, `AppHeader`, los 8 componentes shadcn instalados).

### Modo claro (`:root`)

| Token | Valor | Origen / uso |
|---|---|---|
| `--background` | `#FAF8F6` | Fondo general (marfil cálido, no blanco puro) |
| `--foreground` | `#3A2F27` | Texto principal (marrón oscuro, no negro) |
| `--card` | `#FFFFFF` | Tarjetas |
| `--card-foreground` | `#3A2F27` | Texto sobre tarjetas |
| `--popover` | `#FFFFFF` | Dropdowns, tooltips |
| `--popover-foreground` | `#3A2F27` | Texto sobre popovers |
| `--primary` | `#E7717D` | Rosa coral — botones, CTAs, item activo de sidebar (ver excepción abajo) |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `#C2B9B0` | Beige grisáceo — botones secundarios, superficies de apoyo |
| `--secondary-foreground` | `#3A2F27` | Texto sobre secondary |
| `--muted` | `#C2CAD0` | Gris claro — fondo del sidebar, hover states |
| `--muted-foreground` | `#5A6470` | Texto secundario sobre muted |
| `--accent` | `#AFD275` | Verde lima — avatares, detalles, badges de novedad |
| `--accent-foreground` | `#2D3B1A` | Texto sobre accent |
| `--destructive` | sin cambio (token semántico, no decorativo) | Errores destructivos |
| `--border` | `#C2B9B0` al 35% de opacidad | Bordes sutiles |
| `--input` | igual que `--border` | Bordes de inputs |
| `--ring` | `#E7717D` al 50% de opacidad | Focus ring |
| `--color-surface` | `var(--card)` | sin cambio (ya mapeaba a card) |
| `--color-surface-muted` | `var(--muted)` | sin cambio (ya mapeaba a muted) |
| `--warm-contrast` (**nuevo**) | `#7E685A` | Marrón topo — item activo del sidebar, labels/texto secundario con peso |
| `--warm-contrast-foreground` (**nuevo**) | `#FFFFFF` | Texto sobre warm-contrast |
| `--color-success/warning/error/info` | sin cambios | Siguen siendo semánticos (estado de sistema), no decorativos — no se tocan en este retema |

**Por qué `--warm-contrast` es un token nuevo, no `--primary`:** el marrón topo (`#7E685A`) se reserva para el ítem *activo* de navegación (siguiendo el mockup aprobado), mientras `--primary` (rosa coral) se reserva para CTAs/botones de acción. Mezclarlos en un solo token perdería esa distinción semántica.

### Modo oscuro (`.dark`) — derivado, no provisto por la paleta original

| Token | Valor | Razonamiento |
|---|---|---|
| `--background` | `#211B16` | Marrón muy oscuro (no negro puro), mantiene la calidez |
| `--foreground` | `#F0EBE6` | Texto claro cálido |
| `--card` / `--popover` | `#2D2520` | Superficie ligeramente más clara que el fondo |
| `--card-foreground` / `--popover-foreground` | `#F0EBE6` | — |
| `--primary` | `#F08D98` | Rosa coral aclarado ~10% para mantener contraste AA sobre fondo oscuro |
| `--primary-foreground` | `#2D1115` | Texto oscuro sobre el rosa aclarado |
| `--secondary` | `#3D352E` | Beige oscurecido |
| `--secondary-foreground` | `#F0EBE6` | — |
| `--muted` | `#332C26` | Gris-marrón oscuro para fondo de sidebar |
| `--muted-foreground` | `#B5AAA0` | — |
| `--accent` | `#C3E098` | Verde lima aclarado ~10% |
| `--accent-foreground` | `#1A2410` | — |
| `--border` / `--input` | `#4A3F36` | — |
| `--ring` | `#F08D98` al 50% | — |
| `--warm-contrast` | `#A68A78` | Marrón topo aclarado para mantener visibilidad sobre fondo oscuro |
| `--warm-contrast-foreground` | `#211B16` | — |
| `--color-success/warning/error/info` | sin cambios (ya tienen su propia variante oscura desde Task 3) | — |

Mismo criterio de contraste AA usado en Task 3 del plan anterior para los tokens semánticos.

## Forma

- Radio de bordes: `16px` en tarjetas/contenedores grandes (`--radius` pasa de `0.625rem` a `1rem`), `12-14px` en botones/inputs/items de menú (vía las variantes `--radius-sm`/`--radius-md` ya derivadas de `--radius` en `@theme inline`, sin tocar esa fórmula).
- Sombras: sutiles y difusas — `0 2px 10px rgba(0,0,0,0.06)` en tarjetas, en vez de las sombras shadcn default más duras. Se define como `--shadow-soft: 0 2px 10px rgba(0,0,0,0.06);` dentro de `@theme inline` en `globals.css` (namespace `--shadow-*` de Tailwind v4, que genera automáticamente la utilidad `shadow-soft`). Los componentes que hoy usan `shadow-sm`/`shadow-md`/`shadow-lg` de Tailwind pasan a usar `shadow-soft` donde el mockup aprobado lo pide (tarjetas, dropdowns).
- Sidebar: fondo `--muted` (gris claro) en vez de `--card` (blanco) — ya es así en el `AppSidebar` actual (usa `bg-surface` que mapea a `--card`); este retema cambia ese mapeo de fondo del sidebar específicamente a `--muted` para lograr la separación visual del mockup aprobado, sin agregar un borde duro.

## Tipografía

- **Fraunces**: marca "Talexa" en el sidebar, títulos de página (h1/h2 de cada sección), números destacados en tarjetas de métricas. Cargada vía `next/font/google` (mismo patrón que Geist hoy), variable `--font-fraunces`.
- **Inter**: reemplaza Geist Sans para todo el resto (navegación, tablas, formularios, botones, texto de cuerpo). Cargada vía `next/font/google`, variable `--font-inter`, reemplazando `--font-sans`.
- Geist Mono se mantiene sin cambios (no hay pedido de tocar texto monoespaciado).

## Iconografía

Sin cambios respecto al plan anterior: `lucide-react`, iconos de línea (`stroke`, no `fill`), mismo `ICON_MAP` ya definido en `AppSidebar.tsx`. Este spec NO introduce una librería de iconos nueva — la aclaración del usuario ("iconos más profesionales, menos caricaturescos") ya estaba resuelta por el código real; solo los mockups de brainstorming usaban emoji como placeholder temporal.

## Alcance

**Incluye:**
- Reemplazo de valores de tokens en `src/app/globals.css` (`:root` y `.dark`), agregando `--warm-contrast`/`--warm-contrast-foreground`.
- Ajuste de `--radius` y agregado de un token de sombra suave.
- Reemplazo de Geist por Fraunces + Inter en `src/app/layout.tsx`.
- Ajustes puntuales de clases en `AppSidebar.tsx`/`AppHeader.tsx`/`AppLayout.tsx` donde el mockup aprobado difiere del comportamiento actual (fondo del sidebar a `--muted`, color del item activo a `--warm-contrast` en vez de `--primary`, aplicación de Fraunces al wordmark "Talexa").

**Fuera de alcance** (igual que el plan anterior, sin cambios):
- Contenido interno de páginas existentes (`src/app/screens/**`).
- Portal del Empleado, módulo de Noticias (specs futuros, sin tocar en este retema).
- Cualquier librería de iconos nueva (no aplica, ver sección Iconografía).

## Testing

- Verificación visual manual en navegador: confirmar que el sidebar/header/tarjetas reflejan la paleta nueva en modo claro y oscuro, que el toggle de tema sigue funcionando, que Fraunces carga correctamente en marca/títulos/números destacados sin layout shift notorio (usar `next/font` evita FOUT/CLS por diseño), y que el contraste de texto sobre cada superficie es legible (chequeo visual, no automatizado).
- No se requieren tests automatizados nuevos (mismo criterio que el plan anterior — es un cambio puramente visual).
- Verificación de build: igual que el plan anterior, usar `npx tsc --noEmit` acotado a los archivos tocados como sustituto de `npm run build` si el problema estructural de `app/pages/*` (ya resuelto en `main`) o cualquier otro bloqueo preexistente reaparece; de lo contrario, `npm run build` debería funcionar normalmente ya que esa rama ya fue mergeada a `main`.
