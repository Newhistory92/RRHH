"use client";

// Carga inicial de saldos de licencias. TRANSITORIO.
//
// Existe para poblar el saldo de los empleados que ya venian trabajando
// cuando el sistema arranco: sin esto su consumo da cero y el sistema les
// otorga de nuevo vacaciones que ya se tomaron.
//
// Se borra junto con el router del backend cuando termine la migracion. Hasta
// entonces se apaga quitandole el permiso licencias.cargaInicial al rol.

import { useCallback, useEffect, useState } from "react";
import { Save, TriangleAlert } from "lucide-react";
import { apiClient } from "@/app/util/apiClient";
import type {
  CatalogoCargaInicial,
  Employee,
  SaldoCargaInicial,
} from "@/app/Interfas/Interfaces";

const clave = (f: { anio: number; categoria: string }) => `${f.anio}|${f.categoria}`;

export const CargaInicialLicenciasTab = ({ employee }: { employee: Employee }) => {
  const [catalogo, setCatalogo] = useState<CatalogoCargaInicial | null>(null);
  const [cambios, setCambios] = useState<Map<string, number | null>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const traer = useCallback(() => {
    setCargando(true);
    apiClient
      .get<CatalogoCargaInicial>(`/licenses/carga-inicial/${employee.id}`)
      .then((c) => {
        setCatalogo(c);
        setCambios(new Map());
        setError(null);
      })
      .catch((e) => setError(e.message ?? "No se pudo cargar el catalogo"))
      .finally(() => setCargando(false));
  }, [employee.id]);

  useEffect(() => { traer(); }, [traer]);

  const editar = (fila: SaldoCargaInicial, crudo: string) => {
    setGuardado(false);
    const siguiente = new Map(cambios);
    // Vacio y cero son distintos: vacio deja que rija el calculo del sistema,
    // cero afirma que no le queda ningun dia.
    siguiente.set(clave(fila), crudo.trim() === "" ? null : Number(crudo));
    setCambios(siguiente);
  };

  const valorDe = (fila: SaldoCargaInicial): string => {
    const k = clave(fila);
    const v = cambios.has(k) ? cambios.get(k)! : fila.diasPendientes;
    return v === null || v === undefined ? "" : String(v);
  };

  const guardar = async () => {
    const saldos = Array.from(cambios.entries())
      .filter(([, dias]) => dias !== null)
      .map(([k, dias]) => {
        const [anio, categoria] = k.split("|");
        return { anio: Number(anio), categoria, diasPendientes: dias as number };
      });

    if (saldos.length === 0) return;

    setGuardando(true);
    setError(null);
    try {
      await apiClient.put(`/licenses/carga-inicial/${employee.id}`, { saldos });
      setGuardado(true);
      traer();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="p-6 text-center text-muted-foreground">Cargando saldos...</div>;
  }

  if (error && !catalogo) {
    return <div className="p-6 text-center text-error">{error}</div>;
  }

  if (!catalogo) return null;

  const Bloque = ({ titulo, ayuda, filas }: {
    titulo: string; ayuda: string; filas: SaldoCargaInicial[];
  }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-heading font-semibold text-foreground">{titulo}</h3>
      <p className="text-xs text-muted-foreground mb-3">{ayuda}</p>
      {filas.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No hay licencias de este tipo para este empleado.
        </p>
      ) : (
        <div className="space-y-2">
          {filas.map((f) => (
            <div key={clave(f)} className="grid grid-cols-[1fr_5rem_6rem] gap-3 items-center">
              <span className="text-sm text-foreground">{f.categoria}</span>
              <span className="text-sm text-muted-foreground tabular-nums">{f.anio}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="—"
                value={valorDe(f)}
                onChange={(e) => editar(f, e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground text-right tabular-nums"
                aria-label={`Dias pendientes de ${f.categoria} ${f.anio}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="rounded-xl border-l-4 border-warning bg-warning-soft p-4">
        <div className="flex gap-3">
          <TriangleAlert className="text-warning shrink-0 mt-0.5" size={18} aria-hidden="true" />
          <p className="text-sm text-warning-soft-foreground">
            <strong>Carga inicial, por unica vez.</strong> Se cargan los dias que
            al empleado <strong>le quedan por tomarse</strong>, no los que ya se
            tomo. Dejar un casillero vacio significa no cargar nada y que rija el
            calculo del sistema; escribir <strong>0</strong> significa que no le
            queda ningun dia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Bloque
          titulo="Se arrastran de años anteriores"
          ayuda="Las vacaciones se acumulan y vencen a los 3 años. Cargar el saldo de cada año por separado."
          filas={catalogo.acumulables}
        />
        <Bloque
          titulo="Solo del año en curso"
          ayuda="Estas licencias no se arrastran: lo que no se usa en el año no pasa al siguiente."
          filas={catalogo.anuales}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {guardado && <p className="text-sm text-success">Saldos guardados.</p>}

      <button
        onClick={guardar}
        disabled={guardando || cambios.size === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        <Save size={16} />
        {guardando ? "Guardando..." : "Guardar saldos"}
      </button>
    </div>
  );
};
