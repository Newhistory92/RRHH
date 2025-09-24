import { MessageSquare } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { SoftSkill } from "@/app/Interfas/Interfaces";

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

interface FeedbackTabProps {
  currentUser: UserData;
  usersData: UserData[];
  onSaveFeedback: (response: FeedbackResponse) => void;
  onUpdateUser: (updatedUser: UserData) => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ 
  currentUser, 
  usersData, 
  onSaveFeedback, 
  onUpdateUser 
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 🔥 AQUÍ ES DONDE DEBES AGREGAR TU FUNCIÓN POST PARA BASE DE DATOS
  // Modifica esta función para hacer el POST request a tu API
  const handleSubmit = async () => {
    if (survey && selectedResponse !== null) {
      const responseArray: [number, number, number] = [0, 0, 0];
      responseArray[selectedResponse] = 1;

      const feedbackData: FeedbackResponse = {
        evaluador: currentUser.name,
        evaluado: survey.evaluado,
        softSkills: survey.softSkills,
        respuesta: responseArray,
      };
      onSaveFeedback(feedbackData);
      generateSurvey();
    }
  };
  
  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-green-500" />
      <span className="text-2xl font-bold text-gray-800">Evaluacion del Equipo de Trabajo</span>
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
  const progressPercentage = progress.total > 0 ? (progress.evaluated / progress.total) * 100 : 0;

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
      <span className=" text-base font-bold text-gray-500 sm:ml-2">
        Tu Opinión es Totalmente Anónima
      </span>
      <div className='mt-4'>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Progreso de Evaluaciones</span>
        </div>
        <ProgressBar 
          value={progressPercentage} 
          displayValueTemplate={() => `${progress.evaluated}/${progress.total}`} 
        />
        <div className="mt-2 mb-5 text-xs text-gray-600">
          {progress.total > 0 
            ? `${Math.round(progressPercentage)}% completado`
            : 'Sin evaluaciones disponibles'
          }
        </div>
      </div>

      {survey ? (
        <div className="space-y-6">
          <Card className="p-1 rounded-lg border border-indigo-200 ">
            <p className="text-lg text-gray-700 mb-3">
              ¿Consideras que tu compañero/a{' '}
              <span className="font-bold text-indigo-600">{survey.evaluado}</span>{' '}
              tiene la habilidad de...
            </p>
            <div >
              <p className="text-xl font-semibold text-indigo-700">
                &quot;{survey.softSkills.nombre}&quot;
              </p>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <SelectButton 
              value={selectedResponse} 
              onChange={(e) => setSelectedResponse(e.value)} 
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

export type { UserData, FeedbackResponse, Survey };