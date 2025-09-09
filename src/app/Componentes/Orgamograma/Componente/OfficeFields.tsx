import React from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { useEmployeeTemplates } from './EmployeeTemplates';
import { FormFieldProps } from '@/app/Interfas/Interfaces';

export const OfficeFields: React.FC<FormFieldProps> = ({
  formData,
  setFormData,
  employees
}) => {
  const { 
    employeeOptionTemplate, 
    selectedEmployeeTemplate, 
    employeeMultiSelectTemplate 
  } = useEmployeeTemplates({ employees });

  const employeeOptions = employees.map(emp => ({
    name: emp.name,
    id: emp.id,
    photo: emp.photo,
    label: emp.name,
    value: emp.id
  }));

  const getSelectedEmployees = () => {
    if (!formData.empleadosIds) return [];
    return employees.filter(emp => formData.empleadosIds?.includes(emp.id));
  };

  return (
    <>
      {/* Jefe de Oficina */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jefe de Oficina
        </label>
        <Dropdown
          value={formData.jefeId}
          onChange={(e: DropdownChangeEvent) => {
            console.log('Jefe de oficina cambiado:', e.value);
            setFormData(prev => ({ ...prev, jefeId: e.value }));
          }}
          options={employeeOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar jefe de oficina"
          itemTemplate={employeeOptionTemplate}
          valueTemplate={selectedEmployeeTemplate}
          className="w-full"
          showClear
          filter
          filterBy="label"
        />
      </div>

      {/* Empleados Asignados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Empleados Asignados
        </label>
        <MultiSelect
          value={formData.empleadosIds || []}
          onChange={(e: MultiSelectChangeEvent) => {
            console.log('Empleados oficina seleccionados:', e.value);
            setFormData(prev => ({ 
              ...prev, 
              empleadosIds: e.value
            }));
          }}
          options={employeeOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar empleados"
          itemTemplate={employeeMultiSelectTemplate}
          className="w-full"
          filter
          filterBy="label"
          maxSelectedLabels={3}
          selectedItemsLabel="{0} empleados seleccionados"
        />
        
        {/* Avatares de empleados seleccionados */}
        {formData.empleadosIds && formData.empleadosIds.length > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleados Seleccionados:
            </label>
            <AvatarGroup>
              {getSelectedEmployees().map((emp) => (
                <Avatar
                  key={emp.id}
                  image={emp.photo}
                  label={emp.name.charAt(0)}
                  size="normal"
                  shape="circle"
                  title={emp.name}
                />
              ))}
            </AvatarGroup>
          </div>
        )}
      </div>
    </>
  );
};