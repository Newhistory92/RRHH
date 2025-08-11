import { PROFESSIONS_SKILLS } from "@/app/api/Prueba";
import { EvaluatedSkill, Profession, Question, ResultsData, Skill } from "@/app/Interfas/Interfaces";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Briefcase, CheckCircle, XCircle, Download, Loader, BookOpen, Star, BarChart2, Type } from 'lucide-react';





const ALL_PROFESSIONS = Object.keys(PROFESSIONS_SKILLS) as Profession[];



const SkillCard = ({ skill, onStart, isEvaluated }: { skill: Skill; onStart: () => void; isEvaluated: boolean }) => (
  <div className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ${isEvaluated ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg text-gray-800">{skill.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
      </div>
      {isEvaluated && <CheckCircle className="text-green-500 flex-shrink-0 ml-2" />}
    </div>
    <button
      onClick={onStart}
      disabled={isEvaluated}
      className="mt-4 w-full text-sm font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={`Comenzar evaluación para ${skill.name}`}
    >
      {isEvaluated ? 'Evaluada' : 'Comenzar Evaluación'}
    </button>
  </div>
);

const TypingTest = ({ onComplete }: { onComplete: (result: any) => void }) => {
    const [textToType] = useState("La gestión de proyectos es un pilar fundamental para el éxito de cualquier organización moderna. Requiere una planificación meticulosa, asignación de recursos, y una comunicación fluida entre todos los miembros del equipo para alcanzar los objetivos. El rápido zorro marrón salta sobre el perro perezoso y sigue corriendo por el campo verde bajo el sol brillante de la tarde.");
    const [inputValue, setInputValue] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState<{ wpm: number; accuracy: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFinished) return;
        if (!startTime) {
            setStartTime(Date.now());
        }
        const currentText = e.target.value;
        setInputValue(currentText);

        if (currentText.length >= textToType.length) {
            finishTest(currentText.substring(0, textToType.length));
        }
    };
    
    const finishTest = (finalText: string) => {
        if (!startTime) return;
        const endTime = Date.now();
        const durationInMinutes = (endTime - startTime) / 1000 / 60;
        const wordsTyped = finalText.trim().split(/\s+/).length;
        const wpm = durationInMinutes > 0 ? Math.round(wordsTyped / durationInMinutes) : 0;

        let correctChars = 0;
        for (let i = 0; i < finalText.length; i++) {
            if (finalText[i] === textToType[i]) {
                correctChars++;
            }
        }
        const accuracy = Math.round((correctChars / textToType.length) * 100);

        setResults({ wpm, accuracy });
        setIsFinished(true);

        let level: 'Malo' | 'Bueno' | 'Avanzado';
        if (wpm > 50 && accuracy > 95) {
            level = 'Avanzado';
        } else if (wpm > 35 && accuracy > 90) {
            level = 'Bueno';
        } else {
            level = 'Malo';
        }
        
        const passed = wpm > 20 && accuracy > 85;

        onComplete({
            level,
            passed,
            metrics: {
                "Palabras por minuto": wpm,
                "Precisión": `${accuracy}%`,
            }
        });
    };

    const getHighlightedText = () => {
        return textToType.split('').map((char, index) => {
            let color = 'text-gray-400';
            if (index < inputValue.length) {
                color = char === inputValue[index] ? 'text-green-500' : 'text-red-500 bg-red-100';
            }
            return <span key={index} className={color}>{char}</span>;
        });
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Test de Mecanografía</h3>
            <p className="text-sm text-gray-600 mb-2">Escribe el siguiente texto lo más rápido y preciso que puedas.</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 font-mono text-lg tracking-wider">
                {getHighlightedText()}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Empieza a escribir aquí..."
                disabled={isFinished}
            />
            {isFinished && results && (
                <div className="mt-4 text-center">
                    <h4 className="font-bold text-lg">¡Test completado!</h4>
                    <p>Palabras por minuto (PPM): <span className="font-bold text-2xl">{results.wpm}</span></p>
                    <p>Precisión: <span className="font-bold text-2xl">{results.accuracy}%</span></p>
                </div>
            )}
        </div>
    );
};


const EvaluationModal = ({ skill, profession, onClose, onComplete, isVisible }: { skill: Skill | null; profession: string; onClose: () => void; onComplete: (result: EvaluatedSkill) => void; isVisible: boolean; }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (skill) {
      setResult(null);
      setAnswers({});
      setError(null);
      setQuestions([]);
      if(skill.type === 'typing-test') {
        setIsLoading(false);
      } else {
        fetchQuestions();
        setTimeLeft(300); // 5 minutos por evaluación
      }
    }
  }, [skill]);
  
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    if (!timeLeft || result || skill?.type === 'typing-test') return;
    const intervalId = setInterval(() => {
      setTimeLeft(t => (t ? t - 1 : null));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, result, skill]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const fetchQuestions = async () => {
    if (!skill) return;
    setIsLoading(true);
    setError(null);

    const prompt = `Genera 5 preguntas únicas y de alta calidad en español para evaluar la habilidad "${skill.name}" para la profesión "${profession}".
    La descripción de la habilidad es: "${skill.description}".
    El tipo de evaluación es "${skill.type}".
    - Para "multiple-choice", provee 4 opciones.
    - Para "code", pide escribir una función o consulta simple. La "correctAnswer" debe ser una descripción clara de la solución esperada y sus componentes clave.
    - Para "case-study", presenta un caso práctico conciso. La "correctAnswer" debe ser una descripción de los puntos clave a abordar en la solución.
    - Para "report", pide redactar un informe breve sobre un tema. La "correctAnswer" debe ser una descripción de la estructura y contenido esperados.
    
    Devuelve la respuesta como un array JSON válido, sin texto adicional. Cada objeto debe tener: "question" (string), "options" (array de 4 strings, solo para multiple-choice), y "correctAnswer" (string).
    IMPORTANTE: Para "multiple-choice", asegúrate de que el valor de "correctAnswer" sea EXACTAMENTE igual a uno de los valores en el array "options".`;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error de la API: ${response.statusText}`);
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const cleanedJsonString = textResponse.replace(/```json|```/g, '').trim();
            let parsedQuestions = JSON.parse(cleanedJsonString);
            
            parsedQuestions = parsedQuestions.filter((q: Question) => {
                if (q.options) {
                    return Array.isArray(q.options) && q.options.includes(q.correctAnswer);
                }
                return true;
            });

            if (parsedQuestions.length === 0) {
                throw new Error("La IA no generó preguntas válidas. Por favor, intenta de nuevo.");
            }

            setQuestions(parsedQuestions);
        } else {
            throw new Error("La respuesta de la IA no contiene datos válidos.");
        }
    } catch (e: any) {
        console.error("Error al procesar la solicitud de IA:", e);
        setError(e.message || "No se pudieron generar las preguntas. Inténtalo de nuevo más tarde.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!skill || questions.length === 0) return;
    setIsSubmitting(true);

    const evaluationPromises = questions.map(async (q, i) => {
        const userAnswer = answers[i] || "";
        if (skill.type === 'multiple-choice') {
            return userAnswer === q.correctAnswer;
        } else {
            if (!userAnswer || userAnswer.trim().length < 20) {
                return false;
            }
            const evalPrompt = `Evalúa la siguiente respuesta de un usuario.
            Pregunta: "${q.question}"
            Criterios de una buena respuesta: "${q.correctAnswer}"
            Respuesta del usuario: "${userAnswer}"
            ¿La respuesta del usuario cumple con los criterios de manera aceptable? Responde únicamente con "true" si cumple, o "false" si no lo hace.`;
            
            try {
                let chatHistory = [{ role: "user", parts: [{ text: evalPrompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const data = await response.json();
                const resultText = data.candidates[0].content.parts[0].text.trim().toLowerCase();
                return resultText.includes('true');
            } catch (error) {
                console.error("Error en la evaluación por IA:", error);
                return false;
            }
        }
    });

    const resultsArray = await Promise.all(evaluationPromises);
    const correctCount = resultsArray.filter(Boolean).length;

    const total = questions.length;
    const score = total > 0 ? (correctCount / total) * 100 : 0;
    let level: 'Malo' | 'Bueno' | 'Avanzado' = 'Malo';
    if (score >= 80) {
      level = 'Avanzado';
    } else if (score >= 50) {
      level = 'Bueno';
    }
    
    const passed = score >= 30;

    setResult({ correct: correctCount, total, level, passed });

    if (passed && skill) {
      onComplete({
        nombre: skill.name,
        nivel: level,
        preguntas_correctas: correctCount,
        total_preguntas: total,
      });
    }
    setIsSubmitting(false);
  };

  const handleTypingComplete = (typingResult: any) => {
    setResult(typingResult);
    if (typingResult.passed && skill) {
        onComplete({
            nombre: skill.name,
            nivel: typingResult.level,
            metricas: typingResult.metrics,
        });
    }
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {skill && <h2 className="text-2xl font-bold text-gray-800 mb-1">Evaluación: {skill.name}</h2>}
        <p className="text-gray-600 mb-4">Profesión: {profession}</p>
        
        {timeLeft !== null && !result && skill.type !== 'typing-test' && <div className="font-mono text-lg text-right text-red-600 mb-4">Tiempo: {formatTime(timeLeft)}</div>}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="animate-spin text-blue-600 h-12 w-12" />
            <p className="mt-4 text-gray-600">Generando preguntas con IA...</p>
          </div>
        )}
        {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

        {skill?.type === 'typing-test' && !result && (
            <TypingTest onComplete={handleTypingComplete} />
        )}

        {!isLoading && !error && !result && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i} className="border-t pt-4">
                <p className="font-semibold text-gray-700">{i + 1}. {q.question}</p>
                {skill?.type === 'multiple-choice' && q.options ? (
                  <div className="mt-2 space-y-2">
                    {q.options.map((opt, j) => (
                      <label key={j} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <input type="radio" name={`question-${i}`} value={opt} onChange={e => handleAnswerChange(i, e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="ml-3 text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={skill?.type === 'code' ? 8 : 5}
                    className={`mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${skill?.type === 'code' ? 'font-mono bg-gray-900 text-gray-100' : ''}`}
                    placeholder="Escribe tu respuesta aquí..."
                    onChange={e => handleAnswerChange(i, e.target.value)}
                    aria-label={`Respuesta para la pregunta ${i + 1}`}
                  />
                )}
              </div>
            ))}
            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex justify-center items-center">
              {isSubmitting ? <><Loader className="animate-spin h-5 w-5 mr-2" /> Evaluando...</> : 'Enviar Evaluación'}
            </button>
          </div>
        )}

        {result && (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Resultados de la Evaluación</h3>
            {result.passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
             {result.metrics ? (
                <div>
                    {Object.entries(result.metrics).map(([key, value]) => (
                        <p key={key}>{key}: <span className="font-bold">{String(value)}</span></p>
                    ))}
                </div>
            ) : (
                <p className="text-lg">
                Respondiste correctamente <span className="font-bold">{result.correct}</span> de <span className="font-bold">{result.total}</span> preguntas.
                </p>
            )}
            <p className={`text-xl font-bold mt-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? `¡Aprobado!` : 'Reprobado'}
            </p>
            {result.passed && <p className="text-lg mt-1">Nivel obtenido: <span className="font-bold">{result.level}</span></p>}
            {!result.passed && <p className="text-gray-600 mt-2">No alcanzaste el mínimo requerido para aprobar.</p>}
            <button onClick={onClose} className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL --- //

export default function SkillTecnico() {
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [results, setResults] = useState<ResultsData>({ profesion: '', habilidades_evaluadas: [] });
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const skillsForProfession = useMemo(() => {
    return selectedProfession ? PROFESSIONS_SKILLS[selectedProfession] : [];
  }, [selectedProfession]);

  const handleProfessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profession = e.target.value as Profession;
    setSelectedProfession(profession);
    setResults({
      profesion: profession,
      habilidades_evaluadas: [],
    });
  };

  const handleStartEvaluation = (skill: Skill) => {
    setCurrentSkill(skill);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentSkill(null);
  };

  const handleEvaluationComplete = (result: EvaluatedSkill) => {
    setResults(prev => ({
      ...prev,
      habilidades_evaluadas: [...prev.habilidades_evaluadas, result],
    }));
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluacion-${results.profesion.toLowerCase().replace(/\s/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const evaluatedSkillNames = useMemo(() => 
    new Set(results.habilidades_evaluadas.map(s => s.nombre)), 
  [results.habilidades_evaluadas]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Evaluador de Habilidades Técnicas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* --- SELECCIÓN DE PROFESIÓN --- */}
        <section className="bg-white p-6 rounded-xl shadow-md mb-8">
          <label htmlFor="profession-select" className="flex items-center text-xl font-semibold text-gray-700 mb-4">
            <Briefcase className="h-6 w-6 mr-3 text-blue-600" />
            1. Elige tu profesión
          </label>
          <select
            id="profession-select"
            value={selectedProfession || ''}
            onChange={handleProfessionChange}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          >
            <option value="" disabled>-- Selecciona una profesión --</option>
            {ALL_PROFESSIONS.map(prof => <option key={prof} value={prof}>{prof}</option>)}
          </select>
        </section>

        {selectedProfession && (
          <>
            {/* --- LISTA DE HABILIDADES --- */}
            <section className="mb-8">
              <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <Star className="h-6 w-6 mr-3 text-blue-600" />
                2. Evalúa tus habilidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillsForProfession.map(skill => (
                  <SkillCard 
                    key={skill.name} 
                    skill={skill} 
                    onStart={() => handleStartEvaluation(skill)}
                    isEvaluated={evaluatedSkillNames.has(skill.name)}
                  />
                ))}
              </div>
            </section>

            {/* --- RESULTADOS --- */}
            {results.habilidades_evaluadas.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                  <BarChart2 className="h-6 w-6 mr-3 text-green-600" />
                  3. Tus Resultados
                </h2>
                <div className="space-y-3 mb-6">
                  {results.habilidades_evaluadas.map(res => (
                    <div key={res.nombre} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{res.nombre}</p>
                        <p className="text-sm text-gray-600">
                          Nivel: <span className="font-semibold">{res.nivel}</span> 
                          {res.preguntas_correctas !== undefined && ` (${res.preguntas_correctas}/${res.total_preguntas} correctas)`}
                          {res.metricas && ` (${res.metricas['Palabras por minuto']} PPM, ${res.metricas['Precisión']})`}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDownloadJson}
                  className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar Resultados (JSON)
                </button>
              </section>
            )}
          </>
        )}
      </main>

      <EvaluationModal
        isVisible={isModalVisible}
        skill={currentSkill}
        profession={selectedProfession || ''}
        onClose={handleCloseModal}
        onComplete={handleEvaluationComplete}
      />
    </div>
  );
}
