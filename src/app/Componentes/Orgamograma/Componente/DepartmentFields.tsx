import React from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { useEmployeeTemplates } from './EmployeeTemplates';
import { FormFieldProps } from '@/app/Interfas/Interfaces';
import { departmentApi } from '@/app/Componentes/Orgamograma/departmentApi';

export const DepartmentFields: React.FC<FormFieldProps> = ({
  formData,
  setFormData,
  departments,
  employees
}) => {
  const { employeeMultiSelectTemplate } = useEmployeeTemplates({ employees });

  const departmentOptions = departments
    .filter((d) => d.id !== formData.id)
    .map((d) => ({ label: d.nombre, value: d.id }));
console.log(employees)
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
      {/* Nivel Jerárquico */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nivel Jerárquico
        </label>
        <InputNumber 
          value={formData.nivel_jerarquico} 
          onValueChange={(e: InputNumberValueChangeEvent) => 
            setFormData(prev => ({ ...prev, nivel_jerarquico: e.value || 1 }))
          }
          mode="decimal" 
          showButtons 
          min={1} 
          max={5} 
          className="w-full"
        />
      </div>

      {/* Capacidad Requerida */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Capacidad requerida (personas) *
        </label>
        <InputNumber
          value={formData.capacidadRequerida ?? null}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setFormData(prev => ({ ...prev, capacidadRequerida: e.value ?? null }))
          }
          mode="decimal"
          showButtons
          min={0}
          className="w-full"
          placeholder="Ej: 20"
        />
      </div>

      {/* Departamento Padre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Depende de (Dpto. Padre)
        </label>
        <Dropdown
          value={formData.parentId}
          onChange={(e: DropdownChangeEvent) => {
            console.log('Parent ID cambiado:', e.value);
            setFormData(prev => ({ ...prev, parentId: e.value }));
          }}
          options={departmentOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Ninguno (Nivel Principal)"
          className="w-full"
          showClear
        />
      </div>

      {/* Jefe de Área */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Jefe de Área
        </label>
        <Dropdown
          value={formData.jefeId}
          onChange={(e: DropdownChangeEvent) => {
            console.log('Jefe seleccionado:', e.value);
            setFormData(prev => ({ ...prev, jefeId: e.value }));
          }}
          options={employees}
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccionar jefe de área"
          className="w-full"
          showClear
          filter
          filterBy="name"
        />
      </div>

      {/* Empleados Asignados */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Empleados del Departamento
        </label>
        <MultiSelect
          value={formData.empleadosIds || []}
          onChange={(e: MultiSelectChangeEvent) => {
            console.log('Empleados seleccionados:', e.value);
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
          maxSelectedLabels={1}
          selectedItemsLabel="{0} empleados seleccionados"
          display="comma"
        />
        
        {/* Avatares de empleados seleccionados */}
        {formData.empleadosIds && formData.empleadosIds.length > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-foreground mb-2">
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

      {formData.id != null && (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.scoreExento ?? false}
              onChange={async (e) => {
                const val = e.target.checked;
                setFormData(prev => ({ ...prev, scoreExento: val }));
                await departmentApi.setDeptScoreExento(formData.id!, val);
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">
              Exento del score de productividad
            </span>
          </label>
          <p className="mt-1 text-xs text-muted-foreground ml-7">
            El trabajo de esta área no queda registrado en los accesos al sistema.
            Sus empleados reciben el promedio general en lugar de un score medido,
            ordenados entre sí por asistencia.
          </p>
        </div>
      )}
    </>
  );
};