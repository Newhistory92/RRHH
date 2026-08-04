"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { apiClient } from "@/app/util/apiClient";
import { JornadaIncompleta, TableroFila } from "@/app/Interfas/Interfaces";

const fmtHoras = (h: number) => {
  const signo = h < 0 ? "-" : h > 0 ? "+" : "";
  const abs = Math.abs(h);
  const horas = Math.floor(abs);
  const min = Math.round((abs - horas) * 60);
  return `${signo}${horas}h ${String(min).padStart(2, "0")}m`;
};

const claseSaldo = (h: number) =>
  h < 0
    ? "text-error font-semibold"
    : h > 0
    ? "text-success font-semibold"
    : "text-muted-foreground";

interface BiometricoHuerfano {
  biometricoId: string;
  cantidadMarcas: number;
  ultimaMarcacion: string;
}

export default function AsistenciaTablero() {
  const [filas, setFilas] = useState<TableroFila[]>([]);
  const [incompletas, setIncompletas] = useState<JornadaIncompleta[]>([]);
  const [huerfanos, setHuerfanos] = useState<BiometricoHuerfano[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<JornadaIncompleta | null>(null);
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [recalculando, setRecalculando] = useState(false);
  const toast = useRef<Toast>(null);

  const hoy = new Date().toISOString().split('T')[0];
  const inicioAnio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const [desdeTablero, setDesdeTablero] = useState(inicioAnio);
  const [hastaTablero, setHastaTablero] = useState(hoy);

  const cargar = async () => {
    setCargando(true);
    try {
      const [t, i, h] = await Promise.all([
        apiClient.get<{ empleados: TableroFila[] }>(`/asistencia/tablero?desde=${desdeTablero}&hasta=${hastaTablero}`),
        apiClient.get<{ jornadas: JornadaIncompleta[] }>("/asistencia/incompletas"),
        apiClient.get<{ huerfanos: BiometricoHuerfano[] }>("/asistencia/biometricos-huerfanos"),
      ]);
      setFilas(t.empleados);
      setIncompletas(i.jornadas);
      setHuerfanos(h.huerfanos);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo cargar la asistencia",
        life: 5000,
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCorreccion = (j: JornadaIncompleta) => {
    setEditando(j);
    setHoraEntrada(j.entrada ? j.entrada.slice(11, 16) : "");
    setHoraSalida(j.salida ? j.salida.slice(11, 16) : "");
    setObservacion("");
  };

  const guardarCorreccion = async () => {
    if (!editando) return;
    if (!horaEntrada && !horaSalida) return;

    setGuardando(true);
    try {
      const dia = editando.fecha.slice(0, 10);
      const body: Record<string, string | null> = {
        observacion: observacion || null,
      };
      if (horaEntrada) body.entrada = `${dia}T${horaEntrada}:00`;
      if (horaSalida) body.salida = `${dia}T${horaSalida}:00`;

      await apiClient.post(`/asistencia/jornadas/${editando.id}/correccion`, body);

      toast.current?.show({
        severity: "success",
        summary: "Listo",
        detail: "Jornada corregida y saldo recalculado",
        life: 3000,
      });
      setEditando(null);
      await cargar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo guardar la corrección",
        life: 5000,
      });
    } finally {
      setGuardando(false);
    }
  };

  const lanzarRecalculo = async () => {
    setRecalculando(true);
    try {
      // Snapshot del último recálculo antes de lanzar, para detectar el nuevo.
      const antes = await apiClient.get<{ recalculos: { id: number; finalizadoAt: string | null }[] }>(
        "/asistencia/recalculos?limite=1"
      );
      const idAntes = antes.recalculos[0]?.id ?? 0;

      await apiClient.post("/asistencia/recalcular", {});

      // Polling: esperar hasta que aparezca un registro nuevo con finalizadoAt.
      const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < 60; i++) {
        await esperar(3000);
        const ahora = await apiClient.get<{ recalculos: { id: number; finalizadoAt: string | null }[] }>(
          "/asistencia/recalculos?limite=1"
        );
        const top = ahora.recalculos[0];
        if (top && top.id > idAntes && top.finalizadoAt) break;
      }

      toast.current?.show({
        severity: "success",
        summary: "Recálculo completado",
        detail: "El tablero fue actualizado.",
        life: 4000,
      });
      await cargar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo iniciar el recálculo",
        life: 5000,
      });
    } finally {
      setRecalculando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-3xl mb-3" />
        <p>Cargando asistencia…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast ref={toast} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-foreground">Asistencia</h1>
        <button
          onClick={lanzarRecalculo}
          disabled={recalculando}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          <i className={`pi ${recalculando ? "pi-spin pi-spinner" : "pi-refresh"} text-sm`} />
          {recalculando ? "Iniciando…" : "Recalcular todo"}
        </button>
      </div>

      {/* ── IDs del reloj sin vincular ───────────────────────────── */}
      {huerfanos.length > 0 && (
        <div className="mb-8 bg-card rounded-lg shadow-sm p-4 border border-amber-400">
          <h2 className="font-heading text-lg text-foreground mb-1 flex items-center gap-2">
            <i className="pi pi-exclamation-triangle text-amber-500" />
            IDs del reloj sin vincular ({huerfanos.length})
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Estas personas marcaron en el reloj pero su ID no está asignado a ningún empleado.
            Ingresá al perfil del empleado y cargá el "ID del reloj" correspondiente, luego recalculá.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">ID en el reloj</th>
                  <th className="py-2 pr-4 text-right">Marcas (últimos 14 días)</th>
                  <th className="py-2 text-right">Última marcación</th>
                </tr>
              </thead>
              <tbody>
                {huerfanos.map((h) => (
                  <tr key={h.biometricoId} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-mono font-semibold text-amber-600">{h.biometricoId}</td>
                    <td className="py-2 pr-4 text-right">{h.cantidadMarcas}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {h.ultimaMarcacion.slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Jornadas incompletas ─────────────────────────────────── */}
      {incompletas.length > 0 && (
        <div className="mb-8 bg-card rounded-lg shadow-sm p-4 border border-border">
          <h2 className="font-heading text-lg text-foreground mb-1">
            Jornadas por corregir ({incompletas.length})
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Marcaron un solo extremo. No suman deuda hasta que cargues el
            faltante.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Empleado</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Entrada</th>
                  <th className="py-2 pr-4">Salida</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {incompletas.map((j) => (
                  <tr key={j.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-foreground">{j.employeeName}</td>
                    <td className="py-2 pr-4">{j.fecha.slice(0, 10)}</td>
                    <td className="py-2 pr-4">
                      {j.entrada ? j.entrada.slice(11, 16) : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {j.salida ? j.salida.slice(11, 16) : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => abrirCorreccion(j)}
                        className="px-3 py-1 rounded-lg bg-primary text-white text-xs hover:opacity-90 transition-opacity"
                      >
                        Corregir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {incompletas.length === 0 && (
        <div className="mb-8 bg-card rounded-lg shadow-sm p-6 border border-border text-center text-muted-foreground text-sm">
          Sin jornadas incompletas pendientes.
        </div>
      )}

      {/* ── Tablero de saldo por empleado ────────────────────────── */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <h2 className="font-heading text-lg text-foreground mb-4">
          Saldo por empleado
        </h2>
        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input
              type="date"
              value={desdeTablero}
              onChange={e => setDesdeTablero(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input
              type="date"
              value={hastaTablero}
              onChange={e => setHastaTablero(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            onClick={cargar}
            className="px-4 py-1 bg-primary text-white rounded"
          >
            Actualizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Empleado</th>
                <th className="py-2 pr-4">ID reloj</th>
                <th className="py-2 pr-4 text-right">Saldo acumulado</th>
                <th className="py-2 pr-4 text-right">Ausencias</th>
                <th className="py-2 text-right">Incompletas</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.employeeId} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{f.employeeName}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{f.biometricoId}</td>
                  <td className={`py-2 pr-4 text-right ${claseSaldo(f.saldoAcumulado)}`}>
                    {fmtHoras(f.saldoAcumulado)}
                  </td>
                  <td className="py-2 pr-4 text-right">{f.ausencias}</td>
                  <td className="py-2 text-right">{f.incompletas}</td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No hay empleados vinculados a un reloj todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de corrección ──────────────────────────────────── */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="font-heading text-lg text-foreground mb-1">
              Corregir jornada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {editando.employeeName} — {editando.fecha.slice(0, 10)}
            </p>

            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Hora de entrada
            </label>
            <input
              type="time"
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-full mb-4"
            />

            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Hora de salida
            </label>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-full mb-4"
            />

            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Observación
            </label>
            <input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: olvidó marcar al retirarse"
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-full mb-6"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditando(null)}
                disabled={guardando}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCorreccion}
                disabled={(!horaEntrada && !horaSalida) || guardando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50 transition-opacity"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
