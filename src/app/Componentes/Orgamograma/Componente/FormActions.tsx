import React from 'react';

interface FormActionsProps {
  onClose: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ onClose }) => {
  return (
    <div className="flex justify-end gap-4 mt-8">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-border transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
      >
        Guardar Cambios
      </button>
    </div>
  );
};
