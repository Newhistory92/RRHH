
import { MessageSquare, BarChart, User } from 'lucide-react';
import React, { useState, useEffect ,useRef} from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';       
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import {SoftSkill}  from "@/app/Interfas/Interfaces"       
import {EMPLOYEES_DATA} from '@/app/api/prueba2';
import { ProgressBar } from 'primereact/progressbar';
// Simulamos las interfaces y datos ya que no tenemos acceso a los imports reales
interface UserData {
  id: number;
  name: string;
  department: string;
  softSkills: SoftSkill[];
  feedback_history: { evaluado: string; softSkills: SoftSkill }[];
  lastCompleteFeedback?: string;
}

interface FeedbackResponse {
  evaluador: string;
  evaluado: string;
  softSkills: SoftSkill;
  respuesta: [number, number, number]; // [Mala, Buena, Excelente]
}

interface Survey {
  evaluado: string;
  softSkills: SoftSkill;
}

// --- COMPONENTE DE FEEDBACK ADAPTADO --- //
const FeedbackTab = ({ 
  currentUser, 
  usersData, 
  onSaveFeedback, 
  onUpdateUser 
}: { 
  currentUser: UserData; 
  usersData: UserData[]; 
  onSaveFeedback: (response: FeedbackResponse) => void;
  onUpdateUser: (updatedUser: UserData) => void;
}) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  
  const feedbackOptions = [
    { label: 'Mala', value: 0 },
    { label: 'Buena', value: 1 },
    { label: 'Excelente', value: 2 },
  ];

  useEffect(() => {
    generateSurvey();
  }, [currentUser, usersData]);

  const generateSurvey = () => {
    // Verificar si el período de espera de 3 meses ha pasado
    if (currentUser.lastCompleteFeedback) {
      const lastFeedbackDate = new Date(currentUser.lastCompleteFeedback);
      const threeMonthsLater = new Date(lastFeedbackDate);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      if (new Date() < threeMonthsLater) {
        setSurvey(null);
        return;
      }
    }

    // Filtrar colegas del mismo departamento
    const colleagues = usersData.filter(
      user => user.department === currentUser.department && user.id !== currentUser.id
    );
    
    if (colleagues.length === 0) { 
      setSurvey(null); 
      return; 
    }

    // Crear pool de todas las habilidades disponibles para evaluar
    const allSkillsPool: { evaluado: string; softSkills: SoftSkill }[] = [];
    colleagues.forEach(colleague => {
      colleague.softSkills.forEach(skill => {
        allSkillsPool.push({ evaluado: colleague.name, softSkills: skill });
      });
    });
    
    if (allSkillsPool.length === 0) { 
      setSurvey(null); 
      return; 
    }

    // Filtrar habilidades ya evaluadas
    const pendingSkills = allSkillsPool.filter(
      potentialSurvey => !currentUser.feedback_history?.some(
        historyItem => historyItem.evaluado === potentialSurvey.evaluado && 
        historyItem.softSkills.nombre === potentialSurvey.softSkills.nombre
      )
    );

    // Si no hay habilidades pendientes, todas fueron evaluadas
    if (pendingSkills.length === 0) {
      // Marcar como feedback completo y reiniciar historial
      const updatedUser = { 
        ...currentUser, 
        feedback_history: [], 
        lastCompleteFeedback: new Date().toISOString() 
      };
      onUpdateUser(updatedUser);
      setSurvey(null);
      return;
    }

    // Seleccionar una habilidad aleatoria de las pendientes
    const randomIndex = Math.floor(Math.random() * pendingSkills.length);
    setSurvey(pendingSkills[randomIndex]);
    setSelectedResponse(null);
  };

  const handleSubmit = () => {
    if (survey && selectedResponse !== null) {
      const responseArray: [number, number, number] = [0, 0, 0];
      responseArray[selectedResponse] = 1;

      onSaveFeedback({
        evaluador: currentUser.name,
        evaluado: survey.evaluado,
        softSkills: survey.softSkills,
        respuesta: responseArray,
      });
      generateSurvey();
    }
  };
  
  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-green-500" />
      <span className="text-2xl font-bold text-gray-800">Encuesta de Feedback</span>
    </div>
  );

  // Calcular progreso de evaluaciones
  const getEvaluationProgress = () => {
    const colleagues = usersData.filter(
      user => user.department === currentUser.department && user.id !== currentUser.id
    );
    
    const totalSkills = colleagues.reduce((total, colleague) => total + colleague.softSkills.length, 0);
    const evaluatedSkills = currentUser.feedback_history?.length || 0;
    
    return { total: totalSkills, evaluated: evaluatedSkills };
  };

  const progress = getEvaluationProgress();

  // Función para obtener el mensaje apropiado cuando no hay encuestas
  const getNoSurveyMessage = () => {
    if (currentUser.lastCompleteFeedback) {
      const lastFeedbackDate = new Date(currentUser.lastCompleteFeedback);
      const threeMonthsLater = new Date(lastFeedbackDate);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      if (new Date() < threeMonthsLater) {
        const remainingDays = Math.ceil((threeMonthsLater.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return `Has completado todas las evaluaciones de feedback. Podrás realizar nuevas evaluaciones en ${remainingDays} días (${threeMonthsLater.toLocaleDateString()}).`;
      }
    }
    
    return "No hay encuestas disponibles en este momento. Asegúrate de que haya otros compañeros en tu departamento con habilidades registradas.";
  };

  return (
    <Card title={cardTitle}>
      {/* Mostrar progreso de evaluaciones */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Progreso de Evaluaciones</span>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {progress.evaluated} / {progress.total}
          </span>
        </div>
        <CustomProgressBar value={progress.evaluated} max={progress.total} />
        <div className="mt-2 text-xs text-gray-600">
          {progress.total > 0 
            ? `${Math.round((progress.evaluated / progress.total) * 100)}% completado`
            : 'Sin evaluaciones disponibles'
          }
        </div>
      </div>

      {survey ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
            <p className="text-lg text-gray-700 mb-3">
              ¿Consideras que tu compañero/a{' '}
              <span className="font-bold text-indigo-600">{survey.evaluado}</span>{' '}
              tiene la habilidad de...
            </p>
            <div className="bg-white p-4 rounded-md border-l-4 border-indigo-400">
              <p className="text-xl font-semibold text-indigo-700">
                "{survey.softSkills.nombre}"
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Nivel: {survey.softSkills.level}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <SelectButton 
              value={selectedResponse} 
              onChange={(e: any) => setSelectedResponse(e.value)} 
              options={feedbackOptions}
            />
          </div>

          <Button
            label="Enviar Feedback"
            onClick={handleSubmit}
            disabled={selectedResponse === null}
            className="w-full py-3 text-lg"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-4">
              {getNoSurveyMessage()}
            </p>
            {currentUser.lastCompleteFeedback && (
              <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
                Última evaluación completa: {new Date(currentUser.lastCompleteFeedback).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// --- COMPONENTE PRINCIPAL --- //
export default function FeedbackPage() {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [usersData, setUsersData] = useState<UserData[]>(EMPLOYEES_DATA);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResponse[]>([]);
  const toast = useRef<any>(null);

  const handleSaveFeedback = (response: FeedbackResponse) => {
    setFeedbackResults(prev => [...prev, response]);
    
    setUsersData(prev => {
      return prev.map(user => {
        if (user.name === response.evaluador) {
          const newHistory = [
            { evaluado: response.evaluado, softSkills: response.softSkills },
            ...(user.feedback_history || [])
          ];

          return { ...user, feedback_history: newHistory };
        }
        return user;
      });
    });
    
    toast.current?.show({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: 'Feedback enviado correctamente', 
      life: 3000 
    });
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setUsersData(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const currentUser = usersData.find(user => user.id === currentUserId);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <User className="mx-auto mb-4 text-gray-400" size={64} />
          <p className="text-xl text-gray-600">Usuario no encontrado</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser.feedback_history) {
    currentUser.feedback_history = [];
  }

  const userOptions = usersData.map(user => ({
    label: `${user.name} (${user.department})`,
    value: user.id.toString()
  }));

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Feedback 360°</h1>
          <p className="text-lg text-gray-600">Realiza encuestas de feedback entre compañeros de manera estructurada.</p>
        </header>

        <Card className="mb-6">
          <div className="flex items-center flex-wrap gap-4">
            <User className="text-indigo-500 text-xl" />
            <label htmlFor="user-select" className="font-medium text-gray-700">
              Simular sesión como:
            </label>
            <Dropdown
              value={currentUserId.toString()}
              options={userOptions}
              onChange={(e: any) => setCurrentUserId(parseInt(e.value))}
              placeholder="Selecciona un usuario"
              className="flex-1 min-w-64"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <FeedbackTab 
              currentUser={currentUser} 
              usersData={usersData} 
              onSaveFeedback={handleSaveFeedback}
              onUpdateUser={handleUpdateUser}
            />
          </div>
          
          <div className="space-y-6">
            <Card title={
              <div className="flex items-center">
                <BarChart className="mr-2 text-indigo-500" />
                <span>Resultados de Feedback</span>
              </div>
            }>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Total de evaluaciones realizadas: <span className="font-semibold text-indigo-600">{feedbackResults.length}</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap bg-gray-900 text-green-400 p-4 rounded-md font-mono">
                    {feedbackResults.length > 0 ? JSON.stringify(feedbackResults, null, 2) : 'No hay resultados aún...'}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}