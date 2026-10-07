"use client";

// Los permisos propios del año y cómo quedó el cupo anual de horas libres.
//
// El cupo sale de la jornada laboral del agente, y las horas que se pasan de
// ese cupo son las que hay que recuperar. Los totales vienen ya resueltos del
// backend: acá no se recalcula nada.

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";

interface PermisoPropio {
  id: number;
  fecha: string;
  exitTime: number;
  returnTime: number;
  horas: number;
  oficial: boolean;
}

interface MisPermisosResp {
  anio: number;
  cupoAnual: number;
  consumido: number;
  restante: number;
  deuda: number;
  permisos: PermisoPropio[];
  aniosConDatos: number[];
}

const fmtHoras = (h: number) => {
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  return `${horas}h ${String(min).padStart(2, "0")}m`;
};

/** El backend manda las horas del día como decimal: 10.5 es 10:30. */
const fmtHoraDelDia = (h: number) => {
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  return `${String(horas).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const ANIO_ACTUAL = new Date().getFullYear();

export default function MisPermisos() {
  const [anio, setAnio] = useState(ANIO_ACTUAL);
  const [datos, setDatos] = useState<MisPermisosResp | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    apiClient
      .get<MisPermisosResp>(`/asistencia/mis-permisos?anio=${anio}`)
      .then((r) => {
        // Guard contra respuestas de un año que ya no es el elegido.
        if (vigente) setDatos(r);
      })
      .catch((e) => {
        if (vigente) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar tus permisos");
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [anio]);

  const sinJornada = datos !== null && datos.cupoAnual === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl text-foreground mb-6">Mis permisos</h1>

      <div className="bg-card rounded-lg shadow-sm p-4 border border-border mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="anio-permisos" className="block text-sm font-medium text-foreground mb-1">
            Año
          </label>
          <select
            id="anio-permisos"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
          >
            {(datos?.aniosConDatos ?? [ANIO_ACTUAL]).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="p-8 text-center text-muted-foreground">
          <i className="pi pi-spin pi-spinner text-3xl mb-3" />
          <p>Cargando tus permisos…</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error">{error}</div>
      ) : datos === null ? null : (
        <>
          {sinJornada ? (
            <div className="mb-8 rounded-lg border border-warning bg-warning-soft p-4">
              <p className="font-semibold text-warning-soft-foreground">
                No tenés una jornada laboral asignada
              </p>
              <p className="mt-1 text-sm text-warning-soft-foreground">
                Por eso no tenés cupo de horas libres para permisos: cada permiso
                común se te cuenta entero como horas a recuperar. Los permisos
                oficiales no. Consultalo con Recursos Humanos.
              </p>
              {datos.deuda > 0 && (
                <p className="mt-2 text-sm text-warning-soft-foreground">
                  Este año acumulás <strong>{fmtHoras(datos.deuda)}</strong> a
                  recuperar por permisos.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border mb-8">
              <h2 className="font-heading text-lg text-foreground mb-4">
                Tu cupo de {datos.anio}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cupo del año</p>
                  <p className="text-2xl font-heading text-foreground">
                    {fmtHoras(datos.cupoAnual)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Usado</p>
                  <p className="text-2xl font-heading text-foreground">
                    {fmtHoras(datos.consumido)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Te queda</p>
                  <p className="text-2xl font-heading text-success">
                    {fmtHoras(datos.restante)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">A recuperar</p>
                  <p
                    className={`text-2xl font-heading ${
                      datos.deuda > 0 ? "text-error" : "text-muted-foreground"
                    }`}
                  >
                    {fmtHoras(datos.deuda)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {datos.restante > 0
                  ? "Mientras te quede cupo, los permisos no te descuentan horas."
                  : "Se te agotó el cupo del año: los permisos comunes que pidas ahora se cuentan como horas a recuperar."}
              </p>
              {datos.deuda > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Las horas a recuperar ya están incluidas en el saldo acumulado
                  que ves en Asistencia: no son una deuda aparte.
                </p>
              )}
            </div>
          )}

          <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
            <h2 className="font-heading text-lg text-foreground mb-4">
              Permisos de {datos.anio}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Salida</th>
                    <th className="py-2 pr-4">Retorno</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 text-right">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.permisos.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-foreground">{p.fecha}</td>
                      <td className="py-2 pr-4">{fmtHoraDelDia(p.exitTime)}</td>
                      <td className="py-2 pr-4">{fmtHoraDelDia(p.returnTime)}</td>
                      <td className="py-2 pr-4">
                        {p.oficial ? (
                          <span
                            className="rounded px-1.5 py-0.5 text-xs bg-info-soft text-info-soft-foreground"
                            title="No consume tu cupo ni genera horas a recuperar"
                          >
                            Oficial
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Común</span>
                        )}
                      </td>
                      <td className="py-2 text-right text-foreground">
                        {fmtHoras(p.horas)}
                      </td>
                    </tr>
                  ))}
                  {datos.permisos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No pediste permisos en {datos.anio}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
