"use client";

// Ficha comparativa para decidir un ascenso dentro de una gerencia.
//
// No hay columna de puntaje total, y es deliberado: un ascenso se decide entre
// pocos candidatos, y ahi un numero unico no agrega informacion sobre lo que ya
// muestran las columnas -esconde de donde sale-. La autoridad compara la
// evidencia; el sistema no emite veredicto.

import { AlertTriangle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DimensionMerito, FichaMerito } from "@/app/Interfas/Interfaces";

function Celda({ dim }: { dim: DimensionMerito }) {
  if (!dim.medida) {
    return (
      <div className="text-sm text-muted-foreground italic" title={dim.detalle}>
        Sin datos
      </div>
    );
  }
  return (
    <div>
      <span className="font-semibold text-foreground tabular-nums">{dim.valor}</span>
      <p className="text-xs text-muted-foreground">{dim.detalle}</p>
    </div>
  );
}

function Trayectoria({ valor }: { valor: string }) {
  const iconos: Record<string, React.ReactNode> = {
    mejorando: <TrendingUp size={16} className="text-success" aria-hidden="true" />,
    bajando: <TrendingDown size={16} className="text-error" aria-hidden="true" />,
    sostenida: <Minus size={16} className="text-muted-foreground" aria-hidden="true" />,
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      {iconos[valor] ?? null}
      {valor}
    </span>
  );
}

export function TablaMerito({ fichas }: { fichas: FichaMerito[] }) {
  if (fichas.length === 0) {
    return (
      <p className="p-6 text-center text-muted-foreground">
        Esta gerencia no tiene personal cargado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            <th className="px-4 py-3">Persona</th>
            <th className="px-4 py-3">Cumplimiento</th>
            <th className="px-4 py-3">Actividad</th>
            <th className="px-4 py-3">Volumen operativo</th>
            <th className="px-4 py-3">Feedback</th>
            <th className="px-4 py-3">Trayectoria</th>
            <th className="px-4 py-3">Evidencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {fichas.map((f) => (
            <tr key={f.employeeId} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <p className="font-semibold text-foreground">{f.nombre}</p>
                <p className="text-xs text-muted-foreground">{f.position ?? "Sin cargo"}</p>
              </td>
              <td className="px-4 py-3"><Celda dim={f.cumplimiento} /></td>
              <td className="px-4 py-3"><Celda dim={f.actividad} /></td>
              <td className="px-4 py-3"><Celda dim={f.operativo} /></td>
              <td className="px-4 py-3"><Celda dim={f.feedback} /></td>
              <td className="px-4 py-3"><Trayectoria valor={f.trayectoria} /></td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 text-sm ${
                    f.cobertura < f.dimensionesTotales ? "text-warning" : "text-muted-foreground"
                  }`}
                  title="Cuantas dimensiones tienen datos para esta persona. Menos evidencia no significa peor desempeno: significa que hay menos con que respaldar una decision."
                >
                  {f.cobertura < f.dimensionesTotales && (
                    <AlertTriangle size={14} aria-hidden="true" />
                  )}
                  {f.cobertura} de {f.dimensionesTotales}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
