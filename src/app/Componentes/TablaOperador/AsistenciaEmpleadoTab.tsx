"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { Employee, JornadaDiaria, ResumenAbuso } from "@/app/Interfas/Interfaces";

const fmtHoras = (h: number) => {
  const signo = h < 0 ? "-" : h > 0 ? "+" : "";
  const abs = Math.abs(h);
  const horas = Math.floor(abs);
  const min = Math.round((abs - horas) * 60);
  return `${signo}${horas}h ${String(min).padStart(2, "0")}m`;
};

const ETIQUETA: Record<string, string> = {
  ok: "Normal",
  incompleta: "Incompleta",
  ausente: "Ausente",
  feriado: "No laborable",
  licencia: "Licencia",
  sin_horario: "Sin horario",
};

const COLOR_ESTADO: Record<string, string> = {
  ausente: "text-error",
  incompleta: "text-warning",
  feriado: "text-muted-foreground",
  licencia: "text-info",
  ok: "text-success",
  sin_horario: "text-muted-foreground",
};

interface Props {
  employee: Employee;
}

export function AsistenciaEmpleadoTab({ employee }: Props) {
  const [saldo, setSaldo] = useState<number>(0);
  const [jornadas, setJornadas] = useState<JornadaDiaria[]>([]);
  const [abuso, setAbuso] = useState<ResumenAbuso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee.id) return;
    (async () => {
      try {
        const r = await apiClient.get<{
          saldoAcumulado: number;
          jornadas: JornadaDiaria[];
          abuso: ResumenAbuso;
        }>(`/asistencia/empleado/${employee.id}`);
        setSaldo(r.saldoAcumulado);
        setJornadas(r.jornadas);
        setAbuso(r.abuso);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la asistencia");
      } finally {
        setCargando(false);
      }
    })();
  }, [employee.id]);

  if (!employee.biometricoId) {
    return (
      <div className="mt-6 p-6 bg-card rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
        <p className="font-semibold mb-1">Sin ID de reloj asignado</p>
        <p className="text-sm">
          Este empleado no tiene un ID biométrico vinculado. Asignalo en la pestaña Perfil para
          que el módulo de asistencia empiece a registrar sus marcaciones.
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="mt-6 p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando asistencia…</p>
      </div>
    );
  }

  if (error) {
    return <div className="mt-6 p-6 text-center text-error">{error}</div>;
  }

  const debe = saldo < 0;
  const ausencias = jornadas.filter((j) => j.estado === "ausente").length;
  const incompletas = jornadas.filter((j) => j.estado === "incompleta").length;

  return (
    <div className="mt-6 space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Saldo acumulado</p>
          <p className={`text-3xl font-heading ${debe ? "text-error" : "text-success"}`}>
            {fmtHoras(saldo)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {saldo === 0 ? "Al día" : debe ? "Horas a recuperar" : "Horas a favor"}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Ausencias</p>
          <p className={`text-3xl font-heading ${ausencias > 0 ? "text-error" : "text-foreground"}`}>
            {ausencias}
          </p>
          <p className="text-xs text-muted-foreground mt-1">días sin marcar</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Incompletas</p>
          <p className={`text-3xl font-heading ${incompletas > 0 ? "text-warning" : "text-foreground"}`}>
            {incompletas}
          </p>
          <p className="text-xs text-muted-foreground mt-1">jornadas parciales</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Días con tolerancia</p>
          <p className={`text-3xl font-heading ${abuso?.alerta ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
            {abuso?.diasAbuso ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {abuso?.alerta
              ? `${abuso.rachaMaxima} días seguidos`
              : "fuera del margen estricto"}
          </p>
        </div>
      </div>

      {/* Desglose diario */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-heading text-base text-foreground mb-4">Desglose diario</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Entrada</th>
                <th className="py-2 pr-4">Salida</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4 text-right">Trabajadas</th>
                <th className="py-2 pr-4 text-right">Requeridas</th>
                <th className="py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {jornadas.map((j) => (
                <tr key={j.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{j.fecha.slice(0, 10)}</td>
                  <td className="py-2 pr-4">
                    {j.entrada ? j.entrada.slice(11, 16) : "—"}
                    {j.entradaManual && (
                      <span className="ml-1 text-xs text-muted-foreground">(m)</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {j.salida ? j.salida.slice(11, 16) : "—"}
                    {j.salidaManual && (
                      <span className="ml-1 text-xs text-muted-foreground">(m)</span>
                    )}
                  </td>
                  <td className={`py-2 pr-4 ${COLOR_ESTADO[j.estado] ?? ""}`}>
                    {ETIQUETA[j.estado] ?? j.estado}
                    {(j.abusoEntrada || j.abusoSalida) && (
                      <span
                        className="ml-2 rounded px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                        title={
                          j.abusoEntrada && j.abusoSalida
                            ? "Fuera del margen en la entrada y en la salida"
                            : j.abusoEntrada
                              ? "Fuera del margen en la entrada"
                              : "Fuera del margen en la salida"
                        }
                      >
                        margen
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right">{j.horasTrabajadas.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right">{j.horasRequeridas.toFixed(2)}</td>
                  <td
                    className={`py-2 text-right ${
                      j.saldoDia < 0 ? "text-error" : j.saldoDia > 0 ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {fmtHoras(j.saldoDia)}
                  </td>
                </tr>
              ))}
              {jornadas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Todavía no hay jornadas registradas.
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
