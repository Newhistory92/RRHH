"use client"
import { BarChart, User, RefreshCw } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { apiClient } from '@/app/util/apiClient';
import { FeedbackTab, SiguienteFeedback, FeedbackStatus } from '@/app/Componentes/Encuesta/FeedbackTab';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export default function FeedbackPage() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [siguiente, setSiguiente] = useState<SiguienteFeedback | null>(null);
  const [status, setStatus] = useState<FeedbackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('No hay sesión activa. Iniciá sesión primero.');
      setLoading(false);
      return;
    }
    fetch(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.employeeId) {
          setEmployeeId(data.employeeId);
        } else {
          setError('Tu usuario no tiene un empleado asociado.');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('No se pudo obtener la sesión. Recargá la página.');
        setLoading(false);
      });
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const [siguienteRes, statusRes] = await Promise.all([
        apiClient.get<SiguienteFeedback>(`/feedback/siguiente/${employeeId}`),
        apiClient.get<{ evaluatorId: number; periodo: string; total: number; completadas: number }>(`/feedback/status/${employeeId}`),
      ]);
      setSiguiente(siguienteRes);
      setStatus({ total: statusRes.total, completadas: statusRes.completadas });
    } catch (e) {
      setError('No se pudieron cargar las evaluaciones pendientes. Intentá nuevamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleSubmit = async (valorEscala: number | null, textoLibre: string | null) => {
    if (!employeeId || !siguiente?.pregunta) return;
    try {
      await apiClient.post('/feedback/submit', {
        evaluadorId: employeeId,
        evaluadoId: siguiente.evaluado?.id ?? null,
        preguntaId: siguiente.pregunta.id,
        valorEscala,
        textoLibre,
      });
      toast.current?.show({ severity: 'success', summary: 'Enviado', detail: 'Feedback registrado correctamente', life: 3000 });
      await cargarDatos();
    } catch (e) {
      console.error(e);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el feedback', life: 4000 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 text-primary animate-spin" size={48} />
          <p className="text-muted-foreground text-lg">Cargando evaluaciones pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center bg-card p-8 rounded-xl shadow-md max-w-md">
          <User className="mx-auto mb-4 text-error" size={48} />
          <p className="text-error font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Sistema de Feedback 360°</h1>
          <p className="text-lg text-muted-foreground">
            Evaluá a tus compañeros y a tu superior directo de forma anónima.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <FeedbackTab
              siguiente={siguiente}
              status={status}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="space-y-6">
            <Card title={
              <div className="flex items-center">
                <BarChart className="mr-2 text-primary" />
                <span>Tu progreso</span>
              </div>
            }>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground italic">
                  Las evaluaciones son anónimas. Solo el sistema registra los conteos generales.
                </div>
                <button
                  onClick={cargarDatos}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary/15 text-primary rounded-lg hover:bg-primary/20 transition-colors border border-primary/30"
                >
                  <RefreshCw size={14} />
                  Recargar
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
