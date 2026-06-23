# Retema de CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retematizar el módulo CV (ficha curricular del empleado y el flujo de validación de habilidades técnicas) reemplazando clases Tailwind hardcodeadas por los tokens semánticos de la paleta "Orgánico Cálido" ya definidos, y migrando `SkillCard` de PrimeReact `Card` a shadcn.

**Architecture:** Cambio puramente de presentación — ninguna lógica de fetch/estado cambia. `FormacionAcademica.tsx`, `ExperienciaLaboral.tsx`, `Idiomas.tsx` y `CertificacionesCursos.tsx` no se modifican directamente: delegan todo su renderizado de campos a `DynamicSectionCv.tsx`, que sí se retemea (Task 4).

**Tech Stack:** Next.js 14, Tailwind v4 (tokens ya definidos en `globals.css`), shadcn/ui (`Card` ya instalado desde la fase de Estadísticas), PrimeReact (sin cambios de librería salvo `SkillCard`).

## Global Constraints

- No tocar lógica de fetch/estado (`handleSave`, `handleChange`, `loadTest`, `generateTestWithGemini`, `handleSubmit`, el timer de `TestModal.tsx`, etc.) — solo JSX/clases.
- No migrar `Accordion`/`AccordionTab`, `InputText`, `Dropdown`, `Calendar`, `Dialog`, `RadioButton`, `ProgressBar`, `ProgressSpinner`, `Message`, `Tag`, `Button` de PrimeReact a otra librería — solo `SkillCard`'s `Card` migra a shadcn.
- No tocar el código muerto de `UiCv.tsx` (`Card`, `Accordion`, `Input`, `Select`, `FieldLabel`) — ningún archivo de `CvComponente/` los importa.
- No tocar `FormacionAcademica.tsx`, `ExperienciaLaboral.tsx`, `Idiomas.tsx`, `CertificacionesCursos.tsx` directamente — no tienen clases hardcodeadas propias, todo su estilo viene de `DynamicSectionCv.tsx`.
- Los tokens `bg-success-soft`/`bg-warning-soft`/`bg-error-soft` (y sus `-foreground`) ya existen desde la fase de RRHH — ninguna tarea de este plan crea tokens nuevos.
- Verificación: `npx tsc --noEmit` acotado a archivos tocados + verificación visual manual (no hay test suite automatizado para cambios puramente visuales).

---

### Task 1: Migrar SkillCard a shadcn Card

**Files:**
- Modify: `src/app/util/UiRRHH.tsx`

**Interfaces:**
- Consumes: `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter` desde `@/components/ui/card` (ya instalado, sin pasos de instalación).
- Produces: `SkillCard({ skill, onStartTest }: { skill: Skill; onStartTest: (skill: Skill) => void })` — misma firma, consumida sin cambios por `HabilidadesTecnicas.tsx` (Task 6).

- [ ] **Step 1: Reemplazar la función `SkillCard`**

El archivo actual tiene (línea ~895):

```tsx
export const SkillCard = ({ skill, onStartTest }: { skill: Skill; onStartTest: (skill: Skill) => void }) => {
  const isLocked = skill.status === "locked" && skill.unlockDate && new Date() < new Date(skill.unlockDate);
  const isValidated = skill.status === "validated";
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Card
      title={skill.name}
      footer={!isValidated && (
        <div className="flex justify-end">
          <Button label="Comenzar Prueba" icon="pi pi-bolt" onClick={() => onStartTest(skill)} disabled={!!isLocked} size="small" />
        </div>
      )}
      className="h-full flex flex-col"
    >
      <p className="text-gray-500 text-sm mb-3">{skill.description}</p>
      {isValidated && (
        <>
          <Tag severity="success" value="Validado" icon="pi pi-check-circle" className="mb-2" />
          <ProgressBar value={skill.level * 10} style={{ height: 6 }} showValue={false} />
          <small className="text-gray-400 mt-1 block">Nivel: {skill.level}/10</small>
        </>
      )}
      {isLocked && skill.unlockDate && (
        <Tag severity="danger" icon="pi pi-lock" value={`Bloqueado hasta: ${fmt(skill.unlockDate)}`} />
      )}
    </Card>
  );
};
```

Reemplazar por:

```tsx
export const SkillCard = ({ skill, onStartTest }: { skill: Skill; onStartTest: (skill: Skill) => void }) => {
  const isLocked = skill.status === "locked" && skill.unlockDate && new Date() < new Date(skill.unlockDate);
  const isValidated = skill.status === "validated";
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{skill.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm mb-3">{skill.description}</p>
        {isValidated && (
          <>
            <Tag severity="success" value="Validado" icon="pi pi-check-circle" className="mb-2" />
            <ProgressBar value={skill.level * 10} style={{ height: 6 }} showValue={false} />
            <small className="text-muted-foreground mt-1 block">Nivel: {skill.level}/10</small>
          </>
        )}
        {isLocked && skill.unlockDate && (
          <Tag severity="danger" icon="pi pi-lock" value={`Bloqueado hasta: ${fmt(skill.unlockDate)}`} />
        )}
      </CardContent>
      {!isValidated && (
        <CardFooter className="flex justify-end">
          <Button label="Comenzar Prueba" icon="pi pi-bolt" onClick={() => onStartTest(skill)} disabled={!!isLocked} size="small" />
        </CardFooter>
      )}
    </Card>
  );
};
```

- [ ] **Step 2: Actualizar el import de `Card`**

El archivo actual tiene (línea ~798):

```tsx
import { Card } from 'primereact/card';
```

Reemplazar por:

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
```

Confirmar que esto no rompe ningún otro uso de `Card` (de PrimeReact) en el mismo archivo — si hay otro componente en `UiRRHH.tsx` que también use `Card` de PrimeReact con props distintas (`title`/`footer` como prop), avisar antes de continuar; según el spec, `SkillCard` es el único consumidor relevante para este cambio.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `UiRRHH.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: migrate SkillCard from PrimeReact Card to shadcn"
```

---

### Task 2: Retemear SectionTitle y Screen.tsx

**Files:**
- Modify: `src/app/util/UiCv.tsx`
- Modify: `src/app/screens/Cv/Screen.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: `SectionTitle` — misma firma, consumida sin cambios por `Screen.tsx`.

- [ ] **Step 1: Retemear `SectionTitle`**

El archivo actual (`UiCv.tsx`) tiene (línea 30):

```tsx
export const SectionTitle = ({ icon: Icon, title }: SectionTitleProps) => (
  <div className="flex items-center gap-3 mb-6">
    <Icon className="w-6 h-6 text-[#1ABCD7]" />
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
  </div>
);
```

Reemplazar por:

```tsx
export const SectionTitle = ({ icon: Icon, title }: SectionTitleProps) => (
  <div className="flex items-center gap-3 mb-6">
    <Icon className="w-6 h-6 text-primary" />
    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
  </div>
);
```

No tocar `Card`, `Accordion`, `Input`, `Select`, `FieldLabel` en este mismo archivo — son código muerto, fuera de alcance.

- [ ] **Step 2: Retemear el estado de validación de sesión en `Screen.tsx`**

El archivo actual tiene (líneas 64-76):

```tsx
  if (isAuthenticated === null) {
    return (
      <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          </div>
          <p className="text-gray-700 text-center">Verificando sesion...</p>
        </div>
      </div>
    );
  }
```

Reemplazar por:

```tsx
  if (isAuthenticated === null) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-sm">
          <div className="flex justify-center mb-4">
            <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
          </div>
          <p className="text-foreground text-center">Verificando sesion...</p>
        </div>
      </div>
    );
  }
```

- [ ] **Step 3: Retemear el estado "empleado no encontrado"**

El archivo actual tiene (líneas 79-98):

```tsx
  if (!cvData) {
    return (
      <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {employeeData === null ? (
            <>
              <div className="flex justify-center mb-4">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
              </div>
              <p className="text-gray-700 text-center">Cargando informacion del empleado...</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-700">No se pudo encontrar la informacion del empleado.</p>
            </>
          )}
        </div>
      </div>
    );
  }
```

Reemplazar por:

```tsx
  if (!cvData) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-sm">
          {employeeData === null ? (
            <>
              <div className="flex justify-center mb-4">
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
              </div>
              <p className="text-foreground text-center">Cargando informacion del empleado...</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-error mb-2">Error</h2>
              <p className="text-foreground">No se pudo encontrar la informacion del empleado.</p>
            </>
          )}
        </div>
      </div>
    );
  }
```

- [ ] **Step 4: Retemear el contenedor raíz**

El archivo actual tiene (línea 149):

```tsx
    <div className="bg-gray-100 font-sans min-h-screen">
```

Reemplazar por:

```tsx
    <div className="bg-background font-sans min-h-screen">
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `UiCv.tsx`/`Screen.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/app/util/UiCv.tsx src/app/screens/Cv/Screen.tsx
git commit -m "feat: retheme SectionTitle and Cv Screen.tsx to organic-warm tokens"
```

---

### Task 3: Retemear DatosPersonales.tsx

**Files:**
- Modify: `src/app/Componentes/CvComponente/DatosPersonales.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear las 7 etiquetas de campo**

El archivo actual tiene, repetido 7 veces (líneas 77-79, 90-92, 103-105, 127-129, 145-147, 161-163, 178-180), el mismo patrón con distinto `htmlFor`/texto, por ejemplo (líneas 77-79):

```tsx
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
```

Reemplazar `text-gray-700` por `text-foreground` en **las 7 ocurrencias** (Nombre Completo, DNI, Fecha de Nacimiento, Género, Dirección, Teléfono, Email) — cada una mantiene su `htmlFor`/texto, solo cambia la clase de color. Por ejemplo, la primera queda:

```tsx
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nombre Completo
            </label>
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `DatosPersonales.tsx`.

Run (opcional, recomendado dado que hay 7 ocurrencias idénticas a reemplazar): `grep -n "text-gray-700" src/app/Componentes/CvComponente/DatosPersonales.tsx` — debe devolver 0 resultados después del cambio.

- [ ] **Step 3: Commit**

```bash
git add src/app/Componentes/CvComponente/DatosPersonales.tsx
git commit -m "feat: retheme DatosPersonales.tsx to organic-warm tokens"
```

---

### Task 4: Retemear DynamicSectionCv.tsx

**Files:**
- Modify: `src/app/Componentes/Perfil/DynamicSectionCv.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: `DynamicSection` — misma firma (`DynamicSectionProps`), consumida sin cambios por `FormacionAcademica.tsx`, `ExperienciaLaboral.tsx`, `Idiomas.tsx`, `CertificacionesCursos.tsx` (ninguno de esos 4 archivos se modifica en este plan).

- [ ] **Step 1: Retemear el botón "Añadir nuevo registro" (early-return de items inválidos)**

El archivo actual tiene (líneas 62-73):

```tsx
    return (
      <div className="space-y-6">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" /> Añadir nuevo registro
          </button>
        )}
      </div>
    );
  }
```

Reemplazar por:

```tsx
    return (
      <div className="space-y-6">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm font-medium text-foreground hover:bg-muted"
          >
            <Plus className="w-4 h-4" /> Añadir nuevo registro
          </button>
        )}
      </div>
    );
  }
```

- [ ] **Step 2: Retemear el ícono "Formación destacada"**

El archivo actual tiene (líneas 84-89):

```tsx
                <div
                  className="absolute top-4 right-12 text-yellow-400"
                  title="Formación destacada"
                >
                  <Star className="w-6 h-6 fill-current" />
                </div>
              )}
```

Reemplazar `text-yellow-400` por `text-warning`:

```tsx
                <div
                  className="absolute top-4 right-12 text-warning"
                  title="Formación destacada"
                >
                  <Star className="w-6 h-6 fill-current" />
                </div>
              )}
```

- [ ] **Step 3: Retemear el checkbox**

El archivo actual tiene (líneas 99-113):

```tsx
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!item[field.name]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (!isEditing) return;
                            onChange(item.id, field.name, e.target.checked);
                            if (e.target.checked) onChange(item.id, "endDate", "");
                          }}
                          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditing ? "cursor-not-allowed" : ""
                            }`}
                          disabled={!isEditing}
                        />
                        {field.label}
                      </label>
```

Reemplazar por:

```tsx
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={!!item[field.name]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (!isEditing) return;
                            onChange(item.id, field.name, e.target.checked);
                            if (e.target.checked) onChange(item.id, "endDate", "");
                          }}
                          className={`h-4 w-4 rounded border-border text-primary focus:ring-primary ${!isEditing ? "cursor-not-allowed" : ""
                            }`}
                          disabled={!isEditing}
                        />
                        {field.label}
                      </label>
```

- [ ] **Step 4: Retemear el label del select y su asterisco**

El archivo actual tiene (líneas 120-124):

```tsx
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
```

Reemplazar por:

```tsx
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="text-error ml-1">*</span>}
                      </label>
```

(Esta cabecera de label+asterisco se repite 3 veces en el archivo — select, file, y el campo de texto por defecto — todas con el mismo `className`. Reemplazar **las 3 ocurrencias** con el mismo cambio.)

- [ ] **Step 5: Retemear el input de archivo**

El archivo actual tiene (línea 164):

```tsx
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
```

Reemplazar por:

```tsx
                        className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
```

- [ ] **Step 6: Retemear el badge "Verificado" y el botón "Verificar"**

El archivo actual tiene (líneas 196-209):

```tsx
                {typeof item.isVerified !== 'undefined' && item.isVerified === true && (
                  <span className="p-1 px-2 text-xs font-bold text-green-700 bg-green-100 rounded shadow-sm flex items-center justify-center gap-1" title="Esta formación ha sido verificada.">
                    ✓ Verificado
                  </span>
                )}
                {typeof item.isVerified !== 'undefined' && item.isVerified === false && onVerify && (
                  <button
                    onClick={() => onVerify(item)}
                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded bg-white shadow-sm text-xs font-semibold px-2"
                    title="Realizar test para validar esta formación"
                  >
                    Verificar
                  </button>
                )}
```

Reemplazar por:

```tsx
                {typeof item.isVerified !== 'undefined' && item.isVerified === true && (
                  <span className="p-1 px-2 text-xs font-bold bg-success-soft text-success-soft-foreground rounded shadow-sm flex items-center justify-center gap-1" title="Esta formación ha sido verificada.">
                    ✓ Verificado
                  </span>
                )}
                {typeof item.isVerified !== 'undefined' && item.isVerified === false && onVerify && (
                  <button
                    onClick={() => onVerify(item)}
                    className="p-1 text-primary hover:opacity-80 hover:bg-primary/10 rounded bg-card shadow-sm text-xs font-semibold px-2"
                    title="Realizar test para validar esta formación"
                  >
                    Verificar
                  </button>
                )}
```

- [ ] **Step 7: Retemear el botón de eliminar**

El archivo actual tiene (líneas 210-216):

```tsx
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full flex items-center justify-center bg-white shadow-sm"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
```

Reemplazar por:

```tsx
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1 text-error hover:opacity-80 hover:bg-error-soft rounded-full flex items-center justify-center bg-card shadow-sm"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
```

- [ ] **Step 8: Retemear el botón "Añadir nuevo registro" final**

El archivo actual tiene (líneas 223-230), idéntico al de Step 1:

```tsx
      {isEditing && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" /> Añadir nuevo registro
        </button>
      )}
```

Reemplazar por:

```tsx
      {isEditing && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="w-4 h-4" /> Añadir nuevo registro
        </button>
      )}
```

- [ ] **Step 9: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `DynamicSectionCv.tsx`.

Run: `grep -nE "gray-|blue-|red-|yellow-" src/app/Componentes/Perfil/DynamicSectionCv.tsx` — debe devolver 0 resultados después del cambio.

- [ ] **Step 10: Commit**

```bash
git add src/app/Componentes/Perfil/DynamicSectionCv.tsx
git commit -m "feat: retheme DynamicSectionCv.tsx to organic-warm tokens"
```

---

### Task 5: Retemear HabilidadesBlandas.tsx

**Files:**
- Modify: `src/app/Componentes/CvComponente/HabilidadesBlandas.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear la fila seleccionable y el checkbox**

El archivo actual tiene (líneas 29-51):

```tsx
          <label
            key={skill.id}
            className={`flex items-start p-3 border rounded-lg ${
              isEditing
                ? "cursor-pointer hover:bg-gray-50"
                : "cursor-not-allowed bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 ${
                !isEditing ? "cursor-not-allowed" : ""
              }`}
              checked={selectedSkills.includes(skill.id)}
              onChange={() => handleSoftSkillChange(skill.id)}
              disabled={!isEditing}
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-gray-900">
                {skill.nombre}
              </span>
              <p className="text-gray-500">{skill.descripcion}</p>
            </div>
          </label>
```

Reemplazar por:

```tsx
          <label
            key={skill.id}
            className={`flex items-start p-3 border border-border rounded-lg ${
              isEditing
                ? "cursor-pointer hover:bg-muted"
                : "cursor-not-allowed bg-muted"
            }`}
          >
            <input
              type="checkbox"
              className={`h-5 w-5 rounded border-border text-primary focus:ring-primary mt-1 ${
                !isEditing ? "cursor-not-allowed" : ""
              }`}
              checked={selectedSkills.includes(skill.id)}
              onChange={() => handleSoftSkillChange(skill.id)}
              disabled={!isEditing}
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-foreground">
                {skill.nombre}
              </span>
              <p className="text-muted-foreground">{skill.descripcion}</p>
            </div>
          </label>
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `HabilidadesBlandas.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/Componentes/CvComponente/HabilidadesBlandas.tsx
git commit -m "feat: retheme HabilidadesBlandas.tsx to organic-warm tokens"
```

---

### Task 6: Retemear HabilidadesTecnicas.tsx

**Files:**
- Modify: `src/app/Componentes/CvComponente/HabilidadesTecnicas.tsx`

**Interfaces:**
- Consumes: `SkillCard` desde `@/app/util/UiRRHH` (Task 1, props sin cambios).
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el mensaje de carga**

El archivo actual tiene (línea 207):

```tsx
                            <p className="text-gray-500 italic">Cargando habilidades...</p>
```

Reemplazar por:

```tsx
                            <p className="text-muted-foreground italic">Cargando habilidades...</p>
```

- [ ] **Step 2: Retemear el título "Habilidades Validadas" y su mensaje vacío**

El archivo actual tiene (líneas 211-227):

```tsx
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Habilidades Validadas
                                </h3>
                                {validatedSkills.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {validatedSkills.map(skill => (
                                            <SkillCard 
                                                key={skill.id} 
                                                skill={skill} 
                                                onStartTest={handleStartTest} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic mb-6">
                                        Aun no tienes habilidades validadas.
                                    </p>
                                )}
```

Reemplazar por:

```tsx
                                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                                    Habilidades Validadas
                                </h3>
                                {validatedSkills.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {validatedSkills.map(skill => (
                                            <SkillCard 
                                                key={skill.id} 
                                                skill={skill} 
                                                onStartTest={handleStartTest} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic mb-6">
                                        Aun no tienes habilidades validadas.
                                    </p>
                                )}
```

- [ ] **Step 3: Retemear el título "Habilidades por Validar" y su mensaje vacío**

El archivo actual tiene (líneas 233-249):

```tsx
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                            Habilidades por Validar
                                        </h3>
                                        {pendingSkills.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {pendingSkills.map(skill => (
                                                    <SkillCard 
                                                        key={skill.id} 
                                                        skill={skill} 
                                                        onStartTest={handleStartTest}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">
                                                No hay mas habilidades disponibles para validar.
                                            </p>
                                        )}
```

Reemplazar por:

```tsx
                                        <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                                            Habilidades por Validar
                                        </h3>
                                        {pendingSkills.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {pendingSkills.map(skill => (
                                                    <SkillCard 
                                                        key={skill.id} 
                                                        skill={skill} 
                                                        onStartTest={handleStartTest}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No hay mas habilidades disponibles para validar.
                                            </p>
                                        )}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `HabilidadesTecnicas.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/CvComponente/HabilidadesTecnicas.tsx
git commit -m "feat: retheme HabilidadesTecnicas.tsx to organic-warm tokens"
```

---

### Task 7: Retemear SkillTest.tsx

**Files:**
- Modify: `src/app/Componentes/CvComponente/SkillTest.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el estado de carga**

El archivo actual tiene (líneas 271-277):

```tsx
            {testState === 'loading' && (
                <div className="flex flex-col justify-center items-center p-8">
                    <ProgressSpinner />
                    <p className="mt-4 text-gray-600">
                        Preparando tu evaluación de {skill?.name}...
                    </p>
                </div>
            )}
```

Reemplazar por:

```tsx
            {testState === 'loading' && (
                <div className="flex flex-col justify-center items-center p-8">
                    <ProgressSpinner />
                    <p className="mt-4 text-muted-foreground">
                        Preparando tu evaluación de {skill?.name}...
                    </p>
                </div>
            )}
```

- [ ] **Step 2: Retemear el contador de progreso y la pregunta**

El archivo actual tiene (líneas 284-305):

```tsx
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                                {Math.round(progress)}% completado
                            </span>
                        </div>
                        <ProgressBar 
                            value={progress} 
                            style={{ height: '8px' }}
                            className="mb-4"
                        />
                    </div>

                    {/* Pregunta */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {currentQuestion.question}
                        </h3>
```

Reemplazar por:

```tsx
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                                {Math.round(progress)}% completado
                            </span>
                        </div>
                        <ProgressBar 
                            value={progress} 
                            style={{ height: '8px' }}
                            className="mb-4"
                        />
                    </div>

                    {/* Pregunta */}
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {currentQuestion.question}
                        </h3>
```

- [ ] **Step 3: Retemear las opciones de respuesta**

El archivo actual tiene (líneas 308-323):

```tsx
                            {currentQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                                    <RadioButton 
                                        inputId={`option${index}`} 
                                        name={`question${currentQuestionIndex}`} 
                                        value={index}
                                        onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.value)}
                                        checked={userAnswers[currentQuestionIndex] === index} 
                                    />
                                    <label 
                                        htmlFor={`option${index}`} 
                                        className="ml-3 cursor-pointer flex-1 text-gray-700"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
```

Reemplazar por:

```tsx
                            {currentQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-muted border border-border">
                                    <RadioButton 
                                        inputId={`option${index}`} 
                                        name={`question${currentQuestionIndex}`} 
                                        value={index}
                                        onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.value)}
                                        checked={userAnswers[currentQuestionIndex] === index} 
                                    />
                                    <label 
                                        htmlFor={`option${index}`} 
                                        className="ml-3 cursor-pointer flex-1 text-foreground"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
```

- [ ] **Step 4: Retemear el ícono de resultado, título, puntuación y nivel**

El archivo actual tiene (líneas 343-369):

```tsx
                    {score >= 70 ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                    )}

                    {/* Título */}
                    <h3 className="text-2xl font-bold text-gray-800">
                        ¡Evaluación Completada!
                    </h3>

                    {/* Puntuación */}
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">
                            {Math.round(score)}%
                        </p>
                        <p className="text-lg text-gray-600">
                            Nivel obtenido: <span className={`font-semibold ${
                                testResult === 'Avanzado' ? 'text-green-600' :
                                testResult === 'Bueno' ? 'text-blue-600' :
                                'text-red-600'
                            }`}>
                                {testResult}
                            </span>
                        </p>
                    </div>
```

Reemplazar por:

```tsx
                    {score >= 70 ? (
                        <CheckCircle className="w-20 h-20 text-success mx-auto" />
                    ) : (
                        <XCircle className="w-20 h-20 text-error mx-auto" />
                    )}

                    {/* Título */}
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                        ¡Evaluación Completada!
                    </h3>

                    {/* Puntuación */}
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-foreground">
                            {Math.round(score)}%
                        </p>
                        <p className="text-lg text-muted-foreground">
                            Nivel obtenido: <span className={`font-semibold ${
                                testResult === 'Avanzado' ? 'text-success' :
                                testResult === 'Bueno' ? 'text-primary' :
                                'text-error'
                            }`}>
                                {testResult}
                            </span>
                        </p>
                    </div>
```

- [ ] **Step 5: Retemear las cajas de mensaje aprobado/reprobado**

El archivo actual tiene (líneas 372-390):

```tsx
                    {score >= 70 ? (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-green-800 font-medium">
                                ¡Felicitaciones! Has aprobado la evaluación.
                            </p>
                            <p className="text-green-700 text-sm mt-1">
                                Esta habilidad será validada en tu perfil.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-red-800 font-medium">
                                No has alcanzado el puntaje mínimo para aprobar.
                            </p>
                            <p className="text-red-700 text-sm mt-1">
                                Podrás intentar nuevamente en 3 meses.
                            </p>
                        </div>
                    )}
```

Reemplazar por:

```tsx
                    {score >= 70 ? (
                        <div className="p-4 bg-success-soft rounded-lg">
                            <p className="text-success-soft-foreground font-medium">
                                ¡Felicitaciones! Has aprobado la evaluación.
                            </p>
                            <p className="text-success-soft-foreground text-sm mt-1">
                                Esta habilidad será validada en tu perfil.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-error-soft rounded-lg">
                            <p className="text-error-soft-foreground font-medium">
                                No has alcanzado el puntaje mínimo para aprobar.
                            </p>
                            <p className="text-error-soft-foreground text-sm mt-1">
                                Podrás intentar nuevamente en 3 meses.
                            </p>
                        </div>
                    )}
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `SkillTest.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/app/Componentes/CvComponente/SkillTest.tsx
git commit -m "feat: retheme SkillTest.tsx to organic-warm tokens"
```

---

### Task 8: Retemear TestModal.tsx

**Files:**
- Modify: `src/app/Componentes/Validaciones/TestModal.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Retemear el estado de error (validación bloqueada)**

El archivo actual tiene (líneas 124-132):

```tsx
      <Dialog visible={visible} onHide={onHide} header="Validacion Bloqueada" style={{ width: '50vw' }}>
         <div className="p-4 text-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">No puedes rendir este examen aun</h3>
            <p className="text-gray-700">{error}</p>
            <Button label="Cerrar" className="mt-4" onClick={onHide} />
         </div>
      </Dialog>
```

Reemplazar por:

```tsx
      <Dialog visible={visible} onHide={onHide} header="Validacion Bloqueada" style={{ width: '50vw' }}>
         <div className="p-4 text-center">
            <h3 className="text-xl font-bold text-error mb-2">No puedes rendir este examen aun</h3>
            <p className="text-foreground">{error}</p>
            <Button label="Cerrar" className="mt-4" onClick={onHide} />
         </div>
      </Dialog>
```

- [ ] **Step 2: Retemear el estado de resultado**

El archivo actual tiene (líneas 138-151):

```tsx
         <div className="p-6 text-center space-y-4">
            <CheckCircle size={60} className={`mx-auto ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
            <h2 className="text-2xl font-bold text-gray-800">
               {isSuccess ? 'Examen Aprobado!' : 'Examen Reprobado'}
            </h2>
            <p className="text-lg">
               Puntuacion: <strong>{result.correctCount} / {result.totalQuestions}</strong> correctas
            </p>
            <p className="text-gray-500 text-sm">
               {isSuccess 
                 ? "Esta habilidad tecnica ahora esta certificada. Felicidades!"
                 : "No has alcanzado el 60% requerido. Deberas esperar 90 dias (Cooldown) para volver a intentarlo."}
            </p>
```

Reemplazar por:

```tsx
         <div className="p-6 text-center space-y-4">
            <CheckCircle size={60} className={`mx-auto ${isSuccess ? 'text-success' : 'text-error'}`} />
            <h2 className="font-heading text-2xl font-bold text-foreground">
               {isSuccess ? 'Examen Aprobado!' : 'Examen Reprobado'}
            </h2>
            <p className="text-lg">
               Puntuacion: <strong>{result.correctCount} / {result.totalQuestions}</strong> correctas
            </p>
            <p className="text-muted-foreground text-sm">
               {isSuccess 
                 ? "Esta habilidad tecnica ahora esta certificada. Felicidades!"
                 : "No has alcanzado el 60% requerido. Deberas esperar 90 dias (Cooldown) para volver a intentarlo."}
            </p>
```

- [ ] **Step 3: Retemear el estado de carga**

El archivo actual tiene (líneas 170-174):

```tsx
       {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
             <ProgressSpinner />
             <p className="mt-4 text-gray-600 animate-pulse">La Inteligencia Artificial esta elaborando tu examen de {technicalSkill.nombre}...</p>
          </div>
       ) : (
```

Reemplazar por:

```tsx
       {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
             <ProgressSpinner />
             <p className="mt-4 text-muted-foreground animate-pulse">La Inteligencia Artificial esta elaborando tu examen de {technicalSkill.nombre}...</p>
          </div>
       ) : (
```

- [ ] **Step 4: Retemear el header del examen y el timer**

El archivo actual tiene (líneas 176-187):

```tsx
          <div className="flex flex-col h-full bg-gray-50 p-4 rounded-md">
             {/* Header del examen */}
             <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                <div>
                   <h3 className="font-bold text-lg text-gray-800">{technicalSkill.nombre}</h3>
                   <span className="text-sm text-gray-500">Responde las 5 preguntas antes de que se acabe el tiempo.</span>
                </div>
                <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                   <Clock size={18} />
                   {formatTime(timeLeft)}
                </div>
             </div>
```

Reemplazar por:

```tsx
          <div className="flex flex-col h-full bg-muted p-4 rounded-md">
             {/* Header del examen */}
             <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
                <div>
                   <h3 className="font-heading font-bold text-lg text-foreground">{technicalSkill.nombre}</h3>
                   <span className="text-sm text-muted-foreground">Responde las 5 preguntas antes de que se acabe el tiempo.</span>
                </div>
                <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-error-soft text-error-soft-foreground' : 'bg-muted text-muted-foreground'}`}>
                   <Clock size={18} />
                   {formatTime(timeLeft)}
                </div>
             </div>
```

- [ ] **Step 5: Retemear las tarjetas de pregunta y opciones**

El archivo actual tiene (líneas 190-208):

```tsx
             <div className="space-y-6 overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-4">{idx + 1}. {q.question}</p>
                      
                      <div className="space-y-2 pl-2">
                        {q.options.map((opt: string, optIdx: number) => (
                           <label key={optIdx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                              <input 
                                type="radio" 
                                name={`question_${idx}`} 
                                className="mt-1"
                                checked={userAnswers[idx] === optIdx}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                              />
                              <span className="text-gray-700 leading-snug">{opt}</span>
                           </label>
                        ))}
                      </div>
                   </div>
                ))}
             </div>
```

Reemplazar por:

```tsx
             <div className="space-y-6 overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                   <div key={idx} className="bg-card p-4 rounded-lg shadow-sm border border-border">
                      <p className="font-semibold text-foreground mb-4">{idx + 1}. {q.question}</p>
                      
                      <div className="space-y-2 pl-2">
                        {q.options.map((opt: string, optIdx: number) => (
                           <label key={optIdx} className="flex items-start gap-3 p-2 hover:bg-muted rounded cursor-pointer transition-colors">
                              <input 
                                type="radio" 
                                name={`question_${idx}`} 
                                className="mt-1"
                                checked={userAnswers[idx] === optIdx}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                              />
                              <span className="text-foreground leading-snug">{opt}</span>
                           </label>
                        ))}
                      </div>
                   </div>
                ))}
             </div>
```

- [ ] **Step 6: Retemear el footer del examen**

El archivo actual tiene (línea 214):

```tsx
             <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
```

Reemplazar por:

```tsx
             <div className="mt-6 flex justify-end border-t border-border pt-4">
```

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `TestModal.tsx`.

- [ ] **Step 8: Verificación visual manual**

Con `npm run dev` corriendo, ir a CV → Habilidades Técnicas → iniciar una validación de habilidad, completar el examen (`TestModal.tsx`), y también disparar el flujo local `SkillTestDialog`/`SkillTest.tsx` si es accesible — confirmar resultado aprobado y reprobado en ambos flujos, en modo claro y oscuro. Confirmar también la ficha completa de CV (los 7 componentes) y el badge "Verificado"/botón "Verificar" en Formación Académica.

- [ ] **Step 9: Commit**

```bash
git add src/app/Componentes/Validaciones/TestModal.tsx
git commit -m "feat: retheme TestModal.tsx to organic-warm tokens"
```

---

### Task 9: Retemear ProfilePictureUploader

**Files:**
- Modify: `src/app/util/UiRRHH.tsx`

**Interfaces:**
- Consumes: ninguna interfaz nueva.
- Produces: `ProfilePictureUploader` — misma firma, consumida sin cambios por `DatosPersonales.tsx`.

- [ ] **Step 1: Retemear el anillo del avatar**

El archivo actual tiene (línea ~943):

```tsx
        <Image
          src={photo || '/Default-avatar.webp'}
          alt="Foto de Perfil"
          width={144} height={144}
          className="w-full h-full rounded-full object-cover object-center border-4 border-white shadow-lg"
        />
```

Reemplazar `border-white` por `border-card`:

```tsx
        <Image
          src={photo || '/Default-avatar.webp'}
          alt="Foto de Perfil"
          width={144} height={144}
          className="w-full h-full rounded-full object-cover object-center border-4 border-card shadow-lg"
        />
```

No tocar el overlay de hover (`bg-black/50`, ícono/texto blanco) — es un scrim sobre la foto, no un color de superficie del tema.

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` — confirmar sin errores nuevos en `UiRRHH.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/util/UiRRHH.tsx
git commit -m "feat: retheme ProfilePictureUploader avatar ring to organic-warm tokens"
```
