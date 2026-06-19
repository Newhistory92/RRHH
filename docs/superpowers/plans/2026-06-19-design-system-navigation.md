# Sistema de Diseño + Navegación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el shell de navegación plano actual (`Header.tsx` + `Sidebar.tsx`, montados directo en `src/app/page.tsx`) por un sistema de diseño con tokens claro/oscuro y un sidebar agrupado por secciones, sin tocar el contenido de las páginas existentes.

**Architecture:** `src/app/page.tsx` es una SPA shell: un solo Client Component que mantiene `page` en estado de React y renderiza condicionalmente los componentes de página (`switch` en `renderPage()`) — no hay rutas de Next.js por página. El nuevo shell (`AppSidebar`/`AppHeader`/`AppLayout`) se construye en `src/app/Componentes/Shell/` en paralelo al actual, y el único cambio en código existente es: (1) envolver `RootLayout` con un theme provider, y (2) en `page.tsx`, reemplazar el bloque `<Header/><Sidebar/><main>` por `<AppLayout>{renderPage()}</AppLayout>`.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS v4 (CSS-first config, sin `tailwind.config.js`), shadcn/ui (Radix + Tailwind), lucide-react, next-themes. El proyecto también usa `primereact` (Header actual) — no se toca ni se reemplaza en este plan.

## Global Constraints

- No crear ni modificar tests automatizados — el spec define la verificación como manual en navegador (ver sección "Testing" del spec). Cada tarea cierra con una verificación de build/lint + checklist manual, no con un test runner.
- No modificar el contenido interno de ninguna página existente (`src/app/pages/**`).
- No borrar `Sidebar.tsx`/`Header.tsx` actuales en este plan — quedan sin uso tras la Tarea 8, se eliminan en un plan posterior una vez confirmado que todo funciona en producción.
- Alias de imports: `@/*` → `./src/*` (ya configurado en `tsconfig.json`).
- Mantener compatibilidad de `src/app/util/rbac.ts`: las funciones `canAccess`, `getDefaultPage`, `isReadOnlyForRole`, `getSidebarPages` no cambian su firma ni comportamiento — solo se agregan funciones/campos nuevos.
- Comportamiento a preservar exactamente: el rol `USER` (id 2) no tiene sidebar (sigue así en `AppSidebar`).

---

### Task 1: Instalar shadcn/ui y componentes base

**Files:**
- Create: `components.json` (generado por el CLI de shadcn)
- Create: `src/lib/utils.ts` (generado por el CLI, helper `cn()`)
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Modify: `package.json` (agrega dependencias de Radix que el CLI instala automáticamente)

**Interfaces:**
- Produces: `cn(...)` helper desde `@/lib/utils`, y los componentes `Button`, `Avatar`/`AvatarImage`/`AvatarFallback`, `DropdownMenu*`, `Tooltip*`, `Separator`, `Badge`, `Sheet*`, `Skeleton` desde `@/components/ui/*` — estas son las firmas estándar de shadcn/ui, usadas tal cual en las Tareas 5-7.

- [ ] **Step 1: Inicializar shadcn/ui**

Correr en la raíz del repo (`C:\Users\Emiliano\Documents\RRHH`):

```bash
npx shadcn@latest init
```

Cuando pregunte por estilo, elegir **New York** (más denso, encaja con la referencia Deel/Factorial del spec). Cuando pregunte por color base, elegir **Neutral**. Confirmar que detecta Tailwind v4 y TypeScript automáticamente (el CLI lee `tsconfig.json` y `globals.css`).

- [ ] **Step 2: Verificar que se creó `components.json` y `src/lib/utils.ts`**

Run: `cat components.json` y `cat src/lib/utils.ts` (o abrir los archivos)
Expected: `components.json` existe con `"tailwind": { "css": "src/app/globals.css", ... }` y `src/lib/utils.ts` exporta una función `cn`.

- [ ] **Step 3: Instalar los componentes base**

```bash
npx shadcn@latest add button avatar dropdown-menu tooltip separator badge sheet skeleton
```

- [ ] **Step 4: Verificar que el proyecto sigue compilando**

Run: `npm run build`
Expected: build exitoso, sin errores de TypeScript ni de Tailwind (puede haber warnings preexistentes del proyecto, no nuevos errores).

- [ ] **Step 5: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui package.json package-lock.json
git commit -m "chore: install shadcn/ui base components"
```

---

### Task 2: Dark mode con next-themes

**Files:**
- Modify: `package.json` (agregar dependencia `next-themes`)
- Create: `src/app/providers/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: ninguna interfaz previa.
- Produces: `<ThemeProvider>` (wrapper de `next-themes`) usado en `src/app/layout.tsx`. El hook `useTheme()` de `next-themes` (re-exportado, no hace falta wrapper propio) queda disponible para `AppHeader` en la Tarea 6 — firma: `const { theme, setTheme } = useTheme()`, donde `theme` es `"light" | "dark" | "system" | undefined` y `setTheme(t: string)` cambia el tema.

- [ ] **Step 1: Instalar next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Habilitar variante `dark` por clase en Tailwind v4**

Editar `src/app/globals.css`, agregar la línea justo después del `@import "tailwindcss";` (línea 1):

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Esto hace que las clases `dark:` ya usadas en el proyecto (ej. `dark:bg-gray-900` en `page.tsx`) respondan a la clase `.dark` en `<html>` en vez de a `prefers-color-scheme`, que es lo que necesita `next-themes` para funcionar con toggle manual.

- [ ] **Step 3: Eliminar el media query de dark mode automático**

En el mismo archivo `src/app/globals.css`, eliminar el bloque (líneas 15-20 del archivo actual):

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Este bloque se reemplaza por los tokens de tema que se agregan en la Tarea 3 (selector `.dark`, no media query).

- [ ] **Step 4: Crear el wrapper de ThemeProvider**

Create `src/app/providers/ThemeProvider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 5: Envolver el RootLayout**

Modify `src/app/layout.tsx`, reemplazar el contenido completo por:

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

`suppressHydrationWarning` en `<html>` es necesario porque `next-themes` setea la clase `dark`/`light` en el cliente antes de la hidratación — sin esto, React tira un warning de mismatch que es un falso positivo conocido de esta librería.

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/app/providers/ThemeProvider.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add next-themes for manual light/dark toggle"
```

---

### Task 3: Tokens de diseño (claro/oscuro)

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: variables CSS `--color-primary`, `--color-primary-foreground`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-success`, `--color-warning`, `--color-error`, `--color-info` (y sus pares `-foreground` donde aplica), disponibles como utilidades Tailwind (`bg-primary`, `text-primary-foreground`, `border-border`, etc.) consumidas en las Tareas 5-7.

- [ ] **Step 1: Reemplazar el bloque de tokens**

Modify `src/app/globals.css`. El archivo después de las Tareas 1-2 tiene esta forma (CLI de shadcn ya agregó sus propios tokens en el Step 1 de la Tarea 1, dentro de `:root` y `.dark`). Agregar los tokens de negocio del producto **dentro de los bloques `:root` y `.dark` ya creados por shadcn**, sin duplicar el bloque `@theme inline`:

```css
:root {
  /* ...tokens existentes generados por shadcn (--background, --foreground, --primary, etc.)... */
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
  /* ...tokens existentes generados por shadcn... */
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

En el bloque `@theme inline` (también generado por shadcn en la Tarea 1), agregar el mapeo de estas 4 variables nuevas, siguiendo el mismo patrón que las existentes (`--color-primary: var(--primary)`, etc.):

```css
@theme inline {
  /* ...mapeos existentes generados por shadcn... */
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

- [ ] **Step 2: Verificar que las utilidades nuevas compilan**

Crear un archivo temporal de prueba `src/app/test-tokens.tsx`:

```tsx
export default function TestTokens() {
  return (
    <div className="p-4 space-y-2">
      <div className="bg-success text-success-foreground p-2 rounded">success</div>
      <div className="bg-warning text-warning-foreground p-2 rounded">warning</div>
      <div className="bg-error text-error-foreground p-2 rounded">error</div>
      <div className="bg-info text-info-foreground p-2 rounded">info</div>
    </div>
  );
}
```

Run: `npm run build`
Expected: build exitoso (confirma que Tailwind generó las clases `bg-success`, `bg-warning`, etc. sin error).

- [ ] **Step 3: Borrar el archivo temporal de prueba**

```bash
rm src/app/test-tokens.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add semantic color tokens (success/warning/error/info) for light and dark themes"
```

---

### Task 4: Agrupar páginas por sección en rbac.ts

**Files:**
- Modify: `src/app/util/rbac.ts`

**Interfaces:**
- Consumes: `Page` type desde `@/app/Interfas/Interfaces`, `PAGE_CONFIG`/`PageConfig`/`ROLE_ID` ya existentes en el mismo archivo.
- Produces: tipo `NavSection` y función `getSidebarSections(roleId: number): { label: string; pages: PageConfig[] }[]`, consumida por `AppSidebar` en la Tarea 5. No modifica `getSidebarPages`, `canAccess`, `getDefaultPage`, ni `isReadOnlyForRole` — siguen exactamente igual para no romper `Sidebar.tsx`/`page.tsx` actuales.

- [ ] **Step 1: Agregar el campo `section` a cada entrada de `PAGE_CONFIG`**

Modify `src/app/util/rbac.ts`. Agregar el campo `section` a la interfaz `PageConfig` (línea 19-29 actual) y asignar la sección correspondiente a cada entrada existente de `PAGE_CONFIG` (líneas 31-107 actuales). El archivo resultante para `PageConfig` y `PAGE_CONFIG` queda:

```typescript
export interface PageConfig {
  id: Page;
  label: string;
  icon: string;
  section: "General" | "Gente" | "Organización" | "Aprendizaje" | "IA" | "Sistema";
  visibleFor: RoleId[];
  accessibleFor: RoleId[];
  readOnlyForEstadista?: boolean;
}

export const PAGE_CONFIG: PageConfig[] = [
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: "BarChart2",
    section: "General",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
  },
  {
    id: "recursos-humanos",
    label: "Recursos Humanos",
    icon: "Users",
    section: "Gente",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "configuracion-licencias",
    label: "Configuración de Licencias",
    icon: "Settings",
    section: "Organización",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "ia",
    label: "Inteligencia Artificial",
    icon: "BrainCircuit",
    section: "IA",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "organigrama",
    label: "Organigrama",
    icon: "GitMerge",
    section: "Organización",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.ESTADISTA],
    readOnlyForEstadista: true,
  },
  {
    id: "test",
    label: "Tests",
    icon: "ClipboardList",
    section: "Aprendizaje",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
  },
  {
    id: "editar-perfil",
    label: "Mi Perfil",
    icon: "UserCircle",
    section: "Gente",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "licencias",
    label: "Licencias",
    icon: "FileText",
    section: "Organización",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "MessageSquare",
    section: "Gente",
    visibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH],
    accessibleFor: [ROLE_ID.ADMIN, ROLE_ID.RRHH, ROLE_ID.USER],
  },
  {
    id: "admin",
    label: "Administración",
    icon: "Shield",
    section: "Sistema",
    visibleFor: [ROLE_ID.ADMIN],
    accessibleFor: [ROLE_ID.ADMIN],
  },
];
```

- [ ] **Step 2: Agregar `getSidebarSections`**

En el mismo archivo, agregar esta función después de `getSidebarPages` (no reemplazarla, queda intacta):

```typescript
export interface NavSection {
  label: PageConfig["section"];
  pages: PageConfig[];
}

const SECTION_ORDER: PageConfig["section"][] = [
  "General",
  "Gente",
  "Organización",
  "Aprendizaje",
  "IA",
  "Sistema",
];

/**
 * Retorna las páginas visibles para un roleId, agrupadas por sección y en
 * el orden fijo de SECTION_ORDER. Secciones sin páginas visibles para el
 * rol no se incluyen. USER (id 2) retorna [] (sin sidebar, igual que
 * getSidebarPages).
 */
export function getSidebarSections(roleId: number): NavSection[] {
  if (roleId === ROLE_ID.USER) return [];

  return SECTION_ORDER.map((section) => ({
    label: section,
    pages: PAGE_CONFIG.filter(
      (p) => p.section === section && p.visibleFor.includes(roleId as RoleId)
    ),
  })).filter((group) => group.pages.length > 0);
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: build exitoso. Si `Sidebar.tsx` actual sigue usando `getSidebarPages`, debe seguir compilando sin cambios (no se tocó esa función).

- [ ] **Step 4: Commit**

```bash
git add src/app/util/rbac.ts
git commit -m "feat: add section grouping to rbac page config"
```

---

### Task 5: AppSidebar

**Files:**
- Create: `src/app/Componentes/Shell/AppSidebar.tsx`

**Interfaces:**
- Consumes: `getSidebarSections(roleId)` y `ROLE_ID` desde `@/app/util/rbac` (Tarea 4); `Page` desde `@/app/Interfas/Interfaces`; componentes `Tooltip`/`TooltipContent`/`TooltipProvider`/`TooltipTrigger` y `Separator` desde `@/components/ui/*` (Tarea 1); iconos de `lucide-react` (mismo set que `Sidebar.tsx` actual: `BarChart2, Users, BrainCircuit, GitMerge, ClipboardList, Shield, UserCircle, FileText, MessageSquare, Settings, ChevronLeft, ChevronRight`).
- Produces: componente `AppSidebar` con props `{ activePage: Page; setPage: (page: Page) => void; roleId: number | null; isCollapsed: boolean; onToggleCollapse: () => void }`, usado por `AppLayout` en la Tarea 7.

- [ ] **Step 1: Crear el componente**

Create `src/app/Componentes/Shell/AppSidebar.tsx`:

```tsx
"use client";

import {
  BarChart2,
  Users,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Page } from "@/app/Interfas/Interfaces";
import { getSidebarSections, ROLE_ID } from "@/app/util/rbac";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart2,
  Users,
  Settings,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
};

interface AppSidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  roleId: number | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  activePage,
  setPage,
  roleId,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  if (!roleId || roleId === ROLE_ID.USER) return null;

  const sections = getSidebarSections(roleId);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={`bg-surface border-r border-border fixed top-0 left-0 h-full z-30 hidden md:flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <span className="text-lg font-semibold text-foreground">Talexa</span>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="absolute top-20 -right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:opacity-90 transition-opacity z-50"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden space-y-4">
          {sections.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && <Separator className="mb-3" />}
              {!isCollapsed && (
                <p className="px-3 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.pages.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] ?? Shield;
                  const isActive = activePage === item.id;
                  const link = (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item.id);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <IconComponent size={18} className="flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                    </a>
                  );

                  return (
                    <li key={item.id}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build exitoso, sin errores de TypeScript (verifica que los tipos de `getSidebarSections`/`Page`/props calcen).

- [ ] **Step 3: Commit**

```bash
git add src/app/Componentes/Shell/AppSidebar.tsx
git commit -m "feat: add AppSidebar with section grouping and collapse"
```

---

### Task 6: AppHeader

**Files:**
- Create: `src/app/Componentes/Shell/AppHeader.tsx`

**Interfaces:**
- Consumes: `Page`, `Employee`, `Notification` desde `@/app/Interfas/Interfaces`; `logoutFromClient` desde `@/app/util/authClient`; componentes `Avatar`/`AvatarImage`/`AvatarFallback`, `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem`/`DropdownMenuSeparator`, `Badge` desde `@/components/ui/*`; `useTheme` desde `next-themes` (Tarea 2); iconos `Bell`, `Sun`, `Moon`, `LogOut`, `UserCircle`, `FileText`, `MessageSquare` de `lucide-react`.
- Produces: componente `AppHeader` con props `{ setPage: (page: Page) => void; employeeData?: Employee | null }` (misma firma que el `Header` actual), usado por `AppLayout` en la Tarea 7.

- [ ] **Step 1: Crear el componente**

Create `src/app/Componentes/Shell/AppHeader.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, LogOut, UserCircle, FileText, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Employee, Page } from "@/app/Interfas/Interfaces";
import { logoutFromClient } from "@/app/util/authClient";

const DEFAULT_AVATAR = "/Default-avatar.webp";

interface AppHeaderProps {
  setPage: (page: Page) => void;
  employeeData?: Employee | null;
}

export function AppHeader({ setPage, employeeData }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [roleName, setRoleName] = useState("");
  const [userPhoto, setUserPhoto] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    setMounted(true);
    setUsuario(localStorage.getItem("usuario") ?? "");
    setRoleName(localStorage.getItem("roleName") ?? "");
  }, []);

  useEffect(() => {
    if (employeeData) {
      setUserName(employeeData.name || localStorage.getItem("usuario") || "Usuario");
      setUserPhoto(employeeData.photo || DEFAULT_AVATAR);
    }
  }, [employeeData]);

  const handleLogout = async () => {
    try {
      await logoutFromClient();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "pages/Login";
    }
  };

  const unreadCount = 0; // Notificaciones reales: fuera de alcance de este plan.

  return (
    <header className="h-16 sticky top-0 z-20 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center" />

      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-md hover:bg-surface-muted text-foreground transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-surface-muted text-foreground transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-foreground">
                {userName.split(" ")[0] || usuario || "Perfil"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="font-semibold text-sm">{employeeData?.name || userName}</p>
              <p className="text-xs text-muted-foreground">
                @{usuario || "—"} • {roleName || "—"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPage("editar-perfil")}>
              <UserCircle size={16} className="mr-2" /> Editar Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("licencias")}>
              <FileText size={16} className="mr-2" /> Licencias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("feedback")}>
              <MessageSquare size={16} className="mr-2" /> Encuesta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-error">
              <LogOut size={16} className="mr-2" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 3: Commit**

```bash
git add src/app/Componentes/Shell/AppHeader.tsx
git commit -m "feat: add AppHeader with theme toggle and profile dropdown"
```

---

### Task 7: AppLayout

**Files:**
- Create: `src/app/Componentes/Shell/AppLayout.tsx`

**Interfaces:**
- Consumes: `AppSidebar` (Tarea 5), `AppHeader` (Tarea 6), `Page`/`Employee` desde `@/app/Interfas/Interfaces`.
- Produces: componente `AppLayout` con props `{ activePage: Page; setPage: (page: Page) => void; roleId: number | null; employeeData?: Employee | null; children: React.ReactNode }`, usado en `page.tsx` (Tarea 8). Maneja internamente el estado de colapso del sidebar (no necesita prop externa — simplifica la firma respecto al `Sidebar.tsx` actual, que requería `onCollapseChange` para que `page.tsx` ajustara el padding del `<main>`).

- [ ] **Step 1: Crear el componente**

Create `src/app/Componentes/Shell/AppLayout.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AppSidebar } from "@/app/Componentes/Shell/AppSidebar";
import { AppHeader } from "@/app/Componentes/Shell/AppHeader";
import { Employee, Page } from "@/app/Interfas/Interfaces";
import { ROLE_ID } from "@/app/util/rbac";

interface AppLayoutProps {
  activePage: Page;
  setPage: (page: Page) => void;
  roleId: number | null;
  employeeData?: Employee | null;
  children: React.ReactNode;
}

export function AppLayout({
  activePage,
  setPage,
  roleId,
  employeeData,
  children,
}: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasSidebar = !!roleId && roleId !== ROLE_ID.USER;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar
        activePage={activePage}
        setPage={setPage}
        roleId={roleId}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />
      <div
        className={`transition-all duration-300 ${
          hasSidebar ? (isCollapsed ? "md:pl-16" : "md:pl-64") : ""
        }`}
      >
        <AppHeader setPage={setPage} employeeData={employeeData} />
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 3: Commit**

```bash
git add src/app/Componentes/Shell/AppLayout.tsx
git commit -m "feat: add AppLayout combining AppSidebar and AppHeader"
```

---

### Task 8: Cutover — usar AppLayout en page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `AppLayout` desde `@/app/Componentes/Shell/AppLayout` (Tarea 7).
- Produces: ninguna interfaz nueva — este es el punto de corte final del plan.

- [ ] **Step 1: Reemplazar el import de Header/Sidebar por AppLayout**

Modify `src/app/page.tsx`. Reemplazar las líneas 11-12:

```tsx
import { Header } from '@/app/Componentes/Navbar/Header';
import { Sidebar } from '@/app/Componentes/Navbar/Sidebar';
```

por:

```tsx
import { AppLayout } from '@/app/Componentes/Shell/AppLayout';
```

- [ ] **Step 2: Eliminar el estado de colapso, ya no es responsabilidad de page.tsx**

Eliminar la línea 40:

```tsx
const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
```

(El colapso ahora vive dentro de `AppLayout`, ver Tarea 7 — `page.tsx` ya no necesita conocerlo.)

- [ ] **Step 3: Reemplazar el bloque de return final**

Reemplazar las líneas 174-199 actuales (el `return` final, desde `<div className="bg-gray-100 dark:bg-gray-900 ...">` hasta el cierre):

```tsx
  return (
    <PrimeReactProvider>
      <AppLayout
        activePage={page}
        setPage={handlePageChange}
        roleId={roleId}
        employeeData={employeeData}
      >
        {renderPage()}
      </AppLayout>
    </PrimeReactProvider>
  );
}
```

Nota: `PrimeReactProvider` y sus imports de CSS (líneas 21-23: `PrimeReactProvider`, `"primereact/resources/themes/lara-light-cyan/theme.css"`, `'primeicons/primeicons.css'`) se mantienen sin cambios — varias páginas internas (ej. `Header.tsx` original, que ya no se usa, pero otras páginas como `LicenciasManage` o `Admin` pueden usar componentes PrimeReact) siguen dependiendo de ese contexto. No se exploró ni se modifica ese alcance en este plan.

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build exitoso, sin errores de TypeScript ni imports rotos.

- [ ] **Step 5: Verificación manual en navegador**

Run: `npm run dev`, abrir `http://localhost:3000` y, logueado con cada rol disponible (ADMIN, RRHH, ESTADISTA, USER — usar usuarios de prueba existentes en la base), confirmar:

- El sidebar muestra exactamente las secciones esperadas por rol: ADMIN ve las 6 secciones (incluyendo "Sistema"), RRHH ve todas menos "Sistema", ESTADISTA ve solo "General" (Estadísticas) y "Organización" (Organigrama, en modo solo lectura), USER no ve sidebar en absoluto.
- El botón de colapsar/expandir el sidebar funciona y el contenido principal ajusta su padding izquierdo en consecuencia.
- El toggle de tema (sol/luna) en el header cambia el modo claro/oscuro inmediatamente, y persiste tras refrescar la página (next-themes guarda en `localStorage` con la key `theme` por defecto).
- El menú de perfil en el header abre, muestra nombre/usuario/rol correctos, y los accesos rápidos (Editar Perfil, Licencias, Encuesta) navegan a la página correcta.
- Cerrar sesión desde el menú de perfil funciona igual que antes (redirige a login).
- Todas las páginas internas (Estadísticas, RRHH, Organigrama, Licencias, Feedback, IA, Tests, Admin, CV) siguen renderizando su contenido normalmente dentro del nuevo layout — no se rompió ninguna.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: cut over page.tsx to use AppLayout (design system + sectioned sidebar)"
```

---

## Post-plan cleanup (no parte de este plan, anotar para el próximo)

Una vez confirmado en producción que el nuevo shell funciona sin regresiones, un plan posterior debe:
- Eliminar `src/app/Componentes/Navbar/Header.tsx` y `Sidebar.tsx` (quedan sin uso tras la Tarea 8).
- Implementar notificaciones reales en `AppHeader` (`unreadCount` está hardcodeado en `0` — el `Header.tsx` original tenía un `TODO: reemplazar por fetch a /notifications/{employeeId}` nunca resuelto; este plan no lo resuelve, solo preserva el placeholder visual).
