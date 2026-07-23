'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { ActivoForm } from '@/app/Componentes/ActivosInventario/ActivoForm';
import { CodigoLabels } from '@/app/Componentes/ActivosInventario/CodigoLabels';
import { BuscadorCatalogoPCParts } from '@/app/Componentes/ActivosInventario/BuscadorCatalogoPCParts';
import { formatearSpecs } from '@/app/util/pcparts';
import type { ActivoListItem, ActivoDetalle, ActivoCategoria, ActivoEstado, PCPart } from '@/app/Interfas/Interfaces';
import { Plus, ArrowLeft, Pencil, Cpu, Trash2, Repeat, ChevronDown } from 'lucide-react';

interface DeptOption { id: number; nombre: string; offices: { id: number; nombre: string }[]; }

// Codigos estables (ActivoEstado.codigo) considerados "problematicos": estos activos
// se muestran en una seccion colapsable aparte del listado principal, no mezclados
// con los estados de uso normal (disponible/asignado/en_deposito/prestado/en_garantia).
const ESTADOS_PROBLEMA = new Set(['en_reparacion', 'danado', 'extraviado', 'robado', 'dado_de_baja']);

function agruparPorDeptoOficina(lista: ActivoListItem[]) {
  const porDepto = new Map<string, Map<string, ActivoListItem[]>>();
  for (const r of lista) {
    const depto = r.efectivoDepartamentoNombre || 'Sin departamento';
    const oficina = r.efectivoOficinaNombre || 'Sin oficina';
    if (!porDepto.has(depto)) porDepto.set(depto, new Map());
    const porOficina = porDepto.get(depto)!;
    if (!porOficina.has(oficina)) porOficina.set(oficina, []);
    porOficina.get(oficina)!.push(r);
  }
  return Array.from(porDepto.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([depto, porOficina]) => ({
      depto,
      oficinas: Array.from(porOficina.entries()).sort(([a], [b]) => a.localeCompare(b)),
    }));
}

type Modo = 'lista' | 'ficha' | 'form';

export default function ActivosInventario() {
  const [modo, setModo] = useState<Modo>('lista');
  const [rows, setRows] = useState<ActivoListItem[]>([]);
  const [seleccionado, setSeleccionado] = useState<ActivoDetalle | null>(null);
  const [editando, setEditando] = useState<ActivoDetalle | null>(null);
  const [categorias, setCategorias] = useState<ActivoCategoria[]>([]);
  const [estados, setEstados] = useState<ActivoEstado[]>([]);
  const [depts, setDepts] = useState<DeptOption[]>([]);
  const [filtros, setFiltros] = useState({ categoriaId: '', grupo: '', estadoId: '', texto: '', departamentoId: '', oficinaId: '' });
  const [cambioEstado, setCambioEstado] = useState<{ estadoId: string; observacion: string } | null>(null);
  const [componentes, setComponentes] = useState<ActivoListItem[]>([]);
  const [libres, setLibres] = useState<ActivoListItem[]>([]);
  const [agregando, setAgregando] = useState(false);
  const [libreSel, setLibreSel] = useState('');
  const [reemplazando, setReemplazando] = useState(false);
  const [saleSel, setSaleSel] = useState('');
  const [entraSel, setEntraSel] = useState('');
  const [obsReemplazo, setObsReemplazo] = useState('');
  const [modoAgregar, setModoAgregar] = useState<'existente' | 'nuevo'>('existente');
  const [nuevoCategoriaId, setNuevoCategoriaId] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoNumeroInventario, setNuevoNumeroInventario] = useState('');
  const [nuevoNumeroSerie, setNuevoNumeroSerie] = useState('');
  const [nuevoImagen, setNuevoImagen] = useState('');
  const [nuevoObservaciones, setNuevoObservaciones] = useState('');
  const [creandoComponente, setCreandoComponente] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState('');
  const [modoEntrada, setModoEntrada] = useState<'existente' | 'nuevo'>('existente');
  const [estadoSalienteId, setEstadoSalienteId] = useState('');
  const [mostrarProblema, setMostrarProblema] = useState(false);

  const categoriasMontables = categorias.filter((c) => c.montableEnPC);
  const categoriaNuevaSel = categoriasMontables.find((c) => String(c.id) === nuevoCategoriaId);
  const serieObligatoriaNueva = categoriaNuevaSel?.requiereSerie ?? false;
  const nombreCategoriaNueva = categoriaNuevaSel?.nombre ?? '';

  const cargar = useCallback(() => {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId);
    if (filtros.grupo) params.set('grupo', filtros.grupo);
    if (filtros.estadoId) params.set('estadoId', filtros.estadoId);
    if (filtros.texto.trim()) params.set('texto', filtros.texto.trim());
    if (filtros.departamentoId) params.set('departamentoId', filtros.departamentoId);
    if (filtros.oficinaId) params.set('oficinaId', filtros.oficinaId);
    const qs = params.toString();
    apiClient.get<{ activos: ActivoListItem[] }>(`/activos${qs ? `?${qs}` : ''}`)
      .then((r) => setRows(r.activos || []))
      .catch((e) => console.error('Error al listar activos:', e));
  }, [filtros]);

  useEffect(() => {
    apiClient.get<{ categorias: ActivoCategoria[] }>('/activos/config/categorias').then((r) => setCategorias(r.categorias || [])).catch(() => {});
    apiClient.get<{ estados: ActivoEstado[] }>('/activos/config/estados').then((r) => setEstados(r.estados || [])).catch(() => {});
    apiClient.get<{ departments: DeptOption[] }>('/departments/').then((r) => setDepts(r.departments || [])).catch(() => {});
  }, []);

  useEffect(() => { if (modo === 'lista') cargar(); }, [modo, cargar]);

  const cargarComponentes = (pcId: number) => {
    apiClient.get<{ componentes: ActivoListItem[] }>(`/activos/${pcId}/componentes`)
      .then((r) => setComponentes(r.componentes || []))
      .catch(() => setComponentes([]));
  };

  const abrirFicha = async (id: number) => {
    try {
      const det = await apiClient.get<ActivoDetalle>(`/activos/${id}`);
      setSeleccionado(det);
      setModo('ficha');
      if (det.puedeAlbergarComponentes) cargarComponentes(id);
      else setComponentes([]);
    } catch (e) { console.error(e); }
  };

  const guardarEstado = async () => {
    if (!seleccionado || !cambioEstado) return;
    try {
      await apiClient.patch(`/activos/${seleccionado.id}/estado`, {
        estadoId: Number(cambioEstado.estadoId),
        observacion: cambioEstado.observacion || null,
      });
      setCambioEstado(null);
      const det = await apiClient.get<ActivoDetalle>(`/activos/${seleccionado.id}`);
      setSeleccionado(det);
    } catch (e) { alert((e as Error).message); }
  };

  const abrirAgregar = async () => {
    try {
      const r = await apiClient.get<{ componentes: ActivoListItem[] }>('/activos/componentes-libres');
      setLibres(r.componentes || []); setLibreSel(''); setAgregando(true);
      setModoAgregar('existente');
      setNuevoCategoriaId(''); setNuevoNombre(''); setNuevoNumeroInventario('');
      setNuevoNumeroSerie(''); setNuevoImagen(''); setNuevoObservaciones(''); setErrorNuevo('');
    } catch (e) { alert((e as Error).message); }
  };

  const confirmarAgregar = async () => {
    if (!seleccionado || !libreSel) return;
    try {
      await apiClient.post(`/activos/${seleccionado.id}/componentes`, { componenteId: Number(libreSel) });
      setAgregando(false); cargarComponentes(seleccionado.id);
    } catch (e) { alert((e as Error).message); }
  };

  const elegirPcpartNuevo = (p: PCPart) => {
    setNuevoNombre(p.name);
    if (p.image) setNuevoImagen(p.image);
    const specs = formatearSpecs(p.specs);
    if (specs) setNuevoObservaciones(specs);
  };

  const confirmarCrearComponente = async () => {
    if (!seleccionado) return;
    setErrorNuevo('');
    if (!nuevoCategoriaId) { setErrorNuevo('Elegí una categoría.'); return; }
    if (!nuevoNombre.trim()) { setErrorNuevo('El nombre es obligatorio.'); return; }
    if (!nuevoNumeroInventario.trim()) { setErrorNuevo('El número de inventario es obligatorio.'); return; }
    if (serieObligatoriaNueva && !nuevoNumeroSerie.trim()) { setErrorNuevo('Esta categoría requiere número de serie.'); return; }
    setCreandoComponente(true);
    try {
      const res = await apiClient.post<{ id: number }>('/activos', {
        numeroInventario: nuevoNumeroInventario.trim(),
        nombre: nuevoNombre.trim(),
        categoriaId: Number(nuevoCategoriaId),
        fabricanteId: null,
        estadoId: null,
        fechaAlta: new Date().toISOString().slice(0, 10),
        anio: null,
        observaciones: nuevoObservaciones || null,
        imagenReferencial: nuevoImagen || null,
        numeroSerie: nuevoNumeroSerie || null,
        codigoBarras: null,
        codigoQR: null,
        responsableTipo: null,
        responsableEmpleadoId: null,
        responsableOficinaId: null,
        responsableDepartamentoId: null,
      });
      await apiClient.post(`/activos/${seleccionado.id}/componentes`, { componenteId: res.id });
      setAgregando(false);
      cargarComponentes(seleccionado.id);
    } catch (e) {
      setErrorNuevo((e as Error).message);
    } finally {
      setCreandoComponente(false);
    }
  };

  const quitarComponente = async (compId: number) => {
    if (!seleccionado) return;
    if (!confirm('¿Quitar este componente de la PC?')) return;
    try {
      await apiClient.delete(`/activos/${seleccionado.id}/componentes/${compId}`);
      cargarComponentes(seleccionado.id);
    } catch (e) { alert((e as Error).message); }
  };

  const abrirReemplazar = async () => {
    try {
      const r = await apiClient.get<{ componentes: ActivoListItem[] }>('/activos/componentes-libres');
      setLibres(r.componentes || []); setSaleSel(''); setEntraSel(''); setObsReemplazo(''); setReemplazando(true);
      setEstadoSalienteId('');
      setModoEntrada('existente');
      setNuevoCategoriaId(''); setNuevoNombre(''); setNuevoNumeroInventario('');
      setNuevoNumeroSerie(''); setNuevoImagen(''); setNuevoObservaciones(''); setErrorNuevo('');
    } catch (e) { alert((e as Error).message); }
  };

  const confirmarReemplazar = async () => {
    if (!seleccionado || !saleSel) return;
    setErrorNuevo('');
    let entraId: number;
    if (modoEntrada === 'existente') {
      if (!entraSel) { setErrorNuevo('Elegí el componente que entra.'); return; }
      entraId = Number(entraSel);
    } else {
      if (!nuevoCategoriaId) { setErrorNuevo('Elegí una categoría.'); return; }
      if (!nuevoNombre.trim()) { setErrorNuevo('El nombre es obligatorio.'); return; }
      if (!nuevoNumeroInventario.trim()) { setErrorNuevo('El número de inventario es obligatorio.'); return; }
      if (serieObligatoriaNueva && !nuevoNumeroSerie.trim()) { setErrorNuevo('Esta categoría requiere número de serie.'); return; }
      setCreandoComponente(true);
      try {
        const res = await apiClient.post<{ id: number }>('/activos', {
          numeroInventario: nuevoNumeroInventario.trim(),
          nombre: nuevoNombre.trim(),
          categoriaId: Number(nuevoCategoriaId),
          fabricanteId: null,
          estadoId: null,
          fechaAlta: new Date().toISOString().slice(0, 10),
          anio: null,
          observaciones: nuevoObservaciones || null,
          imagenReferencial: nuevoImagen || null,
          numeroSerie: nuevoNumeroSerie || null,
          codigoBarras: null,
          codigoQR: null,
          responsableTipo: null,
          responsableEmpleadoId: null,
          responsableOficinaId: null,
          responsableDepartamentoId: null,
        });
        entraId = res.id;
      } catch (e) {
        setErrorNuevo((e as Error).message);
        setCreandoComponente(false);
        return;
      }
      setCreandoComponente(false);
    }
    try {
      await apiClient.post(`/activos/${seleccionado.id}/componentes/reemplazar`, {
        saleComponenteId: Number(saleSel), entraComponenteId: entraId, observacion: obsReemplazo || null,
        estadoSalienteId: estadoSalienteId ? Number(estadoSalienteId) : null,
      });
      setReemplazando(false); cargarComponentes(seleccionado.id);
    } catch (e) {
      setErrorNuevo((e as Error).message);
    }
  };

  const inputCls = 'px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm';

  const rowsPrincipales = useMemo(() => rows.filter((r) => !ESTADOS_PROBLEMA.has(r.estadoCodigo)), [rows]);
  const rowsProblema = useMemo(() => rows.filter((r) => ESTADOS_PROBLEMA.has(r.estadoCodigo)), [rows]);
  const grupos = useMemo(() => agruparPorDeptoOficina(rowsPrincipales), [rowsPrincipales]);
  const gruposProblema = useMemo(() => agruparPorDeptoOficina(rowsProblema), [rowsProblema]);

  const renderFilasGrupos = (lista: typeof grupos) => lista.map((g) => (
    <React.Fragment key={g.depto}>
      {g.oficinas.map(([oficina, items]) => (
        <React.Fragment key={`${g.depto}-${oficina}`}>
          <tr className="bg-muted/50 border-t border-border">
            <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-foreground">
              {g.depto} · {oficina}
            </td>
          </tr>
          {items.map((r) => (
            <tr key={r.id} onClick={() => abrirFicha(r.id)} className="border-t border-border hover:bg-muted cursor-pointer">
              <td className="px-4 py-3 text-foreground">{r.numeroInventario}</td>
              <td className="px-4 py-3 text-foreground">{r.nombre}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.categoriaNombre}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.estadoNombre}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.responsableNombre ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.fechaAlta ? new Date(r.fechaAlta).toLocaleDateString('es-AR') : '—'}</td>
            </tr>
          ))}
        </React.Fragment>
      ))}
    </React.Fragment>
  ));

  if (modo === 'form') {
    return (
      <div className="bg-background min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <button onClick={() => setModo(editando ? 'ficha' : 'lista')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Volver</button>
          <ActivoForm
            activo={editando}
            onCancelar={() => setModo(editando ? 'ficha' : 'lista')}
            onGuardado={(id) => {
              if (editando) { setModo('lista'); setEditando(null); }
              else { setEditando(null); abrirFicha(id); }
            }}
          />
        </div>
      </div>
    );
  }

  if (modo === 'ficha' && seleccionado) {
    const a = seleccionado;
    const dato = (label: string, valor: React.ReactNode) => (
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm text-foreground">{valor ?? '—'}</p></div>
    );
    return (
      <div className="bg-background min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => setModo('lista')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Volver al inventario</button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{a.nombre}</h1>
              <p className="text-muted-foreground">{a.numeroInventario} · {a.categoriaNombre} ({a.grupo})</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditando(a); setModo('form'); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted"><Pencil size={16} /> Editar</button>
              <button onClick={() => setCambioEstado({ estadoId: String(a.estadoId), observacion: '' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90">Cambiar estado</button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {dato('Estado', a.estadoNombre)}
            {dato('Fabricante', a.fabricanteNombre)}
            {dato('Fecha de alta', a.fechaAlta ? new Date(a.fechaAlta).toLocaleDateString('es-AR') : '—')}
            {dato('Año', a.anio)}
            {dato('N° de serie', a.numeroSerie)}
            {dato('Responsable', a.responsableNombre ? `${a.responsableNombre} (${a.responsableTipo})` : 'Sin asignar')}
            {dato('Código de barras', a.codigoBarras)}
            {dato('Código QR', a.codigoQR)}
            <div className="col-span-2 sm:col-span-3">{dato('Observaciones', a.observaciones)}</div>
          </div>

          {a.imagenReferencial && (
            <img src={a.imagenReferencial} alt={a.nombre} className="max-w-xs rounded-xl border border-border" />
          )}

          <CodigoLabels valorQR={a.codigoQR || a.numeroInventario} valorBarras={a.codigoBarras || a.numeroInventario} />

          {a.pcPadreId && (
            <div className="bg-card border border-border rounded-xl shadow-soft p-4 flex items-center gap-2 text-sm">
              <Cpu size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Instalado en:</span>
              <button onClick={() => abrirFicha(a.pcPadreId!)} className="text-primary hover:underline">{a.pcPadreNombre ?? `#${a.pcPadreId}`}</button>
            </div>
          )}

          {a.puedeAlbergarComponentes && (
            <div className="bg-card border border-border rounded-xl shadow-soft p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><Cpu size={18} /> Componentes instalados</h2>
                <div className="flex gap-2">
                  <button onClick={abrirAgregar} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90"><Plus size={16} /> Agregar</button>
                  <button onClick={abrirReemplazar} disabled={componentes.length === 0} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-muted disabled:opacity-50"><Repeat size={16} /> Reemplazar</button>
                </div>
              </div>
              {componentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Esta PC no tiene componentes instalados.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium py-2">Componente</th>
                      <th className="text-left font-medium py-2">Categoría</th>
                      <th className="text-left font-medium py-2">N° serie</th>
                      <th className="text-left font-medium py-2">Estado</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentes.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="py-2"><button onClick={() => abrirFicha(c.id)} className="text-primary hover:underline">{c.nombre}</button></td>
                        <td className="py-2 text-muted-foreground">{c.categoriaNombre}</td>
                        <td className="py-2 text-muted-foreground">{c.numeroSerie ?? '—'}</td>
                        <td className="py-2 text-muted-foreground">{c.estadoNombre}</td>
                        <td className="py-2 text-right"><button onClick={() => quitarComponente(c.id)} className="inline-flex items-center gap-1 text-error hover:opacity-80 text-xs"><Trash2 size={14} /> Quitar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {cambioEstado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setCambioEstado(null)}>
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading text-lg font-bold text-foreground">Cambiar estado</h3>
              <div>
                <label className="text-xs text-muted-foreground">Nuevo estado</label>
                <select value={cambioEstado.estadoId} onChange={(e) => setCambioEstado({ ...cambioEstado, estadoId: e.target.value })} className={`w-full mt-1 ${inputCls}`}>
                  {estados.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Motivo / observación</label>
                <textarea value={cambioEstado.observacion} onChange={(e) => setCambioEstado({ ...cambioEstado, observacion: e.target.value })} className={`w-full mt-1 ${inputCls}`} rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setCambioEstado(null)} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
                <button onClick={guardarEstado} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {agregando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setAgregando(false)}>
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading text-lg font-bold text-foreground">Agregar componente</h3>

              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setModoAgregar('existente')}
                  className={`px-3 py-2 text-sm border-b-2 -mb-px ${modoAgregar === 'existente' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Elegir existente
                </button>
                <button
                  type="button"
                  onClick={() => setModoAgregar('nuevo')}
                  className={`px-3 py-2 text-sm border-b-2 -mb-px ${modoAgregar === 'nuevo' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Crear nuevo
                </button>
              </div>

              {modoAgregar === 'existente' ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Componente libre</label>
                    <select value={libreSel} onChange={(e) => setLibreSel(e.target.value)} className={`w-full mt-1 ${inputCls}`}>
                      <option value="">— Elegí un componente —</option>
                      {libres.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.categoriaNombre})</option>)}
                    </select>
                    {libres.length === 0 && <p className="text-xs text-muted-foreground mt-1">No hay componentes libres. Probá la pestaña &quot;Crear nuevo&quot;.</p>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAgregando(false)} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
                    <button onClick={confirmarAgregar} disabled={!libreSel} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">Instalar</button>
                  </div>
                </>
              ) : (
                <>
                  {errorNuevo && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{errorNuevo}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Categoría *</label>
                      <select value={nuevoCategoriaId} onChange={(e) => { setNuevoCategoriaId(e.target.value); setNuevoNombre(''); }} className={`w-full mt-1 ${inputCls}`}>
                        <option value="">—</option>
                        {categoriasMontables.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="text-xs text-muted-foreground">Nombre / especificación *</label>
                      <BuscadorCatalogoPCParts
                        categoriaNombre={nombreCategoriaNueva}
                        activo={!!nuevoCategoriaId}
                        valor={nuevoNombre}
                        onCambiarValor={setNuevoNombre}
                        onElegir={elegirPcpartNuevo}
                        placeholder={nuevoCategoriaId ? `Buscar en el catálogo de ${nombreCategoriaNueva}…` : 'Elegí una categoría primero'}
                        className={`w-full mt-1 ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">N° de inventario *</label>
                      <input value={nuevoNumeroInventario} onChange={(e) => setNuevoNumeroInventario(e.target.value)} className={`w-full mt-1 ${inputCls}`} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">N° de serie {serieObligatoriaNueva && <span className="text-error">*</span>}</label>
                      <input value={nuevoNumeroSerie} onChange={(e) => setNuevoNumeroSerie(e.target.value)} className={`w-full mt-1 ${inputCls}`} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAgregando(false)} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
                    <button onClick={confirmarCrearComponente} disabled={creandoComponente} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">{creandoComponente ? 'Creando…' : 'Crear e instalar'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {reemplazando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setReemplazando(false)}>
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading text-lg font-bold text-foreground">Reemplazar componente</h3>

              {errorNuevo && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{errorNuevo}</div>}

              <div>
                <label className="text-xs text-muted-foreground">Sale (instalado)</label>
                <select
                  value={saleSel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSaleSel(val);
                    const comp = componentes.find((c) => String(c.id) === val);
                    setEstadoSalienteId(comp ? String(comp.estadoId) : '');
                  }}
                  className={`w-full mt-1 ${inputCls}`}
                >
                  <option value="">— Elegí el que sale —</option>
                  {componentes.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.categoriaNombre})</option>)}
                </select>
                {saleSel && (
                  <div className="mt-2">
                    <label className="text-xs text-muted-foreground">Estado al salir</label>
                    <select value={estadoSalienteId} onChange={(e) => setEstadoSalienteId(e.target.value)} className={`w-full mt-1 ${inputCls}`}>
                      {estados.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Entra</label>
                <div className="flex gap-2 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setModoEntrada('existente')}
                    className={`px-3 py-2 text-sm border-b-2 -mb-px ${modoEntrada === 'existente' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Elegir existente
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEntrada('nuevo')}
                    className={`px-3 py-2 text-sm border-b-2 -mb-px ${modoEntrada === 'nuevo' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Crear nuevo
                  </button>
                </div>

                {modoEntrada === 'existente' ? (
                  <div className="mt-2">
                    <select value={entraSel} onChange={(e) => setEntraSel(e.target.value)} className={`w-full ${inputCls}`}>
                      <option value="">— Elegí el que entra —</option>
                      {libres.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.categoriaNombre})</option>)}
                    </select>
                    {libres.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        No hay componentes libres. Probá la pestaña &quot;Crear nuevo&quot;.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Categoría *</label>
                      <select value={nuevoCategoriaId} onChange={(e) => { setNuevoCategoriaId(e.target.value); setNuevoNombre(''); }} className={`w-full mt-1 ${inputCls}`}>
                        <option value="">—</option>
                        {categoriasMontables.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="text-xs text-muted-foreground">Nombre / especificación *</label>
                      <BuscadorCatalogoPCParts
                        categoriaNombre={nombreCategoriaNueva}
                        activo={!!nuevoCategoriaId}
                        valor={nuevoNombre}
                        onCambiarValor={setNuevoNombre}
                        onElegir={elegirPcpartNuevo}
                        placeholder={nuevoCategoriaId ? `Buscar en el catálogo de ${nombreCategoriaNueva}…` : 'Elegí una categoría primero'}
                        className={`w-full mt-1 ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">N° de inventario *</label>
                      <input value={nuevoNumeroInventario} onChange={(e) => setNuevoNumeroInventario(e.target.value)} className={`w-full mt-1 ${inputCls}`} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">N° de serie {serieObligatoriaNueva && <span className="text-error">*</span>}</label>
                      <input value={nuevoNumeroSerie} onChange={(e) => setNuevoNumeroSerie(e.target.value)} className={`w-full mt-1 ${inputCls}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Motivo / observación</label>
                <textarea value={obsReemplazo} onChange={(e) => setObsReemplazo(e.target.value)} className={`w-full mt-1 ${inputCls}`} rows={2} />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setReemplazando(false)} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
                <button
                  onClick={confirmarReemplazar}
                  disabled={!saleSel || (modoEntrada === 'existente' && !entraSel) || creandoComponente}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {creandoComponente ? 'Creando…' : 'Reemplazar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Inventario</h1>
            <p className="text-muted-foreground">Equipos, componentes, accesorios y mobiliario.</p>
          </div>
          <button onClick={() => { setEditando(null); setModo('form'); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90"><Plus size={18} /> Nuevo activo</button>
        </header>

        <div className="bg-card border border-border rounded-xl p-3 shadow-soft flex flex-wrap items-center gap-3">
          <input value={filtros.texto} onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })} placeholder="Buscar por nombre/inventario/serie…" className={`flex-1 min-w-[200px] ${inputCls}`} />
          <select value={filtros.categoriaId} onChange={(e) => setFiltros({ ...filtros, categoriaId: e.target.value })} className={inputCls}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={filtros.grupo} onChange={(e) => setFiltros({ ...filtros, grupo: e.target.value })} className={inputCls}>
            <option value="">Todos los grupos</option>
            {['Equipo', 'Componente', 'Accesorio', 'Mobiliario'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filtros.estadoId} onChange={(e) => setFiltros({ ...filtros, estadoId: e.target.value })} className={inputCls}>
            <option value="">Todos los estados</option>
            {estados.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
          <select
            value={filtros.departamentoId}
            onChange={(e) => setFiltros({ ...filtros, departamentoId: e.target.value, oficinaId: '' })}
            className={inputCls}
          >
            <option value="">Todos los departamentos</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
          <select
            value={filtros.oficinaId}
            onChange={(e) => setFiltros({ ...filtros, oficinaId: e.target.value })}
            className={inputCls}
          >
            <option value="">Todas las oficinas</option>
            {(filtros.departamentoId
              ? depts.find((d) => String(d.id) === filtros.departamentoId)?.offices || []
              : depts.flatMap((d) => d.offices)
            ).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-soft overflow-x-auto">
          {rows.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No hay activos con esos filtros.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-background text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">N° inventario</th>
                  <th className="text-left font-medium px-4 py-3">Nombre</th>
                  <th className="text-left font-medium px-4 py-3">Categoría</th>
                  <th className="text-left font-medium px-4 py-3">Estado</th>
                  <th className="text-left font-medium px-4 py-3">Responsable</th>
                  <th className="text-left font-medium px-4 py-3">Fecha alta</th>
                </tr>
              </thead>
              <tbody>
                {renderFilasGrupos(grupos)}
              </tbody>
            </table>
          )}
        </div>

        {gruposProblema.length > 0 && (
          <div className="bg-card border border-border rounded-xl shadow-soft">
            <button
              type="button"
              onClick={() => setMostrarProblema((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted rounded-xl"
            >
              <span>Estados problemáticos ({rowsProblema.length})</span>
              <ChevronDown size={16} className={`transition-transform ${mostrarProblema ? 'rotate-180' : ''}`} />
            </button>
            {mostrarProblema && (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-sm">
                  <thead className="bg-background text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">N° inventario</th>
                      <th className="text-left font-medium px-4 py-3">Nombre</th>
                      <th className="text-left font-medium px-4 py-3">Categoría</th>
                      <th className="text-left font-medium px-4 py-3">Estado</th>
                      <th className="text-left font-medium px-4 py-3">Responsable</th>
                      <th className="text-left font-medium px-4 py-3">Fecha alta</th>
                    </tr>
                  </thead>
                  <tbody>{renderFilasGrupos(gruposProblema)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
