'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export type FieldType = 'text' | 'number' | 'select' | 'checkbox';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface ConfigCrudSectionProps {
  endpoint: string;                 // ej. '/activos/config/fabricantes'
  respuestaKey: string;             // clave del array en la respuesta, ej. 'fabricantes'
  columns: ColumnDef[];
  fields: FieldDef[];
  emptyRow: Record<string, unknown>;
  canDelete?: (row: Record<string, unknown>) => boolean;
  filterField?: { key: string; label: string; options: { value: string; label: string }[] };
}

type Row = Record<string, unknown> & { id: number };

export default function ConfigCrudSection({
  endpoint, respuestaKey, columns, fields, emptyRow, canDelete, filterField,
}: ConfigCrudSectionProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyRow);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const [filtro, setFiltro] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    apiClient
      .get<Record<string, Row[]>>(endpoint)
      .then((res) => { setRows(res[respuestaKey] || []); setError(false); })
      .catch((e) => { console.error('Error al listar:', e); setError(true); })
      .finally(() => setLoading(false));
  }, [endpoint, respuestaKey]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNuevo = () => { setEditando(null); setForm({ ...emptyRow }); setFormError(''); setMostrarForm(true); };
  const abrirEditar = (row: Row) => { setEditando(row); setForm({ ...row }); setFormError(''); setMostrarForm(true); };
  const cerrar = () => { setMostrarForm(false); setEditando(null); setFormError(''); };

  const guardar = async () => {
    setFormError('');
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === 'number') v = v === '' || v == null ? null : Number(v);
      if (f.type === 'text' || f.type === 'select') v = typeof v === 'string' ? v.trim() : v;
      if (f.required && (v === '' || v == null)) { setFormError(`${f.label} es obligatorio.`); return; }
      payload[f.key] = v;
    }
    setGuardando(true);
    try {
      if (editando) await apiClient.put(`${endpoint}/${editando.id}`, payload);
      else await apiClient.post(endpoint, payload);
      cerrar();
      cargar();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (row: Row) => {
    if (!confirm(`¿Eliminar "${String(row.nombre ?? '')}"?`)) return;
    try {
      await apiClient.delete(`${endpoint}/${row.id}`);
      cargar();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const visibles = filterField && filtro
    ? rows.filter((r) => String(r[filterField.key]) === filtro)
    : rows;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {filterField ? (
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
            <option value="">Todos: {filterField.label}</option>
            {filterField.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : <div />}
        <button onClick={abrirNuevo} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-150 text-sm">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-background border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">{editando ? 'Editar' : 'Nuevo'}</h4>
            <button onClick={cerrar} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          {formError && <p className="text-sm text-error">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key} className={f.type === 'checkbox' ? 'flex items-center gap-2' : ''}>
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))} />
                    {f.label}
                  </label>
                ) : (
                  <>
                    <label className="text-xs text-muted-foreground">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={String(form[f.key] ?? '')} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                        <option value="">—</option>
                        {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={String(form[f.key] ?? '')}
                        onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={cerrar} className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted">Cancelar</button>
            <button onClick={guardar} disabled={guardando} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-soft overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-muted-foreground text-sm">Cargando…</p>
        ) : error ? (
          <p className="p-6 text-center text-error text-sm">Error al cargar.</p>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground text-sm">Sin registros.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background text-muted-foreground">
              <tr>
                {columns.map((c) => <th key={c.key} className="text-left font-medium px-4 py-3">{c.label}</th>)}
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-foreground">
                      {c.render ? c.render(row) : String(row[c.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => abrirEditar(row)} className="text-muted-foreground hover:text-foreground" title="Editar"><Pencil size={16} /></button>
                      {(!canDelete || canDelete(row)) && (
                        <button onClick={() => eliminar(row)} className="text-muted-foreground hover:text-error" title="Eliminar"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
