
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
import { Employee,Notification,Page} from "@/app/Interfas/Interfaces";
import Image from "next/image";
  

export const Header = ({ setPage }: { setPage: (page: Page) => void }) => {
  const notificationsPanel = useRef<OverlayPanel>(null);
  const profileMenu = useRef<Menu>(null);
  const [selectedNotification, setSelectedNotification] = useState<typeof currentUser.notificaciones[0] | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
   const [notifications, setNotifications] = useState<Notification[]>(EMPLOYEES_DATA[0].notificaciones ?? [] );

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

  const getPreviewText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const unreadCount = notifications.filter(n => n.status === 'nueva').length;

  const profileMenuItems: MenuItem[] = [
    {
      template: () => (
        <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-gray-800">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Editar Perfil',
      icon: 'pi pi-user-edit',
      className: 'hover:bg-cyan-50',
      command: () => setPage("editar-perfil")
    },
    {
      label: 'Licencias',
      icon: 'pi pi-id-card',
      className: 'hover:bg-cyan-50',
      command: () => setPage("licencias")
    },
    {
      label: 'Encuesta',
      icon: 'pi pi-file-edit',
      className: 'hover:bg-cyan-50',
      command: () => setPage('feedback')
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      className: 'text-red-500 hover:bg-red-50',
      command: () => console.log('Cerrar sesión')
    }
  ];

  const NotificationItem = ({ notif }: { notif: typeof currentUser.notificaciones[0] }) => (
    <div 
      className="p-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 rounded-lg mx-1 my-1"
      onClick={() => handleNotificationClick(notif)}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Avatar 
            image={currentUser.photo}
            className="flex-shrink-0 border-2 border-cyan-300" 
            size="normal" 
            shape="circle"
          />
          {notif.status === 'nueva' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm mb-1 line-clamp-2 ${notif.status === 'nueva' ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
            {getPreviewText(notif.text)}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <i className="pi pi-clock text-xs text-cyan-500"></i>
            {notif.time}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 border-b border-gray-700/50">
      <div className="flex items-center">
        <Image
          src="/Logo.webp"
          alt="Logo"
          width={120}
          height={120}
          className="mr-2"
        />
        
      </div>

      <div className="flex items-center gap-4">
        {/* Botón de Notificaciones */}
        <div className="relative">
          <button
            onClick={(e) => notificationsPanel.current?.toggle(e)}
            className="relative p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-cyan-400 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 group"
          >
            <Bell size={20} className="transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-pulse min-w-[20px]">
                {unreadCount}
              </span>
            )}
          </button>

          <OverlayPanel 
            ref={notificationsPanel} 
            className="w-96 shadow-2xl border-0"
            style={{ width: '400px' }}
          >
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 -m-4 p-4 rounded-t-lg mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Notificaciones
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Badge 
                      value={unreadCount} 
                      severity="info"
                      className="bg-gradient-to-br from-cyan-500 to-blue-600"
                    />
                  )}
                  <span className="text-sm text-gray-600 font-medium">
                    / {currentUser.notificaciones.length} total
                  </span>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto pr-1">
              {currentUser.notificaciones.map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}
            </div>

            <Divider className="my-2" />
            
            <Button
              label="Ver todas las notificaciones"
              text
              className="w-full text-cyan-600 hover:bg-cyan-50 font-semibold"
            />
          </OverlayPanel>
        </div>

        {/* Menú de Perfil */}
        <div className="flex items-center">
          <button
            onClick={(e) => profileMenu.current?.toggle(e)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-transparent text-gray-800 dark:text-gray-200 transition-all duration-200  hover:shadow-cyan-500/20 group"
          >
            <div className="w-9 h-9 flex-shrink-0 relative">
              <Avatar
                image={currentUser.photo}
                shape="circle"
                size="normal"
                className="w-full h-full border-2 border-cyan-400 group-hover:border-cyan-300 transition-colors"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></span>
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-cyan-400 transition-colors"
            />
          </button>

          <Menu
            model={profileMenuItems}
            popup
            ref={profileMenu}
            className="mt-2 w-64 shadow-2xl border-0 rounded-xl overflow-hidden"
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