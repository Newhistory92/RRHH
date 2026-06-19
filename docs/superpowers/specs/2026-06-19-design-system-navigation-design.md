# Sistema de Diseño + Navegación — RRHH/Talexa

## Contexto

Auditoría previa (sesión de graphify + revisión de código) identificó que el frontend RRHH no tiene una librería de componentes (`package.json` solo trae Tailwind v4 + lucide-react), el sidebar es una lista plana sin agrupar, y no hay sistema de tokens de diseño consistente. El objetivo de negocio es evolucionar el producto a SaaS comercializable inspirado en Linear/Notion/Jira/BambooHR/Factorial/Deel, reduciendo clics y mejorando navegación.

Este spec cubre **solo** la base: tokens visuales + shell de navegación (Sidebar/Header/Layout). El rediseño del contenido interno de cada página, el Portal del Empleado y el módulo de Noticias quedan fuera — son specs separados que se construyen sobre esta base.

## Decisiones (de la sesión de brainstorming)

- **Referencia visual**: Deel/Factorial — SaaS B2B pulido, colorido pero corporativo, tarjetas con iconografía.
- **Marca**: libre, sin atarse al logo "Talexa" cyan existente (es placeholder).
- **Temas**: claro y oscuro desde el día uno.
- **Estructura de sidebar**: secciones agrupadas y colapsables (no lista plana).
- **Header**: solo notificaciones + perfil, sin búsqueda global (queda para specs de página individuales si se necesita).
- **Librería de componentes**: shadcn/ui (Radix + Tailwind, código copiado al repo, no caja negra). Encaja con el stack ya instalado (Tailwind v4).
- **Enfoque de implementación**: migración incremental — el shell nuevo se construye en paralelo al actual; el único punto de corte es el cambio del layout raíz, que es reversible.

## Tokens de diseño

Definidos como variables CSS en `src/app/globals.css` vía `@theme` de Tailwind v4, consumidas tanto en modo claro como oscuro:

- **Color primario**: un acento vívido (a definir en implementación, paleta libre — sugerido azul/índigo o verde esmeralda, estilo Deel).
- **Neutros**: escala cálida de grises para fondos/superficies/bordes (`--color-surface`, `--color-surface-muted`, `--color-border`).
- **Semánticos**: éxito, advertencia, error, info — consistentes en ambos temas.
- **Tipografía**: una sola familia (mantener Geist vía `next/font`, ya instalada). Escala limitada: xs/sm/base/lg/xl/2xl.
- **Espaciado**: escala de 4px de Tailwind, sin cambios.
- **Bordes/sombras**: radio default `rounded-lg` en tarjetas; 2-3 niveles de sombra sutil, no más.
- **Dark mode**: toggle que aplica `class="dark"` en `<html>`, persistido en `localStorage`. Todos los tokens tienen su variante `.dark`.

## Shell de navegación

### Sidebar
- Ancho fijo ~260px expandido / ~64px colapsado (solo iconos). Botón de colapsar.
- Logo arriba.
- Secciones agrupadas con título pequeño en mayúsculas, cada una filtrada por rol vía `rbac.ts` (`getSidebarPages` extendido a devolver grupos, no lista plana). Si un rol no tiene ninguna página visible dentro de una sección, la sección completa no se renderiza:
  - **General**: Inicio (futuro dashboard/noticias), Estadísticas
  - **Gente**: RRHH (listado/ficha empleados), CV, Feedback
  - **Organización**: Organigrama, Licencias (gestión + configuración como sub-item)
  - **Aprendizaje**: Tests/Evaluaciones, Configuración de Tests
  - **IA**: Inteligencia Artificial
  - **Sistema** (solo ADMIN): Administración
- Item activo: indicador de borde izquierdo + fondo sutil (patrón Linear).

### Header
- Sticky, dentro del área de contenido (no full-width de la pantalla).
- Izquierda: breadcrumb/título de la página actual.
- Derecha: notificaciones (campana + badge de contador), menú de perfil (avatar, nombre, rol, toggle claro/oscuro, logout).

### Layout
- Sidebar fijo + header sticky + área de contenido con padding consistente (`p-6`) y ancho máximo en pantallas muy grandes.
- Sidebar colapsa a `Sheet` (drawer) en mobile.

## Componentes shadcn/ui a instalar (fase 1)

`button`, `avatar`, `dropdown-menu`, `tooltip`, `separator`, `badge`, `sheet`, `skeleton`.

## Estructura de archivos

```
src/app/Componentes/Shell/
  AppSidebar.tsx       — secciones + items, lee rbac.ts
  AppHeader.tsx        — breadcrumb, notificaciones, perfil
  AppLayout.tsx        — wrapper que combina sidebar+header+children
src/components/ui/      — componentes shadcn (generados)
src/app/globals.css     — tokens de tema claro/oscuro vía @theme
```

## Plan de migración

1. Instalar shadcn/ui + definir tokens en `globals.css`. No rompe nada existente (aditivo).
2. Construir `AppSidebar`/`AppHeader`/`AppLayout` en paralelo a `Sidebar.tsx`/`Header.tsx` actuales, sin borrarlos.
3. Punto de corte único: cambiar el layout de las páginas autenticadas para usar `AppLayout` en vez del actual. Reversible con un solo cambio si algo falla.
4. Páginas internas (Estadísticas, RRHH, Organigrama, etc.) no se tocan en esta fase — siguen renderizando su contenido actual dentro del nuevo shell.
5. `rbac.ts`: extender `PAGE_CONFIG`/`getSidebarPages` para soportar agrupamiento por sección sin romper la API actual de `canAccess`/`getDefaultPage`/`isReadOnlyForRole`.

## Fuera de alcance (specs futuros)

- Rediseño visual del contenido interno de cada página existente.
- Portal del Empleado (dashboard personal del empleado).
- Módulo de Noticias.
- Paleta de color final exacta (se define en implementación dentro de los lineamientos de tokens de este spec).

## Testing

- Verificación visual manual en navegador: sidebar colapsa/expande, secciones se filtran correctamente por cada rol (ADMIN, RRHH, ESTADISTA, USER), dark mode toggle persiste tras refresh, layout responde en mobile (sidebar como Sheet).
- No se requieren tests automatizados nuevos para este spec (es shell visual); páginas existentes deben seguir funcionando sin cambios en su lógica.
