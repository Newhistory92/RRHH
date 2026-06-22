"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, LogOut, UserCircle, FileText, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Employee, Page } from "@/app/Interfas/Interfaces";
import { logoutFromClient } from "@/app/util/authClient";

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

  useEffect(() => {
    setMounted(true);
    setUsuario(localStorage.getItem("usuario") ?? "");
    setRoleName(localStorage.getItem("roleName") ?? "");
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

  const unreadCount = 0; // Notificaciones reales: fuera de alcance de este plan.

  return (
    <header className="h-16 sticky top-0 z-20 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center" />

      <div className="flex items-center gap-3">
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
            <DropdownMenuItem onClick={() => setPage("licencias")}>
              <FileText size={16} className="mr-2" /> Licencias
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
    </header>
  );
}
