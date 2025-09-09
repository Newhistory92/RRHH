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
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Guardar Cambios
      </button>
    </div>
  );
};
