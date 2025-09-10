import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { FormFieldProps, TechnicalSkill } from '@/app/Interfas/Interfaces';

interface SkillsFieldProps extends FormFieldProps {
  availableSkills: TechnicalSkill[];
  setShowSkillDialog: (show: boolean) => void;
}

export const SkillsField: React.FC<SkillsFieldProps> = ({
  formData,
  setFormData,
  availableSkills,
  setShowSkillDialog
}) => {
  console.log('Renderizando SkillsField con formData:', formData);
  return (
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
        optionLabel="name"
        placeholder="Seleccionar habilidades"
        className="w-full"
        filter
        filterBy="name"
        maxSelectedLabels={5}
        selectedItemsLabel="{0} habilidades seleccionadas"
      />
    </div>
  );
};