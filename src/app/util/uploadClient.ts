// util/uploadClient.ts
// Subida de archivos multipart al backend. Separado de apiClient porque
// este ultimo fuerza Content-Type JSON; en multipart el browser debe
// setear el boundary. Inyecta el mismo Bearer token de localStorage.

import type { PublicationAttachment } from '@/app/Interfas/Interfaces';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function uploadAttachment(
  file: File,
  rol: 'inline' | 'adjunto'
): Promise<PublicationAttachment> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const form = new FormData();
  form.append('file', file);
  form.append('rol', rol);

  const res = await fetch(`${BACKEND_URL}/publications/attachments`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Error al subir (${res.status})`);
  }
  return res.json();
}
