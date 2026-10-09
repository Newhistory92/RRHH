"use client";

// Carga de las horas de permiso que el agente ya usó antes de que el sistema
// las registrara. Cada carga es un asiento y el total es la suma: cargar 5 y
// después 10 da 15. Un asiento equivocado se corrige borrándolo, que es la
// única forma -no se editan en el lugar.
//
// Transitorio: existe para la migración, y se apaga quitándole el permiso al
// rol, sin tocar código.

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";

interface Asiento {
  id: number;
  horasConsumidas: number;
  cargadoPor: number | null;
  cargadoEn: string | null;
}

interface CargaInicialPermisos {
  anio: number;
  cupoAnual: number;
  total: number | null;
  asientos: Asiento[];
}

interface Props {
  employeeId: number;
  onCerrar: () => void;
}

const fmtHoras = (h: number) => `${h} h`;

export function CargaInicialPermisosPanel({ employeeId, onCerrar }: Props) {
  const [datos, setDatos] = useState<CargaInicialPermisos | null>(null);
  // Texto y no número: el campo tiene que distinguir vacío ("no se cargó
  // nada") de "0" ("se determinó que no usó ninguna"), y un input numérico
  // colapsa los dos casos.
  const [valor, setValor] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    const r = await apiClient.get<CargaInicialPermisos>(
      `/asistencia/carga-inicial-permisos/${employeeId}`
    );
    setDatos(r);
  }, [employeeId]);

  useEffect(() => {
    recargar()
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudo cargar el dato")
      )
      .finally(() => setCargando(false));
  }, [recargar]);

  // El input type="number" normalmente bloquea texto no numérico, pero un
  // valor pegado o un estado transitorio ("-", "e") puede colar un NaN.
  // Number(NaN) serializa a null en el body, lo que mandaría
  // horasConsumidas: null al backend.
  const valorInvalido = valor !== "" && Number.isNaN(Number(valor));

  const agregar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.post(`/asistencia/carga-inicial-permisos/${employeeId}`, {
        horasConsumidas: Number(valor),
      });
      // No se cierra el panel: RRHH suele cargar varios asientos de una
      // pasada y necesita ver el total actualizándose.
      setValor("");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar la carga");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (asientoId: number) => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.delete(
        `/asistencia/carga-inicial-permisos/${employeeId}/${asientoId}`
      );
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar la carga");
    } finally {
      setGuardando(false);
    }
  };

  const sinJornada = datos !== null && datos.cupoAnual === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="carga-inicial-permisos-titulo"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="carga-inicial-permisos-titulo"
          className="font-heading text-lg font-bold text-foreground mb-1"
        >
          Horas de permiso ya consumidas
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Horas que el agente ya usó este año antes de que el sistema las
          registrara. Cada carga se suma al total, y el total se descuenta de su
          cupo anual.
        </p>

        {cargando ? (
          <p className="text-sm text-muted-foreground py-4">Cargando…</p>
        ) : datos === null ? (
          <p className="text-sm text-error py-4">{error}</p>
        ) : (
          <>
            <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                Año <span className="text-foreground font-medium">{datos.anio}</span>
                {" · "}
                Cupo de su jornada{" "}
                <span className="text-foreground font-medium">
                  {fmtHoras(datos.cupoAnual)}
                </span>
                {" · "}
                Total cargado{" "}
                <span className="text-foreground font-medium">
                  {datos.total === null ? "sin cargar" : fmtHoras(datos.total)}
                </span>
              </p>
              {sinJornada && (
                <p className="text-warning-soft-foreground mt-1">
                  Este agente no tiene jornada laboral asignada, así que su cupo
                  es 0: todo permiso común ya le genera horas a recuperar.
                </p>
              )}
            </div>

            <h3 className="text-sm font-bold text-foreground mb-2">Cargas</h3>
            {datos.asientos.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">
                Todavía no se cargó ninguna.
              </p>
            ) : (
              <ul className="mb-4 divide-y divide-border border-y border-border">
                {datos.asientos.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="text-foreground font-medium">
                      {fmtHoras(a.horasConsumidas)}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">
                      {a.cargadoEn ? a.cargadoEn.slice(0, 10) : "—"}
                      {a.cargadoPor !== null && ` · legajo ${a.cargadoPor}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => borrar(a.id)}
                      disabled={guardando}
                      // Dos asientos pueden tener las mismas horas; la fecha
                      // es lo que distingue cuál se está por borrar.
                      aria-label={`Borrar la carga de ${fmtHoras(a.horasConsumidas)} del ${
                        a.cargadoEn ? a.cargadoEn.slice(0, 10) : "sin fecha"
                      }`}
                      className="text-error hover:opacity-80 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label
              htmlFor="horas-consumidas"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Agregar una carga
            </label>
            <div className="flex gap-2">
              <input
                id="horas-consumidas"
                type="number"
                min="0"
                max="2000"
                step="0.5"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Horas"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={agregar}
                disabled={guardando || valor === "" || valorInvalido}
                className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-md text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando…" : "Agregar"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cada carga se suma. Para corregir una equivocada, borrala de la
              lista y cargá la correcta.
            </p>

            {error && <p className="text-sm text-error mt-3">{error}</p>}

            <div className="flex pt-5">
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
