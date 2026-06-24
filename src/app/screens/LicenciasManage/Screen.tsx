/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
// Página principal del módulo de Gestión de Licencias.
// - Carga datos del empleado, saldos, historial y supervisores desde la API.
// - Los supervisores se obtienen dinámicamente desde la tabla LicenseSupervisor.
// - Los saldos incluyen diasTotales, consumidos y disponibles por tipo.

import { useRef, useState, useEffect } from "react";
import { FileText, } from 'lucide-react';
import dynamic from "next/dynamic";
import { Toast } from 'primereact/toast';
import { apiClient } from "@/app/util/apiClient";
import { LicenseHistory, Usuario } from "@/app/Interfas/Interfaces";

const RequestForm = dynamic(() => import("@/app/GestionLicencias/FormularioLicencia"), { ssr: false });
const ConteinerLicencia = dynamic(() => import("@/app/GestionLicencias/Licencias"), { ssr: false });

export default function LicenciasManage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState("contenedor");
  const [misSolicitudes, setMisSolicitudes] = useState<LicenseHistory[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<LicenseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useRef<Toast>(null);
  const [misSaldos, setMisSaldos] = useState<any>({});
  // Lista dinámica de supervisores para derivación de aprobaciones (tabla LicenseSupervisor)
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const empId = Number(localStorage.getItem("employeeId"));
      const role = localStorage.getItem("roleName");

      // Fetch employee profile, solicitudes propias y saldos
      if (empId) {
        const [empRes, misReqs, saldosRes] = await Promise.all([
          apiClient.get<any>(`/employee/${empId}`),
          apiClient.get<any>(`/licenses/requests?employee_id=${empId}`),
          apiClient.get<any>(`/licenses/saldos?employee_id=${empId}`)
        ]);

        setCurrentUser({ ...empRes, role });
        setMisSolicitudes(misReqs.requests || []);

        // Transformar saldos — ahora incluye el objeto completo por tipo
        const saldosMap: any = {};
        if (saldosRes.balances) {
          saldosRes.balances.forEach((bal: any) => {
            if (!saldosMap[bal.anio]) saldosMap[bal.anio] = {};
            // Guardar objeto con diasTotales, consumidos y disponibles
            saldosMap[bal.anio][bal.tipo] = {
              diasTotales: bal.diasTotales,
              consumidos: bal.consumidos,
              disponibles: bal.disponibles,
            };
          });
        }
        setMisSaldos(saldosMap);
      }

      // Cargar supervisores para derivación desde la tabla LicenseSupervisor
      try {
        const supRes = await apiClient.get<{ supervisores: Usuario[] }>('/licenses/supervisores-disponibles');
        setSupervisores(supRes.supervisores || []);
      } catch (err) {
        console.warn("No se pudieron cargar supervisores para derivación:", err);
      }

      // Consultar solicitudes pendientes donde ESTE EMPLEADO sea el supervisor
      try {
        const pendientesReqs = await apiClient.get<any>(`/licenses/requests?supervisor_emp_id=${empId}`);
        setSolicitudesPendientes(pendientesReqs.requests || []);
      } catch (err) {
        console.warn("Error al cargar pendientes de mi aprobación:", err);
      }
    } catch (err) {
      console.error("Error fetching licenses", err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al cargar licencias' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewRequest = async (nuevaSolicitud: any) => {
    try {
      await apiClient.post('/licenses/request', nuevaSolicitud);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Solicitud enviada' });
      fetchData();
      setView("contenedor");
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la solicitud' });
    }
  };

  const handleManageRequest = async (
    solicitudId: number | undefined,
    accion: "aprobar" | "rechazar",
    data: { siguienteSupervisorId?: number; observacion?: string }
  ) => {
    if (!solicitudId) return;
    try {
      // Limpiar objeto proveniente del Dropdown en caso de comportamientos por defecto
      const rawSigSup = data.siguienteSupervisorId;
      const sigSupId = typeof rawSigSup === 'object' ? (rawSigSup as any)?.value : rawSigSup;
      const tieneSiguiente = !!sigSupId && sigSupId !== '';

      const status = accion === "aprobar" ? (tieneSiguiente ? "Pendiente Siguiente Aprobación" : "Aprobada") : "Rechazada";

      const updateData = {
        status,
        observacion: data.observacion,
        supervisorId: currentUser?.id,
        siguienteSupervisorId: tieneSiguiente ? Number(sigSupId) : null
      };
      console.log("Payload sent to API:", updateData);

      const response = await apiClient.patch(`/licenses/requests/${solicitudId}/status`, updateData);
      console.log("Response from Server:", response);

      toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: `Licencia ${status}` });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la licencia' });
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background p-4 font-sans min-h-screen">
      <Toast ref={toast} />
      <div className="flex items-center gap-3 py-4 px-4">
        <FileText className="text-primary" size={32} />
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Gestión de Licencias
        </h1>
      </div>
      <main>
        {view === "contenedor" && currentUser && (
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
        {view === "new_request" && currentUser && (
          <RequestForm
            saldos={misSaldos}
            supervisores={supervisores.filter((s) => s.id !== currentUser.id)}
            userData={currentUser}
            onCancel={() => setView("contenedor")}
            onSubmit={handleNewRequest as any}
          />
        )}
      </main>
    </div>
  );
}