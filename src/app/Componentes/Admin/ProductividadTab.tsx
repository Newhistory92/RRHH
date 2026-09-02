"use client";

// Contenedor del tab Productividad, con las dos vistas.
//
// Clasificar es la tarea principal, asi que Rutas es la vista por defecto.
// Logs existe para poder mirar que es realmente una ruta antes de decidir.

import React from "react";
import { RutasProductividad } from "./RutasProductividad";
import { LogsExplorer } from "./LogsExplorer";

type Vista = "rutas" | "logs";

export function ProductividadTab() {
  const [vista, setVista] = React.useState<Vista>("rutas");
  // Ruta que quedo pendiente de clasificar al saltar desde el explorador. El
  // estado vive aca porque es lo unico que las dos vistas comparten.
  const [rutaASaltar, setRutaASaltar] = React.useState<string | undefined>();

  const saltarAClasificar = (ruta: string) => {
    setRutaASaltar(ruta);
    setVista("rutas");
  };

  const cambiarVista = (v: Vista) => {
    // Volver a Rutas por el boton, y no por el salto, muestra la tabla
    // completa: si quedara filtrada por la ruta anterior pareceria vacia.
    if (v === "rutas") setRutaASaltar(undefined);
    setVista(v);
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["rutas", "logs"] as Vista[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => cambiarVista(v)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              vista === v
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {v === "rutas" ? "Rutas" : "Logs"}
          </button>
        ))}
      </div>

      {vista === "rutas" ? (
        <RutasProductividad resaltar={rutaASaltar} />
      ) : (
        <LogsExplorer onClasificar={saltarAClasificar} />
      )}
    </div>
  );
}
