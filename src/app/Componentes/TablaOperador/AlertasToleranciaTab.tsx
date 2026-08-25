"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { Employee, JornadaDiaria, ResumenAbuso } from "@/app/Interfas/Interfaces";

const extremo = (j: JornadaDiaria) =>
  j.abusoEntrada && j.abusoSalida
    ? "Entrada y salida"
    : j.abusoEntrada
      ? "Entrada"
      : "Salida";

interface Props {
  employee: Employee;
}

export function AlertasToleranciaTab({ employee }: Props) {
  const [jornadas, setJornadas] = useState<JornadaDiaria[]>([]);
  const [abuso, setAbuso] = useState<ResumenAbuso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee.id) return;
    (async () => {
      try {
        const r = await apiClient.get<{
          jornadas: JornadaDiaria[];
          abuso: ResumenAbuso;
        }>(`/asistencia/empleado/${employee.id}`);
        setJornadas(r.jornadas);
        setAbuso(r.abuso);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudieron cargar las alertas");
      } finally {
        setCargando(false);
      }
    })();
  }, [employee.id]);

  if (!employee.biometricoId) {
    return (
      <div className="mt-6 p-6 bg-warning-soft rounded-lg border border-warning text-warning-soft-foreground">
        <p className="font-semibold mb-1">Sin ID de reloj asignado</p>
        <p className="text-sm">
          Este empleado no tiene un ID biométrico vinculado, así que no hay marcaciones que
          analizar.
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="mt-6 p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando alertas…</p>
      </div>
    );
  }

  if (error) {
    return <div className="mt-6 p-6 text-center text-error">{error}</div>;
  }

  const dias = jornadas.filter((j) => j.abusoEntrada || j.abusoSalida);

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-card rounded-lg border border-border p-5">
        <p className="text-xs text-muted-foreground mb-1">{employee.name}</p>
        <p
          className={`text-3xl font-heading ${
            abuso?.alerta ? "text-warning" : "text-foreground"
          }`}
        >
          {dias.length}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          días fuera del margen de {abuso?.toleranciaEstrictaEntradaMin} min a la entrada
          o {abuso?.toleranciaEstrictaSalidaMin} min a la salida
          {abuso?.alerta && ` — ${abuso.rachaMaxima} días seguidos`}
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-heading text-base text-foreground mb-4">
          Marcaciones fuera del margen
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Entrada</th>
                <th className="py-2 pr-4">Salida</th>
                <th className="py-2">Extremo</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((j) => (
                <tr key={j.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{j.fecha.slice(0, 10)}</td>
                  <td
                    className={`py-2 pr-4 ${
                      j.abusoEntrada ? "text-warning font-semibold" : ""
                    }`}
                  >
                    {j.entrada ? j.entrada.slice(11, 16) : "—"}
                  </td>
                  <td
                    className={`py-2 pr-4 ${
                      j.abusoSalida ? "text-warning font-semibold" : ""
                    }`}
                  >
                    {j.salida ? j.salida.slice(11, 16) : "—"}
                  </td>
                  <td className="py-2 text-muted-foreground">{extremo(j)}</td>
                </tr>
              ))}
              {dias.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    Sin marcaciones fuera del margen en el período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
