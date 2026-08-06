"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { apiClient } from "@/app/util/apiClient";
import { AusenciaEmpleado, Employee } from "@/app/Interfas/Interfaces";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const diaDeSemana = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return DIAS[new Date(a, m - 1, d).getDay()];
};

const aBase64 = (archivo: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // readAsDataURL produce "data:<mime>;base64,<data>" — solo el base64
        resolve(reader.result.split(",")[1] || "");
      } else {
        reject(new Error("No se pudo leer el archivo"));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(archivo);
  });

interface Props {
  employee: Employee;
}

export function AusenciasEmpleadoTab({ employee }: Props) {
  const [ausencias, setAusencias] = useState<AusenciaEmpleado[]>([]);
  const [ventanaDias, setVentanaDias] = useState(30);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justificando, setJustificando] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const toast = useRef<Toast>(null);

  const cargar = useCallback(async () => {
    if (!employee.id) return;
    setCargando(true);
    try {
      const r = await apiClient.get<{
        ausencias: AusenciaEmpleado[];
        ventanaDias: number;
      }>(`/asistencia/empleado/${employee.id}/ausencias`);
      setAusencias(r.ausencias);
      setVentanaDias(r.ventanaDias);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las ausencias");
    } finally {
      setCargando(false);
    }
  }, [employee.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async () => {
    if (!justificando || !archivo) return;
    setGuardando(true);
    try {
      const fileData = await aBase64(archivo);
      await apiClient.post(
        `/asistencia/empleado/${employee.id}/ausencias/${justificando}/justificar`,
        {
          fileName: archivo.name,
          mimeType: archivo.type || "application/octet-stream",
          fileData,
          observacion: observacion || null,
        },
      );
      toast.current?.show({
        severity: "success",
        summary: "Ausencia justificada",
        detail: "El saldo del empleado fue recalculado.",
        life: 4000,
      });
      setJustificando(null);
      setArchivo(null);
      setObservacion("");
      await cargar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo justificar",
        life: 5000,
      });
    } finally {
      setGuardando(false);
    }
  };

  const anular = async (fecha: string) => {
    if (!confirm(`¿Anular la justificación del ${fecha}? El día vuelve a contar como ausencia.`)) {
      return;
    }
    try {
      await apiClient.delete(
        `/asistencia/empleado/${employee.id}/ausencias/${fecha}/justificar`,
      );
      toast.current?.show({
        severity: "info",
        summary: "Justificación anulada",
        detail: "El saldo del empleado fue recalculado.",
        life: 4000,
      });
      await cargar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo anular",
        life: 5000,
      });
    }
  };

  const descargar = async (documentoId: number, fileName: string) => {
    try {
      const doc = await apiClient.get<{ fileData: string; mimeType: string }>(
        `/rrhh/employee/${employee.id}/documents/${documentoId}/download`,
      );
      const binario = atob(doc.fileData);
      const bytes = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: doc.mimeType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e instanceof Error ? e.message : "No se pudo descargar el parte",
        life: 5000,
      });
    }
  };

  if (!employee.biometricoId) {
    return (
      <div className="mt-6 p-6 bg-card rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
        <p className="font-semibold mb-1">Sin ID de reloj asignado</p>
        <p className="text-sm">
          Este empleado no tiene un ID biométrico vinculado, así que no hay ausencias
          calculadas.
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="mt-6 p-8 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando ausencias…</p>
      </div>
    );
  }

  if (error) {
    return <div className="mt-6 p-6 text-center text-error">{error}</div>;
  }

  const pendientes = ausencias.filter((a) => a.estado === "ausente");
  const justificadas = ausencias.filter((a) => a.estado === "justificada");
  const horasPerdidas = pendientes.reduce((s, a) => s + a.horasPerdidas, 0);

  return (
    <div className="mt-6 space-y-6">
      <Toast ref={toast} />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Sin justificar</p>
          <p className={`text-3xl font-heading ${pendientes.length > 0 ? "text-error" : "text-foreground"}`}>
            {pendientes.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">días</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Justificadas</p>
          <p className="text-3xl font-heading text-success">{justificadas.length}</p>
          <p className="text-xs text-muted-foreground mt-1">con parte médico</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Horas perdidas</p>
          <p className={`text-3xl font-heading ${horasPerdidas > 0 ? "text-error" : "text-foreground"}`}>
            {horasPerdidas.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">sin justificar</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-heading text-base text-foreground mb-1">Ausencias</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Se pueden justificar las de los últimos {ventanaDias} días. Una licencia
          aprobada que cubra la fecha resuelve la ausencia sin cargar nada acá.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Día</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Parte médico</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ausencias.map((a) => (
                <tr key={a.fecha} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{a.fecha}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{diaDeSemana(a.fecha)}</td>
                  <td className="py-2 pr-4">
                    {a.estado === "justificada" ? (
                      <span className="text-success">Justificada</span>
                    ) : (
                      <>
                        <span className="text-error">Sin justificar</span>
                        {a.licenciaPendiente && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Licencia de {a.licenciaPendiente.type} sin aprobar cubriría este día
                          </p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {a.justificacion ? (
                      <button
                        onClick={() =>
                          descargar(a.justificacion!.documentoId, a.justificacion!.fileName)
                        }
                        className="text-primary hover:underline"
                      >
                        {a.justificacion.fileName}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {a.estado === "justificada" ? (
                      <button
                        onClick={() => anular(a.fecha)}
                        className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs hover:opacity-90"
                      >
                        Anular
                      </button>
                    ) : a.puedeJustificar ? (
                      <button
                        onClick={() => setJustificando(a.fecha)}
                        className="px-3 py-1 rounded-lg bg-primary text-white text-xs hover:opacity-90"
                      >
                        Justificar
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Fuera de plazo</span>
                    )}
                  </td>
                </tr>
              ))}
              {ausencias.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Sin ausencias en el período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {justificando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="font-heading text-lg text-foreground mb-1">Justificar ausencia</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {employee.name} — {justificando}
            </p>

            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Parte médico (obligatorio)
            </label>
            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm mb-4"
            />

            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Observación
            </label>
            <input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: reposo indicado por 24hs"
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-full mb-6"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setJustificando(null);
                  setArchivo(null);
                  setObservacion("");
                }}
                disabled={guardando}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!archivo || guardando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Justificar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
