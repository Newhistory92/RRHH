# Retheme de paleta + rehabilitación del Login — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la paleta "Orgánico Cálido" por la paleta de 5 colores definida por el usuario (+ ámbar de warning), eliminar el cyan huérfano que sobrevive en el Login y en dos archivos, y dejar el Login funcional: con toggle de contraseña, responsive real en móvil y sin alta pública de usuarios.

**Architecture:** El grueso de la app ya consume tokens semánticos de `globals.css` — solo **3 archivos** tienen hex crudo. Por eso el retheme es principalmente un cambio de valores de tokens (Tarea 1) más un barrido de utilidades Tailwind de color fijo (Tareas 3–4). El Login vive aparte, en un CSS Module con su propia paleta cyan, y se trata como un subproyecto (Tareas 5–8).

**Tech Stack:** Next.js 15.4.1 (App Router) · React 19.1 · Tailwind CSS v4 (config CSS-first en `globals.css`, sin `tailwind.config.js`) · PrimeReact 10.9.7 · lucide-react 0.525 · next-themes (modo oscuro activo)

---

## Global Constraints

- **No se levanta el backend.** Ni uvicorn ni ningún proceso que escuche en un puerto del lado servidor. La verificación obligatoria es `npx tsc --noEmit` + `npm run build` + el script de contraste.
- **El dev server de Next solo con autorización explícita del usuario.** Si se autoriza, se usa únicamente para inspeccionar `/pages/Login`, que renderiza sin llamar al backend. No se envía el formulario de login.
- **Cero hex crudo en componentes.** Todo color nuevo entra como token en `globals.css`. Las únicas excepciones permitidas son `globals.css` (define los tokens) y `AuthPage.module.css` (CSS Module aislado, con sus propias variables locales).
- **Todo par texto/fondo cumple WCAG AA (≥ 4.5:1 texto normal, ≥ 3:1 texto grande y elementos de UI).** Los valores de este plan ya están verificados; cualquier color nuevo se verifica antes de fijarlo.
- **Los nombres de los tokens existentes no se renombran.** Solo cambian sus valores. Renombrar `--warm-contrast` (18 usos) sería un cambio aparte.
- **No se toca la lógica de RBAC/permisos.** El trabajo de permisos por código ya está cerrado; este plan es puramente visual y de formulario.

---

## Diagnóstico (estado actual verificado)

| Hallazgo | Evidencia |
|---|---|
| El retheme previo dejó la app en tokens semánticos | Solo **3 archivos** contienen hex crudo en todo `src/` |
| Sobrevive un tema cyan huérfano del diseño original | `#1ABCD7` ×12 en el Login, `#1ABCD7`/`#2ecbe7` en `UiRRHH.tsx:471`, y toda la familia `cyan-*`/`blue-*` en `Navbar/Header.tsx` |
| **`Navbar/Header.tsx` es código muerto** | Ningún archivo lo importa; `Navbar/` no contiene nada más. Mismo caso que `Navbar/Sidebar.tsx`, ya borrado |
| Dos temas de PrimeReact distintos, importados desde dos páginas | `lara-light-pink` en `page.tsx:30`, `lara-light-cyan` en `Login/page.tsx:8`. Son imports globales: colisionan |
| **El toggle de contraseña no existe** | Ambos inputs son `type="password"` planos, sin botón. No está roto: falta (`Login/page.tsx:233` y `:313`) |
| El Login no es responsive de verdad | `.container` es `750px × 450px` fijo con paneles en `position:absolute`. El único `@media` baja el ancho a 90% pero deja los dos paneters al 50% y las formas curvas encima |
| 295 utilidades Tailwind de color fijo | 14 archivos; `UiRRHH.tsx` (74) y `Navbar/Header.tsx` (28, muerto) concentran la mitad |
| Residuo del trabajo de RBAC | `Login/page.tsx:100` sigue escribiendo `localStorage.setItem("roleId", ...)`, que ya no se lee en ningún lado |

---

## Mapa de la paleta

Los 5 colores, con el contraste medido que decide el rol de cada uno:

| Color | Sobre blanco | Rol asignado | Regla |
|---|---|---|---|
| `#37363E` charcoal | 11.93:1 AAA | Texto principal · superficies oscuras · `--warm-contrast` | Sirve como texto **y** como fondo (con blanco encima) |
| `#1E5561` teal | 8.31:1 AAA | **`--primary`** · info · foco | Sirve como texto **y** como fondo (con blanco encima, 8.31:1) |
| `#C3D184` oliva | 1.64:1 ✗ | **`--accent`** | **Solo fondo.** Par estrella: fondo oliva + texto `#37363E` = **7.26:1 AAA** |
| `#EF4444` rojo | 3.76:1 ✗ | Peligro | **Solo relleno de UI/texto grande.** Como texto o botón sólido usar `#C42B2B` (5.63:1 con blanco) |
| `#6AA69B` sage | 2.78:1 ✗ | **`--secondary`** · éxito | **Solo tinte de fondo.** Como texto usar `#3D7065` (5.67:1) |
| `#D97706` ámbar (6º) | 2.96:1 ✗ | Warning | **Solo tinte/icono.** Como texto usar `#A2570A` (5.38:1) |

**Las cuatro trampas de esta paleta**, todas confirmadas con números:

1. **`#1E5561` es inutilizable en modo oscuro** — sobre `#24232A` da **1.87:1**. En `.dark` el primary tiene que ser `#5FA3B2` (5.46:1).
2. **`#6AA69B` como botón sólido no llega** — con blanco 2.78:1, con charcoal 4.29:1. Sage va como tinte de fondo con texto oscuro, nunca como relleno de botón con texto encima.
3. **`#D97706` como botón sólido tampoco** — 3.19:1 con blanco, 3.75:1 con charcoal. Ámbar va como tinte, borde o icono.
4. **`#EF4444` como texto de error falla** (3.76:1). El `--color-error` debe ser `#C42B2B`; `#EF4444` queda para rellenos grandes y para modo oscuro (donde se usa `#F87171`).

---

## File Structure

| Archivo | Qué pasa | Tarea |
|---|---|---|
| `src/app/globals.css` | Se reescriben `:root` y `.dark`; se agregan los tokens `--brand-*` | 1 |
| `src/app/layout.tsx` | Recibe el único import del tema PrimeReact (`lara-light-teal`) | 1 |
| `src/app/page.tsx` | Se le quita el import de `lara-light-pink`; 9 utilidades fijas → tokens | 1, 4 |
| `src/app/Componentes/Navbar/Header.tsx` | **Se borra** (código muerto) | 2 |
| `src/app/util/UiRRHH.tsx` | Se quitan `#1ABCD7`/`#2ecbe7`; 74 utilidades fijas → tokens | 2, 3 |
| `src/app/util/UiCv.tsx` + 11 archivos más | Barrido de utilidades fijas → tokens | 4 |
| `src/app/pages/Login/AuthPage.module.css` | Retheme completo + capa responsive + estilos del toggle | 5, 6, 7 |
| `src/app/pages/Login/page.tsx` | Toggle de contraseña, accesibilidad, alta desactivada, limpieza de `roleId` | 7, 8 |
| `scripts/check-contrast.mjs` | **Nuevo.** Verifica los pares de tokens; se corre en cada tarea | 1 |
| `docs/paleta-colores.md` | **Nuevo.** Referencia de la paleta | 9 |

---

## Task 1: Tokens de la paleta y unificación de PrimeReact

**Files:**
- Modify: `src/app/globals.css:4-83` (bloques `:root` y `.dark`), `:139-142` (tokens PrimeReact)
- Modify: `src/app/layout.tsx:4`
- Modify: `src/app/page.tsx:30`
- Create: `scripts/check-contrast.mjs`

**Interfaces:**
- Produces: el juego completo de tokens que consumen las Tareas 3, 4 y 9. Ningún nombre de token cambia respecto del actual; se agregan los `--brand-*` y los `--color-*-soft` concretos.

- [ ] **Step 1: Crear el verificador de contraste**

Este script es la red de seguridad de todo el plan: cada tarea posterior lo vuelve a correr.

```js
// scripts/check-contrast.mjs
// Verifica que cada par texto/fondo del sistema de diseño cumpla WCAG AA.
// Uso: node scripts/check-contrast.mjs
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [nombre, fondo, texto, mínimo exigido]
const PARES = [
  ["claro/foreground",        "#F6F7F4", "#37363E", 4.5],
  ["claro/card-foreground",   "#FFFFFF", "#37363E", 4.5],
  ["claro/muted-foreground",  "#F6F7F4", "#6B6A73", 4.5],
  ["claro/primary",           "#1E5561", "#FFFFFF", 4.5],
  ["claro/secondary",         "#C9DEDA", "#37363E", 4.5],
  ["claro/accent",            "#C3D184", "#37363E", 4.5],
  ["claro/destructive",       "#C42B2B", "#FFFFFF", 4.5],
  ["claro/warm-contrast",     "#37363E", "#FFFFFF", 4.5],
  ["claro/success-soft",      "#E6F1EF", "#3D7065", 4.5],
  ["claro/warning-soft",      "#FDF3E7", "#A2570A", 4.5],
  ["claro/error-soft",        "#FDEAEA", "#C42B2B", 4.5],
  ["claro/info-soft",         "#DCE7EA", "#1E5561", 4.5],
  ["oscuro/foreground",       "#24232A", "#EDECF0", 4.5],
  ["oscuro/card-foreground",  "#2E2D36", "#EDECF0", 4.5],
  ["oscuro/muted-foreground", "#24232A", "#A3A1AC", 4.5],
  ["oscuro/primary",          "#5FA3B2", "#24232A", 4.5],
  ["oscuro/secondary",        "#3A4644", "#EDECF0", 4.5],
  ["oscuro/accent",           "#C3D184", "#37363E", 4.5],
  ["oscuro/destructive",      "#F87171", "#24232A", 4.5],
  ["oscuro/success-soft",     "#24352F", "#8FC0B6", 4.5],
  ["oscuro/warning-soft",     "#3A2E1A", "#FBBF24", 4.5],
  ["oscuro/error-soft",       "#3A2323", "#F87171", 4.5],
  ["oscuro/info-soft",        "#1B333A", "#5FA3B2", 4.5],
  ["login/texto-panel",       "#2A2930", "#FFFFFF", 4.5],
  ["login/acento-panel",      "#2A2930", "#C3D184", 4.5],
  ["login/texto-sobre-teal",  "#1E5561", "#FFFFFF", 4.5],
  ["login/error",             "#2A2930", "#F87171", 4.5],
];

let fallos = 0;
for (const [nombre, bg, fg, min] of PARES) {
  const r = ratio(bg, fg);
  const ok = r >= min;
  if (!ok) fallos++;
  console.log(
    `${ok ? "OK  " : "FALLA"} ${nombre.padEnd(26)} ${bg} / ${fg}  ${r.toFixed(2)}:1 (min ${min})`
  );
}
console.log(fallos === 0 ? "\nTodos los pares cumplen AA." : `\n${fallos} par(es) por debajo del mínimo.`);
process.exit(fallos === 0 ? 0 : 1);
```

- [ ] **Step 2: Correr el verificador contra los valores del plan**

```bash
node scripts/check-contrast.mjs
```

Esperado: `Todos los pares cumplen AA.` y exit 0. Si alguno falla, el valor está mal transcrito — corregir antes de seguir.

- [ ] **Step 3: Reemplazar el bloque `:root` de `globals.css`**

Sustituir por completo `src/app/globals.css:4-36`:

```css
:root {
  /* ===== Paleta base ===== */
  --brand-charcoal: #37363E;
  --brand-teal:     #1E5561;
  --brand-olive:    #C3D184;
  --brand-red:      #EF4444;
  --brand-sage:     #6AA69B;
  --brand-amber:    #D97706;

  /* ===== Variantes accesibles para TEXTO sobre fondo claro =====
     Los colores base fallan AA como color de texto sobre blanco:
     oliva 1.64:1 · sage 2.78:1 · rojo 3.76:1 · ámbar 2.96:1.
     Estas variantes son las que se usan cuando el color es TEXTO. */
  --brand-sage-text:  #3D7065; /* 5.67:1 */
  --brand-olive-text: #616D33; /* 5.61:1 */
  --brand-red-text:   #C42B2B; /* 5.63:1 */
  --brand-amber-text: #A2570A; /* 5.38:1 */

  --radius: 1rem;

  --background: #F6F7F4;
  --foreground: #37363E;              /* 11.10:1 */
  --card: #FFFFFF;
  --card-foreground: #37363E;         /* 11.93:1 */
  --popover: #FFFFFF;
  --popover-foreground: #37363E;

  --primary: #1E5561;                 /* con blanco encima: 8.31:1 */
  --primary-foreground: #FFFFFF;
  --secondary: #C9DEDA;               /* tinte sage; con charcoal: 8.49:1 */
  --secondary-foreground: #37363E;
  --muted: #F3F3F4;
  --muted-foreground: #6B6A73;        /* 4.81:1 sobre muted */
  --accent: #C3D184;                  /* con charcoal encima: 7.26:1 */
  --accent-foreground: #37363E;
  --destructive: #C42B2B;             /* con blanco encima: 5.63:1 */
  --destructive-foreground: #FFFFFF;

  --border: color-mix(in srgb, #37363E 16%, transparent);
  --input:  color-mix(in srgb, #37363E 16%, transparent);
  --ring:   color-mix(in srgb, #1E5561 55%, transparent);

  --warm-contrast: #37363E;           /* con blanco encima: 11.93:1 */
  --warm-contrast-foreground: #FFFFFF;
  --shadow-soft: 0 2px 10px rgba(55, 54, 62, 0.08);

  --color-success: #3D7065;
  --color-success-foreground: #FFFFFF;
  --color-warning: #A2570A;
  --color-warning-foreground: #FFFFFF;
  --color-error: #C42B2B;
  --color-error-foreground: #FFFFFF;
  --color-info: #1E5561;
  --color-info-foreground: #FFFFFF;
}
```

- [ ] **Step 4: Reemplazar el bloque `.dark`**

Sustituir por completo `src/app/globals.css:52-83`. El cambio crítico es `--primary`: `#1E5561` da **1.87:1** sobre el fondo oscuro y es ilegible, por eso acá va `#5FA3B2`.

```css
.dark {
  --background: #24232A;
  --foreground: #EDECF0;              /* 13.24:1 */
  --card: #2E2D36;
  --card-foreground: #EDECF0;         /* 11.56:1 */
  --popover: #2E2D36;
  --popover-foreground: #EDECF0;

  --primary: #5FA3B2;                 /* 5.46:1 — el teal base falla acá (1.87:1) */
  --primary-foreground: #14262B;
  --secondary: #3A4644;               /* con foreground encima: 8.35:1 */
  --secondary-foreground: #EDECF0;
  --muted: #33323B;
  --muted-foreground: #A3A1AC;        /* 4.97:1 sobre muted */
  --accent: #C3D184;                  /* 9.47:1 sobre el fondo */
  --accent-foreground: #37363E;       /* 7.26:1 */
  --destructive: #F87171;             /* 5.63:1 sobre el fondo */
  --destructive-foreground: #24232A;

  --border: #45444F;
  --input:  #45444F;
  --ring:   color-mix(in srgb, #5FA3B2 55%, transparent);

  --warm-contrast: #C3D184;
  --warm-contrast-foreground: #37363E;
  --shadow-soft: 0 2px 10px rgba(0, 0, 0, 0.35);

  --color-success: #8FC0B6;
  --color-success-foreground: #24352F;
  --color-warning: #FBBF24;
  --color-warning-foreground: #3A2E1A;
  --color-error: #F87171;
  --color-error-foreground: #3A2323;
  --color-info: #5FA3B2;
  --color-info-foreground: #1B333A;
}
```

- [ ] **Step 5: Fijar los tintes `*-soft` con valores verificados**

En `globals.css`, dentro de `@theme inline`, reemplazar las cuatro líneas `--color-*-soft` que hoy usan `color-mix(... 20% ...)`. Ese 20% producía pares por debajo de AA (warning 4.39:1, error 4.44:1). Estos valores están medidos:

```css
  --color-success-soft: #E6F1EF;              /* + #3D7065 = 4.91:1 */
  --color-success-soft-foreground: #3D7065;
  --color-warning-soft: #FDF3E7;              /* + #A2570A = 4.91:1 */
  --color-warning-soft-foreground: #A2570A;
  --color-error-soft: #FDEAEA;                /* + #C42B2B = 4.86:1 */
  --color-error-soft-foreground: #C42B2B;
  --color-info-soft: #DCE7EA;                 /* + #1E5561 = 6.59:1 */
  --color-info-soft-foreground: #1E5561;
```

Y agregar la contraparte oscura al final del bloque `.dark`:

```css
  --color-success-soft: #24352F;
  --color-success-soft-foreground: #8FC0B6;   /* 6.39:1 */
  --color-warning-soft: #3A2E1A;
  --color-warning-soft-foreground: #FBBF24;   /* 7.93:1 */
  --color-error-soft: #3A2323;
  --color-error-soft-foreground: #F87171;     /* 5.26:1 */
  --color-info-soft: #1B333A;
  --color-info-soft-foreground: #5FA3B2;      /* 4.66:1 */
```

Exponer los cuatro `*-soft-foreground` nuevos en `@theme inline` si no lo están.

- [ ] **Step 6: Remapear los tokens de PrimeReact**

Reemplazar `src/app/globals.css:139-142`:

```css
:root {
  --primary-color: #1E5561;
  --primary-color-text: #FFFFFF;
}
```

Y en el override de `.p-button` (`globals.css:38-42`), corregir un bug de contraste preexistente: hoy pinta `background: var(--accent)` con `color: white`, que con el oliva nuevo daría **1.64:1**. Debe usar el par primario:

```css
.p-button:not(.p-button-text):not(.p-button-outlined):not(.p-button-link):not(.p-button-success):not(.p-button-danger):not(.p-button-warning):not(.p-button-info):not(.p-button-secondary):not(.p-button-help) {
    background: var(--primary) !important;
    border-color: var(--primary) !important;
    color: var(--primary-foreground) !important;
}
```

- [ ] **Step 7: Unificar el tema de PrimeReact en un solo import**

Quitar `import "primereact/resources/themes/lara-light-pink/theme.css";` de `src/app/page.tsx:30` y `import "primereact/resources/themes/lara-light-cyan/theme.css";` de `src/app/pages/Login/page.tsx:8`. Agregar en `src/app/layout.tsx`, inmediatamente antes de `import "./globals.css"` (el orden importa: globals debe poder pisar al tema):

```ts
import "primereact/resources/themes/lara-light-teal/theme.css";
import "./globals.css";
```

- [ ] **Step 8: Verificar que compila**

```bash
npx tsc --noEmit
```

Esperado: los mismos ~27 errores preexistentes (`Productivity.tsx`, `UiRRHH.tsx`, `lib/`, `Orgamograma/`), **ninguno nuevo**. Anotar el conteo exacto: es la línea base de las tareas siguientes.

```bash
npm run build
```

Esperado: build exitoso.

- [ ] **Step 9: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx scripts/check-contrast.mjs && git commit -m "feat(theme): nueva paleta de 5 colores con contraste verificado AA"
```

---

## Task 2: Purgar el cyan huérfano

**Files:**
- Delete: `src/app/Componentes/Navbar/Header.tsx`
- Modify: `src/app/util/UiRRHH.tsx:471`

- [ ] **Step 1: Confirmar que `Navbar/Header.tsx` sigue sin importarse**

```bash
grep -rn "Navbar/Header" src --include="*.tsx" --include="*.ts"
```

Esperado: **sin resultados** (el único match previo era el comentario dentro del propio archivo). Si aparece algún import real, **detenerse** y reportarlo en vez de borrar.

- [ ] **Step 2: Borrar el archivo muerto**

```bash
git rm src/app/Componentes/Navbar/Header.tsx
```

Esto elimina de un saque 28 líneas con utilidades `cyan-*`/`blue-*`/`gray-*` fijas.

- [ ] **Step 3: Reemplazar el gradiente cyan de `UiRRHH.tsx`**

En `src/app/util/UiRRHH.tsx:471` conviven `#2ecbe7` y `#1ABCD7`, los dos últimos hex del tema viejo. Leer la línea, identificar qué elemento pinta, y sustituir ambos por los tokens equivalentes: el gradiente pasa a ir de `var(--primary)` a `var(--brand-sage)`. Si es un gradiente en clase Tailwind, usar `from-primary to-[var(--brand-sage)]`; si es CSS inline, `linear-gradient(...)` con las mismas variables.

- [ ] **Step 4: Verificar que no queda hex fuera de los dos archivos permitidos**

```bash
grep -rlE "#[0-9a-fA-F]{6}\b" src --include="*.tsx" --include="*.ts" --include="*.css"
```

Esperado: exactamente dos rutas, `src/app/globals.css` y `src/app/pages/Login/AuthPage.module.css`. `UiRRHH.tsx` ya no debe aparecer.

- [ ] **Step 5: Verificar y commitear**

```bash
npx tsc --noEmit
```

Esperado: el mismo conteo de errores de la Tarea 1, sin errores nuevos.

```bash
git add -A && git commit -m "refactor(theme): borrar Navbar/Header muerto y el ultimo hex cyan de UiRRHH"
```

---

## Task 3: `UiRRHH.tsx` a tokens semánticos

**Files:**
- Modify: `src/app/util/UiRRHH.tsx` (74 líneas con utilidades de color fijas)

Es el archivo de mayor apalancamiento: lo importan 10 componentes (`DetailModal`, `Productivity`, `DatosPersonales`, `HabilidadesTecnicas`, `Predictive`, `DepartmentDetails`, `DepartmentInfo`, `OfficeCard`, `DetailTables`, `Perfildetail`).

**Interfaces:**
- Consumes: los tokens de la Tarea 1.

- [ ] **Step 1: Inventariar las utilidades a cambiar**

```bash
grep -noE "\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" src/app/util/UiRRHH.tsx
```

- [ ] **Step 2: Aplicar la tabla de conversión**

Los colores de este archivo caen en tres grupos con tratamiento distinto:

| Grupo | Ejemplo actual | Reemplazo | Por qué |
|---|---|---|---|
| **Badges de estado** (líneas ~87-96) | `bg-green-100 text-green-800` | `bg-success-soft text-success-soft-foreground` | Son estados semánticos; los tintes ya están verificados AA |
| | `bg-yellow-100 text-yellow-800` | `bg-warning-soft text-warning-soft-foreground` | |
| | `bg-red-100 text-red-800` | `bg-error-soft text-error-soft-foreground` | |
| | `bg-gray-100 text-gray-800` | `bg-muted text-foreground` | |
| | `text-blue-600` | `text-info` | |
| | `text-orange-600` | `text-warning` | |
| **Neutrales** | `text-gray-600` / `text-gray-500` / `text-gray-400` | `text-muted-foreground` | Un solo token para texto secundario; `gray-400` no llegaba a AA |
| | `text-gray-700` / `text-gray-800` / `text-gray-900` | `text-foreground` | |
| | `bg-gray-50` / `bg-gray-100` | `bg-muted` | |
| | `bg-gray-200 dark:bg-gray-700` | `bg-muted` | El token ya cambia solo en `.dark`; el par `dark:` sobra |
| | `bg-slate-800` | `bg-warm-contrast text-warm-contrast-foreground` | |
| **Escala de medidor** (líneas ~321-326) | `bg-emerald-500` → `bg-lime-500` → `bg-yellow-500` → `bg-orange-500` → `bg-red-500` | ver Step 3 | Es una rampa, no estados sueltos |

Regla al aplicar: donde había un par `X dark:Y`, borrar el `dark:` — los tokens ya conmutan solos. Eso reduce las 78 utilidades `dark:` del proyecto.

- [ ] **Step 3: Rehacer la rampa del medidor con la paleta**

La rampa de 5 pasos (emerald→lime→yellow→orange→red) se reexpresa con los `--brand-*`. Agregar los tokens de rampa a `:root` en `globals.css`:

```css
  /* Rampa de 5 pasos para medidores de desempeño (fondo, siempre con texto #37363E) */
  --scale-1: #3D7065;  /* mejor */
  --scale-2: #6AA69B;
  --scale-3: #C3D184;
  --scale-4: #D97706;
  --scale-5: #C42B2B;  /* peor */
```

y usarlos como `bg-[var(--scale-1)]` … `bg-[var(--scale-5)]`. Estas barras no llevan texto encima, así que solo necesitan ser distinguibles entre sí, no cumplir 4.5:1.

> Regla `color-not-only` (§1 del skill): si la rampa es el único indicador del nivel, el componente debe además mostrar el valor numérico o una etiqueta. Verificarlo al editar; si falta, agregarla.

- [ ] **Step 4: Verificar**

```bash
grep -cE "\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" src/app/util/UiRRHH.tsx
```

Esperado: `0`.

```bash
npx tsc --noEmit && npm run build
```

Esperado: sin errores nuevos, build ok.

- [ ] **Step 5: Commit**

```bash
git add src/app/util/UiRRHH.tsx src/app/globals.css && git commit -m "refactor(theme): UiRRHH a tokens semanticos"
```

---

## Task 4: Barrido de los componentes restantes

**Files:**
- Modify: `src/app/util/UiCv.tsx` (10), `src/app/page.tsx` (9), `Componentes/Perfil/NotificationDialog.tsx` (7), `Componentes/Asistencia/AsistenciaTablero.tsx` (6), `Componentes/Asistencia/AlertasToleranciaPanel.tsx` (5), `screens/ConfiguracionLicencias/Screen.tsx` (4), `Componentes/TablaOperador/AlertasToleranciaTab.tsx` (4), `Componentes/Asistencia/MiAsistencia.tsx` (4), `Componentes/TablaOperador/AsistenciaEmpleadoTab.tsx` (3), `Componentes/Pagination/pagination.tsx` (3), `src/app/util/useOrgChart.tsx` (2), `Componentes/TablaOperador/AusenciasEmpleadoTab.tsx` (2)

**Interfaces:**
- Consumes: la misma tabla de conversión de la Tarea 3, Step 2.

- [ ] **Step 1: Convertir archivo por archivo**

Aplicar la tabla de la Tarea 3 a cada archivo de la lista, en ese orden (de más a menos ocurrencias). Corriendo por archivo:

```bash
grep -noE "\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" <archivo>
```

Casos que aparecen acá y no en `UiRRHH`:
- Colores en un contexto de **alerta de tolerancia** (`AlertasToleranciaPanel`, `AlertasToleranciaTab`): son severidades → `warning-soft` / `error-soft`.
- **`pagination.tsx`**: la página activa suele ser `bg-blue-500 text-white` → `bg-primary text-primary-foreground` (8.31:1). Verificar además que los botones lleguen a 44×44px (regla `touch-target-size`); si no, agrandarlos.
- **`useOrgChart.tsx`**: colores de nodos del organigrama → `--brand-*` directos, ya que son rellenos sin texto encima.

- [ ] **Step 2: Verificar que no queda ninguna utilidad fija**

```bash
grep -rlE "\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" src --include="*.tsx"
```

Esperado: **sin resultados**.

- [ ] **Step 3: Verificar y commitear**

```bash
npx tsc --noEmit && npm run build
```

```bash
git add -A && git commit -m "refactor(theme): barrido final de utilidades de color fijas"
```

---

## Task 5: Login — retheme del CSS Module

**Files:**
- Modify: `src/app/pages/Login/AuthPage.module.css`

El Login es un panel oscuro y así se queda: es una pantalla de marca, no sigue el modo claro/oscuro de la app. Lo que cambia es que el cyan `#1ABCD7` se va y entra el teal + oliva de la paleta.

- [ ] **Step 1: Declarar las variables locales del Login**

Al principio de `AuthPage.module.css`, justo después del `@import` de Poppins:

```css
/* Paleta local del Login. Es una pantalla de marca con fondo oscuro fijo:
   no conmuta con el modo claro/oscuro de la app, por eso no usa los tokens
   globales. Contrastes verificados sobre el panel #2A2930. */
.pageContainer {
  --login-bg:      #24232A;
  --login-panel:   #2A2930;
  --login-brand:   #1E5561;  /* forma curva; con blanco encima 8.31:1 */
  --login-accent:  #C3D184;  /* foco, links, labels activos; 8.76:1 */
  --login-text:    #FFFFFF;  /* 14.40:1 */
  --login-muted:   #A3A1AC;
  --login-error:   #F87171;  /* 5.21:1 — el #EF4444 base queda corto */
  --login-border:  rgba(255, 255, 255, 0.28);
}
```

- [ ] **Step 2: Sustituir todos los hex del archivo**

| Hex actual | Ocurrencias | Reemplazo |
|---|---|---|
| `#1ABCD7` | 12 | `var(--login-accent)` |
| `#25252b` | 5 | `var(--login-bg)` en `.pageContainer`; `var(--login-panel)` en `.curvedShape2` y en el gradiente de `.btn::before` |
| `#fff` / `#ffffff` | varias | `var(--login-text)` |
| `#ef4444` (en `.errorText`) | 1 | `var(--login-error)` |
| `fill="gray"` (en el JSX) | 3 | se resuelve en la Tarea 7 |

En `.curvedShape`, el gradiente pasa a `linear-gradient(45deg, var(--login-bg), var(--login-brand))`: la forma curva es la que lleva el teal de marca.

- [ ] **Step 3: Corregir el contraste del borde de los inputs**

`.inputBox input` tiene hoy `border-bottom: 2px solid #fff` y el label en `#fff`. Con el panel oscuro eso está bien (14.40:1), pero el estado en reposo debe distinguirse del activo. Dejar:

```css
.inputBox input {
  border-bottom: 2px solid var(--login-border);
}
.inputBox input:focus,
.inputBox input:valid {
  border-bottom: 2px solid var(--login-accent);
}
.inputBox label {
  color: var(--login-muted);
}
.inputBox input:focus ~ label,
.inputBox input:valid ~ label {
  color: var(--login-accent);
}
```

- [ ] **Step 4: Agregar foco visible a todos los interactivos**

Hoy `.btn` y los links no tienen `:focus-visible` — regla `focus-states` (§1, CRITICAL). Agregar:

```css
.btn:focus-visible,
.regiLink a:focus-visible {
  outline: 2px solid var(--login-accent);
  outline-offset: 3px;
}
```

- [ ] **Step 5: Verificar**

```bash
grep -cE "#[0-9a-fA-F]{6}\b" src/app/pages/Login/AuthPage.module.css
```

Esperado: solo los hex del bloque de variables del Step 1 (8), ninguno suelto en las reglas.

```bash
node scripts/check-contrast.mjs
```

Esperado: los cuatro pares `login/*` en OK.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/Login/AuthPage.module.css && git commit -m "feat(login): retheme del panel a la paleta teal/oliva"
```

---

## Task 6: Login — responsive real en móvil

**Files:**
- Modify: `src/app/pages/Login/AuthPage.module.css`

El `@media (max-width: 768px)` actual solo achica el contenedor: los dos `.formBox` siguen en `position:absolute; width:50%`, así que en móvil quedan dos medias columnas superpuestas con las formas curvas encima. El arreglo es sacar el layout del modo absoluto y apilarlo.

- [ ] **Step 1: Cambiar la altura de viewport a unidad dinámica**

En `.pageContainer`, `min-height: 100vh` → `min-height: 100dvh` (regla `viewport-units`: en móvil `100vh` se pasa de largo por la barra del navegador).

- [ ] **Step 2: Reemplazar el bloque `@media` completo**

Sustituir `AuthPage.module.css:289-304` por:

```css
/* ── Móvil: el diseño de dos paneles no sobrevive por debajo de ~700px.
   Se sale de position:absolute, se apila en una columna y se muestra
   un solo formulario por vez (el que corresponda a .active). ── */
@media (max-width: 767px) {
  .pageContainer {
    align-items: flex-start;
    padding: 24px 16px;
  }

  .container {
    width: 100%;
    max-width: 420px;
    height: auto;
    overflow: visible;
    border-radius: 16px;
    padding: 28px 22px 32px;
    background: var(--login-panel);
    box-shadow: 0 0 18px rgba(0, 0, 0, 0.45);
  }

  /* Las formas curvas y los paneles informativos dependen del layout
     absoluto de escritorio: en columna no tienen dónde ir. */
  .curvedShape,
  .curvedShape2,
  .infoContent {
    display: none;
  }

  .formBox {
    position: static;
    width: 100%;
    height: auto;
    padding: 0;
  }

  .formBox.Register            { display: none; }
  .container.active .formBox.Login    { display: none; }
  .container.active .formBox.Register { display: block; }

  /* En flujo normal las animaciones de slide no aplican: neutralizarlas
     para que el formulario visible no quede transparente o desplazado. */
  .formBox .animation,
  .container.active .formBox .animation {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
    transition-delay: 0s !important;
  }

  .formBox h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .inputBox {
    margin-top: 22px;
  }
}
```

- [ ] **Step 3: Respetar `prefers-reduced-motion`**

Las transiciones de 0.7s con `blur(10px)` y las de 1.5s de las formas curvas no tienen escape — regla `reduced-motion` (§1, CRITICAL). Agregar al final del archivo:

```css
@media (prefers-reduced-motion: reduce) {
  .formBox .animation,
  .infoContent .animation,
  .curvedShape,
  .curvedShape2,
  .btn,
  .btn::before,
  .inputBox input,
  .inputBox label,
  .icon {
    transition: none !important;
    animation: none !important;
    filter: none !important;
    transition-delay: 0s !important;
  }
}
```

- [ ] **Step 4: Verificar los tamaños táctiles**

Confirmar en el CSS que `.btn` mantiene `height: 45px` (≥44px ✓) y que el link «Regístrate»/«Accede» de `.regiLink` tenga área táctil suficiente. Si es un `<a>` en línea de 14px, agregarle:

```css
.regiLink a {
  display: inline-block;
  padding: 10px 8px;
  min-height: 44px;
  line-height: 24px;
}
```

- [ ] **Step 5: Verificar**

```bash
npm run build
```

Verificación visual (opcional, **solo si el usuario autoriza levantar el dev server**): abrir `/pages/Login`, medir en 375px, 768px y 1280px, y confirmar que en 375px no hay scroll horizontal, se ve un solo formulario y el cambio Acceso↔Registro funciona.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/Login/AuthPage.module.css && git commit -m "feat(login): layout apilado en movil y soporte de reduced-motion"
```

---

## Task 7: Login — toggle de contraseña y accesibilidad del formulario

**Files:**
- Modify: `src/app/pages/Login/page.tsx`
- Modify: `src/app/pages/Login/AuthPage.module.css`

**Nota:** el toggle **no existe hoy** — no es un arreglo, es una función nueva. Hay dos campos de contraseña: el de acceso (`page.tsx:233`) y el de registro (`page.tsx:313`).

- [ ] **Step 1: Estilar el botón del toggle**

En `AuthPage.module.css`. El botón **reemplaza** al icono de candado en los campos de contraseña (si no, se pisarían: los dos van en `right: 0`). Área táctil de 44×44 según `touch-target-size`:

```css
.toggleEye {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--login-muted);
  border-radius: 8px;
  transition: color 0.2s ease;
}

.toggleEye:hover {
  color: var(--login-accent);
}

.toggleEye:focus-visible {
  outline: 2px solid var(--login-accent);
  outline-offset: 2px;
}

/* El input necesita espacio para no quedar debajo del botón. */
.inputBox.withToggle input {
  padding-right: 48px;
}
```

- [ ] **Step 2: Agregar el estado en `page.tsx`**

Dos estados separados: los formularios de acceso y registro son independientes.

```tsx
const [verPassLogin, setVerPassLogin] = useState(false);
const [verPassRegistro, setVerPassRegistro] = useState(false);
```

Y el import del icono (lucide-react ya es dependencia del proyecto — regla `no-emoji-icons`):

```tsx
import { Eye, EyeOff } from 'lucide-react';
```

- [ ] **Step 3: Reemplazar el campo de contraseña del formulario de acceso**

Sustituir el bloque de `page.tsx:232-243`:

```tsx
<div className={`${styles.inputBox} ${styles.withToggle} ${styles.animation}`} style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
  <input
    id="login-password"
    type={verPassLogin ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="current-password"
    required
  />
  <label htmlFor="login-password">Contraseña</label>
  <button
    type="button"
    className={styles.toggleEye}
    onClick={() => setVerPassLogin((v) => !v)}
    aria-label={verPassLogin ? "Ocultar contraseña" : "Mostrar contraseña"}
    aria-pressed={verPassLogin}
  >
    {verPassLogin ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
  </button>
</div>
```

Tres cosas que arregla de paso: `autoComplete` para que el gestor de contraseñas funcione (`autofill-support`), `htmlFor`/`id` para asociar el label (`form-labels`), y `aria-label` en el botón de icono (`aria-labels`).

- [ ] **Step 4: Hacer lo mismo en el campo de contraseña del registro**

Sustituir `page.tsx:312-329` con la misma estructura, cambiando: `id="registro-password"`, `verPassRegistro`/`setVerPassRegistro`, `autoComplete="new-password"`, y conservando el `onChange` que marca `touched` y el `{fieldErrors.password && ...}` que ya tiene.

- [ ] **Step 5: Completar labels y autocomplete en los campos restantes**

Los campos de usuario y email tampoco tienen `id`/`htmlFor` ni `autoComplete`. Agregar:
- usuario (acceso): `id="login-usuario"`, `autoComplete="username"`
- usuario (registro): `id="registro-usuario"`, `autoComplete="username"`
- email (registro): `id="registro-email"`, `autoComplete="email"`

Y a los `<svg className={styles.icon}>` que quedan (los de usuario y email), agregarles `aria-hidden="true"` y cambiar `fill="gray"` por `fill="currentColor"`, con `color: var(--login-muted)` en la regla `.icon` del CSS — así el icono se retematiza solo.

- [ ] **Step 6: Anunciar los errores a lectores de pantalla**

`.errorText` aparece dinámicamente sin avisar. Regla `aria-live-errors`: al `<span className={styles.errorText}>` de los tres campos agregarle `role="alert"`.

- [ ] **Step 7: Limpiar el residuo de `roleId`**

`page.tsx:100` escribe `localStorage.setItem("roleId", ...)`, que ya no lee nadie desde que la autorización pasó a códigos de permiso. Borrar esa línea.

- [ ] **Step 8: Verificar**

```bash
npx tsc --noEmit
```

Esperado: sin errores nuevos.

```bash
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add src/app/pages/Login/ && git commit -m "feat(login): toggle de contrasena, labels asociados y autocomplete"
```

---

## Task 8: Login — desactivar el alta pública

**Files:**
- Modify: `src/app/pages/Login/page.tsx`

**Decisión del usuario:** el formulario de registro se deja visible (el panel doble lo necesita), pero el POST queda comentado y en su lugar sale un mensaje indicando que hay que contactar a Sistemas.

- [ ] **Step 1: Reemplazar el cuerpo de `handleRegisterSubmit`**

Sustituir el `try/catch` con el `fetch` (`page.tsx:163-200`) por el aviso. Se conserva la validación con Zod previa, para que el formulario siga dando feedback de formato:

```tsx
    // El alta de usuarios se hace únicamente desde el panel de administración
    // (POST /users/employee, protegido con el permiso admin.gestionar).
    // El registro público queda desactivado a propósito: este es un sistema
    // interno y cualquiera con la URL podía crearse una cuenta con rol User.
    //
    // try {
    //   const response = await fetch(`${BACKEND_URL}/users/register`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //   ...
    // } catch (error) { ... }

    toast.current?.show({
      severity: 'info',
      summary: 'El registro no está habilitado',
      detail: 'Las cuentas las crea el área de Sistemas. Comunicate con Sistemas para que te den de alta.',
      life: 6000,
    });
```

- [ ] **Step 2: Avisar antes de que el usuario cargue todo el formulario**

Que el aviso salga recién al enviar es mala UX (`progressive-disclosure`). Agregar un aviso permanente en el panel de registro, arriba del formulario, dentro de `<div className={`${styles.formBox} ${styles.Register}`}>` y después del `<h2>`:

```tsx
<p className={styles.avisoRegistro} role="status">
  Las cuentas las crea el área de Sistemas. Si todavía no tenés acceso,
  comunicate con Sistemas para que te den de alta.
</p>
```

Con su estilo en `AuthPage.module.css` (fondo teal de marca, texto blanco — 8.31:1):

```css
.avisoRegistro {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--login-brand);
  border: 1px solid var(--login-accent);
  color: var(--login-text);
  font-size: 13px;
  line-height: 1.5;
}
```

- [ ] **Step 3: Marcar el botón de registro como no disponible**

El botón «Regístrate» no debe parecer que va a funcionar. Dejarlo `disabled` con las semánticas correctas (`disabled-states`):

```tsx
<button className={styles.btn} type="submit" disabled>Regístrate</button>
```

```css
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn:disabled:hover::before {
  top: -100%;
}
```

Con el botón deshabilitado el `onSubmit` ya no dispara, así que el toast del Step 1 queda como red de seguridad si alguien reactiva el botón.

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Confirmar que no queda ninguna llamada al endpoint**

```bash
grep -n "users/register" src/app/pages/Login/page.tsx
```

Esperado: solo dentro del bloque comentado.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/Login/ && git commit -m "feat(login): desactivar el alta publica y avisar que la crea Sistemas"
```

---

## Task 9: Verificación final y documentación

**Files:**
- Create: `docs/paleta-colores.md`

- [ ] **Step 1: Verificación completa**

```bash
node scripts/check-contrast.mjs
```

Esperado: `Todos los pares cumplen AA.`, exit 0.

```bash
grep -rlE "#[0-9a-fA-F]{6}\b" src --include="*.tsx" --include="*.ts" --include="*.css"
```

Esperado: exactamente `src/app/globals.css` y `src/app/pages/Login/AuthPage.module.css`.

```bash
grep -rlE "\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" src --include="*.tsx"
```

Esperado: sin resultados.

```bash
npx tsc --noEmit
```

Esperado: el mismo conteo base de la Tarea 1, sin errores nuevos.

```bash
npm run build
```

Esperado: build exitoso.

- [ ] **Step 2: Confirmar que no sobrevive nada del tema viejo**

```bash
grep -rniE "1abcd7|2ecbe7|e7717d|afd275|c2b9b0|faf8f6|7e685a|lara-light-(pink|cyan)" src
```

Esperado: sin resultados.

- [ ] **Step 3: Repaso de la checklist del skill**

Verificar sobre los archivos tocados:
- §1 Accesibilidad: contraste ✓ (Step 1), foco visible en Login ✓ (T5), `aria-label` en el toggle ✓ (T7), `role="alert"` en errores ✓ (T7), `prefers-reduced-motion` ✓ (T6)
- §2 Táctil: toggle 44×44 ✓ (T7), botones de paginación ✓ (T4), link de registro ✓ (T6)
- §5 Layout: sin scroll horizontal en 375px, `100dvh` ✓ (T6)
- §6 Color: cero hex en componentes ✓ (Step 1), el color no es el único indicador en la rampa del medidor ✓ (T3)

- [ ] **Step 4: Escribir `docs/paleta-colores.md`**

Documento de referencia con: los 6 colores y su rol, la tabla de contrastes medidos, las cuatro trampas de la paleta (primary inutilizable en oscuro, sage/ámbar no sirven como botón sólido, rojo no sirve como texto), la tabla de tokens con sus valores en claro y oscuro, y la instrucción de correr `node scripts/check-contrast.mjs` antes de agregar cualquier color.

- [ ] **Step 5: Commit final**

```bash
git add docs/paleta-colores.md && git commit -m "docs: referencia de la paleta de colores y sus contrastes"
```

---

## Verificación visual (requiere autorización)

Fuera del alcance automático de este plan. Si el usuario autoriza levantar el dev server de Next, revisar en este orden, en 375px / 768px / 1280px y en modo claro y oscuro:

1. `/pages/Login` — el formulario de acceso, el cambio a registro, el toggle de contraseña, el aviso de Sistemas
2. Home / dashboard — sidebar, header, tarjetas
3. Estadísticas — la rampa del medidor y los gráficos
4. Asistencia — badges de estado y paneles de alertas
5. Organigrama — colores de nodos
