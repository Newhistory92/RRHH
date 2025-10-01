import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import {  AcademicFormation} from "@/app/Interfas/Interfaces"

export interface CvFormacionProps {
  data: AcademicFormation[];
  updateData: (updates:  AcademicFormation[]) => void;
  isEditing: boolean;
}


export default function FormacionAcademica({ data, updateData, isEditing }: CvFormacionProps) {

   const handleChange = (id:string | number,field: string, value: string | number | boolean | File | null) => {
    const newData = data.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateData(newData);
  };

  const handleRemove = (id:string | number) => {
    const newData = data.filter((item) => item.id !== id);
    updateData(newData);
  };

  const handleAdd = () => {
    const newItem: AcademicFormation= {
      id: Date.now(),
      title: "",
      institution: "",
      level: "Universitario",
      status: "En curso",
      startDate: "",
      endDate: "",
      isCurrent: false,
       attachment: null, 
    };
    updateData([...data, newItem]);
  };

  
  return (
     <Accordion activeIndex={0}>
     <AccordionTab header="2. Formación Académica">

      <DynamicSection
        sectionName="academicFormation"
        items={data}
        onChange={handleChange}
        onRemove={handleRemove}
        onAdd={handleAdd}
        fields={[
          {
            name: "title",
            label: "Título Obtenido",
            type: "text",
            required: true,
            grid: "md:col-span-2",
          },
          {
            name: "institution",
            label: "Institución Educativa",
            type: "text",
            required: true,
            grid: "md:col-span-2",
          },
          {
            name: "level",
            label: "Nivel",
            type: "select",
            options: [
              { value: "Secundario", label: "Secundario" },
              { value: "Terciario", label: "Terciario" },
              { value: "Universitario", label: "Universitario" },
              { value: "Posgrado", label: "Posgrado" },
            ],
          },
          {
            name: "status",
            label: "Estado",
            type: "select",
            options: [
              { value: "En curso", label: "En curso" },
              { value: "Completo", label: "Completo" },
              { value: "Incompleto", label: "Incompleto" },
            ],
          },
          { name: "startDate", label: "Fecha de Inicio", type: "date" },
          { name: "endDate", label: "Fecha de Fin", type: "date" },
          { name: "isCurrent", label: "Actualmente", type: "checkbox" },
          {
            name: "attachment",
            label: "Adjuntar Diploma (PDF)",
            type: "file",
            accept: ".pdf",
          },
        ]}
        isEditing={isEditing}
      />
   </AccordionTab>
       </Accordion>
  );
}