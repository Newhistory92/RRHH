"use client"
import { Archive, ArrowLeft, Bell, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import {ApplyLicenseModal} from "@/app/Componentes/ModalRRHH/LicenseModal"


export const MessagesView = ({ employees, archivedMessages, onBack, onApplyLicense }) => {
    const [selectedMessageData, setSelectedMessageData] = useState(null);
    const [activeTab, setActiveTab] = useState('pendientes');
    const pendingMessages = employees.flatMap(employee => employee.mensajes.map(message => ({ ...message, employeeId: employee.id, employeeName: `${employee.nombre} ${employee.apellido}` })));
    const handleApplyAndClose = (message) => { onApplyLicense(message.employeeId, message); setSelectedMessageData(null); };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={16} className="mr-2" />Volver</button>
            <div className="sm:flex sm:items-center mb-6"><div className="sm:flex-auto"><h1 className="text-2xl font-bold leading-6 text-gray-900">Mensajes y Solicitudes</h1><p className="mt-2 text-sm text-gray-700">Gestiona las solicitudes de licencia pendientes y consulta el historial.</p></div></div>
            
            <div className="border-b border-gray-200 mb-4"><nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('pendientes')} className={`${activeTab === 'pendientes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>Pendientes <Mail size={16} className="ml-2"/> {pendingMessages.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pendingMessages.length}</span>}</button>
                <button onClick={() => setActiveTab('historial')} className={`${activeTab === 'historial' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>Historial <Archive size={16} className="ml-2"/></button>
            </nav></div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                {activeTab === 'pendientes' && (pendingMessages.length > 0 ? pendingMessages.map((msg) => (<div key={`${msg.employeeId}-${msg.id}`} onClick={() => setSelectedMessageData(msg)} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-4"><div className="flex-shrink-0 pt-1"><Mail className="text-blue-500" size={24} /></div><div><p className="font-semibold text-gray-800">{msg.employeeName}</p><p className="text-sm text-gray-600">{msg.texto}</p><p className="text-xs text-gray-500 mt-1">Hacer clic para ver detalles y aplicar.</p></div></div>)) : (<div className="text-center py-16 text-gray-500"><Bell size={48} className="mx-auto text-gray-400" /><p className="mt-4 font-semibold">No hay mensajes pendientes.</p></div>))}
                {activeTab === 'historial' && (archivedMessages.length > 0 ? archivedMessages.map((msg) => (<div key={`${msg.employeeId}-${msg.id}`} className="p-4 border rounded-lg bg-gray-50 flex items-start space-x-4"><div className="flex-shrink-0 pt-1"><CheckCircle className="text-green-500" size={24} /></div><div><p className="font-semibold text-gray-700">{msg.employeeName}</p><p className="text-sm text-gray-600 italic">&quot;{msg.texto}&quot;</p><p className="text-xs text-gray-500 mt-1">Procesado el: {msg.processedDate}</p></div></div>)) : (<div className="text-center py-16 text-gray-500"><Archive size={48} className="mx-auto text-gray-400" /><p className="mt-4 font-semibold">El historial de mensajes está vacío.</p></div>))}
            </div>
            <ApplyLicenseModal message={selectedMessageData} onClose={() => setSelectedMessageData(null)} onApply={handleApplyAndClose} employeeName={selectedMessageData?.employeeName}/>
        </div>
    );
};