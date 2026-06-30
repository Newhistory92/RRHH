# Edición por sección en el CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el modo de edición global del CV (un botón "Editar CV" que activa las 7 secciones a la vez) por edición por sección — una sección editable a la vez, con su propio Editar/Guardar/Cancelar y feedback visual (toast) de éxito/error.

**Architecture:** Todo el cambio vive en un único archivo, `src/app/screens/Cv/Screen.tsx`. El `isEditing: boolean` global se reemplaza por `editingSection: SectionKey | null`. Se agrega un componente local `SectionToolbar` (no exportado, definido en el mismo archivo) reutilizado 7 veces. Ningún componente de sección (`DatosPersonales.tsx`, etc.) se modifica — todos ya reciben `isEditing`/`updateData` como props.

**Tech Stack:** Next.js, TypeScript, PrimeReact (`Button`), lucide-react (iconos), Tailwind CSS v4 semantic tokens.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-30-cv-section-editing-design.md`
- No se toca el backend — `PUT /employee/{id}` sigue recibiendo el objeto `cvData` completo, sin cambios de contrato.
- No se modifica ningún componente de sección (`DatosPersonales.tsx`, `FormacionAcademica.tsx`, `ExperienciaLaboral.tsx`, `Idiomas.tsx`, `HabilidadesTecnicas.tsx`, `HabilidadesBlandas.tsx`, `CertificacionesCursos.tsx`) — todos siguen recibiendo `isEditing`/`updateData` exactamente como hoy.
- Solo una sección puede estar en `editingSection` a la vez; las demás muestran su botón "Editar" deshabilitado mientras eso ocurre.
- El toast reutiliza el patrón visual exacto ya existente en `src/app/screens/ConfiguracionLicencias/Screen.tsx` (tokens `bg-success-soft`/`border-success`/`text-success-soft-foreground` y `bg-error-soft`/`border-error`/`text-error-soft-foreground`, iconos `Check`/`AlertCircle` de `lucide-react`, autodesaparece a los 3000ms).
- No hay test suite automatizado en este frontend — verificación vía `npx tsc --noEmit` y un checklist manual.

---

### Task 1: Reescribir `Screen.tsx` con edición por sección

**Files:**
- Modify: `src/app/screens/Cv/Screen.tsx` (reescritura completa, 251 líneas actuales)

**Interfaces:**
- Consumes: `DatosPersonales`, `FormacionAcademica`, `ExperienciaLaboral`, `Idiomas`, `HabilidadesTecnicas`, `HabilidadesBlandas`, `CertificacionesCursos` (sin cambios en sus props — `data`, `updateData`, `isEditing`, y los props adicionales que ya tenían como `employeeId`/`position`/`academicFormation`/`skillStatus`/`selectedSkills`/`softSkillsCatalog`). `apiClient` no se usa para el guardado (se mantiene el `fetch` directo existente, igual que hoy) pero sigue usándose para `GET /configtest/soft` (catálogo de habilidades blandas, sin cambios).
- Produces: nada nuevo consumido por otros archivos — este es un componente de página (`export default function EmployeeCV`), no expone una API a otros módulos.

- [ ] **Step 1: Reemplazar el archivo completo**

Antes (`src/app/screens/Cv/Screen.tsx`, archivo completo, 251 líneas):
```tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Save } from 'lucide-react';
import { SectionTitle } from '@/app/util/UiCv';
import { apiClient } from '@/app/util/apiClient';
import DatosPersonales from '@/app/Componentes/CvComponente/DatosPersonales';
import FormacionAcademica from '@/app/Componentes/CvComponente/FormacionAcademica';
import ExperienciaLaboral from '@/app/Componentes/CvComponente/ExperienciaLaboral';
import Idiomas from '@/app/Componentes/CvComponente/Idiomas';
import HabilidadesTecnicas from '@/app/Componentes/CvComponente/HabilidadesTecnicas';
import HabilidadesBlandas from '@/app/Componentes/CvComponente/HabilidadesBlandas';
import CertificacionesCursos from '@/app/Componentes/CvComponente/CertificacionesCursos';
import { Employee } from "@/app/Interfas/Interfaces"
import { Button } from 'primereact/button';

interface EmployeeCVProps {
  employeeData: Employee | null;
  globalSettings?: Record<string, boolean>;
}

export default function EmployeeCV({ employeeData, globalSettings = {} }: EmployeeCVProps) {
  const router = useRouter();
  const [cvData, setCvData] = useState<Employee | null>(employeeData);
  const [originalCvData, setOriginalCvData] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [softSkillsCatalog, setSoftSkillsCatalog] = useState<{ id: number; nombre: string; descripcion: string }[]>([]);

  console.log(cvData)

  // Validar acceso: si no hay token O si se accede directamente por URL (sin employeeData),
  // redirigir a la pagina principal que maneja auth + carga de datos
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !employeeData) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
  }, [router, employeeData]);

  // Sincronizar employeeData cuando llega desde el componente padre
  useEffect(() => {
    if (employeeData) {
      setCvData(employeeData);
    }
  }, [employeeData]);

  // Cargar catálogo de habilidades blandas desde el backend
  useEffect(() => {
    const fetchSoftSkillsCatalog = async () => {
      try {
        const catalog = await apiClient.get<{ id: number; nombre: string; descripcion: string }[]>('/configtest/soft');
        setSoftSkillsCatalog(catalog);
      } catch (err) {
        console.error('Error al cargar catálogo de habilidades blandas:', err);
      }
    };
    fetchSoftSkillsCatalog();
  }, []);

  // Mientras se valida la autenticacion
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

  // Manejar el caso donde el empleado no se encuentra
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


  const handleEdit = () => {
    setOriginalCvData(JSON.parse(JSON.stringify(cvData)));
    setIsEditing(true);
  };
  const handleSave = async () => {
    // Enviar datos actualizados al backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/employee/${cvData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        setIsEditing(false);
        setOriginalCvData(null);
        // Opcional: mostrar mensaje de éxito
        console.log('Datos guardados exitosamente');
      } else {
        console.error('Error al guardar los datos');
        // Opcional: mostrar mensaje de error al usuario
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      // Opcional: mostrar mensaje de error al usuario
    }
  };

  const handleCancel = () => {
    if (originalCvData) {
      setCvData(originalCvData);
    }
    setIsEditing(false);
    setOriginalCvData(null);
  };

  const updateCvData = (newData: Partial<Employee>) => {
    setCvData(prev => prev ? ({ ...prev, ...newData }) : null);


  };

  return (
    <div className="bg-background font-sans min-h-screen">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <SectionTitle icon={FileText} title="Mis Datos" />
        </div>

        <div className="space-y-4">
          <DatosPersonales
            data={cvData}
            updateData={updateCvData}
            isEditing={isEditing}
          />

          {globalSettings["AcademicRecord"] !== false && (
            <FormacionAcademica
              data={cvData.AcademicFormation}
              updateData={(AcademicFormation) => updateCvData({ AcademicFormation })}
              isEditing={isEditing}
              employeeId={cvData.id}
            />
          )}

          {globalSettings["WorkExperience"] !== false && (
            <ExperienciaLaboral
              data={cvData.workExperience}
              updateData={(workExperience) => updateCvData({ workExperience })}
              isEditing={isEditing}
            />
          )}

          {globalSettings["Language"] !== false && (
            <Idiomas
              data={cvData.languages}
              updateData={(languages) => updateCvData({ languages })}
              isEditing={isEditing}
            />
          )}

          {globalSettings["TechnicalSkill"] !== false && (
            <HabilidadesTecnicas
              data={cvData.technicalSkills}
              skillStatus={cvData.skillStatus || []}
              position={cvData.position}
              academicFormation={cvData.AcademicFormation}
              updateData={(technicalSkills, skillStatus) => updateCvData({ technicalSkills, skillStatus })}
              isEditing={isEditing}
              employeeId={cvData.id}
            />
          )}

          {globalSettings["SoftSkill"] !== false && (
            <HabilidadesBlandas
              data={cvData.softSkills}
              selectedSkills={cvData.softSkillsArray || []}
              softSkillsCatalog={softSkillsCatalog}
              updateData={(softSkills, softSkillsArray) => updateCvData({ softSkills, softSkillsArray })}
              isEditing={isEditing}
            />
          )}

          {globalSettings["Certification"] !== false && (
            <CertificacionesCursos
              data={cvData.certifications}
              updateData={(certifications) => updateCvData({ certifications })}
              isEditing={isEditing}
            />
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                label="Cancelar"
                severity="info"
                text raised
              >

              </Button>
              <Button
                onClick={handleSave}
                label="Guardar Cambios"
                icon={<Save className="w-4 h-4 mr-1" />}
                raised
              >
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              label="Editar CV"
              icon={<Edit className="w-4 h-4 mr-1" />}
              severity="secondary"
              raised
            >
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
```

Después (`src/app/screens/Cv/Screen.tsx`, archivo completo):
```tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Save, Check, AlertCircle } from 'lucide-react';
import { SectionTitle } from '@/app/util/UiCv';
import { apiClient } from '@/app/util/apiClient';
import DatosPersonales from '@/app/Componentes/CvComponente/DatosPersonales';
import FormacionAcademica from '@/app/Componentes/CvComponente/FormacionAcademica';
import ExperienciaLaboral from '@/app/Componentes/CvComponente/ExperienciaLaboral';
import Idiomas from '@/app/Componentes/CvComponente/Idiomas';
import HabilidadesTecnicas from '@/app/Componentes/CvComponente/HabilidadesTecnicas';
import HabilidadesBlandas from '@/app/Componentes/CvComponente/HabilidadesBlandas';
import CertificacionesCursos from '@/app/Componentes/CvComponente/CertificacionesCursos';
import { Employee } from "@/app/Interfas/Interfaces"
import { Button } from 'primereact/button';

interface EmployeeCVProps {
  employeeData: Employee | null;
  globalSettings?: Record<string, boolean>;
}

type SectionKey =
  | 'datosPersonales'
  | 'academicFormation'
  | 'workExperience'
  | 'languages'
  | 'technicalSkills'
  | 'softSkills'
  | 'certifications';

const sectionLabels: Record<SectionKey, string> = {
  datosPersonales: 'Datos Personales',
  academicFormation: 'Formación Académica',
  workExperience: 'Experiencia Laboral',
  languages: 'Idiomas',
  technicalSkills: 'Habilidades Técnicas',
  softSkills: 'Habilidades Blandas',
  certifications: 'Certificaciones',
};

interface SectionToolbarProps {
  sectionKey: SectionKey;
  editingSection: SectionKey | null;
  isSaving: boolean;
  onEdit: (section: SectionKey) => void;
  onSave: () => void;
  onCancel: () => void;
}

function SectionToolbar({ sectionKey, editingSection, isSaving, onEdit, onSave, onCancel }: SectionToolbarProps) {
  const isActive = editingSection === sectionKey;
  const isLocked = editingSection !== null && !isActive;

  return (
    <div className="flex justify-end mb-2">
      {isActive ? (
        <div className="flex gap-2">
          <Button onClick={onCancel} label="Cancelar" severity="info" text raised disabled={isSaving} />
          <Button
            onClick={onSave}
            label={isSaving ? "Guardando..." : "Guardar"}
            icon={<Save className="w-4 h-4 mr-1" />}
            raised
            disabled={isSaving}
          />
        </div>
      ) : (
        <Button
          onClick={() => onEdit(sectionKey)}
          label="Editar"
          icon={<Edit className="w-4 h-4 mr-1" />}
          severity="secondary"
          text
          disabled={isLocked}
        />
      )}
    </div>
  );
}

export default function EmployeeCV({ employeeData, globalSettings = {} }: EmployeeCVProps) {
  const router = useRouter();
  const [cvData, setCvData] = useState<Employee | null>(employeeData);
  const [originalCvData, setOriginalCvData] = useState<Employee | null>(null);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [softSkillsCatalog, setSoftSkillsCatalog] = useState<{ id: number; nombre: string; descripcion: string }[]>([]);

  console.log(cvData)

  // Validar acceso: si no hay token O si se accede directamente por URL (sin employeeData),
  // redirigir a la pagina principal que maneja auth + carga de datos
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !employeeData) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
  }, [router, employeeData]);

  // Sincronizar employeeData cuando llega desde el componente padre
  useEffect(() => {
    if (employeeData) {
      setCvData(employeeData);
    }
  }, [employeeData]);

  // Cargar catálogo de habilidades blandas desde el backend
  useEffect(() => {
    const fetchSoftSkillsCatalog = async () => {
      try {
        const catalog = await apiClient.get<{ id: number; nombre: string; descripcion: string }[]>('/configtest/soft');
        setSoftSkillsCatalog(catalog);
      } catch (err) {
        console.error('Error al cargar catálogo de habilidades blandas:', err);
      }
    };
    fetchSoftSkillsCatalog();
  }, []);

  // Mientras se valida la autenticacion
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

  // Manejar el caso donde el empleado no se encuentra
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditSection = (section: SectionKey) => {
    setOriginalCvData(JSON.parse(JSON.stringify(cvData)));
    setEditingSection(section);
  };

  const handleSaveSection = async () => {
    if (!cvData || !editingSection) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/employee/${cvData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        showToast(`${sectionLabels[editingSection]} actualizada`, 'success');
        setEditingSection(null);
        setOriginalCvData(null);
      } else {
        showToast('Error al guardar los datos', 'error');
      }
    } catch (error) {
      showToast('Error en la petición al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSection = () => {
    if (originalCvData) {
      setCvData(originalCvData);
    }
    setEditingSection(null);
    setOriginalCvData(null);
  };

  const updateCvData = (newData: Partial<Employee>) => {
    setCvData(prev => prev ? ({ ...prev, ...newData }) : null);
  };

  return (
    <div className="bg-background font-sans min-h-screen">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-success-soft border-success text-success-soft-foreground' : 'bg-error-soft border-error text-error-soft-foreground'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <SectionTitle icon={FileText} title="Mis Datos" />
        </div>

        <div className="space-y-4">
          <SectionToolbar
            sectionKey="datosPersonales"
            editingSection={editingSection}
            isSaving={isSaving}
            onEdit={handleEditSection}
            onSave={handleSaveSection}
            onCancel={handleCancelSection}
          />
          <DatosPersonales
            data={cvData}
            updateData={updateCvData}
            isEditing={editingSection === 'datosPersonales'}
          />

          {globalSettings["AcademicRecord"] !== false && (
            <>
              <SectionToolbar
                sectionKey="academicFormation"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <FormacionAcademica
                data={cvData.AcademicFormation}
                updateData={(AcademicFormation) => updateCvData({ AcademicFormation })}
                isEditing={editingSection === 'academicFormation'}
                employeeId={cvData.id}
              />
            </>
          )}

          {globalSettings["WorkExperience"] !== false && (
            <>
              <SectionToolbar
                sectionKey="workExperience"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <ExperienciaLaboral
                data={cvData.workExperience}
                updateData={(workExperience) => updateCvData({ workExperience })}
                isEditing={editingSection === 'workExperience'}
              />
            </>
          )}

          {globalSettings["Language"] !== false && (
            <>
              <SectionToolbar
                sectionKey="languages"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <Idiomas
                data={cvData.languages}
                updateData={(languages) => updateCvData({ languages })}
                isEditing={editingSection === 'languages'}
              />
            </>
          )}

          {globalSettings["TechnicalSkill"] !== false && (
            <>
              <SectionToolbar
                sectionKey="technicalSkills"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <HabilidadesTecnicas
                data={cvData.technicalSkills}
                skillStatus={cvData.skillStatus || []}
                position={cvData.position}
                academicFormation={cvData.AcademicFormation}
                updateData={(technicalSkills, skillStatus) => updateCvData({ technicalSkills, skillStatus })}
                isEditing={editingSection === 'technicalSkills'}
                employeeId={cvData.id}
              />
            </>
          )}

          {globalSettings["SoftSkill"] !== false && (
            <>
              <SectionToolbar
                sectionKey="softSkills"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <HabilidadesBlandas
                data={cvData.softSkills}
                selectedSkills={cvData.softSkillsArray || []}
                softSkillsCatalog={softSkillsCatalog}
                updateData={(softSkills, softSkillsArray) => updateCvData({ softSkills, softSkillsArray })}
                isEditing={editingSection === 'softSkills'}
              />
            </>
          )}

          {globalSettings["Certification"] !== false && (
            <>
              <SectionToolbar
                sectionKey="certifications"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onCancel={handleCancelSection}
              />
              <CertificacionesCursos
                data={cvData.certifications}
                updateData={(certifications) => updateCvData({ certifications })}
                isEditing={editingSection === 'certifications'}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd RRHH && npx tsc --noEmit 2>&1 | grep -E "screens/Cv/Screen"`
Expected: ningún resultado (sin errores nuevos introducidos en este archivo). El resto del output de `tsc` tendrá errores preexistentes no relacionados en otros archivos — no son parte de esta verificación.

- [ ] **Step 3: Commit**

```bash
git add src/app/screens/Cv/Screen.tsx
git commit -m "feat: reemplazar edicion global del CV por edicion por seccion con feedback de guardado"
```

---

### Task 2: Verificación manual end-to-end

**Files:** ninguno (solo verificación, no produce commits de código).

**Interfaces:**
- Consumes: el flujo completo de la Task 1.
- Produces: confirmación de que el comportamiento documentado en la spec se cumple.

- [ ] **Step 1: Levantar ambos servidores**

Backend: `uvicorn app.main:app --reload` (desde `Backend_RRHH`)
Frontend: `npm run dev` (desde `RRHH`)

- [ ] **Step 2: Confirmar bloqueo entre secciones**

Como cualquier empleado, abrir el CV. Tocar "Editar" en "Datos Personales". Confirmar que los botones "Editar" de las otras 6 secciones aparecen deshabilitados mientras esa sección sigue en edición.

- [ ] **Step 3: Confirmar guardado por sección y toast de éxito**

Modificar un campo de "Datos Personales" (ej. teléfono) y tocar "Guardar". Confirmar que aparece el toast verde de éxito ("Datos Personales actualizada"), que el botón vuelve a "Editar", y que recargando la página el cambio persiste. Confirmar que las otras 6 secciones no muestran ningún dato distinto al que tenían antes.

- [ ] **Step 4: Confirmar cancelar**

Tocar "Editar" en "Idiomas", modificar algo sin guardar, tocar "Cancelar". Confirmar que el cambio no guardado desaparece y la sección vuelve a modo lectura, y que el botón "Editar" de las demás secciones vuelve a estar habilitado.

- [ ] **Step 5: Confirmar toast de error**

Apagar el backend (o cortar la red), tocar "Editar" en cualquier sección, modificar algo, tocar "Guardar". Confirmar que aparece el toast rojo de error y que la sección permanece en modo edición (el cambio del usuario no se pierde). Volver a levantar el backend y reintentar Guardar — debe funcionar.

- [ ] **Step 6: Confirmar que el footer global "Editar CV" ya no existe**

Revisar visualmente que no queda ningún botón global de edición/guardado al pie de la página — todo el control de edición está ahora dentro de cada sección.
