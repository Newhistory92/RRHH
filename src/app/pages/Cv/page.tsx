"use client";

import React, { useState } from 'react';
import { FileText, Edit, Save } from 'lucide-react';
import { SectionTitle } from '@/app/util/UiCv';
import { EMPLOYEES_DATA , SOFT_SKILLS_CATALOG} from '@/app/api/prueba2';
import DatosPersonales from '@/app/Componentes/CvComponente/DatosPersonales';
import FormacionAcademica from '@/app/Componentes/CvComponente/FormacionAcademica';
import ExperienciaLaboral from '@/app/Componentes/CvComponente/ExperienciaLaboral';
import Idiomas from '@/app/Componentes/CvComponente/Idiomas';
import HabilidadesTecnicas from '@/app/Componentes/CvComponente/HabilidadesTecnicas';
import HabilidadesBlandas from '@/app/Componentes/CvComponente/HabilidadesBlandas';
import CertificacionesCursos from '@/app/Componentes/CvComponente/CertificacionesCursos';
import {Employee} from "@/app/Interfas/Interfaces"
import { Button } from 'primereact/button';

interface EmployeeCVProps {
  employeeData: Employee | null;
}

export default function EmployeeCV({ employeeData }: EmployeeCVProps) {
  const [cvData, setCvData] = useState<Employee | null>(employeeData);
  const [originalCvData, setOriginalCvData] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);

console.log(cvData)

  // Manejar el caso donde el empleado no se encuentra
 if (!cvData) {
    return (
      <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {employeeData === null ? (
            <>
              <div className="flex justify-center mb-4">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
              </div>
              <p className="text-gray-700 text-center">Cargando información del empleado...</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-700">No se pudo encontrar la información del empleado.</p>
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
    <div className="bg-gray-100 font-sans min-h-screen">
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
          
          <FormacionAcademica 
            data={cvData.academicFormation} 
            updateData={(academicFormation) => updateCvData({ academicFormation })} 
            isEditing={isEditing} 
          />
          
          <ExperienciaLaboral 
            data={cvData.workExperience} 
            updateData={(workExperience) => updateCvData({ workExperience })} 
            isEditing={isEditing} 
          />
          
          <Idiomas 
            data={cvData.languages} 
            updateData={(languages) => updateCvData({ languages })} 
            isEditing={isEditing} 
          />
          
          <HabilidadesTecnicas 
            data={cvData.technicalSkills} 
            skillStatus={cvData.skillStatus || []}
            position={cvData.position}
            updateData={(technicalSkills, skillStatus) => updateCvData({ technicalSkills, skillStatus })} 
            isEditing={isEditing} 
          />
          
          <HabilidadesBlandas 
            data={cvData.softSkills} 
            selectedSkills={cvData.softSkillsArray || []}
            updateData={(softSkills, softSkillsArray) => updateCvData({ softSkills, softSkillsArray })} 
            isEditing={isEditing} 
          />
          
          <CertificacionesCursos 
            data={cvData.certifications} 
            updateData={(certifications) => updateCvData({ certifications })} 
            isEditing={isEditing} 
          />
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