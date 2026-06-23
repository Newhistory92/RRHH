"use client"
import { Archive, ArrowLeft, Bell, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import {ApplyLicenseModal} from "@/app/Componentes/ModalRRHH/LicenseModal"
import {Employee, ProcessedMessage} from '@/app/Interfas/Interfaces';

interface MessagesViewProps {
  employees: Employee[];
  archivedMessages: ProcessedMessage[]; // o Message[] si no necesitas la info del empleado
  onBack: () => void;
  onApplyLicense: (employeeId: number, message: ProcessedMessage) => void;
}
export const MessagesView = ({
  employees,
  archivedMessages,
  onBack,
  onApplyLicense,
}: MessagesViewProps) => {
  const [selectedMessageData, setSelectedMessageData] = useState<ProcessedMessage | null>(null);
  const [activeTab, setActiveTab] = useState<"pendientes" | "historial">("pendientes");

const pendingMessages: ProcessedMessage[] = employees.flatMap((employees: Employee) =>
  employees.messages.map((messages) => ({
    ...messages,
    employeeId: employees.id,
    employeeName: `${employees.name}`,
  }))
);

  const handleApplyAndClose = (messages: ProcessedMessage) => {
    onApplyLicense(messages.employeeId, messages);
    setSelectedMessageData(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver
      </button>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="font-heading text-2xl font-bold leading-6 text-foreground">
            Mensajes y Solicitudes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona las solicitudes de licencia pendientes y consulta el
            historial.
          </p>
        </div>
      </div>

      <div className="border-b border-border mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`${
              activeTab === "pendientes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Pendientes <Mail size={16} className="ml-2" />{" "}
            {pendingMessages.length > 0 && (
              <span className="ml-2 bg-error text-error-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`${
              activeTab === "historial"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Historial <Archive size={16} className="ml-2" />
          </button>
        </nav>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        {activeTab === "pendientes" &&
          (pendingMessages.length > 0 ? (
            pendingMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                onClick={() => setSelectedMessageData(msg)}
                className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">{msg.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hacer clic para ver detalles y aplicar.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Bell size={48} className="mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">No hay mensajes pendientes.</p>
            </div>
          ))}
        {activeTab === "historial" &&
          (archivedMessages.length > 0 ? (
            archivedMessages.map((msg) => (
              <div
                key={`${msg.employeeId}-${msg.id}`}
                className="p-4 border border-border rounded-lg bg-muted flex items-start space-x-4"
              >
                <div className="flex-shrink-0 pt-1">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {msg.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{msg.text}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Procesado el: {msg.date}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Archive size={48} className="mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">
                El historial de mensajes está vacío.
              </p>
            </div>
          ))}
      </div>
      <ApplyLicenseModal
        message={selectedMessageData}
        onClose={() => setSelectedMessageData(null)}
        onApply={handleApplyAndClose}
        employeeName={selectedMessageData?.employeeName || ""}
      />
    </div>
  );
};