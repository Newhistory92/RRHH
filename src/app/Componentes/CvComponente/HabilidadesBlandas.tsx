import React from 'react';
import { SOFT_SKILLS_CATALOG } from '@/app/api/prueba2';
import SkillBlandas from '@/app/Componentes/Perfil/SkillBlande';
import {Employee,CvProps} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';

export default function HabilidadesBlandas({ data, selectedSkills, updateData, isEditing }: CvProps) {
  const handleSoftSkillChange = (skillId) => {
    if (!isEditing) return;
    
    const newSelectedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    
    updateData(data, newSelectedSkills);
  };

  const handleRemove = (skillName) => {
    const newData = { ...data };
    delete newData[skillName];
    
    // También remover de selectedSkills si existe
    const skillCatalog = SOFT_SKILLS_CATALOG.find(s => s.name === skillName);
    const newSelectedSkills = skillCatalog 
      ? selectedSkills.filter(id => id !== skillCatalog.id)
      : selectedSkills;
    
    updateData(newData, newSelectedSkills);
  };

  return (

    <Accordion activeIndex={0}>
     <AccordionTab header="6. Habilidades Blandas">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOFT_SKILLS_CATALOG.map((skill) => (
          <label
            key={skill.id}
            className={`flex items-start p-3 border rounded-lg ${
              isEditing
                ? "cursor-pointer hover:bg-gray-50"
                : "cursor-not-allowed bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 ${
                !isEditing ? "cursor-not-allowed" : ""
              }`}
              checked={selectedSkills.includes(skill.id)}
              onChange={() => handleSoftSkillChange(skill.id)}
              disabled={!isEditing}
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-gray-900">
                {skill.name}
              </span>
              <p className="text-gray-500">{skill.description}</p>
            </div>
          </label>
        ))}
      </div>
      
      <SkillBlandas
        skills={data}
        isEditing={isEditing}
        onRemove={handleRemove}
      />
      </AccordionTab>
    </Accordion>
  );
}