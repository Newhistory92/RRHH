"use client";

// Guia de la encuesta de Feedback 360.
//
// Explica el mecanismo a quien la responde: a quien evalua, que hace el
// sistema con lo que dice ahi, y por que su identidad no queda expuesta. No
// entra en el detalle de cada pregunta -- eso lo decide quien configura el
// modulo y puede cambiar con el tiempo.

import { X, Users, ShieldCheck, ListChecks, TrendingUp } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ComoFuncionaFeedbackModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-overlay flex justify-center items-start z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-guia-titulo"
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
            id="feedback-guia-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            En qué consiste esta encuesta
          </h2>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                A quién evaluás
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A tus compañeros del mismo departamento u oficina, y a tu superior
              directo. A tu superior te van a aparecer además preguntas de
              liderazgo, que no se les hacen a tus compañeros.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Qué tipo de preguntas hay
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              La mayoría son de desempeño — cosas como respeto y convivencia,
              comunicación, responsabilidad o profesionalismo — y promedian para
              formar el puntaje de esa persona.
            </p>
            <p className="text-sm text-muted-foreground">
              Hay también preguntas sobre conductas de riesgo. Esas no entran en
              ningún promedio: si contestás que viste algo grave, sale como una
              alerta aparte para que RRHH la revise, en vez de diluirse entre el
              resto de las respuestas.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Por qué es anónima de verdad
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Los resultados de una persona no se muestran Nombres y  hasta que la evaluaron
              al menos <strong>3 personas distintas</strong>. Por debajo de ese
              piso, tu respuesta individual sería fácil de identificar, así que el
              sistema directamente no muestra nada hasta juntar ese mínimo.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Cada cuánto se repite
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              La encuesta se abre , cada
              trimestre. Dentro de un mismo ciclo podés ir
              contestando de a una pregunta por vez; el sistema te muestra la
              siguiente pendiente cada vez que entrás.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
