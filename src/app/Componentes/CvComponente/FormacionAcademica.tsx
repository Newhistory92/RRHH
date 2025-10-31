import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import { AcademicFormation } from "@/app/Interfas/Interfaces"

export interface CvFormacionProps {
  data: AcademicFormation[];
  updateData: (updates: AcademicFormation[]) => void;
  isEditing: boolean;
}

export default function FormacionAcademica({ data, updateData, isEditing }: CvFormacionProps) {

  const handleChange = (id: string | number, field: string, value: string | number | boolean | File | null) => {
    const newData = data.map((item) => {
      if (item.id === id) {
        // Convertir fechas de string a Date cuando sea necesario
        if ((field === 'startDate' || field === 'endDate') && typeof value === 'string' && value) {
          return { ...item, [field]: new Date(value) };
        }
        // Si se marca isCurrent, limpiar endDate
        if (field === 'isCurrent' && value === true) {
          return { ...item, isCurrent: true, endDate: null };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    updateData(newData);
  };

 const handleRemove = async (id: string | number) => {
  try {
    // 1️⃣ Confirmar (opcional)
    if (!confirm("¿Seguro que deseas eliminar esta formación académica?")) return;

    // 2️⃣ Llamar al backend
    const res = await fetch(`http://127.0.0.1:8000/employee/Academic/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("No se pudo eliminar el registro en el servidor.");
    }

    // 3️⃣ Actualizar el estado local
    const newData = data.filter((item) => item.id !== id);
    updateData(newData);

    console.log(`Formación académica con id ${id} eliminada exitosamente.`);
  } catch (error) {
    console.error("Error eliminando formación académica:", error);
    alert("Ocurrió un error al eliminar el registro.");
  }
};

  const handleAdd = () => {
    const newItem: Omit<AcademicFormation, 'id'> & { id?: number } = {
      title: "",
      institution: "",
      level: "Universitario",
      status: "En curso",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startDate: null as any, 
      endDate: null,
      isCurrent: false,
      attachment: null,
    };
    const safeData = Array.isArray(data) ? data : [];
    updateData([...safeData, newItem as AcademicFormation]);
  };

  // Convertir fechas DateTime a string para el render
  const formatDataForRender = (items: AcademicFormation[]) => {
    return items.map(item => ({
      ...item,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
    }));
  };

  // Asegurar que data siempre sea un array y formatear para render
  const safeData = Array.isArray(data) ? formatDataForRender(data) : [];

  return (
    <Accordion activeIndex={0}>
      <AccordionTab header="2. Formación Académica">
        <DynamicSection
          sectionName="AcademicFormation"
          items={safeData}
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
            { name: "startDate", label: "Fecha de Inicio", type: "date", required: true },
            { 
              name: "endDate", 
              label: "Fecha de Fin (opcional si está cursando)", 
              type: "date"
            },
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