import { Card } from '@/app/Componentes/Card';
import { OrgChartNode } from '@/app/Componentes/OrganigramaGraf/organigrama';
import { orgChartData } from '@/app/api/Prueba';

export const OrganigramaPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Organigrama de la Empresa</h2>
    <Card>
      <div className="p-4">
        <OrgChartNode node={orgChartData} />
      </div>
    </Card>
  </div>
);