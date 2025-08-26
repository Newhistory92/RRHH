"use client"

import { useMemo, useState } from "react";
import {initialEmployees,initialArchivedMessages} from "@/app/api/Prueba"
import {EmployeeDetailView} from "@/app/Componentes/TablaOperador/Perfildetail"
import { MessagesView } from "@/app/Componentes/TablaOperador/MensajeDetail";
import { EmployeeTableView } from "@/app/Componentes/TablaOperador/Table";
import { LicenseDetailModal, PermissionModal } from "@/app/Componentes/ModalRRHH/LicenseModal";

export default function RecursosHumanosPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [archivedMessages, setArchivedMessages] = useState(initialArchivedMessages);
  const [currentView, setCurrentView] = useState({ name: 'table' });
  const [permissionModalEmployeeId, setPermissionModalEmployeeId] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);

  const handleApplyLicense = (employeeId, message) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const newLicense = { id: `L${Date.now()}`, tipo: 'Vacaciones', inicio: message.fechaInicio, fin: message.fechaFin, estado: 'Aprobada', duracion: message.dias, mensajeOriginal: message.texto, diasSolicitados: message.dias, fechasSolicitadas: `del ${message.fechaInicio} al ${message.fechaFin}`};
        return { ...emp, estado: 'De licencia', licencias: [...emp.licencias, newLicense], mensajes: emp.mensajes.filter(m => m.id !== message.id) };
      }
      return emp;
    }));
    setArchivedMessages(prev => [...prev, { ...message, employeeId, processedDate: new Date().toLocaleDateString('es-AR') }]);
    alert('Licencia aplicada correctamente.');
  };

  const handleApplyPermission = (employeeId, { salida, retorno }) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const exitTime = new Date(`1970-01-01T${salida}:00`);
        const returnTime = new Date(`1970-01-01T${retorno}:00`);
        const diffMillis = returnTime - exitTime;
        const diffHours = diffMillis / (1000 * 60 * 60);
        const newPermission = { id: `P${Date.now()}`, fecha: new Date().toLocaleDateString('es-AR'), horaSalida: salida, horaRetorno: retorno, horas: -diffHours };
        return { ...emp, horas: emp.horas - diffHours, permisos: [...emp.permisos, newPermission] };
      }
      return emp;
    }));
    alert('Permiso guardado correctamente.');
  };

  const permissionModalEmployee = useMemo(() => employees.find(e => e.id === permissionModalEmployeeId), [employees, permissionModalEmployeeId]);

  const renderContent = () => {
    switch (currentView.name) {
        case 'detail':
            const selectedEmployee = employees.find(e => e.id === currentView.id);
            return <EmployeeDetailView employee={selectedEmployee} onBack={() => setCurrentView({ name: 'table' })} onLicenseClick={setSelectedLicense} />;
        case 'messages':
            return <MessagesView employees={employees} archivedMessages={archivedMessages} onBack={() => setCurrentView({ name: 'table' })} onApplyLicense={handleApplyLicense} />;
        case 'table':
        default:
            return <EmployeeTableView employees={employees} onSelectEmployee={(id) => setCurrentView({ name: 'detail', id })} onShowMessages={() => setCurrentView({ name: 'messages' })} onOpenPermissionModal={setPermissionModalEmployeeId}/>;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="bg-white min-h-screen font-sans shadow-2xl">
        <main>
          {renderContent()}
          <PermissionModal employee={permissionModalEmployee} onClose={() => setPermissionModalEmployeeId(null)} onSave={handleApplyPermission} />
          <LicenseDetailModal license={selectedLicense} onClose={() => setSelectedLicense(null)} />
        </main>
      </div>
    </>
  );
}
