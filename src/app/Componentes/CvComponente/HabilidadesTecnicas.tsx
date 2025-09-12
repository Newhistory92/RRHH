import React, { useState } from 'react';
import { Lock, Check, BrainCircuit } from 'lucide-react';
import { formatDate } from '@/app/util/UiCv';
import { SkillTestModal } from '@/app/Componentes/Perfil/SkillTest';
import { AVAILABLE_SKILLS } from '@/app/api/prueba2';
import SkillTecnico from '@/app/Componentes/Perfil/SkillTecnit';
import {Employee,CvProps} from "@/app/Interfas/Interfaces"
import { Accordion, AccordionTab } from 'primereact/accordion';


export default function HabilidadesTecnicas({ data, skillStatus, updateData, isEditing }: CvProps) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [skillToTest, setSkillToTest] = useState(null);

  const handleStartTest = (skill) => {
    setSkillToTest(skill);
    setIsTestModalOpen(true);
  };

  const handleRemove = (id) => {
    const newData = data.filter((item) => item.id !== id);
    updateData(newData, skillStatus);
  };

  const handleExperienceChange = (id, years) => {
    const newData = data.map((item) =>
      item.id === id ? { ...item, experienceYears: years } : item
    );
    updateData(newData, skillStatus);
  };

  const handleTestComplete = (skill, score) => {
    setIsTestModalOpen(false);
    setSkillToTest(null);
    
    if (score >= 70) {
      let level = score >= 85 ? 10 : score >= 70 ? 7 : 5;
      
      const newSkill = { 
        id: Date.now(), 
        name: skill.name, 
        level: level,
        experienceYears: 0
      };
      
      const newData = [...data, newSkill];
      const newStatus = { skill_id: skill.id, status: "passed" };
      const newSkillStatus = [
        ...skillStatus.filter((s) => s.skill_id !== skill.id),
        newStatus,
      ];
      
      updateData(newData, newSkillStatus);
    } else {
      const unlockDate = new Date();
      unlockDate.setMonth(unlockDate.getMonth() + 3);
      const newStatus = { skill_id: skill.id, status: "locked", unlockDate };
      const newSkillStatus = [
        ...skillStatus.filter((s) => s.skill_id !== skill.id),
        newStatus,
      ];
      
      updateData(data, newSkillStatus);
    }
  };

  return (

    <Accordion activeIndex={0}>
    <AccordionTab header="5. Habilidades Técnicas">
      {isTestModalOpen && (
        <SkillTestModal
          skill={skillToTest}
          onClose={() => setIsTestModalOpen(false)}
          onTestComplete={handleTestComplete}
        />
      )}
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800">
          Valida tus habilidades
        </h4>
        <p className="text-sm text-blue-700">
          Selecciona una habilidad de la lista para iniciar una breve
          prueba técnica. Si apruebas, se añadirá a tu perfil con el nivel
          correspondiente.
        </p>
      </div>
      
      <h4 className="font-semibold text-gray-700 mb-2">
        Mis Habilidades Validadas
      </h4>
      
      <SkillTecnico
        skills={data}
        isEditing={isEditing}
        onRemove={handleRemove}
        onExperienceChange={handleExperienceChange}
      />
      
      {isEditing && (
        <>
          <h4 className="font-semibold text-gray-700 mb-3">
            Añadir Nueva Habilidad
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_SKILLS.map((skill) => {
              const passedSkill = data.find(
                (s) => s.name === skill.name
              );
              const statusInfo = skillStatus.find(
                (s) => s.skill_id === skill.id
              );
              const isLocked =
                statusInfo?.status === "locked" &&
                new Date() < new Date(statusInfo.unlockDate);
              
              if (passedSkill) {
                return (
                  <div
                    key={skill.id}
                    className="p-3 border rounded-lg bg-green-50 flex items-center justify-between"
                  >
                    <span className="font-medium text-green-800">
                      {skill.name}
                    </span>
                    <span className="flex items-center text-sm text-green-700">
                      <Check className="w-4 h-4 mr-1" /> Validado
                    </span>
                  </div>
                );
              }
              
              if (isLocked) {
                return (
                  <div
                    key={skill.id}
                    className="p-3 border rounded-lg bg-red-50 text-red-700"
                  >
                    <div className="flex items-center justify-between font-medium">
                      {skill.name} <Lock className="w-4 h-4" />
                    </div>
                    <p className="text-xs mt-1">
                      Bloqueado hasta: {formatDate(statusInfo.unlockDate)}
                    </p>
                  </div>
                );
              }
              
              return (
                <button
                  key={skill.id}
                  onClick={() => handleStartTest(skill)}
                  className="p-3 border rounded-lg text-left hover:bg-gray-100 hover:border-blue-500 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800">
                    {skill.name}
                  </span>
                  <span className="flex items-center px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                    <BrainCircuit className="w-4 h-4 mr-1" /> Iniciar Prueba
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      </AccordionTab>
    </Accordion>
  );
}