import { NodeColors } from '@/app/Interfas/Interfaces';

export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  2: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  3: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  4: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  5: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' }
};

export const DEFAULT_NODE_COLOR: NodeColors = { 
  bg: 'bg-gray-500', 
  text: 'text-white', 
  border: 'border-gray-600' 
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Dirección',
  2: 'Gerencia',
  3: 'Supervisión',
  4: 'Coordinación',
  5: 'Operativo'
};