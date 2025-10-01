import React from 'react';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import {certifications} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface CvFormacionProps {
  data: certifications[];
  updateData: (updates: certifications[]) => void;
  isEditing: boolean;
}

export default function CertificacionesCursos({ data, updateData, isEditing }: CvFormacionProps) {
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
    const newItem: certifications= {
      id: Date.now(),
      name: "",
      institution: "",
      date: "",
      attachment: null,
      validUntil: "",
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
            name: " institution",
            label: "Institución Emisora",
            type: "text",
            required: true,
            grid: "md:col-span-2",
          },
          {
            name: "date",
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