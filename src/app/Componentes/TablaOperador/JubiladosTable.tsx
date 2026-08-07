"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { EmpleadoJubilado } from "@/app/Interfas/Interfaces";

interface Props {
  onVolver: () => void;
}

export default function JubiladosTable({ onVolver }: Props) {
  const [jubilados, setJubilados] = useState<EmpleadoJubilado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const r = await apiClient.get<{ jubilados: EmpleadoJubilado[] }>(
          "/rrhh/jubilados",
        );
        if (!cancelado) {
          setJubilados(r.jubilados);
          setError(null);
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar los jubilados");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const filtrados = jubilados.filter((j) =>
    j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    (j.dni ?? "").includes(busqueda),
  );

  if (cargando) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando jubilados…</p>
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
          <h2 className="font-heading text-xl text-foreground">Jubilados</h2>
          <p className="text-sm text-muted-foreground">
            {jubilados.length} persona{jubilados.length === 1 ? "" : "s"} con la
            jubilación efectiva. El saldo quedó congelado en su último día.
          </p>
        </div>
        <button
          onClick={onVolver}
          className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm hover:opacity-90"
        >
          Volver al tablero
        </button>
      </div>

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
              <th className="py-3 px-4">Ingreso</th>
              <th className="py-3 px-4">Jubilación</th>
              <th className="py-3 px-4 text-right">Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((j) => (
              <tr key={j.id} className="border-b border-border last:border-0">
                <td className="py-3 px-4 text-foreground">{j.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{j.dni ?? "—"}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {j.departamento ?? "—"}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {j.fechaIngreso ?? "—"}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {j.fechaJubilacion ?? "—"}
                </td>
                <td
                  className={`py-3 px-4 text-right font-semibold ${
                    j.saldoFinal < 0 ? "text-error" : "text-foreground"
                  }`}
                >
                  {j.saldoFinal.toFixed(2)} hs
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  {jubilados.length === 0
                    ? "No hay jubilados registrados."
                    : "Ningún jubilado coincide con la búsqueda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
