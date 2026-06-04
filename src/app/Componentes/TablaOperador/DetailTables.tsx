import { InfoCard, HoursDisplay } from "@/app/util/UiRRHH"
import { User, Briefcase, Clock, Building, Calendar as CalendarIcon, CheckCircle, Phone, Home, Cake, AtSign, Handshake, CopyCheck, ChartColumnStacked, AlertCircle } from 'lucide-react';
import { Employee, Licenses, LicenseHistory, Permit, EmploymentStatus } from '@/app/Interfas/Interfaces';
import { Pagination } from '@/app/Componentes/Pagination/pagination';
import { useMemo, useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { InputMask } from 'primereact/inputmask';
import { updateCondicionLaboral, updateHorario, timeStringToDecimal, decimalToTimeString } from './employeeApi';
import { Dialog } from 'primereact/dialog';
import DateRangePicker from '../../GestionLicencias/Calendario';
import { apiClient } from '../../util/apiClient';
import { getAvailableLicenses } from '../../util/licenseFilters';
import { ProgressBar } from "primereact/progressbar";

interface LicenseHistoryTabProps {
  licenses: Licenses;
  employee: Employee;
  onRowClick: (license: LicenseHistory) => void;
  onRefresh?: () => void;
}


// Interfaz para los tipos de licencia devueltos por el backend
interface TipoDisponible {
  nombre: string;
  diasTotales: number;
  consumidos: number;
  disponibles: number;
}

const formatDate = (date: Date | null) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
export const ProfileTab = ({ employee }: { employee: Employee }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useRef<Toast>(null);
  const [formData, setFormData] = useState({
    position: employee.condicionLaboral.position,
    scheduleStart: typeof employee.horario.horaInicio === 'number'
      ? decimalToTimeString(employee.horario.horaInicio)
      : employee.horario.horaInicio,
    scheduleEnd: typeof employee.horario.horaFin === 'number'
      ? decimalToTimeString(employee.horario.horaFin)
      : employee.horario.horaFin,
    employmentStatus: employee.condicionLaboral.tipoContrato,
    startDate: employee.condicionLaboral?.fechaIngreso
      ? new Date(employee.condicionLaboral.fechaIngreso)
      : null,
    permanentDate: employee.condicionLaboral.fechaPlanta
      ? new Date(employee.condicionLaboral.fechaPlanta)
      : null,
    category: employee.condicionLaboral.categoria,
    lastCategoryUpdate: employee.condicionLaboral.fechaCategoria
      ? new Date(employee.condicionLaboral.fechaCategoria)
      : null
  });

  console.log(employee);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Preparar datos para condición laboral
      const condicionLaboralData = {
        tipoContrato: formData.employmentStatus,
        fechaIngreso: formData.startDate
          ? formData.startDate.toISOString()
          : new Date().toISOString(),
        fechaPlanta: formData.permanentDate
          ? formData.permanentDate.toISOString()
          : null,
        categoria: formData.category || '',
        fechaCategoria: formData.lastCategoryUpdate
          ? formData.lastCategoryUpdate.toISOString()
          : null,
        position: formData.position
      };

      // Preparar datos para horario (convertir "HH:MM" a decimal)
      const horarioData = {
        horaInicio: timeStringToDecimal(formData.scheduleStart),
        horaFin: timeStringToDecimal(formData.scheduleEnd)
      };
      console.log(horarioData)
      // Ejecutar ambas actualizaciones en paralelo
      await Promise.all([
        updateCondicionLaboral(employee.id, condicionLaboralData),
        updateHorario(employee.id, horarioData)
      ]);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos actualizados correctamente',
        life: 3000
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios',
        life: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };



  const handleCancel = () => {
    setFormData({
      position: employee.condicionLaboral.position,
      scheduleStart: typeof employee.horario.horaInicio === 'number'
        ? decimalToTimeString(employee.horario.horaInicio)
        : employee.horario.horaInicio,
      scheduleEnd: typeof employee.horario.horaFin === 'number'
        ? decimalToTimeString(employee.horario.horaFin)
        : employee.horario.horaFin,
      employmentStatus: employee.condicionLaboral.tipoContrato,
      startDate: employee.condicionLaboral?.fechaIngreso
        ? new Date(employee.condicionLaboral.fechaIngreso)
        : null,
      permanentDate: employee.condicionLaboral.fechaPlanta
        ? new Date(employee.condicionLaboral.fechaPlanta)
        : null,
      category: employee.condicionLaboral.categoria,
      lastCategoryUpdate: employee.condicionLaboral.fechaCategoria
        ? new Date(employee.condicionLaboral.fechaCategoria)
        : null
    });
    setIsEditing(false);
  };




  const getEmploymentStatusLabel = (status: EmploymentStatus) => {
    const labels = {
      permanente: 'Planta Permanente',
      contratado: 'Contratado',
      comisionado: 'Comisionado',
      auditor_medico: 'Auditor Medico'
    };
    const key = status as keyof typeof labels;
    return labels[key] || status;
  };

  const employmentStatusOptions = [
    { label: 'Planta Permanente', value: 'permanente' as EmploymentStatus },
    { label: 'Contratado', value: 'contratado' as EmploymentStatus },
    { label: 'Comisionado', value: 'comisionado' as EmploymentStatus },
    { label: 'Auditor Medico', value: 'auditor_medico' as EmploymentStatus }
  ];


  const positionOptions = [
    { label: 'Desarrollador Senior', value: 'Desarrollador Senior' },
    { label: 'Desarrollador Junior', value: 'Desarrollador Junior' },
    { label: 'Analista', value: 'Analista' },
    { label: 'Gerente', value: 'Gerente' },
    { label: 'Coordinador', value: 'Coordinador' },
    { label: 'Director', value: 'Director' },
    { label: 'Especialista', value: 'Especialista' }
  ];


  return (
    <>
      <Toast ref={toast} />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Datos Personales
            </h3>
            <div className="space-y-4">
              <InfoCard icon={Phone} title="Teléfono">
                {employee.phone}
              </InfoCard>
              <InfoCard icon={Home} title="Domicilio">
                {employee.address}
              </InfoCard>
              <InfoCard icon={Cake} title="Fecha de Nacimiento">
                {formatDate(employee.birthDate)}
              </InfoCard>
              <InfoCard icon={AtSign} title="Email">
                {employee.email}
              </InfoCard>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                Condición Laboral
              </h3>
              {!isEditing && (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm"
                  onClick={() => setIsEditing(true)}
                  style={{ color: '#2563eb' }}
                />
              )}
            </div>
            <div className="space-y-4">
              <InfoCard icon={Handshake} title="Tipo de Contrato">
                {isEditing ? (
                  <Dropdown
                    value={formData.employmentStatus}
                    options={employmentStatusOptions}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.value })}
                    className="w-full"
                  />
                ) : (
                  getEmploymentStatusLabel(formData.employmentStatus)
                )}
              </InfoCard>

              <InfoCard icon={CalendarIcon} title="Fecha de Ingreso">
                {isEditing ? (
                  <Calendar
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.value as Date })}
                    dateFormat="yy-mm-dd"
                    className="w-full"
                  />
                ) : (
                  formatDate(formData.startDate)
                )}
              </InfoCard>

              {(employee.condicionLaboral.fechaPlanta || isEditing) && (
                <InfoCard icon={CheckCircle} title="Ingreso a Planta">
                  {isEditing ? (
                    <Calendar
                      value={formData.permanentDate}
                      onChange={(e) => setFormData({ ...formData, permanentDate: e.value as Date })}
                      dateFormat="yy-mm-dd"
                      className="w-full"
                    />
                  ) : (
                    formatDate(formData.permanentDate)
                  )}
                </InfoCard>
              )}

              <InfoCard icon={User} title="Categoría">
                {isEditing ? (
                  <InputText
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  formData.category || ''
                )}
              </InfoCard>

              <InfoCard icon={CopyCheck} title="Ultima Recategorización">
                {isEditing ? (
                  <Calendar
                    value={formData.lastCategoryUpdate}
                    onChange={(e) => setFormData({ ...formData, lastCategoryUpdate: e.value as Date })}
                    dateFormat="yy-mm-dd"
                    className="w-full"
                  />
                ) : (
                  formatDate(formData.lastCategoryUpdate)
                )}
              </InfoCard>
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  label="Guardar"
                  icon="pi pi-check"
                  className="p-button-sm p-button-success flex-1"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                />
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-sm p-button-secondary flex-1"
                  onClick={handleCancel}
                  disabled={isSaving}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Detalles Adicionales
            </h3>
            <div className="space-y-4">
              <InfoCard icon={Briefcase} title="Posición">
                {isEditing ? (
                  <Dropdown
                    value={formData.position}
                    options={positionOptions}
                    onChange={(e) => setFormData({ ...formData, position: e.value })}
                    className="w-full"
                    editable
                  />
                ) : (
                  formData.position
                )}
              </InfoCard>

              <InfoCard icon={Building} title="Departamento / Supervisor">
                {employee.department?.nombre ?? "Sin departamento"} - {employee.office?.nombre ?? "Sin oficina"} / {employee.manager?.name ?? "Sin supervisor"}
              </InfoCard>

              <InfoCard icon={Clock} title="Horario Laboral">
                {isEditing ? (
                  <div className="flex gap-2 items-center w-full">
                    <InputMask
                      value={formData.scheduleStart}
                      onChange={(e) => setFormData({ ...formData, scheduleStart: e.value || '' })}
                      mask="99:99"
                      placeholder="09:00"
                      className="p-inputtext-sm w-20"
                    />
                    <span className="text-gray-500 flex-shrink-0">—</span>
                    <InputMask
                      value={formData.scheduleEnd}
                      onChange={(e) => setFormData({ ...formData, scheduleEnd: e.value || '' })}
                      mask="99:99"
                      placeholder="18:00"
                      className="p-inputtext-sm w-20"
                    />
                  </div>
                ) : (
                  `${formData.scheduleStart} - ${formData.scheduleEnd}`
                )}
              </InfoCard>

              <InfoCard icon={ChartColumnStacked} title="Productividad">
                {employee.productivityScore} Promedio
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



const StepLabel = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
    <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
  </div>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const LicenseHistoryTab = ({ licenses, employee, onRowClick, onRefresh }: LicenseHistoryTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  // Estados para las fechas y cálculo (única fuente de verdad)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [diasCalculados, setDiasCalculados] = useState(0);

  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);
  const [error, setError] = useState('');
  const [tiposData, setTiposData] = useState<Record<string, TipoDisponible>>({});

  const itemsPerPage = 10;

  // Ahora leemos el "mode" (habiles/corrido) directamente del tipo seleccionado que vino del backend
  const licenseMeta = useMemo(() => {
    if (!selectedType) return { mode: 'habiles' as const };
    // Cambia "selectedType.mode" por el nombre exacto de la propiedad que envía tu backend
    return { mode: selectedType.mode || 'habiles' };
  }, [selectedType]);

  const typeKey = selectedType?.name || selectedType?.nombre;

  const maxDaysAvailable = useMemo(() => {
    if (!typeKey || !tiposData[typeKey]) return 0;
    return tiposData[typeKey].disponibles;
  }, [typeKey, tiposData]);

  const canAddManual = true;

  const openManualModal = async () => {
    setIsManualModalOpen(true);
    setLoadingTypes(true);
    try {
      const [tiposRes, saldosRes] = await Promise.all([
        apiClient.get<any>(`/licenses/tipos-disponibles?employee_id=${employee.id}`),
        apiClient.get<any>(`/licenses/saldos?employee_id=${employee.id}`)
      ]);


      const tiposArray = tiposRes.tipos || tiposRes || [];
      console.log("tiposArray", tiposArray);
      // Guardamos los saldos en el estado para el diccionario de UI
      if (Array.isArray(tiposArray)) {
        const tiposRecord = tiposArray.reduce((acc, curr) => {
          const key = curr.nombre;
          if (key) acc[key] = curr;
          return acc;
        }, {} as Record<string, TipoDisponible>);
        setTiposData(tiposRecord);
      }
    } catch (err) {
      console.error("Error cargando tipos", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null, dias: number) => {
    if (licenseMeta.mode === 'habiles') {
      setStartDate(start);
      setEndDate(end);
      setDiasCalculados(dias);
    }
    setError('');
  };

  const handleManualSubmit = async () => {
    if (!selectedType || !startDate || !endDate || diasCalculados <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Faltan datos', detail: 'Complete todos los campos.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        solicitanteId: employee.id,
        type: selectedType.nombre || selectedType.name,
        startDate: startDate,
        endDate: endDate,
        duration: diasCalculados,
        status: "Aprobada",
        mensajeOriginal: observaciones || `Carga manual realizada por departamento de RRHH.`,
        tiposLicencia: {}
      };

      await apiClient.post('/licenses/request', payload);
      toast.current?.show({ severity: 'success', summary: 'Licencia Registrada', detail: 'La licencia se guardó como Aprobada.' });
      setIsManualModalOpen(false);

      // Limpiamos correctamente los estados únicos
      setSelectedType(null);
      setStartDate(null);
      setEndDate(null);
      setDiasCalculados(0);
      setObservaciones("");

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error guardando licencia manual", err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la licencia.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mapear las licencias directamente del array devuelto por el backend.
  // Cada elemento ya es un objeto License con: id, type, startDate, endDate, status, duracion, etc.
  const licenseList: LicenseHistory[] = useMemo(() => {
    const raw = Array.isArray(licenses) ? licenses : [];
    // Filtrar entradas nulas (el backend envía [NULL_LICENSE] cuando no hay datos)
    return raw
      .filter((l: any) => l && l.id !== null && l.id !== undefined)
      .map((l: any) => ({
        id: l.id,
        solicitanteId: employee.id,
        name: employee.name,
        type: l.type,
        supervisorId: 0,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status,
        duration: l.duracion,
        mensajeOriginal: l.mensajeOriginal,
        createdAt: l.createdAt,
        aprobaciones: l.aprobaciones,
        tiposLicencia: {},
      }));
  }, [licenses, employee]);

  const totalItems = licenseList.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = licenseList.slice(startIndex, endIndex);

  const handleTypeChange = (newType: { name: string, nombre?: string } | null) => {
    setSelectedType(newType);
    setStartDate(null);
    setEndDate(null);
    setDiasCalculados(0);
    setError('');
  };


  return (
    <div className="mt-4 flow-root">
      <Toast ref={toast} />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Historial de Licencias</h2>
          {canAddManual && (
            <Button
              label="Carga Manual"
              icon="pi pi-plus"
              className="p-button-sm p-button-info"
              onClick={openManualModal}
            />
          )}
        </div>

        <Dialog
          header="Registrar Licencia Manual"
          visible={isManualModalOpen}
          style={{ width: '90vw', maxWidth: '600px' }}
          onHide={() => setIsManualModalOpen(false)}
          footer={(
            <div className="flex justify-end gap-2 px-4 pb-4">
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setIsManualModalOpen(false)} />
              <Button label="Guardar y Aprobar" icon="pi pi-check" className="p-button-primary" onClick={handleManualSubmit} loading={isSubmitting} />
            </div>
          )}
        >
          <div className="space-y-4 py-2">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700">
              <span className="font-bold">Modo RRHH:</span> Esta licencia no requiere aprobación del supervisor y se guardará directamente como <strong>Aprobada</strong> en el historial, descontando los saldos correspondientes.
            </div>

            <Section>
              <StepLabel n={2} label="Tipo de licencia" />
              <Dropdown
                value={selectedType}
                onChange={e => handleTypeChange(e.value)}
                options={Object.values(tiposData)}
                optionLabel="nombre"
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Periodo de Licencia</label>
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
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
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Observaciones / Motivo</label>
              <InputText
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Licencia por LAR médica según certificado..."
                className="w-full p-inputtext-sm"
              />
            </div>
          </div>
        </Dialog>

        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Inicio
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Fin
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Duración
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((lic: LicenseHistory) => (
                  <tr
                    key={lic.id}
                    onClick={() => onRowClick(lic)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {lic.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.startDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.endDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.duration} días
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${lic.status === "Aprobada"
                          ? "bg-green-100 text-green-800"
                          : lic.status === "Rechazada"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No hay historial de licencias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mostrar información de paginación y el componente solo si hay datos */}
            {totalItems > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PermissionHistoryTab = ({ permisos }: { permisos: Permit[] }) => (
  console.log(permisos),

  <div className="mt-4 flow-root">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Salida
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Retorno
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Horas Adeudadas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(permisos) && permisos.length > 0 ? (
                permisos.map((p, index) => (
                  <tr key={p.id ?? index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {formatDate(p.date) ?? "Sin fecha"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {decimalToTimeString(p.exitTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {decimalToTimeString(p.returnTime) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <HoursDisplay hours={p.hours ?? 0} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-sm text-gray-500 py-4"
                  >
                    No hay permisos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

