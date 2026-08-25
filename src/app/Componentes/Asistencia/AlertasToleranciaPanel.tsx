"use client";

import { AlertaTolerancia, JornadaAbuso } from "@/app/Interfas/Interfaces";

const extremo = (j: JornadaAbuso) =>
  j.abusoEntrada && j.abusoSalida
    ? "Entrada y salida"
    : j.abusoEntrada
      ? "Entrada"
      : "Salida";

interface Props {
  alertas: AlertaTolerancia[];
  diasRachaAlerta: number;
}

export default function AlertasToleranciaPanel({ alertas, diasRachaAlerta }: Props) {
  if (alertas.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border text-center text-muted-foreground text-sm">
        Nadie encadenó {diasRachaAlerta} días trabajados fuera del margen estricto en el período.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Marcaron fuera del margen estricto {diasRachaAlerta} o más días trabajados seguidos.
        No se les descontaron horas: siguen dentro de la tolerancia.
      </p>

      {alertas.map((a) => (
        <div
          key={a.employeeId}
          className="bg-card rounded-lg shadow-sm p-5 border border-warning"
        >
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-heading text-lg text-foreground">{a.employeeName}</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-warning">
                {a.diasAbuso}
              </span>{" "}
              días en el período · racha de{" "}
              <span className="font-semibold text-warning">
                {a.rachaMaxima}
              </span>{" "}
              seguidos
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Entrada</th>
                  <th className="py-2 pr-4">Salida</th>
                  <th className="py-2">Extremo</th>
                </tr>
              </thead>
              <tbody>
                {a.jornadas.map((j) => (
                  <tr key={j.fecha} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-foreground">{j.fecha}</td>
                    <td
                      className={`py-2 pr-4 ${
                        j.abusoEntrada ? "text-warning font-semibold" : ""
                      }`}
                    >
                      {j.entrada ? j.entrada.slice(11, 16) : "—"}
                    </td>
                    <td
                      className={`py-2 pr-4 ${
                        j.abusoSalida ? "text-warning font-semibold" : ""
                      }`}
                    >
                      {j.salida ? j.salida.slice(11, 16) : "—"}
                    </td>
                    <td className="py-2 text-muted-foreground">{extremo(j)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
