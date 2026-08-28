// util/uploadClient.ts
// Subida de archivos multipart al backend. Separado de apiClient porque
// este ultimo fuerza Content-Type JSON; en multipart el browser debe
// setear el boundary. Inyecta el mismo Bearer token de localStorage.

import type { PublicationAttachment } from '@/app/Interfas/Interfaces';
import { getBackendUrl } from '@/app/util/backendUrl';

const BACKEND_URL = getBackendUrl();

/** Resuelve una URL de adjunto (relativa, ej. "/uploads/publications/x.jpg")
 * contra el origen del backend, para que <img>/<video>/<a href> la carguen
 * del servidor correcto en vez de resolverla contra el origen del frontend. */
export function resolveAttachmentUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Reescribe dentro de un string de HTML cualquier src/href relativo que
 * apunte a /uploads/... para que resuelva contra el backend. Necesario
 * para contenido guardado ANTES de que las inserciones nuevas empezaran
 * a hornear la URL absoluta directamente (ver resolveAttachmentUrl) --
 * asi el contenido viejo se autocorrige al mostrarse, sin re-subir nada. */
export function resolveUploadsInHtml(html: string): string {
  if (!html) return html;
  return html.replace(
    /(src|href)="(\/uploads\/[^"]*)"/g,
    (_match, attr: string, path: string) => `${attr}="${BACKEND_URL}${path}"`
  );
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

export async function reportarDano(
  activoId: number,
  descripcion: string,
  foto: File | null
): Promise<{ message: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const form = new FormData();
  form.append('descripcion', descripcion);
  if (foto) form.append('foto', foto);

  const res = await fetch(`${BACKEND_URL}/activos/${activoId}/danos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Error al reportar el daño (${res.status})`);
  }
  return res.json();
}
