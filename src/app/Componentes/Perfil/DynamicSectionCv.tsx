import { Plus, Star, Trash2 } from "lucide-react";
import { Select, Input} from "@/app/util/UiCv";


export const DynamicSection = ({ items, onChange, onRemove, onAdd, fields, sectionName, isEditing }) => (
    <div className="space-y-6">
        {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg relative">
                 {sectionName === 'academicFormation' && (item.level === 'Universitario' || item.level === 'Posgrado') && item.status === 'Completo' && (
                    <div className="absolute top-4 right-12 text-yellow-400" title="Formación destacada">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(field => {
                        const gridClass = field.grid || 'md:col-span-1';
                        if (field.type === 'checkbox') {
                            return (
                                <div key={field.name} className={`${gridClass} flex items-end`}>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <input type="checkbox" checked={!!item[field.name]} onChange={e => {
                                            if(!isEditing) return;
                                            onChange(item.id, field.name, e.target.checked);
                                            if (e.target.checked) onChange(item.id, 'endDate', '');
                                        }} className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditing ? 'cursor-not-allowed' : ''}`} disabled={!isEditing} />
                                        {field.label}
                                    </label>
                                </div>
                            );
                        }
                        if (field.type === 'select') { return <div key={field.name} className={gridClass}><Select label={field.label} value={item[field.name]} onChange={e => onChange(item.id, field.name, e.target.value)} options={field.options} required={field.required} disabled={!isEditing}/></div> } 
                        if (field.type === 'file') { return <div key={field.name} className={gridClass}><Input label={field.label} type="file" onChange={e => onChange(item.id, 'attachment', e.target.files[0])} accept={field.accept} disabled={!isEditing} /></div> } 
                        return <div key={field.name} className={gridClass}><Input label={field.label} type={field.type} value={item[field.name]} onChange={e => onChange(item.id, field.name, e.target.value)} required={field.required} disabled={!isEditing || (field.name === 'endDate' && item.isCurrent)} /></div> 
                    })}
                </div>
                {isEditing && (
                    <button onClick={() => onRemove(item.id)} className="absolute top-3 right-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"> <Trash2 className="w-5 h-5"/> </button>
                )}
            </div>
        ))}
        {isEditing && (
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"> <Plus className="w-4 h-4"/> Añadir nuevo registro </button>
        )}
    </div>
);
