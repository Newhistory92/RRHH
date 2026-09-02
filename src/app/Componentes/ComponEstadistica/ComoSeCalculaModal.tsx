"use client";

// Guia de uso del panel estadistico para autoridades y RRHH.
// Explica que hace cada tab y como se forman los numeros, en lenguaje
// no tecnico: el lector es una autoridad, no un desarrollador.

import { X, User, TrendingUp, BarChart2, MessageSquare, AlertTriangle, Info, CheckCircle2, MinusCircle } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ComoSeCalculaModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-overlay flex justify-center items-start z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guia-titulo"
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
            id="guia-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Cómo usar este panel
          </h2>

          {/* ── Tab 1: Indicadores por persona ── */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Indicadores por persona
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Muestra a <strong>todo el personal</strong> con su puntaje de actividad en el
              sistema de gestión. El puntaje refleja cuántos registros genera cada persona por
              hora efectiva de trabajo en los últimos 12 meses: quien trabaja más horas sin
              registrar actividad en el sistema tiene un puntaje bajo, no quien trabaja poco.
            </p>

            <div className="rounded-xl border-l-4 border-warning bg-warning-soft p-4 mb-3">
              <div className="flex gap-3">
                <AlertTriangle className="text-warning shrink-0 mt-0.5" size={18} aria-hidden="true" />
                <p className="text-sm text-warning-soft-foreground">
                  <strong>El puntaje mide actividad en el sistema, no desempeño general.</strong>{" "}
                  Áreas que trabajan en papel o en ventanilla pueden tener puntaje bajo aunque
                  rindan bien. Usarlo como ranking de mérito sin ese contexto es un error.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Fila icon={<CheckCircle2 size={16} className="text-success" />} titulo="Qué entra en el puntaje" detalle="Acciones completadas con éxito en el sistema de gestión, divididas por las horas efectivas trabajadas (según planilla de jornada). Qué acciones cuentan como trabajo lo define el administrador del sistema." />
              <Fila icon={<MinusCircle size={16} className="text-muted-foreground" />} titulo="Qué NO entra" detalle="Tardanzas, licencias, ausencias, quejas, feedback de compañeros, habilidades. Aparecen en otras columnas como contexto, pero no modifican el número." />
            </div>

            <div className="mt-3 rounded-xl border border-border overflow-hidden">
              <LeerFila valor="Un número" sig="La persona fue medida ese período." />
              <LeerFila valor="N/A" sig="No hay datos suficientes. No es un cero: es ausencia de información." />
              <LeerFila valor="Promedio" sig="El área está marcada como exenta: el sistema usa el promedio del grupo porque no puede medir a cada integrante por separado." ultimo />
            </div>
          </section>

          {/* ── Tab 2: Mérito ── */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Mérito
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Muestra el <strong>perfil detallado del personal de una gerencia</strong>, con cuatro
              dimensiones separadas. A diferencia de "Indicadores por persona", aquí no hay un
              número único: cada dimensión se lee por separado y la columna "Evidencia" indica
              cuántas de las cuatro están disponibles para esa persona.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {[
                { nombre: "Cumplimiento", desc: "Asistencia real: días trabajados y días con jornada fuera del rango habitual en los últimos 12 meses." },
                { nombre: "Actividad", desc: "El mismo puntaje de eventos por hora que aparece en 'Indicadores por persona'." },
                { nombre: "Volumen operativo", desc: "Datos de atención al público del sistema de turnos: cantidad de personas atendidas y tiempo promedio por atención." },
                { nombre: "Feedback", desc: "Promedio de las evaluaciones que hicieron los compañeros de trabajo. Solo aparece si hay al menos 3 evaluadores; con menos no se muestra para proteger la identidad de quien evaluó." },
              ].map((d) => (
                <div key={d.nombre} className="rounded-lg border border-border bg-muted p-3">
                  <p className="font-semibold text-sm text-foreground mb-0.5">{d.nombre}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-info-soft p-4">
              <div className="flex gap-3">
                <Info className="text-info shrink-0 mt-0.5" size={18} aria-hidden="true" />
                <p className="text-sm text-info-soft-foreground">
                  <strong>Sin datos</strong> no es lo mismo que bajo rendimiento: significa que no
                  hay registros suficientes para esa dimensión. La columna "Evidencia" (ej.{" "}
                  <em>2 de 4</em>) indica con cuántas dimensiones cuenta la información antes de
                  sacar conclusiones.
                </p>
              </div>
            </div>
          </section>

          {/* ── Tab 3: Estadísticas Globales ── */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Estadísticas Globales
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Vista de conjunto: promedio general de puntaje de actividad, distribución por
              departamento, condición laboral y categoría. Útil para comparar áreas entre sí
              o ver la evolución del promedio institucional en el tiempo.
            </p>
          </section>

          {/* ── Tab 4: Feedback 360° ── */}
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Feedback 360°
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Resumen de los ciclos de evaluación entre pares. Cada empleado puede evaluar a
              compañeros de trabajo y ser evaluado por ellos.
            </p>
            <p className="text-sm text-muted-foreground">
              El puntaje de feedback <strong>no se suma al puntaje de actividad</strong>: se
              muestra en su propia columna en "Indicadores por persona" y en la dimensión
              "Feedback" de "Mérito". El piso de 3 evaluadores existe para que no sea posible
              deducir quién evaluó a quién cuando el equipo es chico.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Fila({ icon, titulo, detalle }: { icon: React.ReactNode; titulo: string; detalle: string }) {
  return (
    <div className="flex gap-3 items-start bg-muted rounded-lg p-3 border border-border">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-medium text-foreground text-sm">{titulo}</p>
        <p className="text-sm text-muted-foreground">{detalle}</p>
      </div>
    </div>
  );
}

function LeerFila({ valor, sig, ultimo }: { valor: string; sig: string; ultimo?: boolean }) {
  return (
    <div className={`grid grid-cols-[6rem_1fr] gap-3 p-3 bg-card ${ultimo ? "" : "border-b border-border"}`}>
      <span className="font-mono text-sm font-semibold text-foreground">{valor}</span>
      <span className="text-sm text-muted-foreground">{sig}</span>
    </div>
  );
}
