import React from 'react';

interface CapacityBadgeProps {
  asignados?: number;
  capacidadRequerida?: number | null;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ asignados = 0, capacidadRequerida }) => {
  if (capacidadRequerida == null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        {asignados}
      </span>
    );
  }

  const claseColor =
    asignados > capacidadRequerida
      ? 'bg-error-soft text-error-soft-foreground border-error'
      : asignados === capacidadRequerida
      ? 'bg-warning-soft text-warning-soft-foreground border-warning'
      : 'bg-success-soft text-success-soft-foreground border-success';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${claseColor}`}>
      {asignados}/{capacidadRequerida}
    </span>
  );
};
