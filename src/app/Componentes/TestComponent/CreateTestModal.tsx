
import React, { useEffect, useState } from 'react';
import { AlertCircle, X as CloseIcon, Plus, Trash2, Wand2 } from 'lucide-react';
import { Card } from 'primereact/card';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Test, Question } from "@/app/Interfas/Interfaces";
import { useCaseStudyGeneration } from '@/app/util/useCaseStudyGeneration';
interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (test: Test) => void;
  profession: string;
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};


export const CreateTestModal: React.FC<CreateTestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profession,
}) => {
  const [testType, setTestType] = useState<"multiple-choice" | "case-study">("multiple-choice");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: generateId(),
      text: "",
      answers: [
        { id: generateId(), text: "", isCorrect: false },
        { id: generateId(), text: "", isCorrect: false },
      ],
    },
  ]);
  const [scenario, setScenario] = useState("");
console.log(  questions)
// Hook para generación con IA
  const { generateCaseStudy, isGenerating, setIsGenerating, error, clearError } = useCaseStudyGeneration();

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTestType("multiple-choice");
      setName("");
      setDescription("");
      setQuestions([
        {
          id: generateId(),
          text: "",
          answers: [
            { id: generateId(), text: "", isCorrect: false },
            { id: generateId(), text: "", isCorrect: false },
          ],
        },
      ]);
      setScenario("");
      setIsGenerating(false);
      clearError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Multiple Choice Handlers
  const handleQuestionChange = (qIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].text = text;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, text: string) => {
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
      id: generateId(),
      text: "",
      isCorrect: false,
    });
    setQuestions(newQuestions);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].answers.length > 1) {
      newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter(
        (_, i) => i !== aIndex
      );
      setQuestions(newQuestions);
    }
  };

  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([
        ...questions,
        {
          id: generateId(),
          text: "",
          answers: [
            { id: generateId(), text: "", isCorrect: false },
            { id: generateId(), text: "", isCorrect: false },
          ],
        },
      ]);
    }
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    }
  };

  // AI Generation Handler
  const handleGenerateWithAI = async () => {
    if (!description.trim()) {
      alert("Por favor, completa la descripción del test antes de generar con IA.");
      return;
    }

    clearError();
    
    try {
      const generatedScenario = await generateCaseStudy({
        profession,
        description,
        difficulty: 'intermediate', // Puedes hacer esto configurable
      });
      
      setScenario(generatedScenario);
    } catch (err) {
      console.error('Error al generar caso de estudio:', err);
      // El error ya está manejado en el hook
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newTest: Test;
    
    if (testType === "multiple-choice") {
      // Validation for multiple choice
      if (questions.length < 1) {
        alert("Debe haber al menos 1 pregunta.");
        return;
      }
      
      const invalidQuestions = questions.filter(q => 
        !q.text.trim() || 
        q.answers.length < 2 ||
        q.answers.filter(a => a.isCorrect).length === 0 ||
        q.answers.some(a => !a.text.trim())
      );
      
      if (invalidQuestions.length > 0) {
        alert("Todas las preguntas deben tener texto, al menos 2 respuestas con texto, y al menos una respuesta correcta.");
        return;
      }

      newTest = {
        id: generateId(),
        name,
        description,
        type: "multiple-choice",
        questions,
      };
    } else {
      // Validation for case study
      if (!scenario.trim()) {
        alert("El escenario del caso de estudio es obligatorio.");
        return;
      }

      newTest = {
        id: generateId(),
        name,
        description,
        type: "case-study",
        scenario,
      };
    }
    
    onSave(newTest);
  };

  if (!isOpen) return null;

  const testTypeOptions = [
    { name: 'Opción Múltiple', value: 'multiple-choice' },
    { name: 'Caso de Estudio', value: 'case-study' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Crear Nuevo Test para {profession}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Test *
                </label>
                <InputText 
                  value={name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                  className="w-full input-style"
                  placeholder="Ej: JavaScript Avanzado"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Test *
                </label>
                <Dropdown
                  value={testType}
                  onChange={(e: DropdownChangeEvent) => setTestType(e.value)}
                  options={testTypeOptions}
                  optionLabel="name"
                  optionValue="value"
                  className="w-full input-style"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción *
              </label>
              <InputTextarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
                cols={30}
                className="w-full input-style"
                placeholder="Describe qué evalúa este test..."
                required
              />
            </div>

            {/* Multiple Choice Questions */}
            {testType === "multiple-choice" && (
              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-foreground">
                    Preguntas ({questions.length}/10)
                  </h4>
                  {questions.length < 10 && (
                    <Button
                      type="button"
                      onClick={addQuestion}
                      severity="secondary"
                      text
                    >
                      <Plus size={16} className="mr-1" />
                      Añadir Pregunta
                    </Button>
                  )}
                </div>

                {questions.map((q, qIndex) => (
                  <Card key={q.id} className="p-4 border border-border">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-foreground">
                          Pregunta {qIndex + 1}
                        </label>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-error hover:opacity-80"
                            text
                            size="small"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      <InputTextarea 
                        value={q.text} 
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)} 
                        rows={3} 
                        cols={30}
                        className="w-full input-style" 
                        placeholder="Escribe la pregunta..."
                        required
                      />

                      <div className="pl-4 space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                          Respuestas:
                        </label>
                        {q.answers.map((ans, aIndex) => (
                          <div key={ans.id} className="flex items-center gap-3">
                            <Checkbox
                              onChange={() => handleCorrectChange(qIndex, aIndex)}
                              checked={ans.isCorrect}
                              className="flex-shrink-0"
                            />
                            <InputText
                              value={ans.text}
                              onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                              className="flex-1 input-style"
                              placeholder={`Respuesta ${aIndex + 1}`}
                              required
                            />
                            {q.answers.length > 2 && (
                              <Button
                                type="button"
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                className="text-error hover:opacity-80 flex-shrink-0"
                                text
                                size="small"
                              >
                                <CloseIcon size={16} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="text-sm text-primary hover:opacity-80"
                          text
                          size="small"
                        >
                          <Plus size={14} className="mr-1" />
                          Añadir Respuesta
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Case Study Scenario */}
            {testType === "case-study" && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-foreground">
                    Escenario del Caso de Estudio
                  </label>
                  <Button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !description.trim()}
                    severity="secondary"
                  >
                    <Wand2 size={16} className="mr-2" />
                    {isGenerating ? "Generando..." : "Generar con IA"}
                  </Button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-error-soft border border-error rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="text-error mr-2" size={16} />
                      <span className="text-sm text-error-soft-foreground">
                        {error}
                      </span>
                      <button
                        type="button"
                        onClick={clearError}
                        className="ml-auto text-error hover:opacity-80"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}
                
                <InputTextarea  
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  rows={12} 
                  cols={30}
                  className="w-full input-style font-mono text-sm" 
                  placeholder="Describe el caso de estudio detalladamente o genéralo con IA..."
                  required
                  disabled={isGenerating}
                />    
                
                <div className="bg-primary/15 p-3 rounded-lg">
                  <p className="text-xs text-primary">
                    💡 <strong>Tip:</strong> Completa la descripción del test y luego usa el botón &quot;Generar con IA&quot;
                    para crear un caso de estudio personalizado para {profession}. La evaluación se realizará mediante IA.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted">
            <div className="text-sm text-muted-foreground">
              {testType === 'multiple-choice' ? 
                `${questions.length} pregunta${questions.length !== 1 ? 's' : ''} configurada${questions.length !== 1 ? 's' : ''}` :
                'Caso de estudio listo para evaluación por IA'
              }
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                severity="secondary"
                outlined
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !description.trim() || 
                  (testType === 'multiple-choice' && questions.some(q => !q.text.trim())) ||
                  (testType === 'case-study' && !scenario.trim()) ||
                  isGenerating
                }
              >
                {isGenerating ? "Procesando..." : "Guardar Test"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};