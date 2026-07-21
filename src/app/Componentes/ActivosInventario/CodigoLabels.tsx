'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

interface CodigoLabelsProps {
  valorQR: string;
  valorBarras: string;
}

export function CodigoLabels({ valorQR, valorBarras }: CodigoLabelsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 bg-card border border-border rounded-xl p-4 shadow-soft">
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
    </div>
  );
}
