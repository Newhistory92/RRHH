import React, { useState,  useEffect } from 'react';
import { Users, Star, MessageSquare, Save, Send, BarChart, User, Building } from 'lucide-react';
import { UserData,SoftSkill, Survey, FeedbackResponse } from '@/app/Interfas/Interfaces';
import{ALL_SOFT_SKILLS} from '@/app/api/Prueba';

// Datos iniciales para simular una base de datos
const MOCK_DATA: Record<string, UserData> = {
  'Juan Pérez': {
    usuario: 'Juan Pérez',
    departamento: 'Ventas',
    habilidades_blandas: ['Comunicación', 'Negociación', 'Orientación al Cliente', 'Proactividad', 'Toma de Decisiones'],
    feedback_history: [],
  },
  'María López': {
    usuario: 'María López',
    departamento: 'Ventas',
    habilidades_blandas: ['Trabajo en Equipo', 'Empatía', 'Gestión del Tiempo', 'Comunicación', 'Adaptabilidad'],
    feedback_history: [],
  },
  'Carlos Gómez': {
    usuario: 'Carlos Gómez',
    departamento: 'Ventas',
    habilidades_blandas: ['Liderazgo', 'Resolución de Conflictos', 'Pensamiento Crítico', 'Comunicación', 'Autocontrol'],
    feedback_history: [],
  },
  'Ana Torres': {
    usuario: 'Marketing',
    departamento: 'Marketing',
    habilidades_blandas: ['Creatividad', 'Comunicación', 'Trabajo en Equipo', 'Adaptabilidad', 'Proactividad'],
    feedback_history: [],
  },
};


// --- COMPONENTES DE PESTAÑAS --- //

const SoftSkillsTab = ({ currentUser, usersData, onSave }: { currentUser: UserData; usersData: Record<string, UserData>; onSave: (skills: SoftSkill[]) => void; }) => {
  const [selectedSkills, setSelectedSkills] = useState<Set<SoftSkill>>(new Set(currentUser.habilidades_blandas));
  const [error, setError] = useState('');

  const handleToggleSkill = (skill: SoftSkill) => {
    const newSelection = new Set(selectedSkills);
    if (newSelection.has(skill)) {
      newSelection.delete(skill);
    } else {
      newSelection.add(skill);
    }
    setSelectedSkills(newSelection);
    if (newSelection.size >= 5) {
        setError('');
    }
  };

  const handleSave = () => {
    if (selectedSkills.size < 5) {
      setError('Debes seleccionar al menos 5 habilidades.');
      return;
    }
    onSave(Array.from(selectedSkills));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Star className="mr-3 text-yellow-500" />
        Mis Habilidades Blandas
      </h2>
      <p className="text-gray-600 mb-6">Selecciona al menos 5 habilidades que mejor te representen.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {ALL_SOFT_SKILLS.map(skill => (
          <label key={skill} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedSkills.has(skill) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}`}>
            <input
              type="checkbox"
              checked={selectedSkills.has(skill)}
              onChange={() => handleToggleSkill(skill)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700 font-medium">{skill}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSave}
        disabled={selectedSkills.size < 5}
        className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Save className="mr-2" />
        Guardar Habilidades ({selectedSkills.size})
      </button>
    </div>
  );
};

const FeedbackTab = ({ currentUser, usersData, onSaveFeedback }: { currentUser: UserData; usersData: Record<string, UserData>; onSaveFeedback: (response: FeedbackResponse) => void; }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

  useEffect(() => {
    generateSurvey();
  }, [currentUser, usersData]);

  const generateSurvey = () => {
    const colleagues = Object.values(usersData).filter(
      user => user.departamento === currentUser.departamento && user.usuario !== currentUser.usuario
    );

    if (colleagues.length === 0) {
      setSurvey(null);
      return;
    }

    // Crear un pool ponderado de habilidades de los compañeros
    const skillPool: { evaluado: string; habilidad_blanda: SoftSkill }[] = [];
    colleagues.forEach(colleague => {
      colleague.habilidades_blandas.forEach(skill => {
        skillPool.push({ evaluado: colleague.usuario, habilidad_blanda: skill });
      });
    });

    // Filtrar combinaciones que ya están en el historial reciente del evaluador
    const validPool = skillPool.filter(
      potentialSurvey => !currentUser.feedback_history.some(
        historyItem => historyItem.evaluado === potentialSurvey.evaluado && historyItem.habilidad_blanda === potentialSurvey.habilidad_blanda
      )
    );

    if (validPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * validPool.length);
      setSurvey(validPool[randomIndex]);
    } else {
      // Si todas las opciones posibles ya fueron evaluadas recientemente, se elige una del pool original
      const randomIndex = Math.floor(Math.random() * skillPool.length);
      setSurvey(skillPool[randomIndex]);
    }
    setSelectedResponse(null);
  };

  const handleSubmit = () => {
    if (survey && selectedResponse !== null) {
      const responseArray: [number, number, number] = [0, 0, 0];
      responseArray[selectedResponse] = 1;

      onSaveFeedback({
        evaluador: currentUser.usuario,
        evaluado: survey.evaluado,
        habilidad_blanda: survey.habilidad_blanda,
        respuesta: responseArray,
      });
      // Generar nueva encuesta después de enviar
      generateSurvey();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <MessageSquare className="mr-3 text-green-500" />
        Encuesta de Feedback
      </h2>
      {survey ? (
        <div>
          <p className="text-lg text-gray-700 mb-2">
            ¿Consideras que tu compañero/a <span className="font-bold">{survey.evaluado}</span> tiene la habilidad de...
          </p>
          <p className="text-2xl font-semibold text-blue-600 mb-6">"{survey.habilidad_blanda}"?</p>
          
          <div className="space-y-3 mb-6">
            {['Mala', 'Buena', 'Excelente'].map((label, index) => (
              <label key={index} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedResponse === index ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-green-400'}`}>
                <input
                  type="radio"
                  name="feedback"
                  checked={selectedResponse === index}
                  onChange={() => setSelectedResponse(index)}
                  className="h-5 w-5 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-gray-700 font-medium">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedResponse === null}
            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="mr-2" />
            Enviar Feedback
          </button>
        </div>
      ) : (
        <p className="text-gray-600">No hay encuestas disponibles en este momento. Asegúrate de que haya otros compañeros en tu departamento con habilidades registradas.</p>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL --- //

export default function SkillBlandas() {
  const [activeTab, setActiveTab] = useState<'skills' | 'feedback'>('skills');
  const [currentUser, setCurrentUser] = useState<string>('Juan Pérez');
  const [usersData, setUsersData] = useState<Record<string, UserData>>(MOCK_DATA);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResponse[]>([]);

  const handleSaveSkills = (skills: SoftSkill[]) => {
    setUsersData(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        habilidades_blandas: skills,
      }
    }));
    alert('¡Habilidades guardadas con éxito!');
  };

  const handleSaveFeedback = (response: FeedbackResponse) => {
    setFeedbackResults(prev => [...prev, response]);
    
    // Actualizar historial del evaluador para evitar repeticiones
    setUsersData(prev => {
        const newHistory = [
            { evaluado: response.evaluado, habilidad_blanda: response.habilidad_blanda },
            ...prev[response.evaluador].feedback_history
        ].slice(0, 3); // Mantener solo los últimos 3

        return {
            ...prev,
            [response.evaluador]: {
                ...prev[response.evaluador],
                feedback_history: newHistory
            }
        }
    });

    alert('¡Feedback enviado con éxito!');
  };

  const currentUserData = usersData[currentUser];
  const userList = Object.keys(usersData);

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Sistema de Gestión de Talento</h1>
          <p className="text-lg text-gray-600">Gestiona habilidades blandas y feedback 360°.</p>
        </header>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="mr-2" />
                Simular sesión como:
            </label>
            <select
                id="user-select"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
                {userList.map(user => <option key={user} value={user}>{user} ({usersData[user].departamento})</option>)}
            </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Pestañas */}
            <div className="flex border-b border-gray-200 mb-6">
              <button onClick={() => setActiveTab('skills')} className={`px-4 py-3 font-semibold transition-colors ${activeTab === 'skills' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
                <Star className="inline-block mr-2 h-5 w-5" /> Habilidades Blandas
              </button>
              <button onClick={() => setActiveTab('feedback')} className={`px-4 py-3 font-semibold transition-colors ${activeTab === 'feedback' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
                <MessageSquare className="inline-block mr-2 h-5 w-5" /> Feedback
              </button>
            </div>

            {/* Contenido de la pestaña activa */}
            <div>
              {activeTab === 'skills' ? (
                <SoftSkillsTab currentUser={currentUserData} usersData={usersData} onSave={handleSaveSkills} />
              ) : (
                <FeedbackTab currentUser={currentUserData} usersData={usersData} onSaveFeedback={handleSaveFeedback} />
              )}
            </div>
          </div>
          
          {/* Visualización de JSON */}
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Users className="mr-2" /> JSON: Datos de Usuarios</h3>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-96">
                {JSON.stringify(usersData, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><BarChart className="mr-2" /> JSON: Resultados de Feedback</h3>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-64">
                {JSON.stringify(feedbackResults, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
