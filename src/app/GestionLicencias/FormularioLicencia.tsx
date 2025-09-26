"use client";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card'; 
import { ProgressBar } from 'primereact/progressbar';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState, useEffect, useMemo } from 'react';
import { Send,ArrowLeft} from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import {Employee,LicenseHistory, Saldo, Usuario,LicenseStatus,TiposLicencia } from "@/app/Interfas/Interfaces"
import DateRangePicker from './Calendario';

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
  // const [selectedType, setSelectedType] = useState<'Licencias' | 'Particulares' | 'Articulos' | 'Examen'>('Licencias');
const [selectedType, setSelectedType] = useState<{ name: string } | null>(null);
  // 🔥 Handler actualizado para recibir las fechas del calendario personalizado
  const handleDateChange = (newStartDate: Date | null, newEndDate: Date | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    if (newStartDate && newEndDate) {
      // Estimación básica de días hábiles
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
      type: selectedType?.name ?? '',
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



  const tiposLicencia = [
        { name: 'Articulos'  },
        { name: 'Licencias' },
        { name: 'Parte Medico' },
        { name: 'Profilactica' },
        { name: 'Particulares' },
        { name: 'Matrimonio' },
        { name: 'Examen' },
        { name: 'Matrimonio Hijo' },
        { name: 'Paternidad' },
        { name: 'Paternidad Especial' },
        { name: 'Maternidad' },
        { name: 'Fallecimiento' },
        { name: 'Enfermedad' },
        { name: 'Guarda Tenencia' },
       
    ];
    const typeKey = selectedType?.name;

   return (
    <Card title="Crear Nueva Solicitud">
      {/* Botón de volver */}
      <div className="mb-4">
        <Button 
          onClick={onCancel} 
          link
          className="flex items-center gap-2 px-3 py-2"
          label=""
        >
          <ArrowLeft size={18} />
          Volver al menú
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="w-full gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Selecciona el rango de fechas</h3>
            <DateRangePicker onDateChange={handleDateChange} />
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">2. Selecciona el tipo principal y asigna días</h3>
            
            {/* Selector de tipo principal */}
            <div className="mb-4">
                <Dropdown value={selectedType} onChange={(e) => setSelectedType(e.target.value as typeof selectedType)} 
                options={tiposLicencia} 
                optionLabel="name" 
                showClear placeholder="Tipos de Licencias" className="w-full md:w-14rem" />
            </div>

            <div className="space-y-4">
              {/* ✅ Mostrar solo el tipo seleccionado, limitado a 3 años */}
              
             {typeKey &&
  Object.entries(saldos)
    .filter(([anio, yearData]) =>
      anio !== 'anio' &&
      typeof yearData === 'object' &&
      yearData !== null &&
      typeKey in yearData &&                        // ✅ usa typeKey (string)
      typeof yearData[typeKey] === 'number' &&
      (yearData[typeKey] as number) > 0
    )
    .slice(0, 3)
    .map(([anio, yearData]) => {
      if (typeof yearData !== 'object' || yearData === null || !(typeKey in yearData)) {
        return null;
      }

      const total = yearData[typeKey] as number;
      const consumidos = solicitudDias[anio]?.[typeKey] ?? 0;
      const porcentaje = total > 0 ? (consumidos / total) * 100 : 0;

                  return (
                    <Card key={anio} className="border-l-4 border-l-[#2ecbe7] ">
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                       Año {anio} - {typeKey}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor={`${selectedType}-${anio}`} className="font-medium text-gray-700">
                            Días a solicitar:
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              id={`${typeKey}-${anio}`}
                              value={consumidos}
                              onChange={(e) => handleDiasChange(
                                anio,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                typeKey as any,
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
                        <ProgressBar
                        value={porcentaje}
                         showValue={porcentaje > 20} 
                        style={{ height: '12px' }}  
                     color="#22c55e"              
                            />
                        <div className="text-xs text-gray-500 text-right">
                          Disponible: {total - consumidos} días
                        </div>
                      </div>
                    </Card>
                  );
                })
              }
              
              {/* Mensaje si no hay días disponibles del tipo seleccionado */}
             {typeKey &&
  Object.entries(saldos)
    .filter(([anio, yearData]) =>
      anio !== 'anio' &&
      typeof yearData === 'object' &&
      yearData !== null &&
      typeKey in yearData &&
      typeof yearData[typeKey] === 'number' &&
      (yearData[typeKey] as number) > 0
    ).length === 0 && (
    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
      <p className="font-medium">No tienes días disponibles de tipo &quot;{typeKey}&quot;</p>
      <p className="text-sm">Selecciona otro tipo de licencia</p>
    </div>
)}

            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">3. Selecciona tu supervisor</h3>
            <Dropdown
  value={supervisores.find(s => s.id === supervisorId) ?? null}
  onChange={(e) => setSupervisorId(e.value.id)}
  options={supervisores}
  optionLabel="name"
  placeholder="-- Elige un supervisor --"
  showClear
  className="w-full "
/>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">4. Mensaje para tu supervisor</h3>
           <InputTextarea
        value={mensaje}
        onChange={(e) => console.log(e.target.value)}
        placeholder="Completa los pasos anteriores..."
        autoResize
        rows={15}                                 // altura inicial
        disabled
        className="w-full min-h-[400px] text-gray-800 p-4
                   border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 font-bold text-center mt-6">{error}</p>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <Button onClick={onCancel} text raised label="Cancelar"></Button>
        <Button onClick={handleSubmit} raised label="Enviar Solicitud" disabled={!mensaje || totalDiasSolicitados !== diasHabilesSeleccionados}>
          <Send size={18} className='ml-2'/> 
        </Button>
      </div>
    </Card>
  );
};

export default RequestForm;