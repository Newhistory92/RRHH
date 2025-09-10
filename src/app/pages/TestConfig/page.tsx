import React, { useEffect, useState} from 'react';
import {  X as CloseIcon,Plus, Trash2, Wand2  } from 'lucide-react';
import { Card } from 'primereact/card';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
type TestsByProfession = {
  [key: string]: Test[];
};


type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

type BaseTest = {
  id: string;
  name: string;
  description: string;
};

type MultipleChoiceTest = BaseTest & {
  type: 'multiple-choice';
  questions: Question[];
};

type CaseStudyTest = BaseTest & {
  type: 'case-study';
  scenario: string;
};

type Test = MultipleChoiceTest | CaseStudyTest;


type SoftSkill = {
  name: string;
  description: string;
};


export const TestPage = () => {
  const [activeTab, setActiveTab] = useState<"technical" | "soft-skills">(
    "technical"
  );

  // State for Technical Tests
  const [testsByProfession, setTestsByProfession] = useState<TestsByProfession>(
    {}
  );
  const [professions, setProfessions] = useState<string[]>([
    "Contador",
    "Desarrollador",
  ]);
  const [selectedProfession, setSelectedProfession] =
    useState<string>("Contador");

  // State for Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // State for Soft Skills
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([
    {
      name: "Comunicación Efectiva",
      description: "Habilidad para transmitir ideas de forma clara y concisa.",
    },
    {
      name: "Trabajo en Equipo",
      description:
        "Capacidad para colaborar con otros para alcanzar un objetivo común.",
    },
    {
      name: "Resolución de Problemas",
      description:
        "Aptitud para identificar problemas y encontrar soluciones eficientes.",
    },
  ]);
  const [newSoftSkill, setNewSoftSkill] = useState<SoftSkill>({
    name: "",
    description: "",
  });

  const handleAddNewProfession = () => {
    const newProfession = prompt("Ingrese el nombre de la nueva profesión:");
    if (newProfession && !professions.includes(newProfession)) {
      setProfessions((prev) => [...prev, newProfession]);
      setSelectedProfession(newProfession);
    }
  };

  const handleSaveTest = (test: Test) => {
    setTestsByProfession((prev) => ({
      ...prev,
      [selectedProfession]: [...(prev[selectedProfession] || []), test],
    }));
    setIsTestModalOpen(false);
  };

  const handleSoftSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftSkill.name.trim() || !newSoftSkill.description.trim()) return;
    setSoftSkills((prev) => [...prev, newSoftSkill]);
    setNewSoftSkill({ name: "", description: "" });
  };

  const CreateTestModal = ({
    isOpen,
    onClose,
    onSave,
    profession,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (test: Test) => void;
    profession: string;
  }) => {
    const [testType, setTestType] = useState<"multiple-choice" | "case-study">(
      "multiple-choice"
    );
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<Question[]>([
      {
        id: crypto.randomUUID(),
        text: "",
        answers: [{ id: crypto.randomUUID(), text: "", isCorrect: false }],
      },
    ]);
    const [scenario, setScenario] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
      // Reset state when modal opens
      if (isOpen) {
        setTestType("multiple-choice");
        setName("");
        setDescription("");
        setQuestions([
          {
            id: crypto.randomUUID(),
            text: "",
            answers: [
              { id: crypto.randomUUID(), text: "", isCorrect: false },
              { id: crypto.randomUUID(), text: "", isCorrect: false },
            ],
          },
        ]);
        setScenario("");
      }
    }, [isOpen]);

    // --- Multiple Choice Handlers ---
    const handleQuestionChange = (qIndex: number, text: string) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].text = text;
      setQuestions(newQuestions);
    };
    const handleAnswerChange = (
      qIndex: number,
      aIndex: number,
      text: string
    ) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].answers[aIndex].text = text;
      setQuestions(newQuestions);
    };
    const handleCorrectChange = (qIndex: number, aIndex: number) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].answers[aIndex].isCorrect =
        !newQuestions[qIndex].answers[aIndex].isCorrect;
      setQuestions(newQuestions);
    };
    const addAnswer = (qIndex: number) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].answers.push({
        id: crypto.randomUUID(),
        text: "",
        isCorrect: false,
      });
      setQuestions(newQuestions);
    };
    const removeAnswer = (qIndex: number, aIndex: number) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter(
        (_, i) => i !== aIndex
      );
      setQuestions(newQuestions);
    };
    const addQuestion = () => {
      if (questions.length < 10) {
        setQuestions([
          ...questions,
          {
            id: crypto.randomUUID(),
            text: "",
            answers: [{ id: crypto.randomUUID(), text: "", isCorrect: false }],
          },
        ]);
      }
    };
    const removeQuestion = (qIndex: number) => {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    };

    // --- Case Study AI Handler ---
    const handleGenerateWithAI = () => {
      setIsGenerating(true);
      // Simulating API call to Gemini
      setTimeout(() => {
        setScenario(
          `**Contexto:**
Una empresa de E-commerce de tamaño mediano, "UrbanStyle", ha experimentado un crecimiento del 150% en ventas durante el último año. Sin embargo, su sistema de gestión de inventario, basado en hojas de cálculo y procesos manuales, está generando cuellos de botella: quiebres de stock en productos populares y sobre-stock en otros, afectando la rentabilidad y la satisfacción del cliente.

**Problema:**
El CTO ha decidido implementar un nuevo Sistema de Gestión de Inventario (SGI) automatizado. Se requiere una solución que se integre con la plataforma de E-commerce existente (Shopify), el sistema de logística (proveedor externo) y el software de contabilidad (QuickBooks).

**Tu Rol:**
Eres el/la Arquitecto/a de Software a cargo del proyecto.

**Tarea:**
1.  **Diseño de Arquitectura:** Propón un diagrama de arquitectura de alto nivel para la solución. Describe los componentes principales (ej: microservicios, API Gateway, base de datos, bus de eventos) y cómo interactúan entre sí. Justifica tu elección de estilo arquitectónico (ej: microservicios vs. monolito).
2.  **Elección Tecnológica:** Recomienda un stack tecnológico para los componentes clave (backend, base de datos, mensajería). Justifica tus elecciones basándote en requisitos como escalabilidad, rendimiento y facilidad de integración.
3.  **Plan de Integración:** Describe los pasos y estrategias clave para integrar el nuevo SGI con Shopify, el proveedor de logística y QuickBooks, minimizando el impacto en las operaciones diarias. Menciona los posibles riesgos y cómo los mitigarías.
4.  **Desafíos:** Identifica los 3 principales desafíos técnicos o de negocio que prevés en este proyecto y cómo los abordarías.`
        );
        setIsGenerating(false);
      }, 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      let newTest: Test;
      if (testType === "multiple-choice") {
        // Basic validation
        if (questions.length < 5) {
          alert("Debe haber un mínimo de 5 preguntas.");
          return;
        }
        if (
          questions.some(
            (q) => q.answers.filter((a) => a.isCorrect).length === 0
          )
        ) {
          alert("Cada pregunta debe tener al menos una respuesta correcta.");
          return;
        }

        newTest = {
          id: crypto.randomUUID(),
          name,
          description,
          type: "multiple-choice",
          questions,
        };
      } else {
        newTest = {
          id: crypto.randomUUID(),
          name,
          description,
          type: "case-study",
          scenario,
        };
      }
      onSave(newTest);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-bold">
              Crear Nuevo Test para {profession}
            </h3>
            <button onClick={onClose}>
              <CloseIcon size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div>
                <label>Nombre del Test</label>
                  <InputText value={name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                  className="w-full mt-1 input-style p-inputtext-sm"
                   required/>
                
              </div>
              <div>
                <label>Descripción</label>
                 <InputTextarea value={description} 
                 onChange={(e) => setDescription(e.target.value)} rows={5} cols={30}
                  className="w-full mt-1 input-style"  required/>
                
              </div>
              <div>
                <label>Tipo de Test</label>
                  <Dropdown
                  value={testType}
                  onChange={(e: DropdownChangeEvent) => setTestType(e.value)}
                 options={[
                 { name: 'Multiple Choice', value: 'multiple-choice' },
                 { name: 'Caso de Estudio', value: 'case-study' }
          ]}
                  optionLabel="name"
                    className="mt-1 block w-full input-style"
                />
              </div>

              {testType === "multiple-choice" && (
                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  {questions.map((q, qIndex) => (
                    <Card
                      key={q.id}
                      className="p-4 border dark:border-gray-600 rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <label className="font-semibold">
                          Pregunta {qIndex + 1}
                        </label>
                        {questions.length > 5 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                       <InputTextarea value={q.text} 
                       onChange={(e) => handleQuestionChange(qIndex, e.target.value)} rows={5} cols={30}
                        className="w-full mt-1 input-style" 
                        placeholder="Escribe la pregunta..."/>                    
                      <div className="pl-4 space-y-2">
                        {q.answers.map((ans, aIndex) => (
                          <div key={ans.id} className="flex items-center gap-2">
                             <Checkbox onChange={() =>
                                handleCorrectChange(qIndex, aIndex)
                              } checked={ans.isCorrect}></Checkbox>
                          
                            <InputText  value={ans.text}
                            onChange={(e) =>
                                handleAnswerChange(
                                  qIndex,
                                  aIndex,
                                  e.target.value
                                )} 
                             className="w-full input-style"
                              placeholder={`Respuesta ${aIndex + 1}`}
                               required  />
                          
                            {q.answers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <CloseIcon size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="text-sm text-blue-600 hover:underline"
                          link
                        >
                          + Añadir Respuesta
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {questions.length < 10 && (
                    <Button
                      type="button"
                      onClick={addQuestion}
                      className="p-2 mt-2  bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Añadir Pregunta ({questions.length}/10)
                    </Button>
                  )}
                </div>
              )}
              {testType === "case-study" && (
                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold">
                      Escenario del Caso de Estudio
                    </label>
                    <Button
                      type="button"
                      onClick={handleGenerateWithAI}
                      disabled={isGenerating}
                     
                    >
                      <Wand2 size={16} />{" "}
                      {isGenerating ? "Generando..." : "Crear con IA (Gemini)"}
                    </Button>
                  </div>
                   <InputTextarea  value={scenario}
                        onChange={(e) => setScenario(e.target.value)}rows={5} cols={30}
                        className="w-full mt-1 input-style" 
                       placeholder="Describe el caso de estudio o genéralo con IA."
                        required/>    
                 
                  <p className="text-xs text-gray-500 text-center">
                    La evaluación de la respuesta del candidato a este test se
                    realizará mediante IA.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <Button
                type="submit"
               
              >
                Guardar Test
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Gestión de Tests
      </h2>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("technical")}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${
            activeTab === "technical"
              ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7]  text-shadow-md"
              : "text-gray-500 hover:text-blue-500 text-shadow-md"
          }`}
        >
          Tests Técnicos
        </button>
        <button
          onClick={() => setActiveTab("soft-skills")}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${
            activeTab === "soft-skills"
              ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7]  text-shadow-md"
              : "text-gray-500 hover:text-blue-500 text-shadow-md"
          }`}
        >
          Soft Skills
        </button>
      </div>

      {activeTab === "technical" && (
        <div>
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="profession-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Seleccionar Profesión
                </label>
                <Dropdown
                  value={selectedProfession}
                  onChange={(e: DropdownChangeEvent) => setSelectedProfession(e.value)}
                  options={professions}
                  optionLabel="name"
                  className="block w-full input-style"
                />
              </div>
              <Button
                onClick={handleAddNewProfession}
               severity="secondary" text
              >
                <Plus size={16} />
                Añadir Profesión
              </Button>
              <Button
                onClick={() => setIsTestModalOpen(true)}
                text raised 
              >
                Crear Nuevo Test
              </Button>
            </div>
          </Card>
          <Card>
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">
              Tests para{" "}
              <span className="text-blue-500">{selectedProfession}</span>
            </h3>
            <div className="space-y-4">
              {!testsByProfession[selectedProfession] ||
              testsByProfession[selectedProfession].length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No hay tests para esta profesión. ¡Crea uno nuevo!
                </p>
              ) : (
                testsByProfession[selectedProfession].map((test) => (
                  <div
                    key={test.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {test.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {test.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          test.type === "multiple-choice"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {test.type === "multiple-choice"
                          ? "Multiple Choice"
                          : "Caso de Estudio"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          <CreateTestModal
            isOpen={isTestModalOpen}
            onClose={() => setIsTestModalOpen(false)}
            onSave={handleSaveTest}
            profession={selectedProfession}
          />
        </div>
      )}

      {activeTab === "soft-skills" && (
        <div>
          <Card className="mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">
              Añadir Nueva Habilidad Blanda
            </h3>
            <form onSubmit={handleSoftSkillSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="softskill-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nombre de la Habilidad Blanda
                </label>
                 <InputText value={newSoftSkill.name}
                  onChange={(e) =>
                    setNewSoftSkill({ ...newSoftSkill, name: e.target.value })}
                  className="mt-1 block w-full input-style"
                   required/> 
              </div>
              <div>
                <label
                  htmlFor="softskill-desc"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Descripción
                </label>
                 <InputTextarea  value={newSoftSkill.description}
                        onChange={(e) => setNewSoftSkill({ ...newSoftSkill, description: e.target.value })}
                        rows={5} cols={30}
                        className="w-full mt-1 input-style"
                        required/>        
              </div>
              <div className="text-right">
                <Button
                  text raised 
                 
                >
                  Guardar Habilidad Blanda
                </Button>
              </div>
            </form>
          </Card>
          <Card>
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">
              Habilidades Blandas Existentes
            </h3>
            <div className="space-y-3">
              {softSkills.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Aún no se han creado habilidades blandas.
                </p>
              ) : (
                softSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {skill.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
