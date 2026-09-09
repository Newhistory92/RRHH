"use client";

// Guia de Gestion de Tests.
//
// Esta pantalla configura el catalogo (tests tecnicos por profesion,
// habilidades blandas, mapeo titulo->profesion); el circuito de rendir un
// test corre en otra pantalla, del lado del empleado. La guia explica las
// dos puntas para que quien configura entienda que efecto tiene lo que carga
// aca.

import { X, ListChecks, Timer, Award, Link2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ComoFuncionanTestsModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-overlay flex justify-center items-start z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tests-guia-titulo"
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
            id="tests-guia-titulo"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Cómo funciona Gestión de Tests
          </h2>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Qué se configura acá
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta pantalla arma el catálogo: los tests técnicos con sus preguntas,
              agrupados por profesión, y el catálogo de habilidades blandas que las
              personas se autoevalúan en su CV. Acá no rinde el test nadie — esto
              es lo que después le aparece disponible a cada empleado.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Timer size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Cómo rinde un test el empleado
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              El sistema le arma el test tomando hasta 10 preguntas al azar de las
              que hay cargadas para esa habilidad, evitando repetir las del último
              intento cuando hay al menos 5 disponibles sin repetir. El resultado
              se mide en porcentaje de aciertos y se traduce a una escala fija:
              menos de 50% es <strong>Malo</strong>, entre 50% y 79% es{" "}
              <strong>Bueno</strong>, y 80% o más es <strong>Excelente</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Después de rendir, esa misma habilidad queda en espera{" "}
              <strong>3 meses</strong> antes de poder volver a intentarla.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Qué pasa con el resultado
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada intento queda en el historial del empleado, y el último resultado
              actualiza su nivel en esa habilidad. Sacar{" "}
              <strong>Excelente</strong> certifica la habilidad; con Malo o Bueno
              queda registrado el nivel pero sin certificar.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={20} className="text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Para qué sirve el mapeo de títulos
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Asocia un título académico con una profesión del catálogo, para que el
              sistema pueda relacionar el título que carga cada persona en su perfil
              con el grupo de tests técnicos que le corresponde.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
