"use client"
import React, { useState,  useMemo, useEffect } from 'react';
import { Users, Calendar, Send,  Briefcase, Award, GraduationCap,  Clock, Code, ChevronsRight, MessageSquare } from 'lucide-react';
import { Button } from '@/app/Componentes/Buttom';
import { Card } from '@/app/Componentes/Card';  
import { Modal } from '@/app/Componentes/Modal';
import { ApprovalModal } from './ModalProval';
import { Spinner } from '../Componentes/Loading';



export default function ConteinerLicencia({ userData, saldos, misSolicitudes, solicitudesPendientes, onNewRequest, onManageRequest, db, supervisores }) {
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

  const fechasPendientes = useMemo(() => {
    return solicitudesPendientes.map((solicitud) => ({
        ...solicitud,
        fechaDesdeParsed: new Date(solicitud.fechaDesde),
        fechaHastaParsed: new Date(solicitud.fechaHasta),
    }));
}, [solicitudesPendientes]);

const misFechasSolicitudes = useMemo(() => {
    return misSolicitudes.map((solicitud) => ({
        ...solicitud,
        fechaDesdeParsed: new Date(solicitud.fechaDesde),
        fechaHastaParsed: new Date(solicitud.fechaHasta),
    }));
}, [misSolicitudes]);

    const getStatusChip = (estado, observacion) => {
        const styles = {'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200','Pendiente Siguiente Aprobación': 'bg-cyan-100 text-cyan-800 border-cyan-200','Aprobado': 'bg-green-100 text-green-800 border-green-200','Rechazado': 'bg-red-100 text-red-800 border-red-200'};
        return <span title={observacion} className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[estado] || 'bg-gray-100'}`}>{estado}</span>;
    }
    const licenciaIconos = { Licencias: <Briefcase/>, Particulares: <Users/>, Articulos: <Award/>, Examen: <GraduationCap/> };
    const jsonDataString = useMemo(() => JSON.stringify({ "Base de Datos Completa": db }, null, 2), [db]);

    return (
        <div className="space-y-8">
            {selectedRequest && <ApprovalModal request={selectedRequest} supervisores={supervisores.filter(s => s.id !== userData.id && !selectedRequest.aprobaciones?.some(a => a.supervisorId === s.id))} onManage={onManageRequest} onClose={() => setSelectedRequest(null)} />}
            <Modal show={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title="Datos Locales en Vivo (JSON)">
                <pre className="bg-gray-900 text-green-300 font-mono p-4 rounded-lg text-xs overflow-auto max-h-[60vh]"><code>{jsonDataString}</code></pre>
            </Modal>
            <div className="flex justify-end"><Button onClick={() => setIsJsonModalOpen(true)} variant="secondary"><Code size={18}/> Visualizar JSON</Button></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-blue-600"/> Mis Saldos</h2>
                    {!saldos ? <Spinner/> : (
                        <div className="space-y-4">
                            {saldos.map(saldo => (
                                <details key={saldo.anio} className="bg-gray-50 p-2 rounded-lg">
                                    <summary className="font-semibold text-lg cursor-pointer">Año {saldo.anio}</summary>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center pt-3">
                                        {Object.entries(saldo).filter(([k]) => k !== 'anio').map(([tipo, dias]) => (
                                            <div key={tipo}><p className="font-semibold text-gray-700 flex items-center justify-center gap-1">{licenciaIconos[tipo]} {tipo}</p><p className="text-2xl font-bold text-blue-600">{dias}</p></div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    )}
                </Card>
                <Card className="flex flex-col justify-center items-center text-center"><h2 className="text-xl font-bold mb-4">Nueva Solicitud</h2><p className="text-gray-600 mb-4">Inicia una nueva solicitud de licencia aquí.</p><Button onClick={onNewRequest}><Send size={18}/> Solicitar Licencia</Button></Card>
            </div>
            {userData.rol === 'supervisor' && solicitudesPendientes.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2"><Clock/> Solicitudes Pendientes de Mi Aprobación</h2>
                    <div className="space-y-2">
                        {fechasPendientes.map(solicitud => (
                            <button key={solicitud.id} onClick={() => setSelectedRequest(solicitud)} className="w-full text-left p-4 border rounded-lg bg-yellow-50 hover:bg-yellow-100 flex justify-between items-center">
                                <div>
                               <p>
                               <span className="font-bold">{solicitud.solicitanteNombre}</span> solicita <span className="font-bold">{solicitud.diasHabiles} días</span>
                              </p>
                              <p className="text-sm text-gray-600">
                             Del {solicitud.fechaDesdeParsed.toLocaleDateString()} al {solicitud.fechaHastaParsed.toLocaleDateString()}
                             </p>
                             </div>
                          <ChevronsRight/>
                            </button>
                        ))}
                    </div>
                </Card>
            )}
            <Card>
                <h2 className="text-xl font-bold mb-4">Historial de Mis Solicitudes</h2>
                <div className="space-y-3">
                    {misSolicitudes.length > 0 ? misSolicitudes.map(solicitud => (
                        <div key={solicitud.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                            <div><p className="font-semibold">Solicitud por {solicitud.diasHabiles} días</p><p className="text-sm text-gray-600">Del {new Date(solicitud.fechaDesde).toLocaleDateString()} al {new Date(solicitud.fechaHasta).toLocaleDateString()}</p>
                            {solicitud.estado === 'Rechazado' && <p className="text-sm text-red-600 mt-1"><MessageSquare size={14} className="inline"/> <span className="font-bold">Observación:</span> {solicitud.observacion}</p>}</div>
                            {getStatusChip(solicitud.estado, solicitud.observacion)}
                        </div>
                    )) : <p className="text-gray-500 text-center py-4">No tienes solicitudes registradas.</p>}
                </div>
            </Card>
        </div>
    );
};