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
import { getAvailableLicenses } from '@/app/util/licenseFilters';
import { generarPlantillaVacaciones } from '@/app/util/plantillaVacaciones';

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
  const [mensaje, setMensaje] = useState('');
  const [tiposData, setTiposData] = useState<Record<string, TipoDisponible>>({});
  console.log("selectedType", saldos);
  // Obtener modo y días por defecto del tipo seleccionado (para licencias de duración fija)
  const licenseMeta = useMemo(() => {
    if (!selectedType) return { days: 0, mode: 'habiles' as const };
    return getLicenseDefaults(selectedType.name);
  }, [selectedType]);



  // 3. Automatic Supervisor Assignment (managerId)
  useEffect(() => {
    if (userData) {
      if (userData.managerId) {
        // En un entorno Prisma el frontend recibiría la relación anidada, pero acá consultamos el nombre al backend si hace falta
        // o si las props ya traen la información del manager:
        console.log(`Asignando automáticamente supervisor con ID: ${userData.managerId}`);
        // Utilizamos el endpoint o asignamos si tenemos la data
        apiClient.get<{ supervisor: { id: number, name: string } }>('/licenses/supervisor?employee_id=' + userData.id)
          .then(res => {
            if (res.supervisor) setSupervisorData(res.supervisor);
          })
          .catch(err => console.error("Error cargando supervisor dinámico", err));
      } else {
        console.warn("No manager assigned for this employee");
        // Fallback u obtener supervisor
        apiClient.get<{ supervisor: { id: number, name: string } }>('/licenses/supervisor?employee_id=' + userData.id)
          .then(res => {
            if (res.supervisor) setSupervisorData(res.supervisor);
          })
          .catch(err => console.error("Error cargando supervisor dinámico", err));
      }
    }
  }, [userData]);

  // Cargar tipos de licencia dinámicamente desde el backend (triple-join)
  useEffect(() => {
    if (!userData?.id) return;
    apiClient.get<{ tipos: TipoDisponible[] }>(`/licenses/tipos-disponibles?employee_id=${userData.id}`)
      .then(res => {
        // 1. Debugging: License Fetching (Array original previo a filtrar mapeos si hubiere)
        console.log("=== DEBUG: Licencias obtenidas de ConfiguracionLicencias ===");
        console.log("Original crudo:", res.tipos);

        const seniorityNum = userData.condicionLaboral?.fechaIngreso
          ? (new Date().getTime() - new Date(userData.condicionLaboral.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          : 0;

        const filteredTipos = getAvailableLicenses(
          res.tipos,
          false, // isRRHHComponent = false
          userData.condicionLaboral?.tipoContrato || 'permanente',
          seniorityNum
        );


        // Construir mapa de datos por nombre de tipo
        const dataMap: Record<string, TipoDisponible> = {};
        filteredTipos.forEach(t => { dataMap[t.nombre] = t; });
        setTiposData(dataMap);

        // Construir opciones para el dropdown
        const opciones = filteredTipos.map(t => ({ name: t.nombre }));
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

  useEffect(() => {
    if (!startDate || !endDate || !supervisorData || diasCalculados <= 0) return;

    const isPermanente = userData.condicionLaboral?.tipoContrato
      ?.toLowerCase()
      .includes('permanente');

    const isVacaciones = selectedType?.name
      ?.toLowerCase()
      .includes('vacaciones');

    if (isPermanente && isVacaciones) {
      const anioActual = startDate.getFullYear();

      const vacacionesPorAnio: { anio: number, diasTotales: number, disponibles: number }[] = [];
      Object.entries(saldos || {}).forEach(([anioStr, tipos]: [string, any]) => {
        const anio = parseInt(anioStr, 10);
        for (const [tipo, datos] of Object.entries(tipos)) {
          if (tipo.toLowerCase().includes('vacaciones')) {
            const d = datos as any;
            if (d.diasTotales > 0) {
              vacacionesPorAnio.push({
                anio,
                diasTotales: d.diasTotales,
                disponibles: d.disponibles
              });
            }
          }
        }
      });
      vacacionesPorAnio.sort((a, b) => b.anio - a.anio);

      const filaActual = vacacionesPorAnio.find(v => v.anio === anioActual) || vacacionesPorAnio[0];

      const licenciasAdeudadas = vacacionesPorAnio
        .filter(s => s.disponibles > 0 && s.anio !== anioActual)
        .map(s => ({
          anio: s.anio,
          dias: s.disponibles
        }));

      const totalDisponible = vacacionesPorAnio.reduce((acc, s) => acc + (s.disponibles || 0), 0);
      const totalDiasSaldo = totalDisponible - diasCalculados;

      setMensaje(
        generarPlantillaVacaciones({
          empleado: userData.name,
          dni: userData.dni,
          supervisor: supervisorData.name,
          desde: startDate.toLocaleDateString('es-AR'),
          hasta: endDate.toLocaleDateString('es-AR'),
          dias: diasCalculados,
          anioActual,
          diasTotalesAnioActual: filaActual?.diasTotales,
          licenciasAdeudadas,
          totalDiasSaldo,
        })
      );

      return;
    }

    // 🔹 Mensaje genérico
    const detalle = Object.entries(solicitudDias)
      .flatMap(([anio, tipos]) =>
        Object.entries(tipos)
          .filter(([, d]) => (d as number) > 0)
          .map(([tipo, d]) => `- ${tipo} ${anio}: ${d} día(s)`)
      )
      .join('\n');

    setMensaje(
      `Estimado/a ${supervisorData.name},\n\nQuien suscribe ${userData.name}, DNI: ${userData.dni}, solicito autorización para tomar licencia por ${selectedType?.name} desde el ${startDate.toLocaleDateString('es-AR')} hasta el ${endDate.toLocaleDateString('es-AR')}, por un total de ${diasCalculados} días ${licenseMeta.mode}.\n\n${detalle}\n\nAtentamente,\n${userData.name}`
    );

  }, [
    startDate,
    endDate,
    supervisorData,
    diasCalculados,
    solicitudDias,
    userData,
    selectedType,
    tiposData,
    saldos
  ]);
  const handleSubmit = () => {
    console.log("supervisor", supervisorData);
    console.log("calculatedDays", diasCalculados);

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

    onSubmit({
      name: userData.name,
      type: selectedType?.name ?? '',
      supervisorId: supervisorData.id,
      solicitanteId: userData.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: diasCalculados,
      tiposLicencia: {},
      mensajeOriginal: mensaje,
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

  // 1. Debugging & Data Inspection: Selection Logic
  // Además implementa el useEffect que dispara el chequeo al cambiar el tipo
  useEffect(() => {
    if (selectedType) {
      console.log("=== DEBUG: Selection Logic ===");
      console.log("selectedLicenseType:", selectedType.name);
      console.log("max_days (limit):", maxDaysAvailable);
    }
  }, [selectedType, maxDaysAvailable]);

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
          <StepLabel n={1} label="Tipo de licencia" />
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
        <Section>
          <StepLabel n={2} label="Rango de fechas" />
          {!selectedType ? (
            <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <p className="text-sm">Por favor, seleccioná primero el tipo de licencia.</p>
            </div>
          ) : licenseMeta.mode === 'corrido' ? (
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
            onChange={(e) => setMensaje(e.target.value)}
            rows={15}
            autoResize
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