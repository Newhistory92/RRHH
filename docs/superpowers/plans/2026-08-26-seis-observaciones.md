# Seis observaciones — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Arreglar seis bugs/mejoras reportados en producción: bloqueo cruzado de licencias, horas en 0 en la tabla de RRHH, orden del calendario en Inicio, doble llamada a la API externa de feriados, y el modal de notificación que no abre.

**Architecture:** Cada tarea es independiente — no hay dependencias entre ellas. Tres tocan solo `RRHH` (frontend), dos tocan `Backend_RRHH`, y una toca ambos. Se listan en orden de riesgo creciente: primero las de una sola línea con causa 100% confirmada, al final la que cambia una regla de negocio.

## Global Constraints

- **No levantar servidor.** La verificación es `npx tsc --noEmit` / `npm run build` en el frontend y `venv/Scripts/python.exe -m pytest tests/ -q` en el backend (nunca `pytest` sin acotar a `tests/`, ver la nota histórica de esta sesión sobre `test_api.py`).
- **Cero IDs de rol hardcodeados** en cualquier código de autorización tocado de paso.
- **Todo par texto/fondo nuevo cumple WCAG AA** — correr `node scripts/check-contrast.mjs` en el frontend si se toca color.
- Cada tarea termina con un commit en su propio repo y, si el usuario lo pide, un push a `origin/main`.

---

## Diagnóstico (ya verificado, no investigar de nuevo)

| # | Síntoma | Causa raíz confirmada |
|---|---|---|
| 1 | Con una licencia pendiente, no se puede pedir otra de **otro tipo** | `Backend_RRHH/app/routes/licenses.py:381-391`: el bloqueo consulta `WHERE employeeId = :empId AND status IN (...)` **sin filtrar por `type`** — cualquier pendiente bloquea todo |
| 2 | Tabla de RRHH muestra `0.00hs` para todos, el perfil individual sí tiene horas | `RRHH/src/app/Componentes/TablaOperador/Table.tsx:306` lee `employee.hours` (inglés), pero el backend (`Backend_RRHH/app/routes/rrhh.py:354`) devuelve la clave `"horas"` (español) tal cual la columna. `RRHH/src/app/screens/RRHH/Screen.tsx:55` hace `setEmployees(data.employees)` sin mapear campos — `employee.hours` es `undefined` para toda la lista, y `HoursDisplay` cae al fallback `hours ?? 0` |
| 3 | En Inicio, el calendario aparece muy abajo, no al lado de las publicaciones | `RRHH/src/app/screens/PortalInicio/Screen.tsx`: el bloque de `urgentes` (las tarjetas con borde rojo) se dibuja **fuera y antes** del `grid` que contiene `{sidebar}` (que tiene el `CalendarWidget`). El sidebar sí es `sticky top-8`, pero arranca recién después de que termina el bloque de urgentes |
| 4 | El calendario llama a una API externa en vez de usar los feriados ya cargados en Configuración de Licencias | `RRHH/src/app/Componentes/PortalInicio/CalendarWidget.tsx:32` y `RRHH/src/app/GestionLicencias/Calendario.tsx:50` llaman directo a `api.argentinadatos.com`. El backend ya tiene `GET /licenses/feriados` (`Backend_RRHH/app/routes/licenses.py:1022`), que es exactamente lo que alimenta a Configuración de Licencias, y que ya incluye tanto los feriados importados como los agregados a mano |
| 5 | El modal de detalle de notificación no abre al hacer clic | No es que esté roto: **nunca se conectó**. `RRHH/src/app/Componentes/Perfil/NotificationDialog.tsx` existe completo (dialog, header, footer, marcar-como-leída) pero no lo importa ningún archivo del proyecto. `AppHeader.tsx` (ya tocado hoy) renderiza cada notificación sin `onClick` |

---

## Task 1: Horas en 0 en la tabla de RRHH

**Files:**
- Modify: `RRHH/src/app/Componentes/TablaOperador/Table.tsx:306`
- Modify: `RRHH/src/app/Interfas/Interfaces.ts:351`

**Interfaces:**
- Consumes: el campo `horas` que ya devuelve `GET /rrhh/employees` (sin cambios de backend).

Es el fix más acotado de los seis: una sola clase de uso real en todo el frontend (`grep -rn "\.hours\b" src` confirmado hoy), sin backend involucrado.

- [ ] **Step 1: Corregir el nombre del campo en la tabla**

En `Table.tsx:306`, cambiar:

```tsx
<HoursDisplay hours={employee.hours} />
```

por:

```tsx
<HoursDisplay hours={employee.horas} />
```

- [ ] **Step 2: Alinear el tipo `Employee`**

En `Interfaces.ts:351`, cambiar:

```ts
hours: number; // Total available hours for permissions
```

por:

```ts
horas: number; // Total available hours for permissions
```

- [ ] **Step 3: Verificar que no queda ningún otro uso de `.hours` sobre un `Employee`**

```bash
grep -rn "\.hours\b" src --include="*.tsx" --include="*.ts"
```

Esperado: sin resultados (los `p.hours` de `DetailTables.tsx` son de `Permission`, un tipo distinto, no tocar).

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit
```

Esperado: mismo conteo de errores preexistentes que antes de este cambio (correr `git stash` mentalmente — no hay forma de que este cambio los reduzca ni los aumente, ya que es una sola línea tipada).

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/TablaOperador/Table.tsx src/app/Interfas/Interfaces.ts
git commit -m "fix(rrhh): la tabla mostraba 0.00hs porque leia employee.hours en vez de employee.horas"
```

---

## Task 2: Modal de notificación nunca conectado

**Files:**
- Modify: `RRHH/src/app/Componentes/Shell/AppHeader.tsx`

**Interfaces:**
- Consumes: `NotificationDialog` (`RRHH/src/app/Componentes/Perfil/NotificationDialog.tsx`), ya completo — `{ visible, onHide, notification, userPhoto }`. No usar la prop `onMarkAsRead`: no existe endpoint de "marcar como leída" en el backend (confirmado hoy, `grep` en `licenses.py`); agregarla sería inventar un alcance no pedido.

- [ ] **Step 1: Importar `NotificationDialog` y agregar estado**

En `AppHeader.tsx`, agregar el import y un estado para la notificación abierta:

```tsx
import { NotificationDialog } from "@/app/Componentes/Perfil/NotificationDialog";
```

```tsx
const [notifAbierta, setNotifAbierta] = useState<Notification | null>(null);
```

- [ ] **Step 2: Hacer clickeable cada item de notificación**

En el `.map` de notificaciones (el mismo bloque que hoy tiene `focus:bg-muted focus:text-inherit`), agregar `onClick` y sacar `cursor-default` ya que ahora sí es accionable:

```tsx
<DropdownMenuItem
  key={notif.id}
  onClick={() => setNotifAbierta(notif)}
  className="flex flex-col items-start gap-0.5 px-3 py-2.5 focus:bg-muted focus:text-inherit"
>
```

- [ ] **Step 3: Renderizar el dialog al final del componente**

Justo antes del `</header>` de cierre (o después, como hermano del `<header>` — PrimeReact `Dialog` se porta bien en cualquiera de los dos):

```tsx
<NotificationDialog
  visible={notifAbierta !== null}
  onHide={() => setNotifAbierta(null)}
  notification={notifAbierta}
  userPhoto={userPhoto}
/>
```

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Shell/AppHeader.tsx
git commit -m "fix(header): conectar NotificationDialog, que existia pero no se usaba en ningun lado"
```

---

## Task 3: El calendario de Inicio queda abajo, no al lado de las publicaciones

**Files:**
- Modify: `RRHH/src/app/screens/PortalInicio/Screen.tsx`

**Interfaces:**
- Consumes: `sidebar` (ya definido en el componente, sin cambios), `urgentes`/`destacadas`/`secciones` (ya calculados).

El problema es de estructura: el bloque de `urgentes` está **fuera** del `grid` de dos columnas, así que aparece arriba de todo el ancho de la página, y el `grid` (con el sidebar sticky) recién arranca después. La solución es meter `urgentes` **adentro** de la columna izquierda del grid, junto con `destacadas` y `secciones`, para que haya un solo grid por vista con el sidebar al lado desde el principio.

- [ ] **Step 1: Unificar el grid del feed sin filtros**

Reemplazar el bloque completo (desde `{urgentes.length > 0 && (` hasta el cierre del `{feedCompleto.length === 0 ? (...) : (...)}`) por una única estructura: un solo grid que envuelve urgentes + destacadas + secciones en la columna izquierda, con `{sidebar}` a la derecha, cubriendo también el caso `feedCompleto.length === 0` (hoy el sidebar directamente no se dibuja en ese caso).

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 space-y-6">
    {feedCompleto.length === 0 ? (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No hay publicaciones por ahora.</p>
      </div>
    ) : (
      <>
        {urgentes.length > 0 && (
          <div className="space-y-3">
            {urgentes.map((p) => (
              <div key={p.id} className="border-l-4 border-error rounded-xl overflow-hidden">
                <PublicationCard publication={p} onClick={() => setSeleccionada(p)} />
              </div>
            ))}
          </div>
        )}

        {destacadas.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">Destacadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destacadas.map((p) => (
                <PublicationCard key={p.id} publication={p} onClick={() => setSeleccionada(p)} />
              ))}
            </div>
          </section>
        )}

        {secciones.map(({ categoria, items }) => (
          <section key={categoria}>
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">{categoria}</h2>
            <div className="space-y-3">
              {items.map((p) => (
                <PublicationCard key={p.id} publication={p} onClick={() => setSeleccionada(p)} />
              ))}
            </div>
          </section>
        ))}
      </>
    )}
  </div>
  {sidebar}
</div>
```

Esto reemplaza tanto el `{feedCompleto.length === 0 ? (...) : (...)}` original como el bloque de `urgentes` que estaba antes y afuera.

- [ ] **Step 2: Confirmar que la rama con filtros activos (`hayFiltros`) no cambia**

Esa rama ya tenía `{sidebar}` adentro del grid correctamente — no tocar.

- [ ] **Step 3: Verificar**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Verificación visual (requiere autorización para levantar el dev server)**

Si el usuario autoriza, cargar `/` con al menos una publicación urgente y confirmar que el calendario aparece arriba a la derecha, alineado con el título "Destacadas"/primera sección, no debajo de las tarjetas rojas.

- [ ] **Step 5: Commit**

```bash
git add src/app/screens/PortalInicio/Screen.tsx
git commit -m "fix(inicio): el calendario quedaba abajo porque las publicaciones urgentes se dibujaban fuera del grid"
```

---

## Task 4: Sacar la llamada a la API externa de feriados

**Files:**
- Modify: `RRHH/src/app/Componentes/PortalInicio/CalendarWidget.tsx`
- Modify: `RRHH/src/app/GestionLicencias/Calendario.tsx`

**Interfaces:**
- Consumes: `GET /licenses/feriados` (ya existe, ya usado por `ConfiguracionLicencias/Screen.tsx:158` — mismo shape: `{ feriados: { id, fecha, nombre }[] }`).
- No se toca el backend: `POST /feriados/importar/{anio}` (el que sí llama a la API externa, una vez, para poblar la tabla) queda como está — es la única llamada externa legítima que sobrevive, y vive en Configuración de Licencias, no en estas dos pantallas.

- [ ] **Step 1: `CalendarWidget.tsx` — reemplazar el fetch externo**

Cambiar:

```tsx
useEffect(() => {
  const year = Temporal.Now.plainDateISO().year;
  fetch(`https://api.argentinadatos.com/v1/feriados/${year}`)
    .then((r) => { if (!r.ok) throw new Error('Error al obtener feriados públicos'); return r.json(); })
    .then((data: HolidayApi[]) => setFeriados(processHolidays(data)))
    .catch((err) => console.error('Error al cargar feriados:', err));
}, []);
```

por:

```tsx
useEffect(() => {
  apiClient
    .get<{ feriados: { id: number; fecha: string; nombre: string }[] }>('/licenses/feriados')
    .then((res) => {
      const data: HolidayApi[] = res.feriados.map((f) => ({ date: f.fecha, name: f.nombre, type: 'inamovible' }));
      setFeriados(processHolidays(data));
    })
    .catch((err) => console.error('Error al cargar feriados:', err));
}, []);
```

Ajustar el shape exacto de `HolidayApi` leyendo `RRHH/src/app/lib/dates.ts` antes de escribir el `map` — si sus campos no son `date`/`name`/`type`, usar los que realmente declara esa interfaz. Agregar el import:

```tsx
import { apiClient } from '@/app/util/apiClient';
```

- [ ] **Step 2: `Calendario.tsx` — sacar la mitad que llama a la API externa**

Este archivo ya combina dos fuentes (líneas 45-55 del diagnóstico): una llamada a `api.argentinadatos.com` y otra a `/licenses/feriados`. Sacar únicamente la llamada externa y dejar `/licenses/feriados` como única fuente — leer el archivo completo antes de tocarlo, ya que probablemente hace un `Promise.all([...])` o similar que hay que reducir a una sola promesa en vez de dos fusionadas.

- [ ] **Step 3: Verificar que no queda ninguna referencia a la API externa fuera de la importación**

```bash
grep -rn "argentinadatos" src --include="*.tsx" --include="*.ts"
```

Esperado: cero resultados en `CalendarWidget.tsx` y `Calendario.tsx`. Si aparece en algún otro archivo no mencionado en el diagnóstico, pausar y avisar — puede haber un tercer punto de llamada no detectado hoy.

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/PortalInicio/CalendarWidget.tsx src/app/GestionLicencias/Calendario.tsx
git commit -m "fix(feriados): calendarios leen /licenses/feriados en vez de pegarle directo a la API externa"
```

---

## Task 5: Bloqueo de licencias — no debe cruzar tipos

**Files:**
- Modify: `Backend_RRHH/app/routes/licenses.py:381-391`
- Modify (si existen): tests que cubran `create_license_request` y este bloqueo — buscar con `grep -rln "solicitud.*pendiente\|pendiente.*aprobacion" tests/` antes de tocar código, para actualizar el/los test(s) existente(s) en vez de dejarlos rotos.

**Interfaces:**
- Sin cambios de contrato: la request y la respuesta del endpoint no cambian, solo la condición SQL del bloqueo.

**Decisión de negocio (ya inferida del pedido del usuario, no requiere volver a preguntar):** un empleado puede tener como máximo una solicitud pendiente **por tipo** de licencia a la vez — una Vacaciones pendiente no debe bloquear pedir, por ejemplo, un permiso de Matrimonio. Dos pendientes del mismo tipo sí se siguen bloqueando (eso evita que alguien duplique el mismo pedido).

- [ ] **Step 1: Acotar la consulta de bloqueo por tipo**

Cambiar:

```python
# Bloqueo: no se puede crear una nueva solicitud si ya hay una pendiente
# (de cualquier tipo) sin resolver.
pendiente = db.execute(text("""
    SELECT id FROM License
    WHERE employeeId = :empId
      AND status IN ('Pendiente', 'Pendiente Siguiente Aprobación')
"""), {"empId": employee_id}).fetchone()
if pendiente:
    raise HTTPException(
        status_code=400,
        detail="Ya tenés una solicitud de licencia pendiente de aprobación. Esperá la resolución antes de crear una nueva."
    )
```

por:

```python
# Bloqueo: no se puede crear una nueva solicitud del MISMO tipo si ya hay una
# pendiente sin resolver. Tipos distintos no se bloquean entre si -- una
# Vacaciones pendiente no debe impedir pedir, por ejemplo, un permiso por
# Matrimonio.
pendiente = db.execute(text("""
    SELECT id FROM License
    WHERE employeeId = :empId
      AND type = :type
      AND status IN ('Pendiente', 'Pendiente Siguiente Aprobación')
"""), {"empId": employee_id, "type": lic_type}).fetchone()
if pendiente:
    raise HTTPException(
        status_code=400,
        detail=f"Ya tenés una solicitud de '{lic_type}' pendiente de aprobación. Esperá la resolución antes de crear otra del mismo tipo."
    )
```

`lic_type` ya está definido más arriba en la misma función (`lic_type = data.get("type", "Licencias")`, visible en el diagnóstico) — no hace falta declararlo de nuevo.

- [ ] **Step 2: Ajustar el mensaje en el frontend si hace falta**

`RRHH/src/app/GestionLicencias/Licencias.tsx:175` y `:181` tienen el texto genérico "Ya tenés una solicitud pendiente de aprobación" / "Esperá la resolución de tu solicitud pendiente antes de crear otra." — revisar la lógica de `tieneSolicitudPendiente` en ese archivo: si hoy calcula "pendiente de cualquier tipo" para decidir si deshabilita el botón "Solicitar", hay que acotarla también por tipo (o, más simple, sacar el bloqueo preventivo del botón del lado del cliente y dejar que el backend sea la única fuente de verdad, mostrando el error que ya devuelve el 400 en el toast de error). Leer el archivo completo antes de decidir cuál de las dos opciones aplica mejor al flujo actual.

- [ ] **Step 3: Actualizar o agregar test**

Si existe un test que asuma "cualquier pendiente bloquea", actualizarlo. Si no existe ninguno, agregar un test mínimo con `FakeSession` (nunca contra base real) que confirme: (a) una Vacaciones pendiente NO bloquea pedir un Matrimonio, (b) dos Vacaciones pendientes sí se bloquean entre sí.

- [ ] **Step 4: Verificar**

```bash
cd Backend_RRHH && venv/Scripts/python.exe -m pytest tests/ -q
```

Esperado: mismo conteo de tests que antes + el/los nuevo(s), todos en verde.

- [ ] **Step 5: Commit**

```bash
git add app/routes/licenses.py tests/
git commit -m "fix(licencias): el bloqueo de solicitud pendiente cruzaba tipos, ahora es por tipo"
```

---

## Verificación final

- [ ] `RRHH`: `npx tsc --noEmit` (mismo conteo de preexistentes) + `node scripts/check-contrast.mjs` (si Task 3/4 tocó algo visual) + `npm run build`.
- [ ] `Backend_RRHH`: `venv/Scripts/python.exe -m pytest tests/ -q` (nunca sin acotar a `tests/` — recordar el bug de `test_api.py` de esta sesión).
- [ ] Confirmar que `grep -rn "argentinadatos" src` en `RRHH` solo aparece donde se espera (si quedó algún resto documentado, no en código).
