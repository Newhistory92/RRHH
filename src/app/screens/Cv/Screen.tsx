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
