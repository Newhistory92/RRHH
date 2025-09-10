import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ 
  isOpen, 
  onToggle, 
  hasChildren 
}) => {
  if (!hasChildren) return null;

  return (
    <button 
      onClick={onToggle} 
      className="mt-2 p-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 
                 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isOpen ? 'Contraer' : 'Expandir'}
    >
      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );
};