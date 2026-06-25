"use client"

import { useState, useRef } from 'react';
import { User, Clock, Calendar, CheckCircle, XCircle, Printer } from 'lucide-react';
import { Employee, LicenseHistory, ProcessedMessage } from '@/app/Interfas/Interfaces';
import { printLicense } from './LicensePrintTemplate';
import { Toast } from 'primereact/toast';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { timeStringToDecimal } from '@/app/Componentes/TablaOperador/employeeApi';
import { apiClient } from "@/app/util/apiClient";
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
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Confirmar Licencia
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            <strong className="text-muted-foreground">Empleado:</strong> {employeeName}
          </p>
          <p>
            <strong className="text-muted-foreground">Mensaje:</strong>{" "}
            <span className="text-foreground italic">{message.text}</span>
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p>
              <strong className="text-primary">Días solicitados:</strong>{" "}
              {message.days}
            </p>
            <p>
              <strong className="text-primary">Fechas:</strong> del{" "}
              {message.startDate} al {message.endDate}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onApply(message)}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Aplicar Licencia
          </button>
        </div>
      </div>
    </div>
  );
};


export const PermissionModal = ({ employee, onClose }: PermissionModalProps) => {
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
      await apiClient.post(`/rrhh/employee/${employee.id}/permission`, data);

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
          className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
            <h3 className="font-heading text-xl font-bold text-foreground">
              Registrar Permiso de Salida
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="bg-primary/10 p-3 rounded-md border border-primary/20">
              <strong className="text-foreground">Empleado/a:</strong>{" "}
              <span className="text-foreground">{employee.name}</span>
            </p>

            <div>
              <label
                htmlFor="salida"
                className="block text-sm font-medium text-foreground mb-2"
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
                className="block text-sm font-medium text-foreground mb-2"
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
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              severity="secondary" text raised
            ></Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              text raised
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div ref={printableRef}>
          <div className="flex justify-between items-start border-b border-border pb-3 mb-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Detalle de Licencia Aprobada
              </h3>
              <p className="text-sm text-muted-foreground">Comprobante de respaldo</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <User size={16} className="text-primary mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Tipo de Licencia</span>
                </div>
                <p className="text-foreground font-semibold">{license.type}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <CheckCircle size={16} className="text-success mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Estado</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${license.status === "Aprobada"
                    ? "bg-success-soft text-success-soft-foreground"
                    : license.status === "Rechazada"
                      ? "bg-error-soft text-error-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  {license.status}
                </span>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-warm-contrast mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Período</span>
                </div>
                <p className="text-foreground font-semibold">{license.startDate} al {license.endDate}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="text-accent mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Duración</span>
                </div>
                <p className="text-foreground font-semibold">{license.duration} días hábiles</p>
              </div>
            </div>

            {license.mensajeOriginal && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Respaldo de Aprobación
                </h4>
                <div className="bg-card p-3 rounded border border-border">
                  <p className="text-sm text-foreground italic">{license.originalMessage}</p>
                  {license.startDate && license.endDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Fechas solicitadas:</strong> {license.startDate} al {license.endDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-success text-success-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center"
          >
            <Printer size={18} className="mr-2" />
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};