import { getInitialDB } from "@/app/api/Prueba";
import { Button } from "@/app/Componentes/Buttom";
import { Spinner } from "@/app/Componentes/Loading";
import { useEffect, useState } from "react";
import { FileText, LogOut, } from 'lucide-react';
import dynamic from "next/dynamic";

const RequestForm = dynamic(() => import("@/app/GestionLicencias/FormularioLicencia"), {
  ssr: false,
});

const  ConteinerLicencia = dynamic(() => import("@/app/GestionLicencias/Licencias"), {
  ssr: false,
});

export default function LicenciasManage() {
  const [db, setDb] = useState(getInitialDB());
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('contenedor');
  const userId = 'empleado-1'; // Simula un usuario logueado, puedes cambiarlo para probar otros usuarios
  const misSolicitudes = currentUser ? db.solicitudes.filter(s => s.solicitanteId === currentUser.id).sort((a,b) => b.createdAt - a.createdAt) : [];
  const solicitudesPendientes = currentUser?.rol === 'supervisor' ? db.solicitudes.filter(s => s.supervisorId === currentUser.id && s.estado.startsWith('Pendiente')).sort((a,b) => a.createdAt - b.createdAt) : [];
  const supervisores = Object.values(db.usuarios).filter(u => u.rol === 'supervisor');
  const misSaldos = currentUser ? db.saldos[currentUser.id] : null;

  useEffect(() => {
    if (userId) {
        setIsLoading(true);
       setCurrentUser(db.usuarios[userId]);
    }
    setIsLoading(false);
  }, [userId]);

  const handleLogout = () => {
    setCurrentUser(null);
    setView('contenedor');
  };
  const handleNewRequest = (nuevaSolicitud) => {
    setDb(prevDb => ({...prevDb, solicitudes: [...prevDb.solicitudes, nuevaSolicitud]}));
    setView('contenedor');
  };
  const handleManageRequest = (solicitudId, accion, data) => {
    setDb(prevDb => {
        const dbCopy = JSON.parse(JSON.stringify(prevDb));
        const solicitud = dbCopy.solicitudes.find(s => s.id === solicitudId);
        if (!solicitud) return dbCopy;

        const aprobadorActual = dbCopy.usuarios[currentUser.id];
        solicitud.aprobaciones = solicitud.aprobaciones || [];
        solicitud.aprobaciones.push({ supervisorId: aprobadorActual.id, nombre: aprobadorActual.nombreCompleto, fecha: new Date().toISOString(), accion });
        
        if (accion === 'aprobar') {
            if (data.siguienteSupervisorId) {
                solicitud.estado = 'Pendiente Siguiente Aprobación';
                solicitud.supervisorId = data.siguienteSupervisorId;
            } else {
                solicitud.estado = 'Aprobado';
                solicitud.supervisorId = null; // Aprobación final
                const saldosUsuario = dbCopy.saldos[solicitud.solicitanteId];
                Object.entries(solicitud.tiposLicencia).forEach(([anio, tipos]) => {
                    const saldoAnual = saldosUsuario.find(s => s.anio === parseInt(anio));
                    if(saldoAnual) {
                        Object.entries(tipos).forEach(([tipo, dias]) => {
                            saldoAnual[tipo] -= dias;
                        });
                    }
                });
            }
        } else { // rechazar
            solicitud.estado = 'Rechazado';
            solicitud.observacion = data.observacion;
            solicitud.supervisorId = null; // Devuelta al usuario
        }
        return dbCopy;
    });
  };

  if (isLoading) return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><Spinner /></div>;

  
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
   
        <div className="flex items-center gap-3"><FileText className="text-blue-600" size={32}/><h1 className="text-2xl font-bold text-gray-800">Gestión de Licencias</h1></div>
      <main className="p-4 md:p-8">
        {view === 'contenedor' && <ConteinerLicencia userData={currentUser} saldos={misSaldos} misSolicitudes={misSolicitudes} solicitudesPendientes={solicitudesPendientes} onNewRequest={() => setView('new_request')} onManageRequest={handleManageRequest} db={db} supervisores={supervisores} />}
        {view === 'new_request' && <RequestForm saldos={misSaldos} supervisores={supervisores.filter(s => s.id !== currentUser.id)} userData={currentUser} onCancel={() => setView('dashboard')} onSubmit={handleNewRequest}/>}
      </main>
    </div>
  );
}