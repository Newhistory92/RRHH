import React from 'react';
import {SoftSkill} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface CvFormacionProps {
  data: SoftSkill[];
  selectedSkills: number[];
  softSkillsCatalog: { id: number; nombre: string; descripcion: string }[];
  updateData: (updates: SoftSkill[], selectedSkills: number[]) => void;
  isEditing: boolean;
}
export default function HabilidadesBlandas({ data, selectedSkills, softSkillsCatalog, updateData, isEditing }: CvFormacionProps) {
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
        {softSkillsCatalog.map((skill) => (
          <label
            key={skill.id}
            className={`flex items-start p-3 border border-border rounded-lg ${
              isEditing
                ? "cursor-pointer hover:bg-muted"
                : "cursor-not-allowed bg-muted"
            }`}
          >
            <input
              type="checkbox"
              className={`h-5 w-5 rounded border-border text-primary focus:ring-primary mt-1 ${
                !isEditing ? "cursor-not-allowed" : ""
              }`}
              checked={selectedSkills.includes(skill.id)}
              onChange={() => handleSoftSkillChange(skill.id)}
              disabled={!isEditing}
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-foreground">
                {skill.nombre}
              </span>
              <p className="text-muted-foreground">{skill.descripcion}</p>
            </div>
          </label>
        ))}
      </div>
    
      </AccordionTab>
    </Accordion>
  );
}