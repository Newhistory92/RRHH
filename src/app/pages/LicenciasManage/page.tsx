
import { useEffect, useState } from "react";
import { FileText, } from 'lucide-react';
import dynamic from "next/dynamic";
import {EMPLOYEES_DATA} from "@/app/api/prueba2";
import {Employee,Usuario,LicenseHistory, Saldo} from "@/app/Interfas/Interfaces"
import { ProgressSpinner } from 'primereact/progressspinner';
        
const RequestForm = dynamic(() => import("@/app/GestionLicencias/FormularioLicencia"), {
  ssr: false,
});

const  ConteinerLicencia = dynamic(() => import("@/app/GestionLicencias/Licencias"), {
  ssr: false,
});


export default function LicenciasManage() {
  //const [db, setDb] = useState<Employee>(EMPLOYEES_DATA[0]);
  const [currentUser, setCurrentUser] = useState<Employee>(EMPLOYEES_DATA[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("contenedor");
  const userId = 1; 
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
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setCurrentUser(currentUser.licenses.usuarios[userId] || null);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleNewRequest = (nuevaSolicitud:LicenseHistory) => {
    setDb((prevDb) => ({
      ...prevDb,
      licenses: {
        ...prevDb.licenses,
       history: [...prevDb.licenses.history, nuevaSolicitud],
      },
    }));
    setView("contenedor");
  };

  const handleManageRequest = (
    solicitudId: string,
    accion: "aprobar" | "rechazar",
    data: { siguienteSupervisorId?: string; observacion?: string }
  ) => {
    setDb((prevDb) => {
      const dbCopy: Employee = structuredClone(prevDb);

      const solicitud = dbCopy.licenses.history.find(
        (s: LicenseHistory) => s.id === solicitudId
      );
      if (!solicitud) return dbCopy;

      const aprobadorActual = dbCopy.licenses.usuarios[currentUser!.id];
      solicitud.aprobaciones = solicitud.aprobaciones || [];
      solicitud.aprobaciones.push({
        supervisorId: aprobadorActual.id,
        nombre: aprobadorActual.name ?? aprobadorActual.name,
        fecha: new Date().toISOString(),
        accion,
      });

      if (accion === "aprobar") {
        if (data.siguienteSupervisorId) {
          solicitud.status = 'Pendiente Siguiente Aprobación';
          solicitud.supervisorId = data.siguienteSupervisorId;
        } else {
          solicitud.status = 'Aprobada';
          solicitud.supervisorId = null;

          const saldosUsuario = dbCopy.licenses.saldos[solicitud.id];
          Object.entries(solicitud.tiposLicencia).forEach(
            ([anio, tipos]: [string, Record<string, number>]) => {
              const saldoAnual = saldosUsuario.find(
                (s) => s.anio === parseInt(anio)
              );
              if (saldoAnual) {
                Object.entries(tipos).forEach(
                  ([tipo, dias]: [string, number]) => {
                    saldoAnual[tipo] = (saldoAnual[tipo] as number) - dias;
                  }
                );
              }
            }
          );
        }
      } else {
        solicitud.status = "Rechazada"; 
        solicitud.observacion = data.observacion;
        solicitud.supervisorId = null;
      }

      return dbCopy;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
         <ProgressSpinner />
      </div>
    );
  }

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