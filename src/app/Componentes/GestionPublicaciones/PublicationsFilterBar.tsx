'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface AdminFiltros {
  texto: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
}

interface PublicationsFilterBarProps {
  filtros: AdminFiltros;
  onChange: (patch: Partial<AdminFiltros>) => void;
  onLimpiar: () => void;
}

const CATEGORIAS = [
  'Noticia Institucional', 'Circular', 'Resolución', 'Mantenimiento y Reparaciones',
  'Aviso Importante', 'Evento Institucional', 'Oportunidad Interna',
  'Beneficio para Empleados', 'Comunicación de RRHH',
];
const PRIORIDADES = ['Baja', 'Normal', 'Alta', 'Urgente'];
const ESTADOS = ['Borrador', 'Programada', 'Publicada', 'Archivada'];

export function PublicationsFilterBar({ filtros, onChange, onLimpiar }: PublicationsFilterBarProps) {
  const hayFiltros =
    filtros.texto !== '' || filtros.categoria !== '' || filtros.prioridad !== '' ||
    filtros.estado !== '' || filtros.fechaDesde !== '' || filtros.fechaHasta !== '';

  const inputCls = 'px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm';

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-soft flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filtros.texto}
          onChange={(e) => onChange({ texto: e.target.value })}
          placeholder="Buscar por título o resumen…"
          className={`w-full pl-9 pr-3 ${inputCls}`}
        />
      </div>
      <select value={filtros.categoria} onChange={(e) => onChange({ categoria: e.target.value })} className={inputCls}>
        <option value="">Todas las categorías</option>
        {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filtros.prioridad} onChange={(e) => onChange({ prioridad: e.target.value })} className={inputCls}>
        <option value="">Toda prioridad</option>
        {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={filtros.estado} onChange={(e) => onChange({ estado: e.target.value })} className={inputCls}>
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <input type="date" value={filtros.fechaDesde} onChange={(e) => onChange({ fechaDesde: e.target.value })} className={inputCls} title="Desde" />
      <input type="date" value={filtros.fechaHasta} onChange={(e) => onChange({ fechaHasta: e.target.value })} className={inputCls} title="Hasta" />
      {hayFiltros && (
        <button onClick={onLimpiar} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors duration-150">
          <X size={14} /> Limpiar
        </button>
      )}
    </div>
  );
}
