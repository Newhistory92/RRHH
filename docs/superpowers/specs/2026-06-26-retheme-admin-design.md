# Retema de Admin

## Contexto

Noveno sub-proyecto de la fase de retema de contenido (Estadísticas, RRHH, CV, Organigrama, Licencias, ConfiguracionLicencias, Feedback e IA ya están mergeados a `main`). Cubre el Panel de Administración: la pantalla raíz (`Admin/Screen.tsx`, 4 tabs: Usuarios Activos/Inactivos, Configuración de Roles, Perfiles de Usuario) y 5 componentes compartidos en `UiRRHH.tsx` (`UsersTable`, `RolesGrid`, `ProfileSettings`, `ModalShell`/`Field` + `UserEditModal`/`RoleEditModal`).

Es el segundo de los 3 specs/planes separados (IA, Admin, TestConfig) acordados para cerrar la iniciativa de retema.

A diferencia de todas las fases anteriores, este módulo está diseñado hoy como un **panel oscuro fijo** (fondo gris oscuro, texto claro, scrollbar oscuro forzado vía CSS global, acento cian crudo) independiente del modo claro/oscuro del resto de la app. Se decidió convertirlo a **tema claro estándar** — igual que el resto de la app, usando los tokens semánticos que se adaptan solos a claro/oscuro.

Como en las fases anteriores, este spec es **puramente visual** — no se toca lógica de fetch/estado ni se mejora la experiencia de usuario más allá de la consistencia de color/tipografía. Una mejora de funcionalidad/UX real es una fase futura separada, a definir con su propio brainstorming cuando se decida abordarla — no es parte de este spec.

## Decisiones (de la sesión de brainstorming)

- **Conversión de tema oscuro fijo → tema claro estándar**: se elimina el bloque `<style jsx global>` que forzaba colores de scrollbar oscuros (`#1f2937`/`#4b5563`/`#6b7280`) — el navegador usa su estilo por defecto, consistente con el resto de la app, que no fuerza scrollbars personalizados.
- **Color cian genérico** (`cyan-*`, `#2ecbe7`, acento en `TabButton`, botones "Editar"/"Guardar", switches): se mapea a `primary`, mismo criterio que las fases anteriores.
- **Color dinámico `text-${role.color}-400`** (`RolesGrid`, nombre del rol): el valor de `role.color` viene del backend (dato, no literal hardcodeado en este archivo) — queda fuera de alcance, mismo criterio que `dept.color` en la fase de IA.
- **`inputCls`/`labelCls`** (constantes de módulo en `UiRRHH.tsx`, líneas 825-826): confirmado que solo las consumen `UserEditModal`/`RoleEditModal` (vía el helper `Field`) — se retemean sin afectar otros componentes.

## Archivos afectados

- `src/app/screens/Admin/Screen.tsx`
- `src/app/util/UiRRHH.tsx` (`inputCls`, `labelCls`, `UsersTable`, `RolesGrid`, `ProfileSettings`, `ModalShell`, `Field`, `UserEditModal`, `RoleEditModal` — líneas 825-826, 1032-1251)

## Diseño

### 1. `Screen.tsx` (panel raíz, tabs, tabla de usuarios)

| Elemento | Antes | Después |
|---|---|---|
| Estilos globales scrollbar (`style jsx global`) | `background: #1f2937` / `#4b5563` / `#6b7280` | bloque eliminado por completo |
| Contenedor raíz | `text-gray-200` | `text-foreground bg-background` |
| Título "Panel de Administración" | `text-neutral-900` | `font-heading text-foreground` |
| Subtítulo | `text-gray-400` | `text-muted-foreground` |
| Panel principal (`<main>`) | `bg-gray-800` | `bg-card` |
| Borde divisor de tabs | `border-gray-700` | `border-border` |
| `TabButton` activo | `border-[#2ecbe7] text-[#2ecbe7] bg-cyan-500/10` | `border-primary text-primary bg-primary/10` |
| `TabButton` inactivo | `text-gray-400 hover:text-white` | `text-muted-foreground hover:text-foreground` |
| Títulos de listado ("Usuarios Activos/Inactivos") | `text-white` | `text-foreground` |
| Ícono de búsqueda | `text-gray-400` | `text-muted-foreground` |
| Input de búsqueda | `bg-gray-700 border-gray-600 text-gray-200` | `bg-muted border-border text-foreground` |
| Texto "Cargando usuarios..." | `text-gray-400` | `text-muted-foreground` |

### 2. `UsersTable`, `RolesGrid`, `ProfileSettings` (`UiRRHH.tsx`)

| Componente | Elemento | Antes | Después |
|---|---|---|---|
| `UsersTable` | caja/tabla | `bg-gray-900` | `bg-card` |
| `UsersTable` | header tabla | `bg-gray-800 text-gray-400` | `bg-muted text-muted-foreground` |
| `UsersTable` | divisor filas / hover | `divide-gray-700/40` / `hover:bg-gray-700/30` | `divide-border` / `hover:bg-muted` |
| `UsersTable` | nombre usuario (activo/inactivo) | `text-white` / `text-gray-500` | `text-foreground` / `text-muted-foreground` |
| `UsersTable` | celdas (helper `cell()`) | `text-gray-300` / `text-gray-500` | `text-foreground` / `text-muted-foreground` |
| `UsersTable` | badge "Activo" | `bg-green-900/50 text-green-300` | `bg-success-soft text-success-soft-foreground` |
| `UsersTable` | badge "Inactivo" | `bg-gray-700 text-gray-400` | `bg-muted text-muted-foreground` |
| `UsersTable` | botón "Editar" | `border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10` | `border-primary/60 text-primary hover:bg-primary/10` |
| `UsersTable` | botón "Desactivar" | `bg-red-600/70 hover:bg-red-600 text-white` | `bg-error hover:opacity-90 text-error-soft-foreground` |
| `UsersTable` | botón "Activar" | `bg-green-600/70 hover:bg-green-600 text-white` | `bg-success hover:opacity-90 text-success-soft-foreground` |
| `UsersTable` | "no hay usuarios" | `text-gray-500` | `text-muted-foreground` |
| `RolesGrid` | card de rol | `bg-gray-800 border-gray-700 hover:border-gray-500` | `bg-card border-border hover:border-primary/40` |
| `RolesGrid` | botón editar (lápiz) | `text-gray-500 hover:text-white` | `text-muted-foreground hover:text-foreground` |
| `RolesGrid` | nombre del rol (`text-${role.color}-400`, dinámico) | sin cambios | sin cambios (fuera de alcance) |
| `RolesGrid` | descripción | `text-gray-400` | `text-muted-foreground` |
| `RolesGrid` | botón "Crear Nuevo Rol" | `border-gray-700 hover:border-cyan-500 hover:text-cyan-400 text-gray-500` | `border-border hover:border-primary hover:text-primary text-muted-foreground` |
| `ProfileSettings` | caja | `bg-gray-800 border-gray-700` | `bg-card border-border` |
| `ProfileSettings` | título | `text-white` | `text-foreground` |
| `ProfileSettings` | subtítulo | `text-gray-400` | `text-muted-foreground` |
| `ProfileSettings` | fila de toggle | `bg-gray-900/60` | `bg-muted` |
| `ProfileSettings` | label de fila | `text-white` | `text-foreground` |
| `ProfileSettings` | switch track | `bg-gray-600` | `bg-border` |
| `ProfileSettings` | switch track (checked) | `peer-checked:bg-cyan-500` | `peer-checked:bg-primary` |
| `ProfileSettings` | switch thumb | `after:bg-white` | `after:bg-card` |

### 3. `inputCls`/`labelCls`, `ModalShell`/`Field`, `UserEditModal`, `RoleEditModal`

| Elemento | Antes | Después |
|---|---|---|
| `inputCls` (constante de módulo) | `bg-gray-700 border-gray-600 text-white focus:border-cyan-500` | `bg-muted border-border text-foreground focus:border-primary` |
| `labelCls` (constante de módulo) | `text-gray-300` | `text-foreground` |
| `ModalShell` overlay | `bg-black/70` | sin cambios (scrim) |
| `ModalShell` caja | `bg-gray-800 border-gray-700` | `bg-card border-border` |
| `ModalShell` título | `text-white` | `text-foreground` |
| `ModalShell` botón cerrar (×) | `text-gray-400 hover:text-white` | `text-muted-foreground hover:text-foreground` |
| Botón "Cancelar" (`UserEditModal` y `RoleEditModal`, 2 ocurrencias idénticas) | `bg-gray-700 hover:bg-gray-600 text-white` | `bg-muted hover:bg-border text-foreground` |
| Botón "Guardar"/"Actualizar" (`UserEditModal` y `RoleEditModal`, 2 ocurrencias idénticas) | `bg-cyan-600 hover:bg-cyan-500 text-white` | `bg-primary hover:opacity-90 text-primary-foreground` |

## Fuera de alcance

- Cualquier mejora de funcionalidad/UX — fase futura separada, con su propio brainstorming.
- Lógica de fetch/estado: `fetchUsers`, `fetchRoles`, `handleToggleUserStatus`, `handleUserUpdate`, `handleRoleEmployeUpdate`, `handleRoleUpdate` (`Screen.tsx`); `openUserModal`/`closeUserModal`, `openRoleModal`/`closeRoleModal` (`Screen.tsx`); `handleToggle` (`ProfileSettings`).
- El color dinámico `text-${role.color}-400` en `RolesGrid` (viene de datos del backend).
- Otro módulo pendiente de esta tanda (TestConfig) — con su propio spec/plan.

## Testing

- Verificación visual manual: las 4 pestañas (Usuarios Activos con datos y vacío, Usuarios Inactivos, Configuración de Roles, Perfiles de Usuario), modal de edición de usuario, modal de creación/edición de rol — en modo claro y oscuro de la app (el panel ya no fuerza oscuro fijo).
- `npx tsc --noEmit` acotado a los archivos tocados (no hay test suite automatizado para cambios puramente visuales).
