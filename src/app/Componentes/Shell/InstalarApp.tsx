"use client";

// El ítem "Instalar app" del menú del avatar, y la hoja de instrucciones para
// iPhone. Son dos componentes porque el contenido del menú de Radix se
// desmonta al cerrarse: si la hoja viviera adentro, tocar el ítem la cerraría
// antes de que se vea. El estado vive en AppHeader y la hoja se dibuja fuera
// del menú.

import { Download, X } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useInstalarApp } from "@/app/util/useInstalarApp";

interface InstalarAppItemProps {
  onPedirInstruccionesIOS: () => void;
}

export function InstalarAppItem({ onPedirInstruccionesIOS }: InstalarAppItemProps) {
  const { estado, instalar } = useInstalarApp();

  if (estado === "no-disponible") return null;

  return (
    <DropdownMenuItem
      onClick={() => {
        if (estado === "disponible") {
          void instalar();
        } else {
          onPedirInstruccionesIOS();
        }
      }}
    >
      <Download size={16} className="mr-2" /> Instalar app
    </DropdownMenuItem>
  );
}

interface InstruccionesIOSProps {
  onCerrar: () => void;
}

export function InstruccionesIOS({ onCerrar }: InstruccionesIOSProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instalar-ios-titulo"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="instalar-ios-titulo" className="font-heading text-lg font-bold text-foreground">
            Agregar a la pantalla de inicio
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          En iPhone la instalación la hace Safari, no la app. Tocá el botón de
          Compartir y después <strong>Agregar a inicio</strong>.
        </p>
      </div>
    </div>
  );
}
