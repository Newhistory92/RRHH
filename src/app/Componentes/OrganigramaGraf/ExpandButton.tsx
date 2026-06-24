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
      className="mt-2 p-2 bg-card border-2 border-border
                 rounded-full hover:bg-muted transition-colors shadow-md
                 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={isOpen ? 'Contraer' : 'Expandir'}
    >
      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );
};