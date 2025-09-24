import { BarChart, User } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';       
import { Card } from 'primereact/card';
import { EMPLOYEES_DATA } from '@/app/api/prueba2';
import { FeedbackTab, UserData, FeedbackResponse } from '@/app/Componentes/Encuesta/FeedbackTab';

export default function FeedbackPage() {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [usersData, setUsersData] = useState<UserData[]>(EMPLOYEES_DATA);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResponse[]>([]);
  const toast = useRef<Toast>(null);

  // 🔥 FUNCIÓN PRINCIPAL DONDE PUEDES AGREGAR TU LÓGICA POST A BASE DE DATOS
  // Esta función se ejecuta cuando se guarda el feedback y también actualiza el estado local
  const handleSaveFeedback = async (response: FeedbackResponse) => {
    // TODO: Aquí puedes agregar tu llamada POST a la base de datos
    // Ejemplo:
    // try {
    //   const apiResponse = await fetch('/api/feedback', {
    //     method: 'POST',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}` // si necesitas autenticación
    //     },
    //     body: JSON.stringify(response)
    //   });
    //   
    //   if (!apiResponse.ok) {
    //     throw new Error('Error al guardar en base de datos');
    //   }
    //   
    //   const savedFeedback = await apiResponse.json();
    //   console.log('Feedback guardado:', savedFeedback);
    // } catch (error) {
    //   console.error('Error:', error);
    //   toast.current?.show({ 
    //     severity: 'error', 
    //     summary: 'Error', 
    //     detail: 'No se pudo guardar el feedback', 
    //     life: 3000 
    //   });
    //   return; // No actualizar el estado local si falla el POST
    // }

    // Actualizar estado local (solo después de POST exitoso)
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

  // 🔥 FUNCIÓN PARA ACTUALIZAR USUARIO CUANDO COMPLETA TODAS LAS EVALUACIONES
  // También aquí puedes agregar lógica POST para actualizar el estado del usuario en BD
  const handleUpdateUser = async (updatedUser: UserData) => {
    // TODO: Aquí puedes agregar tu llamada PUT/PATCH para actualizar usuario
    // Ejemplo:
    // try {
    //   const apiResponse = await fetch(`/api/users/${updatedUser.id}`, {
    //     method: 'PUT',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     },
    //     body: JSON.stringify({
    //       lastCompleteFeedback: updatedUser.lastCompleteFeedback,
    //       feedback_history: updatedUser.feedback_history
    //     })
    //   });
    //   
    //   if (!apiResponse.ok) {
    //     throw new Error('Error al actualizar usuario');
    //   }
    // } catch (error) {
    //   console.error('Error al actualizar usuario:', error);
    //   return;
    // }

    // Actualizar estado local
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
              onChange={(e) => setCurrentUserId(parseInt(e.value))}
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