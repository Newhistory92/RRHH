"use client";

// Pantalla de apoyo a la decision de ascenso, acotada a una gerencia.
//
// El universo es la gerencia y no toda la nomina a proposito: comparar un
// administrativo con alguien de ventanilla no dice nada, y era el defecto del
// ranking global.

import React from "react";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { TablaMerito } from "@/app/Componentes/Merito/TablaMerito";
import { getBackendUrl } from "@/app/util/backendUrl";
import type { FichaMerito } from "@/app/Interfas/Interfaces";

const BACKEND_URL = getBackendUrl();

interface Departamento {
  id: number;
  nombre: string;
}

export default function MeritoPage() {
  const [departamentos, setDepartamentos] = React.useState<Departamento[]>([]);
  const [depSeleccionado, setDepSeleccionado] = React.useState<number | null>(null);
  const [fichas, setFichas] = React.useState<FichaMerito[]>([]);
  const [cargando, setCargando] = React.useState(false);
  const [cargandoDeps, setCargandoDeps] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Carga la lista de gerencias al montar
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/departments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((json) => {
        const lista: Departamento[] = (json.departments ?? []).map(
          (d: { id: number; nombre: string }) => ({ id: d.id, nombre: d.nombre })
        );
        setDepartamentos(lista);
      })
      .catch(() => setDepartamentos([]))
      .finally(() => setCargandoDeps(false));
  }, []);

  // Busca las fichas cuando cambia la gerencia seleccionada
  const traer = React.useCallback(async (depId: number) => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/stats/merito/${depId}`, {
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
  }, []);

  const handleSeleccion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setDepSeleccionado(id);
    traer(id);
  };

  const nombreSeleccionado = departamentos.find((d) => d.id === depSeleccionado)?.nombre ?? "";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="text-primary w-6 h-6" aria-hidden="true" />
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Perfil de la gerencia
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 max-w-3xl">
          Cada dimension se muestra por separado con la cantidad de registros que la respalda.
          El sistema no ordena ni recomienda: reune la informacion disponible para quien
          necesite conocer en profundidad a su equipo.
        </p>
      </header>

      {/* Selector de gerencia */}
      <div className="mb-6">
        <label
          htmlFor="selector-gerencia"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Gerencia
        </label>
        {cargandoDeps ? (
          <p className="text-sm text-muted-foreground">Cargando gerencias…</p>
        ) : (
          <select
            id="selector-gerencia"
            className="border border-border rounded-lg px-3 py-2 bg-card text-foreground w-full max-w-sm"
            value={depSeleccionado ?? ""}
            onChange={handleSeleccion}
          >
            <option value="" disabled>
              Seleccionar gerencia…
            </option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Estado: sin seleccion */}
      {depSeleccionado === null && !cargandoDeps && (
        <p className="text-muted-foreground">
          Selecciona una gerencia para ver la evidencia de su personal.
        </p>
      )}

      {/* Estado: cargando fichas */}
      {cargando && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Cargando fichas de {nombreSeleccionado}…</p>
        </div>
      )}

      {/* Estado: error */}
      {error && !cargando && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-error" />
          <p className="text-muted-foreground max-w-md">{error}</p>
          {depSeleccionado !== null && (
            <button
              type="button"
              onClick={() => traer(depSeleccionado)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      {!cargando && !error && depSeleccionado !== null && (
        <TablaMerito fichas={fichas} />
      )}
    </div>
  );
}
