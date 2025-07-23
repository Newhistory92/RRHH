"use client"

import  { useState,  useRef } from 'react';
import {  User,  Clock, Calendar, CheckCircle, XCircle, Printer } from 'lucide-react';
import {InfoCard} from "@/app/util/UiRRHH"

export const ApplyLicenseModal = ({ message, onApply, onClose, employeeName }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4"><h3 className="text-xl font-bold text-gray-800">Confirmar Licencia</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
                <div className="space-y-4"><p><strong className="text-gray-600">Empleado:</strong> {employeeName}</p><p><strong className="text-gray-600">Mensaje:</strong> <span className="text-gray-700 italic">"{message.texto}"</span></p><div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p><strong className="text-blue-800">Días solicitados:</strong> {message.dias}</p><p><strong className="text-blue-800">Fechas:</strong> del {message.fechaInicio} al {message.fechaFin}</p></div></div>
                <div className="mt-6 flex justify-end space-x-3"><button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button><button onClick={() => onApply(message)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"><CheckCircle size={18} className="mr-2" />Aplicar Licencia</button></div>
            </div>
        </div>
    );
};

export const PermissionModal = ({ employee, onSave, onClose }) => {
    const [salida, setSalida] = useState('');
    const [retorno, setRetorno] = useState('');
    if (!employee) return null;
    const handleSubmit = (e) => { e.preventDefault(); if (salida && retorno && retorno > salida) { onSave(employee.id, { salida, retorno }); onClose(); } else { alert('La hora de retorno debe ser posterior a la hora de salida.'); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4"><h3 className="text-xl font-bold text-gray-800">Registrar Permiso de Salida</h3><button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
                <div className="space-y-4"><p><strong className="text-gray-600">Empleado:</strong> {employee.nombre} {employee.apellido}</p><div><label htmlFor="salida" className="block text-sm font-medium text-gray-700">Hora de Salida</label><input type="time" id="salida" value={salida} onChange={(e) => setSalida(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /></div><div><label htmlFor="retorno" className="block text-sm font-medium text-gray-700">Hora de Retorno</label><input type="time" id="retorno" value={retorno} onChange={(e) => setRetorno(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /></div></div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"><CheckCircle size={18} className="mr-2" />Guardar Permiso</button></div>
            </form>
        </div>
    );
};

export const LicenseDetailModal = ({ license, onClose }) => {
    if (!license) return null;
    const printableRef = useRef();
    const handlePrint = () => { window.print(); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div ref={printableRef} className="printable-area">
                    <div className="flex justify-between items-start border-b pb-3 mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Detalle de Licencia Aprobada</h3>
                            <p className="text-sm text-gray-500">Comprobante de respaldo</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 no-print"><XCircle size={24} /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={User} title="Tipo de Licencia">{license.tipo}</InfoCard>
                            <InfoCard icon={CheckCircle} title="Estado">{license.estado}</InfoCard>
                            <InfoCard icon={Calendar} title="Período">{license.inicio} al {license.fin}</InfoCard>
                            <InfoCard icon={Clock} title="Duración">{license.duracion} días hábiles</InfoCard>
                        </div>
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 className="font-semibold text-gray-700 mb-2">Respaldo de Aprobación (Mensaje Original)</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm text-gray-600 italic">"{license.mensajeOriginal}"</p>
                                <p className="text-xs text-gray-500 mt-2">Días solicitados: {license.diasSolicitados} | Fechas: {license.fechasSolicitadas}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3 no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cerrar</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center"><Printer size={18} className="mr-2" />Imprimir Comprobante</button>
                </div>
            </div>
        </div>
    );
};
