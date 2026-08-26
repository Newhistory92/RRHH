"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { apiClient } from '@/app/util/apiClient';

const ESTADOS = ['Pendiente', 'En análisis', 'Recomendada', 'Aprobada', 'Rechazada', 'Ejecutada'];

const ESTADO_CLASES: Record<string, string> = {
  'Pendiente': 'bg-warning-soft text-warning-soft-foreground border-warning',
  'En análisis': 'bg-primary/15 text-primary border-primary/30',
  'Recomendada': 'bg-primary/15 text-primary border-primary/30',
  'Aprobada': 'bg-success-soft text-success-soft-foreground border-success',
  'Rechazada': 'bg-error-soft text-error-soft-foreground border-error',
  'Ejecutada': 'bg-success-soft text-success-soft-foreground border-success',
};

interface SolicitudRRHH {
  id: number;
  employeeId: number;
  employeeName: string;
  tipo: string;
  motivo: string;
  estado: string;
  observacion: string | null;
  officeIdActual: number | null;
  officeName: string | null;
  departmentIdActual: number | null;
  departmentName: string | null;
  officeIdSugerido: number | null;
  officeSugeridoName: string | null;
  departmentIdSugerido: number | null;
  departmentSugeridoName: string | null;
  scoreCompatibilidad: number | null;
  explicacionIA: string | null;
  beneficios: string[];
  riesgos: string[];
  officeIdDestino: number | null;
  departmentIdDestino: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentOption {
  id: number;
  nombre: string;
  offices: { id: number; nombre: string }[];
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function ReubicacionTablero() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRRHH[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban');

  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
  const [filtroOffice, setFiltroOffice] = useState<number | null>(null);
  const [filtroDepartment, setFiltroDepartment] = useState<number | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [seleccionada, setSeleccionada] = useState<{ solicitud: SolicitudRRHH; accion: 'Aprobada' | 'Rechazada' } | null>(null);
  const [observacion, setObservacion] = useState('');
  const [deptSeleccionado, setDeptSeleccionado] = useState<number | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [verRecomendacion, setVerRecomendacion] = useState<SolicitudRRHH | null>(null);
  const [paraEjecutar, setParaEjecutar] = useState<SolicitudRRHH | null>(null);
  const [deptEjecucion, setDeptEjecucion] = useState<number | null>(null);
  const [officeEjecucion, setOfficeEjecucion] = useState<number | null>(null);
  const [ejecutando, setEjecutando] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    apiClient
      .get<{ departments: DepartmentOption[] }>('/departments/')
      .then((res) => setDepartments(res.departments))
      .catch((err) => console.error('Error al cargar departamentos:', err));
  }, []);

  const officeOptions = departments.flatMap((d) => d.offices.map((o) => ({ label: o.nombre, value: o.id })));
  const departmentOptions = departments.map((d) => ({ label: d.nombre, value: d.id }));

  const officesForDept = (deptId: number | null): { label: string; value: number }[] => {
    if (!deptId) return [];
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.offices.map((o) => ({ label: o.nombre, value: o.id })) : [];
  };

  const scoreBadgeClase = (score: number) =>
    score >= 70
      ? 'bg-success-soft text-success-soft-foreground border-success'
      : score >= 40
      ? 'bg-warning-soft text-warning-soft-foreground border-warning'
      : 'bg-error-soft text-error-soft-foreground border-error';

  const cargarSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.set('estado', filtroEstado);
      if (filtroOffice) params.set('officeId', String(filtroOffice));
      if (filtroDepartment) params.set('departmentId', String(filtroDepartment));
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const query = params.toString();
      const res = await apiClient.get<{ solicitudes: SolicitudRRHH[] }>(
        `/reubicacion/solicitudes${query ? `?${query}` : ''}`
      );
      setSolicitudes(res.solicitudes);
    } catch (err) {
      console.error('Error al cargar solicitudes de reubicacion:', err);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroOffice, filtroDepartment, fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const analizarSolicitudes = async () => {
    setAnalizando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reubicacion-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: { analizadas: number; errores: { solicitudId: number; motivo: string }[] } = await response.json();
      if (data.errores.length > 0) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Análisis parcial',
          detail: `${data.analizadas} analizadas, ${data.errores.length} con error`,
          life: 5000,
        });
      } else {
        toast.current?.show({
          severity: 'success',
          summary: 'Análisis completado',
          detail: `${data.analizadas} solicitudes analizadas`,
          life: 4000,
        });
      }
      await cargarSolicitudes();
    } catch (err) {
      console.error('Error al analizar solicitudes:', err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo completar el análisis', life: 4000 });
    } finally {
      setAnalizando(false);
    }
  };

  const abrirAccion = (solicitud: SolicitudRRHH, accion: 'Aprobada' | 'Rechazada') => {
    setSeleccionada({ solicitud, accion });
    setObservacion('');
    setDeptSeleccionado(solicitud.departmentIdSugerido ?? null);
    setDestinoSeleccionado(solicitud.officeIdSugerido ?? null);
  };

  const confirmarAccion = async () => {
    if (!seleccionada) return;
    setGuardando(true);
    try {
      const esAprobacion = seleccionada.accion === 'Aprobada';
      await apiClient.patch(`/reubicacion/${seleccionada.solicitud.id}/estado`, {
        estado: seleccionada.accion,
        observacion: observacion.trim() || null,
        officeIdDestino: esAprobacion ? destinoSeleccionado : null,
        departmentIdDestino: esAprobacion ? deptSeleccionado : null,
      });
      toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: `Solicitud ${seleccionada.accion.toLowerCase()}`, life: 3000 });
      setSeleccionada(null);
      await cargarSolicitudes();
    } catch (err) {
      console.error('Error al actualizar solicitud:', err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la solicitud', life: 4000 });
    } finally {
      setGuardando(false);
    }
  };

  const abrirEjecucion = (solicitud: SolicitudRRHH) => {
    setParaEjecutar(solicitud);
    setDeptEjecucion(solicitud.departmentIdDestino ?? null);
    setOfficeEjecucion(solicitud.officeIdDestino ?? null);
  };

  const confirmarEjecucion = async () => {
    if (!paraEjecutar || !deptEjecucion) return;
    setEjecutando(true);
    try {
      await apiClient.patch(`/reubicacion/${paraEjecutar.id}/ejecutar`, {
        departmentId: deptEjecucion,
        officeId: officeEjecucion,
      });
      toast.current?.show({ severity: 'success', summary: 'Ejecutada', detail: 'Reubicación ejecutada correctamente', life: 3000 });
      setParaEjecutar(null);
      await cargarSolicitudes();
    } catch (err) {
      console.error('Error al ejecutar la solicitud:', err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo ejecutar la reubicación', life: 4000 });
    } finally {
      setEjecutando(false);
    }
  };

  const puedeAccionar = (estado: string) => estado === 'Pendiente' || estado === 'Recomendada';
  const hayPendientes = solicitudes.some((s) => s.estado === 'Pendiente' || s.estado === 'En análisis');

  const AccionesSolicitud = ({ s }: { s: SolicitudRRHH }) => (
    puedeAccionar(s.estado) ? (
      <div className="flex flex-col gap-2 mt-2">
        <Button label="Aprobar" icon="pi pi-check" severity="success" size="small" className="w-full" onClick={() => abrirAccion(s, 'Aprobada')} />
        <Button label="Rechazar" icon="pi pi-times" severity="danger" size="small" className="w-full" onClick={() => abrirAccion(s, 'Rechazada')} />
      </div>
    ) : null
  );

  const VerRecomendacionBoton = ({ s }: { s: SolicitudRRHH }) => (
    s.estado === 'Recomendada' && s.scoreCompatibilidad !== null ? (
      <Button
        label="Ver recomendación"
        icon="pi pi-eye"
        text
        size="small"
        className="w-full mt-1"
        onClick={() => setVerRecomendacion(s)}
      />
    ) : null
  );

  const BotonEjecutar = ({ s }: { s: SolicitudRRHH }) => (
    s.estado === 'Aprobada' ? (
      <Button
        label="Ejecutar"
        icon="pi pi-directions"
        severity="success"
        size="small"
        className="w-full mt-2"
        onClick={() => abrirEjecucion(s)}
      />
    ) : null
  );

  return (
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Solicitudes de Reubicación</h1>
            <p className="text-muted-foreground">Tablero de RRHH para gestionar la movilidad interna.</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Sin el title, un boton apagado no explica por que lo esta y
                parece que la pantalla esta rota. */}
            <Button
              label="Analizar Solicitudes"
              icon="pi pi-sparkles"
              loading={analizando}
              disabled={!hayPendientes}
              onClick={analizarSolicitudes}
              title={
                hayPendientes
                  ? 'Analizar las solicitudes pendientes con IA'
                  : 'No hay solicitudes pendientes para analizar'
              }
            />
            <button
              onClick={() => setVista('kanban')}
              className={`p-2 rounded-lg border ${vista === 'kanban' ? 'bg-primary/15 border-primary text-primary' : 'border-border text-muted-foreground'}`}
              title="Vista Kanban"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={`p-2 rounded-lg border ${vista === 'tabla' ? 'bg-primary/15 border-primary text-primary' : 'border-border text-muted-foreground'}`}
              title="Vista Tabla"
            >
              <List size={18} />
            </button>
          </div>
        </header>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Estado</label>
            <Dropdown
              value={filtroEstado}
              options={ESTADOS.map((e) => ({ label: e, value: e }))}
              onChange={(e) => setFiltroEstado(e.value)}
              showClear
              placeholder="Todos"
              className="w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Departamento</label>
            <Dropdown
              value={filtroDepartment}
              options={departmentOptions}
              onChange={(e) => setFiltroDepartment(e.value)}
              showClear
              placeholder="Todos"
              className="w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Oficina</label>
            <Dropdown
              value={filtroOffice}
              options={officeOptions}
              onChange={(e) => setFiltroOffice(e.value)}
              showClear
              placeholder="Todas"
              className="w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm" />
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Cargando...</p>
        ) : vista === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {ESTADOS.map((estado) => (
              <div key={estado} className="bg-card border border-border rounded-xl p-3 space-y-3 min-h-[200px]">
                <h3 className="font-heading text-sm font-semibold text-foreground">{estado}</h3>
                {solicitudes.filter((s) => s.estado === estado).map((s) => (
                  <div key={s.id} className="p-3 border border-border rounded-lg bg-background">
                    <p className="font-semibold text-sm text-foreground">{s.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{s.tipo}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.motivo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(s.createdAt)}</p>
                    <VerRecomendacionBoton s={s} />
                    <AccionesSolicitud s={s} />
                    <BotonEjecutar s={s} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 px-3">Empleado</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Motivo</th>
                  <th className="py-2 px-3">Oficina / Depto</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-border">
                    <td className="py-2 px-3 text-foreground">{s.employeeName}</td>
                    <td className="py-2 px-3 text-foreground">{s.tipo}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-xs truncate">{s.motivo}</td>
                    <td className="py-2 px-3 text-muted-foreground">{s.officeName ?? '—'} / {s.departmentName ?? '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${ESTADO_CLASES[s.estado] ?? 'bg-muted text-muted-foreground border-border'}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                    <td className="py-2 px-3">
                      <VerRecomendacionBoton s={s} />
                      <AccionesSolicitud s={s} />
                      <BotonEjecutar s={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {solicitudes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay solicitudes con estos filtros.</p>
            )}
          </div>
        )}
      </div>

      <Dialog
        header={seleccionada ? `${seleccionada.accion === 'Aprobada' ? 'Aprobar' : 'Rechazar'} solicitud de ${seleccionada.solicitud.employeeName}` : ''}
        visible={!!seleccionada}
        onHide={() => setSeleccionada(null)}
        style={{ width: '30rem' }}
        modal
      >
        <div className="space-y-3">
          {seleccionada?.accion === 'Aprobada' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Departamento destino (opcional)</label>
                <Dropdown
                  value={deptSeleccionado}
                  options={departmentOptions}
                  onChange={(e) => { setDeptSeleccionado(e.value); setDestinoSeleccionado(null); }}
                  showClear
                  placeholder="Sin destino"
                  className="w-full"
                />
              </div>
              {deptSeleccionado && officesForDept(deptSeleccionado).length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Oficina destino (opcional)</label>
                  <Dropdown
                    value={destinoSeleccionado}
                    options={officesForDept(deptSeleccionado)}
                    onChange={(e) => setDestinoSeleccionado(e.value)}
                    showClear
                    placeholder="Todo el departamento"
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}
          <label className="block text-sm font-semibold text-foreground">Observación (opcional)</label>
          <InputTextarea value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={4} className="w-full" />
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" className="p-button-text" onClick={() => setSeleccionada(null)} />
            <Button
              label="Confirmar"
              severity={seleccionada?.accion === 'Aprobada' ? 'success' : 'danger'}
              loading={guardando}
              onClick={confirmarAccion}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={verRecomendacion ? `Recomendación para ${verRecomendacion.employeeName}` : ''}
        visible={!!verRecomendacion}
        onHide={() => setVerRecomendacion(null)}
        style={{ width: '32rem' }}
        modal
      >
        {verRecomendacion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Destino sugerido</p>
                <p className="font-semibold text-foreground">
                  {verRecomendacion.officeSugeridoName ?? 'Sin destino'} / {verRecomendacion.departmentSugeridoName ?? '—'}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-bold rounded-full border ${scoreBadgeClase(verRecomendacion.scoreCompatibilidad ?? 0)}`}>
                {verRecomendacion.scoreCompatibilidad ?? 0}%
              </span>
            </div>
            <p className="text-sm text-foreground">{verRecomendacion.explicacionIA}</p>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Beneficios esperados</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {verRecomendacion.beneficios.map((b, i) => (
                  <li key={i}>✓ {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Riesgos</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {verRecomendacion.riesgos.map((r, i) => (
                  <li key={i}>⚠ {r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={paraEjecutar ? `Ejecutar reubicación de ${paraEjecutar.employeeName}` : ''}
        visible={!!paraEjecutar}
        onHide={() => setParaEjecutar(null)}
        style={{ width: '28rem' }}
        modal
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Departamento destino</label>
            <Dropdown
              value={deptEjecucion}
              options={departmentOptions}
              onChange={(e) => { setDeptEjecucion(e.value); setOfficeEjecucion(null); }}
              placeholder="Seleccionar departamento"
              className="w-full"
            />
          </div>
          {deptEjecucion && officesForDept(deptEjecucion).length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Oficina destino (opcional)</label>
              <Dropdown
                value={officeEjecucion}
                options={officesForDept(deptEjecucion)}
                onChange={(e) => setOfficeEjecucion(e.value)}
                showClear
                placeholder="Todo el departamento"
                className="w-full"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Se moverá al empleado a este destino y se actualizará el organigrama.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" className="p-button-text" onClick={() => setParaEjecutar(null)} />
            <Button
              label="Confirmar"
              severity="success"
              loading={ejecutando}
              disabled={!deptEjecucion}
              onClick={confirmarEjecucion}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
