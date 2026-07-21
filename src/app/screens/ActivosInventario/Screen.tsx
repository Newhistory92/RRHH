'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { ActivoForm } from '@/app/Componentes/ActivosInventario/ActivoForm';
import { CodigoLabels } from '@/app/Componentes/ActivosInventario/CodigoLabels';
import type { ActivoListItem, ActivoDetalle, ActivoCategoria, ActivoEstado } from '@/app/Interfas/Interfaces';
import { Plus, ArrowLeft, Pencil } from 'lucide-react';

interface DeptOption { id: number; nombre: string; offices: { id: number; nombre: string }[]; }

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

  const abrirFicha = async (id: number) => {
    try {
      const det = await apiClient.get<ActivoDetalle>(`/activos/${id}`);
      setSeleccionado(det);
      setModo('ficha');
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

  const inputCls = 'px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm';

  const grupos = useMemo(() => {
    const porDepto = new Map<string, Map<string, ActivoListItem[]>>();
    for (const r of rows) {
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
  }, [rows]);

  if (modo === 'form') {
    return (
      <div className="bg-background min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <button onClick={() => setModo(editando ? 'ficha' : 'lista')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Volver</button>
          <ActivoForm
            activo={editando}
            onCancelar={() => setModo(editando ? 'ficha' : 'lista')}
            onGuardado={() => { setModo('lista'); setEditando(null); }}
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
                {grupos.map((g) => (
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
