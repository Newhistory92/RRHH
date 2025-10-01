import React from 'react';
import { SOFT_SKILLS_CATALOG } from '@/app/api/prueba2';
import {SoftSkill} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface CvFormacionProps {
  data: SoftSkill[];
   selectedSkills: number[];
  updateData: (updates: SoftSkill[], selectedSkills: number[]) => void;
  isEditing: boolean;
}
export default function HabilidadesBlandas({ data, selectedSkills, updateData, isEditing }: CvFormacionProps) {
  const handleSoftSkillChange = (skillId:number) => {
    if (!isEditing) return;
    
    const newSelectedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    
    updateData(data, newSelectedSkills);
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
                {skill.nombre}
              </span>
              <p className="text-gray-500">{skill.descripcion}</p>
            </div>
          </label>
        ))}
      </div>
    
      </AccordionTab>
    </Accordion>
  );
}