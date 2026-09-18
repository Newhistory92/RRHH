"use client";

// Dar de baja a un empleado, corregir el error de carga o reincorporarlo.
//
// Va como acción propia y no como un campo más del formulario de condición
// laboral: aquel edita datos descriptivos, esto le recorta a una persona todo
// el sistema menos su legajo y le cancela las solicitudes pendientes. Por eso
// el modal enumera las consecuencias antes de confirmar.

import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { apiClient } from "@/app/util/apiClient";
import { MotivoBaja } from "@/app/Interfas/Interfaces";

const MOTIVOS: MotivoBaja[] = [
  "Jubilación",
  "Renuncia",
  "Despido",
  "Fin de contrato",
  "Fallecimiento",
  "Traslado a otro organismo",
  "Abandono de cargo",
];

interface Props {
  employeeId: number;
  employeeName: string;
  bajaVigente: { motivo: string; fechaBaja: string } | null;
  onClose: () => void;
  onHecho: () => void;
}

// Desde los componentes locales y no con toISOString(): este pasa a UTC antes
// de cortar, y en Argentina (UTC-3) entre las 21 y las 24 manda el dia siguiente.
const aISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function BajaModal({
  employeeId,
  employeeName,
  bajaVigente,
  onClose,
  onHecho,
}: Props) {
  const [motivo, setMotivo] = useState<MotivoBaja | null>(null);
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);
  const toast = useRef<Toast>(null);

  const fallar = (e: unknown) =>
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: e instanceof Error ? e.message : "No se pudo completar la acción",
      life: 6000,
    });

  const darDeBaja = async () => {
    if (!motivo || !fecha) {
      toast.current?.show({
        severity: "warn",
        summary: "Faltan datos",
        detail: "Elegí el motivo y la fecha.",
        life: 4000,
      });
      return;
    }
    setEnviando(true);
    try {
      await apiClient.post(`/rrhh/employee/${employeeId}/baja`, {
        motivo,
        fechaBaja: aISO(fecha),
        observaciones: observaciones || null,
      });
      onHecho();
      onClose();
    } catch (e) {
      fallar(e);
    } finally {
      setEnviando(false);
    }
  };

  const corregir = async () => {
    setEnviando(true);
    try {
      await apiClient.delete(`/rrhh/employee/${employeeId}/baja`);
      onHecho();
      onClose();
    } catch (e) {
      fallar(e);
    } finally {
      setEnviando(false);
    }
  };

  const reincorporar = async () => {
    if (!fecha) return;
    setEnviando(true);
    try {
      await apiClient.put(`/rrhh/employee/${employeeId}/reincorporacion`, {
        fechaReingreso: aISO(fecha),
      });
      onHecho();
      onClose();
    } catch (e) {
      fallar(e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={bajaVigente ? "Baja registrada" : "Dar de baja"}
        visible
        style={{ width: "90vw", maxWidth: "540px" }}
        onHide={onClose}
      >
        {bajaVigente ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              <strong>{employeeName}</strong> está de baja por{" "}
              <strong>{bajaVigente.motivo}</strong> desde el{" "}
              {bajaVigente.fechaBaja}.
            </p>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Fecha de reingreso
              </label>
              <Calendar
                value={fecha}
                onChange={(e) => setFecha(e.value as Date)}
                dateFormat="yy-mm-dd"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Reincorporar le devuelve todos sus permisos. La baja queda en el
                historial con esta fecha.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                label="Reincorporar"
                onClick={reincorporar}
                disabled={enviando}
              />
              <Button
                label="Corregir (fue un error)"
                severity="secondary"
                outlined
                onClick={corregir}
                disabled={enviando}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Corregir borra la baja como si nunca se hubiera cargado, así no
              queda contada en las estadísticas. Las solicitudes de licencia que
              se cancelaron no se recuperan: hay que pedirlas de nuevo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Motivo</label>
              <Dropdown
                value={motivo}
                onChange={(e) => setMotivo(e.value)}
                options={MOTIVOS}
                placeholder="Elegí el motivo…"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Fecha de baja
              </label>
              <Calendar
                value={fecha}
                onChange={(e) => setFecha(e.value as Date)}
                dateFormat="yy-mm-dd"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Puede ser pasada, para regularizar el legajo, o futura: en ese
                caso queda programada y aplica sola ese día.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Observaciones
              </label>
              <InputTextarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Número de resolución, por ejemplo"
                className="w-full"
              />
            </div>
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-xs text-foreground font-semibold mb-1">
                Al aplicarse, {employeeName}:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                <li>conserva su cuenta y puede seguir entrando</li>
                <li>solo ve su documentación: pierde inicio, CV, asistencia, licencias y encuesta</li>
                <li>deja de acumular vacaciones y saldo de asistencia</li>
                <li>pierde las solicitudes de licencia que tenga sin resolver</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-2">
              <Button label="Dar de baja" onClick={darDeBaja} disabled={enviando} />
              <Button
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={onClose}
                disabled={enviando}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
