"use client";
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import {  Notification } from "@/app/Interfas/Interfaces";

interface NotificationDialogProps {
  visible: boolean;
  onHide: () => void;
  notification: Notification | null;
  userPhoto?: string;
  userName?: string;
  onMarkAsRead?: (notificationId: number) => void;
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  visible,
  onHide,
  notification,
  userPhoto,
  onMarkAsRead
}) => {
  // Marcar como leída automáticamente cuando se abre el dialog
  React.useEffect(() => {
    if (visible && notification && notification.status === 'nueva' && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [visible, notification, onMarkAsRead]);

  if (!notification) return null;

  const headerContent = (
    <div className="flex items-center gap-3">
      <Avatar
        image={userPhoto}
        icon={!userPhoto ? "pi pi-bell" : undefined}
        shape="circle"
        size="large"
        className={!userPhoto ? "bg-blue-100 text-blue-600" : ""}
      />
      <div>
        <h3 className="text-lg font-bold text-gray-800 m-0">Notificación</h3>
        <p className="text-sm text-gray-500 m-0">{notification.time}</p>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={onHide}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      onHide={onHide}
      footer={footerContent}
      style={{ width: '600px' }}
      breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="py-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
          <div className="flex items-start gap-3">
            <i className="pi pi-info-circle text-blue-500 text-xl mt-1"></i>
            <p className="text-gray-800 leading-relaxed m-0">
              {notification.text}
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mt-4">
          <p className="mb-2">
            <i className="pi pi-clock mr-2"></i>
            <strong>Recibido:</strong> {notification.time}
          </p>
        </div>
      </div>
    </Dialog>
  );
};