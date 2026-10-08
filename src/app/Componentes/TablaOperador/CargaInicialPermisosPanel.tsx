"use client";

// Carga de las horas de permiso que el agente ya usó antes de que el sistema
// las registrara. Transitorio: existe para la migración, y se apaga quitándole
// el permiso al rol, sin tocar código.

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";

interface CargaInicialPermisos {
  anio: number;
  cupoAnual: number;
  horasConsumidas: number | null;
  cargadoPor: number | null;
  cargadoEn: string | null;
}

interface Props {
  employeeId: number;
  onCerrar: () => void;
}

export function CargaInicialPermisosPanel({ employeeId, onCerrar }: Props) {
  const [datos, setDatos] = useState<CargaInicialPermisos | null>(null);
  // Texto y no número: el campo tiene que distinguir vacío ("no se cargó
  // nada") de "0" ("se determinó que no usó ninguna"), y un input numérico
  // colapsa los dos casos.
  const [valor, setValor] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<CargaInicialPermisos>(`/asistencia/carga-inicial-permisos/${employeeId}`)
      .then((r) => {
        setDatos(r);
        setValor(r.horasConsumidas === null ? "" : String(r.horasConsumidas));
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudo cargar el dato")
      )
      .finally(() => setCargando(false));
  }, [employeeId]);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.put(`/asistencia/carga-inicial-permisos/${employeeId}`, {
        horasConsumidas: Number(valor),
      });
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
      setGuardando(false);
    }
  };

  const sinJornada = datos !== null && datos.cupoAnual === 0;
  // El input type="number" normalmente bloquea texto no numérico, pero un
  // valor pegado o un estado transitorio ("-", "e") puede colar un NaN.
  // Number(NaN) serializa a null en el body, lo que mandaría
  // horasConsumidas: null al backend y rompería la distinción null/0.
  const valorInvalido = valor !== "" && Number.isNaN(Number(valor));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="carga-inicial-permisos-titulo"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
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
          registrara. Se descuentan de su cupo anual.
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
                  {datos.cupoAnual} h
                </span>
              </p>
              {sinJornada && (
                <p className="text-warning-soft-foreground mt-1">
                  Este agente no tiene jornada laboral asignada, así que su cupo
                  es 0: todo permiso común ya le genera horas a recuperar.
                </p>
              )}
            </div>

            <label
              htmlFor="horas-consumidas"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Horas ya consumidas
            </label>
            <input
              id="horas-consumidas"
              type="number"
              min="0"
              max="2000"
              step="0.5"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Sin cargar"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Dejarlo vacío significa que todavía no se revisó. Cargar 0 afirma
              que no usó ninguna.
            </p>

            {datos.cargadoEn && (
              <p className="text-xs text-muted-foreground mt-3">
                Última carga: {datos.cargadoEn.slice(0, 10)}
                {datos.cargadoPor !== null && ` · legajo ${datos.cargadoPor}`}
              </p>
            )}

            {error && <p className="text-sm text-error mt-3">{error}</p>}

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardar}
                disabled={guardando || valor === "" || valorInvalido}
                className="flex-1 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
