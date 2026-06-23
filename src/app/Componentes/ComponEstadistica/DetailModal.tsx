/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {getScoreColor, SoftSkillBar } from '@/app/util/UiRRHH';
import {  X,  BarChart2, Star,  Briefcase, Calendar, MessageSquareWarning, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return null;
  }

const currentYear = String(new Date().getFullYear());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={24} />
        </button>

        <div className="p-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center mb-6">

            <div className={`p-2 rounded-full ${getScoreColor(remoteEmployee?.productivityScore)} mr-6`}>
              <div className="bg-card rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-foreground">
                {remoteEmployee?.productivityScore.toFixed(1)}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">
                 {remoteEmployee?.name}
              </h2>

              <p className="text-lg text-muted-foreground">
    {remoteEmployee?.department?.nombre ?? "Depende Directamente"}
    {" / "}
    {remoteEmployee?.office?.nombre ?? "Depende Directamente"}
  </p>

  <p className="text-sm text-primary font-semibold">
    Categoría: {remoteEmployee?.condicionLaboral?.categoria ?? "-"}
    {" • "}
    {remoteEmployee?.licenciaActiva?.status ?? "-"}
  </p>

              {loading && (
                <p className="text-sm text-primary mt-2">
                  Cargando datos...
                </p>
              )}

              {error && (
                <p className="text-sm text-error mt-2">
                  {error}
                </p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Horas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="text-primary" />
                  Horas a Favor/Contra
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const horas = remoteEmployee?.horas;
                  if (horas === null || horas === undefined) {
                    return (
                      <p className="text-muted-foreground">
                        Sin saldo de horas registrado.
                      </p>
                    );
                  }
                  const isPositive = horas >= 0;
                  return (
                    <div className="flex items-baseline gap-3">
                      <span className={`text-4xl font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
                        {isPositive ? '+' : ''}{horas.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        {isPositive ? 'horas a favor' : 'horas en contra'}
                      </span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="text-warm-contrast" />
                  Feedback del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>

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
                <p className="text-muted-foreground">
                  Sin feedback registrado.
                </p>
              )}

              </CardContent>
            </Card>

            {/* Productividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="text-accent" />
                  Productividad por Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>

              {(remoteEmployee?.tasks || []).length > 0 ? (
                <ul>

                  {(remoteEmployee?.tasks || []).map(
                    (task: { name: string; productivity: number }) => (

                      <li
                        key={task.name}
                        className="flex justify-between items-center py-2 border-b border-border"
                      >
                        <span className="text-muted-foreground">
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
                <p className="text-muted-foreground">
                  Sin tareas registradas.
                </p>
              )}

              </CardContent>
            </Card>

            {/* Licencias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="text-primary" />
                  Licencias y Faltas (Anual)
                </CardTitle>
              </CardHeader>
              <CardContent>

              <div className="space-y-4">

                <div>
                  <p className="text-muted-foreground">
                    Licencias tomadas
                  </p>

                  <p className="text-2xl font-bold text-foreground">
  {remoteEmployee?.licenses?.[currentYear] || 0}
  <span className="text-base font-normal text-muted-foreground">
    {' '}en {currentYear}
  </span>
</p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Faltas
                  </p>

                  <p className="text-2xl font-bold text-foreground">
                    {remoteEmployee?.absences?.['2024'] || 0}
                    <span className="text-base font-normal text-muted-foreground">
                      {' '}en 2024
                    </span>
                  </p>
                </div>

              </div>

              </CardContent>
            </Card>

            {/* Quejas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareWarning className="text-error" />
                  Quejas Recibidas
                </CardTitle>
              </CardHeader>
              <CardContent>

              <p className="text-4xl font-bold text-error mb-2">
                {(remoteEmployee?.complaints || []).length}
              </p>

              {(remoteEmployee?.complaints || []).length > 0 ? (

                <ul className="list-disc list-inside text-muted-foreground space-y-1">

                  {(remoteEmployee?.complaints || []).map(
                    (c: { id: string | number; reason: string }) => (
                      <li key={c.id}>
                        {c.reason}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p className="text-muted-foreground">
                  Sin quejas registradas.
                </p>

              )}

              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
};
