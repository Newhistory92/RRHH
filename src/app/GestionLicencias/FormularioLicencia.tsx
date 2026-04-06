// "use client";
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import { Card } from 'primereact/card'; 
// import { ProgressBar } from 'primereact/progressbar';
// import { InputTextarea } from 'primereact/inputtextarea';
// import React, { useState, useEffect, useMemo } from 'react';
// import { Send,ArrowLeft} from 'lucide-react';
// import 'react-datepicker/dist/react-datepicker.css';
// import {LicenseHistory, Saldo, Usuario,LicenseStatus,TiposLicencia, Employee } from "@/app/Interfas/Interfaces"
// import DateRangePicker from './Calendario';

// export interface RequestFormProps {
//   saldos:  Saldo[];
//   supervisores: Usuario[];
//   userData: Employee ;
//   onCancel: () => void;
//   onSubmit: (data: LicenseHistory) => void;
// }

// const RequestForm: React.FC<RequestFormProps> = ({ 
//   saldos, 
//   supervisores, 
//   userData, 
//   onCancel, 
//   onSubmit 
// }) => {
//   const [isClient, setIsClient] = useState(false);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [diasHabilesSeleccionados, setDiasHabilesSeleccionados] = useState<number>(0);
//   const [supervisorId, setSupervisorId] = useState();
//   const [error, setError] = useState('');



//   // ✅ Inicializar días de forma segura con la nueva estructura
//   const initializeDias = (): TiposLicencia => {
//     const result: TiposLicencia = {};
//     if (saldos && typeof saldos === 'object') {
//       for (const anio in saldos) {
//         if (anio !== 'anio') { // Excluir la propiedad 'anio'
//           result[anio] = { Licencias: 0, Particulares: 0, Articulos: 0, Examen: 0 };
//         }
//       }
//     }
//     return result;
//   };

//   const [solicitudDias, setSolicitudDias] = useState<TiposLicencia>(initializeDias);
//   // const [selectedType, setSelectedType] = useState<'Licencias' | 'Particulares' | 'Articulos' | 'Examen'>('Licencias');
// const [selectedType, setSelectedType] = useState<{ name: string } | null>(null);
//   // 🔥 Handler actualizado para recibir las fechas del calendario personalizado
//   const handleDateChange = (newStartDate: Date | null, newEndDate: Date | null) => {
//     setStartDate(newStartDate);
//     setEndDate(newEndDate);
//     if (newStartDate && newEndDate) {
//       // Estimación básica de días hábiles
//       let businessDays = 0;
//       const currentDate = new Date(newStartDate.getTime());
//       while (currentDate <= newEndDate) {
//         const dayOfWeek = currentDate.getDay();
//         if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No sábado ni domingo
//           businessDays++;
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
//       setDiasHabilesSeleccionados(businessDays);
//     } else {
//       setDiasHabilesSeleccionados(0);
//     }

//     // Limpiar error si había uno
//     if (error) {
//       setError('');
//     }
//   };

//   // ✅ Control de hidratación
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // ✅ Reinicializar días cuando cambien los saldos
//   useEffect(() => {
//     if (saldos && typeof saldos === 'object') {
//       setSolicitudDias(initializeDias());
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [saldos]);

//   const totalDiasSolicitados = useMemo(() => {
//     return Object.values(solicitudDias)
//       .flatMap(yearData => Object.values(yearData))
//       .reduce((total, dias) => total + dias, 0);
//   }, [solicitudDias]);

//   const mensaje = useMemo(() => {
//     if (!isClient || !startDate || !endDate || !supervisorId || totalDiasSolicitados <= 0) {
//       return '';
//     }

//     const supervisor = supervisores?.find(s => s.id === supervisorId);

//     const tiposDetalle = Object.entries(solicitudDias)
//       .map(([anio, tipos]) => {
//         const detallesAnio = Object.entries(tipos)
//           .filter(([, dias]) => dias > 0)
//           .map(([tipo, dias]) => `- ${tipo} ${anio}: ${dias} día(s)`)
//           .join('\n');
//         return detallesAnio;
//       })
//       .filter(Boolean)
//       .join('\n');

//     if (!supervisor) return '';

//     return `Estimado/a ${supervisor.name || ''},\n\nQuien suscribe ${userData.name}, DNI: ${userData.dni}, que se desempeña en el departamento/oficina ${userData.department || userData.office}, solicito autorización para tomar licencia desde el ${startDate.toLocaleDateString('es-AR')} hasta el ${endDate.toLocaleDateString('es-AR')}, por un total de ${totalDiasSolicitados} días hábiles.\n\n${tiposDetalle}\n\nAtentamente,\n${userData?.name || ''}`;
//   }, [totalDiasSolicitados, supervisorId, startDate, endDate, solicitudDias, userData, supervisores, isClient]);

//   const handleDiasChange = (anio: string, tipo: 'Licencias' | 'Particulares' | 'Articulos' | 'Examen', valor: string) => {
//     const numValor = Number(valor);

//     if (!saldos || typeof saldos !== 'object') return;

//     // ✅ Acceder directamente al año en el objeto saldos
// const yearData = saldos[Number(anio)];
//     if (!yearData || numValor < 0) return;

//     if (typeof yearData === 'object' && tipo in yearData && typeof yearData[tipo] === 'number') {
//       if (numValor <= yearData[tipo]) {
//         setSolicitudDias(prev => ({
//           ...prev,
//           [anio]: { 
//             ...prev[anio], 
//             [tipo]: numValor 
//           }
//         }));
//       }
//     }
//   };

//   const handleSubmit = () => {
//     if (!isClient) return;

//     // 🔥 Validaciones actualizadas
//     if (!startDate || !endDate) {
//       setError('Debes seleccionar las fechas de inicio y fin.');
//       return;
//     }

//     if (!supervisorId) {
//       setError('Debes seleccionar un supervisor.');
//       return;
//     }

//     if (totalDiasSolicitados <= 0) {
//       setError('Debes asignar al menos un día de licencia.');
//       return;
//     }

//     // 🔥 Validación: total de días debe coincidir con días hábiles
//     if (totalDiasSolicitados !== diasHabilesSeleccionados) {
//       setError(`El total de días asignados (${totalDiasSolicitados}) no coincide con los días hábiles del calendario (${diasHabilesSeleccionados}).`);
//       return;
//     }

//     onSubmit({
//       name: userData?.name || '',
//       type: selectedType?.name ?? '',
//       supervisorId,
//       solicitanteId: userData.id,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       duration: totalDiasSolicitados,
//       tiposLicencia: JSON.parse(JSON.stringify(solicitudDias)),
//       originalMessage: mensaje,
//       status: 'Pendiente' as LicenseStatus,
//       createdAt: new Date().toISOString(),
//     });
//   };

//   // ✅ Render loading mientras se hidrata
//   if (!isClient) {
//     return (
//       <Card className="max-w-4xl mx-auto">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="space-y-6">
//               <div className="h-64 bg-gray-300 rounded"></div>
//               <div className="h-32 bg-gray-300 rounded"></div>
//             </div>
//             <div className="space-y-6">
//               <div className="h-10 bg-gray-300 rounded"></div>
//               <div className="h-264 bg-gray-300 rounded"></div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     );
//   }

//   // ✅ Validación de props actualizada
//    if (!saldos || typeof saldos !== 'object' || Object.keys(saldos).length === 0) {
//     return (
//       <Card className="max-w-4xl mx-auto">
//         <div className="text-center py-8">
//           <p className="text-red-600 font-semibold">No se pudieron cargar los datos de saldos de licencias.</p>
//         </div>
//       </Card>
//     );
//   }

//   if (!supervisores || !Array.isArray(supervisores) || supervisores.length === 0) {
//     return (
//       <Card className="max-w-4xl mx-auto">
//         <div className="text-center py-8">
//           <p className="text-red-600 font-semibold">No se pudieron cargar los datos de supervisores.</p>
//         </div>
//       </Card>
//     );
//   }



//   const tiposLicencia = [
//         { name: 'Articulos'  },
//         { name: 'Licencias' },
//         { name: 'Parte Medico' },
//         { name: 'Profilactica' },
//         { name: 'Particulares' },
//         { name: 'Matrimonio' },
//         { name: 'Examen' },
//         { name: 'Matrimonio Hijo' },
//         { name: 'Paternidad' },
//         { name: 'Paternidad Especial' },
//         { name: 'Maternidad' },
//         { name: 'Fallecimiento' },
//         { name: 'Enfermedad' },
//         { name: 'Guarda Tenencia' },

//     ];
//     const typeKey = selectedType?.name;

//    return (
//     <Card title="Crear Nueva Solicitud">
//       {/* Botón de volver */}
//       <div className="mb-4">
//         <Button 
//           onClick={onCancel} 
//           link
//           className="flex items-center gap-2 px-3 py-2"
//           label=""
//         >
//           <ArrowLeft size={18} />
//           Volver al menú
//         </Button>
//       </div>

//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}

//       <div className="w-full gap-8">
//         <div className="space-y-6">
//           <div>
//             <h3 className="font-bold text-lg mb-2">1. Selecciona el rango de fechas</h3>
//             <DateRangePicker onDateChange={handleDateChange} />
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-2">2. Selecciona el tipo principal y asigna días</h3>

//             {/* Selector de tipo principal */}
//             <div className="mb-4">
//                 <Dropdown value={selectedType} onChange={(e) => setSelectedType(e.target.value as typeof selectedType)} 
//                 options={tiposLicencia} 
//                 optionLabel="name" 
//                 showClear placeholder="Tipos de Licencias" className="w-full md:w-14rem" />
//             </div>

//             <div className="space-y-4">
//               {/* ✅ Mostrar solo el tipo seleccionado, limitado a 3 años */}

//              {typeKey &&
//   Object.entries(saldos)
//     .filter(([anio, yearData]) =>
//       anio !== 'anio' &&
//       typeof yearData === 'object' &&
//       yearData !== null &&
//       typeKey in yearData &&                        // ✅ usa typeKey (string)
//       typeof yearData[typeKey] === 'number' &&
//       (yearData[typeKey] as number) > 0
//     )
//     .slice(0, 3)
//     .map(([anio, yearData]) => {
//       if (typeof yearData !== 'object' || yearData === null || !(typeKey in yearData)) {
//         return null;
//       }

//       const total = yearData[typeKey] as number;
//       const consumidos = solicitudDias[anio]?.[typeKey] ?? 0;
//       const porcentaje = total > 0 ? (consumidos / total) * 100 : 0;

//                   return (
//                     <Card key={anio} className="border-l-4 border-l-[#2ecbe7] ">
//                       <h4 className="font-semibold text-lg mb-3 text-gray-800">
//                        Año {anio} - {typeKey}
//                       </h4>
//                       <div className="space-y-3">
//                         <div className="flex justify-between items-center mb-2">
//                           <label htmlFor={`${selectedType}-${anio}`} className="font-medium text-gray-700">
//                             Días a solicitar:
//                           </label>
//                           <div className="flex items-center gap-3">
//                             <input
//                               type="number"
//                               id={`${typeKey}-${anio}`}
//                               value={consumidos}
//                               onChange={(e) => handleDiasChange(
//                                 anio,
//                                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                                 typeKey as any,
//                                 e.target.value
//                               )}
//                               className={`w-20 p-2 border rounded text-center font-medium ${
//                                 totalDiasSolicitados >= diasHabilesSeleccionados && diasHabilesSeleccionados > 0
//                                   ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
//                                   : 'bg-white'
//                               }`}
//                               min="0"
//                               max={Math.min(total, diasHabilesSeleccionados - (totalDiasSolicitados - consumidos))}
//                               disabled={totalDiasSolicitados >= diasHabilesSeleccionados && diasHabilesSeleccionados > 0 && consumidos === 0}
//                             />
//                             <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-right">
//                               {consumidos}/{total}
//                             </span>
//                           </div>
//                         </div>
//                         <ProgressBar
//                         value={porcentaje}
//                          showValue={porcentaje > 20} 
//                         style={{ height: '12px' }}  
//                      color="#22c55e"              
//                             />
//                         <div className="text-xs text-gray-500 text-right">
//                           Disponible: {total - consumidos} días
//                         </div>
//                       </div>
//                     </Card>
//                   );
//                 })
//               }

//               {/* Mensaje si no hay días disponibles del tipo seleccionado */}
//              {typeKey &&
//   Object.entries(saldos)
//     .filter(([anio, yearData]) =>
//       anio !== 'anio' &&
//       typeof yearData === 'object' &&
//       yearData !== null &&
//       typeKey in yearData &&
//       typeof yearData[typeKey] === 'number' &&
//       (yearData[typeKey] as number) > 0
//     ).length === 0 && (
//     <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
//       <p className="font-medium">No tienes días disponibles de tipo &quot;{typeKey}&quot;</p>
//       <p className="text-sm">Selecciona otro tipo de licencia</p>
//     </div>
// )}

//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div>
//             <h3 className="font-bold text-lg mb-2">3. Selecciona tu supervisor</h3>
//             <Dropdown
//   value={supervisores.find(s => s.id === supervisorId) ?? null}
//   onChange={(e) => setSupervisorId(e.value.id)}
//   options={supervisores}
//   optionLabel="name"
//   placeholder="-- Elige un supervisor --"
//   showClear
//   className="w-full "
// />
//           </div>
//           <div>
//             <h3 className="font-bold text-lg mb-2">4. Mensaje para tu supervisor</h3>
//            <InputTextarea
//         value={mensaje}
//         onChange={(e) => console.log(e.target.value)}
//         placeholder="Completa los pasos anteriores..."
//         autoResize
//         rows={15}                                 // altura inicial
//         disabled
//         className="w-full min-h-[400px] text-gray-800 p-4
//                    border border-gray-300 rounded-lg
//                    focus:outline-none focus:ring-2 focus:ring-blue-400"
//       />
//           </div>
//         </div>
//       </div>

//       {error && (
//         <p className="text-red-600 font-bold text-center mt-6">{error}</p>
//       )}

//       <div className="mt-8 flex justify-end gap-4">
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { LicenseHistory, Saldo, Usuario, LicenseStatus, TiposLicencia, Employee } from "@/app/Interfas/Interfaces";
import DateRangePicker from './Calendario';
import { apiClient } from '@/app/util/apiClient';

// Interfaz para los tipos de licencia devueltos por el backend
interface TipoDisponible {
  nombre: string;
  diasTotales: number;
  consumidos: number;
  disponibles: number;
}

// Constantes de duración para licencias especiales (días fijos por normativa)
const LICENCIA_DEFAULTS: Record<string, { days: number; mode: 'habiles' | 'corrido' }> = {
  'matrimonio del empleado': { days: 12, mode: 'habiles' },
  'matrimonio de su hijo': { days: 2, mode: 'habiles' },
  'nacimiento': { days: 5, mode: 'habiles' },
  'embarazo': { days: 90, mode: 'corrido' },
  'fallecimiento primer grado': { days: 5, mode: 'habiles' },
  'fallecimiento de segundo grado': { days: 2, mode: 'habiles' },
  'fallecimiento de tercer grado': { days: 1, mode: 'habiles' },
  'guarda o tenencia': { days: 10, mode: 'habiles' },
};

// Helper: obtiene la duración por defecto según el tipo de licencia
function getLicenseDefaults(type: string): { days: number; mode: 'habiles' | 'corrido' } {
  const t = type.toLowerCase();
  for (const [key, value] of Object.entries(LICENCIA_DEFAULTS)) {
    if (t.includes(key)) return value;
  }
  return { days: 0, mode: 'habiles' };
}

export interface RequestFormProps {
  saldos: Saldo[];
  supervisores: Usuario[];
  userData: Employee;
  onCancel: () => void;
  onSubmit: (data: LicenseHistory) => void;
}

const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
  </div>
);

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RequestForm: React.FC<RequestFormProps> = ({ saldos, supervisores, userData, onCancel, onSubmit }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [diasCalculados, setDiasCalculados] = useState(0);
  const [supervisorData, setSupervisorData] = useState<{ id: number, name: string } | null>(null);
  const [selectedType, setSelectedType] = useState<{ name: string } | null>(null);
  const [error, setError] = useState('');
  const [tiposLicencia, setTiposLicencia] = useState<{ name: string }[]>([]);
  // Mapa de tipos disponibles con sus datos completos (diasTotales, consumidos, disponibles)
  const [tiposData, setTiposData] = useState<Record<string, TipoDisponible>>({});

  // Obtener modo y días por defecto del tipo seleccionado (para licencias de duración fija)
  const licenseMeta = useMemo(() => {
    if (!selectedType) return { days: 0, mode: 'habiles' as const };
    return getLicenseDefaults(selectedType.name);
  }, [selectedType]);

  useEffect(() => {
    if (userData?.id) {
      apiClient.get<{ supervisor: { id: number, name: string } }>('/licenses/supervisor?employee_id=' + userData.id)
        .then(res => {
          if (res.supervisor) setSupervisorData(res.supervisor);
        })
        .catch(err => console.error("Error cargando supervisor dinámico", err));
    }
  }, [userData]);

  // Cargar tipos de licencia dinámicamente desde el backend (triple-join)
  useEffect(() => {
    if (!userData?.id) return;
    apiClient.get<{ tipos: TipoDisponible[] }>(`/licenses/tipos-disponibles?employee_id=${userData.id}`)
      .then(res => {
        // Construir mapa de datos por nombre de tipo
        const dataMap: Record<string, TipoDisponible> = {};
        res.tipos.forEach(t => { dataMap[t.nombre] = t; });
        setTiposData(dataMap);

        // Construir opciones para el dropdown
        const opciones = res.tipos.map(t => ({ name: t.nombre }));
        setTiposLicencia(opciones);
      })
      .catch(err => {
        console.error("Error cargando tipos de licencia", err);
        setError('No se pudieron cargar los tipos de licencia del servidor.');
      });
  }, [userData]);

  const [solicitudDias, setSolicitudDias] = useState<TiposLicencia>({});

  useEffect(() => {
    if (!saldos || typeof saldos !== 'object') return;
    const result: TiposLicencia = {};
    for (const anio in saldos) {
      if (anio !== 'anio') result[anio] = {};
    }
    setSolicitudDias(result);
  }, [saldos]);

  useEffect(() => {
    if (licenseMeta.mode === 'corrido' && startDate && licenseMeta.days > 0) {
      const end = new Date(startDate.getTime());
      end.setDate(end.getDate() + licenseMeta.days);
      setEndDate(end);
      setDiasCalculados(licenseMeta.days);
    }
  }, [licenseMeta, startDate]);

  useEffect(() => {
    if (diasCalculados > 0 && selectedType?.name && saldos && Object.keys(saldos).length > 0) {
      const typeToAllocate = selectedType.name;
      let daysLeft = diasCalculados;
      const newDist: TiposLicencia = {};

      for (const anio in saldos) {
        if (anio !== 'anio') newDist[anio] = { ...solicitudDias[anio] };
      }

      const aniosSorted = Object.keys(saldos)
        .filter(a => a !== 'anio' && typeof saldos[a as any][typeToAllocate] === 'number')
        .sort((a, b) => Number(a) - Number(b));

      aniosSorted.forEach(anio => {
        if (daysLeft <= 0) {
          newDist[anio][typeToAllocate] = 0;
          return;
        }
        const max = saldos[anio as any][typeToAllocate] as number;
        if (max > 0) {
          const allocate = Math.min(daysLeft, max);
          newDist[anio][typeToAllocate] = allocate;
          daysLeft -= allocate;
        } else {
          newDist[anio][typeToAllocate] = 0;
        }
      });
      setSolicitudDias(newDist);
    }
  }, [diasCalculados, selectedType, saldos]);

  const handleDateChange = (start: Date | null, end: Date | null, dias: number) => {
    if (licenseMeta.mode === 'habiles') {
      setStartDate(start);
      setEndDate(end);
      setDiasCalculados(dias);
    }
    setError('');
  };

  const totalDiasSolicitados = useMemo(() =>
    Object.values(solicitudDias).flatMap(y => Object.values(y)).reduce((a, b) => a + (b || 0), 0),
    [solicitudDias]);

  const mensaje = useMemo(() => {
    if (!startDate || !endDate || !supervisorData || totalDiasSolicitados <= 0) return '';
    const detalle = Object.entries(solicitudDias)
      .flatMap(([anio, tipos]) =>
        Object.entries(tipos)
          .filter(([, d]) => (d as number) > 0)
          .map(([tipo, d]) => `- ${tipo} ${anio}: ${d} día(s)`)
      ).join('\n');
    return `Estimado/a ${supervisorData.name},\n\nQuien suscribe ${userData.name}, DNI: ${userData.dni}, solicito autorización para tomar licencia por ${selectedType?.name} desde el ${startDate.toLocaleDateString('es-AR')} hasta el ${endDate.toLocaleDateString('es-AR')}, por un total de ${totalDiasSolicitados} días ${licenseMeta.mode}.\n\n${detalle}\n\nAtentamente,\n${userData.name}`;
  }, [startDate, endDate, supervisorData, totalDiasSolicitados, solicitudDias, userData, selectedType, licenseMeta.mode]);

  const handleSubmit = () => {
    if (!startDate || !endDate) return setError('Seleccioná las fechas.');
    if (!supervisorData) return setError('No tenés un supervisor válido asignado.');
    if (totalDiasSolicitados <= 0) return setError('Asigná al menos un día.');
    
    if (selectedType?.name.toLowerCase().includes('vacaciones')) {
      const month = startDate.getMonth() + 1;
      const validMonths = [10, 11, 12, 1, 2, 3, 4];
      if (!validMonths.includes(month)) {
        return setError('Las vacaciones solo pueden tomarse entre el 1 de Octubre y el 30 de Abril.');
      }
    }

    if (totalDiasSolicitados !== diasCalculados)
      return setError(`Los días asignados (${totalDiasSolicitados}) no coinciden con los calculados (${diasCalculados}).`);

    onSubmit({
      name: userData.name,
      type: selectedType?.name ?? '',
      supervisorId: supervisorData.id,
      solicitanteId: userData.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: totalDiasSolicitados,
      tiposLicencia: JSON.parse(JSON.stringify(solicitudDias)),
      originalMessage: mensaje,
      status: 'Pendiente' as LicenseStatus,
      createdAt: new Date().toISOString(),
    });
  };

  const typeKey = selectedType?.name;

  // Calcular máximo de días disponibles desde el endpoint (ya filtrado por consumo)
  const maxDaysAvailable = useMemo(() => {
    if (!typeKey || !tiposData[typeKey]) return 0;
    return tiposData[typeKey].disponibles;
  }, [typeKey, tiposData]);

  // Resetear fechas al cambiar tipo de licencia
  const handleTypeChange = (newType: { name: string } | null) => {
    setSelectedType(newType);
    setStartDate(null);
    setEndDate(null);
    setDiasCalculados(0);
    setError('');
  };


  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Nueva Solicitud de Licencia</h2>
          <p className="text-xs text-gray-400">{userData.name} · {userData.condicionLaboral?.tipoContrato}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section>
          <StepLabel n={1} label="Rango de fechas" />
          {licenseMeta.mode === 'corrido' ? (
            <div className="space-y-4">
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                <AlertCircle size={14} />
                Esta licencia es de 90 días de corrido (calendario).
              </p>
              <div className="field">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha de Inicio</label>
                <Calendar 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.value as Date)} 
                  inline 
                  locale="es"
                  className="w-full"
                />
              </div>
              {endDate && (
                <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
                  <p className="text-xs font-semibold text-cyan-700">Período Calculado:</p>
                  <p className="text-sm text-cyan-800 font-bold">
                    {startDate?.toLocaleDateString()} al {endDate.toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-cyan-600 mt-1">90 días calendario automáticos.</p>
                </div>
              )}
            </div>
          ) : (
            <DateRangePicker onDateChange={handleDateChange} maxDays={maxDaysAvailable} />
          )}
        </Section>

        <Section>
          <StepLabel n={2} label="Tipo de licencia y bolsa" />
           <Dropdown
            value={selectedType}
            onChange={e => handleTypeChange(e.value)}
            options={tiposLicencia}
            optionLabel="name"
            showClear
            placeholder="Seleccioná un tipo..."
            className="w-full mb-4"
          />

          <div className="space-y-3">
            {/* Mostrar saldo disponible del tipo seleccionado */}
            {typeKey && tiposData[typeKey] && (
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{typeKey}</span>
                  <span className="text-xs text-gray-500">
                    {tiposData[typeKey].consumidos}/{tiposData[typeKey].diasTotales} consumidos
                  </span>
                </div>
                <ProgressBar 
                  value={tiposData[typeKey].diasTotales > 0 
                    ? (tiposData[typeKey].consumidos / tiposData[typeKey].diasTotales) * 100 
                    : 0} 
                  showValue={false} 
                  style={{ height: 6 }} 
                  color="#06b6d4" 
                />
                <p className="text-xs text-cyan-600 mt-1 font-medium">
                  Disponibles: {tiposData[typeKey].disponibles} días
                </p>
              </div>
            )}
            {typeKey && !tiposData[typeKey] && (
              <p className="text-center text-xs text-gray-400 py-4 border border-dashed rounded-xl">
                No hay saldo disponible para esta categoría.
              </p>
            )}
          </div>
        </Section>

        <Section className="lg:col-span-1">
          <StepLabel n={3} label="Tu Aprobador" />
          {supervisorData ? (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-bold">
                {supervisorData.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-semibold">{supervisorData.name}</p>
                <p className="text-xs text-gray-500">Superior Directo</p>
              </div>
            </div>
          ) : <p className="text-xs italic text-gray-400">Consultando jerarquía...</p>}
        </Section>

        <Section>
          <StepLabel n={4} label="Vista previa de la nota" />
          <InputTextarea
            value={mensaje}
            readOnly
            rows={6}
            className="w-full text-xs text-gray-600 border-none bg-gray-50 rounded-lg p-3"
          />
        </Section>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={onCancel} className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:cursor-not-allowed"
        >
          Enviar Solicitud
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default RequestForm;