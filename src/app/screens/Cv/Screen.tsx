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