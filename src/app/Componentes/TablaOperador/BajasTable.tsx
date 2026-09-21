"use client";

// Tablero de bajas de la institución, en la pantalla Lista de Empleados.
//
// Cada fila es un evento de baja, no una persona. La lista es histórica a
// propósito: incluye las reincorporaciones (pasaron de verdad) y las
// programadas, que son el único lugar donde RRHH puede ver y corregir una baja
// cargada con preaviso antes de que llegue el día.

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { EmpleadoBaja } from "@/app/Interfas/Interfaces";

interface Props {
  onVolver: () => void;
  /** Abre el perfil: es desde ahí que RRHH corrige, cancela o reincorpora. */
  onSelectEmployee: (employeeId: number) => void;
}

interface Respuesta {
  bajas: EmpleadoBaja[];
  porMotivo: Record<string, number>;
  motivos: string[];
}

const ETIQUETA_ESTADO: Record<EmpleadoBaja["estado"], string> = {
  vigente: "Vigente",
  reincorporada: "Reincorporado",
  programada: "Programada",
};

export default function BajasTable({ onVolver, onSelectEmployee }: Props) {
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [motivoFiltro, setMotivoFiltro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const r = await apiClient.get<Respuesta>("/rrhh/bajas");
        if (!cancelado) {
          setDatos(r);
          setError(null);
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar las bajas");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const bajas = datos?.bajas ?? [];

  const filtradas = useMemo(
    () =>
      bajas.filter(
        (b) =>
          (motivoFiltro === null || b.motivo === motivoFiltro) &&
          (b.name.toLowerCase().includes(busqueda.toLowerCase()) ||
            (b.dni ?? "").includes(busqueda)),
      ),
    [bajas, busqueda, motivoFiltro],
  );

  // Solo los motivos que ocurrieron: siete filas donde cinco son cero no
  // informa nada y ocupa toda la pantalla.
  const desglose = useMemo(() => {
    const conteos = datos?.porMotivo ?? {};
    const conDatos = Object.entries(conteos).filter(([, n]) => n > 0);
    const mayor = conDatos.reduce((max, [, n]) => Math.max(max, n), 0);
    return { filas: conDatos, mayor };
  }, [datos]);

  const total = desglose.filas.reduce((acc, [, n]) => acc + n, 0);

  if (cargando) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando bajas…</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-error">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-xl text-foreground">Bajas</h2>
          <p className="text-sm text-muted-foreground">
            {total} baja{total === 1 ? "" : "s"} efectiva
            {total === 1 ? "" : "s"}, sin contar las programadas. El saldo de
            cada persona quedó congelado en su último día.
          </p>
          <p className="text-sm text-muted-foreground">
            Hacé clic en una fila para abrir el perfil y corregir, cancelar o
            reincorporar.
          </p>
        </div>
        <button
          onClick={onVolver}
          className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm hover:opacity-90"
        >
          Volver al tablero
        </button>
      </div>

      {desglose.filas.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Bajas por motivo
          </h3>
          <div className="space-y-2">
            {desglose.filas.map(([motivo, n]) => {
              const activo = motivoFiltro === motivo;
              return (
                <button
                  key={motivo}
                  onClick={() => setMotivoFiltro(activo ? null : motivo)}
                  aria-pressed={activo}
                  className={`w-full grid grid-cols-[11rem_1fr_2.5rem] items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted ${
                    activo ? "bg-muted" : ""
                  }`}
                >
                  <span className="text-sm text-foreground truncate">{motivo}</span>
                  <span className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${desglose.mayor > 0 ? (n / desglose.mayor) * 100 : 0}%`,
                        backgroundColor: "var(--primary)",
                      }}
                    />
                  </span>
                  <span className="text-sm text-muted-foreground text-right tabular-nums">
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
          {motivoFiltro && (
            <p className="text-xs text-muted-foreground mt-3">
              Mostrando solo {motivoFiltro}. Volvé a hacer clic para ver todas.
            </p>
          )}
        </div>
      )}

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o DNI…"
        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-full max-w-sm"
      />

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">DNI</th>
              <th className="py-3 px-4">Departamento</th>
              <th className="py-3 px-4">Motivo</th>
              <th className="py-3 px-4">Baja</th>
              <th className="py-3 px-4">Antigüedad</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((b) => (
              <tr
                key={b.id}
                onClick={() => onSelectEmployee(b.employeeId)}
                className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted"
              >
                <td className="py-3 px-4 text-foreground">{b.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{b.dni ?? "—"}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {b.departamento ?? "—"}
                </td>
                <td className="py-3 px-4 text-foreground">{b.motivo}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {b.fechaBaja ?? "—"}
                </td>
                <td className="py-3 px-4 text-muted-foreground tabular-nums">
                  {b.antiguedadAnios !== null ? `${b.antiguedadAnios} años` : "—"}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {ETIQUETA_ESTADO[b.estado]}
                  {b.estado === "reincorporada" && b.fechaReingreso
                    ? ` el ${b.fechaReingreso}`
                    : ""}
                </td>
                <td
                  className={`py-3 px-4 text-right font-semibold tabular-nums ${
                    b.saldoFinal < 0 ? "text-error" : "text-foreground"
                  }`}
                >
                  {b.saldoFinal.toFixed(2)} hs
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  {bajas.length === 0
                    ? "No hay bajas registradas."
                    : "Ninguna baja coincide con el filtro."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
