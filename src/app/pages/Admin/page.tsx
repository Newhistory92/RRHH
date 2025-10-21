"use client"
import { ProfileSettings, RoleEditModal, RolesGrid, UserEditModal, UsersTable } from '@/app/util/UiRRHH';
import { useState, useMemo, useEffect } from 'react';
import { UserRoundSearch } from "lucide-react";
import { InputText } from 'primereact/inputtext';
import {Usuario,Role} from '@/app/Interfas/Interfaces';



interface ApiUser {
    id: number;
    usuario: string;
    email: string;
    roleId: number;
    role_name: string;
    employee_name: string | null;
    dni: string | null;
    gender: string | null;
    photo: string | null;
}

interface ApiResponse {
    users: ApiUser[];
}

// --- Datos Iniciales ---
const initialRoles: Role[] = [
    { id: 1, name: 'Administrador', description: 'Acceso total al sistema. Puede gestionar usuarios, roles y configuraciones globales.', color: 'cyan' },
    { id: 2, name: 'Editor', description: 'Puede crear, editar y eliminar contenido, pero no puede gestionar usuarios.', color: 'teal' },
    { id: 3, name: 'Visitante', description: 'Acceso de solo lectura al contenido público de la aplicación.', color: 'gray' },
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<string>('active-users');
    const [users, setUsers] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    console.log(users);
    // Estados para los modales
    const [isUserModalOpen, setUserModalOpen] = useState<boolean>(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // --- Función para obtener usuarios de la API ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/users/');
            const data: ApiResponse = await response.json();
            console.log('Datos de usuarios recibidos de la API:', data);
            // Mapear los datos de la API al formato de la aplicación
            const mappedUsers: Usuario[] = data.users.map((apiUser) => ({
                id: apiUser.id,
                name: apiUser.employee_name || 'No especificado',
                usuario: apiUser.usuario,
                dni: apiUser.dni || 'N/A',
                gender: apiUser.gender || 'No especificado',
                email: apiUser.email,
                role: apiUser.role_name,
                status: 'active' as const,
                avatar: apiUser.photo || `https://i.pravatar.cc/150?u=${apiUser.email}`,
            }));
            
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            // En caso de error, mantener el estado actual
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    // Memoizar usuarios filtrados para optimizar el rendimiento
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    const activeUsers = filteredUsers.filter(user => user.status === 'active');
    const inactiveUsers = filteredUsers.filter(user => user.status === 'inactive');

    // --- Manejadores de Eventos ---
  const handleToggleUserStatus = (userId: number) => {
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === userId) {
                const isNowInactive = user.status === 'active';
                return {
                    ...user,
                    status: isNowInactive ? 'inactive' as const : 'active' as const,
                    lastActionDate: isNowInactive ? new Date().toISOString().split('T')[0] : undefined,
                };
            }
            return user;
        }));
    };

    // --- Funciones para Modales ---
    const openUserModal = (user: Usuario) => {
        setEditingUser(user);
        setUserModalOpen(true);
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setEditingUser(null);
    };

    const handleUserUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const editUserName = form.elements.namedItem('editUserName') as HTMLInputElement;
        const editUserDni = form.elements.namedItem('editUserDni') as HTMLInputElement;
        const editUserGender = form.elements.namedItem('editUserGender') as HTMLInputElement;
        const editUserRole = form.elements.namedItem('editUserRole') as HTMLInputElement;
        
        if (editingUser) {
            const updatedUserData: Partial<Usuario> = {
                name: editUserName.value,
                dni: editUserDni.value,
                gender: editUserGender.value,
                role: editUserRole.value,
            };
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUserData } as Usuario : u));
            closeUserModal();
        }
    };

    const openRoleModal = (role: Role | null) => {
        setEditingRole(role || { id: 0, name: '', description: '', color: 'purple' });
        setRoleModalOpen(true);
    };
    
    const closeRoleModal = () => {
        setRoleModalOpen(false);
        setEditingRole(null);
    };

    const handleRoleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const editRoleName = form.elements.namedItem('editRoleName') as HTMLInputElement;
        const editRoleDescription = form.elements.namedItem('editRoleDescription') as HTMLTextAreaElement;
        const editRoleId = form.elements.namedItem('editRoleId') as HTMLInputElement;
        
        const roleId = editRoleId.value;
        const updatedRoleData: Omit<Role, 'id' | 'color'> = { 
            name: editRoleName.value, 
            description: editRoleDescription.value 
        };

        if (roleId && parseInt(roleId)) {
            setRoles(roles.map(r => r.id === parseInt(roleId) ? { ...r, ...updatedRoleData } : r));
        } else {
            const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
            setRoles([...roles, { ...updatedRoleData, id: newId, color: 'purple' }]);
        }
        closeRoleModal();
    };

    const TabButton = ({ id, title }: { id: string; title: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'border-[#2ecbe7] text-[#2ecbe7] bg-cyan-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
            {title}
        </button>
    );

    return (
        <div className="bg-gray-900 text-gray-200 antialiased min-h-screen">
            <style jsx global>{`
                body { font-family: 'Inter', sans-serif; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #1f2937; }
                ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Administración</h1>
                    <p className="text-gray-400 mt-1">Gestiona usuarios, roles y perfiles de la aplicación.</p>
                </header>

                <main className="bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                           <TabButton id="active-users" title="Usuarios Activos" />
                           <TabButton id="inactive-users" title="Usuarios Inactivos" />
                           <TabButton id="roles" title="Configuración de Roles" />
                           <TabButton id="profiles" title="Perfiles de Usuario" />
                        </nav>
                    </div>
                    
                    <div className="mt-6">
                        {activeTab === 'active-users' && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                    <h2 className="text-xl font-semibold text-white">Listado de Usuarios Activos</h2>
                                    <div className="relative w-full sm:w-auto">
                                        <span className="p-input-icon-left w-full">
                                            <UserRoundSearch className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400" size={20} />
                                            <InputText 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre o depto..."
                                                className="w-full pl-10 bg-gray-700 border-gray-600 text-gray-200"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </span>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">Cargando usuarios...</div>
                                ) : (
                                    <UsersTable users={activeUsers} onEdit={openUserModal} onToggleStatus={handleToggleUserStatus} />
                                )}
                            </div>
                        )}
                        {activeTab === 'inactive-users' && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Listado de Usuarios Inactivos</h2>
                                <UsersTable users={inactiveUsers} onToggleStatus={handleToggleUserStatus} />
                            </div>
                        )}
                        {activeTab === 'roles' && <RolesGrid roles={roles} onEdit={openRoleModal} />}
                        {activeTab === 'profiles' && <ProfileSettings />}
                    </div>
                </main>
            </div>
            
            {isUserModalOpen && editingUser && <UserEditModal user={editingUser} roles={roles} onClose={closeUserModal} onSave={handleUserUpdate} />}
            {isRoleModalOpen && editingRole && <RoleEditModal role={editingRole} onClose={closeRoleModal} onSave={handleRoleUpdate} />}
        </div>
    );
}