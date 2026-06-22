"use client"
import { BarChart, User, RefreshCw } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { FeedbackTab } from '@/app/Componentes/Encuesta/FeedbackTab';
import { UserData, FeedbackResponse } from '@/app/Componentes/Encuesta/FeedbackTab';

// ── Constantes ────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// ── Helper: obtener token JWT de la cookie o sessionStorage ──────────────────
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // El middleware de Next.js guarda el token en una cookie llamada "token"
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

// ── Adaptar respuesta del backend al formato que espera FeedbackTab ──────────
function adaptPeerToUserData(peer: {
  id: number;
  name: string;
  department: string;
  softSkills: { skillId: number; nombre: string; description: string; evaluated: boolean }[];
}): UserData {
  return {
    id:         peer.id,
    name:       peer.name,
    department: peer.department ?? '',
    softSkills: peer.softSkills.map((sk) => ({
      nombre:      sk.nombre,
      descripcion: sk.description ?? '',
    })),
    feedback_history: peer.softSkills
      .filter((sk) => sk.evaluated)
      .map((sk) => ({ evaluado: peer.name, softSkills: { nombre: sk.nombre, descripcion: sk.description ?? '' } })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [employeeId, setEmployeeId]   = useState<number | null>(null);
  const [allUsers, setAllUsers]       = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  // ── Obtener el employeeId del usuario logueado desde /auth/me ──────────────
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('No hay sesión activa. Iniciá sesión primero.');
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.employeeId) {
          setEmployeeId(data.employeeId);
        } else {
          setError('Tu usuario no tiene un empleado asociado.');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('No se pudo obtener la sesión. Recargá la página.');
        setLoading(false);
      });
  }, []);

  // ── Cargar compañeros evaluables al conocer el employeeId ─────────────────
  const loadPeers = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);

    const token = getAuthToken();
    try {
      const res = await fetch(`${BACKEND_URL}/feedback/peers/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const peers: UserData[] = (data.peers ?? []).map(adaptPeerToUserData);

      // El "usuario actual" para FeedbackTab es el empleado logueado como evaluador
      const selfUser: UserData = {
        id:               employeeId,
        name:             'Yo',
        department:       data.department ?? '',
        softSkills:       [],
        feedback_history: [],
      };

      setCurrentUser(selfUser);
      setAllUsers([selfUser, ...peers]);
    } catch (e) {
      setError('No se pudo cargar los compañeros del área. Intentá nuevamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadPeers();
  }, [loadPeers]);

  // ── Guardar feedback: POST /feedback/submit ──────────────────────────────
  const handleSaveFeedback = async (response: FeedbackResponse) => {
    const token = getAuthToken();

    // Buscar el skillId real del compañero
    const evaluatedUser = allUsers.find((u) => u.name === response.evaluado);
    const skillMatch    = evaluatedUser?.softSkills.find(
      (sk) => sk.nombre === response.softSkills.nombre
    );

    if (!evaluatedUser || !skillMatch) {
      toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'No se encontró la habilidad evaluada', life: 3000 });
      return;
    }

    // Convertir [0,0,1] → "Excelente"
    const resultMap = ['Malo', 'Bueno', 'Excelente'];
    const resultIndex = response.respuesta.findIndex((v) => v === 1);
    const resultStr   = resultMap[resultIndex] ?? 'Malo';

    try {
      const res = await fetch(`${BACKEND_URL}/feedback/submit`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          evaluatorId:  employeeId,
          evaluatedId:  evaluatedUser.id,
          softSkillId:  (skillMatch as { skillId?: number; nombre: string }).skillId,
          result:       resultStr,
        }),
      });

      if (res.status === 409) {
        toast.current?.show({ severity: 'warn', summary: 'Ya evaluado', detail: 'Ya evaluaste esta habilidad en el ciclo actual', life: 4000 });
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      toast.current?.show({ severity: 'success', summary: 'Enviado', detail: `Feedback "${resultStr}" registrado correctamente`, life: 3000 });

      // Marcar la skill como evaluada localmente para actualizar el progreso
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id !== evaluatedUser.id) return u;
          return {
            ...u,
            feedback_history: [
              ...(u.feedback_history ?? []),
              { evaluado: u.name, softSkills: response.softSkills },
            ],
          };
        })
      );
    } catch (e) {
      console.error(e);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el feedback', life: 4000 });
    }
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 text-indigo-400 animate-spin" size={48} />
          <p className="text-gray-600 text-lg">Cargando compañeros del área...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <User className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-600 font-semibold text-lg mb-4">{error ?? 'Usuario no encontrado'}</p>
          <button
            onClick={loadPeers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Feedback 360°</h1>
          <p className="text-lg text-gray-600">
            Evaluá las habilidades blandas de tus compañeros del mismo departamento de forma anónima.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <FeedbackTab
              currentUser={currentUser}
              usersData={allUsers}
              onSaveFeedback={handleSaveFeedback}
              onUpdateUser={handleUpdateUser}
            />
          </div>

          <div className="space-y-6">
            <Card title={
              <div className="flex items-center">
                <BarChart className="mr-2 text-indigo-500" />
                <span>Tu progreso</span>
              </div>
            }>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Compañeros evaluables:{' '}
                  <span className="font-semibold text-indigo-600">{allUsers.length - 1}</span>
                </div>
                <div className="text-sm text-gray-500 italic">
                  Las evaluaciones son anónimas. Solo el sistema registra los conteos generales.
                </div>
                <button
                  onClick={loadPeers}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  <RefreshCw size={14} />
                  Recargar compañeros
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}