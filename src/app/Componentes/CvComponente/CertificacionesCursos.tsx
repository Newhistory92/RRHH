import React from 'react';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import {Employee,CvProps} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';
export default function CertificacionesCursos({ data, updateData, isEditing }: CvProps) {
    const handleChange = (id: number, field: keyof Employee, value: string) => {
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
      name: "",
      issuingBody: "",
      issueDate: "",
    };
    updateData([...data, newItem]);
  };

  return (
    
     <Accordion activeIndex={0}>
     <AccordionTab header="7. Certificaciones y Cursos">
      <DynamicSection
        sectionName="certifications"
        items={data}
        onChange={handleChange}
        onRemove={handleRemove}
        onAdd={handleAdd}
        fields={[
          {
            name: "name",
            label: "Nombre del Curso/Certificación",
            type: "text",
            required: true,
            grid: "md:col-span-2",
          },
          {
            name: "issuingBody",
            label: "Institución Emisora",
            type: "text",
            required: true,
            grid: "md:col-span-2",
          },
          {
            name: "issueDate",
            label: "Fecha de Obtención",
            type: "date",
          },
          {
            name: "attachment",
            label: "Adjuntar Certificado (PDF/JPG)",
            type: "file",
            accept: ".pdf, .jpg, .jpeg",
          },
        ]}
        isEditing={isEditing}
      />
      </AccordionTab>
    </Accordion>
  );
}