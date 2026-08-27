import { MessageSquare } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';

export interface PreguntaFeedback {
  id: number;
  texto: string;
  categoria?: string;
  tipo: 'escala' | 'texto_libre';
  opcionesEscala: string[] | null;
}

export interface SiguienteFeedback {
  evaluado: { id: number; name: string } | null;
  pregunta: PreguntaFeedback | null;
}

export interface FeedbackStatus {
  total: number;
  completadas: number;
}

interface FeedbackTabProps {
  siguiente: SiguienteFeedback | null;
  status: FeedbackStatus | null;
  loading: boolean;
  onSubmit: (valorEscala: number | null, textoLibre: string | null) => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ siguiente, status, loading, onSubmit }) => {
  const [valorEscala, setValorEscala] = useState<number | null>(null);
  const [textoLibre, setTextoLibre] = useState('');

  useEffect(() => {
    setValorEscala(null);
    setTextoLibre('');
  }, [siguiente?.pregunta?.id, siguiente?.evaluado?.id]);

  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-primary" />
      <span className="font-heading text-2xl font-bold text-foreground">Evaluación del Equipo de Trabajo</span>
    </div>
  );

  const pregunta = siguiente?.pregunta ?? null;
  const evaluado = siguiente?.evaluado ?? null;

  const escalaOptions = pregunta?.opcionesEscala
    ? pregunta.opcionesEscala.map((label, idx) => ({ label, value: 5 - idx }))
    : [];

  const canSubmit = pregunta
    ? (pregunta.tipo === 'escala' ? valorEscala !== null : textoLibre.trim().length > 0)
    : false;

  const handleSubmit = () => {
    if (!pregunta) return;
    onSubmit(pregunta.tipo === 'escala' ? valorEscala : null, pregunta.tipo === 'texto_libre' ? textoLibre : null);
  };

  const progressPercentage = status && status.total > 0 ? (status.completadas / status.total) * 100 : 0;

  return (
    <Card title={cardTitle}>
      <span className="text-base font-bold text-muted-foreground sm:ml-2">
        Tu Opinión es Totalmente Anónima
      </span>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-foreground">Progreso de Evaluaciones</span>
        </div>
        <ProgressBar
          value={progressPercentage}
          displayValueTemplate={() => status ? `${status.completadas}/${status.total}` : '0/0'}
        />
        <div className="mt-2 mb-5 text-xs text-muted-foreground">
          {status && status.total > 0
            ? `${Math.round(progressPercentage)}% completado`
            : 'Sin evaluaciones disponibles'}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : pregunta ? (
        <div className="space-y-6">
          <Card className="p-1 rounded-lg border border-primary/30">
            {evaluado ? (
              <p className="text-lg text-foreground mb-3">
                Sobre tu compañero/a{' '}
                <span className="font-bold text-primary">{evaluado.name}</span>:
              </p>
            ) : (
              <p className="text-lg text-foreground mb-3">Sobre el ambiente laboral:</p>
            )}
            <p className="text-xl font-semibold text-primary">
              {pregunta.texto}
            </p>
          </Card>

          {pregunta.tipo === 'escala' ? (
            <div className="flex justify-center">
              <SelectButton
                value={valorEscala}
                onChange={(e) => setValorEscala(e.value)}
                options={escalaOptions}
                className="flex flex-wrap justify-center gap-2 [&_.p-button]:!m-0 [&_.p-button]:!rounded-lg [&_.p-button]:!border"
              />
            </div>
          ) : (
            <InputTextarea
              value={textoLibre}
              onChange={(e) => setTextoLibre(e.target.value)}
              rows={4}
              className="w-full"
              placeholder="Escribí tu respuesta..."
            />
          )}

          <Button
            label="Enviar Feedback"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 text-lg"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-muted p-6 rounded-lg border border-border">
            <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-4">
              Ya completaste todas las evaluaciones disponibles de este período. Volvé más adelante para el próximo ciclo.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
