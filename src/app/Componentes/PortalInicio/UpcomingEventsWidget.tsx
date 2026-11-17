'use client';

import React from 'react';
import { CalendarClock } from 'lucide-react';
import type { FeedPublication } from '@/app/Interfas/Interfaces';

interface UpcomingEventsWidgetProps {
  eventos: FeedPublication[];
  onSelect: (publicacion: FeedPublication) => void;
}

export function UpcomingEventsWidget({ eventos, onSelect }: UpcomingEventsWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
      <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <CalendarClock size={16} className="text-primary" />
        Próximos eventos
      </h3>
      {eventos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay eventos próximos.</p>
      ) : (
        // Son la misma FeedPublication que las tarjetas del feed principal,
        // que sí se pueden abrir: sin esto, el mismo dato se comportaba
        // distinto segun donde apareciera en la pantalla.
        <ul className="space-y-1">
          {eventos.map((ev) => (
            <li key={ev.id}>
              <button
                onClick={() => onSelect(ev)}
                className="w-full rounded-lg px-2 py-1.5 -mx-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="font-medium text-foreground truncate">{ev.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {ev.fechaPublicacion
                    ? new Date(ev.fechaPublicacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                    : ''}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
