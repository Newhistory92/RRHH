"use client";

// Pantalla de apoyo a la decision de ascenso, acotada a una gerencia.
//
// El universo es la gerencia y no toda la nomina a proposito: comparar un
// administrativo con alguien de ventanilla no dice nada, y era el defecto del
// ranking global.

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { TablaMerito } from "@/app/Componentes/Merito/TablaMerito";
import { getBackendUrl } from "@/app/util/backendUrl";
import type { FichaMerito } from "@/app/Interfas/Interfaces";

const BACKEND_URL = getBackendUrl();

export default function MeritoPage({ departmentId }: { departmentId: number }) {
  const [fichas, setFichas] = React.useState<FichaMerito[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const traer = React.useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/stats/merito/${departmentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Ficha de merito: ${res.status}`);
      const json = await res.json();
      setFichas(json.data?.fichas ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, [departmentId]);

  React.useEffect(() => {
    traer();
  }, [traer]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Cargando fichas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <p className="text-muted-foreground max-w-md">{error}</p>
        <button
          onClick={traer}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Evidencia para decidir un ascenso
        </h1>
        <p className="text-muted-foreground mt-1 max-w-3xl">
          Cada dimension se muestra por separado, con la cantidad de evidencia que
          la respalda. El sistema no ordena a las personas ni recomienda a nadie:
          reune lo que sabe para que la decision la tome quien puede ponderar lo
          que ningun registro captura.
        </p>
      </header>
      <TablaMerito fichas={fichas} />
    </div>
  );
}
