"use client";
import { Button } from 'primereact/button';
import { Card } from 'primereact/card'; 
import React, { useState, useEffect, useMemo } from 'react';
import { Send } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import {Employee,LicenseHistory, Saldo, Usuario,LicenseStatus,TiposLicencia } from "@/app/Interfas/Interfaces"
import Calendario from './Calendario';

export interface RequestFormProps {
  saldos:  Saldo;
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
  
  // Estados principales para fechas (conectados al calendario)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [diasHabilesSeleccionados, setDiasHabilesSeleccionados] = useState<number>(0);
  
  const [supervisorId, setSupervisorId] = useState('');
  const [error, setError] = useState('');
  
  // ✅ Inicializar días de forma segura con la nueva estructura
  const initializeDias = (): TiposLicencia => {
    const result: TiposLicencia = {};
    if (saldos && typeof saldos === 'object') {
      for (const anio in saldos) {
        if (anio !== 'anio') { // Excluir la propiedad 'anio'
          result[anio] = { Licencias: 0, Particulares: 0, Articulos: 0, Examen: 0 };
        }
      }
    }
    return result;
  };

  const [solicitudDias, setSolicitudDias] = useState<TiposLicencia>(initializeDias);
  const [selectedType, setSelectedType] = useState<'Licencias' | 'Particulares' | 'Articulos' | 'Examen'>('Licencias');

  // 🔥 Handler actualizado para recibir las fechas del calendario personalizado
  const handleDateChange = (newStartDate: Date | null, newEndDate: Date | null) => {
    console.log('📅 Fechas recibidas del calendario:', newStartDate, newEndDate);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // 🔥 NUEVO: Calcular días hábiles cuando tenemos ambas fechas
    if (newStartDate && newEndDate) {
      // Aquí podríamos calcular los días hábiles si fuera necesario
      // pero el componente Calendario ya lo hace y lo muestra
      const timeDiff = newEndDate.getTime() - newStartDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      // Estimación básica de días hábiles (el calendario ya hace el cálculo preciso)
      let businessDays = 0;
      const currentDate = new Date(newStartDate.getTime());
      while (currentDate <= newEndDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No sábado ni domingo
          businessDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setDiasHabilesSeleccionados(businessDays);
    } else {
      setDiasHabilesSeleccionados(0);
    }
    
    // Limpiar error si había uno
    if (error) {
      setError('');
    }
  };

  // ✅ Control de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Reinicializar días cuando cambien los saldos
  useEffect(() => {
    if (saldos && typeof saldos === 'object') {
      setSolicitudDias(initializeDias());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saldos]);

  const totalDiasSolicitados = useMemo(() => {
    return Object.values(solicitudDias)
      .flatMap(yearData => Object.values(yearData))
      .reduce((total, dias) => total + dias, 0);
  }, [solicitudDias]);

  const mensaje = useMemo(() => {
    if (!isClient || !startDate || !endDate || !supervisorId || totalDiasSolicitados <= 0) {
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

    if (!supervisor) return '';

    return `Estimado/a ${supervisor.name || ''},\n\nQuien suscribe ${userData.name}, DNI: ${userData.dni}, que se desempeña en el departamento/oficina ${userData.department || userData.office}, solicito autorización para tomar licencia desde el ${startDate.toLocaleDateString('es-AR')} hasta el ${endDate.toLocaleDateString('es-AR')}, por un total de ${totalDiasSolicitados} días hábiles.\n\n${tiposDetalle}\n\nAtentamente,\n${userData?.name || ''}`;
  }, [totalDiasSolicitados, supervisorId, startDate, endDate, solicitudDias, userData, supervisores, isClient]);

  const handleDiasChange = (anio: string, tipo: 'Licencias' | 'Particulares' | 'Articulos' | 'Examen', valor: string) => {
    const numValor = Number(valor);
    
    if (!saldos || typeof saldos !== 'object') return;
    
    // ✅ Acceder directamente al año en el objeto saldos
    const yearData = saldos[anio];
    if (!yearData || numValor < 0) return;

    if (typeof yearData === 'object' && tipo in yearData && typeof yearData[tipo] === 'number') {
      if (numValor <= yearData[tipo]) {
        setSolicitudDias(prev => ({
          ...prev,
          [anio]: { 
            ...prev[anio], 
            [tipo]: numValor 
          }
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!isClient) return;

    // 🔥 Validaciones actualizadas
    if (!startDate || !endDate) {
      setError('Debes seleccionar las fechas de inicio y fin.');
      return;
    }

    if (!supervisorId) {
      setError('Debes seleccionar un supervisor.');
      return;
    }

    if (totalDiasSolicitados <= 0) {
      setError('Debes asignar al menos un día de licencia.');
      return;
    }

    // 🔥 Validación: total de días debe coincidir con días hábiles
    if (totalDiasSolicitados !== diasHabilesSeleccionados) {
      setError(`El total de días asignados (${totalDiasSolicitados}) no coincide con los días hábiles del calendario (${diasHabilesSeleccionados}).`);
      return;
    }

    onSubmit({
      id: `sol-${Date.now()}`,
      solicitanteNombre: userData?.name || '',
      type: selectedType,
      supervisorId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: totalDiasSolicitados,
      tiposLicencia: JSON.parse(JSON.stringify(solicitudDias)),
      originalMessage: mensaje,
      status: 'Pendiente' as LicenseStatus,
      createdAt: new Date().getTime()
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
              <div className="h-264 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ✅ Validación de props actualizada
   if (!saldos || typeof saldos !== 'object' || Object.keys(saldos).length === 0) {
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
    <Card title="Crear Nueva Solicitud">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Selecciona el rango de fechas</h3>
            <Calendario onDateChange={handleDateChange} />
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
              {/* ✅ Mostrar solo el tipo seleccionado, limitado a 3 años */}
              {Object.entries(saldos)
                .filter(([anio, yearData]) => 
                  anio !== 'anio' && 
                  typeof yearData === 'object' && 
                  yearData !== null &&
                  selectedType in yearData &&
                  typeof yearData[selectedType] === 'number' &&
                  (yearData[selectedType] as number) > 0
                )
                .slice(0, 3) // Limitar a 3 años
                .map(([anio, yearData]) => {
                  if (typeof yearData !== 'object' || yearData === null || !(selectedType in yearData)) {
                    return null;
                  }
                  const total = yearData[selectedType] as number;
                  const consumidos = solicitudDias[anio]?.[selectedType] ?? 0;
                  const porcentaje = total > 0 ? (consumidos / total) * 100 : 0;

                  return (
                    <div key={anio} className="border rounded-lg p-4 bg-white">
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                        Año {anio} - {selectedType}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor={`${selectedType}-${anio}`} className="font-medium text-gray-700">
                            Días a solicitar:
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              id={`${selectedType}-${anio}`}
                              value={consumidos}
                              onChange={(e) => handleDiasChange(
                                anio,
                                selectedType,
                                e.target.value
                              )}
                              className={`w-20 p-2 border rounded text-center font-medium ${
                                totalDiasSolicitados >= diasHabilesSeleccionados && diasHabilesSeleccionados > 0
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                  : 'bg-white'
                              }`}
                              min="0"
                              max={Math.min(total, diasHabilesSeleccionados - (totalDiasSolicitados - consumidos))}
                              disabled={totalDiasSolicitados >= diasHabilesSeleccionados && diasHabilesSeleccionados > 0 && consumidos === 0}
                            />
                            <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-right">
                              {consumidos}/{total}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                            style={{ width: `${porcentaje}%` }}
                          >
                            {porcentaje > 20 && (
                              <span className="text-xs text-white font-medium">
                                {Math.round(porcentaje)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Disponible: {total - consumidos} días
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              
              {/* Mensaje si no hay días disponibles del tipo seleccionado */}
              {Object.entries(saldos)
                .filter(([anio, yearData]) => 
                  anio !== 'anio' && 
                  typeof yearData === 'object' && 
                  yearData !== null &&
                  selectedType in yearData &&
                  typeof yearData[selectedType] === 'number' &&
                  (yearData[selectedType] as number) > 0
                ).length === 0 && (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="font-medium">No tienes días disponibles de tipo &quot;{selectedType}&quot;</p>
                  <p className="text-sm">Selecciona otro tipo de licencia</p>
                </div>
              )}
            </div>
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
        <Button onClick={handleSubmit} disabled={!mensaje || totalDiasSolicitados !== diasHabilesSeleccionados}>
          <Send size={18} /> Enviar Solicitud
        </Button>
      </div>
    </Card>
  );
};

export default RequestForm;