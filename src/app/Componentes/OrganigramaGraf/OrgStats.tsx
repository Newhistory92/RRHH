import React from 'react';
import { Users, TrendingUp, Building2 } from 'lucide-react';
import { OrgStats as OrgStatsType }  from '@/app/Interfas/Interfaces';

interface OrgStatsProps {
  stats: OrgStatsType;
}

export const OrgStats: React.FC<OrgStatsProps> = ({ stats }) => (
  <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
    <div className="flex items-center gap-2">
      <Users size={16} />
      <span>Total: {stats.totalNodos}</span>
    </div>
    <div className="flex items-center gap-2">
      <TrendingUp size={16} />
      <span>Niveles: {stats.maxNivel}</span>
    </div>
    <div className="flex items-center gap-2">
      <Building2 size={16} />
      <span>Estructura: {stats.nivelesUnicos.join(' → ')}</span>
    </div>
  </div>
);
