
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from 'primereact/button';
import { SoftSkill } from "@/app/Interfas/Interfaces";

interface SoftSkillsProps {
  softSkills: SoftSkill[];
  onAddSoftSkill: (skill: SoftSkill) => void;
  onDeleteSoftSkill?: (index: number) => void;
}

export const SoftSkills: React.FC<SoftSkillsProps> = ({ 
  softSkills, 
  onAddSoftSkill,
  onDeleteSoftSkill 
}) => {
  const [newSoftSkill, setNewSoftSkill] = useState<SoftSkill>({
    nombre: "",
    descripcion: "",
  });

  const handleSoftSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftSkill.nombre.trim() || !newSoftSkill.descripcion.trim()) return;
    
    onAddSoftSkill(newSoftSkill);
    setNewSoftSkill({ nombre: "", descripcion: "" });
  };

  const handleInputChange = (field: keyof SoftSkill, value: string) => {
    setNewSoftSkill(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <Card className="mb-6">
        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">
          Añadir Nueva Habilidad Blanda
        </h3>
        <form onSubmit={handleSoftSkillSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="softskill-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Nombre de la Habilidad Blanda
            </label>
            <InputText 
              id="softskill-nombre"
              value={newSoftSkill.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="mt-1 block w-full input-style"
              placeholder="Ej: Liderazgo"
              required
            /> 
          </div>
          <div>
            <label
              htmlFor="softskill-desc"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Descripción
            </label>
            <InputTextarea  
              id="softskill-desc"
              value={newSoftSkill.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              rows={3} 
              cols={30}
              className="w-full mt-1 input-style"
              placeholder="Describe la habilidad blanda..."
              required
            />        
          </div>
          <div className="text-right">
            <Button
              type="submit"
              text 
              raised 
              disabled={!newSoftSkill.nombre.trim() || !newSoftSkill.descripcion.trim()}
            >
              Guardar Habilidad Blanda
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">
          Habilidades Blandas Existentes ({softSkills.length})
        </h3>
        <div className="space-y-3">
          {softSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aún no se han creado habilidades blandas.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega la primera habilidad blanda usando el formulario de arriba.
              </p>
            </div>
          ) : (
            softSkills.map((skill, index) => (
              <div
                key={`skill-${index}`}
                className="p-4 bg-muted rounded-lg hover:bg-border transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {skill.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {skill.descripcion}
                    </p>
                  </div>
                  {onDeleteSoftSkill && (
                    <Button
                      type="button"
                      onClick={() => onDeleteSoftSkill(index)}
                      className="ml-3 text-error hover:opacity-80"
                      text
                      size="small"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};