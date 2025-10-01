import { useState } from 'react';
import { BarChart2, Users, BrainCircuit, GitMerge, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page} from "@/app/Interfas/Interfaces";
import Image from 'next/image';
interface SidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const Sidebar = ({ activePage, setPage, onCollapseChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const navItems = [
    { id: 'estadisticas' as Page, label: 'Estadísticas', icon: BarChart2 },
    { id: 'recursos-humanos' as Page, label: 'Recursos Humanos', icon: Users },
    { id: 'ia' as Page, label: 'Inteligencia Artificial', icon: BrainCircuit },
    { id: 'organigrama' as Page, label: 'Organigrama', icon: GitMerge },
    { id: 'test' as Page, label: 'Test', icon: ClipboardList },
  ];

  return (
    <aside 
      className={`bg-gray-900 text-white fixed top-0 left-0 h-full pt-16 z-30 hidden md:flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header con logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center'} h-16 border-b border-gray-700/50 relative`}>
        {!isCollapsed && (
          <>
            <BrainCircuit size={28} className="text-cyan-400" />
            <h1 className="text-2xl font-bold ml-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Gestion RRHH
            </h1>
          </>
        )}
        {isCollapsed && (
          <BrainCircuit size={32} className="text-cyan-400" />
        )}
      </div>

      {/* Botón de colapsar/expandir */}
      <button
        onClick={handleToggleCollapse}
        className="absolute top-20 -right-3 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-1.5 shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(item.id);
                }}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  activePage === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon 
                  size={22} 
                  className={`${activePage === item.id ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'} transition-colors duration-200 flex-shrink-0`}
                />
                {!isCollapsed && (
                  <span className="ml-4 font-medium text-sm truncate">{item.label}</span>
                )}
                
                {/* Tooltip cuando está colapsado */}
                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-gray-700 z-50">
                    {item.label}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-700/50 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400">Talexa Dashboard</p>
            <p className="text-xs text-gray-500">&copy; 2025 Todos los derechos reservados</p>
          </div>
        ) : (
           <Image
                    src="/LogoAlone.webp"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="mr-2"
                  />
        )}
      </div>
    </aside>
  );
};