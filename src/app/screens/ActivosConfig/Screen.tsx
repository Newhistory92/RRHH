'use client';

import React, { useState } from 'react';
import { Boxes, Factory, Truck, Activity } from 'lucide-react';
import ConfigCrudSection, { type FieldDef, type ColumnDef } from '@/app/Componentes/ActivosConfig/ConfigCrudSection';

type TabId = 'categorias' | 'fabricantes' | 'proveedores' | 'estados';

const GRUPOS = [
  { value: 'Equipo', label: 'Equipo' },
  { value: 'Componente', label: 'Componente' },
  { value: 'Accesorio', label: 'Accesorio' },
  { value: 'Mobiliario', label: 'Mobiliario' },
];

const siNo = (v: unknown) => (v ? 'Sí' : 'No');

const CAT_COLUMNS: ColumnDef[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'montableEnPC', label: 'Montable', render: (r) => siNo(r.montableEnPC) },
  { key: 'requiereSerie', label: 'Req. serie', render: (r) => siNo(r.requiereSerie) },
  { key: 'vidaUtilAnios', label: 'Vida útil', render: (r) => (r.vidaUtilAnios != null ? `${r.vidaUtilAnios} años` : '—') },
];
const CAT_FIELDS: FieldDef[] = [
  { key: 'nombre', label: 'Nombre', type: 'text', required: true },
  { key: 'grupo', label: 'Grupo', type: 'select', options: GRUPOS, required: true },
  { key: 'montableEnPC', label: 'Montable en PC', type: 'checkbox' },
  { key: 'requiereSerie', label: 'Requiere número de serie', type: 'checkbox' },
  { key: 'vidaUtilAnios', label: 'Vida útil (años)', type: 'number' },
];

const PROV_COLUMNS: ColumnDef[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'contacto', label: 'Contacto', render: (r) => (r.contacto ? String(r.contacto) : '—') },
];
const ESTADO_COLUMNS: ColumnDef[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo', label: 'Código' },
  { key: 'orden', label: 'Orden' },
  { key: 'esCore', label: 'Núcleo', render: (r) => siNo(r.esCore) },
];

export default function ActivosConfig() {
  const [tab, setTab] = useState<TabId>('categorias');

  const TabButton = ({ id, label, icon: Icon }: { id: TabId; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
        tab === id ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="font-heading text-3xl font-bold text-foreground">Configuración de Activos</h1>
          <p className="text-muted-foreground">Categorías, fabricantes, proveedores y estados del inventario.</p>
        </header>

        <div className="flex flex-wrap border-b border-border">
          <TabButton id="categorias" label="Categorías" icon={Boxes} />
          <TabButton id="fabricantes" label="Fabricantes" icon={Factory} />
          <TabButton id="proveedores" label="Proveedores" icon={Truck} />
          <TabButton id="estados" label="Estados" icon={Activity} />
        </div>

        {tab === 'categorias' && (
          <ConfigCrudSection
            endpoint="/activos/config/categorias"
            respuestaKey="categorias"
            columns={CAT_COLUMNS}
            fields={CAT_FIELDS}
            emptyRow={{ nombre: '', grupo: 'Componente', montableEnPC: false, requiereSerie: false, vidaUtilAnios: '' }}
            filterField={{ key: 'grupo', label: 'Grupo', options: GRUPOS }}
          />
        )}
        {tab === 'fabricantes' && (
          <ConfigCrudSection
            endpoint="/activos/config/fabricantes"
            respuestaKey="fabricantes"
            columns={[{ key: 'nombre', label: 'Nombre' }]}
            fields={[{ key: 'nombre', label: 'Nombre', type: 'text', required: true }]}
            emptyRow={{ nombre: '' }}
          />
        )}
        {tab === 'proveedores' && (
          <ConfigCrudSection
            endpoint="/activos/config/proveedores"
            respuestaKey="proveedores"
            columns={PROV_COLUMNS}
            fields={[
              { key: 'nombre', label: 'Nombre', type: 'text', required: true },
              { key: 'contacto', label: 'Contacto (opcional)', type: 'text' },
            ]}
            emptyRow={{ nombre: '', contacto: '' }}
          />
        )}
        {tab === 'estados' && (
          <ConfigCrudSection
            endpoint="/activos/config/estados"
            respuestaKey="estados"
            columns={ESTADO_COLUMNS}
            fields={[
              { key: 'nombre', label: 'Nombre', type: 'text', required: true },
              { key: 'codigo', label: 'Código', type: 'text', required: true },
              { key: 'orden', label: 'Orden', type: 'number' },
            ]}
            emptyRow={{ nombre: '', codigo: '', orden: 0 }}
            canDelete={(r) => !r.esCore}
          />
        )}
      </div>
    </div>
  );
}
