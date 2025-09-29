
"use client";
import React, { useRef, useState } from "react";
import { Bell, ChevronDown, } from "lucide-react";
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Divider } from 'primereact/divider';
import { NotificationDialog } from "@/app/Componentes/Perfil/NotificationDialog";
import {EMPLOYEES_DATA} from "@/app/api/prueba2";
import { Employee} from "@/app/Interfas/Interfaces";

        
type Page =
  | "estadisticas"
  | "recursos-humanos"
  | "ia"
  | "organigrama"
  | "Cv"
  | "editar-perfil"
  | 'feedback'
  | "licencias";




export const Header = ({ setPage }: { setPage: (page: Page) => void }) => {
  const notificationsPanel = useRef<OverlayPanel>(null);
  const profileMenu = useRef<Menu>(null);
  const [selectedNotification, setSelectedNotification] = useState<typeof currentUser.notificaciones[0] | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [notifications, setNotifications] = useState(EMPLOYEES_DATA[0].notificaciones);

  // Obtener el primer empleado de los datos
  const currentUser: Employee = { ...EMPLOYEES_DATA[0], notificaciones: notifications };
 
  const handleNotificationClick = (notif: typeof currentUser.notificaciones[0]) => {
    setSelectedNotification(notif);
    setDialogVisible(true);
    notificationsPanel.current?.hide();
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'leida' as const }
          : notif
      )
    );
  };

  // Función para truncar texto y mostrar solo el primer párrafo
  const getPreviewText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Contar solo notificaciones nuevas
  const unreadCount = notifications.filter(n => n.status === 'nueva').length;

  const profileMenuItems: MenuItem[] = [
    {
      template: () => (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="font-bold text-gray-800">{currentUser.name}</p>
          <p className="text-sm text-gray-500">{currentUser.email}</p>
        </div>
      )
    },
    {
      label: 'Editar Perfil',
      icon: 'pi pi-user-edit',
      command: () => setPage("editar-perfil")
    },
    {
      label: 'Licencias',
      icon: 'pi pi-id-card',
      command: () => setPage("licencias")
    },
    {
      label: 'Encuesta',
      icon: 'pi pi-file-edit',
      command: () => setPage('feedback')
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      className: 'text-red-500',
      command: () => console.log('Cerrar sesión')
    }
  ];

  const NotificationItem = ({ notif }: { notif: typeof currentUser.notificaciones[0] }) => (
    <div 
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
      onClick={() => handleNotificationClick(notif)}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar 
            image={currentUser.photo}
            className="flex-shrink-0" 
            size="normal" 
            shape="circle"
          />
          
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {notif.status === 'nueva' && (
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
            )}
            <p className={`text-sm mb-1 line-clamp-2 ${notif.status === 'nueva' ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
              {getPreviewText(notif.text)}
            </p>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1 ml-4">
            <i className="pi pi-clock text-xs"></i>
            {notif.time}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 md:hidden">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Botón de Notificaciones */}
        <div className="relative">
           <button
   onClick={(e) => notificationsPanel.current?.toggle(e)}
    className="relative text-gray-600 dark:text-gray-300 hover:text-[#1ABCD7] text-shadow-md focus:outline-none"
>

  <Bell size={30} />
 {unreadCount > 0 && (
              <Badge 
                value={unreadCount} 
                severity="danger"
                className="absolute -top-1 -right-1"
              />
            )}
</button>
          

          <OverlayPanel 
            ref={notificationsPanel} 
            className="w-96"
            style={{ width: '400px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge value={unreadCount} severity="info" />
                )}
                <span className="text-sm text-gray-500"> /
                  {currentUser.notificaciones.length} total
                </span>
              </div>
            </div>
            
            <Divider className="my-2" />
            
            <div className="max-h-96 overflow-y-auto">
              {currentUser.notificaciones.map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}
            </div>

            <Divider className="my-2" />
            
            <Button
              label="Ver todas las notificaciones"
              text
              className="w-full"
              severity="info"
            />
          </OverlayPanel>
        </div>

        {/* Menú de Perfil */}
        <div className="flex items-center">
          <button
              onClick={(e) => profileMenu.current?.toggle(e)}
            className="flex items-center space-x-2 focus:outline-none"
          >
             <Avatar
              image={currentUser.photo}
              shape="circle"
              size="normal"
            />
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              Usuario
            </span>
             <ChevronDown
              size={18}        
            />
          </button>

          <Menu
            model={profileMenuItems}
            popup
            ref={profileMenu}
            className="mt-2 w-56"
          />
        </div>
      </div>
      <NotificationDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        notification={selectedNotification}
        userPhoto={currentUser.photo}
        userName={currentUser.name}
        onMarkAsRead={markAsRead}
      />
    </header>
  );
};