import React from 'react';
import { Plus, Star, Trash2, Check } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { formatearFecha } from '@/app/lib/dates';

// Interfaces de TypeScript
interface DynamicItem {
  id: string | number;
  level?: string;
  status?: string;
  isCurrent?: boolean;
  endDate?: string | null;
  attachment?: File | string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
  onChange: (id: string | number, field: string, value: number | string | boolean | File | null) => void;
  onRemove: (id: string | number) => void;
  onAdd: () => void;
  onVerify?: (item: DynamicItem) => void;
  fields: Field[];
  sectionName: string;
  isEditing: boolean;
}

// Fuera de edicion, mostrar el dato como un input/select/checkbox
// deshabilitado es la "pared de cajas grises" que hace tedioso el CV: cada
// campo arrastra el mismo borde, padding y fondo apagado de un control que ya
// no se puede tocar, aunque lo unico que se necesita ahi es leer el valor. En
// vez de eso, fuera de edicion se muestra texto plano con el mismo ritmo que
// ya usa el legajo de RRHH (DetailTables.tsx: InfoCard).
const ReadValue = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-foreground py-2 min-h-[2.5rem] flex items-center">{children}</p>
);

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  items,
  onChange,
  onRemove,
  onAdd,
  onVerify,
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
    // console.warn('DynamicSection: items is not a valid array, defaulting to empty array');
    return (
      <div className="space-y-6">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        return (
          <div key={item.id} className="p-4 border rounded-lg relative">
            {sectionName === "academicFormation" &&
              (item.level === "Universitario" || item.level === "Posgrado") &&
              item.status === "Completo" && (
                <div
                  className="absolute top-4 right-12 text-warning"
                  title="Formación destacada"
                >
                  <Star className="w-6 h-6 fill-current" />
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field: Field) => {
                const gridClass = field.grid || "md:col-span-1";

                if (field.type === "checkbox") {
                  if (!isEditing) {
                    return (
                      <div key={field.name} className={`${gridClass} flex items-end`}>
                        {item[field.name] ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-foreground py-2">
                            <Check size={16} className="text-success" aria-hidden="true" />
                            {field.label}
                          </span>
                        ) : (
                          // Ausente y no "No": la info real ya esta en la fecha de
                          // fin, repetir la negacion ademas del checkbox apagado
                          // era ruido sin dato nuevo.
                          <span />
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={field.name} className={`${gridClass} flex items-end`}>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={!!item[field.name]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            onChange(item.id, field.name, e.target.checked);
                            if (e.target.checked) onChange(item.id, "endDate", "");
                          }}
                          className="h-4 w-4 rounded border-border focus:ring-primary"
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        {field.label}
                      </label>
                    </div>
                  );
                }

                if (field.type === "select") {
                  const opcionActual = field.options?.find((o) => o.value === item[field.name]);
                  return (
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-foreground">
                        {field.label}
                        {/* El asterisco de obligatorio solo importa mientras se puede
                            actuar sobre el campo -- en modo lectura no aporta nada y
                            antes quedaba inconsistente (solo los campos "select"
                            lo mostraban ahi, texto/fecha no). */}
                        {isEditing && field.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {isEditing ? (
                        <Dropdown
                          id={`${field.name}-${item.id}`}
                          value={item[field.name] || ''}
                          options={field.options || []}
                          onChange={(e: { value: string }) =>
                            onChange(item.id, field.name, e.value)
                          }
                          placeholder={`Seleccionar ${field.label.toLowerCase()}`}
                          className="w-full relative"
                          optionLabel="label"
                          optionValue="value"
                          filter={(field.options?.length || 0) > 5}
                          filterMatchMode="contains"
                          filterPlaceholder="Buscar..."
                          emptyFilterMessage="No hay resultados"
                          pt={{
                            wrapper: { className: "max-h-60" },
                          }}
                        />
                      ) : (
                        <ReadValue>{opcionActual?.label || item[field.name] || '—'}</ReadValue>
                      )}
                    </div>
                  );
                }

                if (field.type === "file") {
                  const adjunto = item[field.name];
                  return (
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-foreground">
                        {field.label}
                        {isEditing && field.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          id={`${field.name}-${item.id}`}
                          type="file"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(item.id, "attachment", e.target.files?.[0] || null)
                          }
                          accept={field.accept}
                          className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <ReadValue>
                          {adjunto instanceof File ? adjunto.name : adjunto || 'Sin archivo adjunto'}
                        </ReadValue>
                      )}
                    </div>
                  );
                }

                if (!isEditing) {
                  const valor = item[field.name];
                  return (
                    <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                      <label className="text-sm font-medium text-foreground">{field.label}</label>
                      <ReadValue>
                        {field.type === 'date'
                          ? (valor ? formatearFecha(valor) : (item.isCurrent && field.name === 'endDate' ? 'Actualmente' : '—'))
                          : (valor || '—')}
                      </ReadValue>
                    </div>
                  );
                }
                return (
                  <div key={field.name} className={`${gridClass} flex flex-col gap-2`}>
                    <label htmlFor={`${field.name}-${item.id}`} className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </label>
                    <InputText
                      id={`${field.name}-${item.id}`}
                      type={field.type}
                      value={item[field.name] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(item.id, field.name, e.target.value)
                      }
                      disabled={field.name === "endDate" && item.isCurrent}
                      className="w-full"
                      placeholder={field.label}
                    />
                  </div>
                );
              })}
            </div>

            {isEditing && (
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {typeof item.isVerified !== 'undefined' && item.isVerified === true && (
                  <span className="p-1 px-2 text-xs font-bold bg-success-soft text-success-soft-foreground rounded shadow-sm flex items-center justify-center gap-1" title="Esta formación ha sido verificada.">
                    <Check size={14} aria-hidden="true" /> Verificado
                  </span>
                )}
                {typeof item.isVerified !== 'undefined' && item.isVerified === false && onVerify && (
                  <button
                    onClick={() => onVerify(item)}
                    className="p-1 text-primary rounded bg-card shadow-sm text-xs font-semibold px-2 transition-colors hover:opacity-80 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Realizar test para validar esta formación"
                  >
                    Verificar
                  </button>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1 text-error rounded-full flex items-center justify-center bg-card shadow-sm transition-colors hover:opacity-80 hover:bg-error-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {isEditing && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="w-4 h-4" /> Añadir nuevo registro
        </button>
      )}
    </div>
  );
};