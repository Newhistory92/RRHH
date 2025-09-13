import React from 'react';
import { Plus, Star, Trash2 } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';

// Interfaces de TypeScript
interface DynamicItem {
  id: string | number;
  level?: string;
  status?: string;
  isCurrent?: boolean;
  endDate?: string;
  attachment?: File;
  [key: string]: any; // Para permitir propiedades dinámicas
}

interface FieldOption {
  value: string;
  label: string;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' | 'file';
  grid?: string;
  required?: boolean;
  accept?: string;
  options?: FieldOption[];
}

interface DynamicSectionProps {
  items: DynamicItem[];
  onChange: (id: string | number, field: string, value: any) => void;
  onRemove: (id: string | number) => void;
  onAdd: () => void;
  fields: Field[];
  sectionName: string;
  isEditing: boolean;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  items,
  onChange,
  onRemove,
  onAdd,
  fields,
  sectionName,
  isEditing,
}) => {
  // Validación y console.log para debugging
//   console.log('DynamicSection - items:', items);
//   console.log('DynamicSection - items type:', typeof items);
//   console.log('DynamicSection - is array:', Array.isArray(items));

  // Validar que items sea un array válido
  if (!items || !Array.isArray(items)) {
    console.warn('DynamicSection: items is not a valid array, defaulting to empty array');
    return (
      <div className="space-y-6">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" /> Añadir nuevo registro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item: DynamicItem) => {
        console.log('Processing item:', item);
        
        return (
          <div key={item.id} className="p-4 border rounded-lg relative">
            {sectionName === "academicFormation" &&
              (item.level === "Universitario" || item.level === "Posgrado") &&
              item.status === "Completo" && (
                <div
                  className="absolute top-4 right-12 text-yellow-400"
                  title="Formación destacada"
                >
                  <Star className="w-6 h-6 fill-current" />
                </div>
              )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field: Field) => {
                const gridClass = field.grid || "md:col-span-1";
                
                if (field.type === "checkbox") {
                  return (
                    <div key={field.name} className={`${gridClass} flex items-end`}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!item[field.name]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (!isEditing) return;
                            onChange(item.id, field.name, e.target.checked);
                            if (e.target.checked) onChange(item.id, "endDate", "");
                          }}
                          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            !isEditing ? "cursor-not-allowed" : ""
                          }`}
                          disabled={!isEditing}
                        />
                        {field.label}
                      </label>
                    </div>
                  );
                }
                
                if (field.type === "select") {
                  return (
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Dropdown
                        id={`${field.name}-${item.id}`}
                        value={item[field.name] || ''}
                        options={field.options || []}
                        onChange={(e: { value: string }) =>
                          onChange(item.id, field.name, e.value)
                        }
                        placeholder={`Seleccionar ${field.label.toLowerCase()}`}
                        disabled={!isEditing}
                        className="w-full"
                        optionLabel="label"
                        optionValue="value"
                      />
                    </div>
                  );
                }
                
                if (field.type === "file") {
                  return (
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        id={`${field.name}-${item.id}`}
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onChange(item.id, "attachment", e.target.files?.[0] || null)
                        }
                        accept={field.accept}
                        disabled={!isEditing}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  );
                }
                
                return (
                  <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                    <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <InputText
                      id={`${field.name}-${item.id}`}
                      type={field.type}
                      value={item[field.name] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(item.id, field.name, e.target.value)
                      }
                      disabled={
                        !isEditing || (field.name === "endDate" && item.isCurrent)
                      }
                      className="w-full"
                      placeholder={field.label}
                    />
                  </div>
                );
              })}
            </div>
            
            {isEditing && (
              <button
                onClick={() => onRemove(item.id)}
                className="absolute top-3 right-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                title="Eliminar registro"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      })}
      
      {isEditing && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" /> Añadir nuevo registro
        </button>
      )}
    </div>
  );
};