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

/** "HH:MM" -> minutos. El input de tipo time solo entrega eso o vacío. */
const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

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
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
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

  const agregar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await apiClient.post("/asistencia/extensiones-tolerancia", {
        fecha,
        toleranciaEntradaMin: aMinutos(entrada),
        toleranciaSalidaMin: salida === "" ? null : aMinutos(salida),
      });
      // No se cierra: RRHH puede cargar varias y ver la lista actualizarse.
      setFecha("");
      setEntrada("");
      setSalida("");
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
        <p className="text-sm text-muted-foreground mb-4">
          Para un día puntual, reemplaza los 15 minutos de tolerancia. Aplica
          solo a los agentes marcados como &quot;fuera del anillo de
          Circunvalación&quot;; el resto mantiene sus 15 minutos.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-1">
          <div>
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
          <div>
            <label htmlFor="ext-entrada" className="block text-xs font-medium text-foreground mb-1">
              Entrada
            </label>
            <input
              id="ext-entrada"
              type="time"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
            />
          </div>
          <div>
            <label htmlFor="ext-salida" className="block text-xs font-medium text-foreground mb-1">
              Salida (opcional)
            </label>
            <input
              id="ext-salida"
              type="time"
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
              className="w-full px-2 py-2 rounded-md border border-border bg-background text-foreground text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          La salida vacía deja ese extremo en los 15 minutos de siempre.
        </p>
        <button
          type="button"
          onClick={agregar}
          disabled={guardando || fecha === "" || entrada === ""}
          className="w-full py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-md text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed mb-5"
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
          className="w-full mt-5 py-2 bg-muted hover:bg-border rounded-xl text-sm font-bold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
