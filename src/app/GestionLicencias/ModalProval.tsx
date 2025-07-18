"use client"

import React, { useState } from 'react';
import { Button } from '@/app/Componentes/Buttom';
import { Modal } from '@/app/Componentes/Modal';


export const ApprovalModal = ({ request, supervisores, onClose, onManage }) => {
    const [siguienteSupervisorId, setSiguienteSupervisorId] = useState('');
    const [observacion, setObservacion] = useState('');
    
    const handleApprove = () => {
        onManage(request.id, 'aprobar', { siguienteSupervisorId });
        onClose();
    };
    const handleReject = () => {
        if (!observacion.trim()) { alert('Debe agregar una observación para rechazar.'); return; }
        onManage(request.id, 'rechazar', { observacion });
        onClose();
    };

    return (
        <Modal show={true} onClose={onClose} title={`Revisión de Solicitud de ${request.solicitanteNombre}`}>
            <div className="space-y-4">
                {request.aprobaciones?.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-bold text-blue-800">Historial de Aprobaciones</h4>
                        <ul className="list-disc list-inside text-sm text-blue-700">
                            {request.aprobaciones.map(a => <li key={a.supervisorId}>Aprobado por {a.nombre} el {new Date(a.fecha).toLocaleDateString()}.</li>)}
                        </ul>
                    </div>
                )}
                <div>
                    <h4 className="font-bold mb-1">Mensaje Original:</h4>
                    <pre className="w-full p-3 border rounded-lg bg-gray-50 font-sans text-sm whitespace-pre-wrap">{request.mensaje}</pre>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-bold text-yellow-800">Acciones</h4>
                    <div className="mt-2 space-y-3">
                        <div>
                            <label className="font-semibold block mb-1">Aprobar y derivar a (opcional):</label>
                            <select value={siguienteSupervisorId} onChange={e => setSiguienteSupervisorId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                                <option value="">-- APROBACIÓN FINAL --</option>
                                {supervisores.map(sup => (<option key={sup.id} value={sup.id}>{sup.nombreCompleto}</option>))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Si no seleccionas a nadie, la solicitud quedará aprobada definitivamente.</p>
                        </div>
                        <div>
                             <label className="font-semibold block mb-1">O rechazar con observación:</label>
                             <textarea value={observacion} onChange={e => setObservacion(e.target.value)} rows="3" placeholder="Ej: Fechas no disponibles..." className="w-full p-2 border rounded-lg"></textarea>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={onClose} variant="secondary">Cerrar</Button>
                    <Button onClick={handleReject} variant="danger" disabled={!!siguienteSupervisorId || !observacion}>Rechazar</Button>
                    <Button onClick={handleApprove} variant="success" disabled={!!observacion}>Aprobar</Button>
                </div>
            </div>
        </Modal>
    );
};
