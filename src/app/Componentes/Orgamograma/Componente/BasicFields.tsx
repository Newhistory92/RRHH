import React from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";
import { FormFieldProps } from '@/app/Interfas/Interfaces';


export const BasicFields: React.FC<FormFieldProps> = ({
  formData,
  setFormData,
  departments
}) => {
  const departmentOptions = departments
    .filter((d) => d.id !== formData.id)
    .map((d) => ({ label: d.nombre, value: d.id }));

  return (
    <>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre
        </label>
        <Dropdown
          value={formData.nombre}
          onChange={(e: DropdownChangeEvent) => {
            console.log('Nombre cambiado:', e.value);
            setFormData(prev => ({ ...prev, nombre: e.value }));
          }}
          options={departmentOptions}
          optionLabel="label"
          optionValue="label"
          editable
          placeholder="Seleccionar o escribir nombre"
          className="w-full mb-8"
          required
        />
      </div>

      {/* Descripción */}
      <FloatLabel>
        <InputTextarea 
          id="descripcion" 
          autoResize 
          value={formData.descripcion} 
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))} 
          rows={3} 
          className="w-full"
        />
        <label htmlFor="descripcion">Descripción</label>
      </FloatLabel>
    </>
  );
};
