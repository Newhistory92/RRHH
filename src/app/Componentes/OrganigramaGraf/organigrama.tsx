// import React, { useState} from 'react';
// import {  ChevronDown, ChevronUp } from 'lucide-react';
// import  OrgNode  from '@/app/Interfas/Interfaces';


// export const OrgChartNode = ({ node }: { node: OrgNode }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const hasChildren = node.children && node.children.length > 0;

//   return (
//     <div className="relative pl-8">
//       {/* Línea vertical de conexión */}
//       <div className="absolute top-0 left-4 w-px h-full bg-gray-300 dark:bg-gray-600"></div>
//       {/* Línea horizontal de conexión */}
//       <div className="absolute top-7 left-4 w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      
//       <div className="relative flex items-center mb-4">
//         <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 inline-block z-10">
//           <p className="font-bold text-gray-800 dark:text-white">{node.name}</p>
//           <p className="text-sm text-blue-500">{node.position}</p>
//         </div>
//         {hasChildren && (
//           <button onClick={() => setIsOpen(!isOpen)} className="ml-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
//             {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//           </button>
//         )}
//       </div>

//       {hasChildren && isOpen && (
//         <div className="ml-4 border-l-2 border-gray-300 dark:border-gray-600">
//           {node.children?.map((child, index) => (
//             <OrgChartNode key={index} node={child} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };


import React from 'react';
import { OrgChartProps }from '@/app/Interfas/Interfaces';
import { useOrgChart } from '@/app/util/useOrgChart';
import { OrgHeader } from './OrgHeader';
import { OrgLegend } from './OrgLegend';
import { OrgChartNode } from './OrgChartNode';

export const OrgChart: React.FC<OrgChartProps> = ({ 
  data, 
  title = "Organigrama Organizacional",
  showLegend = true,
  showStats = true,
  className = ""
}) => {
  const { hierarchicalData, stats } = useOrgChart(data);

  return (
    <div className={`p-6 bg-gray-50 dark:bg-gray-900 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto">
        {showStats && <OrgHeader title={title} stats={stats} />}
        
        {showLegend && <OrgLegend levels={stats.nivelesUnicos} />}

        <div className="overflow-x-auto pb-8">
          <div className="flex justify-center min-w-max">
            <div className="space-y-8">
              {hierarchicalData.map(rootNode => (
                <OrgChartNode key={rootNode.id} node={rootNode} />
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