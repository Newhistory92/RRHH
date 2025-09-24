
import { Spinner } from "@/app/Componentes/Loading";
import { useEffect, useState } from "react";
import { FileText, } from 'lucide-react';
import dynamic from "next/dynamic";
import {EMPLOYEES_DATA} from "@/app/api/prueba2";
import {Employee,Usuario,LicenseHistory} from "@/app/Interfas/Interfaces"

const RequestForm = dynamic(() => import("@/app/GestionLicencias/FormularioLicencia"), {
  ssr: false,
});

const  ConteinerLicencia = dynamic(() => import("@/app/GestionLicencias/Licencias"), {
  ssr: false,
});


export default function LicenciasManage() {
  const [db, setDb] = useState<Employee>(EMPLOYEES_DATA[0]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("contenedor");
  const userId = "empleado-1"; // Simula un usuario logueado, puedes cambiarlo para probar otros usuarios
  // Solicitudes hechas por el usuario logueado
  const misSolicitudes: LicenseHistory[] = currentUser
  ? db.licenses.history
      .filter((s) => s.id === currentUser.id)
      .sort((a, b) => b.createdAt - a.createdAt)
  : [];
  // 🔹 2. Solicitudes pendientes si el empleado PRINCIPAL (db) es supervisor
  const solicitudesPendientes: LicenseHistory[] =
    db.role === "supervisor"
      ? db.licenses.history
          ?.filter(
            (s) =>
              s.supervisorId === currentUser?.id &&
              s.status?.startsWith("Pendiente")
          )
          .sort((a, b) => a.createdAt - b.createdAt)
      : [];
const supervisores: Usuario[] = Object.values(db.licenses.usuarios).filter(
  (u) => u.role === "supervisor"
);
  const misSaldos = currentUser ? db.licenses.saldos[currentUser.id] : null;

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setCurrentUser(db.licenses.usuarios[userId] || null);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  console.log("Licenses:", db.licenses);
  console.log("Mis solicitudes:", misSolicitudes);
  console.log("Solicitudes pendientes:", solicitudesPendientes);
  console.log("Supervisores:", supervisores);
  console.log("Mis saldos:", misSaldos);

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
      solicitud.type = "Rechazado";
      solicitud.observacion = data.observacion;
      solicitud.supervisorId = null;
    }

    return dbCopy;
  });
};


  if (isLoading)
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="flex items-center gap-3 py-4 px-4">
        <FileText className="text-blue-600" size={32} />
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
            db={db}
            supervisores={supervisores}
          />
        )}
        {view === "new_request" && (
          <RequestForm
            saldos={misSaldos}
            supervisores={supervisores.filter((s) => s.id !== currentUser.id )}
            userData={currentUser}
            onCancel={() => setView("dashboard")}
            onSubmit={handleNewRequest}
          />
        )}
      </main>
    </div>
  );
}