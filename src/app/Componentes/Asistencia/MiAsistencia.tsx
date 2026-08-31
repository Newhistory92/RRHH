"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { JornadaDiaria, ResumenAbuso } from "@/app/Interfas/Interfaces";

const fmtHoras = (h: number) => {
  const signo = h < 0 ? "-" : h > 0 ? "+" : "";
  const abs = Math.abs(h);
  const horas = Math.floor(abs);
  const min = Math.round((abs - horas) * 60);
  return `${signo}${horas}h ${String(min).padStart(2, "0")}m`;
};

const ETIQUETA_ESTADO: Record<string, string> = {
  ok: "Normal",
  incompleta: "Incompleta",
  ausente: "Ausente",
  feriado: "No laborable",
  licencia: "Licencia",
  sin_horario: "Sin horario",
};

const fmtFechas = (fechas: string[]) =>
  fechas
    .map((f) => {
      const [, mes, dia] = f.split("-");
      return `${Number(dia)}/${Number(mes)}`;
    })
    .join(", ");

const JORNADAS_POR_PAGINA = 10;

/** "YYYY-MM" -> "YYYY-MM-01", el primer dia del mes. */
const primerDiaMes = (mes: string) => `${mes}-01`;

/** "YYYY-MM" -> "YYYY-MM-DD" del ultimo dia de ese mes. */
const ultimoDiaMes = (mes: string) => {
  const [anio, m] = mes.split("-").map(Number);
  // Dia 0 del mes siguiente = ultimo dia del mes pedido.
  const fecha = new Date(anio, m, 0);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

const hoy = new Date();
const MES_ACTUAL = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
const MES_INICIO_ANIO = `${hoy.getFullYear()}-01`;

export default function MiAsistencia() {
  const [saldo, setSaldo] = useState(0);
  const [jornadas, setJornadas] = useState<JornadaDiaria[]>([]);
  const [abuso, setAbuso] = useState<ResumenAbuso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [desdeMes, setDesdeMes] = useState(MES_INICIO_ANIO);
  const [hastaMes, setHastaMes] = useState(MES_ACTUAL);

  const cargar = async (desde: string, hasta: string) => {
    setCargando(true);
    setError(null);
    try {
      const r = await apiClient.get<{
        saldoAcumulado: number;
        jornadas: JornadaDiaria[];
        abuso: ResumenAbuso;
      }>(`/asistencia/mi?desde=${primerDiaMes(desde)}&hasta=${ultimoDiaMes(hasta)}`);
      setSaldo(r.saldoAcumulado);
      setJornadas(r.jornadas);
      setAbuso(r.abuso);
      setPagina(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar tu asistencia");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar(desdeMes, hastaMes);
    // Solo la carga inicial: el filtro se aplica con el boton "Filtrar".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtroInvalido = desdeMes > hastaMes;

  const totalPaginas = Math.max(1, Math.ceil(jornadas.length / JORNADAS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * JORNADAS_POR_PAGINA;
  const jornadasPagina = jornadas.slice(inicio, inicio + JORNADAS_POR_PAGINA);

  const debe = saldo < 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl text-foreground mb-6">Mi asistencia</h1>

      <div className="bg-card rounded-lg shadow-sm p-4 border border-border mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Desde</label>
          <input
            type="month"
            value={desdeMes}
            max={hastaMes}
            onChange={(e) => setDesdeMes(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hasta</label>
          <input
            type="month"
            value={hastaMes}
            min={desdeMes}
            onChange={(e) => setHastaMes(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
          />
        </div>
        <button
          type="button"
          onClick={() => cargar(desdeMes, hastaMes)}
          disabled={cargando || filtroInvalido}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {cargando ? "Filtrando…" : "Filtrar"}
        </button>
        {filtroInvalido && (
          <p className="text-sm text-error">&quot;Desde&quot; no puede ser posterior a &quot;Hasta&quot;.</p>
        )}
      </div>

      {cargando ? (
        <div className="p-8 text-center text-muted-foreground">
          <i className="pi pi-spin pi-spinner text-3xl mb-3" />
          <p>Cargando tu asistencia…</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error">{error}</div>
      ) : (
        <>
          {abuso?.alerta && (
            <div className="mb-6 rounded-lg border border-warning bg-warning-soft p-4">
              <p className="font-semibold text-warning-soft-foreground">
                Uso reiterado del margen de tolerancia
              </p>
              <p className="mt-1 text-sm text-warning-soft-foreground">
                Marcaste fuera del margen de {abuso.toleranciaEstrictaEntradaMin} minutos
                a la entrada o {abuso.toleranciaEstrictaSalidaMin} a la salida{" "}
                {abuso.rachaMaxima} días seguidos ({fmtFechas(abuso.fechasRachaMaxima)}).
                No se te descontaron horas: sigue estando dentro de la tolerancia.
              </p>
            </div>
          )}

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border mb-8">
            <p className="text-sm text-muted-foreground mb-1">Saldo acumulado</p>
            <p className={`text-4xl font-heading ${debe ? "text-error" : "text-success"}`}>
              {fmtHoras(saldo)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {saldo === 0
                ? "Estás al día."
                : debe
                  ? "Horas que debés recuperar."
                  : "Horas a tu favor."}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
            <h2 className="font-heading text-lg text-foreground mb-4">Desglose diario</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Entrada</th>
                    <th className="py-2 pr-4">Salida</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4 text-right">Trabajadas</th>
                    <th className="py-2 pr-4 text-right">Requeridas</th>
                    <th className="py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {jornadasPagina.map((j) => (
                    <tr key={j.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-foreground">{j.fecha.slice(0, 10)}</td>
                      <td className="py-2 pr-4">
                        {j.entrada ? j.entrada.slice(11, 16) : "—"}
                        {j.entradaManual && (
                          <span className="ml-1 text-xs text-muted-foreground">(manual)</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {j.salida ? j.salida.slice(11, 16) : "—"}
                        {j.salidaManual && (
                          <span className="ml-1 text-xs text-muted-foreground">(manual)</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {ETIQUETA_ESTADO[j.estado] ?? j.estado}
                        {(j.abusoEntrada || j.abusoSalida) && (
                          <span
                            className="ml-2 rounded px-1.5 py-0.5 text-xs bg-warning-soft text-warning-soft-foreground"
                            title={
                              j.abusoEntrada && j.abusoSalida
                                ? "Fuera del margen en la entrada y en la salida"
                                : j.abusoEntrada
                                  ? "Fuera del margen en la entrada"
                                  : "Fuera del margen en la salida"
                            }
                          >
                            margen
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right">{j.horasTrabajadas.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right">{j.horasRequeridas.toFixed(2)}</td>
                      <td
                        className={`py-2 text-right ${
                          j.saldoDia < 0
                            ? "text-error"
                            : j.saldoDia > 0
                              ? "text-success"
                              : "text-muted-foreground"
                        }`}
                      >
                        {fmtHoras(j.saldoDia)}
                      </td>
                    </tr>
                  ))}
                  {jornadas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        Todavía no hay jornadas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {jornadas.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {inicio + 1}–{Math.min(inicio + JORNADAS_POR_PAGINA, jornadas.length)} de {jornadas.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaSegura === 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-muted-foreground px-2">
                    Página {paginaSegura} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura === totalPaginas}
                    className="px-3 py-1.5 text-sm rounded-md border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
