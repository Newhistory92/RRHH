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



import React, { useState, useEffect } from 'react';

import { Button } from 'primereact/button';

import { Dialog } from 'primereact/dialog';

import { ProgressBar } from 'primereact/progressbar';

import { RadioButton } from 'primereact/radiobutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { initialTestsByProfession} from '@/app/api/prueba2';

import { Skill} from "@/app/Interfas/Interfaces"

export const SkillTestDialog = ({
  isVisible,
  skill,
  position,
  onClose,
  onTestComplete,
}: {
  isVisible: boolean;
  skill: Skill | null;
  position: string;
  onClose: () => void;
  onTestComplete: (skill: Skill, score: number) => void;
}) => {
  const [testState, setTestState] = useState<
    "loading" | "testing" | "finished"
  >("loading");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isVisible && skill) {
      // Reset state for new test
      setTestState("loading");
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(0);

      // Lógica para decidir qué prueba usar
      const predefinedTest = initialTestsByProfession[position]?.find(
        (t) => t.name === skill.name
      );
      if (predefinedTest && predefinedTest.questions) {
        // Mapear a la estructura que espera el componente de Gemini para unificar
        const formattedQuestions = predefinedTest.questions.map((q) => ({
          question: q.text,
          options: q.answers!.map((a) => a.text),
          correctAnswerIndex: q.answers!.findIndex((a) => a.isCorrect),
        }));
        setQuestions(formattedQuestions);
        setTestState("testing");
      } else {
        generateTestWithGemini();
      }
    }
  }, [isVisible, skill, position]);

  const generateTestWithGemini = async () => {
    if (!skill) return;
    const prompt = `Crea una prueba técnica de 5 preguntas de opción múltiple para la habilidad "${skill.name}". Cada pregunta debe tener 4 opciones y solo una respuesta correcta. Devuelve el resultado como un array de objetos JSON con la estructura: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswerIndex": N}]`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctAnswerIndex: { type: "NUMBER" },
            },
          },
        },
      },
    };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`API call failed with status: ${response.status}`);
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const parsedQuestions = JSON.parse(
          result.candidates[0].content.parts[0].text
        );
        setQuestions(parsedQuestions);
        setTestState("testing");
      } else {
        throw new Error("No questions generated.");
      }
    } catch (error) {
      console.error("Error generating test:", error);
      // Fallback a preguntas de ejemplo en caso de error
      setQuestions([
        {
          question: `Pregunta de prueba para ${skill.name}?`,
          options: ["Opción A", "Opción B", "Opción C", "Opción D"],
          correctAnswerIndex: 0,
        },
      ]);
      setTestState("testing");
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finalizar prueba
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (q.correctAnswerIndex === userAnswers[index]) {
          correctAnswers++;
        }
      });
      const finalScore = (correctAnswers / questions.length) * 100;
      setScore(finalScore);
      setTestState("finished");
    }
  };

  const handleCloseAndComplete = () => {
    if (skill) {
      onTestComplete(skill, score);
    }
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Dialog
      header={`Prueba Técnica: ${skill?.name}`}
      visible={isVisible}
      style={{ width: "90%", maxWidth: "650px" }}
      onHide={onClose}
      modal
    >
      {testState === "loading" && (
        <div className="flex justify-center items-center p-8">
          <ProgressSpinner />
        </div>
      )}

      {testState === "testing" && currentQuestion && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
            <ProgressBar
              value={((currentQuestionIndex + 1) / questions.length) * 100}
              style={{ height: "6px" }}
            />
          </div>
          <p className="font-semibold text-lg mb-4">
            {currentQuestion.question}
          </p>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center">
                <RadioButton
                  inputId={`option${index}`}
                  name={`question${currentQuestionIndex}`}
                  value={index}
                  onChange={(e) =>
                    handleAnswerSelect(currentQuestionIndex, e.value)
                  }
                  checked={userAnswers[currentQuestionIndex] === index}
                />
                <label htmlFor={`option${index}`} className="ml-2">
                  {option}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              label={
                currentQuestionIndex < questions.length - 1
                  ? "Siguiente"
                  : "Finalizar Prueba"
              }
              onClick={handleNext}
              disabled={userAnswers[currentQuestionIndex] === undefined}
            />
          </div>
        </div>
      )}

      {testState === "finished" && (
        <div className="text-center p-4">
          {score >= 70 ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h3 className="text-2xl font-bold mb-2">Prueba Finalizada</h3>
          <p className="text-lg">
            Tu puntuación:{" "}
            <span className="font-bold">{score.toFixed(0)}%</span>
          </p>
          {score >= 70 ? (
            <p className="text-green-600 mt-2">
              ¡Felicitaciones! Has aprobado.
            </p>
          ) : (
            <p className="text-red-600 mt-2">
              No has alcanzado el mínimo. Podrás reintentar en 3 meses.
            </p>
          )}
          <Button
            label="Cerrar"
            onClick={handleCloseAndComplete}
            className="mt-6"
          />
        </div>
      )}
    </Dialog>
  );
};