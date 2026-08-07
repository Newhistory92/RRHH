"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { EmployeeDetailView } from "@/app/Componentes/TablaOperador/Perfildetail";
import { MessagesView } from "@/app/Componentes/TablaOperador/MensajeDetail";
import { EmployeeTableView } from "@/app/Componentes/TablaOperador/Table";
import JubiladosTable from "@/app/Componentes/TablaOperador/JubiladosTable";
import {LicenseDetailModal,PermissionModal} from "@/app/Componentes/ModalRRHH/LicenseModal";
import {
  Employee,
  EmployeeStatus,
  LicenseHistory,
  Message,
} from "@/app/Interfas/Interfaces";

export interface ArchivedMessage extends Message {
  employeeId: number;
  processedDate: string;
  employeeName: string;
}
export interface ViewState {
  name: "table" | "detail" | "messages" | "jubilados";
  id?: number;
}
export default function RecursosHumanosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [archivedMessages, setArchivedMessages] = useState<ArchivedMessage[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>({ name: "table" });
  const [permissionModalEmployeeId, setPermissionModalEmployeeId] = useState<number | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<LicenseHistory | null>(null);
  const toast = useRef<Toast>(null);

useEffect(() => {
  fetchEmployeeData().finally(() => setIsLoading(false));
}, []);


  // ── Función reutilizable para cargar datos de RRHH ──
  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/rrhh/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error('Error al obtener datos del empleado:', response.statusText);
        setEmployees([]);
        return;
      }
      const data = await response.json();
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    } catch (error) {
      console.error('Error en la petición:', error);
      setEmployees([]);
    }
  };

  const handleApplyLicense = async (employeeId: number, message: Message) => {
    console.log("Payload enviado a /licenses/aplicar:", { employeeId, message });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/licenses/aplicar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          messageId: message.id,
          type: "Vacaciones",
          startDate: message.startDate,
          endDate: message.endDate,
          days: message.days,
          observacion: message.text
        })
      });

      const result = await response.json();
      console.log("Response from Server:", result);

      if (!response.ok) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: `Error al aplicar licencia: ${result.detail || 'Error desconocido'}`, life: 5000 });
        return;
      }

      // Archivar el mensaje en el historial local
      setArchivedMessages((prev: ArchivedMessage[]) => [
        ...prev,
        {
          ...message,
          employeeId,
          processedDate: new Date().toLocaleDateString("es-AR"),
          employeeName: employees.find(e => e.id === employeeId)?.name || "",
        },
      ]);

      // Re-fetchear datos reales del servidor para sincronizar la UI
      await fetchEmployeeData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Licencia aplicada correctamente.', life: 4000 });
    } catch (error) {
      console.error("Error al aplicar licencia:", error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error de red al aplicar la licencia.', life: 5000 });
    }
  };


const permissionModalEmployee = useMemo(() => employees.find((e) => e.id === permissionModalEmployeeId) || null,
  [employees, permissionModalEmployeeId]
);

   if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView.name) {
      case "detail":
        const selectedEmployee = employees.find((e) => e.id === currentView.id);
        return (
          <EmployeeDetailView
            employee={selectedEmployee}
            onBack={() => setCurrentView({ name: "table" })}
            onLicenseClick={setSelectedLicense}
            onSave={fetchEmployeeData}
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
      case "jubilados":
        return (
          <JubiladosTable onVolver={() => setCurrentView({ name: "table" })} />
        );
      case "table":
      default:
        return (
          <>
            <div className="flex justify-end mb-4 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
              <button
                onClick={() => setCurrentView({ name: "jubilados" })}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm hover:opacity-90"
              >
                Ver jubilados
              </button>
            </div>
            <EmployeeTableView
              employees={employees}
              onSelectEmployee={(id: number) =>
                setCurrentView({ name: "detail", id })
              }
              onShowMessages={() => setCurrentView({ name: "messages" })}
              onOpenPermissionModal={setPermissionModalEmployeeId}
            />
          </>
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
      <Toast ref={toast} />
      <div className="font-sans">
        <main>
          {renderContent()}
          <PermissionModal
            employee={permissionModalEmployee}
            onClose={() => setPermissionModalEmployeeId(null)}
            onSuccess={fetchEmployeeData}
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
