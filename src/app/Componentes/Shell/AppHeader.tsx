"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, LogOut, UserCircle, FileText, MessageSquare, Folder, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Employee, Notification, Page } from "@/app/Interfas/Interfaces";
import { logoutFromClient } from "@/app/util/authClient";
import { apiClient } from "@/app/util/apiClient";
import { NotificationDialog } from "@/app/Componentes/Perfil/NotificationDialog";
import { formatearFechaHora } from "@/app/lib/dates";

const DEFAULT_AVATAR = "/Default-avatar.webp";

interface AppHeaderProps {
  setPage: (page: Page) => void;
  employeeData?: Employee | null;
}

export function AppHeader({ setPage, employeeData }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [roleName, setRoleName] = useState("");
  const [userPhoto, setUserPhoto] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState("Usuario");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifAbierta, setNotifAbierta] = useState<Notification | null>(null);

  useEffect(() => {
    setMounted(true);
    setUsuario(localStorage.getItem("usuario") ?? "");
    setRoleName(localStorage.getItem("roleName") ?? "");

    const empId = Number(localStorage.getItem("employeeId"));
    if (empId) {
      apiClient
        .get<{ notifications: Notification[] }>(`/licenses/notificaciones?employee_id=${empId}`)
        .then(res => setNotifications(res.notifications || []))
        .catch(err => console.error("Error al cargar notificaciones:", err));
    }
  }, []);

  useEffect(() => {
    if (employeeData) {
      setUserName(employeeData.name || localStorage.getItem("usuario") || "Usuario");
      setUserPhoto(employeeData.photo || DEFAULT_AVATAR);
    }
  }, [employeeData]);

  const handleMarkAsRead = useCallback((notificationId: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, status: "leida" } : n))
    );
    apiClient
      .patch(`/licenses/notificaciones/${notificationId}/leer`)
      .catch(err => {
        console.error("Error al marcar notificación como leída:", err);
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, status: "nueva" } : n))
        );
      });
  }, []);

  const handleLogout = async () => {
    try {
      await logoutFromClient();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "pages/Login";
    }
  };

  const unreadCount = notifications.filter(n => n.status === "nueva").length;

  return (
    // Navbar de punta a punta, fixed sobre todo el ancho. El material glass
    // tiene 4 capas, no solo blur+transparencia (eso sobre un fondo de pagina
    // liso lee como un blanco sucio, no como vidrio):
    //   1. bg-glass: base tenida con --primary, no blanco/negro puro.
    //   2. backdrop-blur-xl + saturate(180%): satura lo que SI pasa por abajo
    //      (tarjetas, badges) antes de desenfocarlo, para que se note.
    //   3. glass-highlight: filo de luz interior arriba, el borde que
    //      "atrapa" la luz en un vidrio real.
    //   4. glass-shadow: sombra de elevacion, separa la barra del contenido.
    <header
      className="fixed inset-x-0 top-0 z-40 h-16 border-b border-glass-border bg-glass backdrop-blur-xl backdrop-saturate-[180%]"
      style={{
        boxShadow: `inset 0 1px 0 var(--glass-highlight), var(--glass-shadow)`,
      }}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
      <span className="font-heading text-xl font-semibold text-foreground truncate">
        Talexa
      </span>

      <div className="flex items-center gap-3">
        {/* Campanita con notificaciones reales */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 rounded-md hover:bg-surface-muted text-foreground transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-semibold text-sm text-foreground">Notificaciones</p>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} sin leer</p>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No tenés notificaciones nuevas
              </div>
            ) : (
              notifications.slice(0, 8).map(notif => (
                // El DropdownMenuItem por defecto pinta el fondo de oliva
                // (--accent) al pasar el mouse. Sus <span> de adentro
                // fuerzan text-foreground/muted-foreground sin importar el
                // estado del padre -- asi que el fondo cambiaba a oliva
                // pero el texto se quedaba blanco, ilegible. Se apaga el
                // hover coloreado y se deja uno neutro.
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => setNotifAbierta(notif)}
                  className="flex flex-col items-start gap-0.5 px-3 py-2.5 focus:bg-muted focus:text-inherit"
                >
                  <span className={`text-sm leading-snug ${notif.status === "nueva" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {notif.text.length > 90 ? notif.text.slice(0, 90) + "…" : notif.text}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatearFechaHora(notif.time)}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-surface-muted text-foreground transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-foreground">
                {userName.split(" ")[0] || usuario || "Perfil"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="font-semibold text-sm">{employeeData?.name || userName}</p>
              <p className="text-xs text-muted-foreground">
                @{usuario || "—"} • {roleName || "—"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPage("editar-perfil")}>
              <UserCircle size={16} className="mr-2" /> Editar Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("asistencia")}>
              <Clock size={16} className="mr-2" /> Mi Asistencia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("licencias")}>
              <FileText size={16} className="mr-2" /> Licencias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("documentos")}>
              <Folder size={16} className="mr-2" /> Documentos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage("feedback")}>
              <MessageSquare size={16} className="mr-2" /> Encuesta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-error">
              <LogOut size={16} className="mr-2" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
      <NotificationDialog
        visible={notifAbierta !== null}
        onHide={() => setNotifAbierta(null)}
        notification={notifAbierta}
        userPhoto={userPhoto}
        onMarkAsRead={handleMarkAsRead}
      />
    </header>
  );
}
