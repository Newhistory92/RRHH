import { NodeColors } from '@/app/Interfas/Interfaces';

export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: 'bg-primary',       text: 'text-primary-foreground',       border: 'border-primary' },
  2: { bg: 'bg-warm-contrast', text: 'text-warm-contrast-foreground', border: 'border-warm-contrast' },
  3: { bg: 'bg-accent',        text: 'text-accent-foreground',        border: 'border-accent' },
  4: { bg: 'bg-secondary',     text: 'text-secondary-foreground',     border: 'border-secondary' },
  5: { bg: 'bg-muted',         text: 'text-foreground',               border: 'border-muted' }
};

export const DEFAULT_NODE_COLOR: NodeColors = {
  bg: 'bg-secondary',
  text: 'text-secondary-foreground',
  border: 'border-secondary'
};

export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: 'bg-primary/15',       text: 'text-foreground', border: 'border-primary/30' },
  2: { bg: 'bg-warm-contrast/15', text: 'text-foreground', border: 'border-warm-contrast/30' },
  3: { bg: 'bg-accent/15',        text: 'text-foreground', border: 'border-accent/30' },
  4: { bg: 'bg-secondary',        text: 'text-secondary-foreground', border: 'border-secondary' },
  5: { bg: 'bg-muted',            text: 'text-foreground', border: 'border-muted' }
};

export const DEFAULT_NODE_COLOR2: NodeColors = {
  bg: 'bg-muted',
  text: 'text-foreground',
  border: 'border-border'
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Dirección',
  2: 'Gerencia',
  3: 'Supervisión',
  4: 'Coordinación',
  5: 'Operativo'
};