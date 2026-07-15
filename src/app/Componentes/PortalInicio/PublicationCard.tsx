'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { CATEGORIA_ICONOS, PRIORIDAD_CLASES, formatFechaRelativa } from './publicationHelpers';
import type { FeedPublication } from '@/app/Interfas/Interfaces';

interface PublicationCardProps {
  publication: FeedPublication;
  onClick: () => void;
}

export function PublicationCard({ publication, onClick }: PublicationCardProps) {
  const Icono = CATEGORIA_ICONOS[publication.categoria] ?? FileText;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icono size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${PRIORIDAD_CLASES[publication.prioridad] ?? PRIORIDAD_CLASES.Normal}`}>
              {publication.prioridad}
            </span>
            <span className="text-xs text-muted-foreground">{publication.categoria}</span>
          </div>
          <h3 className="font-heading font-semibold text-foreground truncate">{publication.titulo}</h3>
          {publication.resumen && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{publication.resumen}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatFechaRelativa(publication.fechaPublicacion ?? publication.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}
