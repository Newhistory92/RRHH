"use client";
import { Button } from '../Componentes/Buttom';
import { Card } from '../Componentes/Card';
import React, { useState, useEffect, useMemo } from 'react';
import { Send } from 'lucide-react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import {Employee,LicenseHistory, Saldo, Usuario,LicenseStatus,TiposLicencia } from "@/app/Interfas/Interfaces"

// ✅ Registrar idioma español solo en el cliente
if (typeof window !== 'undefined') {
  registerLocale('es', es);
}

export interface RequestFormProps {
  saldos:  Saldo[];
  supervisores: Usuario[];
  userData: Employee;
  onCancel: () => void;
  onSubmit: (data: LicenseHistory) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ 
  saldos, 
  supervisores, 
  userData, 
  onCancel, 
  onSubmit 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [fecha, setFecha] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [supervisorId, setSupervisorId] = useState('');
  const [error, setError] = useState('');

  // ✅ Inicializar días de forma segura
  const initializeDias = (): TiposLicencia => {
    if (!saldos || !Array.isArray(saldos)) return {};
    
    return saldos.reduce((acc, saldo) => {
      const year = Object.keys(saldo)[0]; // El primer key será el año
      return {
        ...acc,
        [year]: { 
          Licencias: 0, 
          Particulares: 0, 
          Articulos: 0, 
          Examen: 0 
        }
      };
    }, {});
  };

  const [solicitudDias, setSolicitudDias] = useState<TiposLicencia>(initializeDias);
  const [selectedType, setSelectedType] = useState<'Licencias' | 'Particulares' | 'Articulos' | 'Examen'>('Licencias');

  // ✅ Control de hidratación
  useEffect(() => {
    setIsClient(true);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-AR');
    setFecha(formattedDate);
  }, []);

  // ✅ Reinicializar días cuando cambien los saldos
  useEffect(() => {
    if (saldos && Array.isArray(saldos)) {
      setSolicitudDias(initializeDias());
    }
  }, [saldos]);

  const diasHabilesSeleccionados = useMemo(() => {
    if (!startDate || !endDate || !isClient) return 0;
    
    let count = 0;
    const d = new Date(startDate);
    const end = new Date(endDate);
    
    while (d <= end) {
      // Solo contar días hábiles (lunes a viernes)
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, isClient]);

  const totalDiasSolicitados = useMemo(() => {
    return Object.values(solicitudDias)
      .flatMap(yearData => Object.values(yearData))
      .reduce((total, dias) => total + dias, 0);
  }, [solicitudDias]);

  const mensaje = useMemo(() => {
    if (!isClient || diasHabilesSeleccionados <= 0 || totalDiasSolicitados !== diasHabilesSeleccionados || !supervisorId) {
      return '';
    }

    const supervisor = supervisores?.find(s => s.id === supervisorId);
    
    const tiposDetalle = Object.entries(solicitudDias)
      .map(([anio, tipos]) => {
        const detallesAnio = Object.entries(tipos)
          .filter(([, dias]) => dias > 0)
          .map(([tipo, dias]) => `- ${tipo} ${anio}: ${dias} día(s)`)
          .join('\n');
        return detallesAnio;
      })
      .filter(Boolean)
      .join('\n');

    if (!startDate || !endDate || !supervisor) return '';

    return `Estimado/a ${supervisor.name || ''},\n\nSolicito autorización para tomar licencia desde el ${startDate.toLocaleDateString('es-AR')} hasta el ${endDate.toLocaleDateString('es-AR')}, por un total de ${diasHabilesSeleccionados} días hábiles.\n\n${tiposDetalle}\n\nAtentamente,\n${userData?.name || userData?.name || ''}`;
  }, [diasHabilesSeleccionados, totalDiasSolicitados, supervisorId, startDate, endDate, solicitudDias, userData, supervisores, isClient]);

  const handleDiasChange = (anio: string, tipo: 'Licencias' | 'Particulares' | 'Articulos' | 'Examen', valor: string) => {
    const numValor = Number(valor);
    
    if (!saldos || !Array.isArray(saldos)) return;
    
    // Buscar el saldo correspondiente al año
    const saldoAnual = saldos.find(s => s[anio]);
    if (!saldoAnual || numValor < 0) return;

    const yearData = saldoAnual[anio];
    if (!yearData || !(tipo in yearData) || typeof yearData[tipo] !== 'number') return;
    
    if (numValor <= yearData[tipo]) {
      setSolicitudDias(prev => ({
        ...prev,
        [anio]: { 
          ...prev[anio], 
          [tipo]: numValor 
        }
      }));
    }
  };

  const handleSubmit = () => {
    if (!isClient) return;

    if (totalDiasSolicitados !== diasHabilesSeleccionados) {
      setError(`El total de días asignados (${totalDiasSolicitados}) no coincide con los días hábiles del calendario (${diasHabilesSeleccionados}).`);
      return;
    }
    
    if (!supervisorId) {
      setError('Debes seleccionar un supervisor.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Debes seleccionar las fechas de inicio y fin.');
      return;
    }

    onSubmit({
      id: `sol-${Date.now()}`,
      solicitanteNombre: userData?.name || userData?.name || '',
      type: selectedType, // El tipo principal de licencia seleccionado
      supervisorId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: diasHabilesSeleccionados,
      tiposLicencia: JSON.parse(JSON.stringify(solicitudDias)),
      originalMessage: mensaje,
      status: 'Pendiente' as LicenseStatus,
      createdAt: new Date().toISOString()
    });
  };

  // ✅ Render loading mientras se hidrata
  if (!isClient) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-64 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ✅ Validación de props
  if (!saldos || !Array.isArray(saldos) || saldos.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-600 font-semibold">No se pudieron cargar los datos de saldos de licencias.</p>
        </div>
      </Card>
    );
  }

  if (!supervisores || !Array.isArray(supervisores) || supervisores.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-600 font-semibold">No se pudieron cargar los datos de supervisores.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Crear Nueva Solicitud</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Selecciona el rango de fechas</h3>
            <ReactDatePicker
              selected={startDate}
              onChange={(dates) => {
                if (Array.isArray(dates)) {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              minDate={new Date()}
              filterDate={(date) => {
                const day = date.getDay();
                return day !== 0 && day !== 6; // Excluir fines de semana
              }}
              locale="es"
            />
            {diasHabilesSeleccionados > 0 && (
              <p className="mt-2 text-center font-semibold text-blue-600">
                Días hábiles seleccionados: {diasHabilesSeleccionados}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">2. Selecciona el tipo principal y asigna días</h3>
            
            {/* Selector de tipo principal */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo principal de licencia:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                className="w-full p-2 border rounded-lg bg-white mb-4"
              >
                <option value="Licencias">Licencias</option>
                <option value="Particulares">Particulares</option>
                <option value="Articulos">Artículos</option>
                <option value="Examen">Examen</option>
              </select>
            </div>

            <div className="space-y-4">
              {saldos.map((saldo, index) => {
                const year = Object.keys(saldo)[0];
                const yearData = saldo[year];
                
                if (!yearData) return null;
                
                return (
                  <details key={year || index} open>
                    <summary className="font-semibold cursor-pointer">Año {year}</summary>
                    <div className="pl-4 pt-2 space-y-4">
                      {Object.entries(yearData)
                        .map(([tipo, total]) => {
                          if (typeof total !== 'number') return null;
                          
                          const consumidos = solicitudDias[year]?.[tipo as keyof typeof yearData] ?? 0;
                          const porcentaje = total > 0 ? (consumidos / total) * 100 : 0;
                          
                          return (
                            <div key={tipo}>
                              <div className="flex justify-between items-center mb-1">
                                <label htmlFor={`${tipo}-${year}`} className="font-semibold">
                                  {tipo}
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    id={`${tipo}-${year}`}
                                    value={consumidos}
                                    onChange={(e) => handleDiasChange(
                                      year, 
                                      tipo as 'Licencias' | 'Particulares' | 'Articulos' | 'Examen', 
                                      e.target.value
                                    )}
                                    className="w-16 p-1 border rounded text-center"
                                    min="0"
                                    max={total}
                                  />
                                  <span className="text-sm text-gray-600 font-medium w-12 text-right">
                                    {consumidos}/{total}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </details>
                );
              })}
            </div>
            <p className="mt-2 text-center font-semibold text-blue-600">
              Total de días asignados: {totalDiasSolicitados}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">3. Selecciona tu supervisor</h3>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="" disabled>-- Elige un supervisor --</option>
              {supervisores.map(sup => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">4. Mensaje para tu supervisor</h3>
            <textarea
              rows={15}
              className="w-full p-2 border rounded-lg bg-gray-50 font-mono text-sm"
              value={mensaje}
              readOnly
              placeholder="Completa los pasos anteriores..."
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 font-bold text-center mt-6">{error}</p>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <Button onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!mensaje}>
          <Send size={18} /> Enviar Solicitud
        </Button>
      </div>
    </Card>
  );
};

export default RequestForm;