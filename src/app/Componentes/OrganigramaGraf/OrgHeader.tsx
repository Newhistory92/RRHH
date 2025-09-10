import React from 'react';
import { Building2 } from 'lucide-react';
import { OrgStatsType }   from '@/app/Interfas/Interfaces';
import { OrgStats } from './OrgStats';

interface OrgHeaderProps {
  title: string;
  stats: OrgStatsType;
}

export const OrgHeader: React.FC<OrgHeaderProps> = ({ title, stats }) => (
  <div className="text-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-3">
      <Building2 size={32} className="text-blue-500" />
      {title}
    </h1>
    <OrgStats stats={stats} />
  </div>
);
