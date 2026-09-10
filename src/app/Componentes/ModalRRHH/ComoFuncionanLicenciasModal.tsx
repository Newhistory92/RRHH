"use client";

// Guia de licencias para quien las solicita.
// Explica el mecanismo -- lo verificable contra el codigo -- y no el encuadre
// normativo, que no vive en este sistema.
//
// La tabla de dias por categoria vive en GuiaLicenciasRRHHModal (pantalla
// Lista de Empleados), no aca: ese dato es de gestion, no algo que quien pide
// una licencia necesite para entender como funciona el circuito.

import { X, CalendarDays, Clock, ShieldCheck, Info, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ComoFuncionanLicenciasModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-overlay flex justify-center items-start z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="licencias-guia-titulo"
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
            id="licencias-guia-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Cómo funcionan las licencias
          </h2>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Cómo se forma tu saldo
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Cada tipo de licencia tiene una cantidad de días que te corresponden
              por año. Tu saldo disponible es esa cantidad menos los días que ya
              te tomaste y fueron aprobados. Una solicitud pendiente todavía no
              descuenta: recién lo hace cuando la aprueban.
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
                  <strong>Solo las licencias por vacaciones se acumulan de un año a otro, con un límite máximo de acumulación de hasta 3 años.</strong>{" "}
                  El saldo que no se utilice durante un año permanecerá disponible; sin embargo, al cumplirse los 3 años sin utilizarse, 
                  el sistema dará de baja automáticamente el saldo correspondiente al período más antiguo.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              El resto de las licencias es anual: lo que no se usa dentro del año
              no pasa al siguiente. No hace falta pedirlas para "no perderlas" —
              se otorgan cuando ocurre el hecho que las justifica.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Por qué no ves todas las licencias
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              La lista se adapta a cada persona. Las licencias por nacimiento y por
              embarazo se muestran según corresponda, y las de encuadre médico o
              excepcional — accidente de trabajo, enfermedad profesional, licencia
              sin goce de haberes — las gestiona RRHH directamente y no aparecen
              para solicitarlas por el circuito común. Tampoco figuran en tu saldo
              hasta que RRHH te carga los días que correspondan.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Vacaciones: por qué el año que ves puede ser el anterior
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Las vacaciones no se cuentan por año calendario sino por período,
              y cada período se habilita el <strong>1° de octubre</strong>. Hasta
              esa fecha sigue vigente el período anterior: por eso, si estás en
              septiembre de 2026, tu saldo de vacaciones aparece bajo{" "}
              <strong>&ldquo;Año 2025&rdquo;</strong> — y esos son los días que
              podés tomar hoy, no un saldo vencido. El 1° de octubre de 2026 se
              abre el período 2026.
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Ese año aparece siempre, incluso sin movimientos: es el período
              que te corresponde. Los períodos anteriores solo se muestran si
              tienen algo real — días que te quedaron sin usar o licencias ya
              tomadas.
            </p>
            <p className="text-sm text-muted-foreground">
              Además, las vacaciones solo pueden solicitarse entre el{" "}
              <strong>1° de octubre y el 30 de abril</strong>. Si tenés días
              acumulados de varios períodos, el sistema los combina tomando
              primero los más antiguos, y la nota que genera aclara cuántos días
              salen de cada año.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                El recorrido de una solicitud
              </h3>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <Paso n="1" texto="Elegís el tipo de licencia y las fechas. El sistema cuenta los días hábiles y verifica que no superes tu saldo." />
              <Paso n="2" texto="La solicitud le llega a tu superior, que la aprueba o la rechaza." />
              <Paso n="3" texto="Aprobada, RRHH la aplica y recién ahí se descuentan los días de tu saldo." ultimo />
            </div>
          </section>
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
