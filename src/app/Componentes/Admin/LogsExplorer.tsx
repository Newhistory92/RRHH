"use client";

// Explorador de los logs crudos del sistema de gestion.
//
// Muestra las columnas tal como vienen, sin normalizar: el objetivo es
// entender que paso realmente antes de decidir si una ruta cuenta como
// trabajo. Normalizarlas aca escondria justamente lo que se viene a mirar.

import React from "react";
import { Search } from "lucide-react";
import { apiClient } from "@/app/util/apiClient";
import type { LogSistemaFila } from "@/app/Interfas/Interfaces";

const CLASES = [
  { valor: "", etiqueta: "Todos" },
  { valor: "exito", etiqueta: "Éxito (2xx)" },
  { valor: "redireccion", etiqueta: "Redirección (3xx)" },
  { valor: "error_cliente", etiqueta: "Error cliente (4xx)" },
  { valor: "error_servidor", etiqueta: "Error servidor (5xx)" },
];

const POR_PAGINA = 50;

// `onClasificar` recibe la ruta ya normalizada por el backend. Se usa la del
// backend y no una calculada aca para que exista una sola implementacion de
// la normalizacion: dos, en dos lenguajes, se desincronizan.
export function LogsExplorer({
  onClasificar,
}: {
  onClasificar?: (ruta: string) => void;
}) {
  const [logs, setLogs] = React.useState<LogSistemaFila[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pagina, setPagina] = React.useState(1);
  const [texto, setTexto] = React.useState("");
  const [textoBusqueda, setTextoBusqueda] = React.useState("");
  const [metodo, setMetodo] = React.useState("");
  const [clase, setClase] = React.useState("");
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const traer = React.useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pagina: String(pagina),
        por_pagina: String(POR_PAGINA),
      });
      if (texto) params.set("texto", texto);
      if (metodo) params.set("metodo", metodo);
      if (clase) params.set("clase", clase);

      const r = await apiClient.get<{ logs: LogSistemaFila[]; total: number }>(
        `/admin/logs?${params.toString()}`
      );
      setLogs(r.logs ?? []);
      setTotal(r.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, [pagina, texto, metodo, clase]);

  React.useEffect(() => {
    const t = setTimeout(() => setTexto(textoBusqueda), 300);
    return () => clearTimeout(t);
  }, [textoBusqueda]);

  React.useEffect(() => {
    void traer();
  }, [traer]);

  // Cualquier cambio de filtro invalida la pagina actual: quedarse en la 7 de
  // un resultado que ahora tiene 2 mostraria una tabla vacia sin explicacion.
  const cambiarFiltro = (accion: () => void) => {
    accion();
    setPagina(1);
  };

  const colorStatus = (s: number) =>
    s < 300 ? "text-success" : s < 400 ? "text-muted-foreground" : "text-error";

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[14rem]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            value={textoBusqueda}
            onChange={(e) => cambiarFiltro(() => setTextoBusqueda(e.target.value))}
            placeholder="Buscar en la URL…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-foreground"
          />
        </div>

        <select
          value={metodo}
          onChange={(e) => cambiarFiltro(() => setMetodo(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        >
          <option value="">Todos los métodos</option>
          {["GET", "POST", "PUT", "DELETE"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={clase}
          onChange={(e) => cambiarFiltro(() => setClase(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        >
          {CLASES.map((c) => (
            <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      {cargando ? (
        <p className="py-8 text-center text-muted-foreground">Cargando logs…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3 text-right">ms</th>
                <th className="px-4 py-3">Ruta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l, i) => (
                <tr key={`${l.requestId ?? i}-${i}`} className="hover:bg-muted/50">
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {new Date(l.fechaHoraLog).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-sm text-foreground">
                    {l.nombreUsuario ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {l.metodo}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm text-foreground">
                    {l.url}
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums ${colorStatus(l.statusCode)}`}>
                    {l.statusCode}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {l.tiempoRespuestaMs ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    {onClasificar ? (
                      <button
                        type="button"
                        onClick={() => onClasificar(l.rutaNormalizada)}
                        className="font-mono text-xs text-primary underline"
                        title="Clasificar esta ruta"
                      >
                        {l.rutaNormalizada}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {l.rutaNormalizada}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length === 0 && !cargando && (
        <p className="py-8 text-center text-muted-foreground">
          No hay logs con esos filtros.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString("es-AR")} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            {pagina} de {paginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
            disabled={pagina >= paginas}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
