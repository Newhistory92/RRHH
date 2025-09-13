import React from 'react';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import { Accordion, AccordionTab } from 'primereact/accordion';
import {Employee,CvProps} from "@/app/Interfas/Interfaces"

export default function Idiomas({ data, updateData, isEditing }: CvProps) {
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
      language: "",
      level: "Básico",
      certification: "",
    };
    updateData([...data, newItem]);
  };

  return (

    <Accordion activeIndex={0}>
    <AccordionTab header="4. Idiomas">
      <DynamicSection
        sectionName="languages"
        items={data}
        onChange={handleChange}
        onRemove={handleRemove}
        onAdd={handleAdd}
        fields={[
          {
            name: "language",
            label: "Idioma",
            type: "text",
            required: true,
          },
          {
            name: "level",
            label: "Nivel",
            type: "select",
            options: [
              { value: "Básico", label: "Básico" },
              { value: "Intermedio", label: "Intermedio" },
              { value: "Avanzado", label: "Avanzado" },
              { value: "Nativo", label: "Nativo" },
            ],
          },
          {
            name: "certification",
            label: "Certificación (Opcional)",
            type: "text",
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
