import React from 'react';
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProfilePictureUploader } from '@/app/util/UiRRHH';
import {Employee} from "@/app/Interfas/Interfaces"

// Fuera de edicion, un input/select/calendario deshabilitado arrastra el
// mismo borde y fondo apagado de un control que ya no se puede tocar, solo
// para mostrar un dato de lectura -- de ahi la "pared de cajas grises" que
// hacia tedioso el CV. Mismo criterio que DynamicSectionCv.tsx.
const ReadValue = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-foreground py-2 min-h-[2.5rem] flex items-center">{children}</p>
);

export interface CvProps {
  data: Employee;
  updateData: (updates: Partial<Employee>) => void;
  isEditing: boolean;
  headerActions?: React.ReactNode;
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

export default function DatosPersonales({ data, updateData, isEditing, headerActions }: CvProps) {

  
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
      <AccordionTab header={
        <div className="flex items-center justify-between w-full pr-2">
          <span>1. Datos Personales</span>
          {headerActions && <span onClick={(e) => e.stopPropagation()}>{headerActions}</span>}
        </div>
      }>
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
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nombre Completo
            </label>
            {isEditing ? (
              <InputText id="name" value={data.name || ''} className="w-full" />
            ) : (
              <ReadValue>{data.name || '—'}</ReadValue>
            )}
          </div>

          {/* DNI */}
          <div className="flex flex-col gap-2">
            <label htmlFor="dni" className="text-sm font-medium text-foreground">
              DNI
            </label>
            {isEditing ? (
              <InputText id="dni" value={data.dni || ''} className="w-full" />
            ) : (
              <ReadValue>{data.dni || '—'}</ReadValue>
            )}
          </div>

          {/* Fecha de Nacimiento */}
          <div className="flex flex-col gap-2">
            <label htmlFor="birthDate" className="text-sm font-medium text-foreground">
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
              <ReadValue>{formatBirthDateForDisplay() || '—'}</ReadValue>
            )}
          </div>
          {/* Género */}
          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm font-medium text-foreground">
              Género (opcional)
            </label>
            {isEditing ? (
              <Dropdown
                id="gender"
                value={data.gender || ''}
                options={genderOptions}
                onChange={handleDropdownChange}
                placeholder="Seleccione género"
                className="w-full"
                optionLabel="label"
                optionValue="value"
              />
            ) : (
              <ReadValue>{data.gender || '—'}</ReadValue>
            )}
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-medium text-foreground">
              Dirección
            </label>
            {isEditing ? (
              <InputText
                id="address"
                value={data.address || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("address", e.target.value)
                }
                className="w-full"
              />
            ) : (
              <ReadValue>{data.address || '—'}</ReadValue>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Teléfono
            </label>
            {isEditing ? (
              <InputText
                id="phone"
                type="tel"
                value={data.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("phone", e.target.value)
                }
                className="w-full"
              />
            ) : (
              <ReadValue>{data.phone || '—'}</ReadValue>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            {isEditing ? (
              <InputText id="email" type="email" value={data.email || ''} className="w-full" />
            ) : (
              <ReadValue>{data.email || '—'}</ReadValue>
            )}
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  );
}