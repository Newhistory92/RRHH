import React from 'react';
import { OrgChartUtils }  from '@/app/util/orgChart.utils';

interface OrgLegendProps {
  levels: number[];
  colorTheme: string;
}

export const OrgLegend: React.FC<OrgLegendProps> = ({ levels,colorTheme }) => (
  <div className="flex justify-center mb-8">
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3 text-center">
        Leyenda de Niveles
      </h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {levels.map(level => {
          const colors = OrgChartUtils.getNodeColors(level,colorTheme);
          const label = OrgChartUtils.getLevelLabel(level);
          return (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${colors.bg} rounded border`}></div>
              <span className="text-xs text-muted-foreground">
                Nivel {level} - {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
