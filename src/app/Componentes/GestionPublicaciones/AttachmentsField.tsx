'use client';

import React, { useCallback } from 'react';
import { Paperclip, X, FileText } from 'lucide-react';
import { uploadAttachment } from '@/app/util/uploadClient';
import { validarArchivo } from './attachmentValidation';
import type { PublicationAttachment } from '@/app/Interfas/Interfaces';

interface AttachmentsFieldProps {
  attachments: PublicationAttachment[];
  onChange: (list: PublicationAttachment[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsField({ attachments, onChange }: AttachmentsFieldProps) {
  const subir = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files ? Array.from(input.files) : [];
      let actuales = attachments;
      for (const file of files) {
        const error = validarArchivo(file);
        if (error) {
          alert(error);
          continue;
        }
        try {
          const att = await uploadAttachment(file, 'adjunto');
          actuales = [...actuales, att];
          onChange(actuales);
        } catch (e) {
          alert((e as Error).message);
        }
      }
    };
    input.click();
  }, [attachments, onChange]);

  const quitar = (id: number) => onChange(attachments.filter((a) => a.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Archivos adjuntos</label>
        <button
          type="button"
          onClick={subir}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors duration-150"
        >
          <Paperclip size={14} /> Adjuntar
        </button>
      </div>
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin adjuntos.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm text-foreground truncate">
                <FileText size={16} className="text-primary shrink-0" />
                <span className="truncate">{a.fileName}</span>
                <span className="text-xs text-muted-foreground shrink-0">({formatSize(a.sizeBytes)})</span>
              </span>
              <button type="button" onClick={() => quitar(a.id)} className="text-muted-foreground hover:text-error transition-colors duration-150">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
