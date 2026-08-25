"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { JornadaDiaria, ResumenAbuso } from "@/app/Interfas/Interfaces";

const fmtHoras = (h: number) => {
  const signo = h < 0 ? "-" : h > 0 ? "+" : "";
  const abs = Math.abs(h);
  const horas = Math.floor(abs);
  const min = Math.round((abs - horas) * 60);
  return `${signo}${horas}h ${String(min).padStart(2, "0")}m`;
};

const ETIQUETA_ESTADO: Record<string, string> = {
  ok: "Normal",
  incompleta: "Incompleta",
  ausente: "Ausente",
  feriado: "No laborable",
  licencia: "Licencia",
  sin_horario: "Sin horario",
};

const fmtFechas = (fechas: string[]) =>
  fechas
    .map((f) => {
      const [, mes, dia] = f.split("-");
      return `${Number(dia)}/${Number(mes)}`;
    })
    .join(", ");

export default function MiAsistencia() {
  const [saldo, setSaldo] = useState(0);
  const [jornadas, setJornadas] = useState<JornadaDiaria[]>([]);
  const [abuso, setAbuso] = useState<ResumenAbuso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiClient.get<{
          saldoAcumulado: number;
          jornadas: JornadaDiaria[];
          abuso: ResumenAbuso;
        }>("/asistencia/mi");
        setSaldo(r.saldoAcumulado);
        setJornadas(r.jornadas);
        setAbuso(r.abuso);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar tu asistencia");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-3xl mb-3" />
        <p>Cargando tu asistencia…</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-error">{error}</div>;
  }

  const debe = saldo < 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl text-foreground mb-6">Mi asistencia</h1>

      {abuso?.alerta && (
        <div className="mb-6 rounded-lg border border-warning bg-warning-soft p-4">
          <p className="font-semibold text-warning-soft-foreground">
            Uso reiterado del margen de tolerancia
          </p>
          <p className="mt-1 text-sm text-warning-soft-foreground">
            Marcaste fuera del margen de {abuso.toleranciaEstrictaEntradaMin} minutos
            a la entrada o {abuso.toleranciaEstrictaSalidaMin} a la salida{" "}
            {abuso.rachaMaxima} días seguidos ({fmtFechas(abuso.fechasRachaMaxima)}).
            No se te descontaron horas: sigue estando dentro de la tolerancia.
          </p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border mb-8">
        <p className="text-sm text-muted-foreground mb-1">Saldo acumulado</p>
        <p className={`text-4xl font-heading ${debe ? "text-error" : "text-success"}`}>
          {fmtHoras(saldo)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {saldo === 0
            ? "Estás al día."
            : debe
              ? "Horas que debés recuperar."
              : "Horas a tu favor."}
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <h2 className="font-heading text-lg text-foreground mb-4">Desglose diario</h2>
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
                      <span className="ml-1 text-xs text-muted-foreground">(manual)</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {j.salida ? j.salida.slice(11, 16) : "—"}
                    {j.salidaManual && (
                      <span className="ml-1 text-xs text-muted-foreground">(manual)</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {ETIQUETA_ESTADO[j.estado] ?? j.estado}
                    {(j.abusoEntrada || j.abusoSalida) && (
                      <span
                        className="ml-2 rounded px-1.5 py-0.5 text-xs bg-warning-soft text-warning-soft-foreground"
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
                      j.saldoDia < 0
                        ? "text-error"
                        : j.saldoDia > 0
                          ? "text-success"
                          : "text-muted-foreground"
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
