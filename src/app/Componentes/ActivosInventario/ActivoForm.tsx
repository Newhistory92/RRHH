'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import type { ActivoDetalle, ActivoCategoria, ActivoFabricante, ActivoEstado, PCPart } from '@/app/Interfas/Interfaces';
import { Search, Package } from 'lucide-react';

interface DeptOption { id: number; nombre: string; offices: { id: number; nombre: string }[]; }
interface EmpOption { id: number; name: string; }

interface ActivoFormProps {
  activo: ActivoDetalle | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

const RESP_TIPOS = [
  { value: '', label: 'Sin asignar' },
  { value: 'empleado', label: 'Empleado' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'departamento', label: 'Departamento' },
];

/** Convierte el JSON crudo de specs de PCParts en una descripcion legible
 * linea por linea (una entrada por clave), sin necesidad de conocer el
 * esquema especifico de cada una de las 25 categorias del dataset. */
function formatearSpecs(specsJson: string | null): string {
  if (!specsJson) return '';
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(specsJson);
  } catch {
    return specsJson;
  }
  const etiqueta = (clave: string) =>
    clave
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatearValor = (v: unknown): string | null => {
    if (v === null || v === undefined || v === '') return null;
    if (Array.isArray(v)) {
      if (v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number') return `${v[0]} - ${v[1]}`;
      return v.map((x) => String(x)).join(', ');
    }
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  };
  return Object.entries(obj)
    .map(([clave, v]) => {
      const valor = formatearValor(v);
      return valor !== null ? `${etiqueta(clave)}: ${valor}` : null;
    })
    .filter((linea): linea is string => linea !== null)
    .join('\n');
}

export function ActivoForm({ activo, onGuardado, onCancelar }: ActivoFormProps) {
  const [categorias, setCategorias] = useState<ActivoCategoria[]>([]);
  const [fabricantes, setFabricantes] = useState<ActivoFabricante[]>([]);
  const [estados, setEstados] = useState<ActivoEstado[]>([]);
  const [depts, setDepts] = useState<DeptOption[]>([]);
  const [empleados, setEmpleados] = useState<EmpOption[]>([]);

  const [f, setF] = useState({
    numeroInventario: activo?.numeroInventario ?? '',
    nombre: activo?.nombre ?? '',
    categoriaId: activo?.categoriaId ? String(activo.categoriaId) : '',
    fabricanteId: activo?.fabricanteId ? String(activo.fabricanteId) : '',
    estadoId: activo?.estadoId ? String(activo.estadoId) : '',
    fechaAlta: activo?.fechaAlta ? activo.fechaAlta.slice(0, 10) : '',
    anio: activo?.anio != null ? String(activo.anio) : '',
    observaciones: activo?.observaciones ?? '',
    imagenReferencial: activo?.imagenReferencial ?? '',
    numeroSerie: activo?.numeroSerie ?? '',
    codigoBarras: activo?.codigoBarras ?? '',
    codigoQR: activo?.codigoQR ?? '',
    responsableTipo: activo?.responsableTipo ?? '',
    responsableEmpleadoId: activo?.responsableEmpleadoId ? String(activo.responsableEmpleadoId) : '',
    responsableOficinaId: activo?.responsableOficinaId ? String(activo.responsableOficinaId) : '',
    responsableDepartamentoId: activo?.responsableDepartamentoId ? String(activo.responsableDepartamentoId) : '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [pcpartQuery, setPcpartQuery] = useState('');
  const [pcpartResults, setPcpartResults] = useState<PCPart[]>([]);
  const [pcpartAbierto, setPcpartAbierto] = useState(false);

  useEffect(() => {
    apiClient.get<{ categorias: ActivoCategoria[] }>('/activos/config/categorias').then((r) => setCategorias(r.categorias || [])).catch(() => {});
    apiClient.get<{ fabricantes: ActivoFabricante[] }>('/activos/config/fabricantes').then((r) => setFabricantes(r.fabricantes || [])).catch(() => {});
    apiClient.get<{ estados: ActivoEstado[] }>('/activos/config/estados').then((r) => setEstados(r.estados || [])).catch(() => {});
    apiClient.get<{ departments: DeptOption[] }>('/departments/').then((r) => setDepts(r.departments || [])).catch(() => {});
    apiClient.get<{ employees: EmpOption[] }>('/rrhh/employees').then((r) => setEmpleados(r.employees || [])).catch(() => {});
  }, []);

  const categoriaSel = categorias.find((c) => String(c.id) === f.categoriaId);
  const serieObligatoria = categoriaSel?.requiereSerie ?? false;
  const montablePC = categoriaSel?.montableEnPC ?? false;
  const nombreCategoria = categoriaSel?.nombre ?? '';

  useEffect(() => {
    if (!montablePC) { setPcpartResults([]); return; }
    const q = pcpartQuery.trim();
    const t = setTimeout(() => {
      apiClient.get<{ resultados: PCPart[] }>(`/activos/pcparts?categoria=${encodeURIComponent(nombreCategoria)}&texto=${encodeURIComponent(q)}`)
        .then((r) => setPcpartResults(r.resultados || []))
        .catch(() => setPcpartResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [pcpartQuery, montablePC, nombreCategoria]);

  const elegirPcpart = (p: PCPart) => {
    setF((s) => ({
      ...s,
      nombre: p.name,
      imagenReferencial: p.image || s.imagenReferencial,
      observaciones: formatearSpecs(p.specs) || s.observaciones,
    }));
    setPcpartResults([]);
    setPcpartQuery('');
    setPcpartAbierto(false);
  };

  const buscarCodigo = async () => {
    if (!codigoBusqueda.trim()) return;
    try {
      const existente = await apiClient.get<ActivoDetalle>(`/activos/buscar?codigo=${encodeURIComponent(codigoBusqueda.trim())}`);
      if (confirm(`Ya existe el activo "${existente.nombre}" (${existente.numeroInventario}) con ese código. ¿Precargar sus datos?`)) {
        setF((s) => ({ ...s, numeroInventario: existente.numeroInventario, nombre: existente.nombre }));
      }
    } catch {
      setF((s) => ({ ...s, codigoBarras: codigoBusqueda.trim() }));
    }
  };

  const guardar = async () => {
    setError('');
    if (!f.numeroInventario.trim()) { setError('El número de inventario es obligatorio.'); return; }
    if (!f.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!f.categoriaId) { setError('La categoría es obligatoria.'); return; }
    if (!f.fechaAlta) { setError('La fecha de alta es obligatoria.'); return; }
    if (serieObligatoria && !f.numeroSerie.trim()) { setError('Esta categoría requiere número de serie.'); return; }
    if (f.responsableTipo === 'empleado' && !f.responsableEmpleadoId) { setError('Elegí el empleado responsable.'); return; }
    if (f.responsableTipo === 'oficina' && !f.responsableOficinaId) { setError('Elegí la oficina responsable.'); return; }
    if (f.responsableTipo === 'departamento' && !f.responsableDepartamentoId) { setError('Elegí el departamento responsable.'); return; }

    const payload = {
      numeroInventario: f.numeroInventario.trim(),
      nombre: f.nombre.trim(),
      categoriaId: Number(f.categoriaId),
      fabricanteId: f.fabricanteId ? Number(f.fabricanteId) : null,
      estadoId: f.estadoId ? Number(f.estadoId) : null,
      fechaAlta: f.fechaAlta,
      anio: f.anio ? Number(f.anio) : null,
      observaciones: f.observaciones || null,
      imagenReferencial: f.imagenReferencial || null,
      numeroSerie: f.numeroSerie || null,
      codigoBarras: f.codigoBarras || null,
      codigoQR: f.codigoQR || null,
      responsableTipo: f.responsableTipo || null,
      responsableEmpleadoId: f.responsableTipo === 'empleado' ? Number(f.responsableEmpleadoId) : null,
      responsableOficinaId: f.responsableTipo === 'oficina' ? Number(f.responsableOficinaId) : null,
      responsableDepartamentoId: f.responsableTipo === 'departamento' ? Number(f.responsableDepartamentoId) : null,
    };
    setGuardando(true);
    try {
      if (activo) await apiClient.put(`/activos/${activo.id}`, payload);
      else await apiClient.post('/activos', payload);
      onGuardado();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const oficinas = depts.flatMap((d) => d.offices.map((o) => ({ id: o.id, nombre: `${d.nombre} / ${o.nombre}` })));
  const inputCls = 'w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm';

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl shadow-soft p-4 sm:p-6">
      <h2 className="font-heading text-xl font-bold text-foreground">{activo ? 'Editar activo' : 'Nuevo activo'}</h2>
      {error && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{error}</div>}

      {!activo && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Buscar por código (inventario/barras/QR/serie)</label>
            <input value={codigoBusqueda} onChange={(e) => setCodigoBusqueda(e.target.value)} className={inputCls} placeholder="Escaneá o escribí un código…" />
          </div>
          <button type="button" onClick={buscarCodigo} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted"><Search size={16} /> Buscar</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Categoría *</label>
          <select
            value={f.categoriaId}
            onChange={(e) => {
              setF({ ...f, categoriaId: e.target.value });
              setPcpartResults([]); setPcpartQuery(''); setPcpartAbierto(false);
            }}
            className={inputCls}
          >
            <option value="">—</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.grupo})</option>)}
          </select>
        </div>
        <div className="relative">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            Nombre / especificación *
            {montablePC && <span className="inline-flex items-center gap-1 text-primary"><Package size={12} /> catálogo disponible</span>}
          </label>
          <input
            value={f.nombre}
            onChange={(e) => {
              const val = e.target.value;
              setF({ ...f, nombre: val });
              if (montablePC) { setPcpartQuery(val); setPcpartAbierto(true); }
            }}
            onFocus={() => { if (montablePC && pcpartResults.length > 0) setPcpartAbierto(true); }}
            onBlur={() => setTimeout(() => setPcpartAbierto(false), 150)}
            className={inputCls}
            placeholder={montablePC ? `Escribí para buscar en el catálogo de ${nombreCategoria}…` : undefined}
            autoComplete="off"
          />
          {montablePC && pcpartAbierto && pcpartResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto border border-border rounded-lg bg-card shadow-soft divide-y divide-border">
              {pcpartResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); elegirPcpart(p); }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-3"
                >
                  {p.image && <img src={p.image} alt="" className="w-8 h-8 object-contain rounded bg-white shrink-0" />}
                  <span className="flex-1">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div><label className="text-xs text-muted-foreground">N° de inventario *</label><input value={f.numeroInventario} onChange={(e) => setF({ ...f, numeroInventario: e.target.value })} className={inputCls} /></div>
        <div>
          <label className="text-xs text-muted-foreground">Fabricante</label>
          <select value={f.fabricanteId} onChange={(e) => setF({ ...f, fabricanteId: e.target.value })} className={inputCls}>
            <option value="">—</option>
            {fabricantes.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Estado</label>
          <select value={f.estadoId} onChange={(e) => setF({ ...f, estadoId: e.target.value })} className={inputCls}>
            <option value="">Disponible (default)</option>
            {estados.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </div>
        <div><label className="text-xs text-muted-foreground">Fecha de alta *</label><input type="date" value={f.fechaAlta} onChange={(e) => setF({ ...f, fechaAlta: e.target.value })} className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground">Año</label><input type="number" value={f.anio} onChange={(e) => setF({ ...f, anio: e.target.value })} className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground">N° de serie {serieObligatoria && <span className="text-error">*</span>}</label><input value={f.numeroSerie} onChange={(e) => setF({ ...f, numeroSerie: e.target.value })} className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground">Código de barras</label><input value={f.codigoBarras} onChange={(e) => setF({ ...f, codigoBarras: e.target.value })} className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground">Código QR</label><input value={f.codigoQR} onChange={(e) => setF({ ...f, codigoQR: e.target.value })} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Imagen referencial (URL)</label><input value={f.imagenReferencial} onChange={(e) => setF({ ...f, imagenReferencial: e.target.value })} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Observaciones</label><textarea value={f.observaciones} onChange={(e) => setF({ ...f, observaciones: e.target.value })} className={inputCls} rows={2} /></div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="text-sm font-semibold text-foreground">Responsable</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <select value={f.responsableTipo} onChange={(e) => setF({ ...f, responsableTipo: e.target.value, responsableEmpleadoId: '', responsableOficinaId: '', responsableDepartamentoId: '' })} className={inputCls}>
            {RESP_TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {f.responsableTipo === 'empleado' && (
            <select value={f.responsableEmpleadoId} onChange={(e) => setF({ ...f, responsableEmpleadoId: e.target.value })} className={inputCls}>
              <option value="">— Elegí empleado —</option>
              {empleados.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          {f.responsableTipo === 'oficina' && (
            <select value={f.responsableOficinaId} onChange={(e) => setF({ ...f, responsableOficinaId: e.target.value })} className={inputCls}>
              <option value="">— Elegí oficina —</option>
              {oficinas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          )}
          {f.responsableTipo === 'departamento' && (
            <select value={f.responsableDepartamentoId} onChange={(e) => setF({ ...f, responsableDepartamentoId: e.target.value })} className={inputCls}>
              <option value="">— Elegí departamento —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancelar} className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted">Cancelar</button>
        <button onClick={guardar} disabled={guardando} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </div>
  );
}
