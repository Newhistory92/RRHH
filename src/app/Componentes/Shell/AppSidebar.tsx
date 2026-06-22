"use client";

import {
  BarChart2,
  Users,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Page } from "@/app/Interfas/Interfaces";
import { getSidebarSections, ROLE_ID } from "@/app/util/rbac";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart2,
  Users,
  Settings,
  BrainCircuit,
  GitMerge,
  ClipboardList,
  Shield,
  UserCircle,
  FileText,
  MessageSquare,
};

interface AppSidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  roleId: number | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  activePage,
  setPage,
  roleId,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  if (!roleId || roleId === ROLE_ID.USER) return null;

  const sections = getSidebarSections(roleId);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={`bg-muted border-r border-border fixed top-0 left-0 h-full z-30 hidden md:flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <span className="font-heading text-xl font-semibold text-foreground">Talexa</span>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="absolute top-20 -right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:opacity-90 transition-opacity z-50"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden space-y-4">
          {sections.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && <Separator className="mb-3" />}
              {!isCollapsed && (
                <p className="px-3 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.pages.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] ?? Shield;
                  const isActive = activePage === item.id;
                  const link = (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item.id);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-warm-contrast text-warm-contrast-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <IconComponent size={18} className="flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                    </a>
                  );

                  return (
                    <li key={item.id}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
