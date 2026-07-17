// util/uploadClient.ts
// Subida de archivos multipart al backend. Separado de apiClient porque
// este ultimo fuerza Content-Type JSON; en multipart el browser debe
// setear el boundary. Inyecta el mismo Bearer token de localStorage.

import type { PublicationAttachment } from '@/app/Interfas/Interfaces';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

/** Resuelve una URL de adjunto (relativa, ej. "/uploads/publications/x.jpg")
 * contra el origen del backend, para que <img>/<video>/<a href> la carguen
 * del servidor correcto en vez de resolverla contra el origen del frontend. */
export function resolveAttachmentUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

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
