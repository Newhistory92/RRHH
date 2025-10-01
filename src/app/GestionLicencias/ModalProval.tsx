"use client"

import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { LicenseHistory} from "@/app/Interfas/Interfaces"



interface Supervisor {
  id: number;
  name: string;
}

interface ApprovalModalProps {
  request: LicenseHistory;
  supervisores: Supervisor[];
  onClose: () => void;
  onManage: (
    requestId: number | undefined,
    action: 'aprobar' | 'rechazar',
    data: { siguienteSupervisorId?: number; observacion?: string }
  ) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  supervisores,
  onClose,
  onManage,
}) => {
  const [siguienteSupervisorId, setSiguienteSupervisorId] = useState<number>();
  const [observacion, setObservacion] = useState<string>("");
  const toast = useRef<Toast>(null);

  const handleApprove = () => {
    onManage(request.id, "aprobar", { siguienteSupervisorId });
    onClose();
  };

  const handleReject = () => {
    if (!observacion.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Observación requerida',
        detail: 'Debe agregar una observación para rechazar.',
        life: 3000,
      });
      return;
    }
    onManage(request.id, "rechazar", { observacion });
    onClose();
  };

  const supervisorOptions = [
    { label: '-- APROBACIÓN FINAL --', value: '' },
    ...supervisores.map((sup) => ({
      label: sup.name,
      value: sup.id.toString(),
    })),
  ];

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
        text raised
      />
      <Button
        label="Rechazar"
        icon="pi pi-times-circle"
        onClick={handleReject}
        severity="danger"
        raised
        disabled={!!siguienteSupervisorId || !observacion.trim()}
      />
      <Button
        label="Aprobar"
        icon="pi pi-check"
        onClick={handleApprove}
        severity="success"
        raised
        disabled={!!observacion.trim()}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Revisión de Solicitud de ${request.name}`}
        visible={true}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        onHide={onClose}
        footer={footerContent}
        modal
      >
        <div className="space-y-4">
          {/* Historial de Aprobaciones */}
          {request.aprobaciones && request.aprobaciones.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">
                Historial de Aprobaciones
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-700">
                {request.aprobaciones.map((a) => (
                  <li key={a.supervisorId}>
                    Aprobado por {a.nombre} el{" "}
                    {new Date(a.fecha).toLocaleDateString()}.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mensaje Original */}
          <div>
            <h4 className="font-bold mb-2">Mensaje Del Solicitante:</h4>
            <pre className="w-full p-3 border rounded-lg bg-gray-50 font-sans text-sm whitespace-pre-wrap">
              {request.originalMessage}
            </pre>
          </div>

          {/* Acciones */}
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
            <h4 className="font-bold text-[#1ABCD7]  mb-3">Tomar Decision</h4>
            <div className="space-y-4">
              {/* Dropdown para aprobar y derivar */}
              <div>
                <label htmlFor="supervisor-dropdown" className="font-semibold block mb-2">
                  Aprobar y derivar al Siguiente Supervisor:
                </label>
                <Dropdown
                  id="supervisor-dropdown"
                  value={siguienteSupervisorId}
                  options={supervisorOptions}
                  onChange={(e) => setSiguienteSupervisorId(e.value)}
                  placeholder="Seleccione un supervisor"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no seleccionas a nadie, la solicitud quedará aprobada
                  definitivamente.
                </p>
              </div>

              {/* Textarea para rechazar */}
              <div>
                <label htmlFor="observacion-textarea" className="font-semibold block mb-2">
                  O rechazar con observación:
                </label>
                <InputTextarea
                  id="observacion-textarea"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Ej: Fechas no disponibles..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};