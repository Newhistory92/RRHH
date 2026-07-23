'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Printer } from 'lucide-react';

interface CodigoLabelsProps {
  valorQR: string;
  valorBarras: string;
  nombre?: string;
  numeroInventario?: string;
  numeroSerie?: string | null;
  departamento?: string | null;
  oficina?: string | null;
}

export function CodigoLabels({
  valorQR, valorBarras, nombre, numeroInventario, numeroSerie, departamento, oficina,
}: CodigoLabelsProps) {
  const tieneDatos = Boolean(nombre || numeroInventario || numeroSerie || departamento || oficina);
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-soft space-y-3">
      <div className="flex items-center justify-between print:hidden">
        <span className="text-xs font-semibold text-muted-foreground">Etiqueta</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-muted"
        >
          <Printer size={14} /> Imprimir etiqueta
        </button>
      </div>

      <div className="print-etiqueta flex flex-wrap items-center gap-6">
        {valorQR && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG value={valorQR} size={96} />
            </div>
            <span className="text-xs text-muted-foreground">QR</span>
          </div>
        )}
        {valorBarras && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-2 rounded-lg">
              <Barcode value={valorBarras} height={48} fontSize={12} margin={0} />
            </div>
            <span className="text-xs text-muted-foreground">Código de barras</span>
          </div>
        )}
        {tieneDatos && (
          <div className="text-xs text-foreground space-y-0.5">
            {nombre && <p className="font-semibold">{nombre}</p>}
            {numeroInventario && <p>N° inventario: {numeroInventario}</p>}
            {numeroSerie && <p>N° de serie: {numeroSerie}</p>}
            {departamento && <p>Departamento: {departamento}</p>}
            {oficina && <p>Oficina: {oficina}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
