// "use client"
// import React, { useState,  useEffect } from 'react';
// import {  CheckCircle, XCircle,} from 'lucide-react';
// import { Card } from '@/app/util/UiCv';

// export const SkillTestModal = ({ skill, onClose, onTestComplete }) => {
//   const [testState, setTestState] = useState("loading"); // loading, testing, finished
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [score, setScore] = useState(0);

//   useEffect(() => {
//     const generateTest = async () => {
//       setTestState("loading");
//       const prompt = `Crea una prueba técnica de 5 preguntas de opción múltiple para la habilidad "${skill.name}". Cada pregunta debe tener 4 opciones y solo una respuesta correcta. Devuelve el resultado como un array de objetos JSON con la estructura: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswerIndex": N}]`;
//       const payload = {
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//         generationConfig: {
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: "ARRAY",
//             items: {
//               type: "OBJECT",
//               properties: {
//                 question: { type: "STRING" },
//                 options: { type: "ARRAY", items: { type: "STRING" } },
//                 correctAnswerIndex: { type: "NUMBER" },
//               },
//             },
//           },
//         },
//       };
//       const apiKey = ""; // Left empty as per instructions
//       const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

//       try {
//         const response = await fetch(apiUrl, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         if (!response.ok) {
//           let errorBody = `API call failed with status: ${response.status}`;
//           try {
//             const errorJson = await response.json();
//             errorBody = errorJson?.error?.message || JSON.stringify(errorJson);
//           } catch (e) {
//             try {
//               errorBody = await response.text();
//             } catch (textErr) {
//               /* Stick with status */
//             }
//           }
//           throw new Error(errorBody);
//         }
//         const result = await response.json();
//         if (
//           result.candidates &&
//           result.candidates[0]?.content?.parts?.[0]?.text
//         ) {
//           const parsedQuestions = JSON.parse(
//             result.candidates[0].content.parts[0].text
//           );
//           setQuestions(parsedQuestions);
//           setTestState("testing");
//         } else {
//           throw new Error("No questions generated or content was filtered.");
//         }
//       } catch (error) {
//         console.error("Error generating test:", error);
//         setQuestions([
//           {
//             question: `Pregunta de prueba 1 para ${skill.name}?`,
//             options: ["A", "B", "C", "D"],
//             correctAnswerIndex: 0,
//           },
//           {
//             question: `Pregunta de prueba 2 para ${skill.name}?`,
//             options: ["A", "B", "C", "D"],
//             correctAnswerIndex: 1,
//           },
//           {
//             question: `Pregunta de prueba 3 para ${skill.name}?`,
//             options: ["A", "B", "C", "D"],
//             correctAnswerIndex: 2,
//           },
//           {
//             question: `Pregunta de prueba 4 para ${skill.name}?`,
//             options: ["A", "B", "C", "D"],
//             correctAnswerIndex: 3,
//           },
//           {
//             question: `Pregunta de prueba 5 para ${skill.name}?`,
//             options: ["A", "B", "C", "D"],
//             correctAnswerIndex: 0,
//           },
//         ]);
//         setTestState("testing");
//       }
//     };
//     generateTest();
//   }, [skill.name]);

//   const handleAnswer = (answerIndex) => {
//     const newAnswers = [...userAnswers];
//     newAnswers[currentQuestionIndex] = answerIndex;
//     setUserAnswers(newAnswers);
//   };
//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex((prev) => prev + 1);
//     } else {
//       let correctAnswers = 0;
//       questions.forEach((q, index) => {
//         if (q.correctAnswerIndex === userAnswers[index]) {
//           correctAnswers++;
//         }
//       });
//       const finalScore = (correctAnswers / questions.length) * 100;
//       setScore(finalScore);
//       setTestState("finished");
//       onTestComplete(skill, finalScore);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//       <Card className="w-full max-w-2xl">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-800">
//             Prueba Técnica: {skill.name}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-gray-200"
//           >
//             <XCircle className="w-6 h-6 text-gray-500" />
//           </button>
//         </div>
//         {testState === "loading" && (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//             <p className="mt-4">Generando prueba...</p>
//           </div>
//         )}

//         {testState === "testing" &&
//           (() => {
//             const currentQuestion = questions?.[currentQuestionIndex];
//             if (!currentQuestion || !Array.isArray(currentQuestion.options)) {
//               return (
//                 <div className="text-center py-12">
//                   Error al cargar la pregunta. Por favor, intenta de nuevo.
//                 </div>
//               );
//             }
//             return (
//               <div>
//                 <div className="mb-2 text-sm text-gray-600">
//                   Pregunta {currentQuestionIndex + 1} de {questions.length}
//                 </div>
//                 <h3 className="font-semibold mb-4 text-lg">
//                   {currentQuestion.question}
//                 </h3>
//                 <div className="space-y-3">
//                   {currentQuestion.options.map((option, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleAnswer(index)}
//                       className={`w-full text-left p-3 border rounded-lg transition-colors ${
//                         userAnswers[currentQuestionIndex] === index
//                           ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500"
//                           : "hover:bg-gray-50"
//                       }`}
//                     >
//                       {option}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="mt-6 flex justify-end">
//                   <button
//                     onClick={handleNext}
//                     disabled={userAnswers[currentQuestionIndex] === undefined}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//                   >
//                     {currentQuestionIndex < questions.length - 1
//                       ? "Siguiente"
//                       : "Finalizar Prueba"}
//                   </button>
//                 </div>
//               </div>
//             );
//           })()}

//         {testState === "finished" && (
//           <div className="text-center py-8">
//             {score >= 70 ? (
//               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//             ) : (
//               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//             )}
//             <h3 className="text-2xl font-bold mb-2">Prueba Finalizada</h3>
//             <p className="text-lg">
//               Tu puntuación:{" "}
//               <span className="font-bold">{score.toFixed(0)}%</span>
//             </p>
//             {score >= 70 ? (
//               <p className="text-green-600 mt-2">
//                 ¡Felicitaciones! Has aprobado y la habilidad ha sido añadida a
//                 tu CV.
//               </p>
//             ) : (
//               <p className="text-red-600 mt-2">
//                 No has alcanzado la puntuación mínima. Podrás intentarlo de
//                 nuevo en 3 meses.
//               </p>
//             )}
//             <button
//               onClick={onClose}
//               className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//             >
//               Cerrar
//             </button>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };


import React, { useState, useEffect,useCallback } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { RadioButton } from 'primereact/radiobutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { initialTestsByProfession } from '@/app/api/prueba2';
import {SkillTestDialogProps,Test,MultipleChoiceTest,TestsByProfession } from "@/app/Interfas/Interfaces";

type TestQuestion = {
    id?: string;
    text?: string;
    question?: string;
    answers?: Array<{ id: string; text: string; isCorrect: boolean }>;
    options?: string[];
    correctAnswerIndex?: number;
};


const isMultipleChoiceTest = (test: Test): test is MultipleChoiceTest => {
    return test.type === 'multiple-choice';
};

export const SkillTestDialog: React.FC<SkillTestDialogProps> = ({ 
    isVisible, 
    skill, 
    position, 
    onClose, 
    onTestComplete 
}) => {
    const [testState, setTestState] = useState<'loading' | 'testing' | 'finished'>('loading');
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [score, setScore] = useState(0);
    const [testResult, setTestResult] = useState<'Malo' | 'Bueno' | 'Avanzado' | null>(null);

 

    const resetTestState = () => {
        setTestState('loading');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        setTestResult(null);
    };

    const loadTest = useCallback(async () => {
        if (!skill) return;

        // Tipado correcto para initialTestsByProfession
        const professionTests = (initialTestsByProfession as TestsByProfession)[position];
        
        if (!professionTests) {
            console.log('No se encontraron tests para la profesión:', position);
            await generateTestWithGemini();
            return;
        }

        // Buscar test predefinido
        const predefinedTest = professionTests.find(
            test => test.name.toLowerCase().includes(skill.name.toLowerCase()) ||
                   skill.name.toLowerCase().includes(test.name.toLowerCase())
        );

        if (predefinedTest) {
            // Verificar que sea un test de múltiple opción antes de acceder a questions
            if (isMultipleChoiceTest(predefinedTest) && predefinedTest.questions.length > 0) {
                console.log('Usando test predefinido:', predefinedTest.name);
                setQuestions(predefinedTest.questions); // Ya no necesitamos conversión
                setTestState('testing');
            } else if (predefinedTest.type === 'case-study') {
                console.log('Test de caso de estudio encontrado, generando preguntas con Gemini');
                await generateTestWithGemini();
            } else {
                console.log('Test sin preguntas válidas, generando con Gemini');
                await generateTestWithGemini();
            }
        } else {
            console.log('Generando test con Gemini para:', skill.name);
            await generateTestWithGemini();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skill, position])


       useEffect(() => {
        if (isVisible && skill) {
            resetTestState();
            loadTest();
        }
    }, [isVisible, skill, loadTest]);

    const generateTestWithGemini = async () => {
        if (!skill) return;

        const prompt = `Crea una prueba técnica de 5 preguntas de opción múltiple en español para evaluar la habilidad "${skill.name}" en el contexto de la profesión "${position}".

Cada pregunta debe:
- Ser relevante y práctica para la profesión ${position}
- Tener exactamente 4 opciones de respuesta
- Tener una sola respuesta correcta
- Ser de dificultad progresiva (fácil a difícil)

Devuelve el resultado como un array JSON con esta estructura exacta:
[
  {
    "question": "Texto de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswerIndex": 0
  }
]

IMPORTANTE: 
- correctAnswerIndex debe ser un número del 0 al 3
- Las opciones deben estar en español
- Las preguntas deben ser específicas para ${skill.name} en ${position}`;

        const payload = {
            contents: [{ 
                role: "user", 
                parts: [{ text: prompt }] 
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            question: { type: "STRING" },
                            options: { 
                                type: "ARRAY", 
                                items: { type: "STRING" },
                                minItems: 4,
                                maxItems: 4
                            },
                            correctAnswerIndex: { 
                                type: "NUMBER",
                                minimum: 0,
                                maximum: 3
                            }
                        },
                        required: ["question", "options", "correctAnswerIndex"]
                    }
                }
            }
        };

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const generatedQuestions = JSON.parse(result.candidates[0].content.parts[0].text);
                
                if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
                    console.log('Test generado exitosamente con Gemini');
                    setQuestions(generatedQuestions);
                    setTestState("testing");
                    return;
                }
            }
            
            throw new Error("La respuesta de Gemini no contiene preguntas válidas");
        } catch (error) {
            console.error("Error generando test con Gemini:", error);
            
            // Fallback: crear preguntas de ejemplo
            const fallbackQuestions: TestQuestion[] = [
                {
                    question: `¿Cuál es el aspecto más importante de ${skill.name} en el contexto de ${position}?`,
                    options: [
                        "La aplicación práctica de conocimientos técnicos",
                        "La memorización de conceptos teóricos",
                        "La velocidad de ejecución únicamente",
                        "La presentación visual del trabajo"
                    ],
                    correctAnswerIndex: 0
                },
                {
                    question: `¿Qué competencia complementa mejor a ${skill.name}?`,
                    options: [
                        "Habilidades de comunicación",
                        "Conocimiento de redes sociales",
                        "Habilidades gastronómicas",
                        "Conocimientos de jardinería"
                    ],
                    correctAnswerIndex: 0
                }
            ];

            setQuestions(fallbackQuestions);
            setTestState("testing");
        }
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishTest();
        }
    };

    const finishTest = () => {
        let correctAnswers = 0;
        
        questions.forEach((question, index) => {
            if (question.correctAnswerIndex === userAnswers[index]) {
                correctAnswers++;
            }
        });

        const finalScore = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
        
        // Determinar nivel según el score
        let result: 'Malo' | 'Bueno' | 'Avanzado';
        if (finalScore >= 90) {
            result = 'Avanzado';
        } else if (finalScore >= 70) {
            result = 'Bueno';
        } else {
            result = 'Malo';
        }

        setScore(finalScore);
        setTestResult(result);
        setTestState("finished");
    };

    const handleCloseAndComplete = () => {
        if (skill && testResult) {
            onTestComplete(skill, score);
        }
        onClose();
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <Dialog 
            header={`Prueba Técnica: ${skill?.name || 'Cargando...'}`} 
            visible={isVisible} 
            style={{ width: '90%', maxWidth: '700px' }} 
            onHide={onClose} 
            modal
            closable={testState !== 'testing'} // No permitir cerrar durante el test
        >
            {/* Estado de carga */}
            {testState === 'loading' && (
                <div className="flex flex-col justify-center items-center p-8">
                    <ProgressSpinner />
                    <p className="mt-4 text-gray-600">
                        Preparando tu evaluación de {skill?.name}...
                    </p>
                </div>
            )}
            
            {/* Estado de testing */}
            {testState === 'testing' && currentQuestion && (
                <div className="space-y-6">
                    {/* Progreso */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                                {Math.round(progress)}% completado
                            </span>
                        </div>
                        <ProgressBar 
                            value={progress} 
                            style={{ height: '8px' }}
                            className="mb-4"
                        />
                    </div>

                    {/* Pregunta */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {currentQuestion.question}
                        </h3>

                        {/* Opciones */}
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                                    <RadioButton 
                                        inputId={`option${index}`} 
                                        name={`question${currentQuestionIndex}`} 
                                        value={index}
                                        onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.value)}
                                        checked={userAnswers[currentQuestionIndex] === index} 
                                    />
                                    <label 
                                        htmlFor={`option${index}`} 
                                        className="ml-3 cursor-pointer flex-1 text-gray-700"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botón siguiente */}
                    <div className="flex justify-end pt-4">
                        <Button 
                            label={currentQuestionIndex < questions.length - 1 ? "Siguiente" : "Finalizar Prueba"}
                            onClick={handleNext} 
                            disabled={userAnswers[currentQuestionIndex] === undefined}
                            className="px-6 py-2"
                        />
                    </div>
                </div>
            )}
            
            {/* Estado de finalizado */}
            {testState === 'finished' && (
                <div className="text-center space-y-6 p-6">
                    {/* Icono de resultado */}
                    {score >= 70 ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                    )}

                    {/* Título */}
                    <h3 className="text-2xl font-bold text-gray-800">
                        ¡Evaluación Completada!
                    </h3>

                    {/* Puntuación */}
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">
                            {Math.round(score)}%
                        </p>
                        <p className="text-lg text-gray-600">
                            Nivel obtenido: <span className={`font-semibold ${
                                testResult === 'Avanzado' ? 'text-green-600' :
                                testResult === 'Bueno' ? 'text-blue-600' :
                                'text-red-600'
                            }`}>
                                {testResult}
                            </span>
                        </p>
                    </div>

                    {/* Mensaje de resultado */}
                    {score >= 70 ? (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-green-800 font-medium">
                                ¡Felicitaciones! Has aprobado la evaluación.
                            </p>
                            <p className="text-green-700 text-sm mt-1">
                                Esta habilidad será validada en tu perfil.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-red-800 font-medium">
                                No has alcanzado el puntaje mínimo para aprobar.
                            </p>
                            <p className="text-red-700 text-sm mt-1">
                                Podrás intentar nuevamente en 3 meses.
                            </p>
                        </div>
                    )}

                    {/* Botón cerrar */}
                    <Button 
                        label="Cerrar" 
                        onClick={handleCloseAndComplete} 
                        className="w-full py-3 text-lg font-semibold"
                    />
                </div>
            )}
        </Dialog>
    );
};