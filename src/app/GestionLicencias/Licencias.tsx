"use client";
// Componente "Mis Licencias" — Muestra:
// 1. Saldos desglosados por tipo (diasTotales, consumidos, disponibles)
// 2. Historial completo de TODAS las solicitudes del empleado
// 3. Panel de pendientes de aprobación (solo para supervisores)

import React, { useState, useMemo } from 'react';
import { Users, Send, Briefcase, Award, GraduationCap, Clock, ChevronRight, MessageSquare, Plus, CalendarRange, FileText, Heart, Baby, AlertTriangle } from 'lucide-react';
import { ApprovalModal } from './ModalProval';
import { LicenseHistory, Saldo, LicenseStatus, Usuario, Employee } from "@/app/Interfas/Interfaces";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SolicitudParsed = LicenseHistory & { desde: Date; hasta: Date };

interface Props {
  userData: Employee;
  saldos: Saldo[];
  misSolicitudes: LicenseHistory[];
  solicitudesPendientes: LicenseHistory[];
  onNewRequest: () => void;
  onManageRequest: (id: number | undefined, accion: "aprobar" | "rechazar", data: { siguienteSupervisorId?: number; observacion?: string }) => void;
  supervisores: Usuario[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS: Record<LicenseStatus, { cls: string; label: string }> = {
  'Pendiente': { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pendiente' },
  'Pendiente Siguiente Aprobación': { cls: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'En revisión' },
  'Aprobada': { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Aprobada' },
  'Rechazada': { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Rechazada' },
};

// Mapa de íconos dinámico por tipo de licencia
const ICONOS: Record<string, React.ReactNode> = {
  Licencias: <Briefcase size={14} className="text-cyan-500" />,
  Vacaciones: <Briefcase size={14} className="text-cyan-500" />,
  Particulares: <Users size={14} className="text-cyan-500" />,
  Particular: <Users size={14} className="text-cyan-500" />,
  Articulos: <Award size={14} className="text-cyan-500" />,
  Examen: <GraduationCap size={14} className="text-cyan-500" />,
  'Lic por Examen': <GraduationCap size={14} className="text-cyan-500" />,
  Estudio: <GraduationCap size={14} className="text-cyan-500" />,
  Nacimiento: <Baby size={14} className="text-cyan-500" />,
  Paternidad: <Baby size={14} className="text-cyan-500" />,
  Maternidad: <Heart size={14} className="text-pink-500" />,
  Embarazo: <Heart size={14} className="text-pink-500" />,
  'Matrimonio del empleado': <Heart size={14} className="text-red-400" />,
  'Matrimonio de su hijo': <Heart size={14} className="text-red-400" />,
  Enfermedad: <AlertTriangle size={14} className="text-amber-500" />,
  'Lic por Enfermedad': <AlertTriangle size={14} className="text-amber-500" />,
  LAR: <Clock size={14} className="text-gray-500" />,
};

const getIcon = (tipo: string) => ICONOS[tipo] || <FileText size={14} className="text-cyan-500" />;

const fmt = (d: string | Date) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const StatusChip = ({ status, observacion }: { status: LicenseStatus; observacion?: string }) => {
  const s = STATUS[status];
  return (
    <span title={observacion} className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
      {icon}
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConteinerLicencia({ userData, saldos, misSolicitudes, solicitudesPendientes, onNewRequest, onManageRequest, supervisores }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<LicenseHistory | null>(null);
  console.log("saldos", saldos);
  const pendientes = useMemo<SolicitudParsed[]>(() =>
    solicitudesPendientes.map(s => ({ ...s, desde: new Date(s.startDate), hasta: new Date(s.endDate) })),
    [solicitudesPendientes],
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto">

      {selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          supervisores={supervisores.filter(s =>
            s.id !== userData.id && !selectedRequest.aprobaciones?.some(a => a.supervisorId === s.id)
          )}
          onManage={onManageRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* ── Fila superior: saldos + nueva solicitud ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Saldos desglosados por tipo de licencia */}
        <div className="lg:col-span-2">
          <Section title="Mis Licencias — Saldo por Tipo" icon={<CalendarRange size={15} className="text-cyan-500" />}>
            {!saldos ? (
              <div className="flex justify-center py-6">
                <span className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-cyan-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(saldos).map(([anio, valores]) => (
                  <details key={anio} className="group rounded-lg border border-gray-100 overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-100 transition list-none">
                      Año {anio}
                      <ChevronRight size={14} className="text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 py-3">
                      {Object.entries(valores).map(([tipo, datos]) => {
                        // datos puede ser un objeto { diasTotales, consumidos, disponibles } o un número simple
                        const esObjeto = typeof datos === 'object' && datos !== null && 'diasTotales' in datos;
                        const diasTotales = esObjeto ? (datos as any).diasTotales : (datos as number);
                        const consumidos = esObjeto ? (datos as any).consumidos : 0;
                        const disponibles = esObjeto ? (datos as any).disponibles : (datos as number);
                        const porcentaje = diasTotales > 0 ? (consumidos / diasTotales) * 100 : 0;

                        return (
                          <div key={tipo} className="border border-gray-100 rounded-xl p-3 hover:border-cyan-200 transition">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              {getIcon(tipo)}
                              <span className="font-medium truncate">{tipo}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                              <p className="text-xl font-bold text-cyan-600">{disponibles}</p>
                              <span className="text-[10px] text-gray-400">/ {diasTotales} días</span>
                            </div>
                            {/* Barra de consumo */}
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(porcentaje, 100)}%`,
                                  backgroundColor: porcentaje > 80 ? '#ef4444' : porcentaje > 50 ? '#f59e0b' : '#06b6d4'
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {consumidos > 0 ? `${consumidos} consumidos` : 'Sin consumo'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Nueva solicitud */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 flex flex-col items-center justify-center text-center text-white shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Plus size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Nueva Solicitud</h3>
          <p className="text-xs text-cyan-100 mb-4">Iniciá tu solicitud de licencia</p>
          <button
            onClick={onNewRequest}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-cyan-600 text-xs font-semibold rounded-full hover:bg-cyan-50 transition shadow-sm"
          >
            <Send size={13} />
            Solicitar
          </button>
        </div>
      </div>

      {/* ── Pendientes de aprobación (solo para superiores asignados dinámicamente) ── */}
      {pendientes.length > 0 && (
        <Section title="Pendientes de Mi Aprobación" icon={<Clock size={15} className="text-amber-500" />}>
          <div className="space-y-2">
            {pendientes.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedRequest(s)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/50 transition group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {s.name} · <span className="text-cyan-600">{s.type}</span> · {s.duration} días
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt(s.desde)} → {fmt(s.hasta)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-cyan-500 transition" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ── Historial completo de solicitudes ── */}
      <Section title="Historial de Solicitudes">
        {misSolicitudes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tenés solicitudes registradas.</p>
        ) : (
          <div className="space-y-2">
            {misSolicitudes.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {getIcon(s.type)}
                    <p className="text-sm font-semibold text-gray-800">
                      {s.duration} días · {s.type}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {fmt(s.startDate)} → {fmt(s.endDate)}
                  </p>
                  {s.status === 'Rechazada' && s.observacion && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <MessageSquare size={11} />
                      {s.observacion}
                    </p>
                  )}
                </div>
                <StatusChip status={s.status} observacion={s.observacion} />
              </div>
            ))}
          </div>
        )}
      </Section>

    </div>
  );
}