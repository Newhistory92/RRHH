'use client';

import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { PublicationCard } from '@/app/Componentes/PortalInicio/PublicationCard';
import { PublicationDetailDialog } from '@/app/Componentes/PortalInicio/PublicationDetailDialog';
import { CalendarWidget } from '@/app/Componentes/PortalInicio/CalendarWidget';
import { UpcomingEventsWidget } from '@/app/Componentes/PortalInicio/UpcomingEventsWidget';
import { FeedFilterBar, type FeedFiltros } from '@/app/Componentes/PortalInicio/FeedFilterBar';
import type { Employee, FeedPublication } from '@/app/Interfas/Interfaces';

interface PortalInicioProps {
  employeeData: Employee | null;
}

const CATEGORIAS_SECCION = [
  'Noticia Institucional', 'Circular', 'Resolución', 'Mantenimiento y Reparaciones',
  'Aviso Importante', 'Evento Institucional', 'Oportunidad Interna',
  'Beneficio para Empleados', 'Comunicación de RRHH',
];

const FILTROS_VACIOS: FeedFiltros = { texto: '', categoria: '', prioridad: '' };

export default function PortalInicio({ employeeData }: PortalInicioProps) {
  const [feedCompleto, setFeedCompleto] = useState<FeedPublication[]>([]);
  const [resultados, setResultados] = useState<FeedPublication[]>([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(false);
  const [seleccionada, setSeleccionada] = useState<FeedPublication | null>(null);

  const [filtros, setFiltros] = useState<FeedFiltros>(FILTROS_VACIOS);
  const [textoDebounced, setTextoDebounced] = useState('');
  const reqId = useRef(0);

  const hayFiltros = textoDebounced.trim() !== '' || filtros.categoria !== '' || filtros.prioridad !== '';

  // Debounce del texto
  useEffect(() => {
    const t = setTimeout(() => setTextoDebounced(filtros.texto), 300);
    return () => clearTimeout(t);
  }, [filtros.texto]);

  // Fetch inicial sin filtros -> feed completo (vista agrupada + sidebar)
  useEffect(() => {
    if (!employeeData?.id) return;
    setCargandoInicial(true);
    apiClient
      .get<{ publications: FeedPublication[] }>(`/publications/feed?employeeId=${employeeData.id}`)
      .then((res) => { setFeedCompleto(res.publications || []); setErrorInicial(false); })
      .catch((err) => { console.error('Error al cargar el feed institucional:', err); setErrorInicial(true); })
      .finally(() => setCargandoInicial(false));
  }, [employeeData?.id]);

  // Fetch filtrado (solo cuando hay filtros activos) -> solo el contenido principal
  useEffect(() => {
    if (!employeeData?.id) return;
    const activo = textoDebounced.trim() !== '' || filtros.categoria !== '' || filtros.prioridad !== '';
    if (!activo) { setResultados([]); setErrorBusqueda(false); return; }

    const params = new URLSearchParams({ employeeId: String(employeeData.id) });
    if (textoDebounced.trim()) params.set('texto', textoDebounced.trim());
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.prioridad) params.set('prioridad', filtros.prioridad);

    const myId = ++reqId.current;
    setBuscando(true);
    apiClient
      .get<{ publications: FeedPublication[] }>(`/publications/feed?${params.toString()}`)
      .then((res) => { if (myId === reqId.current) { setResultados(res.publications || []); setErrorBusqueda(false); } })
      .catch((err) => { if (myId === reqId.current) { console.error('Error en la búsqueda:', err); setErrorBusqueda(true); } })
      .finally(() => { if (myId === reqId.current) setBuscando(false); });
  }, [employeeData?.id, textoDebounced, filtros.categoria, filtros.prioridad]);

  const limpiar = () => { setFiltros(FILTROS_VACIOS); setTextoDebounced(''); };

  // Agrupacion sobre el feed completo (vista por defecto + sidebar)
  const urgentes = feedCompleto.filter((p) => p.prioridad === 'Urgente' || p.fijada);
  const destacadas = feedCompleto.filter((p) => p.destacada && !urgentes.some((u) => u.id === p.id));
  const yaMostradas = new Set([...urgentes, ...destacadas].map((p) => p.id));
  const secciones = CATEGORIAS_SECCION.map((categoria) => ({
    categoria,
    items: feedCompleto.filter((p) => p.categoria === categoria && !yaMostradas.has(p.id)),
  })).filter((s) => s.items.length > 0);

  const ahora = new Date();
  const proximosEventos = feedCompleto
    .filter((p) => p.categoria === 'Evento Institucional' && p.fechaPublicacion && new Date(p.fechaPublicacion) > ahora)
    .sort((a, b) => new Date(a.fechaPublicacion!).getTime() - new Date(b.fechaPublicacion!).getTime())
    .slice(0, 5);

  if (!employeeData) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <p className="text-foreground">Cargando información del empleado...</p>
      </div>
    );
  }

  if (cargandoInicial) {
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

  if (errorInicial) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">No se pudieron cargar las publicaciones.</p>
      </div>
    );
  }

  const sidebar = (
    <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
      <CalendarWidget />
      <UpcomingEventsWidget eventos={proximosEventos} />
    </div>
  );

  return (
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Inicio</h1>
          <p className="text-muted-foreground">Novedades y comunicados institucionales.</p>
        </header>

        <FeedFilterBar
          filtros={filtros}
          onChange={(patch) => setFiltros((f) => ({ ...f, ...patch }))}
          onLimpiar={limpiar}
        />

        {hayFiltros ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {buscando ? (
                <p className="text-sm text-muted-foreground">Buscando…</p>
              ) : errorBusqueda ? (
                <p className="text-sm text-error">Error al buscar. Cambiá los filtros e intentá de nuevo.</p>
              ) : resultados.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <p className="text-muted-foreground mb-3">No se encontraron publicaciones con esos filtros.</p>
                  <button onClick={limpiar} className="text-sm text-primary hover:underline">Limpiar filtros</button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {resultados.length} resultado{resultados.length === 1 ? '' : 's'}
                  </p>
                  {resultados.map((p) => (
                    <PublicationCard key={p.id} publication={p} onClick={() => setSeleccionada(p)} />
                  ))}
                </>
              )}
            </div>
            {sidebar}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {feedCompleto.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">No hay publicaciones por ahora.</p>
                </div>
              ) : (
                <>
                  {urgentes.length > 0 && (
                    <div className="space-y-3">
                      {urgentes.map((p) => (
                        <div key={p.id} className="border-l-4 border-error rounded-xl overflow-hidden">
                          <PublicationCard publication={p} onClick={() => setSeleccionada(p)} />
                        </div>
                      ))}
                    </div>
                  )}

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
                </>
              )}
            </div>
            {sidebar}
          </div>
        )}
      </div>

      <PublicationDetailDialog publication={seleccionada} onHide={() => setSeleccionada(null)} />
    </div>
  );
}
