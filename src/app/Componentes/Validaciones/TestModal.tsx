import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Clock, CheckCircle } from 'lucide-react';

interface TechnicalSkillRef {
  id: number;
  nombre: string;
}

interface TestModalProps {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  technicalSkill: TechnicalSkillRef;
  employeeId: number;
}

export default function TestModal({ visible, onHide, onSuccess, technicalSkill, employeeId }: TestModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Timer (10 minutos = 600 segundos)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: string; correctCount: number; totalQuestions: number } | null>(null);

  // Cargar las preguntas cuando se abre el modal
  useEffect(() => {
    if (!visible) return;

    const generateTest = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      setTimeLeft(600);
      setUserAnswers({});
      
      try {
        const res = await fetch('/api/skill-validation/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            technicalSkillId: technicalSkill.id
          })
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo generar el examen.');
        }

        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateTest();
  }, [visible, technicalSkill, employeeId]);

  // Manejar el timer
  useEffect(() => {
    if (!visible || loading || result || error) return;

    if (timeLeft <= 0) {
      // Auto submit si el tiempo se agoto
      handleSubmit();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, visible, loading, result, error]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/skill-validation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           employeeId,
           technicalSkillId: technicalSkill.id,
           questions,
           userAnswers
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar examen.');
      
      setResult({
        score: data.score,
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
      });

    } catch(err: any) {
      alert("Error enviando resultados: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Dialog visible={visible} onHide={onHide} header="Validacion Bloqueada" style={{ width: '50vw' }}>
         <div className="p-4 text-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">No puedes rendir este examen aun</h3>
            <p className="text-gray-700">{error}</p>
            <Button label="Cerrar" className="mt-4" onClick={onHide} />
         </div>
      </Dialog>
    );
  }

  if (result) {
    const isSuccess = result.score === "Aprobado";
    return (
      <Dialog visible={visible} onHide={onHide} header="Resultados del Examen" style={{ width: '40vw' }} closable={false}>
         <div className="p-6 text-center space-y-4">
            <CheckCircle size={60} className={`mx-auto ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
            <h2 className="text-2xl font-bold text-gray-800">
               {isSuccess ? 'Examen Aprobado!' : 'Examen Reprobado'}
            </h2>
            <p className="text-lg">
               Puntuacion: <strong>{result.correctCount} / {result.totalQuestions}</strong> correctas
            </p>
            <p className="text-gray-500 text-sm">
               {isSuccess 
                 ? "Esta habilidad tecnica ahora esta certificada. Felicidades!"
                 : "No has alcanzado el 60% requerido. Deberas esperar 90 dias (Cooldown) para volver a intentarlo."}
            </p>
            <Button label="Entendido" className="p-button-primary mt-4" onClick={() => { 
                onHide(); 
                if (onSuccess) onSuccess(); 
            }} />
         </div>
      </Dialog>
    );
  }

  return (
    <Dialog 
       visible={visible} 
       onHide={loading ? () => {} : onHide} 
       header="Test de Validacion de Conocimientos" 
       style={{ width: '60vw', minHeight: '50vh' }}
       maximizable
       closable={!loading && !isSubmitting}
    >
       {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
             <ProgressSpinner />
             <p className="mt-4 text-gray-600 animate-pulse">La Inteligencia Artificial esta elaborando tu examen de {technicalSkill.nombre}...</p>
          </div>
       ) : (
          <div className="flex flex-col h-full bg-gray-50 p-4 rounded-md">
             {/* Header del examen */}
             <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                <div>
                   <h3 className="font-bold text-lg text-gray-800">{technicalSkill.nombre}</h3>
                   <span className="text-sm text-gray-500">Responde las 5 preguntas antes de que se acabe el tiempo.</span>
                </div>
                <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                   <Clock size={18} />
                   {formatTime(timeLeft)}
                </div>
             </div>

             {/* Preguntas */}
             <div className="space-y-6 overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-4">{idx + 1}. {q.question}</p>
                      
                      <div className="space-y-2 pl-2">
                        {q.options.map((opt: string, optIdx: number) => (
                           <label key={optIdx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                              <input 
                                type="radio" 
                                name={`question_${idx}`} 
                                className="mt-1"
                                checked={userAnswers[idx] === optIdx}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                              />
                              <span className="text-gray-700 leading-snug">{opt}</span>
                           </label>
                        ))}
                      </div>
                   </div>
                ))}
             </div>

             {/* Footer con AutoSubmit */}
             <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                <Button 
                   label={isSubmitting ? "Enviando..." : "Finalizar Examen"} 
                   icon="pi pi-check" 
                   className="p-button-success shadow-md"
                   onClick={handleSubmit}
                   disabled={isSubmitting || Object.keys(userAnswers).length < questions.length}
                   tooltip={Object.keys(userAnswers).length < questions.length ? "Debes responder todas las preguntas" : ""}
                />
             </div>
          </div>
       )}
    </Dialog>
  );
}
