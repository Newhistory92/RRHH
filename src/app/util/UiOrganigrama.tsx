import { X, Plus } from 'lucide-react';
import React, { FormEvent, useState } from "react";
import { ModalConfig, Department, Employee, EntityFormData, Office, TechnicalSkill } from '@/app/Interfas/Interfaces';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { AVAILABLE_SKILLS } from "@/app/api/prueba2";

        
interface EntityFormModalProps {
  config: ModalConfig;
  onClose: () => void;
  onSave: (formData: EntityFormData) => void;
  departments: Department[];
  employees: Employee[];
}

export const EntityFormModal = ({ 
  config, 
  onClose, 
  onSave, 
  departments, 
  employees 
}: EntityFormModalProps) => {
  const { type, data } = config;
  

  interface DropdownOption {
  value: number;
  label: string;
  name: string;
  photo?: string;
}
interface EmployeeTemplateProps {
  option: DropdownOption;
}

interface SelectedEmployeeTemplateProps {
  option: number | null; // Recibe el ID del empleado
}


  const [formData, setFormData] = useState<EntityFormData>({
    nombre: '',
    descripcion: '',
    jefeId: null,
    habilidades_requeridas: [],
    nivel_jerarquico: 1,
    parentId: null,
    empleadosIds: []
  });

  // Estados para agregar nuevas habilidades
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [availableSkills, setAvailableSkills] = useState<TechnicalSkill[]>(AVAILABLE_SKILLS);

  // Opciones para departamentos padre (simplificado)
  const departmentOptions = departments
    .filter((d) => d.id !== data?.id)
    .map((d) => ({ label: d.nombre, value: d.id }));

  // Opciones para empleados (simplificado)
   const employeeOptions = employees.map(emp => ({
    name: emp.name,
    id: emp.id,
    photo: emp.photo,
    label: emp.name, // Para el filter
    value: emp.id    // Para el value
  }));

  // Template personalizado para mostrar empleados en dropdown con avatar
const employeeOptionTemplate = ({ option }: EmployeeTemplateProps) => {
    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={option.photo} 
          label={option.name.charAt(0)} 
          size="normal" 
          shape="circle"
          className="w-8 h-8"
        />
        <span>{option.name}</span>
      </div>
    );
  };

  // Template para el valor seleccionado en dropdown de empleado
  const selectedEmployeeTemplate = ({ option }: SelectedEmployeeTemplateProps) => {
    if (!option) return <span>Seleccionar empleado</span>;
    
    // Buscar el empleado por ID en la lista de empleados
    const selectedEmployee = employees.find(emp => emp.id === option);
    
    if (!selectedEmployee) return <span>Seleccionar empleado</span>;
    
    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={selectedEmployee.photo} 
          label={selectedEmployee.name.charAt(0)} 
          size="normal" 
          shape="circle"
          className="w-6 h-6"
        />
        <span>{selectedEmployee.name}</span>
      </div>
    );
  };



  // Template para empleados en MultiSelect
const employeeMultiSelectTemplate = ({ option }:EmployeeTemplateProps) => {
    const employee = employees.find(emp => emp.id === option.value);
    if (!employee) return null;

    return (
      <div className="flex items-center gap-2">
        <Avatar 
          image={employee.photo} 
          label={employee.name.charAt(0)} 
          size="normal" 
          shape="circle"
          className="w-6 h-6"
        />
        <span>{employee.name}</span>
      </div>
    );
  };

  React.useEffect(() => {
    console.log('useEffect ejecutado:', { data, type });
    console.log('Empleados disponibles:', employees);
    
    if (!data) {
      if (type === "department") {
        setFormData({
          nombre: "",
          descripcion: "",
          nivel_jerarquico: 2,
          parentId: null,
          jefeId: null,
          habilidades_requeridas: [],
          empleadosIds: []
        });
      } else if (type === "office") {
        setFormData({
          nombre: "",
          descripcion: "",
          jefeId: null,
          empleadosIds: [],
          habilidades_requeridas: [],
        });
      }
    } else {
      const entityData: EntityFormData = {
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        jefeId: data.jefeId || null,
        habilidades_requeridas: data.habilidades_requeridas || [],
        nivel_jerarquico: (data as Department).nivel_jerarquico || 1,
        parentId: (data as Department).parentId || null,
        empleadosIds: (data as Office)?.empleadosIds || 
                     (data as Department)?.oficinas?.flatMap(office => office.empleadosIds || []) || []
      };
      console.log('Datos de entidad cargados:', entityData);
      setFormData(entityData);
    }
  }, [data, type, employees]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    onSave(formData);
  };

  // Obtener empleados seleccionados para mostrar en AvatarGroup
  const getSelectedEmployees = () => {
    if (!formData.empleadosIds) return [];
    return employees.filter(emp => formData.empleadosIds?.includes(emp.id));
  };

  // Función mock para agregar nueva habilidad
  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      const newSkill: TechnicalSkill = {
        id: Math.max(...availableSkills.map(s => s.id), 0) + 1,
        nombre: newSkillName.trim(),
        nivel: 'Básico'
      };
      
      // Actualizar la lista de habilidades disponibles
      setAvailableSkills(prev => [...prev, newSkill]);
      
      // Agregar la nueva habilidad al formulario
      setFormData(prev => ({
        ...prev,
        habilidades_requeridas: [...prev.habilidades_requeridas, newSkill]
      }));
      
      // Limpiar y cerrar el diálogo
      setNewSkillName('');
      setShowSkillDialog(false);
      
      console.log('Nueva habilidad agregada:', newSkill);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {data ? "Editar" : "Crear"}{" "}
          {type === "department" ? "Departamento" : "Oficina"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Nombre - Editable Dropdown simplificado */}
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

            {/* Campos específicos para Departamento */}
            {type === "department" && (
              <>
                {/* Nivel Jerárquico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Departamento Padre - Simplificado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Jefe de Área - Simplificado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jefe de Área
                  </label>
                 <Dropdown
  value={formData.jefeId}
  onChange={(e: DropdownChangeEvent) => {
    console.log('Jefe seleccionado:', e.value);
    setFormData(prev => ({ ...prev, jefeId: e.value }));
  }}
  options={employees}  // Pasar el array directo de empleados
  optionLabel="name"   // Usar la propiedad name directamente
  optionValue="id"     // Usar la propiedad id como valor
  placeholder="Seleccionar jefe de área"
  className="w-full"
  showClear
  filter
  filterBy="name"
/>
                </div>

                {/* Empleados Asignados al Departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  
                  {/* Mostrar avatares de empleados seleccionados */}
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
            )}

            {/* Campos específicos para Oficina */}
            {type === "office" && (
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
                  
                  {/* Mostrar avatares de empleados seleccionados */}
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
            )}

            {/* Habilidades Requeridas */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Habilidades Requeridas
                </label>
                <Button
                  type="button"
                  icon={<Plus className="w-4 h-4" />}
                  label="Agregar Habilidad"
                  size="small"
                  severity="secondary"
                  onClick={() => setShowSkillDialog(true)}
                />
              </div>
              <MultiSelect
                value={formData.habilidades_requeridas}
                onChange={(e: MultiSelectChangeEvent) => {
                  console.log('Habilidades cambiadas:', e.value);
                  setFormData(prev => ({ ...prev, habilidades_requeridas: e.value }));
                }}
                options={availableSkills}
                optionLabel="nombre"
                placeholder="Seleccionar habilidades"
                className="w-full"
                filter
                filterBy="nombre"
                maxSelectedLabels={5}
                selectedItemsLabel="{0} habilidades seleccionadas"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Diálogo para agregar nueva habilidad */}
      <Dialog
        visible={showSkillDialog}
        onHide={() => setShowSkillDialog(false)}
        header="Agregar Nueva Habilidad"
        style={{ width: '400px' }}
        modal
      >
        <div className="flex flex-col gap-4">
          <FloatLabel>
            <InputText
              id="newSkill"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSkill();
                }
              }}
            />
            <label htmlFor="newSkill">Nombre de la habilidad</label>
          </FloatLabel>
          
          <div className="flex justify-end gap-2">
            <Button
              label="Cancelar"
              severity="secondary"
              onClick={() => {
                setNewSkillName('');
                setShowSkillDialog(false);
              }}
            />
            <Button
              label="Agregar"
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};