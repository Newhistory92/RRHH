
import React, { useState } from 'react';
import { OrgChartProps }from '@/app/Interfas/Interfaces';
import { useOrgChart } from '@/app/util/useOrgChart';
import { OrgHeader } from './OrgHeader';
import { OrgLegend } from './OrgLegend';
import { OrgChartNode } from './OrgChartNode';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
export const OrgChart: React.FC<OrgChartProps> = ({ 
  data, 
  title = "Organigrama Organizacional",
  showLegend = true,
  showStats = true,
  className = ""
}) => {
  const { hierarchicalData, stats } = useOrgChart(data);
    const options: string[] = ['Oscuro', 'Claro'];
    const [colorTheme, setColorTheme] = useState<string>(options[0]);

return (
    <div className={`p-6 bg-gray-50 dark:bg-gray-900 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute top-0 right-0 z-10">
          <SelectButton 
            value={colorTheme} 
            onChange={(e: SelectButtonChangeEvent) => setColorTheme(e.value)} 
            options={options} 
            className="text-xs p-selectbutton-sm"
          
          />
        </div>

        {showStats && <OrgHeader title={title} stats={stats} />}
        
        {showLegend && <OrgLegend levels={stats.nivelesUnicos} colorTheme={colorTheme} />}

        <div className="overflow-x-auto pb-8 mt-4"> {/* Añadido mt-4 para separar del SelectButton */}
          <div className="flex justify-center min-w-max">
            <div className="space-y-8">
              {hierarchicalData.map(rootNode => (
                <OrgChartNode key={rootNode.id} node={rootNode} colorTheme={colorTheme}/>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Haz clic en los botones con chevrones para expandir/contraer las ramas del organigrama</p>
        </div>
      </div>
    </div>
  );
};