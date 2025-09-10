import { NodeColors } from '@/app/Interfas/Interfaces';

export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
  2: { bg: 'bg-teal-600',   text: 'text-white', border: 'border-teal-700' },
  3: { bg: 'bg-amber-500',  text: 'text-white', border: 'border-amber-600' },
  4: { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700' },
  5: { bg: 'bg-rose-600',   text: 'text-white', border: 'border-rose-700' }
};

export const DEFAULT_NODE_COLOR: NodeColors = { 
  bg: 'bg-slate-500', 
  text: 'text-white', 
  border: 'border-slate-600' 
};

export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: 'bg-sky-200',    text: 'text-slate-800', border: 'border-sky-400' },
  2: { bg: 'bg-emerald-200', text: 'text-slate-800', border: 'border-emerald-400' },
  3: { bg: 'bg-orange-200', text: 'text-slate-800', border: 'border-orange-400' },
  4: { bg: 'bg-fuchsia-200',text: 'text-slate-800', border: 'border-fuchsia-400' },
  5: { bg: 'bg-red-200',    text: 'text-slate-800', border: 'border-red-400' }
};

export const DEFAULT_NODE_COLOR2: NodeColors = { 
  bg: 'bg-slate-200', 
  text: 'text-slate-800', 
  border: 'border-slate-400' 
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Dirección',
  2: 'Gerencia',
  3: 'Supervisión',
  4: 'Coordinación',
  5: 'Operativo'
};