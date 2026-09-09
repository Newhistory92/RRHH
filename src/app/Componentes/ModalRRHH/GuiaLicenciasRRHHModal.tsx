"use client";

// Guia de licencias para RRHH, en la pantalla Lista de Empleados.
//
// A diferencia de ComoFuncionanLicenciasModal (que ve quien pide una
// licencia), esta agrega la tabla de dias configurados por categoria: es
// informacion de gestion, no algo que el empleado que solicita necesite ver.
// El resto del mecanismo es el mismo, descripto desde la perspectiva de quien
// administra en vez de quien solicita.
//
// Los dias de cada categoria se leen de la configuracion en vivo para que la
// tabla no quede desactualizada cuando RRHH cambia un tope.

import { useEffect, useState } from "react";
import { X, CalendarDays, Clock, ShieldCheck, Info, AlertTriangle, ListChecks } from "lucide-react";
import { apiClient } from "@/app/util/apiClient";

interface ConfigLicencia {
  categoria: string;
  diasTotales: number;
}

interface DiasPorCategoria {
  categoria: string;
  // Un string ("N días") cuando todos los contratos coinciden en el año
  // actual; un rango ("N–M días según contrato") cuando no.
  texto: string;
}

interface Props {
  onClose: () => void;
}

export function GuiaLicenciasRRHHModal({ onClose }: Props) {
  const [tipos, setTipos] = useState<DiasPorCategoria[]>([]);

  useEffect(() => {
    const anioActual = new Date().getFullYear();
    apiClient
      .get<{ configuraciones: ConfigLicencia[] }>(`/licenses/configuracion?anio=${anioActual}`)
      .then((r) => {
        // Una categoria puede tener distintos diasTotales segun el tipo de
        // contrato dentro del mismo año (por ejemplo "contratado" vs.
        // "permanente"), asi que se juntan todos los valores vistos en vez
        // de quedarse con el primero que aparezca.
        const valoresPorCategoria = new Map<string, Set<number>>();
        for (const c of r.configuraciones ?? []) {
          if (!valoresPorCategoria.has(c.categoria)) valoresPorCategoria.set(c.categoria, new Set());
          valoresPorCategoria.get(c.categoria)!.add(c.diasTotales);
        }
        setTipos(
          [...valoresPorCategoria].map(([categoria, valores]) => {
            const ordenados = [...valores].sort((a, b) => a - b);
            const texto =
              ordenados.length === 1
                ? `${ordenados[0]} días`
                : `${ordenados[0]}–${ordenados[ordenados.length - 1]} días según contrato`;
            return { categoria, texto };
          })
        );
      })
      .catch(() => setTipos([]));
  }, []);

  return (
    <div
      className="fixed inset-0 bg-overlay flex justify-center items-start z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="licencias-guia-rrhh-titulo"
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl my-8 relative border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Guía de uso
          </p>
          <h2
            id="licencias-guia-rrhh-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Cómo funcionan las licencias
          </h2>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Cómo se forma el saldo de cada persona
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Cada tipo de licencia tiene una cantidad de días que le corresponden
              a la persona por año. El saldo disponible es esa cantidad menos los
              días que ya se tomó y fueron aprobados. Una solicitud pendiente
              todavía no descuenta: recién lo hace cuando se aprueba.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Qué se acumula y qué no
              </h3>
            </div>
            <div className="rounded-xl border-l-4 border-warning bg-warning-soft p-4 mb-3">
              <div className="flex gap-3">
                <AlertTriangle className="text-warning shrink-0 mt-0.5" size={18} aria-hidden="true" />
                <p className="text-sm text-warning-soft-foreground">
                  <strong>Solo las vacaciones se acumulan, y vencen a los 3 años.</strong>{" "}
                  Lo que no se usa de un año pasa al siguiente, pero el sistema da de
                  baja automáticamente el saldo que cumple tres años sin usarse.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              El resto de las licencias es anual: lo que no se usa dentro del año
              no pasa al siguiente. No hace falta que la persona las pida para "no
              perderlas" — se otorgan cuando ocurre el hecho que las justifica.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Por qué cada persona ve un listado distinto
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              El listado se adapta a cada persona. Las licencias por nacimiento y
              por embarazo se muestran según corresponda, y las de encuadre médico
              o excepcional — accidente de trabajo, enfermedad profesional,
              licencia sin goce de haberes — las gestiona RRHH directamente y no
              aparecen para que la persona las solicite por el circuito común.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                El recorrido de una solicitud
              </h3>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <Paso n="1" texto="La persona elige el tipo de licencia y las fechas. El sistema cuenta los días hábiles y verifica que no supere su saldo." />
              <Paso n="2" texto="La solicitud le llega a su superior, que la aprueba o la rechaza." />
              <Paso n="3" texto="Aprobada, RRHH la aplica y recién ahí se descuentan los días del saldo." ultimo />
            </div>
          </section>

          {tipos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={20} className="text-primary shrink-0" aria-hidden="true" />
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Días por tipo de licencia
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Los valores vigentes según la configuración actual. Si se
                cambian, este listado lo refleja solo.
              </p>
              <div className="rounded-xl border border-border overflow-hidden">
                {tipos.map((t, i) => (
                  <div
                    key={t.categoria}
                    className={`grid grid-cols-[1fr_10rem] gap-3 p-3 bg-card ${
                      i === tipos.length - 1 ? "" : "border-b border-border"
                    }`}
                  >
                    <span className="text-sm text-foreground">{t.categoria}</span>
                    <span className="text-sm text-muted-foreground text-right tabular-nums">
                      {t.texto}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Paso({ n, texto, ultimo }: { n: string; texto: string; ultimo?: boolean }) {
  return (
    <div className={`grid grid-cols-[2rem_1fr] gap-3 p-3 bg-card ${ultimo ? "" : "border-b border-border"}`}>
      <span className="font-mono text-sm font-semibold text-primary">{n}</span>
      <span className="text-sm text-muted-foreground">{texto}</span>
    </div>
  );
}
