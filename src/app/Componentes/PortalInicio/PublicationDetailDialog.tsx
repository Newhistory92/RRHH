'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { FileText } from 'lucide-react';
import { CATEGORIA_ICONOS, PRIORIDAD_CLASES, formatFechaRelativa } from './publicationHelpers';
import type { FeedPublication } from '@/app/Interfas/Interfaces';

interface PublicationDetailDialogProps {
  publication: FeedPublication | null;
  onHide: () => void;
}

export function PublicationDetailDialog({ publication, onHide }: PublicationDetailDialogProps) {
  const Icono = publication ? (CATEGORIA_ICONOS[publication.categoria] ?? FileText) : FileText;

  return (
    <Dialog
      header={publication ? publication.titulo : ''}
      visible={!!publication}
      onHide={onHide}
      style={{ width: '40rem' }}
      modal
    >
      {publication && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${PRIORIDAD_CLASES[publication.prioridad] ?? PRIORIDAD_CLASES.Normal}`}>
              {publication.prioridad}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Icono size={14} />
              {publication.categoria}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFechaRelativa(publication.fechaPublicacion ?? publication.createdAt)}
            </span>
          </div>
          {publication.estadoMantenimiento && (
            <p className="text-sm font-semibold text-foreground">
              Estado: <span className="font-normal">{publication.estadoMantenimiento}</span>
            </p>
          )}
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {publication.contenido || publication.resumen || 'Sin contenido adicional.'}
          </div>
        </div>
      )}
    </Dialog>
  );
}
