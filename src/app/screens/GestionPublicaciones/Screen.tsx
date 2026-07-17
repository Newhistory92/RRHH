'use client';

import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { RichTextEditor } from '@/app/Componentes/GestionPublicaciones/RichTextEditor';
import { AttachmentsField } from '@/app/Componentes/GestionPublicaciones/AttachmentsField';
import { PublicationsFilterBar, type AdminFiltros } from '@/app/Componentes/GestionPublicaciones/PublicationsFilterBar';
import type {
  PublicationAdminRow, PublicationEditData, PublicationAttachment, PublicationTargetInput,
} from '@/app/Interfas/Interfaces';
import { Plus, ArrowLeft } from 'lucide-react';

const CATEGORIAS = [
  'Noticia Institucional', 'Circular', 'Resolución', 'Mantenimiento y Reparaciones',
  'Aviso Importante', 'Evento Institucional', 'Oportunidad Interna',
  'Beneficio para Empleados', 'Comunicación de RRHH',
];
const PRIORIDADES = ['Baja', 'Normal', 'Alta', 'Urgente'];
const ESTADOS_MANT = ['Programado', 'En curso', 'Completado', 'Suspendido', 'Reprogramado'];
const CAT_MANTENIMIENTO = 'Mantenimiento y Reparaciones';

/** Convierte el string UTC (sin 'Z', ej. "2026-07-17T10:56:00") que devuelve
 * el backend a un valor local apto para <input type="datetime-local">. */
function utcIsoToLocalInputValue(utcIso: string | null): string {
  if (!utcIso) return '';
  const conZ = utcIso.endsWith('Z') ? utcIso : `${utcIso}Z`;
  const d = new Date(conZ);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convierte el valor local de <input type="datetime-local"> (ej.
 * "2026-07-17T07:56", sin timezone) a un ISO UTC real para mandar al backend. */
function localInputValueToUtcIso(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

interface DeptOption { id: number; nombre: string; offices: { id: number; nombre: string }[]; }

const EMPTY_FORM = {
  titulo: '', resumen: '', contenido: '', categoria: 'Noticia Institucional',
  prioridad: 'Normal', esBorrador: true, destacada: false, fijada: false,
  fechaPublicacion: '', fechaExpiracion: '',
};

const FILTROS_VACIOS: AdminFiltros = { texto: '', categoria: '', prioridad: '', estado: '', fechaDesde: '', fechaHasta: '' };

export default function GestionPublicaciones() {
  const [modo, setModo] = useState<'lista' | 'form'>('lista');
  const [rows, setRows] = useState<PublicationAdminRow[]>([]);
  const [depts, setDepts] = useState<DeptOption[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [estadoMant, setEstadoMant] = useState('');
  const [contenido, setContenido] = useState('');
  const [attachments, setAttachments] = useState<PublicationAttachment[]>([]);
  const [inlineIds, setInlineIds] = useState<number[]>([]);
  const [targetInstitucion, setTargetInstitucion] = useState(false);
  const [targetDeptIds, setTargetDeptIds] = useState<number[]>([]);
  const [targetOfficeIds, setTargetOfficeIds] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState<AdminFiltros>(FILTROS_VACIOS);
  const [textoDebounced, setTextoDebounced] = useState('');
  const [refetchTick, setRefetchTick] = useState(0);
  const reqId = useRef(0);

  useEffect(() => {
    apiClient
      .get<{ departments: DeptOption[] }>('/departments/')
      .then((res) => setDepts(res.departments || []))
      .catch((e) => console.error('Error al cargar organigrama:', e));
  }, []);

  // Debounce del texto
  useEffect(() => {
    const t = setTimeout(() => setTextoDebounced(filtros.texto), 300);
    return () => clearTimeout(t);
  }, [filtros.texto]);

  // Carga de la lista segun filtros (y refetch tras guardar)
  useEffect(() => {
    const params = new URLSearchParams();
    if (textoDebounced.trim()) params.set('texto', textoDebounced.trim());
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.prioridad) params.set('prioridad', filtros.prioridad);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);
    const qs = params.toString();
    const myId = ++reqId.current;
    apiClient
      .get<{ publications: PublicationAdminRow[] }>(`/publications${qs ? `?${qs}` : ''}`)
      .then((res) => { if (myId === reqId.current) setRows(res.publications || []); })
      .catch((e) => { if (myId === reqId.current) console.error('Error al listar publicaciones:', e); });
  }, [textoDebounced, filtros.categoria, filtros.prioridad, filtros.estado, filtros.fechaDesde, filtros.fechaHasta, refetchTick]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEstadoMant('');
    setContenido('');
    setAttachments([]);
    setInlineIds([]);
    setTargetInstitucion(false);
    setTargetDeptIds([]);
    setTargetOfficeIds([]);
    setError('');
  };

  const nuevaPublicacion = () => {
    resetForm();
    setEditId(null);
    setModo('form');
  };

  const editarPublicacion = async (id: number) => {
    resetForm();
    try {
      const p = await apiClient.get<PublicationEditData>(`/publications/${id}`);
      setForm({
        titulo: p.titulo, resumen: p.resumen || '', contenido: p.contenido || '',
        categoria: p.categoria, prioridad: p.prioridad, esBorrador: p.esBorrador,
        destacada: p.destacada, fijada: p.fijada,
        fechaPublicacion: utcIsoToLocalInputValue(p.fechaPublicacion),
        fechaExpiracion: utcIsoToLocalInputValue(p.fechaExpiracion),
      });
      setEstadoMant(p.estadoMantenimiento || '');
      setContenido(p.contenido || '');
      setAttachments(p.adjuntos || []);
      setInlineIds([]);
      setTargetInstitucion(p.targets.some((t) => t.scope === 'institucion'));
      setTargetDeptIds(p.targets.filter((t) => t.scope === 'departamento').map((t) => t.departmentId!).filter(Boolean));
      setTargetOfficeIds(p.targets.filter((t) => t.scope === 'oficina').map((t) => t.officeId!).filter(Boolean));
      setEditId(id);
      setModo('form');
    } catch (e) {
      console.error('Error al cargar publicación:', e);
      setError('No se pudo cargar la publicación. Intentá de nuevo.');
    }
  };

  const buildTargets = (): PublicationTargetInput[] => {
    const targets: PublicationTargetInput[] = [];
    if (targetInstitucion) targets.push({ scope: 'institucion' });
    targetDeptIds.forEach((id) => targets.push({ scope: 'departamento', departmentId: id }));
    targetOfficeIds.forEach((id) => targets.push({ scope: 'oficina', officeId: id }));
    return targets;
  };

  const guardar = async () => {
    setError('');
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return; }
    const targets = buildTargets();
    if (targets.length === 0) { setError('Indicá al menos un destino.'); return; }

    const attachmentIds = [...attachments.map((a) => a.id), ...inlineIds];
    const payload = {
      ...form,
      contenido,
      estadoMantenimiento: form.categoria === CAT_MANTENIMIENTO ? (estadoMant || null) : null,
      fechaPublicacion: localInputValueToUtcIso(form.fechaPublicacion),
      fechaExpiracion: localInputValueToUtcIso(form.fechaExpiracion),
      targets,
      attachmentIds,
    };

    setGuardando(true);
    try {
      if (editId) {
        await apiClient.put(`/publications/${editId}`, payload);
      } else {
        await apiClient.post('/publications', payload);
      }
      setRefetchTick((t) => t + 1);
      setModo('lista');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const toggleId = (list: number[], id: number, setter: (v: number[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  if (modo === 'lista') {
    return (
      <div className="bg-background min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Gestión de Publicaciones</h1>
              <p className="text-muted-foreground">Creá y editá los comunicados institucionales.</p>
            </div>
            <button onClick={nuevaPublicacion} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-150">
              <Plus size={18} /> Nueva publicación
            </button>
          </header>

          <PublicationsFilterBar
            filtros={filtros}
            onChange={(patch) => setFiltros((f) => ({ ...f, ...patch }))}
            onLimpiar={() => { setFiltros(FILTROS_VACIOS); setTextoDebounced(''); }}
          />

          <p className="text-sm text-muted-foreground">
            {rows.length} publicaci{rows.length === 1 ? 'ón' : 'ones'}
          </p>

          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            {rows.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">
                No se encontraron publicaciones con esos filtros.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-background text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Título</th>
                    <th className="text-left font-medium px-4 py-3">Categoría</th>
                    <th className="text-left font-medium px-4 py-3">Estado</th>
                    <th className="text-left font-medium px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} onClick={() => editarPublicacion(r.id)} className="border-t border-border hover:bg-muted cursor-pointer">
                      <td className="px-4 py-3 text-foreground">{r.titulo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.categoria}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.estado}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.fechaPublicacion ? new Date(r.fechaPublicacion).toLocaleDateString('es-AR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setModo('lista')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {editId ? 'Editar publicación' : 'Nueva publicación'}
        </h1>

        {error && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{error}</div>}

        <div className="space-y-4 bg-card border border-border rounded-xl shadow-soft p-4 sm:p-6">
          <div>
            <label className="text-sm font-semibold text-foreground">Título</label>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Resumen</label>
            <input value={form.resumen} onChange={(e) => setForm({ ...form, resumen: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Prioridad</label>
              <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {form.categoria === CAT_MANTENIMIENTO && (
            <div>
              <label className="text-sm font-semibold text-foreground">Estado de mantenimiento</label>
              <select value={estadoMant} onChange={(e) => setEstadoMant(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="">— Sin estado —</option>
                {ESTADOS_MANT.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-foreground">Contenido</label>
            <div className="mt-1">
              <RichTextEditor value={contenido} onChange={setContenido} onInlineUploaded={(id) => setInlineIds((prev) => [...prev, id])} />
            </div>
          </div>

          <AttachmentsField attachments={attachments} onChange={setAttachments} />

          <div>
            <label className="text-sm font-semibold text-foreground">Destinos</label>
            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={targetInstitucion} onChange={(e) => setTargetInstitucion(e.target.checked)} />
                Toda la institución
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Departamentos</p>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                    {depts.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                        <input type="checkbox" checked={targetDeptIds.includes(d.id)} onChange={() => toggleId(targetDeptIds, d.id, setTargetDeptIds)} />
                        {d.nombre}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Oficinas</p>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                    {depts.flatMap((d) => d.offices.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 text-sm text-foreground">
                        <input type="checkbox" checked={targetOfficeIds.includes(o.id)} onChange={() => toggleId(targetOfficeIds, o.id, setTargetOfficeIds)} />
                        {d.nombre} / {o.nombre}
                      </label>
                    )))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Fecha de publicación</label>
              <input type="datetime-local" value={form.fechaPublicacion} onChange={(e) => setForm({ ...form, fechaPublicacion: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Fecha de expiración</label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mt-1 mb-1">
                <input
                  type="checkbox"
                  checked={form.fechaExpiracion === ''}
                  onChange={(e) => setForm({ ...form, fechaExpiracion: e.target.checked ? '' : form.fechaExpiracion })}
                />
                Permanente (no expira nunca)
              </label>
              <input
                type="datetime-local"
                value={form.fechaExpiracion}
                disabled={form.fechaExpiracion === ''}
                onChange={(e) => setForm({ ...form, fechaExpiracion: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.destacada} onChange={(e) => setForm({ ...form, destacada: e.target.checked })} /> Destacada</label>
            <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.fijada} onChange={(e) => setForm({ ...form, fijada: e.target.checked })} /> Fijada</label>
            <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.esBorrador} onChange={(e) => setForm({ ...form, esBorrador: e.target.checked })} /> Guardar como borrador</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModo('lista')} className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors duration-150">Cancelar</button>
            <button onClick={guardar} disabled={guardando} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-150 disabled:opacity-50">
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
