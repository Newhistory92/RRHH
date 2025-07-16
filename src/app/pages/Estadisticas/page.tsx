
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/app/Componentes/Card';
import { productivityData, absenceData, delayData, COLORS } from '../../api/Prueba';




export const EstadisticasPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Estadísticas Clave</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Evolución de Productividad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#E2E8F0' }} />
            <Legend />
            <Line type="monotone" dataKey="Productividad" stroke="#4299E1" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Tardanzas por Departamento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={delayData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {delayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#E2E8F0' }}/>
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card className="lg:col-span-3">
        <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Reporte Semanal de Ausencias</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={absenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#E2E8F0' }} />
            <Legend />
            <Bar dataKey="Ausencias" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>
);