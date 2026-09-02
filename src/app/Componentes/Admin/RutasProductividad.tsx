"use client";

// Clasificacion de que rutas del sistema de gestion cuentan como trabajo.
//
// El orden es por volumen descendente y no alfabetico a proposito: las 25
// rutas mas usadas concentran el 79% de la actividad, asi que tildando de
// arriba hacia abajo se resuelve casi todo en una pasada.

import React from "react";
import { AlertTriangle, RefreshCw, Save, Search } from "lucide-react";
import { apiClient } from "@/app/util/apiClient";
import type { EstadoRuta, RutaProductividad } from "@/app/Interfas/Interfaces";

type Filtro = "todas" | EstadoRuta;

// `resaltar` llega cuando se viene desde el explorador de logs con una ruta
// concreta que se quiere clasificar. Se traduce a la busqueda de texto en vez
// de a un scroll: dejar visible solo esa fila evita tener que buscarla a ojo
// en una tabla de 1.830.
export function RutasProductividad({ resaltar }: { resaltar?: string }) {
  const [rutas, setRutas] = React.useState<RutaProductividad[]>([]);
  const [cambios, setCambios] = React.useState<Map<string, boolean>>(new Map());
  const [filtro, setFiltro] = React.useState<Filtro>("todas");
  const [busqueda, setBusqueda] = React.useState(resaltar ?? "");
  const [cargando, setCargando] = React.useState(true);
  const [guardando, setGuardando] = React.useState(false);
  const [recalculando, setRecalculando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sinActividad, setSinActividad] = React.useState(false);

  const clave = (r: { metodo: string; ruta: string }) => `${r.metodo} ${r.ruta}`;

  const traer = React.useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const r = await apiClient.get<{
        rutas: RutaProductividad[];
        actividadDisponible: boolean;
      }>("/admin/logs/rutas");
      setRutas(r.rutas ?? []);
      setSinActividad(!r.actividadDisponible);
      setCambios(new Map());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  React.useEffect(() => {
    void traer();
  }, [traer]);

  // Al volver desde Logs con otra ruta, la busqueda tiene que seguirla. Sin
  // esto el salto solo funcionaria la primera vez.
  React.useEffect(() => {
    if (resaltar) {
      setBusqueda(resaltar);
      setFiltro("todas");
    }
  }, [resaltar]);

  const tildada = (r: RutaProductividad): boolean => {
    const pendienteDeGuardar = cambios.get(clave(r));
    return pendienteDeGuardar ?? r.estado === "cuenta";
  };

  const alternar = (r: RutaProductividad) => {
    const siguiente = new Map(cambios);
    siguiente.set(clave(r), !tildada(r));
    setCambios(siguiente);
  };

  const guardar = async () => {
    if (cambios.size === 0) return;
    setGuardando(true);
    try {
      await apiClient.put("/admin/logs/rutas", {
        rutas: rutas
          .filter((r) => cambios.has(clave(r)))
          .map((r) => ({
            metodo: r.metodo,
            ruta: r.ruta,
            cuenta: cambios.get(clave(r)),
          })),
      });
      await traer();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const recalcular = async () => {
    setRecalculando(true);
    try {
      await apiClient.post("/admin/logs/recalcular", {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo recalcular");
    } finally {
      setRecalculando(false);
    }
  };

  const pendientes = rutas.filter((r) => r.estado === "pendiente");
  const visibles = rutas.filter(
    (r) =>
      (filtro === "todas" || r.estado === filtro) &&
      (busqueda === "" ||
        r.ruta.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (cargando) {
    return <p className="py-8 text-center text-muted-foreground">Cargando rutas…</p>;
  }

  return (
    <div>
      {sinActividad && (
        <div className="mb-4 rounded-xl border-l-4 border-warning bg-warning-soft p-4">
          <p className="text-sm text-warning-soft-foreground">
            No se pudo leer la actividad del sistema de gestión. Se muestra la
            configuración guardada; podés seguir clasificando.
          </p>
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-info-soft p-4">
          <AlertTriangle className="shrink-0 text-info" size={18} />
          <p className="text-sm text-info-soft-foreground">
            Hay <strong>{pendientes.length}</strong> rutas sin clasificar. No
            suman al puntaje hasta que las revises.{" "}
            <button
              type="button"
              onClick={() => setFiltro("pendiente")}
              className="underline font-medium"
            >
              Ver sólo esas
            </button>
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar ruta…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-foreground"
          />
        </div>

        {(["todas", "pendiente", "cuenta", "no_cuenta"] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filtro === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {{
              todas: "Todas",
              pendiente: "Sin clasificar",
              cuenta: "Cuentan",
              no_cuenta: "No cuentan",
            }[f]}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={guardar}
            disabled={cambios.size === 0 || guardando}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            <Save size={16} />
            {guardando ? "Guardando…" : `Guardar (${cambios.size})`}
          </button>
          <button
            type="button"
            onClick={recalcular}
            disabled={recalculando}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground disabled:opacity-50"
          >
            <RefreshCw size={16} className={recalculando ? "animate-spin" : ""} />
            Recalcular puntajes
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Tildar una ruta recalcula los últimos 12 meses, no sólo lo que viene.
      </p>

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Ruta</th>
              <th className="px-4 py-3 text-right">Eventos</th>
              <th className="px-4 py-3 text-right">Usuarios</th>
              <th className="px-4 py-3">Última vez</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibles.map((r) => (
              <tr key={clave(r)} className="hover:bg-muted/50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={tildada(r)}
                    onChange={() => alternar(r)}
                    aria-label={`Contar ${r.metodo} ${r.ruta}`}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                </td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                  {r.metodo}
                </td>
                <td className="px-4 py-2 font-mono text-sm text-foreground">
                  {r.ruta}
                  {r.estado === "pendiente" && (
                    <span className="ml-2 rounded bg-info-soft px-1.5 py-0.5 text-[10px] text-info-soft-foreground">
                      sin clasificar
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-foreground">
                  {r.eventos.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {r.usuarios}
                </td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {r.ultimaVez ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No hay rutas con ese filtro.
        </p>
      )}
    </div>
  );
}
