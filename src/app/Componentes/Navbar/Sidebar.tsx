
import {  BarChart2, Users, BrainCircuit, GitMerge, } from 'lucide-react';

export type Page = 'estadisticas' | 'recursos-humanos' | 'ia' | 'organigrama';

export const Sidebar = ({ activePage, setPage }: { activePage: Page; setPage: (page: Page) => void }) => {
  const navItems = [
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart2 },
    { id: 'recursos-humanos', label: 'Recursos Humanos', icon: Users },
    { id: 'ia', label: 'Inteligencia Artificial', icon: BrainCircuit },
    { id: 'organigrama', label: 'Organigrama', icon: GitMerge },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 fixed top-0 left-0 h-full pt-16 z-30 hidden md:flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <BrainCircuit size={28} className="text-blue-400" />
        <h1 className="text-2xl font-bold ml-3">Gestion RRHH</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(item.id as Page);
                }}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="ml-4 font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">&copy; 2024 Talexa Dashboard</p>
      </div>
    </aside>
  );
};
