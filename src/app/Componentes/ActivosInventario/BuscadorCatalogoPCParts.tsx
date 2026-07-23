'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/app/util/apiClient';
import type { PCPart } from '@/app/Interfas/Interfaces';

interface BuscadorCatalogoPCPartsProps {
  categoriaNombre: string;
  activo: boolean;
  valor: string;
  onCambiarValor: (v: string) => void;
  onElegir: (p: PCPart) => void;
  placeholder?: string;
  className: string;
}

export function BuscadorCatalogoPCParts({
  categoriaNombre, activo, valor, onCambiarValor, onElegir, placeholder, className,
}: BuscadorCatalogoPCPartsProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<PCPart[]>([]);
  const [abierto, setAbierto] = useState(false);

  // Si cambia la categoria (o deja de ser montable), se descarta la busqueda en curso.
  useEffect(() => {
    setQuery(''); setResultados([]); setAbierto(false);
  }, [categoriaNombre, activo]);

  useEffect(() => {
    if (!activo) { setResultados([]); return; }
    const q = query.trim();
    const t = setTimeout(() => {
      apiClient.get<{ resultados: PCPart[] }>(`/activos/pcparts?categoria=${encodeURIComponent(categoriaNombre)}&texto=${encodeURIComponent(q)}`)
        .then((r) => setResultados(r.resultados || []))
        .catch(() => setResultados([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query, activo, categoriaNombre]);

  return (
    <div className="relative">
      <input
        value={valor}
        onChange={(e) => {
          const v = e.target.value;
          onCambiarValor(v);
          if (activo) { setQuery(v); setAbierto(true); }
        }}
        onFocus={() => { if (activo && resultados.length > 0) setAbierto(true); }}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />
      {activo && abierto && resultados.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto border border-border rounded-lg bg-card shadow-soft divide-y divide-border">
          {resultados.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onElegir(p); setQuery(''); setResultados([]); setAbierto(false); }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-3"
            >
              {p.image && <img src={p.image} alt="" className="w-8 h-8 object-contain rounded bg-white shrink-0" />}
              <span className="flex-1">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
