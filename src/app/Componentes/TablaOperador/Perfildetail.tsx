"use client"
import { ArrowLeft } from "lucide-react";
import {ProfileTab,LicenseHistoryTab,PermissionHistoryTab} from "./DetailTables"
import {StatusBadge} from "@/app/util/UiRRHH"
import { useState } from "react";
import {  Employee, LicenseHistory, Licenses} from '@/app/Interfas/Interfaces';
import Image from "next/image";

export interface EmployeeDetailViewProps {
  employee: Employee | null | undefined;
  onBack: () => void;
 onLicenseClick: (license: LicenseHistory | Licenses | null) => void;
}
export const EmployeeDetailView = ({
  employee,
  onBack,
  onLicenseClick,
}: EmployeeDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("perfil");
  const [imageError, setImageError] = useState(false);

  if (!employee) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver
        </button>
        <div className="text-center text-gray-500">
          No se encontró información del empleado
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    console.log('Error loading image:', employee.photo);
    setImageError(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 no-print"
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver a la lista
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 p-6 bg-white rounded-lg shadow-md">
       {!imageError && employee.photo ? (
          <Image
            src={employee.photo}
            alt={`Foto de ${employee.name}`}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            onError={handleImageError}
            priority
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-gray-600 font-semibold text-lg">
              {employee.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div>
          <p className="text-gray-500 text-lg"> DNI: {employee.dni}</p>
          <div className="mt-2">
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200 no-print">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`${
              activeTab === "perfil"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("licencias")}
            className={`${
              activeTab === "licencias"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historial de Licencias
          </button>
          <button
            onClick={() => setActiveTab("permisos")}
            className={`${
              activeTab === "permisos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
            onRowClick={onLicenseClick}
          />
        )}
        {activeTab === "permisos" && (
          <PermissionHistoryTab permisos={employee.permits} />
        )}
      </div>
    </div>
  );
};