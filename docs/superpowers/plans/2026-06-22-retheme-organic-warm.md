# Retema "Orgánico Cálido" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la paleta neutra OKLCH actual de Talexa por la paleta cálida "Orgánico Cálido" (rosa coral, gris claro, beige, marrón topo, verde lima), con forma de bordes más redondeados y tipografía Fraunces+Inter, sin tocar la estructura ya construida del sidebar/header/layout.

**Architecture:** Es un retema puro sobre `src/app/globals.css` (tokens) y `src/app/layout.tsx` (fuentes) — ambos ya existentes del plan anterior. Los componentes `AppSidebar`/`AppHeader`/`AppLayout` consumen esos tokens por nombre de clase Tailwind (`bg-primary`, `text-foreground`, `rounded-md`, etc.), así que la mayoría de la superficie visual cambia automáticamente con el cambio de tokens — solo 2 lugares puntuales requieren ediciones de clase explícitas (color del ítem activo del sidebar, fondo del propio sidebar) porque la spec les asigna un token distinto al que usan hoy.

**Tech Stack:** Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), `next/font/google` (Fraunces, Inter), shadcn/ui (componente `dropdown-menu.tsx` ya instalado).

## Global Constraints

- No modificar contenido interno de páginas existentes (`src/app/screens/**`).
- No tocar los tokens semánticos `--color-success/warning/error/info` (son de estado de sistema, no decorativos) — el spec los deja explícitamente sin cambios.
- No introducir ninguna librería de iconos nueva — los iconos siguen siendo `lucide-react` de línea, sin cambios.
- Mantener los nombres de variable CSS ya existentes (`--background`, `--primary`, etc.) — solo cambian valores, salvo los 2 tokens nuevos (`--warm-contrast`, `--warm-contrast-foreground`) y el nuevo `--shadow-soft`.
- Verificación: `npx tsc --noEmit` acotado a archivos tocados, más verificación visual manual en navegador (no hay tests automatizados para cambios puramente visuales, según el spec).

---

### Task 1: Retema de tokens en globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: ninguna interfaz previa de código — son valores CSS consumidos por clases Tailwind ya usadas en `AppSidebar.tsx`/`AppHeader.tsx`/`AppLayout.tsx` y los componentes `src/components/ui/*`.
- Produces: variables `--color-warm-contrast`/`--color-warm-contrast-foreground` (nuevas, disponibles como utilidades Tailwind `bg-warm-contrast`/`text-warm-contrast-foreground`) y `--shadow-soft` (nueva, disponible como utilidad `shadow-soft`), consumidas por la Tarea 3 (AppSidebar) y la Tarea 4 (dropdown-menu).

- [ ] **Step 1: Reemplazar el contenido completo de `:root` y `.dark`**

Modify `src/app/globals.css`. El archivo actual tiene este `:root`/`.dark` (líneas 4-63):

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --color-success: #16a34a;
  --color-success-foreground: #ffffff;
  --color-warning: #d97706;
  --color-warning-foreground: #ffffff;
  --color-error: #dc2626;
  --color-error-foreground: #ffffff;
  --color-info: #2563eb;
  --color-info-foreground: #ffffff;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --color-success: #22c55e;
  --color-success-foreground: #052e16;
  --color-warning: #f59e0b;
  --color-warning-foreground: #451a03;
  --color-error: #ef4444;
  --color-error-foreground: #450a0a;
  --color-info: #3b82f6;
  --color-info-foreground: #172554;
}
```

Reemplazar ambos bloques completos por:

```css
:root {
  --radius: 1rem;
  --background: #FAF8F6;
  --foreground: #3A2F27;
  --card: #FFFFFF;
  --card-foreground: #3A2F27;
  --popover: #FFFFFF;
  --popover-foreground: #3A2F27;
  --primary: #E7717D;
  --primary-foreground: #FFFFFF;
  --secondary: #C2B9B0;
  --secondary-foreground: #3A2F27;
  --muted: #C2CAD0;
  --muted-foreground: #5A6470;
  --accent: #AFD275;
  --accent-foreground: #2D3B1A;
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: color-mix(in srgb, #C2B9B0 35%, transparent);
  --input: color-mix(in srgb, #C2B9B0 35%, transparent);
  --ring: color-mix(in srgb, #E7717D 50%, transparent);
  --warm-contrast: #7E685A;
  --warm-contrast-foreground: #FFFFFF;
  --shadow-soft: 0 2px 10px rgba(0, 0, 0, 0.06);
  --color-success: #16a34a;
  --color-success-foreground: #ffffff;
  --color-warning: #d97706;
  --color-warning-foreground: #ffffff;
  --color-error: #dc2626;
  --color-error-foreground: #ffffff;
  --color-info: #2563eb;
  --color-info-foreground: #ffffff;
}

.dark {
  --background: #211B16;
  --foreground: #F0EBE6;
  --card: #2D2520;
  --card-foreground: #F0EBE6;
  --popover: #2D2520;
  --popover-foreground: #F0EBE6;
  --primary: #F08D98;
  --primary-foreground: #2D1115;
  --secondary: #3D352E;
  --secondary-foreground: #F0EBE6;
  --muted: #332C26;
  --muted-foreground: #B5AAA0;
  --accent: #C3E098;
  --accent-foreground: #1A2410;
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: #4A3F36;
  --input: #4A3F36;
  --ring: color-mix(in srgb, #F08D98 50%, transparent);
  --warm-contrast: #A68A78;
  --warm-contrast-foreground: #211B16;
  --shadow-soft: 0 2px 10px rgba(0, 0, 0, 0.06);
  --color-success: #22c55e;
  --color-success-foreground: #052e16;
  --color-warning: #f59e0b;
  --color-warning-foreground: #451a03;
  --color-error: #ef4444;
  --color-error-foreground: #450a0a;
  --color-info: #3b82f6;
  --color-info-foreground: #172554;
}
```

Nota: `--destructive`/`--destructive-foreground` quedan sin cambios (no forman parte de la paleta nueva, son un token semántico de shadcn distinto de los `--color-success/warning/error/info` propios del proyecto). `--border`/`--input`/`--ring` usan `color-mix()` (soportado en todos los navegadores modernos) para lograr la opacidad pedida en el spec sin depender de un formato de color específico.

- [ ] **Step 2: Agregar los mapeos nuevos en `@theme inline`**

En el mismo archivo, el bloque `@theme inline` actual (líneas 65-101) ya mapea `--color-border`, `--color-success`, etc. Agregar estas 3 líneas nuevas inmediatamente después de la línea `--color-ring: var(--ring);` y antes de `--color-success: var(--color-success);`:

```css
  --color-warm-contrast: var(--warm-contrast);
  --color-warm-contrast-foreground: var(--warm-contrast-foreground);
  --shadow-soft: var(--shadow-soft);
```

El bloque `@theme inline` completo queda así (mostrado entero para evitar ambigüedad de dónde insertar):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-surface: var(--card);
  --color-surface-muted: var(--muted);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-warm-contrast: var(--warm-contrast);
  --color-warm-contrast-foreground: var(--warm-contrast-foreground);
  --shadow-soft: var(--shadow-soft);
  --color-success: var(--color-success);
  --color-success-foreground: var(--color-success-foreground);
  --color-warning: var(--color-warning);
  --color-warning-foreground: var(--color-warning-foreground);
  --color-error: var(--color-error);
  --color-error-foreground: var(--color-error-foreground);
  --color-info: var(--color-info);
  --color-info-foreground: var(--color-info-foreground);
}
```

(`--font-sans`/`--font-mono` se editan en la Tarea 2 — no los toques en este paso.)

- [ ] **Step 2.5: Probar que los tokens nuevos generan utilidades**

Crear un archivo temporal `src/app/test-retheme-probe.tsx`:

```tsx
export default function TestRetheme() {
  return (
    <div className="p-4 space-y-2 rounded-lg shadow-soft bg-warm-contrast text-warm-contrast-foreground">
      probe
    </div>
  );
}
```

Run: `npx tsc --noEmit` — confirmar que no hay errores nuevos en `globals.css` ni en `test-retheme-probe.tsx` (ignorar errores preexistentes no relacionados en otros archivos).

Run: `npm run dev` brevemente (arrancar, esperar "Ready", detener) y, si es posible, abrir `http://localhost:3000/test-retheme-probe` para confirmar visualmente que el fondo es marrón topo (`#7E685A`) con sombra suave y bordes de 16px. Si no podés verificarlo visualmente, al menos confirmar que el servidor de dev compila sin error.

- [ ] **Step 3: Borrar el archivo temporal de prueba**

```bash
rm src/app/test-retheme-probe.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: retheme tokens to organic-warm palette (light + dark)"
```

---

### Task 2: Tipografía Fraunces + Inter

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: ninguna interfaz de código previa.
- Produces: variable Tailwind `--font-heading` (utilidad `font-heading`, mapeada a Fraunces) y `--font-sans` retargeteado a Inter (afecta el `font-sans` default que ya usa todo el proyecto). Consumida por la Tarea 3 (wordmark "Talexa" en `AppSidebar`).

- [ ] **Step 1: Reemplazar Geist por Fraunces + Inter en layout.tsx**

El archivo actual `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talexa",
  description: "Gestion de Personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Reemplazar completo por:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talexa",
  description: "Gestion de Personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Geist Mono se mantiene sin cambios (el spec no pide tocar texto monoespaciado).

- [ ] **Step 2: Retargetear `--font-sans` a Inter y agregar `--font-heading`**

Modify `src/app/globals.css`. En el bloque `@theme inline` (modificado en la Tarea 1), cambiar la línea:

```css
  --font-sans: var(--font-geist-sans);
```

por:

```css
  --font-sans: var(--font-inter);
  --font-heading: var(--font-fraunces);
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `layout.tsx`/`globals.css`.

Run: `npm run dev` brevemente, confirmar que arranca sin error (las fuentes de Google se descargan en build time vía `next/font`, así que un fallo de red aquí se vería como error de build — si eso pasa, reportarlo como BLOCKED, no hay fallback silencioso razonable para este paso).

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: replace Geist with Fraunces (headings) + Inter (body)"
```

---

### Task 3: Aplicar paleta y tipografía a AppSidebar

**Files:**
- Modify: `src/app/Componentes/Shell/AppSidebar.tsx`

**Interfaces:**
- Consumes: utilidades Tailwind `bg-muted`, `bg-warm-contrast`, `text-warm-contrast-foreground`, `font-heading` (de las Tareas 1-2).
- Produces: ninguna interfaz nueva — solo cambia clases CSS, las props (`AppSidebarProps`) no cambian.

- [ ] **Step 1: Cambiar el fondo del `<aside>` de `bg-surface` a `bg-muted`**

El archivo actual tiene en la línea 62:

```tsx
        className={`bg-surface border-r border-border fixed top-0 left-0 h-full z-30 hidden md:flex flex-col transition-all duration-300 ease-in-out ${
```

Cambiar `bg-surface` por `bg-muted`:

```tsx
        className={`bg-muted border-r border-border fixed top-0 left-0 h-full z-30 hidden md:flex flex-col transition-all duration-300 ease-in-out ${
```

Razón: el mockup aprobado muestra el sidebar con fondo gris claro (`--muted`), reservando blanco/`--card` (`bg-surface`) para el header y el contenido — `bg-surface` hoy mapea a `--card`, que ahora es blanco puro (`#FFFFFF`), no el gris claro deseado para el sidebar.

- [ ] **Step 2: Aplicar `font-heading` al wordmark "Talexa"**

El archivo actual tiene en la línea 68:

```tsx
            <span className="text-lg font-semibold text-foreground">Talexa</span>
```

Cambiar a:

```tsx
            <span className="font-heading text-xl font-semibold text-foreground">Talexa</span>
```

- [ ] **Step 3: Cambiar el color del ítem activo de `bg-primary` a `bg-warm-contrast`**

El archivo actual tiene en las líneas 100-104:

```tsx
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      } ${isCollapsed ? "justify-center" : ""}`}
```

Cambiar a:

```tsx
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-warm-contrast text-warm-contrast-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      } ${isCollapsed ? "justify-center" : ""}`}
```

Razón: el spec reserva `--primary` (rosa coral) para CTAs/botones de acción, y `--warm-contrast` (marrón topo) para el ítem activo de navegación — son conceptualmente distintos aunque ambos sean "color de énfasis".

No cambiar el botón de colapsar (línea 74, `bg-primary text-primary-foreground`) — ese sí es un botón de acción, debe seguir usando `--primary` según el spec.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `AppSidebar.tsx`.

- [ ] **Step 5: Verificación visual manual**

Iniciar `npm run dev`, loguearse con un rol que tenga sidebar (ej. ADMIN) y confirmar:
- El sidebar tiene fondo gris claro, distinto del header/contenido (blanco/marfil).
- El wordmark "Talexa" se ve en la tipografía serif (Fraunces).
- El ítem de navegación activo tiene fondo marrón topo, no rosa.
- El botón de colapsar sigue siendo rosa coral (`--primary`).

- [ ] **Step 6: Commit**

```bash
git add src/app/Componentes/Shell/AppSidebar.tsx
git commit -m "feat: apply organic-warm palette to AppSidebar (muted bg, warm-contrast active state, Fraunces wordmark)"
```

---

### Task 4: Sombra suave en el menú desplegable de perfil

**Files:**
- Modify: `src/components/ui/dropdown-menu.tsx:45`
- Modify: `src/components/ui/dropdown-menu.tsx:233`

**Interfaces:**
- Consumes: utilidad Tailwind `shadow-soft` (de la Tarea 1).
- Produces: ninguna interfaz nueva — solo cambia clases CSS. Afecta a todo `DropdownMenuContent`/`DropdownMenuSubContent` en la app, incluyendo el menú de perfil de `AppHeader.tsx` (que es el único dropdown visible en el shell hoy).

- [ ] **Step 1: Cambiar `shadow-md` por `shadow-soft` en `DropdownMenuContent`**

El archivo actual tiene en la línea 45 (dentro de la clase larga de `DropdownMenuContent`):

```
...rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]...
```

Cambiar `shadow-md` por `shadow-soft` en esa cadena de clases (es la única ocurrencia de `shadow-md` en esa línea).

- [ ] **Step 2: Cambiar `shadow-lg` por `shadow-soft` en `DropdownMenuSubContent`**

El archivo actual tiene en la línea 233 (dentro de la clase larga de `DropdownMenuSubContent`):

```
...rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]...
```

Cambiar `shadow-lg` por `shadow-soft` en esa cadena de clases.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `dropdown-menu.tsx`.

- [ ] **Step 4: Verificación visual manual**

Con `npm run dev` corriendo, abrir el menú de perfil en el header (ícono de avatar) y confirmar que la sombra del menú desplegable se ve suave y difusa, no dura.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx
git commit -m "feat: use soft shadow on dropdown menus (profile menu, etc.)"
```
