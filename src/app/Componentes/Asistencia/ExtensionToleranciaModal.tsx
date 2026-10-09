"use client";

// Extensión de tolerancia para un día puntual. Aplica solo a los agentes
// marcados como "fuera del anillo de Circunvalación"; el resto mantiene sus
// 15 minutos haya o no extensión cargada.
//
// El valor reemplaza los 15 minutos, no se suma: lo que se carga acá es el
// número final que va a regir ese día.

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";

interface Extension {
  id: number;
  fecha: string;
  toleranciaEntradaMin: number;
  toleranciaSalidaMin: number | null;
  cargadoPor: number | null;
  cargadoEn: string | null;
}

interface Props {
  onCerrar: () => void;
}

/** Strings de horas/minutos (pueden venir vacíos) -> minutos totales.
 *  Dos inputs numéricos en vez de un <input type="time">: el picker nativo
 *  de Windows/Chrome fuerza un scroll sin dejar tipear el valor a mano. */
const aMinutos = (horas: string, minutos: string) =>
  (horas === "" ? 0 : Number(horas)) * 60 + (minutos === "" ? 0 : Number(minutos));

const fmtMinutos = (min: number) => {
  const h = Math.floor(min / 60);
  return h > 0 ? `${h}h ${String(min % 60).padStart(2, "0")}m` : `${min}m`;
};

/** Hoy en local, para el min del calendario. toISOString() daría UTC y en
 *  Argentina adelantaría un día después de las 21:00. */
const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ExtensionToleranciaModal({ onCerrar }: Props) {
  const [extensiones, setExtensiones] = useState<Extension[]>([]);
  const [fecha, setFecha] = useState("");
  const [entradaHoras, setEntradaHoras] = useState("");
  const [entradaMinutos, setEntradaMinutos] = useState("");
  const [salidaHoras, setSalidaHoras] = useState("");
  const [salidaMinutos, setSalidaMinutos] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    const r = await apiClient.get<{ extensiones: Extension[] }>(
      "/asistencia/extensiones-tolerancia"
    );
    setExtensiones(r.extensiones);
  }, []);

  useEffect(() => {
    recargar()
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudieron cargar")
      )
      .finally(() => setCargando(false));
  }, [recargar]);

  const salidaCargada = salidaHoras !== "" || salidaMinutos !== "";

  const agregar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.post("/asistencia/extensiones-tolerancia", {
        fecha,
        toleranciaEntradaMin: aMinutos(entradaHoras, entradaMinutos),
        toleranciaSalidaMin: salidaCargada
          ? aMinutos(salidaHoras, salidaMinutos)
          : null,
      });
      // No se cierra: RRHH puede cargar varias y ver la lista actualizarse.
      setFecha("");
      setEntradaHoras("");
      setEntradaMinutos("");
      setSalidaHoras("");
      setSalidaMinutos("");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la extensión");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id: number) => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.delete(`/asistencia/extensiones-tolerancia/${id}`);
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar la extensión");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="extension-tolerancia-titulo"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="extension-tolerancia-titulo"
          className="font-heading text-lg font-bold text-foreground mb-1"
        >
          Extender tolerancia
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          Para un día puntual, reemplaza los 15 minutos de tolerancia. Aplica
          solo a los agentes marcados como &quot;fuera del anillo de
          Circunvalación&quot;; el resto mantiene sus 15 minutos.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Es un margen sobre el horario de entrada y salida de{" "}
          <strong>cada</strong> empleado, no una hora fija: como no todos
          entran a la misma hora, cargá por ejemplo 1 hora de margen y a cada
          uno se le va a aplicar sobre su propio horario.
        </p>

        <div className="mb-1">
          <label htmlFor="ext-fecha" className="block text-xs font-medium text-foreground mb-1">
            Fecha
          </label>
          <input
            id="ext-fecha"
            type="date"
            min={hoyLocal()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 mb-1">
          <div>
            <span className="block text-xs font-medium text-foreground mb-1">
              Margen de entrada
            </span>
            <div className="flex items-center gap-1">
              <input
                aria-label="Horas de margen de entrada"
                type="number"
                inputMode="numeric"
                min={0}
                max={8}
                placeholder="hs"
                value={entradaHoras}
                onChange={(e) => setEntradaHoras(e.target.value)}
                className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              />
              <span className="text-xs text-muted-foreground">hs</span>
              <input
                aria-label="Minutos de margen de entrada"
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                placeholder="min"
                value={entradaMinutos}
                onChange={(e) => setEntradaMinutos(e.target.value)}
                className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-medium text-foreground mb-1">
              Margen de salida (opcional)
            </span>
            <div className="flex items-center gap-1">
              <input
                aria-label="Horas de margen de salida"
                type="number"
                inputMode="numeric"
                min={0}
                max={8}
                placeholder="hs"
                value={salidaHoras}
                onChange={(e) => setSalidaHoras(e.target.value)}
                className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              />
              <span className="text-xs text-muted-foreground">hs</span>
              <input
                aria-label="Minutos de margen de salida"
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                placeholder="min"
                value={salidaMinutos}
                onChange={(e) => setSalidaMinutos(e.target.value)}
                className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Ej.: 1 hora, 0 minutos en entrada = una hora de margen sobre la hora
          de entrada de cada uno. La salida vacía deja ese extremo en los 15
          minutos de siempre.
        </p>
        <button
          type="button"
          onClick={agregar}
          disabled={
            guardando || fecha === "" || (entradaHoras === "" && entradaMinutos === "")
          }
          className="w-full py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-md text-sm font-bold shadow-soft hover:shadow-md transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed mb-5"
        >
          {guardando ? "Guardando…" : "Agregar extensión"}
        </button>

        <h3 className="text-sm font-bold text-foreground mb-2">
          Extensiones cargadas
        </h3>
        {cargando ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : extensiones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no se cargó ninguna.
          </p>
        ) : (
          <ul className="divide-y divide-border border-y border-border max-h-56 overflow-y-auto">
            {extensiones.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="text-foreground font-medium">{e.fecha}</span>
                <span className="text-xs text-muted-foreground flex-1">
                  Entrada {fmtMinutos(e.toleranciaEntradaMin)}
                  {e.toleranciaSalidaMin !== null &&
                    ` · Salida ${fmtMinutos(e.toleranciaSalidaMin)}`}
                </span>
                <button
                  type="button"
                  onClick={() => borrar(e.id)}
                  disabled={guardando}
                  aria-label={`Borrar la extensión del ${e.fecha}`}
                  className="text-error hover:opacity-80 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-sm text-error mt-3">{error}</p>}

        <button
          type="button"
          onClick={onCerrar}
          className="w-full mt-5 py-2 border border-border bg-muted hover:bg-border rounded-xl text-sm font-bold shadow-soft hover:shadow-md transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
