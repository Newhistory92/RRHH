"use client"
import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Dropdown } from 'primereact/dropdown';
import { apiClient } from '@/app/util/apiClient';
import type { Department } from '@/app/Interfas/Interfaces';

interface CategoriaRadar {
  categoria: string;
  promedioArea: number | null;
  promedioInstitucional: number | null;
}

interface CategoriaPromedio {
  categoria: string;
  promedio: number;
}

interface EstadisticasGlobalesData {
  departmentId: number;
  radar: CategoriaRadar[];
  fortalezasArea: CategoriaPromedio[];
  debilidadesArea: CategoriaPromedio[];
}

export const Feedback360Stats = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [data, setData] = useState<EstadisticasGlobalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ departments: Department[] }>('/departments/')
      .then((res) => {
        const depts = res.departments;
        setDepartments(depts);
        if (depts.length > 0) setSelectedDeptId(depts[0].id);
        else setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar departamentos:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedDeptId === null) return;
    setLoading(true);
    apiClient
      .get<EstadisticasGlobalesData>(`/feedback/estadisticas-globales?departmentId=${selectedDeptId}`)
      .then(setData)
      .catch((err) => console.error('Error al cargar estadisticas globales de Feedback 360:', err))
      .finally(() => setLoading(false));
  }, [selectedDeptId]);

  const departmentOptions = departments.map((d) => ({ label: d.nombre, value: d.id }));
  const tieneDatos = data !== null && data.radar.some((r) => r.promedioArea !== null);

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <label className="block text-sm font-semibold text-foreground mb-1">Departamento</label>
        <Dropdown
          value={selectedDeptId}
          options={departmentOptions}
          onChange={(e) => setSelectedDeptId(e.value)}
          placeholder="Seleccioná un departamento"
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Cargando estadísticas...</div>
      ) : !tieneDatos ? (
        <div className="p-6 text-center text-muted-foreground">
          Este departamento todavía no tiene evaluaciones de Feedback 360°.
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-heading font-semibold text-foreground mb-3">Radar de habilidades</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={data!.radar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="categoria" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Área seleccionada" dataKey="promedioArea" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                <Radar name="Institucional" dataKey="promedioInstitucional" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-heading font-semibold text-foreground mb-3">Fortalezas del área</h3>
              {data!.fortalezasArea.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin datos suficientes.</p>
              ) : (
                <ul className="space-y-2">
                  {data!.fortalezasArea.map((f) => (
                    <li key={f.categoria} className="flex justify-between text-sm">
                      <span className="text-foreground">{f.categoria}</span>
                      <span className="font-semibold text-success">{f.promedio.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-heading font-semibold text-foreground mb-3">Debilidades del área</h3>
              {data!.debilidadesArea.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin datos suficientes.</p>
              ) : (
                <ul className="space-y-2">
                  {data!.debilidadesArea.map((d) => (
                    <li key={d.categoria} className="flex justify-between text-sm">
                      <span className="text-foreground">{d.categoria}</span>
                      <span className="font-semibold text-error">{d.promedio.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
