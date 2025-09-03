"use client";

import { useMemo, useState } from "react";
import { EmployeeDetailView } from "@/app/Componentes/TablaOperador/Perfildetail";
import { EMPLOYEES_DATA } from "@/app/api/prueba2";
import { MessagesView } from "@/app/Componentes/TablaOperador/MensajeDetail";
import { EmployeeTableView } from "@/app/Componentes/TablaOperador/Table";
import {
  LicenseDetailModal,
  PermissionModal,
} from "@/app/Componentes/ModalRRHH/LicenseModal";
import {
  Employee,
  EmployeeStatus,
  LicenseHistory,
  Message,
  Permit,
} from "@/app/Interfas/Interfaces";

export interface ArchivedMessage extends Message {
  employeeId: number;
  processedDate: string;
  employeeName: string;
}
export interface ViewState {
  name: "table" | "detail" | "messages";
  id?: number;
}
export default function RecursosHumanosPage() {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES_DATA);
  const [archivedMessages, setArchivedMessages] = useState<ArchivedMessage[]>(
    []
  );
  const [currentView, setCurrentView] = useState<ViewState>({ name: "table" });
  const [permissionModalEmployeeId, setPermissionModalEmployeeId] = useState<
    number | null
  >(null);
  const [selectedLicense, setSelectedLicense] = useState<LicenseHistory | null>(
    null
  );

  const handleApplyLicense = (employeeId: number, message: Message) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newLicense = {
            id: `L${Date.now()}`,
            tipo: "Vacaciones",
            inicio: message.startDate,
            fin: message.endDate,
            estado: "Aprobada",
            duracion: message.days,
            mensajeOriginal: message.text,
            diasSolicitados: message.days,
            fechasSolicitadas: `del ${message.startDate} al ${message.endDate}`,
          };
          return {
            ...emp,
            status: "De licencia" as EmployeeStatus,
            licencias: [...emp.licenses.history, newLicense],
            mensajes: emp.messages.filter((m) => m.id !== message.id),
          };
        }
        return emp;
      })
    );
    setArchivedMessages((prev: ArchivedMessage[]) => [
      ...prev,
      {
        ...message,
        employeeId,
        processedDate: new Date().toLocaleDateString("es-AR"),
        employeeName: employees.find(e => e.id === employeeId)?.name || "",
      },
    ]);
    alert("Licencia aplicada correctamente.");
  };

  const handleApplyPermission = (
    employeeId: number,
    { departureTime: salida, returnTime: retorno }: Permit
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const exitTime = new Date(`1970-01-01T${salida}:00`);
          const returnTime = new Date(`1970-01-01T${retorno}:00`);
          const diffMillis = returnTime.getTime() - exitTime.getTime();
          const diffHours = diffMillis / (1000 * 60 * 60);
          const newPermission = {
            id: `P${Date.now()}`,
            fecha: new Date().toLocaleDateString("es-AR"),
            horaSalida: salida,
            horaRetorno: retorno,
            horas: -diffHours,
          };
          return {
            ...emp,
            horas: emp.hours - diffHours,
            permisos: [...emp.permits, newPermission],
          };
        }
        return emp;
      })
    );
    alert("Permiso guardado correctamente.");
  };

  const permissionModalEmployee = useMemo(() => 
    employees.find(e => e.id === permissionModalEmployeeId) || null, 
    [employees, permissionModalEmployeeId]
  );

  const renderContent = () => {
    switch (currentView.name) {
      case "detail":
        const selectedEmployee = employees.find((e) => e.id === currentView.id);
        return (
          <EmployeeDetailView
            employee={selectedEmployee}
            onBack={() => setCurrentView({ name: "table" })}
            onLicenseClick={setSelectedLicense}
          />
        );
      case "messages":
        return (
          <MessagesView
            employees={employees}
            archivedMessages={archivedMessages}
            onBack={() => setCurrentView({ name: "table" })}
            onApplyLicense={handleApplyLicense}
          />
        );
      case "table":
      default:
        return (
          <EmployeeTableView
            employees={employees}
            onSelectEmployee={(id: number) =>
              setCurrentView({ name: "detail", id })
            }
            onShowMessages={() => setCurrentView({ name: "messages" })}
            onOpenPermissionModal={setPermissionModalEmployeeId}
          />
        );
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
          <PermissionModal
            employee={permissionModalEmployee}
            onClose={() => setPermissionModalEmployeeId(null)}
            onSave={handleApplyPermission}
          />
          <LicenseDetailModal
            license={selectedLicense}
            onClose={() => setSelectedLicense(null)}
          />
        </main>
      </div>
    </>
  );
}
