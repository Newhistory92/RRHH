import React from 'react';
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProfilePictureUploader } from '@/app/util/UiRRHH';
import {Employee} from "@/app/Interfas/Interfaces"

export interface CvProps {
  data: Employee;
  updateData: (updates: Partial<Employee>) => void;
  isEditing: boolean;
}
interface GenderOption {
  value: string;
  label: string;
}

// Opciones para el dropdown de género
const genderOptions: GenderOption[] = [
  { value: "Femenino", label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Otro", label: "Otro" },
];

export default function DatosPersonales({ data, updateData, isEditing }: CvProps) {

  
  const handleChange = (field: keyof Employee, value: Employee[keyof Employee]) => {
    updateData({ [field]: value } as Partial<Employee>);
  };

  const handleDropdownChange = (e: { value: string }) => {
    handleChange("gender", e.value);
  };


   const parseBirthDate = (birthDate?: string | Date | null): Date | null => {
    if (!birthDate) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const date = new Date(birthDate as any);
    return isNaN(date.getTime()) ? null : date;
  };

  // Formatear fecha para mostrar como string en modo disabled
  const formatBirthDateForDisplay = (): string => {
    if (!data.birthDate) return '';
    const date = new Date(data.birthDate);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateChange = (e: any) => {
    const value: Date | null = e?.value ?? null;
    handleChange("birthDate", value);
  };

  return (
    <Accordion activeIndex={0}>
      <AccordionTab header="1. Datos Personales">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 flex justify-center">
            <ProfilePictureUploader
              photo={data.photo}
              setPhoto={(photo: string | File | null) => handleChange("photo", photo as string)}
              isEditing={isEditing}
            />
          </div>

          {/* Nombre Completo */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <InputText
              id="name"
              value={data.name || ''}
              disabled
              className="w-full"
            />
          </div>

          {/* DNI */}
          <div className="flex flex-col gap-2">
            <label htmlFor="dni" className="text-sm font-medium text-gray-700">
              DNI
            </label>
            <InputText
              id="dni"
              value={data.dni || ''}
              disabled
              className="w-full"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div className="flex flex-col gap-2">
            <label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
              Fecha de Nacimiento
            </label>
            {isEditing ? (
              <Calendar
                id="birthDate"
                value={parseBirthDate(data.birthDate)}
                onChange={handleDateChange}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
                placeholder="Seleccione fecha"
              />
            ) : (
              <InputText
                id="birthDate"
                value={formatBirthDateForDisplay()}
                disabled
                className="w-full"
              />
            )}
          </div>
          {/* Género */}
          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Género (opcional)
            </label>
            <Dropdown
              id="gender"
              value={data.gender || ''}
              options={genderOptions}
              onChange={handleDropdownChange}
              placeholder="Seleccione género"
              disabled={!isEditing}
              className="w-full"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700">
              Dirección
            </label>
            <InputText
              id="address"
              value={data.address || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleChange("address", e.target.value)
              }
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          
          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <InputText
              id="phone"
              type="tel"
              value={data.phone || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleChange("phone", e.target.value)
              }
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
              <InputText
              id="email"
              type="email"
              value={data.email || ''}
              disabled
              className="w-full"
            />
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  );
}