"use client";
// Componentes/Navbar/Header.tsx
// Bug 5 (SSR): Se corrige el acceso síncrono a localStorage en el render.
//   localStorage no existe en el servidor (SSR), por eso causaba el error de hydration.
//   Solución: usar useEffect + useState para leer localStorage solo en el cliente.
//
// Bug 3 (Logout): Se reemplaza logoutUser() (Server Action) por logoutFromClient()
//   que funciona correctamente desde un Client Component.

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { Divider } from "primereact/divider";
import { NotificationDialog } from "@/app/Componentes/Perfil/NotificationDialog";
import { Notification, Page, Employee } from "@/app/Interfas/Interfaces";
import Image from "next/image";
import { logoutFromClient } from "@/app/util/authClient";

interface HeaderProps {
  setPage: (page: Page) => void;
  employeeData?: Employee | null;
}

// Foto de avatar por defecto mientras carga el perfil real
const DEFAULT_AVATAR = "/Default-avatar.webp";

export function Header({ setPage, employeeData }: HeaderProps) {
  const notificationsPanel = useRef<OverlayPanel>(null);
  const profileMenu = useRef<Menu>(null);

  // ── Bug 5 fix: leer localStorage SOLO en el cliente ──────────────────────
  // Los estados comienzan vacíos (lo que el servidor renderiza).
  // El useEffect los rellena en el cliente evitando el mismatch de hydration.
  const [usuario, setUsuario] = useState<string>("");
  const [roleName, setRoleName] = useState<string>("");
  const [userPhoto, setUserPhoto] = useState<string>(DEFAULT_AVATAR);
  const [userName, setUserName] = useState<string>("Usuario");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Leer datos del cliente después del montaje (evita SSR mismatch)
  useEffect(() => {
    setUsuario(localStorage.getItem("usuario") ?? "");
    setRoleName(localStorage.getItem("roleName") ?? "");
    // Las notificaciones reales vendrán de la API; por defecto vacío
    // TODO: reemplazar por fetch a /notifications/{employeeId}
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (employeeData) {
      setUserName(employeeData.name || localStorage.getItem("usuario") || "Usuario");
      setUserPhoto(employeeData.photo || DEFAULT_AVATAR);
    }
  }, [employeeData]);

  // ── Bug 3 fix: logout funcional desde Client Component ───────────────────
  const handleLogout = async () => {
    try {
      await logoutFromClient(); // Limpia localStorage, cookie y redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar redirect al login aunque falle el fetch
      window.location.href = "pages/Login";
    }
  };

  // ── Bug 4 fix: useCallback para estabilizar la referencia de onMarkAsRead ─
  // Sin useCallback, cada render crea una función nueva → loop en NotificationDialog
  const markAsRead = useCallback((notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, status: "leida" as const }
          : notif
      )
    );
  }, []); // Sin dependencias → función estable entre renders

  const handleNotificationClick = (notif: Notification) => {
    setSelectedNotification(notif);
    setDialogVisible(true);
    notificationsPanel.current?.hide();
  };

  const getPreviewText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const unreadCount = notifications.filter((n) => n.status === "nueva").length;

  const profileMenuItems: MenuItem[] = [
    {
      template: () => (
        <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img
                src={userPhoto}
                alt="Foto de perfil"
                className="w-full h-full object-cover object-center rounded-full"
              />
            </div>
            <div>
              <p className="font-bold text-gray-800">{employeeData?.name || userName}</p>
              <p className="text-sm text-gray-500">@{usuario || "—"} • {roleName || "—"}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Editar Perfil",
      icon: "pi pi-user-edit",
      className: "hover:bg-cyan-50",
      command: () => setPage("editar-perfil"),
    },
    {
      label: "Licencias",
      icon: "pi pi-id-card",
      className: "hover:bg-cyan-50",
      command: () => setPage("licencias"),
    },
    {
      label: "Encuesta",
      icon: "pi pi-file-edit",
      className: "hover:bg-cyan-50",
      command: () => setPage("feedback"),
    },
    { separator: true },
    {
      label: "Cerrar Sesión",
      icon: "pi pi-sign-out",
      className: "text-red-500 hover:bg-red-50",
      command: handleLogout,
    },
  ];

  const NotificationItem = ({ notif }: { notif: Notification }) => (
    <div
      className="p-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 rounded-lg mx-1 my-1"
      onClick={() => handleNotificationClick(notif)}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Avatar
            image={userPhoto}
            className="flex-shrink-0 border-2 border-cyan-300"
            shape="circle"

          />
          {notif.status === "nueva" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm mb-1 line-clamp-2 ${notif.status === "nueva"
              ? "text-gray-900 font-semibold"
              : "text-gray-700"
              }`}
          >
            {getPreviewText(notif.text)}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <i className="pi pi-clock text-xs text-cyan-500" />
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
            style={{ width: "400px" }}
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
                    / {notifications.length} total
                  </span>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">
                  No tenés notificaciones nuevas
                </p>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))
              )}
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
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-transparent text-gray-200 transition-all duration-200 hover:shadow-cyan-500/20 group"
          >
            <div >
              <Avatar
                image={userPhoto}
                shape="circle"
                size="large"
                className="w-full h-full border-2 border-cyan-400 group-hover:border-cyan-300 transition-colors"
              />
              <Badge severity="success" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">
              {userName.split(" ")[0] || usuario || "Perfil"}
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

      {/* Bug 4 fix: onMarkAsRead es estable gracias a useCallback */}
      <NotificationDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        notification={selectedNotification}
        userPhoto={userPhoto}
        userName={userName}
        onMarkAsRead={markAsRead}
      />
    </header>
  );
}