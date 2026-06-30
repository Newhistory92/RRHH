# Edición por sección en el CV

## Contexto

`src/app/screens/Cv/Screen.tsx` hoy tiene un único botón "Editar CV" que pone las 7 secciones del CV (Datos Personales, Formación Académica, Experiencia Laboral, Idiomas, Habilidades Técnicas, Habilidades Blandas, Certificaciones) en modo edición simultáneamente, y un único "Guardar Cambios" que manda todo junto vía `PUT /employee/{id}`. Si el usuario solo quiere corregir un campo (ej. el teléfono), igual queda editando las 7 secciones a la vez — sensación de "todo o nada".

Además, el resultado del guardado (éxito o error) solo se loguea en la consola del navegador (`console.log`/`console.error`), sin ningún indicador visible para el usuario.

## Decisión

Reemplazar el modo de edición global por edición **por sección, una a la vez**: cada una de las 7 secciones tiene su propio botón Editar/Guardar/Cancelar; mientras una está en edición, las demás quedan bloqueadas (sus botones "Editar" se deshabilitan). Se agrega un toast de confirmación/error al guardar.

Todo el cambio vive en `src/app/screens/Cv/Screen.tsx`. Ninguno de los 7 componentes de sección (`DatosPersonales.tsx`, `FormacionAcademica.tsx`, `ExperienciaLaboral.tsx`, `Idiomas.tsx`, `HabilidadesTecnicas.tsx`, `HabilidadesBlandas.tsx`, `CertificacionesCursos.tsx`) se modifica — todos ya reciben `isEditing: boolean` y `updateData(...)` como props independientes; solo cambia qué controla ese booleano.

## Estado

Se reemplaza `isEditing: boolean` (único, global) por:

```typescript
type SectionKey =
  | 'datosPersonales'
  | 'academicFormation'
  | 'workExperience'
  | 'languages'
  | 'technicalSkills'
  | 'softSkills'
  | 'certifications';

const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
const [isSaving, setIsSaving] = useState(false);
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
```

Solo una sección puede tener `editingSection === <su key>` a la vez. `originalCvData` (el snapshot para Cancelar) se mantiene igual que hoy, pero se toma al entrar en edición de **cualquier** sección, no solo una vez.

## Toolbar por sección

Arriba de cada uno de los 7 componentes, una barra de acciones:

- Si `editingSection !== <esta sección>` y `editingSection === null`: botón "Editar" habilitado.
- Si `editingSection !== <esta sección>` y `editingSection !== null` (otra sección está en edición): botón "Editar" deshabilitado (visualmente atenuado).
- Si `editingSection === <esta sección>`: botones "Cancelar" y "Guardar" (Guardar muestra spinner/disabled mientras `isSaving`).

Se extrae un pequeño componente local `SectionToolbar` dentro de `Screen.tsx` (no exportado, uso interno) para no repetir el JSX 7 veces — recibe `sectionKey`, `editingSection`, `onEdit`, `onSave`, `onCancel`, `isSaving`.

## Guardar y Cancelar

- **`handleEditSection(section)`**: snapshotea `cvData` completo en `originalCvData` (igual que el actual `handleEdit`), setea `editingSection = section`.
- **`handleSaveSection()`**: llama al mismo `PUT /employee/{id}` que existe hoy (`handleSave` actual), mandando el `cvData` completo — **no se toca el backend**, sigue aceptando el objeto entero. Las secciones no tocadas se re-envían con los mismos datos que ya tenían (el backend hace DELETE+INSERT idéntico sobre ellas — no hay pérdida ni duplicación, es el mismo comportamiento que ya existe hoy al guardar todo junto). Es redundante pero seguro; no requiere cambios de backend.
  - Éxito: limpia `editingSection`/`originalCvData`, `showToast("<Sección> actualizada", "success")`.
  - Error: mantiene `editingSection` activo (no se pierden los cambios del usuario), `showToast(error.message || "Error al guardar", "error")`.
- **`handleCancelSection()`**: restaura `cvData` desde `originalCvData` (igual que el actual `handleCancel`), limpia `editingSection`.

## Feedback de guardado (toast)

Se reutiliza el patrón visual ya existente en `src/app/screens/ConfiguracionLicencias/Screen.tsx` (`notification` state + render fijo en la esquina superior derecha):

```tsx
{toast && (
  <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
    toast.type === 'success' ? 'bg-success-soft border-success text-success-soft-foreground' : 'bg-error-soft border-error text-error-soft-foreground'
  }`}>
    {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
    <span className="font-medium text-sm">{toast.message}</span>
  </div>
)}
```

`showToast(message, type)` setea el estado y lo limpia con `setTimeout` a los 3000ms, igual que en `ConfiguracionLicencias`.

## Footer global

El footer actual con "Editar CV" / "Cancelar" / "Guardar Cambios" se elimina por completo — cada sección maneja su propio ciclo de edición vía su toolbar.

## Fuera de alcance

- Cambios al backend (`PUT /employee/{id}` sigue aceptando el objeto completo, sin cambios).
- Edición de campo individual (más granular que por-sección) — no se pide.
- Permitir editar varias secciones simultáneamente — explícitamente descartado, una sección a la vez.
- Guardado optimista / debounce / autosave — fuera de alcance.
- Cualquier cambio a `HabilidadesTecnicas.tsx`/`HabilidadesBlandas.tsx` más allá de recibir `isEditing` desde el nuevo estado (su lógica interna, incluido el mapeo de títulos académicos recién agregado, no se toca).

## Testing

- No hay test suite automatizado en este frontend — verificación manual:
  1. Editar solo "Datos Personales": confirmar que las otras 6 secciones permanecen bloqueadas (botón Editar deshabilitado) mientras se edita.
  2. Guardar esa sección: confirmar toast de éxito, que los datos persisten al recargar, y que las otras secciones no se vieron afectadas.
  3. Cancelar una edición a medio hacer: confirmar que los cambios no guardados desaparecen y la sección vuelve a modo lectura.
  4. Forzar un error de guardado (ej. apagar el backend): confirmar toast de error y que la sección permanece en modo edición con los cambios del usuario intactos.
  5. Confirmar que no se puede iniciar edición de una segunda sección mientras otra está activa.
