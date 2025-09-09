import { X } from 'lucide-react';
import React, { FormEvent } from "react";
import { BasicFields } from './/BasicFields';
import { DepartmentFields } from './DepartmentFields';
import { OfficeFields } from './OfficeFields';
import { SkillsField } from './SkillsField';
import { AddSkillDialog } from './AddSkillDialog';
import { FormActions } from './FormActions';
import { useFormData } from '@/app/util/useFormDataOrg';
import { useSkillManagement } from '@/app/util/useSkillManagement';
import type { EntityFormModalProps } from '@/app/Interfas/Interfaces';

export const EntityFormModal: React.FC<EntityFormModalProps> = ({ 
  config, 
  onClose, 
  onSave, 
  departments, 
  employees 
}) => {
  const { type, data } = config;
  const { formData, setFormData } = useFormData(config, employees);
  const {
    showSkillDialog,
    setShowSkillDialog,
    newSkillName,
    setNewSkillName,
    availableSkills,
    handleAddSkill
  } = useSkillManagement(formData, setFormData);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
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
          <div className="space-y-6">
            <BasicFields
              formData={formData}
              setFormData={setFormData}
              employees={employees}
              departments={departments}
            />

            {type === "department" && (
              <DepartmentFields
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                departments={departments}
              />
            )}

            {type === "office" && (
              <OfficeFields
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                departments={departments}
              />
            )}

            <SkillsField
              formData={formData}
              setFormData={setFormData}
              employees={employees}
              departments={departments}
              availableSkills={availableSkills}
              setShowSkillDialog={setShowSkillDialog}
            />
          </div>

          <FormActions onClose={onClose} />
        </form>
      </div>

      <AddSkillDialog
        visible={showSkillDialog}
        onHide={() => setShowSkillDialog(false)}
        newSkillName={newSkillName}
        setNewSkillName={setNewSkillName}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
};