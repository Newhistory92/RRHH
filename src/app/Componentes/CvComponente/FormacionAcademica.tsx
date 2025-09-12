import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import {CvProps, Employee} from "@/app/Interfas/Interfaces"




export default function FormacionAcademica({ data, updateData, isEditing }: CvProps) {

   const handleChange = (id:number,field: keyof Employee, value: string) => {
    const newData = data.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateData(newData);
  };

  const handleRemove = (id) => {
    const newData = data.filter((item) => item.id !== id);
    updateData(newData);
  };

  const handleAdd = () => {
    const newItem = {
      id: Date.now(),
      title: "",
      institution: "",
      level: "Universitario",
      status: "En curso",
      startDate: "",
      endDate: "",
      isCurrent: false,
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