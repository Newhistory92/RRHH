
import { Users, MessageSquare, BarChart, User } from 'lucide-react';
import React, { useState, useEffect ,useRef} from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';       
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
        


type SoftSkill = 
  | 'Comunicación' | 'Trabajo en Equipo' | 'Empatía' | 'Resolución de Conflictos' 
  | 'Adaptabilidad' | 'Liderazgo' | 'Creatividad' | 'Pensamiento Crítico' 
  | 'Gestión del Tiempo' | 'Toma de Decisiones' | 'Orientación al Cliente' 
  | 'Inteligencia Emocional' | 'Negociación' | 'Autocontrol' | 'Proactividad';



interface UserData {
  usuario: string;
  departamento: string;
  habilidades_blandas: SoftSkill[];
  feedback_history: { evaluado: string; habilidad_blanda: SoftSkill }[];
}

interface FeedbackResponse {
  evaluador: string;
  evaluado: string;
  habilidad_blanda: SoftSkill;
  respuesta: [number, number, number]; // [Mala, Buena, Excelente]
}

interface Survey {
  evaluado: string;
  habilidad_blanda: SoftSkill;
}

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
    usuario: 'Ana Torres',
    departamento: 'Marketing',
    habilidades_blandas: ['Creatividad', 'Comunicación', 'Trabajo en Equipo', 'Adaptabilidad', 'Proactividad'],
    feedback_history: [],
  },
};

// --- COMPONENTE DE FEEDBACK --- //

const FeedbackTab = ({ currentUser, usersData, onSaveFeedback }: { currentUser: UserData; usersData: Record<string, UserData>; onSaveFeedback: (response: FeedbackResponse) => void; }) => {
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
    const colleagues = Object.values(usersData).filter(
      user => user.departamento === currentUser.departamento && user.usuario !== currentUser.usuario
    );
    if (colleagues.length === 0) { setSurvey(null); return; }

    const skillPool: { evaluado: string; habilidad_blanda: SoftSkill }[] = [];
    colleagues.forEach(colleague => {
      colleague.habilidades_blandas.forEach(skill => {
        skillPool.push({ evaluado: colleague.usuario, habilidad_blanda: skill });
      });
    });
    if (skillPool.length === 0) { setSurvey(null); return; }

    const validPool = skillPool.filter(
      potentialSurvey => !currentUser.feedback_history.some(
        historyItem => historyItem.evaluado === potentialSurvey.evaluado && historyItem.habilidad_blanda === potentialSurvey.habilidad_blanda
      )
    );

    const poolToUse = validPool.length > 0 ? validPool : skillPool;
    const randomIndex = Math.floor(Math.random() * poolToUse.length);
    setSurvey(poolToUse[randomIndex]);
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
      generateSurvey();
    }
  };
  
  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-green-500" />
      <span className="text-2xl font-bold text-gray-800">Encuesta de Feedback</span>
    </div>
  );

  return (
    <Card title={cardTitle}>
      {survey ? (
        <div>
          <p className="text-lg text-gray-700 mb-2">
            ¿Consideras que tu compañero/a <span className="font-bold">{survey.evaluado}</span> tiene la habilidad de...
          </p>
          <p className="text-2xl font-semibold text-indigo-600 mb-6">&ldquo;{survey.habilidad_blanda}&quot;?</p>
          
          <div className="card flex justify-content-center mb-6">
             <SelectButton value={selectedResponse} onChange={(e) => setSelectedResponse(e.value)} options={feedbackOptions} optionLabel="label" />
          </div>

          <Button
            label="Enviar Feedback"
            icon="pi pi-send"
            onClick={handleSubmit}
            disabled={selectedResponse === null}
            className="w-full p-button-success"
          />
        </div>
      ) : (
        <p className="text-gray-600">No hay encuestas disponibles en este momento. Asegúrate de que haya otros compañeros en tu departamento con habilidades registradas.</p>
      )}
    </Card>
  );
};

// --- COMPONENTE PRINCIPAL --- //

export default function FeedbackPage() {
  const [currentUser, setCurrentUser] = useState<string>('Juan Pérez');
  const [usersData, setUsersData] = useState<Record<string, UserData>>(MOCK_DATA);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResponse[]>([]);
  const toast = useRef<any>(null);

  const handleSaveFeedback = (response: FeedbackResponse) => {
    setFeedbackResults(prev => [...prev, response]);
    
    setUsersData(prev => {
        const newHistory = [
            { evaluado: response.evaluado, habilidad_blanda: response.habilidad_blanda },
            ...prev[response.evaluador].feedback_history
        ].slice(0, 3);

        return {
            ...prev,
            [response.evaluador]: { ...prev[response.evaluador], feedback_history: newHistory }
        }
    });
    
    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Feedback enviado correctamente', life: 3000 });
  };

  const currentUserData = usersData[currentUser];
  const userOptions = Object.keys(usersData).map(user => ({
      label: `${user} (${usersData[user].departamento})`,
      value: user
  }));

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Sistema de Feedback 360°</h1>
          <p className="text-lg text-gray-600">Realiza encuestas de feedback entre compañeros.</p>
        </header>

        <Card className="mb-6">
          <div className="flex items-center">
              <User className="mr-3 text-indigo-500 text-xl" />
              <label htmlFor="user-select" className="font-medium text-gray-700 mr-4">
                Simular sesión como:
              </label>
              <Dropdown
                  id="user-select"
                  value={currentUser}
                  options={userOptions}
                  onChange={(e) => setCurrentUser(e.value)}
                  placeholder="Selecciona un usuario"
                  className="w-full md:w-1/2"
              />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FeedbackTab currentUser={currentUserData} usersData={usersData} onSaveFeedback={handleSaveFeedback} />
          </div>
          
          <div className="space-y-6">
            <Card title={<div className="flex items-center"><Users className="mr-2" /><span>JSON: Datos de Usuarios</span></div>}>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-96 bg-gray-900 text-white p-3 rounded-md">
                {JSON.stringify(usersData, null, 2)}
              </pre>
            </Card>
            <Card title={<div className="flex items-center"><BarChart className="mr-2" /><span>JSON: Resultados de Feedback</span></div>}>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-64 bg-gray-900 text-white p-3 rounded-md">
                {JSON.stringify(feedbackResults, null, 2)}
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
