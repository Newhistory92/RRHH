import React from 'react';
import { User } from 'lucide-react';
import { OrgNode } from '@/app/Interfas/Interfaces';
import { OrgChartUtils } from '@/app/util/orgChart.utils';

interface NodeCardProps {
  node: OrgNode;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
  const colors = OrgChartUtils.getNodeColors(node.nivel_jerarquico);
  const levelLabel = OrgChartUtils.getLevelLabel(node.nivel_jerarquico);

  return (
    <div className={`
      ${colors.bg} ${colors.text} ${colors.border}
      rounded-lg p-4 min-w-[200px] text-center shadow-lg border-2 
      hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1
      cursor-default
    `}>
      <div className="flex items-center justify-center mb-2">
        <User size={20} className="mr-2" />
        <span className="font-bold text-sm">{levelLabel}</span>
      </div>
      <p className="font-semibold text-base leading-tight">{node.nombre}</p>
      <p className="text-xs opacity-90 mt-1">ID: {node.id}</p>
    </div>
  );
};
