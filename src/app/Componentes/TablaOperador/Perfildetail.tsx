"use client"
import { ArrowLeft } from "lucide-react";
import {ProfileTab,LicenseHistoryTab,PermissionHistoryTab} from "./DetailTables"
import {StatusBadge} from "@/app/util/UiRRHH"
import { useState } from "react";


export const EmployeeDetailView = ({ employee, onBack, onLicenseClick }) => {
    const [activeTab, setActiveTab] = useState('perfil');
    if (!employee) return null;
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 no-print"><ArrowLeft size={16} className="mr-2" />Volver a la lista</button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-white rounded-lg shadow-md">
                <img src={employee.foto} alt={`Foto de ${employee.nombre}`} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/EFEFEF/333?text=Error'; }}/>
                <div><h2 className="text-3xl font-bold text-gray-900">{employee.nombre} {employee.apellido}</h2><p className="text-gray-500 text-lg">{employee.dni}</p><div className="mt-2"><StatusBadge status={employee.estado} /></div></div>
            </div>
            <div className="border-b border-gray-200 no-print">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('perfil')} className={`${activeTab === 'perfil' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Perfil</button>
                    <button onClick={() => setActiveTab('licencias')} className={`${activeTab === 'licencias' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Historial de Licencias</button>
                    <button onClick={() => setActiveTab('permisos')} className={`${activeTab === 'permisos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Historial de Permisos</button>
                </nav>
            </div>
            <div className="no-print">
                {activeTab === 'perfil' && <ProfileTab employee={employee} />}
                {activeTab === 'licencias' && <LicenseHistoryTab licenses={employee.licencias} onRowClick={onLicenseClick} />}
                {activeTab === 'permisos' && <PermissionHistoryTab permisos={employee.permisos} />}
            </div>
        </div>
    );
};