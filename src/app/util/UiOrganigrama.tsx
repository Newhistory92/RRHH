"use client"
import {  X, Search, ChevronDown} from 'lucide-react';
import React, { FormEvent, useState } from "react";
import {ModalConfig, Department,Employee,EntityFormData, Office} from '@/app/Interfas/Interfaces';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
        
interface EntityFormModalProps {
  config: ModalConfig;
  onClose: () => void;
  onSave: (formData: EntityFormData) => void;
  departments: Department[];
  employees: Employee[];
}


interface DropdownOption {
  nombre: string;
  id?: number;
}

export const EntityFormModal = ({ config,onClose,onSave,departments,employees,}: EntityFormModalProps) => {
  const { type, data } = config;
    const [formData, setFormData] = useState<EntityFormData>({
    nombre: '',
    descripcion: '',
    jefeId: null,
    habilidades_requeridas: [],
    nivel_jerarquico: 1,
    parentId: null,
    empleadosIds: []
  });


   // Opciones para el dropdown de departamentos (para parentId)
  const nombreOptions: DropdownOption[] = departments.map(dept => ({
    nombre: dept.nombre,
    id: dept.id
  }));
 const departmentOptions = departments.map(dept => ({
    nombre: dept.nombre,
    id: dept.id
  }));

  // Opciones para el dropdown de jefes (empleados)
  const jefeOptions = employees.map(emp => ({
    nombre: `${emp.name} - ${emp.position}`,
    id: emp.id
  }));



  React.useEffect(() => {if (!data) {
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
        habilidades_requeridas: Array.isArray(data.habilidades_requeridas) 
          ? data.habilidades_requeridas.map((skill: any) => 
              typeof skill === 'string' ? skill : skill.name
            )
          : [],
        nivel_jerarquico: (data as Department).nivel_jerarquico || 1,
        parentId: (data as Department).parentId || null,
        empleadosIds: (data as Office)?.empleadosIds || []
      };
      setFormData(entityData);
    }
  }, [data, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "nivel_jerarquico" || name === "parentId"
          ? parseInt(value) || null
          : value,
    }));
  };
  
   const handleDropdownChange = (field: keyof EntityFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

    const handleInputChange = (field: keyof EntityFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSkillsChange = (newSkills: string[]) => {
    setFormData((prev) => ({ ...prev, habilidades_requeridas: newSkills }));
  };


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
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
          <div className="space-y-4">
           <Dropdown
                value={formData.nombre}
                onChange={(e: DropdownChangeEvent) => handleDropdownChange('nombre', e.value)}
                options={nombreOptions}
                optionLabel="nombre"
                editable
                placeholder="Seleccionar o escribir nombre"
                className="w-full"
                required
              />
            {/* <InputField
              name="nombre"
              label="Nombre"
              value={formData.nombre || ""}
              onChange={handleChange}
              required
            /> */}
            <TextAreaField
              name="descripcion"
              label="Descripción"
              value={formData.descripcion || ""}
              onChange={handleChange}
            />
            {type === "department" && (
              <>
                {" "}
                <InputField
                  name="nivel_jerarquico"
                  label="Nivel Jerárquico"
                  type="number"
                  value={formData.nivel_jerarquico || ""}
                  onChange={handleChange}
                  min="1"
                  required
                />{" "}
                <SelectField
                  name="parentId"
                  label="Depende de (Dpto. Padre)"
                  value={formData.parentId || ""}
                  onChange={handleChange}
                  options={departments
                    .filter((d) => d.id !== data?.id)
                    .map((d) => ({ value: d.id, label: d.nombre }))}
                  placeholder="Ninguno (Nivel Principal)"
                />{" "}
                <EmployeeSelector
                  label="Jefe de Área"
                  employees={employees}
                  selectedId={formData.jefeId}
                  onSelect={(id) => setFormData((p) => ({ ...p, jefeId: id }))}
                />
              </>
            )}
            {type === "office" && (
              <>
                {" "}
                <EmployeeSelector
                  label="Jefe de Oficina"
                  employees={employees}
                  selectedId={formData.jefeId}
                  onSelect={(id) => setFormData((p) => ({ ...p, jefeId: id }))}
                />{" "}
                <EmployeeSelector
                  label="Empleados Asignados"
                  employees={employees}
                  selectedIds={formData.empleadosIds || []}
                  onSelect={(ids) =>
                    setFormData((p) => ({ ...p, empleadosIds: ids }))
                  }
                  multiple
                />
              </>
            )}
            <SkillEditor
              skills={formData.habilidades_requeridas || []}
              setSkills={handleSkillsChange}
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = (props) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {props.label}
    </label>
    <input
      {...props}
      id={props.name}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const TextAreaField = (props) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {props.label}
    </label>
    <textarea
      {...props}
      id={props.name}
      rows="3"
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);


const SkillEditor = ({ skills, setSkills }) => {
  const [input, setInput] = useState("");
  const handleAdd = () => {
    if (input && !skills.includes(input)) {
      setSkills([...skills, input]);
      setInput("");
    }
  };
  const handleRemove = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Habilidades Requeridas
      </label>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleAdd())
          }
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Añadir
        </button>
      </div>
      <div className="mt-2 flex flex-wrap">
        {skills.map((s) => (
          <SkillChip key={s} skill={s} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
};
const EmployeeSelector = ({
  label,
  employees,
  selectedId,
  selectedIds,
  onSelect,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEmployees = employees.filter((emp) =>
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (employee) => {
    if (multiple) {
      const newIds = selectedIds.includes(employee.id)
        ? selectedIds.filter((id) => id !== employee.id)
        : [...selectedIds, employee.id];
      onSelect(newIds);
    } else {
      onSelect(employee.id);
      setIsOpen(false);
    }
  };
  const getSelectionDisplay = () => {
    if (multiple) {
      if (!selectedIds || selectedIds.length === 0)
        return <span className="text-gray-500">Seleccionar empleados...</span>;
      return (
        <span className="text-gray-800">
          {selectedIds.length} empleado(s) seleccionado(s)
        </span>
      );
    }
    const selectedEmployee = employees.find((e) => e.id === selectedId);
    return selectedEmployee ? (
      <div className="flex items-center">
        <img
          src={selectedEmployee.foto}
          className="w-6 h-6 rounded-full mr-2"
        />
        {selectedEmployee.nombre}
      </div>
    ) : (
      <span className="text-gray-500">Seleccionar jefe...</span>
    );
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-left flex items-center justify-between"
        >
          {getSelectionDisplay()}
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empleado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <ul>
              {filteredEmployees.map((emp) => (
                <li
                  key={emp.id}
                  onClick={() => handleSelect(emp)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img src={emp.foto} className="w-6 h-6 rounded-full mr-2" />{" "}
                    {emp.nombre}
                  </div>
                  {multiple && (
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedIds.includes(emp.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
