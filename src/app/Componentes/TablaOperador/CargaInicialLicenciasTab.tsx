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

// Fuera del componente a proposito: definido adentro, React lo trataba como
// un tipo de componente nuevo en cada render (una identidad distinta por
// letra tipeada), asi que cada input perdia el foco despues de cada
// caracter -- la carga se volvia intipeable.
const Bloque = ({ titulo, ayuda, filas, valorDe, onEditar }: {
  titulo: string;
  ayuda: string;
  filas: SaldoCargaInicial[];
  valorDe: (fila: SaldoCargaInicial) => string;
  onEditar: (fila: SaldoCargaInicial, crudo: string) => void;
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
              onChange={(e) => onEditar(f, e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground text-right tabular-nums"
              aria-label={`Dias pendientes de ${f.categoria} ${f.anio}`}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

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
    //
    // Lo que no sea un numero finito se trata como vacio: sin esto, un NaN
    // viajaba como null en el JSON y el backend contestaba un 422 crudo en
    // vez del mensaje que tiene preparado.
    const n = Number(crudo);
    const limpio = crudo.trim() === "" || !Number.isFinite(n) ? null : n;
    siguiente.set(clave(fila), limpio);
    setCambios(siguiente);
  };

  // El valor que rige para un casillero, en orden de prioridad: lo que RRHH
  // acaba de escribir, lo que ya estaba guardado, y por ultimo el tope
  // configurado como sugerencia. Lo usan tanto el input como el guardado: si
  // se calcularan por separado, se guardaria algo distinto de lo que se ve.
  const efectivo = (fila: SaldoCargaInicial): number | null => {
    const k = clave(fila);
    if (cambios.has(k)) return cambios.get(k)!;
    // != null a proposito: un 0 ya guardado tiene que ganarle al default.
    if (fila.diasPendientes != null) return fila.diasPendientes;
    return fila.diasConfigurados;
  };

  const valorDe = (fila: SaldoCargaInicial): string => {
    const v = efectivo(fila);
    return v === null || v === undefined ? "" : String(v);
  };

  // Todo casillero con un numero se guarda, no solo los editados: la pantalla
  // llega con las anuales ya completas con el tope configurado, y la idea es
  // que RRHH revise, corrija las excepciones y guarde de una sola vez.
  const aGuardar = (): { anio: number; categoria: string; diasPendientes: number }[] => {
    if (!catalogo) return [];
    return [...catalogo.acumulables, ...catalogo.anuales]
      .map((f) => ({ fila: f, dias: efectivo(f) }))
      .filter((x) => x.dias !== null && x.dias !== undefined)
      .map((x) => ({
        anio: x.fila.anio,
        categoria: x.fila.categoria,
        diasPendientes: x.dias as number,
      }));
  };

  const guardar = async () => {
    const saldos = aGuardar();

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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="rounded-xl border-l-4 border-warning bg-warning-soft p-4">
        <div className="flex gap-3">
          <TriangleAlert className="text-warning shrink-0 mt-0.5" size={18} aria-hidden="true" />
          <p className="text-sm text-warning-soft-foreground">
            <strong>Carga inicial, por unica vez.</strong> Se cargan los dias que
            al empleado <strong>le quedan por tomarse</strong>, no los que ya se
            tomo. Las licencias del año en curso vienen con el tope configurado
            ya puesto: revisá y corregí solo las que el empleado ya usó. Al
            guardar se registran <strong>todos los casilleros con un numero</strong>,
            no solo los que edites. Un casillero vacio no se guarda; escribir{" "}
            <strong>0</strong> significa que no le queda ningun dia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Bloque
          titulo="Se arrastran de años anteriores"
          ayuda="Las vacaciones se acumulan y vencen a los 3 años. Cargar el saldo de cada año por separado."
          filas={catalogo.acumulables}
          valorDe={valorDe}
          onEditar={editar}
        />
        <Bloque
          titulo="Solo del año en curso"
          ayuda="Estas licencias no se arrastran: lo que no se usa en el año no pasa al siguiente."
          filas={catalogo.anuales}
          valorDe={valorDe}
          onEditar={editar}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {guardado && <p className="text-sm text-success">Saldos guardados.</p>}

      <button
        onClick={guardar}
        disabled={guardando || aGuardar().length === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        <Save size={16} />
        {guardando ? "Guardando..." : "Guardar saldos"}
      </button>
    </div>
  );
};
