import React, { useState } from 'react';
import { OrgNode }  from '@/app/Interfas/Interfaces';
import { NodeCard } from './NodeCard';
import { ExpandButton } from './ExpandButton';
import { NodeConnections } from '@/app/util/useOrgChart';

interface OrgChartNodeProps {
  node: OrgNode;
  colorTheme: string;
}

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, colorTheme }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = !!(node.children && node.children.length > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <NodeCard node={node} colorTheme={colorTheme} />
        <ExpandButton 
          isOpen={isOpen} 
          onToggle={() => setIsOpen(!isOpen)} 
          hasChildren={hasChildren} 
        />
      </div>

      <NodeConnections hasChildren={hasChildren} isOpen={isOpen} />

      {hasChildren && isOpen && (
        <div className="relative">
          <div className="flex gap-8 pt-4">
            {node.children?.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-400 dark:bg-gray-500"></div>
                <div className="pt-4">
                  <OrgChartNode node={child} colorTheme={colorTheme} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};