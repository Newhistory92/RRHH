"use client";

// Explicacion del score para autoridades y RRHH.
//
// El panel muestra un numero por empleado sin decir de donde sale. Sin esto,
// una autoridad razonablemente supone que ese numero resume todo lo que ve en
// la fila -tardanzas, licencias, feedback- y hoy no es asi. El modal existe
// para que nadie decida sobre una persona creyendo que el score dice mas de lo
// que dice.
//
// Lenguaje deliberadamente no tecnico: el lector es una autoridad, no un
// desarrollador. Nada de nombres de tablas ni de endpoints.

import { X, AlertTriangle, CheckCircle2, MinusCircle, Info } from "lucide-react";

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
      aria-labelledby="como-se-calcula-titulo"
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl my-8 relative border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Guía para autoridades
          </p>
          <h2
            id="como-se-calcula-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3"
          >
            Cómo se forma el puntaje
          </h2>
          <p className="text-muted-foreground mb-6">
            Antes de usar esta pantalla para decidir sobre una persona, conviene
            saber qué mide realmente el número y qué no mide.
          </p>

          {/* Advertencia principal */}
          <div className="rounded-xl border-l-4 border-warning bg-warning-soft p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle
                className="text-warning shrink-0 mt-0.5"
                size={20}
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-warning-soft-foreground mb-1">
                  El puntaje no resume toda la fila
                </p>
                <p className="text-sm text-warning-soft-foreground">
                  Aunque la tabla muestre tardanzas, licencias y otros datos al lado,
                  hoy el puntaje se calcula con <strong>una sola fuente</strong>: la
                  actividad registrada en el sistema de gestión. El resto de las
                  columnas es información de contexto que <strong>no</strong> entra en
                  el cálculo.
                </p>
              </div>
            </div>
          </div>

          {/* Qué entra y qué no */}
          <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
            Qué entra en el puntaje
          </h3>
          <div className="space-y-2 mb-6">
            <Fila
              icon={<CheckCircle2 size={18} className="text-success" />}
              titulo="Actividad en el sistema de gestión"
              detalle="Con qué intensidad la persona trabaja dentro del sistema durante cada sesión de uso, promediado en los últimos 12 meses."
            />
            <Fila
              icon={<MinusCircle size={18} className="text-muted-foreground" />}
              titulo="Asistencia — solo como desempate"
              detalle="Únicamente en áreas marcadas como exentas, para ordenar entre compañeros. No suma ni resta puntos al resto del personal."
            />
          </div>

          <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
            Qué NO entra, aunque se muestre
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {[
              "Tardanzas",
              "Licencias",
              "Ausencias",
              "Quejas",
              "Feedback de compañeros",
              "Habilidades y capacitación",
            ].map((t) => (
              <span
                key={t}
                className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2 border border-border"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Cómo leer los valores */}
          <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
            Cómo leer cada valor
          </h3>
          <div className="rounded-xl border border-border overflow-hidden mb-6">
            <LeerFila
              valor="Un número"
              sig="La persona fue medida. El valor refleja su actividad en el sistema."
            />
            <LeerFila
              valor="0.0"
              sig="Atención: puede significar que la persona no usa este sistema, no que haya trabajado poco. No lo interprete como bajo desempeño sin verificarlo."
              alerta
            />
            <LeerFila
              valor="N/A"
              sig="No hay datos suficientes para calcular un puntaje. No es un cero: es ausencia de información."
              ultimo
            />
          </div>

          {/* Límite de uso */}
          <div className="rounded-xl bg-info-soft p-4 mb-2">
            <div className="flex gap-3">
              <Info
                className="text-info shrink-0 mt-0.5"
                size={20}
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-info-soft-foreground mb-1">
                  Para qué sirve y para qué no
                </p>
                <p className="text-sm text-info-soft-foreground">
                  Este panel es una <strong>herramienta de apoyo</strong>: sirve para
                  detectar casos que vale la pena mirar de cerca. No es una evaluación
                  de desempeño ni una recomendación de ascenso. Dos personas de áreas
                  distintas no son comparables directamente, porque no todas tienen la
                  misma oportunidad de generar actividad registrada.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Para ver la evidencia detallada de una persona, abra su ficha desde el
            ranking.
          </p>
        </div>
      </div>
    </div>
  );
}

function Fila({
  icon,
  titulo,
  detalle,
}: {
  icon: React.ReactNode;
  titulo: string;
  detalle: string;
}) {
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

function LeerFila({
  valor,
  sig,
  alerta,
  ultimo,
}: {
  valor: string;
  sig: string;
  alerta?: boolean;
  ultimo?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[5.5rem_1fr] gap-3 p-3 ${
        ultimo ? "" : "border-b border-border"
      } ${alerta ? "bg-warning-soft" : "bg-card"}`}
    >
      <span
        className={`font-mono text-sm font-semibold ${
          alerta ? "text-warning" : "text-foreground"
        }`}
      >
        {valor}
      </span>
      <span
        className={`text-sm ${
          alerta ? "text-warning-soft-foreground" : "text-muted-foreground"
        }`}
      >
        {sig}
      </span>
    </div>
  );
}
