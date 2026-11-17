import React from 'react';
import {SoftSkill} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Sparkles } from 'lucide-react';

export interface CvFormacionProps {
  data: SoftSkill[];
  selectedSkills: number[];
  softSkillsCatalog: { id: number; nombre: string; descripcion: string }[];
  updateData: (updates: SoftSkill[], selectedSkills: number[]) => void;
  isEditing: boolean;
  headerActions?: React.ReactNode;
}
export default function HabilidadesBlandas({ data, selectedSkills, softSkillsCatalog, updateData, isEditing, headerActions }: CvFormacionProps) {
  const handleSoftSkillChange = (skillId:number) => {
    if (!isEditing) return;
    
    const newSelectedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    
    updateData(data, newSelectedSkills);
  };

  return (

    <Accordion activeIndex={0}>
     <AccordionTab header={
        <div className="flex items-center justify-between w-full pr-2">
          <span>6. Habilidades Blandas</span>
          {headerActions && <span onClick={(e) => e.stopPropagation()}>{headerActions}</span>}
        </div>
      }>
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {softSkillsCatalog.map((skill) => (
            <label
              key={skill.id}
              className="flex items-start p-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-muted"
            >
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary mt-1"
                checked={selectedSkills.includes(skill.id)}
                onChange={() => handleSoftSkillChange(skill.id)}
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
      ) : (
        // Fuera de edicion, listar las 20 habilidades del catalogo como
        // checkboxes apagados (la mayoria sin marcar) era la pared mas ancha
        // de cajas grises de todo el CV. Solo importan las que la persona
        // eligio.
        (() => {
          const elegidas = softSkillsCatalog.filter((s) => selectedSkills.includes(s.id));
          return elegidas.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Todavía no se seleccionó ninguna habilidad blanda.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {elegidas.map((skill) => (
                <span
                  key={skill.id}
                  title={skill.descripcion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary"
                >
                  <Sparkles size={14} aria-hidden="true" />
                  {skill.nombre}
                </span>
              ))}
            </div>
          );
        })()
      )}
    
      </AccordionTab>
    </Accordion>
  );
}