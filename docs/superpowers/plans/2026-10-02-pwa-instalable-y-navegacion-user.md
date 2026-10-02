# PWA instalable y navegación del USER — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la app se pueda instalar en el celular y que quien no administra nada (hoy el rol USER) tenga sus secciones en una barra inferior en vez de repartidas entre dos menús.

**Architecture:** Dos capas independientes sobre la app que ya existe. La navegación sale de un único predicado en `rbac.ts` (`tieneNavegacionSimple`) que decide barra inferior o cajón lateral, y de ahí cuelgan un componente nuevo de barra y la recomposición del menú del avatar. La capa PWA son tres piezas sueltas: el manifest y el viewport (metadatos), un service worker propio que prioriza la red, y un botón de instalar que lee el evento del navegador.

**Tech Stack:** Next.js 15 (App Router), React, Tailwind con los tokens CSS del proyecto, lucide-react para íconos, Radix (`@/components/ui/dropdown-menu`), `next-themes`. Service worker a mano, sin dependencias nuevas.

## Global Constraints

- Nombre de la app instalada: `"RRHH"` en `name` y `short_name`, para que coincida con `metadata.title`.
- El recorte de la navegación se decide con **un solo** predicado: no tener ninguno de `rrhh.gestionar`, `estadisticas.ver`, `activos.configurar`, `admin.gestionar`.
- Barra inferior: **solo en celular** (`md:hidden`) y **solo** con Inicio, Asistencia, Licencias y Documentos.
- El service worker **no cachea la API**: la API vive en otro origen (puerto 8000) y se filtra por origen.
- El service worker **no usa `skipWaiting`**: la versión nueva toma el control en el próximo arranque en frío.
- En `install` el service worker precachea **solo** `/offline`.
- No se agregan dependencias al `package.json`.
- No se toca la duración de la sesión (2 horas) ni nada del backend.
- El frontend **no tiene runner de tests**. La verificación es `npx tsc --noEmit -p tsconfig.json` (el repo arrastra ~27 errores previos no relacionados: el criterio es **no agregar ninguno nuevo**) más prueba en el navegador.
- Commits en español, estilo del repo (`feat(...)`, `fix(...)`, `docs(...)`), terminando con una línea en blanco y `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Archivos con finales de línea LF y UTF-8.

### Cómo probar en el navegador sin credenciales reales

Varias tareas dependen de los permisos del usuario. Para probarlas sin cuenta real, en la consola del navegador con la app abierta en `http://localhost:3000`:

```js
// Rol sin permisos de gestión: debe ver la barra inferior.
localStorage.setItem('token', 'dummy-local-ui-test');
localStorage.setItem('employeeId', '1');
localStorage.setItem('permisos', JSON.stringify(['inicio.ver','perfil.editar','asistencia.propia','licencias.propias','documentos.propios','feedback.participar','reubicacion.solicitar']));
location.reload();
```

```js
// Rol de gestión: debe seguir con el cajón lateral y sin barra.
localStorage.setItem('permisos', JSON.stringify(['inicio.ver','rrhh.gestionar','estadisticas.ver']));
location.reload();
```

Las llamadas a la API van a fallar con 401 y las pantallas van a mostrar sus estados de error o vacío: es esperable y no invalida la prueba, que es de navegación y layout. Al terminar, `localStorage.clear()`.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/app/util/rbac.ts` | **Modificar.** Suma `PERMISOS_DE_GESTION` y `tieneNavegacionSimple`. |
| `src/app/Componentes/Shell/AppBottomNav.tsx` | **Nuevo.** La barra inferior. |
| `src/app/Componentes/Shell/AppLayout.tsx` | **Modificar.** Monta la barra, agrega el espacio inferior y le oculta la hamburguesa a quien tiene barra. |
| `src/app/Componentes/Shell/AppHeader.tsx` | **Modificar.** Menú del avatar sin solapamientos, Reubicación en celular, y el ítem de instalar. |
| `src/app/manifest.json` | **Modificar.** Nombre, íconos `any maskable`, `id`/`start_url`/`scope`, colores. |
| `src/app/layout.tsx` | **Modificar.** `viewport` con `viewportFit: "cover"`, `appleWebApp.capable`, y monta los dos componentes nuevos de abajo. |
| `src/app/Componentes/Shell/ThemeColorMeta.tsx` | **Nuevo.** Sincroniza `<meta name="theme-color">` con el tema elegido. |
| `src/app/Componentes/Shell/ServiceWorkerRegistrar.tsx` | **Nuevo.** Registra el service worker en producción. |
| `public/sw.js` | **Nuevo.** El service worker. |
| `src/app/offline/page.tsx` | **Nuevo.** La pantalla de respaldo sin conexión. |
| `src/app/util/useInstalarApp.ts` | **Nuevo.** Estado de instalabilidad y disparo del cartel. |
| `src/app/Componentes/Shell/InstalarApp.tsx` | **Nuevo.** El ítem del menú y la hoja de instrucciones de iPhone. |

**Orden de las tareas:** primero la navegación (tareas 1 a 3), que es el dolor original y se puede verificar en el servidor de desarrollo; después la capa PWA (tareas 4 a 6), que necesita `next build && next start` y, para lucirse de verdad, el dominio con HTTPS.

---

## Task 1: El predicado que decide la navegación

**Files:**
- Modify: `src/app/util/rbac.ts` (al final del archivo, después de `getSidebarSections`)

**Interfaces:**
- Consumes: `tienePermiso` de `@/app/util/permisos`, ya importado en ese archivo.
- Produces: `PERMISOS_DE_GESTION: readonly string[]` y `tieneNavegacionSimple(permisos: string[]): boolean`.

**Nota sobre el spec:** el spec dice que la constante nueva quedaría "reusada por los `ocultaSiTienePermiso` que hoy la repiten". Al escribir el plan se verificó que **eso ya no aplica**: hoy ninguna entrada de `PAGE_CONFIG` repite los cuatro permisos (`documentos` usa solo dos, `rrhh.gestionar` y `admin.gestionar`). Cambiar `documentos` para que use los cuatro le sacaría Documentos del sidebar a ESTADISTA, TÉCNICO y PATRIMONIO, que es un cambio de comportamiento que el spec no pide. **No tocar `ocultaSiTienePermiso`.** La constante nueva la consume solo `tieneNavegacionSimple`.

- [ ] **Step 1: Agregar la constante y el predicado**

Al final de `src/app/util/rbac.ts`:

```typescript
/**
 * Los permisos que marcan un rol de gestión.
 *
 * Se declaran juntos y con nombre porque de esta lista depende qué navegación
 * ve cada rol, y una copia suelta en otro archivo se desincroniza sin que
 * nadie lo note.
 */
export const PERMISOS_DE_GESTION: readonly string[] = [
  "rrhh.gestionar",
  "estadisticas.ver",
  "activos.configurar",
  "admin.gestionar",
];

/**
 * Si a esta persona le alcanza una barra inferior de cuatro secciones.
 *
 * Hoy es el rol USER y nadie más: ESTADISTA tiene estadisticas.ver, TECNICO y
 * PATRIMONIO tienen activos.configurar, RRHH tiene rrhh.gestionar y ADMIN
 * pasa cualquier chequeo por el comodín. Todos esos tienen diez o más
 * secciones y siguen con el cajón lateral.
 */
export function tieneNavegacionSimple(permisos: string[]): boolean {
  return !PERMISOS_DE_GESTION.some((permiso) => tienePermiso(permisos, permiso));
}
```

- [ ] **Step 2: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "rbac"`
Expected: sin salida.

- [ ] **Step 3: Verificar el predicado en la consola del navegador**

Con la app corriendo (`npm run dev`), en la consola:

```js
// Sin sesión alcanza: el módulo es puro. Importa el bundle ya cargado.
// Si no es accesible desde la consola, saltear este paso: la tarea 2 lo
// ejercita de punta a punta con los dos juegos de permisos.
```

Si el módulo no es alcanzable desde la consola (lo habitual con el bundle de producción), dejar la verificación funcional para la tarea 2, que prueba el predicado a través de la UI con los dos juegos de permisos del encabezado de este plan.

- [ ] **Step 4: Commit**

```bash
git add src/app/util/rbac.ts
git commit -m "feat(nav): predicado unico para decidir barra inferior o cajon lateral"
```

---

## Task 2: La barra inferior

**Files:**
- Create: `src/app/Componentes/Shell/AppBottomNav.tsx`
- Modify: `src/app/Componentes/Shell/AppLayout.tsx`

**Interfaces:**
- Consumes: `tieneNavegacionSimple` y `canAccess` de `@/app/util/rbac`; el tipo `Page` de `@/app/Interfas/Interfaces`.
- Produces: `AppBottomNav` con props `{ activePage: Page; setPage: (page: Page) => void; permisos: string[] }`.

- [ ] **Step 1: Crear la barra**

Crear `src/app/Componentes/Shell/AppBottomNav.tsx`:

```tsx
"use client";

// Barra inferior para quien no administra nada (hoy el rol USER), solo en
// celular. Sus cuatro secciones entran en la barra, así que no necesita el
// cajón lateral ni ir a buscar la mitad de las cosas al menú del avatar.

import { Clock, FileText, Folder, Home } from "lucide-react";
import { Page } from "@/app/Interfas/Interfaces";
import { canAccess } from "@/app/util/rbac";

const ITEMS: { id: Page; label: string; Icono: typeof Home }[] = [
  { id: "inicio", label: "Inicio", Icono: Home },
  { id: "asistencia", label: "Asistencia", Icono: Clock },
  { id: "licencias", label: "Licencias", Icono: FileText },
  { id: "documentos", label: "Documentos", Icono: Folder },
];

interface AppBottomNavProps {
  activePage: Page;
  setPage: (page: Page) => void;
  permisos: string[];
}

export function AppBottomNav({ activePage, setPage, permisos }: AppBottomNavProps) {
  // Se filtra por permiso igual que el sidebar: si algún día un rol sin
  // gestión no tiene una de las cuatro, la barra sale con menos ítems en vez
  // de ofrecer una sección que después responde "Acceso denegado".
  const visibles = ITEMS.filter((item) => canAccess(permisos, item.id));
  if (visibles.length === 0) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-border bg-card"
      // Respeta el indicador de inicio del iPhone. Depende de
      // viewportFit: "cover" en el layout: sin eso este valor es siempre 0.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {visibles.map(({ id, label, Icono }) => {
        const activo = activePage === id;
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            aria-current={activo ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
              activo ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icono size={22} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Montarla en el layout**

En `src/app/Componentes/Shell/AppLayout.tsx`, agregar a los imports:

```tsx
import { AppBottomNav } from "@/app/Componentes/Shell/AppBottomNav";
import { getSidebarSections, tieneNavegacionSimple } from "@/app/util/rbac";
```

(el import de `getSidebarSections` ya existe: sumarle `tieneNavegacionSimple` en la misma línea).

Dentro del componente, después de `const hasSidebar = ...`:

```tsx
  const navegacionSimple = tieneNavegacionSimple(permisos);
```

Cambiar la prop del header para que a quien tiene barra no le quede una hamburguesa que no abre nada:

```tsx
        hayMenu={hasSidebar && !navegacionSimple}
```

Y después del `<AppSidebar ... />`, montar la barra:

```tsx
      {navegacionSimple && (
        <AppBottomNav activePage={activePage} setPage={setPage} permisos={permisos} />
      )}
```

Por último, el contenedor del contenido tiene que dejar espacio abajo para que la barra no tape nada. La barra es `md:hidden`, así que el espacio también va solo en celular:

```tsx
      <div
        className={`pt-16 transition-all duration-300 ${
          hasSidebar ? (isCollapsed ? "md:pl-16" : "md:pl-64") : ""
        } ${navegacionSimple ? "pb-20 md:pb-0" : ""}`}
      >
```

- [ ] **Step 3: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "AppBottomNav|AppLayout"`
Expected: sin salida.

- [ ] **Step 4: Verificar en el navegador a 375 px**

Con `npm run dev` y el ancho del navegador en 375 px, usando el juego de permisos **sin gestión** del encabezado de este plan:

1. Aparece la barra inferior con Inicio, Asistencia, Licencias y Documentos.
2. **No** aparece el botón de menú (☰) en la barra superior.
3. Tocar cada ítem cambia de sección y el ítem tocado queda marcado con el color primario.
4. Al final del scroll, el contenido no queda tapado por la barra.

Después, con el juego de permisos **de gestión**:

5. **No** aparece la barra inferior.
6. **Sí** aparece el botón de menú y abre el cajón lateral.

Y en ancho de escritorio, con los permisos sin gestión: no hay barra inferior y el sidebar se ve como siempre.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Shell/AppBottomNav.tsx src/app/Componentes/Shell/AppLayout.tsx
git commit -m "feat(nav): barra inferior en celular para los roles sin gestion"
```

---

## Task 3: El menú del avatar sin solapamientos

**Files:**
- Modify: `src/app/Componentes/Shell/AppHeader.tsx` (el bloque de `DropdownMenuItem` del menú de perfil)

**Interfaces:**
- Consumes: `tieneNavegacionSimple` y `canAccess` de `@/app/util/rbac`; `tienePermiso` de `@/app/util/permisos`, ya importado.
- Produces: nada que consuman otras tareas.

**El detalle que no es obvio y que hay que respetar:** `licencias` tiene `ocultaEnSidebar: true`, así que **en escritorio el menú del avatar es el único acceso a Licencias**. Si se le vacía el menú a quien tiene barra inferior, en la computadora pierde Licencias. Por eso los tres ítems que se solapan con la barra no se eliminan: se esconden **solo en celular**, con clases de Tailwind. Nada de detectar el ancho por JavaScript, que además traería diferencias entre el render del servidor y el del cliente.

- [ ] **Step 1: Agregar los imports y el predicado**

En `src/app/Componentes/Shell/AppHeader.tsx`, agregar a los imports:

```tsx
import { ArrowLeftRight } from "lucide-react";
import { canAccess, tieneNavegacionSimple } from "@/app/util/rbac";
```

(`ArrowLeftRight` es el ícono que `rbac.ts` ya asigna a Reubicación; sumarlo a la línea de `lucide-react` que ya existe.)

Dentro del componente, antes del `return`:

```tsx
  // Quien tiene barra inferior ya llega a Asistencia, Licencias y Documentos
  // desde ahí: en celular se esconden de este menú para no duplicarlas. En
  // escritorio no hay barra y este menú sigue siendo el único acceso a
  // Licencias, así que ahí se muestran igual.
  const navegacionSimple = tieneNavegacionSimple(permisos);
  const soloEscritorio = navegacionSimple ? "hidden md:block" : "";
```

- [ ] **Step 2: Recomponer los ítems**

Reemplazar el bloque de los cinco ítems (hoy entre `{tienePermiso(permisos, "perfil.editar") && (` y el cierre del de `"feedback.participar"`) por:

```tsx
            {tienePermiso(permisos, "perfil.editar") && (
              <DropdownMenuItem onClick={() => setPage("editar-perfil")}>
                <UserCircle size={16} className="mr-2" /> Editar Perfil
              </DropdownMenuItem>
            )}
            {tienePermiso(permisos, "asistencia.propia") && (
              <div className={soloEscritorio}>
                <DropdownMenuItem onClick={() => setPage("mi-asistencia")}>
                  <Clock size={16} className="mr-2" /> Mi Asistencia
                </DropdownMenuItem>
              </div>
            )}
            {tienePermiso(permisos, "licencias.propias") && (
              <div className={soloEscritorio}>
                <DropdownMenuItem onClick={() => setPage("licencias")}>
                  <FileText size={16} className="mr-2" /> Licencias
                </DropdownMenuItem>
              </div>
            )}
            {tienePermiso(permisos, "documentos.propios") && (
              <div className={soloEscritorio}>
                <DropdownMenuItem onClick={() => setPage("documentos")}>
                  <Folder size={16} className="mr-2" /> Documentos
                </DropdownMenuItem>
              </div>
            )}
            {tienePermiso(permisos, "feedback.participar") && (
              <DropdownMenuItem onClick={() => setPage("feedback")}>
                <MessageSquare size={16} className="mr-2" /> Encuesta
              </DropdownMenuItem>
            )}
            {/* Reubicación vive en el sidebar, que en celular no existe para
                quien tiene barra inferior: ahí se la agrega acá. */}
            {navegacionSimple && canAccess(permisos, "reubicacion") && (
              <div className="md:hidden">
                <DropdownMenuItem onClick={() => setPage("reubicacion")}>
                  <ArrowLeftRight size={16} className="mr-2" /> Reubicación
                </DropdownMenuItem>
              </div>
            )}
```

- [ ] **Step 3: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "AppHeader"`
Expected: sin salida.

- [ ] **Step 4: Verificar en el navegador**

Con el juego de permisos **sin gestión**, a 375 px, abriendo el menú del avatar:

1. Se ve: Editar Perfil, Encuesta, Reubicación, Cerrar Sesión.
2. **No** se ven Mi Asistencia, Licencias ni Documentos (están en la barra).
3. Reubicación abre la pantalla de reubicación.

Con los mismos permisos en ancho de escritorio:

4. Se ven los cinco de siempre (Editar Perfil, Mi Asistencia, Licencias, Documentos, Encuesta) y **no** Reubicación, que está en el sidebar.
5. Licencias sigue abriendo su pantalla: es el único acceso que tiene en escritorio.

Con el juego de permisos **de gestión** (escritorio y celular): el menú queda igual que antes de esta tarea, con los cinco ítems y sin Reubicación.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Shell/AppHeader.tsx
git commit -m "feat(nav): el menu del avatar deja de repetir lo que esta en la barra"
```

---

## Task 4: Manifest, viewport y color de la barra de estado

**Files:**
- Modify: `src/app/manifest.json`
- Modify: `src/app/layout.tsx`
- Create: `src/app/Componentes/Shell/ThemeColorMeta.tsx`

**Interfaces:**
- Consumes: `useTheme` de `next-themes` (el proyecto ya lo usa en `AppHeader`).
- Produces: componente `ThemeColorMeta` sin props, que no dibuja nada.

**Por qué el componente:** el `themeColor` del `viewport` de Next admite variantes por `prefers-color-scheme`, pero **este proyecto no usa el tema del sistema**: el `ThemeProvider` del layout corre con `attribute="class"` y `enableSystem={false}`, así que el tema lo elige la persona con el botón de la barra. Atarlo a `prefers-color-scheme` haría que la barra de estado contradiga a la app. Entonces: el `viewport` declara el color claro como valor inicial y un componente chico lo sincroniza con el tema realmente aplicado.

- [ ] **Step 1: Reescribir el manifest**

Reemplazar todo `src/app/manifest.json` por:

```json
{
  "id": "/",
  "name": "RRHH",
  "short_name": "RRHH",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#F6F7F4",
  "theme_color": "#F6F7F4",
  "icons": [
    {
      "src": "/web-app-manifest-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/web-app-manifest-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

`#F6F7F4` es el token `--background` del tema claro; es el color del splash al abrir.

- [ ] **Step 2: Crear el sincronizador del color**

Crear `src/app/Componentes/Shell/ThemeColorMeta.tsx`:

```tsx
"use client";

// Mantiene <meta name="theme-color"> igual al tema que la app está mostrando,
// que es lo que pinta la barra de estado del teléfono en la app instalada.
//
// No se usan las variantes por prefers-color-scheme del viewport de Next
// porque este proyecto no sigue el tema del sistema: el ThemeProvider corre
// con enableSystem={false} y el tema lo elige la persona.

import { useEffect } from "react";
import { useTheme } from "next-themes";

const COLORES = {
  light: "#F6F7F4",
  dark: "#24232A",
};

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? COLORES.dark : COLORES.light;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
```

- [ ] **Step 3: Declarar el viewport y montar el componente**

En `src/app/layout.tsx`, cambiar la primera línea de imports:

```tsx
import type { Metadata, Viewport } from "next";
```

Agregar el import del componente:

```tsx
import { ThemeColorMeta } from "@/app/Componentes/Shell/ThemeColorMeta";
```

Declarar `capable: true` en el `appleWebApp` que ya existe (es lo que hace que en iPhone abra sin la barra de Safari):

```tsx
  appleWebApp: {
    capable: true,
    title: "RRHH",
  },
```

Y agregar, después del bloque `metadata`:

```tsx
export const viewport: Viewport = {
  // Valor inicial; ThemeColorMeta lo actualiza según el tema elegido.
  themeColor: "#F6F7F4",
  // Imprescindible: sin esto env(safe-area-inset-bottom) vale siempre 0 y la
  // barra inferior queda debajo del indicador de inicio del iPhone.
  viewportFit: "cover",
};
```

Por último, montar el componente dentro del `ThemeProvider`, junto a `PrimeReactTheme`:

```tsx
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <PrimeReactTheme />
          <ThemeColorMeta />
          {children}
        </ThemeProvider>
```

- [ ] **Step 4: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "layout|ThemeColorMeta"`
Expected: sin salida.

- [ ] **Step 5: Verificar el manifest en el navegador**

Con `npm run dev`, abrir DevTools → Application → Manifest y confirmar:

1. Nombre e identidad: "RRHH" en Name y Short name.
2. Los dos íconos aparecen listados y **sin** advertencias de recorte.
3. No hay advertencias sobre `start_url`, `scope` ni `id`.
4. En Elements, el `<head>` tiene `<meta name="theme-color" content="#F6F7F4">`, y al cambiar el tema con el botón de la barra superior ese `content` pasa a `#24232A`.
5. En el `<head>` está `<meta name="apple-mobile-web-app-capable" content="yes">`.

(El cartel "no es instalable por falta de service worker" es esperable hasta la tarea 5.)

- [ ] **Step 6: Commit**

```bash
git add src/app/manifest.json src/app/layout.tsx src/app/Componentes/Shell/ThemeColorMeta.tsx
git commit -m "feat(pwa): manifest y viewport listos para instalar"
```

---

## Task 5: Service worker y pantalla sin conexión

**Files:**
- Create: `public/sw.js`
- Create: `src/app/offline/page.tsx`
- Create: `src/app/Componentes/Shell/ServiceWorkerRegistrar.tsx`
- Modify: `src/app/layout.tsx` (montar el registrador)

**Interfaces:**
- Consumes: nada de las tareas anteriores.
- Produces: componente `ServiceWorkerRegistrar` sin props, que no dibuja nada; el service worker servido en `/sw.js` con alcance `/`.

- [ ] **Step 1: Crear la pantalla de respaldo**

Crear `src/app/offline/page.tsx`. No puede pedir nada a la API: es la pantalla que se muestra justamente cuando no hay red.

```tsx
// Pantalla de respaldo cuando no hay conexión. El service worker la precachea
// y la devuelve ante cualquier navegación que falle sin copia en caché.
//
// No hace ninguna llamada a la API a propósito: es la pantalla del caso en que
// la red no está.

export const metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Sin conexión
        </h1>
        <p className="text-sm text-muted-foreground">
          No pudimos contactar al servidor. Los datos de licencias, asistencia y
          documentos se consultan en vivo, así que hace falta conexión para
          verlos.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Cuando vuelvas a tener señal, volvé a abrir la app.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Crear el service worker**

Crear `public/sw.js` (se sirve en `/sw.js`, así su alcance es todo el sitio):

```js
// Service worker de RRHH. Estrategia: la red manda.
//
// Con internet siempre se le pide al servidor y se guarda una copia; sin
// internet se sirve esa copia. Nunca se prefiere la cache estando online, y
// eso elimina de raiz dos problemas clasicos: quedarse con una version vieja
// clavada, y la pantalla en blanco de un HTML viejo que pide archivos que el
// deploy nuevo ya borro.
//
// No cachea la API: vive en otro origen (puerto 8000) y se filtra por origen.
// Un saldo de licencias viejo en pantalla confunde mas que avisar que no hay
// conexion.

const VERSION = "v1";
const CACHE = `rrhh-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  // Lo unico que se precachea. Con red primero, una pantalla que nunca se
  // visito no esta en la cache, asi que la de respaldo tiene que estar
  // guardada de antemano o no habria nada que mostrar. El bundle de Next no se
  // precachea: sus nombres llevan hash y desde aca no se conocen.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
  );
});

self.addEventListener("activate", (event) => {
  // Borra las caches de versiones anteriores.
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres.filter((nombre) => nombre !== CACHE).map((nombre) => caches.delete(nombre))
        )
      )
  );
});

// Sin skipWaiting a proposito: la version nueva toma el control en el proximo
// arranque en frio, no en medio de una sesion abierta.

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Solo lo propio: la API es otro origen y no se cachea.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        if (respuesta.ok && respuesta.type === "basic") {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const copia = await caches.match(request);
        if (copia) return copia;
        if (request.mode === "navigate") {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return Response.error();
      })
  );
});
```

- [ ] **Step 3: Crear el registrador**

Crear `src/app/Componentes/Shell/ServiceWorkerRegistrar.tsx`:

```tsx
"use client";

// Registra el service worker. Va como componente porque el registro solo
// puede correr en el navegador.

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // En desarrollo el bundle no es el definitivo y cachearlo solo trae
    // confusión; el service worker se prueba con next build && next start.
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
```

- [ ] **Step 4: Montarlo en el layout**

En `src/app/layout.tsx`, agregar el import:

```tsx
import { ServiceWorkerRegistrar } from "@/app/Componentes/Shell/ServiceWorkerRegistrar";
```

Y montarlo junto a `ThemeColorMeta`:

```tsx
          <PrimeReactTheme />
          <ThemeColorMeta />
          <ServiceWorkerRegistrar />
          {children}
```

- [ ] **Step 5: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "ServiceWorkerRegistrar|offline|layout"`
Expected: sin salida.

- [ ] **Step 6: Verificar con el build de producción**

El service worker no se registra en desarrollo, así que:

```bash
npm run build && npm run start
```

Con la app abierta en `http://localhost:3000` (localhost cuenta como origen seguro):

1. DevTools → Application → Service workers: aparece `/sw.js` como **activated and is running**.
2. Application → Cache storage → `rrhh-v1`: contiene `/offline`.
3. Navegar un poco por la app y confirmar que en Cache storage se van sumando los archivos visitados.
4. Application → Service workers → tildar **Offline**, y recargar: la app abre desde la caché (si ya se había visitado) o muestra la pantalla "Sin conexión".
5. Con **Offline** tildado, navegar a una ruta nunca visitada (por ejemplo `http://localhost:3000/pages/Login` si no se abrió antes): responde la pantalla "Sin conexión", no el error del navegador.
6. Destildar Offline, y en la pestaña Network confirmar que con red las respuestas vienen del servidor (columna Size sin "ServiceWorker" como origen de los datos frescos de la API).
7. Application → Manifest: ya **no** aparece la advertencia por falta de service worker, y el botón "Install" del navegador está disponible.

- [ ] **Step 7: Commit**

```bash
git add public/sw.js src/app/offline/page.tsx src/app/Componentes/Shell/ServiceWorkerRegistrar.tsx src/app/layout.tsx
git commit -m "feat(pwa): service worker que prioriza el servidor y pantalla sin conexion"
```

---

## Task 6: El botón de instalar

**Files:**
- Create: `src/app/util/useInstalarApp.ts`
- Create: `src/app/Componentes/Shell/InstalarApp.tsx`
- Modify: `src/app/Componentes/Shell/AppHeader.tsx`

**Interfaces:**
- Consumes: nada de las tareas anteriores (es independiente del service worker, aunque el navegador solo ofrece instalar cuando hay uno registrado).
- Produces:
  - `useInstalarApp(): { estado: "no-disponible" | "disponible" | "instrucciones-ios"; instalar: () => Promise<void> }`
  - `InstalarAppItem` con props `{ onPedirInstruccionesIOS: () => void }`
  - `InstruccionesIOS` con props `{ onCerrar: () => void }`

**El footgun a evitar:** el contenido del menú de Radix se desmonta al cerrarse. Si la hoja de instrucciones viviera dentro del menú, al tocar el ítem el menú se cierra, el componente se desmonta y la hoja no llega a verse. Por eso el estado vive en `AppHeader` y la hoja se dibuja **fuera** del `DropdownMenu`.

- [ ] **Step 1: Crear el hook**

Crear `src/app/util/useInstalarApp.ts`:

```tsx
"use client";

// Saber si la app se puede instalar, y poder disparar el cartel.
//
// En Android el navegador avisa con beforeinstallprompt y el cartel se dispara
// desde la app. En iPhone ese evento no existe: Safari obliga a hacerlo a mano
// desde Compartir, así que ahí lo único que se puede hacer es explicarlo.

import { useEffect, useState } from "react";

// Todavía no está en los tipos del DOM.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type EstadoInstalacion = "no-disponible" | "disponible" | "instrucciones-ios";

export function useInstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [esIOS, setEsIOS] = useState(false);
  const [yaInstalada, setYaInstalada] = useState(false);

  useEffect(() => {
    const alEvento = (e: Event) => {
      // Sin esto el navegador muestra su propio cartel cuando quiere, en vez
      // de cuando la persona toca el botón.
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", alEvento);

    // display-mode cubre Android y escritorio; navigator.standalone es la
    // bandera propia de iOS, que no implementa display-mode: standalone.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setYaInstalada(standalone);

    setEsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));

    return () => window.removeEventListener("beforeinstallprompt", alEvento);
  }, []);

  const estado: EstadoInstalacion = yaInstalada
    ? "no-disponible"
    : evento
      ? "disponible"
      : esIOS
        ? "instrucciones-ios"
        : "no-disponible";

  const instalar = async () => {
    if (!evento) return;
    await evento.prompt();
    // El evento es de un solo uso: una vez consumido, el navegador no lo
    // vuelve a emitir hasta la próxima visita.
    setEvento(null);
  };

  return { estado, instalar };
}
```

- [ ] **Step 2: Crear el ítem y la hoja**

Crear `src/app/Componentes/Shell/InstalarApp.tsx`:

```tsx
"use client";

// El ítem "Instalar app" del menú del avatar, y la hoja de instrucciones para
// iPhone. Son dos componentes porque el contenido del menú de Radix se
// desmonta al cerrarse: si la hoja viviera adentro, tocar el ítem la cerraría
// antes de que se vea. El estado vive en AppHeader y la hoja se dibuja fuera
// del menú.

import { Download, X } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useInstalarApp } from "@/app/util/useInstalarApp";

interface InstalarAppItemProps {
  onPedirInstruccionesIOS: () => void;
}

export function InstalarAppItem({ onPedirInstruccionesIOS }: InstalarAppItemProps) {
  const { estado, instalar } = useInstalarApp();

  if (estado === "no-disponible") return null;

  return (
    <DropdownMenuItem
      onClick={() => {
        if (estado === "disponible") {
          void instalar();
        } else {
          onPedirInstruccionesIOS();
        }
      }}
    >
      <Download size={16} className="mr-2" /> Instalar app
    </DropdownMenuItem>
  );
}

interface InstruccionesIOSProps {
  onCerrar: () => void;
}

export function InstruccionesIOS({ onCerrar }: InstruccionesIOSProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instalar-ios-titulo"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="instalar-ios-titulo" className="font-heading text-lg font-bold text-foreground">
            Agregar a la pantalla de inicio
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          En iPhone la instalación la hace Safari, no la app. Tocá el botón de
          Compartir y después <strong>Agregar a inicio</strong>.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Cablearlo en el header**

En `src/app/Componentes/Shell/AppHeader.tsx`, agregar el import:

```tsx
import { InstalarAppItem, InstruccionesIOS } from "@/app/Componentes/Shell/InstalarApp";
```

Agregar el estado junto a los otros `useState` del componente:

```tsx
  const [mostrarInstruccionesIOS, setMostrarInstruccionesIOS] = useState(false);
```

En el menú del avatar, antes del `DropdownMenuSeparator` que precede a "Cerrar Sesión":

```tsx
            <InstalarAppItem
              onPedirInstruccionesIOS={() => setMostrarInstruccionesIOS(true)}
            />
```

Y la hoja, **fuera** del `</DropdownMenu>`, antes del cierre del `<header>`:

```tsx
      {mostrarInstruccionesIOS && (
        <InstruccionesIOS onCerrar={() => setMostrarInstruccionesIOS(false)} />
      )}
```

- [ ] **Step 4: Verificar los tipos**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "InstalarApp|useInstalarApp|AppHeader"`
Expected: sin salida.

- [ ] **Step 5: Verificar en el navegador**

Con el build de producción (`npm run build && npm run start`), en `http://localhost:3000`:

1. En el menú del avatar aparece "Instalar app" (Chrome emite `beforeinstallprompt` cuando hay manifest válido y service worker, que es lo que quedó de las tareas 4 y 5).
2. Tocarlo abre el cartel de instalación propio del navegador.
3. Instalar la app y abrirla desde el ícono: en el menú del avatar **ya no** aparece "Instalar app" (el chequeo de `display-mode: standalone`).
4. Para ver el camino de iPhone sin un iPhone: en DevTools, emular un iPhone en la barra de dispositivos y recargar. Al no haber `beforeinstallprompt` y con un user agent de iOS, el ítem abre la hoja de instrucciones en vez del cartel. **Esto es una aproximación**: la instalación real en iPhone solo se puede confirmar en un teléfono de verdad.

- [ ] **Step 6: Commit**

```bash
git add src/app/util/useInstalarApp.ts src/app/Componentes/Shell/InstalarApp.tsx src/app/Componentes/Shell/AppHeader.tsx
git commit -m "feat(pwa): boton para instalar la app desde el menu del avatar"
```

---

## Verificación final, en un teléfono real

Las tareas se verifican solas en el navegador, pero hay dos cosas que solo se
pueden confirmar en un dispositivo, y las tiene que hacer el usuario:

1. **Android**: con la app servida por HTTPS, entrar desde Chrome, instalar
   desde el menú del avatar, abrir desde el ícono y confirmar que abre sin
   barra del navegador y con la barra de estado del color del tema.
2. **iPhone**: entrar desde Safari, seguir las instrucciones de la hoja,
   abrir desde el ícono, y confirmar que la barra inferior no queda tapada por
   el indicador de inicio.

Recordar el prerrequisito: **sobre HTTP en la red interna el navegador no va a
ofrecer instalar**. En `localhost` sí, porque cuenta como origen seguro.

## Autorevisión del plan

**Cobertura del spec.** Cada requisito tiene tarea: nombre "RRHH" e íconos
`any maskable`, `id`/`start_url`/`scope` y `background_color` (T4);
`themeColor` y `viewportFit: "cover"` y `appleWebApp.capable` (T4); service
worker red-primero, precache solo de `/offline`, caché versionada, sin
`skipWaiting`, sin cachear la API (T5); página `/offline` (T5); registro desde
componente cliente (T5); botón de instalar con camino de iOS y oculto si ya
está instalada (T6); `PERMISOS_DE_GESTION` y el predicado único (T1); barra de
cuatro con área segura y espacio inferior (T2); hamburguesa oculta para quien
tiene barra (T2); menú del avatar sin solapamientos y con Reubicación (T3); los
ids `asistencia` y `mi-asistencia` intactos (T3, no se toca `PAGE_CONFIG`).

**Una corrección al spec, deliberada.** El spec dice que
`PERMISOS_DE_GESTION` quedaría reusada por los `ocultaSiTienePermiso` que la
repiten. Al escribir el plan se verificó que hoy ninguna entrada repite los
cuatro permisos: `documentos` usa solo dos, y pasarla a los cuatro le sacaría
Documentos del sidebar a ESTADISTA, TÉCNICO y PATRIMONIO. La tarea 1 lo deja
escrito y no toca `ocultaSiTienePermiso`.

**Un hueco del spec que el plan resuelve.** El spec decía que el menú del
avatar de quien tiene barra queda con Mi Perfil, Encuesta, Reubicación,
Instalar app y Cerrar sesión, sin aclarar que eso vale **solo en celular**:
`licencias` tiene `ocultaEnSidebar: true`, así que en escritorio ese menú es su
único acceso a Licencias y vaciarlo del todo sería una regresión. La tarea 3 lo
resuelve con visibilidad por tamaño de pantalla, sin JavaScript, y lo explica.

**Consistencia de nombres.** `tieneNavegacionSimple` y `PERMISOS_DE_GESTION` se
declaran en T1 y se consumen con ese nombre exacto en T2 (`AppLayout`) y T3
(`AppHeader`); `AppBottomNav` recibe `{ activePage, setPage, permisos }` en T2 y
se monta con esas tres props; `useInstalarApp` devuelve `{ estado, instalar }` en
T6 y se consume así en `InstalarAppItem`; el nombre de caché `rrhh-v1` del
service worker es el que se verifica en el paso 6 de T5.
