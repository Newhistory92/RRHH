'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { PublicationCard } from '@/app/Componentes/PortalInicio/PublicationCard';
import { PublicationDetailDialog } from '@/app/Componentes/PortalInicio/PublicationDetailDialog';
import { CalendarWidget } from '@/app/Componentes/PortalInicio/CalendarWidget';
import { UpcomingEventsWidget } from '@/app/Componentes/PortalInicio/UpcomingEventsWidget';
import type { Employee, FeedPublication } from '@/app/Interfas/Interfaces';

interface PortalInicioProps {
  employeeData: Employee | null;
}

const CATEGORIAS_SECCION = [
  'Circular',
  'Resolución',
  'Mantenimiento y Reparaciones',
  'Noticia Institucional',
  'Oportunidad Interna',
  'Beneficio para Empleados',
  'Comunicación de RRHH',
];

export default function PortalInicio({ employeeData }: PortalInicioProps) {
  const [publicaciones, setPublicaciones] = useState<FeedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [seleccionada, setSeleccionada] = useState<FeedPublication | null>(null);

  useEffect(() => {
    if (!employeeData?.id) return;
    setLoading(true);
    apiClient
      .get<{ publications: FeedPublication[] }>(`/publications/feed?employeeId=${employeeData.id}`)
      .then((res) => {
        setPublicaciones(res.publications || []);
        setError(false);
      })
      .catch((err) => {
        console.error('Error al cargar el feed institucional:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [employeeData?.id]);

  const urgentes = publicaciones.filter((p) => p.prioridad === 'Urgente' || p.fijada);
  const destacadas = publicaciones.filter(
    (p) => p.destacada && !urgentes.some((u) => u.id === p.id)
  );
  const yaMostradas = new Set([...urgentes, ...destacadas].map((p) => p.id));

  const secciones = CATEGORIAS_SECCION.map((categoria) => ({
    categoria,
    items: publicaciones.filter((p) => p.categoria === categoria && !yaMostradas.has(p.id)),
  })).filter((s) => s.items.length > 0);

  const ahora = new Date();
  const proximosEventos = publicaciones
    .filter(
      (p) =>
        p.categoria === 'Evento Institucional' &&
        p.fechaPublicacion &&
        new Date(p.fechaPublicacion) > ahora
    )
    .sort((a, b) => new Date(a.fechaPublicacion!).getTime() - new Date(b.fechaPublicacion!).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">No se pudieron cargar las publicaciones.</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Inicio</h1>
          <p className="text-muted-foreground">Novedades y comunicados institucionales.</p>
        </header>

        {urgentes.length > 0 && (
          <div className="space-y-3">
            {urgentes.map((p) => (
              <div key={p.id} className="border-l-4 border-error rounded-xl overflow-hidden">
                <PublicationCard publication={p} onClick={() => setSeleccionada(p)} />
              </div>
            ))}
          </div>
        )}

        {publicaciones.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No hay publicaciones por ahora.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {destacadas.length > 0 && (
                <section>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-3">Destacadas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destacadas.map((p) => (
                      <PublicationCard key={p.id} publication={p} onClick={() => setSeleccionada(p)} />
                    ))}
                  </div>
                </section>
              )}

              {secciones.map(({ categoria, items }) => (
                <section key={categoria}>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-3">{categoria}</h2>
                  <div className="space-y-3">
                    {items.map((p) => (
                      <PublicationCard key={p.id} publication={p} onClick={() => setSeleccionada(p)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <CalendarWidget />
              <UpcomingEventsWidget eventos={proximosEventos} />
            </div>
          </div>
        )}
      </div>

      <PublicationDetailDialog publication={seleccionada} onHide={() => setSeleccionada(null)} />
    </div>
  );
}
