'use client';

import React from 'react';
import { CalendarClock } from 'lucide-react';
import type { FeedPublication } from '@/app/Interfas/Interfaces';

interface UpcomingEventsWidgetProps {
  eventos: FeedPublication[];
}

export function UpcomingEventsWidget({ eventos }: UpcomingEventsWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
      <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <CalendarClock size={16} className="text-primary" />
        Próximos eventos
      </h3>
      {eventos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay eventos próximos.</p>
      ) : (
        <ul className="space-y-3">
          {eventos.map((ev) => (
            <li key={ev.id} className="text-sm">
              <p className="font-medium text-foreground truncate">{ev.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {ev.fechaPublicacion
                  ? new Date(ev.fechaPublicacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
