import { useState } from 'react';
import { TechnicalSkill, EntityFormData } from '@/app/Interfas/Interfaces';


export const useSkillManagement = (formData: EntityFormData,setFormData: React.Dispatch<React.SetStateAction<EntityFormData>>) => {
  
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [availableSkills, setAvailableSkills] = useState<TechnicalSkill[]>();

  
  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      const newSkill: TechnicalSkill = {
        id: Math.max(...availableSkills.map(s => s.id), 0) + 1,
        nombre: newSkillName.trim(),
        level: 0
      };
      
      setAvailableSkills(prev => [...prev, newSkill]);
      setFormData(prev => ({
        ...prev,
        habilidades_requeridas: [...prev.habilidades_requeridas, newSkill]
      }));
      
      setNewSkillName('');
      setShowSkillDialog(false);
      
      console.log('Nueva habilidad agregada:', newSkill);
    }
  };

  return {
    showSkillDialog,
    setShowSkillDialog,
    newSkillName,
    setNewSkillName,
    availableSkills,
    setAvailableSkills,
    handleAddSkill
  };
};