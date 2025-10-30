import React from 'react';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import { WorkExperience} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface CvFormacionProps {
  data: WorkExperience[];
  updateData: (updates: WorkExperience[]) => void;
  isEditing: boolean;
}

export default function ExperienciaLaboral({ data, updateData, isEditing }: CvFormacionProps) {
  
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
    const newItem: WorkExperience = {
      id: Date.now(),
      position: "",
      company: "",
      industry: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      contractType: "Tiempo completo",
    };
    updateData([...data, newItem]);
  };

  return (
   
<Accordion activeIndex={0}>
<AccordionTab header="3. Experiencia Laboral">
      <DynamicSection
        sectionName="workExperience"
        items={data}
        onChange={handleChange}
        onRemove={handleRemove}
        onAdd={handleAdd}
        fields={[
          {
            name: "position",
            label: "Puesto",
            type: "text",
            required: true,
            grid: "md:col-span-1",
          },
          {
            name: "company",
            label: "Empresa",
            type: "text",
            required: true,
            grid: "md:col-span-1",
          },
          {
            name: "industry",
            label: "Industria",
            type: "text",
            required: true,
          },
          {
            name: "location",
            label: "Ubicación",
            type: "text",
            required: true,
          },
          { name: "startDate", label: "Fecha de Inicio", type: "date" },
          { name: "endDate", label: "Fecha de Fin", type: "date" },
          { name: "isCurrent", label: "Actualmente", type: "checkbox" },
          {
            name: "contractType",
            label: "Tipo de Contrato",
            type: "select",
            options: [
              { value: "Tiempo completo", label: "Tiempo completo" },
              { value: "Medio tiempo", label: "Medio tiempo" },
              { value: "Freelance", label: "Freelance" },
            ],
          },
        ]}
        isEditing={isEditing}
      />
      </AccordionTab>
    </Accordion>
  );
}
