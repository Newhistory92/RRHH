/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {getScoreColor, SoftSkillBar } from '@/app/util/UiRRHH';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, } from 'recharts';
import {  X,  BarChart2, Star,  Briefcase, Calendar, MessageSquareWarning, } from 'lucide-react';
import { Card } from 'primereact/card';
import { Employee } from '@/app/Interfas/Interfaces';
import { useEffect, useState } from 'react';
export const EmployeeDetailModal: React.FC<{
  employee: Employee | null;
  onClose: () => void;
}> = ({ employee, onClose }) => {

  const [remoteEmployee, setRemoteEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // Hooks SIEMPRE arriba
  useEffect(() => {
    
    if (!employee) {
      return;
    }

    if (!employee.id) {
      return;
    }

    const controller = new AbortController();

    const fetchEmployee = async () => {
      try {

        setLoading(true);
        setError(null);

        const url = `http://127.0.0.1:8000/employee/${employee.id}`;

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log("✅ Empleado remoto:", data);

        setRemoteEmployee(data);

      } catch {
        if (controller.signal.aborted) {
          console.log("⚠️ Fetch abortado");
        } else {
          console.error("❌ Error al cargar empleado remoto:", error);
          setError("No se pudieron cargar los datos remotos.");
        }
      } finally {

        setLoading(false);
      }
    };

    fetchEmployee();

  }, [employee]);

  if (!employee) {
    console.log("⛔ RETURN NULL");
    return null;
  }

const currentYear = String(new Date().getFullYear());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <div className="p-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center mb-6">

            <div className={`p-2 rounded-full ${getScoreColor(remoteEmployee?.productivityScore)} mr-6`}>
              <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-gray-800 dark:text-white">
                {remoteEmployee?.productivityScore.toFixed(1)}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                 {remoteEmployee?.name}
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400">
    {remoteEmployee?.department?.nombre ?? "Depende Directamente"}
    {" / "}
    {remoteEmployee?.office?.nombre ?? "Depende Directamente"}
  </p>

  <p className="text-sm text-indigo-500 font-semibold">
    Categoría: {remoteEmployee?.condicionLaboral?.categoria ?? "-"}
    {" • "}
    {remoteEmployee?.licenciaActiva?.status ?? "-"}
  </p>

              {loading && (
                <p className="text-sm text-blue-500 mt-2">
                  Cargando datos...
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Horas */}
            <Card
              className="lg:col-span-2"
              title={
                <div className="flex items-center gap-2">
                  <BarChart2 className="text-blue-500" />
                  Horas a Favor/Contra por Mes
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={250}>

                <BarChart
                  data={remoteEmployee?.monthlyHours || []}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                  />

                  <Bar dataKey="hours" name="Horas">

                    {(remoteEmployee?.monthlyHours || []).map(
                      (entry: { hours: number }, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.hours >= 0 ? '#10b981' : '#ef4444'}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>
            </Card>

            {/* Feedback */}
            <Card
              title={
                <div className="flex items-center gap-2 text-lg">
                  <Star className="text-yellow-500" />
                  Feedback del Equipo
                </div>
              }
            >

              {(remoteEmployee?.softSkills || []).length > 0 ? (
                (remoteEmployee?.softSkills || []).map(
                  (skill, index: number) => (
                    <SoftSkillBar
                      key={index}
                      skill={skill.nombre}
                      score={skill.level}
                    />
                  )
                )
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Sin feedback registrado.
                </p>
              )}

            </Card>

            {/* Productividad */}
            <Card
              title={
                <div className="flex items-center gap-2 text-lg">
                  <Briefcase className="text-green-500" />
                  Productividad por Tarea
                </div>
              }
            >

              {(remoteEmployee?.tasks || []).length > 0 ? (
                <ul>

                  {(remoteEmployee?.tasks || []).map(
                    (task: { name: string; productivity: number }) => (

                      <li
                        key={task.name}
                        className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-gray-600 dark:text-gray-300">
                          {task.name}
                        </span>

                        <span className={`font-bold px-2 py-1 rounded-md text-white text-sm ${getScoreColor(task.productivity)}`}>
                          {task.productivity.toFixed(1)}
                        </span>
                      </li>

                    )
                  )}

                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Sin tareas registradas.
                </p>
              )}

            </Card>

            {/* Licencias */}
            <Card
              title={
                <div className="flex items-center gap-2 text-lg">
                  <Calendar className="text-purple-500" />
                  Licencias y Faltas (Anual)
                </div>
              }
            >

              <div className="space-y-4">

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Licencias tomadas
                  </p>

                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
  {remoteEmployee?.licenses?.[currentYear] || 0}
  <span className="text-base font-normal text-gray-500">
    {' '}en {currentYear}
  </span>
</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Faltas
                  </p>

                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {remoteEmployee?.absences?.['2024'] || 0}
                    <span className="text-base font-normal text-gray-500">
                      {' '}en 2024
                    </span>
                  </p>
                </div>

              </div>

            </Card>

            {/* Quejas */}
            <Card
              title={
                <div className="flex items-center gap-2 text-lg">
                  <MessageSquareWarning className="text-orange-500" />
                  Quejas Recibidas
                </div>
              }
            >

              <p className="text-4xl font-bold text-orange-500 mb-2">
                {(remoteEmployee?.complaints || []).length}
              </p>

              {(remoteEmployee?.complaints || []).length > 0 ? (

                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">

                  {(remoteEmployee?.complaints || []).map(
                    (c: { id: string | number; reason: string }) => (
                      <li key={c.id}>
                        {c.reason}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p className="text-gray-500 dark:text-gray-400">
                  Sin quejas registradas.
                </p>

              )}

            </Card>

          </div>

        </div>
      </div>
    </div>
  );
};