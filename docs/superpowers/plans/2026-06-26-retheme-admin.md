# Retema de Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el Panel de Administración (pantalla raíz + 5 componentes compartidos) de un tema oscuro fijo con acento cian crudo a tema claro estándar con los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` en 2 archivos existentes, agrupados en 3 tareas. Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), `next/image`, lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-26-retheme-admin-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `fetchUsers`, `fetchRoles`, `handleToggleUserStatus`, `handleUserUpdate`, `handleRoleEmployeUpdate`, `handleRoleUpdate`, `openUserModal`/`closeUserModal`, `openRoleModal`/`closeRoleModal` (`Screen.tsx`); `handleToggle` (`ProfileSettings`).
- No se cambian firmas de componentes ni props.
- El color dinámico `text-${role.color}-400` en `RolesGrid` (viene de datos del backend) queda sin cambios.
- El overlay del modal (`bg-black/70` en `ModalShell`) queda sin cambios — es un scrim, no un color de superficie.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-error`/`text-error-soft-foreground`, `bg-success`/`text-success-soft-foreground`, `bg-success-soft`/`text-success-soft-foreground`, `font-heading`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 8 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo(s)> a tokens organico-calido`.

---

### Task 1: `Screen.tsx` (panel raíz, tabs, tabla de usuarios)

**Files:**
- Modify: `src/app/screens/Admin/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `TabButton` — misma firma `{ id, title }`, solo cambian las clases CSS. Consumido sin cambios por las 4 invocaciones existentes en el `<nav>` (no se tocan en esta tarea).

- [ ] **Step 1: Eliminar estilos globales de scrollbar y retemear contenedor raíz**

Antes (líneas 297-311):
```tsx
    return (
        <div className=" text-gray-200 antialiased min-h-screen">
            <style jsx global>{`
                body { font-family: 'Inter', sans-serif; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #1f2937; }
                ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Panel de Administración</h1>
                    <p className="text-gray-400 mt-1">Gestiona usuarios, roles y perfiles de la aplicación.</p>
                </header>
```

Después:
```tsx
    return (
        <div className="bg-background text-foreground antialiased min-h-screen">
            <style jsx global>{`
                body { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">Panel de Administración</h1>
                    <p className="text-muted-foreground mt-1">Gestiona usuarios, roles y perfiles de la aplicación.</p>
                </header>
```

- [ ] **Step 2: `TabButton` y panel principal**

Antes (líneas 285-296, 313-321):
```tsx
    const TabButton = ({ id, title }: { id: string; title: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                ? 'border-[#2ecbe7] text-[#2ecbe7] bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            {title}
        </button>
    );
```
```tsx
                <main className="bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                            <TabButton id="active-users" title="Usuarios Activos" />
                            <TabButton id="inactive-users" title="Usuarios Inactivos" />
                            <TabButton id="roles" title="Configuración de Roles" />
                            <TabButton id="profiles" title="Perfiles de Usuario" />
                        </nav>
                    </div>
```

Después:
```tsx
    const TabButton = ({ id, title }: { id: string; title: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
        >
            {title}
        </button>
    );
```
```tsx
                <main className="bg-card rounded-2xl shadow-2xl p-4 sm:p-6">
                    <div className="border-b border-border">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                            <TabButton id="active-users" title="Usuarios Activos" />
                            <TabButton id="inactive-users" title="Usuarios Inactivos" />
                            <TabButton id="roles" title="Configuración de Roles" />
                            <TabButton id="profiles" title="Perfiles de Usuario" />
                        </nav>
                    </div>
```

- [ ] **Step 3: Títulos de listado, búsqueda y "Cargando usuarios..."**

Antes (líneas 326-349, 351-358):
```tsx
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                    <h2 className="text-xl font-semibold text-white">Listado de Usuarios Activos</h2>
                                    <div className="relative w-full sm:w-auto">
                                        <span className="p-input-icon-left w-full">
                                            <UserRoundSearch className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400" size={20} />
                                            <InputText
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre o depto..."
                                                className="w-full pl-10 bg-gray-700 border-gray-600 text-gray-200"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </span>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">Cargando usuarios...</div>
                                ) : (
                                    <UsersTable users={activeUsers} onEdit={openUserModal} onToggleStatus={(userId: number) => {
                                        const user = users.find(u => u.id === userId);
                                        if (user) handleToggleUserStatus(userId, user.activo);
                                    }} />
                                )}
                            </div>
                        )}
                        {activeTab === 'inactive-users' && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Listado de Usuarios Inactivos</h2>
```

Después:
```tsx
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                    <h2 className="text-xl font-semibold text-foreground">Listado de Usuarios Activos</h2>
                                    <div className="relative w-full sm:w-auto">
                                        <span className="p-input-icon-left w-full">
                                            <UserRoundSearch className="absolute left-3 top-1/2 -translate-y-1/2  text-muted-foreground" size={20} />
                                            <InputText
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre o depto..."
                                                className="w-full pl-10 bg-muted border-border text-foreground"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </span>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>
                                ) : (
                                    <UsersTable users={activeUsers} onEdit={openUserModal} onToggleStatus={(userId: number) => {
                                        const user = users.find(u => u.id === userId);
                                        if (user) handleToggleUserStatus(userId, user.activo);
                                    }} />
                                )}
                            </div>
                        )}
                        {activeTab === 'inactive-users' && (
                            <div>
                                <h2 className="text-xl font-semibold text-foreground mb-4">Listado de Usuarios Inactivos</h2>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

Run: `grep -nE "gray-|#2ecbe7|cyan-|neutral-900|text-white|#1f2937|#4b5563|#6b7280" src/app/screens/Admin/Screen.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/screens/Admin/Screen.tsx
git commit -m "feat: retemear Screen.tsx de Admin a tokens organico-calido"
```

---

### Task 2: `UsersTable` y `RolesGrid` (`UiRRHH.tsx`)

**Files:**
- Modify: `src/app/util/UiRRHH.tsx:1032-1109`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `UsersTable`, `RolesGrid` — mismas firmas (`UsersTableProps`, `RolesGridProps`), solo cambian las clases CSS. Consumidas sin cambios por `Screen.tsx` (ya retemado en Task 1).

- [ ] **Step 1: `UsersTable`**

Antes (líneas 1032-1090):
```tsx
export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onToggleStatus }) => {
  const cell = (inactive: boolean, extra = '') =>
    `px-3 py-2 ${inactive ? 'text-gray-500' : 'text-gray-300'} ${extra}`;

  return (
    <div className="overflow-x-auto bg-gray-900 rounded-xl">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-gray-800 text-[11px] uppercase tracking-wide text-gray-400">
          <tr>
            {['Usuario', 'Nombre', 'DNI', 'Rol', 'Depto / Oficina', 'Estado', 'Acciones'].map((h, i) => (
              <th key={h} className={`px-3 py-2 font-semibold ${i === 0 ? '' : i === 1 ? 'hidden lg:table-cell' : i < 5 ? 'hidden md:table-cell' : i === 5 ? 'hidden sm:table-cell' : 'text-center'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/40">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Image src={user.avatar || '/Default-avatar.webp'} alt={user.name} width={28} height={28}
                    className={`w-7 h-7 rounded-full object-cover flex-shrink-0 ${!user.activo ? 'grayscale opacity-50' : ''}`} />
                  <span className={`font-medium ${!user.activo ? 'text-gray-500' : 'text-white'}`}>{user.usuario}</span>
                </div>
              </td>
              <td className={cell(!user.activo, 'hidden lg:table-cell')}>{user.name}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.dni}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.role}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.department || user.office || '—'}</td>
              <td className="px-3 py-2 hidden sm:table-cell">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${user.activo ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {user.activo && onEdit && (
                    <button onClick={() => onEdit(user)}
                      className="text-[11px] px-2 py-0.5 rounded border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10 transition leading-tight">
                      Editar
                    </button>
                  )}
                  <button onClick={() => onToggleStatus(user.id)}
                    className={`text-[11px] px-2 py-0.5 rounded transition leading-tight ${user.activo ? 'bg-red-600/70 hover:bg-red-600 text-white' : 'bg-green-600/70 hover:bg-green-600 text-white'}`}>
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-gray-500">No hay usuarios para mostrar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
```

Después:
```tsx
export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onToggleStatus }) => {
  const cell = (inactive: boolean, extra = '') =>
    `px-3 py-2 ${inactive ? 'text-muted-foreground' : 'text-foreground'} ${extra}`;

  return (
    <div className="overflow-x-auto bg-card rounded-xl">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-muted text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {['Usuario', 'Nombre', 'DNI', 'Rol', 'Depto / Oficina', 'Estado', 'Acciones'].map((h, i) => (
              <th key={h} className={`px-3 py-2 font-semibold ${i === 0 ? '' : i === 1 ? 'hidden lg:table-cell' : i < 5 ? 'hidden md:table-cell' : i === 5 ? 'hidden sm:table-cell' : 'text-center'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-muted transition-colors">
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Image src={user.avatar || '/Default-avatar.webp'} alt={user.name} width={28} height={28}
                    className={`w-7 h-7 rounded-full object-cover flex-shrink-0 ${!user.activo ? 'grayscale opacity-50' : ''}`} />
                  <span className={`font-medium ${!user.activo ? 'text-muted-foreground' : 'text-foreground'}`}>{user.usuario}</span>
                </div>
              </td>
              <td className={cell(!user.activo, 'hidden lg:table-cell')}>{user.name}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.dni}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.role}</td>
              <td className={cell(!user.activo, 'hidden md:table-cell')}>{user.department || user.office || '—'}</td>
              <td className="px-3 py-2 hidden sm:table-cell">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${user.activo ? 'bg-success-soft text-success-soft-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {user.activo && onEdit && (
                    <button onClick={() => onEdit(user)}
                      className="text-[11px] px-2 py-0.5 rounded border border-primary/60 text-primary hover:bg-primary/10 transition leading-tight">
                      Editar
                    </button>
                  )}
                  <button onClick={() => onToggleStatus(user.id)}
                    className={`text-[11px] px-2 py-0.5 rounded transition leading-tight ${user.activo ? 'bg-error hover:opacity-90 text-error-soft-foreground' : 'bg-success hover:opacity-90 text-success-soft-foreground'}`}>
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No hay usuarios para mostrar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
```

- [ ] **Step 2: `RolesGrid`**

Antes (líneas 1092-1109):
```tsx
export const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {roles.map(role => (
      <div key={role.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-500 transition relative group">
        <button onClick={() => onEdit(role)} className="absolute top-3 right-3 text-gray-500 hover:text-white transition">
          <SquarePen size={16} />
        </button>
        <h3 className={`font-bold text-base text-${role.color}-400 mb-1`}>{role.name}</h3>
        <p className="text-gray-400 text-sm pr-6">{role.description}</p>
      </div>
    ))}
    <button onClick={() => onEdit(null)}
      className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-6 hover:border-cyan-500 hover:text-cyan-400 text-gray-500 transition cursor-pointer gap-2">
      <Plus size={20} />
      <span className="text-sm font-medium">Crear Nuevo Rol</span>
    </button>
  </div>
);
```

Después:
```tsx
export const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {roles.map(role => (
      <div key={role.id} className="bg-card p-5 rounded-xl border border-border hover:border-primary/40 transition relative group">
        <button onClick={() => onEdit(role)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition">
          <SquarePen size={16} />
        </button>
        <h3 className={`font-bold text-base text-${role.color}-400 mb-1`}>{role.name}</h3>
        <p className="text-muted-foreground text-sm pr-6">{role.description}</p>
      </div>
    ))}
    <button onClick={() => onEdit(null)}
      className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 hover:border-primary hover:text-primary text-muted-foreground transition cursor-pointer gap-2">
      <Plus size={20} />
      <span className="text-sm font-medium">Crear Nuevo Rol</span>
    </button>
  </div>
);
```

Nota: `text-${role.color}-400` (línea con el nombre del rol) NO cambia — es un valor dinámico desde datos del backend, fuera de alcance.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `UiRRHH.tsx`.

Run: `grep -nE "bg-gray-900|bg-gray-800|bg-gray-700|text-gray-300|text-gray-500|divide-gray|hover:bg-gray|bg-green-900|text-green-300|cyan-" src/app/util/UiRRHH.tsx | sed -n '1,5p'`
Expected: cualquier resultado restante debe estar en líneas fuera del rango 1032-1109 (por ejemplo, en `UserEditModal`/`RoleEditModal`, que se retemean en la Task 3).

- [ ] **Step 4: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: retemear UsersTable y RolesGrid a tokens organico-calido"
```

---

### Task 3: `ProfileSettings`, `inputCls`/`labelCls`, `ModalShell`/`Field`, `UserEditModal`, `RoleEditModal`

**Files:**
- Modify: `src/app/util/UiRRHH.tsx:825-826, 1111-1251`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `ProfileSettings`, `inputCls`, `labelCls`, `ModalShell`, `Field`, `UserEditModal`, `RoleEditModal` — mismas firmas, solo cambian las clases CSS. `inputCls`/`labelCls` confirmados sin otros consumidores fuera de este rango.

- [ ] **Step 1: `inputCls`/`labelCls` (constantes de módulo)**

Antes (líneas 825-826):
```tsx
const inputCls = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5 focus:outline-none focus:border-cyan-500 transition";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";
```

Después:
```tsx
const inputCls = "bg-muted border border-border text-foreground text-sm rounded-lg w-full p-2.5 focus:outline-none focus:border-primary transition";
const labelCls = "block text-sm font-medium text-foreground mb-1";
```

- [ ] **Step 2: `ProfileSettings`**

Antes (líneas 1148-1165):
```tsx
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
      <h3 className="font-bold text-white mb-0.5">Configuración de Perfiles</h3>
      <p className="text-gray-400 text-sm mb-5">Define los campos visibles en los perfiles de usuario.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(toggles).map(setting => (
          <div key={setting} className="flex items-center justify-between bg-gray-900/60 px-4 py-3 rounded-lg">
            <span className="text-sm text-white font-medium">{setting}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={toggles[setting]} onChange={() => handleToggle(setting)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
```

Después:
```tsx
  return (
    <div className="bg-card p-6 rounded-xl border border-border max-w-2xl mx-auto">
      <h3 className="font-bold text-foreground mb-0.5">Configuración de Perfiles</h3>
      <p className="text-muted-foreground text-sm mb-5">Define los campos visibles en los perfiles de usuario.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(toggles).map(setting => (
          <div key={setting} className="flex items-center justify-between bg-muted px-4 py-3 rounded-lg">
            <span className="text-sm text-foreground font-medium">{setting}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={toggles[setting]} onChange={() => handleToggle(setting)} className="sr-only peer" />
              <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 3: `ModalShell`**

Antes (líneas 1169-1179):
```tsx
const ModalShell = ({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition text-xl leading-none">&times;</button>
      </div>
      {children}
    </div>
  </div>
);
```

Después:
```tsx
const ModalShell = ({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-border">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition text-xl leading-none">&times;</button>
      </div>
      {children}
    </div>
  </div>
);
```

- [ ] **Step 4: `UserEditModal` y `RoleEditModal` (botones)**

Antes (líneas 1223-1228, 1245-1248):
```tsx
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition">
            {user.employee_id ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
```
```tsx
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition">Guardar</button>
        </div>
      </form>
    </ModalShell>
  );
```

Después:
```tsx
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-border text-foreground transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-medium transition">
            {user.employee_id ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
```
```tsx
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-border text-foreground transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-medium transition">Guardar</button>
        </div>
      </form>
    </ModalShell>
  );
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `UiRRHH.tsx`.

Run: `grep -nE "gray-|cyan-|text-white|bg-black/70" src/app/util/UiRRHH.tsx`
Expected: 0 resultados, salvo la línea del overlay `bg-black/70` en `ModalShell` (documentada como excepción) y la línea dinámica `text-${role.color}-400` en `RolesGrid` (Task 2, ya marcada fuera de alcance).

- [ ] **Step 6: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: retemear ProfileSettings, ModalShell y modales de edicion a tokens organico-calido"
```
