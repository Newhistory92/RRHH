/* eslint-disable @typescript-eslint/no-explicit-any */

import {  useRef, useState } from "react";
import { FileText, } from 'lucide-react';
import dynamic from "next/dynamic";
import {EMPLOYEES_DATA} from "@/app/api/prueba2";
import {Employee,Usuario,LicenseHistory} from "@/app/Interfas/Interfaces"
import { Toast } from 'primereact/toast';            
const RequestForm = dynamic(() => import("@/app/GestionLicencias/FormularioLicencia"), {
  ssr: false,
});

const  ConteinerLicencia = dynamic(() => import("@/app/GestionLicencias/Licencias"), {
  ssr: false,
});


export default function LicenciasManage() {
  const [currentUser, setCurrentUser] = useState<Employee>(EMPLOYEES_DATA[0]);
  const [view, setView] = useState("contenedor");
   const toast = useRef<Toast>(null);
  console.log(currentUser);

const misSolicitudes: LicenseHistory[] = currentUser
  ? currentUser.licenses.history
      .filter((s) => s.solicitanteId === currentUser.id)   
      .sort((a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
  : [];
  

 // 🔹 2. Solicitudes pendientes si el empleado ACTUAL es supervisor
const misSubordinados = currentUser.subordinates || []; // IDs de empleados que reportan a Ana
const solicitudesPendientes: LicenseHistory[] =
  currentUser?.role === "supervisor"
    ? currentUser.licenses.history
        ?.filter((s) => {
          // Ver solicitudes donde:
          // 1. Ella sea la supervisor directa, O
          // 2. La solicitud sea de uno de sus subordinados
          return (s.supervisorId === currentUser.id) || 
                 (misSubordinados.includes(s.solicitanteId) && s.status?.startsWith("Pendiente"));
        })
        .sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : [];
console.log(solicitudesPendientes)

  const supervisores: Usuario[] = Object.values(currentUser.licenses.usuarios).filter(
    (u) => u.role === "supervisor"
  );
  

const misSaldos = currentUser.licenses?.saldos;

  const handleNewRequest = (nuevaSolicitud:LicenseHistory) => {
    setCurrentUser(prev => ({
  ...prev,
  licenses: {
    ...prev.licenses,
    history: [...prev.licenses.history, nuevaSolicitud]
  }
}));
    setView("contenedor");
  };

  const handleManageRequest = (
    solicitudId: number,
    accion: "aprobar" | "rechazar",
    data: { siguienteSupervisorId?: number; observacion?: string }
  ) => {
    setCurrentUser((prev) => {
      if (!prev) {
        toast.current?.show({
          severity: "warn",
          summary: "Error",
          detail: "No hay usuario logueado.",
          life: 3000,
        });
        return prev;
      }

      // Clonar para no mutar estado
      const next =
        typeof structuredClone === "function"
          ? structuredClone(prev)
          : (JSON.parse(JSON.stringify(prev)) as Employee);

      // Buscar la solicitud
      const solicitud = next.licenses?.history?.find(
        (s) => String(s.id) === String(solicitudId)
      );
      if (!solicitud) {
        toast.current?.show({
          severity: "warn",
          summary: "No encontrado",
          detail: "Solicitud no encontrada.",
          life: 3000,
        });
        return prev;
      }

      // Aprobador actual: el usuario logueado
    const aprobadorActual = next.licenses.usuarios[prev.id]
      if (!aprobadorActual) {
        toast.current?.show({
          severity: "warn",
          summary: "No autorizado",
          detail: "El usuario actual no es un supervisor válido.",
          life: 3000,
        });
        return prev;
      }

      // Registrar aprobación / rechazo
      solicitud.aprobaciones = solicitud.aprobaciones || [];
      solicitud.aprobaciones.push({
        supervisorId: aprobadorActual.id,
        nombre: aprobadorActual.name,
        fecha: new Date().toISOString(),
        accion,
        observacion: data.observacion,
      });

      // Lógica de gestión
      if (accion === "aprobar") {
        if (data.siguienteSupervisorId) {
          solicitud.status = "Pendiente Siguiente Aprobación";
          solicitud.supervisorId = data.siguienteSupervisorId;
        } else {
          solicitud.status = "Aprobada";
          (solicitud as any).supervisorId = null;

          // --- Actualizar saldos ---
          const solicitanteKey = String(solicitud.solicitanteId ?? prev.id);
          const perUserSaldos = (next.licenses?.saldos as any)?.[solicitanteKey];

          if (Array.isArray(perUserSaldos)) {
            // Estructura: Saldo[] por usuario
            Object.entries(solicitud.tiposLicencia || {}).forEach(
              ([anio, tipos]) => {
                const saldoAnual = perUserSaldos.find(
                  (s: any) => String(s.anio) === String(anio)
                );
                if (saldoAnual) {
                  Object.entries(tipos).forEach(([tipo, dias]) => {
                    if (typeof saldoAnual[tipo] === "number") {
                      saldoAnual[tipo] =
                        (saldoAnual[tipo] as number) - Number(dias);
                    }
                  });
                }
              }
            );
          } else {
            // Estructura: saldos globales por año
            Object.entries(solicitud.tiposLicencia || {}).forEach(
              ([anio, tipos]) => {
                const globalYear = (next.licenses?.saldos as any)?.[anio];
                if (globalYear && typeof globalYear === "object") {
                  Object.entries(tipos).forEach(([tipo, dias]) => {
                    if (typeof globalYear[tipo] === "number") {
                      globalYear[tipo] =
                        (globalYear[tipo] as number) - Number(dias);
                    }
                  });
                }
              }
            );
          }
        }
      } else {
        // Rechazo
        solicitud.status = "Rechazada";
        solicitud.observacion = data.observacion || solicitud.observacion;
        (solicitud as any).supervisorId = null;
      }

      // Feedback con toast
      toast.current?.show({
        severity: "success",
        summary: "Solicitud gestionada",
        detail:
          accion === "aprobar"
            ? "Solicitud aprobada correctamente."
            : "Solicitud rechazada correctamente.",
        life: 3000,
      });

      return next;
    });
  };


  // Verificación de que currentUser no sea null antes de renderizar
  if (!currentUser) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="flex items-center gap-3 py-4 px-4">
        <FileText className=" text-[#1ABCD7] text-shadow-md" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Licencias
        </h1>
      </div>
      <main className="p-4 md:p-8">
        {view === "contenedor" && (
          <ConteinerLicencia
            userData={currentUser} 
            saldos={misSaldos} 
            misSolicitudes={misSolicitudes}
            solicitudesPendientes={solicitudesPendientes}
            onNewRequest={() => setView("new_request")}
            onManageRequest={handleManageRequest} 
            supervisores={supervisores} 
          />
        )}
        {view === "new_request" && (
          <RequestForm
            saldos={misSaldos}
            supervisores={supervisores.filter((s) => s.id !== currentUser.id )}
            userData={currentUser} 
            onCancel={() => setView("contenedor")} 
            onSubmit={handleNewRequest}
          />
        )}
      </main>
    </div>
  );
}