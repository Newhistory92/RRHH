"use client"
import { ArrowLeft } from "lucide-react";
import {ProfileTab,LicenseHistoryTab,PermissionHistoryTab} from "./DetailTables"
import {StatusBadge} from "@/app/util/UiRRHH"
import { useState } from "react";
import {  Employee, LicenseHistory} from '@/app/Interfas/Interfaces';
import { Avatar } from 'primereact/avatar';

export interface EmployeeDetailViewProps {
  employee: Employee | null | undefined;
  onBack: () => void;
 onLicenseClick: (license: LicenseHistory | null) => void;
}
export const EmployeeDetailView = ({
  employee,
  onBack,
  onLicenseClick,
}: EmployeeDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("perfil");


  if (!employee) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-muted text-foreground rounded hover:bg-border"
        >
          ← Volver
        </button>
        <div className="text-center text-muted-foreground">
          No se encontró información del empleado
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 no-print"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver a la lista
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-card rounded-lg shadow-sm">
      <Avatar image={employee.photo} size="xlarge" shape="circle" />
        <div>
          <p className="font-heading text-foreground text-2xl"> {employee.name}</p>
          <p className="text-muted-foreground text-lg"> DNI: {employee.dni}</p>
          <div className="mt-2">
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>
      <div className="border-b border-border no-print">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`${
              activeTab === "perfil"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("licencias")}
            className={`${
              activeTab === "licencias"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Licencias
          </button>
          <button
            onClick={() => setActiveTab("permisos")}
            className={`${
              activeTab === "permisos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Permisos
          </button>
        </nav>
      </div>
      <div className="no-print">
        {activeTab === "perfil" && <ProfileTab employee={employee} />}
        {activeTab === "licencias" && (
          <LicenseHistoryTab
            licenses={employee.licenses}
            employee={employee}
            onRowClick={onLicenseClick}
          />
        )}
        {activeTab === "permisos" && (
          <PermissionHistoryTab permisos={employee.permisos} />
        )}
      </div>
    </div>
  );
};