"use client"

import  { useState,  useRef } from 'react';
import {  User,  Clock, Calendar, CheckCircle, XCircle, Printer } from 'lucide-react';
import {InfoCard} from "@/app/util/UiRRHH"
import {  Employee, LicenseHistory} from '@/app/Interfas/Interfaces';

interface LicenseDetailModalProps {
  license: LicenseHistory | null;
  onClose: () => void;
}
export const ApplyLicenseModal = ({ message, onApply, onClose, employeeName }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4"><h3 className="text-xl font-bold text-gray-800">Confirmar Licencia</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
                <div className="space-y-4"><p><strong className="text-gray-600">Empleado:</strong> {employeeName}</p><p><strong className="text-gray-600">Mensaje:</strong> <span className="text-gray-700 italic">"{message.texto}"</span></p><div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p><strong className="text-blue-800">Días solicitados:</strong> {message.dias}</p><p><strong className="text-blue-800">Fechas:</strong> del {message.fechaInicio} al {message.fechaFin}</p></div></div>
                <div className="mt-6 flex justify-end space-x-3"><button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button><button onClick={() => onApply(message)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"><CheckCircle size={18} className="mr-2" />Aplicar Licencia</button></div>
            </div>
        </div>
    );
};

export const PermissionModal = ({ employee, onSave, onClose }) => {
    const [salida, setSalida] = useState('');
    const [retorno, setRetorno] = useState('');
    if (!employee) return null;
    const handleSubmit = (e) => { e.preventDefault(); if (salida && retorno && retorno > salida) { onSave(employee.id, { salida, retorno }); onClose(); } else { alert('La hora de retorno debe ser posterior a la hora de salida.'); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4"><h3 className="text-xl font-bold text-gray-800">Registrar Permiso de Salida</h3><button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
                <div className="space-y-4"><p><strong className="text-gray-600">Empleado:</strong> {employee.nombre} {employee.apellido}</p><div><label htmlFor="salida" className="block text-sm font-medium text-gray-700">Hora de Salida</label><input type="time" id="salida" value={salida} onChange={(e) => setSalida(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /></div><div><label htmlFor="retorno" className="block text-sm font-medium text-gray-700">Hora de Retorno</label><input type="time" id="retorno" value={retorno} onChange={(e) => setRetorno(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /></div></div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"><CheckCircle size={18} className="mr-2" />Guardar Permiso</button></div>
            </form>
        </div>
    );
};


export const LicenseDetailModal = ({ license, onClose }: LicenseDetailModalProps) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!license) return null;

  const handlePrint = () => {
    if (!printableRef.current) return;

    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // HTML completo para la ventana de impresión
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Licencia</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #333;
              padding: 40px;
              background: white;
            }
            
            .print-header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .print-subtitle {
              font-size: 14px;
              color: #6b7280;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .info-item {
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 15px;
              background: #f9fafb;
            }
            
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 5px;
            }
            
            .info-value {
              font-size: 16px;
              font-weight: 500;
              color: #111827;
            }
            
            .status-approved {
              color: #059669;
              background: #d1fae5;
              padding: 4px 12px;
              border-radius: 20px;
              display: inline-block;
            }
            
            .status-rejected {
              color: #dc2626;
              background: #fee2e2;
              padding: 4px 12px;
              border-radius: 20px;
              display: inline-block;
            }
            
            .status-pending {
              color: #d97706;
              background: #fef3c7;
              padding: 4px 12px;
              border-radius: 20px;
              display: inline-block;
            }
            
            .message-section {
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            
            .message-title {
              font-weight: 600;
              color: #374151;
              margin-bottom: 10px;
            }
            
            .message-content {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 15px;
              font-style: italic;
              color: #4b5563;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            
            @media print {
              body { padding: 20px; }
              .info-grid { break-inside: avoid; }
              .message-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">Comprobante de Licencia</h1>
            <p class="print-subtitle">Documento de respaldo oficial</p>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Tipo de Licencia</div>
              <div class="info-value">${license.type}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">
                <span class="status-${license.status === 'Aprobada' ? 'approved' : license.status === 'Rechazada' ? 'rejected' : 'pending'}">
                  ${license.status}
                </span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Fecha de Inicio</div>
              <div class="info-value">${license.startDate}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Fecha de Fin</div>
              <div class="info-value">${license.endDate}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Duración</div>
              <div class="info-value">${license.duration} días hábiles</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Fecha de Emisión</div>
              <div class="info-value">${new Date().toLocaleDateString('es-ES')}</div>
            </div>
          </div>
          
          ${license.originalMessage ? `
            <div class="message-section">
              <div class="message-title">Respaldo de Aprobación</div>
              <div class="message-content">
                ${license.originalMessage}
                ${license.startDate && license.endDate ? `<br><br><strong>Fechas solicitadas:</strong> ${license.startDate} al ${license.endDate}` : ''}
              </div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
            <p>Este documento es válido como comprobante oficial de licencia</p>
          </div>
        </body>
      </html>
    `;

    // Escribir el contenido en la nueva ventana
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Esperar a que se cargue y luego imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
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