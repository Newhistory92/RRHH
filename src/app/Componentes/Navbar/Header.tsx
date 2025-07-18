"use client"
import React, { useState, useRef,  } from 'react';
import { Bell, LogOut, Edit, Upload, FileText, ChevronDown,  } from 'lucide-react';
import { useClickOutside } from '@/app/util/useClick';
import { mockNotifications } from '@/app/api/Prueba';

type Page = 'estadisticas' | 'recursos-humanos' | 'ia' | 'organigrama' | 'Cv' | 'editar-perfil' | 'cargar-datos'| 'licencias';
export const Header = ({ setPage }: { setPage: (page: Page) => void }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  
  const handleProfileLinkClick = (page: Page) => {
      setPage(page);
      setProfileOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {/* En pantallas grandes, el logo/título puede ir aquí si el sidebar está colapsado */}
        <h1 className="text-xl font-bold text-gray-800 dark:text-white md:hidden">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Ícono de Notificaciones */}
        <div className="relative" ref={notificationsRef}>
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-gray-600 dark:text-gray-300 hover:text-blue-500 focus:outline-none">
            <Bell size={22} />
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {mockNotifications.length}
            </span>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 font-bold border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">Notificaciones</div>
              <ul>
                {mockNotifications.map(notif => (
                  <li key={notif.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <a href="#" className="block p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{notif.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
                    </a>
                  </li>
                ))}
              </ul>
              <a href="#" className="block p-4 text-center font-bold text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700">Ver todas</a>
            </div>
          )}
        </div>

        {/* Menú de Perfil */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 focus:outline-none">
            <img className="h-9 w-9 rounded-full object-cover" src="https://placehold.co/100x100/6366f1/white?text=U" alt="Foto de perfil" />
            <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">Usuario</span>
            <ChevronDown size={18} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-800 dark:text-white">Nombre Apellido</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">usuario@email.com</p>
              </div>
              <ul className="py-2">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleProfileLinkClick('editar-perfil'); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit size={16} className="mr-3" /> Editar Perfil</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleProfileLinkClick('licencias'); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit size={16} className="mr-3" />Licencias</a></li>
                {/* <li><a href="#" onClick={(e) => { e.preventDefault(); handleProfileLinkClick('cargar-datos'); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><FileText size={16} className="mr-3" /> Cargar Datos</a></li> */}
                <li className="border-t border-gray-200 dark:border-gray-700 my-1"></li>
                <li><a href="#" className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut size={16} className="mr-3" /> Cerrar Sesión</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};