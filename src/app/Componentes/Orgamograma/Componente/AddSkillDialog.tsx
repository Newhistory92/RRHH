import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from "primereact/floatlabel";

interface AddSkillDialogProps {
  visible: boolean;
  onHide: () => void;
  newSkillName: string;
  setNewSkillName: (name: string) => void;
  onAddSkill: () => void;
}

export const AddSkillDialog: React.FC<AddSkillDialogProps> = ({
  visible,
  onHide,
  newSkillName,
  setNewSkillName,
  onAddSkill
}) => {
  const handleClose = () => {
    setNewSkillName('');
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header="Agregar Nueva Habilidad"
      style={{ width: '400px' }}
      modal
    >
      <div className="flex flex-col gap-4">
        <FloatLabel>
          <InputText
            id="newSkill"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="w-full"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddSkill();
              }
            }}
          />
          <label htmlFor="newSkill">Nombre de la habilidad</label>
        </FloatLabel>
        
        <div className="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            onClick={handleClose}
          />
          <Button
            label="Agregar"
            onClick={onAddSkill}
            disabled={!newSkillName.trim()}
          />
        </div>
      </div>
    </Dialog>
  );
};
