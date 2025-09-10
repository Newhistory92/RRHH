import { useMemo } from 'react';
import { OrgData } from '@/app/Interfas/Interfaces';
import { OrgChartUtils } from './orgChart.utils';

interface NodeConnectionsProps {
  hasChildren: boolean;
  isOpen: boolean;
}

export const useOrgChart = (data: OrgData[]) => {
  return useMemo(() => ({
    hierarchicalData: OrgChartUtils.buildHierarchy(data),
    stats: OrgChartUtils.calculateStats(data)
  }), [data]);
};



export const NodeConnections: React.FC<NodeConnectionsProps> = ({ 
  hasChildren, 
  isOpen 
}) => {
  if (!hasChildren || !isOpen) return null;

  return (
    <div className="relative">
      {/* Línea vertical de conexión */}
      <div 
        className="w-0.5 h-8 bg-gray-400 dark:bg-gray-500"
        role="presentation"
        aria-hidden="true"
      />
      {/* Línea horizontal de distribución */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gray-400 dark:bg-gray-500"
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
};