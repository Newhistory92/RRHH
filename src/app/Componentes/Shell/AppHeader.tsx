"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, LogOut, UserCircle, FileText, MessageSquare, Folder, Clock, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

const DEFAULT_AVATAR = "/Default-avatar.webp";

interface AppHeaderProps {
  setPage: (page: Page) => void;
  employeeData?: Employee | null;
  /** Solo se dibuja el control de colapso si hay sidebar que colapsar. */
  hasSidebar?: boolean;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({
  setPage,
  employeeData,
  hasSidebar = false,
  isCollapsed = false,
  onToggleSidebar,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [roleName, setRoleName] = useState("");
  const [userPhoto, setUserPhoto] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState("Usuario");
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
    // Navbar de punta a punta: va fixed sobre TODO el ancho, con el sidebar
    // arrancando por debajo. El fallback de background cubre a los navegadores
    // sin backdrop-filter, donde si no quedaria semitransparente sin blur.
    <header
      className="fixed inset-x-0 top-0 z-40 h-16 border-b border-glass-border bg-background/95 supports-[backdrop-filter]:bg-glass supports-[backdrop-filter]:backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        {hasSidebar && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
        <span className="font-heading text-xl font-semibold text-foreground truncate">
          Talexa
        </span>
      </div>

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
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-default">
                  <span className={`text-sm leading-snug ${notif.status === "nueva" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {notif.text.length > 90 ? notif.text.slice(0, 90) + "…" : notif.text}
                  </span>
                  <span className="text-xs text-muted-foreground">{notif.time}</span>
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
    </header>
  );
}
