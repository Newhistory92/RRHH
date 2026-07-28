'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import type { ModeloPC, ModeloDetalle, CampoSpecCategoria } from '@/app/Interfas/Interfaces';
import { Plus, ArrowLeft, Trash2, Cpu } from 'lucide-react';

type Modo = 'lista' | 'detalle';

export default function ActivosModelos() {
  const [modo, setModo] = useState<Modo>('lista');
  const [modelos, setModelos] = useState<ModeloPC[]>([]);
  const [detalle, setDetalle] = useState<ModeloDetalle | null>(null);
  const [categorias, setCategorias] = useState<CampoSpecCategoria[]>([]);
  const [error, setError] = useState('');

  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [reqCategoriaId, setReqCategoriaId] = useState('');
  const [reqCampo, setReqCampo] = useState('');
  const [reqValor, setReqValor] = useState('');
  const [errorReq, setErrorReq] = useState('');

  const inputCls = 'px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm';

  const cargar = useCallback(() => {
    apiClient.get<{ modelos: ModeloPC[] }>('/activos/modelos')
      .then((r) => setModelos(r.modelos || []))
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(() => {
    cargar();
    apiClient.get<{ categorias: CampoSpecCategoria[] }>('/activos/modelos/campos')
      .then((r) => setCategorias(r.categorias || []))
      .catch(() => {});
  }, [cargar]);

  const abrirDetalle = async (id: number) => {
    try {
      const d = await apiClient.get<ModeloDetalle>(`/activos/modelos/${id}`);
      setDetalle(d);
      setReqCategoriaId(''); setReqCampo(''); setReqValor(''); setErrorReq('');
      setModo('detalle');
    } catch (e) { setError((e as Error).message); }
  };

  const crearModelo = async () => {
    setError('');
    if (!nuevoNombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      const res = await apiClient.post<{ id: number }>('/activos/modelos', {
        nombre: nuevoNombre.trim(),
        descripcion: nuevaDescripcion.trim() || null,
      });
      setCreando(false); setNuevoNombre(''); setNuevaDescripcion('');
      cargar();
      abrirDetalle(res.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const bajaModelo = async (id: number) => {
    if (!confirm('¿Dar de baja este modelo?')) return;
    try {
      await apiClient.delete(`/activos/modelos/${id}`);
      cargar();
    } catch (e) { setError((e as Error).message); }
  };

  const categoriaSel = categorias.find((c) => String(c.categoriaId) === reqCategoriaId);
  const campoSel = categoriaSel?.campos.find((c) => c.campo === reqCampo);

  const agregarRequisito = async () => {
    if (!detalle) return;
    setErrorReq('');
    if (!reqCategoriaId) { setErrorReq('Elegí una categoría.'); return; }
    if (!reqCampo) { setErrorReq('Elegí un campo.'); return; }
    const valor = Number(reqValor);
    if (!reqValor.trim() || Number.isNaN(valor) || valor <= 0) {
      setErrorReq('El valor mínimo debe ser un número mayor a 0.');
      return;
    }
    try {
      await apiClient.post(`/activos/modelos/${detalle.id}/requisitos`, {
        categoriaId: Number(reqCategoriaId),
        campoSpec: reqCampo,
        valorMinimo: valor,
      });
      setReqCampo(''); setReqValor('');
      abrirDetalle(detalle.id);
      cargar();
    } catch (e) { setErrorReq((e as Error).message); }
  };

  const quitarRequisito = async (reqId: number) => {
    if (!detalle) return;
    try {
      await apiClient.delete(`/activos/modelos/${detalle.id}/requisitos/${reqId}`);
      abrirDetalle(detalle.id);
      cargar();
    } catch (e) { setErrorReq((e as Error).message); }
  };

  if (modo === 'detalle' && detalle) {
    return (
      <div className="bg-background min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => { setModo('lista'); setDetalle(null); }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Volver a modelos</button>

          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{detalle.nombre}</h1>
            {detalle.descripcion && <p className="text-muted-foreground">{detalle.descripcion}</p>}
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft p-4 sm:p-6 space-y-4">
            <h2 className="font-heading text-lg font-bold text-foreground">Requisitos</h2>
            {errorReq && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{errorReq}</div>}

            {detalle.requisitos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este modelo todavía no tiene requisitos. Agregá al menos uno para poder evaluar PCs.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium py-2">Categoría</th>
                    <th className="text-left font-medium py-2">Campo</th>
                    <th className="text-left font-medium py-2">Mínimo</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.requisitos.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2 text-foreground">{r.categoriaNombre}</td>
                      <td className="py-2 text-muted-foreground">{r.etiqueta}</td>
                      <td className="py-2 text-muted-foreground">{r.valorMinimo} {r.unidad}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => quitarRequisito(r.id)} className="inline-flex items-center gap-1 text-error hover:opacity-80 text-xs"><Trash2 size={14} /> Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-2">Agregar requisito</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Categoría</label>
                  <select value={reqCategoriaId} onChange={(e) => { setReqCategoriaId(e.target.value); setReqCampo(''); }} className={`w-full mt-1 ${inputCls}`}>
                    <option value="">—</option>
                    {categorias.map((c) => <option key={c.categoriaId} value={c.categoriaId}>{c.categoriaNombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Campo</label>
                  <select value={reqCampo} onChange={(e) => setReqCampo(e.target.value)} disabled={!reqCategoriaId} className={`w-full mt-1 ${inputCls} disabled:opacity-50`}>
                    <option value="">—</option>
                    {(categoriaSel?.campos ?? []).map((c) => <option key={c.campo} value={c.campo}>{c.etiqueta}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Valor mínimo {campoSel?.unidad ? `(${campoSel.unidad})` : ''}</label>
                  <input type="number" value={reqValor} onChange={(e) => setReqValor(e.target.value)} className={`w-full mt-1 ${inputCls}`} />
                </div>
                <button onClick={agregarRequisito} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Modelos de PC</h1>
            <p className="text-muted-foreground">Perfiles de referencia para evaluar equipos.</p>
          </div>
          <button onClick={() => { setCreando(true); setError(''); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90"><Plus size={18} /> Nuevo modelo</button>
        </header>

        {error && <div className="bg-error-soft text-error-soft-foreground border border-error rounded-lg px-4 py-2 text-sm">{error}</div>}

        <div className="bg-card border border-border rounded-xl shadow-soft overflow-x-auto">
          {modelos.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No hay modelos definidos todavía.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-background text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nombre</th>
                  <th className="text-left font-medium px-4 py-3">Descripción</th>
                  <th className="text-left font-medium px-4 py-3">Requisitos</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((m) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted">
                    <td className="px-4 py-3">
                      <button onClick={() => abrirDetalle(m.id)} className="text-primary hover:underline inline-flex items-center gap-2"><Cpu size={14} /> {m.nombre}</button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.descripcion ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.cantidadRequisitos}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => bajaModelo(m.id)} className="inline-flex items-center gap-1 text-error hover:opacity-80 text-xs"><Trash2 size={14} /> Baja</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {creando && (
        <div className="fixed inset-0 bg-muted/50 flex items-center justify-center p-4 z-50" onClick={() => setCreando(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-foreground">Nuevo modelo</h3>
            <div>
              <label className="text-xs text-muted-foreground">Nombre *</label>
              <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className={`w-full mt-1 ${inputCls}`} placeholder="ej. Oficina Básica" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Descripción</label>
              <textarea value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} className={`w-full mt-1 ${inputCls}`} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreando(false)} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
              <button onClick={crearModelo} disabled={guardando} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">{guardando ? 'Creando…' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
