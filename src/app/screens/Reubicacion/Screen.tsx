"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { Employee } from '@/app/Interfas/Interfaces';

const TIPOS_SOLICITUD = [
  "Cambio de oficina",
  "Cambio de departamento",
  "Reubicación por desarrollo profesional",
  "Reubicación por clima laboral",
  "Reubicación por razones personales",
  "Otra",
];

interface SolicitudReubicacion {
  id: number;
  employeeId: number;
  tipo: string;
  motivo: string;
  estado: string;
  officeIdActual: number | null;
  departmentIdActual: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ReubicacionProps {
  employeeData: Employee | null;
}

const ESTADO_CLASES: Record<string, string> = {
  'Pendiente': 'bg-warning-soft text-warning-soft-foreground border-warning',
  'En análisis': 'bg-primary/15 text-primary border-primary/30',
  'Recomendada': 'bg-primary/15 text-primary border-primary/30',
  'Aprobada': 'bg-success-soft text-success-soft-foreground border-success',
  'Rechazada': 'bg-error-soft text-error-soft-foreground border-error',
  'Ejecutada': 'bg-success-soft text-success-soft-foreground border-success',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function Reubicacion({ employeeData }: ReubicacionProps) {
  const [solicitudes, setSolicitudes] = useState<SolicitudReubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const toast = useRef<Toast>(null);

  const cargarSolicitudes = async () => {
    if (!employeeData?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get<{ solicitudes: SolicitudReubicacion[] }>(
        `/reubicacion/mis-solicitudes/${employeeData.id}`
      );
      setSolicitudes(res.solicitudes);
    } catch (err) {
      console.error('Error al cargar solicitudes de reubicacion:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeData?.id]);

  const handleSubmit = async () => {
    if (!employeeData?.id || !tipo || !motivo.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Campos incompletos', detail: 'Seleccioná un tipo y escribí el motivo.', life: 3000 });
      return;
    }
    setEnviando(true);
    try {
      await apiClient.post('/reubicacion/request', {
        employeeId: employeeData.id,
        tipo,
        motivo: motivo.trim(),
      });
      toast.current?.show({ severity: 'success', summary: 'Enviado', detail: 'Solicitud de reubicación creada correctamente', life: 3000 });
      setTipo(null);
      setMotivo('');
      await cargarSolicitudes();
    } catch (err) {
      console.error('Error al crear solicitud de reubicacion:', err);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la solicitud', life: 4000 });
    } finally {
      setEnviando(false);
    }
  };

  if (!employeeData) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando datos del empleado...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="mb-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <ArrowLeftRight className="text-primary" />
            Solicitudes de Reubicación
          </h1>
          <p className="text-muted-foreground">
            Solicitá un cambio de oficina, departamento, o una reubicación por otro motivo.
          </p>
        </header>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Nueva Solicitud</h2>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Tipo de solicitud</label>
            <Dropdown
              value={tipo}
              options={TIPOS_SOLICITUD}
              onChange={(e) => setTipo(e.value)}
              placeholder="Seleccioná un tipo"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Motivo</label>
            <InputTextarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full"
              placeholder="Contanos el motivo de tu solicitud..."
            />
          </div>
          <Button
            label="Enviar Solicitud"
            icon="pi pi-send"
            onClick={handleSubmit}
            disabled={enviando || !tipo || !motivo.trim()}
            className="w-full py-3"
          />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Mis Solicitudes</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : solicitudes.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">Todavía no creaste ninguna solicitud de reubicación.</p>
          ) : (
            <ul className="space-y-3">
              {solicitudes.map((s) => (
                <li key={s.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground text-sm">{s.tipo}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${ESTADO_CLASES[s.estado] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {s.estado}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.motivo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(s.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
