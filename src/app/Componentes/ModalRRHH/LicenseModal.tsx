"use client"

import  { useState,  useRef } from 'react';
import {  User,  Clock, Calendar, CheckCircle, XCircle, Printer } from 'lucide-react';
import {  Employee, LicenseHistory, ProcessedMessage} from '@/app/Interfas/Interfaces';
import { printLicense } from './LicensePrintTemplate';
import { Toast } from 'primereact/toast';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { timeStringToDecimal } from '@/app/Componentes/TablaOperador/employeeApi';
interface LicenseDetailModalProps {
  license: LicenseHistory | null;
  onClose: () => void;
}
interface PermissionModalProps {
  employee: Employee | null;  // Corregido: era 'license' ahora es 'employee'
  onClose: () => void;
}


interface ApplyLicenseModalProps {
  message: ProcessedMessage | null; // Cambiar a ProcessedMessage
  onApply: (message: ProcessedMessage) => void; // Cambiar a ProcessedMessage
  onClose: () => void;
  employeeName: string;
}
export const ApplyLicenseModal = ({
  message,
  onApply,
  onClose,
  employeeName,
}: ApplyLicenseModalProps) => {

  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Confirmar Licencia
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            <strong className="text-gray-600">Empleado:</strong> {employeeName}
          </p>
          <p>
            <strong className="text-gray-600">Mensaje:</strong>{" "}
            <span className="text-gray-700 italic">{message.text}</span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p>
              <strong className="text-blue-800">Días solicitados:</strong>{" "}
              {message.days}
            </p>
            <p>
              <strong className="text-blue-800">Fechas:</strong> del{" "}
              {message.startDate} al {message.endDate}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onApply(message)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Aplicar Licencia
          </button>
        </div>
      </div>
    </div>
  );
};


export const PermissionModal = ({ employee,onClose }: PermissionModalProps) => {
  const [salida, setSalida] = useState<string>("");
  const [retorno, setRetorno] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!salida || !retorno) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Por favor, complete ambas horas.',
        life: 3000
      });
      return;
    }

    // Validación de horarios
    if (retorno <= salida) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Horario inválido',
        detail: 'La hora de retorno debe ser posterior a la hora de salida.',
        life: 3000
      });
      return;
    }

    const data = {
      exitTime: timeStringToDecimal(salida),
      returnTime: timeStringToDecimal(retorno),
    };

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/rrhh/employee/${employee.id}/permission`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error al guardar el permiso: ${response.status}`
        );
      }

      await response.json()
      
      toast.current?.show({
        severity: 'success',
        summary: 'Permiso registrado',
        detail: 'El permiso de salida se ha guardado correctamente.',
        life: 3000
      });

      // Esperar un momento para que se vea el toast antes de cerrar
      setTimeout(() => {
        onClose(); // Cierra el modal
      }, 1000);

    } catch (error) {
      console.error('Error al guardar el permiso:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error 
          ? error.message 
          : 'No se pudo guardar el permiso. Por favor, inténtelo de nuevo.',
        life: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Registrar Permiso de Salida
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
              disabled={isLoading}
            >
              <XCircle size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <strong className="text-gray-700">Empleado/a:</strong>{" "}
              <span className="text-gray-900">{employee.name}</span>
            </p>
            
            <div>
              <label
                htmlFor="salida"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hora de Salida
              </label>
              <InputMask
                id="salida"
                value={salida}
                onChange={(e) => setSalida(e.value || '')}
                mask="99:99"
              
                required
                className="w-full text-lg p-3"
                style={{ fontSize: '1.125rem' }}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label
                htmlFor="retorno"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hora de Retorno
              </label>
              <InputMask
                id="retorno"
                value={retorno}
                onChange={(e) => setRetorno(e.value || '')}
                mask="99:99"
               
                required
                className="w-full text-lg p-3"
                style={{ fontSize: '1.125rem' }}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              label='Cancelar'
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
             severity="secondary" text raised 
            ></Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
               text raised
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Guardar Permiso
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export const LicenseDetailModal = ({ license, onClose }: LicenseDetailModalProps) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!license) return null;

  const handlePrint = () => {
    printLicense(license);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div ref={printableRef}>
          <div className="flex justify-between items-start border-b pb-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Detalle de Licencia Aprobada
              </h3>
              <p className="text-sm text-gray-500">Comprobante de respaldo</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <User size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Tipo de Licencia</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.type}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Estado</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  license.status === "Aprobada"
                    ? "bg-green-100 text-green-800"
                    : license.status === "Rechazada"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {license.status}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Período</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.startDate} al {license.endDate}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Duración</span>
                </div>
                <p className="text-gray-900 font-semibold">{license.duration} días hábiles</p>
              </div>
            </div>

            {license.originalMessage && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Respaldo de Aprobación
                </h4>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-sm text-gray-700 italic">{license.originalMessage}</p>
                  {license.startDate && license.endDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Fechas solicitadas:</strong> {license.startDate} al {license.endDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};