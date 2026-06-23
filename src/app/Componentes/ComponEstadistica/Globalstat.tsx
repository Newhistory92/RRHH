"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Award, Users, Frown, AlertTriangle, Clock } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalStatsData } from '@/app/Interfas/Interfaces';
import { ProgressSpinner } from 'primereact/progressspinner';

interface GlobalStatsProps {
  data: GlobalStatsData | null;
  isLoading: boolean;
  error: string | null;
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-error">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>Error al cargar las estadísticas globales: {error}</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { bestDepartment, lowEfficiencyActivities, avgAbsences, avgLateness, statusDistribution, departmentProductivity } = data;
  const PIE_COLORS = ['var(--primary)', 'var(--accent)', 'var(--warm-contrast)', 'var(--secondary)'];
  const departmentProductivityData = departmentProductivity;
  const tooltipStyle = { backgroundColor: 'var(--popover)', border: 'none', borderRadius: '0.5rem', color: 'var(--popover-foreground)' };
  const tooltipTextStyle = { color: 'var(--popover-foreground)' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        className="flex flex-col items-center justify-center text-center text-primary-foreground border-none"
        style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--warm-contrast))' }}
      >
        <CardHeader className="items-center justify-items-center">
          <Award className="h-12 w-12 opacity-80" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-primary-foreground">Mejor Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{bestDepartment.name}</p>
          <p className="text-lg font-medium opacity-90">Promedio: {bestDepartment.avg}</p>
        </CardContent>
      </Card>

      <Card
        className="flex flex-col items-center justify-center text-center border-none"
        style={{ background: 'linear-gradient(to bottom right, var(--secondary), var(--muted))' }}
      >
        <CardHeader className="items-center justify-items-center">
          <Frown className="h-12 w-12 opacity-80 text-foreground" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-foreground">Ausencias (Promedio/Año)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground">{avgAbsences}</p>
        </CardContent>
      </Card>

      <Card className="flex flex-col items-center justify-center text-center bg-card">
        <CardHeader className="items-center justify-items-center">
          <Clock className="h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-sm font-light uppercase tracking-widest text-muted-foreground">Tardanzas (Promedio/Año)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground">{avgLateness}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-10 w-10 text-warm-contrast" />
            Actividades de Baja Eficiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowEfficiencyActivities.length > 0 ? (
            <ul className="space-y-2">
              {lowEfficiencyActivities.map((act) => (
                <li key={act.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{act.name}</span>
                  <span className="font-bold text-error">{act.avg.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Todas las actividades tienen buena eficiencia.</p>}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-primary" />
            <span>Productividad Promedio por Departamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentProductivityData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} />
              <Legend />
              <Bar dataKey="productividad" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            <span>Distribución por Estado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="var(--primary)" dataKey="value" nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-(midAngle ?? 0) * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-(midAngle ?? 0) * (Math.PI / 180));
                  return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${((percent ?? 0) * 100).toFixed(0)}%`}</text>;
                }}>
                {statusDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
